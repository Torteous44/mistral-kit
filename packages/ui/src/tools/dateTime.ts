import { z } from "zod";
import type { ToolDefinition } from "../types/chat";

const dateTimeSchema = z.object({});

export const dateTimeTool: ToolDefinition = {
  name: "get_date",
  description: "Get the current date and time. ONLY use this when the user asks for the current date, time, or timestamp. Do NOT use for document-related queries.",
  schema: dateTimeSchema,
  parameters: {
    type: "object",
    properties: {},
  },
  run: async () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      timestamp: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  },
};
