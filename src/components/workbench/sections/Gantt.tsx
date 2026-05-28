import { useMemo, useState } from "react";
import {
  usePlaybook,
  computeSchedule,
  calcEndDate,
  type ScheduledTask,
} from "@/lib/playbook-store";
import { type TaskStatus } from "@/lib/playbook-data";
import { SectionHeader } from "../shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calendar, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

type Zoom = "day" | "week" | "month";

const STATUS_BAR: Record<TaskStatus, string> = {
  "NOT STARTED": "bg-muted-foreground/40 border-muted-foreground/60",
  "IN PROGRESS": "bg-primary/70 border-primary",
  "COMPLETE": "bg-success/70 border-success",
  "BLOCKED": "bg-destructive/70 border-destructive",
};

const PHASE_COLOR: Record<string, string> = {
  "1A": "bg-blue-500/80",
  "1B": "bg-blue-500/80",
  "1C": "bg-blue-500/80",
  "2A": "bg-purple-500/80",
  "2B": "bg-purple-500/80",
  "2C": "bg-purple-500/80",
  "3": "bg-amber-500/80",
  "4": "bg-emerald-500/80",
};

function parseISO(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function diffDays(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86400000);
}
function isSameDay(a: Date, b: Date) {
  return isoDay(a) === isoDay(b);
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function fmtLong(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

export function GanttSection() {
  const tasks = usePlaybook((s) => s.tasks);
  const phases = usePlaybook((s) => s.phases);
  const startDate = usePlaybook((s) => s.startDate);
  const mode = usePlaybook((s) => s.timelineMode);
  const overrides = usePlaybook((s) => s.taskOverrides);
  const setTaskSchedule = usePlaybook((s) => s.setTaskSchedule);

  const [zoom, setZoom] = useState<Zoom>("week");
  const [phaseFilter, setPhaseFilter] = useState<string>("ALL");

  const scheduled = useMemo(
    () => computeSchedule(tasks, startDate, mode, overrides),
    [tasks, startDate, mode, overrides]
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const projectStart = parseISO(startDate);
  const projectEnd = parseISO(calcEndDate(startDate, mode));
  // Pad timeline a bit on each side
  const chartStart = new Date(projectStart);
  chartStart.setDate(chartStart.getDate() - 2);
  const chartEnd = new Date(projectEnd);
  chartEnd.setDate(chartEnd.getDate() + 4);
  const totalDays = Math.max(7, diffDays(chartStart, chartEnd) + 1);

  // Pixel width per day depending on zoom
  const dayPx = zoom === "day" ? 56 : zoom === "week" ? 18 : 6;
  const chartWidth = totalDays * dayPx;

  // Build header tick marks
  const dayCells = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const filtered = phaseFilter === "ALL"
    ? scheduled
    : scheduled.filter((s) => s.task.phase === phaseFilter);
  const phaseList = phases.length ? phases : [];

  const grouped = phaseList.map((p) => ({
    phase: p,
    rows: filtered.filter((r) => r.task.phase === p.id),
  })).filter((g) => g.rows.length);
  console.log('grouped', grouped)
  // "Today" focus
  const todaysTasks = scheduled.filter((s) => {
    const st = parseISO(s.start);
    const en = parseISO(s.end);
    return today >= st && today <= en;
  });
  const overdue = scheduled.filter(
    (s) => parseISO(s.end) < today && s.task.status !== "COMPLETE"
  );
  const upcomingWeek = scheduled.filter((s) => {
    const st = parseISO(s.start);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    return st >= today && st <= in7 && s.task.status !== "COMPLETE";
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="📊 Day-by-Day Gantt"
        subtitle="Auto-deadlined from the Timeline Planner. Every task scheduled — switch zoom, override dates, see exactly what's due today."
      />

      {/* Today focus panel */}
      <div className="grid gap-3 md:grid-cols-3">
        <TodayCard
          tone="brand"
          title="Active today"
          count={todaysTasks.length}
          subtitle={fmtLong(today)}
          rows={todaysTasks.slice(0, 6)}
        />
        <TodayCard
          tone="danger"
          title="Overdue"
          count={overdue.length}
          subtitle="Past deadline & not complete"
          rows={overdue.slice(0, 6)}
        />
        <TodayCard
          tone="warning"
          title="Next 7 days"
          count={upcomingWeek.length}
          subtitle="Starting in the coming week"
          rows={upcomingWeek.slice(0, 6)}
        />
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border bg-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/40">
          {(["day", "week", "month"] as Zoom[]).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors",
                zoom === z ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {z}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phase</Label>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            <option value="ALL">All phases</option>
            {phaseList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.short}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/70" />In progress</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success/70" />Complete</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40" />Not started</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive/70" />Blocked</span>
        </div>
      </div>

      {/* Gantt chart */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[320px_1fr]">
          {/* Left task list header */}
          <div className="border-r bg-muted/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b">
            Task
          </div>
          {/* Right scrollable timeline header + body */}
          <div className="overflow-x-auto">
            <div style={{ width: chartWidth }}>
              <TimelineHeader cells={dayCells} dayPx={dayPx} zoom={zoom} today={today} />
            </div>
          </div>

          {/* Body */}
          <div className="border-r divide-y">
            {grouped.map(({ phase, rows }) => (
              <div key={phase.id}>
                <div className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white", PHASE_COLOR[phase.id] || "bg-primary")}>
                  ▸ {phase.name} — {phase.short}
                </div>
                {rows.map((r) => (
                  <TaskRowLabel key={r.task.id} row={r} />
                ))}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div style={{ width: chartWidth }} className="relative">
              {grouped.map(({ phase, rows }) => (
                <div key={phase.id}>
                  <div className="h-7 border-b bg-muted/20" />
                  {rows.map((r) => (
                    <TaskRowBar
                      key={r.task.id}
                      row={r}
                      chartStart={chartStart}
                      dayPx={dayPx}
                      totalDays={totalDays}
                      today={today}
                      phaseColor={PHASE_COLOR[phase.id]}
                      onChange={(patch) => setTaskSchedule(r.task.id, patch)}
                      onReset={() => setTaskSchedule(r.task.id, null)}
                    />
                  ))}
                </div>
              ))}
              {/* Today vertical line */}
              {today >= chartStart && today <= chartEnd && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-destructive pointer-events-none"
                  style={{ left: diffDays(chartStart, today) * dayPx + dayPx / 2 }}
                >
                  <div className="absolute -top-0.5 -translate-x-1/2 left-0 rounded-sm bg-destructive text-destructive-foreground text-[9px] font-bold px-1 py-0.5 uppercase tracking-wider">
                    Today
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Default deadlines are spread evenly across each phase (business days, weekends excluded). Edit any task's start or end inline to override — overrides are highlighted and survive timeline mode changes. Reset to auto with the <RotateCcw className="inline h-3 w-3" /> button.
      </p>
    </div>
  );
}

function TodayCard({
  tone,
  title,
  count,
  subtitle,
  rows,
}: {
  tone: "brand" | "danger" | "warning";
  title: string;
  count: number;
  subtitle: string;
  rows: ScheduledTask[];
}) {
  const toneCls =
    tone === "brand"
      ? "border-primary/30 bg-primary-soft"
      : tone === "danger"
      ? "border-destructive/30 bg-destructive/5"
      : "border-warning/40 bg-warning/10";
  const numCls =
    tone === "brand" ? "text-primary" : tone === "danger" ? "text-destructive" : "text-warning-foreground";
  return (
    <div className={cn("rounded-xl border p-4", toneCls)}>
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</div>
        <div className={cn("text-3xl font-bold tabular-nums", numCls)}>{count}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
      <ul className="mt-3 space-y-1.5">
        {rows.length === 0 ? (
          <li className="text-xs text-muted-foreground italic">Nothing here — good.</li>
        ) : (
          rows.map((r) => (
            <li key={r.task.id} className="text-xs flex items-start gap-2">
              <span className="font-mono text-muted-foreground">{r.task.id}</span>
              <span className="flex-1 truncate" title={r.task.title}>{r.task.title}</span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{fmtShort(parseISO(r.end))}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function TimelineHeader({
  cells,
  dayPx,
  zoom,
  today,
}: {
  cells: Date[];
  dayPx: number;
  zoom: Zoom;
  today: Date;
}) {
  // Month band + day/week ticks
  const monthBands: { label: string; start: number; width: number }[] = [];
  let cursor = 0;
  cells.forEach((d, i) => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const last = monthBands[monthBands.length - 1];
    if (!last || last.label !== key) {
      if (last) last.width = (i - cursor) * dayPx;
      cursor = i;
      monthBands.push({
        label: key,
        start: i * dayPx,
        width: (cells.length - i) * dayPx,
      });
    }
  });

  return (
    <div className="border-b">
      <div className="flex h-6 bg-muted/30 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {monthBands.map((b) => {
          const [y, m] = b.label.split("-").map(Number);
          const d = new Date(y, m, 1);
          return (
            <div
              key={b.label}
              style={{ width: b.width }}
              className="border-r flex items-center px-2 truncate"
            >
              {d.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </div>
          );
        })}
      </div>
      <div className="flex h-7">
        {cells.map((d, i) => {
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const isMonday = d.getDay() === 1;
          const today0 = isSameDay(d, today);
          const showLabel =
            zoom === "day"
              ? true
              : zoom === "week"
              ? isMonday
              : d.getDate() === 1;
          return (
            <div
              key={i}
              style={{ width: dayPx }}
              className={cn(
                "border-r text-[9px] flex flex-col items-center justify-center",
                isWeekend ? "bg-muted/40 text-muted-foreground/60" : "bg-background",
                today0 && "bg-destructive/10 font-bold text-destructive"
              )}
            >
              {showLabel && (
                <>
                  <span>{d.getDate()}</span>
                  {zoom === "day" && (
                    <span className="text-[8px] uppercase">
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRowLabel({ row }: { row: ScheduledTask }) {
  return (
    <div className="h-9 px-3 flex items-center gap-2 border-b">
      <span className="text-[10px] font-mono text-muted-foreground w-10 flex-none">{row.task.id}</span>
      <span className="text-xs truncate flex-1" title={row.task.title}>{row.task.title}</span>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
        {row.task.owner === "PLEXA + CLIENT" ? "BOTH" : row.task.owner}
      </span>
    </div>
  );
}

function TaskRowBar({
  row,
  chartStart,
  dayPx,
  totalDays,
  today,
  phaseColor,
  onChange,
  onReset,
}: {
  row: ScheduledTask;
  chartStart: Date;
  dayPx: number;
  totalDays: number;
  today: Date;
  phaseColor?: string;
  onChange: (patch: { start?: string; end?: string }) => void;
  onReset: () => void;
}) {
  console.log('row', row)
  const [open, setOpen] = useState(false);
  const start = parseISO(row.start);
  const end = parseISO(row.end);
  const left = Math.max(0, diffDays(chartStart, start)) * dayPx;
  const width = Math.max(dayPx * 0.6, (diffDays(start, end) + 1) * dayPx - 2);
  const isOverdue = end < today && row.task.status !== "COMPLETE";

  const nudge = (days: number, edge: "start" | "end") => {
    const d = edge === "start" ? new Date(start) : new Date(end);
    d.setDate(d.getDate() + days);
    onChange({ [edge]: isoDay(d) });
  };

  return (
    <div className="h-9 relative border-b">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "absolute top-1.5 h-6 rounded-md border-l-4 px-2 flex items-center text-[10px] font-semibold text-white truncate hover:ring-2 hover:ring-primary/40 transition-all",
          STATUS_BAR[row.task.status],
          phaseColor && row.task.status === "NOT STARTED" && cn("opacity-80", phaseColor),
          row.isOverride && "ring-1 ring-amber-400",
          isOverdue && "ring-2 ring-destructive"
        )}
        style={{ left, width }}
        title={`${row.task.id} · ${row.task.title}\n${fmtLong(start)} → ${fmtLong(end)}`}
      >
        <span className="truncate">{row.task.id}</span>
      </button>
      {open && (
        <div className="absolute z-20 top-9 left-2 rounded-lg border bg-popover shadow-lg p-3 w-[320px] text-xs space-y-2">
          <div className="font-semibold text-sm">{row.task.title}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {row.task.id} · {row.task.owner} · {row.task.status}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Start</Label>
              <div className="flex items-center gap-1 mt-1">
                <button onClick={() => nudge(-1, "start")} className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted"><ChevronLeft className="h-3 w-3" /></button>
                <Input type="date" value={row.start} onChange={(e) => onChange({ start: e.target.value })} className="h-7 text-xs flex-1" />
                <button onClick={() => nudge(1, "start")} className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted"><ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Deadline</Label>
              <div className="flex items-center gap-1 mt-1">
                <button onClick={() => nudge(-1, "end")} className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted"><ChevronLeft className="h-3 w-3" /></button>
                <Input type="date" value={row.end} onChange={(e) => onChange({ end: e.target.value })} className="h-7 text-xs flex-1" />
                <button onClick={() => nudge(1, "end")} className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted"><ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {diffDays(start, end) + 1} day{diffDays(start, end) + 1 === 1 ? "" : "s"}
              {row.isOverride && <span className="ml-1 text-amber-600 font-semibold">· override</span>}
            </span>
            <div className="flex items-center gap-2">
              {row.isOverride && (
                <button onClick={onReset} className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-3 w-3" /> Reset to auto
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-[10px] font-semibold text-primary hover:underline">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
