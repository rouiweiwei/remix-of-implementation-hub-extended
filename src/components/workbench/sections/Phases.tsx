import { useState } from "react";
import { usePlaybook, calcEndDate, type TimelineMode } from "@/lib/playbook-store";
import { PHASES, type PhaseId, WORKSHOP_STEPS, RESISTANCE_PROFILES, TRAINING_MODULES } from "@/lib/playbook-data";
import type { TaskStatus } from "@/lib/playbook-data";
import { SectionHeader, StatusBadge } from "../shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: TimelineMode[] = ["Quick (4 Weeks)", "Medium (6 Weeks)", "Enterprise (8 Weeks)", "Complex (12 Weeks)"];

export function TimelineSection() {
  const startDate = usePlaybook((s) => s.startDate);
  const timelineMode = usePlaybook((s) => s.timelineMode);
  const setTimeline = usePlaybook((s) => s.setTimeline);
  const client = usePlaybook((s) => s.client);
  const setClient = usePlaybook((s) => s.setClient);
  const end = calcEndDate(startDate, timelineMode);

  return (
    <div className="space-y-6">
      <SectionHeader title="📆 Timeline Planner" subtitle="Pick mode and start date. All phase dates auto-calculate." />

      <div className="grid md:grid-cols-4 gap-3">
        {MODES.map((m) => {
          const active = m === timelineMode;
          const weeks = m.match(/\d+/)?.[0];
          return (
            <button
              key={m}
              onClick={() => setTimeline(m, startDate)}
              className={cn(
                "rounded-xl border p-5 text-left transition-all",
                active ? "border-primary ring-2 ring-primary/20 bg-primary-soft" : "hover:border-primary/40"
              )}
            >
              <Calendar className={cn("h-5 w-5 mb-2", active ? "text-primary" : "text-muted-foreground")} />
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.split(" ")[0]}</div>
              <div className="text-2xl font-bold mt-0.5">{weeks} weeks</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-5 grid md:grid-cols-4 gap-4">
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mode</Label>
          <Select value={timelineMode} onValueChange={(v) => setTimeline(v as TimelineMode, startDate)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Project Start Date</Label>
          <Input type="date" className="mt-1" value={startDate} onChange={(e) => setTimeline(timelineMode, e.target.value)} />
        </div>
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Client Requested End Date</Label>
          <Input type="date" className="mt-1" value={client.goLiveDate} onChange={(e) => setClient({ goLiveDate: e.target.value })} />
        </div>
        <div className="rounded-lg bg-primary-soft p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Calculated Go-Live</div>
          <div className="text-xl font-bold mt-1">{end}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">Phase Timeline</div>
        <div className="space-y-2">
          {PHASES.map((p, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i * Math.floor((parseInt(timelineMode.match(/\d+/)?.[0] || "6") * 7) / PHASES.length));
            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-24 text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground flex-1">{p.description}</div>
                <div className="text-xs font-medium text-foreground">{d.toISOString().slice(0, 10)}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4">Dates are calendar days (weekends included). Adjust manually for public holidays. Phase 2B/2C only applies if the client has existing data to migrate.</p>
      </div>
    </div>
  );
}

const STATUSES: TaskStatus[] = ["NOT STARTED", "IN PROGRESS", "COMPLETE", "BLOCKED"];

export function ImplementationPlanSection({ filterPhase }: { filterPhase?: PhaseId | null }) {
  const tasks = usePlaybook((s) => s.tasks);
  const updateStatus = usePlaybook((s) => s.updateTaskStatus);
  const updateNotes = usePlaybook((s) => s.updateTaskNotes);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | "ALL">(filterPhase || "ALL");

  const shown = phaseFilter === "ALL" ? tasks : tasks.filter((t) => t.phase === phaseFilter);
  const grouped = PHASES.map((p) => ({ phase: p, items: shown.filter((t) => t.phase === p.id) })).filter((g) => g.items.length);

  return (
    <div className="space-y-6">
      <SectionHeader title="🗺️ Implementation Plan" subtitle="Every task. Every owner. Every status. Click a task to edit notes.">
        <Select value={phaseFilter} onValueChange={(v) => setPhaseFilter(v as PhaseId | "ALL")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All phases</SelectItem>
            {PHASES.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.short}</SelectItem>)}
          </SelectContent>
        </Select>
      </SectionHeader>

      <div className="space-y-5">
        {grouped.map(({ phase, items }) => (
          <div key={phase.id} className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between bg-primary-soft px-4 py-3 border-b">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">▸ {phase.name}</div>
                <div className="text-sm font-bold">{phase.description}</div>
              </div>
              <div className="text-xs text-muted-foreground">{items.length} tasks</div>
            </div>
            <div className="divide-y">
              {items.map((t) => (
                <div key={t.id}>
                  <button
                    onClick={() => setOpenTask(openTask === t.id ? null : t.id)}
                    className="w-full grid grid-cols-[80px_1fr_120px_140px_24px] items-center gap-3 px-4 py-3 hover:bg-muted/40 text-left"
                  >
                    <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                    <span className="text-sm">{t.title}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.owner}</span>
                    <span><StatusBadge status={t.status} /></span>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", openTask === t.id && "rotate-90")} />
                  </button>
                  {openTask === t.id && (
                    <div className="px-4 pb-4 bg-muted/30 space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {STATUSES.map((s) => (
                          <Button key={s} size="sm" variant={t.status === s ? "default" : "outline"} onClick={() => updateStatus(t.id, s)}>{s}</Button>
                        ))}
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes / Meeting minutes</Label>
                        <Textarea className="mt-1" value={t.notes || ""} onChange={(e) => updateNotes(t.id, e.target.value)} placeholder="Add notes, decisions, follow-ups…" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="bg-warning/5 border-t border-warning/30 px-4 py-2 text-xs text-warning-foreground/80">
                ⛔ Hold point — phase complete · 📧 Weekly email update due to CEO, CFO, IT Lead, Site Teams, Ops
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Phase3Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="🎯 Phase 3 — Workshops" subtitle="HOD workshop agenda · change management · rollout planning." />

      <div className="rounded-xl border bg-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-3">HOD Workshop Agenda · 7-Step Format</div>
        <div className="space-y-2">
          {WORKSHOP_STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-4 rounded-lg border bg-background p-3">
              <div className="flex-none w-10 h-10 rounded-lg bg-brand-gradient text-primary-foreground font-bold flex items-center justify-center">{s.step}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{s.title}</div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.duration}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Change Management" subtitle="Resistance profiles & conversion strategy." />
        <div className="grid md:grid-cols-2 gap-3">
          {RESISTANCE_PROFILES.map((r) => (
            <div key={r.type} className="rounded-xl border bg-card p-4">
              <div className="font-semibold">{r.type}</div>
              <div className="mt-2 grid gap-2 text-xs">
                <div><span className="text-muted-foreground uppercase tracking-wider text-[10px]">Why</span><div>{r.why}</div></div>
                <div><span className="text-primary uppercase tracking-wider text-[10px] font-semibold">Strategy</span><div>{r.strategy}</div></div>
                <div><span className="text-success uppercase tracking-wider text-[10px] font-semibold">Outcome</span><div>{r.outcome}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Phase4Section() {
  const modules = usePlaybook((s) => s.trainingModules);
  const updateModule = usePlaybook((s) => s.updateModule);

  return (
    <div className="space-y-6">
      <SectionHeader title="🏋️ Phase 4 — Training" subtitle="The 3-part model: TEACH → PRACTICE → OBSERVE. No sign-off until all three are complete." />

      <div className="grid md:grid-cols-3 gap-3">
        {[
          { p: "TEACH", t: "We show you everything", d: "Trainer leads. Team watches and asks questions. 45–90 min." },
          { p: "PRACTICE", t: "We do it together", d: "Side by side using real data on live environment. 60–120 min." },
          { p: "OBSERVE", t: "You do it. We watch.", d: "Team works independently. Trainer observes silently. 30–60 min." },
        ].map((x, i) => (
          <div key={x.p} className="rounded-xl border bg-card p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Part {i + 1}</div>
            <div className="text-xl font-bold mt-0.5">{x.p}</div>
            <div className="text-sm font-medium mt-1">{x.t}</div>
            <div className="text-xs text-muted-foreground mt-2">{x.d}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-primary-soft px-4 py-3 border-b">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Training Sign-Off Tracker · Module Level</div>
        </div>
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_120px_120px_120px_180px_120px] gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
            <div>Module</div><div>Teach</div><div>Practice</div><div>Observe</div><div>Signed Off By</div><div>Date</div>
          </div>
          {modules.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_120px_120px_120px_180px_120px] gap-3 px-4 py-3 items-center text-sm">
              <div><span className="font-mono text-xs text-muted-foreground mr-2">{m.id}</span>{m.name}</div>
              {(["teach", "practice", "observe"] as const).map((k) => (
                <Select key={k} value={m[k]} onValueChange={(v) => updateModule(m.id, { [k]: v as TaskStatus })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              ))}
              <Input className="h-8 text-xs" value={m.signedOffBy} onChange={(e) => updateModule(m.id, { signedOffBy: e.target.value })} placeholder="Name…" />
              <Input className="h-8 text-xs" type="date" value={m.signOffDate} onChange={(e) => updateModule(m.id, { signOffDate: e.target.value })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrainingScheduleSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="🎓 Training Schedule" subtitle="Every training item across all modules. 3-part sign-off per item." />
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground mb-4">Track each item's Teach → Practice → Observe state. Use this when running scheduled sessions per module.</p>
        <div className="space-y-4">
          {TRAINING_MODULES.map((mod) => (
            <ModuleScheduleBlock key={mod.id} moduleId={mod.id} moduleName={mod.name} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleScheduleBlock({ moduleId, moduleName }: { moduleId: string; moduleName: string }) {
  const [items, setItems] = useState<{ id: string; text: string; teach: boolean; practice: boolean; observe: boolean }[]>([
    { id: "1", text: "Overview & login walk-through", teach: false, practice: false, observe: false },
    { id: "2", text: "Core workflows demo", teach: false, practice: false, observe: false },
    { id: "3", text: "End-to-end exercise", teach: false, practice: false, observe: false },
  ]);
  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <div className="px-3 py-2 bg-primary-soft border-b">
        <div className="text-sm font-semibold">{moduleId} — {moduleName}</div>
      </div>
      <div className="divide-y">
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-[1fr_60px_60px_60px] gap-3 px-3 py-2 items-center text-sm">
            <Input value={it.text} onChange={(e) => setItems(items.map((x) => x.id === it.id ? { ...x, text: e.target.value } : x))} className="h-8 text-sm border-none shadow-none focus-visible:ring-0 px-0" />
            {(["teach", "practice", "observe"] as const).map((k) => (
              <button key={k} onClick={() => setItems(items.map((x) => x.id === it.id ? { ...x, [k]: !x[k] } : x))} className={cn("h-8 rounded-md border text-[10px] font-semibold uppercase", it[k] ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground")}>
                {k[0].toUpperCase()}
              </button>
            ))}
          </div>
        ))}
        <button onClick={() => setItems([...items, { id: Math.random().toString(36).slice(2), text: "", teach: false, practice: false, observe: false }])} className="w-full px-3 py-2 text-xs text-primary hover:bg-primary-soft">+ Add item</button>
      </div>
    </div>
  );
}
