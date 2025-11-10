import * as React from "react";
import { useMistralChat } from "../hooks/useMistralChat";
import MessageList from "./MessageList";
import Composer from "./Composer";
import StreamingText from "./StreamingText";
import type { ChatMessage } from "../types/chat";

type MistralChatWindowProps = {
  model?: string;
  apiProxyUrl?: string;
  systemPrompt?: string;
  placeholder?: string;
  className?: string;
  messagesClassName?: string;
  composerClassName?: string;
  emptyStateText?: string;
  renderMessage?: (message: ChatMessage, isStreaming: boolean) => React.ReactNode;
};

/**
 * MistralChatWindow - Full-featured 1-line chat UI
 *
 * Complete chat interface combining useMistralChat hook with MessageList and Composer.
 * Handles all state management internally - just pass configuration props.
 *
 * @example
 * ```tsx
 * <MistralChatWindow
 *   model="mistral-medium-latest"
 *   apiProxyUrl="/api/mistral"
 *   systemPrompt="You are a helpful assistant"
 *   placeholder="Ask me anything..."
 * />
 * ```
 */
export default function MistralChatWindow(props: MistralChatWindowProps) {
  const {
    model,
    apiProxyUrl,
    systemPrompt,
    placeholder = "Type a message...",
    className = "",
    messagesClassName = "",
    composerClassName = "",
    emptyStateText = "Start a conversation...",
    renderMessage,
  } = props;

  const [input, setInput] = React.useState("");
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const chat = useMistralChat({
    model,
    apiProxyUrl,
    systemPrompt,
  });

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [chat.messages]);

  const handleSubmit = () => {
    if (!input.trim() || chat.isStreaming) return;
    chat.sendMessage(input);
    setInput("");
  };

  // Default message renderer with StreamingText support
  const defaultRenderMessage = (message: ChatMessage, isLastMessage: boolean) => {
    const isStreamingThisMessage = isLastMessage && chat.isStreaming && message.role === "assistant";

    return (
      <StreamingText
        text={message.content ?? ""}
        isStreaming={isStreamingThisMessage}
        showCursor={true}
      />
    );
  };

  return (
    <div className={className}>
      {/* Messages area */}
      <div ref={scrollerRef} className={messagesClassName}>
        {chat.messages.length === 0 ? (
          <div>{emptyStateText}</div>
        ) : (
          <MessageList
            messages={chat.messages}
            renderMessage={
              renderMessage
                ? (msg) => renderMessage(msg, chat.isStreaming)
                : (msg) => defaultRenderMessage(msg, chat.messages[chat.messages.length - 1]?.id === msg.id)
            }
          />
        )}
      </div>

      {/* Input composer */}
      <Composer
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onStop={chat.abort}
        onClear={chat.restart}
        isStreaming={chat.isStreaming}
        placeholder={placeholder}
        className={composerClassName}
        showStopButton={true}
        showClearButton={true}
      />
    </div>
  );
}
