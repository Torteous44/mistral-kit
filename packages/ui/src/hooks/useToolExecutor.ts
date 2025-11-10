import { useCallback, useState, useRef } from "react";
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
  signal: AbortSignal
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

  return response.json();
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
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync
  messagesRef.current = messages;

  const execute = useCallback(
    async (prompt: string, context?: ExecuteContext) => {
      setIsExecuting(true);
      setError(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        attachments: context?.attachments,
        displayContent: context?.displayContent ?? null,
      };

      setMessages((m) => [...m, userMsg]);
      messagesRef.current = [...messagesRef.current, userMsg];

      let currentMessages = [...messagesRef.current];
      let turnCount = 0;

      try {
        const transport = sendChat
          ? sendChat
          : (body: ChatCompletionPayload, signal: AbortSignal) =>
              defaultSendChat(apiProxyUrl, body, signal);

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
            ...currentMessages.map((m): ChatPayloadMessage => {
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
            stream: false,
          };

          const result = await transport(payload, abortRef.current.signal);
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

              currentMessages.push(toolMsg);
              setMessages([...currentMessages]);
              messagesRef.current = currentMessages;
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
        setIsExecuting(false);
      }
    },
    [tools, model, apiProxyUrl, systemPrompt, maxTurns, toolTimeout, onToolCall, sendChat]
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
