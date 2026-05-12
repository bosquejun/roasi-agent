import type { FastifyInstance } from "fastify";
import type { ChatRequest, ChatResponse } from "../lib/types.js";

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: ChatRequest }>(
    "/chat",
    {
      schema: {
        body: {
          type: "object",
          required: ["messages"],
          properties: {
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["user", "assistant", "system"] },
                  content: { type: "string" },
                },
              },
            },
            model: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { messages, model } = request.body;

      const response: ChatResponse = {
        content: "AI response placeholder",
        finishReason: "stop",
      };

      return reply.send(response);
    }
  );

  fastify.post<{ Body: ChatRequest }>(
    "/chat/stream",
    {
      schema: {
        body: {
          type: "object",
          required: ["messages"],
          properties: {
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["user", "assistant", "system"] },
                  content: { type: "string" },
                },
              },
            },
            model: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { messages, model } = request.body;

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      reply.raw.write(`data: ${JSON.stringify({ content: "Stream response placeholder" })}\n\n`);

      reply.raw.write("data: [DONE]\n\n");
      reply.raw.end();
    }
  );
}