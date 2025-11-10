/**
 * Represents a text chunk with its embedding for RAG applications
 */
export type EmbeddedChunk = {
  /** Unique identifier for the chunk */
  id: string;
  /** The text content of the chunk */
  text: string;
  /** The embedding vector for this chunk */
  embedding: number[];
  /** Optional source file name */
  fileName?: string;
  /** Optional metadata */
  metadata?: Record<string, any>;
};
