---
id: buttons-and-actions
scope: [buttons, button-row, loading-button, dropdowns, sdk-actions, copy-to-clipboard, iframe-modals]
depends-on: [overlays, crm-components]
critical-rules: 13
archetypes: [list-manager, triage-dashboard, multi-view-card]
---

# Buttons & Actions

> Every interactive element and user action pattern.

---

## Button

Import: `import { Button } from "@hubspot/ui-extensions";`

The `Button` component renders a single button. Button text is passed as children (like standard HTML), not through a prop.

### Button Props

| Prop | Type | Description |
|------|------|-------------|
| `disabled` | `boolean` | When `true`, renders greyed-out and unclickable. |
| `href` | `string \| { url: string, external?: boolean }` | Opens a URL on click. When `external: true`, opens in new tab with external link icon. When both `href` and `onClick` are set, both execute. |
| `onClick` | `() => void` | Function invoked on click. Receives no arguments; return value ignored. |
| `overlay` | `Modal \| Panel` | Opens a Modal or Panel as an overlay on click. |
| `size` | `"xs"` / `"extra-small"` \| `"sm"` / `"small"` \| `"med"` / `"medium"` (default) | The size of the button. |
| `truncate` | `boolean` | When `true`, long text truncates with `...` and shows full text in tooltip on hover. |
| `type` | `"button"` (default) \| `"reset"` \| `"submit"` | Sets the `role` HTML attribute. |
| `variant` | `"primary"` \| `"secondary"` (default) \| `"destructive"` \| `"transparent"` | Sets the color/style of the button. |

### Button Variants

| Variant | Use Case |
|---------|----------|
| `"primary"` | Main action per surface. **Only ONE primary per card/panel/modal.** Dark blue. |
| `"secondary"` | Cancel, close, alternative actions. Grey. Default variant. |
| `"destructive"` | Delete, remove, disconnect. Red. **Only pair with secondary, never primary.** User must confirm after click. |
| `"transparent"` | Background and border removed, styled like a hyperlink. Blue text. |

> **Note:** HubSpot does not provide orange button variants. Orange is reserved for the HubSpot product to maintain action hierarchy.

### Button Sizes

| Size | Use Case |
|------|----------|
| (default / `"med"`) | **Standard for almost everything.** Card actions, panel actions, modal actions. |
| `"sm"` / `"small"` | Compact contexts where space is tight. Not the norm -- use sparingly. |
| `"xs"` / `"extra-small"` | In-table row actions only. |

> **Convention note:** HubSpot's native UI uses default-sized buttons almost everywhere. Don't default to `size="small"` -- it looks off next to native HubSpot buttons. Only use small when the card is genuinely space-constrained.

### Button Guidelines (Official HubSpot DO/DON'T)

- **DO:** Set button text that clearly communicates the action (~2-4 words).
- **DO:** Use sentence-casing for button text (only first word capitalized).
- **DO:** Minimize the number of buttons across all extensions on a page record.
- **DO:** Always open links to pages outside HubSpot in a new tab (`external: true`).
- **DON'T:** Include multiple primary buttons in a single extension.
- **DON'T:** Use a destructive button unless consequences are significant or irreversible.

```jsx
import { Button } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <Button
      onClick={() => console.log("Clicked!")}
      href={{ url: "https://example.com", external: true }}
      variant="primary"
      type="button"
    >
      Click me!
    </Button>
  );
};
```

---

## ButtonRow

Import: `import { Button, ButtonRow } from "@hubspot/ui-extensions";`

The `ButtonRow` component renders a row of Button components. When buttons exceed available space, extras collapse into a dropdown menu button.

### ButtonRow Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | **Required.** Button components to render in the row. |
| `disableDropdown` | `boolean` | When `true`, prevents the overflow dropdown from being interacted with. Default: `false`. |
| `dropDownButtonOptions` | `{ text?: string, size?: "xs" \| "sm" \| "md", variant?: "primary" \| "secondary" \| "transparent" }` | Customizes the overflow dropdown button. `text` defaults to `"More"` (empty string shows gear icon). `size` defaults to `"md"`. `variant` defaults to `"secondary"`. |
| `testId` | `string` | Used by `findByTestId()` in tests. |

### ButtonRow Guidelines (Official HubSpot DO/DON'T)

- **DO:** Include a secondary button with a destructive button to allow cancellation.
- **DON'T:** Use multiples of the same button type in a row (e.g., two primary buttons).
- **DON'T:** Use more than two secondary buttons in a single extension.
- **DON'T:** Use more than three buttons in a row.

### ButtonRow Rules

1. Max 3 buttons in a ButtonRow.
2. Primary button should be leftmost.
3. Use `disabled` for unavailable actions -- don't hide them.

```jsx
import { Button, ButtonRow } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <ButtonRow disableDropdown={false}>
      <Button variant="primary" type="submit" onClick={() => console.log("Submit")}>
        Submit
      </Button>
      <Button variant="secondary" onClick={() => console.log("Cancel")}>
        Cancel
      </Button>
      <Button variant="destructive" type="reset" onClick={() => console.log("Reset")}>
        Reset
      </Button>
    </ButtonRow>
  );
};
```

### ButtonRow with Dropdown Overflow

When buttons exceed space, extras collapse into a dropdown. Customize with `dropDownButtonOptions`:

```jsx
<ButtonRow
  dropDownButtonOptions={{
    text: "Extra",
    size: "sm",
    variant: "transparent",
  }}
>
  <Button variant="primary">Primary</Button>
  <Button variant="destructive" type="reset">Destructive</Button>
  <Button type="submit">Submit</Button>
  <Button type="button">Other</Button>
</ButtonRow>
```

---

## LoadingButton

Import: `import { LoadingButton } from "@hubspot/ui-extensions";`

The `LoadingButton` component renders a button with loading state options. It includes all Button props plus additional loading-specific props.

### LoadingButton Props

| Prop | Type | Description |
|------|------|-------------|
| `disabled` | `boolean` | When `true`, renders greyed-out and unclickable. |
| `href` | `string \| { url: string, external?: boolean }` | Opens a URL on click. Same behavior as Button. |
| `loading` | `boolean` | When `true`, displays loading indicator and disables the button. Default: `false`. |
| `onClick` | `() => void` | Function invoked on click. |
| `overlay` | `Modal \| Panel` | Opens an overlay on click. |
| `overlayOptions` | `{ openBehavior: "onClick" \| "onLoadingFinish" }` | Controls when the overlay opens -- immediately on click or after loading finishes. |
| `resultIconName` | `string` | Icon name to display after loading completes. Defaults to a check mark. |
| `size` | `"xs"` / `"extra-small"` \| `"sm"` / `"small"` \| `"med"` / `"medium"` (default) | The size of the button. |
| `type` | `"button"` (default) \| `"reset"` \| `"submit"` | Sets the `role` HTML attribute. |
| `variant` | `"primary"` \| `"secondary"` (default) \| `"destructive"` | Sets the color of the button. (No `"transparent"` variant for LoadingButton.) |

### LoadingButton with Overlay After Loading

```jsx
import { useState } from "react";
import { Flex, Heading, LoadingButton, Panel, PanelBody, PanelSection } from "@hubspot/ui-extensions";

function Extension() {
  const [isFetching, setIsFetching] = useState(false);
  const [contactName, setContactName] = useState("");

  async function handleClick() {
    setIsFetching(true);
    const { firstname, lastname } = await fetchContactName();
    setContactName(`${firstname} ${lastname}`);
    setIsFetching(false);
  }

  return (
    <Flex direction="column" gap="md" align="start">
      <LoadingButton
        loading={isFetching}
        onClick={handleClick}
        overlayOptions={{ openBehavior: "onLoadingFinish" }}
        overlay={
          <Panel title="Contact Name" id="name-panel">
            <PanelBody>
              <PanelSection>
                {contactName !== "" && <Heading>{contactName}</Heading>}
              </PanelSection>
            </PanelBody>
          </Panel>
        }
      >
        Fetch name
      </LoadingButton>
    </Flex>
  );
}
```

---

## Section-Level Primary Action

When a section has a primary action (e.g., "Log service" for a maintenance log, "Add record" for a data table), place the button on the same row as the section title. This creates a clear "this is what this section does" pairing and keeps the action visible without scrolling.

```jsx
<Flex direction="row" justify="between" align="center">
  <Text format={{ fontWeight: "demibold" }}>Maintenance log</Text>
  <Button variant="primary" overlay={<AddRecordPanel />}>
    Log service
  </Button>
</Flex>
```

**Rules:**
- Title left, button right, via `justify="between"`.
- Don't put the primary action inside the filter bar — it competes with search/filter controls.
- Don't put it at the card level if it belongs to a specific section — it feels disconnected.
- For high-frequency actions (used dozens of times a day), proximity and visibility matter most.
- This pattern replaces `Accordion` for primary sections — if the section's content is the card's main purpose, it shouldn't be collapsible.

### View Toggle Icon Pattern

For switching between a primary view and a configuration/settings mode (e.g., "Sync Activity" ↔ "Field Mappings"), use a lone icon button instead of adding a second tab bar. A recognizable icon (settings gear) communicates "configuration" universally, and a back arrow provides a clear return path.

```jsx
// Primary view — gear icon in top-right switches to config mode
<Flex direction="row" justify="between" align="center">
  <Text format={{ fontWeight: "demibold" }}>Sync Activity</Text>
  <Button variant="transparent" onClick={() => setView("mappings")}>
    <Icon name="settings" size="sm" />
  </Button>
</Flex>

// Config view — back arrow returns to primary view
<Flex direction="row" align="center" gap="xs">
  <Button variant="transparent" onClick={() => setView("activity")}>
    <Icon name="left" size="sm" />
  </Button>
  <Text format={{ fontWeight: "demibold" }}>Field Mappings</Text>
</Flex>
```

**Rules:**
- Icon-only (no text label) — text makes it look like navigation rather than a mode toggle.
- Use a universally recognizable icon (`settings` gear for config, `left` arrow for back).
- This avoids stacking two tab bars, which is visually confusing (see navigation.md).

---

## Alignment Conventions

| Context | Alignment |
|---------|-----------|
| Card footer | Right-aligned (`Flex justify="end"`) |
| Panel footer | Right-aligned via column hack (see `overlays.md`) |
| Modal footer | Flat children -- HubSpot handles alignment |
| Below card | Right-aligned |

### Official HubSpot Alignment Guidance

- Always position buttons at the bottom of Form, Modal, and Panel components.
- Buttons should be left-aligned by default. When pairing `primary` and `secondary`, primary appears leftmost.
- The only exception: buttons that navigate through multi-step forms may be right-aligned (where the user intuitively clicks "next").

---

## Dropdown Actions / Ellipsis Menu

Import: `import { Dropdown } from "@hubspot/ui-extensions";`

The `Dropdown` component renders a dropdown menu that opens on click. Define items using `<Dropdown.ButtonItem>` children with optional `onClick` handlers and `overlay` definitions.

**Studio JSON type spelling:** use exactly `"Dropdown.ButtonItem"` for child items. The `I` in `Item` is a capital i, not a lowercase L (`Dropdown.Buttonltem` is a typo).

### Dropdown Props

| Prop | Type | Description |
|------|------|-------------|
| `buttonSize` | `"xs"` \| `"sm"` \| `"md"` (default) | The size of the dropdown trigger button. |
| `buttonText` | `string` | The text displayed on the dropdown trigger button. |
| `disabled` | `boolean` | When `true`, the dropdown button cannot be focused or clicked. Default: `false`. |
| `variant` | `"primary"` (default) \| `"secondary"` \| `"transparent"` | The style of the dropdown trigger. `"transparent"` renders as a blue hyperlink. |
| `options` | ~~Object~~ | **DEPRECATED.** Use `<Dropdown.ButtonItem>` children instead. |

### Dropdown.ButtonItem Props

| Prop | Type | Description |
|------|------|-------------|
| `onClick` | `() => void` | Function invoked when the item is clicked. |
| `overlay` | `Tooltip \| Modal \| Panel` | An overlay component to attach (tooltip, modal, or panel). |

### Pattern 1: Ellipsis Menu in Table Action Columns

Use `variant="transparent"` and `buttonSize="xs"` for minimal, in-row action menus. This is the standard pattern for multi-action rows in list/table views.

<!-- archetype: list-manager -->
```jsx
import {
  Dropdown,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Text,
} from "@hubspot/ui-extensions";

const UserTable = ({ users, onEdit, onDeactivate }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell><Text>{user.name}</Text></TableCell>
            <TableCell><Text>{user.email}</Text></TableCell>
            <TableCell>
              <Dropdown
                variant="transparent"
                buttonSize="xs"
                buttonText="..."
              >
                <Dropdown.ButtonItem onClick={() => onEdit(user.id)}>
                  Edit
                </Dropdown.ButtonItem>
                <Dropdown.ButtonItem onClick={() => onDeactivate(user.id)}>
                  Deactivate
                </Dropdown.ButtonItem>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

### Pattern 2: Top-Right "Actions" Dropdown + Primary CTA Button

Combine a Dropdown for overflow actions with a primary Button for the main CTA. This is common above tables for management views.

<!-- archetype: list-manager -->
```jsx
import { Button, Dropdown, Flex } from "@hubspot/ui-extensions";

const TableHeader = ({ onAddUser, onExport, onEditColumns, onImport }) => {
  return (
    <Flex justify="end" gap="sm">
      <Dropdown variant="secondary" buttonText="Actions">
        <Dropdown.ButtonItem onClick={onExport}>
          Export view
        </Dropdown.ButtonItem>
        <Dropdown.ButtonItem onClick={onEditColumns}>
          Edit columns
        </Dropdown.ButtonItem>
        <Dropdown.ButtonItem onClick={onImport}>
          Import users
        </Dropdown.ButtonItem>
      </Dropdown>
      <Button variant="primary" onClick={onAddUser}>
        Add users
      </Button>
    </Flex>
  );
};
```

### Pattern 3: Dropdown ButtonItem with Overlay (Modal/Panel)

Use the `overlay` prop on `Dropdown.ButtonItem` to open modals or panels directly from dropdown items.

```jsx
import {
  Button,
  Dropdown,
  Modal,
  ModalBody,
  ModalFooter,
  Panel,
  PanelBody,
  PanelSection,
  Text,
} from "@hubspot/ui-extensions";

const ActionsDropdown = ({ actions }) => {
  return (
    <Dropdown variant="secondary" buttonText="Actions">
      <Dropdown.ButtonItem onClick={() => console.log("clicked")}>
        Quick action
      </Dropdown.ButtonItem>
      <Dropdown.ButtonItem
        overlay={
          <Modal id="confirm-modal" title="Confirm Action" width="md">
            <ModalBody>
              <Text>Are you sure you want to proceed?</Text>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  performAction();
                  actions.closeOverlay("confirm-modal");
                }}
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                onClick={() => actions.closeOverlay("confirm-modal")}
              >
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        }
      >
        Delete item
      </Dropdown.ButtonItem>
      <Dropdown.ButtonItem
        overlay={
          <Panel id="details-panel" title="Item Details">
            <PanelBody>
              <PanelSection>
                <Text>Detail content here...</Text>
              </PanelSection>
            </PanelBody>
          </Panel>
        }
      >
        View details
      </Dropdown.ButtonItem>
    </Dropdown>
  );
};
```

### Dropdown Conventions

- Use `variant="transparent"` + `buttonSize="xs"` for in-table row action menus.
- Use `variant="secondary"` for top-of-table "Actions" dropdowns.
- The `options` prop is **deprecated** -- always use `<Dropdown.ButtonItem>` children.
- Keep dropdown items to 2-5 actions. Beyond that, consider a Panel or dedicated view.
- Pair an "Actions" dropdown with a single primary CTA button for management surfaces.

---

## "View More" Pagination for Timeline / Feed Data

When displaying timeline or feed-style content (activity logs, event history, notifications), don't dump everything at once. Paginate with a "View more" button:

```jsx
const PAGE_SIZE = 5;
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

<Flex direction="column" gap="xs">
  {events.slice(0, visibleCount).map((event) => (
    <TimelineRow key={event.id} event={event} />
  ))}
  {visibleCount < events.length && (
    <Flex direction="row" justify="center">
      <Button
        variant="transparent"
        size="small"
        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
      >
        View more ({events.length - visibleCount} remaining)
      </Button>
    </Flex>
  )}
</Flex>
```

**Rules:**
- 5 items is a good initial count — enough to be useful, short enough not to dominate the card.
- Use `variant="transparent" size="small"` — it's a secondary action that shouldn't compete with content.
- Hide the button when all items are visible.
- Each click loads the next batch (5 more), not everything at once.

---

## SDK Actions Reference

These actions are available via `actions` prop or `useExtensionActions()` hook.

| Action | Description |
|--------|-------------|
| `addAlert({ title, message, type })` | Display alert banner. Types: `"info"`, `"success"`, `"warning"`, `"danger"`, `"tip"`. |
| `closeOverlay(id)` | Close an open Panel or Modal by its `id`. |
| `copyTextToClipboard(text)` | Copy text to clipboard. Returns a promise. **Must be triggered by user interaction.** |
| `reloadPage()` | Reload the current page. |
| `openIframeModal({ uri, height, width, title, flush })` | Open an iframe in a modal. |
| `refreshObjectProperties()` | Refresh CRM properties on the page (CRM only). |

### Copy-to-Clipboard Pattern

```jsx
<Link
  onClick={async () => {
    try {
      await actions.copyTextToClipboard(value);
      actions.addAlert({ message: "Copied to clipboard", type: "success" });
    } catch (error) {
      actions.addAlert({ message: "Couldn't copy text", type: "warning" });
    }
  }}
>
  <Icon name="copy" size="sm" />
</Link>
```

> **Gotcha:** `copyTextToClipboard` requires prior user interaction (transient activation). Never call it in `useEffect` -- it will fail.

### Iframe Modal

```jsx
actions.openIframeModal(
  {
    uri: "https://example.com/upload",
    height: 800,
    width: 1000,
    title: "Upload File",
    flush: true,   // removes default padding
  },
  () => {
    // Callback when modal closes
    refreshData();
  }
);
```

The iframe can close itself with `window.top.postMessage(JSON.stringify({ action: "DONE" }), "*")`.

---

## CRM Action Links

See `crm-components.md` for `CrmActionLink` and `CrmActionButton` patterns.
