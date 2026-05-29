import { usePlaybook, overallProgress, phaseProgress, calcEndDate } from "@/lib/playbook-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader, StatusBadge } from "../shared";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, CheckCircle2, Clock, Flag, ShieldCheck, Target, TrendingUp, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

function MultiUserField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState("");
  const tokens = value.split(",").map((s) => s.trim()).filter(Boolean);
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...tokens, v].join(", "));
    setDraft("");
  };
  const remove = (i: number) => onChange(tokens.filter((_, j) => j !== i).join(", "));
  return (
    <div>
      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 min-h-9">
        {tokens.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary text-xs font-medium px-2 py-0.5">
            {t}
            <button type="button" onClick={() => remove(i)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          className="flex-1 min-w-32 bg-transparent outline-none text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={tokens.length ? "Add another…" : "Type name + Enter"}
        />
      </div>
    </div>
  );
}

export function CoverSection() {
  const client = usePlaybook((s) => s.client);
  const commandments = usePlaybook((s) => s.commandments);
  const setClient = usePlaybook((s) => s.setClient);
  const updateClient = usePlaybook((s) => s.updateClient);
  
  const [initial, setInitial] = useState(client);
  const commandList = commandments.length ? commandments : [];
  
  // Detect if client data has changed
  const hasChanges = JSON.stringify(client) !== JSON.stringify(initial);
  
  const handleSave = async () => {
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(client)) {
      if (value !== initial[key as keyof typeof initial]) {
        patch[key] = value;
      }
    }
    await updateClient(patch);
    setInitial(structuredClone(client));
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="📖 Cover" subtitle="Client information, version & implementation contents." />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Client Information</div>
          <div className="mt-4 space-y-3">
            <Field label="Client Name" value={client.clientName} onChange={(v) => setClient({ clientName: v })} />
            <MultiUserField label="Implementation Lead (Plexa)" value={client.plexaLead} onChange={(v) => setClient({ plexaLead: v })} />
            <MultiUserField label="Implementation Lead (Client)" value={client.clientLead} onChange={(v) => setClient({ clientLead: v })} />
            <Field label="Go-Live Target Date" type="date" value={client.goLiveDate} onChange={(v) => setClient({ goLiveDate: v })} />
            <MultiUserField label="Account Manager (Plexa)" value={client.accountManager} onChange={(v) => setClient({ accountManager: v })} />
            
            <div className="mt-4 pt-3 border-t flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-brand-gradient text-primary-foreground p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-15" />
          <div className="relative">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">Welcome to</div>
            <h3 className="text-4xl font-bold mt-1 tracking-tight">Plexa</h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed opacity-95 max-w-prose">
              <p>We're thrilled to have your organisation join the <span className="font-semibold">Plexa</span> family and are proud to power your business through the Plexa Platform. This is more than just an implementation — it's the beginning of a partnership built on your success.</p>
              <p>At Plexa, we believe that when you win, we win. That's why we're committed to being with you every step of the way, from onboarding through to long-term growth. Our team is dedicated to ensuring you get the most out of the platform, and we won't consider our job done until you're thriving.</p>
              <p>You're not just a customer — you're a partner, and your success is our success.</p>
              <p className="font-semibold">Let's build something great together.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="The Plexa Implementation Commandments" subtitle="Non-negotiable standards · every implementation · every time." />
        <div className="grid md:grid-cols-2 gap-3">
          {commandList.map((c) => (
            <div key={c.n} className="rounded-xl border bg-card p-4 flex gap-3">
              <div className="flex-none w-10 h-10 rounded-lg bg-primary-soft text-primary font-bold flex items-center justify-center">{c.n}</div>
              <div>
                <div className="font-semibold text-sm">{c.t}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input className="mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function MissionControlSection() {
  const tasks = usePlaybook((s) => s.tasks);
  const phases = usePlaybook((s) => s.phases);
  const sessions = usePlaybook((s) => s.sessions);
  const issues = usePlaybook((s) => s.issues);
  const champions = usePlaybook((s) => s.champions);
  const dod = usePlaybook((s) => s.dod);
  const emails = usePlaybook((s) => s.emails);
  const client = usePlaybook((s) => s.client);
  const startDate = usePlaybook((s) => s.startDate);
  const timelineMode = usePlaybook((s) => s.timelineMode);
  const reminders = usePlaybook((s) => s.reminderTasks);

  const overall = overallProgress(tasks);
  const openIssues = issues.filter((i) => i.status !== "Closed");
  const criticalIssues = openIssues.filter((i) => i.priority === "CRITICAL" || i.priority === "HIGH");
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED");
  const dodDone = dod.filter((d) => d.confirmed).length;

  const phaseList = phases.length ? phases : [];
  const currentPhase = phaseList.find((p) => {
    const pr = phaseProgress(tasks, p.id);
    return pr.status === "IN PROGRESS" || pr.status === "BLOCKED";
  }) ?? phaseList.find((p) => phaseProgress(tasks, p.id).status === "NOT STARTED") ?? phaseList[0] ?? null;
  const currentProg = currentPhase ? phaseProgress(tasks, currentPhase.id) : { complete: 0, total: 0, inProgress: 0, blocked: 0, status: "NOT STARTED" as const, pct: 0 };

  const phaseOrder = phaseList.map((p) => p.id);
  const currentIdx = currentPhase ? phaseOrder.indexOf(currentPhase.id) : -1;
  const focusPhases = currentIdx >= 0 ? phaseOrder.slice(currentIdx, currentIdx + 2) : [];
  const nextTasks = tasks
    .filter((t) => focusPhases.includes(t.phase) && t.status !== "COMPLETE" && t.status !== "BLOCKED")
    .slice(0, 6);

  const goLiveTarget = client.goLiveDate || calcEndDate(startDate, timelineMode);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const today = now ?? new Date(0);
  const target = new Date(goLiveTarget);
  const msToGoLive = now ? target.getTime() - today.getTime() : 0;
  const daysToGoLive = Math.ceil(msToGoLive / 86400000);
  const absMs = Math.max(0, msToGoLive);
  const cdWeeks = Math.floor(absMs / (7 * 86400000));
  const cdDays = Math.floor((absMs % (7 * 86400000)) / 86400000);
  const cdHours = Math.floor((absMs % 86400000) / 3600000);
  const cdMinutes = Math.floor((absMs % 3600000) / 60000);
  const goLivePast = now ? msToGoLive < 0 : false;
  const start = new Date(startDate);
  const totalDays = Math.max(1, Math.ceil((target.getTime() - start.getTime()) / 86400000));
  const elapsed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000));
  const timeElapsedPct = Math.min(100, Math.round((elapsed / totalDays) * 100));
  const workPct = overall.pct;
  const onTrack = workPct >= timeElapsedPct - 5;
  const drift = timeElapsedPct - workPct;

  const risks: { level: "danger" | "warning"; text: string }[] = [];
  if (blockedTasks.length > 0) risks.push({ level: "danger", text: `${blockedTasks.length} blocked task${blockedTasks.length > 1 ? "s" : ""} holding up delivery` });
  if (criticalIssues.length > 0) risks.push({ level: "danger", text: `${criticalIssues.length} high/critical quer${criticalIssues.length > 1 ? "ies" : "y"} open` });
  if (drift > 10) risks.push({ level: "warning", text: `Delivery is ${drift}% behind schedule (work vs. time elapsed)` });
  if (daysToGoLive < 14 && workPct < 80) risks.push({ level: "danger", text: `Go-live in ${daysToGoLive} days but only ${workPct}% of work complete` });
  const pendingEmails = emails.filter((e) => !e.sent).length;
  if (pendingEmails >= 2) risks.push({ level: "warning", text: `${pendingEmails} weekly status emails not sent — communication slipping` });

  const healthLabel = risks.some((r) => r.level === "danger") ? "AT RISK" : risks.length > 0 ? "WATCH" : "ON TRACK";
  const healthTone = healthLabel === "AT RISK" ? "danger" : healthLabel === "WATCH" ? "warning" : "success";

  // Granular analytics
  const ragColor = healthLabel === "ON TRACK" ? "bg-success" : healthLabel === "WATCH" ? "bg-warning" : "bg-destructive";
  const emailsSent = emails.filter((e) => e.sent).length;
  const sessionsHeld = sessions.filter((s) => s.status === "Completed").length;
  const issuesByType: Record<string, number> = {};
  openIssues.forEach((i) => { const k = i.type || "Other"; issuesByType[k] = (issuesByType[k] || 0) + 1; });

  return (
    <div className="space-y-6">
      <SectionHeader title="Mission Control" subtitle="Where we are, what's blocking us, what's next." />

      {/* Hero status card */}
      <div className={cn(
        "rounded-2xl border p-6 relative overflow-hidden",
        healthTone === "danger" && "bg-destructive/5 border-destructive/30",
        healthTone === "warning" && "bg-warning/10 border-warning/40",
        healthTone === "success" && "bg-success/5 border-success/30",
      )}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                healthTone === "danger" && "bg-destructive text-destructive-foreground",
                healthTone === "warning" && "bg-warning text-warning-foreground",
                healthTone === "success" && "bg-success text-success-foreground",
              )}>
                {healthTone === "danger" ? <AlertTriangle className="h-3.5 w-3.5" /> : healthTone === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Flag className="h-3.5 w-3.5" />}
                {healthLabel}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current step</span>
            </div>
            <h3 className="mt-2 text-3xl font-bold tracking-tight">{currentPhase ? `Phase ${currentPhase.name} — ${currentPhase.short}` : "Phase data is still loading…"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{currentProg.complete} of {currentProg.total} tasks complete in this phase · {currentProg.inProgress} active · {currentProg.blocked} blocked</p>
          </div>
          <div className="flex gap-6">
            <HeroStat icon={<Clock className="h-4 w-4" />} label="Days to go-live" value={daysToGoLive >= 0 ? daysToGoLive.toString() : "Overdue"} hint={goLiveTarget} tone={daysToGoLive < 14 ? "danger" : daysToGoLive < 30 ? "warning" : undefined} />
            <HeroStat icon={<TrendingUp className="h-4 w-4" />} label="Complete" value={`${workPct}%`} hint={`${overall.complete} / ${overall.total} tasks`} tone="brand" />
            <HeroStat icon={<Target className="h-4 w-4" />} label="Time elapsed" value={`${timeElapsedPct}%`} hint={onTrack ? "On schedule" : `${drift}% behind`} tone={onTrack ? "success" : "danger"} />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>Work complete</span><span>Time elapsed</span>
          </div>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${workPct}%` }} />
            <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: `${timeElapsedPct}%` }} title="Time elapsed" />
          </div>
          <div className="flex items-center justify-between text-[11px] tabular-nums text-muted-foreground mt-1">
            <span>{workPct}% work</span><span>{timeElapsedPct}% time</span>
          </div>
        </div>
      </div>

      {/* Go-Live countdown — moved ABOVE threats */}
      <div className={cn(
        "rounded-xl border p-5 relative overflow-hidden",
        goLivePast ? "bg-success/5 border-success/30" :
        daysToGoLive < 14 ? "bg-destructive/5 border-destructive/30" :
        daysToGoLive < 30 ? "bg-warning/10 border-warning/40" :
        "bg-primary-soft border-primary/30"
      )}>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
              <Clock className="h-3.5 w-3.5" />
              {goLivePast ? "Go-Live reached" : "Countdown to Go-Live"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Target · <span className="font-semibold text-foreground">{new Date(goLiveTarget).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
          {goLivePast ? (
            <div className="text-2xl font-bold text-success">Live for {Math.abs(daysToGoLive)} day{Math.abs(daysToGoLive) === 1 ? "" : "s"}</div>
          ) : (
            <div className="flex items-end gap-3">
              <CountdownUnit value={cdWeeks} label={cdWeeks === 1 ? "Week" : "Weeks"} />
              <span className="text-2xl font-bold text-muted-foreground pb-2">:</span>
              <CountdownUnit value={cdDays} label="Days" />
              <span className="text-2xl font-bold text-muted-foreground pb-2">:</span>
              <CountdownUnit value={cdHours} label="Hrs" />
              <span className="text-2xl font-bold text-muted-foreground pb-2">:</span>
              <CountdownUnit value={cdMinutes} label="Min" />
            </div>
          )}
        </div>
      </div>

      {/* Timeline risks banner */}
      {risks.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-destructive">Threats to the timeline</div>
          </div>
          <ul className="space-y-1.5">
            {risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={cn(
                  "mt-1 h-1.5 w-1.5 rounded-full flex-none",
                  r.level === "danger" ? "bg-destructive" : "bg-warning"
                )} />
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* Reminders & assigned tasks */}
      {(() => {
        const todayIso = new Date().toISOString().slice(0, 10);
        const open = reminders.filter((r) => r.status !== "DONE");
        const overdue = open.filter((r) => r.dueDate && r.dueDate < todayIso);
        const dueToday = open.filter((r) => r.dueDate === todayIso);
        const remindNow = open.filter((r) => r.remindAt && r.remindAt <= todayIso && r.dueDate !== todayIso && !(r.dueDate && r.dueDate < todayIso));
        const upcoming = open.filter((r) => r.dueDate && r.dueDate > todayIso && (new Date(r.dueDate).getTime() - new Date(todayIso).getTime()) <= 7 * 86400000);
        const sorted = [...overdue, ...dueToday, ...remindNow, ...upcoming].slice(0, 6);
        const priTone = (p: string) => p === "URGENT" ? "bg-destructive/15 text-destructive border-destructive/40" : p === "HIGH" ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40" : p === "MEDIUM" ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border";
        return (
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <Bell className="h-3.5 w-3.5" /> Reminders & assigned tasks
              </div>
              <div className="text-[11px] text-muted-foreground">
                {open.length} open · {dueToday.length} due today · <span className={cn(overdue.length && "text-destructive font-semibold")}>{overdue.length} overdue</span>
              </div>
            </div>
            {sorted.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No reminders due. Add one from <span className="font-semibold">Registers → Tasks & Reminders</span>.
              </div>
            ) : (
              <ul className="space-y-2">
                {sorted.map((r) => {
                  const isOverdue = r.dueDate && r.dueDate < todayIso;
                  const isToday = r.dueDate === todayIso;
                  const dueText = !r.dueDate
                    ? "No due date"
                    : isOverdue
                      ? `Overdue · ${r.dueDate}`
                      : isToday
                        ? "Due today"
                        : `Due ${r.dueDate}`;
                  return (
                    <li key={r.id} className={cn(
                      "flex items-start gap-3 text-sm border-l-2 pl-3 py-1",
                      isOverdue ? "border-destructive" : isToday ? "border-warning" : "border-primary/40"
                    )}>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{r.title}</div>
                        <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          <span>{r.assignee || "Unassigned"}</span>
                          <span>·</span>
                          <span className={cn(isOverdue && "text-destructive font-semibold", isToday && "text-warning-foreground font-semibold")}>{dueText}</span>
                        </div>
                      </div>
                      <span className={cn("rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex-none", priTone(r.priority))}>
                        {r.priority}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })()}

      {/* Granular analytics & progress */}
      <div className="rounded-xl border bg-card p-5">

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Live analytics & progress</div>
            <div className="text-xs text-muted-foreground mt-0.5">Granular view — every register, every count, RAG status.</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", ragColor)} />
            <span className="text-xs font-semibold uppercase tracking-wider">{healthLabel}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Stat label="Total tasks" value={overall.total} />
          <Stat label="Complete" value={overall.complete} tone="success" />
          <Stat label="In progress" value={overall.inProgress} tone="brand" />
          <Stat label="Blocked" value={overall.blocked} tone={overall.blocked ? "danger" : undefined} />
          <Stat label="Sessions held" value={`${sessionsHeld}/${sessions.length}`} />
          <Stat label="Champions" value={champions.length} />
          <Stat label="Queries open" value={openIssues.length} tone={openIssues.length ? "warning" : undefined} />
          <Stat label="Critical" value={criticalIssues.length} tone={criticalIssues.length ? "danger" : undefined} />
          <Stat label="Emails sent" value={`${emailsSent}/${emails.length}`} tone={emailsSent === emails.length ? "success" : pendingEmails >= 2 ? "warning" : undefined} />
          <Stat label="DoD confirmed" value={`${dodDone}/${dod.length}`} />
          <Stat label="Days to go-live" value={daysToGoLive >= 0 ? daysToGoLive : "—"} tone={daysToGoLive < 14 ? "danger" : daysToGoLive < 30 ? "warning" : undefined} />
          <Stat label="Pace vs time" value={onTrack ? "On track" : `${drift}% behind`} tone={onTrack ? "success" : "danger"} />
        </div>

        {/* Weekly email compliance strip */}
        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">Weekly email compliance</div>
          <div className="flex gap-1">
            {emails.map((e) => (
              <div key={e.id} className={cn(
                "flex-1 rounded-md py-2 text-center text-[10px] font-bold",
                e.sent ? "bg-success/20 text-success" : "bg-muted text-muted-foreground border border-dashed"
              )}>W{e.week}<div className="text-[9px] opacity-70 mt-0.5">{e.sent ? "SENT" : "PENDING"}</div></div>
            ))}
          </div>
        </div>

        {/* Per-phase progress */}
        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">Phase-by-phase breakdown</div>
          <div className="space-y-2">
            {phaseList.map((p) => {
              const prog = phaseProgress(tasks, p.id);
              const isCurrent = currentPhase ? p.id === currentPhase.id : false;
              return (
                <div key={p.id} className={cn("flex items-center gap-3 rounded-lg px-2 py-1.5", isCurrent && "bg-primary-soft")}>
                  <div className="w-20 text-sm font-semibold flex items-center gap-1.5">
                    {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                    {p.name}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn(
                      "h-full",
                      prog.status === "BLOCKED" ? "bg-destructive" : prog.status === "COMPLETE" ? "bg-success" : "bg-primary"
                    )} style={{ width: `${prog.pct}%` }} />
                  </div>
                  <div className="w-14 text-right text-xs text-muted-foreground tabular-nums">{prog.complete}/{prog.total}</div>
                  <StatusBadge status={prog.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues by type */}
        {Object.keys(issuesByType).length > 0 && (
          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-2">Open issues by type</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(issuesByType).map(([type, count]) => (
                <div key={type} className="rounded-md border bg-background px-2.5 py-1 text-xs flex items-center gap-2">
                  <span>{type}</span>
                  <span className="font-bold tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next up + blockers + issues */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">What's next</div>
            <div className="text-[11px] text-muted-foreground">{currentPhase ? `Phase ${currentPhase.name}` : "Waiting for phase data"}</div>
          </div>
          {nextTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No upcoming tasks. Nice work.</div>
          ) : (
            <ul className="space-y-2">
              {nextTasks.map((t) => (
                <li key={t.id} className="flex items-start gap-2.5 text-sm">
                  <span className={cn(
                    "mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded text-[10px] font-bold",
                    t.status === "IN PROGRESS" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}>{t.phase}</span>
                  <div className="min-w-0">
                    <div className="truncate">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">{t.owner}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-destructive">Blocked tasks</div>
            <div className="text-[11px] text-muted-foreground">{blockedTasks.length}</div>
          </div>
          {blockedTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Nothing blocked.
            </div>
          ) : (
            <ul className="space-y-2">
              {blockedTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-start gap-2 text-sm border-l-2 border-destructive pl-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">Phase {t.phase} · {t.owner}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-warning-foreground">Open issues</div>
            <div className="text-[11px] text-muted-foreground">{openIssues.length} open · {criticalIssues.length} critical</div>
          </div>
          {openIssues.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              No open issues.
            </div>
          ) : (
            <ul className="space-y-2">
              {openIssues.slice(0, 5).map((i) => (
                <li key={i.id} className={cn(
                  "flex items-start gap-2 text-sm border-l-2 pl-3",
                  i.priority === "CRITICAL" ? "border-destructive" : i.priority === "HIGH" ? "border-warning" : "border-muted-foreground/30"
                )}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{i.description || "(no description)"}</div>
                    <div className="text-[11px] text-muted-foreground">{i.type} · {i.owner} · Phase {i.phase}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer strip */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-3"><Users className="h-3.5 w-3.5" />People & training</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="Sessions" value={sessions.length} />
            <Mini label="Held" value={sessionsHeld} />
            <Mini label="Champions" value={champions.length} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-3">Definition of done</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold tabular-nums">{dodDone}</div>
            <div className="text-sm text-muted-foreground">of {dod.length} confirmed</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-success" style={{ width: `${dod.length ? (dodDone / dod.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "brand" | "success" | "warning" | "danger" }) {
  return (
    <div className="text-right min-w-[90px]">
      <div className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className={cn(
        "text-3xl font-bold tabular-nums mt-0.5",
        tone === "brand" && "text-primary",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning-foreground",
        tone === "danger" && "text-destructive",
      )}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "brand" | "success" | "warning" | "danger" }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn(
        "text-xl font-bold tabular-nums mt-0.5",
        tone === "brand" && "text-primary",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning-foreground",
        tone === "danger" && "text-destructive",
      )}>{value}</div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[56px]">
      <div className="text-3xl md:text-4xl font-bold tabular-nums leading-none">{String(value).padStart(2, "0")}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
