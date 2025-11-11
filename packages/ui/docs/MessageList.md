# MessageList
Unstyled list component that renders `ChatMessage` entries with role-specific class names or a custom renderer.

## Usage
```tsx
import { MessageList } from "@matthewporteous/mistral-kit";

<MessageList
  messages={messages}
  className="space-y-3"
  messageClassName="rounded-lg px-3 py-2"
  userMessageClassName="bg-mistral-black text-white ml-auto"
  assistantMessageClassName="bg-white border"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| messages | `ChatMessage[]` | false | — | Conversation history to render. |
| className | `string` | true | `""` | Wrapper classes for the `<div role="log">`. |
| messageClassName | `string` | true | `""` | Classes applied to each message row before role classes. |
| userMessageClassName | `string` | true | `""` | Extra classes for messages with `role === "user"`. |
| assistantMessageClassName | `string` | true | `""` | Extra classes for assistant rows. |
| renderMessage | `(message: ChatMessage) => React.ReactNode` | true |  | Override the default plain-text renderer per entry. |

## Details
* Renders nothing when `messages.length === 0`, allowing parent placeholders to take over.
* Adds `data-role` and `data-message-id` attributes to each row for testing or styling hooks.
* Wrap it in a scroll container of your choosing; accessibility attributes (`role="log"`, `aria-live="polite"`) are set automatically.
