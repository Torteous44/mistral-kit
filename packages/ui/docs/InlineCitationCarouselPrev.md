# InlineCitationCarouselPrev
Button that scrolls the carousel to the previous slide.

## Usage
```tsx
<InlineCitationCarouselPrev className="rounded-full border px-2 py-1 text-xs">
  ← Prev
</InlineCitationCarouselPrev>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true |  | Button classes. |
| children | `React.ReactNode` | true | `"←"` | Indicator content. |
| ...buttonProps | `React.ComponentProps<"button">` | true |  | Additional button props. |

## Details
* Consumes Embla API via context, calling `scrollPrev()` on click. Automatically disabled if the API is unavailable (e.g., before mount).
