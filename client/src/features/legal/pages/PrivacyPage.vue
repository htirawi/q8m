<template>
  <div class="privacy-page">
    <!-- Header Section -->
    <div class="privacy-header">
      <div class="container">
        <div class="header-content">
          <div class="breadcrumb">
            <router-link :to="{ name: 'home' }" class="breadcrumb-link">
              {{ $t("legal.breadcrumb.home") }}
            </router-link>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ $t("legal.breadcrumb.privacy") }}</span>
          </div>

          <h1 class="privacy-title">{{ $t("legal.privacy.title") }}</h1>
          <p class="privacy-subtitle">{{ $t("legal.privacy.subtitle") }}</p>

          <div class="last-updated">
            <svg
              class="update-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {{ $t("legal.privacy.lastUpdated") }}: {{ lastUpdated }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="privacy-content">
      <div class="container">
        <div class="content-grid">
          <!-- Table of Contents -->
          <div class="toc-sidebar">
            <div class="toc-card">
              <h3 class="toc-title">{{ $t("legal.privacy.toc.title") }}</h3>
              <nav class="toc-nav">
                <a
                  v-for="section in sections"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="toc-link"
                >
                  {{ $t(section.titleKey) }}
                </a>
              </nav>
            </div>
          </div>

          <!-- Privacy Policy Content -->
          <div class="privacy-main">
            <div class="privacy-card">
              <!-- Introduction -->
              <section id="introduction" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.introduction.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.privacy.introduction.content") }}</p>
                </div>
              </section>

              <!-- Information We Collect -->
              <section id="information-collection" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.informationCollection.title") }}</h2>
                <div class="section-content">
                  <h3 class="subsection-title">
                    {{ $t("legal.privacy.informationCollection.personal.title") }}
                  </h3>
                  <p>{{ $t("legal.privacy.informationCollection.personal.content") }}</p>
                  <ul class="privacy-list">
                    <li>{{ $t("legal.privacy.informationCollection.personal.name") }}</li>
                    <li>{{ $t("legal.privacy.informationCollection.personal.email") }}</li>
                    <li>{{ $t("legal.privacy.informationCollection.personal.profile") }}</li>
                  </ul>

                  <h3 class="subsection-title">
                    {{ $t("legal.privacy.informationCollection.usage.title") }}
                  </h3>
                  <p>{{ $t("legal.privacy.informationCollection.usage.content") }}</p>
                  <ul class="privacy-list">
                    <li>{{ $t("legal.privacy.informationCollection.usage.logs") }}</li>
                    <li>{{ $t("legal.privacy.informationCollection.usage.device") }}</li>
                    <li>{{ $t("legal.privacy.informationCollection.usage.cookies") }}</li>
                  </ul>
                </div>
              </section>

              <!-- How We Use Information -->
              <section id="information-usage" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.informationUsage.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.privacy.informationUsage.content") }}</p>
                  <ul class="privacy-list">
                    <li>{{ $t("legal.privacy.informationUsage.service") }}</li>
                    <li>{{ $t("legal.privacy.informationUsage.communication") }}</li>
                    <li>{{ $t("legal.privacy.informationUsage.improvement") }}</li>
                    <li>{{ $t("legal.privacy.informationUsage.security") }}</li>
                  </ul>
                </div>
              </section>

              <!-- Information Sharing -->
              <section id="information-sharing" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.informationSharing.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.privacy.informationSharing.content") }}</p>
                  <div class="highlight-box">
                    <svg
                      class="highlight-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <p class="highlight-text">
                      {{ $t("legal.privacy.informationSharing.noSell") }}
                    </p>
                  </div>
                </div>
              </section>

              <!-- Data Security -->
              <section id="data-security" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.dataSecurity.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.privacy.dataSecurity.content") }}</p>
                  <ul class="privacy-list">
                    <li>{{ $t("legal.privacy.dataSecurity.encryption") }}</li>
                    <li>{{ $t("legal.privacy.dataSecurity.access") }}</li>
                    <li>{{ $t("legal.privacy.dataSecurity.monitoring") }}</li>
                  </ul>
                </div>
              </section>

              <!-- Your Rights -->
              <section id="your-rights" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.yourRights.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.privacy.yourRights.content") }}</p>
                  <ul class="privacy-list">
                    <li>{{ $t("legal.privacy.yourRights.access") }}</li>
                    <li>{{ $t("legal.privacy.yourRights.correction") }}</li>
                    <li>{{ $t("legal.privacy.yourRights.deletion") }}</li>
                    <li>{{ $t("legal.privacy.yourRights.portability") }}</li>
                  </ul>
                </div>
              </section>

              <!-- Cookies -->
              <section id="cookies" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.cookies.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.privacy.cookies.content") }}</p>
                  <ul class="privacy-list">
                    <li>{{ $t("legal.privacy.cookies.essential") }}</li>
                    <li>{{ $t("legal.privacy.cookies.analytics") }}</li>
                    <li>{{ $t("legal.privacy.cookies.preferences") }}</li>
                  </ul>
                </div>
              </section>

              <!-- Contact -->
              <section id="contact" class="privacy-section">
                <h2 class="section-title">{{ $t("legal.privacy.contact.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.privacy.contact.content") }}</p>
                  <div class="contact-info">
                    <div class="contact-item">
                      <svg
                        class="contact-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>{{ $t("legal.privacy.contact.email") }}: privacy@q8m.com</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer CTA -->
    <div class="privacy-footer">
      <div class="container">
        <div class="footer-cta">
          <h3 class="cta-title">{{ $t("legal.privacy.cta.title") }}</h3>
          <p class="cta-subtitle">{{ $t("legal.privacy.cta.subtitle") }}</p>
          <div class="cta-actions">
            <router-link :to="{ name: 'register' }" class="cta-button primary">
              {{ $t("legal.privacy.cta.getStarted") }}
            </router-link>
            <a href="mailto:privacy@q8m.com" class="cta-button secondary">
              {{ $t("legal.privacy.cta.contact") }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

// Last updated date
const lastUpdated = "January 15, 2024";

// Table of contents sections
const sections = [
  { id: "introduction", titleKey: "legal.privacy.toc.introduction" },
  { id: "information-collection", titleKey: "legal.privacy.toc.informationCollection" },
  { id: "information-usage", titleKey: "legal.privacy.toc.informationUsage" },
  { id: "information-sharing", titleKey: "legal.privacy.toc.informationSharing" },
  { id: "data-security", titleKey: "legal.privacy.toc.dataSecurity" },
  { id: "your-rights", titleKey: "legal.privacy.toc.yourRights" },
  { id: "cookies", titleKey: "legal.privacy.toc.cookies" },
  { id: "contact", titleKey: "legal.privacy.toc.contact" },
];
</script>

<style scoped>
/* Page Layout */
.privacy-page {
  @apply min-h-screen bg-gray-50;
  @apply dark:bg-gray-900;
}

.container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

/* Header Section */
.privacy-header {
  @apply border-b border-gray-200 bg-white;
  @apply dark:border-gray-700 dark:bg-gray-800;
}

.header-content {
  @apply py-12 text-center;
}

.breadcrumb {
  @apply mb-6 flex items-center justify-center gap-2;
  @apply text-sm text-gray-600;
  @apply dark:text-gray-400;
}

.breadcrumb-link {
  @apply transition-colors duration-200 hover:text-primary-600;
  @apply dark:hover:text-primary-400;
}

.breadcrumb-separator {
  @apply text-gray-400;
}

.breadcrumb-current {
  @apply font-medium text-gray-900;
  @apply dark:text-white;
}

.privacy-title {
  @apply mb-4 text-4xl font-bold text-gray-900;
  @apply dark:text-white;
  @apply sm:text-5xl;
}

.privacy-subtitle {
  @apply mb-6 text-xl text-gray-600;
  @apply dark:text-gray-400;
  @apply mx-auto max-w-3xl;
}

.last-updated {
  @apply flex items-center justify-center gap-2;
  @apply text-sm text-gray-500;
  @apply dark:text-gray-400;
}

.update-icon {
  @apply h-4 w-4;
}

/* Main Content */
.privacy-content {
  @apply py-12;
}

.content-grid {
  @apply grid grid-cols-1 gap-8;
  @apply lg:grid-cols-4;
}

/* Table of Contents */
.toc-sidebar {
  @apply lg:col-span-1;
}

.toc-card {
  @apply rounded-xl border border-gray-200 bg-white p-6 shadow-sm;
  @apply dark:border-gray-700 dark:bg-gray-800;
  @apply sticky top-8;
}

.toc-title {
  @apply mb-4 text-lg font-semibold text-gray-900;
  @apply dark:text-white;
}

.toc-nav {
  @apply space-y-2;
}

.toc-link {
  @apply block rounded-lg px-3 py-2 text-sm;
  @apply text-gray-600 hover:bg-primary-50 hover:text-primary-600;
  @apply transition-all duration-200;
  @apply dark:text-gray-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-400;
}

/* Privacy Content */
.privacy-main {
  @apply lg:col-span-3;
}

.privacy-card {
  @apply rounded-xl border border-gray-200 bg-white shadow-sm;
  @apply dark:border-gray-700 dark:bg-gray-800;
  @apply overflow-hidden;
}

.privacy-section {
  @apply border-b border-gray-200 p-8 last:border-b-0;
  @apply dark:border-gray-700;
}

.section-title {
  @apply mb-4 text-2xl font-bold text-gray-900;
  @apply dark:text-white;
}

.subsection-title {
  @apply mb-3 mt-6 text-xl font-semibold text-gray-900;
  @apply dark:text-white;
}

.section-content {
  @apply leading-relaxed text-gray-700;
  @apply dark:text-gray-300;
}

.section-content p {
  @apply mb-4;
}

.privacy-list {
  @apply mb-4 list-inside list-disc space-y-2;
  @apply text-gray-700;
  @apply dark:text-gray-300;
}

/* Highlight Box */
.highlight-box {
  @apply flex items-start gap-3 rounded-lg p-4;
  @apply border border-green-200 bg-green-50;
  @apply dark:border-green-800 dark:bg-green-900/20;
}

.highlight-icon {
  @apply mt-0.5 h-5 w-5 flex-shrink-0 text-green-600;
  @apply dark:text-green-400;
}

.highlight-text {
  @apply font-medium text-green-800;
  @apply dark:text-green-300;
  @apply mb-0;
}

/* Contact Info */
.contact-info {
  @apply space-y-3;
}

.contact-item {
  @apply flex items-center gap-3;
  @apply text-gray-700;
  @apply dark:text-gray-300;
}

.contact-icon {
  @apply h-5 w-5 text-primary-600;
  @apply dark:text-primary-400;
}

/* Footer CTA */
.privacy-footer {
  @apply bg-gradient-to-r from-primary-600 to-primary-700;
  @apply py-16;
}

.footer-cta {
  @apply text-center text-white;
}

.cta-title {
  @apply mb-4 text-3xl font-bold;
  @apply sm:text-4xl;
}

.cta-subtitle {
  @apply mb-8 text-xl opacity-90;
  @apply mx-auto max-w-2xl;
}

.cta-actions {
  @apply flex flex-col gap-4;
  @apply sm:flex-row sm:justify-center;
}

.cta-button {
  @apply inline-flex items-center justify-center px-8 py-3;
  @apply rounded-xl font-semibold transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-offset-2;
}

.cta-button.primary {
  @apply bg-white text-primary-700;
  @apply hover:bg-gray-50 focus:ring-white/30;
  @apply shadow-lg hover:shadow-xl;
}

.cta-button.secondary {
  @apply border-2 border-white text-white;
  @apply hover:bg-white hover:text-primary-700;
  @apply focus:ring-white/30;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .toc-sidebar {
    @apply order-2;
  }

  .privacy-main {
    @apply order-1;
  }

  .toc-card {
    @apply sticky top-0;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
