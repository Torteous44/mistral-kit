import { createMistralClient, type ChatCompletionRequest } from "../../server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return new Response("Missing MISTRAL_API_KEY", { status: 500 });
  }

  const bodyText = await req.text();
  const parsedBody = JSON.parse(bodyText) as ChatCompletionRequest & { stream?: boolean };
  const isStreaming = parsedBody.stream !== false;
  const client = createMistralClient({ apiKey });

  try {
    if (isStreaming) {
      const upstream = await client.chatCompletionsStream(parsedBody);
      if (!upstream.body) return new Response("Upstream error", { status: 502 });

      return new Response(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Content-Encoding": "none",
        },
      });
    }

    const { stream: _ignored, ...payload } = parsedBody;
    const data = await client.chatCompletions(payload);

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mistral API request failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
