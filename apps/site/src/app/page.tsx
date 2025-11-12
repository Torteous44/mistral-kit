"use client";

import type { SVGProps } from "react";

import { Github } from "lucide-react";
import Link from "next/link";
import {
  MistralChat,
  createWeatherTool,
  calculatorTool,
  dateTimeTool,
  type MistralChatProps,
} from "@matthewporteous/mistral-kit";

function NpmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 128 128" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M2 38.5h124v43.71H64v7.29H36.44v-7.29H2zm6.89 36.43h13.78V53.07h6.89v21.86h6.89V45.79H8.89zm34.44-29.14v36.42h13.78v-7.28h13.78V45.79zm13.78 7.29H64v14.56h-6.89zm20.67-7.29v29.14h13.78V53.07h6.89v21.86h6.89V53.07h6.89v21.86h6.89V45.79z" />
    </svg>
  );
}

const weatherTool = createWeatherTool({ apiProxyUrl: "/api/weather" });
const baseTools = [weatherTool, calculatorTool, dateTimeTool];

const steps = [
  {
    label: "Install the kit",
    language: "bash",
    code: "npm i @matthewporteous/mistral-kit",
    body: "Works with pnpm, npm, or yarn. React 18+ and Next.js 13+ (App Router) supported.",
  },
  {
    label: "Scaffold secure routes",
    language: "bash",
    code: "npx mistral-kit init ",
    body: "Generates Edge-ready handlers for /api/mistral, /api/embeddings, /api/upload-text, /api/weather.",
  },
  {
    label: "Drop in the UI",
    language: "tsx",
    code: `"use client";

    import { MistralChat, defaultTools } from "@matthewporteous/mistral-kit";

    export default function Demo() {
      return (
        <main className="flex min-h-screen flex-col items-center justify-end bg-neutral-100 p-6">
          <section className="flex w-full max-w-4xl flex-col-reverse space-y-4-reverse mb-8 h-[80vh] overflow-hidden">
            <MistralChat
              apiProxyUrl="/api/mistral"
              embeddingsOptions={{ apiProxyUrl: "/api/embeddings" }}
              uploadOptions={{ apiUrl: "/api/upload-text", maxFileSizeMB: 4 }}
              semanticSearchOptions={{ contextChunksForGeneral: 8 }}
              baseTools={defaultTools}
              promptPlaceholder="Ask anything..."
              systemPrompt="You are an expert AI assistant that combines precision, clarity, and initiative. Keep your tone confident, succinct, and helpful. like a world-class analyst who gets straight to the point. No emojis."
            />
          </section>
        </main>
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



export default function Home() {
  return (
    <div className="min-h-screen bg-white text-mistral-black selection:bg-mistral-orange selection:text-white">
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <section className="space-y-8 py-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-medium tracking-tight">mistral-kit</h1>
            <p className="text-sm text-mistral-black/60 max-w-2xl leading-relaxed">
              Ready-made chat components for Mistral AI. Drop in the full UI or build your own with
                headless hooks. Includes secure API proxies and common features like streaming, tool calling,
                 and document search.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://www.npmjs.com/package/@matthewporteous/mistral-kit"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-mistral-black/80 hover:text-mistral-orange transition-colors"
            >
              <NpmIcon className="h-4 w-4" />
              <span>@matthewporteous/mistral-kit</span>
            </a>
            <span className="text-mistral-black/30">·</span>
            <a
              href="https://github.com/torteous44/mistral-kit"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-mistral-black/80 hover:text-mistral-orange transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>View source</span>
            </a>
          </div>

          <div className="overflow-hidden rounded-lg border border-mistral-black/10">
            <video
              className="w-full"
              src="/tutorial.MOV"
              controls
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </section>

        {/* Getting Started */}
        <section className="space-y-12 py-16 border-t border-mistral-black/10">
          <div className="space-y-2">
            <h2 className="text-2xl font-medium">Getting started</h2>
            <p className="text-xs text-mistral-black/60">Four steps to production-ready AI chat</p>
          </div>

          <ol className="space-y-10">
            {steps.map((step, index) => (
              <li key={step.label} className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-medium text-mistral-orange tabular-nums">{index + 1}</span>
                  <h3 className="text-sm font-medium">{step.label}</h3>
                </div>
                <div className="overflow-x-auto rounded border border-mistral-black/10 bg-[#fafafa]">
                  <pre className="m-0 p-4 text-xs leading-relaxed">
                    <code className="font-mono text-mistral-black">
                      {step.code}
                    </code>
                  </pre>
                </div>
                <p className="text-xs text-mistral-black/60 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Showcase */}
        <section className="space-y-12 py-16 border-t border-mistral-black/10">
          <div className="space-y-2">
            <h2 className="text-2xl font-medium">Style to fit your product</h2>
            <p className="text-xs text-mistral-black/60 leading-relaxed max-w-2xl">
              Same component, different props. Customize colors, borders, spacing, and system prompts to match your design system.
            </p>
          </div>

          <div className="space-y-16">
            {/* Default */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Default</h3>
                <p className="text-xs text-mistral-black/60">Out of the box—no custom styling</p>
              </div>
              <div className="relative h-[500px] rounded-lg border border-mistral-black/10 overflow-hidden flex">
                <div className="absolute -right-10 top-8 z-10 w-40 rotate-45 bg-mistral-orange py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                  Try me
                </div>
                <MistralChat
                  apiProxyUrl="/api/mistral"
                  embeddingsOptions={{ apiProxyUrl: "/api/embeddings" }}
                  uploadOptions={{ apiUrl: "/api/upload-text", maxFileSizeMB: 4 }}
                  baseTools={baseTools}
                  promptPlaceholder="Ask anything..."
                  classNames={{
                    container: "flex h-full w-full flex-col p-6",
                    promptWrapper: "pt-4 flex-shrink-0",
                  }}
                />
              </div>
            </div>

            {/* Minimal */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Minimal</h3>
                <p className="text-xs text-mistral-black/60">Clean lines, subtle borders, maximum breathing room</p>
              </div>
              <div className="relative h-[500px] rounded-lg border border-mistral-black/5 overflow-hidden bg-white flex">
                <div className="absolute -right-10 top-8 z-10 w-40 rotate-45 bg-mistral-orange py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                  Try me
                </div>
                <MistralChat
                  apiProxyUrl="/api/mistral"
                  baseTools={baseTools}
                  promptPlaceholder="Type a message..."
                  classNames={{
                    container: "flex h-full w-full flex-col bg-white p-6",
                    scrollArea: "absolute inset-0 space-y-4 overflow-y-auto",
                    messageList: "space-y-6",
                    promptWrapper: "pt-4 flex-shrink-0",
                    userBubble: "max-w-[85%] rounded-2xl bg-mistral-black/5 px-4 py-3 text-sm text-mistral-black",
                    assistantBubble: "max-w-[85%] rounded-2xl border border-mistral-black/10 bg-white px-4 py-3 text-sm text-mistral-black",
                    prompt: "border-t border-mistral-black/10 bg-white pt-4",
                    textarea: "w-full resize-none bg-transparent text-sm text-mistral-black placeholder:text-mistral-black/40 focus:outline-none",
                    controls: "mt-3 flex items-center justify-end gap-2",
                    submitButton: "rounded-lg bg-mistral-black px-4 py-2 text-xs font-medium text-white hover:bg-mistral-black/90",
                  }}
                />
              </div>
            </div>

            {/* Bold */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Bold</h3>
                <p className="text-xs text-mistral-black/60">High contrast, thick borders, strong shadows—with custom tool styling</p>
              </div>
              <div className="relative h-[500px] rounded-lg overflow-hidden flex">
                <div className="absolute -right-10 top-8 z-10 w-40 rotate-45 bg-mistral-orange py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                  Try me
                </div>
                <MistralChat
                  apiProxyUrl="/api/mistral"
                  baseTools={baseTools}
                  promptPlaceholder="What's on your mind?"
                  classNames={{
                    container: "flex h-full w-full flex-col bg-[#fff9e6] p-6",
                    scrollArea: "absolute inset-0 space-y-4 overflow-y-auto pr-2",
                    messageList: "space-y-4",
                    promptWrapper: "pt-4 flex-shrink-0",
                    userBubble: "max-w-[80%] rounded-2xl border-2 border-mistral-black bg-mistral-orange px-5 py-3 text-sm font-medium text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                    assistantBubble: "max-w-[80%] rounded-2xl border-2 border-mistral-black bg-white px-5 py-3 text-sm text-mistral-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                    prompt: "rounded-2xl border-2 border-mistral-black bg-white p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                    textarea: "w-full resize-none bg-transparent text-sm text-mistral-black placeholder:text-mistral-black/50 focus:outline-none",
                    controls: "mt-3 flex items-center justify-end gap-2",
                    uploadButton: "flex h-10 w-10 items-center justify-center rounded-full border-2 border-mistral-black bg-white text-mistral-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-mistral-orange hover:text-white",
                    submitButton: "rounded-full border-2 border-mistral-black bg-mistral-orange px-5 py-2 text-xs font-bold text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)]",
                    toolContainer: "w-full",
                    toolTrigger: "w-full rounded-xl border-2 border-mistral-black bg-white px-4 py-3 text-left shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ffe8a1] cursor-pointer",
                    toolName: "text-sm font-bold text-mistral-black",
                    toolBadge: "text-xs font-bold text-mistral-orange",
                  }}
                />
              </div>
            </div>

            {/* Dark */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Dark</h3>
                <p className="text-xs text-mistral-black/60">Terminal aesthetic with cyan accents and fade effect</p>
              </div>
              <div className="relative h-[500px] rounded-lg overflow-hidden bg-[#0a0a0a] flex">
                <div className="absolute -right-10 top-8 z-10 w-40 rotate-45 bg-mistral-orange py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                  Try me
                </div>
                <MistralChat
                  apiProxyUrl="/api/mistral"
                  baseTools={baseTools}
                  promptPlaceholder="Enter command..."
                  systemPrompt="You are a technical assistant. Keep responses concise and precise."
                  classNames={{
                    container: "flex h-full w-full flex-col bg-[#0a0a0a] p-6",
                    scrollArea: "absolute inset-0 space-y-4 overflow-y-auto pr-2",
                    messageList: "space-y-4",
                    messageWrapper: "font-mono text-xs",
                    promptWrapper: "pt-4 flex-shrink-0",
                    userBubble: "max-w-[85%] rounded-lg bg-[#1a1a1a] border border-cyan-500/30 px-4 py-3 text-cyan-400",
                    assistantBubble: "max-w-[85%] rounded-lg bg-[#1a1a1a] border border-white/10 px-4 py-3 text-gray-300",
                    prompt: "rounded-lg border border-white/10 bg-[#1a1a1a] p-4",
                    textarea: "w-full resize-none bg-transparent font-mono text-xs text-gray-300 placeholder:text-gray-600 focus:outline-none",
                    controls: "mt-3 flex items-center justify-end gap-2",
                    uploadButton: "rounded border border-white/20 bg-white/5 px-4 py-2 text-xs text-cyan-400 hover:bg-white/10",
                    submitButton: "rounded bg-cyan-500 px-4 py-2 font-mono text-xs font-semibold text-black hover:bg-cyan-400",
                    toolTrigger: "w-full rounded border border-cyan-500/30 bg-[#1a1a1a] px-3 py-2 text-left font-mono hover:bg-[#252525] cursor-pointer",
                    toolName: "text-xs font-medium text-cyan-400",
                    toolBadge: "text-[10px] text-gray-500",
                  }}
                />
              </div>
            </div>

            {/* Soft */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Soft</h3>
                <p className="text-xs text-mistral-black/60">Gentle gradients and rounded corners</p>
              </div>
              <div className="relative h-[500px] rounded-2xl overflow-hidden flex">
                <div className="absolute -right-10 top-8 z-10 w-40 rotate-45 bg-mistral-orange py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                  Try me
                </div>
                <MistralChat
                  apiProxyUrl="/api/mistral"
                  baseTools={baseTools}
                  promptPlaceholder="How can I help?"
                  classNames={{
                    container: "flex h-full w-full flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6",
                    scrollArea: "absolute inset-0 space-y-4 overflow-y-auto pr-2",
                    messageList: "space-y-4",
                    promptWrapper: "pt-4 flex-shrink-0",
                    userBubble: "max-w-[80%] rounded-3xl bg-gradient-to-br from-purple-400 to-pink-400 px-5 py-3 text-sm text-white shadow-sm",
                    assistantBubble: "max-w-[80%] rounded-3xl bg-white/80 backdrop-blur px-5 py-3 text-sm text-gray-800 shadow-sm",
                    prompt: "rounded-3xl bg-white/80 backdrop-blur p-4 shadow-sm",
                    textarea: "w-full resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none",
                    controls: "mt-3 flex items-center justify-end gap-2",
                    uploadButton: "flex h-10 w-10 items-center justify-center rounded-full border border-purple-300 bg-white/50 text-purple-600 shadow-sm hover:bg-purple-100 disabled:opacity-40",
                    submitButton: "rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:from-purple-600 hover:to-pink-600",
                  }}
                />
              </div>
            </div>

            {/* Compact */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Compact</h3>
                <p className="text-xs text-mistral-black/60">Dense layout for sidebar or widget use</p>
              </div>
              <div className="relative h-[500px] rounded-lg overflow-hidden bg-gray-50 flex">
                <div className="absolute -right-10 top-8 z-10 w-40 rotate-45 bg-mistral-orange py-1 text-center text-[9px] font-bold uppercase tracking-wider text-white">
                  Try me
                </div>
                <MistralChat
                  apiProxyUrl="/api/mistral"
                  baseTools={baseTools}
                  promptPlaceholder="Ask..."
                  classNames={{
                    container: "flex h-full w-full flex-col bg-gray-50 p-3",
                    scrollArea: "absolute inset-0 space-y-2 overflow-y-auto pr-1",
                    messageList: "space-y-2",
                    messageWrapper: "text-xs",
                    promptWrapper: "pt-2 flex-shrink-0",
                    userBubble: "max-w-[90%] rounded-xl bg-blue-500 px-3 py-2 text-white",
                    assistantBubble: "max-w-[90%] rounded-xl bg-white px-3 py-2 text-gray-800 shadow-sm",
                    prompt: "border-t border-gray-200 bg-gray-50 pt-2",
                    textarea: "w-full resize-none bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none",
                    controls: "mt-2 flex items-center justify-end gap-1",
                    uploadButton: "flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-blue-500 hover:bg-blue-50 disabled:opacity-40",
                    submitButton: "rounded bg-blue-500 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-blue-600",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-mistral-black/10">
            <p className="text-xs text-mistral-black/60 leading-relaxed">
              Every example uses the same <span className="font-mono text-mistral-black">&lt;MistralChat&gt;</span> component with different{" "}
              <span className="font-mono text-mistral-black">classNames</span> and props. Mix and match to build your perfect chat experience.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
