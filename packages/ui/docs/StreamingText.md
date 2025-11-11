# StreamingText
Displays assistant output with optional incremental animation and a blinking cursor. Designed to be screen-reader friendly by keeping `aria-live` updated only while streaming.

## Usage
```tsx
import { StreamingText } from "@matthewporteous/mistral-kit";

<StreamingText
  text={message.content ?? ""}
  isStreaming={isStreaming && message.id === lastAssistantId}
  showCursor
  cursorChar="▋"
  className="font-mono"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| text | `string` | false | — | Current text to display. |
| isStreaming | `boolean` | true | `false` | Enables incremental reveal + cursor blinking. |
| showCursor | `boolean` | true | `true` | Toggles rendering of the cursor glyph. |
| cursorChar | `string` | true | `"▋"` | Character used for the cursor. |
| className | `string` | true | `""` | Classes applied to the outer `<span>`. |
| cursorClassName | `string` | true | `""` | Classes applied to the cursor `<span>`. |

## Details
* When `isStreaming` becomes true and `text` grows, characters are appended frame-by-frame using `requestAnimationFrame` so users can watch tokens appear.
* Cursor visibility toggles every 500 ms while streaming; once streaming stops the text and cursor remain static.
* `aria-live="polite"` and `aria-busy` keep assistive tech in sync without double-speaking old content.
