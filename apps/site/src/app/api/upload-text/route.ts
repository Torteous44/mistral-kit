import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { text } = await pdfParse(buffer);

      return NextResponse.json(
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
      return NextResponse.json({ ok: false, error: "Missing text" }, { status: 400 });
    }

    return NextResponse.json(
      {
        ok: true,
        kind: "text",
        length: body.text.length,
        text: body.text,
        preview: body.text.slice(0, 800),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
