# PromptInputButton
Generic button primitive for PromptInput toolbars. It forwards refs and lets you override the button `type` (defaults to `button`).

## Usage
```tsx
<PromptInputButton
  className="rounded-full border px-3 py-1 text-xs"
  onClick={attachFile}
>
  Attach
</PromptInputButton>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| type | `"button" \| "submit" \| "reset"` | true | `"button"` | Button type attribute. |
| className | `string` | true | `""` | Classes forwarded to the `<button>`. |
| ...buttonProps | `React.ButtonHTMLAttributes<HTMLButtonElement>` | true |  | Any other button props (onClick, disabled, etc.). |

## Details
* Uses `React.forwardRef` so you can focus/animate the button externally.
* Keep using `PromptInputSubmit` for submit-specific behavior; this primitive is for supplementary actions.
