import * as React from "react";
import { Loader2, FileText, TriangleAlert, X } from "lucide-react";

export type PromptInputStatus = "idle" | "submitting" | "streaming" | "error";

export type PromptInputProps = React.FormHTMLAttributes<HTMLFormElement>;

export const PromptInput = React.forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className = "", ...props }, ref) => (
    <form
      ref={ref}
      className={className}
      {...props}
    />
  )
);
PromptInput.displayName = "PromptInput";

export type PromptInputTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
  maxRows?: number;
};

export const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(({ className = "", minRows = 2, maxRows = 8, onChange, style, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const resize = React.useCallback(() => {
    const node = innerRef.current;
    if (!node) return;
    node.style.height = "auto";
    const lineHeight = parseInt(window.getComputedStyle(node).lineHeight, 10) || 20;
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    node.style.height = `${Math.min(maxHeight, Math.max(minHeight, node.scrollHeight))}px`;
  }, [minRows, maxRows]);

  React.useLayoutEffect(() => {
    resize();
  }, [resize, props.value]);

  return (
    <textarea
      ref={innerRef}
      className={className}
      onChange={(event) => {
        onChange?.(event);
        requestAnimationFrame(resize);
      }}
      rows={minRows}
      style={{ resize: "none", ...style }}
      {...props}
    />
  );
});
PromptInputTextarea.displayName = "PromptInputTextarea";

export type PromptInputToolbarProps = React.HTMLAttributes<HTMLDivElement>;

export function PromptInputToolbar({ className = "", ...props }: PromptInputToolbarProps) {
  return <div className={className} {...props} />;
}

export type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

export function PromptInputActions({ className = "", ...props }: PromptInputActionsProps) {
  return <div className={className} {...props} />;
}

export type PromptInputButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PromptInputButton = React.forwardRef<HTMLButtonElement, PromptInputButtonProps>(
  ({ className = "", type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={className} {...props} />
  )
);
PromptInputButton.displayName = "PromptInputButton";

export type PromptInputSubmitProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  status?: PromptInputStatus;
  idleLabel?: string;
  submittingLabel?: string;
  streamingLabel?: string;
  errorLabel?: string;
};

export const PromptInputSubmit = React.forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  (
    {
      className = "",
      status = "idle",
      idleLabel = "Send",
      submittingLabel = "Sending",
      streamingLabel = "Stop",
      errorLabel = "Retry",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const label =
      status === "streaming"
        ? streamingLabel
        : status === "submitting"
        ? submittingLabel
        : status === "error"
        ? errorLabel
        : idleLabel;

    return (
      <button
        ref={ref}
        type="submit"
        className={className}
        disabled={disabled}
        {...props}
      >
        {children ?? label}
      </button>
    );
  }
);
PromptInputSubmit.displayName = "PromptInputSubmit";

export type PromptAttachmentStatus = "uploading" | "ready" | "error";

export type PromptAttachmentPreviewProps = {
  fileName: string;
  status: PromptAttachmentStatus;
  chunkCount?: number;
  error?: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
  onRemove?: () => void;
  removeLabel?: string;
  iconMap?: Partial<Record<PromptAttachmentStatus, IconRenderer>>;
};

type IconRenderer = (className?: string) => React.ReactNode;

const createIconRenderer =
  (Icon: React.ComponentType<{ className?: string }>): IconRenderer =>
  (className) =>
    React.createElement(Icon, { className });

const StatusIcon: Record<PromptAttachmentStatus, IconRenderer> = {
  uploading: createIconRenderer(Loader2 as React.ComponentType<{ className?: string }>),
  ready: createIconRenderer(FileText as React.ComponentType<{ className?: string }>),
  error: createIconRenderer(TriangleAlert as React.ComponentType<{ className?: string }>),
};

export function PromptAttachmentPreview({
  fileName,
  status,
  chunkCount,
  error,
  description,
  className = "",
  style,
  onRemove,
  removeLabel = "Remove attachment",
  iconMap,
}: PromptAttachmentPreviewProps) {
  const iconRenderer: IconRenderer | undefined = iconMap?.[status] ?? StatusIcon[status];
  const statusDescription =
    description ?? (status === "error" ? error ?? "Upload failed" : undefined);

  return (
    <div
      className={`mistral-attachment-preview ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: "100%",
        ...style,
      }}
    >
      <div
        className="mistral-attachment-preview__icon"
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: "9999px",
        }}
      >
        {iconRenderer ? iconRenderer("h-4 w-4") : null}
      </div>
      <div className="mistral-attachment-preview__body" style={{ minWidth: 0 }}>
        <p
          className="mistral-attachment-preview__filename"
          style={{
            fontWeight: 600,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={fileName}
        >
          {fileName}
        </p>
        {statusDescription && (
          <p
            className="mistral-attachment-preview__status"
            style={{
              margin: 0,
              fontSize: "0.85em",
              opacity: 0.8,
            }}
          >
            {statusDescription}
          </p>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="mistral-attachment-preview__remove"
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            lineHeight: 0,
            padding: "0 0.25rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.createElement(X as React.ComponentType<{ className?: string }>, {
            className: "h-4 w-4",
          })}
        </button>
      )}
    </div>
  );
}
