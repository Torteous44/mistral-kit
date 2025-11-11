# ToolHeader
Clickable header for a `Tool` instance. Shows tool name, colored status badge, and toggles the collapsible body via Radix `Collapsible.Trigger`.

## Usage
```tsx
<ToolHeader
  toolName="calculator"
  state="completed"
  className="border-b py-2"
  triggerClassName="flex w-full items-center gap-3 text-sm"
  nameClassName="font-medium"
  badgeClassName="text-xs uppercase"
>
  <span className="text-neutral-500">(15% tip)</span>
</ToolHeader>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| toolName | `string` | false | — | Display name shown next to the chevron. |
| state | `ToolState` (`"pending" \| "running" \| "completed" \| "error"`) | false | — | Drives badge text, colors, and `data-state`. |
| className | `string` | true |  | Wrapper classes. |
| triggerClassName | `string` | true |  | Classes for the clickable trigger button. |
| nameClassName | `string` | true |  | Classes applied to the tool name span. |
| badgeClassName | `string` | true |  | Classes applied to the status badge span. |
| children | `React.ReactNode` | true |  | Optional trailing content (e.g., timestamp). |

## Details
* Consumes `Tool` context; you must render it inside a `<Tool>` or it will throw.
* Renders a chevron icon that rotates based on the collapsible open state, plus a pulsing dot when `state === "running"`.
