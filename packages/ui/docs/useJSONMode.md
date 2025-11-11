# useJSONMode
Wrapper around Mistral's JSON mode that enforces a Zod schema locally. It posts to the chat proxy with `response_format: { type: "json_object" }`, parses the reply, and validates it before surfacing the result.

## Usage
```tsx
import { useJSONMode } from "@matthewporteous/mistral-kit";
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

const { data, isLoading, error, generate } = useJSONMode({
  schema: userSchema,
  apiProxyUrl: "/api/mistral",
});

await generate("Extract John (29) at john@example.com from this paragraph");
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| schema | `z.ZodType` | false | — | Schema used to validate parsed JSON. |
| model | `string` | true | `"mistral-medium-latest"` | Model slug passed to the proxy. |
| apiProxyUrl | `string` | true | `"/api/mistral"` | Chat proxy endpoint. |
| systemPrompt | `string` | true |  | Optional system instruction. |
| onSuccess | `(data: z.infer<T>) => void` | true |  | Invoked after successful validation. |
| onError | `(error: Error) => void` | true |  | Invoked when fetch or validation fails. |

## Returns
| key | description |
| --- | ----------- |
| `data` | Latest parsed object (`null` before success). |
| `isLoading` | True while awaiting the response. |
| `error` | Last thrown `Error`, if any. |
| `generate(prompt: string)` | Sends the request and resolves with the validated object (or `null` on failure). |
| `reset()` | Clears `data`, `error`, and cancels any inflight request. |

## Details
* Always sends a `system` message instructing the model to return _only_ JSON; no markdown stripping is performed client-side.
* Aborts any inflight request before issuing a new one to avoid race conditions.
* If the model returns invalid JSON, the hook throws with context (`Failed to parse JSON`). Catch this via `onError` for UI feedback.
