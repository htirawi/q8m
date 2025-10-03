import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSEO } from "@/composables/useSEO";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    locale: { value: "en" },
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

// Mock vue-router
vi.mock("vue-router", () => ({
  useRoute: () => ({
    fullPath: "/test-page",
    path: "/test-page",
  }),
}));

// Mock environment variables
vi.mock("import.meta", () => ({
  env: {
    VITE_CLIENT_URL: "https://test-quiz-platform.com",
  },
}));

describe("useSEO Composable", () => {
  let seo: ReturnType<typeof useSEO>;

  beforeEach(() => {
    // Clear DOM
    document.head.innerHTML = "";
    seo = useSEO();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct default SEO data", () => {
      expect(seo.seoData.value.title).toBe("Vue 3 Quiz Platform - Learn with Interactive Quizzes");
      expect(seo.seoData.value.description).toContain("Master Vue 3, React, Angular");
      expect(seo.seoData.value.keywords).toContain("vue 3");
      expect(seo.seoData.value.ogType).toBe("website");
      expect(seo.seoData.value.twitterCard).toBe("summary_large_image");
    });
  });

  describe("Meta Tags Management", () => {
    it("should generate correct page title", () => {
      expect(seo.pageTitle.value).toBe(
        "Vue 3 Quiz Platform - Learn with Interactive Quizzes | Vue 3 Quiz Platform"
      );
    });

    it("should generate correct canonical URL", () => {
      expect(seo.canonicalUrl.value).toBe("https://test-quiz-platform.com/test-page");
    });

    it("should generate correct OG image URL", () => {
      expect(seo.ogImage.value).toBe("https://test-quiz-platform.com/images/og-default.jpg");
    });

    it("should update SEO data correctly", () => {
      const newData = {
        title: "Custom Page Title",
        description: "Custom page description",
        keywords: ["custom", "keywords"],
      };

      seo.updateSEO(newData);

      expect(seo.seoData.value.title).toBe("Custom Page Title");
      expect(seo.seoData.value.description).toBe("Custom page description");
      expect(seo.seoData.value.keywords).toEqual(["custom", "keywords"]);
    });
  });

  describe("Structured Data Generation", () => {
    it("should generate quiz structured data correctly", () => {
      const mockQuiz = {
        title: "Vue 3 Basics Quiz",
        description: "Test your Vue 3 knowledge",
        level: "beginner",
        questions: [{ id: 1 }, { id: 2 }, { id: 3 }],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        estimatedTime: "PT15M",
        category: "Frontend",
        tags: ["vue", "javascript", "frontend"],
      };

      const structuredData = seo.generateQuizStructuredData(mockQuiz);

      expect(structuredData["@type"]).toBe("Quiz");
      expect(structuredData.name).toBe("Vue 3 Basics Quiz");
      expect(structuredData.description).toBe("Test your Vue 3 knowledge");
      expect(structuredData.educationalLevel).toBe("beginner");
      expect(structuredData.numberOfQuestions).toBe(3);
      expect(structuredData.category).toBe("Frontend");
      expect(structuredData.keywords).toBe("vue, javascript, frontend");
    });

    it("should generate pricing structured data correctly", () => {
      const mockPricing = {
        plans: [
          {
            id: "intermediate",
            name: "Intermediate Plan",
            description: "Access to intermediate quizzes",
            price: "29.99",
            currency: "USD",
          },
          {
            id: "senior",
            name: "Senior Plan",
            description: "Access to all quizzes",
            price: "49.99",
            currency: "USD",
          },
        ],
      };

      const structuredData = seo.generatePricingStructuredData(mockPricing);

      expect(structuredData["@type"]).toBe("Product");
      expect(structuredData.name).toBe("Vue 3 Quiz Platform Subscription");
      expect(structuredData.offers).toHaveLength(2);
      expect(structuredData.offers[0]["@type"]).toBe("Offer");
      expect(structuredData.offers[0].name).toBe("Intermediate Plan");
      expect(structuredData.offers[0].price).toBe("29.99");
      expect(structuredData.offers[0].priceCurrency).toBe("USD");
    });

    it("should generate organization structured data correctly", () => {
      const structuredData = seo.generateOrganizationStructuredData();

      expect(structuredData["@type"]).toBe("Organization");
      expect(structuredData.name).toBe("Vue 3 Quiz Platform");
      expect(structuredData.url).toBe("https://test-quiz-platform.com");
      expect(structuredData.logo).toBe("https://test-quiz-platform.com/images/logo.png");
      expect(structuredData.description).toBe(
        "Interactive quiz platform for learning modern web development"
      );
      expect(structuredData.foundingDate).toBe("2024");
      expect(structuredData.sameAs).toContain("https://twitter.com/quizplatform");
      expect(structuredData.sameAs).toContain("https://github.com/quiz-platform");
    });
  });

  describe("Meta Tags DOM Manipulation", () => {
    it("should add meta tags to document head", () => {
      seo.updateMetaTags();

      // Check if title tag exists
      const titleTag = document.querySelector("title");
      expect(titleTag).toBeTruthy();
      expect(titleTag?.textContent).toContain("Vue 3 Quiz Platform");

      // Check if meta description exists
      const descriptionTag = document.querySelector('meta[name="description"]');
      expect(descriptionTag).toBeTruthy();
      expect(descriptionTag?.getAttribute("content")).toContain("Master Vue 3");

      // Check if canonical link exists
      const canonicalTag = document.querySelector('link[rel="canonical"]');
      expect(canonicalTag).toBeTruthy();
      expect(canonicalTag?.getAttribute("href")).toBe("https://test-quiz-platform.com/test-page");

      // Check if Open Graph tags exist
      const ogTitleTag = document.querySelector('meta[property="og:title"]');
      expect(ogTitleTag).toBeTruthy();

      const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
      expect(ogDescriptionTag).toBeTruthy();

      const ogImageTag = document.querySelector('meta[property="og:image"]');
      expect(ogImageTag).toBeTruthy();

      // Check if Twitter Card tags exist
      const twitterCardTag = document.querySelector('meta[name="twitter:card"]');
      expect(twitterCardTag).toBeTruthy();
      expect(twitterCardTag?.getAttribute("content")).toBe("summary_large_image");

      // Check if robots meta exists
      const robotsTag = document.querySelector('meta[name="robots"]');
      expect(robotsTag).toBeTruthy();
      expect(robotsTag?.getAttribute("content")).toBe("index, follow");

      // Check if language meta exists
      const languageTag = document.querySelector('meta[name="language"]');
      expect(languageTag).toBeTruthy();
      expect(languageTag?.getAttribute("content")).toBe("en");
    });

    it("should add alternate links for different languages", () => {
      seo.updateMetaTags();

      // Check if alternate links exist
      const alternateEnTag = document.querySelector('link[hreflang="en"]');
      expect(alternateEnTag).toBeTruthy();
      expect(alternateEnTag?.getAttribute("href")).toBe(
        "https://test-quiz-platform.com/en/test-page"
      );

      const alternateArTag = document.querySelector('link[hreflang="ar"]');
      expect(alternateArTag).toBeTruthy();
      expect(alternateArTag?.getAttribute("href")).toBe(
        "https://test-quiz-platform.com/ar/test-page"
      );

      const xDefaultTag = document.querySelector('link[hreflang="x-default"]');
      expect(xDefaultTag).toBeTruthy();
      expect(xDefaultTag?.getAttribute("href")).toBe("https://test-quiz-platform.com/en/test-page");
    });

    it("should remove existing SEO tags before adding new ones", () => {
      // Add initial tags
      seo.updateMetaTags();
      const initialTagCount = document.querySelectorAll('[data-seo="true"]').length;

      // Update SEO data
      seo.updateSEO({ title: "New Title" });
      seo.updateMetaTags();

      // Check that tag count is the same (old tags removed, new ones added)
      const finalTagCount = document.querySelectorAll('[data-seo="true"]').length;
      expect(finalTagCount).toBe(initialTagCount);

      // Check that new title is present
      const titleTag = document.querySelector("title");
      expect(titleTag?.textContent).toContain("New Title");
    });

    it("should handle noindex and nofollow robots meta", () => {
      seo.updateSEO({ noindex: true, nofollow: true });
      seo.updateMetaTags();

      const robotsTag = document.querySelector('meta[name="robots"]');
      expect(robotsTag?.getAttribute("content")).toBe("noindex, nofollow");
    });
  });

  describe("Structured Data DOM Manipulation", () => {
    it("should add structured data to document head", () => {
      const mockStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Test Site",
      };

      seo.updateSEO({ structuredData: mockStructuredData });
      seo.updateMetaTags();

      const scriptTag = document.querySelector('script[type="application/ld+json"]');
      expect(scriptTag).toBeTruthy();

      const parsedData = JSON.parse(scriptTag?.textContent || "{}");
      expect(parsedData["@type"]).toBe("WebSite");
      expect(parsedData.name).toBe("Test Site");
    });
  });
});
