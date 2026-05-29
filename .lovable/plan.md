# API Integration Plan — 11 Modules

I'll follow the existing pattern already used in **Training Sign-Off** and **Issues Register** (sync from table → in-memory state → per-row save that POSTs new vs PATCHes existing using `_id`, plus single-row delete that hits the API).

## Scope by module

### 1. Templates Library — file upload + records
- Upload via `POST {apiBase}/attachments` (multipart `file`) with `Authorization: Bearer ${authToken}`.
- On success, persist a row in `playbook_templates` with: `uuid, filename, mimetype, size_bytes, path, url, path_thumbnail, url_thumbnail, extension, name` (name = the template title, e.g. "Folder Structure Template").
- Add `templates` to store + sync/save/delete actions; rewrite `TemplatesLibrarySection` to use them.

### 2. Attendance — fix Add Row + save/update/delete
- Fix Add Row button so a new editable row appears immediately.
- Wire `saveAttendee` (POST new / PATCH existing by `_id`) and `deleteAttendee` per row.

### 3. Content Topics — remove hardcoded `CONTENT_TOPICS`
- Fetch from `playbook_session_topics` on hydrate; expose via store; refactor consumers (Phase 3 workshops + Content Log) to read from store instead of the constant.
- Keep the constant only as a fallback if fetch fails.

### 4. Weekly Email Log — fix save + delete
- Split save into POST (no `_id`) vs PATCH (has `_id`) using existing `saveEmail`.
- Fix delete so it only removes the targeted row from state and calls the API DELETE for that row only.

### 5. Issues Register — Archive button hits API
- Toggle `archived` field via PATCH on the row's `_id` (reuse `saveIssue` with `{archived: true}`).

### 6. Stakeholder Map — save/delete per row
- Add `_id` to `Stakeholder`, add `syncStakeholdersFromTable`, `saveStakeholder` (POST/PATCH), update `deleteStakeholder` to call API.
- Add Save + Delete action column in the UI.

### 7. Champion Register — fetch + save/delete
- Champions ← `playbook_champions`, Resistant Users ← `playbook_resistant_users`.
- Add `_id`, sync, save (POST/PATCH), delete actions for both. Add action columns in UI.

### 8. Definition of Done — PATCH on check/uncheck
- On `toggleDod`, PATCH the row in `playbook_dod` with the new `confirmed`, `by`, `date` values.

### 9. Client Intranet Pack — API-backed
- Use one table (already named via `PLAYBOOK_TABLES`) and distinguish rows by `kind`/`type` field (Recording / Quick-Start Guide / Resource).
- Add sync/save/delete following the standard pattern.

### 10. Post-Implementation Email — API-backed
- Persist the editable content to API (single record or per-field via the same custom-data pattern depending on what fits the existing module shape).

### 11. Gantt — PATCH start/deadline on date click
- On date click in `GanttSection`, call existing `setTaskSchedule` then PATCH the task row (`playbook_tasks`) with new `startDate` / `deadline` (or override fields if that's how the table stores them).

## Cross-cutting fixes
- **Delete bug** in Project Details, User Accounts, Contractors, Cost Codes: ensure each `delete*` action calls the API DELETE and only removes that one row from local state (not all rows).
- **Save POST vs PATCH**: standardise all `save*` actions to branch on presence of `_id`.

## Technical details
- All API calls use `window.apiBase` + `window.authToken` (already used elsewhere in the store).
- Records endpoint pattern (from existing code): `${apiBase}/workbench/organization/${org}/tables/${tableId}/records[/<recordId>]`.
- Table IDs resolved via existing `tableMap` populated by `fetchTables()`.
- New tables referenced: `playbook_templates`, `playbook_champions`, `playbook_resistant_users` — I'll add them to `PLAYBOOK_TABLES`.

## Out of scope (confirm if you want included)
- Schema/migrations on the backend side (assumes those tables already exist server-side).
- Changing the global "Save Changes" header button behaviour.
- Tests.

## Estimated edits
- `src/lib/playbook-store.ts` — large additions (~400–600 lines of new actions & syncs).
- `src/lib/playbook-data.ts` — add new table names.
- `src/components/workbench/sections/Registers.tsx` — most sections updated.
- `src/components/workbench/sections/Phases.tsx` — Content Topics + Attendance fix.
- `src/components/workbench/sections/Gantt.tsx` — PATCH on date change.

## Questions before I start
1. For **Post-Impl Email**, is the content stored as one record in a dedicated table, or as a field on `playbook_client`? I don't see an obvious table — please confirm the table name.
2. For **Intranet**, confirm the table name to use (I'll default to `playbook_intranet` and a `kind` discriminator unless you tell me otherwise).
3. For **Templates**, confirm `playbook_templates` is the correct table name.
4. Should I keep optimistic UI updates (update local state immediately, then API), or wait for API response before updating UI? Existing pattern looks optimistic — I'll match it unless you say otherwise.

Approve and I'll implement end-to-end in this turn.
