<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import Input from "@/components/ui/Input.vue";
import FormField from "@/components/ui/FormField.vue";
import { useI18n } from "vue-i18n";

// Form state
const { t } = useI18n();
const email = ref("");
const framework = ref<string[]>([]);
const isDropdownOpen = ref(false);

// Design system state
const selectedButtonStyle = ref("primary");
const selectedButtonSize = ref("md");

// Validation
const emailError = computed(() => {
  if (!email.value) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value) ? "" : t("home.demo.form.validation.email");
});

const isFormValid = computed(() => {
  return email.value && !emailError.value && framework.value && framework.value.length > 0;
});

// Dynamic button classes based on selection
const submitButtonClass = computed(() => {
  return `demo-btn demo-btn--${selectedButtonStyle.value} demo-btn--${selectedButtonSize.value}`;
});

const cancelButtonClass = computed(() => {
  return `demo-btn demo-btn--outline demo-btn--${selectedButtonSize.value}`;
});

// Framework options
const frameworkOptions = [
  { value: "vue", labelKey: "home.hero.techStack.vue" },
  { value: "react", labelKey: "home.hero.techStack.react" },
  { value: "angular", labelKey: "home.hero.techStack.angular" },
  { value: "nextjs", labelKey: "home.hero.techStack.nextjs" },
  { value: "nuxt", labelKey: "home.hero.techStack.nuxt" },
  { value: "svelte", labelKey: "home.hero.techStack.svelte" },
  { value: "sveltekit", labelKey: "home.hero.techStack.sveltekit" },
  { value: "typescript", labelKey: "home.hero.techStack.typescript" },
  { value: "javascript", labelKey: "home.hero.techStack.javascript" },
  { value: "nodejs", labelKey: "home.hero.techStack.nodejs" },
  { value: "express", labelKey: "home.hero.techStack.express" },
  { value: "nestjs", labelKey: "home.hero.techStack.nestjs" },
];

// Helper function to get framework label
const getFrameworkLabel = (value: string) => {
  const option = frameworkOptions.find((opt) => opt.value === value);
  return option ? t(option.labelKey) : value;
  optiont;
};

// Multi-select methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleFramework = (value: string) => {
  const index = framework.value.indexOf(value);
  if (index > -1) {
    framework.value.splice(index, 1);
  } else {
    framework.value.push(value);
  }
};

const removeFramework = (value: string) => {
  const index = framework.value.indexOf(value);
  if (index > -1) {
    framework.value.splice(index, 1);
  }
};

const clearAll = () => {
  framework.value = [];
};

// Form submission handler
const handleSubmit = () => {
  if (!isFormValid.value) return;

  // Show success message
  alert(
    `Form submitted successfully!\n\nEmail: ${email.value}\nFrameworks: ${framework.value.map((f) => getFrameworkLabel(f)).join(", ")}`
  );

  // Reset form
  email.value = "";
  framework.value = [];
};

const handleCancel = () => {
  // Reset form
  email.value = "";
  framework.value = [];
};

// Design system button selection handlers
// const selectButtonStyle = (style: string) => {
//   selectedButtonStyle.value = style;
// };

// const selectButtonSize = (size: string) => {
//   selectedButtonSize.value = size;
// };

// Click outside handler
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".multi-select-wrapper")) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <section class="design-system-demo" aria-labelledby="demo-title">
    <!-- Hero Section -->
    <div class="demo-hero">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">
            <div class="badge-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span class="badge-text">{{ $t("home.demo.badge") }} </span>
          </div>
          <h1 id="demo-title" class="hero-title">
            {{ $t("home.demo.title") }}
          </h1>
          <p class="hero-description">
            {{ $t("home.demo.description") }}
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">50+</span>
              <span class="stat-label">{{ $t("home.demo.stats.components") }} </span>
            </div>
            <div class="stat-item">
              <span class="stat-number">100%</span>
              <span class="stat-label">{{ $t("home.demo.stats.accessible") }} </span>
            </div>
            <div class="stat-item">
              <span class="stat-number">0.5s</span>
              <span class="stat-label">{{ $t("home.demo.stats.loadTime") }} </span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-cards">
            <div class="floating-card card-1">
              <div class="card-header">
                <div class="card-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="card-title">{{ $t("home.demo.cards.button") }} </span>
              </div>
              <div class="card-content">
                <div class="mini-button primary">Primary</div>
                <div class="mini-button secondary">Secondary</div>
              </div>
            </div>
            <div class="floating-card card-2">
              <div class="card-header">
                <div class="card-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="card-title">{{ $t("home.demo.cards.form") }} </span>
              </div>
              <div class="card-content">
                <div class="mini-input"></div>
                <div class="mini-select"></div>
              </div>
            </div>
            <div class="floating-card card-3">
              <div class="card-header">
                <div class="card-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="card-title">{{ $t("home.demo.cards.state") }} </span>
              </div>
              <div class="card-content">
                <div class="mini-spinner"></div>
                <div class="mini-success"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Showcase -->
    <div class="showcase-section">
      <div class="showcase-container">
        <div class="showcase-header">
          <h2 class="showcase-title">{{ $t("home.demo.showcase.title") }}</h2>
          <p class="showcase-subtitle">
            {{ $t("home.demo.showcase.subtitle") }}
          </p>
        </div>

        <div class="showcase-grid">
          <!-- Button System -->
          <div class="showcase-panel">
            <div class="panel-header">
              <div class="panel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              </div>
              <div class="panel-info">
                <h3 class="panel-title">Button System</h3>
                <p class="panel-description">
                  Multiple variants, sizes, and states for every use case
                </p>
                <div class="panel-badge">
                  <span class="badge-dot"></span>
                  <span class="badge-text">8 Variants</span>
                </div>
              </div>
            </div>
            <div class="panel-content">
              <div class="button-showcase">
                <div class="button-group">
                  <div class="group-header">
                    <div class="group-label">Size Variations</div>
                    <div class="group-description">Responsive sizing for all devices</div>
                  </div>
                  <div class="button-row">
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--primary demo-btn--sm">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          </svg>
                          Small
                        </button>
                      </div>
                      <div class="button-label">Small</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--primary demo-btn--md">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          </svg>
                          Medium
                        </button>
                      </div>
                      <div class="button-label">Medium</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--primary demo-btn--lg">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          </svg>
                          Large
                        </button>
                      </div>
                      <div class="button-label">Large</div>
                    </div>
                  </div>
                </div>
                <div class="button-group">
                  <div class="group-header">
                    <div class="group-label">Style Variants</div>
                    <div class="group-description">
                      Different visual styles for various contexts
                    </div>
                  </div>
                  <div class="button-row">
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--primary demo-btn--md">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                          Primary
                        </button>
                      </div>
                      <div class="button-label">Primary</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--secondary demo-btn--md">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M9 12l2 2 4-4" />
                          </svg>
                          Secondary
                        </button>
                      </div>
                      <div class="button-label">Secondary</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--outline demo-btn--md">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Outline
                        </button>
                      </div>
                      <div class="button-label">Outline</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--destructive demo-btn--md">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                            />
                          </svg>
                          Destructive
                        </button>
                      </div>
                      <div class="button-label">Destructive</div>
                    </div>
                  </div>
                </div>
                <div class="button-group">
                  <div class="group-header">
                    <div class="group-label">Interactive States</div>
                    <div class="group-description">Loading, disabled, and special states</div>
                  </div>
                  <div class="button-row">
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--primary demo-btn--md demo-btn--loading">
                          <div class="loading-spinner"></div>
                          Loading...
                        </button>
                      </div>
                      <div class="button-label">Loading</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--primary demo-btn--md" disabled>
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                          Disabled
                        </button>
                      </div>
                      <div class="button-label">Disabled</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--ghost demo-btn--md">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M9 12l2 2 4-4" />
                          </svg>
                          Ghost
                        </button>
                      </div>
                      <div class="button-label">Ghost</div>
                    </div>
                    <div class="button-item">
                      <div class="button-preview">
                        <button class="demo-btn demo-btn--success demo-btn--md">
                          <svg
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M9 12l2 2 4-4" />
                          </svg>
                          Success
                        </button>
                      </div>
                      <div class="button-label">Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form System -->
          <div class="showcase-panel">
            <div class="panel-header">
              <div class="panel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div class="panel-info">
                <h3 class="panel-title">Form Elements</h3>
                <p class="panel-description">
                  Professional form components with real-time validation
                </p>
                <div class="panel-badge">
                  <span class="badge-dot"></span>
                  <span class="badge-text">Live Validation</span>
                </div>
              </div>
            </div>
            <div class="panel-content">
              <div class="form-showcase">
                <div class="form-section">
                  <div class="form-section-header">
                    <h4 class="form-section-title">Input Fields</h4>
                    <p class="form-section-description">Text inputs with validation states</p>
                  </div>
                  <div class="form-row">
                    <FormField :label="$t('home.demo.email')" :error="emailError" required>
                      <div class="email-input-wrapper">
                        <Input
                          v-model="email"
                          type="email"
                          :placeholder="$t('home.demo.emailPlaceholder')"
                          :aria-describedby="emailError ? 'email-error' : undefined"
                          class="unified-input"
                        />
                      </div>
                    </FormField>
                  </div>
                </div>
                <div class="form-section">
                  <div class="form-section-header">
                    <h4 class="form-section-title">Selection Controls</h4>
                    <p class="form-section-description">Dropdowns and multi-select components</p>
                  </div>
                  <div class="form-row">
                    <FormField
                      :label="$t('home.demo.framework')"
                      :helper-text="$t('home.demo.frameworkHelp')"
                    >
                      <div class="enhanced-select-container">
                        <div class="multi-select-wrapper">
                          <div class="multi-select-trigger" @click="toggleDropdown">
                            <div class="selected-display">
                              <span v-if="framework.length === 0" class="placeholder">
                                {{ $t("home.demo.selectFramework") }}
                              </span>
                              <span v-else-if="framework.length === 1" class="single-selection">
                                {{ getFrameworkLabel(framework[0] || "") }}
                              </span>
                              <span v-else class="multiple-selection">
                                {{ framework.length }} frameworks selected
                              </span>
                            </div>
                            <div class="dropdown-icon" :class="{ open: isDropdownOpen }">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>

                          <div v-if="isDropdownOpen" class="multi-select-dropdown">
                            <div class="dropdown-header">
                              <span class="dropdown-title">Select frameworks</span>
                              <button
                                @click="clearAll"
                                class="clear-all-btn"
                                v-if="framework.length > 0"
                              >
                                Clear all
                              </button>
                            </div>
                            <div class="dropdown-options">
                              <label
                                v-for="option in frameworkOptions"
                                :key="option.value"
                                class="option-item"
                              >
                                <input
                                  type="checkbox"
                                  :value="option.value"
                                  :checked="framework.includes(option.value)"
                                  @change="toggleFramework(option.value)"
                                  class="option-checkbox"
                                />
                                <span class="option-label">{{ $t(option.labelKey) }} </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div v-if="framework.length > 0" class="selected-frameworks">
                          <div class="selected-count">
                            {{ framework.length }} framework{{ framework.length > 1 ? "s" : "" }}
                            selected
                          </div>
                          <div class="selected-tags">
                            <span
                              v-for="(selectedFramework, index) in framework.slice(0, 3)"
                              :key="index"
                              class="framework-tag"
                            >
                              {{ getFrameworkLabel(selectedFramework) }}

                              <button
                                @click="removeFramework(selectedFramework)"
                                class="remove-tag"
                              >
                                ×
                              </button>
                            </span>
                            <span v-if="framework.length > 3" class="more-count">
                              +{{ framework.length - 3 }}

                              more
                            </span>
                          </div>
                        </div>
                      </div>
                    </FormField>
                  </div>
                </div>
                <div class="form-section">
                  <div class="form-section-header">
                    <h4 class="form-section-title">Actions</h4>
                    <p class="form-section-description">Form submission and navigation</p>
                  </div>
                  <div class="form-actions">
                    <button
                      :class="submitButtonClass"
                      :disabled="!isFormValid"
                      @click="handleSubmit"
                    >
                      <svg
                        class="btn-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      {{ $t("home.demo.submit") }}
                    </button>
                    <button :class="cancelButtonClass" @click="handleCancel">
                      <svg
                        class="btn-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {{ $t("home.demo.cancel") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- State Management -->
    <div class="state-section">
      <div class="state-container">
        <div class="state-header">
          <h2 class="state-title">State Management</h2>
          <p class="state-subtitle">Robust feedback systems for optimal user experience</p>
        </div>

        <div class="state-grid">
          <div class="state-card state-card--loading">
            <div class="state-header-card">
              <div class="state-icon">
                <div class="loading-spinner"></div>
              </div>
              <div class="state-info">
                <h3 class="state-card-title">Loading States</h3>
                <p class="state-card-description">
                  Smooth loading indicators with customizable animations
                </p>
              </div>
            </div>
            <div class="state-preview">
              <div class="preview-spinner"></div>
              <span class="preview-text">Loading content...</span>
            </div>
          </div>

          <div class="state-card state-card--empty">
            <div class="state-header-card">
              <div class="state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div class="state-info">
                <h3 class="state-card-title">Empty States</h3>
                <p class="state-card-description">Elegant empty states that guide user actions</p>
              </div>
            </div>
            <div class="state-preview">
              <div class="preview-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <span class="preview-text">No data available</span>
              </div>
            </div>
          </div>

          <div class="state-card state-card--error">
            <div class="state-header-card">
              <div class="state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div class="state-info">
                <h3 class="state-card-title">Error Handling</h3>
                <p class="state-card-description">Clear error messages with actionable solutions</p>
              </div>
            </div>
            <div class="state-preview">
              <div class="preview-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span class="preview-text">Something went wrong</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Design Principles -->
    <div class="principles-section">
      <div class="principles-container">
        <div class="principles-header">
          <h2 class="principles-title">Design Principles</h2>
          <p class="principles-subtitle">
            Built with accessibility, consistency, and performance in mind
          </p>
        </div>

        <div class="principles-grid">
          <div class="principle-card">
            <div class="principle-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
              </svg>
            </div>
            <h3 class="principle-title">Accessible</h3>
            <p class="principle-description">
              WCAG 2.1 AA compliant with full keyboard navigation and screen reader support
            </p>
            <div class="principle-badge">WCAG 2.1 AA</div>
          </div>

          <div class="principle-card">
            <div class="principle-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </div>
            <h3 class="principle-title">Consistent</h3>
            <p class="principle-description">
              Unified design language with standardized spacing, typography, and color systems
            </p>
            <div class="principle-badge">Design Tokens</div>
          </div>

          <div class="principle-card">
            <div class="principle-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 class="principle-title">Performant</h3>
            <p class="principle-description">
              Optimized for speed with minimal bundle impact and lazy loading
            </p>
            <div class="principle-badge">0.5s Load</div>
          </div>

          <div class="principle-card">
            <div class="principle-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 class="principle-title">Responsive</h3>
            <p class="principle-description">
              Mobile-first design that works seamlessly across all devices and screen sizes
            </p>
            <div class="principle-badge">Mobile First</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ===== HERO SECTION ===== */
.design-system-demo {
  @apply relative overflow-hidden;
}

.demo-hero {
  @apply bg-gradient-to-br from-slate-50 via-white to-blue-50 py-32 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900;

  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.demo-hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgb(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgb(139, 92, 246, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgb(255, 255, 255, 0.8) 0%, rgb(248, 250, 252, 0.4) 100%);
  pointer-events: none;
}

.hero-container {
  @apply container mx-auto px-4;

  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  @apply space-y-8;
}

.hero-badge {
  @apply inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 text-sm font-semibold text-blue-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300;

  backdrop-filter: blur(10px);
  border: 1px solid rgb(59, 130, 246, 0.2);
}

.badge-icon {
  @apply h-5 w-5 text-blue-600 dark:text-blue-400;
}

.hero-title {
  @apply text-6xl font-bold text-slate-900 dark:text-white md:text-7xl lg:text-8xl;

  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 30%, #8b5cf6 70%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.dark .hero-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 30%, #8b5cf6 70%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  @apply text-xl leading-relaxed text-slate-600 dark:text-slate-300 md:text-2xl;

  max-width: 32rem;
}

.hero-stats {
  @apply flex gap-8;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-3xl font-bold text-slate-900 dark:text-white md:text-4xl;

  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  @apply text-sm font-medium text-slate-500 dark:text-slate-400;
}

/* Floating Cards */
.hero-visual {
  @apply relative;
}

.floating-cards {
  @apply relative h-96;
}

.floating-card {
  @apply absolute rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800;

  backdrop-filter: blur(20px);
  border: 1px solid rgb(255, 255, 255, 0.2);
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 0;
  left: 0;
  width: 200px;
  animation-delay: 0s;
}

.card-2 {
  top: 80px;
  right: 0;
  width: 220px;
  animation-delay: 2s;
}

.card-3 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  animation-delay: 4s;
}

.card-header {
  @apply mb-4 flex items-center justify-between;
}

.card-dots {
  @apply flex gap-1.5;
}

.dot {
  @apply h-2 w-2 rounded-full;
}

.dot.red {
  @apply bg-red-500;
}

.dot.yellow {
  @apply bg-yellow-500;
}

.dot.green {
  @apply bg-green-500;
}

.card-title {
  @apply text-sm font-semibold text-slate-700 dark:text-slate-300;
}

.card-content {
  @apply space-y-3;
}

.mini-button {
  @apply rounded-lg px-3 py-2 text-xs font-medium;
}

.mini-button.primary {
  @apply bg-blue-600 text-white;
}

.mini-button.secondary {
  @apply bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300;
}

.mini-input {
  @apply h-8 rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-700;
}

.mini-select {
  @apply h-8 rounded-lg bg-slate-600;
}

.mini-spinner {
  @apply h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600;
}

.mini-success {
  @apply h-6 w-6 rounded-full bg-green-500;
}

/* ===== SHOWCASE SECTION ===== */
.showcase-section {
  @apply bg-white py-24 dark:bg-slate-900;
}

.showcase-container {
  @apply container mx-auto px-4;
}

.showcase-header {
  @apply mb-16 text-center;
}

.showcase-title {
  @apply mb-6 text-5xl font-bold text-slate-900 dark:text-white md:text-6xl;

  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .showcase-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.showcase-subtitle {
  @apply mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300;
}

.showcase-grid {
  @apply grid grid-cols-1 gap-6 lg:grid-cols-2;
}

.showcase-panel {
  @apply rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800;

  background: linear-gradient(135deg, rgb(255, 255, 255, 0.9) 0%, rgb(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgb(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.showcase-panel:hover {
  @apply shadow-2xl;

  transform: translateY(-4px);
}

.dark .showcase-panel {
  background: linear-gradient(135deg, rgb(30, 41, 59, 0.9) 0%, rgb(51, 65, 85, 0.9) 100%);
  border: 1px solid rgb(71, 85, 105, 0.8);
}

.showcase-panel--wide {
  @apply lg:col-span-2;
}

.panel-header {
  @apply mb-8 flex items-start gap-4;
}

.panel-icon {
  @apply flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400;

  box-shadow: 0 4px 12px rgb(59, 130, 246, 0.15);
}

.panel-info {
  @apply flex-1;
}

.panel-title {
  @apply mb-2 text-2xl font-bold text-slate-900 dark:text-white;
}

.panel-description {
  @apply mb-3 text-slate-600 dark:text-slate-300;
}

.panel-badge {
  @apply inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 text-xs font-semibold text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300;
}

.badge-dot {
  @apply h-2 w-2 rounded-full bg-green-500;

  animation: pulse 2s infinite;
}

.badge-text {
  @apply text-xs font-medium;
}

.panel-content {
  @apply space-y-8;
}

.button-showcase {
  @apply space-y-8;
}

.button-group {
  @apply space-y-6;
}

.group-header {
  @apply mb-4;
}

.group-label {
  @apply mb-1 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300;
}

.group-description {
  @apply text-xs text-slate-500 dark:text-slate-400;
}

.button-row {
  @apply grid grid-cols-2 gap-6 md:grid-cols-4;
}

.button-item {
  @apply space-y-3;
}

.button-preview {
  @apply flex justify-center rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800;

  border: 1px solid rgb(226, 232, 240, 0.8);
  transition: all 0.2s ease;
  min-height: 60px;
}

.button-preview:hover {
  @apply bg-slate-50 dark:bg-slate-700;

  border-color: rgb(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgb(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

/* Ensure buttons are visible */
.button-preview :deep(.btn) {
  opacity: 1 !important;
  visibility: visible !important;
}

.button-preview :deep(button) {
  opacity: 1 !important;
  visibility: visible !important;
  color: inherit !important;
  background-color: inherit !important;
  border-color: inherit !important;
}

/* Force button visibility for all variants */
.button-preview :deep(.btn-primary) {
  background-color: #3b82f6 !important;
  color: white !important;
  border-color: #3b82f6 !important;
}

.button-preview :deep(.btn-secondary) {
  background-color: #6b7280 !important;
  color: white !important;
  border-color: #6b7280 !important;
}

.button-preview :deep(.btn-outline) {
  background-color: transparent !important;
  color: #374151 !important;
  border-color: #d1d5db !important;
}

.button-preview :deep(.btn:disabled) {
  background-color: #e5e7eb !important;
  color: #9ca3af !important;
  border-color: #e5e7eb !important;
}

/* ===== ENHANCED BUTTON SYSTEM ===== */
.demo-btn {
  @apply relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;

  position: relative;
  overflow: hidden;
}

.demo-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgb(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease-in-out;
}

.demo-btn:hover::before {
  left: 100%;
}

/* Button Sizes */
.demo-btn--sm {
  @apply px-3 py-1.5 text-sm;

  min-height: 32px;
}

.demo-btn--md {
  @apply px-4 py-2 text-sm;

  min-height: 40px;
}

.demo-btn--lg {
  @apply px-6 py-3 text-base;

  min-height: 48px;
}

/* Button Variants */
.demo-btn--primary {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:ring-blue-500;

  transform: translateY(0);
}

.demo-btn--primary:hover {
  transform: translateY(-1px);
}

.demo-btn--primary:active {
  transform: translateY(0);
}

.demo-btn--secondary {
  @apply bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-sm hover:from-slate-200 hover:to-slate-300 hover:shadow-md focus:ring-slate-500 dark:from-slate-700 dark:to-slate-600 dark:text-slate-200 dark:hover:from-slate-600 dark:hover:to-slate-500;

  transform: translateY(0);
}

.demo-btn--secondary:hover {
  transform: translateY(-1px);
}

.demo-btn--outline {
  @apply border-2 border-blue-600 bg-transparent text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white hover:shadow-md focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white;

  transform: translateY(0);
}

.demo-btn--outline:hover {
  transform: translateY(-1px);
}

.demo-btn--destructive {
  @apply bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl focus:ring-red-500;

  transform: translateY(0);
}

.demo-btn--destructive:hover {
  transform: translateY(-1px);
}

.demo-btn--ghost {
  @apply bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200;

  transform: translateY(0);
}

.demo-btn--ghost:hover {
  transform: translateY(-1px);
}

.demo-btn--success {
  @apply bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl focus:ring-green-500;

  transform: translateY(0);
}

.demo-btn--success:hover {
  transform: translateY(-1px);
}

/* Button Icons */
.btn-icon {
  @apply h-4 w-4 flex-shrink-0;
}

.demo-btn--sm .btn-icon {
  @apply h-3 w-3;
}

.demo-btn--lg .btn-icon {
  @apply h-5 w-5;
}

/* Loading State */
.demo-btn--loading {
  @apply cursor-wait;
}

.loading-spinner {
  @apply h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent;
}

.demo-btn--sm .loading-spinner {
  @apply h-3 w-3;
}

.demo-btn--lg .loading-spinner {
  @apply h-5 w-5;
}

/* Disabled State */
.demo-btn:disabled {
  @apply cursor-not-allowed opacity-50;

  transform: none !important;
}

.demo-btn:disabled::before {
  display: none;
}

/* Design System Indicator */
.design-system-indicator {
  @apply mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20;

  border: 1px solid rgb(59, 130, 246, 0.2);
}

.indicator-text {
  @apply text-sm font-medium text-blue-700 dark:text-blue-300;
}

/* Unified Input Styling */
.email-input-wrapper {
  @apply relative;
}

.unified-input {
  @apply w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-400 dark:focus:border-blue-400 dark:focus:ring-blue-900/20;

  min-height: 40px;
}

.unified-input:focus {
  @apply ring-2 ring-blue-500 ring-offset-2 dark:ring-blue-400 dark:ring-offset-slate-800;
}

.unified-input::placeholder {
  @apply text-slate-400 dark:text-slate-500;
}

.button-label {
  @apply text-center text-xs font-medium text-slate-600 dark:text-slate-400;
}

.form-showcase {
  @apply space-y-8;
}

.form-section {
  @apply space-y-4;
}

.form-section-header {
  @apply mb-4;
}

.form-section-title {
  @apply mb-1 text-lg font-semibold text-slate-800 dark:text-slate-200;
}

.form-section-description {
  @apply text-sm text-slate-500 dark:text-slate-400;
}

.form-row {
  @apply space-y-2;
}

.form-actions {
  @apply flex gap-4 pt-4;
}

/* Enhanced Multi-Select Styling */
.enhanced-select-container {
  @apply space-y-3;
}

.multi-select-wrapper {
  @apply relative;
}

.multi-select-trigger {
  @apply flex cursor-pointer items-center justify-between rounded-lg border-2 border-slate-200 bg-white px-3 py-2 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 hover:border-blue-300 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-blue-400 dark:focus-within:ring-blue-900/20 dark:hover:border-blue-400;

  min-height: 40px;
}

.selected-display {
  @apply flex-1 text-slate-700 dark:text-slate-300;
}

.placeholder {
  @apply text-slate-400 dark:text-slate-500;
}

.single-selection {
  @apply font-medium;
}

.multiple-selection {
  @apply font-medium text-blue-600 dark:text-blue-400;
}

.dropdown-icon {
  @apply ml-3 text-slate-400 transition-transform duration-200 dark:text-slate-500;
}

.dropdown-icon.open {
  @apply rotate-180;
}

.multi-select-dropdown {
  @apply absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800;

  max-height: 200px;
  overflow-y: auto;
}

.dropdown-header {
  @apply flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-600;
}

.dropdown-title {
  @apply text-sm font-semibold text-slate-700 dark:text-slate-300;
}

.clear-all-btn {
  @apply text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300;
}

.dropdown-options {
  @apply max-h-40 overflow-y-auto;
}

.option-item {
  @apply flex cursor-pointer items-center px-3 py-2 transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/20;
}

.option-item:hover .option-label {
  @apply text-blue-700 dark:text-blue-300;
}

.option-checkbox {
  @apply mr-3 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700;
}

.option-label {
  @apply text-sm text-slate-700 dark:text-slate-300;
}

.selected-frameworks {
  @apply rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3 dark:from-blue-900/20 dark:to-purple-900/20;

  border: 1px solid rgb(59, 130, 246, 0.2);
}

.selected-count {
  @apply mb-1 text-xs font-semibold text-blue-700 dark:text-blue-300;
}

.selected-tags {
  @apply flex flex-wrap gap-1.5;
}

.framework-tag {
  @apply flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white;

  box-shadow: 0 1px 2px rgb(59, 130, 246, 0.2);
}

.remove-tag {
  @apply ml-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800;

  font-size: 10px;
  line-height: 1;
}

.more-count {
  @apply rounded-full bg-slate-500 px-2 py-0.5 text-xs font-medium text-white;
}

/* ===== STATE SECTION ===== */
.state-section {
  @apply bg-gradient-to-b from-slate-50 to-white py-24 dark:from-slate-900 dark:to-slate-800;
}

.state-container {
  @apply container mx-auto px-4;
}

.state-header {
  @apply mb-16 text-center;
}

.state-title {
  @apply mb-6 text-5xl font-bold text-slate-900 dark:text-white md:text-6xl;

  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .state-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.state-subtitle {
  @apply mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300;
}

.state-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-3;
}

.state-card {
  @apply rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800;

  background: linear-gradient(135deg, rgb(255, 255, 255, 0.9) 0%, rgb(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgb(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.state-card:hover {
  @apply shadow-2xl;

  transform: translateY(-4px);
}

.dark .state-card {
  background: linear-gradient(135deg, rgb(30, 41, 59, 0.9) 0%, rgb(51, 65, 85, 0.9) 100%);
  border: 1px solid rgb(71, 85, 105, 0.8);
}

.state-card--loading {
  @apply border-l-4 border-l-blue-500;
}

.state-card--empty {
  @apply border-l-4 border-l-slate-500;
}

.state-card--error {
  @apply border-l-4 border-l-red-500;
}

.state-header-card {
  @apply mb-6 flex items-start gap-4;
}

.state-icon {
  @apply flex h-12 w-12 items-center justify-center rounded-xl;
}

.state-card--loading .state-icon {
  @apply bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400;
}

.state-card--empty .state-icon {
  @apply bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400;
}

.state-card--error .state-icon {
  @apply bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400;
}

.loading-spinner {
  @apply h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600;
}

.state-info {
  @apply flex-1;
}

.state-card-title {
  @apply mb-2 text-xl font-bold text-slate-900 dark:text-white;
}

.state-card-description {
  @apply text-slate-600 dark:text-slate-300;
}

.state-preview {
  @apply flex flex-col items-center justify-center space-y-4 rounded-2xl bg-slate-50 p-8 dark:bg-slate-700;
}

.preview-spinner {
  @apply h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600;
}

.preview-empty,
.preview-error {
  @apply flex h-8 w-8 items-center justify-center;
}

.preview-empty {
  @apply text-slate-400;
}

.preview-error {
  @apply text-red-500;
}

.preview-text {
  @apply text-sm font-medium text-slate-600 dark:text-slate-300;
}

/* ===== PRINCIPLES SECTION ===== */
.principles-section {
  @apply bg-gradient-to-b from-white to-slate-50 py-24 dark:from-slate-800 dark:to-slate-900;
}

.principles-container {
  @apply container mx-auto px-4;
}

.principles-header {
  @apply mb-16 text-center;
}

.principles-title {
  @apply mb-6 text-5xl font-bold text-slate-900 dark:text-white md:text-6xl;

  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .principles-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.principles-subtitle {
  @apply mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300;
}

.principles-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4;
}

.principle-card {
  @apply rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-slate-800;

  background: linear-gradient(135deg, rgb(255, 255, 255, 0.9) 0%, rgb(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgb(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.principle-card:hover {
  @apply shadow-2xl;

  transform: translateY(-4px);
}

.dark .principle-card {
  background: linear-gradient(135deg, rgb(30, 41, 59, 0.9) 0%, rgb(51, 65, 85, 0.9) 100%);
  border: 1px solid rgb(71, 85, 105, 0.8);
}

.principle-icon {
  @apply mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400;
}

.principle-title {
  @apply mb-4 text-xl font-bold text-slate-900 dark:text-white;
}

.principle-description {
  @apply mb-6 text-slate-600 dark:text-slate-300;
}

.principle-badge {
  @apply inline-block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white;
}

/* ===== ANIMATIONS ===== */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.hero-content > * {
  animation: slideInUp 0.8s ease-out forwards;
}

.hero-badge {
  animation-delay: 0.1s;
}

.hero-title {
  animation-delay: 0.2s;
}

.hero-description {
  animation-delay: 0.3s;
}

.hero-stats {
  animation-delay: 0.4s;
}

.showcase-section,
.state-section,
.principles-section {
  animation: slideInUp 0.8s ease-out forwards;
}

.showcase-section {
  animation-delay: 0.1s;
}

.state-section {
  animation-delay: 0.2s;
}

.principles-section {
  animation-delay: 0.3s;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (width <= 1024px) {
  .hero-container {
    @apply grid-cols-1 gap-8;
  }

  .hero-visual {
    @apply order-first;
  }

  .floating-cards {
    @apply h-80;
  }

  .card-1,
  .card-2,
  .card-3 {
    @apply relative bottom-auto left-auto right-auto top-auto transform-none;

    width: 100%;
    margin-bottom: 1rem;
  }
}

@media (width <= 768px) {
  .hero-title {
    @apply text-4xl md:text-5xl;
  }

  .hero-description {
    @apply text-lg md:text-xl;
  }

  .hero-stats {
    @apply flex-col gap-4;
  }

  .showcase-title,
  .state-title,
  .principles-title {
    @apply text-3xl md:text-4xl;
  }

  .showcase-subtitle,
  .state-subtitle,
  .principles-subtitle {
    @apply text-lg;
  }

  .showcase-panel,
  .state-card,
  .principle-card {
    @apply p-6;
  }

  .button-row {
    @apply grid-cols-1 gap-4;
  }

  .form-actions {
    @apply flex-col;
  }

  .principles-grid {
    @apply grid-cols-1 md:grid-cols-2;
  }
}

/* ===== FOCUS STYLES ===== */
.showcase-panel:focus-within,
.state-card:focus-within,
.principle-card:focus-within {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800;
}
</style>
