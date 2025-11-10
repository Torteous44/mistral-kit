import * as React from "react";

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
>(({ className = "", minRows = 2, maxRows = 8, onChange, ...props }, ref) => {
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
        {label}
      </button>
    );
  }
);
PromptInputSubmit.displayName = "PromptInputSubmit";
