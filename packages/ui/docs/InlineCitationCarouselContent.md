# InlineCitationCarouselContent
Flex container that holds the carousel slides inside `InlineCitationCarousel`.

## Usage
```tsx
<InlineCitationCarouselContent className="flex gap-3">
  {sources.map((source) => (
    <InlineCitationCarouselItem key={source.url} className="pr-3">
      <InlineCitationSource {...source} />
    </InlineCitationCarouselItem>
  ))}
</InlineCitationCarouselContent>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes for the track div (defaults to `display: flex`). |
| ...divProps | `React.ComponentProps<"div">` | true |  | Additional track props. |

## Details
* Applies `display: flex` plus `minWidth: 0` to allow slides to shrink properly; extend spacing via `className`.
