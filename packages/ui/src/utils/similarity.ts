/**
 * Calculate cosine similarity between two embedding vectors.
 * Returns a value between -1 and 1, where 1 means identical direction,
 * 0 means orthogonal, and -1 means opposite direction.
 *
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Cosine similarity score between -1 and 1
 * @throws Error if vectors have different dimensions
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Embedding dimension mismatch: vector A has ${a.length} dimensions, vector B has ${b.length} dimensions. ` +
      `This usually indicates different embedding models were used.`
    );
  }

  if (a.length === 0) {
    throw new Error("Cannot calculate similarity for empty vectors");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) {
    throw new Error("Cannot calculate similarity for zero-length vectors");
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
