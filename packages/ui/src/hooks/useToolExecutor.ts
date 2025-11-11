import { useCallback, useState, useRef } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";
import type { ChatAttachment, ChatMessage, ToolDefinition } from "../types/chat";

type ChatPayloadMessage =
  | {
      role: "system" | "user";
      content: string;
    }
  | {
      role: "assistant";
      content: string;
      tool_calls?: ChatMessage["toolCalls"];
    }
  | {
      role: "tool";
      content: string;
      tool_call_id?: string;
    };

type ChatCompletionPayload = {
  model: string;
  messages: ChatPayloadMessage[];
  tools: Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: ToolDefinition["parameters"];
    };
  }>;
  tool_choice: "auto" | string;
  stream: boolean;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: ChatMessage["toolCalls"];
    };
  }>;
};

export type SendChatHandler = (payload: ChatCompletionPayload, signal: AbortSignal) => Promise<ChatCompletionResponse>;

export type UseToolExecutorOptions = {
  tools: ToolDefinition[];
  model?: string;
  apiProxyUrl?: string;
  systemPrompt?: string;
  maxTurns?: number;
  /** Timeout in milliseconds for each tool execution (default: 30000ms / 30 seconds) */
  toolTimeout?: number;
  onToolCall?: (toolName: string, args: any, result: any) => void;
  /** Optional transport override for sending chat completions */
  sendChat?: SendChatHandler;
};

export type UseToolExecutorResult = {
  messages: ChatMessage[];
  isExecuting: boolean;
  error: Error | null;
  execute: (prompt: string, context?: ExecuteContext) => Promise<void>;
  reset: () => void;
};

type ExecuteContext = {
  attachments?: ChatAttachment[];
  displayContent?: string;
};

const defaultSendChat = async (
  apiProxyUrl: string,
  payload: ChatCompletionPayload,
  signal: AbortSignal,
  onChunk?: (content: string) => void
): Promise<ChatCompletionResponse> => {
  const response = await fetch(apiProxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  // Non-streaming: return JSON directly
  if (!payload.stream) {
    return response.json();
  }

  // Streaming: parse SSE
  if (!response.body) {
    throw new Error("Response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let fullContent = "";
  let toolCalls = undefined;

  try {
    while (true) {
      if (signal.aborted) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (ending with \n\n)
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || ""; // Keep incomplete part in buffer

      for (const part of parts) {
        const line = part.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;

        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;

        try {
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta;

          if (delta?.content) {
            fullContent += delta.content;
            onChunk?.(delta.content);
          }

          if (delta?.tool_calls) {
            toolCalls = delta.tool_calls;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  return {
    choices: [
      {
        message: {
          content: fullContent || null,
          tool_calls: toolCalls,
        },
      },
    ],
  };
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
    toolTimeout = 30000,
    onToolCall,
    sendChat,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const conversationRef = useRef<ChatMessage[]>([]);

  const applyMessages = useCallback(
    (
      updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
    ) => {
      conversationRef.current =
        typeof updater === "function"
          ? (updater as (prev: ChatMessage[]) => ChatMessage[])(conversationRef.current)
          : updater;
      setMessages(conversationRef.current);
    },
    []
  );

  const execute = useCallback(
    async (prompt: string, context?: ExecuteContext) => {
      flushSync(() => {
        setIsExecuting(true);
        setError(null);
      });

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        attachments: context?.attachments,
        displayContent: context?.displayContent ?? null,
      };

      applyMessages((prev) => [...prev, userMsg]);

      let turnCount = 0;

      try {
        while (turnCount < maxTurns) {
          turnCount++;

          const toolsPayload: ChatCompletionPayload["tools"] = tools.map((t) => {
            // Use provided parameters or default to empty object schema
            const parameters = t.parameters || { type: "object", properties: {} };

            return {
              type: "function" as const,
              function: {
                name: t.name,
                description: t.description,
                parameters,
              },
            };
          });

          const payloadMessages: ChatPayloadMessage[] = [
            ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
            ...conversationRef.current.map((m): ChatPayloadMessage => {
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

              const role = m.role === "system" ? "system" : m.role === "user" ? "user" : "assistant";
              return {
                role,
                content: m.content ?? "",
              };
            }),
          ];

          const payload = {
            model,
            messages: payloadMessages,
            tools: toolsPayload,
            tool_choice: "auto",
            stream: true,
          };

          // Create stable assistant ID before streaming
          const assistantId = crypto.randomUUID();

          // Add empty assistant message placeholder
          const assistantPlaceholder: ChatMessage = {
            id: assistantId,
            role: "assistant",
            content: "",
            toolCalls: undefined,
          };

          applyMessages((prev) => [...prev, assistantPlaceholder]);

          // Streaming callback - uses functional updates
          const onChunk = (content: string) => {
            applyMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: (msg.content || "") + content }
                  : msg
              )
            );
          };

          // Execute streaming request
          const result = sendChat
            ? await sendChat(payload, abortRef.current.signal)
            : await defaultSendChat(apiProxyUrl, payload, abortRef.current.signal, onChunk);

          const choice = result.choices?.[0];

          if (!choice) {
            throw new Error("No response from model");
          }

          // Update conversation state and final message with tool calls
          const finalContent = choice.message?.content ?? "";
          const finalToolCalls = choice.message?.tool_calls;

          const hasFinalContent = typeof finalContent === "string" && finalContent.trim().length > 0;

          applyMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: hasFinalContent ? finalContent : msg.content ?? "",
                    toolCalls: finalToolCalls,
                  }
                : msg
            )
          );

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

              // Execute tool with timeout protection
              let toolResult: any;
              try {
                toolResult = await Promise.race([
                  tool.run(args),
                  new Promise((_, reject) =>
                    setTimeout(
                      () => reject(new Error(`Tool "${toolName}" timed out after ${toolTimeout}ms`)),
                      toolTimeout
                    )
                  ),
                ]);
                onToolCall?.(toolName, args, toolResult);
              } catch (toolErr) {
                // Tool execution failed or timed out
                const errorMessage = toolErr instanceof Error ? toolErr.message : String(toolErr);
                toolResult = { error: errorMessage, toolName };
                console.error(`Tool execution error for ${toolName}:`, toolErr);
              }

              const toolMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "tool",
                content: JSON.stringify(toolResult),
                toolName,
                toolCallId,
              };

              applyMessages((prev) => [...prev, toolMsg]);
            }

            continue;
          }

          break;
        }

        // Max turns reached - this is a normal stopping condition, not an error
        if (turnCount >= maxTurns) {
          console.warn(`Tool execution stopped: reached maximum turns (${maxTurns})`);
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
      } finally {
        flushSync(() => {
          setIsExecuting(false);
        });
      }
    },
    [tools, model, apiProxyUrl, systemPrompt, maxTurns, toolTimeout, onToolCall, sendChat, applyMessages]
  );

  const reset = useCallback(() => {
    conversationRef.current = [];
    applyMessages([]);
    setError(null);
    setIsExecuting(false);
    abortRef.current?.abort();
  }, [applyMessages]);

  return {
    messages,
    isExecuting,
    error,
    execute,
    reset,
  };
}
