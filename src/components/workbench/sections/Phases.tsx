import { useState } from "react";
import { usePlaybook, calcEndDate, type TimelineMode } from "@/lib/playbook-store";
import { PHASES, type PhaseId, WORKSHOP_STEPS, RESISTANCE_PROFILES, TRAINING_MODULES } from "@/lib/playbook-data";
import type { TaskStatus } from "@/lib/playbook-data";
import { SectionHeader, StatusBadge } from "../shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, History } from "lucide-react";
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

const STATUS_CELL_CLS: Record<TaskStatus, string> = {
  "NOT STARTED": "bg-warning/15 text-warning-foreground border-warning/30",
  "IN PROGRESS": "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40",
  "COMPLETE": "bg-success/15 text-success border-success/30",
  "BLOCKED": "bg-destructive/15 text-destructive border-destructive/30",
};

// Helper guidance text per task — shows in the right column so everyone knows what to do
const TASK_GUIDANCE: Record<string, string> = {
  "1.01": "Lead CS Engineer — owns delivery, runs sessions, coordinates internally",
  "1.02": "Decision-maker who can approve, unblock, and attend all sessions",
  "1.03": "Contact who supplies all templates, forms, cost codes, workflows",
  "1.04": "Set a clear implementation timeline with key stages and deliverables. Agree on deadlines, sessions, go-live date, and responsibilities. Shared with all stakeholders.",
  "1.05": "Overview of the client's business, structure, projects, and operations.",
  "1.06": "Document 3–5 measurable objectives. Clearly outline goals (e.g. reduce systems, improve reporting, streamline workflows).",
  "1.07": "Identify current pain points across systems, processes, and teams. Used to tailor Phase 3 workshop questions",
  "1.08": "Define the expected outcomes and improvements from using Plexa. Outline desired gains (efficiency, cost savings, better control, visibility).",
  "1.09": "Define what a successful implementation looks like. Set clear outcomes (e.g. modules live, teams trained, processes active).",
  "1.10": "Platform usage %, invoices, inductions, workflows",
  "1.11": "CEO, CFO, IT Lead, Site Teams, Ops — confirmed in writing",
  "1.12": "All parties confirmed before leaving kickoff",
};

export function ImplementationPlanSection({ filterPhase }: { filterPhase?: PhaseId | null }) {
  const tasks = usePlaybook((s) => s.tasks);
  const noteHistory = usePlaybook((s) => s.noteHistory);
  const updateStatus = usePlaybook((s) => s.updateTaskStatus);
  const updateNotes = usePlaybook((s) => s.updateTaskNotes);
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | "ALL">(filterPhase || "ALL");
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const shown = phaseFilter === "ALL" ? tasks : tasks.filter((t) => t.phase === phaseFilter);
  const grouped = PHASES.map((p) => ({ phase: p, items: shown.filter((t) => t.phase === p.id) })).filter((g) => g.items.length);

  return (
    <div className="space-y-6">
      <SectionHeader title="🗺️ Implementation Plan" subtitle="Grid view — every task, status, notes & guidance always visible.">
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

            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                <div className="grid grid-cols-[60px_1.4fr_120px_140px_2fr_1.4fr_60px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
                  <div>ID</div><div>Task</div><div>Owner</div><div>Status</div><div>Notes</div><div>Guidance</div><div>History</div>
                </div>
                {items.map((t) => {
                  const history = noteHistory[t.id] || [];
                  const showHistory = historyOpen === t.id;
                  return (
                    <div key={t.id} className="border-b last:border-0">
                      <div className="grid grid-cols-[60px_1.4fr_120px_140px_2fr_1.4fr_60px] gap-2 px-3 py-2 items-start">
                        <div className="text-xs font-mono text-muted-foreground pt-2">{t.id}</div>
                        <div className="text-sm pt-1.5">{t.title}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pt-2">{t.owner}</div>
                        <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v as TaskStatus)}>
                          <SelectTrigger className={cn("h-8 text-xs font-semibold border", STATUS_CELL_CLS[t.status])}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <Textarea
                          rows={2}
                          className="text-xs min-h-[60px]"
                          value={t.notes || ""}
                          onChange={(e) => updateNotes(t.id, e.target.value, "You")}
                          placeholder="Add notes, decisions, follow-ups…"
                        />
                        <div className="text-xs text-muted-foreground italic leading-relaxed pt-1.5">
                          {TASK_GUIDANCE[t.id] || "—"}
                        </div>
                        <button
                          onClick={() => setHistoryOpen(showHistory ? null : t.id)}
                          className={cn("h-8 mt-0.5 rounded-md border text-xs flex items-center justify-center gap-1", showHistory ? "bg-primary-soft text-primary border-primary/30" : "hover:bg-muted")}
                          title="Notes audit history"
                        >
                          <History className="h-3.5 w-3.5" />
                          <span className="font-semibold">{history.length}</span>
                        </button>
                      </div>
                      {showHistory && (
                        <div className="px-3 pb-3 bg-muted/30">
                          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-2">Audit history · who changed notes</div>
                          {history.length === 0 ? (
                            <div className="text-xs text-muted-foreground italic">No history yet. The first edit will be recorded.</div>
                          ) : (
                            <ul className="space-y-1.5">
                              {history.map((h, i) => (
                                <li key={i} className="text-xs border-l-2 border-primary/30 pl-2.5">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-semibold">{h.by}</span>
                                    <span className="text-muted-foreground">{new Date(h.at).toLocaleString()}</span>
                                  </div>
                                  <div className="text-muted-foreground whitespace-pre-wrap">{h.text || "(cleared)"}</div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="bg-warning/5 border-t border-warning/30 px-4 py-2 text-xs text-warning-foreground/80">
                  ⛔ Hold point — phase complete · 📧 Weekly email update due to CEO, CFO, IT Lead, Site Teams, Ops
                </div>
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

// Color-coded status select trigger
const STATUS_SELECT_CLS: Record<TaskStatus, string> = {
  "NOT STARTED": "bg-warning/15 text-warning-foreground border-warning/40",
  "IN PROGRESS": "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40",
  "COMPLETE": "bg-success/15 text-success border-success/40",
  "BLOCKED": "bg-destructive/15 text-destructive border-destructive/40",
};

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
          <div className="grid grid-cols-[1fr_140px_140px_140px_180px_140px] gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
            <div>Module</div><div>Teach</div><div>Practice</div><div>Observe</div><div>Signed Off By</div><div>Date</div>
          </div>
          {modules.map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_140px_140px_140px_180px_140px] gap-3 px-4 py-3 items-center text-sm">
              <div><span className="font-mono text-xs text-muted-foreground mr-2">{m.id}</span>{m.name}</div>
              {(["teach", "practice", "observe"] as const).map((k) => (
                <Select key={k} value={m[k]} onValueChange={(v) => updateModule(m.id, { [k]: v as TaskStatus })}>
                  <SelectTrigger className={cn("h-8 text-xs font-semibold border", STATUS_SELECT_CLS[m[k]])}><SelectValue /></SelectTrigger>
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

// =================== TRAINING SCHEDULE ===================
// Per-item T/P/O = RED by default, GREEN when clicked. No add/delete.
const SCHEDULE_ITEMS: Record<string, { id: string; text: string }[]> = {
  "4A": [
    { id: "1", text: "Site sign-in / sign-out walk-through" },
    { id: "2", text: "SWMS upload & approval workflow" },
    { id: "3", text: "Equipment inductions & checklists" },
    { id: "4", text: "Permit creation & approval" },
    { id: "5", text: "ITP / ITC creation & sign-off" },
    { id: "6", text: "Incident / observation reporting" },
  ],
  "4B": [
    { id: "1", text: "Folder structure navigation" },
    { id: "2", text: "Document upload & transmittals" },
    { id: "3", text: "Drawing markups & approvals" },
    { id: "4", text: "Workflow creation & assignment" },
    { id: "5", text: "Task management & tracking" },
  ],
  "4C": [
    { id: "1", text: "Email inbox routing" },
    { id: "2", text: "Reply & link to project" },
    { id: "3", text: "Correspondence templates" },
    { id: "4", text: "Search & retrieval" },
  ],
  "4D": [
    { id: "1", text: "Program upload & milestones" },
    { id: "2", text: "Daily diary entries" },
    { id: "3", text: "Schedule updates & EOT" },
  ],
  "4E": [
    { id: "1", text: "Budget setup & cost codes" },
    { id: "2", text: "Commitments & variations" },
    { id: "3", text: "Invoice approval & AP" },
    { id: "4", text: "Head Contract claims" },
    { id: "5", text: "Forecasting & CTC" },
    { id: "6", text: "ERP integration sync" },
  ],
  "4F": [
    { id: "1", text: "O&M document compilation" },
    { id: "2", text: "Handover register" },
    { id: "3", text: "Defects liability tracking" },
  ],
  "4G": [
    { id: "1", text: "Tender package creation" },
    { id: "2", text: "Bid comparison" },
    { id: "3", text: "Award & contract issuance" },
    { id: "4", text: "Procurement schedule" },
  ],
};

export function TrainingScheduleSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="🎓 Training Schedule" subtitle="Every training item across all modules. Click T / P / O to mark complete (red → green)." />
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground mb-4">Each item starts red. Click each Teach / Practice / Observe cell to mark it as covered. Items are fixed — they cannot be edited or added.</p>
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
  const seed = SCHEDULE_ITEMS[moduleId] || [];
  const [state, setState] = useState<Record<string, { teach: boolean; practice: boolean; observe: boolean }>>(
    Object.fromEntries(seed.map((s) => [s.id, { teach: false, practice: false, observe: false }]))
  );
  const toggle = (id: string, k: "teach" | "practice" | "observe") =>
    setState((prev) => ({ ...prev, [id]: { ...prev[id], [k]: !prev[id][k] } }));

  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <div className="px-3 py-2 bg-primary-soft border-b flex items-center justify-between">
        <div className="text-sm font-semibold">{moduleId} — {moduleName}</div>
        <div className="flex gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>T</span><span>P</span><span>O</span>
        </div>
      </div>
      <div className="divide-y">
        {seed.map((it) => {
          const v = state[it.id];
          return (
            <div key={it.id} className="grid grid-cols-[1fr_64px_64px_64px] gap-3 px-3 py-2 items-center text-sm">
              <div>{it.text}</div>
              {(["teach", "practice", "observe"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => toggle(it.id, k)}
                  className={cn(
                    "h-8 rounded-md border-2 text-xs font-bold uppercase transition-colors",
                    v[k]
                      ? "bg-success/20 text-success border-success/50 hover:bg-success/30"
                      : "bg-destructive/15 text-destructive border-destructive/40 hover:bg-destructive/25"
                  )}
                  title={`${k} — click to toggle`}
                >
                  {k[0].toUpperCase()}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
