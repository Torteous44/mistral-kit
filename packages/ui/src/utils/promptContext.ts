import type { ChatAttachment } from "../types/chat";

export function buildAttachmentHint(
  attachments: ChatAttachment[],
  options: { mentionChunks?: boolean } = {}
) {
  if (!attachments.length) return "";

  const mentionChunks = options.mentionChunks ?? true;
  const parts = attachments.map((attachment) => {
    const chunkInfo =
      mentionChunks && typeof attachment.chunkCount === "number"
        ? ` (${attachment.chunkCount} embedded chunks)`
        : "";
    return `${attachment.fileName}${chunkInfo}`;
  });

  return `Attachment: ${parts.join(
    ", "
  )}. Use the search_docs tool to reference the embedded content.`;
}

type PrepareOptions = {
  fallbackText?: (attachment: ChatAttachment) => string;
  mentionChunks?: boolean;
};

export function preparePromptWithAttachments(
  text: string,
  attachments: ChatAttachment[] | undefined = [],
  options: PrepareOptions = {}
) {
  const trimmed = text.trim();
  let visibleText = trimmed;

  if (!visibleText && attachments.length) {
    const primary = attachments[0];
    const fallback =
      options.fallbackText ??
      ((attachment: ChatAttachment) => `Please analyze "${attachment.fileName ?? "the document"}".`);
    visibleText = fallback(primary);
  }

  const modelText =
    attachments.length && visibleText
      ? `${visibleText}\n\n${buildAttachmentHint(attachments, {
          mentionChunks: options.mentionChunks,
        })}`
      : visibleText;

  return {
    visibleText,
    modelText,
  };
}
