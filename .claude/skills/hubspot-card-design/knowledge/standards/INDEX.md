# UI Extensions Standards — Index

> **Read `RULES.md` first, then use this file to find the right standards file for your task. Do NOT read all files.**
>
> **Default path: `hs-uix`.** For tables, forms, boards, formatters, and variant-inferred tags, start from the `hs-uix` npm package (`npm install hs-uix`). See the task table below.

---

## By Task (pick 1-2 files)

| I need to... | Read this file |
|---|---|
| **Build a new card from scratch** | `card-building-process.md` then 1-2 component files |
| **Add a data table with filters** | `tables.md` (use `hs-uix/datatable` — raw `Table` is an escape hatch) |
| **Add a stage-based board / pipeline** | `kanban.md` (use `hs-uix/kanban`) |
| **Add an activity feed / timeline / audit log** | `feed.md` (use `hs-uix/feed`) |
| **Add a calendar / scheduling / month view** | `calendar.md` (use `hs-uix/calendar`) |
| **Bind a table/board/lookup to live CRM data** | `crm-data.md` (`CrmDataTable` / `CrmKanban` / `CrmLookupSelect` / `CrmRecordPicker`) |
| **Add a form or edit flow** | `forms.md` (use `hs-uix/form` for anything beyond 1-2 fields) + `overlays.md` |
| **Add a date filter or advanced filter builder** | `forms.md` (`DateRangePicker`, `FilterBuilder`) |
| **Upload / list file attachments** | `files.md` (`FileUpload` + `FileViewer`) |
| **Show metrics / KPIs** | `data-display.md` |
| **Build a chart** | `data-display.md` (Chart Guidelines section) |
| **Handle loading / empty / error states** | `states.md` |
| **Add tabs or step flows** | `navigation.md` |
| **Add status indicators or tags** | `status-and-tags.md` (use `AutoStatusTag` / `AutoTag` from `hs-uix`) |
| **Format currency / dates / options / sumBy** | `utils.md` (use `hs-uix/utils`) |
| **Fetch CRM data** | `data-and-state.md` |
| **Use CRM action links/buttons** | `crm-components.md` |
| **Add images, icons, or illustrations** | `media.md` |
| **Style text and headings** | `typography.md` |
| **Add buttons or action menus** | `buttons-and-actions.md` |
| **Build a triage dashboard** | `layout.md` (Tile + AutoGrid section) |
| **Add an inline help popover or quick prompt** | `overlays.md` (§ Popover — experimental, ≤2 sentences + optional CTA) |

---

## Symptom Routing (for revision turns)

When the user reports a problem with an existing spec, match the complaint to a file before patching. This is the on-demand grounding step for revisions — workflow step 7 says re-ground after 2+ complaints; this table tells you *where*.

| User says... | Likely cause | Read |
|---|---|---|
| "values are blank", "numbers missing", "stats not rendering", "I think it's the inline $" | Literal `$` next to `{{interpolation}}` in a primitive prop | `gotchas.md` (§ `$` references vs currency literals) |
| "headers are truncated", "columns wrong width", "still wrapping" | `width` vs `cellWidth` confusion | `tables.md` (§ DataTable column props, § Wrapping rule of thumb) |
| "add bulk actions", "select rows", "checkbox column on the table", "select all" | Hand-rolled checkbox column instead of `selectable: true` | `tables.md` (§ Row selection & bulk actions) |
| "doesn't look like HubSpot", "this is too dense / cramped" | Wrong root layout or wrapping leaves in `Tile` unnecessarily | `layout.md`, `data-display.md` (§ Statistics vs Tiles) |
| "stats look weird in tiles", "stats on tiles don't work" | Wrapping `Statistics` inside `Tile` grids when a row would do | `data-display.md` (§ Statistics vs Tiles) |
| "control didn't update", "input doesn't change", "toggle does nothing" | Manual `value` + `onChange` instead of `$bindState` | `forms.md`, `data-and-state.md` |
| "tab doesn't refresh", "inactive tab is stale" | HubSpot Tabs cache inactive children — needs `key` remount | `navigation.md`, `gotchas.md` |
| "icon is blank / wrong", "EmptyState image broken" | Invalid icon name / image enum | `media.md` (icon catalog) |
| "comments are wrong", "can't comment on the section I want" | Container needs a `name` to become the comment target | system prompt § Named groups = comment surfaces |

If the symptom isn't here, fall back to `search_knowledge("<symptom>")`.

---

## Card Archetypes

Pick the archetype that matches the user's workflow before writing code:

| Archetype | Pattern | Best for |
|---|---|---|
| **List Manager** | Statistics → `hs-uix` DataTable → Panel | Browsing/searching records |
| **Pipeline Board** | Statistics → `hs-uix` Kanban (stages + metrics) | "Where are deals / tickets / leads by stage?" |
| **Activity Feed** | SectionHeader → `hs-uix` Feed (date-grouped, filters) | "What happened on this record, and when?" |
| **Calendar View** | SectionHeader → `hs-uix` Calendar (month/week/agenda) | "Where do these events fall on a calendar?" |
| **Triage Dashboard** | ProgressBar → Tile+AutoGrid → Accordion groups | "What needs attention now?" |
| **KPI Snapshot** | Statistics → DescriptionList → optional chart | At-a-glance metrics |
| **Chart-Forward** | Tile(chart) → Statistics → DescriptionList | Trends over time |
| **Checklist / Step Tracker** | StepIndicator → Active checklist → Accordion groups | Tracking progress through steps |
| **Multi-View Card** | Tabs (each tab = different archetype) | Cards serving multiple roles |
| **Grouped Detail** | Section header → Accordion per group → Table/DescriptionList | Data organized by category |
| **Onboarding / Setup** | Illustration + EmptyState → ActionCard grid | First-run / empty cards |

---

## File Map

### Standards Files (read only what you need)

| File | Scope | Key Components |
|---|---|---|
| `buttons-and-actions.md` | Buttons, dropdowns, actions | Button, ButtonRow, Dropdown |
| `calendar.md` | Calendar / scheduling views | **`hs-uix` Calendar (month/week/day/agenda)** |
| `card-building-process.md` | Build workflow, archetypes, checklist | — |
| `crm-components.md` | Native CRM components | CrmPropertyList, CrmStageTracker, CrmActionLink |
| `crm-data.md` | CRM-backed table/board/lookup | **`hs-uix` CrmDataTable, CrmKanban, CrmLookupSelect, CrmRecordPicker** |
| `files.md` | File attachments | FileUpload, FileViewer (experimental) |
| `feed.md` | Activity feed / timeline | **`hs-uix` Feed** |
| `data-and-state.md` | Hooks, data fetching | useCrmProperties, useAssociations |
| `data-display.md` | Metrics, charts, progress | Statistics, ProgressBar, BarChart, DescriptionList, KeyValueList |
| `forms.md` | Forms & inputs | **`hs-uix` FormBuilder (default)**, Form, Input, Select, DateInput, Toggle |
| `gotchas.md` | Pitfalls, spacing issues | PanelFooter, Divider, Spacer |
| `kanban.md` | Stage-based board view | **`hs-uix` Kanban, KanbanCardActions** |
| `layout.md` | Layout primitives | Flex, AutoGrid, Box, Tile |
| `media.md` | Images, icons, illustrations | Image, Icon, Illustration, AvatarStack |
| `navigation.md` | Tabs, accordions, steps | Tabs, Accordion, StepIndicator |
| `overlays.md` | Panels, modals, popovers | Panel, PanelFooter, Modal, **Popover (experimental)** |
| `states.md` | Loading, empty, error, alerts | LoadingSpinner, EmptyState, Alert |
| `status-and-tags.md` | Tags, status indicators | Tag, StatusTag, **AutoTag, AutoStatusTag** |
| `tables.md` | Tables | **`hs-uix` DataTable (default)**, raw Table primitives |
| `typography.md` | Text, headings, links | Text, Heading, Link, Tooltip, StyledText |
| `utils.md` | `hs-uix/utils` helpers | formatCurrency, formatDate, buildOptions, sumBy, getAutoTagVariant |

There are no project-local common components. Use `hs-uix` primitives — see the rows above for which standards file covers which.

---

## Cross-References

| If you're reading... | Also relevant |
|---|---|
| `tables.md` | `utils.md`, `status-and-tags.md` (AutoStatusTag in cells), `crm-data.md` (CrmDataTable) |
| `forms.md` | `overlays.md`, `utils.md` (buildOptions, findOptionLabel), `crm-data.md` (CrmLookupSelect) |
| `kanban.md` | `tables.md` (shared filter/sort config), `utils.md` (deriveCardFieldsFromColumns), `crm-data.md` (CrmKanban) |
| `feed.md` | `tables.md` (shared toolbar/filter config), `status-and-tags.md` (typeVariant), `utils.md` (formatDateTime) |
| `calendar.md` | `tables.md` (shared filter/search config), `overlays.md` (event overlays), `utils.md` (formatDate) |
| `crm-data.md` | `tables.md`, `kanban.md`, `forms.md`, `data-and-state.md` (raw CRM fetch) |
| `overlays.md` | `gotchas.md` (PanelFooter rules) |
| `navigation.md` | `media.md` (icon pairs) |
| `states.md` | `media.md` (illustration catalog) |
| `layout.md` | `status-and-tags.md` (triage tiles) |

---

## Platform Constraints (memorize these)

- No CSS (`style`, `className`, `border-radius`) — HubSpot components only
- No HTML elements (`div`, `span`, `img`)
- No orange buttons — reserved for HubSpot
- Empty values: `"--"` (double dash), never blank/null
- HTTPS only for all external URLs
- One `variant="primary"` button per visible surface
- `copyTextToClipboard` requires user interaction — never in `useEffect`
