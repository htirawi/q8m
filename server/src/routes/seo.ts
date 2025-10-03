import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

interface SitemapRoute {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export default async function seoRoutes(fastify: FastifyInstance) {
  // Generate sitemap.xml
  fastify.get("/sitemap.xml", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const baseUrl = process.env.CLIENT_URL || "https://quiz-platform.com";
      const currentDate = new Date().toISOString().split("T")[0];

      // Static routes
      const staticRoutes: SitemapRoute[] = [
        {
          url: `${baseUrl}/`,
          lastmod: currentDate,
          changefreq: "daily",
          priority: 1.0,
        },
        {
          url: `${baseUrl}/pricing`,
          lastmod: currentDate,
          changefreq: "weekly",
          priority: 0.9,
        },
        {
          url: `${baseUrl}/about`,
          lastmod: currentDate,
          changefreq: "monthly",
          priority: 0.7,
        },
        {
          url: `${baseUrl}/contact`,
          lastmod: currentDate,
          changefreq: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/auth/login`,
          lastmod: currentDate,
          changefreq: "monthly",
          priority: 0.5,
        },
        {
          url: `${baseUrl}/auth/register`,
          lastmod: currentDate,
          changefreq: "monthly",
          priority: 0.5,
        },
      ];

      // Localized routes
      const locales = ["en", "ar"];
      const localizedRoutes: SitemapRoute[] = [];

      locales.forEach((locale) => {
        staticRoutes.forEach((route) => {
          const localizedUrl = route.url.replace(baseUrl, `${baseUrl}/${locale}`);
          localizedRoutes.push({
            ...route,
            url: localizedUrl,
          });
        });
      });

      // Quiz categories and individual quizzes (if available)
      const quizRoutes: SitemapRoute[] = [];
      const categories = ["vue", "react", "angular", "javascript", "typescript", "nodejs"];

      categories.forEach((category) => {
        locales.forEach((locale) => {
          // Category pages
          quizRoutes.push({
            url: `${baseUrl}/${locale}/quizzes/${category}`,
            lastmod: currentDate,
            changefreq: "weekly",
            priority: 0.8,
          });

          // Individual quiz pages (example structure)
          for (let i = 1; i <= 5; i++) {
            quizRoutes.push({
              url: `${baseUrl}/${locale}/quiz/${category}-quiz-${i}`,
              lastmod: currentDate,
              changefreq: "monthly",
              priority: 0.7,
            });
          }
        });
      });

      // Combine all routes
      const allRoutes = [...staticRoutes, ...localizedRoutes, ...quizRoutes];

      // Generate XML sitemap
      const sitemap = generateSitemapXML(allRoutes);

      reply.type("application/xml");
      reply.send(sitemap);
    } catch (error) {
      fastify.log.error("Error generating sitemap:", error);
      reply.code(500).send({ error: "Failed to generate sitemap" });
    }
  });

  // Generate robots.txt
  fastify.get("/robots.txt", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const baseUrl = process.env.CLIENT_URL || "https://quiz-platform.com";

      const robotsContent = `User-agent: *
Allow: /

# Block access to admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /account/
Disallow: /me/

# Allow access to important pages
Allow: /pricing
Allow: /quizzes/
Allow: /quiz/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for better server performance
Crawl-delay: 1`;

      reply.type("text/plain");
      reply.send(robotsContent);
    } catch (error) {
      fastify.log.error("Error generating robots.txt:", error);
      reply.code(500).send({ error: "Failed to generate robots.txt" });
    }
  });

  // Generate structured data for specific pages
  fastify.get(
    "/api/seo/structured-data/:type",
    {
      schema: {
        params: z.object({
          type: z.enum(["organization", "quiz", "pricing"]),
        }),
        querystring: z.object({
          locale: z.string().optional(),
          id: z.string().optional(),
        }),
      },
    },
    async (
      request: FastifyRequest<{
        Params: { type: string };
        Querystring: { locale?: string; id?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { type } = request.params;
        const { locale = "en", id } = request.query;
        const baseUrl = process.env.CLIENT_URL || "https://quiz-platform.com";

        let structuredData: any = {};

        switch (type) {
          case "organization":
            structuredData = {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Vue 3 Quiz Platform",
              url: baseUrl,
              logo: `${baseUrl}/images/logo.png`,
              description: "Interactive quiz platform for learning modern web development",
              foundingDate: "2024",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "support@quiz-platform.com",
              },
              sameAs: ["https://twitter.com/quizplatform", "https://github.com/quiz-platform"],
              address: {
                "@type": "PostalAddress",
                addressCountry: "US",
              },
            };
            break;

          case "quiz":
            // Mock quiz data - in production, fetch from database
            structuredData = {
              "@context": "https://schema.org",
              "@type": "Quiz",
              name: `Vue 3 Quiz ${id || "1"}`,
              description: "Test your Vue 3 knowledge with this comprehensive quiz",
              url: `${baseUrl}/${locale}/quiz/vue-3-quiz-${id || "1"}`,
              inLanguage: locale,
              educationalLevel: "intermediate",
              educationalUse: "assessment",
              learningResourceType: "quiz",
              author: {
                "@type": "Organization",
                name: "Vue 3 Quiz Platform",
              },
              publisher: {
                "@type": "Organization",
                name: "Vue 3 Quiz Platform",
                url: baseUrl,
              },
              dateCreated: new Date().toISOString(),
              dateModified: new Date().toISOString(),
              numberOfQuestions: 20,
              timeRequired: "PT15M",
              category: "Programming",
              keywords: "vue 3, javascript, frontend, quiz",
            };
            break;

          case "pricing":
            structuredData = {
              "@context": "https://schema.org",
              "@type": "Product",
              name: "Vue 3 Quiz Platform Subscription",
              description:
                "Comprehensive quiz platform for learning Vue 3, React, Angular, and more",
              url: `${baseUrl}/${locale}/pricing`,
              inLanguage: locale,
              offers: [
                {
                  "@type": "Offer",
                  name: "Junior Plan",
                  description: "Free access to basic quizzes",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  url: `${baseUrl}/${locale}/pricing#junior`,
                },
                {
                  "@type": "Offer",
                  name: "Intermediate Plan",
                  description: "Access to intermediate level quizzes",
                  price: "29",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  url: `${baseUrl}/${locale}/pricing#intermediate`,
                },
                {
                  "@type": "Offer",
                  name: "Senior Plan",
                  description: "Access to all quizzes including advanced topics",
                  price: "49",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  url: `${baseUrl}/${locale}/pricing#senior`,
                },
                {
                  "@type": "Offer",
                  name: "Bundle Plan",
                  description: "Complete access to all features and content",
                  price: "69",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                  url: `${baseUrl}/${locale}/pricing#bundle`,
                },
              ],
              brand: {
                "@type": "Brand",
                name: "Vue 3 Quiz Platform",
              },
              category: "Educational Software",
            };
            break;

          default:
            return reply.code(400).send({ error: "Invalid structured data type" });
        }

        reply.send(structuredData);
      } catch (error) {
        fastify.log.error("Error generating structured data:", error);
        reply.code(500).send({ error: "Failed to generate structured data" });
      }
    }
  );
}

function generateSitemapXML(routes: SitemapRoute[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = "</urlset>";

  const urlEntries = routes
    .map((route) => {
      const lastmod = route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : "";
      const changefreq = route.changefreq ? `<changefreq>${route.changefreq}</changefreq>` : "";
      const priority = route.priority ? `<priority>${route.priority}</priority>` : "";

      return `  <url>
    <loc>${route.url}</loc>
    ${lastmod}
    ${changefreq}
    ${priority}
  </url>`;
    })
    .join("\n");

  return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`;
}
