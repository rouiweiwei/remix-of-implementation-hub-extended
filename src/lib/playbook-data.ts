export type TaskStatus = "NOT STARTED" | "IN PROGRESS" | "COMPLETE" | "BLOCKED";

export type PhaseId = "1A" | "1B" | "1C" | "2A" | "2B" | "2C" | "3" | "4";

export interface Task {
  id: string;
  _id?: string;
  phase: PhaseId;
  title: string;
  owner: "PLEXA" | "CLIENT" | "PLEXA + CLIENT";
  status: TaskStatus;
  notes?: string;
  completedAt?: string; // ISO timestamp — stamped when status moves to COMPLETE
}

export const PLAYBOOK_TABLES = {
  client: "playbook_client",
  phases: "playbook_phases",
  tasks: "playbook_tasks",
  noteHistory: "playbook_note_history",
  trainingModules: "playbook_training_modules",
  trainingSchedule: "playbook_training_schedule",
  sessions: "playbook_sessions",
  sessionTopics: "playbook_session_topics",
  workshopSteps: "playbook_workshop_steps",
  resistanceProfiles: "playbook_resistance",
  dod: "playbook_dod",
  stakeholders: "playbook_stakeholders",
  commandments: "playbook_commandments",
  users: "playbook_users",
  projects: "playbook_projects",
  contractors: "playbook_contractors",
  costCodes: "playbook_cost_codes",
  reminderTasks: "playbook_reminder_tasks",
  attendees: "playbook_attendees",
  signoffs: "playbook_signoffs",
  emailLogs: "playbook_email_logs",
  issues: "playbook_issues",
} as const;
