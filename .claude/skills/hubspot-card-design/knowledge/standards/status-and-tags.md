---
id: status-and-tags
scope: [tag, status-tag, filter-chips, count-indicators, kpi-summary-strip, pipe-separated-labels]
depends-on: []
critical-rules: 6
archetypes: [list-manager, triage-dashboard, grouped-detail]
---

# Status & Tags

> Status indicators, categorization, filter chips, and summary bars.
>
> **First choice: `AutoTag` / `AutoStatusTag` from `hs-uix/common-components`.** They infer the variant from the value string, so you stop maintaining hand-rolled status-to-color switch maps across the codebase. Raw `Tag` / `StatusTag` remain for cases where the variant is unrelated to the value (filter chips, explicit overrides).

---

## AutoTag / AutoStatusTag (`hs-uix/common-components`) — the default

```jsx
import { AutoTag, AutoStatusTag } from "hs-uix/common-components";

<AutoStatusTag value="At risk" />          // warning
<AutoStatusTag value="Active" />           // success
<AutoStatusTag value="Failed" />           // danger
<AutoStatusTag value="in_progress" />      // info — matching tolerates underscores/dashes/phrases
<AutoTag value="Enterprise" />             // info
<AutoTag value="SMB" />                    // default
```

Pass a free-form status string; get a properly-colored tag back. Matching is case-insensitive and tolerates underscores, dashes, and phrases (`"in_progress"`, `"on hold"`, `"at-risk"` all resolve). Override per-value or set a fallback:

```jsx
<AutoStatusTag
  value="Processing"
  overrides={{ Processing: "warning" }}
  fallback="info"
/>
```

The same inference is available as pure functions in [`utils.md`](./utils.md): `getAutoTagVariant`, `getAutoStatusTagVariant`, `getAutoTagDisplayValue`. Use them in custom cells and in `createStatusTagSortComparator` for DataTable columns that should sort by color-then-alpha.

Rules:
- **Default to `AutoStatusTag` for status values** and `AutoTag` for category values — don't re-derive the variant at every call site.
- **Use raw `StatusTag` / `Tag` when the variant is intentionally decoupled from the value** — filter chips (always neutral), explicit user-picked color, or a value space that doesn't map cleanly to variants (`SMB` / `Mid-Market` / `Enterprise` where you want all three a specific color).
- **In specs: prefer raw `StatusTag` with a pre-computed `variant` field in `data`** over `AutoStatusTag` when the set of values is closed and known. This aligns with the spec's derivation-into-`data` policy — the variant is an authored decision, not runtime inference — and makes the output deterministic and reviewable. Reach for `AutoStatusTag` in specs only when values are user-defined or unbounded.
- **`createStatusTagSortComparator()` on any DataTable column showing AutoStatusTag** — users expect urgent (danger/warning) at the top.

---

## Tag Component

The `Tag` component renders a tag to label or categorize information or other components. Tags can be static or clickable for invoking functions.

**Import:** `import { Tag } from "@hubspot/ui-extensions";`

**Docs:** https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/tag

### Tag Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `string` | Yes | -- | The text content displayed inside the tag. |
| `variant` | `"default"` \| `"warning"` \| `"success"` \| `"error"` \| `"info"` | No | `"default"` | The color of the tag. See variants table below. |
| `onClick` | `() => void` | No | -- | A function invoked when the tag is clicked. Receives no arguments; return value is ignored. |
| `overlay` | `Modal` \| `Panel` \| `Tooltip` | No | -- | A Modal, Panel, or Tooltip component to open as an overlay on click or hover. |
| `inline` | `boolean` | No | `false` | When `true`, the tag aligns side-by-side with surrounding text. |

### Tag Variants

| Variant | Color | Use Case | Example |
|---------|-------|----------|---------|
| `"default"` | Grey | General tagging and labeling | Service type, category |
| `"success"` | Green | Indicating or confirming success | Active account, completed task |
| `"warning"` | Yellow | Time-sensitive or important | SLA approaching, deal expiring |
| `"error"` | Red | Indicating error or failure | Overdue ticket, sync error |
| `"info"` | Blue | Conveying general information | Request type, informational label |

> **`"subtle"` is NOT a valid variant.** Common hallucination — the runtime rejects it and the Tag falls back to default rendering with a console warning. The five values above are the entire enum. For a low-emphasis chip use `"default"`. Same goes for `StatusTag` — its variant is `"default" | "info" | "success" | "warning" | "danger"` (note `danger`, not `error`, per TAG-04), with no `"subtle"`.

### Tag Usage Example

```jsx
import { Tag } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <Tag
      variant="success"
      onClick={() => {
        console.log("Tag clicked!");
      }}
      inline={true}
    >
      Success
    </Tag>
  );
};
```

### Tag Guidelines

- **DO:** Make tag text concise and clear.
- **DO:** Ensure that tag variants are used consistently across the extension.
- **DO:** Use neutral `Tag` (default grey variant) for filter chips. Filter chips are controls, not status indicators.
- **DON'T:** Use tags in place of buttons or links.
- **DON'T:** Rely on color alone to communicate the tag's meaning. Ensure that tag text is clear and helpful.
- **DON'T:** Use colored `StatusTag` variants as filter chips. The colored dots compete visually with actual status indicators in the table rows, creating visual noise and diluting the meaning of color.
- **DON'T:** Use `"error"` (red) for neutral categories. Red means "something is wrong" — don't use it for category labels like "Protein" or "Premium" even if you're running out of colors. Use `"default"` (grey) as a safe fallback. Reserve red exclusively for status/urgency.
- **DON'T:** Use `Tag` for every categorical field. Tags earn color when the category drives user action (status, urgency, health). For informational classification (type labels like "Default", "Custom", "Association"), plain `Text` keeps the visual hierarchy clean — colored Tags compete with actual status indicators and add noise to busy tables.
- **DO:** Use `Icon` (not Tag/StatusTag) for entity-type or activity-type indicators (email/call/meeting/note, contact/company/deal). Icons disambiguate at a glance and don't borrow the color affordance that should be reserved for status. If the type lives inside a `$forEach` template, note that `Icon.name` is a static-only prop — split the iteration by type so each block can hardcode its icon (see specs/README.md).
- **DO:** Differentiate severity within a "needs attention" group. Items at zero (out of stock, completely failed) should get a red `"error"` tag to distinguish them from items that are merely low or approaching a threshold.
- **DON'T:** Use `inline={true}` on Tags inside Flex rows. The `inline` prop is for embedding Tags within flowing `Text` content. Inside a `Flex direction="row"`, the Flex already handles inline layout — adding `inline={true}` can contribute to truncation in width-constrained containers (Tags get truncated to "Overd..." instead of "Overdue").
- **DO:** When a Tag sits next to a long text sibling in a Flex row and gets truncated, remove `inline={true}` first — the Flex row gives the Tag its natural width. If truncation persists, the sibling text is consuming too much space; consider shortening the text or moving the Tag to its own line.

---

## StatusTag Component

The `StatusTag` component renders a colored dot indicator to display the current status of an item. Status tags can be static or clickable for invoking functions with the `onClick` prop.

**Import:** `import { StatusTag } from "@hubspot/ui-extensions";`

**Docs:** https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/status-tag

### StatusTag Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `string` | Yes | -- | The text content displayed next to the dot indicator. |
| `variant` | `"default"` \| `"info"` \| `"danger"` \| `"warning"` \| `"success"` | No | `"default"` | The color of the dot indicator. See variants table below. |
| `hollow` | `boolean` | No | `false` | When `true`, the dot is a ring instead of a filled-in circle. |
| `onClick` | `() => void` | No | -- | A function invoked when the status tag is clicked. Receives no arguments; return value is ignored. |
| `showRemoveIcon` | `boolean` | No | `false` | When `true`, includes a small clickable x icon to remove the status tag. |
| `onRemoveClick` | `() => void` | No | -- | A function invoked when the remove icon is clicked. |

### StatusTag Variants

| Variant | Dot Color | Use Case |
|---------|-----------|----------|
| `"default"` | Grey | Neutral state |
| `"info"` | Blue | General or informative state |
| `"success"` | Green | Positive state, confirming success or completion |
| `"warning"` | Yellow | Cautionary state, needs attention or time-sensitive |
| `"danger"` | Red | Negative state, error or failure |

### StatusTag Usage Example

```jsx
import { Flex, Heading, StatusTag, Text } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <Flex direction="column" gap="sm">
      <Heading>Account status</Heading>
      <Flex direction="column" gap="sm">
        <Text format={{ fontWeight: "bold" }}>
          Billing: <StatusTag variant="success">Good standing</StatusTag>
        </Text>
        <Text format={{ fontWeight: "bold" }}>
          Outreach: <StatusTag variant="warning">&gt; 2 weeks since last check-in</StatusTag>
        </Text>
        <Text format={{ fontWeight: "bold" }}>
          Support: <StatusTag variant="danger">1 escalated support ticket</StatusTag>
        </Text>
        <Text format={{ fontWeight: "bold" }}>
          Upgrades: <StatusTag>No upgrades</StatusTag>
        </Text>
        <Text format={{ fontWeight: "bold" }}>
          Referrals: <StatusTag variant="info">1 recent referral</StatusTag>
        </Text>
      </Flex>
    </Flex>
  );
};
```

### StatusTag Inline in Tables

Small colored dot -- perfect for inline status next to record names in tables:

```jsx
import { Flex, StatusTag, CrmActionLink } from "@hubspot/ui-extensions";

<Flex direction="row" align="center" gap="xs">
  <StatusTag variant="success" />
  <CrmActionLink actionType="PREVIEW_OBJECT" actionContext={{ objectType: "CONTACT", objectId: recordId }}>
    {recordName}
  </CrmActionLink>
</Flex>
```

### StatusTag Guidelines

- **DO:** Make tag text concise and clear.
- **DO:** Ensure that tag variants are used consistently across the extension.
- **DO:** Always pass the label as `StatusTag` children — never compose a childless `StatusTag` + `Text` in a Flex row. A childless dot and a separate Text sibling will always have awkward spacing regardless of gap value.
- **DON'T:** Use tags in place of buttons or links.
- **DON'T:** Rely on color alone to communicate the tag's meaning. Ensure that tag text is clear and helpful.

```jsx
// ❌ Childless StatusTag + Text in Flex — gap always feels wrong
<Flex direction="row" align="center" gap="xs">
  <StatusTag variant="success" />
  <Text>Active</Text>
</Flex>

// ✅ Label as children — renders as a single inline unit
<StatusTag variant="success">Active</StatusTag>
```

---

## Conditional Tag Coloring

Map data values to tag variants consistently:

```jsx
const statusVariant =
  status === "active" ? "success" :
  status === "pending" ? "info" :
  status === "expiring" ? "warning" :
  status === "closed" ? "error" :
  "default";

// For Tag
<Tag variant={statusVariant}>{status}</Tag>

// For StatusTag (note: StatusTag uses "danger" instead of "error")
const statusTagVariant =
  status === "active" ? "success" :
  status === "pending" ? "info" :
  status === "expiring" ? "warning" :
  status === "closed" ? "danger" :
  "default";

<StatusTag variant={statusTagVariant}>{status}</StatusTag>
```

> **Key difference:** Tag uses `"error"` for red; StatusTag uses `"danger"` for red.

---

## Filter Chips

Removable filter pills using Tag components with onClick/close patterns, grouped with action links. Based on HubSpot's Users & Teams filter bar pattern.

> **DataTable / Kanban / Feed / Calendar render their own active-filter chips** — you don't build these. The library's `ActiveFilterChips` / `CollectionToolbar` primitives are **not available as spec components** (they're controlled JSX wrappers that need callbacks); let the packaged components' built-in toolbars handle chips. The hand-rolled `Tag`-based pattern below is for non-collection filter bars only.

### Filter Chips Pattern

Filter chips sit in a filter bar zone between tabs and table content. Each chip shows the filter name, active count, and a remove action. The bar includes "Clear all" and "+ Add filter" links.

```jsx
import { Flex, Tag, Link, Divider, Text } from "@hubspot/ui-extensions";

const FilterChips = ({ activeFilters, onRemoveFilter, onClearAll, onAddFilter, onAdvancedFilters }) => {
  return (
    <Flex direction="row" align="center" gap="xs" wrap="wrap">
      {activeFilters.map((filter) => (
        <Tag
          key={filter.id}
          variant="default"
          onClick={() => onRemoveFilter(filter.id)}
        >
          {filter.label} ({filter.count})
        </Tag>
      ))}

      {activeFilters.length > 0 && (
        <Link variant="light" onClick={onClearAll}>
          Clear all
        </Link>
      )}

      <Link variant="light" onClick={onAddFilter}>
        + Add quick filter
      </Link>

      <Text format={{ fontWeight: "regular" }}>|</Text>

      <Link variant="light" onClick={onAdvancedFilters}>
        Advanced filters
      </Link>
    </Flex>
  );
};
```

### Filter Chips with StatusTag for Removable Filters

When you need the built-in remove icon, use StatusTag with `showRemoveIcon`:

```jsx
import { Flex, StatusTag, Link } from "@hubspot/ui-extensions";

const RemovableFilterChips = ({ activeFilters, onRemoveFilter, onClearAll, onAddFilter }) => {
  return (
    <Flex direction="row" align="center" gap="xs" wrap="wrap">
      {activeFilters.map((filter) => (
        <StatusTag
          key={filter.id}
          variant="info"
          showRemoveIcon={true}
          onRemoveClick={() => onRemoveFilter(filter.id)}
        >
          {filter.label} ({filter.count})
        </StatusTag>
      ))}

      {activeFilters.length > 0 && (
        <Link variant="light" onClick={onClearAll}>
          Clear all
        </Link>
      )}

      <Link variant="light" onClick={onAddFilter}>
        + Add quick filter
      </Link>
    </Flex>
  );
};
```

### Full Filter Bar Example

```jsx
import { Flex, Tag, Link, Text, Divider } from "@hubspot/ui-extensions";
import { useState } from "react";

const FilterBar = () => {
  const [filters, setFilters] = useState([
    { id: "status", label: "Status", count: 1 },
    { id: "team", label: "Team", count: 3 },
  ]);

  const removeFilter = (filterId) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  const clearAll = () => setFilters([]);

  return (
    <Flex direction="column" gap="sm">
      <Flex direction="row" align="center" gap="xs" wrap="wrap">
        {filters.map((filter) => (
          <Tag key={filter.id} variant="default" onClick={() => removeFilter(filter.id)}>
            {filter.label} ({filter.count})
          </Tag>
        ))}

        {filters.length > 0 && (
          <Link variant="light" onClick={clearAll}>
            Clear all
          </Link>
        )}

        <Link variant="light" onClick={() => console.log("Add filter")}>
          + Add quick filter
        </Link>
      </Flex>

      <Divider />
    </Flex>
  );
};
```

### Filter Chips Guidelines

- **DO:** Show the active filter count in parentheses: `"Status (1)"`.
- **DO:** Include a "Clear all" link when any filters are active.
- **DO:** Place the filter bar between navigation tabs and the data table.
- **DON'T:** Use Tag `onClick` for navigation -- use it only for filter removal.
- **DON'T:** Show more than 5-6 chips before collapsing into a summary.

---

## Pill-Style Count Indicators

Tag components showing counts like "12 standard properties", using variant styling to distinguish zero vs. non-zero states. Based on HubSpot's Data Enrichment Mapping page.

### Count Indicator Pattern

Use `"default"` variant (outline-style, lighter weight) when the count is greater than zero, and `"info"` variant (filled, darker) when the count is zero to draw attention to the empty state.

```jsx
import { Flex, Tag } from "@hubspot/ui-extensions";

const CountIndicator = ({ count, label }) => {
  // Use "default" for non-zero (lighter/outline feel), "info" for zero (filled/emphasized)
  const variant = count > 0 ? "default" : "info";

  return (
    <Tag variant={variant}>
      {count} {label}
    </Tag>
  );
};

const PropertyCountBar = ({ standardCount, customCount }) => {
  return (
    <Flex direction="row" gap="xs" align="center">
      <CountIndicator count={standardCount} label="standard properties" />
      <CountIndicator count={customCount} label="custom properties" />
    </Flex>
  );
};
```

### Full Count Indicators Example

```jsx
import { Flex, Tag, Text } from "@hubspot/ui-extensions";

const DataMappingSummary = ({ mappings }) => {
  const standard = mappings.filter((m) => m.type === "standard").length;
  const custom = mappings.filter((m) => m.type === "custom").length;
  const unmapped = mappings.filter((m) => !m.mapped).length;

  return (
    <Flex direction="row" gap="xs" align="center" wrap="wrap">
      <Tag variant={standard > 0 ? "default" : "info"}>
        {standard} standard properties
      </Tag>
      <Tag variant={custom > 0 ? "default" : "info"}>
        {custom} custom properties
      </Tag>
      <Tag variant={unmapped > 0 ? "warning" : "success"}>
        {unmapped} unmapped
      </Tag>
    </Flex>
  );
};
```

### Attention Count Indicators

When a section header needs a count that signals "needs attention," use `Tag variant="warning"`:

```jsx
<Flex direction="row" align="center" gap="xs">
  <Text format={{ fontWeight: "demibold" }}>Needs attention</Text>
  <Tag variant="warning">{gapCount}</Tag>
</Flex>
```

The yellow draws the eye to the number without implying an error (which red would). Reserve `"error"` for actual problem counts.

| Count intent | Tag variant |
|-------------|-------------|
| Needs attention (gaps, issues) | `"warning"` (yellow) |
| Neutral (total items, records) | `"default"` (grey) |
| Healthy (all passing) | `"success"` (green) |
| Actual error (failures) | `"error"` (red) |

### Count Indicator Guidelines

- **DO:** Use consistent variant logic across all count pills in a group.
- **DO:** Keep label text short -- the number is the focus.
- **DON'T:** Mix Tag and StatusTag in the same count indicator row.
- **DON'T:** Use `"error"` variant just because a count is zero -- reserve it for actual error states.

---

## KPI Summary Strip

A horizontal Flex row of colored number + label segments showing instant counts above a table. Like "55 Active Users | 0 Pending | 15 Deactivated". Based on HubSpot's Users page.

### KPI Summary Strip Pattern

Use StatusTag for colored dot indicators next to counts, separated by pipe characters, all in a single horizontal row.

```jsx
import { Flex, StatusTag, Text } from "@hubspot/ui-extensions";

const KpiSummaryStrip = ({ metrics }) => {
  return (
    <Flex direction="row" align="center" gap="sm" wrap="wrap">
      {metrics.map((metric, index) => (
        <Flex key={metric.label} direction="row" align="center" gap="xs">
          {index > 0 && (
            <Text format={{ fontWeight: "regular" }}>|</Text>
          )}
          <StatusTag variant={metric.variant}>
            {metric.count} {metric.label}
          </StatusTag>
        </Flex>
      ))}
    </Flex>
  );
};
```

### Full KPI Summary Strip Example

```jsx
import { Flex, StatusTag, Text, Divider } from "@hubspot/ui-extensions";

const UsersPageHeader = ({ users }) => {
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const bouncedCount = users.filter((u) => u.status === "bounced").length;
  const deactivatedCount = users.filter((u) => u.status === "deactivated").length;

  const metrics = [
    { count: activeCount, label: "Active Users", variant: "success" },
    { count: pendingCount, label: "Pending Invites", variant: "info" },
    { count: bouncedCount, label: "Bounced Invites", variant: "danger" },
    { count: deactivatedCount, label: "Deactivated Users", variant: "warning" },
  ];

  return (
    <Flex direction="column" gap="sm">
      <Flex direction="row" align="center" gap="sm" wrap="wrap">
        {metrics.map((metric, index) => (
          <Flex key={metric.label} direction="row" align="center" gap="xs">
            {index > 0 && <Text format={{ fontWeight: "regular" }}>|</Text>}
            <StatusTag variant={metric.variant}>
              {metric.count} {metric.label}
            </StatusTag>
          </Flex>
        ))}
      </Flex>
      <Divider />
    </Flex>
  );
};
```

### Alternative: Tag-Based KPI Strip

If you prefer filled colored badges instead of dot indicators, use Tag:

```jsx
import { Flex, Tag, Text, Divider } from "@hubspot/ui-extensions";

const KpiStripWithTags = ({ metrics }) => {
  return (
    <Flex direction="column" gap="sm">
      <Flex direction="row" align="center" gap="sm" wrap="wrap">
        {metrics.map((metric, index) => (
          <Flex key={metric.label} direction="row" align="center" gap="xs">
            {index > 0 && <Text format={{ fontWeight: "regular" }}>|</Text>}
            <Tag variant={metric.variant}>{metric.count}</Tag>
            <Text>{metric.label}</Text>
          </Flex>
        ))}
      </Flex>
      <Divider />
    </Flex>
  );
};

// Usage:
// Note: Tag uses "error" where StatusTag uses "danger"
const metrics = [
  { count: 55, label: "Active Users", variant: "success" },
  { count: 0, label: "Pending Invites", variant: "info" },
  { count: 0, label: "Bounced Invites", variant: "error" },
  { count: 15, label: "Deactivated Users", variant: "warning" },
];
```

### KPI Summary Strip Guidelines

- **DO:** Place the strip directly above the data table it summarizes.
- **DO:** Use a Divider below the strip to visually separate it from table content.
- **DO:** Use consistent variant mapping (e.g., success = active/healthy, warning = attention needed).
- **DON'T:** Show more than 4-5 KPI segments -- it becomes hard to scan.
- **DON'T:** Use the strip for data that changes frequently during a single session -- it can cause visual noise.

---

## Pipe-Separated Access Labels

Plain text pipe-separated labels ("Sales | Contacts | Reports") as a lightweight alternative to individual Tag components. Based on HubSpot's Users table access column.

### When to Use Pipe-Separated Labels vs. Tags

| Criteria | Pipe-Separated Text | Tag Components |
|----------|---------------------|----------------|
| Interactivity | Read-only, no click actions | Clickable, filterable |
| Visual weight | Low -- blends with table text | High -- colored pills draw attention |
| Categories per row | Many (5+) without clutter | Best with 1-3 per row |
| Visual priority | Low priority, supplemental info | High priority, key status |

### Pipe-Separated Labels Pattern

```jsx
import { Text } from "@hubspot/ui-extensions";

const AccessLabels = ({ permissions }) => {
  return (
    <Text format={{ fontWeight: "regular" }}>
      {permissions.join(" | ")}
    </Text>
  );
};

// Usage:
<AccessLabels permissions={["Sales", "Contacts", "Reports"]} />
// Renders: "Sales | Contacts | Reports"
```

### Full Table Row Example

```jsx
import { Flex, Text, StatusTag } from "@hubspot/ui-extensions";

const UserRow = ({ user }) => {
  return (
    <Flex direction="row" align="center" gap="md">
      <Text format={{ fontWeight: "bold" }}>{user.name}</Text>
      <StatusTag variant={user.active ? "success" : "danger"}>
        {user.active ? "Active" : "Deactivated"}
      </StatusTag>
      <Text format={{ fontWeight: "regular" }}>
        {user.accessAreas.join(" | ")}
      </Text>
    </Flex>
  );
};

// Usage:
const user = {
  name: "Jane Smith",
  active: true,
  accessAreas: ["Sales", "Contacts", "Reports", "Dashboards"],
};
```

### Truncation for Long Lists

When a user has many access areas, truncate and show a count:

```jsx
import { Text } from "@hubspot/ui-extensions";

const TruncatedAccessLabels = ({ permissions, maxVisible = 3 }) => {
  if (permissions.length <= maxVisible) {
    return (
      <Text format={{ fontWeight: "regular" }}>
        {permissions.join(" | ")}
      </Text>
    );
  }

  const visible = permissions.slice(0, maxVisible);
  const remaining = permissions.length - maxVisible;

  return (
    <Text format={{ fontWeight: "regular" }}>
      {visible.join(" | ")} | +{remaining} more
    </Text>
  );
};

// Usage:
<TruncatedAccessLabels
  permissions={["Sales", "Contacts", "Reports", "Dashboards", "Workflows", "Settings"]}
  maxVisible={3}
/>
// Renders: "Sales | Contacts | Reports | +3 more"
```

### Pipe-Separated Labels Guidelines

- **DO:** Use a consistent separator: ` | ` (space-pipe-space).
- **DO:** Truncate with a "+N more" suffix when the list exceeds 3-4 items in a table cell.
- **DO:** Use this pattern for read-only, low-priority categorization in dense tables.
- **DON'T:** Mix pipe-separated text with Tag components in the same cell.
- **DON'T:** Use this pattern when users need to click or filter by category -- use Tags instead.
