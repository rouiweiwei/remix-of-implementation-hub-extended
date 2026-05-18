import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PhaseBanner } from "@/components/workbench/PhaseBanner";
import { CoverSection, MissionControlSection } from "@/components/workbench/sections/CoverMission";
import { TimelineSection, ImplementationPlanSection, Phase3Section, Phase4Section, TrainingScheduleSection } from "@/components/workbench/sections/Phases";
import { SessionRegisterSection, AttendanceSection, SignOffSection, EmailLogSection, IssuesSection, StakeholdersSection, ChampionsSection, DefinitionOfDoneSection, IntranetSection, ContentLogSection, UserAccountsSection, ProjectDetailsSection, ContractorsSection, CostCodesSection, PostImplementationEmailSection, TemplatesLibrarySection } from "@/components/workbench/sections/Registers";
import { cn } from "@/lib/utils";
import type { PhaseId } from "@/lib/playbook-data";

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
  { id: "plan", label: "Implementation Plan", icon: "🗺️", group: "Phases" },
  { id: "phase3", label: "Phase 3 — Workshops", icon: "🎯", group: "Phases" },
  { id: "phase4", label: "Phase 4 — Training", icon: "🏋️", group: "Phases" },
  { id: "schedule", label: "Training Schedule", icon: "🎓", group: "Phases" },
  { id: "users", label: "User Accounts", icon: "👤", group: "Data" },
  { id: "project", label: "Project Details", icon: "🏗️", group: "Data" },
  { id: "contractors", label: "Contractor Database", icon: "🔧", group: "Data" },
  { id: "costcodes", label: "Cost Codes", icon: "💷", group: "Data" },
  { id: "templates", label: "Templates Library", icon: "📁", group: "Data" },
  { id: "sessions", label: "Session Register", icon: "📅", group: "Registers" },
  { id: "attendance", label: "Attendance", icon: "✅", group: "Registers" },
  { id: "signoff", label: "Training Sign-Off", icon: "🖊️", group: "Registers" },
  { id: "content", label: "Session Content Log", icon: "📚", group: "Registers" },
  { id: "email", label: "Weekly Email Log", icon: "📧", group: "Registers" },
  { id: "issues", label: "Issues Register", icon: "⚠️", group: "Registers" },
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

  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">P</div>
            <div>
              <div className="font-bold tracking-tight leading-none">Plexa</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mt-0.5">Implementation Workbench</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden md:block">Version 3.0 · Building better, together</div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <PhaseBanner
          activePhase={phaseFilter}
          onPickPhase={(p) => { setPhaseFilter(p); setTab("plan"); }}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="lg:sticky lg:top-20 self-start space-y-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            {groups.map((g) => (
              <div key={g}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground px-2 mb-1">{g}</div>
                <nav className="space-y-0.5">
                  {NAV.filter((n) => n.group === g).map((n) => (
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
              </div>
            ))}
          </aside>

          <main className="min-w-0">
            {tab === "cover" && <CoverSection />}
            {tab === "mission" && <MissionControlSection />}
            {tab === "timeline" && <TimelineSection />}
            {tab === "plan" && <ImplementationPlanSection filterPhase={phaseFilter} />}
            {tab === "phase3" && <Phase3Section />}
            {tab === "phase4" && <Phase4Section />}
            {tab === "schedule" && <TrainingScheduleSection />}
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
