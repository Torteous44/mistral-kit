import type { ToolDefinition } from "../types/chat";
import type { EmbeddedChunk } from "../types/rag";
import { cosineSimilarity } from "./similarity";

// Keywords that indicate general/summary queries
const GENERAL_QUERY_PATTERNS = [
  /^(what|what's|whats)\s+(is\s+)?this(\s+about)?/i,
  /^(give|provide|show|tell)\s+me\s+a\s+(summary|overview|brief|synopsis)/i,
  /^(summarize|summarise|analyze|analyse)/i,
  /^(explain|describe)\s+(this|the\s+document|the\s+content)/i,
  /^(what\s+)?(does|is)\s+(this|the\s+document|it)\s+(about|say|contain)/i,
  /^(get|show|return)\s+(all|full|entire)\s+(content|document|text)/i,
];

/**
 * Creates a semantic search tool from embedded document chunks.
 * This tool performs similarity search against the provided chunks using embeddings.
 *
 * Intelligently handles general queries (e.g., "summarize this", "what's this about?")
 * by returning initial chunks instead of semantic search, since general query words
 * may not appear in the document content.
 *
 * @param chunks - Array of embedded text chunks to search
 * @param embedQuery - Function to embed the search query
 * @param options - Optional configuration
 * @param options.contextChunksForGeneral - Number of chunks to return for general queries (default: 5)
 * @returns A ToolDefinition that can be used with useToolExecutor
 *
 * @example
 * ```tsx
 * const chunks = [...]; // Your embedded chunks
 * const { embed } = useEmbeddings();
 * const embedQuery = async (text: string) => {
 *   const result = await embed(text);
 *   return result[0]?.embedding ?? [];
 * };
 * const searchTool = createSemanticSearchTool(chunks, embedQuery);
 * ```
 */
export function createSemanticSearchTool(
  chunks: EmbeddedChunk[],
  embedQuery: (text: string) => Promise<number[]>,
  options: { contextChunksForGeneral?: number } = {}
): ToolDefinition {
  const { contextChunksForGeneral = 5 } = options;

  return {
    name: "search_docs",
    description: "Search and analyze uploaded documents. ALWAYS use this tool for ANY questions about uploaded files, including: document summaries, content analysis, finding specific information, or answering questions based on the document. This is the ONLY tool that can access uploaded document content.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The user's question or request about the document (e.g., 'summarize this', 'what is this about?', 'find information about X')" },
        limit: { type: "number", description: "Number of matches to return", default: 3 },
      },
      required: ["query"],
    },
    run: async ({ query, limit = 3 }: { query: string; limit?: number }) => {
      if (!chunks.length) {
        throw new Error("No documents have been uploaded yet. Ask the user to upload a document first.");
      }

      const normalizedQuery = query.trim();

      // Check if this is a general/summary query
      const isGeneralQuery = GENERAL_QUERY_PATTERNS.some(pattern =>
        pattern.test(normalizedQuery)
      );

      if (isGeneralQuery) {
        // For general queries, return first N chunks instead of semantic search
        // This gives the AI context to create a summary/overview
        const contextChunks = chunks.slice(0, contextChunksForGeneral);

        return {
          query,
          queryType: "general",
          context: contextChunks.map((chunk) => ({
            chunkId: chunk.id,
            fileName: chunk.fileName,
            text: chunk.text,
            metadata: chunk.metadata,
          })),
          totalChunks: chunks.length,
          note: `Returning first ${contextChunks.length} chunks for general query. Total document has ${chunks.length} chunks.`,
        };
      }

      // Regular semantic search for specific queries
      const queryEmbedding = await embedQuery(normalizedQuery);
      if (!queryEmbedding.length) {
        throw new Error("Failed to embed query");
      }

      const ranked = chunks
        .map((chunk) => ({
          chunkId: chunk.id,
          fileName: chunk.fileName,
          preview: chunk.text.slice(0, 220).replace(/\s+/g, " ").trim(),
          fullText: chunk.text,
          similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
          metadata: chunk.metadata,
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return {
        query,
        queryType: "semantic",
        matches: ranked,
        totalChunks: chunks.length,
      };
    },
  };
}
