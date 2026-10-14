---
id: forms
scope: [form, input, textarea, select, multi-select, number-input, stepper-input, currency-input, date-input, checkbox, toggle, toggle-group, radio-button, validation, inline-editing, date-range-picker, filter-builder, date-filter, advanced-filters]
depends-on: [overlays]
critical-rules: 7
archetypes: [list-manager, multi-view-card]
---

# Forms & Input Components

> **Default: `hs-uix` FormBuilder.** The raw HubSpot input primitives below are an **escape hatch** for a single inline input or a hand-wired one-field edit. Anything with 3+ fields, validation, conditional visibility, multi-step wizards, repeaters, async validation, or CRM property rows — use FormBuilder.
>
> Related: [`utils.md`](./utils.md) has `buildOptions` / `findOptionLabel` for shaping `Select` / `MultiSelect` options.

All primitive components imported from `@hubspot/ui-extensions`. FormBuilder from `hs-uix/form`.

---

## FormBuilder (`hs-uix/form`) — the default

```bash
npm install hs-uix
```

```jsx
import { FormBuilder } from "hs-uix/form";
import { buildOptions } from "hs-uix/utils";

<FormBuilder
  columns={2}
  fields={[
    { name: "name",      type: "text",   label: "Name",       required: true },
    { name: "email",     type: "text",   label: "Email",      required: true,
      pattern: /^[^\s@]+@[^\s@]+$/, patternMessage: "Enter a valid email" },
    { name: "role",      type: "select", label: "Role",       options: ROLE_OPTIONS },
    { name: "startDate", type: "date",   label: "Start date" },
    { name: "notes",     type: "textarea", label: "Notes",    width: "full" },
  ]}
  initialValues={existingRecord}
  onSubmit={async (values) => {
    await saveRecord(values);
    actions.closeOverlay("edit-panel");
  }}
/>
```

### Field types

20+ field types, each mapping to a native HubSpot component with full prop support: `text`, `password`, `textarea`, `number`, `stepper`, `currency`, `date`, `time`, `datetime`, `select`, `multiselect`, `toggle`, `checkbox`, `checkboxGroup`, `radioGroup`, `display`, `slot`, `repeater`, `fieldGroup`, `crmPropertyList`, `crmAssociationPropertyList`.

All fields share: `description`, `placeholder`, `tooltip`, `required`, `readOnly`, `defaultValue`, `fieldProps` (pass-through).

### Layout

| Mode | Prop | Best for |
|---|---|---|
| Single column | *(default)* | Simple forms, sidebars |
| Fixed columns | `columns={2}` | **Recommended default** — predictable grid, collapses on narrow viewports |
| Responsive | `columnWidth={200}` | Cards and variable-width containers (uses AutoGrid) |
| Explicit | `layout={[["firstName", "lastName"], ["email"]]}` | Precise per-row control, weighted columns |

Priority when multiple are set: `layout` > `columnWidth` > `columns` > single column. Use `colSpan: N` or `width: "full"` on a field to override the grid.

### Field `description` — pair across rows

`description` (help text under the field label) **must be present on both fields in a row, or on neither.** A row with only one description has misaligned input baselines because the field with the description is taller. Options when only one field naturally needs help text:

1. **Reorder** — move the described field next to one whose own description would read naturally (often the best choice; pair fields by topic, then add help text in pairs).
2. **Pair with a real description** on the row-mate — only if that description is genuinely useful, not filler.
3. **Promote to `colSpan: 2`** so the field stands alone on its row.
4. **Drop `description`** in favor of `tooltip` (label-aligned) or `placeholder` (in-input).

Don't write filler help text just to satisfy alignment — reorder or use one of the alternatives. This rule applies per *visual* row, including rows that emerge from `dependsOn` or `visible` toggles — re-check alignment after a field appears.

### Validation

Built-in validators run in order, first failure wins: required → type/shape → pattern / length / range → custom sync (`validators`) → custom async (`validate`).

```jsx
{
  name: "email",
  type: "text",
  label: "Email",
  required: true,
  pattern: /^[^\s@]+@[^\s@]+$/,
  patternMessage: "Enter a valid email",
  maxLength: 100,
  validate: async (value, allValues, { signal }) => {
    const exists = await checkEmailExists(value, { signal });
    return exists ? "Email already in use" : true;
  },
}
```

Timing: `validateOnChange` (default `false`), `validateOnBlur` (default `true`), `validateOnSubmit` (default `true`).

### Ref API (for buttons outside the form — modals, panels)

```jsx
const ref = useRef();
<FormBuilder ref={ref} fields={FIELDS} />
// ref.current.submit() / validate() / reset() / getValues() / setFieldValue(name, val)
```

### Multi-step wizards, repeaters, conditional visibility

- **Steps:** pass `steps={[{ label, fields }]}` for a multi-step wizard with per-step validation and a built-in `StepIndicator`.
- **Repeater:** `{ type: "repeater", name: "phones", fields: [...], min: 1, max: 5 }` for dynamic add/remove rows.
- **Conditional:** `{ ..., dependsOn: { field: "country", equals: "US" } }` or `dependsOn: (values) => boolean`.

### Submit lifecycle

`transformValues(values) → outgoing payload`, `onBeforeSubmit(values)`, `onSubmit(values)`, `onSubmitSuccess(result)`, `onSubmitError(err)`. Return `false` from `onBeforeSubmit` to abort.

### Submit button alignment (`submitAlign`, hs-uix 1.6.4+)

Controls where the Submit/Cancel row sits in a single-step form: `"start" | "end" | "between"`. Default is `"between"` when `showCancel` is true, otherwise `"start"`. Use `submitAlign: "end"` to push Submit to the right without a Cancel button (common in modal panels where the close affordance is the modal's own `×`). This is the canonical replacement for the old pattern of wrapping the button row in a `Flex justify="end"` — set the prop, don't build a wrapper.

### Read-only, auto-save, dirty tracking

`readOnly` prop flips the form into native-feel read-only rendering. `autoSave={{ debounceMs: 800 }}` saves after each valid change. `isDirty()` / `dirtyFields` available via ref.

**Full API docs:** https://github.com/05bmckay/hs-uix/blob/main/packages/form/README.md

> Everything below this line covers the raw input primitives — useful when FormBuilder would be overkill for a single inline edit, or when you're customizing one field inside a FormBuilder `slot`.

---

## Component Selection Guide

| Data Type | Component | When to Use |
|-----------|-----------|-------------|
| Short text (name, email) | `Input` | Single-line text values |
| Long text (notes, comments) | `TextArea` | Multi-line, open-ended text |
| Password | `Input` with `type="password"` | Hidden character entry |
| Number | `NumberInput` | Numeric values, optionally with min/max |
| Number with +/- buttons | `StepperInput` | Increment/decrement by fixed step |
| Currency / money | `CurrencyInput` | Monetary amounts with locale formatting |
| Date | `DateInput` | Calendar date picker. **Never use plain `Input` with a date placeholder** — always use `DateInput` for proper calendar UI and validation. |
| Single choice from list | `Select` | Dropdown with 4+ options |
| Multiple choices from list | `MultiSelect` | Dropdown allowing multiple selections |
| Single choice from small set | `ToggleGroup` with `toggleType="radioButtonList"` | 2-4 radio options |
| Multiple choices from small set | `ToggleGroup` with `toggleType="checkboxList"` | 2-6 checkbox options |
| Boolean on/off | `Toggle` | Switch with ON/OFF state |
| Single boolean agreement | `Checkbox` | Terms acceptance, single opt-in |
| Single radio (standalone) | `RadioButton` | Rare; prefer `ToggleGroup` for 2+ options |

---

## Form Component

Wraps form fields for structured submission. Can contain `Input`, `Select`, `MultiSelect`, `NumberInput`, `DateInput`, `CurrencyInput`, `StepperInput`, `TextArea`, and `Button`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `autoComplete` | `'on'` \| `'off'` | `'on'` | Controls browser/password-manager autofill. Based on HTML `autocomplete` attribute. |
| `onSubmit` | `(event: RemoteEvent) => void` | -- | Called when the form is submitted. Receives a `RemoteEvent` argument. |

### Example

```jsx
import { Form, Input, Select, Button } from "@hubspot/ui-extensions";

const Extension = () => {
  return (
    <Form onSubmit={() => console.log("Form submitted!")}>
      <Input
        label="First Name"
        name="first-name"
        tooltip="Please enter your first name"
        description="Please enter your first name"
        placeholder="First name"
      />
      <Input
        label="Last Name"
        name="last-name"
        tooltip="Please enter your last name"
        description="Please enter your last name"
        placeholder="Last name"
      />
      <Button onClick={() => console.log("Submit")} variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};
```

### Guidelines

- **DO:** include text inputs when a user should be able to submit any value.
- **DO:** include select inputs when a user should only be able to select from a set of values.
- **DO:** include descriptions and placeholder text to provide context to users.
- **DO:** always position the submit button at the bottom of the form.
- **DON'T:** include a form without a submit button.

---

## Input

Renders a single-line text input field. Should only be used within a `Form` that has a submit button.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text displayed above the input. Required unless `type` is `"hidden"`. |
| `name` | `string` | Yes | -- | Unique identifier, like HTML `name` attribute. |
| `defaultValue` | `string` | No | -- | Value on first render. |
| `description` | `string` | No | -- | Descriptive text below the label. |
| `error` | `boolean` | No | `false` | When `true`, shows `validationMessage` as error and renders error state. When `false`, shows as success. |
| `onBlur` | `(value: string) => void` | No | -- | Called when field loses focus. |
| `onChange` | `(value: string) => void` | No | -- | Called when value is committed (on blur and form submit). |
| `onFocus` | `(value: string) => void` | No | -- | Called when field gains focus. |
| `onInput` | `(value: string) => void` | No | -- | Called on every keystroke. Use for validation only; prefer `onChange` for state updates. |
| `placeholder` | `string` | No | -- | Text shown before a value is entered. |
| `readOnly` | `boolean` | No | `false` | Prevents user input. |
| `required` | `boolean` | No | `false` | Displays required field indicator. |
| `testId` | `string` | No | -- | Used by `findByTestId()` in tests. |
| `tooltip` | `string` | No | -- | Tooltip text next to the label. |
| `type` | `"text"` \| `"password"` | No | `"text"` | Input type. `"password"` hides characters. |
| `validationMessage` | `string` | No | -- | Validation text shown below the input. |
| `value` | `string` | No | -- | Controlled value of the input. |

### Guidelines

- **DO:** make label and description text concise and clear.
- **DO:** include placeholder text to help users understand what is expected.
- **DO:** indicate if a field is required.
- **DO:** include clear validation error messages so users know how to fix errors.
- **DON'T:** use for long responses (use `TextArea` instead).
- **DON'T:** use placeholder text for critical information -- it disappears when users type.

---

## TextArea

Renders a resizable multi-line text field.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text above the input. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `cols` | `number` | No | -- | Visible width in average character widths. |
| `description` | `string` | No | -- | Descriptive text. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `maxLength` | `number` | No | unlimited | Maximum characters (UTF-16 code units). |
| `onBlur` | `(value: string) => void` | No | -- | Called on blur. |
| `onChange` | `(value: string) => void` | No | -- | Called when value is committed. |
| `onFocus` | `(value: string) => void` | No | -- | Called on focus. |
| `onInput` | `(value: string) => void` | No | -- | Called on every keystroke. Use for validation only. |
| `placeholder` | `string` | No | -- | Placeholder text. |
| `readOnly` | `boolean` | No | `false` | Prevents user input. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `resize` | `'vertical'` \| `'horizontal'` \| `'both'` \| `'none'` | No | `'both'` | Resize directions. |
| `rows` | `number` | No | -- | Number of visible text lines. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | -- | Validation text. |
| `value` | `string` | No | -- | Controlled value. |

### Guidelines

- **DO:** indicate if there is a character limit.
- **DON'T:** use for short values (names, numbers, dates).

---

## Select

Renders a single-value dropdown. A search bar is automatically included when there are more than seven options.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text above the dropdown. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `options` | `Array<{ label: string, value: string \| number \| boolean }>` | Yes | -- | Dropdown options. |
| `description` | `string` | No | -- | Descriptive text. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `onChange` | `(value: string) => void` | No | -- | Called when value is committed. |
| `onInput` | `(value: string) => void` | No | -- | Called when search field is edited. Consider debouncing. |
| `readOnly` | `boolean` | No | `false` | Prevents selection. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | -- | Validation text. |
| `value` | `string \| number \| boolean` | No | -- | Controlled value. |
| `variant` | `'input'` \| `'transparent'` | No | `'input'` | `'input'`: standard dropdown. `'transparent'`: hyperlink-style dropdown. |

### Guidelines

- **DO:** include placeholder text to help users understand what is expected.
- **DO:** use `variant="transparent"` for filter / view-switch Selects (and the matching Buttons next to them) — the bordered `'input'` variant reads as a form field and visually competes with the content being filtered. Reserve `'input'` for actual form entry.
- **DON'T:** use when users should select multiple options (use `MultiSelect`).
- **DON'T:** use placeholder text for critical information.

---

## MultiSelect

Renders a multi-value dropdown.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text above the dropdown. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `options` | `Array<{ label: string, value: string \| number }>` | Yes | -- | Dropdown options. |
| `description` | `string` | No | -- | Descriptive text. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `onChange` | `(value: (string \| number)[]) => void` | No | -- | Called when selection changes. |
| `readOnly` | `boolean` | No | `false` | Prevents selection. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | -- | Validation text. |
| `value` | `(string \| number)[]` | No | -- | Controlled value (array). |

---

## NumberInput

Renders a number input field.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text above the input. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `defaultValue` | `number` | No | -- | Value on first render. |
| `description` | `string` | No | -- | Descriptive text. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `formatStyle` | `'decimal'` \| `'percentage'` | No | -- | Number format. |
| `max` | `number` | No | -- | Upper bound. |
| `min` | `number` | No | -- | Lower bound. |
| `onBlur` | `(value: number) => void` | No | -- | Called on blur. |
| `onChange` | `(value: number) => void` | No | -- | Called when value is committed. |
| `onFocus` | `(value: number) => void` | No | -- | Called on focus. |
| `placeholder` | `string` | No | -- | Placeholder text. |
| `precision` | `number` | No | -- | Digits to right of decimal point. |
| `readOnly` | `boolean` | No | `false` | Prevents input. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | -- | Validation text. |
| `value` | `string \| number` | No | -- | Controlled value. |

### Guidelines

- **DO:** indicate if there is a minimum or maximum number requirement.

---

## StepperInput

Renders a number input with increment/decrement buttons. Inherits many props from `NumberInput`.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text above the input. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `defaultValue` | `string` | No | -- | Default value. |
| `description` | `string` | No | -- | Descriptive text. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `formatStyle` | `'decimal'` \| `'percentage'` | No | `'decimal'` | Number format. |
| `max` | `number` | No | -- | Highest allowed value. |
| `maxValueReachedTooltip` | `string` | No | -- | Tooltip when max is reached. |
| `min` | `number` | No | -- | Lowest allowed value. |
| `minValueReachedTooltip` | `string` | No | -- | Tooltip when min is reached. |
| `onBlur` | `(value: number) => void` | No | -- | Called on blur. |
| `onChange` | `(value: number) => void` | No | -- | Called when value changes. |
| `onFocus` | `(value: number) => void` | No | -- | Called on focus. |
| `placeholder` | `string` | No | -- | Placeholder text. |
| `precision` | `number` | No | -- | Decimal precision. |
| `readOnly` | `boolean` | No | `false` | Prevents input. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `stepSize` | `number` | No | `1` | Increment/decrement amount. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | -- | Validation text. |
| `value` | `string` | No | -- | Controlled value. |

---

## CurrencyInput

Renders an input with currency formatting, symbols, and locale-specific display.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currency` | `string` | **Yes** | -- | ISO 4217 currency code (e.g., `"USD"`, `"EUR"`, `"JPY"`). |
| `label` | `string` | **Yes** | -- | Label text. |
| `name` | `string` | **Yes** | -- | Unique identifier. |
| `defaultValue` | `number` | No | -- | Value on first render. |
| `description` | `string` | No | -- | Descriptive text. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `max` | `number` | No | -- | Upper bound. |
| `min` | `number` | No | -- | Lower bound. |
| `onBlur` | `(value: number) => void` | No | -- | Called on blur. |
| `onChange` | `(value: number) => void` | No | -- | Called when value changes. |
| `onFocus` | `(value: number) => void` | No | -- | Called on focus. |
| `placeholder` | `string` | No | -- | Placeholder text. |
| `precision` | `number` | No | currency default | Decimal places. |
| `readOnly` | `boolean` | No | `false` | Prevents input. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | `''` | Validation text. |
| `value` | `number` | No | -- | Controlled value. |

---

## DateInput

Renders a date picker input.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text above the input. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `clearButtonLabel` | `string` | No | -- | Label for the clear-date button. |
| `defaultValue` | `{ year: number, month: number, date: number }` | No | -- | Default date value. |
| `description` | `string` | No | -- | Descriptive text. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `format` | `'short'` \| `'long'` \| `'medium'` \| `'standard'` \| `'YYYY-MM-DD'` \| `'L'` \| `'LL'` \| `'ll'` | No | `'short'` | Date display format. |
| `max` | `{ year: number, month: number, date: number }` | No | -- | Latest valid date. |
| `maxValidationMessage` | `string` | No | -- | Tooltip for dates after max. |
| `min` | `{ year: number, month: number, date: number }` | No | -- | Earliest valid date. |
| `minValidationMessage` | `string` | No | -- | Tooltip for dates before min. |
| `onBlur` | `(value: DateInputEventsPayload) => void` | No | -- | Called on blur. |
| `onChange` | `(value) => void` | No | -- | Called when value is committed. |
| `onFocus` | `(value: DateInputEventsPayload) => void` | No | -- | Called on focus. |
| `readOnly` | `boolean` | No | `false` | Prevents selection. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `timezone` | `'userTz'` \| `'portalTz'` | No | `'userTz'` | Timezone for date calculations. |
| `todayButtonLabel` | `string` | No | -- | Label for the today button. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | -- | Validation text. |
| `value` | `{ year: number, month: number, date: number }` | No | -- | Controlled value. `month` is 0-indexed (0 = Jan). |

### Date format options

| Format | Example |
|--------|---------|
| `'short'` / `'L'` | 09/04/1986 |
| `'medium'` / `'ll'` | Sep 4, 1986 |
| `'long'` / `'LL'` | September 4, 1986 |
| `'standard'` / `'YYYY-MM-DD'` | 1986-09-04 |

---

## Checkbox

Renders a single checkbox. For multiple checkboxes, use `ToggleGroup` instead.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `string` | Yes | -- | Unique identifier. |
| `aria-label` | `string` | No | -- | Accessibility label. |
| `checked` | `boolean` | No | `false` | Whether checked. |
| `description` | `string` | No | -- | Descriptive text. |
| `initialIsChecked` | `boolean` | No | `false` | Default checked state (uncontrolled). |
| `inline` | `boolean` | No | `false` | Arranges checkboxes side by side. |
| `onChange` | `(checked: boolean, value: string) => void` | No | -- | Called on check/uncheck. |
| `readOnly` | `boolean` | No | `false` | Prevents selection. |
| `value` | `string` | No | -- | Value submitted with form. Not displayed. |
| `variant` | `'sm'` \| `'small'` \| `'default'` | No | `'default'` | Checkbox size. |

---

## Toggle

Renders a boolean switch with ON/OFF state. Use `Toggle` when the control represents an on/off state that takes effect immediately (enabling/disabling a mapping, activating a feature). Use `Checkbox` when the control is part of a form that gets submitted, or for multi-select scenarios (selecting rows for bulk actions).

| Use `Toggle` when... | Use `Checkbox` when... |
|---|---|
| On/off state takes effect immediately | Part of a form submitted later |
| Enabling/disabling a mapping or feature | Multi-select (selecting rows for bulk actions) |
| Inline in a table row (use `size="sm"` + `labelDisplay="hidden"`) | Terms acceptance, single opt-in |

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text label. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `checked` | `boolean` | No | `false` | Whether toggle is on. |
| `initialIsChecked` | `boolean` | No | `false` | Default state (uncontrolled). |
| `labelDisplay` | `'inline'` \| `'top'` \| `'hidden'` | No | `'inline'` | Label position. |
| `onChange` | `(checked: boolean) => void` | No | -- | Called on toggle. |
| `readonly` | `boolean` | No | `false` | Prevents toggling. |
| `size` | `'xs'` \| `'sm'` \| `'md'` | No | `'md'` | Toggle size. Only `'md'` displays ON/OFF text. |
| `textChecked` | `string` | No | `"ON"` | Text when checked (md only). |
| `textUnchecked` | `string` | No | `"OFF"` | Text when unchecked (md only). |

---

## ToggleGroup

Renders a list of checkboxes or radio buttons.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | Yes | -- | Text above the group. |
| `name` | `string` | Yes | -- | Unique identifier. |
| `options` | `Array<{ label: string, value: string, initialIsChecked?: boolean, readonly?: boolean, description?: string }>` | Yes | -- | Options to display. |
| `error` | `boolean` | No | `false` | Error state toggle. |
| `inline` | `boolean` | No | `false` | Stack options horizontally. |
| `onChange` | `(checked: boolean) => void` | No | -- | Called on selection change. |
| `readonly` | `boolean` | No | `false` | Prevents selection. |
| `required` | `boolean` | No | `false` | Displays required indicator. |
| `toggleType` | `'checkboxList'` \| `'radioButtonList'` | No | `'checkboxList'` | Checkbox or radio behavior. Radio allows only one selection. |
| `tooltip` | `string` | No | -- | Tooltip next to label. |
| `validationMessage` | `string` | No | -- | Validation text. |
| `value` | `string` (radio) \| `string[]` (checkbox) | No | -- | Controlled value. |
| `variant` | `'default'` \| `'small'` | No | `'default'` | Toggle size. |

### Guidelines

- **DO:** use when the user has a small selection of items (2-6).
- **DO:** keep label options concise.
- **DON'T:** use toggle groups for long lists of options. Use `Select` instead.

---

## RadioButton

Renders a single radio button. For 2+ radio options in a form, prefer `ToggleGroup` with `toggleType="radioButtonList"`.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `name` | `string` | Yes | -- | Unique identifier (shared across group). |
| `checked` | `boolean` | No | `false` | Whether selected. |
| `description` | `string` | No | -- | Descriptive text. |
| `initialIsChecked` | `boolean` | No | `false` | Default state (uncontrolled). |
| `inline` | `boolean` | No | `false` | Arrange side by side. |
| `onChange` | `(checked: boolean, value: string) => void` | No | -- | Called on selection. |
| `readonly` | `boolean` | No | `false` | Prevents selection. |
| `value` | `string \| number` | No | -- | Value submitted with form. Not displayed. |
| `variant` | `'sm'` \| `'small'` \| `'default'` | No | `'default'` | Size. |

---

## DateRangePicker (`hs-uix`)

Complete date-filter control for toolbars and report headers: preset dropdown ("Last 30 days", …), rolling ranges ("more than N weeks ago"), explicit from/to dates, and optional operator + CRM-field dropdowns. Use it instead of composing two `DateInput`s whenever the user is *filtering by date*.

```jsx
import { DateRangePicker } from "hs-uix";

<DateRangePicker
  label="Close date"
  name="close-date"
  defaultValue={{ operator: "InRollingDateRange", preset: "LAST_30_DAYS" }}
  presets
  clearable
  onChange={(value, meta) => setFilter(value)}
/>
```

| Prop | Description |
|---|---|
| `value` / `defaultValue` | The filter value object. In specs prefer **`defaultValue`** (uncontrolled) or `$bindState` on `value`. |
| `presets` | `true` = built-in HubSpot preset list, `false` = none, or a custom `[{label, value}]` array. |
| `operator` / `showOperatorSelect` | Expose "is between / is after / is known…" operator dropdown. |
| `showFieldSelect` / `fieldOptions` | Optional controlling-CRM-property dropdown above the operator. |
| `direction` | `"row"` (filter bars) or `"column"` (panel forms). |
| `clearable`, `min`, `max`, `format`, `readOnly` | The usual field affordances. |

Value shapes (discriminated by `operator`): `{operator:"InRollingDateRange", preset}`, `{operator:"InRange", from, to}`, `{operator:"Equal"|"BeforeDateStaticOrDynamic"|"AfterDateStaticOrDynamic", date}`, `{operator:"GreaterRolling"|"LessRolling", amount, unit, direction}`, `{operator:"Known"|"NotKnown"}`. Date objects are HubSpot `DateInput` values — **`month` is 0-indexed** (0 = January).

Rules:
1. Specs should set `defaultValue` and react via `onChange` actions — don't hand-wire both `value` and `onChange` unless the range must live in `$state`.
2. Precompute preset lists into `data` when custom; the built-in `presets: true` covers most cards.

---

## FilterBuilder (`hs-uix`)

Nested AND/OR condition-group builder — the "advanced filters" UI. Renders property / operator / value rows with add-condition and add-group controls, up to `maxDepth` levels.

```jsx
import { FilterBuilder } from "hs-uix";

<FilterBuilder
  properties={[
    { name: "dealstage", label: "Deal stage", type: "enumeration", options: [...] },
    { name: "amount", label: "Amount", type: "number" },
    { name: "closedate", label: "Close date", type: "date" },
  ]}
  defaultValue={{ type: "group", operator: "AND", children: [] }}
  onChange={(tree) => setFilters(tree)}
/>
```

| Prop | Description |
|---|---|
| `properties` | Array of filterable properties: `{name, label, type, options?}`. Types drive the operator list (`FILTER_OPERATORS`). |
| `value` / `defaultValue` | The condition tree. In specs prefer **`defaultValue`** (uncontrolled). |
| `maxDepth` | Max group nesting; root counts as 1 (default 2). |
| `labels` / `operatorLabels` | Copy overrides. |
| `readOnly` | Render the tree without edit controls. |

Rules:
1. Put the `properties` array in `data` — it's static per card.
2. FilterBuilder edits the tree; **applying** the filter to a list is the card's job (e.g. an "Apply" Button firing a `setState` action, with the list pre-filtered in `data` for prototype purposes).
3. For a single date filter, use `DateRangePicker`; FilterBuilder is for multi-property query building.

---

## Form Layout in Panels

Standard pattern: form fields in `PanelBody`, actions in `PanelFooter`.

<!-- archetype: list-manager (edit panel for any card with editable records) -->
```jsx
import { useState } from "react";
import {
  Panel, PanelBody, PanelSection, PanelFooter,
  Flex, Form, Input, Select, TextArea, Button,
} from "@hubspot/ui-extensions";

const EditPanel = ({ context, actions }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save logic here
      actions.addAlert({ type: "success", message: "Record saved." });
      actions.closeOverlay("edit-panel");
    } catch (err) {
      actions.addAlert({ type: "danger", message: "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel id="edit-panel" title="Edit Record" width="small" variant="modal">
      <PanelBody>
        <PanelSection>
          <Flex direction="column" gap="sm">
            <Input
              label="Name"
              name="name"
              required={true}
              placeholder="Enter name"
              value={name}
              onChange={setName}
            />
            <Select
              label="Status"
              name="status"
              required={true}
              value={status}
              onChange={setStatus}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
            <TextArea
              label="Notes"
              name="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={setNotes}
              resize="vertical"
              rows={4}
            />
          </Flex>
        </PanelSection>
      </PanelBody>
      <PanelFooter>
        <Flex direction="column">
          <Flex direction="row" justify="end" gap="sm">
            <Button variant="secondary" onClick={() => actions.closeOverlay("edit-panel")}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </Flex>
        </Flex>
      </PanelFooter>
    </Panel>
  );
};
```

### Rules

1. Use `gap="sm"` between form fields in a `Flex direction="column"`.
2. Labels on every field -- no placeholder-only inputs.
3. Primary button = Save/Submit. Secondary = Cancel/Close.
4. Always close the panel after successful save: `actions.closeOverlay(id)`.
5. Show loading state on save button to prevent double-submit.

---

## Validation Patterns

### Required Fields

Set `required={true}` on any input to display the required indicator. Validate before submit:

```jsx
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState(false);
const [emailMsg, setEmailMsg] = useState("");

<Input
  label="Email"
  name="email"
  required={true}
  value={email}
  onChange={setEmail}
  error={emailError}
  validationMessage={emailMsg}
  onInput={(value) => {
    if (!value) {
      setEmailError(true);
      setEmailMsg("Email is required.");
    } else if (!value.includes("@")) {
      setEmailError(true);
      setEmailMsg("Enter a valid email address.");
    } else {
      setEmailError(false);
      setEmailMsg("");
    }
  }}
/>
```

### Error States

Every input component supports the `error` + `validationMessage` pattern:

- `error={true}` + `validationMessage="..."` -- renders red error state with message.
- `error={false}` + `validationMessage="..."` -- renders green success state with message.
- `error={false}` + no `validationMessage` -- default neutral state.

### Validation on Blur vs Input

| Callback | Fires | Use For |
|----------|-------|---------|
| `onInput` | Every keystroke | Real-time validation feedback |
| `onChange` | On blur and form submit | Updating state |
| `onBlur` | When field loses focus | Final validation before moving on |

**Pattern:** Use `onInput` for validation messages and `onChange` for updating state values.

### Multi-Field Validation Before Submit

```jsx
const handleSave = () => {
  let hasErrors = false;

  if (!name.trim()) {
    setNameError(true);
    setNameMsg("Name is required.");
    hasErrors = true;
  }

  if (!status) {
    setStatusError(true);
    setStatusMsg("Please select a status.");
    hasErrors = true;
  }

  if (hasErrors) return;

  // proceed with save
};
```

---

## Inline Editing Pattern

For table rows that need always-editable dropdowns (e.g., data mapping, enrichment config), render `Select` with `variant="transparent"` directly in `TableCell`:

```jsx
import { useState } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
  Select, Text,
} from "@hubspot/ui-extensions";

const MappingTable = ({ mappings, onMappingChange }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Source Field</TableHeader>
          <TableHeader>HubSpot Property</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {mappings.map((mapping) => (
          <TableRow key={mapping.id}>
            <TableCell>
              <Text>{mapping.sourceField}</Text>
            </TableCell>
            <TableCell>
              <Select
                name={`mapping-${mapping.id}`}
                label=""
                variant="transparent"
                value={mapping.hubspotProperty}
                onChange={(value) => onMappingChange(mapping.id, value)}
                options={mapping.availableProperties}
              />
            </TableCell>
            <TableCell>
              <Select
                name={`status-${mapping.id}`}
                label=""
                variant="transparent"
                value={mapping.status}
                onChange={(value) => onMappingChange(mapping.id, value, "status")}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Paused", value: "paused" },
                  { label: "Disabled", value: "disabled" },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

### Key Points

- Use `variant="transparent"` on `Select` for inline editing. This renders as a hyperlink-style dropdown that blends into table rows.
- Set `label=""` when the column header already serves as the label.
- Each `Select` needs a unique `name` (use row ID as suffix).
- Call the change handler immediately on `onChange` -- no save button needed for inline edits.

---

## Reference Links

| Component | Official Docs |
|-----------|---------------|
| Form | [Form](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/form) |
| Input | [Input](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/input) |
| TextArea | [TextArea](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/text-area) |
| Select | [Select](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/select) |
| MultiSelect | [MultiSelect](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/multi-select) |
| NumberInput | [NumberInput](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/number-input) |
| StepperInput | [StepperInput](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/stepper-input) |
| CurrencyInput | [CurrencyInput](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/currency-input) |
| DateInput | [DateInput](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/date-input) |
| Checkbox | [Checkbox](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/checkbox) |
| Toggle | [Toggle](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/toggle) |
| ToggleGroup | [ToggleGroup](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/toggle-group) |
| RadioButton | [RadioButton](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/standard-components/radio-button) |
| Form Patterns | [Form Design Patterns](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-components/patterns/forms) |
