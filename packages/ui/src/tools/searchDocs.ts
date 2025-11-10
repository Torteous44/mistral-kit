import { z } from "zod";
import type { ToolDefinition } from "../types/chat";

const searchDocsSchema = z.object({
  query: z.string().describe("The search query to find relevant documents"),
  limit: z.number().optional().describe("Maximum number of results to return (default: 3)"),
});

type SearchDocsArgs = z.infer<typeof searchDocsSchema>;

export const searchDocsTool: ToolDefinition = {
  name: "search_docs",
  description: "Search through knowledge base documents using semantic search",
  schema: searchDocsSchema,
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find relevant documents",
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 3)",
      },
    },
    required: ["query"],
  },
  run: async (args: SearchDocsArgs) => {
    const { query, limit = 3 } = args;

    return {
      query,
      results: [
        {
          title: "Document matching your query",
          excerpt: "This is a placeholder. Will be replaced with real semantic search.",
          similarity: 0.85,
        },
      ].slice(0, limit),
      note: "Embeddings integration coming next",
    };
  },
};
