import { useEffect, useRef, useState } from "react";

type Options = {
  animate?: boolean;
  step?: number;
};

/**
 * useStreamingText progressively reveals the provided `text`
 * when `animate` is true, mimicking token streaming updates.
 */
export function useStreamingText(text: string, options?: Options) {
  const { animate = false, step = 2 } = options ?? {};
  const [displayed, setDisplayed] = useState(() => (animate ? "" : text));
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayed(text);
      return;
    }

    let index = 0;

    const tick = () => {
      index = Math.min(index + step, text.length);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [text, animate, step]);

  return displayed;
}
