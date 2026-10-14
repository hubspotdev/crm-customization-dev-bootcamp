# Rules Reference

> Every hard constraint from the UI Extensions standards in one place.
> **Severity:** `error` = will break the card or violate HubSpot guidelines. `warn` = will degrade UX or look wrong.
>
> Rules are written for the **JSON spec format** Studio emits — props appear as JSON keys (`"variant": "primary"`), not JSX attributes. Anything that only makes sense in the hand-written React/TSX export is out of scope for Studio and has been removed.

---

## Buttons & Actions

| ID | Sev | Rule | Source |
|---|---|---|---|
| BTN-01 | error | Only ONE `variant="primary"` button per card/panel/modal | buttons-and-actions.md |
| BTN-02 | error | Destructive button must be paired with secondary (for cancel), never with primary | buttons-and-actions.md |
| BTN-03 | warn | Button text: 2-4 words, sentence-casing | buttons-and-actions.md |
| BTN-04 | warn | Use default button size (`"med"`), not `"small"`, unless genuinely space-constrained | buttons-and-actions.md |
| BTN-05 | warn | External links must use `external: true` to open in new tab | buttons-and-actions.md |
| BTN-06 | warn | Max 3 buttons in a ButtonRow | buttons-and-actions.md |
| BTN-07 | warn | Don't use more than two secondary buttons in a single extension | buttons-and-actions.md |
| BTN-08 | warn | Use `disabled` for unavailable actions — don't hide them | buttons-and-actions.md |
| BTN-09 | warn | Section-level primary action: title left, button right via `justify="between"` — not in filter bar, not at card level | buttons-and-actions.md |
| BTN-10 | warn | "View more" pagination: `variant="transparent" size="small"`, 5 items initial, hide when all visible | buttons-and-actions.md |
| BTN-11 | error | `copyTextToClipboard` must be wired to a user action (onClick/$action) — never fired on render | buttons-and-actions.md |
| BTN-12 | warn | Dropdown: keep to 2-5 actions; beyond that, use a Panel | buttons-and-actions.md |
| BTN-13 | warn | In-table dropdowns: `variant="transparent"` + `buttonSize="xs"` | buttons-and-actions.md |
| BTN-14 | warn | View toggle: use icon-only button (settings gear), not text label — text looks like navigation, not a mode toggle | buttons-and-actions.md |
| BTN-15 | warn | Icon-labelled Button: Icon + label as direct sibling children, no Flex wrapper. Spec form: `{"type":"Button","children":[{"type":"Icon","name":"add"},"Log delay"]}`. | buttons-and-actions.md |
| BTN-16 | warn | Button vs Link vs Text+Icon: Button for main/destructive actions only; Link for row-level/secondary actions; Text+Icon in Flex for non-interactive status cues. If a card needs a 3rd button, at least two should be Links. | buttons-and-actions.md |
| BTN-17 | error | Dropdown menu item type is exactly `"Dropdown.ButtonItem"` — capital I in `Item`. Never emit the typo `"Dropdown.Buttonltem"` (lowercase L). | buttons-and-actions.md |

## Layout

| ID | Sev | Rule | Source |
|---|---|---|---|
| LAY-01 | warn | Card root container: `Flex direction="column" gap="sm"` | layout.md |
| LAY-02 | warn | Section internals: `gap="xs"` between label/value rows | layout.md |
| LAY-03 | warn | Don't nest Flex > Flex > Flex more than 3 deep — extract a component | layout.md |
| LAY-04 | warn | `width="100%"` does nothing — use `Box flex={1}` instead | layout.md |
| LAY-05 | warn | Visual hierarchy: visually dominant components (Alert, banner) before quiet ones (DescriptionList) | layout.md |
| LAY-06 | warn | AutoGrid: `columnWidth={250}` is standard for two-column layouts, always use `flexible={true}` | layout.md |
| LAY-07 | warn | Box only works inside Flex — does nothing standalone | layout.md |
| LAY-08 | warn | Use `Inline` (not nested Flex) inside `justify="between"` parents — Flex collapses spacing | layout.md |
| LAY-09 | warn | `Tile compact={true}` for CRM sidebar cards | layout.md |
| LAY-10 | warn | Tile does NOT accept `onClick` — put interactive elements inside it | layout.md |
| LAY-11 | warn | Keep triage tiles lean: identifier → status Tag → action. No secondary metadata. | layout.md |
| LAY-12 | warn | One Tag per tile at `columnWidth={250}` — two Tags truncate | layout.md |
| LAY-13 | warn | Sort triage tiles by actionability, not alphabetically | layout.md |

## Overlays

| ID | Sev | Rule | Source |
|---|---|---|---|
| OVL-01 | error | Panel must be top-level — cannot be inside Flex, Box, or wrappers | overlays.md |
| OVL-02 | error | Every Cancel button must call `actions.closeOverlay(panelId)` | overlays.md |
| OVL-03 | error | PanelFooter: use `Flex direction="column"` wrapper (full-width hack) — `direction="row"` shrinks to content | overlays.md |
| OVL-04 | warn | Use `variant="modal"` on Panel for accessibility (blur + focus trap) | overlays.md |
| OVL-05 | warn | Use `flush={true}` on **Panel** for edge-to-edge content, not on PanelSection | overlays.md |
| OVL-06 | warn | Every Panel needs a unique `id` for `closeOverlay` | overlays.md |
| OVL-07 | warn | Modal for ≤3 field focused actions, Panel for browsing/multi-step | overlays.md |
| OVL-08 | warn | PanelFooter `justify="between"` works with flat children but breaks with nested Flex — use `Inline` | overlays.md |
| OVL-09 | warn | Link (not Button `variant="transparent"`) when clickable text must align with sibling text | overlays.md |
| OVL-10 | warn | Panel `flush={true}` may be rejected by linter — omit if so, default padding is acceptable for detail panels | overlays.md |
| OVL-11 | error | Panel children must be `[PanelBody, PanelFooter]` (or just `PanelBody`). Never put Flex/Box/DescriptionList/Text as direct children of Panel — #1 source of "the margin is all off" bugs. Most panel content should be direct children of `PanelBody`; use `PanelSection` inside `PanelBody` only when you intentionally want the extra native section padding. | overlays.md |
| OVL-12 | error | Modal children must be `[ModalBody, ModalFooter]` (or just `ModalBody`). Never put content as direct children of Modal. | overlays.md |
| OVL-13 | warn | `PanelSection` adds substantial native padding. Avoid it for normal compact detail panels; put content directly in `PanelBody` unless you explicitly want separated padded sections. | overlays.md |

## Tables

| ID | Sev | Rule | Source |
|---|---|---|---|
| TBL-00 | error | Default to `DataTable` from `hs-uix/datatable` for any list/search/filter/sort/edit surface. Never emit raw `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`, or `TableFooter` nodes in a spec — DataTable can express everything they can (sortable columns, per-row tags/overlays via `renderCell` + `$render`, total-row footers, built-in search and filters). TBL-01…TBL-15 describe the raw-table escape hatch; DataTable enforces them internally. | tables.md |
| TBL-01 | error | Always set `width` on `TableHeader` — omitting causes unpredictable sizing | tables.md |
| TBL-02 | error | Match `TableCell` width to its `TableHeader` for the same column | tables.md |
| TBL-03 | warn | Prefer `"min"` as default column width — `"auto"` is greedy | tables.md |
| TBL-04 | warn | Reset page to 1 when sort, filter, or search changes | tables.md |
| TBL-05 | warn | Use `sortDirection="never"` on non-sortable columns (actions, checkboxes) | tables.md |
| TBL-06 | warn | Don't render blank tables — use `EmptyState` when no data | tables.md |
| TBL-07 | warn | In-row buttons: `xs` size, `secondary` variant, right-aligned | tables.md |
| TBL-08 | warn | Use default Text in table cells — NOT `variant="microcopy"` | tables.md |
| TBL-09 | warn | Empty table cells: `"--"` (double dash), never blank/null | tables.md |
| TBL-10 | warn | Tables with 5+ rows should have a SearchInput | card-building-process.md |
| TBL-11 | warn | Remove action columns when a triage section handles the action | tables.md |
| TBL-12 | warn | Filter Select: use `variant="transparent"` with no label for lightweight inline appearance | tables.md |
| TBL-13 | warn | Default to `"multiselect"` over `"select"` for filters — users often want to combine values (Failed + Pending). Only use `"select"` when options are mutually exclusive. | tables.md |
| TBL-14 | warn | Direction/flow as its own column with arrow characters (`→`, `←`, `↔`) — don't prefix another field with a sync icon | tables.md |
| TBL-15 | warn | Configuration tables (mappings, settings) can use full-size `Button variant="secondary"` — not always `xs` | tables.md |
| TBL-16 | error | DataTable spec-format gotchas: prop name is `data` (NOT `rows`); column key is `field` (NOT `name`). Wrong name = silent validation failure or empty table. | tables.md |
| TBL-17 | error | For `renderCell` that references `$row.*` (including inside overlays/panels nested in the cell), bind both args: `{"$render": ["value", "row"], ...}`. Binding only `"value"` leaves `$row.*` undefined — overlay contents render empty. | tables.md |

## Data Display

| ID | Sev | Rule | Source |
|---|---|---|---|
| DAT-01 | warn | One component per metric — don't show same number in StatisticsItem AND ProgressBar | data-display.md |
| DAT-02 | warn | Statistics leads, DescriptionList follows (big numbers first, quiet context second) | data-display.md |
| DAT-03 | warn | ProgressBar as card hero when primary question is "how much progress?" — above DescriptionList | data-display.md |
| DAT-04 | warn | One ProgressBar per card — subsections use text counts instead | data-display.md |
| DAT-05 | error | ProgressBar does NOT fit in TableCells — use plain text percentage instead | data-display.md |
| DAT-05A | error | Selectable DataTable rows must each include a stable unique `id` string; duplicate/missing row IDs make row checkbox selection behave like select-all | tables.md |
| DAT-06 | warn | Don't split DescriptionList into multiple components — one list, let HubSpot handle wrapping | data-display.md |
| DAT-07 | warn | DescriptionList `direction="row"` needs 3-4 items minimum — fewer than 3 looks sparse | data-display.md |
| DAT-08 | warn | Max 3 StatisticsItems per card, max 4 side by side | data-display.md |
| DAT-09 | warn | Charts live inside `Tile` containers with title/subtitle | data-display.md |
| DAT-10 | warn | Pre-sort chart data before passing — charts render in provided order | data-display.md |
| DAT-11 | warn | Max 14 data categories in a chart | data-display.md |
| DAT-12 | warn | Use larger surfaces (middle column) for charts with many data points | data-display.md |
| DAT-13 | warn | Statistics for aggregate KPIs when per-group breakdown lives elsewhere (tab badges). Tile grid when each group needs its own actions/identity. | data-display.md |
| DAT-14 | error | `StatisticsTrend.direction` accepts only `"increase"` or `"decrease"` — not `"increasing"`/`"decreasing"` or any other verb form. | data-display.md |
| DAT-15 | error | `DescriptionListItem.label` is a String only — it doesn't accept nodes. To include an icon with a value, put `Flex[Icon, Text]` in the item's children (value slot); keep `label` as plain text. | data-display.md |
| DAT-16 | error | `StatisticsItem.number` must be a direct string/number — not a nested object, `Text`, or `Inline`. Currency strings like `"$1.24M"` are valid literals; reference-shaped strings like `"$data.revenueLabel"` resolve from data. | data-display.md, gotchas.md |

## Forms

| ID | Sev | Rule | Source |
|---|---|---|---|
| FRM-00 | warn | Default to `FormBuilder` from `hs-uix/form` for any form with 3+ fields, validation, conditional fields, or multi-step flow. Raw `Form` + `Input` is the escape hatch. | forms.md |
| FRM-01 | error | Always use `DateInput` (or FormBuilder `type: "date"`) — never plain `Input` with date placeholder | forms.md |
| FRM-02 | warn | Labels on every field — no placeholder-only inputs | forms.md |
| FRM-03 | warn | Submit button always at the bottom of the form | forms.md |
| FRM-04 | warn | Close overlay after successful save: `actions.closeOverlay(id)` | forms.md |
| FRM-05 | warn | Show loading state on save button to prevent double-submit | forms.md |
| FRM-06 | warn | Form fields in `Flex direction="column" gap="sm"` (for raw `Form`; FormBuilder handles layout) | forms.md |
| FRM-07 | warn | ToggleGroup for 2-6 options; Select for 4+ options | forms.md |
| FRM-08 | warn | Toggle for immediate on/off state (enable mapping, activate feature). Checkbox for deferred form submission or multi-select (bulk row selection). | forms.md |
| FRM-09 | warn | Shape `Select` / `MultiSelect` options with `buildOptions` from `hs-uix/utils` — don't hand-roll `.map(r => ({ label: r.name, value: r.id }))` | utils.md |
| FRM-10 | warn | For 4+ columns of fields, use `columnWidth` (AutoGrid) over fixed `columns` so narrow viewports degrade gracefully | forms.md |

## Kanban

| ID | Sev | Rule | Source |
|---|---|---|---|
| KBN-01 | warn | Default to `Kanban` from `hs-uix/kanban` for stage-based board views — don't hand-roll `Flex` columns with per-card `Select` | kanban.md |
| KBN-02 | warn | Stage variants follow semantics: `success` = won/complete, `warning` = needs decision, `info` = in progress, `default` = lost/dropped. Don't paint every stage `info`. | kanban.md |
| KBN-03 | warn | Mark terminal stages with `terminal: true` (won/lost/archived) — drives metrics and future UI affordances | kanban.md |
| KBN-04 | warn | Cap `metrics` at 4–6 items; use a `ReactNode` for anything richer | kanban.md |
| KBN-05 | warn | Share DataTable config via `deriveCardFieldsFromColumns` when offering a table-and-board toggle — don't duplicate column / card logic | kanban.md |
| KBN-06 | warn | `stageControl="none"` for read-only boards — don't rely on UI discipline to prevent changes; remove the affordance | kanban.md |
| KBN-07 | warn | `compact` density for high-volume boards (leads, tickets, tasks); `comfortable` for deals / accounts | kanban.md |
| KBN-08 | warn | One stage-transition prompt per stage (`onEnterRequired.render`) — don't chain prompts | kanban.md |

## Utils & Formatting

| ID | Sev | Rule | Source |
|---|---|---|---|
| UTL-01 | warn | No hand-rolled `formatCurrency` / `formatDate` / `formatPercentage` — import from `hs-uix/utils` | utils.md |
| UTL-02 | warn | Prefer `formatCurrencyCompact` in tight surfaces (Statistics tiles, Kanban headers, card meta) | utils.md |
| UTL-03 | warn | No ad-hoc status-to-variant switch maps — use `AutoTag` / `AutoStatusTag` / `getAutoTagVariant` | status-and-tags.md |
| UTL-04 | warn | No `rows.reduce((s, r) => s + (r.amount ?? 0), 0)` — use `sumBy` from `hs-uix/utils` | utils.md |
| UTL-05 | warn | Use `isDateValueObject` / `isTimeValueObject` / `isDateTimeValueObject` to distinguish HubSpot value objects from raw strings in `filterFn` / `sortComparator` | utils.md |

## States & Alerts

| ID | Sev | Rule | Source |
|---|---|---|---|
| STA-01 | warn | Alert is NOT a mood ring — only show when something needs action | states.md |
| STA-02 | warn | If ProgressBar at 100% communicates success, don't add a success Alert | states.md |
| STA-03 | warn | Alert becomes redundant after triage tiles — move coaching to detail overlay | states.md |
| STA-04 | warn | Empty state: show CRM record identity (DescriptionList) above EmptyState | states.md |
| STA-05 | warn | Warning banner: place at top of extension, include actionable Link/Button | states.md |
| STA-06 | warn | Time-sensitive alerts above DescriptionList — don't bury urgent info | states.md |

## Status & Tags

| ID | Sev | Rule | Source |
|---|---|---|---|
| TAG-01 | error | Red (`"error"` / `"danger"`) only for problems/urgency — never neutral categories | status-and-tags.md |
| TAG-02 | warn | Filter chips use neutral `Tag` (grey `"default"`), not colored StatusTag | status-and-tags.md |
| TAG-03 | warn | Don't use `inline={true}` on Tags inside Flex rows — Flex handles layout | status-and-tags.md |
| TAG-04 | warn | Tag uses `"error"` for red; StatusTag uses `"danger"` for red — don't mix them up | status-and-tags.md |
| TAG-05 | warn | Don't mix Tag and StatusTag in the same count indicator row | status-and-tags.md |
| TAG-06 | warn | Max 4-5 KPI segments in a summary strip | status-and-tags.md |
| TAG-07 | warn | Always pass label as `StatusTag` children — never childless `StatusTag` + `Text` in Flex row (gap always wrong) | status-and-tags.md |
| TAG-08 | warn | Don't use `Tag` for informational classification (type labels) — plain Text keeps hierarchy clean. Tags earn color only when category drives action. | status-and-tags.md |
| TAG-09 | warn | **Default to `StatusTag` over `Tag`.** Tag is a decorative label with no semantics — it turns a text string into a pill. StatusTag carries a `variant` (`success`/`warning`/`danger`/`info`/`default`) that conveys state at a glance, which is almost always more useful than a colored label. Reach for Tag only for genuinely categorical, non-stateful groupings (filter chips per TAG-02, topic labels). If the value maps to good/bad/pending/attention, it's a StatusTag. | status-and-tags.md |
| TAG-10 | warn | Prefer `AutoStatusTag` (from `hs-uix/status-tag`) when the variant follows a known value-to-state mapping (payment status, deal stage, ticket priority). It picks the right variant from the value string and keeps the mapping consistent across cards — cross-reference UTL-03. | status-and-tags.md |
| TAG-11 | warn | Avoid redundant label+tag pairs: if a row already has a "Status" column or heading, the StatusTag's children should be the state name alone (`"Paid"`, `"Overdue"`), not `"Status: Paid"`. The variant + placement already communicate "this is a status." | status-and-tags.md |
| TAG-12 | error | `Tag.variant` is **only** `"default" \| "info" \| "success" \| "warning" \| "error"`. `StatusTag.variant` is **only** `"default" \| "info" \| "success" \| "warning" \| "danger"`. **`"subtle"` is not a valid variant on either** — common hallucination, do not emit it. For a low-emphasis chip use `"default"`. | status-and-tags.md |

## Navigation

| ID | Sev | Rule | Source |
|---|---|---|---|
| NAV-01 | warn | Accordion `size="sm"` is standard for CRM card content | navigation.md |
| NAV-02 | warn | Accordion `defaultOpen` driven by data (computed boolean), not static true/false | navigation.md |
| NAV-03 | warn | Don't wrap primary content in Accordion — only supplemental sections | navigation.md |
| NAV-04 | warn | Keep accordion titles short — no metadata, counts, or status in title | navigation.md |
| NAV-05 | warn | Use `gap="flush"` inside Accordion content — Accordion provides its own padding | navigation.md |
| NAV-06 | warn | Avoid `justify="between"` inside Accordion content — use inline counts instead | navigation.md |
| NAV-07 | warn | StepIndicator is zero-based — first step is `0` | navigation.md |
| NAV-08 | warn | StepIndicator only supports top-down completion — no non-linear states | navigation.md |
| NAV-09 | warn | Tab content: wrap in `Flex direction="column" gap="xs"` | navigation.md |
| NAV-10 | warn | First tab = most commonly accessed data | navigation.md |
| NAV-11 | warn | Tabbed card: `Tile compact={true}` + `variant="default"` tabs — `enclosed` creates double-border | navigation.md |
| NAV-12 | warn | Max 2-4 tabs per sidebar card | navigation.md |
| NAV-13 | warn | Use `variant="default"` for tabs inside settings extensions | navigation.md |
| NAV-14 | error | Never stack two tab bars directly on top of each other — use a view toggle icon, ToggleGroup, or Select instead | navigation.md |

## Media & Icons

| ID | Sev | Rule | Source |
|---|---|---|---|
| MED-01 | error | Icon silently renders nothing for invalid `name` values — always verify against the list | media.md |
| MED-02 | error | Never nest `<Icon>` inside `<Text>` — use `Flex direction="row" align="center" gap="xs"` | media.md |
| MED-08 | warn | Icons wrapped in `<Text>` ignore the `size` prop — remove `size` and let the icon inherit, or pull it out of `<Text>` | learnings |
| MED-03 | warn | Use matching icon shapes for checked/unchecked: `checkCircle` + `circleHollow` (not `success` + `circleHollow`) | media.md |
| MED-04 | warn | Common icon mistakes: `"error"` → `"xCircle"`, `"check"` → `"success"` / `"checkCircle"`, `"alert"` → `"warning"` | media.md |
| MED-05 | warn | Image: always provide `alt` text, HTTPS only | media.md |
| MED-06 | warn | Gallery grids: `AutoGrid columnWidth={250}`, not Flex rows | media.md |
| MED-07 | warn | Illustration sizing: 80-120px decorative, 150-250px empty state hero | media.md |
| MED-09 | warn | Match `Image width` to `AutoGrid columnWidth` — mismatched widths cause the image (and siblings like Links) to align off-center from the rest of the grid column | learnings |

## Typography

| ID | Sev | Rule | Source |
|---|---|---|---|
| TYP-01 | warn | Don't use `variant="microcopy"` as default secondary text — reserve for genuinely tertiary info | typography.md |
| TYP-02 | warn | Use `Heading` for primary titles, not bold Text | typography.md |
| TYP-03 | warn | Don't underline text near hyperlinks — it looks clickable | typography.md |
| TYP-04 | warn | Inline text: use `inline={true}` (boolean), add `{" "}` between siblings | typography.md |
| TYP-05 | warn | Tooltip can only be used via `overlay` prop — not standalone | typography.md |
| TYP-06 | warn | One Heading per page or section | typography.md |

## Data & State (spec)

| ID | Sev | Rule | Source |
|---|---|---|---|
| DSM-04 | warn | Boolean properties: always normalize to a real boolean in `data` (`true`, `"true"`, `"Yes"`, `"yes"`, `"1"` all → `true`) before the spec references them | data-and-state.md |
| DSM-05 | warn | Derivation policy: pre-compute formatting, variant selection, and computed booleans into `data` — don't express them as `$if` chains in the spec. `$if` is for structural choices (which subtree to render, visibility), never for display values. | data-and-state.md |
| DSM-06 | warn | Empty-value fallbacks go in `data` (substitute `"--"` upstream), not in the spec as `{"$if":"$value","$then":"$value","$else":"--"}`. | data-and-state.md |
| DSM-07 | info | Runtime operators (`$slice`, `$length`, `$add`, `$concat`, etc.) are permitted for **state-dependent** computation that can't be precomputed: pagination slices against `$state.pageIndex`, counts in dynamic headers, "show first N" where N is in state. If the result doesn't depend on `$state`, it's display formatting — DSM-05/DSM-06 still apply and it belongs in `data`. | data-and-state.md |

## Actions ($action)

| ID | Sev | Rule | Source |
|---|---|---|---|
| ACT-01 | error | The renderer supports only this `$action` vocabulary: `setState`, `batch`, `addAlert`, `copyTextToClipboard`, `reloadPage`, `closeOverlay`, `openIframeModal`, `refreshObjectProperties`. Names outside this list (`openOverlay`, `navigate`, `fetchCrmObjectProperties`) silently no-op. | system prompt |
| ACT-02 | warn | Overlays open via the `overlay` prop on Button/Link (value = Panel or Modal node), not via an `openOverlay` action. | overlays.md |
| ACT-03 | warn | Tweaks panel can only flip `state` values — there's no "open this panel" tweak. To preview an overlay without interacting with a row, add a dedicated "Preview: …" Button inside the card's content with an `overlay` prop pointing at the same Panel/Modal. | system prompt |
| ACT-04 | error | Controlled inputs (`Tabs.onSelectedChange`, Select/Input `onChange`, etc.) must bind the event arg via `"value": "$value"` in the `setState` action — NOT an empty string and NOT by switching to uncontrolled `defaultSelected`/`defaultValue`. The renderer merges the event handler's first arg into ctx as `value`, so `"$value"` resolves to the new tab id / new input value. A spec with `"value": ""` writes empty-string to state on every change and freezes the component; the fix is `"$value"`, not removing the controlled binding. | gotchas.md |

## Platform Constraints

| ID | Sev | Rule | Source |
|---|---|---|---|
| PLT-01 | error | No arbitrary CSS — no `style`, `className`, `border-radius`, inline styles, raw `fontSize` numbers, or custom colors. Layout and styling are props-only. | card-building-process.md |
| PLT-02 | error | No HTML elements — `div`, `span`, `img`, `br`, `b`, `i`, `p`, `a` etc. do not render. Every node's `type` must be a HubSpot component from the catalog. | card-building-process.md |
| PLT-03 | error | No orange button variants — reserved for HubSpot product | buttons-and-actions.md |
| PLT-04 | error | Empty values: `"--"` (double dash), never blank/null/undefined. Substitute upstream in `data` — don't express the fallback as `$if`/`$else` in the spec. | card-building-process.md |
| PLT-05 | warn | Panels use `flush={true} variant="modal"` and have unique `id`s | card-building-process.md |
| PLT-06 | warn | Forms close overlay on successful save | card-building-process.md |
| PLT-07 | error | All external URLs must be HTTPS. Applies to Image `src`, Link `href`, Button `href`, and any other URL-valued prop. | card-building-process.md |

## Gotchas

| ID | Sev | Rule | Source |
|---|---|---|---|
| GOT-01 | error | PanelFooter layout: `Flex direction="column"` wrapper required for full width | gotchas.md |
| GOT-02 | warn | Button `variant="transparent"` adds invisible padding — use `Link` for text alignment | gotchas.md |
| GOT-03 | warn | Empty Flex components have zero height/width — can't serve as placeholders | gotchas.md |
| GOT-04 | warn | `Flex compact={true}` has undocumented behavior — use explicit `gap` instead | gotchas.md |
| GOT-05 | warn | Divider alone has insufficient vertical margin — pair with Spacer or SectionBreak | gotchas.md |
| GOT-06 | warn | Don't stack multiple Dividers | gotchas.md |
