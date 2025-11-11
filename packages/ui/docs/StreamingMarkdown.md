# StreamingMarkdown
React Markdown wrapper that optionally animates the rendered text to mimic streaming while preserving your markdown component overrides.

## Usage
```tsx
import { StreamingMarkdown, useMistralMarkdown } from "@matthewporteous/mistral-kit";

const components = useMistralMarkdown();

<StreamingMarkdown
  text={assistantText}
  animate={isStreaming}
  className="prose prose-neutral"
  components={components}
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| text | `string` | false | — | Markdown source to render. |
| animate | `boolean` | true | `false` | When true, progressively feeds text through `useStreamingText`. |
| className | `string` | true | `"prose prose-sm max-w-none text-current"` | Wrapper class for the `<div>`. |
| components | `ReactMarkdownOptions["components"]` | true |  | Component overrides for markdown nodes. |
| remarkPlugins | `ReactMarkdownOptions["remarkPlugins"]` | true |  | Extra remark plugins (e.g., `remark-gfm`). |

## Details
* Detects whether the text changed after mount before animating, so initial renders appear instantly.
* Delegates actual streaming logic to `useStreamingText`, keeping state co-located.
* Because it renders inside a `<div>`, you can nest it anywhere inside your chat bubbles without extra wrappers.
