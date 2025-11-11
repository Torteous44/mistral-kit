# CodeBlockCopyButton
Clipboard control scoped to the nearest `CodeBlock`. It reads the highlight context, copies the code string using the Clipboard API, and briefly switches to a “copied” icon.

## Usage
```tsx
<CodeBlock code={code} language="tsx">
  <CodeBlockCopyButton
    className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/70 text-white"
    timeout={1500}
  />
</CodeBlock>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| onCopy | `() => void` | true |  | Called after a successful copy. |
| onError | `(error: Error) => void` | true |  | Called if the Clipboard API throws. |
| timeout | `number` | true | `2000` | Duration (ms) to show the “copied” state before reverting. |
| copyIcon | `React.ReactNode` | true |  | Icon displayed before copying (defaults to Lucide Copy). |
| copiedIcon | `React.ReactNode` | true |  | Icon shown during the copied state (defaults to Lucide Check). |
| className | `string` | true |  | Button classes. |
| children | `React.ReactNode` | true |  | Custom content; overrides icon swapping. |
| ...buttonProps | `React.ComponentProps<"button">` | true |  | Additional button props. |

## Details
* Requires a parent `CodeBlock` so it can access the current `code` via context.
* Uses `navigator.clipboard.writeText`; provide an `onError` handler if you need to support legacy browsers and display fallbacks.
