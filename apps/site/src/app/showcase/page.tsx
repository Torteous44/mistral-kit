/** @jsxImportSource react */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUp, Paperclip, Plus } from "lucide-react";
import {
  useToolExecutor,
  useEmbeddings,
  useFileUpload,
  useOrderedMessages,
  MessageList,
  PromptInput,
  PromptInputTextarea,
  PromptInputButton,
  PromptInputSubmit,
  PromptAttachmentPreview,
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  StreamingMarkdown,
  preparePromptWithAttachments,
  createWeatherTool,
  calculatorTool,
  dateTimeTool,
  createSemanticSearchTool,
} from "@mistral/ui";
import type { ChatAttachment, ChatMessage } from "@mistral/ui";

const weatherTool = createWeatherTool({ apiProxyUrl: "/api/weather" });
const BASE_TOOLS = [weatherTool, calculatorTool, dateTimeTool] as const;

export default function ShowcasePage() {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const { embed } = useEmbeddings({ apiProxyUrl: "/api/embeddings" });

  const fileUpload = useFileUpload({
    apiUrl: "/api/upload-text",
    embedFunction: embed,
    maxFileSizeMB: 4,
  });

  const embedQuery = useCallback(
    async (text: string) => {
      const result = await embed(text);
      return result[0]?.embedding ?? [];
    },
    [embed]
  );

  const uploadedSearchTool = useMemo(
    () => createSemanticSearchTool(fileUpload.chunks, embedQuery),
    [fileUpload.chunks, embedQuery]
  );

  const demoTools = useMemo(
    () => [...BASE_TOOLS, uploadedSearchTool],
    [uploadedSearchTool]
  );

const toolExecutor = useToolExecutor({
    tools: demoTools,
    model: "mistral-medium-latest",
    apiProxyUrl: "/api/mistral",
    systemPrompt: `You are an assistant with access to available tools. Use them for accuracy whenever relevant.`,
    maxTurns: 6,
  });

  // Use the new hook to maintain message ordering
  const orderedMessages = useOrderedMessages(toolExecutor.messages);

useEffect(() => {
  if (!scrollRef.current) return;
  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
}, [toolExecutor.messages]);

  const handleFileSelection = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      fileUpload.uploadFile(file);
      event.target.value = "";
    },
    [fileUpload]
  );

  // Use attachment preview from the hook
  const attachmentPreview = fileUpload.attachmentPreview;

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const trimmed = draft.trim();
  const attachmentReady = attachmentPreview?.status === "ready";

    if (!trimmed && !attachmentReady) {
      return;
    }

  const attachments: ChatAttachment[] | null =
    attachmentReady && attachmentPreview
      ? [
          {
            id: crypto.randomUUID(),
            fileName: attachmentPreview.fileName,
            chunkCount: attachmentPreview.chunkCount,
          },
        ]
      : null;

  const { visibleText, modelText } = preparePromptWithAttachments(trimmed, attachments ?? undefined);

  if (visibleText) {
    toolExecutor.execute(modelText, {
      attachments: attachments ?? undefined,
      displayContent: visibleText,
    });

    if (attachments?.length) {
      fileUpload.reset();
    }

    setDraft("");
    return;
  }
};

  const lastAssistantMessageId = useMemo(() => {
    const assistants = orderedMessages.filter((msg) => msg.role === "assistant");
    return assistants[assistants.length - 1]?.id ?? null;
  }, [orderedMessages]);

  const renderMessage = (message: ChatMessage) => {
    // Tool result messages
    if (message.role === "tool") {
      const toolResult = message.content;
      let parsedResult;
      try {
        parsedResult = JSON.parse(toolResult ?? "{}");
      } catch {
        parsedResult = toolResult;
      }

      return (
        <Tool defaultOpen={false} className="mx-auto max-w-xl">
          <ToolHeader
            toolName={message.toolName ?? "tool"}
            state="completed"
            className="w-full"
            triggerClassName="w-full flex items-center justify-between gap-3 rounded-xl border border-mistral-black/15 bg-white px-4 py-3 text-left transition-colors hover:bg-mistral-beige/30"
            nameClassName="text-sm font-medium text-mistral-black"
            badgeClassName="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-green-700"
          />
          <ToolContent className="mt-2">
            <ToolOutput
              output={parsedResult}
              className="rounded-xl border border-mistral-black/15 bg-white px-4 py-3"
              labelClassName="mb-2 text-xs font-semibold uppercase tracking-wider text-mistral-black/60"
              contentClassName="overflow-x-auto rounded-lg bg-mistral-black/5 p-3 text-xs text-mistral-black"
            />
          </ToolContent>
        </Tool>
      );
    }

    // Assistant messages with tool calls (running/pending)
    if (message.role === "assistant" && Array.isArray(message.toolCalls) && message.toolCalls.length > 0) {
      return (
        <div className="mx-auto flex max-w-xl flex-col gap-3">
          {message.toolCalls.map((call) => {
            let parsedArgs;
            try {
              parsedArgs = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
            } catch {
              parsedArgs = call.function?.arguments ?? {};
            }

            return (
              <Tool key={call.id ?? call.function?.name ?? crypto.randomUUID()} defaultOpen={true}>
                <ToolHeader
                  toolName={call.function?.name ?? "tool"}
                  state="running"
                  className="w-full"
                  triggerClassName="w-full flex items-center justify-between gap-3 rounded-xl border border-mistral-black/15 bg-white px-4 py-3 text-left transition-colors hover:bg-mistral-beige/30"
                  nameClassName="text-sm font-medium text-mistral-black"
                  badgeClassName="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-yellow-700 animate-pulse"
                />
                <ToolContent className="mt-2">
                  <ToolInput
                    input={parsedArgs}
                    className="rounded-xl border border-mistral-black/15 bg-white px-4 py-3"
                    labelClassName="mb-2 text-xs font-semibold uppercase tracking-wider text-mistral-black/60"
                    contentClassName="overflow-x-auto rounded-lg bg-mistral-black/5 p-3 text-xs text-mistral-black"
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
    const shouldAnimate = message.role === "assistant" && message.id === lastAssistantMessageId;

    return (
      <div className={isUser ? "flex justify-end" : "flex justify-start"}>
        <div
          className={
            isUser
              ? "max-w-[75%] rounded-3xl bg-mistral-black px-4 py-3 text-sm text-mistral-beige"
              : "max-w-[75%] rounded-3xl border border-mistral-black/15 bg-white px-4 py-3 text-sm text-mistral-black"
          }
        >
          {hasAttachments &&
            attachments.map((attachment) => (
              <div
                key={attachment.id ?? attachment.fileName}
                className="mb-3 rounded-2xl border border-white/30 bg-white/10 px-3 py-2 text-xs text-mistral-beige last:mb-3"
              >
                <div className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-wide text-mistral-beige/80">
                  <Paperclip className="h-3 w-3" />
                  <span>Attachment</span>
                </div>
                <p className="mt-1 text-sm font-medium">{attachment.fileName}</p>
                {typeof attachment.chunkCount === "number" && (
                  <p className="text-[0.65rem] text-mistral-beige/80">
                    {attachment.chunkCount} chunks embedded
                  </p>
                )}
              </div>
            ))}

          {message.role === "assistant" ? (
            <StreamingMarkdown text={message.content ?? ""} animate={shouldAnimate} />
          ) : displayContent ? (
            <div className="prose prose-sm max-w-none text-current">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          ) : hasAttachments ? null : (
            <span className="text-xs uppercase tracking-[0.3em] text-mistral-beige/80">
              Sent an attachment
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-mistral-beige text-mistral-black">
      <div className="mx-auto flex h-screen max-w-3xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-mistral-black/60">
          <Link
            href="/"
            className="rounded-full border border-mistral-black/30 px-4 py-1 text-xs tracking-[0.3em] text-mistral-black hover:border-mistral-orange hover:text-mistral-orange transition-colors"
          >
            <ArrowLeft/>
          </Link>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pr-2"
        >

            <MessageList
              messages={orderedMessages}
              className="space-y-4"
              renderMessage={renderMessage}
            />

        </div>



        <PromptInput
          onSubmit={handleSubmit}
          className="rounded-3xl border border-mistral-black/15 bg-white  px-2 py-2"
        >
          {attachmentPreview && (
            <PromptAttachmentPreview
              fileName={attachmentPreview.fileName}
              status={attachmentPreview.status}
              chunkCount={
                attachmentPreview.status === "ready" ? attachmentPreview.chunkCount : undefined
              }
              error={attachmentPreview.status === "error" ? attachmentPreview.error : undefined}
              onRemove={fileUpload.reset}
              className="mb-3 w-fit items-center gap-3 rounded-2xl border border-mistral-black/20 bg-mistral-beige/60 px-3 py-2 text-sm text-mistral-black"
            />
          )}

          <div className="relative">
            <PromptInputTextarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={toolExecutor.isExecuting}
              placeholder="Describe what you need..."
              className="h-auto w-full resize-none rounded-3xl bg-transparent px-4 py-3 pr-14 pb-32 text-sm text-mistral-black focus:outline-none"
              minRows={2}
              maxRows={6}
            />

            <PromptInputButton
              className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-full border border-mistral-black/30 bg-white text-mistral-black hover:border-mistral-orange hover:text-mistral-orange transition-colors disabled:opacity-40"
              onClick={(event) => {
                event.preventDefault();
                uploadInputRef.current?.click();
              }}
              aria-label="Upload knowledge"
              disabled={attachmentPreview?.status === "uploading"}
            >
              <Plus className="h-4 w-4" />
            </PromptInputButton>

            <PromptInputSubmit
              status={toolExecutor.isExecuting ? "submitting" : "idle"}
              disabled={
                toolExecutor.isExecuting ||
                (!draft.trim() && attachmentPreview?.status !== "ready")
              }
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-mistral-black text-mistral-beige transition-colors hover:bg-mistral-orange disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </PromptInputSubmit>
          </div>

          <input
            ref={uploadInputRef}
            type="file"
            accept=".txt,.md,.markdown,.pdf,.docx"
            className="hidden"
            onChange={handleFileSelection}
          />
        </PromptInput>
      </div>
    </div>
  );
}
