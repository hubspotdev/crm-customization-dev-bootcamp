---
id: kanban
scope: [kanban, board-view, stages, card-fields, stage-transitions, metrics, hs-uix]
depends-on: [tables, utils, status-and-tags]
archetypes: [pipeline-board]
---

# Kanban — Stage-Based Board View

> **Always use `hs-uix/kanban`.** Don't hand-roll a board out of `Flex` columns and per-card `Select` components.

```bash
npm install hs-uix
```

```jsx
import { Kanban, KanbanCardActions } from "hs-uix/kanban";
```

Kanban shares DataTable's config vocabulary — `cardFields` ≈ `columns`, same filter/sort shapes, same selection + action bar — so a table-and-board toggle is a single `deriveCardFieldsFromColumns` call (from `hs-uix/utils`).

Drag-and-drop isn't available inside HubSpot UI Extensions. Stage changes happen through an inline `Select` or action menu on each card.

---

## Quick Start

```jsx
import { Kanban } from "hs-uix/kanban";
import { AutoTag } from "hs-uix/common-components";
import { formatCurrencyCompact, formatDate } from "hs-uix/utils";

const STAGES = [
  { value: "qualified",   label: "Qualified",   variant: "info" },
  { value: "proposal",    label: "Proposal",    variant: "info" },
  { value: "negotiation", label: "Negotiation", variant: "warning" },
  { value: "closed_won",  label: "Closed Won",  variant: "success", terminal: true },
  { value: "closed_lost", label: "Closed Lost", variant: "default", terminal: true },
];

const CARD_FIELDS = [
  { field: "name",      placement: "title" },
  { field: "company",   placement: "subtitle" },
  { field: "amount",    placement: "meta",   render: (val) => formatCurrencyCompact(val) },
  { field: "segment",   placement: "body",   render: (val) => <AutoTag value={val} /> },
  { field: "closeDate", placement: "footer", render: (val) => formatDate(val) },
];

<Kanban
  data={deals}
  stages={STAGES}
  groupBy="stage"
  rowIdField="id"
  cardFields={CARD_FIELDS}
  onStageChange={(row, newStage) => updateDealStage(row.id, newStage)}
/>
```

---

## Stages

| Field | Type | Description |
|---|---|---|
| `value` | `string` | The raw value in `row[groupBy]` |
| `label` | `string` | Column header text |
| `variant` | `"success"` \| `"warning"` \| `"info"` \| `"default"` | Color of the stage header; use `success` for won/complete, `warning` for active decision points, `info` for progress stages, `default` for lost/dropped |
| `terminal` | `boolean` | Marks a stage as end-of-workflow (won/lost). Terminal stages can still receive cards but signal "no further transition expected." |
| `onEnterRequired` | `{ render }` | Async confirmation or extra-property capture before a card is committed to this stage (see below). |

## `cardFields` (same shape as DataTable `columns`)

| Placement | Renders as |
|---|---|
| `title` | Primary headline on the card |
| `subtitle` | Secondary headline (hidden in `compact` density by default) |
| `meta` | Small right-side chip / number next to the title (amount, date, etc.) |
| `body` | Main middle section — usually one or two `AutoTag` / `Text` rows |
| `footer` | Bottom row — typically date + `KanbanCardActions` |

Every `cardField` accepts the same `render`, `visible`, `truncate`, `label` hooks as a DataTable column. Project a table into a board with `deriveCardFieldsFromColumns(columns)` from `hs-uix/utils`.

## Filters, sort, search

Same config shape as DataTable:

```jsx
<Kanban
  data={deals}
  stages={STAGES}
  groupBy="stage"
  cardFields={CARD_FIELDS}
  searchFields={["name", "company"]}
  filters={[
    { name: "segment", type: "multiselect", options: SEGMENT_OPTIONS },
    { name: "closeDate", type: "dateRange" },
  ]}
  defaultSort={{ amount: "descending" }}
/>
```

## Headline metrics

```jsx
import { formatCurrencyCompact, sumBy } from "hs-uix/utils";

const metrics = useMemo(() => [
  { label: "Total pipeline", number: formatCurrencyCompact(sumBy(deals, "amount")) },
  { label: "Weighted",       number: formatCurrencyCompact(weightedAmount(deals)) },
  { label: "Win rate",       number: formatPercentage(winRate(deals)) },
], [deals]);

<Kanban {...rest} metrics={metrics} />
```

The metrics panel toggles via a **Metrics** button in the toolbar. Pass an array for shorthand `<StatisticsItem>` rendering, or a raw `ReactNode` when you need a chart or multi-row layout. Cap at 4–6 items — reach for the `ReactNode` escape hatch beyond that.

Per-column aggregates go in `columnFooter`:

```jsx
<Kanban
  {...rest}
  columnFooter={(rows) => `Total: ${formatCurrencyCompact(sumBy(rows, "amount"))}`}
/>
```

## Stage transition prompts

When moving a card into a stage needs confirmation or extra data capture, declare the prompt on the stage itself:

```jsx
{
  value: "closed_won",
  label: "Closed Won",
  variant: "success",
  terminal: true,
  onEnterRequired: {
    render: ({ row, newStage, commit, cancel }) => (
      <FormBuilder
        fields={[
          { name: "actualAmount", type: "currency", label: "Actual amount", required: true },
          { name: "closedDate",   type: "date",     label: "Closed on",      required: true },
        ]}
        onSubmit={(values) => commit(values)}
        onCancel={cancel}
      />
    ),
  },
}
```

`commit(extraValues)` fires `onStageChange(row, newStage, extraValues)`; `cancel()` aborts the transition with no callback.

## Stage control modes

| `stageControl` | When to use |
|---|---|
| `"menu"` (**preferred default**) | Transparent-variant `Dropdown` inside the footer cluster, labeled "Move to" by default. Stays out of the visual hierarchy until reached for, saves vertical space, and reads as an action rather than a form field. Override the label via `labels: { moveTo: "Move" }` when you want a tighter verb. |
| `"select"` | Full-width bordered `Select` below the card footer. Reserve for boards where the stage picker is the *primary* card affordance and reps will use it on every card. |
| `"none"` | Read-only boards — no stage change affordance. |

**Default to `"menu"`** unless you have a reason not to: the bordered Select reads as a form field on every card, which competes with the actual content. The menu variant is also what looks right next to `KanbanCardActions` in the same footer cluster.

## Per-card actions

```jsx
import { KanbanCardActions } from "hs-uix/kanban";

{
  placement: "footer",
  render: (_, row) => (
    <KanbanCardActions
      display="icon"
      actions={[
        { label: "Email", icon: "email",   onClick: () => openEmail(row) },
        { label: "Note",  icon: "comment", onClick: () => openNote(row) },
        { label: "Task",  icon: "tasks",   onClick: () => openTask(row) },
      ]}
    />
  ),
}
```

`display="icon"` (compact default) renders icon-only buttons. `display="label"` uses text labels with pipe separators (comfortable default).

## Density

| Knob | `compact` | `comfortable` |
|---|---|---|
| Subtitle visible | no | yes |
| `cardDividers` default | after-body only | every seam |
| Body line cap | 3 | 5 |
| `stageControl` default | `menu` | `select` |
| `KanbanCardActions` default | icon-only | labels |

Every knob stays overridable per board — density only shifts the defaults.

## Per-stage pagination

```jsx
const [stageMeta, setStageMeta] = useState({
  qualified: { hasMore: true, totalCount: 142, loading: false },
  proposal:  { hasMore: true, totalCount: 37,  loading: false },
});

<Kanban
  {...rest}
  stageMeta={stageMeta}
  onLoadMore={async (stage) => {
    setStageMeta((m) => ({ ...m, [stage]: { ...m[stage], loading: true } }));
    const { rows, hasMore } = await fetchMoreForStage(stage, { offset: currentCount(stage) });
    setData((prev) => [...prev, ...rows]);
    setStageMeta((m) => ({ ...m, [stage]: { ...m[stage], loading: false, hasMore } }));
  }}
/>
```

Mix client-side, server-load-more, and pre-bucketed server data column-by-column — `stageMeta` is per-stage.

## Paired table-and-board views

```jsx
import { deriveCardFieldsFromColumns } from "hs-uix/utils";

const COLUMNS = [ /* DataTable column config */ ];
const CARD_FIELDS = deriveCardFieldsFromColumns(COLUMNS);

// Same data, same filters, same renderers — user toggles view mode.
view === "table"
  ? <DataTable data={deals} columns={COLUMNS} filters={FILTERS} />
  : <Kanban data={deals} stages={STAGES} groupBy="stage" cardFields={CARD_FIELDS} filters={FILTERS} />
```

## Rules

1. **Stage variants follow semantics**, not brand color: `success` = won/complete, `warning` = needs decision, `info` = in progress, `default` = lost/dropped. Don't paint every stage `info`.
2. **Mark terminal stages** (`terminal: true`) for won/lost/archived — drives summary metrics and future UI affordances.
3. **`groupBy` must match a `stage.value`** — unmatched rows land in an "Uncategorized" column.
4. **Use `rowIdField`** (or stable row keys) — Kanban relies on identity for selection and optimistic stage updates.
5. **One stage transition prompt per stage** (`onEnterRequired.render`) — don't chain prompts.
6. **Cap metrics at 4–6 items**; use a `ReactNode` for anything richer.
7. **Share config with DataTable** via `deriveCardFieldsFromColumns` — don't duplicate column / card logic across the two views.
8. **Compact density for high-volume boards** (leads, tickets, tasks); comfortable for deals / accounts.
9. **`stageControl="none"` for read-only boards** — don't rely on UI discipline to prevent changes; remove the affordance.
