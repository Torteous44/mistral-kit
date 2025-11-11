# PromptAttachmentPreview
Attachment chip used inside composers to show upload progress, ready states, and errors. Ships with sensible icons for uploading/ready/error but you can override them via `iconMap`.

## Usage
```tsx
<PromptAttachmentPreview
  fileName="company-strategy.pdf"
  status="ready"
  chunkCount={18}
  onRemove={resetAttachments}
  className="rounded-xl border px-3 py-2"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| fileName | `string` | false | — | Name of the attached file. |
| status | `"uploading" \| "ready" \| "error"` | false | — | Current upload status. |
| chunkCount | `number` | true |  | Number of chunks generated after embedding. |
| error | `string` | true |  | Error message displayed when `status === "error"`. |
| description | `string` | true |  | Subtitle shown under the filename (falls back to `error` for error state). |
| className | `string` | true | `""` | Wrapper class. |
| style | `React.CSSProperties` | true |  | Inline styles merged with defaults. |
| onRemove | `() => void` | true |  | Called when the remove button is pressed. |
| removeLabel | `string` | true | `"Remove attachment"` | Accessible label for the remove button. |
| iconMap | `Partial<Record<PromptAttachmentStatus, (className?: string) => React.ReactNode>>` | true |  | Custom icon renderers per status. |

## Details
* Layout relies on flexbox; override `.mistral-attachment-preview__*` classes for more granular control.
* When `status === "uploading"`, the helper text defaults to the provided `description` or remains blank, letting you show real-time progress externally.
