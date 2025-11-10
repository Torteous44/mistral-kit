import { useCallback, useState, useRef } from "react";
import { z } from "zod";

type UseJSONModeOptions<T extends z.ZodType> = {
  schema: T;
  model?: string;
  apiProxyUrl?: string;
  systemPrompt?: string;
  onSuccess?: (data: z.infer<T>) => void;
  onError?: (error: Error) => void;
};

type UseJSONModeResult<T extends z.ZodType> = {
  data: z.infer<T> | null;
  isLoading: boolean;
  error: Error | null;
  generate: (prompt: string) => Promise<z.infer<T> | null>;
  reset: () => void;
};

/**
 * useJSONMode - Structured JSON output with Zod validation
 *
 * Leverages Mistral's JSON mode to get type-safe structured data.
 * Automatically validates responses against your Zod schema.
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 *   email: z.string().email(),
 * });
 *
 * const { data, isLoading, generate } = useJSONMode({
 *   schema,
 *   model: "mistral-medium-latest",
 * });
 *
 * await generate("Extract info: John is 25 years old, email john@example.com");
 * console.log(data); // { name: "John", age: 25, email: "john@example.com" }
 * ```
 */
export function useJSONMode<T extends z.ZodType>(
  options: UseJSONModeOptions<T>
): UseJSONModeResult<T> {
  const {
    schema,
    model = "mistral-medium-latest",
    apiProxyUrl = "/api/mistral",
    systemPrompt,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<z.infer<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string): Promise<z.infer<T> | null> => {
      setIsLoading(true);
      setError(null);

      // Abort any pending request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const messages = [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          {
            role: "system",
            content: `You must respond with valid JSON. Return ONLY the JSON, no markdown or extra text.`,
          },
          { role: "user", content: prompt },
        ];

        const response = await fetch(apiProxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: "json_object" },
            stream: false,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("No content in response");
        }

        // Parse JSON from response
        let jsonData: unknown;
        try {
          jsonData = JSON.parse(content);
        } catch (parseError) {
          throw new Error(`Failed to parse JSON: ${parseError}`);
        }

        // Validate with Zod schema
        const validated = schema.parse(jsonData);

        setData(validated);
        onSuccess?.(validated);
        return validated;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        onError?.(errorObj);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [schema, model, apiProxyUrl, systemPrompt, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    abortRef.current?.abort();
  }, []);

  return {
    data,
    isLoading,
    error,
    generate,
    reset,
  };
}
