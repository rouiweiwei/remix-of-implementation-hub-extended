import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { usePlaybook, type SessionStatus } from "@/lib/playbook-store";
import { SectionHeader, StatusBadge } from "../shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Check, Download, Upload, Send, Sparkles, FileSpreadsheet } from "lucide-react";
import { TRAINING_MODULES } from "@/lib/playbook-data";
import { cn } from "@/lib/utils";

// =============== SESSION REGISTER ===============
const SESSION_STATUS_CLS: Record<SessionStatus, string> = {
  "Scheduled": "bg-primary/15 text-primary border-primary/30",
  "In Progress": "bg-warning/20 text-warning-foreground border-warning/40",
  "Completed": "bg-success/15 text-success border-success/30",
  "Blocked": "bg-destructive/15 text-destructive border-destructive/30",
};

export function SessionRegisterSection() {
  const sessions = usePlaybook((s) => s.sessions);
  const stakeholders = usePlaybook((s) => s.stakeholders);
  const add = usePlaybook((s) => s.addSession);
  const update = usePlaybook((s) => s.updateSession);
  const del = usePlaybook((s) => s.deleteSession);

  const facilitators = Array.from(new Set([
    ...stakeholders.map((s) => s.name).filter(Boolean),
    "Travis", "Tony", "Ayman", "Christian Lowe",
  ]));

  return (
    <div className="space-y-5">
      <SectionHeader title="📅 Session Register" subtitle="Every workshop and training session — facilitator, date, status, location.">
        <Button onClick={() => add({ type: "Workshop", topic: "New session", module: "", date: new Date().toISOString().slice(0, 10), duration: "60 min", facilitator: facilitators[0] || "", location: "", status: "Scheduled" })}>
          <Plus className="h-4 w-4" /> Add session
        </Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[110px_1.5fr_120px_130px_90px_160px_1fr_140px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Type</div><div>Topic / Session</div><div>Module</div><div>Date</div><div>Duration</div><div>Facilitator</div><div>Location / Link</div><div>Status</div><div></div>
          </div>
          {sessions.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No sessions yet — add your first.</div>}
          {sessions.map((s) => (
            <div key={s.id} className="grid grid-cols-[110px_1.5fr_120px_130px_90px_160px_1fr_140px_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Select value={s.type} onValueChange={(v) => update(s.id, { type: v as "Workshop" | "Training" })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Training">Training</SelectItem></SelectContent>
              </Select>
              <Input className="h-8 text-sm" value={s.topic} onChange={(e) => update(s.id, { topic: e.target.value })} />
              <Select value={s.module || "none"} onValueChange={(v) => update(s.id, { module: v === "none" ? "" : v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {TRAINING_MODULES.map((m) => <SelectItem key={m.id} value={m.id}>{m.id}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input className="h-8 text-xs" type="date" value={s.date} onChange={(e) => update(s.id, { date: e.target.value })} />
              <Input className="h-8 text-xs" value={s.duration} onChange={(e) => update(s.id, { duration: e.target.value })} />
              <Select value={s.facilitator || "unassigned"} onValueChange={(v) => update(s.id, { facilitator: v === "unassigned" ? "" : v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Unassigned —</SelectItem>
                  {facilitators.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input className="h-8 text-xs" value={s.location} onChange={(e) => update(s.id, { location: e.target.value })} placeholder="Teams link / address…" />
              <Select value={s.status} onValueChange={(v) => update(s.id, { status: v as SessionStatus })}>
                <SelectTrigger className={cn("h-8 text-xs font-semibold border", SESSION_STATUS_CLS[s.status])}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">🔵 Scheduled</SelectItem>
                  <SelectItem value="In Progress">🟠 In Progress</SelectItem>
                  <SelectItem value="Completed">🟢 Completed</SelectItem>
                  <SelectItem value="Blocked">🔴 Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== ATTENDANCE ===============
export function AttendanceSection() {
  const sessions = usePlaybook((s) => s.sessions);
  const attendees = usePlaybook((s) => s.attendees);
  const add = usePlaybook((s) => s.addAttendee);
  const update = usePlaybook((s) => s.updateAttendee);
  const del = usePlaybook((s) => s.deleteAttendee);
  const [sessionId, setSessionId] = useState<string>("");

  const rows = sessionId ? attendees.filter((a) => a.sessionId === sessionId) : attendees;

  return (
    <div className="space-y-5">
      <SectionHeader title="✅ Attendance Register" subtitle="Who attended every session — name, job title, company, signature.">
        <Button disabled={!sessionId} onClick={() => add({ sessionId, name: "", jobTitle: "", company: "", signature: "", status: "Present" })}><Plus className="h-4 w-4" /> Add attendee</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-64">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Session</label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Pick session" /></SelectTrigger>
            <SelectContent>
              {sessions.length === 0 ? <div className="px-2 py-2 text-xs text-muted-foreground">No sessions — add one in Session Register</div> :
                sessions.map((s) => <SelectItem key={s.id} value={s.id}>{s.topic} ({s.date})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[1fr_1fr_160px_180px_160px_140px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Session</div><div>Name</div><div>Job Title</div><div>Company</div><div>Signature</div><div>Status</div><div></div>
          </div>
          {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No attendance yet. Pick a session and add attendees.</div>}
          {rows.map((a) => {
            const sess = sessions.find((s) => s.id === a.sessionId);
            return (
              <div key={a.id} className="grid grid-cols-[1fr_1fr_160px_180px_160px_140px_40px] gap-2 px-3 py-2 items-center border-b last:border-0 text-sm">
                <div className="truncate text-xs text-muted-foreground">{sess?.topic || "—"}</div>
                <Input className="h-8 text-sm" value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} />
                <Input className="h-8 text-xs" value={a.jobTitle} onChange={(e) => update(a.id, { jobTitle: e.target.value })} />
                <Input className="h-8 text-xs" value={a.company} onChange={(e) => update(a.id, { company: e.target.value })} />
                <Input className="h-8 text-xs italic" value={a.signature} onChange={(e) => update(a.id, { signature: e.target.value })} placeholder="Type to sign" />
                <Select value={a.status} onValueChange={(v) => update(a.id, { status: v as "Present" | "Absent" | "Rescheduled" })}>
                  <SelectTrigger className={cn("h-8 text-xs", a.status === "Present" && "text-success", a.status === "Absent" && "text-destructive")}><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Present">Present</SelectItem><SelectItem value="Absent">Absent</SelectItem><SelectItem value="Rescheduled">Rescheduled</SelectItem></SelectContent>
                </Select>
                <Button size="icon" variant="ghost" onClick={() => del(a.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============== COMPETENCY (was Sign-Off) ===============
const COMPETENCY = ["Novice", "Capable", "Proficient", "Expert"] as const;

export function SignOffSection() {
  const signOffs = usePlaybook((s) => s.signOffs);
  const add = usePlaybook((s) => s.addSignOff);
  const update = usePlaybook((s) => s.updateSignOff);
  const del = usePlaybook((s) => s.deleteSignOff);

  return (
    <div className="space-y-5">
      <SectionHeader title="🖊️ Training Competency" subtitle="Per-person competency record — who's trained, what level, signed off by whom.">
        <Button onClick={() => add({ person: "", jobTitle: "", module: TRAINING_MODULES[0].id, competency: "Novice", status: "NOT STARTED", signedBy: "", date: "" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1150px]">
          <div className="grid grid-cols-[1fr_180px_220px_140px_160px_180px_130px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Person</div><div>Job Title</div><div>Module</div><div>Competency</div><div>Status</div><div>Signed Off By</div><div>Date</div><div></div>
          </div>
          {signOffs.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No competency records yet.</div>}
          {signOffs.map((s) => (
            <div key={s.id} className="grid grid-cols-[1fr_180px_220px_140px_160px_180px_130px_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-sm" value={s.person} onChange={(e) => update(s.id, { person: e.target.value })} placeholder="Name…" />
              <Input className="h-8 text-xs" value={s.jobTitle} onChange={(e) => update(s.id, { jobTitle: e.target.value })} placeholder="Title" />
              <Select value={s.module} onValueChange={(v) => update(s.id, { module: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{TRAINING_MODULES.map((m) => <SelectItem key={m.id} value={m.id}>{m.id} — {m.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={s.competency} onValueChange={(v) => update(s.id, { competency: v as typeof COMPETENCY[number] })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{COMPETENCY.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={s.status} onValueChange={(v) => update(s.id, { status: v as "NOT STARTED" | "IN PROGRESS" | "COMPLETE" | "BLOCKED" })}>
                <SelectTrigger className={cn("h-8 text-xs font-semibold border",
                  s.status === "NOT STARTED" && "bg-warning/15 text-warning-foreground border-warning/30",
                  s.status === "IN PROGRESS" && "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40",
                  s.status === "COMPLETE" && "bg-success/15 text-success border-success/30",
                  s.status === "BLOCKED" && "bg-destructive/15 text-destructive border-destructive/30",
                )}><SelectValue /></SelectTrigger>
                <SelectContent>{(["NOT STARTED", "IN PROGRESS", "COMPLETE", "BLOCKED"] as const).map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="h-8 text-xs" value={s.signedBy} onChange={(e) => update(s.id, { signedBy: e.target.value })} placeholder="Trainer / signer" />
              <Input className="h-8 text-xs" type="date" value={s.date} onChange={(e) => update(s.id, { date: e.target.value })} />
              <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== EMAIL LOG ===============
export function EmailLogSection() {
  const emails = usePlaybook((s) => s.emails);
  const update = usePlaybook((s) => s.updateEmail);
  const add = usePlaybook((s) => s.addEmail);

  return (
    <div className="space-y-5">
      <SectionHeader title="📧 Weekly Email Log" subtitle="Every Friday client communication — subject, RAG, highlights, blockers.">
        <Button onClick={() => add({ week: emails.length + 1, date: "", subject: `Week ${emails.length + 1} — Plexa Implementation Update`, recipients: "CEO, CFO, IT Lead, Site Teams, Ops", status: "Green", summary: "", highlights: "", blockers: "", sent: false })}><Plus className="h-4 w-4" /> Add week</Button>
      </SectionHeader>

      <div className="space-y-3">
        {emails.map((e) => (
          <div key={e.id} className="rounded-xl border bg-card p-4">
            <div className="grid md:grid-cols-[70px_130px_1fr_120px_120px] gap-2 items-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Week {e.week}</div>
              <Input type="date" className="h-9 text-xs" value={e.date} onChange={(ev) => update(e.id, { date: ev.target.value })} />
              <Input className="h-9 text-sm font-medium" value={e.subject} onChange={(ev) => update(e.id, { subject: ev.target.value })} placeholder="Subject line" />
              <Select value={e.status} onValueChange={(v) => update(e.id, { status: v as "Green" | "Amber" | "Red" })}>
                <SelectTrigger className={cn("h-9 text-xs font-semibold",
                  e.status === "Green" && "text-success",
                  e.status === "Amber" && "text-warning-foreground",
                  e.status === "Red" && "text-destructive",
                )}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Green">🟢 Green</SelectItem><SelectItem value="Amber">🟠 Amber</SelectItem><SelectItem value="Red">🔴 Red</SelectItem></SelectContent>
              </Select>
              <Button variant={e.sent ? "default" : "outline"} size="sm" onClick={() => update(e.id, { sent: !e.sent })}>
                {e.sent ? <><Check className="h-4 w-4" /> Sent</> : <><Send className="h-4 w-4" /> Mark sent</>}
              </Button>
            </div>
            <Input className="mt-2 h-8 text-xs" value={e.recipients} onChange={(ev) => update(e.id, { recipients: ev.target.value })} placeholder="Recipients" />
            <div className="grid md:grid-cols-3 gap-2 mt-2">
              <Textarea rows={2} className="text-xs" value={e.summary} onChange={(ev) => update(e.id, { summary: ev.target.value })} placeholder="Summary / what we did this week…" />
              <Textarea rows={2} className="text-xs" value={e.highlights} onChange={(ev) => update(e.id, { highlights: ev.target.value })} placeholder="Highlights & wins…" />
              <Textarea rows={2} className="text-xs" value={e.blockers} onChange={(ev) => update(e.id, { blockers: ev.target.value })} placeholder="Blockers & risks…" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== ISSUES ===============
const ISSUE_TYPES = ["🐛 Bug", "👤 User Error", "✨ Feature", "⚙️ Config", "🔗 Integration", "📋 Process Gap", "🎓 Training Gap", "❓ Question", "📦 Data"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export function IssuesSection() {
  const issues = usePlaybook((s) => s.issues);
  const add = usePlaybook((s) => s.addIssue);
  const update = usePlaybook((s) => s.updateIssue);
  const del = usePlaybook((s) => s.deleteIssue);

  return (
    <div className="space-y-5">
      <SectionHeader title="⚠️ Issues Register" subtitle="Every issue logged, typed, owned, dated. Nothing sits open silently.">
        <Button onClick={() => add({ ref: `ISS-${String(issues.length + 1).padStart(3, "0")}`, phase: "Phase 1A", type: "🐛 Bug", description: "", owner: "PLEXA", assignedTo: "", priority: "MEDIUM", raisedAt: new Date().toISOString().slice(0, 10), dueDate: "", status: "Open", resolution: "", closedDate: "" })}><Plus className="h-4 w-4" /> Log issue</Button>
      </SectionHeader>

      <div className="space-y-3">
        {issues.length === 0 && <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No issues logged.</div>}
        {issues.map((i) => (
          <div key={i.id} className="rounded-xl border bg-card p-3">
            <div className="grid md:grid-cols-[90px_110px_150px_1fr_120px_140px_110px_120px_120px_40px] gap-2 items-center">
              <Input className="h-8 text-xs font-mono" value={i.ref} onChange={(e) => update(i.id, { ref: e.target.value })} placeholder="REF" />
              <Input className="h-8 text-xs" value={i.phase} onChange={(e) => update(i.id, { phase: e.target.value })} />
              <Select value={i.type} onValueChange={(v) => update(i.id, { type: v as typeof ISSUE_TYPES[number] })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ISSUE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="h-8 text-sm" value={i.description} onChange={(e) => update(i.id, { description: e.target.value })} placeholder="Description" />
              <Select value={i.owner} onValueChange={(v) => update(i.id, { owner: v as "PLEXA" | "CLIENT" })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="PLEXA">PLEXA</SelectItem><SelectItem value="CLIENT">CLIENT</SelectItem></SelectContent>
              </Select>
              <Input className="h-8 text-xs" value={i.assignedTo} onChange={(e) => update(i.id, { assignedTo: e.target.value })} placeholder="Assigned to" />
              <Select value={i.priority} onValueChange={(v) => update(i.id, { priority: v as typeof PRIORITIES[number] })}>
                <SelectTrigger className={cn("h-8 text-xs font-semibold",
                  i.priority === "CRITICAL" && "text-destructive",
                  i.priority === "HIGH" && "text-warning-foreground",
                )}><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="h-8 text-xs" type="date" value={i.dueDate} onChange={(e) => update(i.id, { dueDate: e.target.value })} />
              <Select value={i.status} onValueChange={(v) => update(i.id, { status: v as "Open" | "In Progress" | "Closed", closedDate: v === "Closed" ? new Date().toISOString().slice(0, 10) : i.closedDate })}>
                <SelectTrigger className={cn("h-8 text-xs font-semibold",
                  i.status === "Open" && "text-warning-foreground",
                  i.status === "Closed" && "text-success",
                )}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => del(i.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
            <Textarea className="mt-2 text-sm" rows={1} value={i.resolution} onChange={(e) => update(i.id, { resolution: e.target.value })} placeholder="Resolution / notes…" />
            <div className="text-[10px] text-muted-foreground mt-1">Raised {i.raisedAt}{i.closedDate && ` · Closed ${i.closedDate}`}</div>
          </div>
        ))}
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
  const sessions = usePlaybook((s) => s.sessions);
  const issues = usePlaybook((s) => s.issues);
  const champions = usePlaybook((s) => s.champions);
  const client = usePlaybook((s) => s.client);
  const signOffs = usePlaybook((s) => s.signOffs);

  const items = [
    { title: "Session Recordings", desc: `${sessions.length} sessions logged`, owner: "Plexa", status: "In Progress", icon: "🎥" },
    { title: "Attendance Registers", desc: "Complete signed register per session", owner: "Plexa", status: "In Progress", icon: "✅" },
    { title: "Training Competency Records", desc: `${signOffs.filter((s) => s.status === "COMPLETE").length} of ${signOffs.length} signed off`, owner: "Plexa", status: "In Progress", icon: "🖊️" },
    { title: "Issue Summary", desc: `${issues.length} raised · ${issues.filter((i) => i.status === "Closed").length} resolved`, owner: "Plexa", status: "Pending", icon: "⚠️" },
    { title: "Champion Roster", desc: `${champions.length} certified internal experts`, owner: "Plexa", status: "Pending", icon: "🏆" },
    { title: "Quick-Start Guides (QSGs)", desc: "Module-by-module how-tos", owner: "Plexa", status: "Pending", icon: "📚" },
    { title: "Configuration Manual", desc: "Folder structure, workflows, cost codes", owner: "Plexa", status: "Pending", icon: "⚙️" },
    { title: "Post-Implementation Email", desc: "Automated handover email + analytics", owner: "Plexa", status: "Pending", icon: "📧" },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="🌐 Client Intranet Pack" subtitle="The complete Plexa training library, delivered at implementation close." />

      <div className="rounded-xl border bg-brand-gradient text-primary-foreground p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="relative">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">Prepared for</div>
          <h3 className="text-2xl font-bold mt-1">{client.clientName}</h3>
          <p className="text-sm opacity-90 mt-1">Handover date · {new Date().toISOString().slice(0, 10)} · Prepared by Plexa Customer Success</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_1fr_120px_140px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
          <div></div><div>Item</div><div>Description</div><div>Owner</div><div>Status</div>
        </div>
        {items.map((x) => (
          <div key={x.title} className="grid grid-cols-[40px_1fr_1fr_120px_140px] gap-2 px-3 py-3 items-center border-b last:border-0">
            <div className="text-xl text-center">{x.icon}</div>
            <div className="text-sm font-semibold">{x.title}</div>
            <div className="text-xs text-muted-foreground">{x.desc}</div>
            <div className="text-xs">{x.owner}</div>
            <StatusBadge status={x.status === "Pending" ? "NOT STARTED" : "IN PROGRESS"} />
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== SESSION CONTENT LOG ===============
export function ContentLogSection() {
  const sessions = usePlaybook((s) => s.sessions);
  const [active, setActive] = useState<string | null>(null);
  const [topics, setTopics] = useState<Record<string, { id: string; topic: string; notes: string; covered: boolean }[]>>({});

  const list = active ? topics[active] || [] : [];
  const update = (id: string, patch: Partial<{ topic: string; notes: string; covered: boolean }>) =>
    setTopics({ ...topics, [active!]: list.map((x) => x.id === id ? { ...x, ...patch } : x) });

  return (
    <div className="space-y-5">
      <SectionHeader title="📚 Session Content Log" subtitle="Every topic per session. Feeds the intranet handover pack." />
      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <div className="rounded-xl border bg-card p-2 max-h-[600px] overflow-y-auto">
          {sessions.length === 0 && <div className="p-4 text-xs text-muted-foreground text-center">Add sessions first.</div>}
          {sessions.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} className={cn("w-full text-left px-3 py-2 rounded-md text-sm", active === s.id ? "bg-primary-soft text-primary" : "hover:bg-muted")}>
              <div className="font-semibold truncate">{s.topic}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.type} · {s.date}</div>
            </button>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-4">
          {!active && <div className="text-sm text-muted-foreground text-center py-8">Pick a session to log topics covered.</div>}
          {active && (
            <div className="space-y-2">
              {list.map((t) => (
                <div key={t.id} className="grid grid-cols-[24px_1fr_2fr] gap-2 items-center">
                  <input type="checkbox" checked={t.covered} onChange={() => update(t.id, { covered: !t.covered })} className="h-4 w-4 accent-[oklch(0.55_0.22_258)]" />
                  <Input className="h-8 text-sm" value={t.topic} onChange={(e) => update(t.id, { topic: e.target.value })} placeholder="Topic / agenda item" />
                  <Input className="h-8 text-xs" value={t.notes} onChange={(e) => update(t.id, { notes: e.target.value })} placeholder="Notes & follow-ups" />
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={() => setTopics({ ...topics, [active]: [...list, { id: Math.random().toString(36).slice(2), topic: "", notes: "", covered: false }] })}><Plus className="h-4 w-4" /> Add topic</Button>
            </div>
          )}
        </div>
      </div>
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
  const COLS = ["name", "email", "phone", "position", "role", "status"];
  const csv = toCSV(users as unknown as Record<string, unknown>[], COLS);

  return (
    <div className="space-y-5">
      <SectionHeader title="👤 User Accounts" subtitle="Name, email, phone, position, role — the complete login roster.">
        <ImportExport filename="user-accounts.csv" csv={csv} columns={COLS} sample={{ name: "Jane Smith", email: "jane@client.com", phone: "0400 000 000", position: "Project Manager", role: "Standard", status: "Pending" }} onImport={(t) => {
          const parsed = fromCSV(t).map((r) => ({
            id: Math.random().toString(36).slice(2),
            name: r.name || "", email: r.email || "", phone: r.phone || "",
            position: r.position || "", role: r.role || "",
            status: ((["Pending", "Invited", "Active", "Disabled"].includes(r.status) ? r.status : "Pending") as "Pending" | "Invited" | "Active" | "Disabled"),
          }));
          replace(parsed);
        }} />
        <Button onClick={() => add({ name: "", email: "", phone: "", position: "", role: "Standard", status: "Pending" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[1fr_1.2fr_140px_180px_160px_140px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Name</div><div>Email</div><div>Phone</div><div>Position</div><div>Role</div><div>Status</div><div></div>
          </div>
          {users.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No users yet — add one or import a CSV.</div>}
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-[1fr_1.2fr_140px_180px_160px_140px_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-sm" value={u.name} onChange={(e) => update(u.id, { name: e.target.value })} />
              <Input className="h-8 text-xs" value={u.email} onChange={(e) => update(u.id, { email: e.target.value })} />
              <Input className="h-8 text-xs" value={u.phone} onChange={(e) => update(u.id, { phone: e.target.value })} />
              <Input className="h-8 text-xs" value={u.position} onChange={(e) => update(u.id, { position: e.target.value })} />
              <Input className="h-8 text-xs" value={u.role} onChange={(e) => update(u.id, { role: e.target.value })} />
              <Select value={u.status} onValueChange={(v) => update(u.id, { status: v as "Pending" | "Invited" | "Active" | "Disabled" })}>
                <SelectTrigger className={cn("h-8 text-xs", u.status === "Active" && "text-success", u.status === "Disabled" && "text-destructive")}><SelectValue /></SelectTrigger>
                <SelectContent>{["Pending", "Invited", "Active", "Disabled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => del(u.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
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
  const COLS = ["code", "name", "type", "client", "pm", "startDate", "endDate", "value", "status"];
  const csv = toCSV(rows as unknown as Record<string, unknown>[], COLS);
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
          <div className="grid grid-cols-[100px_1.2fr_140px_1fr_140px_120px_120px_120px_120px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Code</div><div>Name</div><div>Type</div><div>Client</div><div>PM</div><div>Start</div><div>End</div><div>Value</div><div>Status</div><div></div>
          </div>
          {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No projects yet.</div>}
          {rows.map((p) => (
            <div key={p.id} className="grid grid-cols-[100px_1.2fr_140px_1fr_140px_120px_120px_120px_120px_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
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
              <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
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
  const COLS = ["company", "trade", "contact", "email", "phone", "insurance", "abn", "status"];
  const csv = toCSV(rows as unknown as Record<string, unknown>[], COLS);
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
          <div className="grid grid-cols-[1.2fr_160px_1fr_1fr_140px_180px_140px_140px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Company</div><div>Trade</div><div>Contact</div><div>Email</div><div>Phone</div><div>Insurance Exp.</div><div>ABN</div><div>Status</div><div></div>
          </div>
          {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No contractors yet.</div>}
          {rows.map((c) => (
            <div key={c.id} className="grid grid-cols-[1.2fr_160px_1fr_1fr_140px_180px_140px_140px_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
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
              <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
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
  const COLS = ["code", "name", "category", "unit", "rate", "notes"];
  const csv = toCSV(rows as unknown as Record<string, unknown>[], COLS);
  return (
    <div className="space-y-5">
      <SectionHeader title="💰 Company Cost Codes" subtitle="Company-wide cost code structure — synced into Plexa budgets.">
        <ImportExport filename="cost-codes.csv" csv={csv} onImport={(t) => {
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
          <div className="grid grid-cols-[120px_1.5fr_180px_100px_120px_1fr_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
            <div>Code</div><div>Name</div><div>Category</div><div>Unit</div><div>Rate</div><div>Notes</div><div></div>
          </div>
          {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No cost codes yet.</div>}
          {rows.map((c) => (
            <div key={c.id} className="grid grid-cols-[120px_1.5fr_180px_100px_120px_1fr_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
              <Input className="h-8 text-xs font-mono" value={c.code} onChange={(e) => update(c.id, { code: e.target.value })} />
              <Input className="h-8 text-sm" value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} />
              <Input className="h-8 text-xs" value={c.category} onChange={(e) => update(c.id, { category: e.target.value })} />
              <Input className="h-8 text-xs" value={c.unit} onChange={(e) => update(c.id, { unit: e.target.value })} />
              <Input className="h-8 text-xs" value={c.rate} onChange={(e) => update(c.id, { rate: e.target.value })} />
              <Input className="h-8 text-xs" value={c.notes} onChange={(e) => update(c.id, { notes: e.target.value })} />
              <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
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
• ${issuesClosed}/${issues.length} issues resolved
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
              <Snap label="Issues resolved" value={`${issuesClosed}`} sub={`of ${issues.length}`} />
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
