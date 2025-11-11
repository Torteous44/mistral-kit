# @matthewporteous/mistral-kit (ui)
Headless React primitives and Edge-safe helpers for wiring Mistral AI chat, tools, and retrieval into any Next.js/React application. Use it when you need production-ready chat surfaces, streaming hooks, drop-in API proxies, or a CLI that scaffolds secure routes without re-implementing Mistral plumbing.

## Install

```bash
pnpm add @matthewporteous/mistral-kit
```

Peer dependencies: `react@^18 || ^19` and `react-dom@^18 || ^19`.

## Quickstart

```tsx
import {
  MistralChatWindow,
  calculatorTool,
  createWeatherTool,
} from "@matthewporteous/mistral-kit";

export default function Demo() {
  return (
    <MistralChatWindow
      model="mistral-medium-latest"
      apiProxyUrl="/api/mistral"
      systemPrompt="You are a helpful assistant."
    />
  );
}
```

## API Reference

### Components

* [MistralChatPanel](./docs/MistralChatPanel.md) — full streaming chat workspace with tool calling, uploads, semantic search, and actionable markdown.
* [MistralChatWindow](./docs/MistralChatWindow.md) — one-line chat UI composed of the core hook + primitives.
* [MessageList](./docs/MessageList.md) — role-aware message renderer with optional custom item renderers.
* [Composer](./docs/Composer.md) — input form with send/stop/clear controls and keyboard handling.
* [StreamingText](./docs/StreamingText.md) — a11y-friendly token streaming display with blinking cursor.
* [StreamingMarkdown](./docs/StreamingMarkdown.md) — markdown renderer that can animate updates using `useStreamingText`.
* [ToolCallBadge](./docs/ToolCallBadge.md) — minimal status badge for tool invocations.
* [FileUploadPanel](./docs/FileUploadPanel.md) — UX helper for document ingestion states.
* [PromptInput](./docs/PromptInput.md) — unstyled form wrapper for advanced composer layouts.
* [PromptInputTextarea](./docs/PromptInputTextarea.md) — auto-resizing textarea.
* [PromptInputToolbar](./docs/PromptInputToolbar.md) — horizontal toolbar wrapper.
* [PromptInputActions](./docs/PromptInputActions.md) — flex container for composer actions.
* [PromptInputButton](./docs/PromptInputButton.md) — bare button primitive for toolbar slots.
* [PromptInputSubmit](./docs/PromptInputSubmit.md) — status-aware submit button.
* [PromptAttachmentPreview](./docs/PromptAttachmentPreview.md) — attachment badge with status icons.
* [Tool](./docs/Tool.md) — collapsible wrapper for tool execution details.
* [ToolHeader](./docs/ToolHeader.md) — header row with status badge.
* [ToolContent](./docs/ToolContent.md) — collapsible content region.
* [ToolInput](./docs/ToolInput.md) — formatted parameter viewer.
* [ToolOutput](./docs/ToolOutput.md) — result/error renderer.
* [Actions](./docs/Actions.md) — container for inline response actions.
* [Action](./docs/Action.md) — tooltip-capable action button.
* [CodeBlock](./docs/CodeBlock.md) — syntax-highlighted block with copy affordance.
* [CodeBlockCopyButton](./docs/CodeBlockCopyButton.md) — clipboard control that ties into `CodeBlock` context.
* [InlineCitation](./docs/InlineCitation.md) — root wrapper for inline citations.
* [InlineCitationText](./docs/InlineCitationText.md) — spans the quoted text.
* [InlineCitationCard](./docs/InlineCitationCard.md) — Radix HoverCard root for citation details.
* [InlineCitationCardTrigger](./docs/InlineCitationCardTrigger.md) — trigger badge summarizing sources.
* [InlineCitationCardBody](./docs/InlineCitationCardBody.md) — hover-card content portal.
* [InlineCitationCarousel](./docs/InlineCitationCarousel.md) — Embla-powered carousel shell.
* [InlineCitationCarouselContent](./docs/InlineCitationCarouselContent.md) — flex track for carousel items.
* [InlineCitationCarouselItem](./docs/InlineCitationCarouselItem.md) — single slide wrapper.
* [InlineCitationCarouselHeader](./docs/InlineCitationCarouselHeader.md) — header row for carousel controls.
* [InlineCitationCarouselIndex](./docs/InlineCitationCarouselIndex.md) — selected slide indicator.
* [InlineCitationCarouselPrev](./docs/InlineCitationCarouselPrev.md) — previous button.
* [InlineCitationCarouselNext](./docs/InlineCitationCarouselNext.md) — next button.
* [InlineCitationSource](./docs/InlineCitationSource.md) — displays source title/url/description.
* [InlineCitationQuote](./docs/InlineCitationQuote.md) — blockquote styled wrapper for referenced text.
* [ChatStatus](./docs/ChatStatus.md) — inline status pill for chat/system feedback.

### Hooks

* [useMistralChat](./docs/useMistralChat.md) — streaming chat state + helpers.
* [useJSONMode](./docs/useJSONMode.md) — structured output with Zod validation.
* [useToolExecutor](./docs/useToolExecutor.md) — orchestrates automatic tool calling loops.
* [useEmbeddings](./docs/useEmbeddings.md) — batching helper for the embeddings proxy.
* [useStreamingText](./docs/useStreamingText.md) — progressively renders text streams.
* [useFileUpload](./docs/useFileUpload.md) — upload → chunk → embed pipeline for RAG documents.
* [useOrderedMessages](./docs/useOrderedMessages.md) — stabilizes async tool messages.
* [useMistralAttachments](./docs/useMistralAttachments.md) — bridges uploads into chat attachments + prompt context.
* [useMistralTools](./docs/useMistralTools.md) — merges base/extra tools and semantic search.
* [useMistralMarkdown](./docs/useMistralMarkdown.md) — markdown component map with citations + inline actions.

### Tools

* [calculatorTool](./docs/calculatorTool.md) — math operations (add/subtract/multiply/divide/percentage).
* [dateTimeTool](./docs/dateTimeTool.md) — returns current date/time metadata.
* [weatherTool](./docs/weatherTool.md) — default weather lookup (direct wttr.in).
* [createWeatherTool](./docs/createWeatherTool.md) — factory that targets a proxy route instead of hitting wttr.in directly.
* [searchDocsTool](./docs/searchDocsTool.md) — placeholder semantic search responder.
* [defaultTools](./docs/defaultTools.md) — convenience array containing the built-in tools.

### Next.js API Helpers

* `@matthewporteous/mistral-kit/next/api/chat` — Edge runtime POST handler that streams chat completions through Mistral's API while hiding your key.
* `@matthewporteous/mistral-kit/next/api/embeddings` — Edge POST handler that proxies embeddings.
* `@matthewporteous/mistral-kit/next/api/upload-text` — Node.js route that extracts text from uploads (PDF/docx/plaintext).
* `@matthewporteous/mistral-kit/next/api/weather` — Edge route that fetches current weather from wttr.in for use with the weather tool.

### Server Utilities

* `createMistralClient` (see `src/server.ts`) — minimal fetch-based client exposing `chatCompletions`, `chatCompletionsStream`, and `embeddings` helpers.
* `uploadText` — thin client helper for calling the upload route from other runtimes.

### CLI

Run `npx mistral-kit init` (or `pnpm mistral-kit init -- --dir apps/site`) to scaffold the four API routes in your own Next.js app. Options: `--dir`, `--app-dir`, `--force`.
