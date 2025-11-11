# InlineCitationCarouselNext
Button that scrolls the carousel to the next slide.

## Usage
```tsx
<InlineCitationCarouselNext className="rounded-full border px-2 py-1 text-xs">
  Next →
</InlineCitationCarouselNext>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Button classes. |
| children | `React.ReactNode` | true | `"→"` | Indicator content. |
| ...buttonProps | `React.ComponentProps<"button">` | true |  | Additional button props. |

## Details
* Invokes `scrollNext()` on the Embla API from context and disables itself until the API is available.
