import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/playbook-data";

export function StatusBadge({ status, className }: { status: TaskStatus | string; className?: string }) {
  const map: Record<string, string> = {
    "COMPLETE": "bg-success/15 text-success border-success/30",
    "IN PROGRESS": "bg-primary/15 text-primary border-primary/30",
    "NOT STARTED": "bg-muted text-muted-foreground border-border",
    "BLOCKED": "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", map[status] || map["NOT STARTED"], className)}>
      {status}
    </span>
  );
}

export function SectionHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function MetricCard({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "brand" | "success" | "warning" | "danger" }) {
  const toneCls: Record<string, string> = {
    brand: "text-primary",
    success: "text-success",
    warning: "text-warning-foreground",
    danger: "text-destructive",
  };
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold tabular-nums", tone && toneCls[tone])}>{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
