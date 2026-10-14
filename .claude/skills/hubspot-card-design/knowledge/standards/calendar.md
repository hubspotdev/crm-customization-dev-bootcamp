---
id: calendar
scope: [calendar, schedule, month-view, week-view, agenda, events, date-navigation, hs-uix]
depends-on: [tables, utils, overlays]
archetypes: [calendar-view]
---

# Calendar — Month / Week / Day / Agenda (`hs-uix/calendar`)

> **Use `hs-uix/calendar` for any date-plotted view** — deal close-date calendars, meeting schedules, content calendars, renewal timelines. Don't hand-build a month matrix out of `Table` columns. The platform gives you primitives, not a calendar; this component owns the month grid, hour grid, "+N more" overflow, and date coercion.

```bash
npm install hs-uix
```

```jsx
import { Calendar } from "hs-uix/calendar";
```

Calendar is **presentational** — like Kanban and Feed, the caller owns fetching. You hand it records plus an `eventFields` map and it renders the view.

---

## Quick Start

```jsx
<Calendar
  events={deals}
  eventFields={{ id: "id", start: "closeDate", title: "name", subtitle: "owner", color: "color" }}
  defaultView="month"
/>
```

`eventFields` maps **your** record keys to calendar roles, so you don't reshape data. Each role is a key string (declarative — preferred) or an accessor function.

| Role | Notes |
|---|---|
| `id` | Stable id (React keys + overlay ids) |
| `start` | **Required** for an event to appear |
| `end` | Optional — enables multi-day spans + duration |
| `title` | Event label |
| `subtitle` | Secondary text (e.g. owner) |
| `color` | A Tag variant: `default` \| `info` \| `success` \| `warning` \| `error` |
| `href` | `string` or `{ url, external? }` |

`start`/`end` accept any shape a HubSpot field arrives in: `Date`, epoch ms (number or string), ISO string, or a `DateInput` object (`{ year, month, date }`, 0-indexed month). Date-only strings parse as **local** midnight, so events never land a day early.

**Precompute `color` in `data`** (e.g. a `color` key per event set from the stage) rather than expressing a variant lookup in the spec.

---

## Views

| View | Shows | Step |
|---|---|---|
| `month` (default) | 7-column day grid; each day stacks up to `maxEventsPerDay` chips, then "+N more" | ± 1 month |
| `week` | Hour-row time grid + all-day band | ± 1 week |
| `day` | Single-day hour schedule with a "now" marker | ± 1 day |
| `agenda` | The week's events grouped under day headers | ± 1 week |

- `defaultView` (uncontrolled) or `view` + `onViewChange` (controlled).
- `views={["week", "day", "agenda"]}` limits the switcher (a `Select`, not Tabs — the platform caches Tabs bodies).
- `weekStartsOn`: `0` (Sunday, default) or `1` (Monday); `hideWeekends` drops Sat/Sun.
- Time grid: `dayStartHour` (default 8) / `dayEndHour` (default 20).

---

## Search & filters

Reuses the DataTable/Kanban config shape:

```jsx
<Calendar
  events={events}
  eventFields={fields}
  showSearch
  searchFields={["name", "owner", "stage"]}
  filters={[
    {
      name: "stage",
      type: "multiselect",
      placeholder: "All stages",
      chipLabel: "Stage",
      options: STAGE_OPTIONS,
    },
  ]}
  maxEventsPerDay={3}
/>
```

- `searchFields` is **required** for `showSearch` to match anything — the search box is a no-op without it.
- Filters: `select` \| `multiselect` \| `dateRange`, with optional `fuzzySearch`.

---

## Event overlays

Clicking an event opens an overlay; `overlayMode`:

| Mode | Notes |
|---|---|
| `"popover"` (default) | **Experimental** (`@hubspot/ui-extensions/experimental`) |
| `"modal"` / `"panel"` | Stable overlays — prefer these if you need reliability |
| `"none"` | No overlay; pair with `onEventClick` if you need a side effect |

`onEventClick(raw, normalizedEvent)` always fires regardless of mode.

---

## Server-side

```jsx
<Calendar
  events={events}
  eventFields={fields}
  serverSide
  loading={loading}
  onRangeChange={async ({ start, end, view }) => setEvents(await fetchEvents({ start, end }))}
/>
```

`onRangeChange` fires on mount and on every navigation / view change — fetch only the visible range there.

---

## Timezones (opt-in)

**Off by default** — events render exactly as sent (viewer-local, no conversion). Opt in only when you need it:

- `showTimeZoneSelect` adds the toolbar dropdown (layer starts at UTC).
- `timeZone="America/New_York"` pins a zone with no selector.
- Controlled: `timeZone` + `onTimeZoneChange`, with an optional `timeZoneOptions` list.

When engaged, every time, grid placement, and day-grouping resolves in the chosen IANA zone, DST-correct.

---

## Platform limitations (from HubSpot, not Calendar)

- **No height / vertical scroll** — long content expands the page; month cells cap chips via `maxEventsPerDay`.
- **View switcher is a `Select`** — Tabs cache their body and don't re-render on data changes.
- **Time grid can't span rows** — a multi-hour block repeats with a "↑ cont. through …" note rather than one tall block.
- **Popover overlay is experimental** — use `modal`/`panel` for a stable overlay.

---

## Rules

1. **`eventFields.start` is mandatory** — events with no resolvable start don't render.
2. **Prefer string keys in `eventFields`** (declarative) over accessor functions; precompute derived values (like `color`) into `data`.
3. **`color` must be a Tag variant** (`default`/`info`/`success`/`warning`/`error`), not a hex value.
4. **`showSearch` requires `searchFields`** — otherwise the box matches nothing.
5. **Default to `month`** for "where do things fall," `week`/`day` for hour-level schedules, `agenda` for a compact list.
6. **Use `modal` or `panel` overlays** when reliability matters; `popover` is experimental.
