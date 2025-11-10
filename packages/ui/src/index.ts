// Components
export { default as MistralChatWindow } from "./components/MistralChatWindow";
export { default as MessageList } from "./components/MessageList";
export { default as Composer } from "./components/Composer";
export { default as StreamingText } from "./components/StreamingText";
export { default as StreamingMarkdown } from "./components/StreamingMarkdown";
export { default as ToolCallBadge } from "./components/ToolCallBadge";
export { default as FileUploadPanel } from "./components/FileUploadPanel";
export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputActions,
  PromptInputButton,
  PromptInputSubmit,
  PromptAttachmentPreview,
} from "./components/PromptInput";
export {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  type ToolState,
} from "./components/Tool";

// Hooks
export * from "./hooks/useMistralChat";
export * from "./hooks/useJSONMode";
export * from "./hooks/useToolExecutor";
export * from "./hooks/useEmbeddings";
export * from "./hooks/useStreamingText";
export * from "./hooks/useFileUpload";
export * from "./hooks/useOrderedMessages";

// Types
export * from "./types/chat";
export * from "./types/upload";
export * from "./types/rag";

// Tools
export * from "./tools";

// Utils
export { chunkText, chunkTextWithOverlap } from "./utils/chunkText";
export { buildAttachmentHint, preparePromptWithAttachments } from "./utils/promptContext";
export { cosineSimilarity } from "./utils/similarity";
export { createSemanticSearchTool } from "./utils/rag";

// Clients
export { uploadText } from "./clients/uploader";
