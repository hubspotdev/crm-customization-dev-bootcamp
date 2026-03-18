# HubSpot CRM Card Frontend Standards

> The goal is to build CRM cards that look and function as closely to native HubSpot as possible. You know you've built it right when users think HubSpot made it.

This document captures hard-won rules, patterns, and gotchas from building CRM cards with `@hubspot/ui-extensions`, cross-referenced against official HubSpot documentation.

---

## Table of Contents

1. [Philosophy & Design Principles](#1-philosophy--design-principles)
2. [Card Structure & Boilerplate](#2-card-structure--boilerplate)
3. [Layout Components](#3-layout-components)
   - [Flex](#31-flex)
   - [AutoGrid](#32-autogrid-responsive-multi-column-layouts)
   - [Box](#33-box)
   - [Inline](#34-inline)
4. [Reusable Component Patterns](#4-reusable-component-patterns)
5. [Typography & Text](#5-typography--text)
6. [Tables](#6-tables)
7. [Panels & Modals (Overlays)](#7-panels--modals-overlays)
8. [Tabs & Accordions](#8-tabs--accordions)
9. [Buttons & Actions](#9-buttons--actions)
10. [Tags & Status Indicators](#10-tags--status-indicators)
11. [Images](#11-images)
12. [Loading, Empty, & Error States](#12-loading-empty--error-states)
13. [CRM Integration Components](#13-crm-integration-components)
14. [Spacing & Divider Patterns](#14-spacing--divider-patterns)
15. [Data Fetching & State Management](#15-data-fetching--state-management)
16. [Tips, Tricks, & Gotchas](#16-tips-tricks--gotchas)

---

## 1. Philosophy & Design Principles

**Native feel above all.** Every design decision should answer: "Would HubSpot build it this way?"

- Use HubSpot's component library exclusively. No HTML elements (the linter enforces this).
- Match HubSpot's information density: compact, scannable, label-value pairs.
- Use `microcopy` variant for data fields — this matches HubSpot's native property display density.
- Use `demibold` font weight for values — matches how HubSpot displays property values.
- Keep cards read-heavy, action-light. Actions live in overlays (Panel/Modal), not inline.
- Prefer Accordions and Tabs over long scrolling cards — let users drill into what they need.

---

## 2. Card Structure & Boilerplate

### Standard Extension Pattern

```jsx
import React, { useState, useEffect } from "react";
import { Flex, LoadingSpinner, hubspot } from "@hubspot/ui-extensions";

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
    actions={actions}
  />
));

const Extension = ({ context, runServerless, sendAlert, fetchProperties, actions }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const props = await fetchProperties(PROPERTIES_LIST);
        setData(props || {});
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Flex align="center" justify="center">
        <LoadingSpinner size="sm" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="sm">
      {/* Card content */}
    </Flex>
  );
};
```

### Rules

1. **Always destructure `actions`** from `hubspot.extend()` — you'll need `closeOverlay`, `addAlert`, `copyTextToClipboard`, `openIframeModal`, etc.
2. **Define properties arrays as constants** outside the component. This prevents re-renders and makes the data contract explicit.
3. **Always guard with `|| {}`** when setting state from fetched data to prevent null reference errors.
4. **Root wrapper is always `Flex direction="column" gap="sm"`** — this is the standard card container.

---

## 3. Layout Components

### 3.1 Flex

Flex is the primary layout primitive. It renders a `div` with `display: flex`.

**Props Reference:**

| Prop | Values | Use Case |
|------|--------|----------|
| `direction` | `"row"` (default), `"column"` | Row for horizontal, column for vertical stacking |
| `justify` | `"start"` (default), `"center"`, `"end"`, `"around"`, `"between"` | Main-axis distribution |
| `align` | `"start"`, `"center"`, `"baseline"`, `"end"`, `"stretch"` (default) | Cross-axis alignment |
| `gap` | `"flush"`, `"xs"` / `"extra-small"`, `"sm"` / `"small"`, `"md"` / `"medium"`, `"lg"` / `"large"`, `"xl"` / `"extra-large"` | Spacing between children |
| `wrap` | `"wrap"`, `"nowrap"` | Line wrapping |

**Standard Gap Hierarchy:**

- **Card root:** `gap="sm"` — standard breathing room between major sections
- **Section internals:** `gap="xs"` — tight spacing for label/value rows within a section
- **Form rows:** `gap="sm"` — between form fields
- **Flush:** `gap="flush"` — for tightly coupled elements (e.g., repeating input rows in forms)

**Common Patterns:**

```jsx
// Card root container
<Flex direction="column" gap="sm">

// Centered loading state
<Flex align="center" justify="center">
  <LoadingSpinner size="sm" />
</Flex>

// Label-value row (space-between)
<Flex direction="row" justify="between">
  <Text variant="microcopy">{label}</Text>
  <Text variant="microcopy" format={{ fontWeight: "demibold" }}>{value}</Text>
</Flex>

// Right-aligned actions
<Flex direction="row" justify="end" gap="xs">
  <Button size="small" variant="secondary">Cancel</Button>
  <Button size="small" variant="primary">Save</Button>
</Flex>

// Split layout (tags left, action right)
<Flex direction="row" justify="between">
  <Flex direction="row" justify="start" gap="xs">
    <Tag variant="default" size="small">{tag1}</Tag>
    <Tag variant="default" size="small">{tag2}</Tag>
  </Flex>
  <Flex direction="row" justify="end" gap="xs">
    <Link overlay={<EditPanel />}>Edit Record</Link>
  </Flex>
</Flex>
```

**Rules:**

1. Child `Flex` components do NOT inherit parent `Flex` props — repeat what you need.
2. `justify="between"` on a label-value row is the standard for property-style display.
3. Nesting `Flex > Flex > Flex` more than 3 levels deep is a code smell — consider extracting into a reusable component.
4. `Flex compact={true}` has undocumented behavior — prefer explicit `gap` props instead.

---

### 3.2 AutoGrid (Responsive Multi-Column Layouts)

**AutoGrid is the go-to component for responsive multi-column layouts.** It automatically arranges children into columns based on available space and the specified `columnWidth`. This is far superior to manual `Flex direction="row"` layouts for anything that needs to be responsive.

**Props Reference:**

| Prop | Type | Description |
|------|------|-------------|
| `columnWidth` | Number | Width of each column in pixels. With `flexible={true}`, acts as minimum width. |
| `flexible` | Boolean | `false` (default): exact column width. `true`: columns expand equally to fill space, `columnWidth` becomes minimum. |
| `gap` | String | Spacing between items: `"flush"`, `"xs"`, `"small"`, `"medium"`, `"large"`, `"extra-large"` |

**Standard Configuration:**

```jsx
// The standard two-column responsive layout
<AutoGrid columnWidth={250} flexible={true} gap="small">
  <Flex direction="column" gap="xs">
    <SummaryRow label="Field 1" value={value1} />
    <SummaryRow label="Field 2" value={value2} />
  </Flex>
  <Flex direction="column" gap="xs">
    <SummaryRow label="Field 3" value={value3} />
    <SummaryRow label="Field 4" value={value4} />
  </Flex>
</AutoGrid>
```

**When to Use AutoGrid vs Flex:**

| Scenario | Use |
|----------|-----|
| Two-column key/value layout that should stack on small screens | `AutoGrid columnWidth={250} flexible={true}` |
| Image gallery grid | `AutoGrid columnWidth={250} gap="small"` (without flexible) |
| Multi-column checklist (3+ columns) | `AutoGrid columnWidth={250} flexible={true} gap="small"` |
| Fixed horizontal bar (tags, buttons) | `Flex direction="row"` |
| Vertical stack of fields | `Flex direction="column"` |

**The `TwoColumnRow` Pattern:**

A recommended reusable wrapper for two-column layouts:

```jsx
const TwoColumnRow = ({ left, right }) => (
  <AutoGrid columnWidth={250} flexible={true} gap="small">
    <Flex direction="column" gap="xs">
      {left}
    </Flex>
    <Flex direction="column" gap="xs">
      {right}
    </Flex>
  </AutoGrid>
);

// Usage:
<TwoColumnRow
  left={<SummaryRow label="Email" value={email} />}
  right={<SummaryRow label="Phone" value={phone} />}
/>
```

**Rules:**

1. **`columnWidth={250}` is the recommended standard** for two-column layouts. At this width, CRM card middle columns (~500-600px) naturally show two columns, and narrow sidebars stack to one.
2. **Always use `flexible={true}`** for data layouts — ensures columns expand to fill available space rather than leaving gaps.
3. **Wrap each column's content in `Flex direction="column" gap="xs"`** — this keeps fields within each column tightly spaced.
4. For image grids, omit `flexible` (use fixed sizing) — images look better at exact dimensions.
5. AutoGrid is responsive by default — no media queries needed. It handles CRM card, home page, and settings page widths automatically.
6. **Three-column grids** work well with `columnWidth={250}` — they collapse gracefully on narrow views.

---

### 3.3 Box

Box is a `div` container for fine-tuning spacing within Flex layouts. Primary use case: **controlling flex ratios**.

```jsx
// 3:1 split layout (content area + sidebar)
<Flex direction="row" gap="sm" align="start">
  <Box flex={3}>
    {/* Main content */}
  </Box>
  <Box flex={1}>
    {/* Sidebar / info tile */}
  </Box>
</Flex>

// Form layout with label + two inputs (1:2:2 ratio)
<Flex direction="row" gap="sm" align="end">
  <Box flex={1}>
    <Text variant="microcopy" format={{ fontWeight: "demibold" }}>Monday</Text>
  </Box>
  <Box flex={2}>
    <Input label="Start" name="start" value={startTime} />
  </Box>
  <Box flex={2}>
    <Input label="End" name="end" value={endTime} />
  </Box>
</Flex>
```

**Rules:**

1. Only use Box inside Flex — it does nothing standalone.
2. `flex={1}` means "take all remaining space" when only one Box has a flex value.
3. Use numeric ratios for proportional layouts (e.g., `flex={1}` + `flex={3}` = 25%/75% split).
4. `alignSelf` on Box overrides parent Flex's `align` for that one child.

---

### 3.4 Inline

Inline arranges children in a horizontal row. Key difference from `Flex direction="row"`: **Inline does NOT break `justify="between"` when used as a child in flex containers.**

```jsx
// Use Inline to group children without breaking justify="between"
<Flex direction="row" justify="between">
  <Button>Left Action</Button>
  <Inline gap="small">
    <Text>Status: Active</Text>
    <Button>Right Action</Button>
  </Inline>
</Flex>
```

**When to use Inline vs Flex row:**

- **Inline**: Grouping children inside a `justify="between"` parent (Flex would collapse/break the spacing)
- **Flex row**: All other horizontal layouts where you control the full container

---

## 4. Reusable Component Patterns

Build a shared component library for your project. Extract these patterns to avoid duplicate definitions and ensure consistent styling across all CRM cards.

### SummaryRow — Label/Value Display

The standard "property display" component. Mimics how HubSpot shows native CRM properties.

```jsx
const SummaryRow = ({ label, value }) => (
  <Flex direction="row" justify="between">
    <Text variant="microcopy">{label}</Text>
    <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
      {value || "-"}
    </Text>
  </Flex>
);
```

**Rules:**
- Always fall back to `"-"` for empty values — never show blank space or "null".
- Label is regular weight, value is `demibold` — this matches HubSpot's native property display.
- Both use `microcopy` variant for compact density.

### LinkRow — Label/Link Display

```jsx
const LinkRow = ({ label, href, text }) => (
  <Flex direction="row" justify="between">
    <Text variant="microcopy">{label}</Text>
    {href && href !== "-" ? (
      <Link href={href}>{text || href}</Link>
    ) : (
      <Text variant="microcopy">-</Text>
    )}
  </Flex>
);
```

**Rules:**
- Guard against `href === "-"` — some fields store dashes as "no value".
- Display the link text if provided, otherwise show the raw URL.

### TwoColumnRow — Responsive Two-Column Layout

```jsx
const TwoColumnRow = ({ left, right }) => (
  <AutoGrid columnWidth={250} flexible={true} gap="small">
    <Flex direction="column" gap="xs">{left}</Flex>
    <Flex direction="column" gap="xs">{right}</Flex>
  </AutoGrid>
);
```

### Section — Accordion Wrapper with Optional Tooltip

```jsx
const Section = ({ title, children, defaultOpen = true, info }) => {
  const accordion = (
    <Accordion title={title} defaultOpen={defaultOpen} size="sm">
      <Flex direction="column" gap="xs">{children}</Flex>
    </Accordion>
  );
  if (!info) return accordion;
  return (
    <Flex direction="row" align="start" gap="flush">
      <Box flex={1}>{accordion}</Box>
      <Link overlay={<Tooltip>{info}</Tooltip>}>
        <Icon name="info" size="sm" screenReaderText={info} />
      </Link>
    </Flex>
  );
};
```

**Rules:**
- Pass `info` string for contextual help — renders an (i) icon with tooltip beside the section header.
- `defaultOpen={true}` is the recommended default — users shouldn't have to click to see data.
- `size="sm"` is the standard accordion size for cards.

### SectionBreak — Visual Section Separator

```jsx
const SectionBreak = () => (
  <>
    <Divider />
    <Text variant="microcopy">{" "}</Text>
  </>
);
```

**Why the empty `<Text>` spacer?** HubSpot's renderer doesn't provide enough vertical spacing with `<Divider />` alone. The empty `<Text variant="microcopy">{" "}</Text>` adds a small visual buffer that matches native HubSpot section spacing. This is a known workaround.

### BoolItem — Read-Only Checkbox Display

```jsx
const BoolItem = ({ label, enabled }) => (
  <Text variant="microcopy" format={{ fontWeight: "demibold" }}>
    {`${enabled ? "[x]" : "[ ]"} ${label}`}
  </Text>
);
```

**Note:** HubSpot UI extensions don't have a read-only checkbox component, so text-based `[x]` / `[ ]` notation is a practical workaround.

### InfoTooltip — Contextual Help Icon

```jsx
const InfoTooltip = ({ text, placement = "top" }) => (
  <Link overlay={<Tooltip placement={placement}>{text}</Tooltip>}>
    <Icon name="info" size="sm" screenReaderText={text} />
  </Link>
);
```

**Usage:** Place at the top of a card or beside a section header to explain what the card/section shows.

---

## 5. Typography & Text

### Text Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| `"microcopy"` | **Default for card data.** Labels, values, field displays. Compact density. | `<Text variant="microcopy">Label</Text>` |
| `"bodytext"` | Longer field labels, slightly larger than microcopy. | `<Text variant="bodytext" inline={true}>Origin: <Text inline={true} format={{ fontWeight: "demibold" }}>{value}</Text></Text>` |
| (default) | General text, descriptions, panel body text. | `<Text>Description here</Text>` |

### Format Props

| Format Prop | Value | Use Case |
|-------------|-------|----------|
| `fontWeight` | `"demibold"` | **Standard for data values.** Matches HubSpot's property value display. |
| `fontWeight` | `"bold"` | Section labels, emphasizing important info. Use sparingly. |
| `italic` | `true` / `false` | Rarely used. |

### Inline Text Pattern

The `inline={true}` prop is essential for label-value pairs on a single line:

```jsx
// Standard inline label-value
<Text>
  Location: <Text inline={true} format={{ fontWeight: "demibold" }}>{locationName}</Text>
</Text>

// With icon
<Text format={{ fontWeight: "demibold" }} inline={true}>
  {contactName}{" "}
</Text>
```

**Rules:**

1. **Use `inline={true}` (boolean), not `inline="true"` (string).** Both work, but boolean is correct.
2. When mixing inline Text components, add `{" "}` between them for spacing — HubSpot's renderer strips whitespace between sibling components.
3. `variant="microcopy"` with `format={{ fontWeight: "demibold" }}` is the standard data-value style.

### Non-Breaking Spaces

Use `{"\u00A0"}` (non-breaking space) to prevent awkward line breaks in status labels:

```jsx
<Text inline={true} format={{ fontWeight: "demibold" }}>
  {statusLabel.replace(/\s/g, "\u00A0")}:{" "}
</Text>
```

---

## 6. Tables

### Props Reference

**`<Table>` props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bordered` | Boolean | `true` | Show table borders |
| `flush` | Boolean | `false` | Remove bottom margin |
| `paginated` | Boolean | `false` | Enable pagination nav |
| `striped` | Boolean | `false` | Alternate row shading |

**Pagination props (when `paginated={true}`):**

| Prop | Type | Description |
|------|------|-------------|
| `page` | Number | Current page number |
| `pageCount` | Number | Total pages |
| `onPageChange` | `(page: number) => void` | Page change handler |
| `showFirstLastButtons` | Boolean | Show First/Last buttons (default `false`) |
| `showButtonLabels` | Boolean | Show text labels on nav buttons (default `true`) |
| `maxVisiblePageButtons` | Number | Max page buttons to display |

### Column Width Rules

**`<TableHeader>` and `<TableCell>` `width` prop:**

| Value | Behavior |
|-------|----------|
| `"min"` | Shrinks to content width. Overflows with horizontal scrollbar if content exceeds table width. **Best for: fixed-width columns like dates, status, checkboxes.** |
| `"max"` | Expands to fill maximum available width. **Best for: columns that should take up remaining space.** |
| `"auto"` | Adjusts based on available space without overflow. **Best for: flexible content columns like names, emails.** |
| Number | Fixed pixel width. |

**Recommended Configurations:**

```jsx
// Log/history table
<TableHeader width="min">Date</TableHeader>          // Fixed: dates are predictable width
<TableHeader width="auto">Email</TableHeader>          // Flexible: emails vary in length
<TableHeader width="auto">Description</TableHeader>    // Flexible
<TableHeader width="min">Status</TableHeader>          // Fixed: short status labels
<TableHeader width="min">Source</TableHeader>           // Fixed: short source labels

// Bulk action table with checkbox + sorting
<TableHeader width="min">
  <Checkbox name="select_all" checked={allSelected} onChange={toggleSelectAll} />
</TableHeader>
<TableHeader width="min" sortDirection={sortState.name} onSortChange={...}>
  Name
</TableHeader>
<TableHeader width="auto" sortDirection={sortState.email} onSortChange={...}>
  Email
</TableHeader>
```

**Rules:**

1. **Always set `width` on `TableHeader`** — if you omit it, columns auto-size unpredictably.
2. **Match `TableCell` width to `TableHeader` width** for the same column — mismatches cause layout jitter.
3. **Use `width="min"` for:** dates, statuses, actions, checkboxes, short labels.
4. **Use `width="auto"` for:** names, emails, descriptions — anything with variable length.
5. **Use `width="max"` sparingly** — only when one column should dominate remaining space.
6. Set `bordered={true}` and `flush={true}` as the standard — matches HubSpot's native tables.
7. Only enable `paginated` when data can realistically exceed your page size (10 rows is a good default).

### Sortable Tables

```jsx
const DEFAULT_SORT = {
  name: "descending",    // Default sort column and direction
  email: "none",
  phone: "none",
};

const [sortState, setSortState] = useState({ ...DEFAULT_SORT });

const handleSort = (field, direction) => {
  setSortState({ ...DEFAULT_SORT, [field]: direction });
};

// In TableHeader:
<TableHeader
  sortDirection={sortState.name}
  onSortChange={(dir) => handleSort("name", dir)}
>
  Name
</TableHeader>
```

**Rules:**

1. Reset all sort states to `"none"` when changing sort column — only one column sorts at a time.
2. Store table data in state and sort in `useMemo` — never mutate the source array.
3. Combine sorting with filtering for best UX. Reset page to 1 when sort/filter changes.

### Table Row Actions

```jsx
// StatusTag inside a table cell for visual status
<TableCell width="auto">
  <Flex direction="row" align="center" gap="xs">
    <StatusTag variant={statusVariant}></StatusTag>
    <CrmActionLink actionType="PREVIEW_OBJECT" actionContext={{...}}>
      {displayName}
    </CrmActionLink>
  </Flex>
</TableCell>

// Link actions in cells
<TableCell width="min">
  {record.email ? <Link href={"mailto:" + record.email}>{record.email}</Link> : "\u2014"}
</TableCell>
```

**Rules:**

1. Use `xs` button size and `secondary` variant for in-row buttons (per HubSpot design patterns).
2. Right-align action columns.
3. Use em-dash (`"\u2014"` or `"---"`) for empty table cells — it's visually cleaner than `-` in table context.

---

## 7. Panels & Modals (Overlays)

### When to Use Panel vs Modal

| Feature | Panel | Modal |
|---------|-------|-------|
| Opens from | Right side of page | Center overlay |
| Width options | `"small"`, `"medium"`, `"large"` | `"medium"` (default), `"large"` |
| Use when | Editing properties, long forms, multi-step flows | Confirmations, short forms, action prompts |
| Can open from Panel? | N/A | Yes |
| Can open from Modal? | No | N/A |
| Only one open at a time? | Yes | N/A (Modal can overlay Panel) |

### Panel Structure

```jsx
<Panel id="unique-panel-id" title="Panel Title" width="small" variant="modal">
  <PanelBody>
    <PanelSection>
      {/* Content with automatic padding and spacing */}
    </PanelSection>
    <PanelSection>
      {/* Another section — gets bottom margin between sections */}
    </PanelSection>
  </PanelBody>
  <PanelFooter>
    {/* Sticky footer — buttons go here */}
  </PanelFooter>
</Panel>
```

**Rules:**

1. **Panel must be a top-level component** — cannot be inside Flex, Box, or other wrappers.
2. **One `PanelBody` per Panel.** One `PanelFooter` per Panel.
3. Use `variant="modal"` for better accessibility — blurs background and traps focus.
4. **Always give Panel a unique `id`** — needed for `actions.closeOverlay(id)`.

### Modal Structure

```jsx
<Modal id="unique-modal-id" title="Modal Title" width="large">
  <ModalBody>
    <Flex direction="column" gap="sm">
      {/* Modal content */}
    </Flex>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => actions.closeOverlay(modalId)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>
```

### PanelFooter Layout Rules

**PanelFooter is a flex container that left-aligns children. You cannot override its justify behavior directly.**

1. `PanelFooter` is a flex container that left-aligns children — you cannot override its justify behavior directly.
2. `Flex direction="column"` inside PanelFooter gets full width — this is the key hack for layout control.
3. `Flex direction="row"` inside PanelFooter does NOT get full width (shrinks to content).
4. Inside a column-then-row chain, `justify="end"` works with flat children.
5. `justify="between"` works with flat children but breaks when children are wrapped in nested Flex components.
6. `Inline` does NOT break `justify="between"` — use it instead of Flex when grouping children inside a between-justified row.
7. Empty Flex components collapse in HubSpot's renderer — they can't serve as placeholders for `justify="between"`.

**The Winning PanelFooter Pattern:**

```
PanelFooter
  +-- Flex (column)                  <-- full-width hack
        +-- Step 1: Flex (row, justify="end")
        |     Text + Button (flat children)
        +-- Step 2+: Flex (row, justify="between")
              Button (flat) + Inline (groups Text + Button)
```

**Implementation:**

```jsx
<PanelFooter>
  <Flex direction="column">
    <Flex direction="row" justify="end" gap="sm">
      <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </Flex>
  </Flex>
</PanelFooter>
```

**ModalFooter is simpler** — it accepts flat children and handles alignment internally:

```jsx
<ModalFooter>
  <Button variant="secondary" onClick={() => actions.closeOverlay(id)}>Cancel</Button>
  <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
</ModalFooter>
```

### Overlay Triggers

Panels and Modals are triggered via the `overlay` prop on these components:

- `Button`
- `Link`
- `Tag`
- `Image`
- `LoadingButton`

```jsx
// Button overlay (most common)
<Button variant="primary" overlay={<Modal id="confirm-modal" ...>...</Modal>}>
  Open Modal
</Button>

// Link overlay (for inline triggers)
<Link overlay={<Panel id="edit-panel" ...>...</Panel>}>
  Edit Record
</Link>

// Tag overlay (for contextual help)
<Link overlay={<Panel id="help-panel" ...>...</Panel>}>
  <Tag variant="warning">Need help? Click here.</Tag>
</Link>
```

### Closing Overlays

```jsx
// Programmatic close
actions.closeOverlay("panel-id");

// Close button in PanelFooter
<Button variant="secondary" onClick={() => actions.closeOverlay("panel-id")}>
  Close
</Button>
```

---

## 8. Tabs & Accordions

### Tabs

Use Tabs to organize dense cards with multiple logical sections.

```jsx
const [activeTab, setActiveTab] = useState("general");

<Tabs selected={activeTab} onSelectedChange={setActiveTab}>
  <Tab tabId="general" title="General">
    <Flex direction="column" gap="xs">
      {/* Tab content */}
    </Flex>
  </Tab>
  <Tab tabId="details" title="Details">
    {/* ... */}
  </Tab>
</Tabs>
```

**Rules:**

1. Wrap tab content in `Flex direction="column" gap="xs"` for consistent internal spacing.
2. Keep tab titles short (1-2 words).
3. First tab should be the most commonly accessed data.
4. Use Tabs inside a `Tile compact={true}` for the native HubSpot tabbed-card look.

### Accordions

Use Accordions for collapsible sections within a card or tab.

```jsx
<Accordion title="Additional Details" defaultOpen={false} size="sm">
  <Flex direction="column" gap="xs">
    {/* Accordion content */}
  </Flex>
</Accordion>
```

**Rules:**

1. **`size="sm"` is the recommended standard** — matches HubSpot's native accordion density.
2. **`defaultOpen={true}`** for primary data sections — users shouldn't have to click to see important info.
3. **`defaultOpen={false}`** for secondary/supplemental data (hours, social links, images).
4. Wrap accordion content in `Flex direction="column" gap="xs"`.
5. The `Section` reusable component (see [Section 4](#4-reusable-component-patterns)) wraps Accordion with standard gap and optional tooltip — prefer it over raw Accordion.

---

## 9. Buttons & Actions

### Button Variants & Sizes

| Variant | Use Case |
|---------|----------|
| `"primary"` | Main action per surface. **Only ONE primary per card/panel/modal.** |
| `"secondary"` | Cancel, close, alternative actions |
| `"destructive"` | Delete, remove. **Never pair with primary** — only with secondary. |

| Size | Use Case |
|------|----------|
| (default) | Panel/Modal actions |
| `"small"` / `"sm"` | Card-level actions, below-card actions |
| `"extra-small"` / `"xs"` | In-table row actions |

### ButtonRow (with Dropdown)

For multi-action patterns with a dropdown overflow:

```jsx
<ButtonRow dropDownButtonOptions={{ text: "More Actions" }} disableDropdown={false}>
  <Button size="small" variant="primary" overlay={<ConfirmModal />}>
    Submit
  </Button>
  <Button size="small" variant="secondary" overlay={<EditPanel />}>
    Edit
  </Button>
  <Button size="small" variant="secondary" disabled={!canPerformAction}>
    Other Action
  </Button>
</ButtonRow>
```

**Rules:**

1. **Max 3 buttons in a ButtonRow** (per HubSpot design patterns).
2. **Max 2 secondary buttons** per extension.
3. Primary button should be the leftmost (first child).
4. Use `disabled` prop for conditionally unavailable actions — don't hide them.

### Button Alignment Conventions

| Context | Alignment |
|---------|-----------|
| Card footer | Right-aligned (`Flex justify="end"`) |
| Panel footer | Left-aligned (HubSpot default) or right-aligned via column hack |
| Modal footer | Flat children (HubSpot handles alignment — secondary then primary) |
| Below card actions | Right-aligned (`Flex justify="end"`) |

---

## 10. Tags & Status Indicators

### Tag Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| `"default"` | Neutral labels, categories | Service type, category label |
| `"success"` | Active, current, positive status | Active account, recent activity |
| `"warning"` | Attention needed, pending | Help prompt, SLA approaching |
| `"danger"` | Overdue, closed, negative | Overdue ticket, closed record |
| `"primary"` | Category labels | Request category, type label |

### StatusTag (Colored Dot Indicator)

`StatusTag` renders a small colored dot — perfect for inline status in tables or lists:

```jsx
<StatusTag variant={statusVariant}></StatusTag>  // Empty — just shows the dot
```

**Common pattern:** Combine StatusTag with CrmActionLink for record links with status:

```jsx
<Flex direction="row" align="center" gap="xs">
  <StatusTag variant="success"></StatusTag>
  <CrmActionLink actionType="PREVIEW_OBJECT" actionContext={{...}}>
    {recordName}
  </CrmActionLink>
</Flex>
```

### Conditional Tag Coloring

```jsx
// Dynamic variant based on data
const statusVariant =
  status === "active" ? "success" :
  status === "pending" ? "info" :
  status === "closed" ? "danger" :
  "default";

// Time-based age coloring
const ageInMinutes = Math.floor((Date.now() - createdDate) / (1000 * 60));
const ageTag = ageInMinutes < 60
  ? <Tag variant="success">{ageInMinutes} mins</Tag>
  : ageInMinutes < 4320
    ? <Tag variant="success">&lt; 3 days</Tag>
    : ageInMinutes > 14400
      ? <Tag variant="danger">&gt; 10 days</Tag>
      : <Tag variant="warning">{Math.floor(ageInMinutes / 1440)}d</Tag>;
```

---

## 11. Images

### Image Component

```jsx
<Image
  src={imageUrl}
  alt="Description of image"
  width={800}
  responsive={true}        // Scales to container width
  onClick={handleClick}     // Images can be clickable
/>

// Gallery image (fixed size)
<Image
  src={src}
  alt={`Gallery image ${idx + 1}`}
  width={250}
  height={250}
/>
```

**Rules:**

1. **Always provide `alt` text** — HubSpot's accessibility requirements.
2. **Use `responsive={true}`** for hero/banner images — they'll scale to container width.
3. **Use fixed `width` + `height`** for gallery thumbnails.
4. Images can trigger overlays via `onClick` or by being wrapped in a component with an `overlay` prop.
5. Only use external URLs that serve over HTTPS — HubSpot blocks HTTP image sources.
6. For gallery grids, use `AutoGrid columnWidth={250}` — not Flex rows.

### Gallery Pattern with "View More"

```jsx
<AutoGrid columnWidth={250} gap="small">
  {images.slice(0, 5).map((src, idx) => (
    <Image key={`gallery-${idx}`} src={src} alt={`Image ${idx + 1}`} width={250} height={250} />
  ))}
  {images.length > 5 && (
    <Flex direction="column" justify="center" align="center" gap="xs">
      <Text variant="microcopy">More</Text>
      <Link href={viewAllUrl}>View all images</Link>
    </Flex>
  )}
</AutoGrid>
```

---

## 12. Loading, Empty, & Error States

### Loading State (Standard)

```jsx
// Centered spinner — use at top of card while data loads
if (loading) {
  return (
    <Flex align="center" justify="center">
      <LoadingSpinner size="sm" />
    </Flex>
  );
}
```

**Rules:**

1. **`size="sm"` is the standard for card loading states.** Cards are compact — large spinners look wrong.
2. **`size="md"` for panel/modal loading states** — more space available.
3. Always use `Flex align="center" justify="center"` wrapper — spinner should be centered.
4. For `LoadingSpinner` with layout, use the `layout="centered"` prop and optional `label`:

```jsx
<LoadingSpinner layout="centered" label="Loading data..." />
```

### Empty State

```jsx
import { EmptyState } from "@hubspot/ui-extensions";

{data.length === 0 ? (
  <EmptyState title="No records found">
    <Text>No matching records have been created yet.</Text>
  </EmptyState>
) : (
  /* render data */
)}
```

### Error State

```jsx
// Inline error — shown at bottom of card
{error && (
  <Alert title="Error" variant="error">
    {error}
  </Alert>
)}

// Contextual info alert
<Alert title="New Record" variant="info">
  This record does not exist yet. Saving will create a new one.
</Alert>

// Status alert (top of card)
<Alert variant="success">
  <Text>
    <Text inline={true} format={{ fontWeight: "demibold" }}>Active: </Text>
    <Text inline={true}>Account is active and fully configured.</Text>
  </Text>
</Alert>
```

### Alert Variants

| Variant | Use Case |
|---------|----------|
| `"error"` | Error messages, failures |
| `"warning"` | Not provisioned, action needed |
| `"info"` | Informational: pending state, contextual tips |
| `"success"` | Active status, action completed |

---

## 13. CRM Integration Components

These components are imported from `@hubspot/ui-extensions/crm` (not `@hubspot/ui-extensions`).

### CrmPropertyList

Renders editable HubSpot properties with native styling. Use inside Panels for property editing.

```jsx
import { CrmPropertyList } from "@hubspot/ui-extensions/crm";

<CrmPropertyList
  properties={["email", "phone", "company"]}
  direction="row"       // "row" or "column"
/>

// With object type context
<CrmPropertyList
  objectTypeId="0-3"    // 0-3 = Deals
  objectId={recordId}
  properties={propertyList}
/>
```

### CrmStageTracker

Renders the native deal/ticket pipeline stage tracker.

```jsx
import { CrmStageTracker } from "@hubspot/ui-extensions/crm";

// Deal stage tracker
<CrmStageTracker
  objectId={dealId}
  objectTypeId="0-3"         // 0-3 = Deals
  properties={[""]}          // Pass empty string array if no extra properties
/>

// Ticket stage tracker (no object ID needed — uses current record)
<CrmStageTracker
  objectTypeId="0-5"         // 0-5 = Tickets
  showProperties={false}
/>
```

### CrmActionLink

Create links that trigger native HubSpot CRM actions:

```jsx
import { CrmActionLink } from "@hubspot/ui-extensions/crm";

// Preview a record (opens sidebar preview)
<CrmActionLink
  actionType="PREVIEW_OBJECT"
  actionContext={{
    objectTypeId: "0-1",         // 0-1 = Contacts
    objectId: contact.hs_object_id,
  }}
>
  <Text format={{ fontWeight: "demibold" }} inline={true}>
    {contact.firstname} {contact.lastname}
  </Text>
</CrmActionLink>

// Open record in new tab
<CrmActionLink
  actionType="RECORD_APP_LINK"
  actionContext={{
    objectTypeId: "0-3",
    objectId: record.hs_object_id,
    external: true,
    includeEschref: true,
  }}
>
  {record.name}
</CrmActionLink>

// Send email
<CrmActionLink
  actionType="SEND_EMAIL"
  actionContext={{
    objectTypeId: "0-1",
    objectId: contact.hs_object_id,
  }}
>
  {contact.email}
</CrmActionLink>

// Schedule meeting
<CrmActionLink
  actionType="SCHEDULE_MEETING"
  actionContext={{
    objectTypeId: "0-3",
    objectId: record.hs_object_id,
  }}
>
  Schedule Now <Icon name="date" />
</CrmActionLink>

// Add association
<CrmActionLink
  actionType="OPEN_RECORD_ASSOCIATION_FORM"
  actionContext={{
    objectTypeId: "2-XXXXXXX",    // Target custom object type ID
    association: {
      objectTypeId: "0-3",        // Source object type
      objectId: record.hs_object_id,
    },
  }}
>
  + Add Association
</CrmActionLink>
```

### Common Object Type IDs

| Object | ID |
|--------|----|
| Contacts | `"0-1"` |
| Companies | `"0-2"` |
| Deals | `"0-3"` |
| Tickets | `"0-5"` |
| Custom Objects | `"2-XXXXXXX"` (check your portal's settings) |

---

## 14. Spacing & Divider Patterns

### Spacing Hierarchy

| Context | Gap | Rationale |
|---------|-----|-----------|
| Card root | `"sm"` | Between major sections |
| Inside sections | `"xs"` | Between label/value rows |
| Between form fields | `"sm"` | Comfortable form spacing |
| Inside tables | N/A | Table handles row spacing |
| Flush (no gap) | `"flush"` | Tightly coupled elements |

### Vertical Spacers (Workarounds)

HubSpot's renderer sometimes needs manual spacing. Known workarounds:

```jsx
// Empty text spacer (used in SectionBreak pattern)
<Text variant="microcopy">{" "}</Text>

// Non-breaking space spacer
<Text variant="microcopy" inline={true}>&nbsp;</Text>

// Empty Flex spacer
<Flex direction="column">
  <Text>&nbsp;</Text>
</Flex>
```

**Rule:** Prefer the `SectionBreak` pattern (see [Section 4](#4-reusable-component-patterns)) over manual spacers. If you need custom spacing beyond what gap provides, use the `<Text variant="microcopy">{" "}</Text>` pattern — it renders the smallest possible spacer.

### Divider

```jsx
import { Divider } from "@hubspot/ui-extensions";

<Divider />  // Horizontal rule — use between major content blocks
```

**Rules:**

1. Divider alone often has insufficient vertical margin — pair with the SectionBreak pattern for visual separation.
2. Use Divider inside Panels between `CrmPropertyList` groups.
3. Don't stack multiple Dividers — one is enough.

---

## 15. Data Fetching & State Management

### Property Fetching

```jsx
// Define properties as a constant outside the component
const UI_PROPERTIES = [
  "firstname",
  "lastname",
  "email",
  // ... always list explicitly
];

// Fetch in useEffect
useEffect(() => {
  const load = async () => {
    try {
      const props = await fetchProperties(UI_PROPERTIES);
      setProps(props || {});
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);
```

### Serverless Function Calls

```jsx
const { response } = await runServerless({
  name: "functionName",
  parameters: { objectId: context.crm.objectId },
});
```

### Property Change Listener

```jsx
// Listen for any CRM property change on the current record
onCrmPropertiesUpdate("*", (properties) => {
  debouncedRefreshData();
});
```

**Rule:** Always debounce the refresh callback — property updates can fire rapidly:

```jsx
import { debounce } from "lodash";
const debouncedRefresh = debounce(refreshData, 50);
```

### Clipboard Actions

```jsx
<Link
  size="extra-small"
  onClick={() => {
    actions.copyTextToClipboard(value);
    actions.addAlert({ message: "Copied to clipboard", type: "success" });
  }}
>
  <Icon name="copy" size="sm" />
</Link>
```

### Boolean Property Handling

HubSpot boolean properties come in many formats. Always normalize:

```jsx
const isEnabled =
  prop === true ||
  prop === "true" ||
  prop === "Yes" ||
  prop === "yes";
```

---

## 16. Tips, Tricks, & Gotchas

### Layout Gotchas

1. **Empty Flex components collapse** — they can't serve as spaceholders for `justify="between"`. Use `Inline` or `<Text>{" "}</Text>` instead.

2. **PanelFooter left-aligns by default** — you cannot directly set `justify` on it. Use the `Flex direction="column"` hack for full-width control (see [Section 7](#panelfooter-layout-rules)).

3. **Child Flex does NOT inherit parent Flex props** — always re-specify `direction`, `gap`, etc. on nested Flex components.

4. **AutoGrid `columnWidth={250}` + `flexible={true}`** is the magic combo — responsive two-column layouts that work in every card context.

5. **`width="100%"` on Flex does nothing useful** — HubSpot's renderer doesn't support arbitrary CSS. Use `Box flex={1}` inside a parent Flex to fill available space.

### Component Gotchas

6. **`<Panel>` must be top-level** — cannot be nested inside Flex, Box, or any other component. Always pass it as an `overlay` prop value.

7. **Only one Panel open at a time** — opening a second Panel closes the first. Modals can overlay Panels, but not vice versa.

8. **`<Divider />` has minimal vertical margin** — pair with `<Text variant="microcopy">{" "}</Text>` for visible section breaks.

9. **`Accordion` with `defaultOpen` is a render-time prop** — changing it after mount has no effect. Use controlled state if you need dynamic open/close.

10. **`Tooltip` must be wrapped in `Link overlay={...}`** — you can't use Tooltip standalone.

### Data Gotchas

11. **Always fallback to `"-"` for empty values** — never show `null`, `undefined`, or empty string. Users expect a dash for "no data" (matches HubSpot convention).

12. **Boolean CRM properties are inconsistent** — they can be `true`, `"true"`, `"Yes"`, `"yes"`, or `undefined`. Always check all variants.

13. **Rich text CRM properties contain HTML** — strip tags before displaying in Text components. Build a `formatRichTextToPlainText()` utility that replaces `<br>`, `<p>`, `<li>` with newlines and strips remaining tags.

14. **Date formatting should use `Intl.DateTimeFormat`** — avoid external date libraries when possible. Standard format: `{ month: "short", day: "numeric", year: "numeric" }`.

15. **Social URL parsing** — build a `parseSocialHandle()` utility to extract display handles from URLs (e.g., `https://instagram.com/username` -> `@username`).

### Performance

16. **Debounce `onCrmPropertiesUpdate` callbacks** — they fire rapidly. Use `lodash.debounce` with 50ms delay.

17. **Define property arrays as module-level constants** — not inside components. Prevents unnecessary re-renders.

18. **Use `useMemo` for filtered/sorted data** — especially for table data that depends on search/sort state.

### Design Conventions

19. **Copy-to-clipboard pattern:** Small copy icon next to emails/phones with `actions.copyTextToClipboard()` + success alert. This is a standard UX pattern users expect.

20. **Phone formatting:** Strip country code prefix, then format consistently:
```jsx
phone.replace("+1", "").replace(/(\d{3})(\d{3})(\d{4})/, "+1 ($1) $2-$3")
```

21. **Description truncation:** Limit long text to a reasonable character count with ellipsis:
```jsx
const short = description.length > 200
  ? `${description.slice(0, 200).trimEnd()}...`
  : description;
```

22. **"Need help?" footer pattern:** Use a `Tag variant="warning"` wrapping a `Link` that opens a Panel with searchable help content. Reusable across all cards.

23. **Edit links in card headers:** Place edit links in the top-right of the card using `Flex direction="row" justify="between"` with tags/labels on the left and the edit link on the right.

---

## Quick Reference: Import Cheat Sheet

```jsx
// Standard components
import {
  Accordion, Alert, AutoGrid, Box, Button, ButtonRow,
  Checkbox, Divider, EmptyState, Flex, Form,
  Heading, Icon, Image, Inline, Input, Link, List,
  LoadingButton, LoadingSpinner,
  Modal, ModalBody, ModalFooter,
  MultiSelect, Panel, PanelBody, PanelFooter, PanelSection,
  SearchInput, Select, StatusTag, Tab, Table, TableBody,
  TableCell, TableFooter, TableHead, TableHeader, TableRow,
  Tabs, Tag, Text, TextArea, Tile, Tooltip,
  hubspot,
} from "@hubspot/ui-extensions";

// CRM data components (separate import!)
import {
  CrmActionLink,
  CrmActionButton,
  CrmCardActions,
  CrmPropertyList,
  CrmStageTracker,
} from "@hubspot/ui-extensions/crm";
```

---

## Quick Reference: Standard Prop Values

| Component | Standard Props |
|-----------|---------------|
| Card root Flex | `direction="column" gap="sm"` |
| Section Flex | `direction="column" gap="xs"` |
| Loading Flex | `align="center" justify="center"` |
| SummaryRow Text (label) | `variant="microcopy"` |
| SummaryRow Text (value) | `variant="microcopy" format={{ fontWeight: "demibold" }}` |
| AutoGrid (two-col) | `columnWidth={250} flexible={true} gap="small"` |
| Accordion (section) | `defaultOpen={true} size="sm"` |
| Table (data) | `bordered={true} flush={true}` |
| TableHeader (fixed) | `width="min"` |
| TableHeader (flexible) | `width="auto"` |
| Tile (card wrapper) | `compact={true}` |
| Panel (edit form) | `width="small" variant="modal"` |
| Modal (confirmation) | `width="large"` for forms, default for confirms |
| Button (card action) | `size="small"` |
| Button (table action) | `size="extra-small" variant="secondary"` |
| LoadingSpinner (card) | `size="sm"` |
| Tag (status) | `size="small"` |
