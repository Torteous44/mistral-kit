# ToolInput
Displays the parameters passed to a tool call. Strings render as-is; objects/arrays are pretty-printed JSON.

## Usage
```tsx
<ToolInput
  input={{ location: "Paris", unit: "celsius" }}
  className="space-y-1"
  labelClassName="text-xs uppercase tracking-wide text-neutral-500"
  contentClassName="rounded-lg bg-neutral-950/5 p-2 font-mono text-xs"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| input | `any` | false | — | Raw arguments object/string to display. |
| className | `string` | true |  | Wrapper classes. |
| labelClassName | `string` | true |  | Classes for the “Parameters” label. |
| contentClassName | `string` | true |  | Classes applied to the `<pre><code>` block. |

## Details
* Automatically stringifies non-string inputs with two-space indentation.
* Useful for debugging tool usage or letting users audit the arguments the model decided to pass.
