import * as React from "react";

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  onClear?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  sendButtonText?: string;
  stopButtonText?: string;
  clearButtonText?: string;
  showStopButton?: boolean;
  showClearButton?: boolean;
};

/**
 * Composer - Input composer with send/stop/restart controls
 *
 * Handles user input with keyboard shortcuts and state-aware buttons.
 * Fully unstyled - use className props for custom styling.
 *
 * @example
 * ```tsx
 * <Composer
 *   value={input}
 *   onChange={setInput}
 *   onSubmit={handleSend}
 *   onStop={handleStop}
 *   isStreaming={isStreaming}
 *   placeholder="Type a message..."
 * />
 * ```
 */
export default function Composer(props: ComposerProps) {
  const {
    value,
    onChange,
    onSubmit,
    onStop,
    onClear,
    isStreaming = false,
    disabled = false,
    placeholder = "Type a message...",
    className = "",
    inputClassName = "",
    buttonClassName = "",
    sendButtonText = "Send",
    stopButtonText = "Stop",
    clearButtonText = "Clear",
    showStopButton = true,
    showClearButton = true,
  } = props;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled && !isStreaming) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled && !isStreaming) {
      onSubmit();
    }
  };

  const canSend = !disabled && !isStreaming && value.trim().length > 0;
  const canStop = showStopButton && isStreaming && onStop;
  const canClear = showClearButton && onClear;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassName}
        aria-label="Message input"
        autoComplete="off"
      />

      <button
        type="submit"
        disabled={!canSend}
        className={buttonClassName}
        aria-label={sendButtonText}
      >
        {sendButtonText}
      </button>

      {canStop && (
        <button
          type="button"
          onClick={onStop}
          className={buttonClassName}
          aria-label={stopButtonText}
        >
          {stopButtonText}
        </button>
      )}

      {canClear && (
        <button
          type="button"
          onClick={onClear}
          className={buttonClassName}
          aria-label={clearButtonText}
        >
          {clearButtonText}
        </button>
      )}
    </form>
  );
}
