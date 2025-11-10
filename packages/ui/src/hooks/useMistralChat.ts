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

    // Add user message to both state and ref
    const userMsg = { id: userMsgId, role: "user" as const, content: text };
    const updatedMessages = [...currentMessages, userMsg];

    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setStreaming(true);

    // Build payload with the captured history
    const historyMessages = currentMessages.map(({ role, content }) => ({ role, content }));

    const payload = {
      model: opts.model ?? "mistral-medium-latest",
      stream: true,
      messages: [
        ...(opts.systemPrompt ? [{ role: "system", content: opts.systemPrompt }] : []),
        ...historyMessages, // All previous messages (user + assistant)
        { role: "user", content: text } // Current user message
      ]
    };

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal
      });

      if (!res.ok) {
        throw new Error(`API request failed: ${res.status} ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error("Response body is empty");
      }

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let remainder = "";

      while (true) {
        // Check if aborted before reading
        if (abortRef.current?.signal.aborted) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        remainder += decoder.decode(value, { stream: true });

        // Parse SSE chunks
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

            if (delta) {
              // Append incrementally and update both state and ref
              setMessages(m => {
                const existing = m.find(x => x.id === assistantId)?.content ?? "";
                const without = m.filter(x => x.id !== assistantId);
                const newContent = existing + delta;
                const updated = [...without, { id: assistantId, role: "assistant" as const, content: newContent }];
                messagesRef.current = updated; // Keep ref in sync
                return updated;
              });
            }
          } catch (err) {
            // Silently skip invalid JSON chunks (malformed SSE)
          }
        }
      }
    } catch (err) {
      // Handle abort gracefully
      if (err instanceof Error && err.name === 'AbortError') {
        // Expected abort, don't treat as error
        return;
      }
      // Re-throw other errors
      throw err;
    } finally {
      // Always clean up reader and state
      if (reader) {
        try {
          await reader.cancel();
        } catch {
          // Ignore cancel errors
        }
      }
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
