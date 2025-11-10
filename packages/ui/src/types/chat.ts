export type Role = "system" | "user" | "assistant" | "tool";

export type ChatAttachment = {
  id?: string;
  fileName: string;
  chunkCount?: number;
  metadata?: Record<string, unknown>;
};

export type ChatMessage = {
  id: string;
  role: Role;
  content: string | null;
  attachments?: ChatAttachment[];
  displayContent?: string | null;
  toolName?: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    type?: string;
    function?: {
      name: string;
      arguments?: string;
    };
  }>;
  json?: any;
};

export type ToolDefinition = {
  name: string;
  description: string;
  schema?: unknown;
  parameters?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  run: (args: any) => Promise<any>;
};
