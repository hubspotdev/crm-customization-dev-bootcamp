---
id: tables
scope: [table, table-head, table-header, table-body, table-row, table-cell, table-footer, sorting, pagination, search-input, filter-bar, data-table-reference]
depends-on: [forms, status-and-tags, buttons-and-actions]
critical-rules: 12
archetypes: [list-manager, grouped-detail]
---

# Tables

> **Default: `hs-uix` DataTable.** The raw `Table` primitives documented later in this file are an **escape hatch** for layouts DataTable can't express (custom non-list layouts, tables embedded inside Panels/Accordions where you need full markup control). If you're building a normal list card, stop here — use DataTable.
>
> Related: [`kanban.md`](./kanban.md) shares DataTable's config shape. [`utils.md`](./utils.md) has the formatters, `sumBy`, and `deriveCardFieldsFromColumns` used in examples below.

**Official HubSpot guidance:** Tables are for displaying raw data that is too detailed for text alone, or when users need to compare sets of data. Don't render a blank table when no data exists — use `EmptyState` instead.

---

## DataTable (`hs-uix/datatable`) — the default

```bash
npm install hs-uix
```

```jsx
import { DataTable } from "hs-uix/datatable";
import { AutoStatusTag, AutoTag } from "hs-uix/common-components";
import { formatCurrency, formatDate, sumBy } from "hs-uix/utils";
```

DataTable handles: full-text search (optional fuzzy via Fuse.js), select / multi-select / date-range filters with chips and "Clear all", click-to-sort three-state headers, client- or server-side pagination, row grouping with per-column aggregation, [row selection + bulk action bar](#row-selection--bulk-actions) (`selectable: true` + `selectionActions`), per-row actions, two edit modes (discrete + inline) across 12 input types with validation, auto-width column sizing, column footer totals, `useAssociations` integration, and built-in loading / empty / error states.

**Full API docs:** https://github.com/05bmckay/hs-uix/blob/main/packages/datatable/README.md

<!-- archetype: list-manager -->
```jsx
import { DataTable } from "hs-uix/datatable";

<DataTable
  data={records}
  columns={[
    { field: "date", label: "Date", sortable: true },
    { field: "type", label: "Type" },
    { field: "name", label: "Name", sortable: true },
    { field: "cost", label: "Cost", sortable: true, align: "right" },
  ]}
  searchFields={["name", "type"]}
  fuzzySearch={true}
  filters={[
    { name: "type", type: "select", placeholder: "All types", options: TYPE_OPTIONS },
    { name: "category", type: "multiselect", placeholder: "All categories", options: CAT_OPTIONS },
    { name: "date", type: "dateRange", placeholder: "Date range" },
  ]}
  pageSize={10}
/>
```

**Studio spec-JSON shape.** In Studio specs, `DataTable` is a first-class node type — translate the JSX above to JSON one-to-one. Prop names match the React component exactly (`data`, `columns`, `searchFields`, `filters`, `pageSize`, `groupBy`, `rowActions`). There is no `rows` prop and no `rowKey` prop — the renderer keys rows by index. Wire `data` and `columns` from `$data.*` so the Tweaks panel can edit them; literal arrays inline are fine for prototypes too.

```json
{
  "type": "DataTable",
  "data": "$data.users",
  "columns": [
    { "field": "name", "label": "Name", "sortable": true },
    { "field": "email", "label": "Email" },
    { "field": "role", "label": "Role", "sortable": true },
    { "field": "status", "label": "Status" }
  ],
  "searchFields": ["name", "email"],
  "fuzzySearch": true,
  "filters": [
    { "name": "role", "type": "multiselect", "placeholder": "All roles", "options": "$data.roleOptions" },
    { "name": "status", "type": "select", "placeholder": "All statuses", "options": "$data.statusOptions" }
  ],
  "pageSize": 10
}
```

**Row count format & visibility.** DataTable shows a built-in row count in its toolbar by default. Customize with `rowCountText: (shownOnPage, totalMatching) => "${totalMatching} records"` (in spec form, use `$render` with both args). Hide the count entirely with `showRowCount: false`. The DataTable also accepts a `title` prop (hs-uix 1.6.4+) that renders an integrated header row, but the **convention across cards is a separate section-header above the table** — `Flex direction="row" justify="between"` containing a demibold `Text` title and any primary action `Button` — so the table sits flush below an existing header instead of introducing a second one. Reach for `title` only when there's nothing else (no action button, no surrounding section structure) and you specifically want the row count integrated.

**Custom cell rendering** uses each column's `renderCell` field. In React it's `(value, row) => element` — `value` is the cell value (the field at `column.field` for that row), `row` is the full row object. In spec JSON, wrap your node in a `$render` marker; pass a single name to bind only the value, or an array to bind both:

```json
{
  "field": "status",
  "label": "Status",
  "renderCell": {
    "$render": "value",
    "node": { "type": "AutoStatusTag", "value": "$value" }
  }
}
```

```json
{
  "field": "id",
  "label": "",
  "renderCell": {
    "$render": ["value", "row"],
    "node": {
      "type": "Button",
      "size": "xs",
      "overlay": {
        "type": "Modal",
        "id": "edit-{{row.id}}",
        "title": "Edit {{row.name}}",
        "width": "medium",
        "children": [ /* FormBuilder bound to row */ ]
      },
      "children": "Edit"
    }
  }
}
```

The `$render` operator is generic — it wraps any callback prop into a function that binds positional args to the names you provide. Use it for `renderCell`, `rowActions[].onClick` (`(row) => void`), `groupBy.label` (`(value, rows) => string`), or any other hs-uix callback prop.

**Common $render binding mistakes — read this before patching.** The renderer does NOT enforce specific alias names; `$render: "x"` and `$render: "item"` and `$render: "row"` all work the same way (each binds the FIRST positional arg to whatever name you wrote). What matters is which positional argument you bind to and how you reference it. For `DataTable.columns[].renderCell`, the React signature is `(value, row) => element`:

| You want to render… | Use this | Reference inside `node` as |
|---|---|---|
| Just the cell value (e.g. AutoStatusTag of the status string) | `"$render": "value"` | `$value` / `{{value}}` |
| The full row (e.g. an Edit Button whose Modal pre-populates from `row.name`, `row.id`) | `"$render": ["value", "row"]` | `$row.name`, `{{row.id}}`, etc. |
| A cell trigger whose overlay body/title/footer also reads row fields | `"$render": ["value", "row"]` | `$row.*` anywhere inside the overlay node |

The most frequent bug is writing `"$render": "row"` and then referencing `$row.email` — that binds the *cell value* (a string) to the name `row`, so `row.email` is `undefined`. If you need the row, name the **second** positional slot, which means the array form `["value", "row"]`. The single-string form always binds the first arg.

Renaming aliases (e.g. switching `row` → `item` everywhere) doesn't fix this — it just changes the name of the same wrong binding. The fix is the array form.

If the trigger label only needs `$value` but the overlay body reads `$row.*`, you still need the array form. The overlay is rendered from the same `$render` scope as the trigger node, so a string form like `"$render": "value"` will make every `$row.*` inside the overlay resolve to `undefined` and the Panel/Modal can appear empty.

**Per-row Edit / row-level overlays** — the cleanest pattern is a column whose `renderCell` returns a `Button` (or `Link`) with the standard `overlay` prop pointing at the Modal. Because the cell is rendered with `row` in scope, the Modal's title and form values can use `$row.x` / `{{row.x}}` to pre-populate from the clicked row:

```json
{
  "field": "id",
  "label": "",
  "renderCell": {
    "$render": ["value", "row"],
    "node": {
      "type": "Button",
      "size": "xs",
      "variant": "secondary",
      "overlay": {
        "type": "Modal",
        "id": "edit-user-modal-{{row.id}}",
        "title": "Edit {{row.name}}",
        "width": "medium",
        "children": [ /* Form with row-bound values */ ]
      },
      "children": "Edit"
    }
  }
}
```

Canonical examples in this repo: `users-table.json` uses `renderCell` + overlay for row editing, and `course-enrollment.json` uses `renderCell` + `Link overlay={Panel}` where the Panel body iterates over `$row.modules`. Follow those patterns exactly when porting sample cards.

DataTable also exposes a `rowActions: [{ label, icon?, variant?, onClick }]` API. `onClick` is a function `(row) => void` in React; in spec form, wrap it in `$render` and let the inner `node` be an `$action` descriptor — those fire with `row` in scope. Today only the `setState` and `copyToClipboard` actions are wired in the renderer, so until additional action kinds (e.g. `openOverlay`) land, prefer the Button-with-overlay-in-renderCell pattern above for any row-level overlay use case.

### Row selection & bulk actions

> **Symptoms this section addresses:** "add a checkbox column", "bulk select", "bulk actions", "select rows", "select all", "act on multiple records at once".

DataTable has built-in row selection. **Don't hand-roll a Checkbox column** (that pattern is documented further down for the raw `Table` escape hatch only) — set `selectable: true` and DataTable renders the leading checkbox column, the select-all header, the selection action bar, and the bulk-action buttons for you. `selectable` requires `renderCell` (not `renderRow`) for any custom cells.

**Every selectable DataTable row must have a stable unique `id` field.** DataTable selection tracks rows by ID. If rows omit `id` or share the same `id`, row checkboxes can behave like select-all — e.g. selecting the first visible row toggles multiple/all rows, while the header checkbox may appear inert or inconsistent. Always add a unique string `id` to each row object in `data` (CRM object ID, email, slug, or generated stable key) before enabling `selectable`, `selectedIds`, `onSelectionChange`, or `selectionActions`.

| Prop | Type | Description |
|------|------|-------------|
| `selectable` | boolean | Turn on row selection. Renders a leading checkbox column + select-all header + selection action bar above the table. |
| `recordLabel` | `{ singular, plural }` | Entity name used in row count, selection bar, loading, and empty states. Defaults to `{ singular: "record", plural: "records" }`. **Object only — a bare string is silently ignored**, not a shorthand. |
| `selectionActions` | `[{ label, onClick, icon?, variant? }]` | Buttons rendered in the selection action bar when ≥1 row is selected. `onClick` receives **`ids[]`** (the array of selected row IDs, not row objects) in React; in spec form it's an `$action` descriptor — today's renderer fires the action but doesn't bind the ID array into scope. |
| `onSelectionChange` | `(ids[]) => void` | Fires whenever selection changes. In spec form: an `$action` descriptor (e.g. `setState` to mirror selection into `state` for downstream UI). |
| `selectedIds` | `string[]` | Controlled selection. Pair with `onSelectionChange` to persist selection across page fetches; omit for uncontrolled. |
| `selectionResetKey` | string \| number \| object | Forces uncontrolled selection to clear when this value changes — use for tab/scope switches. |
| `resetSelectionOnQueryChange` | boolean | Default `true` — uncontrolled selection clears when search/filter/sort changes. Set `false` to keep selection across query changes. |
| `hideRowActionsWhenSelectionActive` | boolean | When `rowActions` is also set, hide the per-row action column while the selection bar is visible. Set `true` whenever you have both — the two action surfaces compete otherwise. |
| `showSelectionBar` | boolean | Default `true`. Hide the bar entirely (e.g. when an external toolbar handles bulk ops). |

**Spec example.** Copy this shape verbatim when the user asks for bulk actions:

```json
{
  "type": "DataTable",
  "data": "$data.deals",
  "columns": [ /* … */ ],
  "selectable": true,
  "recordLabel": { "singular": "deal", "plural": "deals" },
  "selectionActions": [
    {
      "label": "Reassign owner",
      "icon": "user",
      "onClick": { "$action": "addAlert", "type": "info", "title": "Reassign owner", "message": "Would open the owner picker for the selected deals." }
    },
    {
      "label": "Move stage",
      "icon": "moveTo",
      "onClick": { "$action": "addAlert", "type": "info", "title": "Move stage", "message": "Would open the stage picker for the selected deals." }
    },
    {
      "label": "Archive",
      "icon": "delete",
      "variant": "destructive",
      "onClick": { "$action": "addAlert", "type": "warning", "title": "Archive", "message": "Would archive the selected deals." }
    }
  ]
}
```

**Rules:**

1. Setting `selectable: true` is the *only* way to get a checkbox column in DataTable. Adding a manual `{ field: "_select", renderCell: <Checkbox /> }` column will render but not participate in select-all, the selection bar, or `selectionActions`.
2. Every row object in `data` must include a stable unique `id` string before selection is enabled. Do not assume DataTable will key by array index or by the first visible column.
3. Always pair `selectable: true` with `recordLabel: { singular, plural }` so the selection-bar copy reads naturally ("3 deals selected", not "3 records selected"). The plural form is also reused in the row count, loading, and empty-state copy.
4. `selectionActions[].onClick` receives the array of selected row **IDs** (not row objects). In spec form the renderer fires the `$action` but doesn't bind that array into scope — fire an `addAlert` (prototype) or `setState` to record intent. If you need the actual row data for a bulk op, derive it client-side from `data.deals.filter(d => selectedIds.includes(d.id))`.
5. If you also use `rowActions`, set `hideRowActionsWhenSelectionActive: true` so the row action column collapses while the selection bar is up.
6. Same pattern works on Kanban — see `kanban.md`.
7. Canonical examples: `deal-pipeline-table.json` (DataTable with selectable + groupBy + per-row Edit) and `support-ticket-board.json` (Kanban with the same shape). **Note:** `deal-pipeline-table.json` currently uses the string shorthand `"recordLabel": "deal"` which silently falls back to "records" — the corrected object form above is what to emit.

**Three filter types:**

| Type | Component | Matching | Use When |
|------|-----------|----------|----------|
| `"select"` | `Select variant="transparent"` | Exact match | Options are mutually exclusive by nature (e.g., date range mode) |
| `"multiselect"` | `MultiSelect` | Any-of | User may want to combine values (status, category, direction) — **this is the default choice** |
| `"dateRange"` | Two `DateInput` (from/to) | Range | Filtering by date column |

**Default to `"multiselect"` over `"select"` for filters** where combining values is useful. Users frequently want to see "Failed + Pending" or "HS→QB and QB→HS" together — single-select forces them to toggle between values one at a time. Only use `"select"` when options are truly mutually exclusive.

**Server-side mode:** Pass `serverSide={true}` + `totalCount` + callbacks (`onSearchChange`, `onFilterChange`, `onSortChange`, `onPageChange`). The component renders UI but delegates data operations to the parent.

**Row grouping:** Pass `groupBy={{ field: "supplier", label: (val, rows) => \`${val} (${rows.length})\`, sort: "asc" }}` to insert full-width group header rows.

### DataTable column props

Each entry in `columns[]` is an object. The common props:

| Prop | Type | Description |
|------|------|-------------|
| `field` | string | **Required.** Row-object key this column reads. |
| `label` | string | Header text. Empty string for action-only columns. |
| `sortable` | boolean | Enable click-to-sort on the header. |
| `align` | `"left"` \| `"center"` \| `"right"` | Cell + header alignment. |
| `width` | `"min"` \| `"max"` \| `"auto"` \| number | Column width — applies to **both** the header and the body cells (cells fall back to `width` when `cellWidth` is absent). See "Column Width Rules" below for value semantics. |
| `cellWidth` | `"min"` \| `"max"` \| `"auto"` | **Cell-only width override** — sizes the body cells independently of the header. **Keyword only — numeric values are not supported here** (use `width` for fixed pixel widths). Reach for this when cells need different sizing from the header: most commonly, `cellWidth: "min"` to stop cell text from wrapping onto a second line while the header stays its natural width. Also pairs with `width: "min" + cellWidth: "max"` for "tight header, expanding cells". |
| `renderCell` | `$render` node (spec) / `(value, row) => el` (React) | Custom cell renderer. |
| `footer` | aggregate config | Column footer total (see "TableFooter" below). |

**Wrapping rule of thumb:** if body cells are wrapping and you want them on one line, set `cellWidth: "min"` on that column — setting only `width: "min"` shrinks the header but the cells still wrap at the column's allotted width.

The rest of this file documents the raw `Table` primitives (an **escape hatch**) for cases where DataTable can't express the layout. If you reach for these, the TBL-01…TBL-15 rules in `RULES.md` apply — DataTable already enforces them internally.

---

## Raw `Table` primitives (escape hatch)

## Component Structure

```jsx
import {
  Table, TableHead, TableRow, TableHeader,
  TableBody, TableCell, TableFooter
} from "@hubspot/ui-extensions";
```

| Subcomponent | Purpose |
|-------------|---------|
| `TableHead` | Header section containing column labels |
| `TableRow` | Individual row (used in head, body, and footer) |
| `TableHeader` | Bolded column label cell |
| `TableBody` | Container for main table content |
| `TableCell` | Individual data cell |
| `TableFooter` | Bottom row, typically for summaries/totals |

---

## Table Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bordered` | Boolean | `true` | Show table borders. Set to `false` to remove. |
| `flush` | Boolean | `false` | Remove bottom margin. |
| `paginated` | Boolean | `false` | Enable pagination navigation below the table. |

**Standard configuration:** `bordered={true} flush={true}`

---

## TableHeader Props

| Prop | Type | Description |
|------|------|-------------|
| `align` | `"center"` \| `"left"` \| `"right"` | Column header alignment. |
| `sortDirection` | `"none"` \| `"ascending"` \| `"descending"` \| `"never"` | Visual sort indicator. `"never"` hides sort UI entirely. Does NOT modify data. |
| `onSortChange` | `(value: "none" \| "ascending" \| "descending") => void` | Called when header is clicked. You handle the actual sorting. |
| `disabled` | Boolean | When `true`, users cannot change sort ordering. No effect if `sortDirection` is `"never"`. |
| `width` | Number \| `"min"` \| `"max"` \| `"auto"` | Column width (see below). |

## TableCell Props

| Prop | Type | Description |
|------|------|-------------|
| `align` | `"center"` \| `"left"` \| `"right"` | Cell alignment. |
| `colSpan` | Number | Number of columns this cell spans. |
| `width` | Number \| `"min"` \| `"max"` \| `"auto"` | Cell width (should match its header). |

---

## Column Width Rules

| Value | Behavior | Best For |
|-------|----------|----------|
| `"min"` | Shrinks to content width. Overflows with horizontal scrollbar if wider than table. | Dates, status dots, checkboxes, action icons, short labels |
| `"max"` | Expands to fill maximum available width without overflow. | Single dominant column (use sparingly) |
| `"auto"` | Adjusts based on available space without overflow. | Names, emails, descriptions — anything variable-length |
| Number | Fixed pixel width. | Precise control when needed |

### Rules

1. **Always set `width` on `TableHeader`** — omitting it causes unpredictable sizing.
2. **Match `TableCell` width to its `TableHeader`** for the same column — mismatches cause layout jitter.
3. **Prefer `"min"` as the default for most columns.** It sizes to content and distributes space evenly across the table. `"auto"` is greedy — it absorbs all remaining space, often taking 70%+ of table width and leaving other columns cramped.
4. Use `"auto"` only when one column genuinely needs to stretch for long variable-length content (full descriptions, long URLs). Even then, try `"min"` first.
5. Use `"max"` sparingly — only when one column should dominate remaining space.

---

## Pagination Props

When `paginated={true}` on `<Table>`:

| Prop | Type | Description |
|------|------|-------------|
| `page` | Number | Current page number. |
| `pageCount` | Number | Total number of pages. |
| `onPageChange` | `(page: number) => void` | Called when pagination button is clicked. |
| `showFirstLastButtons` | Boolean | Show First/Last page buttons. Default `false`. |
| `showButtonLabels` | Boolean | Show text labels on navigation buttons. Default `true`. |
| `maxVisiblePageButtons` | Number | Max number of page buttons to display. |

**Default page size:** 10 rows.

```jsx
const PAGE_SIZE = 10;
const [currentPage, setCurrentPage] = useState(1);
const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);
const pagedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

<Table bordered={true} flush={true} paginated={true}
  page={currentPage} pageCount={pageCount}
  onPageChange={setCurrentPage}
  showFirstLastButtons={pageCount > 5}
>
```

**Rule:** Reset page to 1 when sort, filter, or search changes.

---

## Sorting

Store data in state, sort with `useMemo`, and track sort state separately.

```jsx
const DEFAULT_SORT = {
  name: "none",
  email: "none",
  status: "none",
};

const [sortState, setSortState] = useState({ ...DEFAULT_SORT });

const handleSort = (field, direction) => {
  setSortState({ ...DEFAULT_SORT, [field]: direction });
};

const sortedData = useMemo(() => {
  const activeField = Object.keys(sortState).find(k => sortState[k] !== "none");
  if (!activeField) return data;

  return [...data].sort((a, b) => {
    const dir = sortState[activeField] === "ascending" ? 1 : -1;
    return a[activeField] < b[activeField] ? -dir : dir;
  });
}, [data, sortState]);
```

```jsx
<TableHeader
  sortDirection={sortState.name}
  onSortChange={(dir) => handleSort("name", dir)}
>
  Name
</TableHeader>
```

### Rules

1. Reset all sort states to `"none"` when changing sort column — only one column sorts at a time.
2. Never mutate the source array — always spread into a new array before sorting.
3. Use `sortDirection="never"` on columns that shouldn't be sortable (actions, checkboxes).

---

## TableFooter

Use `TableFooter` for summary rows (totals, averages). Content uses `TableHeader` cells for bold styling.

```jsx
<TableFooter>
  <TableRow>
    <TableHeader>Totals</TableHeader>
    <TableHeader>{totalCount}</TableHeader>
    <TableHeader>${totalAmount.toLocaleString()}</TableHeader>
  </TableRow>
</TableFooter>
```

---

## Table Cell Text Sizing

**Use default `Text` in table cells — do NOT use `variant="microcopy"`.** Default text size is designed for readability in data tables. Microcopy makes table data unnecessarily small and harder to scan.

```jsx
// Correct — default text size
<TableCell width="min">
  <Text>{formatDate(record.date)}</Text>
</TableCell>

// Correct — demibold for emphasis
<TableCell width="min">
  <Text format={{ fontWeight: "demibold" }}>{formatCurrency(record.cost)}</Text>
</TableCell>

// Wrong — microcopy is too small for table data
<TableCell width="min">
  <Text variant="microcopy">{record.shop}</Text>
</TableCell>
```

Reserve `variant="microcopy"` for secondary information outside of tables: filter bar counts, help text, timestamps below a primary value.

---

## Empty Value Convention

```jsx
// In table cells, use double-dash for empty/null values
<TableCell width="auto">{record.email || "--"}</TableCell>
```

HubSpot consistently uses `--` (double dash) for empty table cells across the product. Never show blank, `null`, `undefined`, or single dash in tables.

---

## Row Patterns

### Linked Name as Primary Identifier

The record name IS the link — no separate "View" action column needed. This matches HubSpot's imports table, users table, and most list views.

```jsx
<TableCell width="auto">
  <Flex direction="row" align="center" gap="xs">
    <StatusTag variant={statusVariant}></StatusTag>
    <CrmActionLink
      actionType="PREVIEW_OBJECT"
      actionContext={{
        objectTypeId: "0-1",
        objectId: record.hs_object_id,
      }}
    >
      <Text truncate={true} format={{ fontWeight: "demibold" }}>
        {record.name}
      </Text>
    </CrmActionLink>
  </Flex>
</TableCell>
```

**Pattern:** StatusTag dot + linked name. The dot provides at-a-glance status; the name is the interactive element.

### Conditional Link Values

Numeric values that are plain text when zero, but clickable links when non-zero. Used for error counts, association counts, etc.

```jsx
<TableCell width="min">
  {record.errorCount > 0 ? (
    <Link onClick={() => openErrorPanel(record.id)}>
      {record.errorCount}
    </Link>
  ) : (
    <Text variant="microcopy">0</Text>
  )}
</TableCell>
```

### Avatar + Name in Rows

Circular avatar with photo or single-letter initial, paired with a name.

```jsx
<TableCell width="auto">
  <Flex direction="row" align="center" gap="xs">
    {record.avatarUrl ? (
      <Image src={record.avatarUrl} alt={record.name} width={24} height={24} />
    ) : (
      <Tag variant="default" size="small">
        {record.name.charAt(0).toUpperCase()}
      </Tag>
    )}
    <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
      {record.name}
    </Text>
  </Flex>
</TableCell>
```

### Direction / Flow Column

When direction or flow is a meaningful data dimension (sync direction, data flow, mapping direction), give it its own column rather than prefixing another field with an icon. Arrow characters are more informative than a generic sync icon and make the column sortable/filterable.

```jsx
<TableHeader width="min">Direction</TableHeader>

// In each row:
<TableCell width="min">
  <Text format={{ fontWeight: "demibold" }}>
    {direction === "hubspot_to_app" ? "→" :
     direction === "app_to_hubspot" ? "←" : "↔"}
  </Text>
</TableCell>
```

**Rule:** Don't conflate direction with another field (e.g., prefixing a field name with a `dataSync` icon). This makes direction unsortable and unfilterable. If direction drives user decisions, it earns its own column.

### Category as Tag Column

Use `Tag` in its own column for categorical data that drives user action (status, urgency). For informational classification (type labels like "Default", "Custom"), plain `Text` is sufficient — colored Tags add visual noise to busy tables. This keeps rows single-line — don't stack subtitle text under the name as it doubles row height.

```jsx
<TableHeader width="min">Category</TableHeader>

// In each row:
<TableCell width="min">
  <Tag>{record.category}</Tag>
</TableCell>
```

### Checkbox Column

First column for bulk selection. Minimal width, no header label text.

```jsx
<TableHeader width="min" sortDirection="never">
  <Checkbox
    name="select_all"
    checked={allSelected}
    onChange={toggleSelectAll}
  />
</TableHeader>

// In each row:
<TableCell width="min">
  <Checkbox
    name={`select_${record.id}`}
    checked={selectedIds.includes(record.id)}
    onChange={() => toggleSelect(record.id)}
  />
</TableCell>
```

---

## Table Action Column Patterns

HubSpot uses several patterns for the rightmost column. Choose based on how many actions exist per row.

### Pattern 1: No Action Column (Preferred)

**The default choice.** Make the record/item name a clickable `Link` with `overlay` to open a detail Panel. This eliminates an entire column, keeps rows compact, and matches HubSpot's native pattern across imports, users, and most list views.

```jsx
<TableCell width="min">
  <Link variant="primary" overlay={<DetailPanel item={record} />}>
    <Text format={{ fontWeight: "demibold" }} truncate={true}>
      {record.name}
    </Text>
  </Link>
</TableCell>
```

Only add a separate action column when there are actions unrelated to viewing the record (e.g., a refresh icon, a toggle).

### Pattern 2: Single Icon

One action per row — just an icon, no dropdown.

```jsx
<TableCell width="min" align="right">
  <Link onClick={() => handleRefresh(record.id)}>
    <Icon name="refresh" size="sm" screenReaderText="Refresh" />
  </Link>
</TableCell>
```

### Pattern 3: Ellipsis Dropdown Menu

Multiple actions per row — use the Dropdown component.

```jsx
<TableCell width="min" align="right">
  <Dropdown
    variant="transparent"
    buttonSize="xs"
    buttonText="Actions"
  >
    <Dropdown.ButtonItem onClick={() => handleEdit(record.id)}>
      Edit
    </Dropdown.ButtonItem>
    <Dropdown.ButtonItem onClick={() => handleDuplicate(record.id)}>
      Duplicate
    </Dropdown.ButtonItem>
    <Dropdown.ButtonItem
      overlay={
        <Modal id={`delete-${record.id}`} title="Confirm Delete" width="md">
          <ModalBody>
            <Text>Are you sure you want to delete {record.name}?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => actions.closeOverlay(`delete-${record.id}`)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(record.id)}>Delete</Button>
          </ModalFooter>
        </Modal>
      }
    >
      Delete
    </Dropdown.ButtonItem>
  </Dropdown>
</TableCell>
```

**Dropdown Props Reference:**

| Prop | Type | Description |
|------|------|-------------|
| `buttonText` | String | Text on the dropdown trigger button. |
| `buttonSize` | `"xs"` \| `"sm"` \| `"md"` (default) | Button size. Use `"xs"` for in-table dropdowns. |
| `variant` | `"primary"` \| `"secondary"` \| `"transparent"` | Button style. `"transparent"` renders as a hyperlink — best for table actions. |
| `disabled` | Boolean | Disable the dropdown trigger. |

**Dropdown.ButtonItem Props:**

| Prop | Type | Description |
|------|------|-------------|
| `onClick` | `() => void` | Called when item is clicked. |
| `overlay` | Component | Tooltip, Modal, or Panel to attach to this item. |

> **Note:** The `options` prop on Dropdown is deprecated. Use `Dropdown.ButtonItem` children instead.

### Pattern 4: Inline Button

Per HubSpot's design patterns: only include a button in a row if there's an action directly associated with that row. Use `xs` size and `secondary` variant.

```jsx
<TableCell width="min" align="right">
  <Button
    size="extra-small"
    variant="secondary"
    overlay={<Panel id={`edit-${record.id}`} title="Edit" width="small" variant="modal">...</Panel>}
  >
    Edit
  </Button>
</TableCell>
```

### Rules (from HubSpot's Table Design Patterns)

1. **In-row buttons use `xs` size and `secondary` variant** — this is confirmed by HubSpot's design guidelines. **Exception:** Configuration tables (field mappings, data sync settings) can use full-size `Button variant="secondary"` — the configuration context warrants more visual weight on controls.
2. Right-align action columns.
3. Long-form content triggered from rows should open in a Panel, not inline.
4. Prefer the ellipsis dropdown when there are 2+ actions per row.
5. If only one action exists, use a single icon or inline link — skip the dropdown.
6. **Remove action columns when a triage section handles the action.** If the card has a triage section above (AutoGrid of Tiles with action buttons), the accordion/table below serves context only. Duplicate action buttons in both places confuse which is THE place to act. The triage section is for action; the table is for the full picture.

---

## Filter Bar Pattern

The space between tabs/heading and the table is a critical UI zone in HubSpot. This is where search, filters, and toggles live.

### SearchInput Component — Full Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | String | Unique identifier for the input. |
| `label` | String | Label text. |
| `placeholder` | String | Placeholder text. |
| `value` | String | Current value. |
| `onChange` | `(value: string) => void` | Called when input value changes. |
| `onBlur` | `(value: string) => void` | Called when field loses focus. |
| `onFocus` | `(value: string) => void` | Called when field gains focus. |
| `onInput` | `(value: string) => void` | Called on every edit. |
| `clearable` | Boolean | Show clear button. Default `true`. |
| `readOnly` | Boolean | Non-editable. |
| `required` | Boolean | Show required indicator. |
| `error` | Boolean | Render error state with red border. |
| `validationMessage` | String | Text below input (green success, or red if `error={true}`). |
| `getValidationMessage` | `(value: string) => string \| null` | Dynamic validation function. |
| `description` | String | Help text below the input. |
| `tooltip` | String | Tooltip on hover next to label. |

### Basic Search + Table Pattern

```jsx
const [searchTerm, setSearchTerm] = useState("");
const [currentPage, setCurrentPage] = useState(1);

const filteredData = useMemo(() => {
  if (!searchTerm) return data;
  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    item.name.toLowerCase().includes(term) ||
    item.email.toLowerCase().includes(term)
  );
}, [data, searchTerm]);

// Reset page when search changes
useEffect(() => setCurrentPage(1), [searchTerm]);

// In JSX:
<Flex direction="column" gap="sm">
  <Flex direction="row" justify="between" align="end">
    <SearchInput
      name="table-search"
      placeholder="Search records..."
      value={searchTerm}
      onChange={setSearchTerm}
    />
    <Flex direction="row" gap="xs">
      {/* Right-side controls: filters, toggles, action buttons */}
    </Flex>
  </Flex>

  {filteredData.length === 0 ? (
    <EmptyState title="No results found">
      <Text>No records match your search.</Text>
    </EmptyState>
  ) : (
    <Table bordered={true} flush={true} paginated={true}
      page={currentPage} pageCount={Math.ceil(filteredData.length / PAGE_SIZE)}
      onPageChange={setCurrentPage}
    >
      {/* Table content */}
    </Table>
  )}
</Flex>
```

### Filter Controls Pattern

For dropdown-style filters above the table, use `Select variant="transparent"` with **no `label`**. This gives filters a lightweight, inline appearance matching HubSpot's native filter bars. Labels above filter dropdowns add unnecessary visual weight and waste vertical space.

```jsx
<Flex direction="row" justify="between" align="end" gap="sm">
  {/* Left side: search + filters */}
  <Flex direction="row" gap="xs" align="end">
    <SearchInput
      name="search"
      placeholder="Search..."
      value={searchTerm}
      onChange={setSearchTerm}
    />
    <Select
      name="status-filter"
      variant="transparent"
      placeholder="All statuses"
      value={statusFilter}
      onChange={setStatusFilter}
      options={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ]}
    />
  </Flex>

  {/* Right side: action buttons */}
  <Flex direction="row" gap="xs">
    <Button variant="primary" overlay={<Panel id="add-panel" ...>...</Panel>}>
      Add Record
    </Button>
  </Flex>
</Flex>
```

### Record Count Display

Show a record count as right-aligned microcopy in the filter bar. This answers "how many am I looking at?" without competing with primary actions. Use `Box flex={1}` on each side for balanced distribution.

```jsx
<Flex direction="row" gap="sm" align="end">
  <Box flex={1}>
    <Flex direction="row" gap="xs" align="end">
      <SearchInput name="search" placeholder="Search..." value={searchTerm} onChange={setSearchTerm} />
      <Select name="filter" variant="transparent" placeholder="All types" value={filter} onChange={setFilter} options={filterOptions} />
    </Flex>
  </Box>
  <Box flex={1}>
    <Flex direction="row" justify="end">
      {filteredData.length > 0 && (
        <Text variant="microcopy">
          {filteredData.length === totalRecords
            ? `${totalRecords} records`
            : `${filteredData.length} of ${totalRecords} records`}
        </Text>
      )}
    </Flex>
  </Box>
</Flex>
```

**Rules:**
- Hide the count when filtered results are 0 (the `EmptyState` communicates this).
- Show "X of Y records" when filters are active, "Y records" when unfiltered.
- Don't repeat the count in section titles — one smart location beats two redundant ones.

### Active Filter Chips

Show active filters as removable Tags:

```jsx
{activeFilters.length > 0 && (
  <Flex direction="row" gap="xs" align="center">
    {activeFilters.map(filter => (
      <Tag key={filter.key} variant="default" size="small"
        onClick={() => removeFilter(filter.key)}
      >
        {filter.label} ×
      </Tag>
    ))}
    <Link onClick={clearAllFilters}>Clear all</Link>
  </Flex>
)}
```

---

## Complete Table Example

Putting it all together — a searchable, sortable, paginated table with status dots, conditional links, and an action dropdown.

<!-- archetype: list-manager -->
```jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Flex, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  Text, Link, Tag, SearchInput, StatusTag, Dropdown, EmptyState,
  Modal, ModalBody, ModalFooter, Button,
} from "@hubspot/ui-extensions";
import { CrmActionLink } from "@hubspot/ui-extensions/crm";

const PAGE_SIZE = 10;

const DEFAULT_SORT = { name: "none", email: "none", status: "none" };

const DataTable = ({ records, actions }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortState, setSortState] = useState({ ...DEFAULT_SORT });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(r =>
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  // Sort
  const sortedData = useMemo(() => {
    const activeField = Object.keys(sortState).find(k => sortState[k] !== "none");
    if (!activeField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const dir = sortState[activeField] === "ascending" ? 1 : -1;
      const aVal = (a[activeField] || "").toString().toLowerCase();
      const bVal = (b[activeField] || "").toString().toLowerCase();
      return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
    });
  }, [filteredData, sortState]);

  // Paginate
  const pageCount = Math.ceil(sortedData.length / PAGE_SIZE);
  const pagedData = sortedData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page on filter/sort change
  useEffect(() => setCurrentPage(1), [searchTerm, sortState]);

  const handleSort = (field, direction) => {
    setSortState({ ...DEFAULT_SORT, [field]: direction });
  };

  const statusVariant = (status) =>
    status === "active" ? "success" :
    status === "pending" ? "warning" :
    status === "closed" ? "danger" : "default";

  if (records.length === 0) {
    return (
      <EmptyState title="No records yet">
        <Text>Create your first record to get started.</Text>
      </EmptyState>
    );
  }

  return (
    <Flex direction="column" gap="sm">
      {/* Filter bar */}
      <Flex direction="row" justify="between" align="end">
        <SearchInput
          name="table-search"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </Flex>

      {/* Table or empty search results */}
      {pagedData.length === 0 ? (
        <EmptyState title="No results found">
          <Text>Try adjusting your search term.</Text>
        </EmptyState>
      ) : (
        <Table bordered={true} flush={true} paginated={true}
          page={currentPage} pageCount={pageCount}
          onPageChange={setCurrentPage}
        >
          <TableHead>
            <TableRow>
              <TableHeader width="auto"
                sortDirection={sortState.name}
                onSortChange={(dir) => handleSort("name", dir)}
              >
                Name
              </TableHeader>
              <TableHeader width="auto"
                sortDirection={sortState.email}
                onSortChange={(dir) => handleSort("email", dir)}
              >
                Email
              </TableHeader>
              <TableHeader width="min"
                sortDirection={sortState.status}
                onSortChange={(dir) => handleSort("status", dir)}
              >
                Status
              </TableHeader>
              <TableHeader width="min">
                Errors
              </TableHeader>
              <TableHeader width="min" sortDirection="never" align="right">
                Actions
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedData.map((record) => (
              <TableRow key={record.id}>
                {/* Name with status dot */}
                <TableCell width="auto">
                  <Flex direction="row" align="center" gap="xs">
                    <StatusTag variant={statusVariant(record.status)}></StatusTag>
                    <CrmActionLink
                      actionType="PREVIEW_OBJECT"
                      actionContext={{
                        objectTypeId: "0-1",
                        objectId: record.id,
                      }}
                    >
                      <Text truncate={true} format={{ fontWeight: "demibold" }}>
                        {record.name}
                      </Text>
                    </CrmActionLink>
                  </Flex>
                </TableCell>

                {/* Email as mailto link */}
                <TableCell width="auto">
                  {record.email ? (
                    <Link href={`mailto:${record.email}`}>{record.email}</Link>
                  ) : (
                    <Text variant="microcopy">--</Text>
                  )}
                </TableCell>

                {/* Status tag */}
                <TableCell width="min">
                  <Tag variant={statusVariant(record.status)} size="small">
                    {record.status}
                  </Tag>
                </TableCell>

                {/* Conditional link for errors */}
                <TableCell width="min">
                  {record.errors > 0 ? (
                    <Link onClick={() => actions.openErrorPanel(record.id)}>
                      {record.errors}
                    </Link>
                  ) : (
                    <Text variant="microcopy">0</Text>
                  )}
                </TableCell>

                {/* Action dropdown */}
                <TableCell width="min" align="right">
                  <Dropdown variant="transparent" buttonSize="xs" buttonText="Actions">
                    <Dropdown.ButtonItem onClick={() => handleEdit(record.id)}>
                      Edit
                    </Dropdown.ButtonItem>
                    <Dropdown.ButtonItem
                      overlay={
                        <Modal id={`delete-${record.id}`} title="Confirm Delete">
                          <ModalBody>
                            <Text>Delete {record.name}?</Text>
                          </ModalBody>
                          <ModalFooter>
                            <Button variant="secondary"
                              onClick={() => actions.closeOverlay(`delete-${record.id}`)}>
                              Cancel
                            </Button>
                            <Button variant="destructive"
                              onClick={() => handleDelete(record.id)}>
                              Delete
                            </Button>
                          </ModalFooter>
                        </Modal>
                      }
                    >
                      Delete
                    </Dropdown.ButtonItem>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Flex>
  );
};
```

---

## HubSpot's Table Design Guidelines

From the official documentation:

- **DO** keep text in data cells clear and concise for easier scanning.
- **DO** always include a table header row to label columns.
- **DO** limit the use of links in table cells.
- **DON'T** use multiple tables on one screen when possible.
- **DON'T** render a blank table when no data exists — use `EmptyState`.
- **In-row buttons:** only if there's an action directly associated with the row. Use `xs` size, `secondary` variant, right-aligned.
- **Long content:** put it in a Panel opened from the row, not inline in cells.
