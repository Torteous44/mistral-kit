# Action
Single button with optional tooltip + accessible label for use inside `Actions`.

## Usage
```tsx
<Action
  tooltip="Retry the last question"
  label="Retry"
  className="rounded-full border px-3 py-1"
  onClick={retry}
>
  Retry
</Action>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| tooltip | `string` | true |  | When provided, wraps the button with Radix Tooltip showing this text. |
| label | `string` | true |  | Screen-reader label (falls back to `tooltip`). |
| className | `string` | true |  | Button classes. |
| type | `"button" \| "submit" \| "reset"` | true | `"button"` | Button type attribute. |
| children | `React.ReactNode` | true |  | Visible button content. |
| ...buttonProps | `React.ComponentProps<"button">` | true |  | All standard button props (onClick, disabled, etc.). |

## Details
* Tooltip portal is rendered via Radix, so remember to style tooltip content globally if you customize `className`.
* Adds a visually hidden `<span class="sr-only">` containing `label || tooltip` to maintain accessibility even when using icons.
