# ToolContent
Wrapper around `Collapsible.Content` that hosts tool parameters, streaming output, and errors.

## Usage
```tsx
<ToolContent className="space-y-3 border-t px-4 py-3 text-sm">
  <ToolInput input={args} />
  <ToolOutput output={result} errorText={error} />
</ToolContent>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes for the expanding body. |
| children | `React.ReactNode` | false | — | Content to reveal/collapse. |

## Details
* Since it is Radix content, transitions are fully controllable via CSS using the provided `className`.
