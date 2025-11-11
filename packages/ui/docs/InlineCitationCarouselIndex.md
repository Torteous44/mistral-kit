# InlineCitationCarouselIndex
Displays the current slide index (`current/total`) for the citation carousel.

## Usage
```tsx
<InlineCitationCarouselIndex className="text-xs font-mono" />
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Classes applied to the indicator div. |
| children | `React.ReactNode` | true |  | Custom content; defaults to `${current}/${count}`. |
| ...divProps | `React.ComponentProps<"div">` | true |  | Additional props forwarded to the div. |

## Details
* Subscribes to Embla events (`select`, `reInit`) via context to keep values in sync.
* Provide `children` if you prefer to render dots or other indicators but still need access to the context through your own component.
