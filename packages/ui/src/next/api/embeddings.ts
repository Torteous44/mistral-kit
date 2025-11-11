import { createMistralClient } from "../../server";

export const runtime = "edge";

export async function POST(req: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return new Response("Missing MISTRAL_API_KEY", { status: 500 });
  }

  const body = await req.json();
  const { model = "mistral-embed", input, texts } = body ?? {};

  const normalizedInput = Array.isArray(input)
    ? input
    : Array.isArray(texts)
    ? texts
    : typeof input === "string"
    ? [input]
    : typeof texts === "string"
    ? [texts]
    : [];

  const client = createMistralClient({ apiKey });

  try {
    const data = await client.embeddings({
      model,
      input: normalizedInput,
    });

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mistral embeddings request failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
