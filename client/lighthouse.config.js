module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000", "http://localhost:3000/en", "http://localhost:3000/ar"],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "categories:pwa": ["error", { minScore: 0.9 }],

        // Core Web Vitals
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "first-input-delay": ["error", { maxNumericValue: 100 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "first-contentful-paint": ["error", { maxNumericValue: 1800 }],
        "speed-index": ["error", { maxNumericValue: 3400 }],

        // Performance metrics
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        interactive: ["error", { maxNumericValue: 3800 }],

        // Resource optimization
        "unused-css-rules": ["warn", { maxLength: 2 }],
        "unused-javascript": ["warn", { maxLength: 2 }],
        "modern-image-formats": "warn",
        "uses-text-compression": "error",
        "uses-optimized-images": "warn",

        // PWA requirements
        "service-worker": "error",
        "installable-manifest": "error",
        "splash-screen": "error",
        "themed-omnibox": "error",
        "content-width": "error",
        viewport: "error",

        // SEO requirements
        "meta-description": "error",
        "document-title": "error",
        "link-text": "warn",
        "is-crawlable": "error",
        "robots-txt": "error",
        "structured-data": "warn",

        // Accessibility requirements
        "color-contrast": "error",
        "image-alt": "error",
        label: "error",
        "button-name": "error",
        "form-field-multiple-labels": "error",
        "html-has-lang": "error",
        "html-lang-valid": "error",

        // Best practices
        "uses-https": "error",
        "no-vulnerable-libraries": "error",
        "csp-xss": "warn",
        "errors-in-console": "warn",
        deprecations: "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
