import { ref, computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { getBaseUrl } from "@/config/env";
import type { SEOData, StructuredData, QuizData, PricingData } from "@/types/composables/seo";

const defaultSEO: SEOData = {
  title: "q8m - Master Frontend Development Interviews",
  description:
    "Master frontend development with 500+ curated interview questions covering Angular, React, Next.js, Redux, TypeScript, and advanced topics. Expert-level content for developers.",
  keywords: [
    "frontend",
    "interview",
    "questions",
    "angular",
    "react",
    "nextjs",
    "redux",
    "typescript",
    "javascript",
    "quiz",
    "learning",
    "programming",
    "development",
  ],
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterSite: "@quizplatform",
  twitterCreator: "@quizplatform",
};

export function useSEO(initialData: Partial<SEOData> = {}) {
  const { locale, t } = useI18n();
  const route = useRoute();

  const seoData = ref<SEOData>({
    ...defaultSEO,
    ...initialData,
  });

  // Computed properties for dynamic SEO
  const pageTitle = computed(() => {
    const baseTitle = seoData.value.title ?? defaultSEO.title ?? "";
    const siteNameTranslated = t("seo.siteName");
    const siteName =
      (typeof siteNameTranslated === "string" ? siteNameTranslated : null) ??
      "q8m - Quiz 8 Mastery";
    return `${baseTitle} | ${siteName}`;
  });

  const pageDescription = computed(() => {
    return seoData.value.description ?? defaultSEO.description ?? "";
  });

  const canonicalUrl = computed(() => {
    if (seoData.value.canonical) {
      return seoData.value.canonical;
    }

    const baseUrl = getBaseUrl();
    const path = route.fullPath;
    return `${baseUrl}${path}`;
  });

  const ogImage = computed(() => {
    return seoData.value.ogImage ?? `${getBaseUrl()}/images/og-default.jpg`;
  });

  // Update meta tags
  const updateMetaTags = () => {
    const { head } = document;

    // Remove existing meta tags
    const existingTags = head.querySelectorAll('[data-seo="true"]');
    existingTags.forEach((tag) => tag.remove());

    // Title
    const titleTag = document.createElement("title");
    titleTag.textContent = pageTitle.value;
    titleTag.setAttribute("data-seo", "true");
    head.appendChild(titleTag);

    // Meta description
    addMetaTag("description", pageDescription.value);

    // Keywords
    if (seoData.value.keywords?.length) {
      addMetaTag("keywords", seoData.value.keywords.join(", "));
    }

    // Canonical URL
    const canonicalTag = document.createElement("link");
    canonicalTag.rel = "canonical";
    canonicalTag.href = canonicalUrl.value;
    canonicalTag.setAttribute("data-seo", "true");
    head.appendChild(canonicalTag);

    // Open Graph tags
    addMetaTag("og:title", seoData.value.ogTitle ?? pageTitle.value, "property");
    addMetaTag("og:description", seoData.value.ogDescription ?? pageDescription.value, "property");
    addMetaTag("og:image", ogImage.value, "property");
    addMetaTag("og:type", seoData.value.ogType ?? "website", "property");
    addMetaTag("og:url", seoData.value.ogUrl ?? canonicalUrl.value, "property");
    const siteNameTranslated = t("seo.siteName");
    const siteName =
      (typeof siteNameTranslated === "string" ? siteNameTranslated : null) ??
      "q8m - Quiz 8 Mastery";
    addMetaTag("og:site_name", siteName, "property");
    addMetaTag("og:locale", locale.value, "property");

    // Twitter Card tags
    addMetaTag("twitter:card", seoData.value.twitterCard ?? "summary_large_image", "name");
    addMetaTag("twitter:site", seoData.value.twitterSite ?? "@quizplatform", "name");
    addMetaTag("twitter:creator", seoData.value.twitterCreator ?? "@quizplatform", "name");
    addMetaTag("twitter:title", seoData.value.twitterTitle ?? pageTitle.value, "name");
    addMetaTag(
      "twitter:description",
      seoData.value.twitterDescription ?? pageDescription.value,
      "name"
    );
    addMetaTag("twitter:image", seoData.value.twitterImage ?? ogImage.value, "name");

    // Robots meta
    const robotsContent = [];
    if (seoData.value.noindex) robotsContent.push("noindex");
    if (seoData.value.nofollow) robotsContent.push("nofollow");
    if (robotsContent.length === 0) {
      robotsContent.push("index", "follow");
    }
    addMetaTag("robots", robotsContent.join(", "));

    // Language and alternate links
    addMetaTag("language", locale.value);
    addAlternateLinks();

    // Structured data
    if (seoData.value.structuredData) {
      addStructuredData(seoData.value.structuredData);
    }
  };

  const addMetaTag = (name: string, content: string, attribute: string = "name") => {
    const metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, name);
    metaTag.content = content;
    metaTag.setAttribute("data-seo", "true");
    document.head.appendChild(metaTag);
  };

  const addAlternateLinks = () => {
    const baseUrl = getBaseUrl();
    const currentPath = route.path;

    // Remove locale prefix if present
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(\/|$)/, "/");

    // Add alternate links for different languages
    const languages = ["en", "ar"];
    languages.forEach((lang) => {
      const alternateTag = document.createElement("link");
      alternateTag.rel = "alternate";
      alternateTag.hreflang = lang;
      alternateTag.href = `${baseUrl}/${lang}${pathWithoutLocale}`;
      alternateTag.setAttribute("data-seo", "true");
      document.head.appendChild(alternateTag);
    });

    // Add x-default alternate
    const defaultTag = document.createElement("link");
    defaultTag.rel = "alternate";
    defaultTag.hreflang = "x-default";
    defaultTag.href = `${baseUrl}/en${pathWithoutLocale}`;
    defaultTag.setAttribute("data-seo", "true");
    document.head.appendChild(defaultTag);
  };

  const addStructuredData = (data: StructuredData) => {
    const scriptTag = document.createElement("script");
    scriptTag.type = "application/ld+json";
    scriptTag.textContent = JSON.stringify(data);
    scriptTag.setAttribute("data-seo", "true");
    document.head.appendChild(scriptTag);
  };

  // Update SEO data
  const updateSEO = (newData: Partial<SEOData>) => {
    seoData.value = {
      ...seoData.value,
      ...newData,
    };
    updateMetaTags();
  };

  // Watch for changes and update meta tags
  watchEffect(() => {
    updateMetaTags();
  });

  // Generate structured data for different page types
  const generateQuizStructuredData = (quiz: QuizData): StructuredData => {
    return {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: quiz.title,
      description: quiz.description,
      url: canonicalUrl.value,
      inLanguage: locale.value,
      educationalLevel: quiz.level,
      educationalUse: "assessment",
      learningResourceType: "quiz",
      author: {
        "@type": "Organization",
        name: "q8m - Quiz 8 Mastery",
      },
      publisher: {
        "@type": "Organization",
        name: "q8m - Quiz 8 Mastery",
        url: getBaseUrl(),
      },
      dateCreated: quiz.createdAt,
      dateModified: quiz.updatedAt,
      numberOfQuestions: quiz.questions?.length ?? 0,
      timeRequired: quiz.estimatedTime ?? "15 minutes",
      category: quiz.category,
      keywords: quiz.tags?.join(", ") ?? "",
    };
  };

  const generatePricingStructuredData = (pricing: PricingData): StructuredData => {
    const offers =
      pricing.plans?.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.description,
        price: plan.price,
        priceCurrency: plan.currency,
        availability: "https://schema.org/InStock",
        url: `${canonicalUrl.value}#${plan.id}`,
        validFrom: new Date().toISOString(),
      })) ?? [];

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "q8m - Frontend Interview Mastery Subscription",
      description:
        "Comprehensive quiz platform with 500+ curated interview questions for mastering Angular, React, Next.js, Redux, TypeScript, and advanced frontend topics",
      url: canonicalUrl.value,
      inLanguage: locale.value,
      offers,
      brand: {
        "@type": "Brand",
        name: "q8m - Quiz 8 Mastery",
      },
      category: "Educational Software",
    };
  };

  const generateOrganizationStructuredData = (): StructuredData => {
    const baseUrl = getBaseUrl();
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "q8m - Quiz 8 Mastery",
      url: baseUrl,
      logo: `${baseUrl}/images/logo.png`,
      description:
        "Professional frontend interview preparation platform with 500+ curated questions covering Angular, React, Next.js, Redux, TypeScript, and advanced topics",
      foundingDate: "2024",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@quiz-platform.com",
      },
      sameAs: ["https://twitter.com/quizplatform", "https://github.com/quiz-platform"],
    };
  };

  const generateWebSiteStructuredData = (): StructuredData => {
    const baseUrl = getBaseUrl();
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "q8m - Quiz 8 Mastery",
      url: baseUrl,
      description:
        "Master frontend development with 500+ curated interview questions. Interactive learning with real-time feedback.",
      publisher: {
        "@type": "Organization",
        name: "q8m - Quiz 8 Mastery",
      },
      inLanguage: ["en", "ar"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
  };

  const generateFAQPageStructuredData = (
    faqs: Array<{ question: string; answer: string }>
  ): StructuredData => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  };

  return {
    seoData: computed(() => seoData.value),
    pageTitle,
    pageDescription,
    canonicalUrl,
    ogImage,
    updateSEO,
    generateQuizStructuredData,
    generatePricingStructuredData,
    generateOrganizationStructuredData,
    generateWebSiteStructuredData,
    generateFAQPageStructuredData,
    updateMetaTags,
  };
}
