# InlineCitationSource
Simple source card showing title, URL, description, and optional children (e.g., badges).

## Usage
```tsx
<InlineCitationSource
  title={source.title}
  url={source.url}
  description={source.description}
  className="rounded-xl border bg-mistral-beige/40 px-3 py-2 text-xs leading-relaxed"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| title | `string` | true |  | Heading text for the source. |
| url | `string` | true |  | URL string (rendered inside a `<p>`—wrap with `<a>` yourself if you need a link). |
| description | `string` | true |  | Additional copy describing the citation. |
| className | `string` | true |  | Classes applied to the container div. |
| children | `React.ReactNode` | true |  | Extra nodes (tags, buttons, etc.). |
| ...divProps | `React.ComponentProps<"div">` | true |  | Additional props forwarded to the div. |

## Details
* Intentionally bare so you can decide whether to render the URL as plain text or anchor.
