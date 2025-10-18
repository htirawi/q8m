<script setup lang="ts">
import { useI18n } from "vue-i18n";

useI18n();

// Last updated date
const lastUpdated = "January 15, 2024";

// Table of contents sections
const sections = [
  { id: "introduction", titleKey: "legal.terms.toc.introduction" },
  { id: "acceptance", titleKey: "legal.terms.toc.acceptance" },
  { id: "service-description", titleKey: "legal.terms.toc.serviceDescription" },
  { id: "user-accounts", titleKey: "legal.terms.toc.userAccounts" },
  { id: "payment-terms", titleKey: "legal.terms.toc.paymentTerms" },
  { id: "prohibited-uses", titleKey: "legal.terms.toc.prohibitedUses" },
  { id: "intellectual-property", titleKey: "legal.terms.toc.intellectualProperty" },
  { id: "termination", titleKey: "legal.terms.toc.termination" },
  { id: "disclaimers", titleKey: "legal.terms.toc.disclaimers" },
  { id: "limitation-liability", titleKey: "legal.terms.toc.limitationLiability" },
  { id: "governing-law", titleKey: "legal.terms.toc.governingLaw" },
  { id: "changes-terms", titleKey: "legal.terms.toc.changesTerms" },
  { id: "contact", titleKey: "legal.terms.toc.contact" },
];
</script>

<template>
  <div class="terms-page">
    <!-- Header Section -->
    <div class="terms-header">
      <div class="container">
        <div class="header-content">
          <div class="breadcrumb">
            <router-link :to="{ name: 'home' }" class="breadcrumb-link">
              {{ $t("legal.breadcrumb.home") }}
            </router-link>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ $t("legal.breadcrumb.terms") }} </span>
          </div>

          <h1 class="terms-title">{{ $t("legal.terms.title") }}</h1>
          <p class="terms-subtitle">{{ $t("legal.terms.subtitle") }}</p>

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
            {{ $t("legal.terms.lastUpdated") }}: {{ lastUpdated }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="terms-content">
      <div class="container">
        <div class="content-grid">
          <!-- Table of Contents -->
          <div class="toc-sidebar">
            <div class="toc-card">
              <h3 class="toc-title">{{ $t("legal.terms.toc.title") }}</h3>
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

          <!-- Terms of Service Content -->
          <div class="terms-main">
            <div class="terms-card">
              <!-- Introduction -->
              <section id="introduction" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.introduction.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.introduction.content") }}</p>
                </div>
              </section>

              <!-- Acceptance of Terms -->
              <section id="acceptance" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.acceptance.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.acceptance.content") }}</p>
                </div>
              </section>

              <!-- Service Description -->
              <section id="service-description" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.serviceDescription.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.serviceDescription.content") }}</p>
                  <ul class="terms-list">
                    <li>{{ $t("legal.terms.serviceDescription.features.interview") }}</li>
                    <li>{{ $t("legal.terms.serviceDescription.features.practice") }}</li>
                    <li>{{ $t("legal.terms.serviceDescription.features.analytics") }}</li>
                    <li>{{ $t("legal.terms.serviceDescription.features.support") }}</li>
                  </ul>
                </div>
              </section>

              <!-- User Accounts -->
              <section id="user-accounts" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.userAccounts.title") }}</h2>
                <div class="section-content">
                  <h3 class="subsection-title">
                    {{ $t("legal.terms.userAccounts.registration.title") }}
                  </h3>
                  <p>{{ $t("legal.terms.userAccounts.registration.content") }}</p>

                  <h3 class="subsection-title">
                    {{ $t("legal.terms.userAccounts.responsibilities.title") }}
                  </h3>
                  <ul class="terms-list">
                    <li>{{ $t("legal.terms.userAccounts.responsibilities.accurate") }}</li>
                    <li>{{ $t("legal.terms.userAccounts.responsibilities.security") }}</li>
                    <li>{{ $t("legal.terms.userAccounts.responsibilities.activity") }}</li>
                  </ul>
                </div>
              </section>

              <!-- Payment Terms -->
              <section id="payment-terms" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.paymentTerms.title") }}</h2>
                <div class="section-content">
                  <h3 class="subsection-title">
                    {{ $t("legal.terms.paymentTerms.subscription.title") }}
                  </h3>
                  <p>{{ $t("legal.terms.paymentTerms.subscription.content") }}</p>

                  <h3 class="subsection-title">
                    {{ $t("legal.terms.paymentTerms.billing.title") }}
                  </h3>
                  <p>{{ $t("legal.terms.paymentTerms.billing.content") }}</p>

                  <h3 class="subsection-title">
                    {{ $t("legal.terms.paymentTerms.refunds.title") }}
                  </h3>
                  <p>{{ $t("legal.terms.paymentTerms.refunds.content") }}</p>
                </div>
              </section>

              <!-- Prohibited Uses -->
              <section id="prohibited-uses" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.prohibitedUses.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.prohibitedUses.content") }}</p>
                  <ul class="terms-list">
                    <li>{{ $t("legal.terms.prohibitedUses.illegal") }}</li>
                    <li>{{ $t("legal.terms.prohibitedUses.harassment") }}</li>
                    <li>{{ $t("legal.terms.prohibitedUses.security") }}</li>
                    <li>{{ $t("legal.terms.prohibitedUses.unauthorized") }}</li>
                    <li>{{ $t("legal.terms.prohibitedUses.automation") }}</li>
                  </ul>
                </div>
              </section>

              <!-- Intellectual Property -->
              <section id="intellectual-property" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.intellectualProperty.title") }}</h2>
                <div class="section-content">
                  <h3 class="subsection-title">
                    {{ $t("legal.terms.intellectualProperty.ourContent.title") }}
                  </h3>
                  <p>{{ $t("legal.terms.intellectualProperty.ourContent.content") }}</p>

                  <h3 class="subsection-title">
                    {{ $t("legal.terms.intellectualProperty.userContent.title") }}
                  </h3>
                  <p>{{ $t("legal.terms.intellectualProperty.userContent.content") }}</p>
                </div>
              </section>

              <!-- Termination -->
              <section id="termination" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.termination.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.termination.content") }}</p>
                  <ul class="terms-list">
                    <li>{{ $t("legal.terms.termination.violation") }}</li>
                    <li>{{ $t("legal.terms.termination.fraud") }}</li>
                    <li>{{ $t("legal.terms.termination.discontinuation") }}</li>
                  </ul>
                </div>
              </section>

              <!-- Disclaimers -->
              <section id="disclaimers" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.disclaimers.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.disclaimers.content") }}</p>
                </div>
              </section>

              <!-- Limitation of Liability -->
              <section id="limitation-liability" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.limitationLiability.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.limitationLiability.content") }}</p>
                </div>
              </section>

              <!-- Governing Law -->
              <section id="governing-law" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.governingLaw.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.governingLaw.content") }}</p>
                </div>
              </section>

              <!-- Changes to Terms -->
              <section id="changes-terms" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.changesTerms.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.changesTerms.content") }}</p>
                </div>
              </section>

              <!-- Contact Information -->
              <section id="contact" class="terms-section">
                <h2 class="section-title">{{ $t("legal.terms.contact.title") }}</h2>
                <div class="section-content">
                  <p>{{ $t("legal.terms.contact.content") }}</p>
                  <div class="contact-info">
                    <p>
                      <strong>{{ $t("legal.terms.contact.email") }} </strong>: support@q8m.dev
                    </p>
                    <p>
                      <strong>{{ $t("legal.terms.contact.address") }} </strong>
                    </p>
                    <address class="address">
                      {{ $t("legal.terms.contact.addressLine1") }}

                      <br />
                      {{ $t("legal.terms.contact.addressLine2") }}

                      <br />
                      {{ $t("legal.terms.contact.country") }}
                    </address>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.terms-page {
  @apply min-h-screen bg-gray-50;
  @apply dark:bg-gray-900;
}

.container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

/* Header Styles */
.terms-header {
  @apply border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800;
  @apply py-8;
}

.header-content {
  @apply text-center;
}

.breadcrumb {
  @apply mb-4 flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400;
}

.breadcrumb-link {
  @apply transition-colors hover:text-blue-600 dark:hover:text-blue-400;
}

.breadcrumb-separator {
  @apply text-gray-400;
}

.breadcrumb-current {
  @apply font-medium text-gray-900 dark:text-white;
}

.terms-title {
  @apply mb-4 text-4xl font-bold text-gray-900 dark:text-white;
}

.terms-subtitle {
  @apply mx-auto mb-6 max-w-3xl text-lg text-gray-600 dark:text-gray-400;
}

.last-updated {
  @apply inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400;
}

.update-icon {
  @apply h-4 w-4;
}

/* Content Layout */
.terms-content {
  @apply py-12;
}

.content-grid {
  @apply grid grid-cols-1 gap-8 lg:grid-cols-4;
}

/* Table of Contents */
.toc-sidebar {
  @apply lg:col-span-1;
}

.toc-card {
  @apply sticky top-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800;
}

.toc-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.toc-nav {
  @apply space-y-2;
}

.toc-link {
  @apply block text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400;
  @apply py-1 transition-colors;
}

/* Main Content */
.terms-main {
  @apply lg:col-span-3;
}

.terms-card {
  @apply rounded-lg bg-white p-8 shadow-md dark:bg-gray-800;
}

.terms-section {
  @apply mb-12 last:mb-0;
}

.section-title {
  @apply mb-4 text-2xl font-bold text-gray-900 dark:text-white;
}

.subsection-title {
  @apply mb-3 mt-6 text-xl font-semibold text-gray-900 dark:text-white;
}

.section-content {
  @apply leading-relaxed text-gray-700 dark:text-gray-300;
}

.section-content p {
  @apply mb-4;
}

.terms-list {
  @apply mb-4 ml-4 list-inside list-disc space-y-2;
}

.terms-list li {
  @apply text-gray-700 dark:text-gray-300;
}

.contact-info {
  @apply mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700;
}

.contact-info p {
  @apply mb-2;
}

.address {
  @apply not-italic text-gray-700 dark:text-gray-300;
}

/* Responsive Design */
@media (width <= 1024px) {
  .content-grid {
    @apply grid-cols-1;
  }

  .toc-sidebar {
    @apply order-2;
  }

  .terms-main {
    @apply order-1;
  }

  .toc-card {
    @apply relative sticky top-0;
  }
}

/* Print Styles */
@media print {
  .toc-sidebar {
    @apply hidden;
  }

  .terms-main {
    @apply lg:col-span-1;
  }

  .terms-page {
    @apply bg-white;
  }

  .terms-header,
  .terms-content {
    @apply bg-white;
  }

  .terms-card {
    @apply border border-gray-300 shadow-none;
  }
}
</style>
