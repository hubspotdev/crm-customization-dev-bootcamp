---
id: data-display
scope: [statistics, progress-bar, description-list, score-circle, bar-chart, line-chart, kpi-dashboard]
depends-on: [layout, status-and-tags, crm-components]
critical-rules: 12
archetypes: [kpi-snapshot, chart-forward, list-manager, triage-dashboard]
---

# Data Display

> Visualizing metrics, trends, and KPIs. Charts, progress bars, statistics, score circles, and description lists.

---

## When to Use What

| Scenario | Component | Why |
|----------|-----------|-----|
| Single-number KPI spotlight (revenue, count, rate) | `Statistics` | Big number with optional trend arrow conveys "how are we doing?" at a glance |
| Trend over time (daily, weekly, monthly) | `LineChart` | Line charts communicate direction and velocity of change |
| Comparing categories (products, reps, stages) | `BarChart` | Side-by-side bars make magnitude differences obvious |
| Progress toward a goal or capacity limit | `ProgressBar` | Filled bar with percentage is the universal "how far along?" pattern |
| Performance score (0-100 range) | `ScoreCircle` | Color-coded circle gives instant pass/warn/fail signal |
| Label-value property pairs | `DescriptionList` or `KeyValueList` (`hs-uix`) | Native HubSpot property-list appearance for key details. `KeyValueList` is the `hs-uix` shorthand (`items={[{ label, value }]}`) — reach for it in summary tiles and panels. |
| Categorical status of an item | `StatusTag` / `Tag` (or `AutoStatusTag` / `AutoTag`) | See [status-and-tags.md](./status-and-tags.md) |

**Rule of thumb:** Don't chart what a number or tag can communicate. Use the simplest component that answers the user's question.

**Formatters:** use `formatCurrency`, `formatCurrencyCompact`, `formatDate`, `formatPercentage`, `sumBy` from `hs-uix/utils` — see [`utils.md`](./utils.md). Prefer `formatCurrencyCompact` ("$4.2K", "$123.6M") over `formatCurrency` inside Statistics tiles and Kanban headline metrics where horizontal space is tight.

### Component Ordering on Cards

When a card uses multiple data display components, follow visual hierarchy:

```
❌  Alert → DescriptionList → Statistics → Table
✅  Alert → Statistics → DescriptionList → Table
```

`Statistics` is visually dominant (big numbers) — it leads. `DescriptionList` is quiet context — it follows. The user scans the big numbers first, then checks the details.

### One Component Per Metric

Don't show the same number in both a `StatisticsItem` and a `ProgressBar`. Pick one.

- `StatisticsItem` is for KPI spotlights — the number IS the message. Use when the question is "what are the key numbers?"
- `ProgressBar` is for ratio/goal tracking — the bar IS the message. Use when the question is "how close am I?" or "what percentage is healthy?" It can replace `Statistics` entirely as a card-level hero when one visual ratio communicates more than multiple discrete numbers.
- `ScoreCircle` follows the same rule — don't pair it with a `StatisticsItem` showing the same value.

**Before adding Statistics, check if the same numbers are already visible** in other components. If a `ProgressBar` shows the overall ratio and category `Accordion` sections show per-group counts, a `Statistics` strip repeating those same numbers is redundant. One component per metric.

### Statistics vs Tiles — Choose Based on Data Shape

Don't default to `Tile` grids for per-category counts when `Statistics` can do the job more compactly.

| Use `Statistics` when... | Use `Tile` grid when... |
|---|---|
| You need aggregate KPIs (total synced, total failed, total pending) | Each group is a meaningful entity with its own sub-metrics or actions |
| Per-group breakdowns already live elsewhere (tab badges, filters) | Groups need visual identity (triage cards, supplier breakdowns) |
| You're showing 3-4 top-level health numbers | Each group needs its own action button or status indicator |

`Statistics` is compact and scannable — four `Tile compact` boxes consume vertical space for what might amount to six numbers that a `Statistics` strip handles in one row. If per-type breakdowns are already available in tab badges (e.g., `Invoices (158)`), don't repeat them in Tiles.

### ProgressBar as Card Hero

When a card's primary question is "how much progress?" or "what percentage?", `ProgressBar` leads the card — above `DescriptionList`, above `Statistics`. The adoption score, inspection pass rate, or goal completion is the first thing the user sees.

```
✅  ProgressBar (hero metric) → DescriptionList (context) → Triage tiles → Detail
❌  DescriptionList (context) → ProgressBar (buried below quiet text)
```

`DescriptionList` is quiet context that the user likely already knows (company name, owner, renewal date). Don't let it push the card's primary answer below the fold.

**One `ProgressBar` per card.** Don't add per-section progress bars inside Accordions or table groups. The accordion title or table header can show counts as text ("3 of 4 need reorder") — that's sufficient without a visual bar for every group. Multiple progress bars compete for attention and make the card feel like a dashboard rather than a focused tool.

### ProgressBar Does Not Fit in Table Cells

`ProgressBar` renders too narrow inside `TableCell width="min"` — cramped and unreadable. Use plain text for numeric values in table cells:

```jsx
// ❌ Too cramped in a table cell
<TableCell width="min">
  <ProgressBar value={92} maxValue={100} showPercentage={true} variant="success" />
</TableCell>

// ✅ Clean and scannable
<TableCell width="min">
  <Text format={{ fontWeight: "demibold" }}>92%</Text>
</TableCell>
```

Reserve `ProgressBar` for card sections and panel sections where it gets full width.

### Don't Split DescriptionList

Don't artificially split a `DescriptionList` into multiple components to control items per row (e.g., 4 items + 2 items). The two lists will have inconsistent column alignment and won't resize together. Use one list and let HubSpot's renderer handle wrapping.

---

## Chart Guidelines

HubSpot's charting philosophy (visible in their Event Management Analyze tab and native reports) follows a **single-purpose chart** pattern:

### Design Principles

1. **One metric, one color, one question answered.** Each chart should answer exactly one question (e.g., "How many registrations per day?").
2. **Chart lives inside a bordered Tile container.** The Tile provides its own title, subtitle (date range + frequency), and optional legend.
3. **Soft styling.** Circular data point markers, dashed horizontal gridlines, area fill under lines for single-series. Keep charts visually quiet.
4. **No multi-series complexity unless explicitly comparing.** If you need multiple lines/bars, use `groupFieldByColor` with a legend.
5. **Sort data before passing.** Charts render data in the order provided. Pre-sort by x-axis value.
6. **Use larger surfaces.** Display charts in the record page middle column. Avoid charts with many data points on smaller surfaces like the preview panel or sidebar.

### Available Chart Components

| Component | Best For | Import |
|-----------|----------|--------|
| `BarChart` | Categorical comparisons (products, reps, stages) | `import { BarChart } from '@hubspot/ui-extensions'` |
| `LineChart` | Time series, trends over time | `import { LineChart } from '@hubspot/ui-extensions'` |
| `CrmReport` | Embedding native HubSpot reports | `import { CrmReport } from '@hubspot/ui-extensions/crm'` |

### Chart Data Format

Both `BarChart` and `LineChart` accept the same data shape: an array of flat objects with key-value pairs.

```jsx
// Simple format: array of objects
const data = [
  { Month: "Jan", Revenue: 10000 },
  { Month: "Feb", Revenue: 15000 },
  { Month: "Mar", Revenue: 12000 },
];

// With propertyLabels for non-human-readable keys
const data = {
  data: [
    { dealstage: "appointmentScheduled", count: 5 },
    { dealstage: "closedWon", count: 12 },
  ],
  options: {
    propertyLabels: {
      dealstage: {
        appointmentScheduled: "Appointments Scheduled",
        closedWon: "Closed Won",
      },
    },
  },
};
```

### Chart Props (BarChart and LineChart share the same API)

| Prop | Type | Description |
|------|------|-------------|
| `data` | Array \| Object | Array of data objects, or `{ data: [...], options: { propertyLabels } }` for relabeling. Data renders in the order provided -- sort before passing. |
| `axes` | Object | Axis configuration. See axes table below. |
| `options` | Object | Chart display options. See options table below. |

**`axes` configuration:**

| Field | Type | Description |
|-------|------|-------------|
| `x.field` | String (required) | Field name from your dataset for the x-axis. |
| `x.fieldType` | `'category'` \| `'datetime'` \| `'linear'` (required) | How to interpret the x-axis data. |
| `x.label` | String | Custom axis label. Defaults to `field` value. |
| `y.field` | String (required) | Field name from your dataset for the y-axis. |
| `y.fieldType` | `'category'` \| `'datetime'` \| `'linear'` (required) | How to interpret the y-axis data. |
| `y.label` | String | Custom axis label. Defaults to `field` value. |
| `options.groupFieldByColor` | String | Field to color-code by for multi-series data. |
| `options.stacking` | Boolean | Stack grouped data instead of separate bars/lines. |
| `options.colors` | Object | Map of field values to specific colors (e.g., `{ "Direct": "blue" }`). |

**`options` configuration:**

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Chart title displayed above the chart. |
| `showLegend` | Boolean | Display a legend above the chart. Use when graphing multiple categories. |
| `showDataLabels` | Boolean | Display labels above data points. |
| `showTooltips` | Boolean | Display tooltips on hover. |
| `colorList` | Array | Custom color order (e.g., `['purple', 'green', 'darkBlue']`). |

### Available Colors

Colors are assigned automatically in a preset order. You can customize with `colorList` in `options` or `colors` in `axes.options`. Available named colors include: `blue`, `orange`, `yellow`, `green`, `purple`, `darkBlue`, `red`, and others from HubSpot's palette.

---

## BarChart

> Best for comparing categorical data: products, sales reps, deal stages.

```jsx
import { BarChart } from '@hubspot/ui-extensions';
```

### Basic Example

```jsx
const Extension = () => {
  const inventoryData = [
    { Product: 'Hats', Amount: 187 },
    { Product: 'Socks', Amount: 65 },
    { Product: 'Ascots', Amount: 120 },
  ];

  return (
    <BarChart
      data={inventoryData}
      axes={{
        x: { field: 'Product', fieldType: 'category' },
        y: { field: 'Amount', fieldType: 'linear' },
        options: { groupFieldByColor: 'Product' },
      }}
      options={{
        title: 'Daily inventory',
        showLegend: true,
        showDataLabels: true,
        showTooltips: true,
      }}
    />
  );
};
```

### Stacked BarChart Example

```jsx
const Extension = () => {
  const dealData = [
    { count: 1, dealstage: 'appointmentScheduled', user_id: '194784' },
    { count: 2, dealstage: 'closedWon', user_id: '295834' },
    { count: 1, dealstage: 'closedWon', user_id: '938453' },
  ];

  return (
    <BarChart
      data={{
        data: dealData,
        options: {
          propertyLabels: {
            dealstage: {
              appointmentScheduled: 'Appointments scheduled',
              closedWon: 'Closed won',
            },
            user_id: {
              194784: 'Sales user A',
              295834: 'Sales user B',
              938453: 'Sales user C',
            },
          },
        },
      }}
      axes={{
        x: { field: 'dealstage', fieldType: 'category', label: 'Deal Stage' },
        y: { field: 'count', fieldType: 'linear', label: 'Count of Deals' },
        options: { groupFieldByColor: 'user_id', stacking: true },
      }}
      options={{
        showLegend: true,
        showDataLabels: true,
        showTooltips: true,
      }}
    />
  );
};
```

### BarChart Guidelines

- **DO:** Title data categories with human-readable text.
- **DO:** Use sentence-casing for categories and chart title.
- **DO:** Pre-sort data in ascending/descending order before passing.
- **DO:** Show the legend when graphing more than one category.
- **DO:** Use larger surfaces (middle column) for charts with many data points.
- **DON'T:** Use more than 14 data categories unless unavoidable.
- **DON'T:** Use the same colors to indicate different data categories.

---

## LineChart

> Best for time series plots and trend data over time.

```jsx
import { LineChart } from '@hubspot/ui-extensions';
```

### Basic Example

```jsx
const Extension = () => {
  const salesData = [
    { Date: '2024-08-01', Sales: 10 },
    { Date: '2024-08-02', Sales: 30 },
    { Date: '2024-08-03', Sales: 60 },
  ];

  return (
    <LineChart
      data={salesData}
      axes={{
        x: { field: 'Date', fieldType: 'datetime' },
        y: { field: 'Sales', fieldType: 'linear' },
      }}
      options={{
        title: 'Sales trend',
        showLegend: true,
        showDataLabels: true,
        showTooltips: true,
      }}
    />
  );
};
```

### Multi-Series LineChart Example

```jsx
const Extension = () => {
  const visitsData = [
    { 'Session Date': '2019-09-01', Breakdown: 'Direct', Visits: 1277 },
    { 'Session Date': '2019-09-01', Breakdown: 'Referrals', Visits: 1882 },
    { 'Session Date': '2019-09-01', Breakdown: 'Email', Visits: 1448 },
    { 'Session Date': '2019-09-02', Breakdown: 'Direct', Visits: 1299 },
    { 'Session Date': '2019-09-02', Breakdown: 'Referrals', Visits: 1869 },
    { 'Session Date': '2019-09-02', Breakdown: 'Email', Visits: 1408 },
  ];

  return (
    <LineChart
      data={visitsData}
      axes={{
        x: { field: 'Session Date', fieldType: 'category' },
        y: { field: 'Visits', fieldType: 'linear' },
        options: { groupFieldByColor: 'Breakdown' },
      }}
      options={{ showLegend: true }}
    />
  );
};
```

### Chart Inside a Tile (Recommended Pattern)

Wrap charts in a `Tile` for the native HubSpot look with title, subtitle, and contained border.

<!-- archetype: chart-forward -->
```jsx
import { Tile, LineChart, Text, Flex } from '@hubspot/ui-extensions';

const Extension = () => {
  const data = [
    { Date: '2024-01-01', Registrations: 45 },
    { Date: '2024-02-01', Registrations: 62 },
    { Date: '2024-03-01', Registrations: 58 },
  ];

  return (
    <Tile>
      <Flex direction="column" gap="small">
        <Text format={{ fontWeight: 'bold' }}>Event registrations</Text>
        <Text variant="microcopy">Jan 2024 - Mar 2024 | Monthly</Text>
        <LineChart
          data={data}
          axes={{
            x: { field: 'Date', fieldType: 'datetime' },
            y: { field: 'Registrations', fieldType: 'linear' },
          }}
          options={{ showTooltips: true }}
        />
      </Flex>
    </Tile>
  );
};
```

### LineChart Guidelines

- **DO:** Title data categories with human-readable text.
- **DO:** Use sentence-casing for categories and chart title.
- **DO:** Pre-sort data chronologically before passing.
- **DO:** Show the legend when graphing multiple lines.
- **DON'T:** Use more than 14 data categories unless unavoidable.
- **DON'T:** Use the same colors for different data categories.

---

## Statistics

> Visual spotlight for single-number KPIs with optional trend indicators.

```jsx
import { Statistics, StatisticsItem, StatisticsTrend } from '@hubspot/ui-extensions';
```

### StatisticsItem Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | String | Unique identifier for the statistic item. |
| `label` | String | Label text displayed above the number. |
| `number` | String \| Number | Primary number displayed prominently. Must be a direct primitive value/ref — not a nested `Text`, `Inline`, object, or child node. |

### StatisticsTrend Props

| Prop | Type | Description |
|------|------|-------------|
| `color` | `'red'` \| `'green'` | Color of the trend arrow. |
| `direction` | `'increase'` (default) \| `'decrease'` | Direction of the trend arrow. |
| `value` | String | Text displayed as the trend value (e.g., `"12%"`). |

### Studio JSON: currency strings and `$` references

In Studio specs, strings that look like `$identifier.path` are parsed as data/state/item references. Currency literals like `"$1,240,000"` are valid strings for `StatisticsItem.number` because they don't match the reference shape.

Use either of these:

```json
// Best: keep the display label in data, then reference it.
{
  "data": { "revenueLabel": "$1.24M" },
  "elements": {
    "revenue-stat": {
      "type": "StatisticsItem",
      "label": "Revenue",
      "number": "$data.revenueLabel"
    }
  }
}

// Or hardcode the display string directly.
{ "type": "StatisticsItem", "label": "Revenue", "number": "$1.24M" }
```

Don't wrap `number` in an object; `StatisticsItem.number` only accepts a string or number.

### Trend Variants

- `increase`: upward arrow for additions or positive progression.
- `decrease`: downward arrow for subtractions or negative progression.

**Note:** The trend direction is purely numerical (up/down). A decrease in support volume could be positive news but will still show a downward red arrow. Be mindful of how direction communicates sentiment.

### Basic Example

```jsx
const Extension = () => {
  return (
    <Statistics>
      <StatisticsItem label="Total Revenue" number="$142,500">
        <StatisticsTrend direction="increase" value="12%" />
      </StatisticsItem>
      <StatisticsItem label="New Contacts" number="847">
        <StatisticsTrend direction="increase" value="8%" />
      </StatisticsItem>
      <StatisticsItem label="Support Tickets" number="23">
        <StatisticsTrend direction="decrease" value="15%" />
      </StatisticsItem>
    </Statistics>
  );
};
```

### Statistics with Colored Trends

```jsx
const Extension = () => {
  return (
    <Statistics>
      <StatisticsItem label="Item A Sales" number="10000">
        <StatisticsTrend direction="decrease" value="200%" color="red" />
      </StatisticsItem>
      <StatisticsItem label="Item B Sales" number="100000">
        <StatisticsTrend direction="increase" value="100%" color="green" />
      </StatisticsItem>
    </Statistics>
  );
};
```

### Usage Examples

- Calling out the progress of quarterly sales for a company.
- Monitoring traffic and social media engagement for the month.
- Displaying deal value, contact count, or conversion rate at top of a card.

### Statistics Guidelines

- **DO:** Use `Statistics` when the numbers answer a question the user is actively asking (e.g., "How are we tracking against quota?"). It renders with native HubSpot styling and is more polished than hand-rolled `Tag` + `Text` strips.
- **DO:** Keep statistics labels short and concise.
- **DO:** For currency KPIs in Studio JSON, either hardcode the string directly (`"number": "$1.2M"`) or put the label in `data` and reference it (`"number": "$data.revenueLabel"`).
- **DO:** Place statistics toward the top of a card so users can scan without scrolling.
- **DON'T:** Use `Statistics` just because you have numbers to show. If a value is supplemental context (e.g., total spend, record count), it often belongs inline in a `DescriptionList` property or as microcopy near the relevant table — not spotlighted as a KPI.
- **DON'T:** Hand-roll KPI strips with `Tag` + `Text` when `Statistics` can do the job. The `KPISummaryStrip` common component is a fallback for cases where you need colored badges — but `Statistics` should be tried first.
- **DON'T:** Include more than three statistics per card if possible.
- **DON'T:** Use more than four statistics side by side.
- **DON'T:** Include sensitive data that you don't want all users to see.

---

## ProgressBar

> Visual indicator of progress toward a goal, quota, or capacity limit.

```jsx
import { ProgressBar } from '@hubspot/ui-extensions';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | String | -- | Accessibility label. |
| `maxValue` | Number | `100` | Maximum value of the progress bar. |
| `showPercentage` | Boolean | `false` | Display the completion percentage. |
| `title` | String | -- | Text displayed above the progress bar. |
| `value` | Number | `0` | Current progress value. |
| `valueDescription` | String | -- | Text describing the current state (e.g., `"150 out of 250"`). |
| `variant` | `'success'` (default) \| `'warning'` \| `'danger'` | `'success'` | Color indicating progress sentiment. |

### Variants

- `'success'` (green): Movement toward a positive goal or outcome.
- `'warning'` (yellow): Movement toward a negative outcome or limitation.
- `'danger'` (red): Movement toward an extremely negative outcome or when a limitation has been reached.

### Basic Example

```jsx
const Extension = () => {
  return (
    <ProgressBar
      title="Q4 Sales Goal"
      value={75}
      maxValue={100}
      showPercentage={true}
      valueDescription="$750K of $1M"
      variant="success"
    />
  );
};
```

### Multiple Progress Bars

```jsx
const Extension = () => {
  return (
    <Flex direction="column" gap="medium">
      <ProgressBar
        title="Email sends"
        value={8500}
        maxValue={10000}
        showPercentage={true}
        valueDescription="8,500 of 10,000"
        variant="warning"
      />
      <ProgressBar
        title="API calls"
        value={495000}
        maxValue={500000}
        showPercentage={true}
        valueDescription="495,000 of 500,000"
        variant="danger"
      />
      <ProgressBar
        title="Contacts imported"
        value={2400}
        maxValue={5000}
        showPercentage={true}
        valueDescription="2,400 of 5,000"
        variant="success"
      />
    </Flex>
  );
};
```

### Usage Examples

- Evaluating the sale of products against a quota or goal.
- Communicating the stage progress of a deal or ticket.
- Monitoring the number of support calls or tickets per customer.

### ProgressBar Guidelines

- **DO:** Use `showPercentage` to give users more information about status.
- **DO:** Include `valueDescription` for context (e.g., "150 out of 250").
- **DO:** Match `variant` to business meaning: green for positive goals, yellow for approaching limits, red for exceeded/critical.
- **DON'T:** Use more than 3-4 progress bars in a single card.

---

## DescriptionList

> Pairs of labels and values styled like HubSpot's native property sidebar.

```jsx
import { DescriptionList, DescriptionListItem, Text } from '@hubspot/ui-extensions';
```

### DescriptionList Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'column'` (default) \| `'row'` | `'column'` | Direction that label-value pairs are displayed. |

### DescriptionListItem Props

| Prop | Type | Description |
|------|------|-------------|
| `label` | String | Text to display as the label. |

### DescriptionList vs Other Components

| Use Case | Component | Why |
|----------|-----------|-----|
| Native HubSpot property appearance | `DescriptionList` | Exact match to left-sidebar property styling |
| Editable property values on a record | `CrmPropertyList` | Built-in editing and CRM integration |
| Custom layout with formatted values | Manual `Flex` + `Text` | Full control over layout/formatting |
| Tabular comparison data | `Table` | When you need columns, sorting, pagination |

### Basic Example (Column Layout)

```jsx
const Extension = () => {
  return (
    <DescriptionList direction="column">
      <DescriptionListItem label="First Name">
        <Text>Alan</Text>
      </DescriptionListItem>
      <DescriptionListItem label="Last Name">
        <Text>Turing</Text>
      </DescriptionListItem>
      <DescriptionListItem label="Email">
        <Text>alan@example.com</Text>
      </DescriptionListItem>
    </DescriptionList>
  );
};
```

### Row Layout Example

```jsx
const Extension = () => {
  return (
    <DescriptionList direction="row">
      <DescriptionListItem label="Status">
        <Text>Active</Text>
      </DescriptionListItem>
      <DescriptionListItem label="Plan">
        <Text>Enterprise</Text>
      </DescriptionListItem>
      <DescriptionListItem label="Seats">
        <Text>25</Text>
      </DescriptionListItem>
    </DescriptionList>
  );
};
```

### Variants

- `column` (default): Label-value pairs stacked vertically. Best for sidebar/column layouts.
- `row`: Label-value pairs displayed horizontally. Best for horizontal layouts or summary bars.

### Usage Examples

- Display easy-to-scan information for a sales rep to use on a call.
- Highlight the most recently updated properties on a company record.

### DescriptionList Guidelines

- **DO:** Keep copy succinct, ideally one word each for label and value.
- **DO:** Use `row` direction for horizontal layouts, `column` for vertical.
- **DO:** Include 3-4 items minimum for `direction="row"` — fewer than 3 looks sparse and doesn't justify the component. If you only have 2 properties, consider adding computed values (e.g., total spend, record age) or using inline text instead.
- **DON'T:** Use this component to display long strings of text.
- **DON'T:** Use this component for lists you want to be editable in the UI (use `CrmPropertyList` instead).

---

## ScoreCircle

> Color-coded circular progress indicator for performance metrics (0-100 range).

```jsx
import { ScoreCircle } from '@hubspot/ui-extensions';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `score` | Number | Yes | Score value to display. Must be between 0 and 100. Decimals are rounded down automatically. |

### Score Value Color Coding

Colors are applied automatically based on the score value:

| Range | Color | Status |
|-------|-------|--------|
| >= 66 | Green | Success |
| >= 33 and < 66 | Yellow | Warning |
| < 33 | Red | Alert |

### Error Handling

- **Score < 0 or > 100:** An error is logged and the component displays `--` instead of the score.
- **Decimal score:** Automatically rounded down to the nearest integer with a warning logged.

### Accessibility

The `ScoreCircle` component includes built-in accessibility:
- Uses the `meter` ARIA role for scalar measurement indication.
- Provides `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes.
- Includes an accessible label describing the score value or error state.

### Basic Example

```jsx
import { ScoreCircle, Flex, Text } from '@hubspot/ui-extensions';

const Extension = () => {
  return (
    <Flex direction="row" gap="large" justify="center">
      <Flex direction="column" align="center" gap="extra-small">
        <ScoreCircle score={85} />
        <Text>Health Score</Text>
      </Flex>
      <Flex direction="column" align="center" gap="extra-small">
        <ScoreCircle score={62} />
        <Text>Engagement</Text>
      </Flex>
      <Flex direction="column" align="center" gap="extra-small">
        <ScoreCircle score={25} />
        <Text>Risk Level</Text>
      </Flex>
    </Flex>
  );
};
```

### Usage Examples

- Completion percentages for tasks or projects.
- Quality scores or performance metrics.
- Health scores or ratings.

### ScoreCircle Guidelines

- **DO:** Provide context around the score with additional text or labels.
- **DO:** Use the automatic color coding to communicate status at a glance.
- **DON'T:** Use `ScoreCircle` for values outside the 0-100 range.

---

## Combining Data Display Components

A common pattern is to combine multiple data display components in a single card for a dashboard-like experience.

### KPI Dashboard Pattern

<!-- archetype: kpi-snapshot, chart-forward -->
```jsx
import {
  Statistics, StatisticsItem, StatisticsTrend,
  ProgressBar, LineChart, Flex, Divider,
} from '@hubspot/ui-extensions';

const Extension = () => {
  const trendData = [
    { Month: 'Jan', Revenue: 85000 },
    { Month: 'Feb', Revenue: 92000 },
    { Month: 'Mar', Revenue: 105000 },
  ];

  return (
    <Flex direction="column" gap="medium">
      {/* KPI spotlight at top */}
      <Statistics>
        <StatisticsItem label="Q1 Revenue" number="$282K">
          <StatisticsTrend direction="increase" value="18%" />
        </StatisticsItem>
        <StatisticsItem label="New Deals" number="47">
          <StatisticsTrend direction="increase" value="12%" />
        </StatisticsItem>
      </Statistics>

      <Divider />

      {/* Goal tracking */}
      <ProgressBar
        title="Annual target"
        value={282000}
        maxValue={1000000}
        showPercentage={true}
        valueDescription="$282K of $1M"
        variant="success"
      />

      <Divider />

      {/* Trend chart */}
      <LineChart
        data={trendData}
        axes={{
          x: { field: 'Month', fieldType: 'category' },
          y: { field: 'Revenue', fieldType: 'linear', label: 'Revenue ($)' },
        }}
        options={{
          title: 'Monthly revenue trend',
          showTooltips: true,
        }}
      />
    </Flex>
  );
};
```

---

## Related Files

- [tables.md](./tables.md) -- Table component for detailed tabular data
- [status-and-tags.md](./status-and-tags.md) -- StatusTag and Tag for categorical status indicators
- [crm-components.md](./crm-components.md) -- CrmStatistics, CrmReport, CrmPropertyList
- [layout.md](./layout.md) -- Flex, Tile, Box, Divider for structuring card layouts
