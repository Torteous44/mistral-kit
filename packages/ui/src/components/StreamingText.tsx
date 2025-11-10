import * as React from "react";

type StreamingTextProps = {
  text: string;
  isStreaming?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
  className?: string;
  cursorClassName?: string;
};

/**
 * StreamingText - A11y-friendly token streaming display
 *
 * Displays text with optional streaming cursor and proper accessibility.
 * Updates are announced incrementally to screen readers.
 *
 * @example
 * ```tsx
 * <StreamingText
 *   text={message.content}
 *   isStreaming={isStreaming}
 *   showCursor={true}
 *   cursorChar="▋"
 * />
 * ```
 */
export default function StreamingText(props: StreamingTextProps) {
  const {
    text,
    isStreaming = false,
    showCursor = true,
    cursorChar = "▋",
    className = "",
    cursorClassName = "",
  } = props;

  // Simple blink effect using inline styles
  const [cursorVisible, setCursorVisible] = React.useState(true);

  React.useEffect(() => {
    if (!isStreaming || !showCursor) return;

    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming, showCursor]);

  return (
    <span
      className={className}
      aria-live="polite"
      aria-atomic="false"
      aria-busy={isStreaming}
    >
      {text}
      {isStreaming && showCursor && (
        <span
          className={cursorClassName}
          aria-hidden="true"
          style={{ opacity: cursorVisible ? 1 : 0 }}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}
