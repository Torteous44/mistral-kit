export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return new Response("Missing MISTRAL_API_KEY", { status: 500 });

  const body = await req.text();
  const parsedBody = JSON.parse(body);
  const isStreaming = parsedBody.stream !== false;

  const upstream = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: isStreaming ? "text/event-stream" : "application/json",
    },
    body,
  });

  if (!upstream.body) return new Response("Upstream error", { status: 502 });

  // If streaming, return SSE stream
  if (isStreaming) {
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Encoding": "none",
      },
    });
  }

  // If not streaming, return JSON
  const data = await upstream.text();
  return new Response(data, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
