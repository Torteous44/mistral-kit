/** @jsxImportSource react */
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  MistralChatPanel,
  createWeatherTool,
  calculatorTool,
  dateTimeTool,
  type MistralChatPanelClassNames,
} from "@mistral/ui";

const weatherTool = createWeatherTool({ apiProxyUrl: "/api/weather" });
const BASE_TOOLS = [weatherTool, calculatorTool, dateTimeTool] as const;
const retroPanelClasses: MistralChatPanelClassNames = {
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
    "mb-3 w-fit items-center gap-3 rounded-2xl border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
  textarea:
    "h-auto w-full resize-none rounded-2xl border-none bg-transparent px-0 py-0 text-base font-mono text-black placeholder:text-black/60 focus:outline-none",
  controls: "flex flex-wrap items-center justify-between gap-3 pt-4",
  controlsUpload: "flex items-center",
  controlsSubmit: "ml-auto flex items-center",
  uploadButton:
    "flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] transition hover:bg-[#ffbf69]",
  submitButton:
    "flex items-center justify-center rounded-full border-2 border-black bg-black px-5 py-2 text-sm font-bold text-[#ffbf69] shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] transition hover:bg-[#ff9f1c] hover:text-black",
  toolError:
    "rounded-2xl border-2 border-black bg-[#ffccd5] px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
  embeddingsError:
    "rounded-2xl border-2 border-black bg-[#ffccd5] px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
  uploadStatus:
    "rounded-2xl border-2 border-black bg-[#cbf3f0] px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.7)]",
};

const synthwavePanelClasses: MistralChatPanelClassNames = {
  container:
    "flex h-full flex-col gap-4 rounded-[28px] border border-[#f72585] bg-gradient-to-b from-[#12001f] via-[#180033] to-[#050014] p-4 shadow-[0_0_40px_rgba(247,37,133,0.35)]",
  scrollArea: "flex-1 space-y-4 overflow-y-auto pr-1",
  messageList: "space-y-3",
  messageWrapper: "text-sm text-[#f5f5ff]",
  userBubble:
    "max-w-[80%] rounded-3xl border border-[#f72585]/40 bg-gradient-to-r from-[#f72585]/70 to-[#7209b7]/60 px-4 py-3 text-white shadow-[0_10px_25px_rgba(0,0,0,0.4)]",
  assistantBubble:
    "max-w-[80%] rounded-3xl border border-[#4cc9f0]/50 bg-[#1b0037]/80 px-4 py-3 text-[#d1d0ff]",
  prompt:
    "rounded-3xl border border-[#7209b7] bg-[#0c0016]/70 px-4 py-4 text-[#f5f5ff] shadow-[0_0_20px_rgba(114,9,183,0.45)]",
  textarea:
    "h-auto w-full resize-none border-none bg-transparent px-0 py-0 text-[#f5f5ff] placeholder:text-[#f5f5ff]/40 focus:outline-none",
  controls: "flex flex-wrap items-center justify-between gap-4 pt-4",
  controlsUpload: "flex items-center",
  controlsSubmit: "ml-auto flex items-center",
  uploadButton:
    "flex h-11 w-11 items-center justify-center rounded-full border border-[#f72585] bg-[#1b0037] text-[#f72585] shadow-[0_0_12px_rgba(247,37,133,0.6)]",
  submitButton:
    "flex items-center justify-center rounded-full bg-[#4361ee] px-6 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(67,97,238,0.7)] hover:bg-[#4895ef]",
  toolError:
    "rounded-2xl border border-[#f94144] bg-[#f94144]/15 px-3 py-2 text-sm text-[#ffd6d9]",
  embeddingsError:
    "rounded-2xl border border-[#f94144] bg-[#f94144]/15 px-3 py-2 text-sm text-[#ffd6d9]",
  uploadStatus:
    "rounded-2xl border border-[#4cc9f0]/40 bg-[#4cc9f0]/10 px-3 py-2 text-sm text-[#d1f7ff]",
};

const glassPanelClasses: MistralChatPanelClassNames = {
  container:
    "flex h-full flex-col gap-4 rounded-[28px] border border-white/30 bg-white/10 p-4 backdrop-blur-2xl shadow-[0_15px_35px_rgba(15,23,42,0.2)]",
  scrollArea: "flex-1 space-y-4 overflow-y-auto pr-2",
  messageList: "space-y-3",
  userBubble:
    "max-w-[80%] rounded-3xl border border-white/60 bg-white/50 px-4 py-3 text-slate-800 backdrop-blur",
  assistantBubble:
    "max-w-[80%] rounded-3xl border border-white/40 bg-white/20 px-4 py-3 text-white backdrop-blur",
  prompt:
    "rounded-3xl border border-white/30 bg-white/20 px-4 py-4 text-white backdrop-blur shadow-[0_10px_30px_rgba(15,23,42,0.25)]",
  textarea:
    "h-auto w-full resize-none border-none bg-transparent px-0 py-0 text-white placeholder:text-white/60 focus:outline-none",
  controls: "flex flex-wrap items-center justify-between gap-4 pt-4",
  controlsUpload: "flex items-center",
  controlsSubmit: "ml-auto flex items-center",
  uploadButton:
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/30 text-white backdrop-blur",
  submitButton:
    "flex items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 shadow-[0_5px_15px_rgba(15,23,42,0.25)]",
  toolError:
    "rounded-2xl border border-rose-200/40 bg-rose-50/40 px-3 py-2 text-sm text-rose-200",
  embeddingsError:
    "rounded-2xl border border-rose-200/40 bg-rose-50/40 px-3 py-2 text-sm text-rose-200",
  uploadStatus:
    "rounded-2xl border border-emerald-200/40 bg-emerald-50/40 px-3 py-2 text-sm text-emerald-100",
};

const terminalPanelClasses: MistralChatPanelClassNames = {
  container:
    "flex h-full flex-col gap-4 rounded-[22px] border border-[#00ff88]/40 bg-[#03170a] p-4 font-mono text-[#00ff88]",
  scrollArea: "flex-1 space-y-4 overflow-y-auto pr-2",
  messageList: "space-y-3",
  userBubble:
    "max-w-[80%] rounded-sm border border-[#00ff88] bg-[#042611] px-4 py-2 text-[#00ff88]",
  assistantBubble:
    "max-w-[80%] rounded-sm border border-[#00ff88]/70 bg-[#010c06] px-4 py-2 text-[#7affc7]",
  prompt:
    "rounded-md border border-[#00ff88] bg-black px-4 py-4 text-[#00ff88]",
  textarea:
    "h-auto w-full resize-none border-none bg-transparent px-0 py-0 text-[#00ff88] placeholder:text-[#00ff88]/40 focus:outline-none",
  controls: "flex flex-wrap items-center justify-between gap-3 pt-4 text-[#00ff88]",
  controlsUpload: "flex items-center",
  controlsSubmit: "ml-auto flex items-center",
  uploadButton:
    "flex h-11 w-11 items-center justify-center rounded-sm border border-[#00ff88] bg-transparent text-[#00ff88]",
  submitButton:
    "flex items-center justify-center rounded-sm border border-[#00ff88] bg-[#00ff88] px-5 py-2 text-sm font-bold text-black",
  toolError:
    "rounded-sm border border-[#ffb703] bg-[#2a1a00] px-3 py-2 text-sm text-[#ffb703]",
  embeddingsError:
    "rounded-sm border border-[#ffb703] bg-[#2a1a00] px-3 py-2 text-sm text-[#ffb703]",
  uploadStatus:
    "rounded-sm border border-[#00ff88]/60 bg-[#021207] px-3 py-2 text-sm text-[#00ff88]",
};

const notebookPanelClasses: MistralChatPanelClassNames = {
  container:
    "flex h-full flex-col gap-4 rounded-[26px] border border-[#1a1305]/10 bg-[#fffaf0] p-4 shadow-[6px_6px_0_0_rgba(26,19,5,0.2)]",
  scrollArea: "flex-1 space-y-4 overflow-y-auto pr-2",
  messageList: "space-y-3",
  messageWrapper: "text-sm text-[#2b2114]",
  userBubble:
    "max-w-[80%] rounded-[18px] border border-[#e0861a]/30 bg-[#fff0c7] px-4 py-3 text-[#2b2114]",
  assistantBubble:
    "max-w-[80%] rounded-[18px] border border-[#1a1305]/10 bg-white px-4 py-3 text-[#2b2114]",
  prompt:
    "rounded-[24px] border border-[#1a1305]/20 bg-[#fff5da] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(26,19,5,0.05)]",
  textarea:
    "h-auto w-full resize-none border-none bg-transparent px-0 py-0 font-serif text-base text-[#2b2114] placeholder:text-[#2b2114]/40 focus:outline-none",
  controls: "flex flex-wrap items-center justify-between gap-4 pt-4",
  controlsUpload: "flex items-center",
  controlsSubmit: "ml-auto flex items-center",
  uploadButton:
    "flex h-11 w-11 items-center justify-center rounded-full border border-[#2b2114]/20 bg-white text-[#2b2114]",
  submitButton:
    "flex items-center justify-center rounded-full bg-[#2b2114] px-5 py-2 text-sm font-semibold text-[#fff0c7]",
  toolError:
    "rounded-2xl border border-[#c1121f]/20 bg-[#c1121f]/10 px-3 py-2 text-sm text-[#7f121c]",
  embeddingsError:
    "rounded-2xl border border-[#c1121f]/20 bg-[#c1121f]/10 px-3 py-2 text-sm text-[#7f121c]",
  uploadStatus:
    "rounded-2xl border border-[#005f73]/20 bg-[#005f73]/10 px-3 py-2 text-sm text-[#0a4c5f]",
};

const auroraPanelClasses: MistralChatPanelClassNames = {
  container:
    "flex h-full flex-col gap-4 rounded-[28px] border border-transparent bg-gradient-to-br from-[#f9fafb] via-[#eef2ff] to-[#e0f4ff] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.18)]",
  scrollArea: "flex-1 space-y-4 overflow-y-auto pr-2",
  messageList: "space-y-3",
  userBubble:
    "max-w-[80%] rounded-3xl border border-white/30 bg-white text-slate-900 px-4 py-3 shadow-[0_15px_30px_rgba(15,23,42,0.1)]",
  assistantBubble:
    "max-w-[80%] rounded-3xl border border-[#e0f2fe] bg-white/80 px-4 py-3 text-slate-800 shadow-[0_15px_30px_rgba(59,130,246,0.15)]",
  prompt:
    "rounded-[26px] border border-white/60 bg-white/70 px-4 py-4 shadow-[0_20px_45px_rgba(15,23,42,0.25)] backdrop-blur",
  textarea:
    "h-auto w-full resize-none border-none bg-transparent px-0 py-0 text-slate-900 placeholder:text-slate-500 focus:outline-none",
  controls: "flex flex-wrap items-center justify-between gap-4 pt-4",
  controlsUpload: "flex items-center",
  controlsSubmit: "ml-auto flex items-center",
  uploadButton:
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.15)]",
  submitButton:
    "flex items-center justify-center rounded-full bg-gradient-to-r from-[#34d399] to-[#60a5fa] px-6 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(52,211,153,0.4)]",
  toolError:
    "rounded-2xl border border-[#f87171]/20 bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]",
  embeddingsError:
    "rounded-2xl border border-[#f87171]/20 bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]",
  uploadStatus:
    "rounded-2xl border border-[#34d399]/20 bg-[#ecfdf5] px-3 py-2 text-sm text-[#047857]",
};

const demoPanels = [
  {
    id: "default",
    title: "Modern Assistant",
    subtitle: "Stock theme",
    description: "Out-of-the-box @mistral/ui styling for instant drop-ins.",
    unstyled: false,
  },
  {
    id: "retro",
    title: "Pixel Wave Assistant",
    subtitle: "Retro demo",
    description: "Chunky borders, cassette hues, and playful mono text.",
    unstyled: true,
    classNames: retroPanelClasses,
  },
  {
    id: "synthwave",
    title: "Neon Pulse",
    subtitle: "Synthwave demo",
    description: "Glowing gradients inspired by arcades and outrun sunsets.",
    unstyled: true,
    classNames: synthwavePanelClasses,
  },
  {
    id: "glass",
    title: "Glass Aurora",
    subtitle: "Glassmorphism demo",
    description: "Frosted panels with subtle light leaks and airy spacing.",
    unstyled: true,
    classNames: glassPanelClasses,
  },
  {
    id: "terminal",
    title: "Console Operator",
    subtitle: "Terminal demo",
    description: "Monospace greens on charcoal for nostalgic hacking vibes.",
    unstyled: true,
    classNames: terminalPanelClasses,
  },
  {
    id: "notebook",
    title: "Field Notes",
    subtitle: "Paper demo",
    description: "Warm stationery textures with pen-and-ink accents.",
    unstyled: true,
    classNames: notebookPanelClasses,
  },
  {
    id: "aurora",
    title: "Aurora Studio",
    subtitle: "Gradient demo",
    description: "Featherweight gradients and glassy highlights for premium dashboards.",
    unstyled: true,
    classNames: auroraPanelClasses,
  },
];

const sharedPanelProps = {
  baseTools: [...BASE_TOOLS],
  apiProxyUrl: "/api/mistral",
  embeddingsOptions: { apiProxyUrl: "/api/embeddings" },
  uploadOptions: { apiUrl: "/api/upload-text", maxFileSizeMB: 4 },
  semanticSearchOptions: { contextChunksForGeneral: 5 },
} as const;

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-mistral-beige text-mistral-black">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-mistral-black/60">
          <Link
            href="/"
            className="rounded-full border border-mistral-black/30 px-4 py-1 text-xs tracking-[0.3em] text-mistral-black transition-colors hover:border-mistral-orange hover:text-mistral-orange"
          >
            <ArrowLeft />
          </Link>
          <span className="text-[0.6rem] tracking-[0.3em]">Showcase</span>
        </div>

        <div className="grid h-[calc(100vh-6rem)] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {demoPanels.map((panel) => (
            <section
              key={panel.id}
              className="flex flex-col gap-4 rounded-3xl border border-mistral-black/10 bg-white/70 p-4 shadow-[0_10px_25px_rgba(16,24,40,0.08)]"
            >
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-mistral-black/60">
                  {panel.subtitle}
                </p>
                <h2 className="text-2xl font-bold text-mistral-black">{panel.title}</h2>
                <p className="text-sm text-mistral-black/70">{panel.description}</p>
              </header>
              <MistralChatPanel
                className="flex-1"
                {...sharedPanelProps}
                unstyled={panel.unstyled}
                classNames={panel.classNames}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
