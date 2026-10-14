---
name: hubspot-card-design
description: Design and build HubSpot UI extension app cards that look and feel native to HubSpot, using @hubspot/ui-extensions and the hs-uix component library. Use when designing, mocking up, building, or reviewing a CRM card (.jsx in src/app/cards/), choosing a card layout, picking components (tables, forms, tags, stats, kanban, feeds, calendars), or handling loading/empty/error states. Also use when someone says a card "doesn't look like HubSpot".
---

# HubSpot Card Design

A rule book for building app cards that look like they shipped with HubSpot. The knowledge comes from [hs-uix Studio](https://github.com/05bmckay/hs-uix-studio) and uses the [`hs-uix`](https://github.com/05bmckay/hs-uix) package (tables, forms, boards, feeds, calendars and formatters for UI extensions).

## How to use the knowledge base

Do **not** read every file. The knowledge base is large on purpose so you can pull only what the task needs.

1. Read `knowledge/standards/RULES.md` once. It's every hard rule in one table, with IDs like `BTN-01` and `TBL-00`.
2. Open `knowledge/standards/INDEX.md` and use **By Task** or **Symptom Routing** to pick **1–2** standards files.
3. When building a new card, read `knowledge/standards/card-building-process.md` and pick a **card archetype** before writing code.
4. For layout ideas, `grep` `knowledge/examples/*.json` (full cards, e.g. `fleet-maintenance.json`) and `knowledge/blocks/*.json` (reusable groups, e.g. `stats-row.json`, `empty-state.json`). Each has a `description` to grep on. Use them as references, not copy-paste targets.
5. Cite rule IDs when you explain a design choice or review a card ("moved the second primary button to secondary per BTN-01").

## Translate Studio's JSON spec to JSX

The knowledge base was written for Studio, which outputs a JSON spec instead of React. Most examples are already JSX. When a rule or example uses spec notation, translate it:

| Spec form | In a real card (.jsx) |
| --- | --- |
| `{"type":"Button","variant":"primary","children":["Save"]}` | `<Button variant="primary">Save</Button>` |
| `"$state.viewMode"`, `setState` actions | `useState` / React state |
| `$bindState`, `"value": "$value"` | Controlled props: `value={x}` + `onChange={setX}` |
| `$forEach` | `array.map(...)` with a stable `key` |
| `visible` + `$if` | Conditional rendering (`cond && <X/>`) |
| Precompute into `data` (DSM-05, DSM-06, PLT-04) | Still applies: format values and pick variants in plain JS **before** the JSX, and use `"--"` for empty values |
| `renderCell` + `$render` | `renderCell={(value, row) => <Tag>…</Tag>}` |
| `viewModes` state toggle (loaded/loading/error/empty) | Real loading/error/empty branches driven by your data hooks |
| `"name"` on containers for comment mode | Ignore. That's a Studio-only convention. |

## What Studio left out (use the repo instead)

Studio previews don't run on a real record, so the knowledge base dropped record-context data guidance. For that, use:

- `CRM-CARD-FRONTEND-STANDARDS.md` at the repo root (§13 CRM components, §15 data fetching).
- `useCrmProperties` / `useAssociations` from `@hubspot/ui-extensions/crm` for record data.
- `hubspot.serverless('<function uid>', { parameters })` for app functions. The uid is the one in the function's `*-hsmeta.json`.
- `actions.copyTextToClipboard` only from a click handler (BTN-11).

## Where the knowledge base conflicts (for .jsx cards)

These are known inconsistencies in `knowledge/`. Follow this table instead:

| Conflict | Do this |
| --- | --- |
| BTN-04 says button size `"med"` | Leave `size` off (the default). Valid sizes are `xs`, `sm`, `md`. |
| BTN-07 (max two secondary buttons) vs. TBL-07 (in-row buttons are xs secondary) | In-row table actions use `variant="transparent" size="xs"`, so they don't count against BTN-07. |
| The state toggle bar in the sample card uses `variant="primary"` for the active mode | Use `secondary` for the active mode and `transparent` for the rest, so the card's own primary stays the only one (BTN-01). |
| UTL-01 (use `hs-uix/utils` formatters) vs. DSM-05 (precompute display values) | Mockups: precomputed strings in `mockData.js` are fine. Real data: format with `hs-uix/utils` in JS before the JSX. |
| TYP-02 (Heading for titles) vs. demibold `Text` for section titles in `tables.md` | One `Heading` for the card's main title. Demibold `Text` for section titles under it. |
| `<Link onClick={…}>` with no `href` | `href` is required in `@hubspot/ui-extensions`. Use a transparent `Button` for click-only actions. |
| hs-uix version notes (e.g. "1.6.4+") | They're stale. Use the current `hs-uix` from npm (2.x). |

## Platform facts (2026.09)

- Cards live in `src/app/cards/` with a `*-hsmeta.json` (`type: "card"`, `config.entrypoint: "/app/cards/MyCard.jsx"`, `config.objectTypes`, `config.location` of `crm.record.tab`, `crm.record.sidebar`, `crm.preview` or `helpdesk.sidebar`).
- To use `hs-uix`, add it to `src/app/cards/package.json` (`npm install hs-uix` inside `src/app/cards/`). There's one `package.json` for all cards.
- No CSS, no HTML elements, no `style`/`className`. HubSpot components only.

## Workflow fit

This skill is about *how the card looks and behaves*, not *what it should do*. Before designing, there should be a problem brief (see `week-2/problem-brief.md`). In the mockup stage, build with hardcoded data from a `mockData.js` file and still follow these rules. A mockup that breaks them teaches the user the wrong design.

## Self-review before you finish

Run the **Self-Review Checklist** at the end of `knowledge/standards/card-building-process.md`. At minimum, check:

- [ ] Root is `Flex direction="column" gap="sm"` (LAY-01)
- [ ] One `variant="primary"` button per visible surface (BTN-01)
- [ ] Lists use `DataTable` from `hs-uix/datatable`, not raw `Table` (TBL-00)
- [ ] Loading, empty and error states exist and use the patterns in `states.md`
- [ ] Empty values render `"--"` (PLT-04)
- [ ] Tags/status use `AutoTag` / `AutoStatusTag` or the variants in `status-and-tags.md`

## Updating the knowledge

`knowledge/` is a copy of `apps/worker/knowledge/` from hs-uix-studio. To refresh it, run `scripts/sync-knowledge.sh` from the repo root. Don't edit the files here by hand; change them upstream so Studio and this skill stay in sync.
