# InlineCitationCarouselItem
Slide wrapper for each citation within the carousel viewport.

## Usage
```tsx
<InlineCitationCarouselItem className="pr-3">
  <InlineCitationSource title={source.title} url={source.url} description={source.description} />
</InlineCitationCarouselItem>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes applied to the slide div. |
| ...divProps | `React.ComponentProps<"div">` | true |  | Additional slide props. |

## Details
* Sets `flex: 0 0 100%` and `minWidth: 0` so each slide takes the full width of the viewport.
