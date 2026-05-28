import { useMemo, useState } from "react";
import { usePlaybook } from "@/lib/playbook-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Mail, Eye, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildCompleteEmail,
  buildKickoffEmail,
  buildMailto,
  buildTrainingEmail,
  buildWeeklyEmail,
  buildWorkshopEmail,
  type DraftedEmail,
} from "@/lib/email-templates";

export function EmailAutomationPanel({
  onAutoFillWeek,
}: {
  onAutoFillWeek?: (weekIdx: number) => void;
}) {
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

  const ctx = useMemo(
    () => ({ client, tasks, taskOverrides, timelineMode, startDate, issues, stakeholders, champions, dod, intranet, sessions }),
    [client, tasks, taskOverrides, timelineMode, startDate, issues, stakeholders, champions, dod, intranet, sessions]
  );

  const [preview, setPreview] = useState<DraftedEmail | null>(null);
  const [weekIdx, setWeekIdx] = useState(0);
  const [weekDate, setWeekDate] = useState(() => new Date().toISOString().slice(0, 10));

  const kickoff = useMemo(() => buildKickoffEmail(ctx), [ctx]);
  const complete = useMemo(() => buildCompleteEmail(ctx), [ctx]);

  const workshops = sessions.filter((s) => s.type === "Workshop");
  const trainings = sessions.filter((s) => s.type === "Training");

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-gradient-to-br from-primary-soft/40 to-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" /> Auto-drafted emails
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Every email here is built live from your registers (tasks, sessions, queries, Intranet Pack, stakeholders).
          Click <span className="font-semibold">Preview</span> to inspect, then <span className="font-semibold">Copy</span> or
          <span className="font-semibold"> Open in your mail client</span> to send from your own inbox.
        </p>
      </div>

      <Tabs defaultValue="cycle" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="cycle">Kickoff & Complete</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="workshops">Workshops</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="cycle" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <EmailCard
            icon="🚀"
            title="Kickoff Email"
            description="Auto-built from Project Details, Client info, Stakeholder Map and Phase 1 tasks."
            email={kickoff}
            onPreview={setPreview}
          />
          <EmailCard
            icon="🎉"
            title="Implementation Complete"
            description="Auto-built from Definition of Done, Champion Register and the Intranet Pack."
            email={complete}
            onPreview={setPreview}
          />
        </TabsContent>

        <TabsContent value="weekly" className="mt-4 space-y-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold mb-3">Generate a weekly update</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Week number</div>
                <Input
                  type="number"
                  min={1}
                  value={weekIdx + 1}
                  onChange={(e) => setWeekIdx(Math.max(0, (parseInt(e.target.value) || 1) - 1))}
                  className="h-9"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Week ending</div>
                <Input type="date" value={weekDate} onChange={(e) => setWeekDate(e.target.value)} className="h-9" />
              </div>
              <Button
                onClick={() =>
                  setPreview(buildWeeklyEmail(ctx, { weekEndingDate: weekDate, weekNumber: weekIdx + 1 }))
                }
                className="h-9"
              >
                <Eye className="h-4 w-4 mr-1" /> Preview Week {weekIdx + 1}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              ✅ Completed in last 7 days · 🚧 In progress now · 📅 Coming next 7 days · ⚠️ Blocked tasks + open queries
            </p>
            {onAutoFillWeek && (
              <div className="mt-3 text-xs text-muted-foreground">
                Tip: in the Weekly Log table below, hit{" "}
                <span className="font-semibold text-foreground">Auto-fill</span> on any row to pour the generated
                summary into your existing fields.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workshops" className="mt-4">
          <SessionList
            sessions={workshops}
            label="Workshop"
            build={(s) => buildWorkshopEmail(ctx, s)}
            onPreview={setPreview}
          />
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <SessionList
            sessions={trainings}
            label="Training"
            build={(s) => buildTrainingEmail(ctx, s)}
            onPreview={setPreview}
          />
        </TabsContent>
      </Tabs>

      <PreviewDialog email={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function EmailCard({
  icon,
  title,
  description,
  email,
  onPreview,
}: {
  icon: string;
  title: string;
  description: string;
  email: DraftedEmail;
  onPreview: (e: DraftedEmail) => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <span className="text-2xl leading-none">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground border-t pt-2 mt-1">
        <span className="font-semibold text-foreground">To:</span> {email.ccDescription}
        {email.recipients.length > 0 && (
          <span className="ml-1 text-muted-foreground">· {email.recipients.length} address{email.recipients.length === 1 ? "" : "es"}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        <Button size="sm" variant="default" onClick={() => onPreview(email)}>
          <Eye className="h-3.5 w-3.5 mr-1" /> Preview
        </Button>
        <Button size="sm" variant="outline" onClick={() => copyText(email.plainText)}>
          <Copy className="h-3.5 w-3.5 mr-1" /> Copy
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href={buildMailto(email)}>
            <Mail className="h-3.5 w-3.5 mr-1" /> Open in mail
          </a>
        </Button>
      </div>
    </div>
  );
}

function SessionList<T extends { id: string; name: string; module: string }>({
  sessions,
  label,
  build,
  onPreview,
}: {
  sessions: T[];
  label: string;
  build: (s: T) => DraftedEmail;
  onPreview: (e: DraftedEmail) => void;
}) {
  return (
    <div className="rounded-xl border bg-card divide-y">
      {sessions.map((s) => (
        <div key={s.id} className="flex flex-col md:flex-row md:items-center gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">
              <span className="font-mono text-primary mr-2">{s.id}</span>
              {s.name}
            </div>
            <div className="text-[11px] text-muted-foreground">{label} · Module {s.module}</div>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <Button size="sm" variant="default" onClick={() => onPreview(build(s))}>
              <Eye className="h-3.5 w-3.5 mr-1" /> Preview
            </Button>
            <Button size="sm" variant="outline" onClick={() => copyText(build(s).plainText)}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={buildMailto(build(s))}>
                <Mail className="h-3.5 w-3.5 mr-1" /> Open
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewDialog({ email, onClose }: { email: DraftedEmail | null; onClose: () => void }) {
  const [tab, setTab] = useState<"html" | "text">("html");
  if (!email) return null;
  return (
    <Dialog open={!!email} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-5 py-3 border-b">
          <DialogTitle className="text-base">Email Preview</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-3 border-b space-y-2 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-x-3 gap-y-1.5 text-xs">
            <div className="text-muted-foreground font-semibold uppercase tracking-wider">Subject</div>
            <div className="font-semibold">{email.subject}</div>
            <div className="text-muted-foreground font-semibold uppercase tracking-wider">To</div>
            <div className="font-mono text-[11px] break-all">
              {email.recipients.length ? email.recipients.join(", ") : <span className="text-muted-foreground italic">No stakeholder emails captured — add them in the Stakeholder Map</span>}
            </div>
            <div className="text-muted-foreground font-semibold uppercase tracking-wider">Audience</div>
            <div>{email.ccDescription}</div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Button size="sm" variant="default" onClick={() => copyText(email.html, "HTML copied")}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy HTML
            </Button>
            <Button size="sm" variant="outline" onClick={() => copyText(email.plainText, "Plain text copied")}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy as Plain Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => copyText(email.subject, "Subject copied")}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Subject
            </Button>
            <Button size="sm" asChild>
              <a href={buildMailto(email)}>
                <Mail className="h-3.5 w-3.5 mr-1" /> Open in Mail Client
              </a>
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="ml-auto">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="px-5 pt-2 border-b flex gap-1 text-xs">
          {(["html", "text"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 border-b-2 -mb-px font-semibold transition-colors",
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "html" ? "Rendered Preview" : "Plain Text"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto bg-muted/10">
          {tab === "html" ? (
            <iframe
              title="Email preview"
              srcDoc={email.html}
              className="w-full h-[60vh] border-0 bg-white"
            />
          ) : (
            <Textarea
              readOnly
              value={email.plainText}
              className="font-mono text-xs h-[60vh] rounded-none border-0 bg-white resize-none"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function copyText(text: string, _label = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}
