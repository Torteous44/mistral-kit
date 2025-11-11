# PromptInputToolbar
Lightweight `<div>` wrapper for aligning composer controls (attachment buttons, action chips, etc.).

## Usage
```tsx
<PromptInputToolbar className="flex items-center justify-between text-xs text-neutral-500">
  <span>Attachments ready</span>
  <button type="button">Clear</button>
</PromptInputToolbar>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true | `""` | Classes for the toolbar container. |
| ...divProps | `React.HTMLAttributes<HTMLDivElement>` | true |  | All other div props are forwarded. |

## Details
* Does not impose layout—it simply forwards props so you can arrange toolbars however you want.
