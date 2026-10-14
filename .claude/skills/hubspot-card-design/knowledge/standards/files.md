---
id: files
scope: [files, file-upload, attachments, file-viewer, documents, upload]
depends-on: [forms, states]
archetypes: [list-manager]
---

# Files — `FileUpload` / `FileViewer`

Experimental `@hubspot/ui-extensions` pair for file attachments. `FileUpload` renders a dropzone that uploads straight to the portal's file manager; `FileViewer` lists files this app has uploaded. They're designed to work together: a `FileViewer` on the same card auto-refreshes when a sibling `FileUpload` completes.

## FileUpload

```jsx
import { FileUpload } from "@hubspot/ui-extensions/experimental";

<FileUpload
  fileLimit={5}
  attachToRecord={{ objectTypeId: "0-3", objectId: 19827199 }}
  onChange={(files) => setUploadCount(files.length)}
/>
```

| Prop | Description |
|---|---|
| `fileLimit` | Max number of files. |
| `attachToRecord` | `{objectTypeId, objectId}` — also attach each upload to that CRM record. |
| `onChange` | Fires with the full current file list on add/remove. |

## FileViewer

```jsx
import { FileViewer } from "@hubspot/ui-extensions/experimental";

<FileViewer source="appUser" displayMode="attachment" />
```

| Prop | Description |
|---|---|
| `source` | `"app"` (all files this app uploaded) or `"appUser"` (this app + this user — default). |
| `fileIds` | Restrict to specific file ids. |
| `displayMode` | `"attachment"` (cards — default) or `"list"` (compact links). |
| `autoRefresh` | Re-fetch after a sibling FileUpload completes (default `true`). |

## Rules

1. **Pair them.** An upload zone with no visible result feels broken — put a `FileViewer` under the `FileUpload` (or in an adjacent Tile) so uploads appear immediately.
2. **These hit the real portal.** Uploads land in the portal file manager even from a prototype card. Say so in preview copy when the card is a pitch (e.g. caption "Uploads are saved to this portal's file manager").
3. **`attachToRecord` needs a real record.** In prototype specs, omit it (uploads still work) rather than inventing an objectId.
4. **Not for images-as-content.** Static imagery in a card layout is `Image` (see `media.md`); FileUpload/FileViewer are for user-managed attachments.
5. **Don't use `FileInput`.** It's marked do-not-use in the SDK types and isn't in the catalog.
