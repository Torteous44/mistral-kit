import Link from "next/link";
import SyntaxHighlighter from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

const steps = [
  {
    label: "Install the kit",
    language: "bash",
    code: "pnpm add @matthewporteous/mistral-kit",
    body: "Works with pnpm, npm, or yarn. React 18+ and Next.js 13+ (App Router) supported.",
  },
  {
    label: "Scaffold secure routes",
    language: "bash",
    code: "npx mistral-kit init -- --dir apps/site",
    body: "Generates Edge-ready handlers for /api/mistral, /api/embeddings, /api/upload-text, /api/weather.",
  },
  {
    label: "Drop in the UI",
    language: "tsx",
    code: `import { MistralChatPanel } from "@matthewporteous/mistral-kit";

export default function Demo() {
  return (
    <MistralChatPanel
      apiProxyUrl="/api/mistral"
      baseTools={[]}
      embeddingsOptions={{ apiProxyUrl: "/api/embeddings" }}
    />
  );
}`,
    body: "Use the full panel or compose MessageList, Composer, Tool UI, and hooks yourself.",
  },
  {
    label: "Configure secrets & knobs",
    language: "bash",
    code: "MISTRAL_API_KEY=xxxx",
    body: "Tune uploadOptions, embeddingsOptions, base/extra tools, semanticSearchOptions, and CLI flags.",
  },
];

const featureCards = [
  {
    title: "Unstyled components",
    description: "Chat panels, message lists, tool displays, code blocks, inline citations—ready for your design system.",
  },
  {
    title: "Headless hooks",
    description: "Streaming chat, JSON mode, embeddings, ordered messages, markdown actions, RAG uploads.",
  },
  {
    title: "Batteries-included tools",
    description: "Weather, calculator, date/time, semantic search helpers plus factories to register your own.",
  },
  {
    title: "Edge-safe API routes",
    description: "Proxy chat + embeddings, extract text, fetch weather. Scaffolded via `npx mistral-kit init`.",
  },
];

const panelProps = [
  ["model", `string · "mistral-medium-latest"`, "Model name forwarded to the proxy."],
  ["apiProxyUrl", `string · "/api/mistral"`, "Streaming endpoint for chat completions."],
  ["systemPrompt", "string", "Optional instruction prepended to conversations."],
  ["maxTurns", "number · 6", "Cap on tool-execution loops to avoid runaway chains."],
  ["toolTimeout", "number · 30000", "Timeout (ms) per tool run before surfacing an error."],
  ["tools", "ToolDefinition[]", "Full override for tool list. Use base/extra otherwise."],
  ["baseTools / extraTools", "ToolDefinition[]", "Composable registries for built-ins + domain-specific tools."],
  [
    "semanticSearchOptions",
    "{ enabled?, contextChunksForGeneral?, ... }",
    "Automatically injects a retrieval tool once uploads are ready.",
  ],
  ["enableUploads", "boolean · true", "Toggle the document ingestion pipeline entirely."],
  ["uploadOptions", "Partial<UseFileUploadOptions>", "Tune upload API path, chunk sizes, overlap, callbacks."],
  ["embeddingsOptions", "UseEmbeddingsOptions", "Swap embedding model, proxy URL, or batch size."],
  ["attachmentOptions", "PrepareOptions", "Control how attachment hints appear in prompts/messages."],
  ["acceptedFileTypes", "string · .txt,.md,.markdown,.pdf,.docx", "Passed to the hidden file input."],
  ["onToolCall", "(toolName, args, result) => void", "Telemetry hook fired after each tool resolves."],
  ["markdownComponents", "react-markdown Components", "Override citations/actions renderer."],
  ["onActionSelect", "(prompt: string) => void", "Called when markdown actions suggest a follow-up prompt."],
  ["promptPlaceholder", `string · "Describe what you need..."`, "Composer placeholder text."],
  ["classNames", "MistralChatPanelClassNames", "Granular class overrides for every sub-element."],
  ["unstyled", "boolean · false", "Remove default spacing/typography to own 100% of styling."],
  ["animateAssistantResponses", "boolean · false", "Enable incremental animation of assistant replies."],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-mistral-beige text-mistral-black">
      <main className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        {/* Hero */}
        <section className="grid gap-10 rounded-[40px] border border-mistral-black/10 bg-white/80 p-10 md:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <p className="text-sm text-mistral-black/60">Next.js 16 · React 19 · Edge-ready</p>
            <h1 className="text-5xl font-semibold leading-tight">Build production AI chat faster with mistral-kit</h1>
            <p className="text-lg text-mistral-black/70">
              Secure chat proxies, headless hooks, unstyled primitives, and ready-made tools for Mistral AI integrations.
              Skip boilerplate—focus on prompts, UX, and domain logic.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/showcase"
                className="inline-flex items-center justify-center rounded-full bg-mistral-orange px-6 py-3 text-white font-semibold hover:bg-mistral-orange/90 transition-colors"
              >
                Launch the showcase
              </Link>
              <a
                href="https://www.npmjs.com/package/@matthewporteous/mistral-kit"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-mistral-black/15 px-6 py-3 font-semibold hover:border-mistral-orange hover:text-mistral-orange transition-colors"
              >
                View on npm
              </a>
            </div>
          </div>
          <div className="space-y-4 rounded-[32px] bg-mistral-black text-mistral-beige p-6 ">
            <p className="text-sm uppercase tracking-wide text-mistral-beige/70">Toolkit snapshot</p>
            <ul className="space-y-3 text-sm leading-relaxed">
              <li>✔ Drop-in `MistralChatPanel` with uploads + semantic search</li>
              <li>✔ Hooks for streaming chat, JSON mode, embeddings, tool orchestration</li>
              <li>✔ CLI scaffolder for `/api/mistral`, `/api/embeddings`, `/api/upload-text`, `/api/weather`</li>
              <li>✔ Works on Vercel/Cloudflare Edge—no Node APIs in client components</li>
            </ul>
          </div>
        </section>



        {/* Install steps */}
        <section className="space-y-6">
          <header className="space-y-2">
            <h2 className="text-3xl font-semibold">Quick start</h2>
            <p className="text-base text-mistral-black/70">Four practical steps—no clutter, no guesswork.</p>
          </header>
          <ol className="space-y-8 border-l-2 border-mistral-orange pl-6">
            {steps.map((step, index) => (
              <li key={step.label} className="relative pl-6">
                <span className="absolute left-[-38px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-mistral-orange text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mistral-orange">{step.label}</p>
                <div className="mt-3 overflow-x-auto rounded-2xl border border-mistral-black/10 bg-white ">
                  <SyntaxHighlighter
                    language={step.language}
                    style={oneLight}
                    customStyle={{
                      margin: 0,
                      padding: "1.25rem",
                      fontSize: "0.85rem",
                      background: "transparent",
                    }}
                    codeTagProps={{
                      style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
                    }}
                  >
                    {step.code}
                  </SyntaxHighlighter>
                </div>
                <p className="mt-2 text-sm text-mistral-black/75">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Props */}
        <section className="space-y-4">
          <header className="space-y-2">
            <h2 className="text-3xl font-semibold">MistralChatPanel props</h2>
            <p className="text-base text-mistral-black/70">
              Tune every surface. Use `classNames` when you need atomic control, or flip `unstyled` to supply your own
              design tokens.
            </p>
          </header>
          <div className="overflow-x-auto rounded-3xl border border-mistral-black/10 bg-white">
            <table className="min-w-full text-sm">
              <tbody>
                {panelProps.map(([prop, type, desc], index) => (
                  <tr key={prop} className={index === 0 ? "" : "border-t border-mistral-black/10"}>
                    <td className="px-4 py-3 font-mono text-xs text-mistral-orange">{prop}</td>
                    <td className="px-4 py-3 text-xs text-mistral-black/70">{type}</td>
                    <td className="px-4 py-3 text-sm">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        {/* Commands */}
        <section className="space-y-6">
          <header className="space-y-2">
            <h2 className="text-3xl font-semibold">Essential pnpm commands</h2>
            <p className="text-base text-mistral-black/70">Run from repo root unless specified.</p>
          </header>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-mistral-black/10 bg-white/90 p-6 space-y-3">
              <h3 className="text-lg font-semibold">Workspace root</h3>
              <ul className="text-sm text-mistral-black/80 space-y-2">
                <li><code className="font-mono text-mistral-black">pnpm -w dev</code> — Next.js dev server + library watch</li>
                <li><code className="font-mono text-mistral-black">pnpm -w build</code> — builds every workspace</li>
                <li><code className="font-mono text-mistral-black">pnpm -w lint</code> — ESLint across the monorepo</li>
                <li><code className="font-mono text-mistral-black">pnpm -w test</code> — runs Vitest suites (packages/ui)</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-mistral-black/10 bg-white/90 p-6 space-y-3">
              <h3 className="text-lg font-semibold">packages/ui</h3>
              <ul className="text-sm text-mistral-black/80 space-y-2">
                <li><code className="font-mono text-mistral-black">pnpm -C packages/ui dev</code> — tsup watch mode</li>
                <li><code className="font-mono text-mistral-black">pnpm -C packages/ui build</code> — emit `dist/` (ESM + d.ts)</li>
                <li><code className="font-mono text-mistral-black">pnpm -C packages/ui test</code> — Vitest + Testing Library</li>
                <li><code className="font-mono text-mistral-black">pnpm -C packages/ui typecheck</code> — `tsc --noEmit`</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-[40px] border border-mistral-black/10 bg-mistral-black text-mistral-beige p-10 space-y-4">
          <h2 className="text-3xl font-semibold">Ready to build?</h2>
          <p className="text-base text-mistral-beige/80">
            Clone the repo, install dependencies with pnpm, and start experimenting. Swap in your design system, wire up
            custom tools, or consume the hooks individually—mistral-kit stays unopinionated where it counts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/showcase"
              className="inline-flex items-center justify-center rounded-full bg-mistral-orange px-6 py-3 text-white font-semibold hover:bg-mistral-orange/90 transition-colors"
            >
              Play with the demo
            </Link>
            <a
              href="https://github.com/mattporteous/mistral-kit"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-mistral-beige/40 px-6 py-3 font-semibold hover:border-mistral-orange hover:text-mistral-orange transition-colors"
            >
              View source
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
