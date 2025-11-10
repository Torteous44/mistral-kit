import { Children, useMemo, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { Actions, Action } from "../components/Actions";
import { CodeBlock, CodeBlockCopyButton } from "../components/CodeBlock";
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from "../components/InlineCitation";

export type CitationSource = {
  title?: string;
  url?: string;
  description?: string;
};

export type CitationEntry = {
  id?: string;
  quote?: string;
  sources?: CitationSource[];
};

export type ResponseAction = {
  id?: string;
  label: string;
  prompt: string;
  tooltip?: string;
};

export type ChatMarkdownComponentsOptions = {
  onActionSelect?: (prompt: string) => void;
};

/**
 * Provides memoized markdown components for chat responses, including support for
 * ```actions and ```citations blocks emitted by the assistant.
 */
export function useChatMarkdownComponents(options: ChatMarkdownComponentsOptions = {}) {
  const { onActionSelect } = options;

  return useMemo(
    () => ({
      code({
        inline,
        className,
        children,
      }: {
        inline?: boolean;
        className?: string;
        children: ReactNode[];
      }) {
        const textContent = Children.toArray(children)
          .map((child) => {
            if (typeof child === "string") return child;
            if (typeof child === "number") return String(child);
            return "";
          })
          .join("");
        const raw = textContent.replace(/\n$/, "");
        const match = /language-(\w+)/.exec(className ?? "");
        const language = match?.[1] ?? "text";

        if (!inline && language === "citations") {
          const citations = safeJsonParse<CitationEntry[]>(raw);
          if (citations?.length) {
            return <CitationsBlock citations={citations} />;
          }
        }

        if (!inline && language === "actions") {
          const actions = safeJsonParse<ResponseAction[]>(raw);
          if (actions?.length && onActionSelect) {
            return <ActionsBlock actions={actions} onSelect={onActionSelect} />;
          }
        }

        if (inline) {
          return (
            <code className={className}>
              {children}
            </code>
          );
        }

        return (
          <CodeBlock
            code={raw}
            language={language}
            showLineNumbers
            darkMode
            containerClassName="mt-4 text-mistral-beige"
          >
            <CodeBlockCopyButton
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
              copyIcon={<Copy className="h-4 w-4" aria-hidden="true" />}
              copiedIcon={<Check className="h-4 w-4" aria-hidden="true" />}
            />
          </CodeBlock>
        );
      },
    }),
    [onActionSelect]
  );
}

export function CitationsBlock({ citations }: { citations: CitationEntry[] }) {
  return (
    <div className="mt-4 space-y-4">
      {citations.map((citation, index) => {
        const sources = citation.sources ?? [];
        const sourceUrls = sources
          .map((source) => source.url)
          .filter((url): url is string => Boolean(url));

        return (
          <InlineCitation
            key={citation.id ?? `${index}-${sourceUrls[0] ?? "citation"}`}
            className="flex flex-col gap-2 rounded-2xl	border border-mistral-black/10 bg-mistral-beige/70 px-4 py-3"
          >
            {citation.quote && (
              <InlineCitationText className="text-sm leading-relaxed text-mistral-black">
                {citation.quote}
              </InlineCitationText>
            )}
            {sources.length ? (
              <InlineCitationCard>
                <InlineCitationCardTrigger
                  sources={sourceUrls}
                  className="self-start rounded-full border border-mistral-black/20 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-mistral-black hover:border-mistral-orange hover:text-mistral-orange"
                >
                  Sources
                </InlineCitationCardTrigger>
                <InlineCitationCardBody
                  sideOffset={8}
                  className="w-72 rounded-2xl border border-mistral-black/10 bg-white p-4 shadow-xl"
                >
                  <InlineCitationQuote className="text-xs text-mistral-black/70">
                    {citation.quote ?? "Referenced material"}
                  </InlineCitationQuote>
                  <InlineCitationCarousel className="mt-3">
                    <InlineCitationCarouselContent className="flex gap-3">
                      {sources.map((source, sourceIndex) => (
                        <InlineCitationCarouselItem key={source.url ?? sourceIndex} className="pr-3">
                          <InlineCitationSource
                            title={source.title ?? `Source ${sourceIndex + 1}`}
                            url={source.url}
                            description={source.description}
                            className="rounded-xl border border-mistral-black/10 bg-mistral-beige/40 px-3 py-2 text-xs leading-relaxed text-mistral-black"
                          />
                        </InlineCitationCarouselItem>
                      ))}
                    </InlineCitationCarouselContent>
                  </InlineCitationCarousel>
                  <InlineCitationCarouselHeader className="mt-3 flex items-center justify-between text-xs text-mistral-black/60">
                    <InlineCitationCarouselPrev className="rounded-full border border-mistral-black/20 px-3 py-1" />
                    <InlineCitationCarouselIndex />
                    <InlineCitationCarouselNext className="rounded-full border border-mistral-black/20 px-3 py-1" />
                  </InlineCitationCarouselHeader>
                </InlineCitationCardBody>
              </InlineCitationCard>
            ) : null}
          </InlineCitation>
        );
      })}
    </div>
  );
}

export function ActionsBlock({
  actions,
  onSelect,
}: {
  actions: ResponseAction[];
  onSelect: (prompt: string) => void;
}) {
  return (
    <Actions className="mt-4 flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <Action
          key={action.id ?? `${index}-${action.label}`}
          tooltip={action.tooltip ?? action.prompt}
          label={action.label}
          className="rounded-full border border-mistral-black/20 bg-white px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mistral-black transition-colors hover:border-mistral-orange hover:text-mistral-orange"
          onClick={() => onSelect(action.prompt)}
        >
          {action.label}
        </Action>
      ))}
    </Actions>
  );
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
