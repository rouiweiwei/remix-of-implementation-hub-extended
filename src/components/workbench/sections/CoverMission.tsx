import { usePlaybook, overallProgress, phaseProgress, calcEndDate } from "@/lib/playbook-store";
import { PHASES, COMMANDMENTS } from "@/lib/playbook-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader, StatusBadge } from "../shared";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, Flag, ShieldCheck, Target, TrendingUp, Users } from "lucide-react";

export function CoverSection() {
  const client = usePlaybook((s) => s.client);
  const setClient = usePlaybook((s) => s.setClient);
  return (
    <div className="space-y-6">
      <SectionHeader title="📖 Cover" subtitle="Client information, version & implementation contents." />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Client Information</div>
          <div className="mt-4 space-y-3">
            <Field label="Client Name" value={client.clientName} onChange={(v) => setClient({ clientName: v })} />
            <Field label="Implementation Lead (Plexa)" value={client.plexaLead} onChange={(v) => setClient({ plexaLead: v })} />
            <Field label="Implementation Lead (Client)" value={client.clientLead} onChange={(v) => setClient({ clientLead: v })} />
            <Field label="Go-Live Target Date" type="date" value={client.goLiveDate} onChange={(v) => setClient({ goLiveDate: v })} />
            <Field label="Account Manager (Plexa)" value={client.accountManager} onChange={(v) => setClient({ accountManager: v })} />
          </div>
        </div>

        <div className="rounded-xl border bg-brand-gradient text-primary-foreground p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-15" />
          <div className="relative">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">Playbook</div>
            <h3 className="text-3xl font-bold mt-1">Implementation Playbook</h3>
            <p className="text-sm opacity-90 mt-2 max-w-md">The definitive workbench for delivering a world-class Plexa implementation. Every phase. Every owner. Every deadline.</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/10 backdrop-blur p-3">
                <div className="text-2xl font-bold">8</div>
                <div className="text-[10px] uppercase tracking-wider opacity-80">Phases</div>
              </div>
              <div className="rounded-lg bg-white/10 backdrop-blur p-3">
                <div className="text-2xl font-bold">76</div>
                <div className="text-[10px] uppercase tracking-wider opacity-80">Tasks</div>
              </div>
              <div className="rounded-lg bg-white/10 backdrop-blur p-3">
                <div className="text-2xl font-bold">29</div>
                <div className="text-[10px] uppercase tracking-wider opacity-80">DoD Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="The Plexa Implementation Commandments" subtitle="Non-negotiable standards · every implementation · every time." />
        <div className="grid md:grid-cols-2 gap-3">
          {COMMANDMENTS.map((c) => (
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
  const sessions = usePlaybook((s) => s.sessions);
  const issues = usePlaybook((s) => s.issues);
  const champions = usePlaybook((s) => s.champions);
  const dod = usePlaybook((s) => s.dod);
  const emails = usePlaybook((s) => s.emails);
  const client = usePlaybook((s) => s.client);
  const startDate = usePlaybook((s) => s.startDate);
  const timelineMode = usePlaybook((s) => s.timelineMode);

  const overall = overallProgress(tasks);
  const openIssues = issues.filter((i) => i.status !== "Closed");
  const criticalIssues = openIssues.filter((i) => i.priority === "CRITICAL" || i.priority === "HIGH");
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED");
  const dodDone = dod.filter((d) => d.confirmed).length;

  // Where we are
  const currentPhase = PHASES.find((p) => {
    const pr = phaseProgress(tasks, p.id);
    return pr.status === "IN PROGRESS" || pr.status === "BLOCKED";
  }) ?? PHASES.find((p) => phaseProgress(tasks, p.id).status === "NOT STARTED") ?? PHASES[PHASES.length - 1];
  const currentProg = phaseProgress(tasks, currentPhase.id);

  // Next-up tasks (not started/in progress in current or next phase, top 6)
  const phaseOrder = PHASES.map((p) => p.id);
  const currentIdx = phaseOrder.indexOf(currentPhase.id);
  const focusPhases = phaseOrder.slice(currentIdx, currentIdx + 2);
  const nextTasks = tasks
    .filter((t) => focusPhases.includes(t.phase) && t.status !== "COMPLETE" && t.status !== "BLOCKED")
    .slice(0, 6);

  // Timeline math
  const goLiveTarget = client.goLiveDate || calcEndDate(startDate, timelineMode);
  const today = new Date();
  const target = new Date(goLiveTarget);
  const msToGoLive = target.getTime() - today.getTime();
  const daysToGoLive = Math.ceil(msToGoLive / 86400000);
  const absMs = Math.max(0, msToGoLive);
  const cdWeeks = Math.floor(absMs / (7 * 86400000));
  const cdDays = Math.floor((absMs % (7 * 86400000)) / 86400000);
  const cdHours = Math.floor((absMs % 86400000) / 3600000);
  const cdMinutes = Math.floor((absMs % 3600000) / 60000);
  const goLivePast = msToGoLive < 0;
  const start = new Date(startDate);
  const totalDays = Math.max(1, Math.ceil((target.getTime() - start.getTime()) / 86400000));
  const elapsed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000));
  const timeElapsedPct = Math.min(100, Math.round((elapsed / totalDays) * 100));
  const workPct = overall.pct;
  const onTrack = workPct >= timeElapsedPct - 5;
  const drift = timeElapsedPct - workPct;

  // Risk score / banner
  const risks: { level: "danger" | "warning"; text: string }[] = [];
  if (blockedTasks.length > 0) risks.push({ level: "danger", text: `${blockedTasks.length} blocked task${blockedTasks.length > 1 ? "s" : ""} holding up delivery` });
  if (criticalIssues.length > 0) risks.push({ level: "danger", text: `${criticalIssues.length} high/critical issue${criticalIssues.length > 1 ? "s" : ""} open` });
  if (drift > 10) risks.push({ level: "warning", text: `Delivery is ${drift}% behind schedule (work vs. time elapsed)` });
  if (daysToGoLive < 14 && workPct < 80) risks.push({ level: "danger", text: `Go-live in ${daysToGoLive} days but only ${workPct}% of work complete` });
  const pendingEmails = emails.filter((e) => !e.sent).length;
  if (pendingEmails >= 2) risks.push({ level: "warning", text: `${pendingEmails} weekly status emails not sent — communication slipping` });

  const healthLabel = risks.some((r) => r.level === "danger") ? "AT RISK" : risks.length > 0 ? "WATCH" : "ON TRACK";
  const healthTone = healthLabel === "AT RISK" ? "danger" : healthLabel === "WATCH" ? "warning" : "success";

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
            <h3 className="mt-2 text-3xl font-bold tracking-tight">Phase {currentPhase.name} — {currentPhase.short}</h3>
            <p className="text-sm text-muted-foreground mt-1">{currentProg.complete} of {currentProg.total} tasks complete in this phase · {currentProg.inProgress} active · {currentProg.blocked} blocked</p>
          </div>
          <div className="flex gap-6">
            <HeroStat icon={<Clock className="h-4 w-4" />} label="Days to go-live" value={daysToGoLive >= 0 ? daysToGoLive.toString() : "Overdue"} hint={goLiveTarget} tone={daysToGoLive < 14 ? "danger" : daysToGoLive < 30 ? "warning" : undefined} />
            <HeroStat icon={<TrendingUp className="h-4 w-4" />} label="Complete" value={`${workPct}%`} hint={`${overall.complete} / ${overall.total} tasks`} tone="brand" />
            <HeroStat icon={<Target className="h-4 w-4" />} label="Time elapsed" value={`${timeElapsedPct}%`} hint={onTrack ? "On schedule" : `${drift}% behind`} tone={onTrack ? "success" : "danger"} />
          </div>
        </div>

        {/* Pace bar */}
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

      {/* Go-Live countdown */}
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
              Target · <span className="font-semibold text-foreground">{new Date(goLiveTarget).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
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

      {/* Phase progress + next up */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Phase progress</div>
            <div className="text-[11px] text-muted-foreground">{overall.complete}/{overall.total} tasks · {overall.pct}%</div>
          </div>
          <div className="space-y-2.5">
            {PHASES.map((p) => {
              const prog = phaseProgress(tasks, p.id);
              const isCurrent = p.id === currentPhase.id;
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

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">What's next</div>
            <div className="text-[11px] text-muted-foreground">Phase {currentPhase.name}</div>
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
      </div>

      {/* Blockers + Issues */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-destructive">Blocked tasks</div>
            <div className="text-[11px] text-muted-foreground">{blockedTasks.length}</div>
          </div>
          {blockedTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Nothing blocked. Keep it flowing.
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
              No open issues raised.
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
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5",
                    i.priority === "CRITICAL" && "bg-destructive text-destructive-foreground",
                    i.priority === "HIGH" && "bg-warning text-warning-foreground",
                    i.priority === "MEDIUM" && "bg-muted text-muted-foreground",
                    i.priority === "LOW" && "bg-muted text-muted-foreground",
                  )}>{i.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer strip: people + comms + DoD */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-3"><Users className="h-3.5 w-3.5" />People & training</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="Sessions" value={sessions.length} />
            <Mini label="Held" value={sessions.filter((s) => s.status === "Held").length} />
            <Mini label="Champions" value={champions.length} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-3">Weekly comms</div>
          <div className="flex gap-1">
            {emails.map((e) => (
              <div key={e.id} className={cn(
                "flex-1 rounded-md py-1.5 text-center text-[10px] font-bold",
                e.sent ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              )}>W{e.week}</div>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">{emails.filter((e) => e.sent).length} of {emails.length} weekly updates sent</div>
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

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
