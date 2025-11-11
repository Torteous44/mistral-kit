# ChatStatus
Status pill for surfacing system information (warnings, errors, tips) inline with the chat UI.

## Usage
```tsx
import { ChatStatus } from "@matthewporteous/mistral-kit";

<ChatStatus
  variant="warning"
  message="Tool execution timed out"
  icon={<TriangleAlert className="h-4 w-4 text-yellow-500" />}
  action={<button onClick={retry}>Retry</button>}
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| variant | `"info" \| "error" \| "warning"` | true | `"info"` | Controls background/border classes. |
| message | `string` | false | — | Main status text. |
| icon | `ReactNode` | true |  | Optional leading icon. |
| action | `ReactNode` | true |  | Optional trailing action (button/link). |
| className | `string` | true |  | Additional wrapper classes. |
| unstyled | `boolean` | true | `false` | Skip built-in border/background classes, letting you style manually. |

## Details
* When `unstyled` is false, it renders a flex row with rounded border + variant colors defined in `variantClasses`.
* Works great for data-quality warnings and empty states inside `MistralChatPanel`.
