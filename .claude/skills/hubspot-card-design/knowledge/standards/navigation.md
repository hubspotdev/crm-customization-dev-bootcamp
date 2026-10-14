---
id: navigation
scope: [tabs, accordion, step-indicator, custom-timeline, sub-tabs, tabbed-card]
depends-on: [layout, media]
critical-rules: 13
archetypes: [multi-view-card, checklist-step-tracker, grouped-detail]
---

# Navigation (Tabs & Accordions)

> Organizing multi-section cards with progressive disclosure.
>
> **Official docs:**
> - [Tabs](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/tabs)
> - [Accordion](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/accordion)

---

## Tabs

The `Tabs` component groups related content into clickable tabs, with each `Tab` child creating a new tab. Options are provided for visual variants, tooltip configuration, and more. Once there are enough tabs to exceed the container width, HubSpot automatically puts overflowing tabs into a "More" dropdown menu.

### `<Tabs>` Props

| Prop | Type | Description |
|---|---|---|
| `defaultSelected` | `string \| number` | The ID of the tab to display by default (as set by the `Tab`'s `tabId` prop). |
| `fill` | `boolean` | Whether the tabs should fill the available space. |
| `onSelectedChange` | `(selectedId: string \| number) => void` | A function invoked when the selected tab changes. |
| `selected` | `string \| number` | The currently selected tab ID, for controlling the component via React state. |
| `variant` | `"default" \| "enclosed"` | Visual style of the tabs. `default` uses underline indicators; `enclosed` uses bordered containers. |

### `<Tab>` Props

| Prop | Type | Description |
|---|---|---|
| `disabled` | `boolean` | Whether the tab should be disabled (greyed out and not clickable). |
| `tabId` | `string \| number` | The tab's unique identifier. **Required for controlled tabs.** |
| `title` | `string` | The tab's title text. |
| `tooltip` | `string` | Text that appears in a tooltip on hover. |
| `tooltipPlacement` | `"top" (default) \| "bottom" \| "left" \| "right"` | Where the tooltip should appear, relative to the tab. |

### Basic Example

```jsx
import { Tabs, Tab, Alert } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <Tabs defaultSelected="first">
      <Tab tabId="first" title="First Tab">
        <Alert variant="success" title="Nice!">
          Your email address was successfully updated.
        </Alert>
      </Tab>
      <Tab tabId="second" title="Second Tab">
        Tab 2's content
      </Tab>
    </Tabs>
  );
};
```

### Controlled Tabs (via React State)

Use `selected` and `onSelectedChange` to control tabs programmatically. This is the recommended pattern when you need to track, persist, or change the active tab from outside the Tabs component.

```jsx
import React, { useState } from "react";
import { Tabs, Tab, Button, Text, Flex } from "@hubspot/ui-extensions";

const Extension = () => {
  const [selected, setSelected] = useState("general");

  return (
    <Flex direction="column" gap="sm">
      <Tabs selected={selected} onSelectedChange={setSelected}>
        <Tab tabId="general" title="General">
          <Flex direction="column" gap="xs">
            {/* General content */}
          </Flex>
        </Tab>
        <Tab tabId="details" title="Details">
          <Flex direction="column" gap="xs">
            {/* Details content */}
          </Flex>
        </Tab>
      </Tabs>
      <Text>Selected: {selected}</Text>
      <Button onClick={() => setSelected("details")}>Go to Details</Button>
    </Flex>
  );
};
```

### Tab Variants

**Default** -- underline-style active indicator (standard HubSpot look):

```jsx
<Tabs variant="default" defaultSelected="first">
  <Tab tabId="first" title="First Tab">Content</Tab>
  <Tab tabId="second" title="Second Tab">Content</Tab>
</Tabs>
```

**Enclosed** -- bordered container style:

```jsx
<Tabs variant="enclosed" defaultSelected="first">
  <Tab tabId="first" title="First Tab">Content</Tab>
  <Tab tabId="second" title="Second Tab">Content</Tab>
</Tabs>
```

**Full-width enclosed** -- tabs stretch to fill the container:

```jsx
<Tabs variant="enclosed" fill={true} defaultSelected="first">
  <Tab tabId="first" title="First Tab">Content</Tab>
  <Tab tabId="second" title="Second Tab">Content</Tab>
</Tabs>
```

### Tab Tooltips

Add context to tabs on hover. Useful for disabled tabs or tabs that need extra explanation.

```jsx
<Tabs variant="enclosed" defaultSelected="first">
  <Tab
    tooltip="View and edit general settings"
    tooltipPlacement="top"
    tabId="first"
    title="First Tab"
  >
    Content
  </Tab>
  <Tab
    tooltip="This feature is coming soon."
    tooltipPlacement="right"
    tabId="second"
    title="Second Tab"
    disabled={true}
  >
    Content
  </Tab>
</Tabs>
```

### Tab Usage Guidelines

1. Wrap tab content in `<Flex direction="column" gap="xs">` for consistent internal spacing.
2. Keep tab titles short (1-2 words). The overflow "More" dropdown handles long tab lists, but short titles give the best UX.
3. First tab = most commonly accessed data.
4. Use `variant="default"` inside settings extensions -- the settings page already uses enclosed styling, and nesting enclosed tabs will visually clash.
5. Use controlled tabs (`selected` + `onSelectedChange`) when you need to programmatically switch tabs or track state.
6. Use `defaultSelected` for simple, self-contained tab groups that don't need external control.

---

## Tab Badge Pattern

Tabs with inline status badges, as seen on HubSpot's Event Management page. Patterns for signaling feature maturity (Beta, New) and count badges (e.g. "Contacts (12)"). Since the `title` prop on `Tab` only accepts a `string`, badges are appended inline within the title text.

### Status Badge Tabs

```jsx
import React, { useState } from "react";
import { Tabs, Tab, Flex, Tag, Text, Heading } from "@hubspot/ui-extensions";

const FeatureTabsWithBadges = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs selected={activeTab} onSelectedChange={setActiveTab}>
      <Tab tabId="overview" title="Overview">
        <Flex direction="column" gap="xs">
          <Text>Main overview content here.</Text>
        </Flex>
      </Tab>
      <Tab tabId="analytics" title="Analytics">
        <Flex direction="column" gap="xs">
          <Text>Analytics dashboards and reports.</Text>
        </Flex>
      </Tab>
      <Tab tabId="explore" title="Explore [Beta]">
        <Flex direction="column" gap="xs">
          <Flex direction="row" gap="xs" align="center">
            <Heading>Explore</Heading>
            <Tag variant="info">Beta</Tag>
          </Flex>
          <Text>This feature is in beta. Functionality may change.</Text>
        </Flex>
      </Tab>
    </Tabs>
  );
};
```

### Count Badge Tabs

For tabs that show counts (e.g., "Contacts (12)"), dynamically build the title string.

```jsx
import React, { useState } from "react";
import { Tabs, Tab, Flex, Text } from "@hubspot/ui-extensions";

const CountBadgeTabs = ({ contacts, companies, deals }) => {
  const [activeTab, setActiveTab] = useState("contacts");

  return (
    <Tabs selected={activeTab} onSelectedChange={setActiveTab}>
      <Tab
        tabId="contacts"
        title={`Contacts (${contacts.length})`}
      >
        <Flex direction="column" gap="xs">
          {contacts.map((c) => (
            <Text key={c.id}>{c.name}</Text>
          ))}
        </Flex>
      </Tab>
      <Tab
        tabId="companies"
        title={`Companies (${companies.length})`}
      >
        <Flex direction="column" gap="xs">
          {companies.map((c) => (
            <Text key={c.id}>{c.name}</Text>
          ))}
        </Flex>
      </Tab>
      <Tab
        tabId="deals"
        title={`Deals (${deals.length})`}
      >
        <Flex direction="column" gap="xs">
          {deals.map((d) => (
            <Text key={d.id}>{d.name}</Text>
          ))}
        </Flex>
      </Tab>
    </Tabs>
  );
};
```

### Badge Tab Patterns Summary

| Pattern | Title String | Inside Content |
|---|---|---|
| Beta feature | `"Explore [Beta]"` | Place a `<Tag variant="info">Beta</Tag>` inside the tab body heading for visual emphasis |
| New feature | `"Insights [New]"` | Place a `<Tag variant="success">New</Tag>` inside the tab body heading |
| Count badge | `` `Contacts (${count})` `` | Dynamically computed string with the current count |
| Updated | `"Settings [Updated]"` | Place a `<Tag variant="warning">Updated</Tag>` inside the tab body heading |

---

## Sub-Tab / Nested Group Pattern

Primary Tabs at top select the view, then a filter/control bar below tabs but above content filters within that view. This creates a two-tier navigation seen on HubSpot's Data Integration and Enrichment Mapping pages.

**Pattern:** `Tabs` -> `FilterBar / Controls` -> `Table / Content`

```jsx
import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Flex,
  Select,
  Input,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  Text,
  Button,
  Divider,
} from "@hubspot/ui-extensions";

const DataImportView = ({ fileImports, appSyncs, studioSyncs }) => {
  const [activeTab, setActiveTab] = useState("file-imports");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic applies within the active tab's dataset
  const filterData = (data) => {
    let filtered = data;
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const getActiveData = () => {
    switch (activeTab) {
      case "file-imports":
        return filterData(fileImports);
      case "app-syncs":
        return filterData(appSyncs);
      case "studio-syncs":
        return filterData(studioSyncs);
      default:
        return [];
    }
  };

  return (
    <Flex direction="column" gap="sm">
      {/* Tier 1: Primary navigation tabs */}
      <Tabs selected={activeTab} onSelectedChange={setActiveTab}>
        <Tab tabId="file-imports" title="File imports">
          {/* Content rendered below filter bar */}
        </Tab>
        <Tab tabId="app-syncs" title="App syncs">
          {/* Content rendered below filter bar */}
        </Tab>
        <Tab tabId="studio-syncs" title="Data studio syncs">
          {/* Content rendered below filter bar */}
        </Tab>
      </Tabs>

      {/* Tier 2: Filter/control bar (shared across tabs) */}
      <Flex direction="row" gap="sm" align="end" wrap="wrap">
        <Input
          name="search"
          label="Search"
          placeholder="Search imports..."
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
        />
        <Select
          name="status"
          label="Status"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Complete", value: "complete" },
            { label: "Failed", value: "failed" },
          ]}
        />
        <Button variant="secondary" onClick={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}>
          Clear filters
        </Button>
      </Flex>

      <Divider />

      {/* Tier 3: Filtered content / table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Date</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {getActiveData().map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Flex>
  );
};
```

### Alternative: Tab-Specific Filter Bars

When each tab needs different controls, place the filter bar inside each Tab's content.

```jsx
import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Flex,
  Select,
  Input,
  Text,
  Divider,
} from "@hubspot/ui-extensions";

const MappingView = () => {
  const [activeTab, setActiveTab] = useState("field-mappings");
  const [direction, setDirection] = useState("all");

  return (
    <Tabs selected={activeTab} onSelectedChange={setActiveTab}>
      <Tab tabId="field-mappings" title="Field mappings">
        <Flex direction="column" gap="sm">
          {/* Tab-specific filter controls */}
          <Flex direction="row" gap="sm" align="end">
            <Select
              name="direction"
              label="Sync direction"
              value={direction}
              onChange={(val) => setDirection(val)}
              options={[
                { label: "All directions", value: "all" },
                { label: "HubSpot to App", value: "outbound" },
                { label: "App to HubSpot", value: "inbound" },
                { label: "Bidirectional", value: "both" },
              ]}
            />
            <Input
              name="field-search"
              label="Search fields"
              placeholder="Filter by field name..."
            />
          </Flex>
          <Divider />
          {/* Mapping table specific to this tab */}
          <Text>Field mapping content goes here...</Text>
        </Flex>
      </Tab>
      <Tab tabId="association-mappings" title="Association mappings">
        <Flex direction="column" gap="sm">
          {/* Different controls for this tab */}
          <Select
            name="object-type"
            label="Object type"
            options={[
              { label: "All objects", value: "all" },
              { label: "Contacts", value: "contacts" },
              { label: "Companies", value: "companies" },
            ]}
          />
          <Divider />
          <Text>Association mapping content goes here...</Text>
        </Flex>
      </Tab>
    </Tabs>
  );
};
```

### Sub-Tab Pattern Rules

1. **Shared filter bar:** Place filter controls _outside_ and _below_ the `<Tabs>` component when all tabs share the same filter structure.
2. **Tab-specific filters:** Place filter controls _inside_ each `<Tab>` when each tab needs different controls.
3. Always use a `<Divider />` between filter controls and the main content/table.
4. Reset filters when the user switches tabs if the filters are shared across tabs.
5. This pattern works best with `variant="default"` tabs for the primary navigation tier.

---

## Tabbed Card Pattern

Tabs inside `Tile compact={true}` creates the native HubSpot tabbed-card look, as seen throughout the CRM record sidebar.

<!-- archetype: multi-view-card -->
```jsx
import React, { useState } from "react";
import {
  Tile,
  Tabs,
  Tab,
  Flex,
  Text,
  DescriptionList,
  DescriptionListItem,
} from "@hubspot/ui-extensions";

const TabbedCard = () => {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <Tile compact={true}>
      <Tabs
        variant="default"
        selected={activeTab}
        onSelectedChange={setActiveTab}
      >
        <Tab tabId="summary" title="Summary">
          <Flex direction="column" gap="xs">
            <DescriptionList direction="row">
              <DescriptionListItem label="Status">
                <Text>Active</Text>
              </DescriptionListItem>
              <DescriptionListItem label="Owner">
                <Text>Jane Smith</Text>
              </DescriptionListItem>
              <DescriptionListItem label="Created">
                <Text>Mar 15, 2026</Text>
              </DescriptionListItem>
            </DescriptionList>
          </Flex>
        </Tab>
        <Tab tabId="activity" title="Activity">
          <Flex direction="column" gap="xs">
            <Text>Recent activity items here...</Text>
          </Flex>
        </Tab>
        <Tab tabId="notes" title="Notes">
          <Flex direction="column" gap="xs">
            <Text>Notes content here...</Text>
          </Flex>
        </Tab>
      </Tabs>
    </Tile>
  );
};
```

### Tabbed Card Rules

1. Always use `<Tile compact={true}>` as the outer wrapper.
2. Use `variant="default"` for tabs inside a Tile -- `enclosed` creates a visual double-border.
3. Keep to 2-4 tabs maximum per card; more tabs should use a full-width layout instead.
4. This is the standard pattern for CRM record sidebar cards with multiple views.

---

## Accordions

The `Accordion` component renders an expandable and collapsible section that can contain other components. Useful for saving space and breaking up extension content with progressive disclosure.

### `<Accordion>` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | -- | **Required.** The main content of the accordion when it opens. |
| `title` | `string` | -- | **Required.** The accordion's title text. |
| `defaultOpen` | `boolean` | `false` | When `true`, the accordion will be open on initial page load. The `open` prop takes precedence over this prop. |
| `disabled` | `boolean` | `false` | When `true`, the accordion's state cannot be changed. |
| `onClick` | `() => void` | -- | A function invoked when the accordion title is clicked. Receives no arguments; return value is ignored. |
| `open` | `boolean` | -- | Controls the accordion's open state programmatically. When `true`, the accordion will open. Takes precedence over `defaultOpen`. |
| `size` | `"extra-small" \| "xs" \| "small" \| "sm" \| "medium" \| "md"` | `"small"` | The size of the accordion title. |
| `testId` | `string` | -- | Used by `findByTestId()` to locate this component in tests. |

### Basic Example

```jsx
import { Accordion, Text } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <>
      <Accordion title="Item One" defaultOpen={true} size="sm">
        <Text>
          Call me Ishmael. Some years ago -- never mind how long precisely --
          having little or no money in my purse, and nothing particular to
          interest me on shore, I thought I would sail about a little and see
          the watery part of the world.
        </Text>
      </Accordion>
      <Accordion title="Item Two" defaultOpen={false} size="sm">
        <Text>Second inner text</Text>
      </Accordion>
    </>
  );
};
```

### Controlled Accordion

Use `open` and `onClick` to control the accordion state programmatically.

```jsx
import React, { useState } from "react";
import { Accordion, Text, Button, Flex } from "@hubspot/ui-extensions";

const ControlledAccordion = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Flex direction="column" gap="sm">
      <Button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Collapse" : "Expand"} Details
      </Button>
      <Accordion
        title="Additional Details"
        open={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
      >
        <Flex direction="column" gap="xs">
          <Text>Controlled accordion content here.</Text>
        </Flex>
      </Accordion>
    </Flex>
  );
};
```

### Accordion Usage Rules

1. `size="sm"` is the standard for CRM card content.
2. `defaultOpen={true}` for primary data, `false` for supplemental.
3. For a standalone title + description + actions row (no collapse), use `SectionHeader` from `hs-uix/common-components`. Use raw `Accordion` when you need progressive disclosure.
4. `defaultOpen` is render-time only -- changing it after mount has no effect. Use `open` for dynamic control.
5. The `open` prop takes precedence over `defaultOpen`. If both are set, `open` wins.
6. **Use `gap="flush"` on the Flex inside Accordions.** The Accordion already provides its own padding between header and content. Adding `gap="xs"` or `gap="sm"` on the wrapper Flex creates awkward dead space. Use `gap="flush"` so tables and content sit tight against the accordion's built-in padding.
7. **Don't wrap primary content in Accordion.** If a section IS the card's main content (e.g., the only table on the card), don't make users click to see it. Use a manual header row (`Flex direction="row" justify="between"` with title + action button) instead. Accordion is for progressive disclosure of supplemental sections — secondary data, additional details, "nice to have" info. Ask: "Would the user collapse this?" If the answer is no, it's not an Accordion — it's a header row. Only truly supplemental sections (completed logs, far-future items, historical data) earn an Accordion.
8. **Keep accordion titles short — just the group name.** Don't put metadata, counts, or status in the title (e.g., ~~"Fresh Farms Co. — 3 of 4 need reorder"~~). Long titles are hard to scan when multiple accordions are stacked. Put counts inside the accordion — the table header is a natural place since it's the first thing visible when the accordion expands.
9. **Don't repeat counts in Accordion titles and filter bars.** If the record count already appears in the filter bar area (as microcopy), omit it from the section title.
10. **Avoid `justify="between"` inside Accordion content.** Accordion content areas are narrower than the full card width. Using `Flex direction="row" justify="between"` with text on both sides causes the right-side text to wrap to multiple lines, creating ragged layout. Instead, put counts inline with the label using parentheses:
11. **Drive `defaultOpen` from data, not static booleans.** When grouping content into Accordions, open the ones that need action and close the ones that don't. Use a computed boolean based on the data:

```jsx
// ✅ Smart defaults — open categories that need attention
<Accordion
  title={categoryName}
  defaultOpen={items.some(item => item.status === "failing" || item.status === "uninspected")}
  size="sm"
>
```

Don't set all Accordions to `defaultOpen={true}` — it creates an extremely long card. Don't set them all to `false` — it hides actionable items.

12. **Use AutoGrid for 3+ grouped Accordions.** When a card has 3+ peer Accordions (categories, departments, phases) that create excessive vertical scrolling, wrap them in `AutoGrid` for a multi-column layout:

```jsx
<AutoGrid columnWidth={350} flexible={true} gap="small">
  {categories.map(([name, items]) => (
    <Accordion
      key={name}
      title={name}
      defaultOpen={items.some(needsAttention)}
      size="sm"
    >
      {/* category content */}
    </Accordion>
  ))}
</AutoGrid>
```

`columnWidth={350}` gives a 2-column layout on ~600px middle column surfaces and stacks on sidebars. This works well for peer groups where there's no sequential relationship.

```jsx
// ❌ Count wraps in narrow accordion content
<Flex direction="row" justify="between" align="center">
  <Text>{phase.name}</Text>
  <Text variant="microcopy">{count} subtasks</Text>
</Flex>

// ✅ Inline count — compact and wrap-proof
<Flex direction="row" align="center" gap="xs">
  <Icon name="circleHollow" size="sm" />
  <Text>{phase.name}</Text>
  <Text variant="microcopy">({count})</Text>
</Flex>
```

---

## StepIndicator

Progress indicator for multi-step flows (wizards, setup sequences, onboarding). Shows numbered circles connected by a line with step names.

```jsx
import { StepIndicator, Flex, Button } from "@hubspot/ui-extensions";

const [currentStep, setCurrentStep] = useState(0);

<Flex direction="column" gap="md">
  <StepIndicator
    currentStep={currentStep}
    stepNames={["Details", "Configuration", "Review"]}
  />
  {/* Step content here */}
  <Flex direction="row" justify="between">
    <Button variant="secondary" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0}>
      Previous
    </Button>
    <Button variant="primary" onClick={() => setCurrentStep(currentStep + 1)} disabled={currentStep === 2}>
      Next
    </Button>
  </Flex>
</Flex>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | -- | Currently active step (zero-based: first step is `0`) |
| `stepNames` | `string[]` | -- | Array of step labels |
| `circleSize` | `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | `"sm"` | Size of the indicator circles |
| `direction` | `"horizontal"` \| `"vertical"` | `"horizontal"` | Orientation of the indicator |
| `variant` | `"default"` \| `"compact"` \| `"flush"` | `"default"` | `"compact"` and `"flush"` only show the active step's title. `"flush"` also removes left/right margin. |
| `onClick` | `(stepIndex: number) => void` | -- | Called when a step circle is clicked. Use to enable step navigation. |

### Rules

1. Steps are **zero-based** — first step is `0`, not `1`.
2. Use `"horizontal"` (default) for panels and wider surfaces. Use `"vertical"` for narrow cards.
3. Use `variant="compact"` in CRM cards where horizontal space is limited — it only shows the current step name.
4. Wire up `onClick` if you want users to click step circles to navigate (not just Next/Previous buttons).
5. Pair with `PanelFooter` for multi-step panel flows — put Previous/Next in the footer.
6. **StepIndicator only supports top-down completion.** It checks all steps *before* `currentStep` — you cannot have unchecked items above checked items. If you need non-linear completion states (e.g., a newest-first timeline where recent items are unchecked and older items are checked), build a custom timeline with `Icon` + `Flex` rows instead. Use `checkCircle` / `circleHollow` icons, `Text variant="microcopy"` for dates, and `Tag variant="default"` for activity types.

---

## Custom Timeline Pattern

When `StepIndicator` can't represent your data (non-linear completion, category tags, descriptions), build a custom timeline with `Icon` + `Flex` rows:

<!-- archetype: checklist-step-tracker -->
```jsx
const TimelineRow = ({ event }) => (
  <Flex direction="column" gap="flush">
    {/* Icon sits in the metadata row — not alongside the full entry */}
    <Flex direction="row" align="center" gap="xs">
      <Icon
        name={event.completed ? "checkCircle" : "circleHollow"}
        color={event.completed ? "success" : "inherit"}
        size="sm"
      />
      <Text variant="microcopy">{formatDate(event.date)}</Text>
      <Tag variant="default">{event.type}</Tag>
    </Flex>
    {/* Description on its own line below */}
    <Flex direction="row">
      <Box flex={0}>{/* spacer matching icon width */}</Box>
      <Text>{event.description}</Text>
    </Flex>
  </Flex>
);
```

**Rules:**
1. Put the icon in the metadata row (date + tag), not alongside the full entry. The icon relates to the event header, not the description text.
2. Use `checkCircle` + `circleHollow` for consistent icon dimensions (see [media.md](./media.md) Icon Alignment Rules).
3. Use `Tag variant="default"` for category labels — don't color-code neutral categories (see [status-and-tags.md](./status-and-tags.md)).
4. Paginate with "View more" for 5+ items (see [buttons-and-actions.md](./buttons-and-actions.md)).

---

## Never Stack Two Tab Bars

Two levels of tabs stacked directly on top of each other (e.g., top-level "Activity | Mappings" tabs above inner "Invoices | Payments | Products" tabs) is visually confusing — users can't tell which level they're navigating.

**Alternatives when two views share the same sub-navigation:**

| Alternative | When to use |
|---|---|
| **View toggle icon** (e.g., settings gear `Icon name="settings"`) | Switching between a primary view and a configuration/settings mode |
| **ToggleGroup** | 2-3 view modes with short labels |
| **Select dropdown** | 4+ modes, or modes with long labels |
| **Separate the levels with content** | If you must nest tabs, put content or a visual break between them |

```jsx
// ✅ Settings gear toggles between activity and mappings views
// Same object-type tabs serve both views — badge counts update contextually
<Flex direction="row" justify="between" align="center">
  <Text format={{ fontWeight: "demibold" }}>Sync Activity</Text>
  <Button variant="transparent" onClick={() => setView("mappings")}>
    <Icon name="settings" size="sm" />
  </Button>
</Flex>

// In mappings view, a back arrow returns to activity
<Flex direction="row" align="center" gap="xs">
  <Button variant="transparent" onClick={() => setView("activity")}>
    <Icon name="left" size="sm" />
  </Button>
  <Text format={{ fontWeight: "demibold" }}>Field Mappings</Text>
</Flex>
```

---

## When to Use Tabs vs. Accordions

| Use Tabs when... | Use Accordions when... |
|---|---|
| Content sections are mutually exclusive (user views one at a time) | Multiple sections may need to be open simultaneously |
| You have 2-7 peer-level views of the same entity | You have a long list of expandable detail sections |
| Users need to switch between views frequently | Content is supplemental and can be progressively disclosed |
| The content area is wide enough for tab labels | Vertical space is limited and content should collapse |
