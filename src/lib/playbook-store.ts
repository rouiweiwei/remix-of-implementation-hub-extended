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

export type TimelineMode = "Quick (4 Weeks)" | "Medium (6 Weeks)" | "Enterprise (8 Weeks)" | "Complex (12 Weeks)";

export interface ClientInfo {
  clientName: string;
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

export interface Session {
  id: string;
  type: "Workshop" | "Training";
  topic: string;
  date: string;
  duration: string;
  attendees: number;
  status: "Scheduled" | "Held" | "Cancelled";
}

export interface Attendee {
  id: string;
  sessionId: string;
  name: string;
  status: "Present" | "Absent" | "Rescheduled";
}

export interface SignOff {
  id: string;
  person: string;
  module: string;
  status: TaskStatus;
  date: string;
}

export interface EmailLog {
  id: string;
  week: number;
  date: string;
  recipients: string;
  status: "Green" | "Amber" | "Red";
  summary: string;
  sent: boolean;
}

export interface Issue {
  id: string;
  phase: string;
  type: "🐛 Bug" | "👤 User Error" | "✨ Feature" | "⚙️ Config" | "🔗 Integration" | "📋 Process Gap" | "🎓 Training Gap" | "❓ Question" | "📦 Data";
  description: string;
  owner: "PLEXA" | "CLIENT";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  raisedAt: string;
  status: "Open" | "In Progress" | "Closed";
  resolution: string;
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

interface PlaybookState {
  client: ClientInfo;
  tasks: Task[];
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

  // actions
  setClient: (c: Partial<ClientInfo>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskNotes: (id: string, notes: string) => void;
  setTimeline: (mode: TimelineMode, startDate: string) => void;
  updateModule: (id: string, patch: Partial<TrainingModuleState>) => void;

  addSession: (s: Omit<Session, "id">) => void;
  updateSession: (id: string, patch: Partial<Session>) => void;
  deleteSession: (id: string) => void;

  addAttendee: (a: Omit<Attendee, "id">) => void;
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

  resetAll: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const initial = {
  client: {
    clientName: "Total Project Australia Pty Ltd",
    plexaLead: "Travis, Tony & Ayman",
    clientLead: "Travis, Bec, Lindsay & Phil",
    goLiveDate: "2026-06-30",
    accountManager: "Christian Lowe",
  } as ClientInfo,
  tasks: SEED_TASKS,
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
    recipients: "CEO, CFO, IT Lead, Site Teams, Ops",
    status: "Green" as const,
    summary: "",
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
};

export const usePlaybook = create<PlaybookState>()(
  persist(
    (set) => ({
      ...initial,
      setClient: (c) => set((s) => ({ client: { ...s.client, ...c } })),
      updateTaskStatus: (id, status) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),
      updateTaskNotes: (id, notes) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, notes } : t)) })),
      setTimeline: (timelineMode, startDate) => set({ timelineMode, startDate }),
      updateModule: (id, patch) =>
        set((s) => ({ trainingModules: s.trainingModules.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

      addSession: (s) => set((st) => ({ sessions: [...st.sessions, { id: uid(), ...s }] })),
      updateSession: (id, patch) => set((st) => ({ sessions: st.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSession: (id) => set((st) => ({ sessions: st.sessions.filter((x) => x.id !== id), attendees: st.attendees.filter(a => a.sessionId !== id) })),

      addAttendee: (a) => set((st) => ({ attendees: [...st.attendees, { id: uid(), ...a }] })),
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

      resetAll: () => set(initial),
    }),
    { name: "plexa-playbook-v1" }
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

export function calcEndDate(startDate: string, mode: TimelineMode): string {
  const weeks = mode.startsWith("Quick") ? 4 : mode.startsWith("Medium") ? 6 : mode.startsWith("Enterprise") ? 8 : 12;
  const d = new Date(startDate);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

export { PHASES };
