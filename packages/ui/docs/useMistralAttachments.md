# useMistralAttachments
Combines `useFileUpload` with prompt helpers so chat panels can accept uploads, embed them, and provide prompt-conditioning helpers plus attachment previews.

## Usage
```tsx
import { useMistralAttachments, useEmbeddings } from "@matthewporteous/mistral-kit";

const { embed } = useEmbeddings({ apiProxyUrl: "/api/embeddings" });
const attachments = useMistralAttachments({
  embedFunction: embed,
  uploadOptions: { apiUrl: "/api/upload-text", maxFileSizeMB: 4 },
});

<input
  ref={attachments.uploadInputRef}
  type="file"
  accept={attachments.attachmentAccept}
  onChange={attachments.handleFileSelection}
/>
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| enabled | `boolean` | true | `true` | Turns the attachment pipeline on/off. |
| uploadOptions | `Partial<Omit<UseFileUploadOptions, "embedFunction">>` | true |  | Passed through to `useFileUpload` (apiUrl, chunk sizes, callbacks). |
| embedFunction | `(texts: string[]) => Promise<{ embedding: number[]; text: string }[]>` | true |  | Required when `enabled`; normally `useEmbeddings().embed`. |
| attachmentOptions | `PrepareOptions` | true |  | Additional options for `preparePromptWithAttachments`. |
| acceptedFileTypes | `string` | true | `.txt,.md,.markdown,.pdf,.docx` | Overrides the `accept` attribute for the hidden file input. |

## Returns
| key | description |
| --- | ----------- |
| `attachmentPreview` | UI-friendly preview info (status, filename, chunkCount) for `PromptAttachmentPreview`. |
| `attachments` | `ChatAttachment[] \| undefined` representing uploaded docs once ready. |
| `hasReadyAttachment` | Boolean indicating whether at least one attachment is ready. |
| `handleFileSelection(event)` | `<input type="file">` change handler that triggers upload + embedding. |
| `uploadInputRef` | Ref to wire into your own hidden `<input type="file">`. |
| `resetAttachments()` | Clears upload state and preview. |
| `preparePrompt(text: string)` | Returns `{ visibleText, modelText }` with attachment hints appended for LLM context. |
| `chunks` | Embedded chunks produced by `useFileUpload` (feed into semantic search). |
| `fileUpload` | Underlying `UseFileUploadResult` for deeper status inspection. |
| `attachmentAccept` | String you can pass to `<input accept>` for consistency. |

## Details
* Warns in the console when `enabled` is true but `embedFunction` is missing; this prevents silent failures in dev.
* `preparePrompt` wraps `buildAttachmentHint` so the conversation displays a short summary while the model receives the expanded context.
