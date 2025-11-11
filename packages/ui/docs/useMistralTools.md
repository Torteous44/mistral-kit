# useMistralTools
Memoized helper that merges base + extra tool definitions and optionally adds a semantic-search tool backed by uploaded document chunks.

## Usage
```tsx
import { useMistralTools } from "@matthewporteous/mistral-kit";

const tools = useMistralTools({
  baseTools: [weatherTool, calculatorTool],
  semanticSearch: {
    enabled: true,
    chunks,
    embedQuery: async (text) => (await embed(text))[0]?.embedding ?? [],
    contextChunksForGeneral: 5,
  },
});
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| baseTools | `ToolDefinition[]` | true | `[]` | Always-included tools. |
| extraTools | `ToolDefinition[]` | true | `[]` | Dynamic tools (e.g., user-provided). |
| semanticSearch | `{ enabled?: boolean; chunks: EmbeddedChunk[]; embedQuery: (text: string) => Promise<number[]>; contextChunksForGeneral?: number; }` | true |  | When provided and `chunks.length > 0`, injects a semantic search tool produced by `createSemanticSearchTool`. |

## Returns
`ToolDefinition[]` — memoized array suitable for `useToolExecutor`.

## Details
* The semantic-search tool is only appended when `semanticSearch.enabled !== false`, `chunks.length > 0`, and `embedQuery` exists.
* `contextChunksForGeneral` tunes how many leading chunks to return when the user asks for summaries instead of targeted queries.
