---
id: typography
scope: [text, heading, link, list, tooltip, truncation, inline-text]
depends-on: []
critical-rules: 6
archetypes: [all]
---

# Typography & Text

> How to display text that matches HubSpot's native density and style.

---

## Text Component — Full Props

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `"bodytext"` (default) \| `"microcopy"` | Text size variant. |
| `format` | Object | Formatting options (see below). |
| `inline` | Boolean | `true` inserts text without breaking the line. Default `false`. |
| `truncate` | Boolean \| Object | Truncates long strings to single line with tooltip on hover. `true` for auto, or `{ tooltipText: "string", maxWidth: 68 }` for control. |

### Format Options

| Option | Values | Description |
|--------|--------|-------------|
| `fontWeight` | `"bold"`, `"demibold"` | Text weight. `demibold` is the standard for data values. |
| `italic` | `true` / `false` | Italic text. |
| `lineDecoration` | `"strikethrough"`, `"underline"` | Line decoration. Don't underline near hyperlinks. |
| `textTransform` | `"none"`, `"uppercase"`, `"lowercase"`, `"capitalize"`, `"sentenceCase"` | Text capitalization. |

---

## Text Variants

| Variant | Use Case |
|---------|----------|
| `"microcopy"` | **Default for card data.** Labels, values, field displays. Compact density. |
| `"bodytext"` (default) | General text, descriptions, panel body, longer labels. |

### Guidelines from HubSpot

- **DO** use text with clear messaging.
- **DO** use text formatting thoughtfully -- only bold key words for scanning.
- **DO** use `Heading` for primary textual information on a card, not bold Text.
- **DON'T** use microcopy for important or critical info -- use Alert instead.
- **DON'T** use underline near hyperlinks -- it looks clickable.
- **DON'T** use `variant="microcopy"` as default secondary text throughout the card. Reserve it for genuinely tertiary information: filter bar record counts, help text below form fields, timestamps below a primary value. If you're reaching for microcopy to add a subtitle or secondary label, consider whether the information is needed at all. Lean cards scan faster than chatty ones.
- **DON'T** use Text where Heading, Alert, or Error components belong.

---

## Inline Text Pattern

```jsx
<Text>
  Location: <Text inline={true} format={{ fontWeight: "demibold" }}>{locationName}</Text>
</Text>
```

### Rules

1. Use `inline={true}` (boolean), not `inline="true"` (string).
2. Add `{" "}` between inline Text components -- HubSpot strips whitespace between siblings.
3. `variant="microcopy"` + `format={{ fontWeight: "demibold" }}` is the standard data-value style.

---

## Truncation

The `truncate` prop handles long text with automatic tooltip on hover:

```jsx
// Auto truncate with full text as tooltip
<Text truncate={true}>Very long text that might not fit...</Text>

// Custom tooltip text and max width
<Text truncate={{ tooltipText: "Full record name here", maxWidth: 200 }}>
  Very long rec...
</Text>
```

Use `truncate` in table cells and constrained layouts. For manual truncation of descriptions:

```jsx
const short = description.length > 200
  ? `${description.slice(0, 200).trimEnd()}...`
  : description;
```

---

## Non-Breaking Spaces

Use `{"\u00A0"}` to prevent awkward line breaks in status labels:

```jsx
<Text inline={true} format={{ fontWeight: "demibold" }}>
  {statusLabel.replace(/\s/g, "\u00A0")}:{" "}
</Text>
```

---

## Pipe-Separated Labels

For lightweight categorization (e.g., access permissions), use plain text with pipe separators instead of Tag components:

```jsx
// Lightweight -- good for many categories per row, low visual priority
<Text variant="microcopy">Sales | Contacts | Reports</Text>

// vs. Tag components -- for clickable, filterable, high visual priority items
<Flex direction="row" gap="xs">
  <Tag variant="default" size="small">Sales</Tag>
  <Tag variant="default" size="small">Contacts</Tag>
</Flex>
```

**When to use plain text:** many categories per row, read-only, low priority.
**When to use Tags:** clickable, filterable, status-bearing, or high visual priority.

---

## Heading Component

The `Heading` component renders large heading text. Use it to introduce or differentiate sections of your extension.

```jsx
import { Heading } from "@hubspot/ui-extensions";

const Extension = () => {
  return <Heading>Heading text</Heading>;
};
```

### Full Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | -- | The content rendered inside the heading. |
| `inline` | `boolean` | No | `false` | When `true`, heading text will not line break. |
| `testId` | `string` | No | -- | Used by `findByTestId()` to locate this component in tests. |

### When to Use

- Use as the **title at the top** of a card or extension to summarize its content.
- Use to **introduce or differentiate sections** within a panel or modal.
- Use **sparingly** -- one heading per page or section is the rule.

### Size Hierarchy in Practice

HubSpot UI Extensions provide a single `Heading` component (no h1-h6 levels). To create visual hierarchy within a card:

```jsx
// Primary title -- use Heading
<Heading>Stylist Profile</Heading>

// Section labels -- use Text with bold format
<Text format={{ fontWeight: "bold" }}>Contact Information</Text>

// Data labels -- use microcopy
<Text variant="microcopy">Email</Text>
<Text variant="microcopy" format={{ fontWeight: "demibold" }}>jane@example.com</Text>
```

### Guidelines from HubSpot

- **DO** use headers to give users a summary of the information the extension contains.
- **DON'T** use more than one heading for each page or section in the extension.
- **DON'T** use headers for paragraphs or long sentences.

---

## Link Component

The `Link` component renders a clickable hyperlink. Use links to direct users to a web page, another part of the HubSpot app, or use them as action triggers.

```jsx
import { Link } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <Link
      href={{
        url: "https://www.wikipedia.org",
        external: true,
      }}
    >
      Wikipedia
    </Link>
  );
};
```

### Full Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `href` | `string` \| `{ url: string, external?: boolean }` | No | -- | Sets the link's URL and open behavior. As a string, navigates to that URL. As an object: `url` is the target URL; `external: true` opens in a new tab with an external link icon. By default, HubSpot URLs open same-tab (no icon), non-HubSpot URLs open new-tab (with icon). |
| `onClick` | `() => void` | No | -- | Function invoked when the link is clicked. Receives no arguments; return value is ignored. |
| `overlay` | Object | No | -- | Include a Modal, Panel, or Tooltip component to open as an overlay on click. |
| `preventDefault` | `boolean` | No | `false` | When `true`, `event.preventDefault()` is called before `onClick`, preventing automatic navigation to `href`. |
| `variant` | `"primary"` \| `"light"` \| `"dark"` \| `"destructive"` | No | `"primary"` | The color of the link. |

### Link Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `"primary"` | Blue `#0091ae` | Default. Links to other pages or records in HubSpot. |
| `"light"` | White, lighter blue on hover `#7fd1de` | Links on dark backgrounds. |
| `"dark"` | Dark blue `#33475b` | Links inside Alert components. |
| `"destructive"` | Red `#f2545b` | Irreversible actions (e.g., deleting data). Use sparingly. |

### Patterns

#### External Links (open in new tab)

```jsx
<Link href={{ url: "https://external-system.com/record/123", external: true }}>
  View in External System
</Link>
```

#### Internal HubSpot Links (same tab, no icon)

```jsx
<Link href={`/contacts/${contactId}`}>
  View Contact
</Link>
```

#### Overlay Trigger (open a Panel or Modal)

```jsx
<Link
  overlay={
    <Panel title="Stylist Details" id="stylist-panel">
      <PanelBody>
        <PanelSection>
          <Text>{stylistName}</Text>
        </PanelSection>
      </PanelBody>
    </Panel>
  }
>
  View Details
</Link>
```

#### Inline Link within Text

```jsx
<Text>
  For more information, visit{" "}
  <Link href={{ url: "https://docs.example.com", external: true }}>
    the documentation
  </Link>
  .
</Text>
```

#### mailto / tel Links

```jsx
<Link href={{ url: "mailto:support@example.com", external: true }}>
  support@example.com
</Link>

<Link href={{ url: "tel:+15551234567", external: true }}>
  (555) 123-4567
</Link>
```

#### onClick Without Navigation

```jsx
<Link onClick={() => handleAction()} preventDefault={true}>
  Perform Action
</Link>
```

### Guidelines from HubSpot

- **DO** space out links so users can distinguish between different navigation targets.
- **DO** make link text concise and contextual.
- **DO** use `"destructive"` variant sparingly and only for irreversible actions.
- **DO** always open links to pages outside HubSpot in a new tab (`external: true`).
- **DON'T** crowd multiple links together.
- **DON'T** use the `"dark"` variant outside of alerts.

---

## List Component

The `List` component renders a list of items. Each child is automatically wrapped in `<li>` tags. Style as inline, ordered, or unordered with the `variant` prop.

```jsx
import { List, Link } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <List variant="unordered-styled">
      <Link href="https://www.hubspot.com">List item 1</Link>
      <Link href="https://developers.hubspot.com">List item 2</Link>
      <Link href="https://knowledge.hubspot.com">List item 3</Link>
    </List>
  );
};
```

### Full Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | -- | The content of the list. Each child is wrapped in an `<li>` tag. |
| `variant` | `"unordered"` \| `"unordered-styled"` \| `"ordered"` \| `"ordered-styled"` \| `"inline"` \| `"inline-divided"` | No | `"unordered"` | The type of list to render. |
| `testId` | `string` | No | -- | Used by `findByTestId()` to locate this component in tests. |

### List Variants

| Variant | Rendering |
|---------|-----------|
| `"unordered"` | Vertically stacked items, no bullets (default). |
| `"unordered-styled"` | Vertically stacked items with bullet points. |
| `"ordered"` | Numbered items, no additional styling. |
| `"ordered-styled"` | Numbered items with visual styling. |
| `"inline"` | Horizontal row of items. |
| `"inline-divided"` | Horizontal row with dividers between items. |

### Examples

#### Unordered List with Bullets

```jsx
<List variant="unordered-styled">
  <Text>First item</Text>
  <Text>Second item</Text>
  <Text>Third item</Text>
</List>
```

#### Ordered List (Numbered Steps)

```jsx
<List variant="ordered-styled">
  <Text>Create your account</Text>
  <Text>Set up your profile</Text>
  <Text>Start booking</Text>
</List>
```

#### Inline List (Horizontal Layout)

```jsx
<List variant="inline-divided">
  <Link href="/contacts">Contacts</Link>
  <Link href="/deals">Deals</Link>
  <Link href="/tickets">Tickets</Link>
</List>
```

#### List with Mixed Content in Cards

```jsx
<List variant="unordered-styled">
  <Text>
    <Text inline={true} format={{ fontWeight: "demibold" }}>Booth A:</Text>
    {" "}Available
  </Text>
  <Text>
    <Text inline={true} format={{ fontWeight: "demibold" }}>Booth B:</Text>
    {" "}Occupied
  </Text>
</List>
```

### Usage in Cards

- Use `"unordered"` or `"unordered-styled"` for feature lists, summaries, or collections of items.
- Use `"ordered"` or `"ordered-styled"` for sequential steps or ranked items.
- Use `"inline"` or `"inline-divided"` for horizontal navigation or compact tag-like displays.
- Children can be `Text`, `Link`, or any other component -- they are automatically wrapped in `<li>`.

---

## Tooltip

Renders a tooltip on hover to provide additional context. Must be used via the `overlay` prop on supported components — **cannot be used standalone.**

```jsx
import { Link, Tooltip, Icon } from "@hubspot/ui-extensions";

// Standard info tooltip pattern
<Link overlay={<Tooltip placement="top">Helpful context about this field.</Tooltip>}>
  <Icon name="info" size="sm" screenReaderText="More info" />
</Link>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placement` | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | `"top"` | Position relative to the trigger component |

### Supported Trigger Components

Tooltip can be passed as `overlay` to these components only:

- `Button`
- `Image`
- `Link`
- `LoadingButton`
- `Tag`

### Examples

```jsx
// Button with tooltip
<Button overlay={<Tooltip>Click to save changes</Tooltip>}>Save</Button>

// Tag with tooltip
<Tag variant="warning" overlay={<Tooltip placement="right">This record needs attention</Tooltip>}>
  Action Required
</Tag>

// Tooltip with a link inside it
<Link overlay={<Tooltip placement="bottom">
  Learn more in <Link href={{ url: "https://docs.example.com", external: true }}>the docs</Link>
</Tooltip>}>
  What's this?
</Link>
```

### Rules

1. **Cannot be used standalone** — always pass via `overlay` prop on a supported component.
2. Keep tooltip text concise — 1-2 short sentences max.
3. Use `placement` to avoid overlapping important content.
4. For the standard (i) icon tooltip, use `<Link overlay={<Tooltip>{info}</Tooltip>}><Icon name="info" size="sm" screenReaderText={info} /></Link>` inline — no wrapper component needed.
