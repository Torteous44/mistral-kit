import { useCallback, useMemo, useRef } from "react";
import type { ChangeEvent } from "react";
import type { ChatAttachment } from "../types/chat";
import type { EmbeddedChunk } from "../types/rag";
import {
  useFileUpload,
  type AttachmentPreview,
  type UseFileUploadOptions,
  type UseFileUploadResult,
} from "./useFileUpload";
import { preparePromptWithAttachments, type PrepareOptions } from "../utils/promptContext";

export type UseMistralAttachmentsOptions = {
  enabled?: boolean;
  uploadOptions?: Partial<Omit<UseFileUploadOptions, "embedFunction">>;
  embedFunction?: (texts: string[]) => Promise<Array<{ embedding: number[]; text: string }>>;
  attachmentOptions?: PrepareOptions;
  acceptedFileTypes?: string;
};

export type UseMistralAttachmentsResult = {
  attachmentPreview: AttachmentPreview;
  attachments: ChatAttachment[] | undefined;
  hasReadyAttachment: boolean;
  handleFileSelection: (event: ChangeEvent<HTMLInputElement>) => void;
  uploadInputRef: React.RefObject<HTMLInputElement | null>;
  resetAttachments: () => void;
  preparePrompt: (text: string) => { visibleText: string; modelText: string };
  chunks: EmbeddedChunk[];
  fileUpload: UseFileUploadResult | null;
  attachmentAccept: string;
};

const DEFAULT_ACCEPT = ".txt,.md,.markdown,.pdf,.docx";

export function useMistralAttachments(
  options: UseMistralAttachmentsOptions = {}
): UseMistralAttachmentsResult {
  const {
    enabled = true,
    uploadOptions = {},
    embedFunction,
    attachmentOptions,
    acceptedFileTypes = DEFAULT_ACCEPT,
  } = options;

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const fileUpload = enabled
    ? useFileUpload({
        apiUrl: uploadOptions.apiUrl ?? "/api/upload-text",
        embedFunction: embedFunction ?? (async () => []),
        maxFileSizeMB: uploadOptions.maxFileSizeMB,
        chunkSize: uploadOptions.chunkSize,
        chunkOverlap: uploadOptions.chunkOverlap,
        onSuccess: uploadOptions.onSuccess,
        onError: uploadOptions.onError,
      })
    : null;

  if (enabled && !embedFunction) {
    console.warn("useMistralAttachments is enabled but no embedFunction was provided.");
  }

  const handleFileSelection = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!enabled || !fileUpload) return;
      const file = event.target.files?.[0];
      if (!file) return;
      void fileUpload.uploadFile(file);
      event.target.value = "";
    },
    [enabled, fileUpload]
  );

  const resetAttachments = useCallback(() => {
    if (!enabled || !fileUpload) return;
    fileUpload.reset();
  }, [enabled, fileUpload]);

  const attachmentPreview = fileUpload?.attachmentPreview ?? null;
  const hasReadyAttachment = attachmentPreview?.status === "ready";

  const attachments = useMemo<ChatAttachment[] | undefined>(() => {
    if (!hasReadyAttachment || !attachmentPreview) return undefined;
    return [
      {
        id: crypto.randomUUID(),
        fileName: attachmentPreview.fileName,
        chunkCount: attachmentPreview.chunkCount,
      },
    ];
  }, [hasReadyAttachment, attachmentPreview]);

  const preparePrompt = useCallback(
    (text: string) => preparePromptWithAttachments(text, attachments ?? [], attachmentOptions),
    [attachments, attachmentOptions]
  );

  return {
    attachmentPreview,
    attachments,
    hasReadyAttachment,
    handleFileSelection,
    uploadInputRef,
    resetAttachments,
    preparePrompt,
    chunks: fileUpload?.chunks ?? [],
    fileUpload,
    attachmentAccept: acceptedFileTypes,
  };
}
