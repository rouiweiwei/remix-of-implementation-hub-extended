import { useState, useRef, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { ensureOrganizationUUID, usePlaybook, type Attendee, type EmailLog, type Issue, type SignOff } from "@/lib/playbook-store";
import { PLAYBOOK_TABLES } from "@/lib/playbook-data";
import { SectionHeader, StatusBadge } from "../shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Check, Download, Upload, Send, Sparkles, FileSpreadsheet, Save } from "lucide-react";
import { EmailAutomationPanel } from "./EmailAutomation";
import { buildWeeklyAutoFill } from "@/lib/email-templates";
import { cn } from "@/lib/utils";

import { CONTENT_TOPICS, COMPETENCY_MODULES } from "@/lib/registers-data";

// =============== SESSION REGISTER ===============
type SessionRow = { date: string; facilitator: string; status: string; location: string };
const SESSION_STATUSES = ["Scheduled", "In Progress", "Completed", "Blocked"] as const;
const SESSION_STATUS_CLS: Record<string, string> = {
  Scheduled: "bg-primary/15 text-primary border-primary/30",
  "In Progress": "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40",
  Completed: "bg-success/15 text-success border-success/30",
  Blocked: "bg-destructive/15 text-destructive border-destructive/30",
};

export function SessionRegisterSection() {
  const sessions = usePlaybook((s) => s.sessions);
  const updateSession = usePlaybook((s) => s.updateSession);
  const deleteSession = usePlaybook((s) => s.deleteSession);
  const saveSessions = usePlaybook((s) => s.saveSessions);
  const syncSessionsFromTable = usePlaybook((s) => s.syncSessionsFromTable);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    void syncSessionsFromTable();
  }, [syncSessionsFromTable]);

  const upd = (id: string, patch: Partial<SessionRow>) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    updateSession(id, {
      date: patch.date ?? session.date,
      facilitator: patch.facilitator ?? session.facilitator,
      status: (patch.status as any) ?? session.status,
      location: patch.location ?? session.location,
    });
  };

  const handleSave = async () => {
    try {
      setSaveStatus("saving");
      await saveSessions();
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error) {
      console.error("Session save failed", error);
      setSaveStatus("error");
      window.setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const total = sessions.length;
  const complete = sessions.filter((r) => r.status === "Completed").length;
  const scheduled = sessions.filter((r) => r.status === "Scheduled").length;
  const workshops = sessions.filter((s) => s.type === "Workshop").length;
  const trainings = sessions.filter((s) => s.type === "Training").length;

  return (
    <div className="space-y-5">
      <SectionHeader title="📅 Session Register" subtitle="All Workshops & Training Sessions — every session, every date, every facilitator. Nothing unlogged." />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
        {[
          { label: "TOTAL SESSIONS", value: total },
          { label: "COMPLETE", value: complete, tone: "text-success" },
          { label: "SCHEDULED", value: scheduled, tone: "text-primary" },
          { label: "WORKSHOPS", value: workshops },
          { label: "TRAINING", value: trainings },
        ].map((t) => (
          <div key={t.label} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</div>
            <div className={cn("text-lg font-bold tabular-nums", t.tone)}>{t.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-primary-soft px-4 py-3 border-b">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary flex flex-wrap items-center justify-between gap-3">
            Session Register · Live table sync
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
                saveStatus === "saved" && "bg-success hover:bg-success",
                saveStatus === "error" && "bg-destructive hover:bg-destructive"
              )}
            >
              <Save className="h-4 w-4" />
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Retry Save" : "Save Changes"}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[1100px]">
          <thead className="bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left w-12">ID</th>
              <th className="px-2 py-2 text-left">Session Name</th>
              <th className="px-2 py-2 text-left w-24">Type</th>
              <th className="px-2 py-2 text-left w-20">Module</th>
              <th className="px-2 py-2 text-left w-32">Date</th>
              <th className="px-2 py-2 text-left w-40">Facilitator</th>
              <th className="px-2 py-2 text-left w-32">Status</th>
              <th className="px-2 py-2 text-left w-48">Location / Link</th>
              <th className="px-2 py-2 text-left w-36">Attendance Sheet</th>
              <th className="px-2 py-2 text-left w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-muted/20">
                <td className="px-2 py-1.5 font-mono font-semibold">{s.id}</td>
                <td className="px-2 py-1.5">{s.topic || "(untitled session)"}</td>
                  <td className="px-2 py-1.5">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      s.type === "Workshop" ? "bg-primary-soft text-primary border-primary/30" : "bg-accent text-foreground border-border")}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono">{s.module || "—"}</td>
                  <td className="px-2 py-1.5"><Input type="date" className="h-7 text-xs" value={s.date || ""} onChange={(e) => upd(s.id, { date: e.target.value })} /></td>
                  <td className="px-2 py-1.5"><Input className="h-7 text-xs" value={s.facilitator || ""} onChange={(e) => upd(s.id, { facilitator: e.target.value })} placeholder="Name…" /></td>
                  <td className="px-2 py-1.5">
                    <Select value={s.status || "Scheduled"} onValueChange={(v) => upd(s.id, { status: v })}>
                      <SelectTrigger className={cn("h-7 text-[11px] font-semibold border", SESSION_STATUS_CLS[s.status || "Scheduled"])}><SelectValue /></SelectTrigger>
                      <SelectContent>{SESSION_STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1.5"><Input className="h-7 text-xs" value={s.location || ""} onChange={(e) => upd(s.id, { location: e.target.value })} placeholder="Address or video link" /></td>
                  <td className="px-2 py-1.5 text-[11px] text-primary">→ Attendance: {s.id}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => void deleteSession(s.id)} title="Delete session row">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============== ATTENDANCE REGISTER ===============
const ATTENDANCE_STATES = ["✅ Present", "❌ Absent", "📅 Rescheduled"] as const;
const SIGNED_STATES = ["⏳ Pending", "✅ Signed", "❌ Not Signed"] as const;
const emptyAttendee = (): Omit<Attendee, "id" | "_id"> => ({ sessionId: "", firstName: "", lastName: "", role: "", department: "", attendance: "✅ Present", signed: "⏳ Pending", notes: "" });

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = String(full || "").trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function AttendanceSection() {
  const attendees = usePlaybook((s) => s.attendees);
  const sessions = usePlaybook((s) => s.sessions);
  const userAccounts = usePlaybook((s) => s.userAccounts);
  const addAttendee = usePlaybook((s) => s.addAttendee);
  const updateAttendee = usePlaybook((s) => s.updateAttendee);
  const deleteAttendee = usePlaybook((s) => s.deleteAttendee);
  const saveAttendee = usePlaybook((s) => s.saveAttendee);
  const syncAttendeesFromTable = usePlaybook((s) => s.syncAttendeesFromTable);
  const syncUsersFromTable = usePlaybook((s) => s.syncUsersFromTable);
  const [savingId, setSavingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [meta, setMeta] = useState<Record<string, { date: string; facilitator: string; location: string }>>(() =>
    Object.fromEntries(sessions.map((s) => [s.id, { date: s.date, facilitator: s.facilitator, location: s.location }]))
  );

  useEffect(() => {
    void syncAttendeesFromTable();
    void syncUsersFromTable();
  }, [syncAttendeesFromTable, syncUsersFromTable]);

  const updMeta = (id: string, patch: Partial<{ date: string; facilitator: string; location: string }>) =>
    setMeta((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  const addRow = (sessionId: string) => {
    addAttendee({ ...emptyAttendee(), sessionId });
  };
  const saveRow = async (id: string) => {
    setSavingId(id);
    try {
      await saveAttendee(id);
    } finally {
      setSavingId(null);
    }
  };

  const mergeImported = (sessionId: string, imported: Omit<Attendee, "id" | "_id" | "sessionId">[]) => {
    imported.forEach((row) => addAttendee({ ...row, sessionId }));
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Full Name", "Role", "Department"],
      ["Jane Doe", "Site Engineer", "Construction"],
      ["John Smith", "HSEQ Manager", "HSEQ"],
    ]);
    ws["!cols"] = [{ wch: 28 }, { wch: 24 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendees");
    XLSX.writeFile(wb, "attendance-template.xlsx");
  };

  const handleImport = async (id: string, file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
    const imported: Omit<Attendee, "id" | "_id" | "sessionId">[] = data.map((r) => {
      const fullKey = Object.keys(r).find((k) => /full\s*name|name/i.test(k));
      const roleKey = Object.keys(r).find((k) => /role|title|position/i.test(k));
      const deptKey = Object.keys(r).find((k) => /department|dept|team/i.test(k));
      const full = fullKey ? String(r[fullKey] ?? "") : "";
      const { firstName, lastName } = splitFullName(full);
      return {
        firstName,
        lastName,
        role: roleKey ? String(r[roleKey] ?? "") : "",
        department: deptKey ? String(r[deptKey] ?? "") : "",
        attendance: "✅ Present" as Attendee["attendance"],
        signed: "⏳ Pending" as Attendee["signed"],
        notes: "",
      };
    }).filter((r) => r.firstName || r.lastName);
    mergeImported(id, imported);
  };
  const importFromUsers = (id: string) => {
    const imported: Omit<Attendee, "id" | "_id" | "sessionId">[] = userAccounts.map((u) => {
      const parts = String(u.name || "").trim().split(/\s+/);
      return {
        firstName: parts.shift() || "",
        lastName: parts.join(" ") || "",
        role: u.role || u.position || "",
        department: u.department || "",
        attendance: "✅ Present" as Attendee["attendance"],
        signed: "⏳ Pending" as Attendee["signed"],
        notes: "",
      };
    });
    mergeImported(id, imported);
  };


  return (
    <div className="space-y-5">
      <SectionHeader title="✅ Attendance Register" subtitle="Every session · Every person. Absent = rescheduled before sign-off. No sign-off without attendance. This register is kept on file and delivered to client." />

      <div className="rounded-lg border bg-muted/20 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold mr-1">Bulk tools:</span>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={downloadTemplate}>
          <Download className="h-3 w-3" /> Download Excel template
        </Button>
        <span className="text-[10px] text-muted-foreground">Template columns: Full Name · Role · Department. Per-session Import / Add Row / Auto-fill from User Accounts below.</span>
      </div>

      {sessions.map((s) => (
        <div key={s.id} className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-2 bg-primary/10 border-b border-primary/30 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-bold">
              <span className="font-mono text-primary mr-2">{s.id}</span>
              <span className="text-[10px] uppercase tracking-wider mr-2 text-muted-foreground">{s.type}:</span>
              {s.topic}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                ref={(el) => { fileRefs.current[s.id] = el; }}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImport(s.id, f);
                  e.target.value = "";
                }}
              />
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => fileRefs.current[s.id]?.click()}>
                <Upload className="h-3 w-3" /> Import Excel
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => importFromUsers(s.id)}>
                <Sparkles className="h-3 w-3" /> Auto-fill from User Accounts
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => addRow(s.id)}>
                <Plus className="h-3 w-3" /> Add Row
              </Button>
            </div>
          </div>
          <div className="px-3 py-2 bg-muted/20 border-b grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-xs">
            <label className="flex items-center gap-2"><span className="font-semibold w-20">Date:</span><Input type="date" className="h-7 text-xs" value={meta[s.id].date} onChange={(e) => updMeta(s.id, { date: e.target.value })} /></label>
            <label className="flex items-center gap-2"><span className="font-semibold w-20">Facilitator:</span><Input className="h-7 text-xs" value={meta[s.id].facilitator} onChange={(e) => updMeta(s.id, { facilitator: e.target.value })} /></label>
            <label className="flex items-center gap-2 md:col-span-2"><span className="font-semibold w-20">Location:</span><Input className="h-7 text-xs" value={meta[s.id].location} onChange={(e) => updMeta(s.id, { location: e.target.value })} /></label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              <thead className="bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 text-left w-20">Ref</th>
                  <th className="px-2 py-2 text-left">First Name</th>
                  <th className="px-2 py-2 text-left">Last Name</th>
                  <th className="px-2 py-2 text-left w-40">Role / Title</th>
                  <th className="px-2 py-2 text-left w-32">Department</th>
                  <th className="px-2 py-2 text-left w-36">Attendance</th>
                  <th className="px-2 py-2 text-left w-40">Signed Training Form?</th>
                  <th className="px-2 py-2 text-left">Notes</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendees.filter((r) => r.sessionId === s.id).map((r, i) => {
                  const ref = `${s.id}-${String(i + 1).padStart(2, "0")}`;
                  return (
                    <tr key={r.id || ref} className="hover:bg-muted/20">
                      <td className="px-2 py-1 font-mono">{ref}</td>
                      <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.firstName} onChange={(e) => updateAttendee(r.id, { firstName: e.target.value })} /></td>
                      <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.lastName} onChange={(e) => updateAttendee(r.id, { lastName: e.target.value })} /></td>
                      <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.role} onChange={(e) => updateAttendee(r.id, { role: e.target.value })} /></td>
                      <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.department} onChange={(e) => updateAttendee(r.id, { department: e.target.value })} /></td>
                      <td className="px-2 py-1">
                        <Select value={r.attendance} onValueChange={(v) => updateAttendee(r.id, { attendance: v as Attendee["attendance"] })}>
                          <SelectTrigger className={cn("h-7 text-[11px] font-semibold",
                            r.attendance === "✅ Present" && "text-success",
                            r.attendance === "❌ Absent" && "text-destructive",
                            r.attendance === "📅 Rescheduled" && "text-warning-foreground")}><SelectValue /></SelectTrigger>
                          <SelectContent>{ATTENDANCE_STATES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1">
                        <Select value={r.signed} onValueChange={(v) => updateAttendee(r.id, { signed: v as Attendee["signed"] })}>
                          <SelectTrigger className={cn("h-7 text-[11px] font-semibold",
                            r.signed === "✅ Signed" && "text-success",
                            r.signed === "❌ Not Signed" && "text-destructive")}><SelectValue /></SelectTrigger>
                          <SelectContent>{SIGNED_STATES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.notes} onChange={(e) => updateAttendee(r.id, { notes: e.target.value })} /></td>
                      <td className="px-2 py-1 whitespace-nowrap text-right">
                        <Button size="sm" variant={r._id ? "outline" : "default"} className="h-7 px-2 mr-1" disabled={savingId === r.id} onClick={() => void saveRow(r.id)} title={r._id ? "Update saved attendee" : "Save attendee to table"}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => void deleteAttendee(r.id)} title="Delete attendee row">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}


// =============== TRAINING COMPETENCY (Sign-Off) ===============
export function SignOffSection() {
  const rows = usePlaybook((s) => s.signOffs);
  const addSignOff = usePlaybook((s) => s.addSignOff);
  const updateSignOff = usePlaybook((s) => s.updateSignOff);
  const deleteSignOff = usePlaybook((s) => s.deleteSignOff);
  const saveSignOff = usePlaybook((s) => s.saveSignOff);
  const syncSignOffsFromTable = usePlaybook((s) => s.syncSignOffsFromTable);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    void syncSignOffsFromTable();
  }, [syncSignOffsFromTable]);

  const addRow = () => {
    const id = Math.random().toString(36).slice(2, 10);
    addSignOff({
      id,
      person: "",
      jobTitle: "",
      module: COMPETENCY_MODULES[0]?.id || "",
      competency: "Novice",
      status: "NOT STARTED",
      signedBy: "",
      date: "",
    });
  };

  const saveRow = async (id: string) => {
    setSavingId(id);
    try {
      await saveSignOff(id);
    } finally {
      setSavingId(null);
    }
  };

  const total = rows.length;
  const complete = rows.filter((r) => r.status === "COMPLETE").length;
  const inProg = rows.filter((r) => r.status === "IN PROGRESS").length;
  const notStarted = rows.filter((r) => r.status === "NOT STARTED").length;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="🖊️ Training Sign-Off Register"
        subtitle="Individual competency records loaded from playbook_signoffs. Add a new signer, update the row, and save or delete it from the live table."
      >
        <Button size="sm" onClick={addRow}><Plus className="h-4 w-4" /> Add sign-off</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-warning/10 border-warning/40 px-4 py-2 text-xs">
        <span className="font-semibold">HOW TO USE:</span> One row per trained person. Mark each module ✅ Signed Off once Part 3 (Observe) is complete AND the paper training form is signed.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
        {[
          { label: "TOTAL PEOPLE", value: total },
          { label: "IN PROGRESS", value: inProg, tone: "text-yellow-600 dark:text-yellow-400" },
          { label: "COMPLETE", value: complete, tone: "text-success" },
          { label: "NOT STARTED", value: notStarted, tone: "text-warning-foreground" },
        ].map((t) => (
          <div key={t.label} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</div>
            <div className={cn("text-lg font-bold tabular-nums", t.tone)}>{t.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[1300px]">
          <thead className="bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left w-10">#</th>
              <th className="px-2 py-2 text-left">Full Name</th>
              <th className="px-2 py-2 text-left w-40">Role</th>
              <th className="px-2 py-2 text-left w-32">Module</th>
              <th className="px-2 py-2 text-left w-32">Status</th>
              <th className="px-2 py-2 text-left w-32">Competency</th>
              <th className="px-2 py-2 text-left w-32">Signed By</th>
              <th className="px-2 py-2 text-left w-32">Date</th>
              <th className="px-2 py-2 text-left w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={r.id || i} className="hover:bg-muted/20 align-top">
                <td className="px-2 py-1 font-mono tabular-nums text-muted-foreground">{i + 1}</td>
                <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.person} onChange={(e) => updateSignOff(r.id, { person: e.target.value })} /></td>
                <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.jobTitle} onChange={(e) => updateSignOff(r.id, { jobTitle: e.target.value })} /></td>
                <td className="px-2 py-1">
                  <Select value={r.module} onValueChange={(v) => updateSignOff(r.id, { module: v })}>
                    <SelectTrigger className="h-7 text-[10px] font-semibold"><SelectValue placeholder="Select module" /></SelectTrigger>
                    <SelectContent>
                      {COMPETENCY_MODULES.map((m) => <SelectItem key={m.id} value={m.id}>{m.id} — {m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1">
                  <Select value={r.status} onValueChange={(v) => updateSignOff(r.id, { status: v as "NOT STARTED" | "IN PROGRESS" | "COMPLETE" | "BLOCKED" })}>
                    <SelectTrigger className={cn("h-7 text-[10px] font-semibold", r.status === "COMPLETE" && "text-success", r.status === "IN PROGRESS" && "text-yellow-600 dark:text-yellow-400", r.status === "NOT STARTED" && "text-warning-foreground")}><SelectValue /></SelectTrigger>
                    <SelectContent>{["NOT STARTED", "IN PROGRESS", "COMPLETE", "BLOCKED"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1">
                  <Select value={r.competency} onValueChange={(v) => updateSignOff(r.id, { competency: v as SignOff["competency"] })}>
                    <SelectTrigger className="h-7 text-[10px] font-semibold"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Novice", "Capable", "Proficient", "Expert"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.signedBy} onChange={(e) => updateSignOff(r.id, { signedBy: e.target.value })} /></td>
                <td className="px-2 py-1"><Input type="date" className="h-7 text-xs" value={r.date} onChange={(e) => updateSignOff(r.id, { date: e.target.value })} /></td>
                <td className="px-2 py-1 text-right whitespace-nowrap">
                  <Button size="sm" variant="outline" className="h-7 px-2 mr-1" disabled={savingId === r.id} onClick={() => void saveRow(r.id)}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => void deleteSignOff(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-xs text-muted-foreground">No sign-off rows yet. Add one to create the first entry.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============== WEEKLY EMAIL LOG ===============
const EMAIL_STATUSES = ["PENDING", "DRAFTED", "SENT"] as const;

export function EmailLogSection() {
  const emailLogs = usePlaybook((s) => s.emails);
  const addEmail = usePlaybook((s) => s.addEmail);
  const updateEmail = usePlaybook((s) => s.updateEmail);
  const deleteEmail = usePlaybook((s) => s.deleteEmail);
  const saveEmail = usePlaybook((s) => s.saveEmail);
  const syncEmailLogsFromTable = usePlaybook((s) => s.syncEmailLogsFromTable);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"log" | "auto">("auto");

  const client = usePlaybook((s) => s.client);
  const tasks = usePlaybook((s) => s.tasks);
  const taskOverrides = usePlaybook((s) => s.taskOverrides);
  const timelineMode = usePlaybook((s) => s.timelineMode);
  const startDate = usePlaybook((s) => s.startDate);
  const issues = usePlaybook((s) => s.issues);
  const stakeholders = usePlaybook((s) => s.stakeholders);
  const champions = usePlaybook((s) => s.champions);
  const dod = usePlaybook((s) => s.dod);
  const intranet = usePlaybook((s) => s.intranet);
  const sessions = usePlaybook((s) => s.sessions);

  const ctx = useMemo(() => ({
    client,
    tasks,
    taskOverrides,
    timelineMode,
    startDate,
    issues,
    stakeholders,
    champions,
    dod,
    intranet,
    sessions,
  }), [client, tasks, taskOverrides, timelineMode, startDate, issues, stakeholders, champions, dod, intranet, sessions]);

  useEffect(() => {
    void syncEmailLogsFromTable();
  }, [syncEmailLogsFromTable]);

  const addRow = () => {
    const id = Math.random().toString(36).slice(2, 10);
    addEmail({
      id,
      week: emailLogs.length + 1,
      date: "",
      subject: "",
      recipients: "CEO, CFO, IT Lead, Site Teams, Ops Managers",
      status: "PENDING",
      summary: "",
      highlights: "",
      blockers: "",
      sent: false,
      dateSent: "",
      phase: "",
      completed: "",
      planned: "",
      openIssues: "",
      sentTo: "CEO, CFO, IT Lead, Site Teams, Ops Managers",
    });
  };

  const saveRow = async (id: string) => {
    setSavingId(id);
    try {
      await saveEmail(id);
    } finally {
      setSavingId(null);
    }
  };

  const autoFill = (row: EmailLog) => {
    const dateAnchor = row.dateSent || row.date || new Date().toISOString().slice(0, 10);
    const fill = buildWeeklyAutoFill(ctx, { weekEndingDate: dateAnchor, weekNumber: (row.week || 1) });
    updateEmail(row.id, {
      completed: fill.completed,
      planned: fill.planned,
      openIssues: fill.openIssues,
      status: row.status === "PENDING" ? "DRAFTED" : row.status,
      summary: fill.completed,
      highlights: fill.planned,
      blockers: fill.openIssues,
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="📧 Weekly Client Email Log" subtitle="Auto-drafted from your live registers. Preview, copy, and send from your own inbox — or fill the weekly log table by hand.">
        <Button size="sm" onClick={addRow}><Plus className="h-4 w-4" /> Add email log</Button>
      </SectionHeader>

      <div className="inline-flex rounded-lg border bg-card p-0.5">
        {([
          { id: "auto", label: "✨ Auto-Drafts" },
          { id: "log", label: "📋 Weekly Log" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "auto" && <EmailAutomationPanel />}

      {tab === "log" && (
        <>
          <div className="rounded-xl border bg-primary-soft px-4 py-3 text-xs">
            <div className="font-semibold mb-1">TEMPLATE — Subject: Weekly Implementation Update — [CLIENT] | Week of [DATE]</div>
            <div className="text-muted-foreground">STATUS: [GREEN/AMBER/RED]  |  ✅ DONE THIS WEEK: [bullet list]  |  📅 NEXT WEEK: [bullet list]  |  ⚠️ OPEN ISSUES: [from Issues Register]  |  📸 PHOTOS / SIGNED SHEETS: [attached]</div>
          </div>

          <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full text-xs min-w-[1400px]">
              <thead className="bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 text-left w-12">Wk</th>
                  <th className="px-2 py-2 text-left w-32">Date Sent</th>
                  <th className="px-2 py-2 text-left w-28">Phase</th>
                  <th className="px-2 py-2 text-left">Completed This Week</th>
                  <th className="px-2 py-2 text-left">Planned Next Week</th>
                  <th className="px-2 py-2 text-left">Open Issues</th>
                  <th className="px-2 py-2 text-left w-40">Sent To</th>
                  <th className="px-2 py-2 text-left w-28">Status</th>
                  <th className="px-2 py-2 text-left w-28">Action</th>
                  <th className="px-2 py-2 text-left w-24">Auto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {emailLogs.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-muted/20 align-top">
                    <td className="px-2 py-1.5 font-mono font-semibold">W{r.week || i + 1}</td>
                    <td className="px-2 py-1.5"><Input type="date" className="h-7 text-xs" value={r.dateSent || r.date || ""} onChange={(e) => updateEmail(r.id, { dateSent: e.target.value, date: e.target.value })} /></td>
                    <td className="px-2 py-1.5"><Input className="h-7 text-xs" value={r.phase || ""} onChange={(e) => updateEmail(r.id, { phase: e.target.value })} placeholder="Phase 1A…" /></td>
                    <td className="px-2 py-1.5"><Textarea className="text-xs min-h-[28px]" rows={1} value={r.completed || r.summary || ""} onChange={(e) => updateEmail(r.id, { completed: e.target.value, summary: e.target.value })} /></td>
                    <td className="px-2 py-1.5"><Textarea className="text-xs min-h-[28px]" rows={1} value={r.planned || r.highlights || ""} onChange={(e) => updateEmail(r.id, { planned: e.target.value, highlights: e.target.value })} /></td>
                    <td className="px-2 py-1.5"><Textarea className="text-xs min-h-[28px]" rows={1} value={r.openIssues || r.blockers || ""} onChange={(e) => updateEmail(r.id, { openIssues: e.target.value, blockers: e.target.value })} /></td>
                    <td className="px-2 py-1.5"><Input className="h-7 text-xs" value={r.sentTo || r.recipients || ""} onChange={(e) => updateEmail(r.id, { sentTo: e.target.value, recipients: e.target.value })} /></td>
                    <td className="px-2 py-1.5">
                      <Select value={(r.status || "PENDING") as string} onValueChange={(v) => updateEmail(r.id, { status: v as EmailLog["status"] })}>
                        <SelectTrigger className={cn("h-7 text-[11px] font-semibold",
                          (r.status || "PENDING") === "SENT" && "text-success",
                          (r.status || "PENDING") === "DRAFTED" && "text-yellow-600 dark:text-yellow-400",
                          (r.status || "PENDING") === "PENDING" && "text-warning-foreground")}><SelectValue /></SelectTrigger>
                        <SelectContent>{EMAIL_STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <Button size="sm" variant={r._id ? "outline" : "default"} className="h-7 px-2 mr-1" disabled={savingId === r.id} onClick={() => void saveRow(r.id)} title={r._id ? "Update saved email log" : "Save email log to table"}>
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => void deleteEmail(r.id)} title="Delete email log row">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                    <td className="px-2 py-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => autoFill(r)} title="Auto-fill from live task data">
                        <Sparkles className="h-3 w-3 mr-1" /> Fill
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}


// =============== ISSUES REGISTER ===============
const ISSUE_TYPES = ["🐛 Bug/Defect", "👤 User Error", "✨ Feature Request", "⚙️ Configuration", "🔗 Integration", "📋 Process Gap", "🎓 Training Gap", "❓ Question", "📦 Data"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const ISSUE_STATUSES = ["Open", "In Progress", "Closed"] as const;

export function IssuesSection() {
  const rows = usePlaybook((s) => s.issues);
  const addIssue = usePlaybook((s) => s.addIssue);
  const updateIssue = usePlaybook((s) => s.updateIssue);
  const deleteIssue = usePlaybook((s) => s.deleteIssue);
  const saveIssue = usePlaybook((s) => s.saveIssue);
  const syncIssuesFromTable = usePlaybook((s) => s.syncIssuesFromTable);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    void syncIssuesFromTable();
  }, [syncIssuesFromTable]);

  const upd = (id: string, patch: Partial<Issue>) => updateIssue(id, patch);
  const addRow = () => addIssue({
    id: Math.random().toString(36).slice(2, 10),
    phase: "Phase 4",
    type: "👤 User Error",
    description: "",
    reportedBy: "",
    owner: "PLEXA",
    priority: "MEDIUM",
    raisedAt: "",
    status: "Open",
    resolution: "",
    archived: false,
  });
  const delRow = async (id: string) => {
    await deleteIssue(id);
  };
  const saveRow = async (id: string) => {
    setSavingId(id);
    try {
      await saveIssue(id);
    } finally {
      setSavingId(null);
    }
  };
  const toggleArchive = (id: string) => {
    const row = rows.find((r) => r.id === id);
    updateIssue(id, { archived: !row?.archived });
  };

  const active = rows.filter((r) => !r.archived);
  const archivedCount = rows.length - active.length;
  const counts = {
    bug: active.filter((r) => String(r.type || "").includes("Bug")).length,
    user: active.filter((r) => String(r.type || "").includes("User Error")).length,
    feature: active.filter((r) => String(r.type || "").includes("Feature")).length,
    training: active.filter((r) => String(r.type || "").includes("Training")).length,
    open: active.filter((r) => r.status === "Open" || r.status === "In Progress").length,
    closed: active.filter((r) => r.status === "Closed").length,
  };
  const visibleRows = rows.map((r) => ({ r })).filter(({ r }) => showArchived ? r.archived : !r.archived);


  return (
    <div className="space-y-5">
      <SectionHeader title="⚠️ Queries Register" subtitle="All types · implementation + training. Every query logged, typed, owned. Feature Requests go to the product roadmap. User Errors feed back into training. Nothing slips." />

      <div className="rounded-xl border bg-muted/30 px-4 py-2 text-xs">
        <span className="font-semibold">TYPES:</span> 🐛 Bug/Defect · 👤 User Error · ✨ Feature Request · ⚙️ Configuration · 🔗 Integration · 📋 Process Gap · 🎓 Training Gap · ❓ Question · 📦 Data
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
        {[
          { label: "🐛 BUG", value: counts.bug },
          { label: "👤 USER ERR", value: counts.user },
          { label: "✨ FEATURE", value: counts.feature },
          { label: "🎓 TRAINING", value: counts.training },
          { label: "OPEN", value: counts.open, tone: "text-warning-foreground" },
          { label: "CLOSED", value: counts.closed, tone: "text-success" },
        ].map((t) => (
          <div key={t.label} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</div>
            <div className={cn("text-lg font-bold tabular-nums", t.tone)}>{t.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[1400px]">
          <thead className="bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left w-10">#</th>
              <th className="px-2 py-2 text-left w-24">Phase</th>
              <th className="px-2 py-2 text-left w-40">Issue Type</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left w-32">Reported By</th>
              <th className="px-2 py-2 text-left w-28">Owner</th>
              <th className="px-2 py-2 text-left w-28">Priority</th>
              <th className="px-2 py-2 text-left w-32">Date Raised</th>
              <th className="px-2 py-2 text-left w-32">Status</th>
              <th className="px-2 py-2 text-left">Resolution / Notes</th>
              <th className="px-2 py-2 text-left w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visibleRows.map((row, index) => {
              const r = row.r;
              return (
              <tr key={r.id || index} className={cn("hover:bg-muted/20", r.archived && "opacity-60")}>
                <td className="px-2 py-1 font-mono tabular-nums text-muted-foreground">{index + 1}</td>
                <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.phase || ""} onChange={(e) => upd(r.id, { phase: e.target.value })} /></td>
                <td className="px-2 py-1">
                  <Select value={r.type || "👤 User Error"} onValueChange={(v) => upd(r.id, { type: v })}>
                    <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{ISSUE_TYPES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.description || ""} onChange={(e) => upd(r.id, { description: e.target.value })} /></td>
                <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.reportedBy || ""} onChange={(e) => upd(r.id, { reportedBy: e.target.value, assignedTo: e.target.value })} /></td>
                <td className="px-2 py-1">
                  <Select value={r.owner || "PLEXA"} onValueChange={(v) => upd(r.id, { owner: v })}>
                    <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="PLEXA">PLEXA</SelectItem><SelectItem value="CLIENT">CLIENT</SelectItem></SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1">
                  <Select value={r.priority || "MEDIUM"} onValueChange={(v) => upd(r.id, { priority: v as Issue["priority"] })}>
                    <SelectTrigger className={cn("h-7 text-[11px] font-semibold",
                      r.priority === "CRITICAL" && "text-destructive",
                      r.priority === "HIGH" && "text-warning-foreground",
                      r.priority === "MEDIUM" && "text-yellow-600 dark:text-yellow-400")}><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1"><Input type="date" className="h-7 text-xs" value={r.raisedAt || ""} onChange={(e) => upd(r.id, { raisedAt: e.target.value })} /></td>
                <td className="px-2 py-1">
                  <Select value={r.status || "Open"} onValueChange={(v) => upd(r.id, { status: v as Issue["status"] })}>
                    <SelectTrigger className={cn("h-7 text-[11px] font-semibold",
                      r.status === "Open" && "text-warning-foreground",
                      r.status === "Closed" && "text-success",
                      r.status === "In Progress" && "text-yellow-600 dark:text-yellow-400")}><SelectValue /></SelectTrigger>
                    <SelectContent>{ISSUE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.resolution || ""} onChange={(e) => upd(r.id, { resolution: e.target.value })} /></td>
                <td className="px-2 py-1 text-center whitespace-nowrap">
                  <Button size="sm" variant="ghost" className="h-7 px-2 mr-1" disabled={savingId === r.id} onClick={() => void saveRow(r.id)} title={r._id ? "Update saved issue" : "Save issue to table"}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                  <button onClick={() => toggleArchive(r.id)} className="text-muted-foreground hover:text-foreground text-xs mr-1" title={r.archived ? "Restore" : "Archive"}>
                    {r.archived ? "↺" : "📦"}
                  </button>
                  <button onClick={() => void delRow(r.id)} className="text-muted-foreground hover:text-destructive text-sm" title="Delete row">×</button>
                </td>
              </tr>
              );
            })}
            {visibleRows.length === 0 && (
              <tr><td colSpan={11} className="px-2 py-6 text-center text-muted-foreground text-xs">{showArchived ? "No archived queries." : "No queries."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center">
        <button onClick={() => setShowArchived((v) => !v)} className="text-xs text-muted-foreground hover:text-foreground underline">
          {showArchived ? `← Back to active` : `View archived (${archivedCount})`}
        </button>
        <Button size="sm" variant="outline" onClick={addRow}>+ Add Issue</Button>
      </div>

    </div>
  );
}

// =============== STAKEHOLDER MAP — with flow chart ===============
export function StakeholdersSection() {
  const list = usePlaybook((s) => s.stakeholders);
  const client = usePlaybook((s) => s.client);
  const add = usePlaybook((s) => s.addStakeholder);
  const update = usePlaybook((s) => s.updateStakeholder);
  const del = usePlaybook((s) => s.deleteStakeholder);

  const byInfluence = {
    High: list.filter((s) => s.influence === "High"),
    Medium: list.filter((s) => s.influence === "Medium"),
    Low: list.filter((s) => s.influence === "Low"),
  };

  const sentimentColor = (s: string) =>
    s === "Positive" ? "ring-success/40 bg-success/5"
    : s === "Negative" ? "ring-destructive/40 bg-destructive/5"
    : s === "Neutral" ? "ring-warning/40 bg-warning/5"
    : "ring-border bg-muted/30";

  return (
    <div className="space-y-5">
      <SectionHeader title="👥 Stakeholder Map" subtitle="Influence × sentiment — who's who and how engaged.">
        <Button onClick={() => add({ name: "", role: "", dept: "", influence: "Medium", email: "", phone: "", sentiment: "Unknown", lastTouch: "" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      {/* Flow chart */}
      <div className="rounded-2xl border bg-gradient-to-br from-card to-primary-soft/30 p-6 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Client node */}
          <div className="flex justify-center">
            <div className="rounded-xl bg-brand-gradient text-primary-foreground px-5 py-3 text-center shadow-lg">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Client</div>
              <div className="font-bold text-lg">{client.clientName || "—"}</div>
            </div>
          </div>
          <div className="flex justify-center"><div className="h-6 w-0.5 bg-primary/40" /></div>

          {/* Influence tiers */}
          {(["High", "Medium", "Low"] as const).map((tier) => (
            <div key={tier} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full",
                  tier === "High" && "bg-primary text-primary-foreground",
                  tier === "Medium" && "bg-primary/20 text-primary",
                  tier === "Low" && "bg-muted text-muted-foreground",
                )}>{tier} influence</div>
                <div className="flex-1 h-px bg-border" />
                <div className="text-[10px] text-muted-foreground">{byInfluence[tier].length}</div>
              </div>
              {byInfluence[tier].length === 0 ? (
                <div className="text-xs text-muted-foreground italic px-2">None yet</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {byInfluence[tier].map((s) => (
                    <div key={s.id} className={cn("rounded-lg ring-1 px-3 py-2 min-w-[160px]", sentimentColor(s.sentiment))}>
                      <div className="font-semibold text-sm truncate">{s.name || "(unnamed)"}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{s.role}{s.dept && ` · ${s.dept}`}</div>
                      <div className="text-[10px] mt-1">
                        {s.sentiment === "Positive" && "😊 Positive"}
                        {s.sentiment === "Neutral" && "😐 Neutral"}
                        {s.sentiment === "Negative" && "😟 Negative"}
                        {s.sentiment === "Unknown" && "❓ Unknown"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[1fr_1fr_140px_140px_180px_160px_140px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Name</div><div>Role · Department</div><div>Influence</div><div>Sentiment</div><div>Email</div><div>Phone</div><div>Last Touch</div><div></div>
          </div>
          {list.map((s) => (
            <div key={s.id} className="grid grid-cols-[1fr_1fr_140px_140px_180px_160px_140px_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-sm" value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} placeholder="Name" />
              <div className="flex gap-1"><Input className="h-8 text-xs" value={s.role} onChange={(e) => update(s.id, { role: e.target.value })} placeholder="Role" /><Input className="h-8 text-xs" value={s.dept} onChange={(e) => update(s.id, { dept: e.target.value })} placeholder="Dept" /></div>
              <Select value={s.influence} onValueChange={(v) => update(s.id, { influence: v as "Low" | "Medium" | "High" })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select>
              <Select value={s.sentiment} onValueChange={(v) => update(s.id, { sentiment: v as "Negative" | "Neutral" | "Positive" | "Unknown" })}>
                <SelectTrigger className={cn("h-8 text-xs", s.sentiment === "Positive" && "text-success", s.sentiment === "Negative" && "text-destructive")}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Positive">😊 Positive</SelectItem><SelectItem value="Neutral">😐 Neutral</SelectItem><SelectItem value="Negative">😟 Negative</SelectItem><SelectItem value="Unknown">❓ Unknown</SelectItem></SelectContent>
              </Select>
              <Input className="h-8 text-xs" value={s.email} onChange={(e) => update(s.id, { email: e.target.value })} placeholder="Email" />
              <Input className="h-8 text-xs" value={s.phone} onChange={(e) => update(s.id, { phone: e.target.value })} placeholder="Phone" />
              <Input className="h-8 text-xs" type="date" value={s.lastTouch} onChange={(e) => update(s.id, { lastTouch: e.target.value })} />
              <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== CHAMPIONS ===============
export function ChampionsSection() {
  const champions = usePlaybook((s) => s.champions);
  const resistant = usePlaybook((s) => s.resistantUsers);
  const addC = usePlaybook((s) => s.addChampion);
  const updateC = usePlaybook((s) => s.updateChampion);
  const delC = usePlaybook((s) => s.deleteChampion);
  const addR = usePlaybook((s) => s.addResistant);
  const updateR = usePlaybook((s) => s.updateResistant);
  const delR = usePlaybook((s) => s.deleteResistant);

  return (
    <div className="space-y-6">
      <SectionHeader title="🏆 Champion Register" subtitle="Believers & resistors — the human side of implementation." />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-success/10 px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold text-success">🏆 Plexa Champions</div>
          <Button size="sm" onClick={() => addC({ name: "", title: "", dept: "", modules: "", status: "Identified" })}><Plus className="h-4 w-4" /> Add</Button>
        </div>
        <div className="divide-y">
          {champions.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground text-center">No champions identified yet.</div>}
          {champions.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_140px_40px] gap-2 px-3 py-2 items-center">
              <Input className="h-8 text-sm" value={c.name} onChange={(e) => updateC(c.id, { name: e.target.value })} placeholder="Name" />
              <Input className="h-8 text-xs" value={c.title} onChange={(e) => updateC(c.id, { title: e.target.value })} placeholder="Title" />
              <Input className="h-8 text-xs" value={c.dept} onChange={(e) => updateC(c.id, { dept: e.target.value })} placeholder="Department" />
              <Input className="h-8 text-xs" value={c.modules} onChange={(e) => updateC(c.id, { modules: e.target.value })} placeholder="Modules trained" />
              <Select value={c.status} onValueChange={(v) => updateC(c.id, { status: v as "Identified" | "In Training" | "Certified" })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Identified">Identified</SelectItem><SelectItem value="In Training">In Training</SelectItem><SelectItem value="Certified">✓ Certified</SelectItem></SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => delC(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-destructive/10 px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold text-destructive">⚡ Resistant Users — Convert Every One</div>
          <Button size="sm" variant="outline" onClick={() => addR({ name: "", title: "", type: "The Skeptic", why: "", strategy: "", status: "High Risk" })}><Plus className="h-4 w-4" /> Add</Button>
        </div>
        <div className="divide-y">
          {resistant.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground text-center">None logged.</div>}
          {resistant.map((r) => (
            <div key={r.id} className="p-3 space-y-2">
              <div className="grid grid-cols-[1fr_1fr_180px_140px_40px] gap-2">
                <Input className="h-8 text-sm" value={r.name} onChange={(e) => updateR(r.id, { name: e.target.value })} placeholder="Name" />
                <Input className="h-8 text-xs" value={r.title} onChange={(e) => updateR(r.id, { title: e.target.value })} placeholder="Title" />
                <Select value={r.type} onValueChange={(v) => updateR(r.id, { type: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["The Skeptic", "The Too Busy", "The Protector", "The Tech Averse", "The Power Broker"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={r.status} onValueChange={(v) => updateR(r.id, { status: v as "High Risk" | "Engaging" | "Converted" })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="High Risk">High Risk</SelectItem><SelectItem value="Engaging">Engaging</SelectItem><SelectItem value="Converted">✓ Converted</SelectItem></SelectContent>
                </Select>
                <Button size="icon" variant="ghost" onClick={() => delR(r.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <Textarea rows={2} className="text-xs" value={r.why} onChange={(e) => updateR(r.id, { why: e.target.value })} placeholder="Why resistant?" />
                <Textarea rows={2} className="text-xs" value={r.strategy} onChange={(e) => updateR(r.id, { strategy: e.target.value })} placeholder="Conversion strategy" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== DEFINITION OF DONE ===============
export function DefinitionOfDoneSection() {
  const dod = usePlaybook((s) => s.dod);
  const toggle = usePlaybook((s) => s.toggleDod);
  const done = dod.filter((d) => d.confirmed).length;

  const grouped = Array.from(new Set(dod.map((d) => d.cat))).map((cat) => ({ cat, items: dod.filter((d) => d.cat === cat) }));

  return (
    <div className="space-y-5">
      <SectionHeader title="📋 Definition of Done" subtitle={`${done} / ${dod.length} criteria confirmed. Implementation isn't closed until every box is ticked.`}>
        <div className="text-sm font-semibold tabular-nums">{Math.round((done / dod.length) * 100)}%</div>
      </SectionHeader>

      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-brand-gradient transition-all" style={{ width: `${(done / dod.length) * 100}%` }} />
      </div>

      <div className="space-y-4">
        {grouped.map((g) => (
          <div key={g.cat} className="rounded-xl border bg-card overflow-hidden">
            <div className="bg-primary-soft px-4 py-2 border-b text-[10px] font-semibold uppercase tracking-wider text-primary">{g.cat}</div>
            <div className="divide-y">
              {g.items.map((d) => (
                <button key={d.id} onClick={() => toggle(d.id, "Plexa")} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/40">
                  <div className={cn("flex-none h-5 w-5 rounded-md border-2 flex items-center justify-center", d.confirmed ? "bg-success border-success text-success-foreground" : "border-border")}>
                    {d.confirmed && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 text-sm">{d.text}</div>
                  {d.confirmed && <div className="text-xs text-muted-foreground">{d.by} · {d.date}</div>}
                  <StatusBadge status={d.confirmed ? "COMPLETE" : "IN PROGRESS"} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== INTRANET ===============
export function IntranetSection() {
  const client = usePlaybook((s) => s.client);
  const intranet = usePlaybook((s) => s.intranet);
  const sessions = usePlaybook((s) => s.sessions);
  const addIntranet = usePlaybook((s) => s.addIntranet);
  const updateIntranet = usePlaybook((s) => s.updateIntranet);
  const deleteIntranet = usePlaybook((s) => s.deleteIntranet);

  const [tab, setTab] = useState<"Recording" | "Quick-Start Guide" | "Resource">("Recording");
  const filtered = intranet.filter((x) => x.kind === tab);

  const add = () =>
    addIntranet({
      kind: tab,
      title: "",
      module: "",
      sessionId: "",
      url: "",
      format: tab === "Recording" ? "Video" : tab === "Quick-Start Guide" ? "PDF" : "Link",
      duration: "",
      presenter: "",
      recordedOn: new Date().toISOString().slice(0, 10),
      description: "",
      status: "DRAFT",
    });

  const counts = {
    recordings: intranet.filter((x) => x.kind === "Recording").length,
    guides: intranet.filter((x) => x.kind === "Quick-Start Guide").length,
    resources: intranet.filter((x) => x.kind === "Resource").length,
    published: intranet.filter((x) => x.status === "PUBLISHED").length,
  };

  const tabs: Array<{ id: typeof tab; label: string; icon: string; count: number }> = [
    { id: "Recording", label: "Session Recordings", icon: "🎥", count: counts.recordings },
    { id: "Quick-Start Guide", label: "Quick-Start Guides", icon: "📚", count: counts.guides },
    { id: "Resource", label: "Supporting Resources", icon: "📎", count: counts.resources },
  ];

  const hostFromUrl = (url: string) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="🌐 Client Intranet Pack"
        subtitle="The handover library for the client — recorded workshops & training, quick-start guides per module, and supporting resources."
      />

      <div className="rounded-xl border bg-brand-gradient text-primary-foreground p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">Prepared for</div>
            <h3 className="text-2xl font-bold mt-1">{client.clientName}</h3>
            <p className="text-sm opacity-90 mt-1">Handover library · Prepared by Plexa Customer Success</p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { l: "RECORDINGS", v: counts.recordings },
              { l: "GUIDES", v: counts.guides },
              { l: "RESOURCES", v: counts.resources },
              { l: "PUBLISHED", v: counts.published },
            ].map((s) => (
              <div key={s.l} className="rounded-lg bg-background/15 ring-1 ring-background/30 px-3 py-2 min-w-[80px]">
                <div className="text-[9px] font-semibold uppercase tracking-wider opacity-80">{s.l}</div>
                <div className="text-lg font-bold tabular-nums">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
            )}
          >
            <span>{t.icon}</span>
            <span className="font-semibold">{t.label}</span>
            <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 tabular-nums",
              tab === t.id ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")}>{t.count}</span>
          </button>
        ))}
        <div className="ml-auto">
          <Button size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add {tab}</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          No {tab.toLowerCase()}s yet. Click <span className="font-semibold text-foreground">Add {tab}</span> to drop in the first link.
          {tab === "Recording" && <div className="mt-1 text-xs">Paste Loom / Zoom / SharePoint / YouTube links to each recorded workshop or training session.</div>}
          {tab === "Quick-Start Guide" && <div className="mt-1 text-xs">Add module-by-module how-to PDFs or doc links (e.g. 4A Site, Safety & Quality).</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((r) => {
            const session = sessions.find((s) => s.id === r.sessionId);
            return (
              <div key={r.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/30 border-b">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{tabs.find((t) => t.id === r.kind)?.icon}</span>
                    <Input
                      className="h-7 text-sm font-semibold border-0 bg-transparent focus-visible:ring-1 px-1"
                      placeholder={r.kind === "Recording" ? "e.g. W1 — HOD Workshop Recording" : r.kind === "Quick-Start Guide" ? "e.g. 4A Site, Safety & Quality QSG" : "e.g. Configuration Manual"}
                      value={r.title}
                      onChange={(e) => updateIntranet(r.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Select value={r.status} onValueChange={(v: IntranetStatusValue) => updateIntranet(r.id, { status: v })}>
                      <SelectTrigger className={cn("h-7 text-[10px] font-semibold w-[110px]",
                        r.status === "PUBLISHED" ? "text-success" : "text-muted-foreground")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteIntranet(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Linked Session</div>
                      <Select value={r.sessionId || "none"} onValueChange={(v) => updateIntranet(r.id, { sessionId: v === "none" ? "" : v, module: v === "none" ? r.module : (sessions.find((s) => s.id === v)?.module || r.module) })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— None —</SelectItem>
                          {sessions.map((s) => <SelectItem key={s.id} value={s.id}>{s.id} · {s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Module</div>
                      <Input className="h-8 text-xs" placeholder="e.g. 4A" value={r.module} onChange={(e) => updateIntranet(r.id, { module: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Link</div>
                    <div className="flex gap-1.5">
                      <Input
                        className="h-8 text-xs font-mono"
                        placeholder="https://… (Loom, Zoom, SharePoint, YouTube, PDF)"
                        value={r.url}
                        onChange={(e) => updateIntranet(r.id, { url: e.target.value })}
                      />
                      {r.url && (
                        <Button size="sm" variant="outline" className="h-8 shrink-0" asChild>
                          <a href={r.url} target="_blank" rel="noreferrer">Open</a>
                        </Button>
                      )}
                    </div>
                    {r.url && hostFromUrl(r.url) && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">{hostFromUrl(r.url)}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Format</div>
                      <Input className="h-8 text-xs" placeholder={r.kind === "Recording" ? "Video / Loom" : "PDF / Doc"} value={r.format} onChange={(e) => updateIntranet(r.id, { format: e.target.value })} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{r.kind === "Recording" ? "Duration" : "Length"}</div>
                      <Input className="h-8 text-xs" placeholder={r.kind === "Recording" ? "42:10" : "5 pages"} value={r.duration} onChange={(e) => updateIntranet(r.id, { duration: e.target.value })} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{r.kind === "Recording" ? "Recorded" : "Updated"}</div>
                      <Input type="date" className="h-8 text-xs" value={r.recordedOn} onChange={(e) => updateIntranet(r.id, { recordedOn: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{r.kind === "Recording" ? "Presenter" : "Author"}</div>
                    <Input className="h-8 text-xs" placeholder="Name" value={r.presenter} onChange={(e) => updateIntranet(r.id, { presenter: e.target.value })} />
                  </div>

                  {r.kind !== "Recording" && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Attachment</div>
                      {r.fileName ? (
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5">
                          <span className="text-lg leading-none">📎</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate">{r.fileName}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {r.fileType || "file"}{r.fileSize ? ` · ${(r.fileSize / 1024).toFixed(0)} KB` : ""}
                            </div>
                          </div>
                          {r.fileData && (
                            <Button size="sm" variant="outline" className="h-7 shrink-0" asChild>
                              <a href={r.fileData} download={r.fileName} target="_blank" rel="noreferrer">Download</a>
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive shrink-0"
                            onClick={() => updateIntranet(r.id, { fileName: undefined, fileType: undefined, fileSize: undefined, fileData: undefined })}
                            title="Remove attachment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed bg-muted/10 hover:bg-muted/30 cursor-pointer px-3 py-4 text-center transition-colors">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <div className="text-xs font-semibold">Click to attach a file</div>
                          <div className="text-[10px] text-muted-foreground">PDF, DOCX, PPTX, image — up to ~5MB</div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              if (f.size > 5 * 1024 * 1024) {
                                alert("Attachment must be 5MB or smaller. For larger files, paste a SharePoint/Drive link in the Link field.");
                                e.target.value = "";
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                updateIntranet(r.id, {
                                  fileName: f.name,
                                  fileType: f.type || "application/octet-stream",
                                  fileSize: f.size,
                                  fileData: String(reader.result),
                                  format: r.format || (f.type.includes("pdf") ? "PDF" : f.type.split("/")[1]?.toUpperCase() || "File"),
                                });
                              };
                              reader.readAsDataURL(f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Description / Notes</div>
                    <Textarea className="text-xs min-h-[60px]" placeholder="What this covers, key timestamps, prerequisites…" value={r.description} onChange={(e) => updateIntranet(r.id, { description: e.target.value })} />
                  </div>


                  {session && (
                    <div className="text-[10px] text-muted-foreground border-t pt-1.5">
                      Linked to <span className="font-mono text-primary">{session.id}</span> · {session.type} · Module {session.module}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type IntranetStatusValue = "DRAFT" | "PUBLISHED";

// =============== SESSION CONTENT LOG ===============
type TopicRow = { topic: string; notes: string; covered: string; duration: string; followUp: string; followUpAction: string };
const COVERED_STATES = ["Covered", "Partially", "Not Covered"] as const;

export function ContentLogSection() {
  const tableMap = usePlaybook((s) => s.tableMap);
  const sessions = usePlaybook((s) => s.sessions);
  const fetchTables = usePlaybook((s) => s.fetchTables);
  const fetchTableRecords = usePlaybook((s) => s.fetchTableRecords);
  const [savingSessionId, setSavingSessionId] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, TopicRow[]>>(() =>
    Object.fromEntries(sessions.map((s) => {
      const seeded = CONTENT_TOPICS[s.id] || [];
      const len = Math.max(seeded.length, 3);
      return [s.id, Array.from({ length: len }, (_, i) => ({
        topic: seeded[i] || "",
        notes: "", covered: "Covered", duration: "", followUp: "NO", followUpAction: "",
      }))];
    }))
  );

  useEffect(() => {
    let cancelled = false;
    const loadTopics = async () => {
      try {
        let tableId = tableMap[PLAYBOOK_TABLES.sessionTopics];
        if (!tableId) {
          await fetchTables();
          tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.sessionTopics];
        }
        if (!tableId) return;

        const records = await fetchTableRecords(tableId, PLAYBOOK_TABLES.sessionTopics);
        if (cancelled) return;

        const bySession = records.reduce<Record<string, TopicRow[]>>((acc, record) => {
          const sessionId = String(record?.fields?.sessionId || record?.sessionId || record?.["Session ID"] || "");
          const topic = String(record?.fields?.topic || record?.topic || record?.["Topic"] || "");
          if (!sessionId) return acc;
          const nextRow: TopicRow = {
            topic,
            notes: String(record?.fields?.notes || record?.notes || record?.["Notes"] || ""),
            covered: String(record?.fields?.covered || record?.covered || record?.["Covered"] || "Covered"),
            duration: String(record?.fields?.duration || record?.duration || record?.["Duration"] || ""),
            followUp: String(record?.fields?.followUp || record?.followUp || record?.["Follow-Up"] || "NO"),
            followUpAction: String(record?.fields?.followUpAction || record?.followUpAction || record?.["Follow-Up Action"] || ""),
          };
          acc[sessionId] = [...(acc[sessionId] || []), nextRow];
          return acc;
        }, {});

        setState((prev) => Object.fromEntries(sessions.map((s) => {
          const apiRows = bySession[s.id] && bySession[s.id].length ? bySession[s.id] : null;
          return [s.id, apiRows || prev[s.id] || Array.from({ length: Math.max((CONTENT_TOPICS[s.id] || []).length, 3) }, (_, i) => ({
            topic: (CONTENT_TOPICS[s.id] || [])[i] || "",
            notes: "",
            covered: "Covered",
            duration: "",
            followUp: "NO",
            followUpAction: "",
          }))];
        })));
      } catch (error) {
        console.error("ContentLogSection: failed to load session topics", error);
      }
    };

    void loadTopics();
    return () => {
      cancelled = true;
    };
  }, [fetchTableRecords, fetchTables, tableMap]);

  const upd = (id: string, i: number, patch: Partial<TopicRow>) =>
    setState((p) => ({ ...p, [id]: p[id].map((r, idx) => idx === i ? { ...r, ...patch } : r) }));
  const addRow = (id: string) =>
    setState((p) => ({ ...p, [id]: [...p[id], { topic: "", notes: "", covered: "Covered", duration: "", followUp: "NO", followUpAction: "" }] }));

  const saveSessionTopics = async (sessionId: string) => {
    try {
      setSavingSessionId(sessionId);
      const apiBase = (window as any).apiBase as string | undefined;
      const token = (window as any).authToken as string | undefined;
      if (!apiBase) throw new Error("apiBase not available");

      const org = await ensureOrganizationUUID(apiBase, token);
      if (!org) throw new Error("Organization UUID not available");

      let tableId = tableMap[PLAYBOOK_TABLES.sessionTopics];
      if (!tableId) {
        await fetchTables();
        tableId = usePlaybook.getState().tableMap[PLAYBOOK_TABLES.sessionTopics];
      }
      if (!tableId) throw new Error("playbook_session_topics table not found in tableMap");

      const records = await fetchTableRecords(tableId, PLAYBOOK_TABLES.sessionTopics);
      const baseUrl = `${apiBase.replace(/\/+$/, "")}/workbench/organization/${org}`;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await Promise.all((state[sessionId] || []).map(async (row, index) => {
        const existing = records.find((record) => {
          const recordSessionId = String(record?.fields?.sessionId || record?.sessionId || record?.["Session ID"] || "");
          const recordTopic = String(record?.fields?.topic || record?.topic || record?.["Topic"] || "");
          return recordSessionId === sessionId && recordTopic === row.topic;
        }) || records[index];

        const fields = {
          sessionId,
          topic: row.topic || "",
          notes: row.notes || "",
          covered: row.covered || "Covered",
          duration: row.duration || "",
          followUp: row.followUp || "NO",
          followUpAction: row.followUpAction || "",
        };

        const url = `${baseUrl}/tables/${tableId}/records${existing?.id ? `/${existing.id}` : ""}`;
        const body = existing?.id
          ? { fieldKeyType: "name", typecast: false, record: { fields } }
          : { fieldKeyType: "name", typecast: false, p: PLAYBOOK_TABLES.sessionTopics, records: [{ fields }] };

        const res = await fetch(url, {
          method: existing?.id ? "PATCH" : "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`Failed to save session topics for ${sessionId} (${res.status})`);
      }));
    } finally {
      setSavingSessionId(null);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="📚 Session Content Log" subtitle="What was covered in every session. Every topic per session logged here. Feeds directly into the Client Intranet Handover Pack." />

      {sessions.map((s) => (
        <div key={s.id} className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-2 bg-primary/10 border-b border-primary/30">
            <div className="text-sm font-bold">
              <span className="font-mono text-primary mr-2">{s.id}</span>
              <span className="text-[10px] uppercase tracking-wider mr-2 text-muted-foreground">{s.type}:</span>
              {s.name}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              <thead className="bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 text-left w-10">#</th>
                  <th className="px-2 py-2 text-left">Topic / Agenda Item</th>
                  <th className="px-2 py-2 text-left">Notes</th>
                  <th className="px-2 py-2 text-left w-32">Covered?</th>
                  <th className="px-2 py-2 text-left w-28">Duration (min)</th>
                  <th className="px-2 py-2 text-left w-24">Follow-Up?</th>
                  <th className="px-2 py-2 text-left">Follow-Up Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state[s.id].map((r, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-2 py-1 font-mono tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.topic} onChange={(e) => upd(s.id, i, { topic: e.target.value })} /></td>
                    <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.notes} onChange={(e) => upd(s.id, i, { notes: e.target.value })} /></td>
                    <td className="px-2 py-1">
                      <Select value={r.covered} onValueChange={(v) => upd(s.id, i, { covered: v })}>
                        <SelectTrigger className={cn("h-7 text-[11px] font-semibold",
                          r.covered === "Covered" && "text-success",
                          r.covered === "Partially" && "text-yellow-600 dark:text-yellow-400",
                          r.covered === "Not Covered" && "text-destructive")}><SelectValue /></SelectTrigger>
                        <SelectContent>{COVERED_STATES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1"><Input type="number" className="h-7 text-xs" value={r.duration} onChange={(e) => upd(s.id, i, { duration: e.target.value })} /></td>
                    <td className="px-2 py-1">
                      <Select value={r.followUp} onValueChange={(v) => upd(s.id, i, { followUp: v })}>
                        <SelectTrigger className={cn("h-7 text-[11px] font-semibold", r.followUp === "YES" && "text-warning-foreground")}><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="NO">NO</SelectItem><SelectItem value="YES">YES</SelectItem></SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1"><Input className="h-7 text-xs" value={r.followUpAction} onChange={(e) => upd(s.id, i, { followUpAction: e.target.value })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t px-3 py-2 bg-muted/10 flex items-center justify-between gap-2">
            <Button size="sm" variant="outline" onClick={() => addRow(s.id)}><Plus className="h-4 w-4" /> Add topic</Button>
            <Button size="sm" onClick={() => void saveSessionTopics(s.id)} disabled={savingSessionId === s.id}>
              {savingSessionId === s.id ? "Saving…" : "Save session topics"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============== CSV HELPERS (used by Excel-style sections) ===============
function toCSV(rows: Record<string, unknown>[], cols: string[]): string {
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
function fromCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) return [];
  const parseLine = (l: string): string[] => {
    const out: string[] = []; let cur = ""; let q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (q) {
        if (c === '"' && l[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') q = false;
        else cur += c;
      } else {
        if (c === '"') q = true;
        else if (c === ",") { out.push(cur); cur = ""; }
        else cur += c;
      }
    }
    out.push(cur);
    return out;
  };
  const cols = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const vals = parseLine(l);
    return Object.fromEntries(cols.map((c, i) => [c, vals[i] ?? ""]));
  });
}
function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function downloadXLSXTemplate(filename: string, columns: string[], sample?: Record<string, string>) {
  const headerRow = columns.reduce((acc, c) => ({ ...acc, [c]: c }), {} as Record<string, string>);
  const rows: Record<string, string>[] = [headerRow];
  if (sample) rows.push(sample);
  // Add blank rows so the grid is visible & ready to fill
  for (let i = 0; i < 20; i++) rows.push(columns.reduce((a, c) => ({ ...a, [c]: "" }), {}));
  const ws = XLSX.utils.json_to_sheet(rows, { header: columns, skipHeader: true });
  ws["!cols"] = columns.map((c) => ({ wch: Math.max(14, c.length + 4) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, filename);
}

function ImportExport({ filename, csv, columns, sample, onImport }: { filename: string; csv: string; columns?: string[]; sample?: Record<string, string>; onImport: (text: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const xlsxName = filename.replace(/\.csv$/i, "-template.xlsx");
  return (
    <div className="flex gap-2 flex-wrap">
      {columns && (
        <Button variant="outline" size="sm" onClick={() => downloadXLSXTemplate(xlsxName, columns, sample)}>
          <FileSpreadsheet className="h-4 w-4" /> Template
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => downloadCSV(filename, csv)}><Download className="h-4 w-4" /> Export</Button>
      <Button variant="outline" size="sm" onClick={() => ref.current?.click()}><Upload className="h-4 w-4" /> Import</Button>
      <input ref={ref} type="file" accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        const isExcel = /\.(xlsx|xls)$/i.test(f.name);
        if (isExcel) {
          const buf = await f.arrayBuffer();
          const wb = XLSX.read(buf);
          const ws = wb.Sheets[wb.SheetNames[0]];
          const csvText = XLSX.utils.sheet_to_csv(ws);
          onImport(csvText);
        } else {
          const text = await f.text(); onImport(text);
        }
        e.target.value = "";
      }} />
    </div>
  );
}

// =============== USER ACCOUNTS ===============
export function UserAccountsSection() {
  const users = usePlaybook((s) => s.userAccounts);
  const add = usePlaybook((s) => s.addUser);
  const update = usePlaybook((s) => s.updateUser);
  const del = usePlaybook((s) => s.deleteUser);
  const replace = usePlaybook((s) => s.replaceUsers);
  const sync = usePlaybook((s) => s.syncUsersFromTable);
  const save = usePlaybook((s) => s.saveUserAccount);
  const [savingId, setSavingId] = useState<string | null>(null);
  const COLS = ["name", "email", "phone", "position", "role", "department", "status"];
  const csv = toCSV(users as unknown as Record<string, unknown>[], COLS);
  useEffect(() => { void sync(); }, [sync]);
  const saveRow = async (id: string) => {
    setSavingId(id);
    try { await save(id); } finally { setSavingId(null); }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="👤 User Accounts" subtitle="Name, email, phone, position, role, department — the complete login roster.">
        <ImportExport filename="user-accounts.csv" csv={csv} columns={COLS} sample={{ name: "Jane Smith", email: "jane@client.com", phone: "0400 000 000", position: "Project Manager", role: "Standard", department: "Construction", status: "Pending" }} onImport={(t) => {
          const parsed = fromCSV(t).map((r) => ({
            id: Math.random().toString(36).slice(2),
            name: r.name || "", email: r.email || "", phone: r.phone || "",
            position: r.position || "", role: r.role || "", department: r.department || "",
            status: ((["Pending", "Invited", "Active", "Disabled"].includes(r.status) ? r.status : "Pending") as "Pending" | "Invited" | "Active" | "Disabled"),
          }));
          replace(parsed);
        }} />
        <Button onClick={() => add({ name: "", email: "", phone: "", position: "", role: "Standard", department: "", status: "Pending" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[1fr_1.2fr_140px_180px_160px_160px_140px_80px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Name</div><div>Email</div><div>Phone</div><div>Position</div><div>Role</div><div>Department</div><div>Status</div><div></div>
          </div>
          {users.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No users yet — add one or import a CSV.</div>}
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-[1fr_1.2fr_140px_180px_160px_160px_140px_80px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-sm" value={u.name} onChange={(e) => update(u.id, { name: e.target.value })} />
              <Input className="h-8 text-xs" value={u.email} onChange={(e) => update(u.id, { email: e.target.value })} />
              <Input className="h-8 text-xs" value={u.phone} onChange={(e) => update(u.id, { phone: e.target.value })} />
              <Input className="h-8 text-xs" value={u.position} onChange={(e) => update(u.id, { position: e.target.value })} />
              <Input className="h-8 text-xs" value={u.role} onChange={(e) => update(u.id, { role: e.target.value })} />
              <Input className="h-8 text-xs" value={u.department || ""} onChange={(e) => update(u.id, { department: e.target.value })} />
              <Select value={u.status} onValueChange={(v) => update(u.id, { status: v as "Pending" | "Invited" | "Active" | "Disabled" })}>
                <SelectTrigger className={cn("h-8 text-xs", u.status === "Active" && "text-success", u.status === "Disabled" && "text-destructive")}><SelectValue /></SelectTrigger>
                <SelectContent>{["Pending", "Invited", "Active", "Disabled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center justify-end gap-1">
                <Button size="icon" variant="ghost" disabled={savingId === u.id} onClick={() => void saveRow(u.id)}><Save className="h-4 w-4 text-muted-foreground" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(u.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== PROJECT DETAILS ===============
export function ProjectDetailsSection() {
  const rows = usePlaybook((s) => s.projectDetails);
  const add = usePlaybook((s) => s.addProject);
  const update = usePlaybook((s) => s.updateProject);
  const del = usePlaybook((s) => s.deleteProject);
  const replace = usePlaybook((s) => s.replaceProjects);
  const sync = usePlaybook((s) => s.syncProjectsFromTable);
  const save = usePlaybook((s) => s.saveProjectDetail);
  const [savingId, setSavingId] = useState<string | null>(null);
  const COLS = ["code", "name", "type", "client", "pm", "startDate", "endDate", "value", "status"];
  const csv = toCSV(rows as unknown as Record<string, unknown>[], COLS);
  useEffect(() => { void sync(); }, [sync]);
  const saveRow = async (id: string) => {
    setSavingId(id);
    try { await save(id); } finally { setSavingId(null); }
  };
  return (
    <div className="space-y-5">
      <SectionHeader title="🏗️ Project Details" subtitle="Every project in scope — code, type, PM, dates, value, status.">
        <ImportExport filename="project-details.csv" csv={csv} columns={COLS} sample={{ code: "P-1042", name: "Riverside Apartments", type: "Construction", client: "Acme Developments", pm: "John Doe", startDate: "2026-01-15", endDate: "2027-06-30", value: "$12,500,000", status: "Live" }} onImport={(t) => {
          replace(fromCSV(t).map((r) => ({
            id: Math.random().toString(36).slice(2),
            code: r.code || "", name: r.name || "", type: r.type || "", client: r.client || "", pm: r.pm || "",
            startDate: r.startDate || "", endDate: r.endDate || "", value: r.value || "",
            status: ((["Tender", "Awarded", "Live", "Complete", "Archived"].includes(r.status) ? r.status : "Live") as ProjectsStatus),
          })));
        }} />
        <Button onClick={() => add({ code: "", name: "", type: "Construction", client: "", pm: "", startDate: "", endDate: "", value: "", status: "Live" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1300px]">
          <div className="grid grid-cols-[100px_1.2fr_140px_1fr_140px_120px_120px_120px_120px_80px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Code</div><div>Name</div><div>Type</div><div>Client</div><div>PM</div><div>Start</div><div>End</div><div>Value</div><div>Status</div><div></div>
          </div>
          {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No projects yet.</div>}
          {rows.map((p) => (
            <div key={p.id} className="grid grid-cols-[100px_1.2fr_140px_1fr_140px_120px_120px_120px_120px_80px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-xs font-mono" value={p.code} onChange={(e) => update(p.id, { code: e.target.value })} />
              <Input className="h-8 text-sm" value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} />
              <Input className="h-8 text-xs" value={p.type} onChange={(e) => update(p.id, { type: e.target.value })} />
              <Input className="h-8 text-xs" value={p.client} onChange={(e) => update(p.id, { client: e.target.value })} />
              <Input className="h-8 text-xs" value={p.pm} onChange={(e) => update(p.id, { pm: e.target.value })} />
              <Input className="h-8 text-xs" type="date" value={p.startDate} onChange={(e) => update(p.id, { startDate: e.target.value })} />
              <Input className="h-8 text-xs" type="date" value={p.endDate} onChange={(e) => update(p.id, { endDate: e.target.value })} />
              <Input className="h-8 text-xs" value={p.value} onChange={(e) => update(p.id, { value: e.target.value })} placeholder="$" />
              <Select value={p.status} onValueChange={(v) => update(p.id, { status: v as ProjectsStatus })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["Tender", "Awarded", "Live", "Complete", "Archived"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center justify-end gap-1">
                <Button size="icon" variant="ghost" disabled={savingId === p.id} onClick={() => void saveRow(p.id)}><Save className="h-4 w-4 text-muted-foreground" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
type ProjectsStatus = "Tender" | "Awarded" | "Live" | "Complete" | "Archived";

// =============== CONTRACTOR DATABASE ===============
export function ContractorsSection() {
  const rows = usePlaybook((s) => s.contractors);
  const add = usePlaybook((s) => s.addContractor);
  const update = usePlaybook((s) => s.updateContractor);
  const del = usePlaybook((s) => s.deleteContractor);
  const replace = usePlaybook((s) => s.replaceContractors);
  const sync = usePlaybook((s) => s.syncContractorsFromTable);
  const save = usePlaybook((s) => s.saveContractor);
  const [savingId, setSavingId] = useState<string | null>(null);
  const COLS = ["company", "trade", "contact", "email", "phone", "insurance", "abn", "status"];
  const csv = toCSV(rows as unknown as Record<string, unknown>[], COLS);
  useEffect(() => { void sync(); }, [sync]);
  const saveRow = async (id: string) => {
    setSavingId(id);
    try { await save(id); } finally { setSavingId(null); }
  };
  return (
    <div className="space-y-5">
      <SectionHeader title="🔧 Contractor Database" subtitle="Every subcontractor — trade, contact, compliance.">
        <ImportExport filename="contractor-database.csv" csv={csv} columns={COLS} sample={{ company: "ABC Electrical Pty Ltd", trade: "Electrical", contact: "Sam Jones", email: "sam@abcelec.com", phone: "0400 111 222", insurance: "2026-12-31", abn: "12 345 678 901", status: "Approved" }} onImport={(t) => {
          replace(fromCSV(t).map((r) => ({
            id: Math.random().toString(36).slice(2),
            company: r.company || "", trade: r.trade || "", contact: r.contact || "",
            email: r.email || "", phone: r.phone || "", insurance: r.insurance || "", abn: r.abn || "",
            status: ((["Pending", "Approved", "Rejected"].includes(r.status) ? r.status : "Pending") as "Pending" | "Approved" | "Rejected"),
          })));
        }} />
        <Button onClick={() => add({ company: "", trade: "", contact: "", email: "", phone: "", insurance: "", abn: "", status: "Pending" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[1.2fr_160px_1fr_1fr_140px_180px_140px_140px_80px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Company</div><div>Trade</div><div>Contact</div><div>Email</div><div>Phone</div><div>Insurance Exp.</div><div>ABN</div><div>Status</div><div></div>
          </div>
          {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No contractors yet.</div>}
          {rows.map((c) => (
            <div key={c.id} className="grid grid-cols-[1.2fr_160px_1fr_1fr_140px_180px_140px_140px_80px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-sm" value={c.company} onChange={(e) => update(c.id, { company: e.target.value })} />
              <Input className="h-8 text-xs" value={c.trade} onChange={(e) => update(c.id, { trade: e.target.value })} />
              <Input className="h-8 text-xs" value={c.contact} onChange={(e) => update(c.id, { contact: e.target.value })} />
              <Input className="h-8 text-xs" value={c.email} onChange={(e) => update(c.id, { email: e.target.value })} />
              <Input className="h-8 text-xs" value={c.phone} onChange={(e) => update(c.id, { phone: e.target.value })} />
              <Input className="h-8 text-xs" type="date" value={c.insurance} onChange={(e) => update(c.id, { insurance: e.target.value })} />
              <Input className="h-8 text-xs" value={c.abn} onChange={(e) => update(c.id, { abn: e.target.value })} />
              <Select value={c.status} onValueChange={(v) => update(c.id, { status: v as "Pending" | "Approved" | "Rejected" })}>
                <SelectTrigger className={cn("h-8 text-xs", c.status === "Approved" && "text-success", c.status === "Rejected" && "text-destructive")}><SelectValue /></SelectTrigger>
                <SelectContent>{["Pending", "Approved", "Rejected"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center justify-end gap-1">
                <Button size="icon" variant="ghost" disabled={savingId === c.id} onClick={() => void saveRow(c.id)}><Save className="h-4 w-4 text-muted-foreground" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== COST CODES ===============
export function CostCodesSection() {
  const rows = usePlaybook((s) => s.costCodes);
  const add = usePlaybook((s) => s.addCostCode);
  const update = usePlaybook((s) => s.updateCostCode);
  const del = usePlaybook((s) => s.deleteCostCode);
  const replace = usePlaybook((s) => s.replaceCostCodes);
  const sync = usePlaybook((s) => s.syncCostCodesFromTable);
  const save = usePlaybook((s) => s.saveCostCode);
  const [savingId, setSavingId] = useState<string | null>(null);
  const COLS = ["code", "name", "category", "unit", "rate", "notes"];
  const csv = toCSV(rows as unknown as Record<string, unknown>[], COLS);
  useEffect(() => { void sync(); }, [sync]);
  const saveRow = async (id: string) => {
    setSavingId(id);
    try { await save(id); } finally { setSavingId(null); }
  };
  return (
    <div className="space-y-5">
      <SectionHeader title="💰 Company Cost Codes" subtitle="Company-wide cost code structure — synced into Plexa budgets.">
        <ImportExport filename="cost-codes.csv" csv={csv} columns={COLS} sample={{ code: "01-100", name: "Site Preliminaries", category: "Preliminaries", unit: "LS", rate: "25000", notes: "Site setup, hoarding, temp services" }} onImport={(t) => {
          replace(fromCSV(t).map((r) => ({
            id: Math.random().toString(36).slice(2),
            code: r.code || "", name: r.name || "", category: r.category || "",
            unit: r.unit || "", rate: r.rate || "", notes: r.notes || "",
          })));
        }} />
        <Button onClick={() => add({ code: "", name: "", category: "", unit: "", rate: "", notes: "" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[120px_1.5fr_180px_100px_120px_1fr_80px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Code</div><div>Name</div><div>Category</div><div>Unit</div><div>Rate</div><div>Notes</div><div></div>
          </div>
          {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No cost codes yet.</div>}
          {rows.map((c) => (
            <div key={c.id} className="grid grid-cols-[120px_1.5fr_180px_100px_120px_1fr_80px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-xs font-mono" value={c.code} onChange={(e) => update(c.id, { code: e.target.value })} />
              <Input className="h-8 text-sm" value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} />
              <Input className="h-8 text-xs" value={c.category} onChange={(e) => update(c.id, { category: e.target.value })} />
              <Input className="h-8 text-xs" value={c.unit} onChange={(e) => update(c.id, { unit: e.target.value })} />
              <Input className="h-8 text-xs" value={c.rate} onChange={(e) => update(c.id, { rate: e.target.value })} />
              <Input className="h-8 text-xs" value={c.notes} onChange={(e) => update(c.id, { notes: e.target.value })} />
              <div className="flex items-center justify-end gap-1">
                <Button size="icon" variant="ghost" disabled={savingId === c.id} onClick={() => void saveRow(c.id)}><Save className="h-4 w-4 text-muted-foreground" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== POST-IMPLEMENTATION EMAIL ===============
export function PostImplementationEmailSection() {
  const client = usePlaybook((s) => s.client);
  const tasks = usePlaybook((s) => s.tasks);
  const sessions = usePlaybook((s) => s.sessions);
  const issues = usePlaybook((s) => s.issues);
  const champions = usePlaybook((s) => s.champions);
  const dod = usePlaybook((s) => s.dod);
  const signOffs = usePlaybook((s) => s.signOffs);

  const tasksDone = tasks.filter((t) => t.status === "COMPLETE").length;
  const sessionsDone = sessions.filter((s) => s.status === "Completed").length;
  const issuesClosed = issues.filter((i) => i.status === "Closed").length;
  const dodDone = dod.filter((d) => d.confirmed).length;
  const competencyComplete = signOffs.filter((s) => s.status === "COMPLETE").length;

  const [recipients, setRecipients] = useState("CEO, CFO, IT Lead, Site Teams, Ops");
  const [scheduled, setScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const subject = `🎉 ${client.clientName} — Plexa Implementation Complete`;
  const body = `Hi team,

We're thrilled to wrap up the Plexa implementation for ${client.clientName}. A huge thank you to ${client.clientLead} and the entire team for an outstanding partnership.

THE NUMBERS
• ${tasksDone}/${tasks.length} tasks completed (${Math.round((tasksDone / tasks.length) * 100)}%)
• ${sessionsDone}/${sessions.length} sessions delivered
• ${competencyComplete}/${signOffs.length} users signed off across training modules
• ${issuesClosed}/${issues.length} queries resolved
• ${dodDone}/${dod.length} Definition of Done criteria confirmed
• ${champions.length} certified Plexa Champions inside ${client.clientName}

WHAT HAPPENS NEXT
• Hypercare for the next 2 weeks — embedded support from your CS team
• Weekly check-ins continue through the first month of go-live
• Your dedicated Account Manager, ${client.accountManager}, remains your single point of contact

Login to your dashboards at platform.plexapro.com — full analytics, adoption metrics, and module usage are live.

Welcome to the Plexa family. Here's to building something great together.

— The Plexa Customer Success Team`;

  return (
    <div className="space-y-5">
      <SectionHeader title="📧 Post-Implementation Email" subtitle="Automated handover email with live dashboards and analytics.">
        <Button variant="outline" onClick={() => navigator.clipboard?.writeText(`Subject: ${subject}\n\n${body}`)}><Sparkles className="h-4 w-4" /> Copy email</Button>
        <Button onClick={() => setScheduled(true)}><Send className="h-4 w-4" /> {scheduled ? "Scheduled" : "Schedule send"}</Button>
      </SectionHeader>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="border-b px-4 py-3 bg-muted/30 space-y-2">
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">To</div>
              <Input className="h-8 text-sm" value={recipients} onChange={(e) => setRecipients(e.target.value)} />
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Subject</div>
              <Input className="h-8 text-sm font-semibold" value={subject} readOnly />
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Send</div>
              <div className="flex gap-2 items-center">
                <Input className="h-8 text-xs w-44" type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                <span className="text-xs text-muted-foreground">{scheduled ? `✅ Scheduled for ${scheduleDate || "now"}` : "Pick a time"}</span>
              </div>
            </div>
          </div>
          <Textarea className="border-0 rounded-none font-mono text-xs leading-relaxed" rows={26} value={body} readOnly />
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border bg-card p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-3">Live dashboard snapshot (embedded)</div>
            <div className="grid grid-cols-2 gap-2">
              <Snap label="Tasks complete" value={`${Math.round((tasksDone / tasks.length) * 100)}%`} sub={`${tasksDone}/${tasks.length}`} tone="brand" />
              <Snap label="Sessions delivered" value={`${sessionsDone}`} sub={`of ${sessions.length}`} tone="success" />
              <Snap label="Users signed off" value={`${competencyComplete}`} sub={`of ${signOffs.length}`} tone="success" />
              <Snap label="Queries resolved" value={`${issuesClosed}`} sub={`of ${issues.length}`} />
              <Snap label="DoD confirmed" value={`${dodDone}/${dod.length}`} tone="brand" />
              <Snap label="Champions" value={`${champions.length}`} tone="success" />
            </div>
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-success/10 to-primary/10 p-5">
            <div className="text-sm font-bold mb-2">📊 Embedded analytics</div>
            <p className="text-xs text-muted-foreground">The email auto-attaches platform usage analytics (logins, modules used, adoption trend) from platform.plexapro.com via SSO link.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Snap({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "brand" | "success" | "warning" | "danger" }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-xl font-bold tabular-nums mt-0.5",
        tone === "brand" && "text-primary",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning-foreground",
        tone === "danger" && "text-destructive",
      )}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

// =============== TEMPLATES LIBRARY ===============
const TEMPLATE_LIBRARY: { id: string; name: string; description: string; columns: string[]; sample: Record<string, string> }[] = [
  {
    id: "folder-structure",
    name: "Folder Structure Template",
    description: "Standard project folder hierarchy for Plexa document management.",
    columns: ["Level", "Folder Name", "Parent Folder", "Purpose", "Access Group"],
    sample: { Level: "1", "Folder Name": "01 - Contracts", "Parent Folder": "/", Purpose: "Executed contracts & variations", "Access Group": "PM, Commercial" },
  },
  {
    id: "workflow",
    name: "Workflow Templates",
    description: "Approval and notification workflows for RFIs, variations, invoices, etc.",
    columns: ["Workflow Name", "Module", "Trigger", "Step #", "Step Action", "Assignee Role", "SLA (days)", "Notification"],
    sample: { "Workflow Name": "RFI Approval", Module: "RFIs", Trigger: "On Submit", "Step #": "1", "Step Action": "Review", "Assignee Role": "Project Manager", "SLA (days)": "2", Notification: "Email + In-app" },
  },
  {
    id: "budget",
    name: "Budget Template",
    description: "Project budget structure aligned to cost codes.",
    columns: ["Cost Code", "Description", "Category", "Quantity", "Unit", "Rate", "Total", "Notes"],
    sample: { "Cost Code": "02-200", Description: "Concrete slab", Category: "Substructure", Quantity: "120", Unit: "m³", Rate: "350", Total: "42000", Notes: "Incl. pump hire" },
  },
  {
    id: "equipment",
    name: "Equipment Checklist",
    description: "Plant & equipment register with servicing schedule.",
    columns: ["Item", "Serial #", "Category", "Owner", "Location", "Last Service", "Next Service", "Status"],
    sample: { Item: "Excavator 5T", "Serial #": "EX-2042", Category: "Plant", Owner: "Self-owned", Location: "Site A", "Last Service": "2026-03-15", "Next Service": "2026-09-15", Status: "Operational" },
  },
  {
    id: "swms",
    name: "SWMS Review Checklist",
    description: "Safe Work Method Statement review register.",
    columns: ["SWMS Ref", "Activity", "Contractor", "Hazard", "Risk Level", "Controls", "Reviewer", "Review Date", "Status"],
    sample: { "SWMS Ref": "SWMS-014", Activity: "Working at heights", Contractor: "ABC Roofing", Hazard: "Falls >2m", "Risk Level": "High", Controls: "Harness, edge protection", Reviewer: "Site Manager", "Review Date": "2026-05-10", Status: "Approved" },
  },
  {
    id: "incident",
    name: "Injury & Incident Forms",
    description: "Capture injuries, near-misses, and incidents on site.",
    columns: ["Incident #", "Date", "Time", "Project", "Person Involved", "Type", "Severity", "Description", "Immediate Action", "Reported To", "Status"],
    sample: { "Incident #": "INC-2026-007", Date: "2026-05-12", Time: "10:45", Project: "Riverside Apartments", "Person Involved": "J. Doe", Type: "Near Miss", Severity: "Low", Description: "Tool dropped from scaffold", "Immediate Action": "Area cleared, toolbox talk", "Reported To": "Site Manager", Status: "Closed" },
  },
  {
    id: "meetings",
    name: "Meetings & Inspections Templates",
    description: "Site meetings, toolbox talks, and inspection records.",
    columns: ["Date", "Type", "Project", "Location", "Chair", "Attendees", "Agenda / Items", "Actions", "Action Owner", "Due Date"],
    sample: { Date: "2026-05-18", Type: "Site Meeting", Project: "Riverside Apartments", Location: "Site Office", Chair: "J. Doe", Attendees: "PM, SM, Foreman", "Agenda / Items": "Programme review", Actions: "Update look-ahead", "Action Owner": "PM", "Due Date": "2026-05-22" },
  },
  {
    id: "itp",
    name: "ITPs & ITCs",
    description: "Inspection & Test Plans and Inspection & Test Checklists.",
    columns: ["ITP/ITC Ref", "Activity", "Spec / Standard", "Inspection Point", "Hold / Witness", "Inspector", "Date", "Result", "Comments"],
    sample: { "ITP/ITC Ref": "ITP-005", Activity: "Concrete pour Level 2", "Spec / Standard": "AS 3600", "Inspection Point": "Pre-pour reo check", "Hold / Witness": "Hold", Inspector: "Engineer", Date: "2026-06-04", Result: "Pass", Comments: "Approved to pour" },
  },
  {
    id: "permits",
    name: "Permit Templates",
    description: "Hot works, confined space, and access permits.",
    columns: ["Permit #", "Type", "Project", "Issued To", "Issued By", "Valid From", "Valid To", "Conditions", "Status"],
    sample: { "Permit #": "PMT-031", Type: "Hot Works", Project: "Riverside Apartments", "Issued To": "ABC Welding", "Issued By": "Site Manager", "Valid From": "2026-05-20 07:00", "Valid To": "2026-05-20 17:00", Conditions: "Fire watch + extinguisher", Status: "Active" },
  },
];

type UploadedFile = { id: string; name: string; path: string; size: number; type: string; url: string };

export function TemplatesLibrarySection() {
  const [uploads, setUploads] = useState<Record<string, UploadedFile[]>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const folderInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFiles = (templateId: string, fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const next: UploadedFile[] = [];
    for (const f of Array.from(fileList)) {
      // webkitRelativePath is set when uploaded via webkitdirectory
      const relPath = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
      next.push({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        path: relPath,
        size: f.size,
        type: f.type,
        url: URL.createObjectURL(f),
      });
    }
    setUploads((prev) => ({ ...prev, [templateId]: [...(prev[templateId] || []), ...next] }));
  };

  const removeFile = (templateId: string, id: string) => {
    setUploads((prev) => {
      const list = prev[templateId] || [];
      const target = list.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return { ...prev, [templateId]: list.filter((f) => f.id !== id) };
    });
  };

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="space-y-5">
      <SectionHeader title="📁 Templates Library" subtitle="Download ready-to-use Excel templates — or upload your own files and folders against each template." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATE_LIBRARY.map((t) => {
          const files = uploads[t.id] || [];
          return (
            <div key={t.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {t.columns.slice(0, 5).map((c) => (
                  <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c}</span>
                ))}
                {t.columns.length > 5 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{t.columns.length - 5} more</span>}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => downloadXLSXTemplate(`${t.id}-template.xlsx`, t.columns, t.sample)}>
                  <Download className="h-4 w-4" /> Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => fileInputs.current[t.id]?.click()}>
                  <Upload className="h-4 w-4" /> Files
                </Button>
                <Button size="sm" variant="outline" onClick={() => folderInputs.current[t.id]?.click()}>
                  <Upload className="h-4 w-4" /> Folder
                </Button>
                <input ref={(el) => { fileInputs.current[t.id] = el; }} type="file" multiple className="hidden" onChange={(e) => { handleFiles(t.id, e.target.files); e.target.value = ""; }} />
                <input ref={(el) => { folderInputs.current[t.id] = el; }} type="file" multiple className="hidden" {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)} onChange={(e) => { handleFiles(t.id, e.target.files); e.target.value = ""; }} />
              </div>

              {files.length > 0 && (
                <div className="rounded-lg border bg-muted/30 p-2 space-y-1 max-h-40 overflow-y-auto">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">{files.length} file{files.length === 1 ? "" : "s"} uploaded</div>
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 px-1 py-0.5 text-xs">
                      <span className="truncate flex-1" title={f.path}>{f.path}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{fmtSize(f.size)}</span>
                      <a href={f.url} download={f.name} className="text-primary hover:underline shrink-0" title="Download"><Download className="h-3.5 w-3.5" /></a>
                      <button onClick={() => removeFile(t.id, f.id)} className="text-muted-foreground hover:text-destructive shrink-0" title="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Note: uploads are kept in this browser session. Connect Lovable Cloud to persist files across reloads and team members.</p>
    </div>
  );
}

// =================== TASKS & REMINDERS REGISTER ===================
const REMINDER_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const REMINDER_STATUSES = ["OPEN", "IN PROGRESS", "DONE"] as const;
const PRIORITY_CLS: Record<string, string> = {
  LOW: "bg-muted text-muted-foreground border-border",
  MEDIUM: "bg-primary/15 text-primary border-primary/30",
  HIGH: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40",
  URGENT: "bg-destructive/15 text-destructive border-destructive/40",
};
const STATUS_CLS: Record<string, string> = {
  OPEN: "bg-muted text-foreground border-border",
  "IN PROGRESS": "bg-primary/15 text-primary border-primary/30",
  DONE: "bg-success/15 text-success border-success/40",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function dueLabel(dueDate: string, status: string) {
  if (!dueDate) return { text: "No due date", tone: "muted" as const };
  if (status === "DONE") return { text: `Due ${dueDate}`, tone: "success" as const };
  const today = new Date(todayIso());
  const due = new Date(dueDate);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "danger" as const };
  if (days === 0) return { text: "Due today", tone: "danger" as const };
  if (days === 1) return { text: "Due tomorrow", tone: "warning" as const };
  if (days <= 7) return { text: `Due in ${days}d`, tone: "warning" as const };
  return { text: `Due in ${days}d`, tone: "muted" as const };
}

export function TasksRegisterSection() {
  const reminders = usePlaybook((s) => s.reminderTasks);
  const userAccounts = usePlaybook((s) => s.userAccounts);
  const addReminderTask = usePlaybook((s) => s.addReminderTask);
  const updateReminderTask = usePlaybook((s) => s.updateReminderTask);
  const deleteReminderTask = usePlaybook((s) => s.deleteReminderTask);
  const saveReminderTask = usePlaybook((s) => s.saveReminderTask);
  const syncReminderTasksFromTable = usePlaybook((s) => s.syncReminderTasksFromTable);
  const syncUsersFromTable = usePlaybook((s) => s.syncUsersFromTable);

  const [filter, setFilter] = useState<"all" | "open" | "due" | "overdue" | "done">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    details: "",
    assignee: "",
    dueDate: "",
    remindAt: "",
    priority: "MEDIUM" as (typeof REMINDER_PRIORITIES)[number],
  });

  useEffect(() => {
    void syncReminderTasksFromTable();
    void syncUsersFromTable();
  }, [syncReminderTasksFromTable, syncUsersFromTable]);

  const today = todayIso();
  const open = reminders.filter((r) => r.status !== "DONE");
  const overdue = open.filter((r) => r.dueDate && r.dueDate < today);
  const dueToday = open.filter((r) => r.dueDate === today);
  const dueSoon = open.filter((r) => r.dueDate && r.dueDate > today && (new Date(r.dueDate).getTime() - new Date(today).getTime()) <= 7 * 86400000);
  const done = reminders.filter((r) => r.status === "DONE");

  const visible = reminders
    .filter((r) => {
      if (filter === "all") return true;
      if (filter === "open") return r.status !== "DONE";
      if (filter === "done") return r.status === "DONE";
      if (filter === "due") return r.status !== "DONE" && (r.dueDate === today || (r.dueDate && r.dueDate > today && new Date(r.dueDate).getTime() - new Date(today).getTime() <= 7 * 86400000));
      if (filter === "overdue") return r.status !== "DONE" && r.dueDate && r.dueDate < today;
      return true;
    })
    .sort((a, b) => {
      if (a.status === "DONE" && b.status !== "DONE") return 1;
      if (b.status === "DONE" && a.status !== "DONE") return -1;
      const da = a.dueDate || "9999-12-31";
      const db = b.dueDate || "9999-12-31";
      return da.localeCompare(db);
    });

  const submit = async () => {
    if (!draft.title.trim()) return;

    const id = Math.random().toString(36).slice(2, 10);
    const createdAt = new Date().toISOString();
    addReminderTask({
      id,
      createdAt,
      title: draft.title.trim(),
      details: draft.details.trim(),
      assignee: draft.assignee.trim(),
      dueDate: draft.dueDate,
      remindAt: draft.remindAt || draft.dueDate,
      priority: draft.priority,
      status: "OPEN",
    });

    setSavingId(id);
    try {
      await saveReminderTask(id);
    } finally {
      setSavingId(null);
      setDraft({ title: "", details: "", assignee: "", dueDate: "", remindAt: "", priority: "MEDIUM" });
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="🔔 Tasks & Reminders"
        subtitle="Assign a task, set a due date and a reminder. Anything due today, due soon, or overdue is surfaced on Mission Control."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
        {[
          { label: "TOTAL", value: reminders.length, tone: "text-foreground" },
          { label: "OPEN", value: open.length, tone: "text-primary" },
          { label: "DUE TODAY", value: dueToday.length, tone: dueToday.length ? "text-destructive" : "text-muted-foreground" },
          { label: "OVERDUE", value: overdue.length, tone: overdue.length ? "text-destructive" : "text-muted-foreground" },
          { label: "DONE", value: done.length, tone: "text-success" },
        ].map((t) => (
          <div key={t.label} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</div>
            <div className={cn("text-lg font-bold tabular-nums", t.tone)}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Add a task / reminder</div>
        <div className="grid md:grid-cols-12 gap-2">
          <Input
            className="md:col-span-4 h-9 text-sm"
            placeholder="Task title (e.g. Send cost code template to Bec)"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <Input
            className="md:col-span-2 h-9 text-sm"
            list="reminder-assignees"
            placeholder="Assign to…"
            value={draft.assignee}
            onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
          />
          <datalist id="reminder-assignees">
            {userAccounts.map((u) => (
              <option key={u.id} value={u.name}>
                {u.role || u.position || "User account"}{u.department ? ` — ${u.department}` : ""}
              </option>
            ))}
          </datalist>
          <div className="md:col-span-2">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Due date</label>
            <Input type="date" className="h-9 text-sm" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Remind on</label>
            <Input type="date" className="h-9 text-sm" value={draft.remindAt} onChange={(e) => setDraft({ ...draft, remindAt: e.target.value })} />
          </div>
          <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as (typeof REMINDER_PRIORITIES)[number] })}>
            <SelectTrigger className={cn("md:col-span-2 h-9 text-sm font-semibold border self-end", PRIORITY_CLS[draft.priority])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          className="text-sm min-h-[64px]"
          placeholder="Details (optional) — what specifically needs doing"
          value={draft.details}
          onChange={(e) => setDraft({ ...draft, details: e.target.value })}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => void submit()} disabled={!draft.title.trim() || savingId !== null}>
            <Plus className="h-4 w-4" /> Add reminder
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: "all", label: `All (${reminders.length})` },
          { id: "open", label: `Open (${open.length})` },
          { id: "due", label: `Due / soon (${dueToday.length + dueSoon.length})` },
          { id: "overdue", label: `Overdue (${overdue.length})` },
          { id: "done", label: `Done (${done.length})` },
        ] as const).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
              filter === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {visible.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No tasks match this filter. Add one above to get started.
          </div>
        ) : (
          <div className="divide-y">
            {visible.map((r) => {
              const due = dueLabel(r.dueDate, r.status);
              return (
                <div key={r.id} className={cn("p-4 space-y-2", r.status === "DONE" && "bg-muted/30")}>
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className={cn("font-semibold text-sm", r.status === "DONE" && "line-through text-muted-foreground")}>{r.title}</div>
                      {r.details && <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{r.details}</div>}
                    </div>
                    <span className={cn("rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", PRIORITY_CLS[r.priority])}>{r.priority}</span>
                    <span className={cn(
                      "rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      due.tone === "danger" && "bg-destructive/15 text-destructive border-destructive/40",
                      due.tone === "warning" && "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40",
                      due.tone === "success" && "bg-success/15 text-success border-success/40",
                      due.tone === "muted" && "bg-muted text-muted-foreground border-border"
                    )}>{due.text}</span>
                  </div>

                  <div className="grid md:grid-cols-12 gap-2 items-end">
                    <div className="md:col-span-3">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Assigned to</label>
                      <Input className="h-8 text-xs" value={r.assignee} list="reminder-assignees" onChange={(e) => updateReminderTask(r.id, { assignee: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Due</label>
                      <Input type="date" className="h-8 text-xs" value={r.dueDate} onChange={(e) => updateReminderTask(r.id, { dueDate: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Remind on</label>
                      <Input type="date" className="h-8 text-xs" value={r.remindAt} onChange={(e) => updateReminderTask(r.id, { remindAt: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Priority</label>
                      <Select value={r.priority} onValueChange={(v) => updateReminderTask(r.id, { priority: v as (typeof REMINDER_PRIORITIES)[number] })}>
                        <SelectTrigger className={cn("h-8 text-[11px] font-semibold border", PRIORITY_CLS[r.priority])}><SelectValue /></SelectTrigger>
                        <SelectContent>{REMINDER_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">Status</label>
                      <Select value={r.status} onValueChange={(v) => updateReminderTask(r.id, { status: v as (typeof REMINDER_STATUSES)[number] })}>
                        <SelectTrigger className={cn("h-8 text-[11px] font-semibold border", STATUS_CLS[r.status])}><SelectValue /></SelectTrigger>
                        <SelectContent>{REMINDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1 flex md:justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        title="Save reminder"
                        onClick={() => void saveReminderTask(r.id)}
                        disabled={savingId === r.id}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      {r.status !== "DONE" ? (
                        <Button size="sm" variant="outline" className="h-8 px-2" title="Mark as done" onClick={() => updateReminderTask(r.id, { status: "DONE" })}>
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8 px-2" title="Re-open" onClick={() => updateReminderTask(r.id, { status: "OPEN" })}>
                          ↺
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:text-destructive" title="Delete" onClick={() => deleteReminderTask(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
