import { create } from "zustand";
import {
  PLAYBOOK_TABLES,
  type PhaseId,
  type Task,
  type TaskStatus,
} from "./playbook-data";
import { normalizeTrainingScheduleRecords, type SchedModule } from "./training-schedule";

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
  /** comma-separated list of users â€” rendered as chips */
  plexaLead: string;
  clientLead: string;
  goLiveDate: string;
  accountManager: string;
  _id?: string; // optional Airtable record ID for syncing
}

export interface TrainingModuleState {
  id: string;
  _id?: string;
  name: string;
  teach: TaskStatus;
  practice: TaskStatus;
  observe: TaskStatus;
  signedOffBy: string;
  signOffDate: string;
}

export interface TrainingScheduleItemState {
  teach: boolean;
  practice: boolean;
  observe: boolean;
  owner: string;
  status: TaskStatus;
  date: string;
  facilitator: string;
}

export type SessionStatus = "Scheduled" | "In Progress" | "Completed" | "Blocked";

export interface Session {
  id: string;
  _id?: string;
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
  _id?: string;
  sessionId: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  attendance: "✅ Present" | "❌ Absent" | "📅 Rescheduled";
  signed: "⏳ Pending" | "✅ Signed" | "❌ Not Signed";
  notes: string;
}

export interface SignOff {
  id: string;
  _id?: string;
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
  _id?: string;
  week?: number;
  date?: string;
  subject?: string;
  recipients?: string;
  status?: "PENDING" | "DRAFTED" | "SENT" | "Green" | "Amber" | "Red";
  summary?: string;
  highlights?: string;
  blockers?: string;
  sent?: boolean;
  dateSent?: string;
  phase?: string;
  completed?: string;
  planned?: string;
  openIssues?: string;
  sentTo?: string;
}

export interface Issue {
  id: string;
  _id?: string;
  ref?: string;
  phase?: string;
  type?: string;
  description?: string;
  owner?: string;
  assignedTo?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  raisedAt?: string;
  dueDate?: string;
  status?: "Open" | "In Progress" | "Closed";
  resolution?: string;
  closedDate?: string;
  reportedBy?: string;
  archived?: boolean;
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

type NoteHistoryStatus = "idle" | "loading" | "ready" | "error";

interface SavedTaskSnapshot {
  status: TaskStatus;
  notes: string;
}

interface SavedTrainingModuleSnapshot {
  teach: TaskStatus;
  practice: TaskStatus;
  observe: TaskStatus;
  signedOffBy: string;
  signOffDate: string;
}

export interface UserAccount {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  role: string;
  department?: string;
  status: "Pending" | "Invited" | "Active" | "Disabled";
}

export interface ProjectDetail {
  id: string;
  _id?: string;
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
  _id?: string;
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
  _id?: string;
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
  _id?: string;
  title: string;
  details: string;
  assignee: string;        // free-text name (or pick from directory)
  dueDate: string;         // YYYY-MM-DD
  remindAt: string;        // YYYY-MM-DD â€” when to surface on dashboard
  priority: ReminderPriority;
  status: ReminderStatus;
  createdAt: string;       // ISO
  completedAt?: string;    // ISO
}

export type IntranetKind = "Recording" | "Quick-Start Guide" | "Resource";
export type IntranetStatus = "DRAFT" | "PUBLISHED";

export interface IntranetResource {
  id: string;
  kind: IntranetKind;
  title: string;
  module: string;        // e.g. "4A", "All", "Workshop"
  sessionId?: string;    // optional link to a Session/SessionDef id
  url: string;           // recording link / guide link
  format: string;        // e.g. "Video", "PDF", "Loom", "MP4", "Doc"
  duration: string;      // e.g. "42:10" or "5 pages"
  presenter: string;
  recordedOn: string;    // YYYY-MM-DD
  description: string;
  status: IntranetStatus;
  fileName?: string;     // attached file name
  fileType?: string;     // MIME type
  fileSize?: number;     // bytes
  fileData?: string;     // base64 data URL of attachment
}

export interface CommandmentsType {
  n: string;
  t: string;
  d: string;
}

export interface PhaseType {
  id: PhaseId;
  name: string;
  short: string;
  description: string;
}

export interface WorkshopStepType {
  step: number;
  title: string;
  duration: string;
  detail: string;
}

export interface ResistanceProfileType {
  type: string;
  why: string;
  strategy: string;
  outcome: string;
}

interface PlaybookState {
  client: ClientInfo;
  clientSaveStatus: "idle" | "saving" | "saved" | "error";
  hydrationStatus: "idle" | "loading" | "ready" | "error";
  hydrationMessage: string;
  phases: PhaseType[];
  tasks: Task[];
  noteHistory: Record<string, NoteHistoryEntry[]>;
  noteHistoryStatus: NoteHistoryStatus;
  // track last-saved notes per task so we only record history on explicit commits
  lastSavedNotes: Record<string, string>;
  lastSavedTaskSnapshots: Record<string, SavedTaskSnapshot>;
  taskOverrides: Record<string, TaskScheduleOverride>;
  timelineMode: TimelineMode;
  startDate: string;
  trainingModules: TrainingModuleState[];
  lastSavedTrainingModules: Record<string, SavedTrainingModuleSnapshot>;
  trainingSchedule: SchedModule[];
  trainingScheduleItems: Record<number, TrainingScheduleItemState>;
  trainingScheduleRecordIds: Record<number, string>;
  lastSavedTrainingScheduleItems: Record<number, TrainingScheduleItemState>;
  workshopSteps: WorkshopStepType[];
  resistanceProfiles: ResistanceProfileType[];
  commandments: CommandmentsType[];
  sessions: Session[];
  lastSavedSessions: Record<string, SavedSessionSnapshot>;
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
  intranet: IntranetResource[];
  tableMap: Record<string, string>; // map of table name -> table id for API lookups

  // actions
  setClient: (c: Partial<ClientInfo>) => void;
  updateClient: (patch: Partial<ClientInfo>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskNotes: (id: string, notes: string, by?: string) => void;
  saveImplementationPlan: (by?: string) => Promise<void>;
  syncNoteHistoryFromTable: () => Promise<void>;
  syncReminderTasksFromTable: () => Promise<void>;
  // commit note to history if changed since last saved
  commitNote: (id: string, by?: string) => void;
  // commit all notes that changed since last saved (used after global save)
  commitAllNotes: (by?: string) => void;
  setTaskSchedule: (id: string, patch: TaskScheduleOverride | null) => void;
  setTimeline: (mode: TimelineMode, startDate: string) => void;
  updateModule: (id: string, patch: Partial<TrainingModuleState>) => void;
  saveTrainingModules: () => Promise<void>;
  saveTrainingScheduleItems: (items: Record<number, TrainingScheduleItemState>) => Promise<void>;

  addSession: (s: Omit<Session, "id">) => void;
  updateSession: (id: string, patch: Partial<Session>) => void;
  deleteSession: (id: string) => Promise<void>;
  syncSessionsFromTable: () => Promise<void>;
  saveSessions: () => Promise<void>;
  saveSession: (id: string) => Promise<void>;

  addAttendee: (a: Omit<Attendee, "id">) => void;
  updateAttendee: (id: string, patch: Partial<Attendee>) => void;
  deleteAttendee: (id: string) => Promise<void>;
  syncAttendeesFromTable: () => Promise<void>;
  saveAttendee: (id: string) => Promise<void>;

  addSignOff: (s: Omit<SignOff, "id">) => void;
  updateSignOff: (id: string, patch: Partial<SignOff>) => void;
  deleteSignOff: (id: string) => Promise<void>;
  syncSignOffsFromTable: () => Promise<void>;
  saveSignOff: (id: string) => Promise<void>;

  addEmail: (e: Omit<EmailLog, "id">) => void;
  updateEmail: (id: string, patch: Partial<EmailLog>) => void;
  deleteEmail: (id: string) => Promise<void>;
  syncEmailLogsFromTable: () => Promise<void>;
  saveEmail: (id: string) => Promise<void>;

  addIssue: (i: Omit<Issue, "id">) => void;
  updateIssue: (id: string, patch: Partial<Issue>) => void;
  deleteIssue: (id: string) => Promise<void>;
  syncIssuesFromTable: () => Promise<void>;
  saveIssue: (id: string) => Promise<void>;

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
  syncUsersFromTable: () => Promise<void>;
  saveUserAccount: (id: string) => Promise<void>;

  addProject: (p: Omit<ProjectDetail, "id">) => void;
  updateProject: (id: string, patch: Partial<ProjectDetail>) => void;
  deleteProject: (id: string) => void;
  replaceProjects: (rows: ProjectDetail[]) => void;
  syncProjectsFromTable: () => Promise<void>;
  saveProjectDetail: (id: string) => Promise<void>;

  addContractor: (c: Omit<Contractor, "id">) => void;
  updateContractor: (id: string, patch: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;
  replaceContractors: (rows: Contractor[]) => void;
  syncContractorsFromTable: () => Promise<void>;
  saveContractor: (id: string) => Promise<void>;

  addCostCode: (c: Omit<CostCode, "id">) => void;
  updateCostCode: (id: string, patch: Partial<CostCode>) => void;
  deleteCostCode: (id: string) => void;
  replaceCostCodes: (rows: CostCode[]) => void;
  syncCostCodesFromTable: () => Promise<void>;
  saveCostCode: (id: string) => Promise<void>;

  addReminderTask: (r: Omit<ReminderTask, "id" | "createdAt"> & { id?: string; createdAt?: string }) => void;
  updateReminderTask: (id: string, patch: Partial<ReminderTask>) => void;
  deleteReminderTask: (id: string) => void;
  saveReminderTask: (id: string) => Promise<void>;

  addIntranet: (r: Omit<IntranetResource, "id">) => void;
  updateIntranet: (id: string, patch: Partial<IntranetResource>) => void;
  deleteIntranet: (id: string) => void;

  resetAll: () => void;
  hydrateFromApi: (url?: string) => Promise<void>;
  fetchTables: () => Promise<void>;
  fetchTableRecords: (tableId: string, tableName: string) => Promise<any[]>;
  syncSeedDataFromApi: () => Promise<{ hasAnyData: boolean; hasPhaseData: boolean }>;
  syncClientFromTable: () => Promise<void>;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const readRecordValue = (record: any, keys: string[]) => {
  const source = record?.fields && typeof record.fields === "object" ? record.fields : record ?? {};
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }
  return "";
};

const parseJsonValue = (value: unknown) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizePhaseRecord = (record: any) => ({
  id: readRecordValue(record, ["id", "phaseId", "Phase ID"]) || record?.id || "",
  name: readRecordValue(record, ["name", "Name"]) || "",
  short: readRecordValue(record, ["short", "Short"]) || "",
  description: readRecordValue(record, ["description", "Description"]) || "",
});

const normalizeTaskRecord = (record: any): Task => ({
  id: readRecordValue(record, ["id", "taskId", "Task ID"]) || record?.id || "",
  _id: record?.id,
  phase: readRecordValue(record, ["phase", "Phase"]) || "1A",
  title: readRecordValue(record, ["title", "Title"]) || "",
  owner: readRecordValue(record, ["owner", "Owner"]) || "PLEXA",
  status: (readRecordValue(record, ["status", "Status"]) || "NOT STARTED") as Task["status"],
  notes: readRecordValue(record, ["notes", "Notes"]) || undefined,
  completedAt: readRecordValue(record, ["completedAt", "Completed At"]) || undefined,
});

const normalizeAttendeeRecord = (record: any): Attendee => ({
  id: readRecordValue(record, ["id", "sessionId", "Session ID", "name", "Name"]) || record?.id || "",
  _id: record?.id,
  sessionId: readRecordValue(record, ["sessionId", "Session ID"]) || "",
  firstName: readRecordValue(record, ["firstName", "First Name"]) || "",
  lastName: readRecordValue(record, ["lastName", "Last Name"]) || "",
  role: readRecordValue(record, ["role", "Role", "jobTitle", "Job Title"]) || "",
  department: readRecordValue(record, ["department", "Department", "company", "Company"]) || "",
  attendance: (readRecordValue(record, ["attendance", "Attendance"]) || "✅ Present") as Attendee["attendance"],
  signed: (readRecordValue(record, ["signed", "Signed"]) || "⏳ Pending") as Attendee["signed"],
  notes: readRecordValue(record, ["notes", "Notes"]) || "",
});

const normalizeSignOffRecord = (record: any): SignOff => ({
  id: readRecordValue(record, ["id", "person", "Person", "name", "Name"]) || record?.id || "",
  _id: record?.id,
  person: readRecordValue(record, ["person", "Person", "name", "Name"]) || "",
  jobTitle: readRecordValue(record, ["jobTitle", "Job Title", "role", "Role"]) || "",
  module: readRecordValue(record, ["module", "Module"]) || "",
  competency: (readRecordValue(record, ["competency", "Competency"]) || "Novice") as SignOff["competency"],
  status: (readRecordValue(record, ["status", "Status"]) || "NOT STARTED") as SignOff["status"],
  signedBy: readRecordValue(record, ["signedBy", "Signed By", "signed_off_by", "signedOffBy"]) || "",
  date: readRecordValue(record, ["date", "Date", "signOffDate", "Sign Off Date"]) || "",
});

const normalizeNoteHistoryRecord = (record: any) => ({
  taskId: readRecordValue(record, ["taskId", "Task ID", "Task"]) || "",
  entry: {
    at: readRecordValue(record, ["at", "At", "Created At"]) || new Date().toISOString(),
    by: readRecordValue(record, ["by", "By"]) || "You",
    text: readRecordValue(record, ["text", "Text", "Notes"]) || "",
  } as NoteHistoryEntry,
});

const groupNoteHistoryRecords = (records: any[]) => {
  const grouped: Record<string, NoteHistoryEntry[]> = {};
  records.forEach((record) => {
    const { taskId, entry } = normalizeNoteHistoryRecord(record);
    if (!taskId) return;
    grouped[taskId] = [...(grouped[taskId] || []), entry];
  });
  Object.keys(grouped).forEach((taskId) => {
    grouped[taskId] = grouped[taskId]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 20);
  });
  return grouped;
};

const normalizeTrainingModuleRecord = (record: any): TrainingModuleState => ({
  id: readRecordValue(record, ["id", "moduleId", "Module ID"]) || record?.id || "",
  _id: record?.id,
  name: readRecordValue(record, ["name", "Name"]) || "",
  teach: (readRecordValue(record, ["teach", "Teach"]) || "NOT STARTED") as TaskStatus,
  practice: (readRecordValue(record, ["practice", "Practice"]) || "NOT STARTED") as TaskStatus,
  observe: (readRecordValue(record, ["observe", "Observe"]) || "NOT STARTED") as TaskStatus,
  signedOffBy: readRecordValue(record, ["signedOffBy", "Signed Off By"]) || "",
  signOffDate: readRecordValue(record, ["signOffDate", "Sign Off Date"]) || "",
});

const trainingModuleSnapshot = (module: TrainingModuleState): SavedTrainingModuleSnapshot => ({
  teach: module.teach,
  practice: module.practice,
  observe: module.observe,
  signedOffBy: module.signedOffBy || "",
  signOffDate: module.signOffDate || "",
});

const trainingModuleChanged = (module: TrainingModuleState, snapshot?: SavedTrainingModuleSnapshot) => {
  if (!snapshot) return true;
  const current = trainingModuleSnapshot(module);
  return (
    current.teach !== snapshot.teach ||
    current.practice !== snapshot.practice ||
    current.observe !== snapshot.observe ||
    current.signedOffBy !== snapshot.signedOffBy ||
    current.signOffDate !== snapshot.signOffDate
  );
};

const blankTrainingScheduleItem = (): TrainingScheduleItemState => ({
  teach: false,
  practice: false,
  observe: false,
  owner: "PLEXA",
  status: "NOT STARTED",
  date: "",
  facilitator: "",
});

const readBooleanValue = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "yes" || normalized === "1";
  }
  return false;
};

const normalizeTrainingScheduleItemState = (record: any): TrainingScheduleItemState => {
  const teach = readBooleanValue(readRecordValue(record, ["teach", "Teach"]));
  const practice = readBooleanValue(readRecordValue(record, ["practice", "Practice"]));
  const observe = readBooleanValue(readRecordValue(record, ["observe", "Observe"]));
  const status = (readRecordValue(record, ["status", "Status"]) || (
    teach && practice && observe ? "COMPLETE" : teach || practice || observe ? "IN PROGRESS" : "NOT STARTED"
  )) as TaskStatus;

  return {
    teach,
    practice,
    observe,
    owner: readRecordValue(record, ["owner", "Owner"]) || "PLEXA",
    status,
    date: readRecordValue(record, ["date", "Date", "sessionDate", "Session Date"]) || "",
    facilitator: readRecordValue(record, ["facilitator", "Facilitator"]) || "",
  };
};

const trainingScheduleItemChanged = (item: TrainingScheduleItemState, snapshot?: TrainingScheduleItemState) => {
  if (!snapshot) return true;
  return (
    item.teach !== snapshot.teach ||
    item.practice !== snapshot.practice ||
    item.observe !== snapshot.observe ||
    item.owner !== snapshot.owner ||
    item.status !== snapshot.status ||
    item.date !== snapshot.date ||
    item.facilitator !== snapshot.facilitator
  );
};

const normalizeStakeholderRecord = (record: any) => ({
  id: record?.id || `stakeholder-${Math.random().toString(36).slice(2, 8)}`,
  name: readRecordValue(record, ["name", "Name"]) || "",
  role: readRecordValue(record, ["role", "Role"]) || "",
  dept: readRecordValue(record, ["dept", "Department"]) || "",
  influence: (readRecordValue(record, ["influence", "Influence"]) || "Medium") as Stakeholder["influence"],
  email: readRecordValue(record, ["email", "Email"]) || "",
  phone: readRecordValue(record, ["phone", "Phone"]) || "",
  sentiment: (readRecordValue(record, ["sentiment", "Sentiment"]) || "Unknown") as Stakeholder["sentiment"],
  lastTouch: readRecordValue(record, ["lastTouch", "Last Touch"]) || "",
});

const normalizeDodRecord = (record: any) => ({
  id: record?.id || Number(record?.id ?? 0),
  cat: readRecordValue(record, ["cat", "Category"]) || "",
  text: readRecordValue(record, ["text", "Text"]) || "",
  confirmed: Boolean(parseJsonValue(readRecordValue(record, ["confirmed", "Confirmed"])) || false),
  by: readRecordValue(record, ["by", "By"]) || "",
  date: readRecordValue(record, ["date", "Date"]) || "",
});

const normalizeWorkshopStepRecord = (record: any) => ({
  step: Number(readRecordValue(record, ["step", "Step"])) || 0,
  title: readRecordValue(record, ["title", "Title"]) || "",
  duration: readRecordValue(record, ["duration", "Duration"]) || "",
  detail: readRecordValue(record, ["detail", "Detail"]) || "",
});

const normalizeResistanceProfileRecord = (record: any) => ({
  type: readRecordValue(record, ["type", "Type"]) || "",
  why: readRecordValue(record, ["why", "Why"]) || "",
  strategy: readRecordValue(record, ["strategy", "Strategy"]) || "",
  outcome: readRecordValue(record, ["outcome", "Outcome"]) || "",
});

const normalizeCommandmentRecord = (record: any) => ({
  n: readRecordValue(record, ["n", "N"]) || "",
  t: readRecordValue(record, ["t", "Title"]) || "",
  d: readRecordValue(record, ["d", "Detail"]) || "",
});

const normalizeUserRecord = (record: any): UserAccount => ({
  id: readRecordValue(record, ["id", "userId", "User ID"]) || record?.id || uid(),
  _id: record?.id,
  name: readRecordValue(record, ["name", "Name"]) || "",
  email: readRecordValue(record, ["email", "Email"]) || "",
  phone: readRecordValue(record, ["phone", "Phone"]) || "",
  position: readRecordValue(record, ["position", "Position"]) || "",
  role: readRecordValue(record, ["role", "Role"]) || "",
  department: readRecordValue(record, ["department", "Department", "dept", "Dept"]) || "",
  status: (readRecordValue(record, ["status", "Status"]) || "Pending") as UserAccount["status"],
});

const normalizeProjectRecord = (record: any): ProjectDetail => ({
  id: readRecordValue(record, ["id", "projectId", "Project ID"]) || record?.id || uid(),
  _id: record?.id,
  code: readRecordValue(record, ["code", "Code"]) || "",
  name: readRecordValue(record, ["name", "Name"]) || "",
  type: readRecordValue(record, ["type", "Type"]) || "",
  client: readRecordValue(record, ["client", "Client"]) || "",
  pm: readRecordValue(record, ["pm", "PM", "Project Manager"]) || "",
  startDate: readRecordValue(record, ["startDate", "Start Date"]) || "",
  endDate: readRecordValue(record, ["endDate", "End Date"]) || "",
  value: readRecordValue(record, ["value", "Value"]) || "",
  status: (readRecordValue(record, ["status", "Status"]) || "Live") as ProjectDetail["status"],
});

const normalizeContractorRecord = (record: any): Contractor => ({
  id: readRecordValue(record, ["id", "contractorId", "Contractor ID"]) || record?.id || uid(),
  _id: record?.id,
  company: readRecordValue(record, ["company", "Company"]) || "",
  trade: readRecordValue(record, ["trade", "Trade"]) || "",
  contact: readRecordValue(record, ["contact", "Contact"]) || "",
  email: readRecordValue(record, ["email", "Email"]) || "",
  phone: readRecordValue(record, ["phone", "Phone"]) || "",
  insurance: readRecordValue(record, ["insurance", "Insurance", "Insurance Exp."]) || "",
  abn: readRecordValue(record, ["abn", "ABN"]) || "",
  status: (readRecordValue(record, ["status", "Status"]) || "Pending") as Contractor["status"],
});

const normalizeCostCodeRecord = (record: any): CostCode => ({
  id: readRecordValue(record, ["id", "costCodeId", "Cost Code ID"]) || record?.id || uid(),
  _id: record?.id,
  code: readRecordValue(record, ["code", "Code"]) || "",
  name: readRecordValue(record, ["name", "Name"]) || "",
  category: readRecordValue(record, ["category", "Category"]) || "",
  unit: readRecordValue(record, ["unit", "Unit"]) || "",
  rate: readRecordValue(record, ["rate", "Rate"]) || "",
  notes: readRecordValue(record, ["notes", "Notes"]) || "",
});

const normalizeIssueRecord = (record: any): Issue => ({
  id: readRecordValue(record, ["id", "issueId", "Issue ID", "ref", "Ref"]) || record?.id || uid(),
  _id: record?.id,
  ref: readRecordValue(record, ["ref", "Ref"]) || "",
  phase: readRecordValue(record, ["phase", "Phase"]) || "",
  type: readRecordValue(record, ["type", "Type", "issueType", "Issue Type"]) || "👤 User Error",
  description: readRecordValue(record, ["description", "Description", "details", "Details"]) || "",
  owner: (readRecordValue(record, ["owner", "Owner"]) || "PLEXA") as Issue["owner"],
  assignedTo: readRecordValue(record, ["assignedTo", "Assigned To", "reportedBy", "Reported By"]) || "",
  priority: (readRecordValue(record, ["priority", "Priority"]) || "MEDIUM") as Issue["priority"],
  raisedAt: readRecordValue(record, ["raisedAt", "Raised At", "dateRaised", "Date Raised"]) || "",
  dueDate: readRecordValue(record, ["dueDate", "Due Date"]) || "",
  status: (readRecordValue(record, ["status", "Status"]) || "Open") as Issue["status"],
  resolution: readRecordValue(record, ["resolution", "Resolution", "notes", "Notes"]) || "",
  closedDate: readRecordValue(record, ["closedDate", "Closed Date"]) || "",
  reportedBy: readRecordValue(record, ["reportedBy", "Reported By"]) || "",
  archived: Boolean(readRecordValue(record, ["archived", "Archived"]) || false),
});

interface SavedSessionSnapshot {
  type: Session["type"];
  topic: string;
  module: string;
  date: string;
  duration: string;
  facilitator: string;
  location: string;
  status: Session["status"];
}

const sessionSnapshot = (session: Session): SavedSessionSnapshot => ({
  type: session.type,
  topic: session.topic || "",
  module: session.module || "",
  date: session.date || "",
  duration: session.duration || "",
  facilitator: session.facilitator || "",
  location: session.location || "",
  status: session.status || "Scheduled",
});

const sessionChanged = (session: Session, snapshot?: SavedSessionSnapshot) => {
  if (!snapshot) return true;
  const current = sessionSnapshot(session);
  return Object.entries(current).some(([key, value]) => value !== snapshot[key as keyof SavedSessionSnapshot]);
};

const normalizeSessionRecord = (record: any): Session => ({
  id: readRecordValue(record, ["id", "sessionId", "Session ID", "topic", "Topic", "name", "Name"]) || record?.id || uid(),
  _id: record?.id,
  type: (readRecordValue(record, ["type", "Type", "sessionType", "Session Type"]) || "Workshop") as Session["type"],
  topic: readRecordValue(record, ["topic", "Topic", "name", "Name"]) || "",
  module: readRecordValue(record, ["module", "Module", "phase", "Phase"]) || "",
  date: readRecordValue(record, ["date", "Date", "sessionDate", "Session Date"]) || "",
  duration: readRecordValue(record, ["duration", "Duration"]) || "",
  facilitator: readRecordValue(record, ["facilitator", "Facilitator"]) || "",
  location: readRecordValue(record, ["location", "Location", "link", "Link"]) || "",
  status: (readRecordValue(record, ["status", "Status"]) || "Scheduled") as Session["status"],
});

const normalizeEmailLogRecord = (record: any): EmailLog => ({
  id: readRecordValue(record, ["id", "emailId", "Email ID", "week", "Week"]) || record?.id || uid(),
  _id: record?.id,
  week: Number(readRecordValue(record, ["week", "Week"]) || 1),
  date: readRecordValue(record, ["date", "Date", "dateSent", "Date Sent"]) || "",
  subject: readRecordValue(record, ["subject", "Subject"]) || "",
  recipients: readRecordValue(record, ["recipients", "Recipients", "sentTo", "Sent To"]) || "",
  status: (readRecordValue(record, ["status", "Status"]) || "PENDING") as EmailLog["status"],
  summary: readRecordValue(record, ["summary", "Summary", "completed", "Completed This Week"]) || "",
  highlights: readRecordValue(record, ["highlights", "Highlights", "planned", "Planned Next Week"]) || "",
  blockers: readRecordValue(record, ["blockers", "Blockers", "openIssues", "Open Issues"]) || "",
  sent: Boolean(readRecordValue(record, ["sent", "Sent"]) || false),
  dateSent: readRecordValue(record, ["dateSent", "Date Sent", "date", "Date"]) || "",
  phase: readRecordValue(record, ["phase", "Phase"]) || "",
  completed: readRecordValue(record, ["completed", "Completed This Week", "summary", "Summary"]) || "",
  planned: readRecordValue(record, ["planned", "Planned Next Week", "highlights", "Highlights"]) || "",
  openIssues: readRecordValue(record, ["openIssues", "Open Issues", "blockers", "Blockers"]) || "",
  sentTo: readRecordValue(record, ["sentTo", "Sent To", "recipients", "Recipients"]) || "",
});

const normalizeReminderTaskRecord = (record: any): ReminderTask => ({
  id: readRecordValue(record, ["id", "taskId", "Task ID"]) || record?.id || uid(),
  _id: record?.id,
  title: readRecordValue(record, ["title", "Title"]) || "",
  details: readRecordValue(record, ["details", "Details", "description", "Description"]) || "",
  assignee: readRecordValue(record, ["assignee", "Assignee"]) || "",
  dueDate: readRecordValue(record, ["dueDate", "Due Date"]) || "",
  remindAt: readRecordValue(record, ["remindAt", "Remind At"]) || "",
  priority: (readRecordValue(record, ["priority", "Priority"]) || "MEDIUM") as ReminderTask["priority"],
  status: (readRecordValue(record, ["status", "Status"]) || "OPEN") as ReminderTask["status"],
  createdAt: readRecordValue(record, ["createdAt", "Created At"]) || new Date().toISOString(),
  completedAt: readRecordValue(record, ["completedAt", "Completed At"]) || undefined,
});

export async function ensureOrganizationUUID(apiBase: string | undefined, token?: string | null): Promise<string | null> {
  if (!apiBase) return null;
  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, "")}/profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error(`Unable to fetch profile (${res.status})`);
    const payload = await res.json();
    return payload?.data?.result?.organization?.uuid || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("playbook-store: ensureOrganizationUUID failed", error);
    return null;
  }
}

async function saveRecordToTable(tableId: string, tableName: string, recordId: string | undefined, fields: Record<string, unknown>) {
  const apiBase = (window as any).apiBase as string | undefined;
  const token = (window as any).authToken as string | undefined;
  if (!apiBase) throw new Error("apiBase not available");

  const org = await ensureOrganizationUUID(apiBase, token);
  if (!org) throw new Error("Organization UUID not available");

  const url = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records${recordId ? `/${recordId}` : ""}`;
  const res = await fetch(url, {
    method: recordId ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(recordId
      ? {
          fieldKeyType: "name",
          typecast: false,
          record: { fields },
        }
      : {
          fieldKeyType: "name",
          typecast: false,
          p: tableName,
          records: [{ fields }],
        }),
  });

  if (!res.ok) throw new Error(`Failed to save ${tableName} (${res.status})`);
  const json = await res.json().catch(() => null);
  return json?.data?.result?.records?.[0]?.id || json?.data?.result?.record?.id || json?.data?.result?.id || recordId;
}

async function deleteRecordFromTable(tableId: string, recordId: string): Promise<void> {
  const apiBase = (window as any).apiBase as string | undefined;
  const token = (window as any).authToken as string | undefined;
  if (!apiBase) throw new Error("apiBase not available");
  const org = await ensureOrganizationUUID(apiBase, token);
  if (!org) throw new Error("Organization UUID not available");
  const url = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records?recordIds[]=${encodeURIComponent(recordId)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to delete record (${res.status})`);


const initial = {
  client: {} as ClientInfo,
  clientSaveStatus: "idle",
  hydrationStatus: "loading" as const,
  hydrationMessage: "",
  phases: [] as PhaseType[],
  tasks: [] as Task[],
  // table_name: playbook_note_history
  noteHistory: {} as Record<string, NoteHistoryEntry[]>,
  noteHistoryStatus: "idle" as NoteHistoryStatus,
  // table_name: playbook_task_overrides
  taskOverrides: {} as Record<string, TaskScheduleOverride>,
  timelineMode: "Medium (6 Weeks)" as TimelineMode,
  // default to a real date so timeline calculations never receive an invalid value
  startDate: new Date().toISOString().slice(0, 10),
  trainingModules: [] as TrainingModuleState[],
  lastSavedTrainingModules: {} as Record<string, SavedTrainingModuleSnapshot>,
  trainingSchedule: [] as SchedModule[],
  trainingScheduleItems: {} as Record<number, TrainingScheduleItemState>,
  trainingScheduleRecordIds: {} as Record<number, string>,
  lastSavedTrainingScheduleItems: {} as Record<number, TrainingScheduleItemState>,
  workshopSteps: [] as WorkshopStepType[],
  resistanceProfiles: [] as ResistanceProfileType[],
  commandments: [] as CommandmentsType[],
  sessions: [] as Session[],
  lastSavedSessions: {} as Record<string, SavedSessionSnapshot>,
  // tabele_name: playbook_attendees
  attendees: [] as Attendee[],
  // table_name: playbook_signoffs
  signOffs: [] as SignOff[],
  // table_name: playbook_emails
  emails: [] as EmailLog[],
  // table_name: playbook_issues
  issues: [] as Issue[],
  stakeholders: [] as Stakeholder[],
  // table_name: playbook_champions
  champions: [] as Champion[],
  // table_name: playbook_resistant_users
  resistantUsers: [] as ResistantUser[],
  dod: [] as DodItem[],
  // table_name: playbook_users
  userAccounts: [] as UserAccount[],
  // table_name: playbook_projects
  projectDetails: [] as ProjectDetail[],
  // table_name: playbook_contractors
  contractors: [] as Contractor[],
  // table_name: playbook_cost_codes
  costCodes: [] as CostCode[],
  // table_name: playbook_reminder_tasks
  reminderTasks: [] as ReminderTask[],
  // table_name: playbook_intranet
  intranet: [] as IntranetResource[],
  lastSavedNotes: {} as Record<string, string>,
  lastSavedTaskSnapshots: {} as Record<string, SavedTaskSnapshot>,
  tableMap: {} as Record<string, string>,
} as const;

export const usePlaybook = create<PlaybookState>()((set) => ({
      ...initial,
      // hydrate the store from the API table-name mappings only
      hydrateFromApi: async (_url?: string) => {
        try {
          set({ hydrationStatus: "loading", hydrationMessage: "Loading implementation data…" });

          await usePlaybook.getState().fetchTables();
          const syncResult = await usePlaybook.getState().syncSeedDataFromApi();
          if (!syncResult.hasPhaseData) {
            throw new Error("Phase data is still unavailable from the API sync.");
          }

          await usePlaybook.getState().syncClientFromTable();
          set({ hydrationStatus: "ready", hydrationMessage: "" });

          if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new CustomEvent("playbook:hydrated"));
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "We could not load the implementation data right now.";
          set({
            hydrationStatus: "error",
            hydrationMessage: "We could not load the implementation data right now. Please try again later.",
          });
          console.error("playbook-store: hydrateFromApi failed", err, message);
        }
      },
      setClient: (c) => set((s) => ({ client: { ...s.client, ...c } })),
      updateClient: async (patch) => {
        try {
          const apiBase = (window as any).apiBase as string | undefined;
          const token = (window as any).authToken as string | undefined;
          const state = usePlaybook.getState();
          
          // Optimistic update
          set((s) => ({ client: { ...s.client, ...patch }, clientSaveStatus: "saving" }));
          
          if (!apiBase) {
            throw new Error("apiBase not available");
          }
          
          const org = await ensureOrganizationUUID(apiBase, token);
          if (!org) {
            throw new Error("Organization UUID not available");
          }
          
          const tableId = state.tableMap["playbook_client"];
          if (!tableId) {
            throw new Error("playbook_client table not found in tableMap");
          }
          
          const recordId = state.client._id;
          if (!recordId) {
            throw new Error("Client record ID not available");
          }
          
          // Format patch: convert arrays to JSON strings
          const formattedPatch: Record<string, any> = {};
          for (const [key, value] of Object.entries(patch)) {
            formattedPatch[key] = Array.isArray(value)
              ? JSON.stringify(value)
              : value;
          }
          
          const url = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records/${recordId}`;
          const res = await fetch(url, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` || "",
            },
            body: JSON.stringify({
              fieldKeyType: "name",
              typecast: false,
              record: {
                fields: formattedPatch,
              },
            }),
          });
          
          if (!res.ok) {
            throw new Error(`Failed to update client (${res.status})`);
          }
          
          set({ clientSaveStatus: "saved" });
          
          // Auto-clear status after 1.5s
          setTimeout(() => {
            set({ clientSaveStatus: "idle" });
          }, 1500);
        } catch (err) {
          // Rollback on error
          const state = usePlaybook.getState();
          set({
            client: state.client,
            clientSaveStatus: "error",
          });
          
          // eslint-disable-next-line no-console
          console.error("playbook-store: updateClient failed", err);
          
          // Auto-clear error after 1.5s
          setTimeout(() => {
            set({ clientSaveStatus: "idle" });
          }, 1500);
        }
      },
      updateTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const next: Task = { ...t, status };
            if (status === "COMPLETE" && !t.completedAt) next.completedAt = new Date().toISOString();
            if (status !== "COMPLETE") next.completedAt = undefined;
            return next;
          }),
        })),
      // update notes in-memory; do NOT record history on each keystroke
      updateTaskNotes: (id, notes, by = "You") =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, notes } : t)) })),

      saveImplementationPlan: async (by = "You") => {
        const state = usePlaybook.getState();
        const changedTasks = state.tasks.filter((task) => {
          const snapshot = state.lastSavedTaskSnapshots[task.id];
          return !snapshot || snapshot.status !== task.status || snapshot.notes !== (task.notes || "");
        });

        if (changedTasks.length === 0) return;

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        if (!apiBase) throw new Error("apiBase not available");

        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        const taskTableId = state.tableMap[PLAYBOOK_TABLES.tasks];
        const noteHistoryTableId = state.tableMap[PLAYBOOK_TABLES.noteHistory];
        if (!taskTableId) throw new Error("playbook_tasks table not found in tableMap");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const baseUrl = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}`;

        const recordIdByTaskId = new Map<string, string>();
        if (changedTasks.some((task) => !task._id)) {
          const records = await state.fetchTableRecords(taskTableId, PLAYBOOK_TABLES.tasks);
          records.forEach((record) => {
            const taskId = readRecordValue(record, ["id", "taskId", "Task ID"]) || record?.id || "";
            if (taskId && record?.id) recordIdByTaskId.set(taskId, record.id);
          });
        }

        await Promise.all(changedTasks.map(async (task) => {
          const recordId = task._id || recordIdByTaskId.get(task.id);
          if (!recordId) throw new Error(`Record ID not found for task ${task.id}`);

          const url = `${baseUrl}/tables/${taskTableId}/records/${recordId}`;
          const res = await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              fieldKeyType: "name",
              typecast: false,
              record: {
                fields: {
                  status: task.status,
                  notes: task.notes || "",
                },
              },
            }),
          });
          if (!res.ok) throw new Error(`Failed to update task ${task.id} (${res.status})`);
        }));

        const noteEntries = changedTasks
          .map((task) => {
            const text = task.notes || "";
            const snapshot = state.lastSavedTaskSnapshots[task.id];
            if (snapshot && text === snapshot.notes) return null;
            return {
              taskId: task.id,
              entry: { at: new Date().toISOString(), by, text } as NoteHistoryEntry,
            };
          })
          .filter((item): item is { taskId: string; entry: NoteHistoryEntry } => Boolean(item));

        if (noteEntries.length && !noteHistoryTableId) {
          throw new Error("playbook_note_history table not found in tableMap");
        }

        await Promise.all(noteEntries.map(async ({ taskId, entry }) => {
          const url = `${baseUrl}/tables/${noteHistoryTableId}/records`;
          const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
              fieldKeyType: "name",
              records: [{
                fields: {
                  taskId,
                  at: entry.at,
                  by: entry.by,
                  text: entry.text,
                },
              }],
            }),
          });
          if (!res.ok) throw new Error(`Failed to save note history for task ${taskId} (${res.status})`);
        }));

        set((s) => {
          const noteHistory = { ...s.noteHistory };
          const lastSavedNotes = { ...s.lastSavedNotes };
          const lastSavedTaskSnapshots = { ...s.lastSavedTaskSnapshots };
          noteEntries.forEach(({ taskId, entry }) => {
            noteHistory[taskId] = [entry, ...(noteHistory[taskId] || [])].slice(0, 20);
            lastSavedNotes[taskId] = entry.text;
          });
          changedTasks.forEach((task) => {
            lastSavedTaskSnapshots[task.id] = {
              status: task.status,
              notes: task.notes || "",
            };
          });
          return {
            noteHistory,
            lastSavedNotes,
            lastSavedTaskSnapshots,
            tasks: s.tasks.map((task) => ({
              ...task,
              _id: task._id || recordIdByTaskId.get(task.id),
            })),
          };
        });
      },

      syncNoteHistoryFromTable: async () => {
        set({ noteHistoryStatus: "loading" });
        try {
          let state = usePlaybook.getState();
          let tableId = state.tableMap[PLAYBOOK_TABLES.noteHistory];
          if (!tableId) {
            await state.fetchTables();
            state = usePlaybook.getState();
            tableId = state.tableMap[PLAYBOOK_TABLES.noteHistory];
          }

          if (!tableId) {
            throw new Error("playbook_note_history table not found in tableMap");
          }

          const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.noteHistory);
          set({
            noteHistory: groupNoteHistoryRecords(rows),
            noteHistoryStatus: "ready",
          });
        } catch (err) {
          console.error("playbook-store: syncNoteHistoryFromTable failed", err);
          set({ noteHistoryStatus: "error" });
        }
      },
      syncReminderTasksFromTable: async () => {
        try {
          let state = usePlaybook.getState();
          let tableId = state.tableMap[PLAYBOOK_TABLES.reminderTasks];
          if (!tableId) {
            await state.fetchTables();
            state = usePlaybook.getState();
            tableId = state.tableMap[PLAYBOOK_TABLES.reminderTasks];
          }

          if (!tableId) {
            throw new Error("playbook_reminder_tasks table not found in tableMap");
          }

          const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.reminderTasks);
          set({
            reminderTasks: rows.map((record) => normalizeReminderTaskRecord(record)),
          });
        } catch (err) {
          console.error("playbook-store: syncReminderTasksFromTable failed", err);
        }
      },

      // commit a single task's note to history if it changed since last saved
      commitNote: (id, by = "You") =>
        set((s) => {
          const curr = s.tasks.find((t) => t.id === id)?.notes || "";
          const last = s.lastSavedNotes[id] ?? "";
          if (curr === last) return s; // nothing to commit
          const history = { ...s.noteHistory };
          const entry: NoteHistoryEntry = { at: new Date().toISOString(), by, text: curr };
          history[id] = [entry, ...(history[id] || [])].slice(0, 20);
          const lastSavedNotes = { ...s.lastSavedNotes, [id]: curr };
          return { noteHistory: history, lastSavedNotes } as any;
        }),

      // commit all notes that have changed since last saved (used after global save)
      commitAllNotes: (by = "You") =>
        set((s) => {
          const history = { ...s.noteHistory };
          const lastSavedNotes = { ...s.lastSavedNotes };
          s.tasks.forEach((t) => {
            const curr = t.notes || "";
            const last = lastSavedNotes[t.id] ?? "";
            if (curr !== last) {
              const entry: NoteHistoryEntry = { at: new Date().toISOString(), by, text: curr };
              history[t.id] = [entry, ...(history[t.id] || [])].slice(0, 20);
              lastSavedNotes[t.id] = curr;
            }
          });
          return { noteHistory: history, lastSavedNotes } as any;
        }),
      setTimeline: (timelineMode, startDate) => {
        const normalizedStart = normalizeDateInput(startDate);
        set({ timelineMode, startDate: normalizedStart });
      },
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

      saveTrainingModules: async () => {
        const state = usePlaybook.getState();
        const changedModules = state.trainingModules.filter((module) =>
          trainingModuleChanged(module, state.lastSavedTrainingModules[module.id])
        );

        if (changedModules.length === 0) return;

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        if (!apiBase) throw new Error("apiBase not available");

        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        const tableId = state.tableMap[PLAYBOOK_TABLES.trainingModules];
        if (!tableId) throw new Error("playbook_training_modules table not found in tableMap");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const baseUrl = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}`;

        const recordIdByModuleId = new Map<string, string>();
        if (changedModules.some((module) => !module._id)) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.trainingModules);
          records.forEach((record) => {
            const moduleId = readRecordValue(record, ["id", "moduleId", "Module ID"]) || record?.id || "";
            if (moduleId && record?.id) recordIdByModuleId.set(moduleId, record.id);
          });
        }

        await Promise.all(changedModules.map(async (module) => {
          const recordId = module._id || recordIdByModuleId.get(module.id);
          if (!recordId) throw new Error(`Record ID not found for training module ${module.id}`);

          const res = await fetch(`${baseUrl}/tables/${tableId}/records/${recordId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              fieldKeyType: "name",
              typecast: false,
              record: {
                fields: {
                  teach: module.teach,
                  practice: module.practice,
                  observe: module.observe,
                  signedOffBy: module.signedOffBy || "",
                  signOffDate: module.signOffDate || "",
                },
              },
            }),
          });
          if (!res.ok) throw new Error(`Failed to update training module ${module.id} (${res.status})`);
        }));

        set((s) => {
          const lastSavedTrainingModules = { ...s.lastSavedTrainingModules };
          changedModules.forEach((module) => {
            lastSavedTrainingModules[module.id] = trainingModuleSnapshot(module);
          });

          return {
            lastSavedTrainingModules,
            trainingModules: s.trainingModules.map((module) => ({
              ...module,
              _id: module._id || recordIdByModuleId.get(module.id),
            })),
          };
        });
      },

      saveTrainingScheduleItems: async (items) => {
        const state = usePlaybook.getState();
        const changedEntries = Object.entries(items)
          .map(([itemNumber, item]) => ({ itemNumber: Number(itemNumber), item }))
          .filter(({ itemNumber, item }) =>
            Number.isFinite(itemNumber) &&
            trainingScheduleItemChanged(item, state.lastSavedTrainingScheduleItems[itemNumber])
          );

        if (changedEntries.length === 0) return;

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        if (!apiBase) throw new Error("apiBase not available");

        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        const tableId = state.tableMap[PLAYBOOK_TABLES.trainingSchedule];
        if (!tableId) throw new Error("playbook_training_schedule table not found in tableMap");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const baseUrl = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}`;

        const recordIds = { ...state.trainingScheduleRecordIds };
        if (changedEntries.some(({ itemNumber }) => !recordIds[itemNumber])) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.trainingSchedule);
          records.forEach((record) => {
            const itemNumber = Number(readRecordValue(record, ["itemNumber", "Item Number", "n"]));
            if (itemNumber && record?.id) recordIds[itemNumber] = record.id;
          });
        }

        await Promise.all(changedEntries.map(async ({ itemNumber, item }) => {
          const recordId = recordIds[itemNumber];
          if (!recordId) throw new Error(`Record ID not found for training schedule item ${itemNumber}`);

          const res = await fetch(`${baseUrl}/tables/${tableId}/records/${recordId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              fieldKeyType: "name",
              typecast: false,
              record: {
                fields: {
                  teach: item.teach,
                  practice: item.practice,
                  observe: item.observe,
                  owner: item.owner || "PLEXA",
                  status: item.status,
                  date: item.date || "",
                  facilitator: item.facilitator || "",
                },
              },
            }),
          });
          if (!res.ok) throw new Error(`Failed to update training schedule item ${itemNumber} (${res.status})`);
        }));

        set((s) => {
          const trainingScheduleItems = { ...s.trainingScheduleItems };
          const lastSavedTrainingScheduleItems = { ...s.lastSavedTrainingScheduleItems };
          changedEntries.forEach(({ itemNumber, item }) => {
            trainingScheduleItems[itemNumber] = { ...item };
            lastSavedTrainingScheduleItems[itemNumber] = { ...item };
          });

          return {
            trainingScheduleItems,
            lastSavedTrainingScheduleItems,
            trainingScheduleRecordIds: recordIds,
          };
        });
      },

      addSession: (s) => set((st) => ({ sessions: [...st.sessions, { id: uid(), ...s }] })),
      updateSession: (id, patch) => set((st) => ({ sessions: st.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSession: async (id) => {
        const state = usePlaybook.getState();
        const row = state.sessions.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.sessions];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.sessions];
        }
        if (!tableId) return;

        const recordId = row._id || (await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.sessions)).find((record) => {
          const recordIdValue = readRecordValue(record, ["id", "sessionId", "Session ID", "topic", "Topic"]);
          return recordIdValue === row.id || record?.id === row.id;
        })?.id;

        if (!recordId) {
          set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id), attendees: s.attendees.filter((a) => a.sessionId !== id) }));
          return;
        }

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        await fetch(`${apiBase?.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records?recordIds[]=${recordId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id), attendees: s.attendees.filter((a) => a.sessionId !== id) }));
      },
      syncSessionsFromTable: async () => {
        try {
          const state = usePlaybook.getState();
          let tableId = state.tableMap[PLAYBOOK_TABLES.sessions];
          if (!tableId) {
            await state.fetchTables();
            tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.sessions];
          }
          if (!tableId) return;

          const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.sessions);
          const sessions = rows.map((record) => normalizeSessionRecord(record));
          set({
            sessions,
            lastSavedSessions: Object.fromEntries(sessions.map((session) => [session.id, sessionSnapshot(session)])),
          });
        } catch (err) {
          console.error("playbook-store: syncSessionsFromTable failed", err);
        }
      },
      saveSessions: async () => {
        const state = usePlaybook.getState();
        const changedSessions = state.sessions.filter((session) => sessionChanged(session, state.lastSavedSessions[session.id]));

        if (changedSessions.length === 0) return;

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        if (!apiBase) throw new Error("apiBase not available");

        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        const tableId = state.tableMap[PLAYBOOK_TABLES.sessions];
        if (!tableId) throw new Error("playbook_sessions table not found in tableMap");

        const recordIdBySessionId = new Map<string, string>();
        if (changedSessions.some((session) => !session._id)) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.sessions);
          records.forEach((record) => {
            const sessionId = readRecordValue(record, ["id", "sessionId", "Session ID", "topic", "Topic", "name", "Name"]) || record?.id || "";
            if (sessionId && record?.id) recordIdBySessionId.set(sessionId, record.id);
          });
        }

        await Promise.all(changedSessions.map(async (session) => {
          const recordId = session._id || recordIdBySessionId.get(session.id);
          if (!recordId) throw new Error(`Record ID not found for session ${session.id}`);

          await saveRecordToTable(tableId, PLAYBOOK_TABLES.sessions, recordId, {
            id: session.id,
            type: session.type || "Workshop",
            topic: session.topic || "",
            module: session.module || "",
            date: session.date || "",
            duration: session.duration || "",
            facilitator: session.facilitator || "",
            location: session.location || "",
            status: session.status || "Scheduled",
          });
        }));

        set((s) => ({
          lastSavedSessions: Object.fromEntries(s.sessions.map((session) => [session.id, sessionSnapshot(session)])),
          sessions: s.sessions.map((session) => ({
            ...session,
            _id: session._id || recordIdBySessionId.get(session.id),
          })),
        }));
      },

      saveSession: async (id) => {
        const state = usePlaybook.getState();
        const row = state.sessions.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.sessions];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.sessions];
        }
        if (!tableId) throw new Error("playbook_sessions table not found in tableMap");

        let recordId = row._id;
        if (!recordId) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.sessions);
          recordId = records.find((record) => {
            const recordIdValue = readRecordValue(record, ["id", "sessionId", "Session ID", "topic", "Topic"]);
            return recordIdValue === row.id || record?.id === row.id;
          })?.id || undefined;
        }

        const fields = {
          id: row.id,
          type: row.type || "Workshop",
          topic: row.topic || "",
          module: row.module || "",
          date: row.date || "",
          duration: row.duration || "",
          facilitator: row.facilitator || "",
          location: row.location || "",
          status: row.status || "Scheduled",
        };

        const savedRecordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.sessions, recordId, fields);
        set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, _id: savedRecordId || x._id } : x)) }));
      },

      addAttendee: (a) => set((st) => ({ attendees: [...st.attendees, { id: uid(), ...a }] })),
      updateAttendee: (id, patch) => set((st) => ({ attendees: st.attendees.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteAttendee: async (id) => {
        const state = usePlaybook.getState();
        const row = state.attendees.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.attendees];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.attendees];
        }
        if (!tableId) return;

        const recordId = row._id || (await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.attendees)).find((record) => {
          const recordIdValue = readRecordValue(record, ["id", "sessionId", "Session ID"]);
          return recordIdValue === row.id || record?.id === row.id;
        })?.id;

        if (!recordId) {
          set((s) => ({ attendees: s.attendees.filter((x) => x.id !== id) }));
          return;
        }

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        await fetch(`${apiBase?.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records?recordIds[]=${recordId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        set((s) => ({ attendees: s.attendees.filter((x) => x.id !== id) }));
      },
      syncAttendeesFromTable: async () => {
        try {
          const state = usePlaybook.getState();
          let tableId = state.tableMap[PLAYBOOK_TABLES.attendees];
          if (!tableId) {
            await state.fetchTables();
            tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.attendees];
          }
          if (!tableId) return;

          const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.attendees);
          set({ attendees: rows.map((record) => normalizeAttendeeRecord(record)) });
        } catch (err) {
          console.error("playbook-store: syncAttendeesFromTable failed", err);
        }
      },
      saveAttendee: async (id) => {
        const state = usePlaybook.getState();
        const row = state.attendees.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.attendees];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.attendees];
        }
        if (!tableId) throw new Error("playbook_attendees table not found in tableMap");

        let recordId = row._id;
        if (!recordId) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.attendees);
          recordId = records.find((record) => {
            const recordIdValue = readRecordValue(record, ["id", "sessionId", "Session ID"]);
            return recordIdValue === row.id || record?.id === row.id;
          })?.id || undefined;
        }

        const fields = {
          id: row.id,
          sessionId: row.sessionId || "",
          firstName: row.firstName || "",
          lastName: row.lastName || "",
          role: row.role || "",
          department: row.department || "",
          attendance: row.attendance || "✅ Present",
          signed: row.signed || "⏳ Pending",
          notes: row.notes || "",
        };

        const savedRecordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.attendees, recordId, fields);
        set((s) => ({ attendees: s.attendees.map((x) => (x.id === id ? { ...x, _id: savedRecordId || x._id } : x)) }));
      },

      addSignOff: (s) => set((st) => ({ signOffs: [...st.signOffs, { id: uid(), ...s }] })),
      updateSignOff: (id, patch) => set((st) => ({ signOffs: st.signOffs.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSignOff: async (id) => {
        const state = usePlaybook.getState();
        const row = state.signOffs.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.signoffs];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.signoffs];
        }
        if (!tableId) return;

        const recordId = row._id || (await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.signoffs)).find((record) => {
          const recordIdValue = readRecordValue(record, ["id", "person", "Person"]);
          return recordIdValue === row.id || record?.id === row.id;
        })?.id;

        if (!recordId) {
          set((s) => ({ signOffs: s.signOffs.filter((x) => x.id !== id) }));
          return;
        }

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        await fetch(`${apiBase?.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records?recordIds[]=${recordId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        set((s) => ({ signOffs: s.signOffs.filter((x) => x.id !== id) }));
      },

      addEmail: (e) => set((st) => ({ emails: [...st.emails, { id: uid(), ...e }] })),
      updateEmail: (id, patch) => set((st) => ({ emails: st.emails.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteEmail: async (id) => {
        const state = usePlaybook.getState();
        const row = state.emails.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.emailLogs];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.emailLogs];
        }
        if (!tableId) return;

        const recordId = row._id || (await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.emailLogs)).find((record) => {
          const recordIdValue = readRecordValue(record, ["id", "emailId", "Email ID"]);
          return recordIdValue === row.id || record?.id === row.id;
        })?.id;

        if (!recordId) {
          set((s) => ({ emails: s.emails.filter((x) => x.id !== id) }));
          return;
        }

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        await fetch(`${apiBase?.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records?recordIds[]=${recordId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        set((s) => ({ emails: s.emails.filter((x) => x.id !== id) }));
      },
      syncEmailLogsFromTable: async () => {
        try {
          const state = usePlaybook.getState();
          let tableId = state.tableMap[PLAYBOOK_TABLES.emailLogs];
          if (!tableId) {
            await state.fetchTables();
            tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.emailLogs];
          }
          if (!tableId) return;

          const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.emailLogs);
          set({ emails: rows.map((record) => normalizeEmailLogRecord(record)) });
        } catch (err) {
          console.error("playbook-store: syncEmailLogsFromTable failed", err);
        }
      },
      saveEmail: async (id) => {
        const state = usePlaybook.getState();
        const row = state.emails.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.emailLogs];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.emailLogs];
        }
        if (!tableId) throw new Error("playbook_email_logs table not found in tableMap");

        let recordId = row._id;
        if (!recordId) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.emailLogs);
          recordId = records.find((record) => {
            const recordIdValue = readRecordValue(record, ["id", "emailId", "Email ID"]);
            return recordIdValue === row.id || record?.id === row.id;
          })?.id || undefined;
        }

        const fields = {
          id: row.id,
          week: row.week ?? 1,
          date: row.date || row.dateSent || "",
          subject: row.subject || "",
          recipients: row.recipients || row.sentTo || "",
          status: row.status || "PENDING",
          summary: row.summary || row.completed || "",
          highlights: row.highlights || row.planned || "",
          blockers: row.blockers || row.openIssues || "",
          sent: Boolean(row.sent),
        };

        const savedRecordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.emailLogs, recordId, fields);
        set((s) => ({ emails: s.emails.map((x) => (x.id === id ? { ...x, _id: savedRecordId || x._id } : x)) }));
      },

      addIssue: (i) => set((st) => ({ issues: [...st.issues, { id: uid(), ...i }] })),
      updateIssue: (id, patch) => set((st) => ({ issues: st.issues.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteIssue: async (id) => {
        const state = usePlaybook.getState();
        const row = state.issues.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.issues];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.issues];
        }
        if (!tableId) return;

        const recordId = row._id || (await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.issues)).find((record) => {
          const recordIdValue = readRecordValue(record, ["id", "issueId", "Issue ID", "ref", "Ref"]);
          return recordIdValue === row.id || record?.id === row.id;
        })?.id;

        if (!recordId) {
          set((s) => ({ issues: s.issues.filter((x) => x.id !== id) }));
          return;
        }

        const apiBase = (window as any).apiBase as string | undefined;
        const token = (window as any).authToken as string | undefined;
        const org = await ensureOrganizationUUID(apiBase, token);
        if (!org) throw new Error("Organization UUID not available");

        await fetch(`${apiBase?.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records?recordIds[]=${recordId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        set((s) => ({ issues: s.issues.filter((x) => x.id !== id) }));
      },
      syncIssuesFromTable: async () => {
        try {
          const state = usePlaybook.getState();
          let tableId = state.tableMap[PLAYBOOK_TABLES.issues];
          if (!tableId) {
            await state.fetchTables();
            tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.issues];
          }
          if (!tableId) return;

          const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.issues);
          set({ issues: rows.map((record) => normalizeIssueRecord(record)) });
        } catch (err) {
          console.error("playbook-store: syncIssuesFromTable failed", err);
        }
      },
      saveIssue: async (id) => {
        const state = usePlaybook.getState();
        const row = state.issues.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.issues];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.issues];
        }
        if (!tableId) throw new Error("playbook_issues table not found in tableMap");

        let recordId = row._id;
        if (!recordId) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.issues);
          recordId = records.find((record) => {
            const recordIdValue = readRecordValue(record, ["id", "issueId", "Issue ID", "ref", "Ref"]);
            return recordIdValue === row.id || record?.id === row.id;
          })?.id || undefined;
        }

        const fields = {
          id: row.id,
          ref: row.ref || "",
          phase: row.phase || "",
          type: row.type || "👤 User Error",
          description: row.description || "",
          owner: row.owner || "PLEXA",
          assignedTo: row.assignedTo || row.reportedBy || "",
          priority: row.priority || "MEDIUM",
          raisedAt: row.raisedAt || "",
          dueDate: row.dueDate || "",
          status: row.status || "Open",
          resolution: row.resolution || "",
          closedDate: row.closedDate || "",
          reportedBy: row.reportedBy || "",
          archived: Boolean(row.archived),
        };

        const savedRecordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.issues, recordId, fields);
        set((s) => ({ issues: s.issues.map((x) => (x.id === id ? { ...x, _id: savedRecordId || x._id } : x)) }));
      },

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
      syncUsersFromTable: async () => {
        const state = usePlaybook.getState();
        const tableId = state.tableMap[PLAYBOOK_TABLES.users];
        if (!tableId) return;
        const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.users);
        set({ userAccounts: rows.map(normalizeUserRecord) });
      },
      saveUserAccount: async (id) => {
        const state = usePlaybook.getState();
        const row = state.userAccounts.find((x) => x.id === id);
        const tableId = state.tableMap[PLAYBOOK_TABLES.users];
        if (!row || !tableId) return;
        const fields = {
          id: row.id,
          name: row.name || "",
          email: row.email || "",
          phone: row.phone || "",
          position: row.position || "",
          role: row.role || "",
          department: row.department || "",
          status: row.status || "Pending",
        };
        const recordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.users, row._id, fields);
        set((s) => ({ userAccounts: s.userAccounts.map((x) => (x.id === id ? { ...x, _id: recordId } : x)) }));
      },

      addProject: (p) => set((st) => ({ projectDetails: [...st.projectDetails, { id: uid(), ...p }] })),
      updateProject: (id, patch) => set((st) => ({ projectDetails: st.projectDetails.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteProject: (id) => set((st) => ({ projectDetails: st.projectDetails.filter((x) => x.id !== id) })),
      replaceProjects: (rows) => set({ projectDetails: rows }),
      syncProjectsFromTable: async () => {
        const state = usePlaybook.getState();
        const tableId = state.tableMap[PLAYBOOK_TABLES.projects];
        if (!tableId) return;
        const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.projects);
        set({ projectDetails: rows.map(normalizeProjectRecord) });
      },
      saveProjectDetail: async (id) => {
        const state = usePlaybook.getState();
        const row = state.projectDetails.find((x) => x.id === id);
        const tableId = state.tableMap[PLAYBOOK_TABLES.projects];
        if (!row || !tableId) return;
        const fields = {
          id: row.id,
          code: row.code || "",
          name: row.name || "",
          type: row.type || "",
          client: row.client || "",
          pm: row.pm || "",
          startDate: row.startDate || "",
          endDate: row.endDate || "",
          value: row.value || "",
          status: row.status || "Live",
        };
        const recordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.projects, row._id, fields);
        set((s) => ({ projectDetails: s.projectDetails.map((x) => (x.id === id ? { ...x, _id: recordId } : x)) }));
      },

      addContractor: (c) => set((st) => ({ contractors: [...st.contractors, { id: uid(), ...c }] })),
      updateContractor: (id, patch) => set((st) => ({ contractors: st.contractors.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteContractor: (id) => set((st) => ({ contractors: st.contractors.filter((x) => x.id !== id) })),
      replaceContractors: (rows) => set({ contractors: rows }),
      syncContractorsFromTable: async () => {
        const state = usePlaybook.getState();
        const tableId = state.tableMap[PLAYBOOK_TABLES.contractors];
        if (!tableId) return;
        const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.contractors);
        set({ contractors: rows.map(normalizeContractorRecord) });
      },
      saveContractor: async (id) => {
        const state = usePlaybook.getState();
        const row = state.contractors.find((x) => x.id === id);
        const tableId = state.tableMap[PLAYBOOK_TABLES.contractors];
        if (!row || !tableId) return;
        const fields = {
          id: row.id,
          company: row.company || "",
          trade: row.trade || "",
          contact: row.contact || "",
          email: row.email || "",
          phone: row.phone || "",
          insurance: row.insurance || "",
          abn: row.abn || "",
          status: row.status || "Pending",
        };
        const recordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.contractors, row._id, fields);
        set((s) => ({ contractors: s.contractors.map((x) => (x.id === id ? { ...x, _id: recordId } : x)) }));
      },

      addCostCode: (c) => set((st) => ({ costCodes: [...st.costCodes, { id: uid(), ...c }] })),
      updateCostCode: (id, patch) => set((st) => ({ costCodes: st.costCodes.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteCostCode: (id) => set((st) => ({ costCodes: st.costCodes.filter((x) => x.id !== id) })),
      replaceCostCodes: (rows) => set({ costCodes: rows }),
      syncCostCodesFromTable: async () => {
        const state = usePlaybook.getState();
        const tableId = state.tableMap[PLAYBOOK_TABLES.costCodes];
        if (!tableId) return;
        const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.costCodes);
        set({ costCodes: rows.map(normalizeCostCodeRecord) });
      },
      saveCostCode: async (id) => {
        const state = usePlaybook.getState();
        const row = state.costCodes.find((x) => x.id === id);
        const tableId = state.tableMap[PLAYBOOK_TABLES.costCodes];
        if (!row || !tableId) return;
        const fields = {
          id: row.id,
          code: row.code || "",
          name: row.name || "",
          category: row.category || "",
          unit: row.unit || "",
          rate: row.rate || "",
          notes: row.notes || "",
        };
        const recordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.costCodes, row._id, fields);
        set((s) => ({ costCodes: s.costCodes.map((x) => (x.id === id ? { ...x, _id: recordId } : x)) }));
      },

      addReminderTask: (r) =>
        set((st) => ({
          reminderTasks: [
            ...st.reminderTasks,
            { id: r.id || uid(), createdAt: r.createdAt || new Date().toISOString(), ...r },
          ],
        })),
      updateReminderTask: (id, patch) =>
        set((st) => ({
          reminderTasks: st.reminderTasks.map((x) => {
            if (x.id !== id) return x;
            const merged = { ...x, ...patch };
            if (patch.status === "DONE" && !merged.completedAt) merged.completedAt = new Date().toISOString();
            if (patch.status && patch.status !== "DONE") merged.completedAt = undefined;
            return merged;
          }),
        })),
      deleteReminderTask: (id) =>
        set((st) => ({ reminderTasks: st.reminderTasks.filter((x) => x.id !== id) })),
      saveReminderTask: async (id) => {
        const state = usePlaybook.getState();
        const row = state.reminderTasks.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.reminderTasks];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.reminderTasks];
        }
        if (!tableId) throw new Error("playbook_reminder_tasks table not found in tableMap");

        let recordId = row._id;
        if (!recordId) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.reminderTasks);
          recordId = records.find((record) => {
            const recordTaskId = readRecordValue(record, ["id", "taskId", "Task ID"]);
            return recordTaskId === row.id || record?.id === row.id;
          })?.id || undefined;
        }

        const fields = {
          id: row.id,
          title: row.title || "",
          details: row.details || "",
          assignee: row.assignee || "",
          dueDate: row.dueDate || "",
          remindAt: row.remindAt || "",
          priority: row.priority || "MEDIUM",
          status: row.status || "OPEN",
          createdAt: row.createdAt || new Date().toISOString(),
          completedAt: row.completedAt || "",
        };

        const savedRecordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.reminderTasks, recordId, fields);
        set((s) => ({
          reminderTasks: s.reminderTasks.map((x) => (x.id === id ? { ...x, _id: savedRecordId || x._id } : x)),
        }));
      },

      syncSignOffsFromTable: async () => {
        try {
          const state = usePlaybook.getState();
          let tableId = state.tableMap[PLAYBOOK_TABLES.signoffs];
          if (!tableId) {
            await state.fetchTables();
            tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.signoffs];
          }
          if (!tableId) return;

          const rows = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.signoffs);
          set({ signOffs: rows.map((record) => normalizeSignOffRecord(record)) });
        } catch (err) {
          console.error("playbook-store: syncSignOffsFromTable failed", err);
        }
      },

      saveSignOff: async (id) => {
        const state = usePlaybook.getState();
        const row = state.signOffs.find((x) => x.id === id);
        if (!row) return;

        let tableId = state.tableMap[PLAYBOOK_TABLES.signoffs];
        if (!tableId) {
          await state.fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.signoffs];
        }
        if (!tableId) throw new Error("playbook_signoffs table not found in tableMap");

        let recordId = row._id;
        if (!recordId) {
          const records = await state.fetchTableRecords(tableId, PLAYBOOK_TABLES.signoffs);
          recordId = records.find((record) => {
            const recordIdValue = readRecordValue(record, ["id", "person", "Person"]);
            return recordIdValue === row.id || record?.id === row.id;
          })?.id || undefined;
        }

        const fields = {
          id: row.id,
          person: row.person || "",
          jobTitle: row.jobTitle || "",
          module: row.module || "",
          competency: row.competency || "Novice",
          status: row.status || "NOT STARTED",
          signedBy: row.signedBy || "",
          date: row.date || "",
        };

        const savedRecordId = await saveRecordToTable(tableId, PLAYBOOK_TABLES.signoffs, recordId, fields);
        set((s) => ({ signOffs: s.signOffs.map((x) => (x.id === id ? { ...x, _id: savedRecordId || x._id } : x)) }));
      },

      addIntranet: (r) => set((st) => ({ intranet: [...st.intranet, { id: uid(), ...r }] })),
      updateIntranet: (id, patch) =>
        set((st) => ({ intranet: st.intranet.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteIntranet: (id) => set((st) => ({ intranet: st.intranet.filter((x) => x.id !== id) })),

      fetchTables: async () => {
        try {
          const apiBase = (window as any).apiBase as string | undefined;
          const token = (window as any).authToken as string | undefined;
          if (!apiBase) {
            throw new Error("apiBase not available");
          }
          const org = await ensureOrganizationUUID(apiBase, token);
          if (!org) {
            throw new Error("Organization UUID not available; cannot fetch tables.");
          }
          const listUrl = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}/tables/`;
          const res = await fetch(listUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!res.ok) throw new Error(`Failed to fetch tables (${res.status})`);
          const json = await res.json();
          const tableList = json.data?.result || [];
          const newTableMap = Object.fromEntries(tableList.map((t: { name: string; id: string }) => [t.name, t.id]));
          set({ tableMap: newTableMap });
        } catch (err) {
          // non-fatal â€” keep existing tableMap
          // eslint-disable-next-line no-console
          console.error("playbook-store: fetchTables failed", err);
        }
      },

      fetchTableRecords: async (tableId: string, tableName: string) => {
        try {
          const apiBase = (window as any).apiBase as string | undefined;
          const token = (window as any).authToken as string | undefined;
          if (!apiBase) {
            throw new Error("apiBase not available");
          }
          const org = await ensureOrganizationUUID(apiBase, token);
          if (!org) {
            throw new Error("Organization UUID not available; cannot fetch table records.");
          }
          const url = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}/tables/${tableId}/records?p=${tableName}&fieldKeyType=name`;
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!res.ok) throw new Error(`Failed to fetch table records (${res.status})`);
          const json = await res.json();
          return json.data?.result?.records || [];
        } catch (err) {
          // non-fatal â€” return empty array
          // eslint-disable-next-line no-console
          console.error("playbook-store: fetchTableRecords failed", err);
          return [];
        }
      },

      syncClientFromTable: async () => {
        try {
          const state = usePlaybook.getState();
          const tableId = state.tableMap["playbook_client"];
          if (!tableId) {
            throw new Error("playbook_client table not found in tableMap");
          }
          const records = await usePlaybook.getState().fetchTableRecords(tableId, "playbook_client");
          if (records.length === 0) {
            throw new Error("No records found in playbook_client table");
          }
          // Assume first record is the primary client record
          const record = records[0];
          const clientData: Partial<ClientInfo> = {
            clientName: record.fields.clientName || record.clientName || record["Client Name"] || "",
            plexaLead: record.fields.plexaLead || record.plexaLead || record["Plexa Lead"] || "",
            clientLead: record.fields.clientLead || record.clientLead || record["Client Lead"] || "",
            goLiveDate: record.fields.goLiveDate || record.goLiveDate || record["Go-Live Date"] || "",
            accountManager: record.fields.accountManager || record.accountManager || record["Account Manager"] || "",
            _id: record.id,
          };
          set((s) => ({
            client: { ...s.client, ...clientData },
          }));
        } catch (err) {
          // non-fatal â€” keep existing client data
          // eslint-disable-next-line no-console
          console.error("playbook-store: syncClientFromTable failed", err);
        }
      },

      syncSeedDataFromApi: async () => {
        try {
          const state = usePlaybook.getState();
          const tableMap = state.tableMap || {};

          const nextState: Partial<PlaybookState> = {};
          let hasReturnedData = false;
          let hasPhaseData = false;

          const clientTableId = tableMap[PLAYBOOK_TABLES.client];
          if (clientTableId) {
            const clientRows = await state.fetchTableRecords(clientTableId, PLAYBOOK_TABLES.client);
            if (clientRows[0]) {
              hasReturnedData = true;
              const record = clientRows[0];
              nextState.client = {
                ...state.client,
                clientName: readRecordValue(record, ["clientName", "Client Name"]) || state.client.clientName,
                plexaLead: readRecordValue(record, ["plexaLead", "Plexa Lead"]) || state.client.plexaLead,
                clientLead: readRecordValue(record, ["clientLead", "Client Lead"]) || state.client.clientLead,
                goLiveDate: readRecordValue(record, ["goLiveDate", "Go-Live Date"]) || state.client.goLiveDate,
                accountManager: readRecordValue(record, ["accountManager", "Account Manager"]) || state.client.accountManager,
                _id: record.id,
              };
            }
          }

          const phaseTableId = tableMap[PLAYBOOK_TABLES.phases];
          if (phaseTableId) {
            const phaseRows = await state.fetchTableRecords(phaseTableId, PLAYBOOK_TABLES.phases);
            nextState.phases = phaseRows.map(normalizePhaseRecord);
            if (phaseRows.length) {
              hasReturnedData = true;
              hasPhaseData = true;
            }
          }

          const taskTableId = tableMap[PLAYBOOK_TABLES.tasks];
          if (taskTableId) {
            const taskRows = await state.fetchTableRecords(taskTableId, PLAYBOOK_TABLES.tasks);
            const tasks = taskRows.map(normalizeTaskRecord);
            nextState.tasks = tasks;
            nextState.lastSavedNotes = Object.fromEntries(tasks.map((task) => [task.id, task.notes || ""]));
            nextState.lastSavedTaskSnapshots = Object.fromEntries(
              tasks.map((task) => [task.id, { status: task.status, notes: task.notes || "" }])
            );
            if (taskRows.length) hasReturnedData = true;
          }

          const trainingTableId = tableMap[PLAYBOOK_TABLES.trainingModules];
          if (trainingTableId) {
            const trainingRows = await state.fetchTableRecords(trainingTableId, PLAYBOOK_TABLES.trainingModules);
            const trainingModules = trainingRows.map(normalizeTrainingModuleRecord);
            nextState.trainingModules = trainingModules;
            nextState.lastSavedTrainingModules = Object.fromEntries(
              trainingModules.map((module) => [module.id, trainingModuleSnapshot(module)])
            );
            if (trainingRows.length) hasReturnedData = true;
          }

          const stakeholderTableId = tableMap[PLAYBOOK_TABLES.stakeholders];
          if (stakeholderTableId) {
            const stakeholderRows = await state.fetchTableRecords(stakeholderTableId, PLAYBOOK_TABLES.stakeholders);
            nextState.stakeholders = stakeholderRows.map(normalizeStakeholderRecord);
            if (stakeholderRows.length) hasReturnedData = true;
          }

          const dodTableId = tableMap[PLAYBOOK_TABLES.dod];
          if (dodTableId) {
            const dodRows = await state.fetchTableRecords(dodTableId, PLAYBOOK_TABLES.dod);
            nextState.dod = dodRows.map(normalizeDodRecord);
            if (dodRows.length) hasReturnedData = true;
          }

          const workshopStepsTableId = tableMap[PLAYBOOK_TABLES.workshopSteps];
          if (workshopStepsTableId) {
            const workshopRows = await state.fetchTableRecords(workshopStepsTableId, PLAYBOOK_TABLES.workshopSteps);
            nextState.workshopSteps = workshopRows.map(normalizeWorkshopStepRecord);
            if (workshopRows.length) hasReturnedData = true;
          }

          const resistanceTableId = tableMap[PLAYBOOK_TABLES.resistanceProfiles];
          if (resistanceTableId) {
            const resistanceRows = await state.fetchTableRecords(resistanceTableId, PLAYBOOK_TABLES.resistanceProfiles);
            nextState.resistanceProfiles = resistanceRows.map(normalizeResistanceProfileRecord);
            if (resistanceRows.length) hasReturnedData = true;
          }

          const commandmentsTableId = tableMap[PLAYBOOK_TABLES.commandments];
          if (commandmentsTableId) {
            const commandRows = await state.fetchTableRecords(commandmentsTableId, PLAYBOOK_TABLES.commandments);
            nextState.commandments = commandRows.map(normalizeCommandmentRecord);
            if (commandRows.length) hasReturnedData = true;
          }

          const sessionsTableId = tableMap[PLAYBOOK_TABLES.sessions];
          if (sessionsTableId) {
            const sessionRows = await state.fetchTableRecords(sessionsTableId, PLAYBOOK_TABLES.sessions);
            nextState.sessions = sessionRows.map(normalizeSessionRecord);
            if (sessionRows.length) hasReturnedData = true;
          }

          const trainingScheduleTableId = tableMap[PLAYBOOK_TABLES.trainingSchedule];
          if (trainingScheduleTableId) {
            const scheduleRows = await state.fetchTableRecords(trainingScheduleTableId, PLAYBOOK_TABLES.trainingSchedule);
            nextState.trainingSchedule = normalizeTrainingScheduleRecords(scheduleRows);
            nextState.trainingScheduleItems = Object.fromEntries(
              scheduleRows.map((row) => [
                Number(readRecordValue(row, ["itemNumber", "Item Number", "n"])),
                normalizeTrainingScheduleItemState(row),
              ]).filter(([itemNumber]) => Boolean(itemNumber))
            );
            nextState.trainingScheduleRecordIds = Object.fromEntries(
              scheduleRows.map((row) => [
                Number(readRecordValue(row, ["itemNumber", "Item Number", "n"])),
                row?.id,
              ]).filter(([itemNumber, recordId]) => Boolean(itemNumber) && Boolean(recordId))
            );
            nextState.lastSavedTrainingScheduleItems = { ...nextState.trainingScheduleItems };
            if (scheduleRows.length) hasReturnedData = true;
          }

          set(nextState);
          return { hasAnyData: hasReturnedData, hasPhaseData };
        } catch (err) {
          console.error("playbook-store: syncSeedDataFromApi failed", err);
          return { hasAnyData: false, hasPhaseData: false };
        }
      },
      resetAll: () => set(initial as any),
    }));


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

function normalizeDateInput(value: string | undefined | null): string {
  const raw = value?.trim();
  if (!raw) return new Date().toISOString().slice(0, 10);
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

// Add N business days (skip Sat/Sun) to a date string (YYYY-MM-DD)
export function addBusinessDays(startDate: string, days: number): Date {
  const safeStart = normalizeDateInput(startDate);
  const d = new Date(safeStart);
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
  const safeStart = normalizeDateInput(startDate);
  const end = addBusinessDays(safeStart, weeks * 5);
  return end.toISOString().slice(0, 10);
}

// â”€â”€â”€ Schedule computation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const state = usePlaybook.getState();
  const perPhase = Math.max(1, Math.floor(totalBizDays / state.phases.length));
  const phaseRanges: Record<string, { startOffset: number; endOffset: number }> = {};
  let cursor = 0;
  state.phases.forEach((p, i) => {
    const isLast = i === state.phases.length - 1;
    const endOffset = isLast ? totalBizDays : cursor + perPhase;
    phaseRanges[p.id] = { startOffset: cursor, endOffset };
    cursor = endOffset;
  });

  const result: ScheduledTask[] = [];
  state.phases.forEach((p) => {
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
