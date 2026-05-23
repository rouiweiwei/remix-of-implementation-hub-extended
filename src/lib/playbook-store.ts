import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_TASKS,
  TRAINING_MODULES,
  DOD_CRITERIA,
  STAKEHOLDER_SEEDS,
  type Task,
  type TaskStatus,
  type PhaseId,
  PHASES,
} from "./playbook-data";

export type TimelineMode =
  | "Quick (4 Weeks)"
  | "Medium (6 Weeks)"
  | "Enterprise (8 Weeks)"
  | "Extended (10 Weeks)"
  | "Complex (12 Weeks)"
  | "Strategic (14 Weeks)"
  | "Transformational (16 Weeks)";

export interface ClientInfo {
  clientName: string;
  /** comma-separated list of users — rendered as chips */
  plexaLead: string;
  clientLead: string;
  goLiveDate: string;
  accountManager: string;
}

export interface TrainingModuleState {
  id: string;
  name: string;
  teach: TaskStatus;
  practice: TaskStatus;
  observe: TaskStatus;
  signedOffBy: string;
  signOffDate: string;
}

export type SessionStatus = "Scheduled" | "In Progress" | "Completed" | "Blocked";

export interface Session {
  id: string;
  type: "Workshop" | "Training";
  topic: string;
  module: string;
  date: string;
  duration: string;
  facilitator: string;
  location: string;
  status: SessionStatus;
}

export interface Attendee {
  id: string;
  sessionId: string;
  name: string;
  jobTitle: string;
  company: string;
  signature: string;
  status: "Present" | "Absent" | "Rescheduled";
}

export interface SignOff {
  id: string;
  person: string;
  jobTitle: string;
  module: string;
  competency: "Novice" | "Capable" | "Proficient" | "Expert";
  status: TaskStatus;
  signedBy: string;
  date: string;
}

export interface EmailLog {
  id: string;
  week: number;
  date: string;
  subject: string;
  recipients: string;
  status: "Green" | "Amber" | "Red";
  summary: string;
  highlights: string;
  blockers: string;
  sent: boolean;
}

export interface Issue {
  id: string;
  ref: string;
  phase: string;
  type: "🐛 Bug" | "👤 User Error" | "✨ Feature" | "⚙️ Config" | "🔗 Integration" | "📋 Process Gap" | "🎓 Training Gap" | "❓ Question" | "📦 Data";
  description: string;
  owner: "PLEXA" | "CLIENT";
  assignedTo: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  raisedAt: string;
  dueDate: string;
  status: "Open" | "In Progress" | "Closed";
  resolution: string;
  closedDate: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  dept: string;
  influence: "Low" | "Medium" | "High";
  email: string;
  phone: string;
  sentiment: "Negative" | "Neutral" | "Positive" | "Unknown";
  lastTouch: string;
}

export interface Champion {
  id: string;
  name: string;
  title: string;
  dept: string;
  modules: string;
  status: "Identified" | "In Training" | "Certified";
}

export interface ResistantUser {
  id: string;
  name: string;
  title: string;
  type: string;
  why: string;
  strategy: string;
  status: "High Risk" | "Engaging" | "Converted";
}

export interface DodItem {
  id: number;
  cat: string;
  text: string;
  confirmed: boolean;
  by: string;
  date: string;
}

export interface NoteHistoryEntry {
  at: string;
  by: string;
  text: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  role: string;
  status: "Pending" | "Invited" | "Active" | "Disabled";
}

export interface ProjectDetail {
  id: string;
  code: string;
  name: string;
  type: string;
  client: string;
  pm: string;
  startDate: string;
  endDate: string;
  value: string;
  status: "Tender" | "Awarded" | "Live" | "Complete" | "Archived";
}

export interface Contractor {
  id: string;
  company: string;
  trade: string;
  contact: string;
  email: string;
  phone: string;
  insurance: string;
  abn: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface CostCode {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  rate: string;
  notes: string;
}

export interface TaskScheduleOverride {
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD (inclusive)
}

export type ReminderPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ReminderStatus = "OPEN" | "IN PROGRESS" | "DONE";

export interface ReminderTask {
  id: string;
  title: string;
  details: string;
  assignee: string;        // free-text name (or pick from directory)
  dueDate: string;         // YYYY-MM-DD
  remindAt: string;        // YYYY-MM-DD — when to surface on dashboard
  priority: ReminderPriority;
  status: ReminderStatus;
  createdAt: string;       // ISO
  completedAt?: string;    // ISO
}

interface PlaybookState {
  client: ClientInfo;
  tasks: Task[];
  noteHistory: Record<string, NoteHistoryEntry[]>;
  taskOverrides: Record<string, TaskScheduleOverride>;
  timelineMode: TimelineMode;
  startDate: string;
  trainingModules: TrainingModuleState[];
  sessions: Session[];
  attendees: Attendee[];
  signOffs: SignOff[];
  emails: EmailLog[];
  issues: Issue[];
  stakeholders: Stakeholder[];
  champions: Champion[];
  resistantUsers: ResistantUser[];
  dod: DodItem[];
  userAccounts: UserAccount[];
  projectDetails: ProjectDetail[];
  contractors: Contractor[];
  costCodes: CostCode[];
  reminderTasks: ReminderTask[];

  // actions
  setClient: (c: Partial<ClientInfo>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskNotes: (id: string, notes: string, by?: string) => void;
  setTaskSchedule: (id: string, patch: TaskScheduleOverride | null) => void;
  setTimeline: (mode: TimelineMode, startDate: string) => void;
  updateModule: (id: string, patch: Partial<TrainingModuleState>) => void;

  addSession: (s: Omit<Session, "id">) => void;
  updateSession: (id: string, patch: Partial<Session>) => void;
  deleteSession: (id: string) => void;

  addAttendee: (a: Omit<Attendee, "id">) => void;
  updateAttendee: (id: string, patch: Partial<Attendee>) => void;
  deleteAttendee: (id: string) => void;

  addSignOff: (s: Omit<SignOff, "id">) => void;
  updateSignOff: (id: string, patch: Partial<SignOff>) => void;
  deleteSignOff: (id: string) => void;

  addEmail: (e: Omit<EmailLog, "id">) => void;
  updateEmail: (id: string, patch: Partial<EmailLog>) => void;

  addIssue: (i: Omit<Issue, "id">) => void;
  updateIssue: (id: string, patch: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;

  addStakeholder: (s: Omit<Stakeholder, "id">) => void;
  updateStakeholder: (id: string, patch: Partial<Stakeholder>) => void;
  deleteStakeholder: (id: string) => void;

  addChampion: (c: Omit<Champion, "id">) => void;
  updateChampion: (id: string, patch: Partial<Champion>) => void;
  deleteChampion: (id: string) => void;

  addResistant: (r: Omit<ResistantUser, "id">) => void;
  updateResistant: (id: string, patch: Partial<ResistantUser>) => void;
  deleteResistant: (id: string) => void;

  toggleDod: (id: number, by: string) => void;

  addUser: (u: Omit<UserAccount, "id">) => void;
  updateUser: (id: string, patch: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  replaceUsers: (rows: UserAccount[]) => void;

  addProject: (p: Omit<ProjectDetail, "id">) => void;
  updateProject: (id: string, patch: Partial<ProjectDetail>) => void;
  deleteProject: (id: string) => void;
  replaceProjects: (rows: ProjectDetail[]) => void;

  addContractor: (c: Omit<Contractor, "id">) => void;
  updateContractor: (id: string, patch: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;
  replaceContractors: (rows: Contractor[]) => void;

  addCostCode: (c: Omit<CostCode, "id">) => void;
  updateCostCode: (id: string, patch: Partial<CostCode>) => void;
  deleteCostCode: (id: string) => void;
  replaceCostCodes: (rows: CostCode[]) => void;

  addReminderTask: (r: Omit<ReminderTask, "id" | "createdAt">) => void;
  updateReminderTask: (id: string, patch: Partial<ReminderTask>) => void;
  deleteReminderTask: (id: string) => void;

  resetAll: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const initial = {
  client: {
    clientName: "Total Project Australia Pty Ltd",
    plexaLead: "Travis, Tony, Ayman",
    clientLead: "Travis, Bec, Lindsay, Phil",
    goLiveDate: "2026-06-30",
    accountManager: "Christian Lowe",
  } as ClientInfo,
  tasks: SEED_TASKS,
  noteHistory: {} as Record<string, NoteHistoryEntry[]>,
  taskOverrides: {} as Record<string, TaskScheduleOverride>,
  timelineMode: "Medium (6 Weeks)" as TimelineMode,
  startDate: new Date().toISOString().slice(0, 10),
  trainingModules: TRAINING_MODULES.map((m) => ({
    id: m.id,
    name: m.name,
    teach: "NOT STARTED" as TaskStatus,
    practice: "NOT STARTED" as TaskStatus,
    observe: "NOT STARTED" as TaskStatus,
    signedOffBy: "",
    signOffDate: "",
  })),
  sessions: [] as Session[],
  attendees: [] as Attendee[],
  signOffs: [] as SignOff[],
  emails: [1, 2, 3, 4, 5, 6].map((w) => ({
    id: uid(),
    week: w,
    date: "",
    subject: `Week ${w} — Plexa Implementation Update`,
    recipients: "CEO, CFO, IT Lead, Site Teams, Ops",
    status: "Green" as const,
    summary: "",
    highlights: "",
    blockers: "",
    sent: false,
  })),
  issues: [] as Issue[],
  stakeholders: STAKEHOLDER_SEEDS.map((s) => ({
    id: uid(),
    ...s,
    email: "",
    phone: "",
    lastTouch: "",
  })) as Stakeholder[],
  champions: [] as Champion[],
  resistantUsers: [] as ResistantUser[],
  dod: DOD_CRITERIA.map((c, i) => ({
    id: i + 1,
    cat: c.cat,
    text: c.text,
    confirmed: false,
    by: "",
    date: "",
  })) as DodItem[],
  userAccounts: [] as UserAccount[],
  projectDetails: [] as ProjectDetail[],
  contractors: [] as Contractor[],
  costCodes: [] as CostCode[],
  reminderTasks: [] as ReminderTask[],
};

export const usePlaybook = create<PlaybookState>()(
  persist(
    (set) => ({
      ...initial,
      setClient: (c) => set((s) => ({ client: { ...s.client, ...c } })),
      updateTaskStatus: (id, status) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),
      updateTaskNotes: (id, notes, by = "You") =>
        set((s) => {
          const prev = s.tasks.find((t) => t.id === id)?.notes || "";
          const history = { ...s.noteHistory };
          if (notes !== prev) {
            const entry: NoteHistoryEntry = { at: new Date().toISOString(), by, text: notes };
            history[id] = [entry, ...(history[id] || [])].slice(0, 20);
          }
          return {
            tasks: s.tasks.map((t) => (t.id === id ? { ...t, notes } : t)),
            noteHistory: history,
          };
        }),
      setTimeline: (timelineMode, startDate) => set({ timelineMode, startDate }),
      setTaskSchedule: (id, patch) =>
        set((s) => {
          const next = { ...s.taskOverrides };
          if (patch === null) {
            delete next[id];
          } else {
            next[id] = { ...next[id], ...patch };
          }
          return { taskOverrides: next };
        }),
      updateModule: (id, patch) =>
        set((s) => ({ trainingModules: s.trainingModules.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

      addSession: (s) => set((st) => ({ sessions: [...st.sessions, { id: uid(), ...s }] })),
      updateSession: (id, patch) => set((st) => ({ sessions: st.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSession: (id) => set((st) => ({ sessions: st.sessions.filter((x) => x.id !== id), attendees: st.attendees.filter(a => a.sessionId !== id) })),

      addAttendee: (a) => set((st) => ({ attendees: [...st.attendees, { id: uid(), ...a }] })),
      updateAttendee: (id, patch) => set((st) => ({ attendees: st.attendees.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteAttendee: (id) => set((st) => ({ attendees: st.attendees.filter((x) => x.id !== id) })),

      addSignOff: (s) => set((st) => ({ signOffs: [...st.signOffs, { id: uid(), ...s }] })),
      updateSignOff: (id, patch) => set((st) => ({ signOffs: st.signOffs.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSignOff: (id) => set((st) => ({ signOffs: st.signOffs.filter((x) => x.id !== id) })),

      addEmail: (e) => set((st) => ({ emails: [...st.emails, { id: uid(), ...e }] })),
      updateEmail: (id, patch) => set((st) => ({ emails: st.emails.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      addIssue: (i) => set((st) => ({ issues: [...st.issues, { id: uid(), ...i }] })),
      updateIssue: (id, patch) => set((st) => ({ issues: st.issues.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteIssue: (id) => set((st) => ({ issues: st.issues.filter((x) => x.id !== id) })),

      addStakeholder: (s) => set((st) => ({ stakeholders: [...st.stakeholders, { id: uid(), ...s }] })),
      updateStakeholder: (id, patch) => set((st) => ({ stakeholders: st.stakeholders.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteStakeholder: (id) => set((st) => ({ stakeholders: st.stakeholders.filter((x) => x.id !== id) })),

      addChampion: (c) => set((st) => ({ champions: [...st.champions, { id: uid(), ...c }] })),
      updateChampion: (id, patch) => set((st) => ({ champions: st.champions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteChampion: (id) => set((st) => ({ champions: st.champions.filter((x) => x.id !== id) })),

      addResistant: (r) => set((st) => ({ resistantUsers: [...st.resistantUsers, { id: uid(), ...r }] })),
      updateResistant: (id, patch) => set((st) => ({ resistantUsers: st.resistantUsers.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteResistant: (id) => set((st) => ({ resistantUsers: st.resistantUsers.filter((x) => x.id !== id) })),

      toggleDod: (id, by) =>
        set((s) => ({
          dod: s.dod.map((d) => (d.id === id ? { ...d, confirmed: !d.confirmed, by: !d.confirmed ? by || "Plexa" : "", date: !d.confirmed ? new Date().toISOString().slice(0, 10) : "" } : d)),
        })),

      addUser: (u) => set((st) => ({ userAccounts: [...st.userAccounts, { id: uid(), ...u }] })),
      updateUser: (id, patch) => set((st) => ({ userAccounts: st.userAccounts.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteUser: (id) => set((st) => ({ userAccounts: st.userAccounts.filter((x) => x.id !== id) })),
      replaceUsers: (rows) => set({ userAccounts: rows }),

      addProject: (p) => set((st) => ({ projectDetails: [...st.projectDetails, { id: uid(), ...p }] })),
      updateProject: (id, patch) => set((st) => ({ projectDetails: st.projectDetails.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteProject: (id) => set((st) => ({ projectDetails: st.projectDetails.filter((x) => x.id !== id) })),
      replaceProjects: (rows) => set({ projectDetails: rows }),

      addContractor: (c) => set((st) => ({ contractors: [...st.contractors, { id: uid(), ...c }] })),
      updateContractor: (id, patch) => set((st) => ({ contractors: st.contractors.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteContractor: (id) => set((st) => ({ contractors: st.contractors.filter((x) => x.id !== id) })),
      replaceContractors: (rows) => set({ contractors: rows }),

      addCostCode: (c) => set((st) => ({ costCodes: [...st.costCodes, { id: uid(), ...c }] })),
      updateCostCode: (id, patch) => set((st) => ({ costCodes: st.costCodes.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteCostCode: (id) => set((st) => ({ costCodes: st.costCodes.filter((x) => x.id !== id) })),
      replaceCostCodes: (rows) => set({ costCodes: rows }),

      resetAll: () => set(initial),
    }),
    { name: "plexa-playbook-v2" }
  )
);

// helpers
export function phaseProgress(tasks: Task[], phase: PhaseId) {
  const subset = tasks.filter((t) => t.phase === phase);
  const total = subset.length;
  const complete = subset.filter((t) => t.status === "COMPLETE").length;
  const inProgress = subset.filter((t) => t.status === "IN PROGRESS").length;
  const blocked = subset.filter((t) => t.status === "BLOCKED").length;
  let status: "NOT STARTED" | "IN PROGRESS" | "COMPLETE" | "BLOCKED" = "NOT STARTED";
  if (blocked > 0) status = "BLOCKED";
  else if (complete === total && total > 0) status = "COMPLETE";
  else if (complete > 0 || inProgress > 0) status = "IN PROGRESS";
  return { total, complete, inProgress, blocked, status, pct: total === 0 ? 0 : Math.round((complete / total) * 100) };
}

export function overallProgress(tasks: Task[]) {
  const total = tasks.length;
  const complete = tasks.filter((t) => t.status === "COMPLETE").length;
  const inProgress = tasks.filter((t) => t.status === "IN PROGRESS").length;
  const blocked = tasks.filter((t) => t.status === "BLOCKED").length;
  return { total, complete, inProgress, blocked, pct: total === 0 ? 0 : Math.round((complete / total) * 100) };
}

export function weeksForMode(mode: TimelineMode): number {
  const m = mode.match(/\d+/);
  return m ? parseInt(m[0], 10) : 6;
}

// Add N business days (skip Sat/Sun) to a date string (YYYY-MM-DD)
export function addBusinessDays(startDate: string, days: number): Date {
  const d = new Date(startDate);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

export function calcEndDate(startDate: string, mode: TimelineMode): string {
  const weeks = weeksForMode(mode);
  // 5 business days per week
  const end = addBusinessDays(startDate, weeks * 5);
  return end.toISOString().slice(0, 10);
}

export { PHASES };

// ─── Schedule computation ─────────────────────────────────────────────
// Auto-derive a start & end date for every task by spreading them evenly
// across their phase's date range. Overrides win.
export interface ScheduledTask {
  task: Task;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD (inclusive)
  isOverride: boolean;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function computeSchedule(
  tasks: Task[],
  startDate: string,
  mode: TimelineMode,
  overrides: Record<string, TaskScheduleOverride>
): ScheduledTask[] {
  const totalBizDays = weeksForMode(mode) * 5;
  const perPhase = Math.max(1, Math.floor(totalBizDays / PHASES.length));
  const phaseRanges: Record<string, { startOffset: number; endOffset: number }> = {};
  let cursor = 0;
  PHASES.forEach((p, i) => {
    const isLast = i === PHASES.length - 1;
    const endOffset = isLast ? totalBizDays : cursor + perPhase;
    phaseRanges[p.id] = { startOffset: cursor, endOffset };
    cursor = endOffset;
  });

  const result: ScheduledTask[] = [];
  PHASES.forEach((p) => {
    const phaseTasks = tasks.filter((t) => t.phase === p.id);
    const { startOffset, endOffset } = phaseRanges[p.id];
    const span = Math.max(1, endOffset - startOffset);
    const slot = Math.max(1, Math.floor(span / Math.max(1, phaseTasks.length)));
    phaseTasks.forEach((t, idx) => {
      const o = overrides[t.id];
      let start: string;
      let end: string;
      const taskStartOffset = startOffset + idx * slot;
      const taskEndOffset = idx === phaseTasks.length - 1
        ? endOffset
        : Math.min(endOffset, taskStartOffset + slot);
      const autoStart = taskStartOffset === 0
        ? new Date(startDate)
        : addBusinessDays(startDate, taskStartOffset);
      const autoEnd = addBusinessDays(startDate, Math.max(taskEndOffset - 1, taskStartOffset));
      start = o?.start || isoDay(autoStart);
      end = o?.end || isoDay(autoEnd);
      if (new Date(end) < new Date(start)) end = start;
      result.push({ task: t, start, end, isOverride: !!(o?.start || o?.end) });
    });
  });
  return result;
}
