# FileUploadPanel
Headless UI block for orchestrating document ingestion. Displays title, description, progress state, and helper/error messaging while delegating actual upload logic to callbacks or hooks.

## Usage
```tsx
import { FileUploadPanel } from "@matthewporteous/mistral-kit";

<FileUploadPanel
  status={status}
  fileName={fileUpload.fileName}
  helperText="PDF or DOCX up to 4 MB"
  errorMessage={fileUpload.error?.message}
  onSelectFile={(file) => fileUpload.uploadFile(file)}
  accept=".pdf,.docx,.txt"
  className="rounded-2xl border p-4 space-y-3"
  controlClassName="rounded-full bg-mistral-black text-white px-4 py-2"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| title | `string` | true | `"Upload knowledge"` | Panel heading. |
| description | `string` | true |  | Optional descriptive text under the title. |
| status | `"idle" \| "processing" \| "ready" \| "error"` | true | `"idle"` | Render state (used to pick status label). |
| fileName | `string \| null` | true |  | Displays last uploaded filename. |
| helperText | `string \| null` | true |  | Additional instructions shown below the status row. |
| errorMessage | `string \| null` | true |  | Error text shown when `status === "error"`. |
| accept | `string` | true |  | Value passed to the hidden `<input type="file">`. |
| actionLabel | `string` | true | `"Select file"` | Button label that opens the file picker. |
| busyLabel | `string` | true | `"Processing"` | Status text used when `status === "processing"`. |
| readyLabel | `string` | true | `"Indexed"` | Status text used when `status === "ready"`. |
| className | `string` | true | `""` | Wrapper classes. |
| controlClassName | `string` | true | `""` | Classes applied to the action button. |
| titleClassName | `string` | true | `""` | Title text classes. |
| descriptionClassName | `string` | true | `""` | Description text classes. |
| statusClassName | `string` | true | `""` | Status label classes. |
| fileNameClassName | `string` | true | `""` | Classes applied to the filename element. |
| helperClassName | `string` | true | `""` | Helper text classes. |
| errorClassName | `string` | true | `""` | Error text classes. |
| onSelectFile | `(file: File) => void` | true |  | Called when a user picks a file; you typically call `useFileUpload().uploadFile`. |

## Details
* Stores a hidden `<input type="file">` so you can style the visible button however you like.
* Resets the file input value after each selection to ensure the same file can be re-uploaded if needed.
* Use `status` + `errorMessage` to reflect `useFileUpload` state transitions (`uploading` → `chunking` → `embedding`).
