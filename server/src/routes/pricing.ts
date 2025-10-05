import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const pricingTiers = {
  JUNIOR: {
    id: "junior",
    name: "Junior",
    price: 0,
    currency: "USD",
    description: "Perfect for beginners",
    features: [
      "100+ Basic Questions",
      "Multiple Choice Quizzes",
      "Progress Tracking",
      "Mobile Access",
    ],
    popular: false,
  },
  INTERMEDIATE: {
    id: "intermediate",
    name: "Intermediate",
    price: 29,
    currency: "USD",
    description: "For serious learners",
    features: [
      "300+ Advanced Questions",
      "All Question Types",
      "Detailed Explanations",
      "Performance Analytics",
      "Bookmarks & Notes",
      "Priority Support",
    ],
    popular: true,
  },
  SENIOR: {
    id: "senior",
    name: "Senior",
    price: 49,
    currency: "USD",
    description: "For experienced developers",
    features: [
      "500+ Expert Questions",
      "System Design Questions",
      "Mock Interviews",
      "Advanced Analytics",
      "Custom Study Plans",
      "Expert Reviews",
      "Priority Support",
    ],
    popular: false,
  },
  BUNDLE: {
    id: "bundle",
    name: "Bundle",
    price: 69,
    currency: "USD",
    description: "Complete package",
    features: [
      "Everything in Intermediate & Senior",
      "Lifetime Access",
      "All Future Updates",
      "Personal Mentor",
      "Interview Coaching",
      "Resume Review",
      "Premium Support",
    ],
    popular: false,
    bestValue: true,
  },
};

export default async function pricingRoutes(fastify: FastifyInstance) {
  // Get pricing tiers
  fastify.get("/", async (_request, reply) => {
    reply.send({
      tiers: Object.values(pricingTiers),
      currency: "USD",
      supportedCurrencies: ["USD", "JOD", "SAR"],
      exchangeRates: {
        USD: 1,
        JOD: 0.71, // Mock rate
        SAR: 3.75, // Mock rate
      },
    });
  });

  // Get pricing tier by ID
  fastify.get(
    "/:tierId",
    {
      schema: {
        params: zodToJsonSchema(
          z.object({
            tierId: z.enum(["junior", "intermediate", "senior", "bundle"]),
          })
        ),
      },
    },
    async (request, reply) => {
      const { tierId } = request.params as { tierId: keyof typeof pricingTiers };

      const tier = pricingTiers[tierId.toUpperCase() as keyof typeof pricingTiers];

      if (!tier) {
        return reply.status(404).send({
          code: 404,
          error: "Not Found",
          message: "Pricing tier not found",
        });
      }

      reply.send(tier);
    }
  );

  // Get currency conversion rates
  fastify.get("/rates", async (_request, reply) => {
    // Convert currency using current exchange rates
    reply.send({
      base: "USD",
      rates: {
        USD: 1,
        JOD: 0.71,
        SAR: 3.75,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Convert price to different currency
  fastify.post(
    "/convert",
    {
      schema: {
        body: zodToJsonSchema(
          z.object({
            amount: z.number().positive(),
            fromCurrency: z.string().length(3),
            toCurrency: z.string().length(3),
          })
        ),
      },
    },
    async (request, reply) => {
      const { amount, fromCurrency, toCurrency } = request.body as {
        amount: number;
        fromCurrency: string;
        toCurrency: string;
      };

      // Convert currency using current exchange rates
      const mockRates = {
        USD: 1,
        JOD: 0.71,
        SAR: 3.75,
      };

      const convertedAmount =
        amount *
        (mockRates[toCurrency as keyof typeof mockRates] /
          mockRates[fromCurrency as keyof typeof mockRates]);

      reply.send({
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        convertedCurrency: toCurrency,
        rate:
          mockRates[toCurrency as keyof typeof mockRates] /
          mockRates[fromCurrency as keyof typeof mockRates],
      });
    }
  );
}
