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

const sharedPanelProps = {
  baseTools: [...BASE_TOOLS],
  apiProxyUrl: "/api/mistral",
  embeddingsOptions: { apiProxyUrl: "/api/embeddings" },
  uploadOptions: { apiUrl: "/api/upload-text", maxFileSizeMB: 4 },
  semanticSearchOptions: { contextChunksForGeneral: 10 },
  systemPrompt: "You are an Assistant. You DO NOT have access to the internet. YOU DO NOT USE EMOJIS",
  promptPlaceholder: "Ask anything...",
} as const;

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

        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
          <MistralChatPanel
            className="flex-1"
            {...sharedPanelProps}
          />
        </div>
      </div>
    </div>
  );
}
