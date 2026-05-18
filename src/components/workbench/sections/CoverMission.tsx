import { usePlaybook, overallProgress, phaseProgress, calcEndDate } from "@/lib/playbook-store";
import { PHASES, COMMANDMENTS } from "@/lib/playbook-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard, SectionHeader, StatusBadge } from "../shared";

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
  const openIssues = issues.filter((i) => i.status !== "Closed").length;
  const closedIssues = issues.filter((i) => i.status === "Closed").length;
  const dodDone = dod.filter((d) => d.confirmed).length;
  const trainingHeld = sessions.filter((s) => s.type === "Training" && s.status === "Held").length;
  const workshopsHeld = sessions.filter((s) => s.type === "Workshop" && s.status === "Held").length;

  return (
    <div className="space-y-6">
      <SectionHeader title="🎯 Mission Control" subtitle="Live implementation health · auto-updating from every sheet." />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricCard label="Tasks Total" value={overall.total} />
        <MetricCard label="Complete" value={overall.complete} tone="success" />
        <MetricCard label="In Progress" value={overall.inProgress} tone="brand" />
        <MetricCard label="Blocked" value={overall.blocked} tone={overall.blocked > 0 ? "danger" : undefined} />
        <MetricCard label="% Complete" value={`${overall.pct}%`} tone="brand" />
        <MetricCard label="DoD Met" value={`${dodDone}/${dod.length}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">Phase Status</div>
          <div className="space-y-2">
            {PHASES.map((p) => {
              const prog = phaseProgress(tasks, p.id);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-semibold">{p.name}</div>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${prog.pct}%` }} />
                  </div>
                  <div className="w-16 text-right text-xs text-muted-foreground tabular-nums">{prog.complete}/{prog.total}</div>
                  <StatusBadge status={prog.status} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border bg-card p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">Sessions & Training</div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div><div className="text-2xl font-bold">{sessions.length}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div></div>
              <div><div className="text-2xl font-bold">{workshopsHeld}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workshops</div></div>
              <div><div className="text-2xl font-bold">{trainingHeld}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Training</div></div>
              <div><div className="text-2xl font-bold">{champions.length}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Champions</div></div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">Issues</div>
            <div className="grid grid-cols-3 text-center">
              <div><div className="text-2xl font-bold">{issues.length}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div></div>
              <div><div className="text-2xl font-bold text-destructive">{openIssues}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Open</div></div>
              <div><div className="text-2xl font-bold text-success">{closedIssues}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Closed</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl border bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">Timeline</div>
          <div className="flex items-center justify-between text-sm">
            <div><div className="text-xs text-muted-foreground">Mode</div><div className="font-semibold">{timelineMode}</div></div>
            <div><div className="text-xs text-muted-foreground">Start</div><div className="font-semibold">{startDate}</div></div>
            <div><div className="text-xs text-muted-foreground">Go-live</div><div className="font-semibold">{calcEndDate(startDate, timelineMode)}</div></div>
            <div><div className="text-xs text-muted-foreground">Client target</div><div className="font-semibold">{client.goLiveDate}</div></div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">Weekly Email Compliance</div>
          <div className="flex gap-1.5">
            {emails.map((e) => (
              <div key={e.id} className={`flex-1 rounded-md py-2 text-center text-[10px] font-semibold ${e.sent ? "bg-success/15 text-success border border-success/30" : "bg-muted text-muted-foreground border border-border"}`}>
                W{e.week}
                <div className="mt-0.5 font-normal">{e.sent ? "SENT" : "PENDING"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
