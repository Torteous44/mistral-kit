# Tool
Radix Collapsible-based shell that groups tool call metadata, parameters, and results. It manages open state (controlled or uncontrolled) and exposes context consumed by `ToolHeader`/`ToolContent`.

## Usage
```tsx
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@matthewporteous/mistral-kit";

<Tool defaultOpen>
  <ToolHeader toolName="get_weather" state="running" className="rounded-xl border px-4 py-2" />
  <ToolContent className="space-y-3 px-4 py-3">
    <ToolInput input={{ location: "Paris" }} className="text-xs" />
    <ToolOutput output={{ temperatureC: 18, condition: "sunny" }} />
  </ToolContent>
</Tool>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| defaultOpen | `boolean` | true | `false` | Initial open state when uncontrolled. |
| open | `boolean` | true |  | Controlled open state. |
| onOpenChange | `(open: boolean) => void` | true |  | Callback fired when the header toggles the collapsible. |
| className | `string` | true |  | Classes applied to the underlying `Collapsible.Root`. |
| children | `React.ReactNode` | false | — | Typically `ToolHeader` + `ToolContent`. |

## Details
* Provides context so `ToolHeader` can rotate chevrons based on `open` without prop drilling.
* When `open` is controlled, you must pass `onOpenChange`; otherwise it becomes read-only.
