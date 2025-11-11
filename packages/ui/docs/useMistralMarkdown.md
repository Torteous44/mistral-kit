# useMistralMarkdown
Returns a memoized `react-markdown` component map tailored for AI chat responses. It understands two special fenced languages: `citations` (JSON array) and `actions` (JSON array). Those blocks are rendered via the InlineCitation + Actions components and wire up `onActionSelect` callbacks.

## Usage
```tsx
import { StreamingMarkdown, useMistralMarkdown } from "@matthewporteous/mistral-kit";

const components = useMistralMarkdown({
  onActionSelect: (prompt) => setDraft(prompt),
});

<StreamingMarkdown text={assistantMarkdown} components={components} animate={isStreaming} />
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| onActionSelect | `(prompt: string) => void` | true |  | Called when a rendered action button is clicked. The prompt string comes from the JSON action payload. |

## Returns
`Components` — object you can pass to `react-markdown`.

## Details
* Inline fenced block ```actions generates `Action` buttons with tooltips/labels from the JSON definition.
* Fenced block ```citations renders an `InlineCitation` stack showing quotes and carousel of sources.
* For regular code fences it falls back to `CodeBlock` + `CodeBlockCopyButton` with dark theme.
