# useMistralChat
Stateful hook that talks to the chat proxy, streams assistant tokens via SSE, and keeps a local message array in sync. Great for simple chat experiences that do not require tool execution.

## Usage
```tsx
import { useMistralChat, StreamingText, MessageList, Composer } from "@matthewporteous/mistral-kit";

function BasicChat() {
  const { messages, sendMessage, isStreaming, abort, restart } = useMistralChat({
    model: "mistral-medium-latest",
    apiProxyUrl: "/api/mistral",
    systemPrompt: "You are terse",
  });

  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <MessageList
        messages={messages}
        renderMessage={(message) => (
          <StreamingText text={message.content ?? ""} isStreaming={isStreaming && message.role === "assistant"} />
        )}
      />
      <Composer
        value={draft}
        onChange={setDraft}
        onSubmit={() => {
          sendMessage(draft);
          setDraft("");
        }}
        onStop={abort}
        onClear={restart}
        isStreaming={isStreaming}
      />
    </div>
  );
}
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| model | `string` | true | `"mistral-medium-latest"` | Chat completion model name sent to the proxy. |
| tools | `ToolDefinition[]` | true |  | (Reserved) Future support for explicit tools. |
| systemPrompt | `string` | true |  | System instruction inserted before conversation history. |
| apiProxyUrl | `string` | true | `"/api/mistral"` | Endpoint that forwards requests to Mistral (must support streaming). |

## Returns
| key | description |
| --- | ----------- |
| `messages` | Array of `{ id, role, content }` entries representing the conversation. |
| `sendMessage(text: string)` | Starts a streaming request; adds the user message immediately and appends assistant tokens as they arrive. |
| `isStreaming` | Boolean flag while an SSE response is in flight. |
| `abort()` | Cancels the current stream (aborts the underlying `AbortController`). |
| `restart()` | Clears the conversation history and resets streaming state. |

## Details
* Creates a new assistant message ID per request so streaming chunks can mutate the same entry.
* Uses `crypto.randomUUID()` for message IDs; polyfill it in environments without `crypto`.
* Automatically cancels previous requests before starting a new one to avoid interleaved responses.
