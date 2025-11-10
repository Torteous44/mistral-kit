import { useCallback, useState, useRef } from "react";
import { chunkTextWithOverlap } from "../utils/chunkText";
import type { EmbeddedChunk } from "../types/rag";

export type FileUploadStatus = "idle" | "uploading" | "chunking" | "embedding" | "ready" | "error";

/**
 * UI-ready attachment preview status for display in chat interfaces
 */
export type AttachmentPreview =
  | { fileName: string; status: "uploading" }
  | { fileName: string; status: "ready"; chunkCount: number }
  | { fileName: string; status: "error"; error: string }
  | null;

type EmbeddingResult = {
  embedding: number[];
  text: string;
};

export type UseFileUploadOptions = {
  /** URL of the text extraction API endpoint */
  apiUrl: string;
  /** Function to embed text chunks (typically from useEmbeddings) */
  embedFunction: (texts: string[]) => Promise<EmbeddingResult[]>;
  /** Maximum file size in MB (default: 4) */
  maxFileSizeMB?: number;
  /** Size of each text chunk in characters (default: 800) */
  chunkSize?: number;
  /** Overlap between chunks in characters (default: 120) */
  chunkOverlap?: number;
  /** Callback when upload completes successfully */
  onSuccess?: (chunks: EmbeddedChunk[]) => void;
  /** Callback when upload fails */
  onError?: (error: Error) => void;
};

export type UseFileUploadResult = {
  /** Upload a file and process it into embedded chunks */
  uploadFile: (file: File) => Promise<void>;
  /** Current status of the upload process */
  status: FileUploadStatus;
  /** Name of the currently uploaded file */
  fileName: string | null;
  /** Array of embedded chunks */
  chunks: EmbeddedChunk[];
  /** Error if upload failed */
  error: Error | null;
  /** Number of chunks created */
  chunkCount: number;
  /** UI-ready attachment preview for display in chat interfaces */
  attachmentPreview: AttachmentPreview;
  /** Reset the upload state */
  reset: () => void;
};

/**
 * Hook for uploading files, extracting text, chunking, and embedding for RAG applications.
 *
 * @example
 * ```tsx
 * const { embed } = useEmbeddings({ apiProxyUrl: "/api/embeddings" });
 * const { uploadFile, status, chunks, fileName, chunkCount } = useFileUpload({
 *   apiUrl: "/api/upload-text",
 *   embedFunction: embed,
 *   maxFileSizeMB: 5,
 *   onSuccess: (chunks) => console.log("Uploaded", chunks.length, "chunks"),
 *   onError: (err) => console.error(err)
 * });
 *
 * // In your UI:
 * <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
 * ```
 */
export function useFileUpload(options: UseFileUploadOptions): UseFileUploadResult {
  const {
    apiUrl,
    embedFunction,
    maxFileSizeMB = 4,
    chunkSize = 800,
    chunkOverlap = 120,
    onSuccess,
    onError,
  } = options;

  const [status, setStatus] = useState<FileUploadStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [chunks, setChunks] = useState<EmbeddedChunk[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file) return;

      // Abort any existing upload
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // Reset state
      setError(null);
      setChunks([]);

      // Check file size
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        const sizeError = new Error(`File exceeds ${maxFileSizeMB} MB limit`);
        setStatus("error");
        setError(sizeError);
        onError?.(sizeError);
        return;
      }

      setFileName(file.name);
      setStatus("uploading");

      try {
        // Determine if file is binary (PDF, DOCX) or plain text
        const isBinary =
          /\.(pdf|docx)$/i.test(file.name.toLowerCase()) ||
          file.type === "application/pdf" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        let response: Response;

        if (isBinary) {
          // Upload binary file as FormData
          const formData = new FormData();
          formData.append("file", file);
          response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
            signal: abortRef.current.signal,
          });
        } else {
          // Upload plain text as JSON
          const textBody = await file.text();
          response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textBody }),
            signal: abortRef.current.signal,
          });
        }

        const payload = await response.json();

        if (!payload?.ok || typeof payload.text !== "string") {
          throw new Error(payload?.error ?? "Upload failed");
        }

        // Chunk the text with overlap
        setStatus("chunking");
        const textChunks = chunkTextWithOverlap(payload.text, chunkSize, chunkOverlap);

        if (!textChunks.length) {
          throw new Error("No text extracted from file");
        }

        // Embed the chunks
        setStatus("embedding");
        const embeddingsResult = await embedFunction(textChunks);

        if (!embeddingsResult.length) {
          throw new Error("Failed to embed chunks");
        }

        // Combine into EmbeddedChunk format
        const embeddedChunks: EmbeddedChunk[] = embeddingsResult.map((item, index) => ({
          id: crypto.randomUUID(),
          text: textChunks[index],
          embedding: item.embedding,
          fileName: file.name,
        }));

        setChunks(embeddedChunks);
        setStatus("ready");
        onSuccess?.(embeddedChunks);
      } catch (err) {
        // Handle abort gracefully
        if (err instanceof Error && err.name === 'AbortError') {
          // Upload was cancelled, reset to idle
          setStatus("idle");
          setFileName(null);
          return;
        }

        const uploadError = err instanceof Error ? err : new Error(String(err));
        console.error("File upload error:", uploadError);
        setStatus("error");
        setError(uploadError);
        onError?.(uploadError);
      }
    },
    [apiUrl, embedFunction, maxFileSizeMB, chunkSize, chunkOverlap, onSuccess, onError]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setFileName(null);
    setChunks([]);
    setError(null);
  }, []);

  // Compute UI-ready attachment preview
  const attachmentPreview: AttachmentPreview = (() => {
    if (!fileName) return null;

    if (status === "error") {
      return {
        fileName,
        status: "error",
        error: error?.message ?? "Upload failed",
      };
    }

    if (status === "uploading" || status === "chunking" || status === "embedding") {
      return {
        fileName,
        status: "uploading",
      };
    }

    if (status === "ready") {
      return {
        fileName,
        status: "ready",
        chunkCount: chunks.length,
      };
    }

    return null;
  })();

  return {
    uploadFile,
    status,
    fileName,
    chunks,
    error,
    chunkCount: chunks.length,
    attachmentPreview,
    reset,
  };
}
