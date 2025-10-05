/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
}

const defaultSEO: SEOData = {
  title: "Vue 3 Quiz Platform - Learn with Interactive Quizzes",
  description:
    "Master Vue 3, React, Angular, and more with our comprehensive quiz platform. Interactive learning, real-time feedback, and expert-level content.",
  keywords: [
    "vue 3",
    "react",
    "angular",
    "javascript",
    "quiz",
    "learning",
    "programming",
    "frontend",
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
    const baseTitle = seoData.value.title || defaultSEO.title;
    const siteName = t("seo.siteName", "Vue 3 Quiz Platform");
    return `${baseTitle} | ${siteName}`;
  });

  const pageDescription = computed(() => {
    return seoData.value.description || defaultSEO.description;
  });

  const canonicalUrl = computed(() => {
    if (seoData.value.canonical) {
      return seoData.value.canonical;
    }

    const baseUrl = import.meta.env.VITE_CLIENT_URL || "https://quiz-platform.com";
    const path = route.fullPath;
    return `${baseUrl}${path}`;
  });

  const ogImage = computed(() => {
    return (
      seoData.value.ogImage ||
      `${import.meta.env.VITE_CLIENT_URL || "https://quiz-platform.com"}/images/og-default.jpg`
    );
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
    addMetaTag("og:title", seoData.value.ogTitle || pageTitle.value, "property");
    addMetaTag("og:description", seoData.value.ogDescription || pageDescription.value, "property");
    addMetaTag("og:image", ogImage.value, "property");
    addMetaTag("og:type", seoData.value.ogType || "website", "property");
    addMetaTag("og:url", seoData.value.ogUrl || canonicalUrl.value, "property");
    addMetaTag("og:site_name", t("seo.siteName", "Vue 3 Quiz Platform"), "property");
    addMetaTag("og:locale", locale.value, "property");

    // Twitter Card tags
    addMetaTag("twitter:card", seoData.value.twitterCard || "summary_large_image", "name");
    addMetaTag("twitter:site", seoData.value.twitterSite || "@quizplatform", "name");
    addMetaTag("twitter:creator", seoData.value.twitterCreator || "@quizplatform", "name");
    addMetaTag("twitter:title", seoData.value.twitterTitle || pageTitle.value, "name");
    addMetaTag(
      "twitter:description",
      seoData.value.twitterDescription || pageDescription.value,
      "name"
    );
    addMetaTag("twitter:image", seoData.value.twitterImage || ogImage.value, "name");

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
    const baseUrl = import.meta.env.VITE_CLIENT_URL || "https://quiz-platform.com";
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

  const addStructuredData = (data: Record<string, any>) => {
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
  const generateQuizStructuredData = (quiz: any) => {
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
        name: "Vue 3 Quiz Platform",
      },
      publisher: {
        "@type": "Organization",
        name: "Vue 3 Quiz Platform",
        url: import.meta.env.VITE_CLIENT_URL || "https://quiz-platform.com",
      },
      dateCreated: quiz.createdAt,
      dateModified: quiz.updatedAt,
      numberOfQuestions: quiz.questions?.length || 0,
      timeRequired: quiz.estimatedTime,
      category: quiz.category,
      keywords: quiz.tags?.join(", ") || "",
    };
  };

  const generatePricingStructuredData = (pricing: any) => {
    const offers =
      pricing.plans?.map((plan: any) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.description,
        price: plan.price,
        priceCurrency: plan.currency,
        availability: "https://schema.org/InStock",
        url: `${canonicalUrl.value}#${plan.id}`,
        validFrom: new Date().toISOString(),
      })) || [];

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Vue 3 Quiz Platform Subscription",
      description: "Comprehensive quiz platform for learning Vue 3, React, Angular, and more",
      url: canonicalUrl.value,
      inLanguage: locale.value,
      offers,
      brand: {
        "@type": "Brand",
        name: "Vue 3 Quiz Platform",
      },
      category: "Educational Software",
    };
  };

  const generateOrganizationStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Vue 3 Quiz Platform",
      url: import.meta.env.VITE_CLIENT_URL || "https://quiz-platform.com",
      logo: `${import.meta.env.VITE_CLIENT_URL || "https://quiz-platform.com"}/images/logo.png`,
      description: "Interactive quiz platform for learning modern web development",
      foundingDate: "2024",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "support@quiz-platform.com",
      },
      sameAs: ["https://twitter.com/quizplatform", "https://github.com/quiz-platform"],
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
    updateMetaTags,
  };
}
