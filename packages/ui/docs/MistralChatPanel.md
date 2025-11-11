# MistralChatPanel
Composite chat surface that wires `useToolExecutor`, semantic search, file uploads, markdown actions, and status messaging into a single panel. Use it when you want every feature (tools, attachments, embeddings, streaming UI) without assembling the primitives yourself.

## Usage
```tsx
import { MistralChatPanel, createWeatherTool, calculatorTool } from "@matthewporteous/mistral-kit";

const weatherTool = createWeatherTool({ apiProxyUrl: "/api/weather" });

export default function FullDemo() {
  return (
    <MistralChatPanel
      className="h-full flex flex-col"
      baseTools={[weatherTool, calculatorTool]}
      apiProxyUrl="/api/mistral"
      embeddingsOptions={{ apiProxyUrl: "/api/embeddings" }}
      uploadOptions={{ apiUrl: "/api/upload-text", maxFileSizeMB: 4 }}
      semanticSearchOptions={{ contextChunksForGeneral: 8 }}
      systemPrompt="You are a concise assistant."
    />
  );
}
```

## Props
| name | type | optional | default | description |
| ---- | ---- | -------- | ------- | ----------- |
| className | `string` | true | `""` | Wrapper classes applied to the outer container. |
| model | `string` | true | `"mistral-medium-latest"` | Chat completion model slug passed to the API proxy. |
| apiProxyUrl | `string` | true | `"/api/mistral"` | Relative or absolute URL for the chat proxy route. |
| systemPrompt | `string` | true |  | Optional system instruction prepended to every payload. |
| maxTurns | `number` | true | `6` | Maximum tool-execution turns before aborting. |
| toolTimeout | `number` | true | `30000` | Timeout (ms) for each tool run before raising an error message. |
| sendChat | `SendChatHandler` | true |  | Custom transport override for streaming chat completions (defaults to internal fetch). |
| tools | `ToolDefinition[]` | true |  | Provide a fully controlled tool list (skips auto-merging base/extra/semantic tools). |
| baseTools | `ToolDefinition[]` | true | `[]` | Built-in tools available to the agent each turn. |
| extraTools | `ToolDefinition[]` | true | `[]` | Additional dynamic tools merged with `baseTools`. |
| semanticSearchOptions | `Omit<SemanticSearchToolOptions, "chunks" | "embedQuery"> & { enabled?: boolean }` | true |  | Enables semantic search tool wiring when uploads are ready. |
| enableUploads | `boolean` | true | `true` | Toggles attachment ingestion UI and processing. |
| uploadOptions | `Partial<Omit<UseFileUploadOptions, "embedFunction">>` | true |  | Extra options passed into `useFileUpload` (apiUrl, sizes, callbacks). |
| attachmentOptions | `PrepareOptions` | true |  | Controls how attachments are summarized into prompts. |
| acceptedFileTypes | `string` | true |  | Overrides accepted MIME extensions (default `.txt,.md,.markdown,.pdf,.docx`). |
| embeddingsOptions | `UseEmbeddingsOptions` | true |  | Configures embedding fetches (model, proxy URL, batch size). |
| onToolCall | `(toolName: string, args: any, result: any) => void` | true |  | Called after each tool resolves (even on failure). |
| messageListClassName | `string` | true |  | Appended to the internal `MessageList` wrapper. |
| markdownComponents | `Components` | true |  | Override the markdown renderer instead of using `useMistralMarkdown`. |
| onActionSelect | `(prompt: string) => void` | true |  | Invoked when inline markdown actions are selected. |
| promptPlaceholder | `string` | true | `"Describe what you need..."` | Placeholder text for the composer textarea. |
| classNames | `MistralChatPanelClassNames` | true |  | Fine-grained class overrides for container, scroll area, prompt, bubbles, attachments, etc. |
| unstyled | `boolean` | true | `false` | When true, all default Tailwind classes are removed so `classNames` must provide styling. |
| animateAssistantResponses | `boolean` | true | `false` | Enables incremental animation of assistant messages. |

## Details
* Leverages `useEmbeddings`, `useMistralAttachments`, `useMistralTools`, and `useToolExecutor` under the hood.
* Supports uploading a document, chunking, embedding it locally, then injecting a semantic search tool so the model can ground its answers.
* Automatically scrolls to the most recent message, keeps assistant markdown interactive (citations/actions), and exposes callback hooks for analytics.
* If you need total control, start from the same primitives (`useToolExecutor` + PromptInput stack) instead of this panel.
