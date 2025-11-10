import { useCallback, useRef, useState } from "react";
import type { ChatMessage, ToolDefinition } from "../types/chat";

type Options = {
  model?: string;
  tools?: ToolDefinition[];
  systemPrompt?: string;
  apiProxyUrl?: string;
};

export function useMistralChat(opts: Options = {}) {
  const api = opts.apiProxyUrl ?? "/api/mistral";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]); // Synchronous access to messages

  const sendMessage = useCallback(async (text: string) => {
    const userMsgId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Use ref for synchronous access to current messages
    const currentMessages = messagesRef.current;
    console.log("📸 Captured messages from ref:", currentMessages.length, currentMessages);

    // Add user message to both state and ref
    const userMsg = { id: userMsgId, role: "user" as const, content: text };
    const updatedMessages = [...currentMessages, userMsg];

    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setStreaming(true);

    // Build payload with the captured history
    const historyMessages = currentMessages.map(({ role, content }) => ({ role, content }));
    console.log("🔍 Building payload with", historyMessages.length, "history messages");

    const payload = {
      model: opts.model ?? "mistral-medium-latest",
      stream: true,
      messages: [
        ...(opts.systemPrompt ? [{ role: "system", content: opts.systemPrompt }] : []),
        ...historyMessages, // All previous messages (user + assistant)
        { role: "user", content: text } // Current user message
      ]
    };

    // Debug: log what we're sending
    console.log("📤 Sending to API:", {
      messageCount: payload.messages.length,
      messages: payload.messages
    });

    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // cleaner
      body: JSON.stringify(payload),
      signal: abortRef.current.signal
    });

    if (!res.ok) {
      console.error("API request failed:", res.status, res.statusText);
      setStreaming(false);
      return;
    }

    if (!res.body) { setStreaming(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let remainder = "";

    // write/append assistant message in place
    const upsertAssistant = (content: string) => {
      setMessages(m => {
        const without = m.filter(msg => msg.id !== assistantId);
        return [...without, { id: assistantId, role: "assistant", content }];
      });
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        remainder += decoder.decode(value, { stream: true });

        // naive SSE line split (improve later with a small SSE parser)
        let idx: number;
        while ((idx = remainder.indexOf("\n\n")) !== -1) {
          const chunk = remainder.slice(0, idx);
          remainder = remainder.slice(idx + 2);

          // SSE lines look like: "data: {...}" or "data: [DONE]"
          const line = chunk.split("\n").find(l => l.startsWith("data:"));
          if (!line) continue;

          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta?.content ?? "";
            const finishReason = json?.choices?.[0]?.finish_reason;

            if (delta) {
              // append incrementally and update both state and ref
              setMessages(m => {
                const existing = m.find(x => x.id === assistantId)?.content ?? "";
                const without = m.filter(x => x.id !== assistantId);
                const newContent = existing + delta;
                const updated = [...without, { id: assistantId, role: "assistant" as const, content: newContent }];
                messagesRef.current = updated; // Keep ref in sync
                return updated;
              });
            }

            if (finishReason) {
              console.log("✅ Stream completed, final message count:", messagesRef.current.length);
            }
          } catch (err) {
            // silently skip invalid JSON chunks
            console.warn("Failed to parse SSE chunk:", data, err);
          }
        }
      }
    } finally {
      setStreaming(false);
    }
  }, [api, opts.model, opts.systemPrompt]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const restart = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
  }, []);

  return { messages, sendMessage, isStreaming, abort, restart };
}
