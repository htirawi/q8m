import { FastifyInstance } from "fastify";

export default async function aiRoutes(fastify: FastifyInstance) {
  // AI Chat endpoint
  fastify.post(
    "/ai/chat",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            message: { type: "string" },
            context: { type: "object" },
            sessionId: { type: "string" },
          },
          required: ["message"],
        },
      },
    },
    async (request, reply) => {
      try {
        const { message, context } = request.body as any;

        // For now, return a mock response until we integrate with a real AI service
        const mockResponse = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: `I understand you're asking about "${message}". This is a mock response from the AI assistant. The AI service is currently being set up and will provide real assistance soon!`,
          timestamp: new Date().toISOString(),
          metadata: {
            context: context || null,
            tokens: 50,
          },
        };

        return reply.send({
          success: true,
          data: mockResponse,
        });
      } catch (error) {
        fastify.log.error({ err: error }, "AI chat error");
        return reply.status(500).send({
          success: false,
          message: "Failed to process AI request",
        });
      }
    }
  );
}
