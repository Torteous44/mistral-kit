# InlineCitation
Root `<span>` for inline citations embedded inside assistant markdown. Use it to wrap citation text plus triggers/cards.

## Usage
```tsx
<InlineCitation className="inline-flex items-center gap-2">
  <InlineCitationText>Paris hosts the best croissants.</InlineCitationText>
  <InlineCitationCard>
    <InlineCitationCardTrigger sources={["https://en.wikipedia.org/wiki/Paris"]} />
    <InlineCitationCardBody className="rounded-2xl border bg-white p-4">
      ...
    </InlineCitationCardBody>
  </InlineCitationCard>
</InlineCitation>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes applied to the `<span>`. |
| ...spanProps | `React.ComponentProps<"span">` | true |  | Any other span props. |

## Details
* Acts purely as a semantic wrapper—you control layout and spacing.
