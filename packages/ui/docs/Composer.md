# Composer
Form component for collecting user input with built-in send, stop, and clear controls. Keeps keyboard handling consistent (Enter sends, Shift+Enter adds newline) and disables submission while streaming.

## Usage
```tsx
import { Composer } from "@matthewporteous/mistral-kit";

<Composer
  value={draft}
  onChange={setDraft}
  onSubmit={() => sendPrompt(draft)}
  onStop={abortStreaming}
  onClear={() => setDraft("")}
  isStreaming={isStreaming}
  className="flex gap-2 items-center"
  inputClassName="flex-1 rounded-lg border px-3 py-2"
  buttonClassName="rounded-lg border px-3 py-2"
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| value | `string` | false | — | Current input text (controlled). |
| onChange | `(value: string) => void` | false | — | Updates `value` whenever the field changes. |
| onSubmit | `() => void` | false | — | Called when the form submits (button click or Enter). |
| onStop | `() => void` | true |  | Invoked when the stop button is pressed. |
| onClear | `() => void` | true |  | Invoked when the clear button is pressed. |
| isStreaming | `boolean` | true | `false` | Disables send button and input while streaming. |
| disabled | `boolean` | true | `false` | Hard disables the entire form. |
| placeholder | `string` | true | `"Type a message..."` | Placeholder text for the `<input>`. |
| className | `string` | true | `""` | Wrapper class for the `<form>`. |
| inputClassName | `string` | true | `""` | Classes applied to the `<input>`. |
| buttonClassName | `string` | true | `""` | Classes shared by send/stop/clear buttons. |
| sendButtonText | `string` | true | `"Send"` | Label for the submit button. |
| stopButtonText | `string` | true | `"Stop"` | Label for the stop button. |
| clearButtonText | `string` | true | `"Clear"` | Label for the clear button. |
| showStopButton | `boolean` | true | `true` | Toggles rendering of the stop button. |
| showClearButton | `boolean` | true | `true` | Toggles rendering of the clear button. |

## Details
* Submission is blocked while `isStreaming` is true or the trimmed input is empty.
* Automatically handles Enter vs. Shift+Enter so users can send messages without focus loss.
* Buttons expose `aria-label`s (based on their text) to stay accessible when you replace the inner content with icons.
