# InlineCitationQuote
Blockquote wrapper used to display the cited sentence/paragraph inside the hover card.

## Usage
```tsx
<InlineCitationQuote className="text-xs text-neutral-500">
  “Croissants were first documented in Paris in …”
</InlineCitationQuote>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes applied to the `<blockquote>`. |
| children | `React.ReactNode` | true |  | Quoted text. |
| ...blockquoteProps | `React.ComponentProps<"blockquote">` | true |  | Additional blockquote props. |

## Details
* Keep typography small to fit within the hover card; the component does not enforce style.
