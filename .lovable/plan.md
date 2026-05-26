
# Path B — Single-File Rewrite Plan

Goal: produce one hand-written `index.html` that opens by double-click, contains all UI, logic, and sample data inline, with no build step and no network calls.

This is a multi-turn rewrite. Each phase is shippable on its own — the normal app keeps working after every phase, and the final phase emits the single file.

## Constraints I will hold to

- All ~25 workbench sections remain present and navigable.
- All interactions (filters, tabs, dialogs, edits, persistence to `localStorage`, exports) keep working.
- Mock datasets (`playbook-data.ts`, `registers-data.ts`, `email-templates.ts`, `training-schedule.ts`) are **trimmed to 2–4 representative rows per module** for the single-file output — you already approved this. The normal app keeps the full dataset.
- No feature is removed. Where a Radix primitive has subtle a11y behavior (focus trap, typeahead in Select), the hand-rolled replacement will match the *user-visible* behavior, not necessarily every ARIA edge case.

## Phase 1 — De-Tailwind-v4 the codebase

Replace `src/styles.css` (Tailwind v4 `@theme` / `@source` / `tw-animate-css` / `oklch` tokens) with a Tailwind **v3-compatible** stylesheet:
- Convert OKLCH tokens to HSL equivalents (Play CDN config supports HSL via `hsl(var(--token))`).
- Move design tokens into a plain `:root { --... }` block + matching `tailwind.config` shape.
- Keep all utility classes used across components unchanged (`bg-primary`, `text-muted-foreground`, `bg-brand-gradient`, `bg-grid`, etc.).
- Verify the normal dev build still renders identically.

No component code changes in this phase.

## Phase 2 — Replace shadcn/Radix primitives

Rewrite the shadcn components that are actually imported by the workbench (audit shows: `dialog`, `tabs`, `select`, `popover`, `dropdown-menu`, `tooltip`, `accordion`, `button`, `card`, `input`, `textarea`, `label`, `badge`, `checkbox`, `switch`, `separator`, `table`, `sheet`, `scroll-area`, `progress`, `toast/sonner`) as **plain React components with no Radix dependency**.

- Same file paths (`src/components/ui/*.tsx`), same exported names, same props the workbench uses.
- Behavior parity for: open/close, controlled/uncontrolled, click-outside-to-close, escape-to-close, basic focus management.
- Animations done with plain CSS transitions (no `tw-animate-css`).
- Verify every workbench section still renders and interacts correctly in the normal app.

## Phase 3 — De-TanStack the routing

The workbench is effectively a single page with internal tab state, so routing is light:
- Replace `src/router.tsx` + `src/routes/__root.tsx` + `src/routes/index.tsx` with a minimal `App.tsx` that just renders `<Workbench />`.
- Remove `@tanstack/react-query` usage if any (the workbench doesn't fetch — it uses `zustand/persist`).
- Verify the normal app still boots.

## Phase 4 — Emit the single inline `index.html`

This is the only phase that produces the deliverable. I will hand-author one file containing, in order:

1. `<style>` block — all CSS tokens + utility classes the app uses, plus a small reset. No Tailwind CDN runtime (avoids the FOUC and 200 KB JIT compiler); I'll ship the *resolved* CSS for the classes actually used.
2. CDN `<script>` tags (UMD, pinned versions) for: React 18, ReactDOM 18, Recharts, Lucide (UMD), Zustand (UMD), Babel Standalone (for JSX only — TS already stripped).
3. `<script type="text/babel">` containing, in order:
   - Inlined sample datasets (`PLAYBOOK_DATA`, `REGISTERS_DATA`, `EMAIL_TEMPLATES`, `TRAINING_SCHEDULE`) — 2–4 rows each, as plain `const` JS objects.
   - The zustand store (plain JS, no TS).
   - The hand-rolled UI primitives from Phase 2 (plain JS).
   - Every workbench section component (plain JS, JSX).
   - `<Workbench />` root component and `ReactDOM.createRoot(...).render(...)`.

Expected size: ~1.5–2.5 MB of readable JSX + CSS.

Deliverable: `/mnt/documents/plexa-workbench-standalone.html`. After the file is written I'll QA it by opening it in a headless browser and checking that the main sections render without console errors. I'll then post a `<presentation-artifact>` so you can download it.

## Things to know up front

- **xlsx export**: if the workbench has Excel export, the inline file will use the `xlsx` UMD build (~900 KB on its own). If you'd rather drop Excel export from the standalone, the file shrinks to ~1 MB. I'll ask before Phase 4 if I find xlsx usage.
- **Recharts** is heavy (~600 KB UMD). It stays — the Gantt and Mission Control rely on it.
- **Persistence**: `zustand/persist` writes to `localStorage`. That works from `file://` in Chrome and Edge. Safari sometimes blocks `localStorage` on `file://` URLs — I'll note this in the file's header comment.
- Phases 1–3 will visibly touch your normal app (you'll see CSS/components change). If anything looks off after a phase, we fix it before moving on.

## How many turns

Roughly: Phase 1 = 1 turn, Phase 2 = 2–3 turns, Phase 3 = 1 turn, Phase 4 = 1–2 turns. So ~5–7 build turns total before you get the downloadable file.

If you approve, I'll start with Phase 1 (de-Tailwind-v4) and ship the final file at the end of Phase 4.
