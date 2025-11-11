# InlineCitationCarouselHeader
Utility `<div>` often used to house prev/next buttons and the slide index.

## Usage
```tsx
<InlineCitationCarouselHeader className="flex items-center justify-between text-xs text-neutral-500">
  <InlineCitationCarouselPrev>Previous</InlineCitationCarouselPrev>
  <InlineCitationCarouselIndex />
  <InlineCitationCarouselNext>Next</InlineCitationCarouselNext>
</InlineCitationCarouselHeader>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Header classes. |
| ...divProps | `React.ComponentProps<"div">` | true |  | Additional props forwarded to the header div. |

## Details
* Purely structural—style it to match your design language.
