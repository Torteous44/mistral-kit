import * as React from "react";
import ReactMarkdown from "react-markdown";
import { useStreamingText } from "../hooks/useStreamingText";

type StreamingMarkdownProps = {
  text: string;
  animate?: boolean;
  className?: string;
};

/**
 * StreamingMarkdown renders markdown content with an optional
 * progressive reveal effect, mirroring token streaming.
 */
const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  text,
  animate = false,
  className = "prose prose-sm max-w-none text-current",
}) => {
  const displayed = useStreamingText(text, { animate });

  return (
    <div className={className}>
      <ReactMarkdown>{displayed}</ReactMarkdown>
    </div>
  );
};

export default StreamingMarkdown;
