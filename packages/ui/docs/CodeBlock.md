# CodeBlock
Syntax-highlighted code display built on `react-syntax-highlighter (Prism)` with optional copy affordances via `CodeBlockCopyButton`.

## Usage
```tsx
import { CodeBlock, CodeBlockCopyButton } from "@matthewporteous/mistral-kit";

<CodeBlock
  code={snippet}
  language="ts"
  showLineNumbers
  darkMode
  containerClassName="mt-4"
>
  <CodeBlockCopyButton className="rounded-full bg-white/10 p-2 text-white" />
</CodeBlock>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| code | `string` | false | — | Source string to highlight. |
| language | `string` | false | — | Prism language key. |
| showLineNumbers | `boolean` | true | `false` | Displays gutter with line numbers. |
| darkMode | `boolean` | true |  | Chooses between `oneDark` and `oneLight` themes. |
| className | `string` | true |  | Classes for the inner syntax-highlighter container. |
| containerClassName | `string` | true |  | Classes for the outer frame (default styles include rounded border). |
| children | `React.ReactNode` | true |  | Typically `CodeBlockCopyButton`; rendered absolutely in the top-right corner. |
| ...divProps | `React.HTMLAttributes<HTMLDivElement>` | true |  | Extra attributes for the container. |

## Details
* Provides a React Context so nested `CodeBlockCopyButton` instances can read the current code string.
* Sets sensible monospace font, padding, and background but you can override everything through the two class props.
