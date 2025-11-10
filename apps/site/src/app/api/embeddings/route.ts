export const runtime = "edge";
export async function POST(req: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return new Response("Missing MISTRAL_API_KEY", { status: 500 });

  const body = await req.json();
  const {
    model = "mistral-embed",
    input,
    texts,
  } = body ?? {};

  const payload = {
    model,
    input: Array.isArray(input) ? input : Array.isArray(texts) ? texts : [],
  };

  const r = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    return new Response(await r.text(), {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(await r.text(), { headers: { "Content-Type": "application/json" } });
}
