import { useState } from "react";
import { usePlaybook } from "@/lib/playbook-store";
import { SectionHeader, StatusBadge } from "../shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Check } from "lucide-react";
import { TRAINING_MODULES } from "@/lib/playbook-data";
import { cn } from "@/lib/utils";

export function SessionRegisterSection() {
  const sessions = usePlaybook((s) => s.sessions);
  const add = usePlaybook((s) => s.addSession);
  const update = usePlaybook((s) => s.updateSession);
  const del = usePlaybook((s) => s.deleteSession);

  return (
    <div className="space-y-5">
      <SectionHeader title="📅 Session Register" subtitle="Every workshop and training session logged.">
        <Button onClick={() => add({ type: "Workshop", topic: "New session", date: new Date().toISOString().slice(0, 10), duration: "60 min", attendees: 0, status: "Scheduled" })}>
          <Plus className="h-4 w-4" /> Add session
        </Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[120px_1fr_140px_110px_90px_140px_40px] gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
          <div>Type</div><div>Topic</div><div>Date</div><div>Duration</div><div>Attendees</div><div>Status</div><div></div>
        </div>
        {sessions.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No sessions yet — add your first.</div>}
        {sessions.map((s) => (
          <div key={s.id} className="grid grid-cols-[120px_1fr_140px_110px_90px_140px_40px] gap-3 px-4 py-2 items-center border-b last:border-0">
            <Select value={s.type} onValueChange={(v) => update(s.id, { type: v as "Workshop" | "Training" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Training">Training</SelectItem></SelectContent>
            </Select>
            <Input className="h-8 text-sm" value={s.topic} onChange={(e) => update(s.id, { topic: e.target.value })} />
            <Input className="h-8 text-xs" type="date" value={s.date} onChange={(e) => update(s.id, { date: e.target.value })} />
            <Input className="h-8 text-xs" value={s.duration} onChange={(e) => update(s.id, { duration: e.target.value })} />
            <Input className="h-8 text-xs" type="number" value={s.attendees} onChange={(e) => update(s.id, { attendees: +e.target.value })} />
            <Select value={s.status} onValueChange={(v) => update(s.id, { status: v as "Scheduled" | "Held" | "Cancelled" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Scheduled">Scheduled</SelectItem><SelectItem value="Held">Held</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent>
            </Select>
            <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttendanceSection() {
  const sessions = usePlaybook((s) => s.sessions);
  const attendees = usePlaybook((s) => s.attendees);
  const add = usePlaybook((s) => s.addAttendee);
  const del = usePlaybook((s) => s.deleteAttendee);
  const [sessionId, setSessionId] = useState<string>("");
  const [name, setName] = useState("");

  const rows = sessionId ? attendees.filter((a) => a.sessionId === sessionId) : attendees;

  return (
    <div className="space-y-5">
      <SectionHeader title="✅ Attendance Register" subtitle="Who attended every session — present, absent, rescheduled." />

      <div className="rounded-xl border bg-card p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Session</label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Pick session" /></SelectTrigger>
            <SelectContent>
              {sessions.length === 0 ? <div className="px-2 py-2 text-xs text-muted-foreground">No sessions — add one in Session Register</div> :
                sessions.map((s) => <SelectItem key={s.id} value={s.id}>{s.topic} ({s.date})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Attendee name</label>
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name…" />
        </div>
        <Button disabled={!sessionId || !name} onClick={() => { add({ sessionId, name, status: "Present" }); setName(""); }}><Plus className="h-4 w-4" /> Log</Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_140px_40px] gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
          <div>Session</div><div>Name</div><div>Status</div><div></div>
        </div>
        {rows.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No attendance yet.</div>}
        {rows.map((a) => {
          const sess = sessions.find((s) => s.id === a.sessionId);
          return (
            <div key={a.id} className="grid grid-cols-[1fr_1fr_140px_40px] gap-3 px-4 py-2 items-center border-b last:border-0 text-sm">
              <div className="truncate">{sess?.topic || "—"}</div>
              <div>{a.name}</div>
              <Select value={a.status} onValueChange={(v) => { /* simple delete+add to update */ usePlaybook.getState().addAttendee({ sessionId: a.sessionId, name: a.name, status: v as "Present" | "Absent" | "Rescheduled" }); del(a.id); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Present">Present</SelectItem><SelectItem value="Absent">Absent</SelectItem><SelectItem value="Rescheduled">Rescheduled</SelectItem></SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => del(a.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SignOffSection() {
  const signOffs = usePlaybook((s) => s.signOffs);
  const add = usePlaybook((s) => s.addSignOff);
  const update = usePlaybook((s) => s.updateSignOff);
  const del = usePlaybook((s) => s.deleteSignOff);

  return (
    <div className="space-y-5">
      <SectionHeader title="🖊️ Training Sign-Off" subtitle="Individual competency record — per person, per module.">
        <Button onClick={() => add({ person: "", module: TRAINING_MODULES[0].id, status: "NOT STARTED", date: "" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_220px_160px_140px_40px] gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
          <div>Person</div><div>Module</div><div>Status</div><div>Date</div><div></div>
        </div>
        {signOffs.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No sign-offs yet.</div>}
        {signOffs.map((s) => (
          <div key={s.id} className="grid grid-cols-[1fr_220px_160px_140px_40px] gap-3 px-4 py-2 items-center border-b last:border-0">
            <Input className="h-8 text-sm" value={s.person} onChange={(e) => update(s.id, { person: e.target.value })} placeholder="Name…" />
            <Select value={s.module} onValueChange={(v) => update(s.id, { module: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{TRAINING_MODULES.map((m) => <SelectItem key={m.id} value={m.id}>{m.id} — {m.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={s.status} onValueChange={(v) => update(s.id, { status: v as "NOT STARTED" | "IN PROGRESS" | "COMPLETE" | "BLOCKED" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{(["NOT STARTED", "IN PROGRESS", "COMPLETE", "BLOCKED"] as const).map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
            <Input className="h-8 text-xs" type="date" value={s.date} onChange={(e) => update(s.id, { date: e.target.value })} />
            <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmailLogSection() {
  const emails = usePlaybook((s) => s.emails);
  const update = usePlaybook((s) => s.updateEmail);
  const add = usePlaybook((s) => s.addEmail);

  return (
    <div className="space-y-5">
      <SectionHeader title="📧 Weekly Email Log" subtitle="Every Friday client communication logged.">
        <Button onClick={() => add({ week: emails.length + 1, date: "", recipients: "CEO, CFO, IT Lead, Site Teams, Ops", status: "Green", summary: "", sent: false })}><Plus className="h-4 w-4" /> Add week</Button>
      </SectionHeader>

      <div className="space-y-3">
        {emails.map((e) => (
          <div key={e.id} className="rounded-xl border bg-card p-4">
            <div className="grid md:grid-cols-[80px_140px_1fr_140px_120px] gap-3 items-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Week {e.week}</div>
              <Input type="date" className="h-9 text-xs" value={e.date} onChange={(ev) => update(e.id, { date: ev.target.value })} />
              <Input className="h-9 text-xs" value={e.recipients} onChange={(ev) => update(e.id, { recipients: ev.target.value })} placeholder="Recipients" />
              <Select value={e.status} onValueChange={(v) => update(e.id, { status: v as "Green" | "Amber" | "Red" })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Green">🟢 Green</SelectItem><SelectItem value="Amber">🟠 Amber</SelectItem><SelectItem value="Red">🔴 Red</SelectItem></SelectContent>
              </Select>
              <Button variant={e.sent ? "default" : "outline"} size="sm" onClick={() => update(e.id, { sent: !e.sent })}>
                {e.sent ? <><Check className="h-4 w-4" /> Sent</> : "Mark sent"}
              </Button>
            </div>
            <Textarea className="mt-3 text-sm" rows={2} value={e.summary} onChange={(ev) => update(e.id, { summary: ev.target.value })} placeholder="✅ Completed | 📅 Next week | ⚠️ Issues | 📸 Photos…" />
          </div>
        ))}
      </div>
    </div>
  );
}

const ISSUE_TYPES = ["🐛 Bug", "👤 User Error", "✨ Feature", "⚙️ Config", "🔗 Integration", "📋 Process Gap", "🎓 Training Gap", "❓ Question", "📦 Data"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export function IssuesSection() {
  const issues = usePlaybook((s) => s.issues);
  const add = usePlaybook((s) => s.addIssue);
  const update = usePlaybook((s) => s.updateIssue);
  const del = usePlaybook((s) => s.deleteIssue);

  return (
    <div className="space-y-5">
      <SectionHeader title="⚠️ Issues Register" subtitle="Every issue logged, typed, owned. Nothing sits open silently.">
        <Button onClick={() => add({ phase: "Phase 1A", type: "🐛 Bug", description: "", owner: "PLEXA", priority: "MEDIUM", raisedAt: new Date().toISOString().slice(0, 10), status: "Open", resolution: "" })}><Plus className="h-4 w-4" /> Log issue</Button>
      </SectionHeader>

      <div className="space-y-3">
        {issues.length === 0 && <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No issues logged.</div>}
        {issues.map((i) => (
          <div key={i.id} className="rounded-xl border bg-card p-4">
            <div className="grid md:grid-cols-[110px_160px_1fr_120px_120px_120px_40px] gap-2 items-center">
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
              <Select value={i.priority} onValueChange={(v) => update(i.id, { priority: v as typeof PRIORITIES[number] })}>
                <SelectTrigger className={cn("h-8 text-xs", i.priority === "CRITICAL" && "text-destructive", i.priority === "HIGH" && "text-warning-foreground")}><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={i.status} onValueChange={(v) => update(i.id, { status: v as "Open" | "In Progress" | "Closed" })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => del(i.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
            <Textarea className="mt-2 text-sm" rows={1} value={i.resolution} onChange={(e) => update(i.id, { resolution: e.target.value })} placeholder="Resolution / notes…" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StakeholdersSection() {
  const list = usePlaybook((s) => s.stakeholders);
  const add = usePlaybook((s) => s.addStakeholder);
  const update = usePlaybook((s) => s.updateStakeholder);
  const del = usePlaybook((s) => s.deleteStakeholder);
  return (
    <div className="space-y-5">
      <SectionHeader title="👥 Stakeholder Map" subtitle="CEO, CFO, IT, Site, Ops — sentiment and engagement tracker.">
        <Button onClick={() => add({ name: "", role: "", dept: "", influence: "Medium", email: "", phone: "", sentiment: "Unknown", lastTouch: "" })}><Plus className="h-4 w-4" /> Add</Button>
      </SectionHeader>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_140px_110px_140px_140px_40px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b">
          <div>Name</div><div>Role · Department</div><div>Influence</div><div>Sentiment</div><div>Email</div><div>Phone</div><div></div>
        </div>
        {list.map((s) => (
          <div key={s.id} className="grid grid-cols-[1fr_1fr_140px_110px_140px_140px_40px] gap-2 px-3 py-2 items-center border-b last:border-0">
            <Input className="h-8 text-sm" value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} placeholder="Name" />
            <div className="flex gap-1"><Input className="h-8 text-xs" value={s.role} onChange={(e) => update(s.id, { role: e.target.value })} placeholder="Role" /><Input className="h-8 text-xs" value={s.dept} onChange={(e) => update(s.id, { dept: e.target.value })} placeholder="Dept" /></div>
            <Select value={s.influence} onValueChange={(v) => update(s.id, { influence: v as "Low" | "Medium" | "High" })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select>
            <Select value={s.sentiment} onValueChange={(v) => update(s.id, { sentiment: v as "Negative" | "Neutral" | "Positive" | "Unknown" })}>
              <SelectTrigger className={cn("h-8 text-xs", s.sentiment === "Positive" && "text-success", s.sentiment === "Negative" && "text-destructive")}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Positive">😊 Positive</SelectItem><SelectItem value="Neutral">😐 Neutral</SelectItem><SelectItem value="Negative">😟 Negative</SelectItem><SelectItem value="Unknown">❓ Unknown</SelectItem></SelectContent>
            </Select>
            <Input className="h-8 text-xs" value={s.email} onChange={(e) => update(s.id, { email: e.target.value })} placeholder="Email" />
            <Input className="h-8 text-xs" value={s.phone} onChange={(e) => update(s.id, { phone: e.target.value })} placeholder="Phone" />
            <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

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

export function IntranetSection() {
  const sessions = usePlaybook((s) => s.sessions);
  const issues = usePlaybook((s) => s.issues);
  const champions = usePlaybook((s) => s.champions);
  const client = usePlaybook((s) => s.client);
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

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Session recordings", desc: `${sessions.length} sessions logged`, icon: "🎥" },
          { title: "Attendance registers", desc: "Complete signed register per session", icon: "✅" },
          { title: "Training sign-offs", desc: "Per-person competency record", icon: "🖊️" },
          { title: "Issue summary", desc: `${issues.length} issues raised · ${issues.filter((i) => i.status === "Closed").length} resolved`, icon: "⚠️" },
          { title: "Champion roster", desc: `${champions.length} certified internal experts`, icon: "🏆" },
          { title: "Quick-start guides (QSGs)", desc: "Module-by-module how-tos", icon: "📚" },
        ].map((x) => (
          <div key={x.title} className="rounded-xl border bg-card p-4 flex items-start gap-3">
            <div className="text-2xl">{x.icon}</div>
            <div>
              <div className="font-semibold text-sm">{x.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{x.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
