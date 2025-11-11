# InlineCitationCardTrigger
Button that opens the citation hover card and summarizes linked sources (hostname + count).

## Usage
```tsx
<InlineCitationCardTrigger
  sources={["https://example.com/source", "https://another.com"]}
  className="rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em]"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| sources | `string[]` | false | — | List of URLs referenced by the citation. Used to build the default label. |
| className | `string` | true |  | Classes applied to the `<button>`. |
| children | `React.ReactNode` | true |  | Custom trigger content (overrides default hostname summary). |
| ...buttonProps | `React.ComponentProps<"button">` | true |  | Additional button props (disabled, onClick, etc.). |

## Details
* Wrapped in `HoverCard.Trigger asChild`, so it inherits all Radix trigger semantics.
* Default text uses the first hostname plus `+N` for remaining sources (e.g., `example.com +2`).
