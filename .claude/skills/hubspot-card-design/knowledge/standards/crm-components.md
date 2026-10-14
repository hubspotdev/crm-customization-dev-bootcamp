---
id: crm-components
scope: [crm-property-list, crm-stage-tracker, crm-data-highlight, crm-association-table, crm-association-pivot, crm-report, crm-statistics, crm-action-link, crm-action-button, crm-card-actions]
depends-on: []
critical-rules: 0
archetypes: [list-manager, kpi-snapshot, grouped-detail]
---

# CRM Components

> HubSpot's native CRM data and action components. Import from `@hubspot/ui-extensions/crm`.

These components connect directly to CRM data -- they fetch, display, and enable editing of record properties without custom serverless functions.

---

## CRM Data Components

| Component | Description |
|-----------|-------------|
| `CrmPropertyList` | Editable list of CRM properties with native styling. |
| `CrmStageTracker` | Pipeline/lifecycle stage progress bar. |
| `CrmDataHighlight` | Read-only property display matching left-sidebar style. |
| `CrmAssociationTable` | Table of associated records. |
| `CrmAssociationPivot` | Associated records organized by association label. |
| `CrmReport` | Display an existing single-object report. |
| `CrmStatistics` | Calculated summaries from associated records (e.g., avg revenue). |

---

## CrmPropertyList

Renders editable HubSpot properties with native styling. Properties are displayed inline and support editing when the user has write access.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `properties` | `string[]` | Yes | Array of internal property names to display. |
| `objectTypeId` | `string` | No | Object type ID. Defaults to the current record's type. |
| `objectId` | `number \| string` | No | Record ID. Defaults to the current record. |
| `direction` | `"row" \| "column"` | No | Layout direction. Default `"column"`. |

### Usage

```jsx
import { CrmPropertyList } from "@hubspot/ui-extensions/crm";

// Current record's properties (column layout, the default)
<CrmPropertyList
  properties={["email", "phone", "company"]}
/>

// Row layout for compact display
<CrmPropertyList
  properties={["email", "phone", "company"]}
  direction="row"
/>

// Specific record by ID
<CrmPropertyList
  objectTypeId="0-3"
  objectId={dealId}
  properties={["dealname", "amount", "dealstage"]}
/>
```

---

## CrmStageTracker

Native pipeline stage tracker for deals and tickets. Displays a horizontal progress bar with stage markers. Users can click stages to move the record forward or backward.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `objectTypeId` | `string` | No | Object type ID (`"0-3"` for deals, `"0-5"` for tickets). Defaults to current record type. |
| `objectId` | `number \| string` | No | Record ID. Defaults to current record. |
| `properties` | `string[]` | No | Additional properties to display below the stage bar. |
| `showProperties` | `boolean` | No | Whether to show properties below the tracker. Default `true`. |

### Usage

```jsx
import { CrmStageTracker } from "@hubspot/ui-extensions/crm";

// Deal stage tracker for current record
<CrmStageTracker />

// Deal stage tracker with extra properties
<CrmStageTracker
  objectTypeId="0-3"
  objectId={dealId}
  properties={["amount", "closedate"]}
/>

// Ticket stage tracker (no properties shown)
<CrmStageTracker
  objectTypeId="0-5"
  showProperties={false}
/>
```

---

## CrmDataHighlight

Displays read-only property values in a compact highlight format, matching the style of the left sidebar in HubSpot CRM records. Best for showing key metrics at a glance.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `properties` | `string[]` | Yes | Array of internal property names to display. |
| `objectTypeId` | `string` | No | Object type ID. Defaults to current record type. |
| `objectId` | `number \| string` | No | Record ID. Defaults to current record. |

### Usage

```jsx
import { CrmDataHighlight } from "@hubspot/ui-extensions/crm";

// Highlight key contact properties
<CrmDataHighlight
  properties={["email", "phone", "lifecyclestage"]}
/>

// Highlight deal metrics from a specific record
<CrmDataHighlight
  objectTypeId="0-3"
  objectId={dealId}
  properties={["amount", "dealstage", "closedate"]}
/>
```

---

## CrmAssociationTable

Displays a table of records associated with the current record. Renders columns based on the specified properties for the associated object type. Supports pagination and clicking through to associated records.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `objectTypeId` | `string` | Yes | The object type ID of the **associated** records to display. |
| `properties` | `string[]` | Yes | Properties of the associated records to show as table columns. |
| `searchable` | `boolean` | No | Enable a search bar to filter associated records. Default `false`. |
| `paginated` | `boolean` | No | Enable pagination for large association lists. Default `true`. |
| `pageSize` | `number` | No | Number of rows per page. Default `10`. |
| `sort` | `{ property: string, direction: "ASC" \| "DESC" }[]` | No | Default sort order for the table. |
| `quickFilters` | `object[]` | No | Filter definitions to let users filter the table. |
| `preFilters` | `object[]` | No | Filters applied before rendering (hidden from user). |

### Usage

```jsx
import { CrmAssociationTable } from "@hubspot/ui-extensions/crm";

// Show contacts associated with the current record
<CrmAssociationTable
  objectTypeId="0-1"
  properties={["firstname", "lastname", "email", "phone"]}
  searchable={true}
  pageSize={5}
/>

// Show deals associated with the current company
<CrmAssociationTable
  objectTypeId="0-3"
  properties={["dealname", "amount", "dealstage", "closedate"]}
  sort={[{ property: "amount", direction: "DESC" }]}
/>

// Show associated custom objects
<CrmAssociationTable
  objectTypeId="2-XXXXXXX"
  properties={["name", "status", "createdate"]}
  searchable={true}
  paginated={true}
  pageSize={10}
/>
```

---

## CrmAssociationPivot

Displays associated records organized by their association label. Useful when you have labeled associations (e.g., "Primary Contact", "Billing Contact") and want to group records by those labels.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `objectTypeId` | `string` | Yes | The object type ID of the associated records. |
| `properties` | `string[]` | Yes | Properties to display for each associated record. |
| `associationLabels` | `string[]` | No | Filter to specific association labels. Shows all labels if omitted. |
| `maxAssociations` | `number` | No | Maximum number of associations to display per label. |

### Usage

```jsx
import { CrmAssociationPivot } from "@hubspot/ui-extensions/crm";

// Show contacts grouped by association label
<CrmAssociationPivot
  objectTypeId="0-1"
  properties={["firstname", "lastname", "email"]}
/>

// Filter to specific association labels
<CrmAssociationPivot
  objectTypeId="0-1"
  properties={["firstname", "lastname", "jobtitle"]}
  associationLabels={["Primary Contact", "Billing Contact"]}
  maxAssociations={5}
/>
```

---

## CrmReport

Embeds an existing HubSpot report inside your extension card. The report must already exist in the HubSpot account. Displays the report filtered to the current record context.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `reportId` | `string` | Yes | The ID of the HubSpot report to embed. |

### Usage

```jsx
import { CrmReport } from "@hubspot/ui-extensions/crm";

// Embed a report by its ID
<CrmReport reportId="12345678" />
```

> **Finding report IDs:** Navigate to the report in HubSpot, then extract the ID from the URL: `app.hubspot.com/reports/{portalId}/list/{reportId}`.

---

## CrmStatistics

Displays calculated summary statistics from associated records. Supports aggregation functions like sum, average, min, max, and count across associated record properties.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `objectTypeId` | `string` | Yes | The object type ID of the associated records to aggregate. |
| `statistics` | `StatisticDefinition[]` | Yes | Array of statistic definitions (see below). |

#### StatisticDefinition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | Yes | Display label for the statistic. |
| `property` | `string` | Yes | The property to aggregate. |
| `aggregationType` | `"SUM" \| "AVG" \| "MIN" \| "MAX" \| "COUNT"` | Yes | Aggregation function. |

### Usage

```jsx
import { CrmStatistics } from "@hubspot/ui-extensions/crm";

// Summarize associated deals
<CrmStatistics
  objectTypeId="0-3"
  statistics={[
    { label: "Total Revenue", property: "amount", aggregationType: "SUM" },
    { label: "Average Deal Size", property: "amount", aggregationType: "AVG" },
    { label: "Total Deals", property: "amount", aggregationType: "COUNT" },
  ]}
/>

// Summarize associated tickets
<CrmStatistics
  objectTypeId="0-5"
  statistics={[
    { label: "Open Tickets", property: "hs_object_id", aggregationType: "COUNT" },
    { label: "Avg Resolution Time", property: "time_to_close", aggregationType: "AVG" },
  ]}
/>
```

---

## CRM Action Components

Built-in CRM actions -- adding notes, sending emails, creating records, etc.

| Component | Description |
|-----------|-------------|
| `CrmActionLink` | Clickable link that triggers CRM actions. |
| `CrmActionButton` | Button that triggers CRM actions. |
| `CrmCardActions` | Standalone or dropdown menu buttons with multiple CRM actions. |

---

## CrmActionLink

Renders an inline text link that triggers a native CRM action when clicked. Wraps child text content.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `actionType` | `string` | Yes | The CRM action to trigger (see action types below). |
| `actionContext` | `object` | Yes | Context object with parameters for the action. |
| `children` | `ReactNode` | Yes | Link text content. |

### Action Types

| Action Type | Description | Required Context |
|-------------|-------------|------------------|
| `PREVIEW_OBJECT` | Opens a record preview sidebar. | `objectTypeId`, `objectId` |
| `RECORD_APP_LINK` | Navigates to a record page. | `objectTypeId`, `objectId`. Optional: `external` (boolean, opens in new tab), `includeEschref` (boolean, adds back link). |
| `SEND_EMAIL` | Opens the email compose dialog. | `objectTypeId`, `objectId` |
| `SCHEDULE_MEETING` | Opens the meeting scheduler. | `objectTypeId`, `objectId` |
| `ADD_NOTE` | Opens the note creation dialog. | `objectTypeId`, `objectId` |
| `CREATE_TASK` | Opens the task creation dialog. | `objectTypeId`, `objectId` |
| `MAKE_PHONE_CALL` | Initiates a phone call. | `objectTypeId`, `objectId` |
| `OPEN_RECORD_ASSOCIATION_FORM` | Opens the association form. | `objectTypeId` (of the new record), `association: { objectTypeId, objectId }` (existing record to associate). |
| `CONFIRMATION_ACTION_HOOK` | Triggers a serverless action with a confirmation dialog. | `actionHookType`, plus custom fields. |

### Usage

```jsx
import { CrmActionLink } from "@hubspot/ui-extensions/crm";

// Preview a record (opens sidebar preview)
<CrmActionLink
  actionType="PREVIEW_OBJECT"
  actionContext={{
    objectTypeId: "0-1",
    objectId: contact.hs_object_id,
  }}
>
  {contact.firstname} {contact.lastname}
</CrmActionLink>

// Open record in new tab
<CrmActionLink
  actionType="RECORD_APP_LINK"
  actionContext={{
    objectTypeId: "0-3",
    objectId: record.hs_object_id,
    external: true,
    includeEschref: true,
  }}
>
  {record.name}
</CrmActionLink>

// Send email
<CrmActionLink
  actionType="SEND_EMAIL"
  actionContext={{
    objectTypeId: "0-1",
    objectId: contact.hs_object_id,
  }}
>
  {contact.email}
</CrmActionLink>

// Schedule meeting
<CrmActionLink
  actionType="SCHEDULE_MEETING"
  actionContext={{
    objectTypeId: "0-3",
    objectId: record.hs_object_id,
  }}
>
  Schedule Now
</CrmActionLink>

// Add association
<CrmActionLink
  actionType="OPEN_RECORD_ASSOCIATION_FORM"
  actionContext={{
    objectTypeId: "2-XXXXXXX",
    association: {
      objectTypeId: "0-3",
      objectId: record.hs_object_id,
    },
  }}
>
  + Add Association
</CrmActionLink>
```

---

## CrmActionButton

Renders a styled button that triggers a native CRM action. Shares the same `actionType` and `actionContext` API as `CrmActionLink`.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `actionType` | `string` | Yes | The CRM action to trigger (same values as CrmActionLink). |
| `actionContext` | `object` | Yes | Context object with parameters for the action. |
| `variant` | `"primary" \| "secondary" \| "destructive"` | No | Button style variant. Default `"secondary"`. |
| `disabled` | `boolean` | No | Disables the button. Default `false`. |
| `children` | `ReactNode` | Yes | Button label text. |

### Usage

```jsx
import { CrmActionButton } from "@hubspot/ui-extensions/crm";

// Primary action button
<CrmActionButton
  actionType="SEND_EMAIL"
  actionContext={{
    objectTypeId: "0-1",
    objectId: contact.hs_object_id,
  }}
  variant="primary"
>
  Send Email
</CrmActionButton>

// Add note button
<CrmActionButton
  actionType="ADD_NOTE"
  actionContext={{
    objectTypeId: "0-1",
    objectId: contact.hs_object_id,
  }}
>
  Add Note
</CrmActionButton>

// Create task button
<CrmActionButton
  actionType="CREATE_TASK"
  actionContext={{
    objectTypeId: "0-3",
    objectId: deal.hs_object_id,
  }}
  variant="primary"
>
  Create Follow-up Task
</CrmActionButton>

// Phone call button
<CrmActionButton
  actionType="MAKE_PHONE_CALL"
  actionContext={{
    objectTypeId: "0-1",
    objectId: contact.hs_object_id,
  }}
>
  Call Contact
</CrmActionButton>
```

---

## CrmCardActions

Adds action buttons to the top-right area of a CRM card. Supports standalone buttons and grouped dropdown menus. Must be placed as a direct child of the card's root or returned from the extension.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `actionConfigs` | `ActionConfig[]` | Yes | Array of action configurations (standalone or dropdown). |

#### ActionConfig (Standalone)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"action-library-button"` | Yes | Marks this as a CRM action button. |
| `label` | `string` | Yes | Button label text. |
| `actionType` | `string` | Yes | Same action types as CrmActionLink/CrmActionButton. |
| `actionContext` | `object` | Yes | Context for the action. |

#### ActionConfig (Dropdown)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"dropdown"` | Yes | Marks this as a dropdown menu. |
| `label` | `string` | Yes | Dropdown trigger label. |
| `options` | `ActionConfig[]` | Yes | Array of `action-library-button` items in the dropdown. |

### Usage

```jsx
import { CrmCardActions } from "@hubspot/ui-extensions/crm";

// Standalone action buttons on the card
<CrmCardActions
  actionConfigs={[
    {
      type: "action-library-button",
      label: "Send Email",
      actionType: "SEND_EMAIL",
      actionContext: {
        objectTypeId: "0-1",
        objectId: contact.hs_object_id,
      },
    },
    {
      type: "action-library-button",
      label: "Add Note",
      actionType: "ADD_NOTE",
      actionContext: {
        objectTypeId: "0-1",
        objectId: contact.hs_object_id,
      },
    },
  ]}
/>

// Dropdown menu with multiple actions
<CrmCardActions
  actionConfigs={[
    {
      type: "action-library-button",
      label: "Send Email",
      actionType: "SEND_EMAIL",
      actionContext: {
        objectTypeId: "0-1",
        objectId: contact.hs_object_id,
      },
    },
    {
      type: "dropdown",
      label: "More Actions",
      options: [
        {
          type: "action-library-button",
          label: "Schedule Meeting",
          actionType: "SCHEDULE_MEETING",
          actionContext: {
            objectTypeId: "0-1",
            objectId: contact.hs_object_id,
          },
        },
        {
          type: "action-library-button",
          label: "Create Task",
          actionType: "CREATE_TASK",
          actionContext: {
            objectTypeId: "0-1",
            objectId: contact.hs_object_id,
          },
        },
        {
          type: "action-library-button",
          label: "Make Phone Call",
          actionType: "MAKE_PHONE_CALL",
          actionContext: {
            objectTypeId: "0-1",
            objectId: contact.hs_object_id,
          },
        },
      ],
    },
  ]}
/>
```

---

## Common Object Type IDs

| Object | ID |
|--------|----|
| Contacts | `"0-1"` |
| Companies | `"0-2"` |
| Deals | `"0-3"` |
| Tickets | `"0-5"` |
| Custom Objects | `"2-XXXXXXX"` |

---

## Full Action Types Reference

These action types work with `CrmActionLink`, `CrmActionButton`, and `CrmCardActions`:

| Action Type | Description |
|-------------|-------------|
| `PREVIEW_OBJECT` | Open record preview sidebar |
| `RECORD_APP_LINK` | Navigate to record page |
| `SEND_EMAIL` | Open email compose dialog |
| `SCHEDULE_MEETING` | Open meeting scheduler |
| `ADD_NOTE` | Open note creation dialog |
| `CREATE_TASK` | Open task creation dialog |
| `MAKE_PHONE_CALL` | Initiate phone call via HubSpot calling |
| `OPEN_RECORD_ASSOCIATION_FORM` | Open form to create/add an association |
| `CONFIRMATION_ACTION_HOOK` | Trigger a serverless action with confirmation |
