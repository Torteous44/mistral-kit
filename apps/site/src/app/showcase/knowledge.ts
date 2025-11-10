import { chunkText, type ToolDefinition } from "@mistral/ui";

export type UploadedChunk = {
  id: string;
  text: string;
  embedding: number[];
  fileName: string;
};

export const MAX_FILE_SIZE_MB = 4;
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 120;

export function stitchChunks(text: string) {
  const base = chunkText(text, CHUNK_SIZE);
  return base.map((chunk, index) => {
    if (index === 0) return chunk;
    const prev = base[index - 1] ?? "";
    const tail = prev.slice(Math.max(0, prev.length - CHUNK_OVERLAP));
    return `${tail} ${chunk}`.trim();
  });
}

export function createSearchDocsTool(
  chunks: UploadedChunk[],
  embedQuery: (text: string) => Promise<number[]>
): ToolDefinition {
  return {
    name: "search_docs",
    description: "Search the uploaded knowledge via semantic similarity",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search request" },
        limit: { type: "number", description: "Number of matches", default: 3 },
      },
      required: ["query"],
    },
    run: async ({ query, limit = 3 }: { query: string; limit?: number }) => {
      if (!chunks.length) {
        return { query, matches: [], note: "Upload a file first." };
      }

      const queryEmbedding = await embedQuery(query);
      if (!queryEmbedding.length) {
        throw new Error("Failed to embed query");
      }

      const ranked = chunks
        .map((chunk) => ({
          chunkId: chunk.id,
          fileName: chunk.fileName,
          preview: chunk.text.slice(0, 220).replace(/\s+/g, " ").trim(),
          similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return {
        query,
        matches: ranked,
        totalChunks: chunks.length,
      };
    },
  };
}

function cosineSimilarity(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
