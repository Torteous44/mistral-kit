# PromptInputTextarea
Auto-resizing `<textarea>` optimized for chat inputs. It constrains height between `minRows` and `maxRows`, recalculating size whenever content changes.

## Usage
```tsx
<PromptInputTextarea
  value={draft}
  onChange={(event) => setDraft(event.target.value)}
  minRows={2}
  maxRows={8}
  className="w-full bg-transparent text-base focus:outline-none"
  placeholder="Describe what you need..."
/>
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| minRows | `number` | true | `2` | Minimum visible rows (controls min height). |
| maxRows | `number` | true | `8` | Maximum rows before the textarea stops growing. |
| className | `string` | true | `""` | Classes applied to the `<textarea>`. |
| style | `React.CSSProperties` | true |  | Additional inline styles merged after disabling native resize. |
| submitOnEnter | `boolean` | true | `true` | When true, pressing Enter submits the parent form (Shift+Enter still inserts a newline). |
| onChange | `React.ChangeEventHandler<HTMLTextAreaElement>` | true |  | Change handler; auto-resize still fires a `requestAnimationFrame` update. |
| ...textareaProps | `React.TextareaHTMLAttributes<HTMLTextAreaElement>` | true |  | All other native textarea props (name, placeholder, disabled, etc.). |

## Details
* Maintains an inner ref and uses `useImperativeHandle` so parents receive the DOM node.
* Every change triggers `requestAnimationFrame(resize)` to keep scrolling smooth while typing.
* Uses `useLayoutEffect` to recompute height when controlled `value` updates externally.
