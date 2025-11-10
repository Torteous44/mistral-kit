import type { UploadTextReq, UploadTextRes } from "../types/upload";

export async function uploadText(
  apiPath: string,
  payload: UploadTextReq,
  headers: Record<string, string> = {}
): Promise<UploadTextRes> {
  const res = await fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return json as UploadTextRes;
}
