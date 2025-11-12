import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import type { Components } from "react-markdown";
import type { ChatAttachment, ChatMessage, ToolDefinition } from "../types/chat";
import MessageList from "./MessageList";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputButton,
  PromptInputSubmit,
  PromptAttachmentPreview,
} from "./PromptInput";
import { Plus, ArrowUp, AlertTriangle } from "lucide-react";
import { useToolExecutor, type SendChatHandler } from "../hooks/useToolExecutor";
import { useOrderedMessages } from "../hooks/useOrderedMessages";
import { useEmbeddings, type UseEmbeddingsOptions } from "../hooks/useEmbeddings";
import { useMistralAttachments } from "../hooks/useMistralAttachments";
import { useMistralTools, type SemanticSearchToolOptions } from "../hooks/useMistralTools";
import { useMistralMarkdown } from "../hooks/useMistralMarkdown";
import { ChatMessageBubble, type ChatMessageBubbleAttachmentClassNames } from "./ChatMessage";
import { ChatStatus } from "./ChatStatus";
import type { PrepareOptions } from "../utils/promptContext";
import type { UseFileUploadOptions } from "../hooks/useFileUpload";

export type MistralChatClassNames = {
  container?: string;
  scrollArea?: string;
  messageList?: string;
  messageWrapper?: string;
  toolError?: string;
  embeddingsError?: string;
  promptWrapper?: string;
  scrollFade?: string;
  prompt?: string;
  attachmentPreview?: string;
  textarea?: string;
  uploadButton?: string;
  submitButton?: string;
  controls?: string;
  controlsUpload?: string;
  controlsSubmit?: string;
  userBubble?: string;
  assistantBubble?: string;
  messageAttachmentUser?: string;
  messageAttachmentAssistant?: string;
  messageAttachmentBadge?: string;
  messageAttachmentFilename?: string;
  messageAttachmentMeta?: string;
  toolContainer?: string;
  toolTrigger?: string;
  toolName?: string;
  toolBadge?: string;
  toolContent?: string;
  toolInputContainer?: string;
  toolInputLabel?: string;
  toolInputContent?: string;
  toolOutputContainer?: string;
  toolOutputLabel?: string;
  toolOutputContent?: string;
  toolOutputError?: string;
};

export type MistralChatProps = {
  className?: string;
  model?: string;
  apiProxyUrl?: string;
  systemPrompt?: string;
  maxTurns?: number;
  toolTimeout?: number;
  sendChat?: SendChatHandler;
  tools?: ToolDefinition[];
  baseTools?: ToolDefinition[];
  extraTools?: ToolDefinition[];
  semanticSearchOptions?: Omit<SemanticSearchToolOptions, "chunks" | "embedQuery"> & { enabled?: boolean };
  enableUploads?: boolean;
  uploadOptions?: Partial<Omit<UseFileUploadOptions, "embedFunction">>;
  attachmentOptions?: PrepareOptions;
  acceptedFileTypes?: string;
  embeddingsOptions?: UseEmbeddingsOptions;
  onToolCall?: (toolName: string, args: any, result: any) => void;
  messageListClassName?: string;
  markdownComponents?: Components;
  onActionSelect?: (prompt: string) => void;
  promptPlaceholder?: string;
  classNames?: MistralChatClassNames;
  unstyled?: boolean;
  animateAssistantResponses?: boolean;
};

const mergeClassNames = (...classes: Array<string | undefined | null>) =>
  classes.filter(Boolean).join(" ");

const applyClass = (
  fallback: string,
  override: string | undefined,
  unstyled: boolean
): string => {
  if (override !== undefined) return override;
  return unstyled ? "" : fallback;
};

export function MistralChat({
  className = "",
  model = "mistral-medium-latest",
  apiProxyUrl = "/api/mistral",
  systemPrompt,
  maxTurns = 6,
  toolTimeout = 30000,
  sendChat,
  tools,
  baseTools = [],
  extraTools = [],
  semanticSearchOptions,
  enableUploads = true,
  uploadOptions,
  attachmentOptions,
  acceptedFileTypes,
  embeddingsOptions,
  onToolCall,
  messageListClassName: messageListClassNameProp,
  markdownComponents: markdownOverride,
  onActionSelect,
  promptPlaceholder = "Describe what you need...",
  classNames,
  unstyled = false,
  animateAssistantResponses = false,
}: MistralChatProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { embed, error: embeddingsError } = useEmbeddings(embeddingsOptions);
  const embedFunction = useCallback((texts: string[]) => embed(texts), [embed]);

  const attachments = useMistralAttachments({
    enabled: enableUploads,
    embedFunction: enableUploads ? embedFunction : undefined,
    uploadOptions,
    attachmentOptions,
    acceptedFileTypes,
  });

  const embedQuery = useCallback(
    async (text: string) => {
      const result = await embed(text);
      return result[0]?.embedding ?? [];
    },
    [embed]
  );

  const computedTools =
    tools ??
    useMistralTools({
      baseTools,
      extraTools,
      semanticSearch:
        semanticSearchOptions && semanticSearchOptions.enabled === false
          ? undefined
          : {
              enabled: semanticSearchOptions?.enabled,
              contextChunksForGeneral: semanticSearchOptions?.contextChunksForGeneral,
              chunks: attachments.chunks,
              embedQuery,
            },
    });

  const toolExecutor = useToolExecutor({
    tools: computedTools,
    model,
    apiProxyUrl,
    systemPrompt,
    maxTurns,
    toolTimeout,
    sendChat,
    onToolCall,
  });

  const orderedMessages = useOrderedMessages(toolExecutor.messages);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [orderedMessages]);

  const lastAssistantMessageId = useMemo(() => {
    const assistants = orderedMessages.filter((msg) => msg.role === "assistant");
    return assistants[assistants.length - 1]?.id ?? null;
  }, [orderedMessages]);

  const handleActionPrompt = useCallback(
    (prompt: string) => {
      setDraft(prompt);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      onActionSelect?.(prompt);
    },
    [onActionSelect]
  );

  const markdownComponents = markdownOverride ?? useMistralMarkdown({ onActionSelect: handleActionPrompt });

  const containerClass = mergeClassNames(
    applyClass("flex h-full flex-col gap-6", classNames?.container, unstyled),
    className
  );
  const scrollAreaClass = applyClass("absolute inset-0 space-y-6 overflow-y-auto pr-2", classNames?.scrollArea, unstyled);
  const messageListBaseClass = applyClass("space-y-4", classNames?.messageList, unstyled);
  const messageListClass = mergeClassNames(messageListBaseClass, messageListClassNameProp);
  const promptClass = applyClass(
    "rounded-3xl border border-neutral-200 bg-white px-2 py-2",
    classNames?.prompt,
    unstyled
  );
  const attachmentPreviewClass = applyClass(
    "mb-3 w-fit items-center gap-3 rounded-2xl border border-neutral-200 bg-zinc-50 px-3 py-2 text-sm text-[#101010]",
    classNames?.attachmentPreview,
    unstyled
  );
  const textareaClass = applyClass(
    "h-auto w-full resize-none rounded-3xl bg-transparent px-4 py-3 text-sm text-[#101010] placeholder:text-neutral-500 focus:outline-none",
    classNames?.textarea,
    unstyled
  );
  const uploadButtonClass = applyClass(
    "flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-all hover:border-[#fa520f] hover:text-[#fa520f] disabled:opacity-40 disabled:cursor-not-allowed",
    classNames?.uploadButton,
    unstyled
  );
  const submitButtonClass = applyClass(
    "flex h-10 w-10 items-center justify-center rounded-full bg-[#101010] text-white transition-all hover:bg-[#fa520f] disabled:opacity-40 disabled:cursor-not-allowed",
    classNames?.submitButton,
    unstyled
  );
  const controlsClass = applyClass(
    "flex w-full flex-wrap items-center gap-3 pt-3",
    classNames?.controls,
    unstyled
  );
  const controlsUploadClass = applyClass(
    "flex items-center gap-2",
    classNames?.controlsUpload,
    unstyled
  );
  const controlsSubmitClass = applyClass(
    "ml-auto flex items-center",
    classNames?.controlsSubmit,
    unstyled
  );
  const toolErrorClass = applyClass("w-full", classNames?.toolError, unstyled);
  const embeddingsErrorClass = applyClass("w-full", classNames?.embeddingsError, unstyled);
  const messageWrapperClass = applyClass("", classNames?.messageWrapper, unstyled);
  const promptWrapperClass = applyClass("flex-shrink-0", classNames?.promptWrapper, unstyled);
  const scrollFadeClass = applyClass(
    "pointer-events-none absolute bottom-0 left-0 right-0 h-12",
    classNames?.scrollFade,
    unstyled
  );
  const userBubbleClassNameValue =
    classNames?.userBubble ?? (unstyled ? "" : undefined);
  const assistantBubbleClassNameValue =
    classNames?.assistantBubble ?? (unstyled ? "" : undefined);

  const attachmentClassNames = useMemo<ChatMessageBubbleAttachmentClassNames | undefined>(() => {
    const provided =
      classNames?.messageAttachmentUser ||
      classNames?.messageAttachmentAssistant ||
      classNames?.messageAttachmentBadge ||
      classNames?.messageAttachmentFilename ||
      classNames?.messageAttachmentMeta;

    if (provided || unstyled) {
      return {
        userContainer: classNames?.messageAttachmentUser ?? (unstyled ? "" : undefined),
        assistantContainer: classNames?.messageAttachmentAssistant ?? (unstyled ? "" : undefined),
        badge: classNames?.messageAttachmentBadge ?? (unstyled ? "" : undefined),
        fileName: classNames?.messageAttachmentFilename ?? (unstyled ? "" : undefined),
        meta: classNames?.messageAttachmentMeta ?? (unstyled ? "" : undefined),
      };
    }

    return undefined;
  }, [
    classNames?.messageAttachmentAssistant,
    classNames?.messageAttachmentBadge,
    classNames?.messageAttachmentFilename,
    classNames?.messageAttachmentMeta,
    classNames?.messageAttachmentUser,
    unstyled,
  ]);

  const toolClassNames = useMemo(() => {
    const provided =
      classNames?.toolContainer ||
      classNames?.toolTrigger ||
      classNames?.toolName ||
      classNames?.toolBadge ||
      classNames?.toolContent ||
      classNames?.toolInputContainer ||
      classNames?.toolInputLabel ||
      classNames?.toolInputContent ||
      classNames?.toolOutputContainer ||
      classNames?.toolOutputLabel ||
      classNames?.toolOutputContent ||
      classNames?.toolOutputError;

    if (provided || unstyled) {
      return {
        container: classNames?.toolContainer ?? (unstyled ? "" : undefined),
        trigger: classNames?.toolTrigger ?? (unstyled ? "" : undefined),
        name: classNames?.toolName ?? (unstyled ? "" : undefined),
        badge: classNames?.toolBadge ?? (unstyled ? "" : undefined),
        content: classNames?.toolContent ?? (unstyled ? "" : undefined),
        inputContainer: classNames?.toolInputContainer ?? (unstyled ? "" : undefined),
        inputLabel: classNames?.toolInputLabel ?? (unstyled ? "" : undefined),
        inputContent: classNames?.toolInputContent ?? (unstyled ? "" : undefined),
        outputContainer: classNames?.toolOutputContainer ?? (unstyled ? "" : undefined),
        outputLabel: classNames?.toolOutputLabel ?? (unstyled ? "" : undefined),
        outputContent: classNames?.toolOutputContent ?? (unstyled ? "" : undefined),
        outputError: classNames?.toolOutputError ?? (unstyled ? "" : undefined),
      };
    }

    return undefined;
  }, [
    classNames?.toolContainer,
    classNames?.toolTrigger,
    classNames?.toolName,
    classNames?.toolBadge,
    classNames?.toolContent,
    classNames?.toolInputContainer,
    classNames?.toolInputLabel,
    classNames?.toolInputContent,
    classNames?.toolOutputContainer,
    classNames?.toolOutputLabel,
    classNames?.toolOutputContent,
    classNames?.toolOutputError,
    unstyled,
  ]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = draft.trim();
      const hasReadyAttachment = attachments.hasReadyAttachment;

      if (!trimmed && !hasReadyAttachment) {
        return;
      }

      const { visibleText, modelText } = attachments.preparePrompt(trimmed);

      if (!visibleText) return;

      const attachmentPayload = attachments.attachments ?? undefined;

      toolExecutor.execute(modelText, {
        attachments: attachmentPayload,
        displayContent: visibleText,
      });

      if (attachmentPayload?.length) {
        attachments.resetAttachments();
      }

      setDraft("");
    },
    [attachments, draft, toolExecutor]
  );

  const renderMessage = useCallback(
    (message: ChatMessage) => (
      <ChatMessageBubble
        message={message}
        animateAssistant={
          animateAssistantResponses && message.role === "assistant" && message.id === lastAssistantMessageId
        }
        markdownComponents={markdownComponents}
        className={messageWrapperClass}
        userBubbleClassName={userBubbleClassNameValue}
        assistantBubbleClassName={assistantBubbleClassNameValue}
        attachmentClassNames={attachmentClassNames}
        toolClassNames={toolClassNames}
      />
    ),
    [
      attachmentClassNames,
      assistantBubbleClassNameValue,
      animateAssistantResponses,
      lastAssistantMessageId,
      markdownComponents,
      messageWrapperClass,
      userBubbleClassNameValue,
      toolClassNames,
    ]
  );

  const handleUploadButton = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      attachments.uploadInputRef.current?.click();
    },
    [attachments.uploadInputRef]
  );

  return (
    <div className={containerClass}>
      <div className="relative flex-1 min-h-0">
        <div ref={scrollRef} className={scrollAreaClass}>
          <MessageList messages={orderedMessages} className={messageListClass} renderMessage={renderMessage} />
        </div>
        {!unstyled && scrollFadeClass && <div className={scrollFadeClass} />}
      </div>

      {toolExecutor.error && (
        <ChatStatus
          variant="error"
          message={toolExecutor.error.message}
          icon={<AlertTriangle className="h-4 w-4" />}
          className={toolErrorClass}
          unstyled={unstyled}
        />
      )}

      {embeddingsError && (
        <ChatStatus
          variant="error"
          message={embeddingsError.message}
          icon={<AlertTriangle className="h-4 w-4" />}
          className={embeddingsErrorClass}
          unstyled={unstyled}
        />
      )}

      <div className={promptWrapperClass}>
        <PromptInput onSubmit={handleSubmit} className={promptClass}>
        {attachments.attachmentPreview && (
          <PromptAttachmentPreview
            fileName={attachments.attachmentPreview.fileName}
            status={attachments.attachmentPreview.status}
            chunkCount={
              attachments.attachmentPreview.status === "ready"
                ? attachments.attachmentPreview.chunkCount
                : undefined
            }
            error={attachments.attachmentPreview.status === "error" ? attachments.fileUpload?.error?.message : undefined}
            onRemove={attachments.resetAttachments}
            className={attachmentPreviewClass}
          />
        )}

        <div className="space-y-3">
          <PromptInputTextarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={toolExecutor.isExecuting}
            placeholder={promptPlaceholder}
            className={textareaClass}
            minRows={2}
            maxRows={6}
          />

          <div className={controlsClass}>
            {enableUploads && (
              <div className={controlsUploadClass}>
                <PromptInputButton
                  className={uploadButtonClass}
                  onClick={handleUploadButton}
                  aria-label="Upload knowledge"
                  disabled={attachments.attachmentPreview?.status === "uploading"}
                >
                  <Plus className="h-4 w-4" />
                </PromptInputButton>
              </div>
            )}

            <div className={controlsSubmitClass}>
              <PromptInputSubmit
                status={toolExecutor.isExecuting ? "submitting" : "idle"}
                disabled={toolExecutor.isExecuting || (!draft.trim() && !attachments.hasReadyAttachment)}
                className={submitButtonClass}
              >
                <ArrowUp className="h-4 w-4" />
              </PromptInputSubmit>
            </div>
          </div>
        </div>

        {enableUploads && (
          <input
            ref={attachments.uploadInputRef}
            type="file"
            accept={attachments.attachmentAccept}
            className="hidden"
            onChange={attachments.handleFileSelection as unknown as (event: ChangeEvent<HTMLInputElement>) => void}
          />
        )}
      </PromptInput>
      </div>
    </div>
  );
}

export default MistralChat;
