# InlineCitationCardBody
Radix HoverCard content portal where you render citation details (quotes, carousels, sources).

## Usage
```tsx
<InlineCitationCardBody sideOffset={8} className="w-72 rounded-2xl border bg-white p-4 shadow-xl">
  <p className="text-xs text-neutral-600">Referenced paragraph...</p>
</InlineCitationCardBody>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes for the hover-card content container. |
| ...contentProps | `React.ComponentProps<typeof HoverCard.Content>` | true |  | All Radix content props (align, sideOffset, collisionPadding, etc.). |

## Details
* Rendered inside `HoverCard.Portal`, so positioning is handled by Radix; style using standard classNames.
