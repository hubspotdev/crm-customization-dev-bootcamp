---
id: overlays
scope: [panel, panel-body, panel-section, panel-footer, modal, modal-body, modal-footer, popover, overlay-triggers]
depends-on: [buttons-and-actions]
critical-rules: 9
archetypes: [list-manager, multi-view-card, checklist-step-tracker]
---

# Overlays (Panels & Modals)

> Edit forms, confirmations, and detail views. Actions live here, not inline in cards.

---

## When to Use Panel vs Modal

| Feature | Panel | Modal |
|---------|-------|-------|
| Opens from | Right side | Center overlay |
| Width options | `"small"`, `"medium"`, `"large"` | `"small"` (default), `"medium"`, `"large"` |
| Use when | Browsing, detail views, long forms, multi-step flows | Focused actions, confirmations, quick edits |
| Can open from Panel? | N/A | Yes |
| Only one open at a time? | Yes | N/A |

**Choose based on interaction weight:**
- **Modal** = "deal with this now." Use for focused, single-purpose actions: update a field, confirm a choice, complete a short form. The centered overlay focuses attention. **Rule of thumb: if the form has ≤3 fields and one action, it's a Modal.**
- **Panel** = "here's more to explore." Use when the user needs to browse, compare, or reference the main view while interacting. The side-sheet keeps the main context visible. Multi-step forms, detail views with reference content, and load details belong in Panels.

---

## Panel Structure

```jsx
<Panel id="unique-panel-id" title="Panel Title" width="small" flush={true} variant="modal">
  <PanelBody>
    <PanelSection>{/* Content */}</PanelSection>
  </PanelBody>
  <PanelFooter>
    {/* Sticky footer buttons */}
  </PanelFooter>
</Panel>
```

### Panel Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | String (required) | Unique ID used with `actions.closeOverlay(id)` |
| `title` | String (required) | Title displayed at the top of the panel |
| `width` | `"small"` \| `"sm"` \| `"medium"` \| `"md"` \| `"large"` \| `"lg"` | Panel width. Default: `"medium"` |
| `flush` | Boolean | When `true`, removes default panel padding for edge-to-edge content. This is a **Panel-level prop** — do not use on `PanelSection`. Default: `false` |
| `variant` | `"default"` \| `"modal"` | `"modal"` blurs background and traps focus. Default: `"default"` |
| `onClose` | Function | Callback when the panel is closed |
| `onOpen` | Function | Callback when the panel is opened |
| `aria-label` | String | Accessible label for the panel |

### PanelSection Props

| Prop | Type | Description |
|------|------|-------------|
| `flush` | Boolean | Removes default padding from the section. **Rarely needed** — prefer `flush={true}` on the Panel itself for full-width content. |

**PanelSection padding gotcha.** PanelSection is useful for deliberate section separation, but it adds substantial vertical padding. For most simple detail panels, put the content directly in `PanelBody` instead of wrapping every group in `PanelSection`; otherwise panels look bloated and over-spaced. Use `PanelSection` only when you intentionally want native section spacing/dividers between distinct groups. If you just need a compact stack of text, stats, DescriptionList, or a small form, use `PanelBody > Flex/Box/...` directly.

### Rules

1. Panel must be top-level — cannot be inside Flex, Box, or other wrappers.
2. One `PanelBody` and one `PanelFooter` per Panel.
3. Prefer direct `PanelBody` content for compact detail panels; use `PanelSection` only when the extra padding/section separation is intentional.
4. Use `variant="modal"` for accessibility — blurs background and traps focus.
5. Use `flush={true}` on the **Panel** for edge-to-edge content. Do not put `flush` on individual `PanelSection` components — it doesn't achieve the same effect. **Note:** Some linter configurations may reject `flush` on Panel — if so, omit it. The default Panel padding works fine for detail panels with DescriptionLists.
6. Always give Panel a unique `id` for `actions.closeOverlay(id)`.
7. **Every Cancel button must call `actions.closeOverlay(panelId)`.** This means `actions` from `useExtensionApi()` must be threaded down to every panel component, and every panel needs a unique `id`. A Cancel button that doesn't close the panel is worse than no button — easy to miss during development because you can also close via the X button.

---

## PanelFooter Layout Rules

This is one of the most common gotchas in HubSpot UI extensions. PanelFooter behaves unlike any other Flex container.

### The 7 Rules

1. **PanelFooter is a flex container that left-aligns children** — you cannot override its `justify` behavior directly.
2. **`Flex direction="column"` inside PanelFooter gets full width** — this is the key hack for layout control.
3. **`Flex direction="row"` inside PanelFooter does NOT get full width** — it shrinks to content.
4. **Inside a column → row chain, `justify="end"` works with flat children.**
5. **`justify="between"` works with flat children** but breaks when children are wrapped in nested Flex components.
6. **`Inline` does NOT break `justify="between"`** — use it instead of Flex when grouping children inside a between-justified row.
7. **Empty Flex components collapse** in HubSpot's renderer — they can't serve as placeholders for `justify="between"`.

### The Winning Pattern

```
PanelFooter
  └── Flex (column)                    ← full-width hack
        ├── Step 1: Flex (row, justify="end")
        │     Text + Button (flat children)
        └── Step 2+: Flex (row, justify="between")
              Button (flat) + Inline (groups Text + Button)
```

### Right-Aligned Buttons

```jsx
<PanelFooter>
  <Flex direction="column">
    <Flex direction="row" justify="end" gap="sm">
      <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </Flex>
  </Flex>
</PanelFooter>
```

### Split Layout — Cancel Left, Save Right (Most Common)

The most natural edit-panel pattern: Cancel on the far left, Save on the far right. Uses `justify="between"` with flat button children.

```jsx
<PanelFooter>
  <Flex direction="column">
    <Flex direction="row" justify="between">
      <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      <LoadingButton variant="primary" onClick={handleSave}>Save</LoadingButton>
    </Flex>
  </Flex>
</PanelFooter>
```

### Split Layout (Back + Next for Multi-Step)

```jsx
<PanelFooter>
  <Flex direction="column">
    <Flex direction="row" justify="between">
      <Button variant="secondary" onClick={handleBack}>Back</Button>
      <Inline gap="small">
        <Text variant="microcopy">Step {step} of {totalSteps}</Text>
        <Button variant="primary" onClick={handleNext}>Next</Button>
      </Inline>
    </Flex>
  </Flex>
</PanelFooter>
```

> **Why `Inline` instead of `Flex`?** A nested `Flex` child inside a `justify="between"` row collapses the spacing. `Inline` groups children without breaking the parent's justify behavior.

---

## Modal Structure

```jsx
<Modal id="unique-modal-id" title="Modal Title" width="large">
  <ModalBody>
    <Flex direction="column" gap="sm">{/* Content */}</Flex>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => actions.closeOverlay(id)}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

### Modal Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | String (required) | Unique ID used with `actions.closeOverlay(id)` |
| `title` | String (required) | Title displayed at the top of the modal |
| `width` | `"small"` \| `"sm"` \| `"medium"` \| `"md"` \| `"large"` \| `"lg"` | Modal width. Default: `"small"` |
| `variant` | `"default"` \| `"danger"` | `"danger"` styles the modal for destructive actions. Default: `"default"` |
| `onClose` | Function | Callback when the modal is closed |
| `onOpen` | Function | Callback when the modal is opened |
| `aria-label` | String | Accessible label for the modal |

ModalFooter handles alignment internally — flat children only.

---

## Popover

> Lightweight contextual overlay that anchors to its trigger. Use for inline help, quick previews, and short prompts that don't warrant a full Modal or Panel.

Popover is **experimental** in `@hubspot/ui-extensions/experimental` — the API may change between SDK releases. Use sparingly; prefer Modal or Panel for anything beyond a sentence or two of content.

### When to Use Popover vs Modal vs Panel vs Tooltip

| Use case | Component |
|---|---|
| Static one-line label on hover | `Tooltip` |
| Short interactive prompt anchored to a trigger (≤2 sentences, optional CTA) | `Popover` |
| Focused action / confirmation / short form | `Modal` |
| Browse, edit, multi-step flow with reference content | `Panel` |

If the content needs scrolling or more than a small CTA row, it does not belong in a Popover.

### Structure

```jsx
<Button overlay={
  <Popover id="unique-popover-id" placement="top" arrowSize="small">
    <Text>Anchored content. The renderer auto-wraps in a compact Tile for padding — do NOT add a Tile yourself.</Text>
  </Popover>
}>
  Trigger
</Button>
```

### Popover Props

| Prop | Type | Description |
|---|---|---|
| `id` | String (required) | Unique ID for the overlay system |
| `placement` | `"top"` \| `"right"` \| `"bottom"` \| `"left"` | Anchor side. Default: `"top"` |
| `variant` | `"default"` \| `"shepherd"` \| `"longform"` | `shepherd` for product-tour styling, `longform` for headier typography. Default: `"default"` |
| `arrowSize` | `"none"` \| `"small"` \| `"medium"` | Size of the anchor arrow. Default: `"small"` |
| `showCloseButton` | Boolean | Adds an X. Requires a `PopoverHeader` child to actually display — usually leave `false`. Default: `false` |

### Rules

1. **Trigger via the `overlay` prop**, identical to Modal/Panel/Tooltip — never as a sibling node. Valid trigger components: `Button`, `Link`, `Tag`, `Image`, `LoadingButton`.
2. **Do not wrap children in a Tile.** The renderer auto-wraps Popover children in `<Tile compact>` so content gets default padding. Adding your own Tile produces nested Tiles.
3. **Keep content short.** One paragraph and at most one button. If you reach for a form, a list, or scrolling content, switch to Modal or Panel.
4. **Always set `id`** so the overlay system can track open state. Use a kebab-case unique value.
5. **Do not set `showCloseButton: true`** unless you also include a `PopoverHeader` (not currently exposed as a top-level component) — the close button silently won't render otherwise.
6. **Treat as experimental.** Don't build core flows on Popover; if HubSpot ships a breaking change, the spec author should be able to swap to Modal without significant rework.

### Examples

```jsx
// Inline help on a label
<Link overlay={
  <Popover id="why-this-stage" placement="bottom">
    <Text>Stages map to your pipeline's lifecycle. Drag a card to update.</Text>
  </Popover>
}>
  Why this stage?
</Link>

// Short confirmation prompt with a CTA
<Button variant="primary" overlay={
  <Popover id="confirm-archive" placement="top" arrowSize="medium">
    <Flex direction="column" gap="sm">
      <Text>Archive this deal? You can restore it within 30 days.</Text>
      <Button variant="primary" onClick={handleArchive}>Archive</Button>
    </Flex>
  </Popover>
}>
  Archive
</Button>
```

---

## Overlay Triggers

Panels, Modals, and Popovers open via the `overlay` prop on: `Button`, `Link`, `Tag`, `Image`, `LoadingButton`.

```jsx
<Button variant="primary" overlay={<Modal id="confirm" ...>...</Modal>}>
  Open Modal
</Button>

<Link overlay={<Panel id="edit" ...>...</Panel>}>
  Edit Record
</Link>
```

### Link vs Button for Overlay Triggers with Text Alignment

When you need a clickable element that opens an overlay AND must align with sibling `Text` below or beside it, use `Link` instead of `Button variant="transparent"`. Buttons always add invisible internal padding that misaligns with plain text. Links render inline with no extra padding.

```jsx
// ❌ Button padding misaligns with Text below it
<Flex direction="column" gap="flush">
  <Button variant="transparent" overlay={modal}>{name}</Button>
  <Text variant="microcopy">Due {date}</Text>  {/* starts further left */}
</Flex>

// ❌ Wrapping both in Button — alignment fixed but colors wrong
<Button variant="transparent" overlay={modal}>
  <Flex direction="column" gap="flush">
    <Text>{name}</Text>
    <Text variant="microcopy">Due {date}</Text>  {/* inherits teal color */}
  </Flex>
</Button>

// ✅ Link has no extra padding — natural alignment
<Flex direction="column" gap="flush">
  <Link overlay={modal}>{name}</Link>
  <Text variant="microcopy">Due {date}</Text>  {/* aligns with link text */}
</Flex>
```

Both `Button` and `Link` support the `overlay` prop for Panels, Modals, and Tooltips. Use `Button` when it stands alone; use `Link` when it must align with adjacent text.
