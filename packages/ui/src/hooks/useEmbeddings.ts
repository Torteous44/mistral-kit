import { useCallback, useState, useRef } from "react";

type UseEmbeddingsOptions = {
  model?: string;
  apiProxyUrl?: string;
};

type EmbeddingResult = {
  embedding: number[];
  text: string;
};

type UseEmbeddingsResult = {
  embeddings: EmbeddingResult[];
  isLoading: boolean;
  error: Error | null;
  embed: (texts: string | string[]) => Promise<EmbeddingResult[]>;
  similarity: (a: number[], b: number[]) => number;
  reset: () => void;
};

export function useEmbeddings(
  options: UseEmbeddingsOptions = {}
): UseEmbeddingsResult {
  const {
    model = "mistral-embed",
    apiProxyUrl = "/api/embeddings",
  } = options;

  const [embeddings, setEmbeddings] = useState<EmbeddingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const embed = useCallback(
    async (texts: string | string[]): Promise<EmbeddingResult[]> => {
      setIsLoading(true);
      setError(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const textArray = Array.isArray(texts) ? texts : [texts];

      try {
        const response = await fetch(apiProxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            input: textArray,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.data) {
          throw new Error("No embeddings in response");
        }

        const newEmbeddings: EmbeddingResult[] = result.data.map(
          (item: any, index: number) => ({
            embedding: item.embedding,
            text: textArray[index],
          })
        );

        setEmbeddings(newEmbeddings);
        return newEmbeddings;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [model, apiProxyUrl]
  );

  const similarity = useCallback((a: number[], b: number[]): number => {
    if (a.length !== b.length) {
      throw new Error("Embeddings must have same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }, []);

  const reset = useCallback(() => {
    setEmbeddings([]);
    setError(null);
    setIsLoading(false);
    abortRef.current?.abort();
  }, []);

  return {
    embeddings,
    isLoading,
    error,
    embed,
    similarity,
    reset,
  };
}
