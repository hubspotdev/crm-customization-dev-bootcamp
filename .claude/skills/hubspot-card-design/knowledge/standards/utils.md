---
id: utils
scope: [formatters, options, hubspot-value-guards, tag-variants, collections, query-helpers, crm-search, hs-uix]
depends-on: [status-and-tags, crm-data]
archetypes: [all]
---

# Utils — `hs-uix/utils`

> **Default source for formatting, option shaping, HubSpot value guards, tag-variant inference, and safe aggregates.** Pure functions, no JSX, zero side effects — drop them into `renderCell`, `sortComparator`, `columnFooter`, or a server handler.

```jsx
import {
  formatCurrency, formatCurrencyCompact,
  formatDate, formatDateTime, formatPercentage,
  buildOptions, findOptionLabel,
  isDateValueObject, isTimeValueObject, isDateTimeValueObject,
  getAutoTagVariant, getAutoStatusTagVariant, getAutoTagDisplayValue,
  createStatusTagSortComparator,
  sumBy,
  deriveCardFieldsFromColumns,
  buildActiveFilterChips, resetFilterValues, getEmptyFilterValues, filterRows, searchRows,
  CrmDataTable, CrmKanban, useCrmSearchDataSource, useCrmSearchOptions,
} from "hs-uix/utils";
```

---

## Formatters

Locale-aware wrappers around `Intl.NumberFormat` / `Intl.DateTimeFormat`. Every formatter treats `null` / `undefined` as safe.

```js
formatCurrency(1234.56);                               // "$1,235"
formatCurrency(9500, { currency: "EUR" });             // "€9,500"
formatCurrencyCompact(123_580_000);                    // "$123.6M"
formatCurrencyCompact(4160);                           // "$4.2K"
formatDate("2026-04-15");                              // "Apr 15, 2026"
formatDate(null);                                      // ""
formatDate(Date.now(), { month: "numeric" });          // "4/15/2026"
formatDateTime("2026-04-15T14:30:00Z");                // "Apr 15, 2026, 9:30 AM" (local)
formatPercentage(0.1567);                              // "16%"
formatPercentage(0.1567, { maximumFractionDigits: 1 });// "15.6%"
```

Every formatter accepts a trailing options object that spreads into the underlying `Intl` call — anything `Intl.NumberFormat` / `Intl.DateTimeFormat` supports (narrow symbol, specific fraction digits, grouping, time zone) is reachable without a new helper.

### When to use which

| Use | Formatter |
|---|---|
| Cells, form labels, inline text | `formatCurrency`, `formatDate`, `formatPercentage` |
| Statistics tiles, Kanban headline metrics, footer totals | `formatCurrencyCompact` ("$4.2K" / "$123.6M") |
| Timestamps (created at, closed at) | `formatDateTime` |

Rules:
- **Never hand-roll `toFixed(2)` for money** — breaks `en-GB`, `de-DE`, etc. Use `formatCurrency`.
- **Use `formatCurrencyCompact`** in tight surfaces (tiles, card meta, Kanban headers). Full format in tables, DescriptionLists, forms.
- `formatDate(null)` → `""`; if you want `"--"` for empty cells, fall back explicitly: `formatDate(val) || "--"`.

---

## Options

Shape raw arrays into `{ label, value }` for `Select` / `MultiSelect` without rewriting `.map()` at every call site.

```js
const statusOptions = buildOptions(
  [{ name: "Open", id: "o" }, { name: "Closed", id: "c" }],
  { labelKey: "name", valueKey: "id" },
);
// → [{ label: "Open", value: "o" }, { label: "Closed", value: "c" }]

findOptionLabel(statusOptions, "o");                     // "Open"
findOptionLabel(statusOptions, "missing", "Unknown");    // "Unknown"
```

Rules:
- **Use `buildOptions` anywhere you'd write `.map(r => ({ label: r.name, value: r.id }))`.**
- **Use `findOptionLabel` in read-only surfaces** (table cells, DescriptionList values) where you have the raw value and need the label.

---

## HubSpot value guards

HubSpot's `DateInput` / `TimeInput` / `DateTimeInput` return structured objects, not strings. Use these guards in `filterFn` / `sortComparator` / custom cells to distinguish a HubSpot value object from a raw primitive.

```js
isDateValueObject({ year: 2026, month: 3, date: 15 });   // true
isDateValueObject("2026-04-15");                         // false
isDateTimeValueObject(val);                              // { ...DateInput, ...TimeInput }
```

Example — a `filterFn` that handles both a HubSpot date object and a raw ISO string:

```js
filterFn: (row, { from, to }) => {
  const raw = row.closeDate;
  const date = isDateValueObject(raw)
    ? new Date(raw.year, raw.month, raw.date)
    : new Date(raw);
  // ...range check
}
```

---

## Tag variants

The same inference that powers `AutoTag` / `AutoStatusTag`, exposed as plain functions for custom cells and sort comparators. Matching is case-insensitive and tolerates underscores, dashes, and phrases (`"in_progress"`, `"on hold"`, `"at-risk"` all resolve).

```js
getAutoTagVariant("At risk");                            // "warning"
getAutoTagVariant("Active");                             // "success"
getAutoTagVariant("in_progress");                        // "info"
getAutoStatusTagVariant("Failed");                       // "danger"
getAutoTagDisplayValue("in_progress");                   // "In progress"
```

Overrides and fallback via the second argument:

```js
getAutoTagVariant("Processing", {
  overrides: { processing: "warning" },
  fallback: "info",
});
```

`createStatusTagSortComparator` groups rows by variant (default order: `success → warning → danger/error → info → default`), then sorts alphabetically within each group:

```js
const COLUMNS = [
  {
    field: "status",
    label: "Status",
    sortable: true,
    sortComparator: createStatusTagSortComparator(),
    renderCell: (val) => <AutoStatusTag value={val} />,
  },
];
```

Override variant ordering via `createStatusTagSortComparator({ variantOrder: ["danger", "warning", ...] })`.

---

## Collections

`sumBy(items, keyOrFn)` — safe against `null`, `undefined`, and missing keys. Use for footer totals and Kanban header metrics.

```js
sumBy(deals, "amount");                                  // 245000
sumBy(deals, (r) => r.amount * (r.probability ?? 0));    // weighted total
```

---

## Table-and-Board projection

`deriveCardFieldsFromColumns(columns)` — project a DataTable `columns` config into Kanban `cardFields` so paired views share one source of truth.

```js
const COLUMNS = [ /* DataTable column config */ ];
const CARD_FIELDS = deriveCardFieldsFromColumns(COLUMNS);
```

See [`kanban.md`](./kanban.md#paired-table-and-board-views) for the full view-toggle pattern.

---

## Query helpers (shared toolbar plumbing)

The filter/search helpers behind DataTable / Kanban / Feed / Calendar toolbars — the packaged components call these internally. The `Collection*` primitives that consume them are **not available as spec components**; these helpers are documented for completeness and for hand-written extension code, not for specs.

```js
const chips = buildActiveFilterChips(filters, filterValues);     // removable active-filter chips
const cleared = resetFilterValues(filters, filterValues, "stage"); // clear one filter
const blank = getEmptyFilterValues(filters);                      // initial/empty values
filterRows(rows, filters, filterValues);                          // apply filters
searchRows(rows, query, searchFields);                            // apply search
```

---

## CRM data adapters

`CrmDataTable`, `CrmKanban`, and the `useCrmSearch*` hooks are CRM-bound data components that live in `hs-uix/utils` (they're adapters, not visuals). Point them at an `objectType` + `properties` and they fetch + paginate for you. Full coverage in [`crm-data.md`](./crm-data.md).

```js
<CrmDataTable objectType="deal" properties={["dealname", "amount"]} columns={COLUMNS} />
```

---

## Rules

1. **No hand-rolled `formatCurrency`, `formatDate`, `formatPercentage`** — use `hs-uix/utils`.
2. **No `.map(r => ({ label: r.name, value: r.id }))`** — use `buildOptions`.
3. **No ad-hoc `typeof val === "object" && "year" in val`** — use the HubSpot value guards.
4. **No ad-hoc status-to-variant switch maps** — use `getAutoTagVariant` / `AutoTag` / `AutoStatusTag`.
5. **No `rows.reduce((s, r) => s + (r.amount ?? 0), 0)`** — use `sumBy`.
6. **Prefer `formatCurrencyCompact` over `formatCurrency`** in tight surfaces (tiles, Kanban headers, card meta).
