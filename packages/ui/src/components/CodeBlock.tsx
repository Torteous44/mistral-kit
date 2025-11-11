import * as React from "react";
import type { SVGProps } from "react";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy, Check } from "lucide-react";

const CopyIcon = Copy as unknown as React.ComponentType<SVGProps<SVGSVGElement>>;
const CheckIcon = Check as unknown as React.ComponentType<SVGProps<SVGSVGElement>>;
type SyntaxHighlighterComponentProps = SyntaxHighlighterProps & {
  children?: React.ReactNode;
};

const SyntaxHighlighterComponent =
  SyntaxHighlighter as unknown as React.ComponentType<SyntaxHighlighterComponentProps>;

type CodeBlockContextType = {
  code: string;
};

const CodeBlockContext = React.createContext<CodeBlockContextType>({
  code: "",
});

export type CodeBlockProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The code to display */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Use dark theme */
  darkMode?: boolean;
  /** Custom styles for the container */
  containerClassName?: string;
};

/**
 * Syntax-highlighted code block with copy functionality
 */
export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  darkMode,
  className,
  containerClassName,
  children,
  ...props
}: CodeBlockProps) {
  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        className={containerClassName}
        style={{
          borderRadius: "1rem",
          border: "1px solid rgba(16, 16, 16, 0.08)",
          overflow: "hidden",
          backgroundColor: darkMode ? "#0d0d0d" : "#ffffff",
        }}
        {...props}
      >
        <div className={className} style={{ position: "relative" }}>
          {React.createElement(SyntaxHighlighterComponent, {
            language,
            style: darkMode ? oneDark : oneLight,
            showLineNumbers,
            customStyle: {
              margin: 0,
              padding: "1.25rem",
              fontSize: "0.8rem",
              backgroundColor: "transparent",
            },
            codeTagProps: {
              style: {
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: "0.75rem",
              },
            },
            PreTag: "div",
            children: code,
          })}
          {children && (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </CodeBlockContext.Provider>
  );
}

export type CodeBlockCopyButtonProps = React.ComponentProps<"button"> & {
  /** Callback when copy succeeds */
  onCopy?: () => void;
  /** Callback when copy fails */
  onError?: (error: Error) => void;
  /** How long to show "copied" state in ms */
  timeout?: number;
  /** Custom icon for copy state */
  copyIcon?: React.ReactNode;
  /** Custom icon for copied state */
  copiedIcon?: React.ReactNode;
};

/**
 * Copy button for code blocks - must be used within CodeBlock component
 */
export function CodeBlockCopyButton({
  onCopy,
  onError,
  timeout = 2000,
  copyIcon,
  copiedIcon,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const { code } = React.useContext(CodeBlockContext);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
      const error = new Error("Clipboard API not available");
      onError?.(error);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const resolvedCopyIcon =
    copyIcon ?? React.createElement(CopyIcon, { className: "h-4 w-2", "aria-hidden": true });
  const resolvedCopiedIcon =
    copiedIcon ?? React.createElement(CheckIcon, { className: "h-4 w-2", "aria-hidden": true });

  return (
    <button
      className={className}
      onClick={copyToClipboard}
      type="button"
      aria-label={isCopied ? "Copied" : "Copy code"}
      {...props}
    >
      {children ?? (isCopied ? resolvedCopiedIcon : resolvedCopyIcon)}
    </button>
  );
}

export default CodeBlock;
