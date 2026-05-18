// Auto-generated from Plexa Excel — register tabs.

export type SessionDef = { id: string; name: string; type: "Workshop" | "Training"; module: string };

export const SESSIONS: SessionDef[] = [
  { id: "W1", name: "HOD Workshop — Site, Safety & Quality", type: "Workshop", module: "" },
  { id: "W2", name: "HOD Workshop — Document Control", type: "Workshop", module: "" },
  { id: "W3", name: "HOD Workshop — Finance & AP", type: "Workshop", module: "" },
  { id: "W4", name: "HOD Workshop — Procurement", type: "Workshop", module: "" },
  { id: "W5", name: "HOD Workshop — Program & Scheduling", type: "Workshop", module: "" },
  { id: "W6", name: "HOD Workshop — Rollout Planning", type: "Workshop", module: "" },
  { id: "T1", name: "Training — 4A Site, Safety & Quality", type: "Training", module: "4A" },
  { id: "T2", name: "Training — 4B Document Control", type: "Training", module: "4B" },
  { id: "T3", name: "Training — 4C Email & Correspondence", type: "Training", module: "4C" },
  { id: "T4", name: "Training — 4D Program & Scheduling", type: "Training", module: "4D" },
  { id: "T5", name: "Training — 4E Budget & Finance", type: "Training", module: "4E" },
  { id: "T6", name: "Training — 4F O&M Handover", type: "Training", module: "4F" },
  { id: "T7", name: "Training — 4G Tenders & Procurement", type: "Training", module: "4G" },
];

export const CONTENT_TOPICS: Record<string, string[]> = {
  W1: ["Current SWMS process", "Current induction process", "Current permit process", "Future state demo on Plexa", "Gap identification", "Q&A and alignment"],
  W2: ["Current document management", "Folder structure review", "Current transmittal and markup process", "Future state demo", "Gap identification"],
  W3: ["Current finance and AP process", "ERP and integration review", "Current claims process", "Future state demo", "Gap identification"],
  W4: ["Current procurement and tendering", "Current RFI process", "Future state demo", "Gap identification"],
  W5: ["Current program and scheduling tools", "Future state demo", "Gap identification"],
  W6: ["Rollout sequence agreement", "Pilot site selection", "Training schedule sign-off", "Champion identification", "Resistant user identification", "Implementation itinerary approval"],
  T1: ["", "", ""],
  T2: ["", "", ""],
  T3: ["", "", ""],
  T4: ["", "", ""],
  T5: ["", "", ""],
  T6: ["", "", ""],
  T7: ["", "", ""],
};

export const COMPETENCY_MODULES = [
  { id: "4A", name: "HSEQ" },
  { id: "4B", name: "Document Control" },
  { id: "4C", name: "Correspondence" },
  { id: "4D", name: "Program & Schedule" },
  { id: "4E", name: "Budget & Finance" },
  { id: "4F", name: "O&M Handover" },
  { id: "4G", name: "Procurement" },
];

export const ATTENDEES_PER_SESSION = 20;
export const COMPETENCY_ROWS = 40;
export const ISSUE_ROWS = 60;
export const EMAIL_WEEKS = 20;
