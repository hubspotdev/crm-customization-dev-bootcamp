---
id: card-building-process
scope: [workflow, archetypes, self-review-checklist, state-toggle-bar]
depends-on: []
critical-rules: 40
archetypes: [all]
---

# Card Building Process

> The mandatory workflow for building any new CRM card. Do NOT skip steps.

---

## Step 1: Understand the Requirements

Read the card description. Identify:
- What **object type** does it live on? (Contact, Company, Deal, Custom Object)
- What **data** does it need? (CRM properties, associations, serverless API calls)
- What **actions** can users take? (Edit, create, delete, filter, sort)
- What **states** must it handle? (Loading, empty, error, success)

---

## Step 2: Choose a Card Archetype

Don't default to "Stats → Table → Panel" for every card. Start by identifying which archetype fits the user's workflow, then adapt it.

### Card Archetypes

**1. List Manager** — Browse, search, filter, and act on records.
```
Statistics → hs-uix DataTable (search + filters + sort + pagination built in) → Panel for detail/edit
```
Best for: contacts, enrollments, service menus, maintenance logs.
Key components: `Statistics`, `DataTable` (from `hs-uix/datatable`), `Panel`. Raw `Table` is an escape hatch — don't reach for it unless DataTable can't express the layout.

**1b. Pipeline Board** — Browse and progress records through stages.
```
Statistics (or Kanban metrics panel) → hs-uix Kanban (stages + cardFields + per-card stage control)
```
Best for: deals, tickets, leads, support escalations, anything with a workflow state. Share the DataTable `columns` config via `deriveCardFieldsFromColumns` so users can toggle between list and board views.
Key components: `Kanban`, `KanbanCardActions` (from `hs-uix/kanban`), `Statistics`.

**2. Triage Dashboard** — Surface what needs attention NOW, then show everything else.
```
ProgressBar hero → Tile + AutoGrid (urgent items as cards) → Accordion groups (full inventory)
```
Best for: inventory, compliance, expiring contracts, overdue tasks, feature adoption gaps.
Key components: `ProgressBar`, `Tile`, `AutoGrid`, `Accordion`, `StatusTag`

This archetype often becomes a **hybrid with Grouped Detail**: triage tiles for the "act now" subset above, accordion groups for the "full picture" below. When you have this hybrid:
- Gap/urgent items are pulled out into `AutoGrid` of `Tile compact={true}` — immediately visible, sorted by priority.
- The accordion tables below serve context only — remove Action columns (the triage section handles actions).
- `Alert` becomes redundant if triage tiles make problems obvious — move coaching text into the detail overlay.
- Section header uses `Tag variant="warning"` with the count to draw attention.

**3. KPI Snapshot** — At-a-glance metrics with minimal interaction.
```
Statistics (3-4 items) → DescriptionList (context) → optional chart in Tile
```
Best for: revenue dashboards, performance summaries, account health. No table needed — the numbers ARE the card.
Key components: `Statistics`, `DescriptionList`, `LineChart`/`BarChart`, `Tile`

**4. Chart-Forward** — A trend or comparison IS the primary content.
```
Tile (chart with title/subtitle/legend) → Statistics (supporting KPIs) → DescriptionList (context)
```
Best for: revenue trends, occupancy over time, conversion rates. The chart leads.
Key components: `LineChart`/`BarChart`, `Tile`, `Statistics`

**5. Checklist / Step Tracker** — Track progress through a sequence.
```
StepIndicator or ProgressBar → Active phase checklist (Icon + Link + microcopy rows) → Accordion groups (completed/upcoming)
```
Best for: onboarding, move-in processes, setup wizards, compliance checklists, event production timelines.
Key components: `StepIndicator`, `ProgressBar`, `Icon`, `Link`, `Modal`, `Accordion`, `Alert`, `Button`

This archetype uses a fundamentally different layout than table-based cards. Data is hierarchical (phases → subtasks), sequential (phases have order), and state-driven (complete → in progress → pending). Tables flatten this into rows and lose sequential context. Instead, decompose into:
- **Phase-level navigation:** `StepIndicator` for "where am I?" — shows all phases with the current one highlighted.
- **Active phase detail:** Checklist of subtasks using `Icon` (`checkCircle`/`circleHollow`) + `Link` (opens Modal for quick update) + `Text variant="microcopy"` (due date).
- **Non-active phases:** `Accordion` groups for "Completed" and "Upcoming" — collapsed summaries with phase name + inline count.

The visual hierarchy follows the user's workflow: where am I → what's next → what's done/coming.

**6. Multi-View Card** — Fundamentally different modes in one card.
```
Tabs (each tab is a different archetype — e.g., Tab 1 = List Manager, Tab 2 = Chart-Forward)
```
Best for: cards that serve multiple roles (manage + analyze), or cards with distinct data views.
Key components: `Tabs`, then whatever each tab needs.

**7. Grouped Detail** — Data organized by a natural grouping dimension.
```
Section header → Accordion per group (each contains a compact Table or DescriptionList)
```
Best for: supplier breakdown, department views, category groupings. Group by the action dimension (who do I call?) not the data dimension (what category?).
Key components: `Accordion`, `Table`, `Tag`, `Flex`

**8. Onboarding / Setup** — Guide users through first-time configuration.
```
Illustration + EmptyState → ActionCard grid (AutoGrid of Tiles with CTAs)
```
Best for: empty cards, feature discovery, first-run experiences. Heavy on illustrations and CTAs, light on data.
Key components: `EmptyState`, `Illustration`, `Tile`, `AutoGrid`, `Button`

### Choosing the Right Archetype

| Ask yourself... | Then use... |
|-----------------|-------------|
| Is the user browsing a list? | **List Manager** |
| Is the user triaging — "what needs attention?" | **Triage Dashboard** |
| Is the user checking numbers at a glance? | **KPI Snapshot** |
| Is the user looking for trends over time? | **Chart-Forward** |
| Is the user tracking steps to completion? | **Checklist / Step Tracker** |
| Does the card serve multiple distinct purposes? | **Multi-View Card** |
| Is the data naturally grouped by who/what/where? | **Grouped Detail** |
| Is this the user's first time seeing this card? | **Onboarding / Setup** |

**You can combine archetypes.** A card might be a List Manager with a KPI Snapshot at the top. A Triage Dashboard might have a Grouped Detail section below the urgent items. The archetypes are building blocks, not rigid templates.

---

## Step 3: Plan Components

Now that you have an archetype, make the component plan:

1. **List every UI element** the card needs (tables, forms, charts, status indicators, etc.)
2. **Map each element to a HubSpot component** — check if a native component exists before building custom patterns
3. **Decide the layout structure** — which elements are primary (visible immediately) vs supplemental (in Accordions or Tabs)
4. **Identify overlay needs** — what opens in Panels? What needs confirmation Modals?

---

## Step 4: Research the Standards

**This is the critical step that cannot be skipped.**

Read the relevant standards files front-to-back for every component and pattern you plan to use. The sub-files contain rules, gotchas, and prop details that are NOT in STANDARDS.md.

| If your card uses... | Read these files completely |
|----------------------|---------------------------|
| Any table | `tables.md` |
| Any form or editing | `forms.md` + `overlays.md` |
| Charts or metrics | `data-display.md` |
| Status indicators, tags | `status-and-tags.md` |
| Tabs or step flows | `navigation.md` |
| Filter/search bars | `tables.md` (built into `hs-uix` DataTable) |
| User avatars | `media.md` (use `AvatarStack` from `hs-uix/common-components`) |
| Board / pipeline views | `kanban.md` |
| Currency/date formatting, option shaping | `utils.md` |
| Images or icons | `media.md` |
| Alerts, empty states | `states.md` |
| CRM record links | `crm-components.md` |
| Any layout decisions | `layout.md` |
| Data fetching | `data-and-state.md` |
| Buttons, dropdowns | `buttons-and-actions.md` |
| Spacing, dividers | `gotchas.md` |
| Panel footer layout | `overlays.md` (PanelFooter 7-rule section) |

**Always read `STANDARDS.md` first** — it has the golden rules, platform constraints, and conventions that apply to every card.

---

## Step 5: Write the Code

Now — and only now — write the card. Follow this structure:

```
1. Imports (standard + CRM)
2. Module-level constants (property arrays, color maps, config)
3. hubspot.extend() entry point
4. Main Extension component
   - Hooks (useCrmProperties, useState, useMemo)
   - Loading state check
   - Error state check
   - Main render
5. Sub-components (panels, modals, table rows)
6. Utility functions (formatting, filtering, sorting)
```

---

## Step 6: Self-Review Checklist

Before considering the card done, verify:

- [ ] Empty values show `"--"` (double dash), not blank or null
- [ ] Loading state renders `LoadingSpinner` centered in a `Flex`
- [ ] Error state renders an `Alert variant="error"`
- [ ] Empty state uses `EmptyState` component with guidance text
- [ ] Only ONE `variant="primary"` button per surface
- [ ] Panels use `flush={true} variant="modal"` and have unique `id`s
- [ ] PanelFooter uses the column→row Flex hack (see overlays.md)
- [ ] Table columns all have explicit `width` on both `TableHeader` and `TableCell`
- [ ] Non-sortable columns use `sortDirection="never"`
- [ ] Property arrays are module-level constants, not inline
- [ ] No arbitrary CSS (`style` props, `className`, `border-radius`)
- [ ] No HTML elements (`div`, `span`, `img`)
- [ ] Forms close overlay on successful save
- [ ] Buttons use default size (not `"small"`) except in-table actions (`"xs"`)
- [ ] Tables with 5+ rows have a `SearchInput`
- [ ] Filter chips use neutral `Tag` (grey), not colored `StatusTag`
- [ ] Same metric isn't shown in both `StatisticsItem` and `ProgressBar`
- [ ] Empty state still shows CRM record identity (DescriptionList) above the EmptyState
- [ ] `ProgressBar` not used inside table cells (use plain text instead)
- [ ] Every Cancel button calls `actions.closeOverlay(panelId)` — not a no-op
- [ ] Red (`"error"` / `"danger"`) only used for problems/urgency, never neutral categories
- [ ] Accordion content uses `gap="flush"` — accordion provides its own padding
- [ ] Max one `ProgressBar` per card — subsections use text counts instead
- [ ] Card layout matches user workflow (not just Stats → Table by default)
- [ ] Icons not nested inside `<Text>` — use `Flex direction="row" align="center" gap="xs"` for icon + text alignment
- [ ] Checked/unchecked icon pairs use same silhouette (`checkCircle` + `circleHollow`, not `success` + `circleHollow`)
- [ ] All `Icon` `name` values verified against the valid icon list (invalid names silently render nothing)
- [ ] `Tag inline={true}` not used inside Flex rows (Flex already handles layout)
- [ ] `Link` used instead of `Button variant="transparent"` when clickable text must align with sibling text
- [ ] No `justify="between"` with text on both sides inside Accordion content (use inline counts instead)
- [ ] Alert only shown when something needs action — not in every state (success/warning/error mood ring)
- [ ] `ProgressBar` leads the card when it answers the primary question — not buried below `DescriptionList`
- [ ] Accordion `defaultOpen` driven by data (computed boolean), not static `true`/`false` for all sections
- [ ] Triage tiles follow identifier → status Tag → action pattern (no secondary metadata crowding tiles)
- [ ] When triage section handles actions, accordion tables below have no duplicate Action column
- [ ] Modal used for ≤3 field focused actions, Panel for browsing/multi-step — not Panel for everything

---

## Sample Cards: State Toggle Bar

When building sample/demo cards, add a state toggle bar at the bottom so reviewers can cycle through loading, error, and empty states without redeploying:

```jsx
const VIEW_MODES = [
  { value: "loaded", label: "Loaded" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
];

// At the bottom of the card, separated by a Divider:
<Divider />
<Flex direction="row" gap="xs" justify="center">
  {VIEW_MODES.map((mode) => (
    <Button
      key={mode.value}
      size="extra-small"
      variant={viewMode === mode.value ? "primary" : "secondary"}
      onClick={() => setViewMode(mode.value)}
    >
      {mode.label}
    </Button>
  ))}
</Flex>
```

The toggle bar must persist across ALL states — including loading and error — so reviewers can always navigate.
