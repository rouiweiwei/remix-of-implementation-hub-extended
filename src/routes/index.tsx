import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { PhaseBanner } from "@/components/workbench/PhaseBanner";
import { CoverSection, MissionControlSection } from "@/components/workbench/sections/CoverMission";
import { TimelineSection, ImplementationPlanSection, Phase3Section, Phase4Section, TrainingScheduleSection } from "@/components/workbench/sections/Phases";
import { SessionRegisterSection, AttendanceSection, SignOffSection, EmailLogSection, IssuesSection, StakeholdersSection, ChampionsSection, DefinitionOfDoneSection, IntranetSection, ContentLogSection, UserAccountsSection, ProjectDetailsSection, ContractorsSection, CostCodesSection, PostImplementationEmailSection, TemplatesLibrarySection, TasksRegisterSection } from "@/components/workbench/sections/Registers";
import { GanttSection } from "@/components/workbench/sections/Gantt";
import { cn } from "@/lib/utils";
import type { PhaseId } from "@/lib/playbook-data";
import { usePlaybook } from "@/lib/playbook-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plexa · Implementation Workbench" },
      { name: "description", content: "The definitive workbench for delivering a world-class Plexa implementation." },
    ],
  }),
  component: Workbench,
});

const NAV = [
  { id: "cover", label: "Cover", icon: "📖", group: "Overview" },
  { id: "mission", label: "Mission Control", icon: "🎯", group: "Overview" },
  { id: "timeline", label: "Timeline Planner", icon: "📆", group: "Overview" },
  { id: "gantt", label: "Day-by-Day Gantt", icon: "📊", group: "Overview" },
  { id: "plan", label: "Implementation Plan", icon: "🗺️", group: "Phases" },
  { id: "phase3", label: "Phase 3 — Workshops", icon: "🎯", group: "Phases" },
  { id: "phase4", label: "Phase 4 — Training", icon: "🏋️", group: "Phases" },
  { id: "schedule", label: "Training Schedule", icon: "🎓", group: "Phases" },
  { id: "users", label: "User Accounts", icon: "👤", group: "Data" },
  { id: "project", label: "Project Details", icon: "🏗️", group: "Data" },
  { id: "contractors", label: "Contractor Database", icon: "🔧", group: "Data" },
  { id: "costcodes", label: "Cost Codes", icon: "💷", group: "Data" },
  { id: "templates", label: "Templates Library", icon: "📁", group: "Data" },
  { id: "tasks", label: "Tasks & Reminders", icon: "🔔", group: "Registers" },
  { id: "sessions", label: "Session Register", icon: "📅", group: "Registers" },
  { id: "attendance", label: "Attendance", icon: "✅", group: "Registers" },
  { id: "signoff", label: "Training Sign-Off", icon: "🖊️", group: "Registers" },
  { id: "content", label: "Session Content Log", icon: "📚", group: "Registers" },
  { id: "email", label: "Weekly Email Log", icon: "📧", group: "Registers" },
  { id: "issues", label: "Queries Register", icon: "⚠️", group: "Registers" },
  { id: "stakeholders", label: "Stakeholder Map", icon: "👥", group: "People" },
  { id: "champions", label: "Champion Register", icon: "🏆", group: "People" },
  { id: "dod", label: "Definition of Done", icon: "📋", group: "Close-out" },
  { id: "intranet", label: "Client Intranet Pack", icon: "🌐", group: "Close-out" },
  { id: "handover", label: "Post-Impl Email", icon: "📨", group: "Close-out" },
] as const;

type TabId = (typeof NAV)[number]["id"];

function Workbench() {
  const [tab, setTab] = useState<TabId>("mission");
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | null>(null);
  const hydrationStatus = usePlaybook((s) => s.hydrationStatus);
  const hydrationMessage = usePlaybook((s) => s.hydrationMessage);
  const hydrateFromApi = usePlaybook((s) => s.hydrateFromApi);

  const groups = useMemo(() => Array.from(new Set(NAV.map((n) => n.group))), []);
  const activeGroup = NAV.find((n) => n.id === tab)?.group;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g, true]))
  );
  // Make sure the group containing the active tab is always open
  const isOpen = (g: string) => (g === activeGroup ? true : openGroups[g] !== false);
  const toggleGroup = (g: string) => setOpenGroups((prev) => ({ ...prev, [g]: !(prev[g] ?? true) }));

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.playbookUrl = '/'
    window.apiBase = "https://api.staging.plexapro.com";
    window.authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OGUwMThlNS1mZWY5LTQwMTEtYjFiMi1lZjI3OTZhYjlhMDIiLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwianRpIjoiY2QxNTEyNDUtNzI5Yi00MTJmLTllMjQtNTgwZTczYWUwYTEyIiwiaWF0IjoxNzgwMDEwNDI4LCJleHAiOjE3ODAwMzkyMjh9.MwEDdLoy9k0tF5pYqjQWPn2KkpD4HGY9oiSowy3H-OI";

    const apiBase = (window as any).apiBase as string | undefined;
    const playbookUrl = (window as any).playbookUrl as string | undefined;

    if (apiBase || playbookUrl) {
      void hydrateFromApi(playbookUrl);
    }
  }, [hydrateFromApi]);

  if (hydrationStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-destructive/5 p-8 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">We could not load the data</h2>
          <p className="mt-2 text-sm text-muted-foreground">{hydrationMessage || "The API sync did not return the expected data. Please try again later."}</p>
          <button
            type="button"
            onClick={() => void hydrateFromApi((window as any).playbookUrl as string | undefined)}
            className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (hydrationStatus !== "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
        <div className="max-w-md rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <h2 className="text-xl font-semibold tracking-tight">Loading your implementation data…</h2>
          <p className="mt-2 text-sm text-muted-foreground">We are syncing the latest response from the API before the workbench renders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="w-full flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">P</div>
            <div>
              <div className="font-bold tracking-tight leading-none">Plexa</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mt-0.5">Implementation Workbench</div>
            </div>
          </div>
          <HeaderSave />
        </div>
      </header>

      <div className="w-full px-6 py-6">
        <PhaseBanner
          activePhase={phaseFilter}
          onPickPhase={(p) => { setPhaseFilter(p); setTab("plan"); }}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="lg:sticky lg:top-20 self-start space-y-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            {groups.map((g) => {
              const open = isOpen(g);
              const items = NAV.filter((n) => n.group === g);
              return (
                <div key={g}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(g)}
                    className="w-full flex items-center justify-between gap-2 px-2 mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                    aria-expanded={open}
                  >
                    <span>{g}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} />
                  </button>
                  {open && (
                    <nav className="space-y-0.5">
                      {items.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { setTab(n.id); if (n.id !== "plan") setPhaseFilter(null); }}
                          className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-left transition-colors",
                            tab === n.id ? "bg-primary-soft text-primary font-semibold" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <span className="text-base leading-none">{n.icon}</span>
                          <span className="truncate">{n.label}</span>
                        </button>
                      ))}
                    </nav>
                  )}
                </div>
              );
            })}
          </aside>

          <main className="min-w-0">
            {tab === "cover" && <CoverSection />}
            {tab === "mission" && <MissionControlSection />}
            {tab === "timeline" && <TimelineSection />}
            {tab === "gantt" && <GanttSection />}
            {tab === "plan" && <ImplementationPlanSection filterPhase={phaseFilter} />}
            {tab === "phase3" && <Phase3Section />}
            {tab === "phase4" && <Phase4Section />}
            {tab === "schedule" && <TrainingScheduleSection />}
            {tab === "tasks" && <TasksRegisterSection />}
            {tab === "sessions" && <SessionRegisterSection />}
            {tab === "attendance" && <AttendanceSection />}
            {tab === "signoff" && <SignOffSection />}
            {tab === "content" && <ContentLogSection />}
            {tab === "email" && <EmailLogSection />}
            {tab === "issues" && <IssuesSection />}
            {tab === "stakeholders" && <StakeholdersSection />}
            {tab === "champions" && <ChampionsSection />}
            {tab === "dod" && <DefinitionOfDoneSection />}
            {tab === "intranet" && <IntranetSection />}
            {tab === "users" && <UserAccountsSection />}
            {tab === "project" && <ProjectDetailsSection />}
            {tab === "contractors" && <ContractorsSection />}
            {tab === "costcodes" && <CostCodesSection />}
            {tab === "templates" && <TemplatesLibrarySection />}
            {tab === "handover" && <PostImplementationEmailSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

function HeaderSave() {
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-muted-foreground hidden md:flex items-center gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">API Synced</div>
      </div>
      <div className="text-xs text-muted-foreground hidden md:block">Version 3.0 · Building better, together</div>
    </div>
  );
}
