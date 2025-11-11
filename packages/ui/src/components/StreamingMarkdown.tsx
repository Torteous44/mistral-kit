import * as React from "react";
import ReactMarkdown, { type Options as ReactMarkdownOptions } from "react-markdown";
import { useStreamingText } from "../hooks/useStreamingText";

type StreamingMarkdownProps = {
  text: string;
  animate?: boolean;
  className?: string;
  components?: ReactMarkdownOptions["components"];
  remarkPlugins?: ReactMarkdownOptions["remarkPlugins"];
};

/**
 * StreamingMarkdown renders markdown content with an optional
 * progressive reveal effect, mirroring token streaming.
 */
const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  text,
  animate = false,
  className = "prose prose-sm max-w-none text-current",
  components,
  remarkPlugins,
}) => {
  const hasMountedRef = React.useRef(false);
  const previousTextRef = React.useRef(text);

  React.useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  React.useEffect(() => {
    previousTextRef.current = text;
  }, [text]);

  const shouldAnimate = animate && hasMountedRef.current && previousTextRef.current !== text;

  const displayed = useStreamingText(text, { animate: shouldAnimate });

  return (
    <div className={className}>
      <ReactMarkdown components={components} remarkPlugins={remarkPlugins}>
        {displayed}
      </ReactMarkdown>
    </div>
  );
};

export default StreamingMarkdown;
