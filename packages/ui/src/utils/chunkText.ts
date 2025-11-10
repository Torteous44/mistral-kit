export function chunkText(input: string, max = 2000): string[] {
  if (!input) return [];

  const normalized = input.replace(/\r\n/g, "\n");
  const chunks: string[] = [];

  for (let i = 0; i < normalized.length; i += max) {
    chunks.push(normalized.slice(i, i + max));
  }

  return chunks;
}

/**
 * Splits text into chunks with overlapping content between adjacent chunks.
 * Overlapping improves semantic search quality for RAG applications.
 *
 * @param input - The text to chunk
 * @param chunkSize - Maximum size of each chunk in characters (default: 800)
 * @param overlap - Number of characters to overlap between chunks (default: 120)
 * @returns Array of text chunks with overlap
 * @throws Error if overlap is >= chunkSize or if values are invalid
 */
export function chunkTextWithOverlap(
  input: string,
  chunkSize = 800,
  overlap = 120
): string[] {
  if (!input) return [];

  if (chunkSize <= 0) {
    throw new Error(`chunkSize must be positive, got ${chunkSize}`);
  }

  if (overlap < 0) {
    throw new Error(`overlap must be non-negative, got ${overlap}`);
  }

  if (overlap >= chunkSize) {
    throw new Error(
      `overlap (${overlap}) must be less than chunkSize (${chunkSize}). ` +
      `Otherwise chunks would contain more overlap than new content.`
    );
  }

  const baseChunks = chunkText(input, chunkSize);

  return baseChunks.map((chunk, index) => {
    if (index === 0) return chunk;

    const previousChunk = baseChunks[index - 1] ?? "";
    const tail = previousChunk.slice(Math.max(0, previousChunk.length - overlap));

    return `${tail} ${chunk}`.trim();
  });
}
