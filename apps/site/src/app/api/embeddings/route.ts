export const runtime = "edge";

export async function POST(req: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return new Response("Missing MISTRAL_API_KEY", { status: 500 });

  const { texts, model = "mistral-embed" } = await req.json();

  const r = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: texts ?? [] }),
  });

  return new Response(await r.text(), {
    headers: { "Content-Type": "application/json" },
  });
}
