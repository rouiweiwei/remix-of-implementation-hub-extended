// Auto-draft email generator — pure client-side. No backend.
// Pulls live data from the Zustand playbook store and assembles
// subject + HTML + plain-text + recipient list for each email type.

import type {
  ClientInfo,
  Issue,
  Stakeholder,
  Champion,
  DodItem,
  IntranetResource,
  Session,
  TimelineMode,
  TaskScheduleOverride,
} from "./playbook-store";
import { computeSchedule, usePlaybook } from "./playbook-store";
import type { Task } from "./playbook-data";
import { CONTENT_TOPICS, type SessionDef } from "./registers-data";

export interface DraftedEmail {
  subject: string;
  html: string;
  plainText: string;
  recipients: string[]; // email addresses
  ccDescription: string; // human label e.g. "HODs, Site Leads"
}

export interface BuildContext {
  client: ClientInfo;
  tasks: Task[];
  taskOverrides: Record<string, TaskScheduleOverride>;
  timelineMode: TimelineMode;
  startDate: string;
  issues: Issue[];
  stakeholders: Stakeholder[];
  champions: Champion[];
  dod: DodItem[];
  intranet: IntranetResource[];
  sessions: Session[]; // user-added sessions in the register
}

// ─── HTML shell ──────────────────────────────────────────────────────
const BRAND_PRIMARY = "#6366f1";
const BRAND_DARK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const SOFT_BG = "#f8fafc";

function shell(opts: { preheader: string; title: string; bodyHtml: string; client: ClientInfo }): string {
  const { preheader, title, bodyHtml, client } = opts;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${SOFT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND_DARK};">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT_BG};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,${BRAND_PRIMARY},#8b5cf6);padding:22px 28px;color:#ffffff;">
          <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.85;">Plexa Implementation</div>
          <div style="font-size:22px;font-weight:700;margin-top:4px;">${escapeHtml(title)}</div>
          <div style="font-size:13px;opacity:.9;margin-top:4px;">${escapeHtml(client.clientName)}</div>
        </td></tr>
        <tr><td style="padding:24px 28px;font-size:14px;line-height:1.55;color:${BRAND_DARK};">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 28px 22px;border-top:1px solid ${BORDER};background:${SOFT_BG};font-size:12px;color:${MUTED};">
          <div><strong style="color:${BRAND_DARK};">Plexa Customer Success</strong></div>
          <div>Account Manager · ${escapeHtml(client.accountManager || "—")}</div>
          <div>Plexa Lead · ${escapeHtml(client.plexaLead || "—")}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function section(title: string, inner: string): string {
  return `<div style="margin:18px 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${MUTED};font-weight:700;">${escapeHtml(title)}</div>${inner}`;
}
function bulletList(items: string[]): string {
  if (!items.length) return `<div style="color:${MUTED};font-style:italic;font-size:13px;">— none —</div>`;
  return `<ul style="margin:6px 0 0;padding-left:20px;">${items.map((i) => `<li style="margin:4px 0;">${i}</li>`).join("")}</ul>`;
}
function callout(text: string, tone: "info" | "warn" = "info"): string {
  const bg = tone === "warn" ? "#fef3c7" : "#eef2ff";
  const border = tone === "warn" ? "#f59e0b" : BRAND_PRIMARY;
  return `<div style="background:${bg};border-left:3px solid ${border};padding:10px 12px;border-radius:6px;margin:10px 0;font-size:13px;">${text}</div>`;
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Recipients ──────────────────────────────────────────────────────
function recipientsFor(ctx: BuildContext, audience: "all" | "leadership" | "hods" | "site" | "champions"): string[] {
  const all = ctx.stakeholders.filter((s) => s.email).map((s) => s.email);
  if (audience === "all") return uniq(all);
  if (audience === "leadership") {
    return uniq(
      ctx.stakeholders
        .filter((s) => /ceo|cfo|coo|director|owner|head|exec/i.test(s.role) && s.email)
        .map((s) => s.email)
    );
  }
  if (audience === "hods") {
    return uniq(ctx.stakeholders.filter((s) => /hod|head of/i.test(s.role) && s.email).map((s) => s.email));
  }
  if (audience === "site") {
    return uniq(ctx.stakeholders.filter((s) => /site|foreman|super|pm|project/i.test(s.role) && s.email).map((s) => s.email));
  }
  if (audience === "champions") {
    return uniq(ctx.champions.filter((c) => /@/.test((c as { email?: string }).email || "")).map((c) => (c as { email?: string }).email!));
  }
  return all;
}
function uniq(xs: string[]): string[] { return Array.from(new Set(xs.filter(Boolean))); }

// ─── Plain-text from HTML (rudimentary) ──────────────────────────────
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<li[^>]*>/gi, " • ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Date helpers ────────────────────────────────────────────────────
const DAY_MS = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY_MS);
const fmtDate = (s: string) => {
  if (!s) return "TBC";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

function taskLabel(t: Task): string {
  const state = usePlaybook.getState();
  const phase = state.phases.find((p) => p.id === t.phase);
  return `<strong style="font-family:ui-monospace,monospace;font-size:12px;color:${BRAND_PRIMARY};">${escapeHtml(t.id)}</strong> ${escapeHtml(t.title)}${phase ? ` <span style="color:${MUTED};font-size:11px;">(${escapeHtml(phase.short)})</span>` : ""}${t.owner ? ` <span style="color:${MUTED};font-size:11px;">· ${escapeHtml(t.owner)}</span>` : ""}`;
}

// ─── KICKOFF ─────────────────────────────────────────────────────────
export function buildKickoffEmail(ctx: BuildContext): DraftedEmail {
  const phase1 = ctx.tasks.filter((t) => t.phase === "1A" || t.phase === "1B" || t.phase === "1C");
  const body = `
    <p>Hi team,</p>
    <p>We're officially kicking off the <strong>${escapeHtml(ctx.client.clientName)}</strong> Plexa implementation.
    The intent of this email is to align everyone on the timeline, the leads, and what's happening over the next few weeks.</p>
    ${section("Project Snapshot", `
      <table cellpadding="6" style="font-size:13px;border-collapse:collapse;">
        <tr><td style="color:${MUTED};">Client lead</td><td><strong>${escapeHtml(ctx.client.clientLead)}</strong></td></tr>
        <tr><td style="color:${MUTED};">Plexa lead</td><td><strong>${escapeHtml(ctx.client.plexaLead)}</strong></td></tr>
        <tr><td style="color:${MUTED};">Account manager</td><td><strong>${escapeHtml(ctx.client.accountManager)}</strong></td></tr>
        <tr><td style="color:${MUTED};">Timeline mode</td><td><strong>${escapeHtml(ctx.timelineMode)}</strong></td></tr>
        <tr><td style="color:${MUTED};">Start date</td><td><strong>${fmtDate(ctx.startDate)}</strong></td></tr>
        <tr><td style="color:${MUTED};">Target go-live</td><td><strong>${fmtDate(ctx.client.goLiveDate)}</strong></td></tr>
      </table>
    `)}
    ${section("Phase 1 — what we'll cover first", bulletList(phase1.slice(0, 10).map(taskLabel)))}
    ${callout(`<strong>Action:</strong> please confirm attendance for the upcoming workshops and reply with any conflicts before our first session.`)}
    <p style="margin-top:18px;">Looking forward to delivering this with you.</p>
  `;
  const html = shell({
    preheader: `Plexa implementation kickoff for ${ctx.client.clientName}`,
    title: "Implementation Kickoff",
    bodyHtml: body,
    client: ctx.client,
  });
  return {
    subject: `Plexa Implementation Kickoff — ${ctx.client.clientName}`,
    html,
    plainText: htmlToText(body),
    recipients: recipientsFor(ctx, "all"),
    ccDescription: "All stakeholders",
  };
}

// ─── WEEKLY STATUS ──────────────────────────────────────────────────
export interface WeeklyOptions {
  weekEndingDate: string; // YYYY-MM-DD — anchor for "this week" / "next week"
  weekNumber: number;
}

export function buildWeeklyEmail(ctx: BuildContext, opts: WeeklyOptions): DraftedEmail {
  const anchor = opts.weekEndingDate ? new Date(opts.weekEndingDate) : new Date();
  const weekStart = addDays(anchor, -7);
  const nextWeekEnd = addDays(anchor, 7);

  // Completed in last 7 days
  const completed = ctx.tasks.filter((t) => {
    if (t.status !== "COMPLETE" || !t.completedAt) return false;
    const c = new Date(t.completedAt);
    return c >= weekStart && c <= anchor;
  });

  const inProgress = ctx.tasks.filter((t) => t.status === "IN PROGRESS");

  // Coming next week — use computed schedule
  const schedule = computeSchedule(ctx.tasks, ctx.startDate, ctx.timelineMode, ctx.taskOverrides);
  const comingNext = schedule
    .filter((s) => {
      const start = new Date(s.start);
      return start > anchor && start <= nextWeekEnd && s.task.status !== "COMPLETE";
    })
    .map((s) => s.task);

  const blockedTasks = ctx.tasks.filter((t) => t.status === "BLOCKED");
  const openQueries = ctx.issues.filter((i) => i.status !== "Closed");

  const status: "Green" | "Amber" | "Red" =
    blockedTasks.length > 0 || openQueries.filter((q) => q.priority === "CRITICAL" || q.priority === "HIGH").length > 0
      ? "Red"
      : openQueries.length > 0
      ? "Amber"
      : "Green";

  const statusColor = status === "Green" ? "#10b981" : status === "Amber" ? "#f59e0b" : "#ef4444";

  const body = `
    <p>Hi team,</p>
    <p>Here's the Week ${opts.weekNumber} update for <strong>${escapeHtml(ctx.client.clientName)}</strong> (week ending ${fmtDate(opts.weekEndingDate || isoDay(anchor))}).</p>
    <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:${statusColor};color:#fff;font-weight:700;font-size:12px;letter-spacing:.08em;">STATUS · ${status.toUpperCase()}</div>

    ${section("✅ Completed this week", bulletList(completed.map(taskLabel)))}
    ${section("🚧 In progress now", bulletList(inProgress.map((t) => `${taskLabel(t)}${t.notes ? `<div style="color:${MUTED};font-size:12px;margin-top:2px;">${escapeHtml(t.notes)}</div>` : ""}`)))}
    ${section("📅 Coming next week", bulletList(comingNext.map(taskLabel)))}
    ${section("⚠️ Blockers & open queries", bulletList([
      ...blockedTasks.map((t) => `<span style="color:#ef4444;font-weight:600;">[BLOCKED]</span> ${taskLabel(t)}`),
      ...openQueries.map((q) => `<strong style="font-family:ui-monospace,monospace;font-size:12px;color:${BRAND_PRIMARY};">${escapeHtml(q.ref || "—")}</strong> ${escapeHtml(q.description)} <span style="color:${MUTED};font-size:11px;">· ${escapeHtml(q.priority)} · owner ${escapeHtml(q.assignedTo || q.owner)}</span>`),
    ]))}
    <p style="margin-top:20px;color:${MUTED};font-size:12px;">Reply to this email with any questions or to flag anything that needs urgent attention.</p>
  `;
  const html = shell({
    preheader: `Week ${opts.weekNumber} — ${completed.length} done, ${inProgress.length} in progress, ${comingNext.length} coming up`,
    title: `Week ${opts.weekNumber} Status Update`,
    bodyHtml: body,
    client: ctx.client,
  });
  return {
    subject: `Weekly Implementation Update — ${ctx.client.clientName} | Week ${opts.weekNumber} (${status})`,
    html,
    plainText: htmlToText(body),
    recipients: recipientsFor(ctx, "leadership"),
    ccDescription: "CEO, CFO, IT Lead, Site Teams, Ops",
  };
}

// Also expose the raw section text for the editable Email Log rows
export function buildWeeklyAutoFill(ctx: BuildContext, opts: WeeklyOptions): {
  status: "Green" | "Amber" | "Red";
  completed: string;
  planned: string;
  openIssues: string;
  summary: string;
  highlights: string;
  blockers: string;
} {
  const anchor = opts.weekEndingDate ? new Date(opts.weekEndingDate) : new Date();
  const weekStart = addDays(anchor, -7);
  const nextWeekEnd = addDays(anchor, 7);

  const completed = ctx.tasks.filter((t) => {
    if (t.status !== "COMPLETE" || !t.completedAt) return false;
    const c = new Date(t.completedAt);
    return c >= weekStart && c <= anchor;
  });
  const schedule = computeSchedule(ctx.tasks, ctx.startDate, ctx.timelineMode, ctx.taskOverrides);
  const comingNext = schedule
    .filter((s) => {
      const start = new Date(s.start);
      return start > anchor && start <= nextWeekEnd && s.task.status !== "COMPLETE";
    })
    .map((s) => s.task);
  const inProgress = ctx.tasks.filter((t) => t.status === "IN PROGRESS");
  const blocked = ctx.tasks.filter((t) => t.status === "BLOCKED");
  const openQueries = ctx.issues.filter((i) => i.status !== "Closed");
  const status: "Green" | "Amber" | "Red" =
    blocked.length > 0 || openQueries.some((q) => q.priority === "CRITICAL" || q.priority === "HIGH")
      ? "Red"
      : openQueries.length > 0
      ? "Amber"
      : "Green";

  const lineFor = (t: Task) => `• ${t.id} ${t.title}`;
  return {
    status,
    completed: completed.map(lineFor).join("\n") || "— nothing logged as completed this week —",
    planned: comingNext.map(lineFor).join("\n") || "— no scheduled starts next week —",
    openIssues: [
      ...blocked.map((t) => `[BLOCKED] ${t.id} ${t.title}`),
      ...openQueries.map((q) => `${q.ref || "—"} ${q.description} (${q.priority})`),
    ].join("\n") || "— none —",
    summary: `${completed.length} tasks completed, ${inProgress.length} in progress, ${comingNext.length} starting next week.`,
    highlights: completed.slice(0, 5).map(lineFor).join("\n"),
    blockers: blocked.map(lineFor).join("\n"),
  };
}

// ─── WORKSHOP ────────────────────────────────────────────────────────
export function buildWorkshopEmail(ctx: BuildContext, sessionDef: SessionDef): DraftedEmail {
  const userSession = ctx.sessions.find((s) => s.topic === sessionDef.name || s.id === sessionDef.id);
  const agenda = CONTENT_TOPICS[sessionDef.id] || [];
  const body = `
    <p>Hi team,</p>
    <p>This is a heads-up for the upcoming <strong>${escapeHtml(sessionDef.name)}</strong> workshop — part of the <strong>${escapeHtml(ctx.client.clientName)}</strong> Plexa rollout.</p>
    ${section("Session details", `
      <table cellpadding="6" style="font-size:13px;border-collapse:collapse;">
        <tr><td style="color:${MUTED};">Session</td><td><strong style="font-family:ui-monospace,monospace;color:${BRAND_PRIMARY};">${escapeHtml(sessionDef.id)}</strong> · ${escapeHtml(sessionDef.name)}</td></tr>
        <tr><td style="color:${MUTED};">Type</td><td>${escapeHtml(sessionDef.type)} · Module ${escapeHtml(sessionDef.module)}</td></tr>
        <tr><td style="color:${MUTED};">Date</td><td><strong>${fmtDate(userSession?.date || "")}</strong></td></tr>
        <tr><td style="color:${MUTED};">Duration</td><td>${escapeHtml(userSession?.duration || "TBC")}</td></tr>
        <tr><td style="color:${MUTED};">Facilitator</td><td>${escapeHtml(userSession?.facilitator || ctx.client.plexaLead)}</td></tr>
        <tr><td style="color:${MUTED};">Location</td><td>${escapeHtml(userSession?.location || "TBC")}</td></tr>
      </table>
    `)}
    ${section("Agenda", bulletList(agenda.map(escapeHtml)))}
    ${callout(`<strong>Please come prepared</strong> with your current process notes and any pain points you want to raise during the discovery section.`)}
    <p style="margin-top:18px;">See you there.</p>
  `;
  const html = shell({
    preheader: `${sessionDef.id} · ${sessionDef.name}`,
    title: `Workshop — ${sessionDef.name}`,
    bodyHtml: body,
    client: ctx.client,
  });
  return {
    subject: `Workshop Invite — ${sessionDef.id} ${sessionDef.name} | ${ctx.client.clientName}`,
    html,
    plainText: htmlToText(body),
    recipients: recipientsFor(ctx, "hods"),
    ccDescription: "HODs + workshop attendees",
  };
}

// ─── TRAINING ────────────────────────────────────────────────────────
export function buildTrainingEmail(ctx: BuildContext, sessionDef: SessionDef): DraftedEmail {
  const userSession = ctx.sessions.find((s) => s.topic === sessionDef.name || s.id === sessionDef.id);
  const qsg = ctx.intranet.find((r) => r.kind === "Quick-Start Guide" && r.module === sessionDef.module);
  const recordings = ctx.intranet.filter((r) => r.kind === "Recording" && (r.module === sessionDef.module || r.sessionId === sessionDef.id));
  const body = `
    <p>Hi team,</p>
    <p>Training session <strong>${escapeHtml(sessionDef.name)}</strong> is coming up. Please review the materials below before the session so we can hit the ground running.</p>
    ${section("Session details", `
      <table cellpadding="6" style="font-size:13px;border-collapse:collapse;">
        <tr><td style="color:${MUTED};">Module</td><td><strong>${escapeHtml(sessionDef.module)}</strong></td></tr>
        <tr><td style="color:${MUTED};">Session</td><td><strong style="font-family:ui-monospace,monospace;color:${BRAND_PRIMARY};">${escapeHtml(sessionDef.id)}</strong> · ${escapeHtml(sessionDef.name)}</td></tr>
        <tr><td style="color:${MUTED};">Date</td><td><strong>${fmtDate(userSession?.date || "")}</strong></td></tr>
        <tr><td style="color:${MUTED};">Duration</td><td>${escapeHtml(userSession?.duration || "TBC")}</td></tr>
        <tr><td style="color:${MUTED};">Trainer</td><td>${escapeHtml(userSession?.facilitator || ctx.client.plexaLead)}</td></tr>
        <tr><td style="color:${MUTED};">Location</td><td>${escapeHtml(userSession?.location || "TBC")}</td></tr>
      </table>
    `)}
    ${qsg ? section("📚 Quick-Start Guide", `<a href="${escapeHtml(qsg.url)}" style="color:${BRAND_PRIMARY};font-weight:600;">${escapeHtml(qsg.title || "Open guide")}</a> <span style="color:${MUTED};font-size:12px;">· ${escapeHtml(qsg.format)}</span>`) : ""}
    ${recordings.length ? section("🎥 Recordings to watch first", bulletList(recordings.map((r) => `<a href="${escapeHtml(r.url)}" style="color:${BRAND_PRIMARY};">${escapeHtml(r.title || r.url)}</a>${r.duration ? ` <span style="color:${MUTED};font-size:11px;">· ${escapeHtml(r.duration)}</span>` : ""}`))) : ""}
    ${callout(`<strong>Bring:</strong> your laptop, your Plexa login, and the workflows from your current process. We'll Teach → Practice → Observe during the session.`)}
    <p style="margin-top:18px;">Reply if you can't attend.</p>
  `;
  const html = shell({
    preheader: `Training prep · ${sessionDef.name}`,
    title: `Training — ${sessionDef.name}`,
    bodyHtml: body,
    client: ctx.client,
  });
  return {
    subject: `Training Invite — ${sessionDef.id} ${sessionDef.name} | ${ctx.client.clientName}`,
    html,
    plainText: htmlToText(body),
    recipients: recipientsFor(ctx, "all"),
    ccDescription: "Trainees + module owners",
  };
}

// ─── IMPLEMENTATION COMPLETE ─────────────────────────────────────────
export function buildCompleteEmail(ctx: BuildContext): DraftedEmail {
  const signed = ctx.dod.filter((d) => d.confirmed);
  const totalDod = ctx.dod.length;
  const certifiedChamps = ctx.champions.filter((c) => c.status === "Certified");
  const recordings = ctx.intranet.filter((r) => r.kind === "Recording");
  const guides = ctx.intranet.filter((r) => r.kind === "Quick-Start Guide");
  const resources = ctx.intranet.filter((r) => r.kind === "Resource");

  const linkList = (rs: IntranetResource[]) =>
    bulletList(rs.map((r) => `<a href="${escapeHtml(r.url)}" style="color:${BRAND_PRIMARY};">${escapeHtml(r.title || r.url)}</a>${r.module ? ` <span style="color:${MUTED};font-size:11px;">· Module ${escapeHtml(r.module)}</span>` : ""}`));

  const body = `
    <p>Hi team,</p>
    <p>Plexa is now <strong>live</strong> at <strong>${escapeHtml(ctx.client.clientName)}</strong>. This email is your handover pack — everything you need to keep operating without us in the room.</p>
    ${callout(`<strong>${signed.length} of ${totalDod}</strong> Definition of Done criteria signed off · <strong>${certifiedChamps.length}</strong> certified internal champions ready to support your teams.`)}
    ${section("🏆 Your certified Plexa champions", bulletList(certifiedChamps.map((c) => `<strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.title)} <span style="color:${MUTED};font-size:11px;">· ${escapeHtml(c.modules)}</span>`)))}
    ${section("🎥 Recorded sessions", linkList(recordings))}
    ${section("📚 Quick-Start Guides", linkList(guides))}
    ${resources.length ? section("📎 Supporting resources", linkList(resources)) : ""}
    ${section("✅ Sign-off summary", bulletList(signed.map((d) => `<strong>${escapeHtml(d.cat)}</strong> — ${escapeHtml(d.text)} <span style="color:${MUTED};font-size:11px;">· ${escapeHtml(d.by)} on ${fmtDate(d.date)}</span>`)))}
    <p style="margin-top:20px;">Thanks for trusting Plexa with this rollout — congrats to everyone involved.</p>
  `;
  const html = shell({
    preheader: `Plexa is live at ${ctx.client.clientName} · handover pack`,
    title: "Implementation Complete — Handover Pack",
    bodyHtml: body,
    client: ctx.client,
  });
  return {
    subject: `Plexa Implementation Complete — ${ctx.client.clientName} Handover Pack`,
    html,
    plainText: htmlToText(body),
    recipients: recipientsFor(ctx, "all"),
    ccDescription: "All stakeholders + champions",
  };
}

// Build a mailto: URL that opens the default mail client with everything pre-filled.
export function buildMailto(d: DraftedEmail): string {
  const params = new URLSearchParams();
  params.set("subject", d.subject);
  params.set("body", d.plainText);
  const to = d.recipients.join(",");
  // mailto encoding: keep "to" outside the search params (RFC says it lives in the path)
  return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
}
