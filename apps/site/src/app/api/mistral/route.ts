export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return new Response("Missing MISTRAL_API_KEY", { status: 500 });

  const body = await req.text();
  const upstream = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "User-Agent": "mistral-react-kit-proxy",
    },
    body,
  });

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
