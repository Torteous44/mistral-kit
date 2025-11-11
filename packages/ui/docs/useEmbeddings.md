# useEmbeddings
Client-side helper for batching text into the embeddings proxy, tracking request state, and computing cosine similarity locally.

## Usage
```tsx
import { useEmbeddings } from "@matthewporteous/mistral-kit";

const { embed, embeddings, isLoading, error, similarity } = useEmbeddings({
  apiProxyUrl: "/api/embeddings",
  model: "mistral-embed",
});

const [{ embedding: queryVec }] = await embed("Explain the executive summary");
const topMatch = docs
  .map((doc) => ({ doc, score: similarity(queryVec, doc.embedding) }))
  .sort((a, b) => b.score - a.score)[0];
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| model | `string` | true | `"mistral-embed"` | Embedding model identifier. |
| apiProxyUrl | `string` | true | `"/api/embeddings"` | Proxy endpoint that calls Mistral’s `/embeddings`. |
| maxBatchSize | `number` | true | `50` | Maximum texts per API call; larger input arrays are sliced into sequential batches. |

## Returns
| key | description |
| --- | ----------- |
| `embeddings` | Array of `{ text, embedding: number[] }` from the last request. |
| `isLoading` | True while a batch is in flight. |
| `error` | Error instance when a request fails (e.g., proxy returns 500). |
| `embed(texts: string | string[])` | Fetches embeddings for the provided text(s); resolves to an array matching the input order. |
| `similarity(a: number[], b: number[])` | Cosine similarity helper for two vectors (throws if dimensions differ). |
| `reset()` | Clears cached embeddings, error, loading state, and aborts in-progress fetches. |

## Details
* Uses `AbortController` per call; calling `embed` again cancels the previous request.
* `maxBatchSize` is enforced client-side to keep Edge runtimes within limits—tune based on your quotas.
* The proxy accepts `input` or `texts`, and the hook normalizes to whichever you pass.
