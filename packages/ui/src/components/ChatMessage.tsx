import * as React from "react";
import ReactMarkdown, { type Options as ReactMarkdownOptions } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Paperclip } from "lucide-react";
import type { ChatMessage } from "../types/chat";
import StreamingMarkdown from "./StreamingMarkdown";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "./Tool";

type ChatMessageBubbleProps = {
  message: ChatMessage;
  /**
   * Whether to animate assistant responses (typically true for the most recent assistant message)
   */
  animateAssistant?: boolean;
  /**
   * Optional override for markdown components
   */
  markdownComponents?: ReactMarkdownOptions["components"];
  /**
   * Optional override for markdown remark plugins (defaults to GFM)
   */
  remarkPlugins?: ReactMarkdownOptions["remarkPlugins"];
  /**
   * Class applied to the wrapping div
   */
  className?: string;
  /**
   * Class applied to user message bubble
   */
  userBubbleClassName?: string;
  /**
   * Class applied to assistant message bubble
   */
  assistantBubbleClassName?: string;
  /**
   * Optional attachment-specific class overrides
   */
  attachmentClassNames?: ChatMessageBubbleAttachmentClassNames;
  /**
   * Optional tool-specific class overrides
   */
  toolClassNames?: ChatMessageBubbleToolClassNames;
};

export type ChatMessageBubbleAttachmentClassNames = {
  userContainer?: string;
  assistantContainer?: string;
  badge?: string;
  fileName?: string;
  meta?: string;
};

export type ChatMessageBubbleToolClassNames = {
  container?: string;
  trigger?: string;
  name?: string;
  badge?: string;
  content?: string;
  inputContainer?: string;
  inputLabel?: string;
  inputContent?: string;
  outputContainer?: string;
  outputLabel?: string;
  outputContent?: string;
  outputError?: string;
};

const defaultRemarkPlugins = [remarkGfm];

/**
 * ChatMessageBubble renders a single chat message, including tool call states and attachments.
 * Provides default styling but can be customized via className props.
 */
export function ChatMessageBubble({
  message,
  animateAssistant,
  markdownComponents,
  remarkPlugins = defaultRemarkPlugins,
  className = "",
  userBubbleClassName = "max-w-[75%] rounded-3xl bg-[#101010] px-4 py-3 text-sm text-white",
  assistantBubbleClassName = "max-w-[75%] rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#101010]",
  attachmentClassNames,
  toolClassNames,
}: ChatMessageBubbleProps) {
  if (message.role === "tool") {
    const toolResult = message.content;
    let parsedResult;
    try {
      parsedResult = JSON.parse(toolResult ?? "{}");
    } catch {
      parsedResult = toolResult;
    }

    return (
      <div className={`mx-auto flex max-w-xl ${className}`}>
        <Tool
          defaultOpen={false}
          className={toolClassNames?.container ?? "w-full"}
        >
          <ToolHeader
            toolName={message.toolName ?? "tool"}
            state="completed"
            className="w-full"
            triggerClassName={toolClassNames?.trigger ?? "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left transition-colors hover:bg-zinc-50 cursor-pointer"}
            nameClassName={toolClassNames?.name ?? "text-sm font-medium text-[#101010]"}
            badgeClassName={toolClassNames?.badge ?? "text-xs text-neutral-600"}
          />
          <ToolContent className={toolClassNames?.content ?? "mt-2"}>
            <ToolOutput
              output={parsedResult}
              className={toolClassNames?.outputContainer ?? "rounded-xl border border-neutral-200 bg-white px-4 py-3"}
              labelClassName={toolClassNames?.outputLabel ?? "mb-2 text-xs font-medium text-neutral-500"}
              contentClassName={toolClassNames?.outputContent ?? "overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-[#101010] font-mono"}
            />
          </ToolContent>
        </Tool>
      </div>
    );
  }

  if (message.role === "assistant" && Array.isArray(message.toolCalls) && message.toolCalls.length > 0) {
    return (
      <div className={`mx-auto flex max-w-xl flex-col gap-3 ${className}`}>
        {message.toolCalls.map((call) => {
          let parsedArgs;
          try {
            parsedArgs = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
          } catch {
            parsedArgs = call.function?.arguments ?? {};
          }

          return (
            <Tool
              key={call.id ?? call.function?.name ?? crypto.randomUUID()}
              defaultOpen={true}
              className={toolClassNames?.container}
            >
              <ToolHeader
                toolName={call.function?.name ?? "tool"}
                state="running"
                className="w-full"
                triggerClassName={toolClassNames?.trigger ?? "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left transition-colors hover:bg-zinc-50 cursor-pointer"}
                nameClassName={toolClassNames?.name ?? "text-sm font-medium text-[#101010]"}
                badgeClassName={toolClassNames?.badge ?? "text-xs text-[#fa520f]"}
              />
              <ToolContent className={toolClassNames?.content ?? "mt-2"}>
                <ToolInput
                  input={parsedArgs}
                  className={toolClassNames?.inputContainer ?? "rounded-xl border border-neutral-200 bg-white px-4 py-3"}
                  labelClassName={toolClassNames?.inputLabel ?? "mb-2 text-xs font-medium text-neutral-500"}
                  contentClassName={toolClassNames?.inputContent ?? "overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-[#101010] font-mono"}
                />
              </ToolContent>
            </Tool>
          );
        })}
      </div>
    );
  }

  const isUser = message.role === "user";
  const attachments = message.attachments ?? [];
  const hasAttachments = attachments.length > 0;
  const displayContent = message.displayContent ?? message.content ?? "";
  const assistantHasContent =
    message.role === "assistant" && typeof message.content === "string" && message.content.trim().length > 0;
  const shouldShowAssistantPlaceholder = message.role === "assistant" && !assistantHasContent && animateAssistant;

  return (
    <div className={`${className} ${isUser ? "flex justify-end" : "flex justify-start"}`}>
      <div className={isUser ? userBubbleClassName : assistantBubbleClassName}>
        {hasAttachments &&
          attachments.map((attachment) => {
            const baseUserAttachment =
              "mb-3 rounded-2xl border border-white/30 bg-white/10 px-3 py-2 text-xs text-white last:mb-3";
            const baseAssistantAttachment =
              "mb-3 rounded-2xl border border-neutral-200 bg-zinc-50 px-3 py-2 text-xs text-[#101010] last:mb-3";
            const containerClass = isUser
              ? attachmentClassNames?.userContainer ?? baseUserAttachment
              : attachmentClassNames?.assistantContainer ?? baseAssistantAttachment;
            const badgeClass =
              attachmentClassNames?.badge ??
              "flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-wide opacity-70";
            const fileNameClass = attachmentClassNames?.fileName ?? "mt-1 text-sm font-medium";
            const metaClass = attachmentClassNames?.meta ?? "text-[0.65rem] opacity-70";

            return (
              <div key={attachment.id ?? attachment.fileName} className={containerClass}>
                <div className={badgeClass}>
                  <Paperclip className="h-3 w-3" />
                  <span>Attachment</span>
                </div>
                <p className={fileNameClass}>{attachment.fileName}</p>
                {typeof attachment.chunkCount === "number" && (
                  <p className={metaClass}>{attachment.chunkCount} embedded chunks</p>
                )}
              </div>
            );
          })}

        {message.role === "assistant" ? (
          assistantHasContent ? (
            <StreamingMarkdown
              text={message.content ?? ""}
              animate={animateAssistant}
              components={markdownComponents}
              remarkPlugins={remarkPlugins}
            />
          ) : shouldShowAssistantPlaceholder ? (
            <span className="text-xs uppercase tracking-[0.3em] opacity-60">Thinking…</span>
          ) : null
        ) : displayContent ? (
          <div className="prose prose-sm max-w-none text-current">
            <ReactMarkdown components={markdownComponents} remarkPlugins={remarkPlugins}>
              {displayContent}
            </ReactMarkdown>
          </div>
        ) : hasAttachments ? null : (
          <span className="text-xs uppercase tracking-[0.3em] opacity-70">Sent an attachment</span>
        )}
      </div>
    </div>
  );
}

export default ChatMessageBubble;
