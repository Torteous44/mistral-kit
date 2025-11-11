# ToolOutput
Renders the result (or error) returned by a tool call. Accepts either raw React nodes or serializable data.

## Usage
```tsx
<ToolOutput
  output={{ temperatureC: 18, condition: "Sunny" }}
  className="space-y-1"
  labelClassName="text-xs uppercase tracking-wide text-neutral-500"
  contentClassName="rounded-lg bg-white p-3 font-mono text-xs"
  errorClassName="rounded-lg bg-red-50 p-3 text-xs text-red-600"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| output | `React.ReactNode \| any` | true |  | Successful tool result; React nodes are rendered directly, everything else is JSON stringified. |
| errorText | `string` | true |  | Error message shown instead of output when set. |
| className | `string` | true |  | Wrapper classes. |
| labelClassName | `string` | true |  | Classes for the “Result”/“Error” label. |
| contentClassName | `string` | true |  | Classes for the success content container. |
| errorClassName | `string` | true |  | Classes for the error container. |

## Details
* When both `output` and `errorText` are empty, nothing renders, letting you hide the section while a tool is still running.
* React nodes let you render bespoke UI (charts, cards) when a tool returns structured data you want to format.
