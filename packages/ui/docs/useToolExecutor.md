# useToolExecutor
High-level orchestrator that sends streaming chat completion payloads with tools, executes returned tool calls (with timeout protection), and feeds tool results back into the conversation loop until completion.

## Usage
```tsx
import { useToolExecutor, calculatorTool, createWeatherTool } from "@matthewporteous/mistral-kit";

const weatherTool = createWeatherTool({ apiProxyUrl: "/api/weather" });

function ToolsDemo() {
  const toolExecutor = useToolExecutor({
    tools: [weatherTool, calculatorTool],
    apiProxyUrl: "/api/mistral",
    systemPrompt: "Use tools when needed",
    toolTimeout: 20000,
  });

  return (
    <div>
      <button onClick={() => toolExecutor.execute("What is the weather and 15% tip on $42?")}>Run</button>
      {toolExecutor.messages.map((msg) => (
        <pre key={msg.id}>{msg.role}: {msg.content}</pre>
      ))}
    </div>
  );
}
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| tools | `ToolDefinition[]` | false | — | Functions available to the model. Each requires `name`, `description`, optional Zod `schema`, `parameters`, and async `run`. |
| model | `string` | true | `"mistral-medium-latest"` | Model slug. |
| apiProxyUrl | `string` | true | `"/api/mistral"` | Chat proxy endpoint with streaming enabled. |
| systemPrompt | `string` | true |  | Optional instruction inserted at the top of `messages`. |
| maxTurns | `number` | true | `10` | Upper bound on tool execution loops to prevent infinite cycles. |
| toolTimeout | `number` | true | `30000` | Timeout in milliseconds for each tool `run` call. |
| onToolCall | `(toolName: string, args: any, result: any) => void` | true |  | Observer invoked after each tool resolves (even if it errors). |
| sendChat | `(payload, signal) => Promise<ChatCompletionResponse>` | true |  | Custom transport; defaults to the built-in fetch-based streaming helper. |

## API
| key | description |
| --- | ----------- |
| `messages` | Array of `ChatMessage` objects including assistant/tool role entries as the loop progresses. |
| `isExecuting` | Boolean while the executor is running (set via `flushSync` for immediate UI updates). |
| `error` | Captures the last thrown error (`null` otherwise). |
| `execute(prompt: string, context?: { attachments?: ChatAttachment[]; displayContent?: string; })` | Starts a new tool run. Adds the user message, streams assistant output, executes returned tool calls sequentially, and feeds results back into the loop until the model stops requesting tools or `maxTurns` is reached. |
| `reset()` | Aborts any inflight work and clears conversation state. |

## Details
* Streaming is handled by `defaultSendChat`, which parses SSE chunks to append assistant content while capturing tool call deltas.
* Tool arguments are JSON parsed and optionally validated via `ToolDefinition.schema` when it’s a Zod schema.
* Each tool call is awaited sequentially with `Promise.race` + timeout; failures are serialized into `{ error, toolName }` tool messages so the model can react.
* Use `context.attachments` and `context.displayContent` to show a friendly message while sending a richer model prompt (e.g., when including document summaries).
