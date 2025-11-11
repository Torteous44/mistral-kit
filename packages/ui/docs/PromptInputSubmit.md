# PromptInputSubmit
Status-aware submit button that swaps its label based on the current composer state (idle, submitting, streaming, error).

## Usage
```tsx
<PromptInputSubmit
  status={status} // "idle" | "submitting" | "streaming" | "error"
  className="rounded-full bg-mistral-orange text-white px-4 py-2"
  disabled={status === "submitting"}
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| status | `PromptInputStatus` | true | `"idle"` | Controls which label is shown. |
| idleLabel | `string` | true | `"Send"` | Text when `status === "idle"`. |
| submittingLabel | `string` | true | `"Sending"` | Text when `status === "submitting"`. |
| streamingLabel | `string` | true | `"Stop"` | Text when `status === "streaming"`. |
| errorLabel | `string` | true | `"Retry"` | Text when `status === "error"`. |
| className | `string` | true | `""` | Classes applied to the `<button>`. |
| disabled | `boolean` | true |  | Whether to disable the submit button. |
| children | `React.ReactNode` | true |  | Custom content; overrides the auto label. |
| ...buttonProps | `React.ButtonHTMLAttributes<HTMLButtonElement>` | true |  | Forwarded button props. |

## Details
* Always renders with `type="submit"`, making it drop-in for any form.
* When you pass `children`, you’re responsible for showing different visuals per status if desired.
