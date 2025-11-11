# useOrderedMessages
Stabilizes the ordering of `ChatMessage` records when tool execution yields out-of-order updates. It assigns a deterministic index to each message the first time it appears, then sorts copies of the array accordingly.

## Usage
```tsx
import { useOrderedMessages } from "@matthewporteous/mistral-kit";

const ordered = useOrderedMessages(toolExecutor.messages);

return <MessageList messages={ordered} />;
```

## Parameters
`messages: ChatMessage[]`

## Returns
`ChatMessage[]` — new array sorted by first-seen order.

## Details
* Relies on `crypto.randomUUID()` IDs generated elsewhere; if two messages share the same ID they’ll collapse into one entry.
* Internally stores the order map in state so React re-renders only when new IDs arrive, not on every `messages` reference change.
