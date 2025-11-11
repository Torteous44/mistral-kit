import { Buffer } from "node:buffer";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return jsonResponse({ ok: false, error: "Missing file" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { text } = await pdfParse(buffer);

      return jsonResponse(
        {
          ok: true,
          kind: "pdf",
          length: text.length,
          preview: text.slice(0, 800),
          text,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const body = await req.json();
    if (!body?.text || typeof body.text !== "string") {
      return jsonResponse({ ok: false, error: "Missing text" }, { status: 400 });
    }

    return jsonResponse(
      {
        ok: true,
        kind: "text",
        length: body.text.length,
        text: body.text,
        preview: body.text.slice(0, 800),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ ok: false, error: message }, { status: 500 });
  }
}
