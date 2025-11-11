# InlineCitationText
Simple `<span>` that holds the quoted text tied to citations.

## Usage
```tsx
<InlineCitationText className="text-sm text-neutral-700">
  Source-aligned statement.
</InlineCitationText>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes for the span. |
| ...spanProps | `React.ComponentProps<"span">` | true |  | Additional span props. |

## Details
* Mainly for consistency; style it however you like.
