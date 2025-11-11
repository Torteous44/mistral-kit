const DEFAULT_BASE_URL = "https://api.mistral.ai/v1";

type FetchImpl = typeof fetch;

export type CreateMistralClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: FetchImpl;
};

export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string | string[];
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    };
  }>;
  tool_choice?: "auto" | string;
  metadata?: Record<string, unknown>;
  stream?: boolean;
};

export type ChatCompletionChoice = {
  index: number;
  finish_reason: string | null;
  message: ChatCompletionChoiceMessage;
};

export type ChatCompletionToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type ChatCompletionChoiceMessage = {
  role: "assistant" | "tool";
  content: string | null;
  tool_calls?: ChatCompletionToolCall[];
};

export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type EmbeddingsRequest = {
  model: string;
  input: string | string[];
};

export type EmbeddingVector = {
  object: "embedding";
  embedding: number[];
  index: number;
};

export type EmbeddingsResponse = {
  data: EmbeddingVector[];
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
};

const ensureFetch = (impl?: FetchImpl): FetchImpl => {
  if (impl) return impl;
  if (typeof fetch === "undefined") {
    throw new Error("No global fetch implementation available. Provide fetchImpl when creating the client.");
  }
  return fetch;
};

const buildHeaders = (apiKey: string, overrides?: HeadersInit) => {
  const headers = new Headers(overrides ?? {});
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};

export function createMistralClient(options: CreateMistralClientOptions) {
  const { apiKey, baseUrl = DEFAULT_BASE_URL, fetchImpl } = options;
  const fetcher = ensureFetch(fetchImpl);

  const post = async (path: string, payload: unknown, init?: RequestInit): Promise<Response> => {
    const headers = buildHeaders(apiKey, init?.headers);
    const response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = await response.text().catch(() => "");
      throw new Error(`Mistral API error ${response.status}: ${errorPayload || response.statusText}`);
    }

    return response;
  };

  const chatCompletions = async (
    request: Omit<ChatCompletionRequest, "stream">,
    init?: RequestInit
  ): Promise<ChatCompletionResponse> => {
    const response = await post(
      "/chat/completions",
      {
        ...request,
        stream: false,
      },
      init
    );
    return response.json();
  };

  const chatCompletionsStream = async (
    request: ChatCompletionRequest,
    init?: RequestInit
  ): Promise<Response> => {
    const streamHeaders = new Headers(init?.headers ?? {});
    if (!streamHeaders.has("Accept")) {
      streamHeaders.set("Accept", "text/event-stream");
    }
    const response = await post(
      "/chat/completions",
      { ...request, stream: true },
      {
        ...init,
        headers: streamHeaders,
      }
    );
    if (!response.body) {
      throw new Error("Streaming response did not include a readable body.");
    }
    return response;
  };

  const embeddings = async (request: EmbeddingsRequest, init?: RequestInit): Promise<EmbeddingsResponse> => {
    const response = await post("/embeddings", request, init);
    return response.json();
  };

  return {
    chatCompletions,
    chatCompletionsStream,
    embeddings,
  };
}
