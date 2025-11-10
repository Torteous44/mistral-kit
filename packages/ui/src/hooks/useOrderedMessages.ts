import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../types/chat";

/**
 * Hook to maintain deterministic message ordering in async tool execution scenarios.
 *
 * When tools execute asynchronously (especially multiple tool calls), messages can
 * arrive out of order. This hook assigns each message a stable order index based on
 * when it was first seen, ensuring UI displays messages in the correct sequence.
 *
 * @param messages - The array of messages to order
 * @returns Ordered array of messages
 *
 * @example
 * ```tsx
 * const { messages } = useToolExecutor({ tools });
 * const orderedMessages = useOrderedMessages(messages);
 *
 * return <MessageList messages={orderedMessages} />;
 * ```
 */
export function useOrderedMessages(messages: ChatMessage[]): ChatMessage[] {
  const [messageOrder, setMessageOrder] = useState<Record<string, number>>({});
  const orderCounterRef = useRef(0);

  const assignMessageOrder = useCallback((id: string) => {
    setMessageOrder((prev) => {
      if (prev[id] !== undefined) return prev;
      return { ...prev, [id]: orderCounterRef.current++ };
    });
  }, []);

  // Assign order to new messages
  useEffect(() => {
    messages.forEach((message) => {
      assignMessageOrder(message.id);
    });
  }, [messages, assignMessageOrder]);

  // Return sorted messages
  const orderedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => (messageOrder[a.id] ?? 0) - (messageOrder[b.id] ?? 0)
    );
  }, [messages, messageOrder]);

  return orderedMessages;
}
