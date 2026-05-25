export type TaskStatus = "NOT STARTED" | "IN PROGRESS" | "COMPLETE" | "BLOCKED";

export type PhaseId = "1A" | "1B" | "1C" | "2A" | "2B" | "2C" | "3" | "4";

export interface PhaseMeta {
  id: PhaseId;
  name: string;
  short: string;
  description: string;
}

export const PHASES: PhaseMeta[] = [
  { id: "1A", name: "Phase 1A", short: "Kickoff", description: "Kickoff meeting & nominations" },
  { id: "1B", name: "Phase 1B", short: "Discovery", description: "Current → future state discovery" },
  { id: "1C", name: "Phase 1C", short: "Pre-data", description: "Client deliverables & templates" },
  { id: "2A", name: "Phase 2A", short: "Setup", description: "Environment & data setup" },
  { id: "2B", name: "Phase 2B", short: "Export", description: "Data export (if applicable)" },
  { id: "2C", name: "Phase 2C", short: "Migration", description: "Data migration (if applicable)" },
  { id: "3", name: "Phase 3", short: "Workshops", description: "HOD workshops & rollout planning" },
  { id: "4", name: "Phase 4", short: "Training", description: "Training rollout & go-live" },
];

export interface Task {
  id: string;
  phase: PhaseId;
  title: string;
  owner: "PLEXA" | "CLIENT" | "PLEXA + CLIENT";
  status: TaskStatus;
  notes?: string;
}

export const SEED_TASKS: Task[] = [
  // 1A
  { id: "1.01", phase: "1A", title: "Nominate Plexa Authorised Representative", owner: "PLEXA", status: "COMPLETE", notes: "Lead CS Engineer — owns delivery, runs sessions, coordinates internally" },
  { id: "1.02", phase: "1A", title: "Nominate Client Authorised Representative", owner: "CLIENT", status: "COMPLETE", notes: "Decision-maker who can approve, unblock, and attend all sessions" },
  { id: "1.03", phase: "1A", title: "Nominate Client Template & Document Provider", owner: "CLIENT", status: "COMPLETE" },
  { id: "1.04", phase: "1A", title: "Confirm timeline and go-live target date — in writing", owner: "PLEXA + CLIENT", status: "COMPLETE" },
  { id: "1.05", phase: "1A", title: "Capture Company Overview: structure, projects, team, locations", owner: "CLIENT", status: "COMPLETE" },
  { id: "1.06", phase: "1A", title: "Define Key Objectives: what problems is Plexa solving?", owner: "CLIENT", status: "COMPLETE" },
  { id: "1.07", phase: "1A", title: "Define Key Challenges: current pain points across all teams", owner: "CLIENT", status: "COMPLETE" },
  { id: "1.08", phase: "1A", title: "Define Key Advantages: expected outcomes from Plexa", owner: "CLIENT", status: "COMPLETE" },
  { id: "1.09", phase: "1A", title: "Agree on Success Criteria: what does done look like?", owner: "PLEXA + CLIENT", status: "COMPLETE" },
  { id: "1.10", phase: "1A", title: "Agree on Measures of Success: how will adoption be tracked?", owner: "PLEXA + CLIENT", status: "COMPLETE" },
  { id: "1.11", phase: "1A", title: "Lock in weekly email cadence — confirm distribution list", owner: "PLEXA", status: "COMPLETE" },
  { id: "1.12", phase: "1A", title: "Schedule all Phase 1 sessions — send calendar invites", owner: "PLEXA", status: "COMPLETE" },
  // 1B
  { id: "1.13", phase: "1B", title: "Workflows & Approvals: current → Plexa", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.14", phase: "1B", title: "Design & Document Management: folders, transmittals, markups", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.15", phase: "1B", title: "Procurement & Contracting: tendering, negotiations, scope", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.16", phase: "1B", title: "Budgeting & Commercial Management: budget, CTC, forecasting", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.17", phase: "1B", title: "Finance & AP: invoice handling, subcontracts, EOM", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.18", phase: "1B", title: "Site & Project Ops: contractors, ITPs, goods receipting, defects", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.19", phase: "1B", title: "Safety & Quality: SWMS, permits, inductions, observations", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.20", phase: "1B", title: "Data Migrations & Integrations: full tech stack review", owner: "PLEXA + CLIENT", status: "IN PROGRESS" },
  { id: "1.21", phase: "1B", title: "Formally document scope: in vs out — client sign-off", owner: "PLEXA", status: "IN PROGRESS" },
  // 1C
  { id: "1.22", phase: "1C", title: "Client provides: User list (name, email, phone, position, role)", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.23", phase: "1C", title: "Client confirms: live project count and list", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.24", phase: "1C", title: "Client confirms: migrate data OR start fresh", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.25", phase: "1C", title: "Client provides: Folder Structure(s) per project type", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.26", phase: "1C", title: "Client provides: Workflow Templates (Docs, Finance, HSEQ)", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.27", phase: "1C", title: "Client provides: Budget Templates and Cost Code structure", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.28", phase: "1C", title: "Client provides: Equipment Checklists", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.29", phase: "1C", title: "Client provides: SWMS Review Checklist", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.30", phase: "1C", title: "Client provides: Injury / Incident / Observation Forms", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.31", phase: "1C", title: "Client provides: Meeting & Inspection Templates", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.32", phase: "1C", title: "Client provides: ITP & ITC Templates", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.33", phase: "1C", title: "Client provides: Permit Templates", owner: "CLIENT", status: "IN PROGRESS" },
  { id: "1.34", phase: "1C", title: "Client provides: Access to existing system for data export", owner: "CLIENT", status: "IN PROGRESS" },
  // 2A
  { id: "2.01", phase: "2A", title: "Set up production environment and test environment", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.02", phase: "2A", title: "Set up all folder structures per client templates", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.03", phase: "2A", title: "Set up workflow templates (Documents, Finance, HSEQ)", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.04", phase: "2A", title: "Set up cost codes from client budget templates", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.05", phase: "2A", title: "Set up budget templates", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.06", phase: "2A", title: "Set up SWMS Review Checklist", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.07", phase: "2A", title: "Set up Equipment Types and Checklists", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.08", phase: "2A", title: "Set up Injury / Incident / Observation categories", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.09", phase: "2A", title: "Set up Permit Types and Checklists", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.10", phase: "2A", title: "Set up Meetings & Inspections templates", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.11", phase: "2A", title: "Set up ITP & ITC templates", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.12", phase: "2A", title: "Set up Roles & Permissions per client org chart", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.13", phase: "2A", title: "Create all projects from Project Details tab", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.14", phase: "2A", title: "Import all users from User Accounts tab", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.15", phase: "2A", title: "Import all contractors from Contractor Database tab", owner: "PLEXA", status: "NOT STARTED" },
  // 2B
  { id: "2.16", phase: "2B", title: "Confirm cut-off date with client for financial data", owner: "CLIENT", status: "NOT STARTED" },
  { id: "2.17", phase: "2B", title: "Export: Project Directory", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.18", phase: "2B", title: "Export: Documents & Drawings", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.19", phase: "2B", title: "Export: Correspondence", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.20", phase: "2B", title: "Export: Photos", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.21", phase: "2B", title: "Export: SWMS", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.22", phase: "2B", title: "Export: Complete backup — store on Plexa Drive", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.23", phase: "2B", title: "Export: Commitments", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.24", phase: "2B", title: "Export: Variations", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.25", phase: "2B", title: "Export: Invoices", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.26", phase: "2B", title: "Export: Head Contract Claims & Variations", owner: "PLEXA", status: "NOT STARTED" },
  // 2C
  { id: "2.27", phase: "2C", title: "Create folder structure in Plexa", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.28", phase: "2C", title: "Upload Documents", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.29", phase: "2C", title: "Upload Project Directory", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.30", phase: "2C", title: "Upload & Approve SWMS (if previously approved)", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.31", phase: "2C", title: "Upload Site Photos", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.32", phase: "2C", title: "Upload Cost Codes", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.33", phase: "2C", title: "Upload Budget", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.34", phase: "2C", title: "Create Draft Commitments", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.35", phase: "2C", title: "Create Draft Head Contract Claims", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.36", phase: "2C", title: "Upload Direct & Indirect Costs", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.37", phase: "2C", title: "Upload SC Variations via Database", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.38", phase: "2C", title: "Raise Rollup Claims for all Commitments", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.39", phase: "2C", title: "Turn off external email notifications for Payment Schedules", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.40", phase: "2C", title: "Approve Claim Rollup", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.41", phase: "2C", title: "Raise and Approve Head Contract Claims", owner: "PLEXA", status: "NOT STARTED" },
  { id: "2.42", phase: "2C", title: "Connect Finance ERP to Plexa — test integration", owner: "PLEXA + CLIENT", status: "NOT STARTED" },
  { id: "2.43", phase: "2C", title: "Finance Reconciliation via Plexa Drive", owner: "PLEXA + CLIENT", status: "NOT STARTED" },
  // 3
  { id: "3.01", phase: "3", title: "Schedule all HOD Workshops — confirmed in all calendars", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.02", phase: "3", title: "HOD Workshop: Site, Safety & Quality", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.03", phase: "3", title: "HOD Workshop: Document Control", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.04", phase: "3", title: "HOD Workshop: Finance & AP", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.05", phase: "3", title: "HOD Workshop: Procurement", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.06", phase: "3", title: "HOD Workshop: Program & Scheduling", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.07", phase: "3", title: "HOD Workshop: Rollout Planning", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.08", phase: "3", title: "Document all gaps identified across every workshop", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.09", phase: "3", title: "Complete Stakeholder Map", owner: "PLEXA + CLIENT", status: "NOT STARTED" },
  { id: "3.10", phase: "3", title: "Identify Plexa Champions", owner: "PLEXA + CLIENT", status: "NOT STARTED" },
  { id: "3.11", phase: "3", title: "Identify Resistant Users", owner: "PLEXA + CLIENT", status: "NOT STARTED" },
  { id: "3.12", phase: "3", title: "Define conversion strategy per resistant user", owner: "PLEXA", status: "NOT STARTED" },
  { id: "3.13", phase: "3", title: "Agree on rollout sequence: modules and order", owner: "PLEXA + CLIENT", status: "NOT STARTED" },
  // 4
  { id: "4.01", phase: "4", title: "Run Module 4A — Site, Safety & Quality (Teach/Practice/Observe)", owner: "PLEXA", status: "NOT STARTED" },
  { id: "4.02", phase: "4", title: "Run Module 4B — Document Control, Workflows & Tasks", owner: "PLEXA", status: "NOT STARTED" },
  { id: "4.03", phase: "4", title: "Run Module 4C — Email & Correspondence", owner: "PLEXA", status: "NOT STARTED" },
  { id: "4.04", phase: "4", title: "Run Module 4D — Program & Scheduling", owner: "PLEXA", status: "NOT STARTED" },
  { id: "4.05", phase: "4", title: "Run Module 4E — Budget & Finance", owner: "PLEXA", status: "NOT STARTED" },
  { id: "4.06", phase: "4", title: "Run Module 4F — O&M Handover", owner: "PLEXA", status: "NOT STARTED" },
  { id: "4.07", phase: "4", title: "Run Module 4G — Tenders & Procurement", owner: "PLEXA", status: "NOT STARTED" },
  { id: "4.08", phase: "4", title: "Go-Live: switch projects to Plexa as system of record", owner: "PLEXA + CLIENT", status: "NOT STARTED" },
  { id: "4.09", phase: "4", title: "Hypercare: 2-week embedded support after go-live", owner: "PLEXA", status: "NOT STARTED" },
];

export const TRAINING_MODULES = [
  { id: "4A", name: "Site, Safety & Quality Management" },
  { id: "4B", name: "Document Control, Workflows & Tasks" },
  { id: "4C", name: "Email & Correspondence" },
  { id: "4D", name: "Program & Scheduling" },
  { id: "4E", name: "Budget & Finance" },
  { id: "4F", name: "O&M Handover" },
  { id: "4G", name: "Tenders & Procurement" },
];

export const WORKSHOP_STEPS = [
  { step: 1, title: "Introductions & Context", duration: "15 min", detail: "Why are we here? What is Plexa? What does this mean for your team? Frame it as making work easier — not a threat." },
  { step: 2, title: "Current State Deep Dive", duration: "30 min", detail: "Walk us through how you work today. Every system, every form, every approval. We want the pain, the workarounds, the frustrations." },
  { step: 3, title: "Future State Demonstration", duration: "20 min", detail: "Show their exact workflow — on Plexa. Use their language, their data, their forms." },
  { step: 4, title: "Gap Identification", duration: "15 min", detail: "Where are the gaps? What needs customisation? Document every gap." },
  { step: 5, title: "Question Time", duration: "15 min", detail: "Open floor. Every question is valid. Concerns mean engagement." },
  { step: 6, title: "Champion & Resistant User Identification", duration: "10 min", detail: "Who is excited? Who has influence? Who is sceptical?" },
  { step: 7, title: "Wrap Up & Next Steps", duration: "5 min", detail: "Confirm training dates. Send session summary within 24 hours." },
];

export const RESISTANCE_PROFILES = [
  { type: "The Skeptic", why: "Has seen too many failed system rollouts.", strategy: "Book a reference call with a Plexa champion from a similar client. Show — don't tell.", outcome: "Cautious believer. First real win seals it." },
  { type: "The Too Busy", why: "Genuinely overwhelmed. Sees this as more work.", strategy: "Show exactly what Plexa removes from their week. Quantify time saved. Do the first three tasks for them.", outcome: "Champion once they feel the load lift." },
  { type: "The Protector", why: "Worried team will be replaced by automation.", strategy: "Reframe: Plexa makes the team more valuable. Skills + better tools = stronger position.", outcome: "Reassured and actively engaged." },
  { type: "The Tech Averse", why: "Not confident with technology. Fears looking incompetent.", strategy: "One-on-one session before group training. Build confidence privately.", outcome: "Confident participant. Often a vocal supporter." },
  { type: "The Power Broker", why: "Sees Plexa's transparency as a threat to position.", strategy: "Involve them in setup decisions. Give them a champion role.", outcome: "Ownership converts gatekeepers to advocates." },
];

export const DOD_CRITERIA = [
  { cat: "PLATFORM", text: "All active projects created and configured on Plexa" },
  { cat: "PLATFORM", text: "All users onboarded — accounts active, roles and permissions set" },
  { cat: "PLATFORM", text: "All contractors imported and registered in contractor database" },
  { cat: "SITE", text: "All personnel signing in and out via Plexa site module" },
  { cat: "SITE", text: "All SWMS uploaded, review checklists completed, signed by all personnel" },
  { cat: "SITE", text: "All equipment inductions completed on platform" },
  { cat: "SITE", text: "At least one full induction cycle completed per project" },
  { cat: "SITE", text: "Permits, ITPs, ITCs, meetings and inspections active on platform" },
  { cat: "DOCUMENTS", text: "All project documents uploaded to correct folder structure" },
  { cat: "DOCUMENTS", text: "All drawings uploaded and accessible" },
  { cat: "DOCUMENTS", text: "At least one transmittal sent through Plexa per project" },
  { cat: "DOCUMENTS", text: "At least one workflow completed end-to-end on platform" },
  { cat: "FINANCE", text: "Cost codes configured and matching accounting system" },
  { cat: "FINANCE", text: "Budget set up for all active projects" },
  { cat: "FINANCE", text: "ONE FULL FINANCE CYCLE COMPLETE: invoices, claims, ERP synced, reconciled" },
  { cat: "FINANCE", text: "Accounting integration live and tested — sync confirmed" },
  { cat: "FINANCE", text: "Head Contract claims and variations set up for applicable projects" },
  { cat: "FINANCE", text: "AP module live — at least one invoice approved through Plexa" },
  { cat: "ADOPTION", text: "Platform adoption > 70% of licensed users active in past 30 days" },
  { cat: "ADOPTION", text: "Plexa Champions identified, trained and certified — self-sufficient" },
  { cat: "ADOPTION", text: "All resistant users engaged — documented strategy in place" },
  { cat: "TRAINING", text: "All training sessions completed — attendance registers on file" },
  { cat: "TRAINING", text: "All trainees signed off on Training Sign-Off register" },
  { cat: "SIGN-OFF", text: "CEO confirmed satisfaction in writing" },
  { cat: "SIGN-OFF", text: "CFO confirmed satisfaction with finance cycle and reconciliation" },
  { cat: "SIGN-OFF", text: "IT Lead confirmed integration and setup satisfactory" },
  { cat: "SIGN-OFF", text: "Final implementation summary sent to all stakeholders" },
  { cat: "HANDOVER", text: "Client Intranet Pack delivered — recordings, QSGs, registers, champions" },
  { cat: "HANDOVER", text: "Ongoing CS program initiated — 90-day check-in schedule agreed" },
];

export const STAKEHOLDER_SEEDS = [
  { name: "Travis Mitchell", role: "CEO", dept: "Executive", influence: "High" as const, sentiment: "Unknown" as const },
  { name: "", role: "CFO", dept: "Executive", influence: "High" as const, sentiment: "Unknown" as const },
  { name: "Anthony", role: "IT Manager", dept: "IT & Systems", influence: "High" as const, sentiment: "Unknown" as const },
  { name: "Rebecca", role: "Finance Manager", dept: "Finance", influence: "High" as const, sentiment: "Unknown" as const },
  { name: "Phil Crimmins", role: "Project Manager", dept: "Site", influence: "High" as const, sentiment: "Unknown" as const },
];

export const COMMANDMENTS = [
  { n: "01", t: "Set clear deadlines — with the customer", d: "Every phase has a start date, end date, and owner confirmed in writing. No open-ended timelines." },
  { n: "02", t: "Understand what they want to achieve", d: "Document their 3–5 measurable objectives in the kickoff. Filter every decision through them." },
  { n: "03", t: "Understand why they're changing to Plexa", d: "What broke? What system failed them? The 'why' is your compass." },
  { n: "04", t: "Define what success looks like to them", d: "Success is not 'go-live'. Ask: in 90 days, what would make you say this was the best decision?" },
  { n: "05", t: "Identify every pain point — and show how Plexa solves it", d: "Map every pain to a feature. If Plexa doesn't solve it, say so." },
  { n: "06", t: "Weekly emails — no exceptions", d: "Every Friday. CEO, CFO, IT, Site, Ops. Status (Green/Amber/Red), done, next, issues, photos." },
  { n: "07", t: "Understand their process — give best practice", d: "Don't force Plexa onto their old way. Show them how Plexa does it better." },
  { n: "08", t: "Log everything", d: "If it's not logged, it didn't happen. Issues, queries, decisions — all in the playbook." },
  { n: "09", t: "Confirm everything in writing — CC stakeholders", d: "Verbal agreements don't exist. Email everything. CC CEO, CFO, IT Lead." },
  { n: "10", t: "Hold points are not optional", d: "Every hold point is a gate. The next phase doesn't begin until it's signed off." },
];
