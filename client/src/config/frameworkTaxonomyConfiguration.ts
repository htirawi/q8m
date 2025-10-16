/**
 * Content Taxonomy
 * Framework, topic, and category mappings
 */

import type { Framework } from "./contentValidationSchemas";

// ─────────────────────────────────────────────────────────────
// Framework Definitions
// ─────────────────────────────────────────────────────────────

export interface IFrameworkConfig {
  id: Framework;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  icon: string;
  color: string;
  description: {
    en: string;
    ar: string;
  };
  topics: string[];
  isActive: boolean;
  order: number;
}

export const FRAMEWORKS: Record<Framework, IFrameworkConfig> = {
  angular: {
    id: "angular",
    name: {
      en: "Angular",
      ar: "أنغولار",
    },
    slug: "angular",
    icon: "angular-icon",
    color: "#DD0031",
    description: {
      en: "Comprehensive Angular framework questions covering components, services, RxJS, and NgRx",
      ar: "أسئلة شاملة حول إطار Angular تغطي المكونات والخدمات و RxJS و NgRx",
    },
    topics: [
      "core-concepts",
      "components",
      "services",
      "routing",
      "forms",
      "http",
      "rxjs",
      "ngrx",
      "signals",
      "testing",
      "performance",
      "ssr",
      "cli",
      "modules",
      "directives",
      "pipes",
      "lifecycle",
      "dependency-injection",
      "change-detection",
      "animations",
    ],
    isActive: true,
    order: 1,
  },
  react: {
    id: "react",
    name: {
      en: "React",
      ar: "رياكت",
    },
    slug: "react",
    icon: "react-icon",
    color: "#61DAFB",
    description: {
      en: "React questions covering hooks, state management, performance, and modern patterns",
      ar: "أسئلة React تغطي الخطافات وإدارة الحالة والأداء والأنماط الحديثة",
    },
    topics: [
      "core-concepts",
      "hooks",
      "components",
      "state-management",
      "routing",
      "context-api",
      "performance",
      "testing",
      "error-boundaries",
      "concurrent-features",
      "server-components",
      "suspense",
      "forms",
      "patterns",
    ],
    isActive: true,
    order: 2,
  },
  nextjs: {
    id: "nextjs",
    name: {
      en: "Next.js",
      ar: "نكست جي إس",
    },
    slug: "nextjs",
    icon: "nextjs-icon",
    color: "#000000",
    description: {
      en: "Next.js questions covering App Router, SSR, SSG, API routes, and deployment",
      ar: "أسئلة Next.js تغطي App Router و SSR و SSG و API routes والنشر",
    },
    topics: [
      "app-router",
      "pages-router",
      "routing",
      "ssr",
      "ssg",
      "isr",
      "csr",
      "api-routes",
      "middleware",
      "image-optimization",
      "performance",
      "caching",
      "deployment",
      "authentication",
      "database",
      "testing",
      "typescript",
    ],
    isActive: true,
    order: 3,
  },
  redux: {
    id: "redux",
    name: {
      en: "Redux",
      ar: "ريدكس",
    },
    slug: "redux",
    icon: "redux-icon",
    color: "#764ABC",
    description: {
      en: "Redux and Redux Toolkit questions covering state management, middleware, and best practices",
      ar: "أسئلة Redux و Redux Toolkit تغطي إدارة الحالة والوسطاء وأفضل الممارسات",
    },
    topics: [
      "basics",
      "actions",
      "reducers",
      "store",
      "middleware",
      "redux-toolkit",
      "thunks",
      "selectors",
      "persistence",
      "devtools",
      "testing",
      "patterns",
      "react-redux",
    ],
    isActive: true,
    order: 4,
  },
  vue: {
    id: "vue",
    name: {
      en: "Vue.js",
      ar: "فيو جي إس",
    },
    slug: "vue",
    icon: "vue-icon",
    color: "#4FC08D",
    description: {
      en: "Vue 3 questions covering Composition API, reactivity, Pinia, and modern patterns",
      ar: "أسئلة Vue 3 تغطي Composition API والتفاعلية و Pinia والأنماط الحديثة",
    },
    topics: [
      "core-concepts",
      "composition-api",
      "options-api",
      "reactivity",
      "components",
      "routing",
      "pinia",
      "vuex",
      "lifecycle",
      "directives",
      "computed",
      "watchers",
      "slots",
      "provide-inject",
      "teleport",
      "suspense",
      "testing",
      "performance",
    ],
    isActive: true,
    order: 5,
  },
  random: {
    id: "random",
    name: {
      en: "Random Topics",
      ar: "مواضيع متنوعة",
    },
    slug: "random",
    icon: "random-icon",
    color: "#6B7280",
    description: {
      en: "Miscellaneous topics including Git, CSS, SASS, TypeScript, Build Tools, and Web APIs",
      ar: "مواضيع متنوعة تشمل Git و CSS و SASS و TypeScript وأدوات البناء و Web APIs",
    },
    topics: [
      "git",
      "css",
      "sass",
      "typescript",
      "javascript",
      "build-tools",
      "webpack",
      "vite",
      "docker",
      "web-apis",
      "performance",
      "security",
      "accessibility",
      "seo",
    ],
    isActive: true,
    order: 6,
  },
};

// ─────────────────────────────────────────────────────────────
// Category Mapping (Source → Canonical)
// ─────────────────────────────────────────────────────────────

export interface ICategoryMapping {
  source: string; // Original category from angular-test
  canonical: string; // Normalized category
  topic: string; // Parent topic
  framework: Framework;
}

/**
 * Maps source categories to canonical taxonomy
 * Built from migration analysis
 */
export const CATEGORY_MAPPINGS: ICategoryMapping[] = [
  // Angular
  { source: "HTTP", canonical: "http", topic: "http", framework: "angular" },
  { source: "RxJS", canonical: "rxjs", topic: "rxjs", framework: "angular" },
  {
    source: "Core Concepts",
    canonical: "core-concepts",
    topic: "core-concepts",
    framework: "angular",
  },
  {
    source: "State Management",
    canonical: "state-management",
    topic: "ngrx",
    framework: "angular",
  },
  { source: "Pipes & Operators", canonical: "pipes", topic: "pipes", framework: "angular" },
  { source: "Lifecycle", canonical: "lifecycle", topic: "lifecycle", framework: "angular" },
  { source: "Forms", canonical: "forms", topic: "forms", framework: "angular" },
  { source: "Routing", canonical: "routing", topic: "routing", framework: "angular" },
  {
    source: "Component Communication",
    canonical: "component-communication",
    topic: "components",
    framework: "angular",
  },
  {
    source: "Dependency Injection",
    canonical: "dependency-injection",
    topic: "dependency-injection",
    framework: "angular",
  },
  { source: "Testing", canonical: "testing", topic: "testing", framework: "angular" },
  { source: "Performance", canonical: "performance", topic: "performance", framework: "angular" },
  {
    source: "Change Detection",
    canonical: "change-detection",
    topic: "change-detection",
    framework: "angular",
  },
  { source: "Signals", canonical: "signals", topic: "signals", framework: "angular" },
  { source: "Angular CLI", canonical: "cli", topic: "cli", framework: "angular" },
  { source: "NgRx", canonical: "ngrx", topic: "ngrx", framework: "angular" },

  // React
  { source: "Hooks", canonical: "hooks", topic: "hooks", framework: "react" },
  { source: "Components", canonical: "components", topic: "components", framework: "react" },
  { source: "Advanced", canonical: "advanced", topic: "patterns", framework: "react" },
  {
    source: "Concurrent Features",
    canonical: "concurrent-features",
    topic: "concurrent-features",
    framework: "react",
  },
  {
    source: "Error Handling",
    canonical: "error-boundaries",
    topic: "error-boundaries",
    framework: "react",
  },

  // Next.js
  { source: "Routing", canonical: "routing", topic: "routing", framework: "nextjs" },
  { source: "SSR", canonical: "ssr", topic: "ssr", framework: "nextjs" },
  { source: "SSG", canonical: "ssg", topic: "ssg", framework: "nextjs" },
  { source: "ISR", canonical: "isr", topic: "isr", framework: "nextjs" },
  { source: "API Routes", canonical: "api-routes", topic: "api-routes", framework: "nextjs" },
  { source: "Middleware", canonical: "middleware", topic: "middleware", framework: "nextjs" },
  { source: "Caching", canonical: "caching", topic: "caching", framework: "nextjs" },
  { source: "Deployment", canonical: "deployment", topic: "deployment", framework: "nextjs" },

  // Redux
  { source: "Redux Basics", canonical: "basics", topic: "basics", framework: "redux" },
  {
    source: "Redux Toolkit",
    canonical: "redux-toolkit",
    topic: "redux-toolkit",
    framework: "redux",
  },
  { source: "Actions", canonical: "actions", topic: "actions", framework: "redux" },
  { source: "Reducers", canonical: "reducers", topic: "reducers", framework: "redux" },
  { source: "Redux Thunks", canonical: "thunks", topic: "thunks", framework: "redux" },
  { source: "Redux Selectors", canonical: "selectors", topic: "selectors", framework: "redux" },

  // Random
  { source: "Git", canonical: "git", topic: "git", framework: "random" },
  { source: "CSS", canonical: "css", topic: "css", framework: "random" },
  { source: "SASS", canonical: "sass", topic: "sass", framework: "random" },
  { source: "TypeScript", canonical: "typescript", topic: "typescript", framework: "random" },
  { source: "Build Tools", canonical: "build-tools", topic: "build-tools", framework: "random" },
  { source: "Web APIs", canonical: "web-apis", topic: "web-apis", framework: "random" },
];

/**
 * Maps source category to canonical category
 */
export function mapCategory(sourceCategory: string, framework: Framework): string {
  const mapping = CATEGORY_MAPPINGS.find(
    (m) => m.source.toLowerCase() === sourceCategory.toLowerCase() && m.framework === framework
  );

  if (mapping) {
    return mapping.canonical;
  }

  // Fallback: kebab-case the source category
  return sourceCategory.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Gets topic from category
 */
export function getCategoryTopic(category: string, framework: Framework): string {
  const mapping = CATEGORY_MAPPINGS.find(
    (m) => m.canonical === category && m.framework === framework
  );

  return mapping?.topic ?? category;
}

// ─────────────────────────────────────────────────────────────
// Framework Utilities
// ─────────────────────────────────────────────────────────────

export function getFrameworkConfig(framework: Framework): IFrameworkConfig {
  return FRAMEWORKS[framework];
}

export function getAllFrameworks(): Framework[] {
  return Object.keys(FRAMEWORKS) as Framework[];
}

export function getActiveFrameworks(): Framework[] {
  return getAllFrameworks().filter((f) => FRAMEWORKS[f].isActive);
}

export function getOrderedFrameworks(): Framework[] {
  return getAllFrameworks().sort((a, b) => FRAMEWORKS[a].order - FRAMEWORKS[b].order);
}

export function getFrameworkTopics(framework: Framework): string[] {
  return FRAMEWORKS[framework].topics;
}

export function isFrameworkActive(framework: Framework): boolean {
  return FRAMEWORKS[framework].isActive;
}
