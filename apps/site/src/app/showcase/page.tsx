/** @jsxImportSource react */
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  MistralChat,
  createWeatherTool,
  calculatorTool,
  dateTimeTool,
  type MistralChatProps,
  type ToolDefinition,
} from "@matthewporteous/mistral-kit";

const weatherTool = createWeatherTool({ apiProxyUrl: "/api/weather" });
const BASE_TOOLS = [weatherTool, calculatorTool, dateTimeTool] as const;

const basePanelConfig: Partial<MistralChatProps> = {
  apiProxyUrl: "/api/mistral",
  embeddingsOptions: { apiProxyUrl: "/api/embeddings" },
  uploadOptions: { apiUrl: "/api/upload-text", maxFileSizeMB: 4 },
  semanticSearchOptions: { contextChunksForGeneral: 10 },
  baseTools: [...BASE_TOOLS] as ToolDefinition[],
  promptPlaceholder: "Ask anything...",
};

type ShowcaseVariant = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  containerClassName: string;
  badgeClassName: string;
  panelClassName: string;
  panelOverrides: Partial<MistralChatProps>;
};

const variantClassNames: Record<string, NonNullable<MistralChatProps["classNames"]>> = {
  support: {
    container:
      "flex h-full flex-col gap-4 rounded-[32px] border border-black bg-[#fdf3d7] p-4 shadow-[8px_8px_0_0_#000]",
    scrollArea: "flex-1 space-y-4 overflow-y-auto pr-2",
    messageList: "space-y-3",
    messageWrapper: "text-sm font-mono tracking-tight",
    userBubble:
      "max-w-[80%] rounded-[18px] border-2 border-black bg-[#ff9f1c] px-4 py-3 text-black shadow-[4px_4px_0_0_rgba(0,0,0,0.7)]",
    assistantBubble:
      "max-w-[80%] rounded-[18px] border-2 border-black bg-white px-4 py-3 text-[#2b1b17] shadow-[4px_4px_0_0_rgba(0,0,0,0.7)]",
    messageAttachmentUser:
      "mb-3 rounded-xl border-2 border-black bg-[#ffbf69] px-3 py-2 text-xs font-semibold tracking-tight last:mb-3 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
    messageAttachmentAssistant:
      "mb-3 rounded-xl border-2 border-black bg-[#cbf3f0] px-3 py-2 text-xs font-semibold tracking-tight last:mb-3 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
    messageAttachmentBadge: "flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.3em]",
    messageAttachmentFilename: "mt-1 text-sm font-bold",
    messageAttachmentMeta: "text-[0.65rem]",
    prompt:
      "rounded-3xl border-2 border-black bg-[#ffe8a1] px-4 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,0.7)]",
    attachmentPreview:
      "mb-3 flex w-fit items-center gap-3 rounded-2xl border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
    textarea:
      "h-auto w-full resize-none rounded-2xl border-none bg-transparent px-0 py-0 text-base font-mono text-black placeholder:text-black/60 focus:outline-none",
    controls: "flex flex-wrap items-center justify-between gap-3 pt-4",
    controlsUpload: "flex items-center",
    controlsSubmit: "ml-auto flex items-center",
    uploadButton:
      "flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] transition hover:bg-[#ffbf69]",
    submitButton:
      "flex items-center justify-center rounded-full border-2 border-black bg-black px-4 py-4 text-sm font-bold text-[#ffbf69] shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] transition hover:bg-[#ff9f1c] hover:text-black",
    toolError:
      "rounded-2xl border-2 border-black bg-[#ffccd5] px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
    embeddingsError:
      "rounded-2xl border-2 border-black bg-[#ffccd5] px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
  },
  devops: {
    container: "flex h-full flex-col rounded-3xl border border-white/10 bg-[#0d1424] p-4 text-white",
    scrollArea: "flex-1 space-y-4 overflow-y-auto pr-2",
    messageList: "space-y-3",
    userBubble: "max-w-[80%] rounded-2xl bg-[#020617] px-4 py-3 text-[#a5f3fc] border border-[#0ea5e9]/40",
    assistantBubble: "max-w-[80%] rounded-2xl bg-[#111827] px-4 py-3 text-white border border-white/10",
    prompt: "rounded-2xl border border-white/10 bg-[#020617] px-4 py-4",
    textarea: "w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none",
    controls: "mt-3 flex items-center justify-between",
    uploadButton: "rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide",
    submitButton: "rounded-full bg-[#0ea5e9] px-5 py-2 text-sm font-semibold text-[#0f172a]",
  },
  product: {
    container: "flex h-full flex-col rounded-3xl border border-[#c4b5fd] bg-white/90 p-4",
    userBubble: "max-w-[75%] rounded-3xl bg-[#f3e8ff] px-4 py-3 text-[#6b21a8]",
    assistantBubble: "max-w-[75%] rounded-3xl bg-white px-4 py-3 text-[#312e81] border border-[#c4b5fd]",
    prompt: "rounded-3xl border border-[#c4b5fd] bg-white px-4 py-4",
    textarea: "w-full bg-transparent text-sm text-[#312e81] placeholder:text-[#6b21a8]/60 focus:outline-none",
    submitButton: "rounded-full bg-[#6d28d9] px-5 py-2 text-sm font-semibold text-white",
  },
  legal: {
    container: "flex h-full flex-col rounded-3xl border border-[#d6d3d1] bg-[#f9f7f4] p-4",
    userBubble: "max-w-[70%] rounded-2xl bg-white px-4 py-3 text-[#111] border border-[#d6d3d1] font-serif",
    assistantBubble: "max-w-[70%] rounded-2xl bg-[#e7e5e4] px-4 py-3 text-[#1c1917] font-serif",
    prompt: "rounded-2xl border border-[#d6d3d1] bg-white px-4 py-4",
    textarea: "w-full bg-transparent text-sm font-serif text-[#1c1917] focus:outline-none",
    submitButton: "rounded-full bg-[#1c1917] px-5 py-2 text-sm font-semibold text-[#fef3c7]",
  },
  analytics: {
    container: "flex h-full flex-col rounded-3xl border border-[#cbd5f5] bg-[#eff4ff] p-4",
    userBubble: "max-w-[75%] rounded-2xl bg-white px-4 py-3 text-[#0f172a] border border-[#dbeafe]",
    assistantBubble: "max-w-[75%] rounded-2xl bg-[#dbeafe] px-4 py-3 text-[#1d4ed8]",
    prompt: "rounded-2xl border border-[#cbd5f5] bg-white px-4 py-4",
    textarea: "w-full bg-transparent text-sm text-[#0f172a] focus:outline-none",
    submitButton: "rounded-full bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white",
  },
  creative: {
    container: "flex h-full flex-col rounded-3xl border border-[#f472b6] bg-gradient-to-br from-[#ffe4ef] via-white to-[#fdf2f8] p-4",
    userBubble: "max-w-[75%] rounded-[24px] bg-[#f472b6] px-4 py-3 text-white shadow-lg",
    assistantBubble: "max-w-[75%] rounded-[24px] bg-white/80 px-4 py-3 text-[#be185d] shadow-lg",
    prompt: "rounded-[24px] border border-[#f472b6]/40 bg-white px-4 py-4 shadow-lg",
    textarea: "w-full bg-transparent text-base text-[#be185d] placeholder:text-[#be185d]/50 focus:outline-none",
    submitButton: "rounded-full bg-[#be185d] px-6 py-2 text-sm font-semibold text-white shadow",
  },
  finance: {
    container: "flex h-full flex-col rounded-3xl border border-[#064e3b]/20 bg-white p-4",
    userBubble: "max-w-[75%] rounded-2xl bg-[#bbf7d0] px-4 py-3 text-[#064e3b]",
    assistantBubble: "max-w-[75%] rounded-2xl bg-[#ecfccb] px-4 py-3 text-[#14532d]",
    prompt: "rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-4",
    textarea: "w-full bg-transparent text-sm text-[#064e3b] focus:outline-none",
    submitButton: "rounded-full bg-[#047857] px-5 py-2 text-sm font-semibold text-white",
  },
  research: {
    container: "flex h-full flex-col rounded-[28px] border border-[#a8a29e] bg-[#fdfcf7] p-4",
    userBubble: "max-w-[80%] rounded-xl bg-white px-4 py-3 font-serif text-[#1c1917] shadow-sm",
    assistantBubble: "max-w-[80%] rounded-xl bg-[#f5f5f4] px-4 py-3 font-serif text-[#292524] shadow-sm",
    messageWrapper: "text-[0.95rem] leading-relaxed",
    prompt: "rounded-[22px] border border-[#d6d3d1] bg-white px-4 py-4",
    textarea: "w-full bg-transparent text-[0.95rem] font-serif text-[#1c1917] focus:outline-none",
    submitButton: "rounded-full bg-[#292524] px-5 py-2 text-sm font-semibold text-[#f5f5f4]",
  },
  coach: {
    container: "flex h-full flex-col rounded-3xl border border-[#fde047] bg-[#fff9db] p-4",
    userBubble: "max-w-[75%] rounded-3xl bg-white px-4 py-3 text-[#854d0e] border border-[#fed7aa]",
    assistantBubble: "max-w-[75%] rounded-3xl bg-[#fef9c3] px-4 py-3 text-[#713f12]",
    prompt: "rounded-3xl border border-[#fde047] bg-white px-4 py-4",
    textarea: "w-full bg-transparent text-base text-[#713f12] focus:outline-none",
    submitButton: "rounded-full bg-[#fbbf24] px-5 py-2 text-sm font-semibold text-white",
  },
  executive: {
    container: "flex h-full flex-col rounded-3xl border border-[#e5e7eb] bg-white p-4",
    userBubble: "max-w-[75%] rounded-2xl bg-[#0f172a] px-4 py-3 text-white",
    assistantBubble: "max-w-[75%] rounded-2xl bg-[#f9fafb] px-4 py-3 text-[#0f172a] border border-[#e5e7eb]",
    prompt: "rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-4",
    textarea: "w-full bg-transparent text-sm text-[#0f172a] focus:outline-none",
    submitButton: "rounded-full bg-[#0f172a] px-5 py-2 text-sm font-semibold text-white",
  },
};

const showcaseVariants: ShowcaseVariant[] = [
  {
    id: "support",
    title: "Support Copilot",
    subtitle: "Docs-grounded triage",
    description: "Routes incidents, references uploaded runbooks, and escalates with clear repro steps.",
    containerClassName: "border-mistral-orange/30 bg-white/95 shadow-lg",
    badgeClassName: "bg-mistral-orange/10 text-mistral-orange",
    panelClassName: "flex-1 rounded-2xl border border-mistral-black/5 bg-white/90 p-4",
    panelOverrides: {
      systemPrompt:
        "You are a tier-2 support engineer. Diagnose issues using conversation history, uploaded troubleshooting guides, and registered tools. Surface precise next steps, include relevant log snippets, and never invent capabilities you do not have.",
      semanticSearchOptions: { contextChunksForGeneral: 12 },
      promptPlaceholder: "Describe the customer issue...",
      classNames: variantClassNames.support,
    },
  },
  {
    id: "devops",
    title: "Ops Runbook",
    subtitle: "Fast incident response",
    description: "Turns alerts into actionable remediation plans using weather + calculator tools when needed.",
    containerClassName: "border-[#0F172A]/20 bg-[#0F172A] text-white",
    badgeClassName: "bg-white/10 text-white",
    panelClassName: "flex-1 rounded-2xl border border-white/10 bg-[#0D1424] p-4",
    panelOverrides: {
      systemPrompt:
        "You are a site reliability engineer. Reference existing runbooks before suggesting anything else. Output numbered remediation steps and call out required tooling explicitly. No emojis.",
      promptPlaceholder: "Alert details, service, or log snippet...",
      semanticSearchOptions: { contextChunksForGeneral: 8 },
      classNames: variantClassNames.devops,
    },
  },
  {
    id: "product",
    title: "Product Strategist",
    subtitle: "Requirements co-pilot",
    description: "Helps PMs turn research into crisp PRDs and opportunity trees.",
    containerClassName: "border-[#4C1D95]/20 bg-gradient-to-br from-[#F5F3FF] to-white",
    badgeClassName: "bg-[#4C1D95]/10 text-[#4C1D95]",
    panelClassName: "flex-1 rounded-2xl border border-[#4C1D95]/10 bg-white p-4",
    panelOverrides: {
      systemPrompt:
        "You are a product strategist. Ask clarifying questions, synthesize insights, and output structured recommendations with trade-offs. Keep responses concise and prioritized.",
      baseTools: [...BASE_TOOLS] as ToolDefinition[],
      enableUploads: true,
      promptPlaceholder: "Outline user pain or insight...",
      classNames: variantClassNames.product,
    },
  },
  {
    id: "legal",
    title: "Contract Reviewer",
    subtitle: "Risk & clause extraction",
    description: "Highlights obligations and negotiable clauses from uploaded agreements.",
    containerClassName: "border-[#0D9488]/30 bg-white",
    badgeClassName: "bg-[#0D9488]/10 text-[#0D9488]",
    panelClassName: "flex-1 rounded-2xl border border-[#0D9488]/20 bg-white p-4",
    panelOverrides: {
      systemPrompt:
        "You are a meticulous legal analyst. Extract obligations, renewal terms, liabilities, and negotiation levers. Quote exact wording when referencing contract clauses.",
      uploadOptions: { apiUrl: "/api/upload-text", maxFileSizeMB: 8 },
      semanticSearchOptions: { contextChunksForGeneral: 6 },
      promptPlaceholder: "Paste a clause or question about the contract...",
      classNames: variantClassNames.legal,
    },
  },
  {
    id: "analytics",
    title: "Data Analyst",
    subtitle: "Narratives from metrics",
    description: "Turns metrics into narratives, combining calculator + reasoning.",
    containerClassName: "border-[#2563EB]/20 bg-[#EFF6FF]",
    badgeClassName: "bg-[#2563EB]/10 text-[#2563EB]",
    panelClassName: "flex-1 rounded-2xl border border-white bg-white p-4",
    panelOverrides: {
      systemPrompt:
        "You are a data analyst. Translate metrics into insights, run quick calculations, and present takeaways with bullet points and follow-up hypotheses.",
      promptPlaceholder: "Share metrics or ask for a breakdown...",
      baseTools: [...BASE_TOOLS] as ToolDefinition[],
      classNames: variantClassNames.analytics,
    },
  },
  {
    id: "creative",
    title: "Creative Director",
    subtitle: "Concept exploration",
    description: "Generates concept boards and tone explorations—no tools, just pure ideation.",
    containerClassName: "border-[#DB2777]/20 bg-gradient-to-br from-white to-[#FFF1F2]",
    badgeClassName: "bg-[#DB2777]/10 text-[#DB2777]",
    panelClassName: "flex-1 rounded-2xl border border-[#DB2777]/20 bg-white p-4",
    panelOverrides: {
      baseTools: [],
      enableUploads: false,
      semanticSearchOptions: { enabled: false },
      systemPrompt:
        "You are a creative director exploring brand concepts. Provide mood options, references, and bold ideas. Focus on tone, texture, and emotional resonance.",
      promptPlaceholder: "Describe the mood or campaign brief...",
      classNames: variantClassNames.creative,
    },
  },
  {
    id: "finance",
    title: "Finance Partner",
    subtitle: "Scenario planning",
    description: "Combines calculator + structured reasoning for scenario modeling.",
    containerClassName: "border-[#14532D]/20 bg-[#F0FDF4]",
    badgeClassName: "bg-[#14532D]/10 text-[#14532D]",
    panelClassName: "flex-1 rounded-2xl border border-[#14532D]/20 bg-white p-4",
    panelOverrides: {
      systemPrompt:
        "You are a strategic finance partner. Build quick projections, call out assumptions, and suggest next checks. Use calculator results for precision.",
      promptPlaceholder: "Share revenue, cost, or scenario inputs...",
      classNames: variantClassNames.finance,
    },
  },
  {
    id: "research",
    title: "Research Synthesizer",
    subtitle: "Longform → insight bursts",
    description: "Ingests reports and outputs crisp insight stacks with sources.",
    containerClassName: "border-[#1D4ED8]/30 bg-white",
    badgeClassName: "bg-[#1D4ED8]/10 text-[#1D4ED8]",
    panelClassName: "flex-1 rounded-2xl border border-[#1D4ED8]/20 bg-white p-4",
    panelOverrides: {
      systemPrompt:
        "You are a research synthesizer. Boil long documents into key insights, cite uploaded chunks, and suggest follow-up questions.",
      semanticSearchOptions: { contextChunksForGeneral: 14 },
      promptPlaceholder: "Drop a question about your research packet...",
      classNames: variantClassNames.research,
    },
  },
  {
    id: "coach",
    title: "Learning Coach",
    subtitle: "Explain like I'm curious",
    description: "Guides learners through new topics with analogies and exercises.",
    containerClassName: "border-[#BE123C]/20 bg-[#FFF1F2]",
    badgeClassName: "bg-[#BE123C]/10 text-[#BE123C]",
    panelClassName: "flex-1 rounded-2xl border border-white bg-white p-4",
    panelOverrides: {
      baseTools: [],
      enableUploads: false,
      semanticSearchOptions: { enabled: false },
      systemPrompt:
        "You are a patient learning coach. Meet people where they are, explain with analogies, and propose mini-exercises. Confirm understanding before moving on.",
      promptPlaceholder: "Ask a “teach me like…” question...",
      classNames: variantClassNames.coach,
    },
  },
  {
    id: "executive",
    title: "Executive Briefing",
    subtitle: "Board-ready summaries",
    description: "Turns sprawling threads into crisp exec digests with clear asks.",
    containerClassName: "border-[#0F172A]/15 bg-white",
    badgeClassName: "bg-[#0F172A]/10 text-[#0F172A]",
    panelClassName: "flex-1 rounded-2xl border border-[#0F172A]/15 bg-white p-4",
    panelOverrides: {
      systemPrompt:
        "You are a chief of staff summarizing discussions for executives. Deliver TL;DRs with measurable outcomes, blockers, and explicit asks.",
      promptPlaceholder: "Paste meeting notes or describe the thread...",
      classNames: variantClassNames.executive,
    },
  },
];

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-mistral-beige text-mistral-black">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-mistral-black/60">
          <Link
            href="/"
            className="rounded-full  px-1 py-1 text-xs tracking-[0.3em] text-mistral-black transition-colors hover:text-mistral-orange"
          >
            <ArrowLeft width={18}/>
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-mistral-black/60">Showcase</p>
            <h1 className="mt-2 text-4xl font-semibold">10 design + prompt presets</h1>
            <p className="mt-2 text-base text-mistral-black/70">
              Each panel reuses the same primitives with different props, styles, and prompts. Mix-and-match to fit your
              product.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {showcaseVariants.map((variant) => {
              const panelProps = {
                ...basePanelConfig,
                ...variant.panelOverrides,
              } as MistralChatProps;

              return (
                <section
                  key={variant.id}
                  className={`flex min-h-[32rem] flex-col gap-4 rounded-[32px] border p-6 ${variant.containerClassName}`}
                >
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variant.badgeClassName}`}>
                      {variant.subtitle}
                    </span>
                    <h2 className="mt-3 text-2xl font-semibold">{variant.title}</h2>
                    <p className="mt-2 text-sm text-current/80">{variant.description}</p>
                  </div>
                  <MistralChat className={variant.panelClassName} {...panelProps} />
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
