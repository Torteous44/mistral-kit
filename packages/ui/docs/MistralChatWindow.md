# MistralChatWindow
Batteries-included chat interface that stitches `useMistralChat`, `MessageList`, `StreamingText`, and `Composer` together. Ideal for demos or quick embeds when you only need single-threaded chat without tool calling.

## Usage
```tsx
import { MistralChatWindow } from "@matthewporteous/mistral-kit";

export default function MinimalChat() {
  return (
    <MistralChatWindow
      apiProxyUrl="/api/mistral"
      systemPrompt="Be brief"
      placeholder="Ask a question"
      className="space-y-4"
      messagesClassName="h-96 overflow-y-auto space-y-2"
      composerClassName="flex gap-2"
    />
  );
}
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| model | `string` | true |  | Forwarded to `useMistralChat` (defaults to `mistral-medium-latest`). |
| apiProxyUrl | `string` | true |  | Chat proxy endpoint (defaults to `/api/mistral`). |
| systemPrompt | `string` | true |  | Optional system instruction injected before conversation history. |
| placeholder | `string` | true | `"Type a message..."` | Composer placeholder text. |
| className | `string` | true | `""` | Wrapper classes for the entire window. |
| messagesClassName | `string` | true | `""` | Classes for the scrollable message region. |
| composerClassName | `string` | true | `""` | Classes applied to the `Composer` form. |
| emptyStateText | `string` | true | `"Start a conversation..."` | Message shown when no history exists. |
| renderMessage | `(message: ChatMessage, isStreaming: boolean) => React.ReactNode` | true |  | Custom renderer for each entry; defaults to `StreamingText` with cursor. |

## Details
* Automatically scrolls to the latest message whenever history updates.
* Calls `chat.sendMessage` only when input is non-empty and no stream is active; stop/clear actions wire to `chat.abort` and `chat.restart`.
* Use `renderMessage` to plug in rich markdown or custom role-specific UIs while retaining built-in streaming cues.
