---
id: states
scope: [loading-spinner, empty-state, error-state, alert, warning-banner, action-card, checklist-display, illustration-catalog]
depends-on: [media, layout]
critical-rules: 6
archetypes: [all]
---

# States (Loading, Empty, Error, Alerts, Illustrations)

> Handling every non-happy-path UI state — and some happy ones too.

---

## LoadingSpinner

Use `LoadingSpinner` for async operations. Wrap in `Flex` to center within a container.

```jsx
import { LoadingSpinner, Flex } from "@hubspot/ui-extensions";

if (loading) {
  return (
    <Flex align="center" justify="center">
      <LoadingSpinner label="Loading data..." size="sm" layout="centered" showLabel={true} />
    </Flex>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `String` | `--` | Text displayed next to the spinner |
| `layout` | `"inline" \| "centered"` | `"inline"` | Position of the spinner within its container |
| `showLabel` | `Boolean` | `false` | Whether the label text is visible |
| `size` | `"xs" \| "extra-small" \| "sm" \| "small" \| "md" \| "medium"` | `"sm"` | Size of the spinner. Short and long aliases are interchangeable. |

### Size Guidelines

| Context | Size | Layout |
|---------|------|--------|
| Inline next to a field or button | `"xs"` | `"inline"` |
| Card-level loading | `"sm"` | `"centered"` |
| Panel or Modal full-page loading | `"md"` | `"centered"` |

### Inline Loading Example

```jsx
<Flex direction="row" align="center" gap="xs">
  <LoadingSpinner size="xs" layout="inline" />
  <Text format={{ italic: true }}>Saving...</Text>
</Flex>
```

---

## Spinner (`hs-uix/common-components`)

`Spinner` is an animated unicode/braille loading indicator with optional label text — a more characterful inline loader than the platform `LoadingSpinner`. Use it for lightweight inline "working…" states (a small status line, a polling indicator); use the native `LoadingSpinner` for standard card/panel-level loading.

```jsx
import { Spinner } from "hs-uix/common-components";

<Spinner name="braille" label="Syncing records…" inline />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `SpinnerName` | `"braille"` | Preset animation. Options: `braille`, `braillewave`, `dna`, `scan`, `rain`, `scanline`, `pulse`, `snake`, `sparkle`, `cascade`, `columns`, `orbit`, `breathe`, `waverows`. |
| `frames` | `string[]` | — | Custom animation frames (overrides `name`). |
| `interval` | `number` | — | Frame interval in ms. |
| `label` | `ReactNode` | — | Text shown next to the spinner. |
| `paused` | `boolean` | `false` | Freeze the animation. |
| `variant` | `"bodytext" \| "microcopy"` | `"bodytext"` | Text size of the label. |
| `inline` | `boolean` | `false` | Render inline rather than block. |

**When to use which:** native `LoadingSpinner` for card/panel/modal-level loading (the default); `Spinner` for an inline, low-key "still working" indicator where the braille animation reads as ambient progress.

---

## EmptyState

Use `EmptyState` when there is no data to display. Place it where the data table, list, or content would normally render.

**"Empty" means the data section is empty — not the entire card.** If the card lives on a CRM record, the record's identity properties are always available. Show them above the `EmptyState`. Only the data-dependent sections (Statistics, tables, charts) should disappear.

```jsx
// ❌ No context — who is this person?
if (data.length === 0) {
  return <EmptyState title="No records">...</EmptyState>;
}

// ✅ CRM identity is always available — show it
if (data.length === 0) {
  return (
    <Flex direction="column" gap="sm">
      <DescriptionList direction="row">
        <DescriptionListItem label="Name">{properties.name || "--"}</DescriptionListItem>
        <DescriptionListItem label="Email">{properties.email || "--"}</DescriptionListItem>
      </DescriptionList>
      <Divider />
      <EmptyState title="No records">
        <Text>No data has been added yet.</Text>
      </EmptyState>
    </Flex>
  );
}
```

```jsx
import { EmptyState, Text, Button } from "@hubspot/ui-extensions";

{data.length === 0 ? (
  <EmptyState title="No records found" layout="vertical" reverseOrder={false}>
    <Text>No matching records have been created yet.</Text>
    <Button onClick={handleCreate}>Create record</Button>
  </EmptyState>
) : (
  /* render data */
)}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | `--` | Text for the title header |
| `layout` | `String` | `--` | Layout direction (e.g. `"vertical"`) |
| `reverseOrder` | `Boolean` | `false` | Reverses the order of content and image |
| `imageName` | `String` | `"emptyStateCharts"` | Name of the built-in image to display. See Illustration catalog below. |
| `imageWidth` | `Number` | `--` | Max-width in pixels for the image container |
| `children` | `ReactNode` | `--` | Additional content such as `Text` and `Button` |

### EmptyState with Custom Image

```jsx
<EmptyState
  title="No contacts yet"
  layout="vertical"
  imageName="contacts"
  imageWidth={120}
>
  <Text>Import contacts or create one manually to get started.</Text>
  <Button onClick={handleImport}>Import contacts</Button>
</EmptyState>
```

---

## ErrorState

Use `ErrorState` for fatal load errors, permission-denied screens, or feature-unavailable states. This is more prominent than `Alert` — it renders a large illustration with a title and optional children.

```jsx
import { ErrorState, Text, Button } from "@hubspot/ui-extensions";

<ErrorState title="Trouble fetching properties.">
  <Text>Please try again in a few moments.</Text>
  <Button onClick={fetchData}>Try again</Button>
</ErrorState>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` | `--` | The error message title |
| `type` | `"error" \| "lock"` | `"error"` | The type of error illustration. `"error"` shows a generic error graphic. `"lock"` shows a padlock for permission/auth issues. |
| `children` | `ReactNode` | `--` | Additional content such as `Text` and `Button` |

### Lock Type for Permissions

Use `type="lock"` when the user lacks permissions or must authenticate.

```jsx
<ErrorState title="You must log in to view this data." type="lock" />
```

### ErrorState with Retry Action

```jsx
const [error, setError] = useState(null);

if (error) {
  return (
    <ErrorState title="Something went wrong">
      <Text>{error.message}</Text>
      <Button onClick={() => { setError(null); fetchData(); }}>Try again</Button>
    </ErrorState>
  );
}
```

---

## Alert

Use `Alert` for inline contextual messages — success confirmations, warnings, errors, and tips. Alerts are not full-page states; place them near the relevant content.

```jsx
import { Alert } from "@hubspot/ui-extensions";

<Alert title="Changes saved" variant="success">
  The contact record has been updated.
</Alert>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `String` (required) | `--` | The bolded text of the alert |
| `children` | `ReactNode` | `--` | The main content of the alert message body |
| `variant` | `"danger" \| "error" \| "info" \| "success" \| "tip" \| "warning"` | `"info"` | Sets the color and icon of the alert |

### Variant Guide

| Variant | Color | Use Case |
|---------|-------|----------|
| `"info"` | Blue | Neutral context, pending state, informational tips |
| `"success"` | Green | Action completed, active status confirmation |
| `"warning"` | Yellow | Caution needed, non-critical issue, action recommended |
| `"danger"` | Red | Destructive action warning, irreversible consequences |
| `"error"` | Red | Operation failed, validation error, server error |
| `"tip"` | Purple | Helpful suggestion, best practice, pro tip |

### All Variants

```jsx
<Alert title="Information" variant="info">This record is pending review.</Alert>
<Alert title="Success" variant="success">Operation completed successfully.</Alert>
<Alert title="Warning" variant="warning">Proceed with caution.</Alert>
<Alert title="Danger" variant="danger">This action cannot be undone.</Alert>
<Alert title="Error" variant="error">{error.message}</Alert>
<Alert title="Tip" variant="tip">Double check fields before submitting.</Alert>
```

### Alert is Not a Mood Ring

Alert is for things that need the user's attention *right now*. Don't show an Alert in every state:

```jsx
// ❌ Three Alerts covering every possibility — Alert is just noise
{allPassing && <Alert variant="success" title="All clear">Everything looks good.</Alert>}
{hasUninspected && <Alert variant="warning" title="Incomplete">Items not yet reviewed.</Alert>}
{hasFailing && <Alert variant="error" title="Issues found">Some items are failing.</Alert>}

// ✅ Alert only when something needs action — ProgressBar handles the rest
{hasFailing && <Alert variant="error" title="Issues found">{failCount} items need attention.</Alert>}
<ProgressBar value={passCount} maxValue={totalCount} variant={hasFailing ? "danger" : "success"} />
```

**Rules:**
- If a `ProgressBar` at 100% already communicates success, don't add a success Alert on top.
- If a `ProgressBar` at <100% already communicates incompleteness, don't add a warning Alert.
- Alert earns its spot only when there's a problem or urgent action the user must take.

### Alert Becomes Redundant After Triage Tiles

When a triage section (AutoGrid of Tiles) makes problems visually obvious, a card-level coaching Alert is redundant. The tiles ARE the coaching — they show every gap with status and action buttons.

```jsx
// ❌ Alert says less than what the triage tiles already show
<Alert variant="tip" title="Feature gap">You're paying for X but haven't used Y.</Alert>
<AutoGrid columnWidth={250}>{/* tiles showing ALL gaps */}</AutoGrid>

// ✅ Let the triage tiles speak — move coaching text into the detail overlay
<AutoGrid columnWidth={250}>{/* tiles showing ALL gaps with Flag buttons */}</AutoGrid>
```

Move contextual coaching text into the detail overlay (Modal/Panel) where it pairs with a specific item. Don't tell users what they can already see.

---

## Warning Banner Pattern

A persistent, full-width `Alert` placed between navigation and content. No dismiss button — it stays visible until the user resolves the underlying issue. Use for disconnected integrations, required setup steps, or account-level issues.

```jsx
import { Alert, Text, Link } from "@hubspot/ui-extensions";

<Alert title="Calendar disconnected" variant="warning">
  <Text>
    Your calendar is not connected. Connect it to access scheduling features.{" "}
    <Link href="https://app.hubspot.com/settings/calendar">Reconnect calendar</Link>
  </Text>
</Alert>
```

### Guidelines

- Place the banner at the top of the extension, before any other content.
- Use `variant="warning"` for degraded functionality or `variant="danger"` for blocked functionality.
- Always include an actionable path: a `Link` to settings or a `Button` to retry.
- Do not use this pattern for transient messages — use a standard `Alert` for those.

---

## Time-Sensitive Status Alert Pattern

When a piece of data has time urgency (overdue, due soon, expiring), elevate it to a full `Alert` rather than burying it in a `StatusTag` inside a `DescriptionList`. Alerts are visually dominant and impossible to miss — exactly what you want for items requiring action.

Map the alert variant to urgency level:

```jsx
const ServiceAlert = ({ nextServiceType, nextServiceDate }) => {
  const overdue = new Date(nextServiceDate) < new Date();
  const dueSoon = !overdue && daysUntil(nextServiceDate) <= 14;

  if (overdue) {
    return (
      <Alert title="Service overdue" variant="warning">
        <Text>
          {nextServiceType} was due {formatDate(nextServiceDate)}.
          Schedule service as soon as possible.
        </Text>
      </Alert>
    );
  }

  if (dueSoon) {
    return (
      <Alert title="Service due soon" variant="info">
        <Text>
          {nextServiceType} is due {formatDate(nextServiceDate)}.
        </Text>
      </Alert>
    );
  }

  return (
    <Alert title="Next service on schedule" variant="success">
      <Text>
        {nextServiceType} — {formatDate(nextServiceDate)}
      </Text>
    </Alert>
  );
};
```

### When to use this pattern vs. StatusTag

| Criteria | Alert | StatusTag |
|----------|-------|-----------|
| Requires user action | Yes — Alert makes it unmissable | No — status is informational |
| Time urgency (overdue, expiring) | Yes — variant communicates severity | Better for static status |
| Multiple statuses in a table column | No — too heavy for rows | Yes — compact inline indicator |
| Card-level status for a single record | Yes — leads the card visually | Only when status is one of many properties |

### Hierarchy rule

When using a time-sensitive Alert, place it **above** supplemental context like `DescriptionList`. The Alert is the most important information — don't bury it below quieter components.

```jsx
<Alert title="Setup required" variant="danger">
  <Text>
    You must connect your account before using this extension.{" "}
    <Link href="https://app.hubspot.com/settings/integrations">Go to settings</Link>
  </Text>
</Alert>
```

---

## Action Card Pattern

A row of illustrated CTA cards using `Tile` inside `AutoGrid`. Each card has one illustration, one title, a short description, and a single action button. Use for onboarding flows, feature discovery, and settings landing pages.

<!-- archetype: onboarding-setup -->
```jsx
import { AutoGrid, Tile, Illustration, Text, Button, Flex } from "@hubspot/ui-extensions";

<AutoGrid columns={["auto", "auto", "auto"]}>
  <Tile>
    <Flex direction="column" align="center" gap="sm">
      <Illustration name="contacts" width={80} height={80} />
      <Text format={{ fontWeight: "bold" }}>Import Contacts</Text>
      <Text>Bring your existing contacts into HubSpot.</Text>
      <Button onClick={handleImportContacts}>Get started</Button>
    </Flex>
  </Tile>

  <Tile>
    <Flex direction="column" align="center" gap="sm">
      <Illustration name="reporting" width={80} height={80} />
      <Text format={{ fontWeight: "bold" }}>View Reports</Text>
      <Text>See how your outreach is performing.</Text>
      <Button onClick={handleViewReports}>View reports</Button>
    </Flex>
  </Tile>

  <Tile>
    <Flex direction="column" align="center" gap="sm">
      <Illustration name="api" width={80} height={80} />
      <Text format={{ fontWeight: "bold" }}>Connect Tools</Text>
      <Text>Integrate your favorite tools with HubSpot.</Text>
      <Button onClick={handleConnect}>Connect</Button>
    </Flex>
  </Tile>
</AutoGrid>
```

### Guidelines

- Limit to 3–4 cards per row. More than 4 becomes too dense.
- Each card gets exactly one `Button`. Do not add competing actions.
- Keep description text to 1–2 short sentences.
- Use `Illustration` (not custom images) for visual consistency.

---

## Decorative Illustration Pattern

An `Illustration` placed alongside section content to reinforce the section's purpose. Decorative only — it does not convey information the text does not already provide.

```jsx
import { Flex, Illustration, Text, Box } from "@hubspot/ui-extensions";

<Flex direction="row" align="start" gap="md">
  <Box flex={1}>
    <Text format={{ fontWeight: "bold" }}>Calendar Integration</Text>
    <Text>Connect your calendar to sync meetings, track availability, and automate scheduling.</Text>
  </Box>
  <Illustration name="success" width={120} height={120} alt="Calendar illustration" />
</Flex>
```

### Guidelines

- Use one illustration per major section at most. Never place them in data-dense areas.
- Position the illustration to the right of content or centered in empty states.
- Always set the `alt` prop for accessibility, even when decorative.
- Keep dimensions modest (80–150px). Large illustrations waste space in CRM cards.

---

## Checklist Display Pattern

A read-only vertical list of status items using `Icon` + `Text` pairs in a `Flex` column. Use for feature summaries, plan comparisons, and setup status displays. These are not interactive checkboxes.

<!-- archetype: checklist-step-tracker -->
```jsx
import { Flex, Icon, Text } from "@hubspot/ui-extensions";

<Flex direction="column" gap="sm">
  <Flex direction="row" align="center" gap="xs">
    <Icon name="success" />
    <Text>Email connected</Text>
  </Flex>

  <Flex direction="row" align="center" gap="xs">
    <Icon name="success" />
    <Flex direction="column" gap="flush">
      <Text>Calendar connected</Text>
      <Text variant="microcopy">Requires Google or Outlook calendar</Text>
    </Flex>
  </Flex>

  <Flex direction="row" align="center" gap="xs">
    <Icon name="error" />
    <Flex direction="column" gap="flush">
      <Text>CRM sync enabled</Text>
      <Text variant="microcopy">Not yet configured</Text>
    </Flex>
  </Flex>
</Flex>
```

### Guidelines

- Use `Icon` with `name="success"` for completed items and `name="error"` for incomplete/failed items.
- Add sub-text with `Text variant="microcopy"` for caveats or requirements beneath a checklist item.
- Wrap multi-line items (label + sub-text) in a nested `Flex direction="column"`.
- Do not use this for interactive checkboxes — use `ToggleGroup` or `Checkbox` for user input.

### Interactive Checklist Row Pattern

For checklists where items are clickable (opening a Panel or Modal), use this proven pattern:

<!-- archetype: checklist-step-tracker -->
```jsx
// ✅ Proven interactive checklist row pattern
<Flex direction="row" align="center" gap="xs">
  <Icon name="checkCircle" size="sm" color="success" />
  <Flex direction="column" gap="flush">
    <Flex direction="row" align="center" gap="xs" wrap="nowrap">
      <Link overlay={detailPanel}>{item.name}</Link>
      <Tag variant="success">Pass</Tag>
    </Flex>
    <Text variant="microcopy">{formatDate(item.date)}</Text>
  </Flex>
</Flex>
```

**Key details:**
- `size="sm"` on Icon keeps it small enough to align with the first text line.
- `wrap="nowrap"` on the name+Tag row prevents the Tag from truncating or wrapping to a new line.
- `<Link overlay={...}>{name}</Link>` — don't wrap in `<Text>`, Link renders inline without extra padding.
- Keep microcopy short — just the date. Verbose notes (temperatures, descriptions) belong in the Panel, not the checklist row.

---

## Illustration

Use `Illustration` for built-in HubSpot graphics in empty states, action cards, and decorative sections. These are vector illustrations maintained by HubSpot — do not use custom images when an appropriate illustration exists.

```jsx
import { Illustration } from "@hubspot/ui-extensions";

<Illustration name="lock" alt="Lock icon" width={300} height={300} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `String` | `--` | The name of the illustration from the catalog below |
| `alt` | `String` | `"<name> illustration"` | Alt text for accessibility |
| `width` | `Number` | `--` | Width in pixels |
| `height` | `Number` | `--` | Height in pixels |

### Illustration Catalog

The following names are available for both `Illustration` and `EmptyState`'s `imageName` prop:

| Name | Description |
|------|-------------|
| `addOnReporting` | Reporting add-on graphic |
| `api` | API / developer tools |
| `announcement` | Announcement / megaphone |
| `automation` | Automation workflows |
| `betaTag` | Beta feature tag |
| `calling` | Phone / calling |
| `chatBot` | Chatbot graphic |
| `cms` | CMS / website tools |
| `codeBlock` | Code block / developer |
| `contacts` | Contacts / people |
| `conversations` | Conversations / messaging |
| `crm` | CRM graphic |
| `emptyStateCharts` | Charts (default for EmptyState) |
| `feedback` | Feedback / survey |
| `forms` | Forms graphic |
| `integrations` | Integrations / connections |
| `lists` | Lists graphic |
| `lock` | Padlock / security |
| `meetings` | Meetings / calendar |
| `playbooks` | Playbooks graphic |
| `reports` | Reports / analytics |
| `reporting` | Reporting dashboard |
| `sandbox` | Sandbox / testing |
| `sequences` | Sequences / email sequences |
| `settings` | Settings / gear |
| `success` | Success / checkmark |
| `tasks` | Tasks / to-do |
| `unlock` | Unlocked padlock |
| `workflows` | Workflows graphic |

### Sizing Guidelines

| Context | Recommended Size |
|---------|-----------------|
| Inline decorative (beside text) | 80–120px |
| Action card illustration | 60–100px |
| Empty state hero | 150–250px |
| Full-width feature graphic | 250–350px |
