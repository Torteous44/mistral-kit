# useStreamingText
Tiny animation hook that progressively reveals a string when `animate` is true. Useful for showing markdown updates or responses received over SSE that you buffer manually.

## Usage
```tsx
import { useStreamingText } from "@matthewporteous/mistral-kit";

const displayed = useStreamingText(fullText, { animate: isStreaming, step: 3 });

return <p>{displayed}</p>;
```

## Parameters
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| text | `string` | false | — | Target string to display. |
| options.animate | `boolean` | true | `false` | When true, reveals `text` gradually; otherwise sets it immediately. |
| options.step | `number` | true | `2` | Number of characters to append per animation frame. |

## Returns
`string` — the currently displayed substring.

## Details
* Uses `requestAnimationFrame` internally; the hook cancels the frame when unmounted or when `animate` flips to false.
* Setting `animate=false` immediately syncs the displayed text to the `text` argument.
