/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */
import { config } from "@vue/test-utils";
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import { createApp } from "vue";
import en from "./src/locales/en.json";
import ar from "./src/locales/ar.json";

// Create test app instance
let testApp: any;

// Global test setup
beforeAll(() => {
  // Create a global Pinia instance for tests
  const pinia = createPinia();
  
  // Create i18n instance for tests with actual translations
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {
      en,
      ar,
    },
  });

  // Create Vue app instance
  testApp = createApp({});
  testApp.use(pinia);
  testApp.use(i18n);
  
  config.global.plugins = [pinia, i18n];
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Global test teardown
afterAll(() => {
  // Clean up any global resources
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock performance API
Object.defineProperty(window, "performance", {
  value: {
    getEntriesByType: () => [],
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
});

// Mock document methods
Object.defineProperty(document, "createElement", {
  value: (tagName: string) => ({
    tagName: tagName.toUpperCase(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    click: vi.fn(),
    href: "",
    download: "",
  }),
});

Object.defineProperty(document, "querySelector", {
  value: () => null,
});

Object.defineProperty(document, "querySelectorAll", {
  value: () => [],
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});
