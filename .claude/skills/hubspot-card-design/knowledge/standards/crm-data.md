---
id: crm-data
scope: [crm-data, crm-search, crm-table, crm-board, crm-lookup, objectType, hs-uix]
depends-on: [tables, kanban, forms, data-and-state]
archetypes: [list-manager, pipeline-board]
---

# CRM-Backed Data — `CrmDataTable` / `CrmKanban` / `CrmLookupSelect` / `CrmRecordPicker`

> **Reach for these when the card's data IS CRM records** (deals, contacts, companies, tickets, custom objects) and you'd otherwise hand-wire `useCrmSearch`. Point them at an `objectType` + `properties` and they fetch, paginate, and render — no manual data-source code. They wrap the same DataTable / Kanban / Select you already know.

```jsx
import { CrmDataTable, CrmKanban } from "hs-uix/utils";
import { CrmLookupSelect } from "hs-uix/common-components";
```

For records you already have in hand (props, computed arrays, mock data), use plain `DataTable` / `Kanban` (see `tables.md`, `kanban.md`). These CRM variants are specifically for live CRM search.

---

## Pagination model

By default both fetch **one batch** (`pageLength`, default 100) and do search / sort / filter / pagination **client-side** — a single request, no refetch per interaction. When results exceed the batch they show a "first N of M" note and lazy-load the next CRM batch as the user pages. Pass `serverSide` to force every search/filter/sort to run as a fresh CRM query.

---

## CrmDataTable

A `DataTable` bound to CRM search. Accepts all DataTable props except the data-source ones it manages (`data`, `loading`, `error`, `searchValue`, `onParamsChange`).

```jsx
<CrmDataTable
  objectType="deal"
  properties={["dealname", "amount", "dealstage", "closedate"]}
  columns={[
    { field: "dealname", label: "Deal", sortable: true },
    { field: "amount", label: "Amount" },
    { field: "dealstage", label: "Stage" },
  ]}
  searchFields={["dealname"]}
  autoFilters={["dealstage"]}
/>
```

## CrmKanban

The board analog. `groupBy` is required; `stages` is optional — pass it for real pipeline labels, or let stages auto-derive (label them via `stageLabels`).

```jsx
<CrmKanban
  objectType="deal"
  properties={["dealname", "amount", "dealstage"]}
  groupBy="dealstage"
  stageLabels={{ appointmentscheduled: "Appointment", qualifiedtobuy: "Qualified" }}
  cardFields={[
    { field: "dealname", placement: "title" },
    { field: "amount", placement: "meta" },
  ]}
/>
```

### Shared props

| Prop | Description |
|---|---|
| `objectType` | CRM object to query (`"contact"`, `"company"`, `"deal"`, or any object type id/name). |
| `properties` | `string[]` of CRM properties to fetch. |
| `pageLength` | Batch size per query (default `100`). |
| `serverSide` | Force search/filter/sort to refetch from CRM. |
| `autoFilters` | `boolean \| string[] \| { fields? }` — auto-generate select filters from properties. |
| `propertyMap` | Map your field names → CRM property names (for sorts/filters). |
| `searchFields` | Fields the search box queries. |
| `mapRecord` | `(record) => Row` — customize how a raw CRM record becomes a row. |
| `dataTableProps` / `kanbanProps` | Escape hatch to pass props straight through to the underlying component. |

---

## CrmLookupSelect

A CRM-backed `Select` (or `MultiSelect` with `multiple`) that searches live as the user types — debounced, paginated, no manual data-source wiring. A picked option stays valid after results change; `loadingOption` shows during the debounce window and `noResultsOption` only appears once a query settles (no "no results" flash mid-type).

```jsx
import { CrmLookupSelect } from "hs-uix/common-components";

<CrmLookupSelect
  objectType="contact"
  properties={["firstname", "lastname", "email"]}
  label="Primary contact"
  value={contactId}
  onChange={setContactId}
  labelProperty={(r) => `${r.firstname} ${r.lastname}`}
  valueProperty="hs_object_id"
  descriptionProperty="email"
/>
```

| Prop | Description |
|---|---|
| `objectType` / `properties` | CRM object + properties to search across. |
| `value` / `onChange` | Controlled selected value(s) — bind via `$bindState` in specs. |
| `multiple` | Render a `MultiSelect`. |
| `labelProperty` / `valueProperty` / `descriptionProperty` | Derive each option's label / value / description. |
| `debounce` / `minSearchLength` / `pageLength` | Search tuning. |
| `placeholder`, `description`, `required`, `readOnly`, `error` | Standard field props forwarded to the native select. |

Inside a `FormBuilder`, back a field with CRM search via `makeCrmSearchSelectField` / `makeCrmSearchMultiSelectField` from `hs-uix/utils` (see `forms.md`).

---

## CrmRecordPicker

A richer record picker than `CrmLookupSelect`: search-as-you-type with label + description per option, single or `multi` selection (with `max`), and optional **inline record creation** (`allowCreate`) when the search comes up empty. Returns both ids and full records to `onChange`.

```jsx
import { CrmRecordPicker } from "hs-uix";

<CrmRecordPicker
  objectType="company"
  properties={["name", "domain"]}
  labelField="name"
  descriptionField="domain"
  label="Associated companies"
  multi
  max={5}
  defaultValue={[]}
  onChange={(ids, records) => setCompanyIds(ids)}
/>
```

| Prop | Description |
|---|---|
| `objectType` / `properties` | CRM object + properties to fetch for each option. |
| `labelField` / `descriptionField` | Property name (or accessor) for the option's label / secondary line. |
| `value` / `defaultValue` | Selected id(s). In specs prefer **`defaultValue`** or `$bindState` on `value`. Multi mode uses arrays. |
| `multi` / `max` | Multi-select with an optional cap. |
| `allowCreate` | `{...config}` enables "Create <term>" when no match; `false` disables. |
| `variant` | `"input"` (default field look) or `"transparent"`. |
| `debounce` / `minSearchLength` / `pageLength` | Search tuning. |

**Picking between the two pickers:** `CrmLookupSelect` when a plain select bound to a state key is enough; `CrmRecordPicker` when you need descriptions, a selection cap, create-inline, or the full records (not just ids) in the change handler.

---

## Lower-level building blocks (custom views)

When you need a bespoke UI, the hooks behind the components are exported from `hs-uix/utils`:

- `useCrmSearchDataSource(params, options)` → `{ data, loading, error, totalCount, pagination, hasMore, … }`.
- `useCrmSearchOptions(params, options)` → CRM search shaped into `{ label, value }` options.
- `buildCrmSearchConfig` / `normalizeCrmSearchRows` / `resolveCrmObjectType` — request config + response flattening + object-type alias normalization.

Cross-ref: `data-and-state.md` (raw `useAssociations` / CRM fetch patterns).

---

## Rules

1. **Use the Crm* variants only for live CRM search.** Data already in hand → plain `DataTable` / `Kanban`.
2. **Always pass `objectType` + `properties`** — they drive the query. `CrmKanban` also requires `groupBy`.
3. **Default to the client-side batch model**; reach for `serverSide` only when the set is large or must reflect live writes immediately.
4. **`CrmLookupSelect` value binds with `$bindState`** in specs — don't hand-wire `value` + `onChange`.
5. **Map machine stage values to labels** via `stageLabels` (CrmKanban) so columns read cleanly.
