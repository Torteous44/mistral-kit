# InlineCitationCarousel
Embla-based carousel wrapper for stepping through multiple sources inside a citation card. Provides context so other carousel controls know the active slide.

## Usage
```tsx
<InlineCitationCarousel className="mt-3">
  <InlineCitationCarouselHeader className="flex items-center justify-between text-xs">
    <InlineCitationCarouselPrev>Prev</InlineCitationCarouselPrev>
    <InlineCitationCarouselIndex />
    <InlineCitationCarouselNext>Next</InlineCitationCarouselNext>
  </InlineCitationCarouselHeader>
  <InlineCitationCarouselContent className="flex gap-3">
    {sources.map((source) => (
      <InlineCitationCarouselItem key={source.url} className="pr-3">
        <InlineCitationSource {...source} />
      </InlineCitationCarouselItem>
    ))}
  </InlineCitationCarouselContent>
</InlineCitationCarousel>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes for the outer wrapper. |
| children | `React.ReactNode` | false | — | Typically header + content. |
| ...divProps | `React.ComponentProps<"div">` | true |  | Additional div props. |

## Details
* Internally calls `useEmblaCarousel()` and supplies the API via context so prev/next/index controls can call `scrollPrev()`/`scrollNext()`.
* Wrap `InlineCitationCarouselContent` inside to ensure the Embla viewport gets the necessary `ref`.
