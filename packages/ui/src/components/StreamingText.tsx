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

  const [cursorVisible, setCursorVisible] = React.useState(true);
  const [displayedText, setDisplayedText] = React.useState(text);
  const displayedTextRef = React.useRef(text);

  // Keep ref in sync for animation calculations
  React.useEffect(() => {
    displayedTextRef.current = displayedText;
  }, [displayedText]);

  // Animate characters when streaming flag is on and text grows
  React.useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    const currentLength = displayedTextRef.current.length;
    const targetLength = text.length;

    // If text shrank or stayed the same, sync immediately
    if (targetLength <= currentLength) {
      setDisplayedText(text);
      return;
    }

    let frame: number;
    let index = currentLength;
    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      index = Math.min(index + 1, targetLength);
      setDisplayedText(text.slice(0, index));
      if (index < targetLength) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [text, isStreaming]);

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
      {displayedText}
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
