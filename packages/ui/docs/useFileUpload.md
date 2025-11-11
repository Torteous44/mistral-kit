# useFileUpload
High-level hook that uploads a document to a text-extraction endpoint, chunks it with overlap, embeds each chunk, and reports progress suitable for chat attachments.

## Usage
```tsx
import { useFileUpload, useEmbeddings } from "@matthewporteous/mistral-kit";

const { embed } = useEmbeddings({ apiProxyUrl: "/api/embeddings" });
const fileUpload = useFileUpload({
  apiUrl: "/api/upload-text",
  embedFunction: embed,
  maxFileSizeMB: 4,
  chunkSize: 800,
  chunkOverlap: 120,
  onSuccess: (chunks) => console.log("chunks", chunks.length),
});

<input type="file" onChange={(e) => e.target.files && fileUpload.uploadFile(e.target.files[0])} />
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| apiUrl | `string` | false | — | Upload endpoint (`/api/upload-text` by default). |
| embedFunction | `(texts: string[]) => Promise<{ embedding: number[]; text: string }[]>` | false | — | Function that returns embeddings for each chunk. Usually `useEmbeddings().embed`. |
| maxFileSizeMB | `number` | true | `4` | Rejects files larger than this limit. |
| chunkSize | `number` | true | `800` | Character length of each chunk before overlap. |
| chunkOverlap | `number` | true | `120` | Characters of overlap between consecutive chunks. |
| onSuccess | `(chunks: EmbeddedChunk[]) => void` | true |  | Called with embedded chunks after the pipeline completes. |
| onError | `(error: Error) => void` | true |  | Called when upload/chunking/embedding fails. |

## Returns
| key | description |
| --- | ----------- |
| `uploadFile(file: File)` | Starts the pipeline (aborts any existing upload first). |
| `status` | `"idle" \\| "uploading" \\| "chunking" \\| "embedding" \\| "ready" \\| "error"` indicating the current phase. |
| `fileName` | Name of the most recent file (or `null`). |
| `chunks` | Array of `EmbeddedChunk` objects ready for semantic search. |
| `error` | Error instance when the pipeline fails. |
| `chunkCount` | Derived length of `chunks`. |
| `attachmentPreview` | UI-ready object consumed by `PromptAttachmentPreview`. |
| `reset()` | Aborts the current upload and clears internal state. |

## Details
* Detects PDFs/DOCX files and sends them as `multipart/form-data`; plain text is sent as JSON to minimize payload size.
* After extraction it calls `chunkTextWithOverlap`, then forwards the resulting strings to `embedFunction`.
* Errors with `name === "AbortError"` are treated as expected cancellations and simply reset the status back to `"idle"`.
