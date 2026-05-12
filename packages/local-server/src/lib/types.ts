export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
}

export interface ChatResponse {
  content: string;
  finishReason: "stop" | "length" | "content-filter" | "tool-calls";
}

export interface ToolCall {
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolExecuteRequest {
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolExecuteResponse {
  result: unknown;
}