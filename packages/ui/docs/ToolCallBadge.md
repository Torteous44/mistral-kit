# ToolCallBadge
Small status badge for showing the lifecycle of a tool invocation (pending, success, error). You can either pass children for full control or let the component render `toolName`, status text, and detail inline.

## Usage
```tsx
import { ToolCallBadge } from "@matthewporteous/mistral-kit";

<ToolCallBadge
  toolName="get_weather"
  status="success"
  detail="Paris, FR"
  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase"
  statusClassName="font-semibold"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| toolName | `string` | true |  | Name of the tool shown before the status. |
| status | `"pending" \| "success" \| "error"` | true | `"pending"` | Current tool state, affects the `aria-label` text. |
| detail | `string` | true |  | Optional trailing text (e.g., arguments summary). |
| className | `string` | true | `""` | Wrapper classes. |
| statusClassName | `string` | true | `""` | Classes applied to the status label span. |
| children | `React.ReactNode` | true |  | If provided, the component renders `children` instead of the default layout. |

## Details
* Adds `role="status"` so screen readers announce state changes.
* When you pass `children`, no status text is generated—use this escape hatch for complete custom layouts.
