import { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { PhaseBanner } from "@/components/workbench/PhaseBanner";
import { CoverSection, MissionControlSection } from "@/components/workbench/sections/CoverMission";
import { TimelineSection, ImplementationPlanSection, Phase3Section, Phase4Section, TrainingScheduleSection } from "@/components/workbench/sections/Phases";
import { SessionRegisterSection, AttendanceSection, SignOffSection, EmailLogSection, IssuesSection, StakeholdersSection, ChampionsSection, DefinitionOfDoneSection, IntranetSection, ContentLogSection, UserAccountsSection, ProjectDetailsSection, ContractorsSection, CostCodesSection, PostImplementationEmailSection, TemplatesLibrarySection, TasksRegisterSection } from "@/components/workbench/sections/Registers";
import { GanttSection } from "@/components/workbench/sections/Gantt";
import { cn } from "@/lib/utils";
import type { PhaseId } from "@/lib/playbook-data";
import { ensureOrganizationUUID, usePlaybook } from "@/lib/playbook-store";

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

export function Workbench() {
  const [tab, setTab] = useState<TabId>("mission");
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | null>(null);

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
    const apiBase = (window as any).apiBase as string | undefined;
    const playbookUrl = (window as any).playbookUrl as string | undefined;
    // Only attempt hydrate when we have an API base or an explicit URL
    if (apiBase || playbookUrl) {
      usePlaybook.getState().hydrateFromApi(playbookUrl).then(async () => {
        // After hydrate completes, fetch the table mappings
        await usePlaybook.getState().fetchTables();
        // Then sync client data from playbook_client table
        await usePlaybook.getState().syncClientFromTable();
      });
    }
  }, []);

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
  const key = "plexa-playbook-v2";
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeSnapshot = (raw: string | null) => {
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed?.state ?? parsed);
    } catch {
      return raw;
    }
  };

  const serializeState = () => {
    try {
      return JSON.stringify(usePlaybook.getState());
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const persisted = normalizeSnapshot(localStorage.getItem(key));
    const initial = serializeState();
    setLastSaved(persisted ?? initial);
    setCurrent(initial);

    const onStorage = () => {
      const persistedNow = normalizeSnapshot(localStorage.getItem(key));
      setCurrent(persistedNow ?? serializeState());
    };
    window.addEventListener("storage", onStorage);

    const onHydrated = () => {
      const persistedNow = normalizeSnapshot(localStorage.getItem(key));
      const currentNow = serializeState();
      setLastSaved(persistedNow ?? currentNow);
      setCurrent(currentNow);
    };
    window.addEventListener("playbook:hydrated", onHydrated as EventListener);

    const unsub = usePlaybook.subscribe(() => {
      const next = serializeState();
      if (next !== null) setCurrent(next);
    });

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("playbook:hydrated", onHydrated as EventListener);
      unsub();
    };
  }, []);

  const isDraft = current !== lastSaved && current !== null;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      // Commit notes before we serialize and send save payload.
      try {
        usePlaybook.getState().commitAllNotes("You");
      } catch (e) {
        // ignore commit failures
      }
      const apiBase = (window as any).apiBase as string | undefined;
      const token = (window as any).authToken as string | undefined;
      if (!apiBase) throw new Error("No apiBase configured on window.apiBase");
      const org = await ensureOrganizationUUID(apiBase, token);
      if (!org) throw new Error("Organization UUID not available");

      const currentState = usePlaybook.getState();
      const body = { data: { state: currentState } };
      console.log('body to save', body);
      const url = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}/custom-data/customers_playbook_v1`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const normalized = normalizeSnapshot(JSON.stringify(currentState));
      setLastSaved(normalized);
      setCurrent(normalized);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-muted-foreground hidden md:flex items-center gap-3">
        <div className={"text-[10px] font-semibold uppercase tracking-wider " + (isDraft ? "text-warning" : "text-muted-foreground")}>
          {isDraft ? "DRAFT" : "Saved"}
        </div>
        {isDraft && (
          <button disabled={saving} onClick={handleSave} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
        {error && <div className="text-[11px] text-destructive">{error}</div>}
      </div>
      <div className="text-xs text-muted-foreground hidden md:block">Version 3.0 · Building better, together</div>
    </div>
  );
}
