---
id: gotchas
scope: [utilities, phone-formatting, date-formatting, html-stripping, spacing, dividers, panel-footer-workaround, icon-names, performance]
depends-on: [overlays, media]
critical-rules: 6
archetypes: [all]
---

# Tips, Tricks, & Gotchas

> Hard-won patterns, utility functions, and common mistakes. Read this before debugging for an hour.

Platform constraints are in [STANDARDS.md](../STANDARDS.md). This file covers practical patterns and gotchas that come up during implementation.

---

## Studio JSON Spec Gotchas

### `$` references vs currency literals

> **Symptoms this section addresses:** "values are blank", "stats not showing values", "numbers missing", "half the stats aren't rendering", anything where the user thinks "I think it's the inline `$`". If a user reports any of these, read this section before patching.

In Studio specs, strings that look like `$identifier.path` are reference expressions (`$data.foo`, `$state.view`, `$item.label`). Currency literals such as `"$1,240,000"`, `"$4.2M"`, or `"$99/mo"` are plain strings because the segment after `$` does not start with a letter/underscore.

**The failure mode** is mixing a literal `$` with template interpolation in the same string — e.g. `"$ {{data.amount}}"` or `"${{state.amount}}"` for `StatisticsItem.number`. The renderer's reference parser sees the `$` followed by `{{...}}` and the result resolves to nothing. **Fix:** precompute the formatted string into `data` (`data.arrLabel = "$1.24M"`) and reference it as `"$data.arrLabel"`. Don't try to assemble currency in the spec.

**Recommended:** precompute currency display labels in `data`, then reference them:

```json
{
  "data": { "arrLabel": "$1.24M", "monthlyLabel": "$99/mo" },
  "elements": {
    "arr-stat": {
      "type": "StatisticsItem",
      "label": "ARR",
      "number": "$data.arrLabel"
    }
  }
}
```

A value returned from `data` may safely contain `$`. Hardcoded currency strings beginning with `$` are also safe as long as they are ordinary currency text (`"$1.24M"`), not a reference-shaped string like `"$data.revenueLabel"`.

**Don't:** wrap the value in an object or inline node for primitive props like `StatisticsItem.number`; those props need direct strings/numbers.

### Controlled inputs: bind `$value`, don't fall back to `default*`

> **Symptoms this section addresses:** "tabs aren't switching", "clicking through tabs doesn't load the data", "second tab is blank", "Select doesn't update", anything where a controlled component appears frozen after the first interaction. If you see `"value": ""` (empty string) on an `onChange` / `onSelectedChange` setState action, **this is the bug — read this section before changing the spec shape**.

The renderer merges the event handler's first positional arg into the action ctx as `value`. That means `Tabs.onSelectedChange` → `setState` → `"value": "$value"` resolves to the new tab id, `Input.onChange` → `setState` → `"value": "$value"` resolves to the new input string, and so on. This is the supported, controlled pattern. It works.

**The failure mode** is a spec that hardcodes `"value": ""` (empty string) inside the `setState` action — every change writes empty-string to state, the controlled component sees the same value forever, and clicks appear to do nothing. The cause is usually a model that emitted the controlled binding correctly but forgot to wire the event arg through.

**Fix:** change `"value": ""` to `"value": "$value"`. **Don't** "fix" this by deleting the controlled binding and switching to `defaultSelected` / `defaultValue` — that's an uncontrolled fallback that loses the ability to drive the component from `state` (Tweaks panel can't preview tab states, $action can't programmatically change tabs, etc.).

**Correct:**

```json
{
  "type": "Tabs",
  "selected": "$state.activeTab",
  "onSelectedChange": {
    "$action": "setState",
    "key": "activeTab",
    "value": "$value"
  }
}
```

**Wrong (frozen after first click):**

```json
{
  "onSelectedChange": {
    "$action": "setState",
    "key": "activeTab",
    "value": ""
  }
}
```

**Also wrong (loses controlled state — last resort only):**

```json
{
  "type": "Tabs",
  "defaultSelected": "overview"
}
```

Same rule applies to `Select.onChange`, `MultiSelect.onChange`, `Input.onChange`, `NumberInput.onChange`, `ToggleGroup.onChange`, `Checkbox.onChange`. If the handler is `setState` and you need the new value, it's `"$value"`.

---

## Data Utilities

### Phone Formatting

HubSpot stores phone numbers in various formats. Normalize to a consistent display:

```jsx
const formatPhone = (phone) => {
  if (!phone) return "--";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone; // Return as-is if format is unexpected
};
```

### Date Formatting

Use `Intl.DateTimeFormat` — avoid external date libraries:

```jsx
const formatDate = (timestamp) => {
  if (!timestamp) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
};

// "Mar 30, 2026"
```

For relative dates:

```jsx
const formatRelativeDate = (timestamp) => {
  if (!timestamp) return "--";
  const diff = Date.now() - new Date(timestamp).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(timestamp);
};
```

### Rich Text Property Stripping

HubSpot rich text properties contain HTML. Strip before displaying in Text components:

```jsx
const stripHtml = (html) => {
  if (!html) return "--";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim() || "--";
};
```

### Description Truncation

Limit long text to a reasonable character count with ellipsis:

```jsx
const truncate = (text, maxLength = 200) => {
  if (!text) return "--";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};
```

### Social URL Parsing

Extract display handles from social media URLs:

```jsx
const parseSocialHandle = (url) => {
  if (!url) return "--";
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/$/, "");
    const handle = path.split("/").pop();
    return handle ? `@${handle}` : url;
  } catch {
    return url; // Return raw string if not a valid URL
  }
};

// "https://instagram.com/username" → "@username"
// "https://twitter.com/handle" → "@handle"
```

### Boolean Property Normalization

HubSpot boolean properties are wildly inconsistent. Always normalize:

```jsx
const toBool = (prop) =>
  prop === true ||
  prop === "true" ||
  prop === "Yes" ||
  prop === "yes" ||
  prop === "1";
```

---

## UI Patterns

### "Need Help?" Footer

Reusable help trigger at the bottom of any card. Uses `Tag variant="warning"` wrapping a `Link` that opens a Panel with searchable help content:

```jsx
<Flex direction="row" justify="end">
  <Link overlay={<HelpPanel />}>
    <Tag variant="warning">Need help? Click here.</Tag>
  </Link>
</Flex>
```

### Edit Links in Card Headers

Place edit links in the top-right using `Flex justify="between"`:

```jsx
<Flex direction="row" justify="between" align="center">
  <Flex direction="row" gap="xs">
    <Tag variant="success">Active</Tag>
    <Tag variant="default">Enterprise</Tag>
  </Flex>
  <Link overlay={<EditPanel />}>Edit Record</Link>
</Flex>
```

### Copy-to-Clipboard Icon

Small copy icon next to emails, phone numbers, or IDs:

```jsx
<Flex direction="row" align="center" gap="xs">
  <Text variant="microcopy" format={{ fontWeight: "demibold" }}>{email}</Text>
  <Link
    onClick={async () => {
      try {
        await actions.copyTextToClipboard(email);
        actions.addAlert({ message: "Copied to clipboard", type: "success" });
      } catch {
        actions.addAlert({ message: "Couldn't copy text", type: "warning" });
      }
    }}
  >
    <Icon name="copy" size="sm" />
  </Link>
</Flex>
```

> **Reminder:** `copyTextToClipboard` requires a user interaction event. Never call in `useEffect`.

### Age-Based Tag Coloring

Dynamic tag color based on record age:

```jsx
const getAgeTag = (createdDate) => {
  const ageInMinutes = Math.floor((Date.now() - new Date(createdDate).getTime()) / (1000 * 60));
  if (ageInMinutes < 60) return { variant: "success", label: `${ageInMinutes} mins` };
  if (ageInMinutes < 4320) return { variant: "success", label: `< 3 days` };
  if (ageInMinutes < 14400) return { variant: "warning", label: `${Math.floor(ageInMinutes / 1440)}d` };
  return { variant: "danger", label: `> 10 days` };
};
```

---

## Spacing & Dividers

### Spacing Hierarchy

| Context | Gap | Rationale |
|---------|-----|-----------|
| Card root | `"sm"` | Between major sections |
| Inside sections | `"xs"` | Between label/value rows |
| Between form fields | `"sm"` | Comfortable form spacing |
| Flush | `"flush"` | Tightly coupled elements (e.g., repeating input rows) |
| Inside tables | N/A | Table handles row spacing internally |

### Spacer Component

For one-off vertical spacing adjustments where you need different spacing at a specific point. Prefer `Flex` with `gap` for uniform spacing.

```jsx
import { Spacer } from "@hubspot/ui-extensions";

<Spacer size="medium" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"extra-small"` \| `"small"` \| `"medium"` \| `"large"` \| `"extra-large"` | `"small"` | Amount of vertical space |

**When to use Spacer vs other approaches:**
- **`Flex` with `gap`** — Uniform spacing between all children (preferred for most layouts).
- **`Spacer`** — One-off spacing adjustment at a specific point in a layout.
- **`Divider`** — When you want a visible horizontal line, not just whitespace.
- **Divider + spacing between major blocks** — `<Divider />` followed by `<Spacer size="small" />` when you need both a visible line AND extra vertical space.

### Divider

```jsx
import { Divider } from "@hubspot/ui-extensions";

<Divider />  // Horizontal rule — use between major content blocks
```

**Rules:**
1. `Divider` alone has insufficient vertical margin — pair with `Spacer` or the `SectionBreak` pattern.
2. Use `Divider` inside Panels between `CrmPropertyList` groups.
3. Don't stack multiple Dividers — one is enough.
4. **`Divider` is horizontal-only — there is no vertical variant and no CSS escape hatch.** For column separation, use `DataTable` (native column borders) or rely on `Flex` `gap`. Don't try to fake it with a narrow `Box`.

---

## Layout Gotchas

### PanelFooter Layout Is Broken by Design

This gets everyone. PanelFooter is a flex container that left-aligns and you cannot override it. There are **7 specific rules** governing how it behaves — including that `Flex direction="row"` shrinks to content but `Flex direction="column"` gets full width, and that `justify="between"` breaks with nested Flex children but works with `Inline`.

**See [overlays.md](./overlays.md) for the complete 7-rule breakdown and the winning pattern.**

Quick fix for right-aligned buttons:

```jsx
<PanelFooter>
  <Flex direction="column">
    <Flex direction="row" justify="end" gap="sm">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </Flex>
  </Flex>
</PanelFooter>
```

### Icon Names Silently Fail

HubSpot's `Icon` component renders nothing for invalid `name` values — no error, no fallback, just empty space. Always verify names against the list in [media.md](./media.md). Common mistakes:
- `"error"` → use `"xCircle"`
- `"check"` → use `"success"` or `"checkCircle"`

### Button `variant="transparent"` Adds Invisible Padding

`Button variant="transparent"` adds internal padding that `Text` and `Link` don't have. When a transparent button must align vertically with sibling text (e.g., a clickable name above a microcopy date), the button text appears indented. Use `Link` with `overlay` instead — Links render inline with no extra padding. Both support `overlay` for Panels/Modals/Tooltips.

### Empty Flex Collapses

Empty `Flex` components have zero height/width — they can't serve as spaceholders. If you need a spacer for `justify="between"`, use `Inline` or `<Text>{" "}</Text>`.

### Flex `compact={true}` Is Undocumented

`Flex compact={true}` has undocumented behavior that varies between card contexts. Prefer explicit `gap` props instead.

### Inline vs Flex for Grouped Children

`Inline` does NOT break `justify="between"` when used as a child in Flex containers. Use `Inline` when grouping children inside a `justify="between"` parent — a nested `Flex` would collapse the spacing.

```jsx
// Inline preserves the parent's justify="between"
<Flex direction="row" justify="between">
  <Button>Left</Button>
  <Inline gap="small">
    <Text>Status: Active</Text>
    <Button>Right</Button>
  </Inline>
</Flex>
```

---

## Performance Patterns

### Debounce Property Listeners

`onCrmPropertiesUpdate` fires rapidly. Always debounce:

```jsx
import { debounce } from "lodash";

const debouncedRefresh = debounce(refreshData, 50);

onCrmPropertiesUpdate("*", () => {
  debouncedRefresh();
});
```

### Module-Level Constants

Define property arrays outside components to prevent re-renders:

```jsx
// Good — defined once, shared reference
const PROPERTIES = ["firstname", "lastname", "email"];

const Extension = () => {
  const { properties } = useCrmProperties(PROPERTIES);
  // ...
};
```

```jsx
// Bad — new array on every render, triggers re-fetch
const Extension = () => {
  const { properties } = useCrmProperties(["firstname", "lastname", "email"]);
  // ...
};
```

### Memoize Filtered/Sorted Data

Use `useMemo` for data that depends on search, sort, or filter state:

```jsx
const sortedData = useMemo(() => {
  return [...data]
    .filter((row) => row.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortDirection === "ascending") return a[sortField] > b[sortField] ? 1 : -1;
      return a[sortField] < b[sortField] ? 1 : -1;
    });
}, [data, search, sortField, sortDirection]);
```

---

## Tile Has No Height Control — Equalize Content, Don't Fight Layout

`Tile` exposes only `compact` and `flush`. There is no `height` prop, no way to stretch inner children to fill an `AutoGrid` cell, and no CSS escape hatch. A row of tiles with differing content lengths (one tile has a 1-line description, its neighbor has 2 lines) will render **action buttons on mismatched baselines** — the inner `Flex` can't grow past what the Tile's content demands.

Dead-ends worth skipping:

- `AutoGrid align="stretch"` — `align` is not an AutoGrid prop. Only `columnWidth`, `flexible`, `gap` exist.
- `Flex grow={true}` — `grow` is not a Flex prop. The proportional primitive is `Box flex={1}`, but a Tile is not a flex parent so it can't propagate cell height regardless.
- `Tile height="100%"` — not a prop.
- Stacked `Spacer` — only pushes within the Tile's natural height; can't make the Tile taller.

**The fix is content-level, not layout-level.** Equalize copy in `data` so every tile in the row has roughly matching text length (e.g. all descriptions wrap to two lines). Buttons land on the same baseline without any layout hack.

If content genuinely can't be equalized, move the action into a shared footer row below the grid, or accept the misalignment — it's a platform constraint, not a spec bug.

---

## Holding a Custom-`Table` Column Width — Use a Fixed-`columnWidth` AutoGrid, Not a Spacer Image

When you build a grid out of the raw `Table` primitives (e.g. a month-calendar grid of equal day columns), cells with little content **collapse narrower than their neighbors**. The instinct is to drop a fixed-size spacer into each cell — but the obvious spacers all fail:

- **A full-width spacer `<Image>`** (a transparent SVG sized to the column) does *not* hold width. Images carry `max-width: 100%`, so when the table is narrower than the sum of its columns the table *scales the image down* and that column collapses — while sibling columns containing a `StatusTag`/`Tag` resist (the tag has a hard min-content width). Empty cells lose the fight and smush to nothing.
- **Numeric `width={N}` on `TableCell`/`TableHeader`** is only a hint. The table's internal sizing compresses columns unequally to fit the container; it does not pin them.

**The fix:** set the cell to `width="min"` (so the table *overflows and horizontal-scrolls*, DataTable-style, instead of compressing) and wrap the cell's content in a single-child **`<AutoGrid columnWidth={N} gap="flush">`**. AutoGrid's fixed column is a *real, non-scaling layout width* — it holds `N` even when the cell is empty, so every column stays equal.

```jsx
<TableCell width="min" align="left">
  <AutoGrid columnWidth={160} gap="flush">
    <Flex direction="column" gap="xs">
      {/* day number, event chips, etc. — or nothing, the column still holds 160 */}
    </Flex>
  </AutoGrid>
</TableCell>
```

Notes:
- **Width only.** AutoGrid pins the horizontal axis. To hold *row height* for empty slots, use a **1px-wide × tall** spacer image (a 1px-wide image can never exceed its column, so unlike a full-width spacer it never scales away). Keep the two axes on separate mechanisms.
- Removing the width-spacer image in favor of AutoGrid also deletes the stray spacer element, so the first real child (e.g. the day number) sits flush at the cell's top-left.
- A single greedy column that should *fill* the table (e.g. a one-day view) wants `width="max"` and **no** AutoGrid — a fixed `columnWidth` would strand it.

Related: this is the width-axis cousin of the SVG-`<Image>`-scaling trap — any time an `<Image>` is your sizing mechanism inside a constrained container, expect it to scale rather than hold.
