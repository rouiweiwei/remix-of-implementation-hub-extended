import { useState } from "react";
import { usePlaybook, calcEndDate, addBusinessDays, weeksForMode, type TimelineMode } from "@/lib/playbook-store";
import { PHASES, type PhaseId, WORKSHOP_STEPS, RESISTANCE_PROFILES, TRAINING_MODULES } from "@/lib/playbook-data";
import type { TaskStatus } from "@/lib/playbook-data";
import { SectionHeader, StatusBadge } from "../shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, History } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: TimelineMode[] = [
  "Quick (4 Weeks)",
  "Medium (6 Weeks)",
  "Enterprise (8 Weeks)",
  "Extended (10 Weeks)",
  "Complex (12 Weeks)",
  "Strategic (14 Weeks)",
  "Transformational (16 Weeks)",
];

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
          {(() => {
            const totalBizDays = weeksForMode(timelineMode) * 5;
            const perPhase = Math.max(1, Math.floor(totalBizDays / PHASES.length));
            let cursor = 0;
            return PHASES.map((p, i) => {
              const phaseStart = i === 0 ? new Date(startDate) : addBusinessDays(startDate, cursor);
              const isLast = i === PHASES.length - 1;
              const endOffset = isLast ? totalBizDays : cursor + perPhase;
              const phaseEnd = addBusinessDays(startDate, Math.max(endOffset - 1, cursor));
              cursor = endOffset;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground flex-1">{p.description}</div>
                  <div className="text-xs font-medium text-foreground whitespace-nowrap">
                    {phaseStart.toISOString().slice(0, 10)} → {phaseEnd.toISOString().slice(0, 10)}
                  </div>
                </div>
              );
            });
          })()}
        </div>
        <p className="text-xs text-muted-foreground mt-4">Dates are business days only (weekends excluded). Adjust manually for public holidays. Phase 2B/2C only applies if the client has existing data to migrate.</p>
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
// Mirrors the "🎓 Training Schedule" tab from the Plexa Excel workbook.
import { TRAINING_SCHEDULE } from "@/lib/training-schedule";

type ItemState = { teach: boolean; practice: boolean; observe: boolean; owner: string; status: TaskStatus; date: string; facilitator: string };
const blankItem = (): ItemState => ({ teach: false, practice: false, observe: false, owner: "PLEXA", status: "NOT STARTED", date: "", facilitator: "" });

export function TrainingScheduleSection() {
  const allItems = TRAINING_SCHEDULE.flatMap((m) => m.subs.flatMap((s) => s.items));
  const [state, setState] = useState<Record<number, ItemState>>(() =>
    Object.fromEntries(allItems.map((i) => [i.n, blankItem()]))
  );
  const update = (n: number, patch: Partial<ItemState>) =>
    setState((p) => ({ ...p, [n]: { ...p[n], ...patch } }));

  const total = allItems.length;
  const complete = Object.values(state).filter((s) => s.status === "COMPLETE").length;
  const inProgress = Object.values(state).filter((s) => s.status === "IN PROGRESS").length;
  const notStarted = Object.values(state).filter((s) => s.status === "NOT STARTED").length;
  const signedOff = Object.values(state).filter((s) => s.teach && s.practice && s.observe).length;
  const pctDone = total ? Math.round((signedOff / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="🎓 Training Schedule"
        subtitle="Phase 4 Complete Training Register — every training item across all 8 modules. 3-part sign-off per item: TEACH → PRACTICE → OBSERVE. Nothing is complete until all three parts are signed off."
      />

      {/* Totals strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
        {[
          { label: "TOTAL ITEMS", value: total, tone: "text-foreground" },
          { label: "COMPLETE", value: complete, tone: "text-success" },
          { label: "IN PROGRESS", value: inProgress, tone: "text-yellow-600 dark:text-yellow-400" },
          { label: "NOT STARTED", value: notStarted, tone: "text-warning-foreground" },
          { label: "SIGNED OFF", value: signedOff, tone: "text-primary" },
          { label: "% DONE", value: `${pctDone}%`, tone: "text-primary" },
        ].map((t) => (
          <div key={t.label} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</div>
            <div className={cn("text-lg font-bold tabular-nums", t.tone)}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* Training model legend */}
      <div className="rounded-xl border bg-primary-soft px-4 py-3 text-sm">
        <span className="font-bold">🎓 TRAINING MODEL:</span>{" "}
        <span className="font-semibold">PART 1 — TEACH</span> (Trainer demonstrates) ·{" "}
        <span className="font-semibold">PART 2 — PRACTICE</span> (Do it together with real data) ·{" "}
        <span className="font-semibold">PART 3 — OBSERVE</span> (Team works independently, trainer watches)
      </div>

      {TRAINING_SCHEDULE.map((mod) => (
        <div key={mod.title} className="space-y-3">
          <div className="rounded-xl border-2 border-primary/40 bg-primary/10 px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">▸ Module</div>
            <div className="text-lg font-bold tracking-tight">{mod.title}</div>
          </div>

          {mod.subs.map((sub) => {
            const showSubHeader = mod.subs.length > 1 || sub.title !== mod.title;
            return (
              <div key={sub.title} className="rounded-xl border bg-card overflow-hidden">
                {showSubHeader && (
                  <div className="px-4 py-2 bg-muted/40 border-b">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">◈ Sub-module</div>
                    <div className="text-sm font-semibold">{sub.title}</div>
                  </div>
                )}
                <div className="px-4 py-2 text-xs text-muted-foreground border-b bg-background">
                  3-Part Training: TEACH → PRACTICE → OBSERVE · All three parts must be signed off before this sub-module is complete
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-2 py-2 text-left w-10">#</th>
                        <th className="px-2 py-2 text-left">Training Item</th>
                        <th className="px-2 py-2 text-left w-24">Owner</th>
                        <th className="px-2 py-2 text-left w-32">Status</th>
                        <th className="px-2 py-2 text-left w-32">Session Date</th>
                        <th className="px-2 py-2 text-left w-32">Facilitator</th>
                        <th className="px-2 py-2 text-center w-20">Pt 1 Teach</th>
                        <th className="px-2 py-2 text-center w-20">Pt 2 Practice</th>
                        <th className="px-2 py-2 text-center w-20">Pt 3 Observe</th>
                        <th className="px-2 py-2 text-center w-20">Sign-Off</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sub.items.map((it) => {
                        const s = state[it.n];
                        const allDone = s.teach && s.practice && s.observe;
                        return (
                          <tr key={it.n} className="hover:bg-muted/20">
                            <td className="px-2 py-1.5 font-mono tabular-nums text-muted-foreground">{it.n}</td>
                            <td className="px-2 py-1.5">{it.text}</td>
                            <td className="px-2 py-1.5">
                              <Input className="h-7 text-xs" value={s.owner} onChange={(e) => update(it.n, { owner: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5">
                              <Select value={s.status} onValueChange={(v) => update(it.n, { status: v as TaskStatus })}>
                                <SelectTrigger className={cn("h-7 text-[11px] font-semibold border", STATUS_SELECT_CLS[s.status])}><SelectValue /></SelectTrigger>
                                <SelectContent>{(["NOT STARTED","IN PROGRESS","COMPLETE","BLOCKED"] as TaskStatus[]).map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                              </Select>
                            </td>
                            <td className="px-2 py-1.5">
                              <Input type="date" className="h-7 text-xs" value={s.date} onChange={(e) => update(it.n, { date: e.target.value })} />
                            </td>
                            <td className="px-2 py-1.5">
                              <Input className="h-7 text-xs" value={s.facilitator} onChange={(e) => update(it.n, { facilitator: e.target.value })} placeholder="Name…" />
                            </td>
                            {(["teach","practice","observe"] as const).map((k) => (
                              <td key={k} className="px-1 py-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => update(it.n, { [k]: !s[k] } as Partial<ItemState>)}
                                  className={cn(
                                    "inline-flex items-center justify-center h-7 w-7 rounded-md border-2 text-sm font-bold transition-colors",
                                    s[k]
                                      ? "bg-success/20 text-success border-success/50 hover:bg-success/30"
                                      : "bg-destructive/15 text-destructive border-destructive/40 hover:bg-destructive/25"
                                  )}
                                  title={s[k] ? "Done — click to undo" : "Not done — click to mark done"}
                                >
                                  {s[k] ? "✓" : "✗"}
                                </button>
                              </td>
                            ))}
                            <td className="px-2 py-1.5 text-center">
                              <span className={cn(
                                "inline-flex items-center justify-center h-7 w-full rounded border text-[11px] font-bold",
                                allDone
                                  ? "bg-primary/15 text-primary border-primary/40"
                                  : "bg-muted text-muted-foreground border-border"
                              )}>
                                {allDone ? "✓ Signed Off" : "⏳ Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {mod.holdpoint && (
            <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive">
              {mod.holdpoint}
            </div>
          )}
          {mod.email && (
            <div className="rounded-lg border border-primary/30 bg-primary-soft px-4 py-2 text-xs text-primary">
              {mod.email}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
