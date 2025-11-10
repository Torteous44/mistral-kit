import { useMemo } from "react";
import type { ToolDefinition } from "../types/chat";
import type { EmbeddedChunk } from "../types/rag";
import { createSemanticSearchTool } from "../utils/rag";

export type SemanticSearchToolOptions = {
  enabled?: boolean;
  chunks: EmbeddedChunk[];
  embedQuery: (text: string) => Promise<number[]>;
  contextChunksForGeneral?: number;
};

export type UseMistralToolsOptions = {
  baseTools?: ToolDefinition[];
  extraTools?: ToolDefinition[];
  semanticSearch?: SemanticSearchToolOptions;
};

export function useMistralTools(options: UseMistralToolsOptions = {}): ToolDefinition[] {
  const { baseTools = [], extraTools = [], semanticSearch } = options;

  return useMemo(() => {
    const toolset: ToolDefinition[] = [...baseTools, ...extraTools];

    if (
      semanticSearch &&
      semanticSearch.enabled !== false &&
      semanticSearch.chunks.length > 0 &&
      typeof semanticSearch.embedQuery === "function"
    ) {
      toolset.push(
        createSemanticSearchTool(semanticSearch.chunks, semanticSearch.embedQuery, {
          contextChunksForGeneral: semanticSearch.contextChunksForGeneral,
        })
      );
    }

    return toolset;
  }, [
    baseTools,
    extraTools,
    semanticSearch?.chunks,
    semanticSearch?.embedQuery,
    semanticSearch?.contextChunksForGeneral,
    semanticSearch?.enabled,
  ]);
}
