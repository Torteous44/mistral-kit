/** @jsxImportSource react */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUp, Paperclip, Plus } from "lucide-react";
import {
  useToolExecutor,
  useEmbeddings,
  MessageList,
  PromptInput,
  PromptInputTextarea,
  PromptInputButton,
  PromptInputSubmit,
  PromptAttachmentPreview,
  ToolCallBadge,
  StreamingMarkdown,
  preparePromptWithAttachments,
  weatherTool,
  calculatorTool,
  dateTimeTool,
} from "@mistral/ui";
import type { ChatAttachment, ChatMessage } from "@mistral/ui";
import {
  MAX_FILE_SIZE_MB,
  stitchChunks,
  createSearchDocsTool,
  type UploadedChunk,
} from "./knowledge";

const BASE_TOOLS = [weatherTool, calculatorTool, dateTimeTool] as const;

type AttachmentPreview =
  | { fileName: string; status: "uploading" }
  | { fileName: string; status: "ready"; chunkCount: number }
  | { fileName: string; status: "error"; error: string };

export default function ShowcasePage() {
  const [draft, setDraft] = useState("");
  const [uploadedChunks, setUploadedChunks] = useState<UploadedChunk[]>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreview | null>(null);
  const [messageOrder, setMessageOrder] = useState<Record<string, number>>({});
  const orderCounterRef = useRef(0);

  const assignMessageOrder = useCallback((id: string) => {
    setMessageOrder((prev) => {
      if (prev[id] !== undefined) return prev;
      return { ...prev, [id]: orderCounterRef.current++ };
    });
  }, []);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const { embed } = useEmbeddings({ apiProxyUrl: "/api/embeddings" });

  const embedQuery = useCallback(
    async (text: string) => {
      const result = await embed(text);
      return result[0]?.embedding ?? [];
    },
    [embed]
  );

  const uploadedSearchTool = useMemo(
    () => createSearchDocsTool(uploadedChunks, embedQuery),
    [uploadedChunks, embedQuery]
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

useEffect(() => {
  if (!scrollRef.current) return;
  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
}, [toolExecutor.messages]);

  useEffect(() => {
    toolExecutor.messages.forEach((message) => {
      assignMessageOrder(message.id);
    });
  }, [toolExecutor.messages, assignMessageOrder]);

  const handleKnowledgeUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setAttachmentPreview({
          fileName: file.name,
          status: "error",
          error: `File exceeds ${MAX_FILE_SIZE_MB} MB.`,
        });
        return;
      }

      setAttachmentPreview({ fileName: file.name, status: "uploading" });
      setUploadedChunks([]);

      try {
        const isBinary =
          /\.(pdf|docx)$/i.test(file.name.toLowerCase()) ||
          file.type === "application/pdf" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        let response: Response;
        if (isBinary) {
          const formData = new FormData();
          formData.append("file", file);
          response = await fetch("/api/upload-text", {
            method: "POST",
            body: formData,
          });
        } else {
          const textBody = await file.text();
          response = await fetch("/api/upload-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textBody }),
          });
        }

        const payload = await response.json();
        if (!payload?.ok || typeof payload.text !== "string") {
          throw new Error(payload?.error ?? "Upload failed");
        }

        const chunks = stitchChunks(payload.text);
        if (!chunks.length) {
          throw new Error("No text extracted from file.");
        }

        const embeddingsResult = await embed(chunks);
        if (!embeddingsResult.length) {
          throw new Error("Failed to embed chunks.");
        }

        const combined: UploadedChunk[] = embeddingsResult.map((item, index) => ({
          id: crypto.randomUUID(),
          text: chunks[index],
          embedding: item.embedding,
          fileName: file.name,
        }));

        setUploadedChunks(combined);
        setAttachmentPreview({ fileName: file.name, status: "ready", chunkCount: combined.length });
      } catch (error) {
        console.error(error);
        setAttachmentPreview({
          fileName: file.name,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    },
    [embed]
  );

  const handleFileSelection = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      handleKnowledgeUpload(file);
      event.target.value = "";
    },
    [handleKnowledgeUpload]
  );

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
      setAttachmentPreview(null);
    }

    setDraft("");
    return;
  }
};

  const lastAssistantMessageId = useMemo(() => {
    const assistants = toolExecutor.messages.filter((msg) => msg.role === "assistant");
    return assistants[assistants.length - 1]?.id ?? null;
  }, [toolExecutor.messages]);

  const combinedMessages = useMemo(() => {
    const all = [...toolExecutor.messages];
    return all.sort(
      (a, b) => (messageOrder[a.id] ?? 0) - (messageOrder[b.id] ?? 0)
    );
  }, [toolExecutor.messages, messageOrder]);

  const renderMessage = (message: ChatMessage) => {
    if (message.role === "tool") {
      return (
        <div className="flex justify-center">
          <ToolCallBadge
            toolName={message.toolName ?? "tool"}
            status="success"
            detail="Result ready"
            className="inline-flex items-center gap-2 rounded-full border border-mistral-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mistral-black"
            statusClassName="text-mistral-black/60"
          />
        </div>
      );
    }

    if (message.role === "assistant" && Array.isArray(message.toolCalls) && message.toolCalls.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          {message.toolCalls.map((call) => (
            <ToolCallBadge
              key={call.id ?? call.function?.name ?? crypto.randomUUID()}
              toolName={call.function?.name ?? "tool"}
              status="pending"
              detail="Running"
              className="inline-flex items-center gap-2 rounded-full border border-mistral-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mistral-black"
              statusClassName="text-mistral-black/60"
            />
          ))}
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
              messages={combinedMessages}
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
              onRemove={() => {
                setAttachmentPreview(null);
                setUploadedChunks([]);
              }}
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
