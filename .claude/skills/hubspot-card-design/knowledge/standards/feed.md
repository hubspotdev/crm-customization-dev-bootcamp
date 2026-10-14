---
id: feed
scope: [feed, activity, timeline, audit-log, history, recent-events, date-grouping, hs-uix]
depends-on: [tables, utils, status-and-tags]
archetypes: [activity-feed]
---

# Feed — Activity Timeline (`hs-uix/feed`)

> **Use `hs-uix/feed` for any chronological stream** — activity timelines, audit logs, recent-events panels, interaction history, note/email/call feeds. It is to "what happened, and when?" what DataTable is to a list manager. Don't hand-roll a timeline out of `Flex` + `Tile` rows.

```bash
npm install hs-uix
```

```jsx
import { Feed } from "hs-uix/feed";
```

Feed gives you search, filters, sort, date grouping, a count line, view-more pagination, and loading/empty/error states out of one `items` array — all rendered with HubSpot primitives.

---

## When Feed vs DataTable vs Kanban

| Need | Use |
|---|---|
| Chronological history, audit log, recent events, activity timeline | **Feed** |
| Compare records across columns, edit cells, totals, list manager | DataTable (`tables.md`) |
| Records moving through stages / status columns | Kanban (`kanban.md`) |

If the mental model is "**when** did each thing happen," reach for Feed.

---

## Quick Start

```jsx
import { Feed } from "hs-uix/feed";

<Feed
  title="Activity"
  description="Latest timeline events for this record."
  items={activity}
  searchFields={["title", "body", "type"]}
  filters={[
    {
      name: "type",
      type: "multiselect",
      label: "Activity type",
      options: [
        { label: "Emails", value: "Email" },
        { label: "Calls", value: "Call" },
        { label: "Notes", value: "Note" },
      ],
    },
  ]}
  sortOptions={[
    { value: "newest", label: "Newest first", field: "timestamp", direction: "desc" },
    { value: "oldest", label: "Oldest first", field: "timestamp", direction: "asc" },
  ]}
  defaultSort="newest"
  groupByDate
/>
```

That is a searchable, filterable, date-grouped timeline with a native toolbar and empty/loading/error states.

---

## Standard item shape

Feed works out of the box when each item uses these keys — **prefer this over `fields`** when your data is activity-shaped:

| Key | Renders as |
|---|---|
| `id` / `key` | Stable item key |
| `type` | Activity type label in a `StatusTag` (use `typeLabel` if `type` is a machine value) |
| `typeVariant` | `StatusTag` variant: `default` \| `info` \| `success` \| `warning` \| `danger` |
| `status` / `outcome` / `severity` (+ `*Variant`) | Optional secondary status tag (e.g. a call outcome) |
| `iconName` / `icon` | Activity/entity icon — verified HubSpot icon names (`email`, `calling`, `appointment`, `comment`, `description`) |
| `title` / `subject` | Main heading (wrap with a link via `href`) |
| `body` / `description` / `preview` | Main text body |
| `timestamp` / `time` / `date` / `createdAt` | Time display **and** the input for date grouping |
| `actor` / `author` | Actor text, or `{ name, avatar/avatarUrl/initials }` |
| `meta` / `metadata` | Inline metadata — an array renders as `List variant="inline-divided"` |
| `actions` | Action objects → `ButtonRow` |
| `footer` | Optional footer content |

**Precompute `typeVariant` (and any status variant) in `data`** — don't express it with `$if` in the spec. This mirrors the derivation policy and keeps the render deterministic.

---

## Declarative `fields` (custom-shaped rows)

When rows have custom properties instead of the standard shape, map them with `fields` — placements mirror Kanban's `cardFields` vocabulary:

```jsx
<Feed
  items={events}
  fields={[
    { field: "subject",  placement: "title",  href: (row) => row.url },
    { field: "channel",  placement: "subtitle" },
    { field: "owner",    label: "Owner",    placement: "body" },
    { field: "nextStep", label: "Next step", placement: "body" },
    { field: "priority", placement: "meta",   type: "tag",    variant: "warning" },
    { field: "outcome",  placement: "footer", type: "status", variant: "success" },
  ]}
/>
```

- Placements: `title`, `subtitle`, `meta`, `body`, `footer`.
- `type: "tag"` → HubSpot `Tag`; `type: "status"` → `StatusTag`.
- Labeled `body` fields collapse into one `DescriptionList`. Keep `label` a **string** — `DescriptionListItem.label` does not accept nodes.

---

## Filters, sort, search

The toolbar intentionally mirrors DataTable/Kanban: left = Search + quick filters (+ overflow Filters button), right = Sort + count.

| Filter prop | Description |
|---|---|
| `name` | Filter key; defaults to reading `item[name]` |
| `field` | Optional accessor when the item key differs from `name` |
| `type` | `select` \| `multiselect` \| `dateRange` |
| `label` / `placeholder` | Native input label/placeholder |
| `options` | `{ label, value }[]` for select/multiselect |

`sortOptions` accept `field` + `direction` (`asc`/`desc`) or a custom `comparator(a, b)`. `filterInlineLimit` controls how many filters show inline before collapsing into the overflow button.

---

## Grouping and pagination

```jsx
<Feed items={activity} groupByDate pageSize={5} />
```

- `groupByDate` groups into `Today`, `Yesterday`, then localized older dates (off the `timestamp`/`date` key).
- Arbitrary grouping: `groupBy="type"` or `groupBy={(item) => item.bucket}`.
- `pageSize` shows that many items, then a transparent **View more** button for the remaining client-side items.
- Server / external loading: pass `hasMore`, `loadingMore`, and `onLoadMore`. With `serverSide`, Feed renders the toolbar and emits `onParamsChange` but does not mutate `items`.

---

## Containers & density

- `container`: `"tile"` (default) \| `"none"` \| `"card"` (Tile-backed alias) — the outer frame.
- `itemContainer`: `"tile"` (default) \| `"none"` \| `"card"` — each item's frame.
- `showDividers` adds dividers between items when `itemContainer="none"`.
- `compact` tightens spacing.

---

## Rules

1. **Activity-shaped data → use the standard item keys**, not `fields`. Reach for `fields` only for custom row shapes.
2. **Precompute `typeVariant` / status variants in `data`** — no `$if` chains in the spec.
3. **`groupByDate` needs a real `timestamp`/`date`/`createdAt`** on each item — that key feeds both the time display and the grouping.
4. **Keep field `label` a string** — `DescriptionListItem.label` rejects nodes.
5. **Use verified HubSpot icon names** for `iconName` (`email`, `calling`, `appointment`, `comment`, `description`) — see `media.md`.
6. **One Feed per surface.** For "compare attributes side-by-side," switch to DataTable; for "stages," switch to Kanban.
