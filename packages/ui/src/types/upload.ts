import { z } from "zod";

export const UploadTextReq = z.object({
  docId: z.string().min(1).optional(),
  text: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export type UploadTextReq = z.infer<typeof UploadTextReq>;

export const UploadTextRes = z.object({
  ok: z.boolean(),
  kind: z.enum(["pdf", "text"]).optional(),
  length: z.number().optional(),
  preview: z.string().optional(),
  text: z.string().optional(),
  error: z.string().optional(),
});

export type UploadTextRes = z.infer<typeof UploadTextRes>;
