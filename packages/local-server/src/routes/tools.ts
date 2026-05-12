import type { FastifyInstance } from "fastify";
import type { ToolExecuteRequest, ToolExecuteResponse } from "../lib/types.js";

const registeredTools: Record<string, (args: Record<string, unknown>) => unknown> = {};

export async function toolRoutes(fastify: FastifyInstance) {
  fastify.get("/tools", async () => {
    return { tools: Object.keys(registeredTools) };
  });

  fastify.post<{ Body: ToolExecuteRequest }>(
    "/tools/execute",
    {
      schema: {
        body: {
          type: "object",
          required: ["toolName"],
          properties: {
            toolName: { type: "string" },
            args: { type: "object" },
          },
        },
      },
    },
    async (request): Promise<ToolExecuteResponse> => {
      const { toolName, args } = request.body;

      const tool = registeredTools[toolName];
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      const result = await tool(args);
      return { result };
    }
  );
}

export function registerTool(name: string, handler: (args: Record<string, unknown>) => unknown) {
  registeredTools[name] = handler;
}