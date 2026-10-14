# Component Quick Reference

> Flat lookup table: component name → file → when to use → when NOT to use.
>
> Import all standard components from `@hubspot/ui-extensions`.
> Import CRM components from `@hubspot/ui-extensions/crm`.

---

## Layout Components

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `Flex` | layout.md | Any horizontal/vertical layout | — (primary layout primitive) |
| `AutoGrid` | layout.md | Responsive multi-column grids, triage tile grids, image galleries | Fixed horizontal bars (use Flex row) |
| `Box` | layout.md | Fine-tuning flex ratios (3:1 splits) | Outside of Flex (does nothing standalone) |
| `Inline` | layout.md | Grouping children inside `justify="between"` parent | All other horizontal layouts (use Flex row) |
| `Tile` | layout.md | Bordered container, charts, tabbed cards, triage cards | Needs onClick (Tile doesn't support it) |
| `Divider` | gotchas.md | Visual separator between sections | Stacking multiple (one is enough) |
| `Spacer` | gotchas.md | One-off vertical spacing adjustment | Uniform spacing (use Flex with gap) |

## Buttons & Actions

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `Button` | buttons-and-actions.md | Standard actions, overlays, form submit | Clickable text that must align with sibling text (use Link) |
| `ButtonRow` | buttons-and-actions.md | Row of 2-3 buttons with overflow dropdown | More than 3 buttons |
| `LoadingButton` | buttons-and-actions.md | Async actions with loading state + optional overlay after load | Simple non-async actions |
| `Dropdown` | buttons-and-actions.md | Multi-action menus, table row actions | Single action (use Button/Link) |
| `Dropdown.ButtonItem` | buttons-and-actions.md | Individual items inside a Dropdown | — |

## Data Display

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `Statistics` / `StatisticsItem` | data-display.md | KPI spotlight (big number hero) | Number is supplemental context (use DescriptionList) |
| `StatisticsTrend` | data-display.md | Trend arrows inside Statistics | — |
| `ProgressBar` | data-display.md | Progress toward goal, capacity, adoption score | Inside table cells (too cramped — use text), more than 1 per card |
| `DescriptionList` | data-display.md | Label-value pairs (3-6 items), native property sidebar look | Tabular data (use Table), editable values (use CrmPropertyList) |
| `ScoreCircle` | data-display.md | Performance score 0-100 | Values outside 0-100 range |
| `BarChart` | data-display.md | Comparing categories (products, reps, stages) | Time series (use LineChart) |
| `LineChart` | data-display.md | Trends over time | Categorical comparisons (use BarChart) |

## Tables & Boards

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| **DataTable** (`hs-uix/datatable`) | tables.md | **Default for any table.** Filter/sort/paginate/inline edit/grouping/selection | — |
| **Kanban** (`hs-uix/kanban`) | kanban.md | Stage-based board view with filters, metrics, card actions | Flat lists (use DataTable) |
| **KanbanCardActions** (`hs-uix/kanban`) | kanban.md | Per-card action bar inside Kanban footer | Outside a Kanban card |
| **Feed** (`hs-uix/feed`) | feed.md | Chronological activity timeline / audit log / recent events, with date grouping | Side-by-side attribute compare (use DataTable) |
| **Calendar** (`hs-uix/calendar`) | calendar.md | Events plotted on a month/week/day/agenda view | Flat or stage data (use DataTable/Kanban) |
| **CrmDataTable** (`hs-uix/utils`) | crm-data.md | DataTable bound to live CRM search (objectType + properties) | Data already in hand (use DataTable) |
| **CrmKanban** (`hs-uix/utils`) | crm-data.md | Kanban bound to live CRM search | Data already in hand (use Kanban) |
| `Table` | tables.md | **Escape hatch only** — raw tabular layout hs-uix can't express | Standard list card (use DataTable) |
| `TableHead` / `TableHeader` / `TableBody` / `TableRow` / `TableCell` / `TableFooter` | tables.md | Building blocks for raw `Table` | Inside a DataTable (handled internally) |
| `SearchInput` | tables.md | Search field for raw `Table`; built into DataTable | — |

## Forms & Inputs

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| **FormBuilder** (`hs-uix/form`) | forms.md | **Default for any form.** Config-driven fields, validation, wizards, repeaters, conditional visibility | Single-field inline edit (use raw Input) |
| **CrmLookupSelect** (`hs-uix/common-components`) | crm-data.md | CRM-backed Select/MultiSelect with debounced live search (objectType + properties) | Static option list (use Select/MultiSelect) |
| **CrmRecordPicker** (`hs-uix`) | crm-data.md | Record picker with descriptions, multi + max, inline create | Plain select bound to one state key (use CrmLookupSelect) |
| **DateRangePicker** (`hs-uix`) | forms.md | Date filtering: presets, rolling ranges, from/to, operator select | Single fixed date entry (use DateInput) |
| **FilterBuilder** (`hs-uix`) | forms.md | Nested AND/OR advanced-filter tree over property list | One-property filters (use Select / DateRangePicker) |
| `FileUpload` (experimental) | files.md | Upload attachments to the portal file manager, optional attach-to-record | Static imagery (use Image) |
| `Form` | forms.md | **Escape hatch** — one or two inputs hand-wired | Anything with 3+ fields or validation (use FormBuilder) |
| `Input` | forms.md | Short text (name, email, single line) | Long text (use TextArea), dates (use DateInput) |
| `TextArea` | forms.md | Multi-line text (notes, comments) | Short values |
| `Select` | forms.md | Single choice from 4+ options | Multiple choices (use MultiSelect), 2-3 options (use ToggleGroup) |
| `MultiSelect` | forms.md | Multiple choices from a list | Single choice |
| `NumberInput` | forms.md | Numeric values with optional min/max | Needs +/- buttons (use StepperInput) |
| `StepperInput` | forms.md | Increment/decrement by fixed step | — |
| `CurrencyInput` | forms.md | Monetary amounts | — |
| `DateInput` | forms.md | Calendar date picker | Never use plain Input for dates |
| `Checkbox` | forms.md | Single boolean agreement/opt-in | Multiple checkboxes (use ToggleGroup) |
| `Toggle` | forms.md | Boolean on/off switch | — |
| `ToggleGroup` | forms.md | 2-6 radio or checkbox options | Long lists (use Select), read-only (use BoolItem) |
| `RadioButton` | forms.md | Standalone radio (rare) | 2+ options (use ToggleGroup) |

## Navigation

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `Tabs` / `Tab` | navigation.md | Mutually exclusive content sections, 2-7 views | Content that needs to be open simultaneously (use Accordion) |
| `Accordion` | navigation.md | Progressive disclosure, supplemental sections | Primary/main content (use header row instead) |
| `StepIndicator` | navigation.md | Multi-step wizard, linear progress | Non-linear completion (build custom timeline) |

## Status & Tags

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| **AutoTag** (`hs-uix/common-components`) | status-and-tags.md | `Tag` with variant inferred from the value string (e.g. `"Enterprise"` → info) | You need a specific variant that doesn't match the value |
| **AutoStatusTag** (`hs-uix/common-components`) | status-and-tags.md | `StatusTag` with variant inferred from the value (e.g. `"At risk"` → warning) | Filter chips (use neutral Tag) |
| `Tag` | status-and-tags.md | Categorization, filter chips, count badges | Replacing buttons/links |
| `StatusTag` | status-and-tags.md | Colored dot status indicator (active/warning/danger) | Filter chips (use neutral Tag instead) |

## States

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `LoadingSpinner` | states.md | Async operations, initial data fetch | — |
| **Spinner** (`hs-uix/common-components`) | states.md | Inline, low-key braille/unicode "still working" indicator | Card/panel-level loading (use LoadingSpinner) |
| `EmptyState` | states.md | No data to display | Entire card empty (show CRM identity first) |
| `ErrorState` | states.md | Fatal errors, permission denied, feature unavailable | Inline errors (use Alert) |
| `Alert` | states.md | Inline contextual messages needing attention | Every state (not a mood ring), after triage tiles (redundant) |

## Typography

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `Text` | typography.md | All text display | Primary titles (use Heading), errors (use Alert) |
| `Heading` | typography.md | Primary section/card title | Paragraphs, long sentences, multiple per section |
| `Link` | typography.md | Navigation, overlay triggers, inline clickable text | — |
| `List` | typography.md | Ordered/unordered lists, inline-divided navigation | — |
| `Tooltip` | typography.md | Additional context on hover (via `overlay` prop) | Standalone (must be on Button/Link/Tag/Image/LoadingButton) |
| **SectionHeader** (`hs-uix/common-components`) | typography.md | Title + description + actions row above a block | Inside Accordion/Panel that already renders its own title |
| **KeyValueList** (`hs-uix/common-components`) | data-display.md | Label-value rows (shorthand over `DescriptionList`) | Editable (use CrmPropertyList) |
| **StyledText** (`hs-uix/common-components`) | typography.md | Rotated text, pill backgrounds, custom glyph colors that native `<Text>` can't express | Copy-paste-able text (use native `<Text>`) |

## Media

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `Image` | media.md | Photos, logos, visual assets | Icons (use Icon), HubSpot graphics (use Illustration) |
| `Icon` | media.md | Inline visual indicators, action icons (140+ available) | Inside `<Text>` (use Flex row instead) |
| `Illustration` | media.md | Empty states, onboarding, decorative graphics (29+ available) | Data-dense areas |
| **AvatarStack** (`hs-uix/common-components`) | media.md | Overlapping avatars (letters / image URLs / mixed) with `+N` overflow chip | Single user with name (use `Flex + Image + Text` inline) |
| `FileViewer` (experimental) | files.md | List files uploaded by this app (attachment cards or compact links) | Arbitrary portal files (only sees this app's uploads) |

## CRM Components (import from `@hubspot/ui-extensions/crm`)

| Component | File | Use when... | Don't use when... |
|---|---|---|---|
| `CrmPropertyList` | crm-components.md | Editable CRM properties with native styling | Read-only display (use DescriptionList or CrmDataHighlight) |
| `CrmStageTracker` | crm-components.md | Deal/ticket pipeline progress bar | Non-pipeline objects |
| `CrmDataHighlight` | crm-components.md | Read-only key metrics matching sidebar style | Editable properties (use CrmPropertyList) |
| `CrmAssociationTable` | crm-components.md | Table of associated records with built-in pagination | Custom table layouts for associations |
| `CrmAssociationPivot` | crm-components.md | Associated records grouped by label | Flat association list (use CrmAssociationTable) |
| `CrmReport` | crm-components.md | Embedding existing HubSpot reports | Custom chart needs (use BarChart/LineChart) |
| `CrmStatistics` | crm-components.md | Aggregated stats from associated records | Manual calculations (use Statistics) |
| `CrmActionLink` | crm-components.md | Inline text link triggering CRM actions (preview, email, etc.) | — |
| `CrmActionButton` | crm-components.md | Button triggering CRM actions | — |
| `CrmCardActions` | crm-components.md | Top-right card action buttons/dropdown | — |

## Utils (`hs-uix/utils`)

| Helper | File | Use for... |
|---|---|---|
| `formatCurrency`, `formatCurrencyCompact` | utils.md | Money in cells, footers, tiles |
| `formatDate`, `formatDateTime` | utils.md | Dates in cells, card metadata |
| `formatPercentage` | utils.md | Percentages with locale-aware formatting |
| `buildOptions`, `findOptionLabel` | utils.md | Turn raw arrays into `{label, value}` for `Select` / `MultiSelect` |
| `getAutoTagVariant`, `createStatusTagSortComparator` | utils.md | Variant inference in custom cells; sort-by-color-then-alpha |
| `sumBy` | utils.md | Footer totals, header metric aggregates |
| `formatDateTime`, `formatPercentage` | utils.md | Timestamps; locale-aware percentages (takes a ratio) |
| `isDateValueObject`, `isTimeValueObject`, `isDateTimeValueObject` | utils.md | Detect HubSpot structured date/time values in `filterFn` / `sortComparator` |
| `deriveCardFieldsFromColumns` | utils.md | Project a DataTable `columns` config into Kanban `cardFields` |
| `buildActiveFilterChips`, `resetFilterValues`, `filterRows`, `searchRows` | utils.md | Query plumbing for **custom** collection views (CollectionToolbar) — packaged components do this internally |
| `CrmDataTable`, `CrmKanban`, `useCrmSearch*` | crm-data.md | Live CRM-bound table/board + the search hooks behind them |

---

## Deprecated / Removed Components

| Was | Use Instead | See |
|---|---|---|
| `common-components/DataTable` | `DataTable` from `hs-uix/datatable` | tables.md |
| `common-components/FilterBar` | Built into `hs-uix` `DataTable` | tables.md |
| `common-components/AvatarName` | `Flex + Image borderRadius="circle" + Text` inline, or `AvatarStack` from `hs-uix/common-components` | media.md |
| `common-components/Section` | `Accordion size="sm"` directly, or `SectionHeader` from `hs-uix/common-components` for non-collapsible headers | navigation.md |
| `common-components/SectionBreak` | `Divider` + `Spacer` (see gotchas.md) | gotchas.md |
| `common-components/BoolItem` | `Text` with `"[x]"` / `"[ ]"` prefix inline | forms.md |
| `common-components/ConditionalLink` | Ternary on the value: `value > 0 ? <Link>…</Link> : <Text>--</Text>` | typography.md |
| SummaryRow | `DescriptionList` + `DescriptionListItem` (or `KeyValueList` from `hs-uix`) | data-display.md |
| LinkRow | `DescriptionList` with `Link` children | data-display.md |
| TwoColumnRow | `AutoGrid columnWidth={250} flexible={true}` | layout.md |
| StatusDot | `StatusTag` / `AutoStatusTag` + `CrmActionLink` | status-and-tags.md |
| InfoTooltip | `Link overlay={<Tooltip>}` + `Icon` | typography.md |
| ActionCard | `Tile` + `Illustration` + `Button` | states.md |
| KPISummaryStrip | `Statistics` + `StatisticsItem` | data-display.md |
