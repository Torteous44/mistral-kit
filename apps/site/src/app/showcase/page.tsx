/** @jsxImportSource react */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  useToolExecutor,
  useEmbeddings,
  chunkText,
  MessageList,
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputActions,
  PromptInputButton,
  PromptInputSubmit,
  ToolCallBadge,
  weatherTool,
  calculatorTool,
  dateTimeTool,
  type ToolDefinition,
} from "@mistral/ui";
import type { ChatMessage } from "@mistral/ui";

type UploadedChunk = {
  id: string;
  text: string;
  embedding: number[];
  fileName: string;
};

const BASE_TOOLS = [weatherTool, calculatorTool, dateTimeTool] as const;
const MAX_FILE_SIZE_MB = 4;
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 120;

const suggestions = [
  "What's the weather in Paris?",
  "Calculate 15% of 84.50",
  "Outline today's date and time.",
  "Search the uploaded file for travel tips.",
];

function stitchChunks(text: string) {
  const base = chunkText(text, CHUNK_SIZE);
  return base.map((chunk, index) => {
    if (index === 0) return chunk;
    const prev = base[index - 1] ?? "";
    const tail = prev.slice(Math.max(0, prev.length - CHUNK_OVERLAP));
    return `${tail} ${chunk}`.trim();
  });
}

function createSearchDocsTool(
  chunks: UploadedChunk[],
  embedQuery: (text: string) => Promise<number[]>
): ToolDefinition {
  return {
    name: "search_docs",
    description: "Search the uploaded knowledge via semantic similarity",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search request" },
        limit: { type: "number", description: "Number of matches", default: 3 },
      },
      required: ["query"],
    },
    run: async ({ query, limit = 3 }: { query: string; limit?: number }) => {
      if (!chunks.length) {
        return { query, matches: [], note: "Upload a file first." };
      }

      const queryEmbedding = await embedQuery(query);
      if (!queryEmbedding.length) {
        throw new Error("Failed to embed query");
      }

      const ranked = chunks
        .map((chunk) => ({
          chunkId: chunk.id,
          fileName: chunk.fileName,
          preview: chunk.text.slice(0, 220).replace(/\s+/g, " ").trim(),
          similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return {
        query,
        matches: ranked,
        totalChunks: chunks.length,
      };
    },
  };
}

function cosineSimilarity(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default function ShowcasePage() {
  const [draft, setDraft] = useState("");
  const [uploadedChunks, setUploadedChunks] = useState<UploadedChunk[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "ready" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

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

  const handleKnowledgeUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadStatus("error");
        setUploadError(`File exceeds ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      setUploadStatus("processing");
      setUploadError(null);
      setUploadedFileName(file.name);
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
        setUploadStatus("ready");
      } catch (error) {
        setUploadStatus("error");
        setUploadError(error instanceof Error ? error.message : "Upload failed");
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
    if (!draft.trim()) return;
    toolExecutor.execute(draft.trim());
    setDraft("");
  };

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
    return (
      <div className={isUser ? "flex justify-end" : "flex justify-start"}>
        <div
          className={
            isUser
              ? "max-w-[75%] rounded-full bg-mistral-black px-4 py-2 text-sm text-mistral-beige"
              : "max-w-[75%] rounded-3xl border border-mistral-black/15 bg-white px-4 py-2 text-sm text-mistral-black"
          }
        >
          <div className="prose prose-sm max-w-none text-current">
            <ReactMarkdown>{message.content ?? ""}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  const statusLabel =
    uploadStatus === "processing"
      ? "Processing"
      : uploadStatus === "ready"
      ? "Ready"
      : uploadStatus === "error"
      ? "Error"
      : "Idle";

  const helperText =
    uploadStatus === "processing"
      ? `Processing ${uploadedFileName ?? "file"} and generating embeddings.`
      : uploadStatus === "ready"
      ? `${uploadedChunks.length} chunks available.`
      : "Uploads power the search tool.";

  return (
    <div className="min-h-screen bg-mistral-beige text-mistral-black">
      <div className="mx-auto flex h-screen max-w-3xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-mistral-black/60">
          <Link
            href="/"
            className="rounded-full border border-mistral-black/30 px-4 py-1 text-xs tracking-[0.3em] text-mistral-black hover:border-mistral-orange hover:text-mistral-orange transition-colors"
          >
            Back
          </Link>
          <span>mistral-medium-latest</span>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pr-2"
        >
          {toolExecutor.messages.length === 0 ? (
            <p className="text-sm text-mistral-black/45">Start a conversation to trigger the tools.</p>
          ) : (
            <MessageList
              messages={toolExecutor.messages}
              className="space-y-4"
              renderMessage={renderMessage}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-mistral-black/60">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setDraft(suggestion)}
              className="rounded-full border border-mistral-black/20 px-3 py-1 hover:border-mistral-orange hover:text-mistral-orange transition-colors"
              disabled={toolExecutor.isExecuting}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <PromptInput
          onSubmit={handleSubmit}
          className="rounded-3xl border border-mistral-black/15 bg-white shadow-sm"
        >
          <PromptInputTextarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={toolExecutor.isExecuting}
            placeholder="Describe what you need..."
            className="h-auto w-full resize-none rounded-3xl bg-transparent px-4 py-3 text-sm text-mistral-black focus:outline-none"
            minRows={2}
            maxRows={6}
          />

        <PromptInputToolbar className="flex items-center justify-between border-t border-mistral-black/10 px-4 py-3 text-xs text-mistral-black/60">
            <PromptInputActions className="flex items-center gap-3">
              <span className="uppercase tracking-[0.3em] text-[0.6rem]">
                Knowledge · {statusLabel}
              </span>
              <PromptInputButton
                className="rounded-full border border-mistral-black/20 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em]"
                onClick={(event) => {
                  event.preventDefault();
                  uploadInputRef.current?.click();
                }}
                disabled={uploadStatus === "processing"}
              >
                Ingest
              </PromptInputButton>
              <PromptInputButton
                className="rounded-full border border-mistral-black/20 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em]"
                onClick={(event) => {
                  event.preventDefault();
                  setDraft("");
                }}
                disabled={!draft && !toolExecutor.isExecuting}
              >
                Clear
              </PromptInputButton>
            </PromptInputActions>

            <PromptInputSubmit
              status={toolExecutor.isExecuting ? "submitting" : "idle"}
              disabled={!draft.trim() && !toolExecutor.isExecuting}
              className="rounded-full bg-mistral-black px-4 py-2 text-sm font-medium text-mistral-beige transition-colors hover:bg-mistral-orange disabled:opacity-40"
            />
          </PromptInputToolbar>
          <input
            ref={uploadInputRef}
            type="file"
            accept=".txt,.md,.markdown,.pdf,.docx"
            className="hidden"
            onChange={handleFileSelection}
          />
          <p className="px-4 pb-3 text-[0.65rem] text-mistral-black/60">
            {uploadStatus === "error" ? (
              <span className="text-red-600">{uploadError}</span>
            ) : (
              helperText
            )}
          </p>
        </PromptInput>
      </div>
    </div>
  );
}
