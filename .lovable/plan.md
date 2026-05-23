# Auto-Drafted Emails (no backend required)

You hit "Generate" on any email and the app builds the subject + HTML body + plain-text version from the live data in your playbook. You preview it, then either **Copy** it or click **Open in Outlook/Gmail** (mailto link with subject + body pre-filled) and send from your own inbox.

Nothing leaves the browser. No Cloud, no API keys, no sending limits.

---

## 1. Five email generators

A new `src/lib/email-templates.ts` builds each email from the Zustand store:

| Email | Auto-populated from |
|---|---|
| **Kickoff** | Project Details, Client info, Stakeholder Map, Timeline (start/go-live), Phase 1 task list |
| **Weekly status** (one per week row in the Email Log) | Tasks by status + Gantt schedule + Queries Register (see §2) |
| **Workshop email** (one per W-session) | Session Register row + CONTENT_TOPICS agenda + facilitator + location |
| **Training email** (one per T-session / module) | Session row + Training Module state + Quick-Start Guide link from Intranet Pack |
| **Implementation complete** | Definition of Done (signed items), Champion Register, Intranet Pack (recordings + guides) |

Each generator returns `{ subject, html, plainText, recipients }`.

## 2. Weekly email — auto-populated sections

For Week N (anchored to the row's date), the generator computes:

```text
✅ Completed this week     → tasks where status=COMPLETE AND completedAt within last 7d
🚧 In progress now         → tasks where status=IN PROGRESS (grouped by phase, with owner + latest note)
📅 Coming next week        → tasks whose scheduled start (from computeSchedule) falls in next 7d
⚠️  Blockers & open queries → tasks status=BLOCKED  +  Queries Register where status≠Closed
```

To know *when* a task was completed I'll add a tiny field to the store:

- `task.completedAt?: string` (ISO) — stamped automatically inside `updateTaskStatus` when status moves to COMPLETE, cleared when moved off. Non-breaking, persists with existing `plexa-playbook-v2`.

"Coming next week" uses the existing `computeSchedule()` so it respects your Timeline mode and any manual overrides on the Gantt.

## 3. New "Automation" tab in the Email Log section

Adds a tabbed header to `EmailLogSection`:

- **Weekly Log** (existing 6-week table, unchanged)
- **Auto-Drafts** (new)

The Auto-Drafts tab shows four cards:

```text
┌─ Kickoff Email ──────────────────┐  ┌─ Implementation Complete ────────┐
│ Recipients: HODs, Site Leads     │  │ Triggers on go-live date         │
│ [Generate] [Preview] [Copy] [✉]  │  │ [Generate] [Preview] [Copy] [✉]  │
└──────────────────────────────────┘  └──────────────────────────────────┘

Workshop Emails (one row per W1–W6)
  W1 HOD Workshop — Site, Safety & Quality   [Generate] [Copy] [Open ✉]
  W2 HOD Workshop — Document Control          [Generate] [Copy] [Open ✉]
  …

Training Emails (one row per T1–T7)
  T1 Training — 4A Site, Safety & Quality     [Generate] [Copy] [Open ✉]
  …
```

For each weekly-log row I also add an **"Auto-fill from this week"** button that pours the generated summary/highlights/blockers straight into the existing fields, so the table you already have stays the source of truth — you just stop typing it by hand.

## 4. Preview + handoff

Clicking **Preview** opens a dialog with:
- Subject line (editable)
- Recipient chips pulled from Stakeholder Map / User Accounts (toggle to add/remove)
- Rendered HTML preview (right pane) and plain-text fallback (left pane)
- Buttons: **Copy HTML**, **Copy as Plain Text**, **Open in Email Client** (uses `mailto:` with subject + plain body + recipients pre-filled — works with Outlook, Gmail, Apple Mail, whatever's default)

## Files touched

- New: `src/lib/email-templates.ts` (5 generators + shared HTML shell matching Plexa brand)
- New: `src/components/workbench/sections/EmailAutomation.tsx` (Auto-Drafts tab + preview dialog)
- Edit: `src/lib/playbook-store.ts` — add `completedAt` stamping inside `updateTaskStatus`
- Edit: `src/components/workbench/sections/Registers.tsx` — tab switch in `EmailLogSection`, "Auto-fill from this week" button on weekly rows

## When you share the screenshot

Once you drop the email design screenshot in chat, I'll match the HTML shell (header, brand colors, section dividers, signature block) to it exactly — so the generated drafts look identical to your current Plexa email style.

---

**Out of scope for this plan** (say the word and I'll add it):
- Actually sending emails on a schedule (needs Lovable Cloud + verified domain)
- Tracking opens/clicks
- Per-recipient personalization (e.g. "Hi {firstName}")
