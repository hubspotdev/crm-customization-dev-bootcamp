---
id: layout
scope: [flex, auto-grid, box, inline, tile, triage-tiles, peer-columns]
depends-on: []
critical-rules: 13
archetypes: [all]
---

# Layout

> Flex, AutoGrid, Box, Inline — the structural building blocks.

---

## Flex

Flex is the primary layout primitive. Renders a `div` with `display: flex`.

### Props Reference

| Prop | Values | Use Case |
|------|--------|----------|
| `direction` | `"row"` (default), `"column"` | Row for horizontal, column for vertical stacking |
| `justify` | `"start"` (default), `"center"`, `"end"`, `"around"`, `"between"` | Main-axis distribution |
| `align` | `"start"`, `"center"`, `"baseline"`, `"end"`, `"stretch"` (default) | Cross-axis alignment |
| `alignSelf` | `"start"`, `"center"`, `"baseline"`, `"end"`, `"stretch"` | Overrides parent's `align` for this Flex only |
| `gap` | `"flush"`, `"extra-small"` / `"xs"`, `"small"` / `"sm"`, `"medium"` / `"md"`, `"large"` / `"lg"`, `"extra-large"` / `"xl"` | Spacing between children |
| `wrap` | `"wrap"`, `"nowrap"`, `true`, `false` | Line wrapping |

### Standard Gap Hierarchy

| Context | Gap | Rationale |
|---------|-----|-----------|
| Card root | `"sm"` | Between major sections |
| Section internals | `"xs"` | Between label/value rows |
| Form rows | `"sm"` | Comfortable form spacing |
| Flush | `"flush"` | Tightly coupled elements |

### Common Patterns

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
```

### Rules

1. Child Flex does NOT inherit parent Flex props — repeat what you need.
2. `justify="between"` on a label-value row is the standard for property-style display.
3. Nesting Flex > Flex > Flex more than 3 deep is a code smell — extract a reusable component.
4. `width="100%"` does nothing useful — use `Box flex={1}` to fill space.
5. **Visual hierarchy dictates component order.** Place visually dominant components (Alerts, banners) before quiet ones (DescriptionLists, labels). A small `DescriptionList` above a loud `Alert` feels inverted — the Alert should lead because it carries the most urgency. Order by importance to the user's workflow: urgent/actionable first, supplemental context second.

---

## AutoGrid

Responsive multi-column layouts. Automatically arranges children into columns based on available space.

### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `columnWidth` | Number (required) | Width of each column in pixels. With `flexible={true}`, acts as minimum. |
| `flexible` | Boolean | `true`: columns expand equally to fill space. `false` (default): exact width. |
| `gap` | String | `"flush"`, `"extra-small"` / `"xs"`, `"small"` / `"sm"`, `"medium"` / `"md"`, `"large"` / `"lg"`, `"extra-large"` / `"xl"` |

### When to Use AutoGrid vs Flex

| Scenario | Use |
|----------|-----|
| Two-column key/value layout | `AutoGrid columnWidth={250} flexible={true}` |
| Image gallery grid | `AutoGrid columnWidth={250} gap="small"` |
| Fixed horizontal bar (tags, buttons) | `Flex direction="row"` |
| Vertical stack of fields | `Flex direction="column"` |

### Rules

1. `columnWidth={250}` is the standard for two-column layouts.
2. Always use `flexible={true}` for data layouts.
3. Wrap each column's content in `Flex direction="column" gap="xs"`.
4. AutoGrid is responsive by default — no media queries needed.

---

## Box

Container for fine-tuning flex ratios. Only use inside Flex.

### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `flex` | `"initial"` \| `"auto"` (default) \| `"none"` \| Number | Flex grow/shrink behavior. Numbers set proportional sizing. |
| `alignSelf` | `"start"` \| `"center"` \| `"baseline"` \| `"end"` \| `"stretch"` | Overrides parent Flex's `align` for this Box. |

```jsx
// 3:1 split layout
<Flex direction="row" gap="sm" align="start">
  <Box flex={3}>{/* Main content */}</Box>
  <Box flex={1}>{/* Sidebar */}</Box>
</Flex>
```

### Rules

1. Only use Box inside Flex — it does nothing standalone.
2. `flex={1}` = "take all remaining space" when only one Box has a flex value.
3. Use numeric ratios for proportional layouts.
4. `alignSelf` overrides parent Flex's `align` for that one child.

---

## Inline

Horizontal row that does NOT break `justify="between"` when nested inside Flex containers.

### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `align` | `"start"` \| `"center"` \| `"baseline"` \| `"end"` \| `"stretch"` | Cross-axis alignment of children |
| `gap` | `"flush"` \| `"extra-small"` / `"xs"` \| `"small"` / `"sm"` \| `"medium"` / `"md"` \| `"large"` / `"lg"` \| `"extra-large"` / `"xl"` | Spacing between children |
| `justify` | `"start"` \| `"center"` \| `"end"` \| `"around"` \| `"between"` | Main-axis distribution |

```jsx
<Flex direction="row" justify="between">
  <Button>Left</Button>
  <Inline gap="small">
    <Text>Status: Active</Text>
    <Button>Right</Button>
  </Inline>
</Flex>
```

### When to Use

- **Inline**: Grouping children inside a `justify="between"` parent.
- **Flex row**: All other horizontal layouts.

---

## Tile

Bordered rectangular container for grouping related components. The standard "card within a card" container.

```jsx
import { Tile, Text } from "@hubspot/ui-extensions";

<Tile>
  <Text>Content inside a bordered container</Text>
</Tile>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `compact` | `boolean` | `false` | Reduces internal padding |
| `flush` | `boolean` | `false` | Removes left and right padding |

### Common Uses

- **Tabbed card:** `Tile compact={true}` wrapping `Tabs` gives the native HubSpot tabbed-card look.
- **Chart container:** Charts should live inside a `Tile` with a title/subtitle above.
- **Action card groups:** `Tile` + `Illustration` + `Button` inline — no wrapper component.
- **Form groups:** Group a form and its inputs together.
- **Triage cards:** When a subset of data requires immediate action, elevate it out of the table into `Tile compact={true}` cards inside an `AutoGrid`. Each tile shows the key info + an action button. This feels more urgent than table rows and matches the user's "act now" mental model.

### Triage Pattern: Tile + AutoGrid

When items need immediate attention (below-par inventory, overdue tasks, expiring contracts), pull them out of the main table into visual cards:

<!-- archetype: triage-dashboard -->
```jsx
<AutoGrid columnWidth={250} flexible={true} gap="small">
  {urgentItems.map((item) => (
    <Tile key={item.id} compact={true}>
      <Flex direction="column" gap="xs">
        <Text format={{ fontWeight: "demibold" }}>{item.name}</Text>
        <Tag variant={statusConfig.variant}>{statusConfig.label}</Tag>
        <Button size="extra-small" variant="secondary" overlay={flagModal}>
          Flag gap
        </Button>
      </Flex>
    </Tile>
  ))}
</AutoGrid>
```

**Triage tile rules:**

1. **Keep tiles lean — identifier, status, action.** Follow the pattern: name (demibold) → status Tag → action Button. Don't add secondary attributes (category, dates, metadata) that crowd the tile and cause truncation at narrow column widths. The detail overlay is where supplemental context belongs.
2. **One Tag per tile at `columnWidth={250}`.** Two Tags with long labels will truncate ("Tried & abando..." and "Automa..." are useless). If you need two categorical values, check if one is available elsewhere in the card.
3. **Sort by actionability, not alphabetically.** The most urgent items appear first: `never_used` > `abandoned`, `out_of_stock` > `below_par`, `overdue` > `due_soon`. The sort order should match how the user would prioritize.
4. **Make the primary identifier clickable.** In triage dashboards, the primary identifier (load ID, item name, ticket number) should be a `<Link overlay={<DetailPanel>}>` that opens a detail view. The triage surface shows enough to prioritize; the overlay shows enough to act.
5. Reserve this for the "act now" subset — don't tile everything.

### When Triage Tiles Make Other Controls Redundant

When a triage section above handles the primary action (e.g., Flag buttons on gap tiles), remove duplicate action controls from the grouped detail below. Each section should serve one purpose: triage for action, grouped detail for context. Removing the Action column from accordion tables simplifies them to clean read-only columns.

### Peer Columns: One Tile per AutoGrid Column

When two data groups are peers (e.g., win points vs. loss points, pros vs. cons), place them side-by-side using `AutoGrid` with each side in its own `Tile compact={true}`. Don't wrap both columns in a single Tile — the children will have misaligned headers.

<!-- archetype: grouped-detail -->
```jsx
<AutoGrid columnWidth={250}>
  <Tile compact={true}>
    <Flex direction="row" align="center" gap="xs">
      <Icon name="success" />
      <Text format={{ fontWeight: "demibold" }}>Win points</Text>
    </Flex>
    {/* content */}
  </Tile>
  <Tile compact={true}>
    <Flex direction="row" align="center" gap="xs">
      <Icon name="xCircle" />
      <Text format={{ fontWeight: "demibold" }}>Loss points</Text>
    </Flex>
    {/* content */}
  </Tile>
</AutoGrid>
```

Height differences between columns (one side is shorter) are acceptable — misaligned content inside a shared container is worse than slightly different tile heights. HubSpot has no CSS height control, so prioritize content alignment over container symmetry.

**Keep header controls grouped, not spread.** In multi-column layouts, don't use `justify="between"` for header rows inside Tiles — it scatters elements across variable-width columns. Keep icon, header text, and action controls in a single `Flex direction="row" align="center" gap="xs"`, all left-aligned.

### Rules

1. Use `compact={true}` for cards inside CRM sidebar — full padding is too generous in narrow contexts.
2. Use `flush={true}` when you need edge-to-edge content (e.g., a Table inside a Tile).
3. Tile does NOT accept `onClick` — place interactive elements (Button, Link) inside it instead.
