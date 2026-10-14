---
id: media
scope: [image, icon, illustration, avatar, icon-catalog, illustration-catalog]
depends-on: []
critical-rules: 7
archetypes: [onboarding-setup, checklist-step-tracker]
---

# Media (Images, Avatars, Illustrations, Icons)

> Any visual element beyond text. All components import from `@hubspot/ui-extensions`.

---

## Image Component

The `Image` component renders an image. Use it for logos, visual brand identity assets, or to accentuate other content. Images cannot exceed the width of the extension's container at various screen sizes.

```jsx
import { Image } from "@hubspot/ui-extensions";

<Image
  alt="A picture of a welcome sign"
  src="https://picsum.photos/id/237/200/300"
  href={{
    url: "https://www.wikipedia.org",
    external: true,
  }}
  onClick={() => {
    console.log("Someone clicked the image!");
  }}
  width={200}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `alt` | `string` | Alt text for the image, same as HTML `img` alt attribute. |
| `height` | `number` | Pixel height of the image. |
| `href` | `string \| { url: string; external?: boolean }` | URL to open on click. String or object with `url` and optional `external` (true = new tab). When both `href` and `onClick` are set, both execute. |
| `onClick` | `() => void` | Function called on click. Receives no arguments; return value ignored. |
| `overlay` | `Modal \| Panel` | A Modal or Panel component to open as an overlay on click. |
| `src` | `string` | Image source: a URL (HTTPS only) or an imported local file path. |
| `width` | `number` | Pixel width of the image. |

### Image Guidelines

- **Supported types:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`
- **Supported sources:** URL (HTTPS only) or local import via relative path
- **Project imports:** Add files to your project, then import by relative path. Total project size limit is 50MB.
- **Responsive:** Images cannot exceed the container width; values beyond the max are ignored.

```jsx
import { Image } from "@hubspot/ui-extensions";
import myImage from "./images/myImage.png";

const Extension = () => {
  return <Image src={myImage} width={300} alt="My imported image" />;
};
```

### Rules

1. Always provide `alt` text.
2. Use fixed `width` + `height` for thumbnails to prevent layout shift.
3. HTTPS only -- HubSpot blocks HTTP sources.
4. Gallery grids: use `AutoGrid columnWidth={250}`, not Flex rows.
5. **Match `Image width` to `AutoGrid columnWidth`.** When an Image has a different width than its AutoGrid column, sibling elements (like Links) can align off-center from the image. Set both to the same value (e.g., `columnWidth={250}` and `width={250}`).

---

## Gallery with "View More"

```jsx
import { AutoGrid, Image, Flex, Text, Link } from "@hubspot/ui-extensions";

<AutoGrid columnWidth={250} gap="small">
  {images.slice(0, 5).map((src, idx) => (
    <Image key={`gallery-${idx}`} src={src} alt={`Image ${idx + 1}`} width={250} height={250} />
  ))}
  {images.length > 5 && (
    <Flex direction="column" justify="center" align="center" gap="xs">
      <Text variant="microcopy">More</Text>
      <Link href={viewAllUrl}>View all images</Link>
    </Flex>
  )}
</AutoGrid>
```

---

## Avatar / Initial Pattern

HubSpot UI extensions do not have a native Avatar component. This pattern provides a reusable avatar with photo support and a deterministic initial fallback using Flex + Text. Modeled after the circular avatars seen in HubSpot's Users & Teams table ("Created by" column).

### Deterministic Color Helper

Colors are assigned based on the user's name so the same person always gets the same color.

```jsx
const AVATAR_COLORS = [
  "#F2545B", // red
  "#FF8F59", // orange
  "#F5C26B", // gold
  "#00BDA5", // teal
  "#00A4BD", // cerulean
  "#547CFF", // blue
  "#6A78D1", // indigo
  "#9B59B6", // purple
  "#E0528D", // pink
  "#516F90", // slate
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name) {
  return (name || "?").charAt(0).toUpperCase();
}
```

### Avatar Component (Photo with Initial Fallback)

```jsx
import { Flex, Image, Text } from "@hubspot/ui-extensions";

const AVATAR_SIZES = {
  sm: 28,
  md: 40,
  lg: 56,
};

const Avatar = ({ name, photoUrl, size = "sm" }) => {
  const px = AVATAR_SIZES[size];

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
      />
    );
  }

  // Initial fallback: colored circle with letter.
  // Flex acts as the circular container; Text renders the letter.
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap="flush"
    >
      <Text
        format={{ fontWeight: "bold", color: "#FFFFFF" }}
      >
        {getInitial(name)}
      </Text>
    </Flex>
  );
};
```

> **Note on styling:** HubSpot UI extensions do not support arbitrary CSS (no `border-radius`, no `style` prop). The Image component renders photos at the given dimensions. For true circular cropping, the photo URL itself should be pre-cropped to a square, or rely on HubSpot's built-in profile photo URLs which are already square. The initial fallback uses a background color via the Flex container's appearance. Since UI extensions have limited style control, you may need to rely on the natural rendering or use a Tag/StatusTag with a colored background as an alternative approach.

### AvatarName: Avatar Paired with Name Text

This is the pattern used in HubSpot's "Created by" column -- avatar left of name with tight gap.

```jsx
import { Flex, Text } from "@hubspot/ui-extensions";

const AvatarName = ({ name, photoUrl, size = "sm" }) => {
  return (
    <Flex direction="row" align="center" gap="xs">
      <Avatar name={name} photoUrl={photoUrl} size={size} />
      <Text>{name}</Text>
    </Flex>
  );
};
```

### Usage in a Table Row

```jsx
import { Table, TableBody, TableRow, TableCell, Text } from "@hubspot/ui-extensions";

<Table>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>
          <AvatarName
            name={user.name}
            photoUrl={user.avatarUrl}
            size="sm"
          />
        </TableCell>
        <TableCell>
          <Text>{user.email}</Text>
        </TableCell>
        <TableCell>
          <Text>{user.role}</Text>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Avatar Sizing Guide

| Size | Pixels | Context |
|------|--------|---------|
| `sm` | 28px | Table rows, inline lists |
| `md` | 40px | Card headers, detail views |
| `lg` | 56px | Profile headers, spotlight areas |

---

## Illustration Component

The `Illustration` component renders an illustration from HubSpot's built-in illustration library. Use it for empty states, onboarding screens, and section decoration.

```jsx
import { Illustration } from "@hubspot/ui-extensions";

<Illustration
  name="lock"
  alt="Lock icon indicating content is currently restricted"
  width={300}
  height={300}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `alt` | `string` | Alt text for accessibility. Default: `"<name> illustration"`. |
| `height` | `number` | Height in pixels. |
| `name` | `string` | The illustration name from the catalog below. **Required.** |
| `width` | `number` | Width in pixels. |

### Available Illustrations

| Name | Description / Use Case |
|------|----------------------|
| `addOnReporting` | Reporting upsell or add-on features |
| `api` | API connection, developer integrations |
| `automatedTesting` | Test automation, QA workflows |
| `callingSetUp` | Phone/calling configuration |
| `companies` | Company records, B2B contexts |
| `contacts` | Contact records, people-related features |
| `contentStrategy` | Content planning, editorial workflows |
| `customObjects` | Custom object schemas |
| `customerExperience` | CX features, satisfaction |
| `customerSupport` | Support/help desk features |
| `deals` | Deal/pipeline records |
| `developerSecurityUpdate` | Security updates, developer alerts |
| `electronicSignature` | E-signature workflows |
| `electronicSignatureEmptyState` | E-signature empty state |
| `emailConfirmation` | Email verification, confirmation |
| `emptyStateCharts` | Empty chart/report states |
| `errorGeneral` | General error pages |
| `errorHourglass` | Timeout or processing errors |
| `integrations` | Third-party integrations |
| `leads` | Lead records, prospecting |
| `lock` | Restricted access, permissions |
| `meetings` | Meeting scheduling |
| `middlePaneCards` | CRM middle pane card layouts |
| `multipleObjects` | Multi-object relationships |
| `object` | Generic CRM object |
| `paymentsButton` | Payment collection |
| `productsShoppingCart` | Products, e-commerce |
| `propertiesSidebar` | Property configuration |
| `registration` | User registration, signup |
| `sandboxAddOn` | Sandbox environments |
| `sidebar` | Settings sidebar |
| `social` | Social media features |
| `store` | Marketplace, app store |
| `storeDisabled` | Disabled/unavailable marketplace |
| `successfullyConnectedEmail` | Email connection success |
| `target` | Goals, targeting |
| `task` | Task management |
| `tickets` | Support ticket records |
| `unlock` | Access granted, unlocked content |

### Usage Guidelines

**Empty states** -- Use with `EmptyState` or `ErrorState` components:

```jsx
import { EmptyState, Illustration, Text, Button } from "@hubspot/ui-extensions";

const NoDataYet = () => (
  <EmptyState
    title="No contacts found"
    layout="vertical"
    reverseOrder={false}
  >
    <Text>Import contacts or create one manually to get started.</Text>
    <Button variant="primary">Create contact</Button>
  </EmptyState>
);
```

**Onboarding / first-time setup:**

```jsx
import { Flex, Illustration, Heading, Text, Button } from "@hubspot/ui-extensions";

const OnboardingWelcome = () => (
  <Flex direction="column" align="center" gap="md">
    <Illustration name="integrations" width={200} height={200} />
    <Heading>Connect your tools</Heading>
    <Text>Link your existing services to sync data automatically.</Text>
    <Button variant="primary">Get started</Button>
  </Flex>
);
```

**Section decoration (smaller, inline):**

```jsx
import { Flex, Illustration, Text } from "@hubspot/ui-extensions";

<Flex direction="row" align="center" gap="sm">
  <Illustration name="lock" width={48} height={48} />
  <Text>This section requires admin permissions.</Text>
</Flex>
```

### Choosing the Right Illustration

| Context | Recommended Illustrations |
|---------|--------------------------|
| No data / empty list | `emptyStateCharts`, `contacts`, `deals`, `tickets` |
| Error / failure | `errorGeneral`, `errorHourglass` |
| Permissions / access | `lock`, `unlock` |
| Setup / onboarding | `callingSetUp`, `integrations`, `registration` |
| Success / confirmation | `successfullyConnectedEmail`, `emailConfirmation` |
| CRM objects | `contacts`, `companies`, `deals`, `leads`, `tickets`, `customObjects` |

---

## Icon Component

The `Icon` component renders a visual icon within other components. It works inside most components that support children (Button, Text, Alert, Flex, etc.) but not in components that lack child support (e.g., Input).

> **Spec `Icon` is the native HubSpot `Icon`.** hs-uix 2.1.0 ships an `Icon` *superset* (custom glyphs, any CSS color, pixel sizes), but Studio intentionally maps spec `Icon` to the **native** component — so stick to native props (`name` from the catalog below, semantic `color`, `sm`/`md`/`lg` `size`). Don't author hex colors or pixel sizes on `Icon`; an invalid `name` renders a red `xCircle` placeholder by design.

Always pair icons with text. If that is not possible, include the `screenReaderText` prop.

```jsx
import { Alert, Button, Flex, Icon, Text } from "@hubspot/ui-extensions";

const Extension = () => (
  <Flex align="start" direction="column" gap="sm">
    <Alert title="Sync complete" variant="success">
      <Icon name="success" /> 42 contacts updated
    </Alert>
    <Button variant="primary">
      <Icon name="refresh" />&nbsp;Sync contacts
    </Button>
    <Text>
      <Icon name="clock" />{" "}Last synced 5 minutes ago
    </Text>
  </Flex>
);
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | **Required.** The icon to display. See full list below. |
| `color` | `"alert" \| "inherit" \| "success" \| "warning"` | Icon color. Default: `"inherit"`. |
| `screenReaderText` | `string` | Text for screen readers when the icon has no visible label. |
| `size` | `"sm" \| "small" \| "md" \| "medium" \| "lg" \| "large"` | Overrides the automatic size based on parent component. |
| `testId` | `string` | Used by `findByTestId()` in tests. |

### Icon Colors

| Color | Value | Use Case |
|-------|-------|----------|
| Default (inherits parent) | `color="inherit"` | Most contexts |
| Alert (red) | `color="alert"` | Errors, destructive actions |
| Warning (yellow) | `color="warning"` | Caution states |
| Success (green) | `color="success"` | Confirmation, completion |

### Icon Spacing

Icons do not include automatic spacing. Add space manually:

```jsx
// Space character
<Icon name="success" /> 42 contacts

// Non-breaking space
<Icon name="refresh" />&nbsp;Sync contacts

// JSX expression
<Icon name="clock" />{" "}Last synced
```

### Available Icon Names (Complete List)

**General Actions:**
`add`, `approvals`, `block`, `copy`, `delete`, `download`, `edit`, `ellipses`, `enroll`, `filter`, `forward`, `left`, `pin`, `publish`, `readMore`, `record`, `redo`, `refresh`, `remove`, `replace`, `right`, `rotate`, `save`, `search`, `send`, `settings`, `snooze`, `stopRecord`, `undo`, `upload`, `view`, `viewDetails`, `zoomIn`, `zoomOut`

**Navigation & UI:**
`downCarat`, `upCarat`, `home`, `link`, `listView`, `notEditable`, `readOnlyView`, `hide`

**Communication:**
`calling`, `callingHangup`, `callingMade`, `callingMissed`, `callingVoicemail`, `callTranscript`, `comment`, `email`, `emailOpen`, `emailThreadedReplies`, `mention`, `messages`, `notification`, `notificationOff`

**CRM & Objects:**
`contact`, `crm`, `dataSync`, `enrichment`, `objectAssociations`, `objectAssociationsManyToMany`, `objectAssociationsManyToOne`, `realEstateListing`

**Status & Feedback:**
`checkCircle`, `circleFilled`, `circleHollow`, `exclamation`, `exclamationCircle`, `faceHappy`, `faceHappyFilled`, `faceNeutral`, `faceNeutralFilled`, `faceSad`, `faceSadFilled`, `filledXCircleIcon`, `info`, `infoNoCircle`, `lessCircle`, `moreCircle`, `question`, `questionAnswer`, `questionCircle`, `success`, `thumbsDown`, `thumbsUp`, `warning`, `xCircle`

**Content & Files:**
`attach`, `book`, `description`, `documents`, `file`, `folder`, `folderOpen`, `image`, `imageGallery`, `insertVideo`, `powerPointFile`, `salesTemplates`, `textSnippet`, `video`, `videoFile`, `videoPlayerSubtitles`

**Data Types:**
`date`, `hash`, `text`, `textBodyExpanded`, `textColor`, `textDataType`

**Commerce & Finance:**
`bank`, `gift`, `invoice`, `order`, `paymentSubscriptions`, `product`, `quickbooks`, `salesQuote`, `shoppingCart`

**Social Media:**
`facebook`, `googlePlus`, `instagram`, `linkedin`, `pinterest`, `twitter`, `x`, `xing`, `youtube`, `youtubePlay`

**Business & Workflow:**
`appointment`, `artificialIntelligence`, `artificialIntelligenceEnhanced`, `bulb`, `campaigns`, `cap`, `clock`, `delay`, `developerProjects`, `flame`, `gauge`, `generateChart`, `globe`, `globeLine`, `goal`, `guidedActions`, `hubDB`, `inbox`, `integrations`, `key`, `language`, `lesson`, `light`, `location`, `locked`, `mobile`, `office365`, `presentation`, `quote`, `recentlySelected`, `registration`, `reports`, `robot`, `rss`, `sequences`, `signal`, `signalPoor`, `signature`, `sortAlpAsc`, `sortAlpDesc`, `sortAmtAsc`, `sortAmtDesc`, `sortNumAsc`, `sortNumDesc`, `sortTableAsc`, `sortTableDesc`, `spellCheck`, `sprocket`, `star`, `strike`, `styles`, `tablet`, `tag`, `tasks`, `test`, `ticket`, `translate`, `trophy`, `website`, `workflows`

**Favorites:**
`favoriteHollow`

### Standard Icon Sizing by Context

| Context | Size | Example |
|---------|------|---------|
| Inline with body text | `"sm"` | `<Text><Icon name="info" size="sm" /> Note</Text>` |
| Inside buttons | (auto) | `<Button><Icon name="refresh" /> Sync</Button>` |
| Standalone indicators | `"md"` | `<Icon name="warning" size="md" color="warning" />` |
| Large featured icons | `"lg"` | `<Icon name="lock" size="lg" />` |

### Icon Alignment Rules

**Never nest `<Icon>` inside `<Text>` for alignment purposes.** Inline rendering causes vertical misalignment — the icon floats above or below the text baseline. Instead, separate the icon and text into siblings inside a Flex row:

```jsx
// ❌ Icon inside Text — vertical misalignment
<Text><Icon name="success" /> Win points</Text>

// ✅ Flex row handles vertical centering properly
<Flex direction="row" align="center" gap="xs">
  <Icon name="success" />
  <Text>Win points</Text>
</Flex>
```

**Icons inside `<Text>` ignore the `size` prop.** When an Icon is a child of Text, the `size` prop has no effect — the icon renders at an unexpected (usually too large) size. Either remove the `size` prop and let the icon inherit from its parent, or pull the icon out of `<Text>` into a Flex row.

```jsx
// ❌ size="xs" is ignored — icon renders too large
<Text format={{ fontWeight: "demibold" }}>
  Field Name <Icon name="info" size="xs" />
</Text>

// ✅ Remove size prop — icon inherits correctly inside Text
<Text format={{ fontWeight: "demibold" }}>
  Field Name <Icon name="info" />
</Text>

// ✅ Best: pull icon out of Text into a Flex row
<Flex direction="row" align="center" gap="xs">
  <Text format={{ fontWeight: "demibold" }}>Field Name</Text>
  <Icon name="info" size="xs" />
</Flex>
```

**Use matching icon shapes for checked/unchecked states.** When pairing icons to represent complete vs. incomplete, use icons with the same silhouette so the column doesn't jitter:

| State | Icon | Why |
|-------|------|-----|
| Checked | `"checkCircle"` | Circle with check inside |
| Unchecked | `"circleHollow"` | Empty circle — same dimensions |
| ~~Checked~~ | ~~`"success"`~~ | Standalone checkmark — different dimensions, causes jitter |

**Icon silently drops invalid names.** If you pass an invalid `name` prop, the `Icon` component renders nothing — no error, no fallback, just empty space. Always verify icon names against the list below. Common mistakes:
- `"error"` → use `"xCircle"` (X inside a circle). `"error"` is a valid Tag variant, not an icon name.
- `"alert"` → use `"warning"` (triangle with exclamation). `"alert"` is a valid icon *color*, not an icon name.
- `"check"` → use `"success"` or `"checkCircle"`
- `"danger"` → use `"warning"` or `"xCircle"`. `"danger"` is a StatusTag variant, not an icon name.

### Common Icon Patterns

**Info tooltip trigger:**

```jsx
import { Flex, Icon, Text, Tooltip } from "@hubspot/ui-extensions";

<Flex direction="row" align="center" gap="xs">
  <Text format={{ fontWeight: "bold" }}>Score</Text>
  <Icon
    name="info"
    size="sm"
    screenReaderText="More information about score"
    overlay={<Tooltip>Score is calculated based on engagement frequency.</Tooltip>}
  />
</Flex>
```

**Copy to clipboard:**

```jsx
import { Button, Icon } from "@hubspot/ui-extensions";

<Button
  variant="secondary"
  size="xs"
  onClick={() => {
    actions.addAlert({
      title: "Copied!",
      variant: "success",
    });
  }}
>
  <Icon name="copy" />&nbsp;Copy ID
</Button>
```

**External link indicator:**

```jsx
import { Link, Icon, Text } from "@hubspot/ui-extensions";

<Text>
  <Link href="https://app.hubspot.com/contacts/123">
    View in HubSpot <Icon name="globe" size="sm" />
  </Link>
</Text>
```

**Edit / delete action pair:**

```jsx
import { Flex, Button, Icon } from "@hubspot/ui-extensions";

<Flex direction="row" gap="xs">
  <Button variant="secondary" size="xs" onClick={onEdit}>
    <Icon name="edit" />&nbsp;Edit
  </Button>
  <Button variant="destructive" size="xs" onClick={onDelete}>
    <Icon name="delete" />&nbsp;Delete
  </Button>
</Flex>
```

**Search input placeholder icon:**

```jsx
import { Flex, Icon, Input } from "@hubspot/ui-extensions";

<Input
  name="search"
  label="Search"
  placeholder="Search records..."
  onChange={handleSearch}
/>
```

> Note: The `Input` component does not support child components (no inline Icon). Place a search Icon above or beside the input using Flex if you need a visual indicator.

### Property Type Indicator Icons

Pattern from HubSpot's Data Enrichment Mapping -- small icons inline with property names to indicate field type visually.

```jsx
import { Flex, Icon, Text } from "@hubspot/ui-extensions";

const PROPERTY_TYPE_ICONS = {
  string: "text",
  number: "hash",
  date: "date",
  datetime: "date",
  enumeration: "listView",
  bool: "checkCircle",
  phone_number: "calling",
  email: "email",
};

const PropertyTypeLabel = ({ type, label }) => {
  const iconName = PROPERTY_TYPE_ICONS[type] || "description";
  return (
    <Flex direction="row" align="center" gap="xs">
      <Icon name={iconName} size="sm" />
      <Text>{label}</Text>
    </Flex>
  );
};
```

**Usage in a mapping table:**

```jsx
import { Table, TableBody, TableRow, TableCell, Text, Icon } from "@hubspot/ui-extensions";

const MappingTable = ({ mappings }) => (
  <Table>
    <TableBody>
      {mappings.map((m) => (
        <TableRow key={m.sourceField}>
          <TableCell>
            <PropertyTypeLabel type={m.sourceType} label={m.sourceField} />
          </TableCell>
          <TableCell>
            <Icon name="right" size="sm" />
          </TableCell>
          <TableCell>
            <PropertyTypeLabel type={m.targetType} label={m.targetField} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
```

---

## Quick Reference: All Media Imports

```jsx
import {
  Image,
  Icon,
  Illustration,
} from "@hubspot/ui-extensions";
```
