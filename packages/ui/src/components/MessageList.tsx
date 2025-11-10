import * as React from "react";
import type { ChatMessage } from "../types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  className?: string;
  messageClassName?: string;
  userMessageClassName?: string;
  assistantMessageClassName?: string;
  renderMessage?: (message: ChatMessage) => React.ReactNode;
};

/**
 * MessageList - Role-aware message renderer
 *
 * Renders a list of chat messages with default styling or custom renderer.
 * Unstyled by default - accepts className props for full customization.
 *
 * @example
 * ```tsx
 * <MessageList
 *   messages={messages}
 *   className="space-y-4"
 *   userMessageClassName="text-right"
 *   assistantMessageClassName="text-left"
 * />
 * ```
 */
export default function MessageList(props: MessageListProps) {
  const {
    messages,
    className = "",
    messageClassName = "",
    userMessageClassName = "",
    assistantMessageClassName = "",
    renderMessage,
  } = props;

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={className} role="log" aria-live="polite" aria-atomic="false">
      {messages.map((message) => {
        const roleClass = message.role === "user"
          ? userMessageClassName
          : message.role === "assistant"
          ? assistantMessageClassName
          : "";

        if (renderMessage) {
          return (
            <div key={message.id} className={`${messageClassName} ${roleClass}`}>
              {renderMessage(message)}
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className={`${messageClassName} ${roleClass}`}
            data-role={message.role}
            data-message-id={message.id}
          >
            {message.content ?? ""}
          </div>
        );
      })}
    </div>
  );
}
