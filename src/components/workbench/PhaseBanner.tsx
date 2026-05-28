import { type PhaseId } from "@/lib/playbook-data";
import { phaseProgress, usePlaybook, overallProgress } from "@/lib/playbook-store";
import { cn } from "@/lib/utils";
import { Check, CircleDashed, Loader2, OctagonAlert } from "lucide-react";

interface Props {
  activePhase?: PhaseId | null;
  onPickPhase?: (p: PhaseId) => void;
}

export function PhaseBanner({ activePhase, onPickPhase }: Props) {
  const tasks = usePlaybook((s) => s.tasks);
  const phases = usePlaybook((s) => s.phases);
  const client = usePlaybook((s) => s.client);
  const overall = overallProgress(tasks);
  const phaseList = phases.length ? phases : [];

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="relative p-6 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Implementation Workbench
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
              {client.clientName || "New Implementation"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Go-live target · {client.goLiveDate || "—"} · Plexa lead {client.plexaLead || "—"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Stat label="Tasks" value={`${overall.complete}/${overall.total}`} />
            <Stat label="In progress" value={overall.inProgress.toString()} />
            <Stat label="Blocked" value={overall.blocked.toString()} accent={overall.blocked > 0 ? "danger" : undefined} />
            <Stat label="Complete" value={`${overall.pct}%`} accent="brand" />
          </div>
        </div>

        <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
          {phaseList.map((p, i) => {
            const prog = phaseProgress(tasks, p.id);
            const isActive = activePhase === p.id;
            const isDone = prog.status === "COMPLETE";
            const isLive = prog.status === "IN PROGRESS";
            const isBlocked = prog.status === "BLOCKED";
            return (
              <button
                key={p.id}
                onClick={() => onPickPhase?.(p.id)}
                className={cn(
                  "group relative flex-1 min-w-[140px] rounded-xl border p-3 text-left transition-all",
                  "hover:border-primary/40 hover:shadow-sm",
                  isActive ? "border-primary ring-2 ring-primary/20 bg-primary-soft" : "border-border bg-background",
                  isDone && !isActive && "bg-success/5 border-success/30",
                  isBlocked && "border-destructive/40 bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {i + 1}
                  </span>
                  <PhaseIcon status={prog.status} />
                </div>
                <div className="mt-1 font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.short}</div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      isBlocked ? "bg-destructive" : isDone ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${prog.pct}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {prog.complete}/{prog.total} · {prog.pct}%
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PhaseIcon({ status }: { status: string }) {
  if (status === "COMPLETE") return <Check className="h-4 w-4 text-success" />;
  if (status === "IN PROGRESS") return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
  if (status === "BLOCKED") return <OctagonAlert className="h-4 w-4 text-destructive" />;
  return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "brand" | "danger" }) {
  return (
    <div className="text-right">
      <div
        className={cn(
          "text-2xl font-bold tabular-nums",
          accent === "brand" && "text-brand-gradient",
          accent === "danger" && "text-destructive"
        )}
      >
        {value}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
