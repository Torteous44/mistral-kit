# Actions
Utility `<div>` used to group inline action buttons under AI responses (e.g., “Explain more”, “Create issue”). Often paired with `Action`.

## Usage
```tsx
import { Actions, Action } from "@matthewporteous/mistral-kit";

<Actions className="flex gap-2 text-xs uppercase tracking-wide">
  <Action tooltip="Queue follow-up" onClick={() => enqueue("follow_up")}>Follow up</Action>
  <Action tooltip="Copy answer" onClick={copyAnswer}>Copy</Action>
</Actions>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes applied to the wrapping `<div>`. |
| children | `React.ReactNode` | true |  | Usually `Action` buttons. |
| ...divProps | `React.ComponentProps<"div">` | true |  | Forwards any other div props/handlers. |

## Details
* Keeps semantics simple (`<div>`). Add your own layout utilities (flex/grid) to match your design system.
