# PromptInput
Unstyled `<form>` wrapper used by `MistralChatPanel` for advanced composer layouts. It simply forwards refs/props so you can control layout entirely via CSS.

## Usage
```tsx
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from "@matthewporteous/mistral-kit";

<PromptInput onSubmit={handleSubmit} className="space-y-3">
  <PromptInputTextarea
    name="prompt"
    value={draft}
    onChange={(event) => setDraft(event.target.value)}
    className="w-full resize-none bg-transparent"
  />
  <PromptInputSubmit status={status} className="rounded-full bg-mistral-black text-white px-4 py-2" />
</PromptInput>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true | `""` | Classes applied to the `<form>`. |
| ...formProps | `React.FormHTMLAttributes<HTMLFormElement>` | true |  | Any standard form props (onSubmit, role, etc.) are forwarded. |

## Details
* Uses `React.forwardRef` so parent code can imperatively submit or focus the form.
* Because it only applies the provided `className`, you retain full control over composition and semantics.
