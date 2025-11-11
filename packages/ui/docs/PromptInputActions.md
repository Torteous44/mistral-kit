# PromptInputActions
Flex-friendly `<div>` wrapper purpose-built for grouping composer actions (buttons, toggles, status text).

## Usage
```tsx
<PromptInputActions className="flex items-center gap-2 text-sm">
  <button type="button">Upload</button>
  <button type="button">Insert example</button>
</PromptInputActions>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true | `""` | Classes applied to the container. |
| ...divProps | `React.HTMLAttributes<HTMLDivElement>` | true |  | Forwarded div props (role, style, etc.). |

## Details
* No styling assumptions—pair it with utilities (e.g., `flex gap-2 items-center`).
