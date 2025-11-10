import { useCallback, useState, useRef } from "react";
import { z } from "zod";
import type { ChatMessage, ToolDefinition } from "../types/chat";

type UseToolExecutorOptions = {
  tools: ToolDefinition[];
  model?: string;
  apiProxyUrl?: string;
  systemPrompt?: string;
  maxTurns?: number;
  onToolCall?: (toolName: string, args: any, result: any) => void;
};

type UseToolExecutorResult = {
  messages: ChatMessage[];
  isExecuting: boolean;
  error: Error | null;
  execute: (prompt: string) => Promise<void>;
  reset: () => void;
};

export function useToolExecutor(
  options: UseToolExecutorOptions
): UseToolExecutorResult {
  const {
    tools,
    model = "mistral-medium-latest",
    apiProxyUrl = "/api/mistral",
    systemPrompt,
    maxTurns = 10,
    onToolCall,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync
  messagesRef.current = messages;

  const execute = useCallback(
    async (prompt: string) => {
      setIsExecuting(true);
      setError(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      };

      setMessages((m) => [...m, userMsg]);
      messagesRef.current = [...messagesRef.current, userMsg];

      let currentMessages = [...messagesRef.current];
      let turnCount = 0;

      try {
        while (turnCount < maxTurns) {
          turnCount++;

          const toolsPayload = tools.map((t) => {
            // Use provided parameters or default to empty object schema
            const parameters = t.parameters || { type: "object", properties: {} };

            return {
              type: "function",
              function: {
                name: t.name,
                description: t.description,
                parameters,
              },
            };
          });

          const payloadMessages = [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            ...currentMessages.map((m) => {
              if (m.role === "tool") {
                return {
                  role: "tool",
                  content: m.content ?? "",
                  tool_call_id: m.toolCallId,
                };
              }

              if (m.role === "assistant" && m.toolCalls?.length) {
                return {
                  role: "assistant",
                  content: m.content ?? "",
                  tool_calls: m.toolCalls,
                };
              }

              return {
                role: m.role,
                content: m.content ?? "",
              };
            }),
          ];

          const payload = {
            model,
            messages: payloadMessages,
            tools: toolsPayload,
            tool_choice: "auto",
            stream: false,
          };

          const response = await fetch(apiProxyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: abortRef.current.signal,
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const result = await response.json();
          const choice = result.choices?.[0];

          if (!choice) {
            throw new Error("No response from model");
          }

          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: choice.message?.content ?? "",
            toolCalls: choice.message?.tool_calls,
          };

          currentMessages.push(assistantMsg);
          setMessages([...currentMessages]);
          messagesRef.current = currentMessages;

          const toolCalls = choice.message?.tool_calls;

          if (toolCalls && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              const toolName = toolCall.function?.name;
              const argsStr = toolCall.function?.arguments;
              const toolCallId = toolCall.id ?? crypto.randomUUID();

              if (!toolName) continue;

              const tool = tools.find((t) => t.name === toolName);
              if (!tool) {
                console.warn(`Unknown tool: ${toolName}`);
                continue;
              }

              let args: any;
              try {
                args = JSON.parse(argsStr || "{}");
                if (tool.schema && typeof tool.schema === "object" && "parse" in tool.schema) {
                  args = (tool.schema as z.ZodType).parse(args);
                }
              } catch (err) {
                console.error(`Invalid tool args for ${toolName}:`, err);
                continue;
              }

              const toolResult = await tool.run(args);
              onToolCall?.(toolName, args, toolResult);

              const toolMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "tool",
                content: JSON.stringify(toolResult),
                toolName,
                toolCallId,
              };

              currentMessages.push(toolMsg);
              setMessages([...currentMessages]);
              messagesRef.current = currentMessages;
            }

            continue;
          }

          break;
        }

        if (turnCount >= maxTurns) {
          throw new Error("Max turns reached");
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
      } finally {
        setIsExecuting(false);
      }
    },
    [tools, model, apiProxyUrl, systemPrompt, maxTurns, onToolCall]
  );

  const reset = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setError(null);
    setIsExecuting(false);
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    isExecuting,
    error,
    execute,
    reset,
  };
}
