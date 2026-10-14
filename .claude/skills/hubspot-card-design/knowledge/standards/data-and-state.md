---
id: data-and-state
scope: [hooks, data-fetching, serverless, property-listeners, boolean-handling, logging]
depends-on: []
critical-rules: 6
archetypes: [all]
---

# Data & State Management

> Fetching, serverless calls, property listeners, hooks, and boolean handling.

---

## Hooks vs Props: Two Approaches

The SDK supports both hook-based and props-based approaches. They provide identical functionality.

**Hook-based (preferred for new work):** cleaner APIs, no prop drilling.
**Props-based:** explicit dependency injection, works everywhere.

```jsx
// Hook-based — cleaner
hubspot.extend(() => <Extension />);

function Extension() {
  const { actions, context } = useExtensionApi();
  // ...
}

// Props-based — explicit
hubspot.extend(({ context, actions }) => (
  <Extension context={context} actions={actions} />
));
```

---

## Universal Hooks

Available in ALL extension points.

### useExtensionApi

Access both context and actions from a single hook.

```jsx
import { useExtensionApi } from "@hubspot/ui-extensions";

function Extension() {
  const { actions, context } = useExtensionApi();
  // context.user.firstName, context.portal.id, context.location, etc.
  // actions.addAlert, actions.closeOverlay, actions.copyTextToClipboard, etc.
}
```

### useExtensionContext

Context only — account, user, and extension location data.

```jsx
import { useExtensionContext } from "@hubspot/ui-extensions";

function Extension() {
  const context = useExtensionContext();
  // context.location — 'crm.record.tab' | 'crm.record.sidebar' | 'crm.preview' | 'settings' | 'home'
  // context.portal.id, context.portal.timezone
  // context.user.id, context.user.email, context.user.firstName, context.user.lastName
  // context.user.teams — [{ id, name, teammates: [userId, ...] }]
  // context.user.permissions — ['integrations-management-write', ...]
  // context.variables — config profile variables
}
```

**CRM-only context fields** (available in `crm.record.tab`, `crm.record.sidebar`, `crm.preview`, `helpdesk.sidebar`):

| Field | Type | Description |
|-------|------|-------------|
| `crm.objectId` | Number | Current record ID |
| `crm.objectTypeId` | String | Object type ID (e.g., `"0-1"`) |
| `extension.appId` | Number | Extension's app ID |
| `extension.appName` | String | App name |
| `extension.cardTitle` | String | Card title |

### useExtensionActions

Actions only.

```jsx
import { useExtensionActions } from "@hubspot/ui-extensions";

function Extension() {
  const { addAlert, closeOverlay, copyTextToClipboard, reloadPage, openIframeModal } = useExtensionActions();
}
```

---

## CRM-Specific Hooks

Available only in CRM extension points. Import from `@hubspot/ui-extensions/crm`.

### useCrmProperties

**Preferred over `fetchCrmObjectProperties`.** Automatic state management, supports formatting, auto-updates on property changes.

```jsx
import { useCrmProperties } from "@hubspot/ui-extensions/crm";

function Extension() {
  const { properties, isLoading, error, refetch, isRefetching } = useCrmProperties(
    ["firstname", "lastname", "email", "createdate", "amount"],
    {
      propertiesToFormat: "all",
      formattingOptions: {
        date: { format: "MM-DD-YYYY", relative: false },
        dateTime: { format: "MM-DD-YYYY hh:mm", relative: false },
        currency: { addSymbol: true },
      },
    }
  );

  if (isLoading) return <LoadingSpinner size="sm" layout="centered" />;
  if (error) return <Alert variant="error">{error.message}</Alert>;

  return (
    <Flex direction="column" gap="sm">
      <SummaryRow label="Name" value={`${properties.firstname} ${properties.lastname}`} />
      <SummaryRow label="Email" value={properties.email} />
      <Button onClick={refetch} disabled={isRefetching}>Refresh</Button>
    </Flex>
  );
}
```

**Response shape:**

| Field | Type | Description |
|-------|------|-------------|
| `properties` | Object | `{ propertyName: value }` pairs, alphabetical order |
| `isLoading` | Boolean | Initial fetch in progress |
| `error` | Object \| null | Error details if fetch failed |
| `isRefetching` | Boolean | Refetch in progress |
| `refetch` | Function | Trigger a refetch with original formatting |

**Formatting options:**

| Type | Options |
|------|---------|
| `date` | `format` (string, e.g., `"MM-DD-YYYY"`), `relative` (boolean — shows "1 day ago") |
| `dateTime` | `format` (string), `relative` (boolean) |
| `currency` | `addSymbol` (boolean — adds `$` etc.) |

> **Note:** Formatting applies by property type, not content. A string property containing a date won't get date formatting.

### useAssociations

Fetch associated records with pagination.

```jsx
import { useAssociations } from "@hubspot/ui-extensions/crm";

function Extension() {
  const { results, isLoading, error, pagination, refetch } = useAssociations(
    {
      toObjectType: "0-1",        // Contacts
      properties: ["firstname", "lastname", "email"],
      pageLength: 10,
    },
    {
      propertiesToFormat: "all",
      formattingOptions: {
        currency: { addSymbol: true },
      },
    }
  );

  // results: [{ toObjectId, associationTypes, properties }]
  // pagination: { hasNextPage, hasPreviousPage, currentPage, pageSize, nextPage(), previousPage(), reset() }
}
```

---

## Legacy Props-Based Fetching

Still supported but `useCrmProperties` is preferred for new work.

### fetchCrmObjectProperties

```jsx
// Define as module-level constant
const PROPERTIES = ["firstname", "lastname", "email"];

hubspot.extend(({ actions }) => (
  <Extension fetchProperties={actions.fetchCrmObjectProperties} />
));

function Extension({ fetchProperties }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties(PROPERTIES)
      .then(props => setData(props || {}))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);
}
```

Fetch all properties: `fetchCrmObjectProperties("*")`

### onCrmPropertiesUpdate

Subscribe to property changes on the current record (UI changes only, not API).

```jsx
import { debounce } from "lodash";

// Always debounce — fires rapidly
const debouncedRefresh = debounce(refreshData, 50);
onCrmPropertiesUpdate("*", debouncedRefresh);

// Or specific properties with error handling
onCrmPropertiesUpdate(["dealstage", "amount"], (properties, error) => {
  if (error) {
    console.error(error.message);
    return;
  }
  setData(prev => ({ ...prev, ...properties }));
});
```

### refreshObjectProperties

Refresh property data on the CRM record and any CRM data components without a page reload.

```jsx
actions.refreshObjectProperties();
```

> **Note:** Only refreshes HubSpot's built-in property fields and CRM data components. Does NOT refresh data fetched via APIs in app cards.

---

## Serverless Function Calls

```jsx
const { response } = await runServerless({
  name: "functionName",
  parameters: { objectId: context.crm.objectId },
});
```

---

## External API Calls

Use `hubspot.fetch()` for external API calls from the client side.

```jsx
const response = await hubspot.fetch("https://api.example.com/data", { method: "GET" });
const result = await response.json();
```

---

## Server-Side DataTable Pattern

When data comes from a serverless function or external API and is too large to load all at once, use the shared `DataTable` in server-side mode. The component handles the UI (filter bar, sort indicators, pagination) while your card manages the data fetching.

<!-- archetype: list-manager -->
```jsx
import { DataTable } from "./components/DataTable";

const Extension = () => {
  const { actions, context } = useExtensionApi();
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async (params = {}) => {
    setLoading(true);
    const { response } = await runServerless({
      name: "fetchRecords",
      parameters: {
        objectId: context.crm.objectId,
        page: params.page || 1,
        pageSize: 10,
        search: params.search || "",
        filters: params.filters || {},
        sort: params.sort || null,
        sortDir: params.dir || null,
      },
    });
    setRows(response.records);
    setTotalCount(response.totalCount);
    setPage(params.page || 1);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading && rows.length === 0) {
    return <LoadingSpinner size="sm" layout="centered" />;
  }

  return (
    <DataTable
      serverSide={true}
      data={rows}
      totalCount={totalCount}
      page={page}
      columns={COLUMNS}
      renderRow={renderRow}
      searchFields={["name"]}
      filters={FILTERS}
      pageSize={10}
      onSearchChange={(term) => fetchData({ search: term, page: 1 })}
      onFilterChange={(filters) => fetchData({ filters, page: 1 })}
      onSortChange={(sort, dir) => fetchData({ sort, dir, page: 1 })}
      onPageChange={(p) => fetchData({ page: p })}
    />
  );
};
```

**Key rules for server-side mode:**
- `data` contains only the current page's rows — the server handles pagination.
- `totalCount` is the server's total matching count — drives pagination display.
- `page` is controlled externally — passed in, not managed by DataTable.
- All four callbacks (`onSearchChange`, `onFilterChange`, `onSortChange`, `onPageChange`) should trigger a re-fetch with the new parameters.
- Always reset `page` to 1 when search, filter, or sort changes.
- The `filterValues` object passed to `onFilterChange` contains the current state of all filters — pass it to your serverless function for server-side filtering.
- `MultiSelect` filters pass an array of selected values. `DateRange` filters pass `{ from: { year, month, date }, to: { year, month, date } }`.

---

## Logging

Use `logger` for custom log messages that appear in the app's logs in HubSpot.

```jsx
import { logger } from "@hubspot/ui-extensions";

logger.info("Data loaded successfully");
logger.debug(JSON.stringify(context, null, 2));
logger.warn("Approaching rate limit");
logger.error("Failed to fetch data");
```

**Limitations:**
- Not sent in local dev mode (logged to browser console instead).
- Rate limited: 1,000 logs/minute per account.
- Max 100 logs per batch, 10,000 pending messages.

---

## Boolean Property Handling

HubSpot boolean properties come in many formats. Always normalize:

```jsx
const isEnabled =
  prop === true ||
  prop === "true" ||
  prop === "Yes" ||
  prop === "yes";
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
