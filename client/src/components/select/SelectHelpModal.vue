<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`modal-title-${uid}`"
        @click.self="handleClose"
        @keydown.esc="handleClose"
      >
        <div class="modal-container" role="document">
          <!-- Close button -->
          <button
            type="button"
            class="modal-close"
            :aria-label="$t('select.closeHelp')"
            @click="handleClose"
          >
            <svg
              class="close-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 :id="`modal-title-${uid}`" class="modal-title">
              {{ $t("select.helpModalTitle") }}
            </h2>
            <p class="modal-subtitle">
              {{ $t("select.helpModalSubtitle") }}
            </p>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Level guide with modern card layout -->
            <div class="levels-grid">
              <div
                v-for="level in levels"
                :key="level.id"
                class="level-card"
                :class="`level-card--${level.id}`"
              >
                <!-- Card header with icon and title -->
                <div class="level-card__header">
                  <div class="level-card__icon" :class="`level-card__icon--${level.id}`">
                    <svg
                      v-if="level.id === 'junior'"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <svg
                      v-else-if="level.id === 'intermediate'"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <svg
                      v-else-if="level.id === 'senior'"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div class="level-card__title-section">
                    <h3 class="level-card__title">{{ $t(level.titleKey) }}</h3>
                    <div class="level-card__badge" :class="`level-card__badge--${level.id}`">
                      {{ level.experience }}
                    </div>
                  </div>
                </div>

                <!-- Card content -->
                <p class="level-card__description">{{ $t(level.descriptionKey) }}</p>

                <!-- Features list -->
                <ul class="level-card__features">
                  <li
                    v-for="(feature, idx) in level.features"
                    :key="idx"
                    class="level-card__feature"
                  >
                    <svg
                      class="feature-check"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{{ $t(feature) }} </span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Trust indicator -->
            <div class="trust-indicator">
              <svg
                class="trust-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="trust-text">{{ $t("select.helpNote") }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="modal-btn modal-btn--primary" @click="handleClose">
              <svg
                class="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ $t("select.gotIt") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

interface iselecthelpmodalprops {
  modelValue: boolean;
}

interface iselecthelpmodalemits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<ISelectHelpModalProps>();
const emit = defineEmits<ISelectHelpModalEmits>();

// Generate unique ID for accessibility
const uid = ref(Math.random().toString(36).substring(2, 11));

const levels = [
  {
    id: "junior",
    titleKey: "levels.junior.title",
    descriptionKey: "select.helpJuniorDesc",
    experience: "< 1 year",
    features: [
      "select.helpJuniorFeature1",
      "select.helpJuniorFeature2",
      "select.helpJuniorFeature3",
    ],
  },
  {
    id: "intermediate",
    titleKey: "levels.intermediate.title",
    descriptionKey: "select.helpIntermediateDesc",
    experience: "1-3 years",
    features: [
      "select.helpIntermediateFeature1",
      "select.helpIntermediateFeature2",
      "select.helpIntermediateFeature3",
    ],
  },
  {
    id: "senior",
    titleKey: "levels.senior.title",
    descriptionKey: "select.helpSeniorDesc",
    experience: "3+ years",
    features: [
      "select.helpSeniorFeature1",
      "select.helpSeniorFeature2",
      "select.helpSeniorFeature3",
    ],
  },
  {
    id: "custom",
    titleKey: "levels.custom.title",
    descriptionKey: "select.helpCustomDesc",
    experience: "Any level",
    features: ["select.helpCustomFeature1", "select.helpCustomFeature2"],
  },
];

const handleClose = (): void => {
  emit("update:modelValue", false);
};

// Prevent body scroll when modal is open
onMounted(() => {
  if (props.modelValue) {
    document.body.style.overflow = "hidden";
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
}

/* Container - Pure CSS, no Tailwind conflicts */
.modal-container {
  position: relative;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0, 0, 0, 0.25);
  width: 100%;
  max-width: 1280px;

  /* 80rem - much wider than global 512px */
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgb(255, 255, 255, 0.2);
}

/* Close button */
.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.2s;
  border: none;
  background: transparent;
  cursor: pointer;
}

.modal-close:hover {
  color: #4b5563;
  background: #f3f4f6;
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Header */
.modal-header {
  padding: 2rem 2rem 1rem 2rem;
  text-align: center;
  background: linear-gradient(to bottom right, #eff6ff, white, #faf5ff);
  border-bottom: 1px solid #f3f4f6;
}

.modal-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem auto;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #3b82f6, #9333ea);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgb(0, 0, 0, 0.1);
}

.modal-icon svg {
  width: 2rem;
  height: 2rem;
}

.modal-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.modal-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 32rem;
  margin: 0 auto;
}

/* Content - Override global modal-content styles */
.modal-content {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex: 1;
  background: linear-gradient(to bottom, white, #f9fafb);
  width: 100% !important;
  max-width: none !important;

  /* Override global max-w-lg */
}

/* Levels grid - Pure CSS Grid */
.levels-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

/* Level cards */
.level-card {
  padding: 1.25rem;
  border-radius: 1rem;
  border: 2px solid #f3f4f6;
  background: white;
  width: 100%;
  transition: all 0.3s ease-out;
}

.level-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 10px 15px -3px rgb(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.level-card__header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.level-card__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 2px 0 rgb(0, 0, 0, 0.05);
}

.level-card__icon--junior {
  background: linear-gradient(to bottom right, #dcfce7, #d1fae5);
  color: #16a34a;
}

.level-card__icon--intermediate {
  background: linear-gradient(to bottom right, #fef3c7, #fde68a);
  color: #d97706;
}

.level-card__icon--senior {
  background: linear-gradient(to bottom right, #fee2e2, #fecaca);
  color: #dc2626;
}

.level-card__icon--custom {
  background: linear-gradient(to bottom right, #f3e8ff, #e9d5ff);
  color: #9333ea;
}

.level-card__icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.level-card__title-section {
  flex: 1;
  min-width: 0;
}

.level-card__title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
}

.level-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.level-card__badge--junior {
  background: #dcfce7;
  color: #166534;
}

.level-card__badge--intermediate {
  background: #fef3c7;
  color: #92400e;
}

.level-card__badge--senior {
  background: #fee2e2;
  color: #991b1b;
}

.level-card__badge--custom {
  background: #f3e8ff;
  color: #7c3aed;
}

.level-card__description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.6;
  font-size: 1rem;
}

.level-card__features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.level-card__feature {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
}

.feature-check {
  width: 1.25rem;
  height: 1.25rem;
  color: #22c55e;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* Trust indicator */
.trust-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  width: 100%;
  text-align: center;
}

.trust-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #2563eb;
  flex-shrink: 0;
}

.trust-text {
  font-size: 0.875rem;
  color: #1e40af;
  font-weight: 500;
}

/* Footer */
.modal-footer {
  padding: 1rem 2rem;
  background: white;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: center;
}

.modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.modal-btn--primary {
  background: linear-gradient(to right, #2563eb, #9333ea);
  color: white;
}

.modal-btn--primary:hover {
  background: linear-gradient(to right, #1d4ed8, #7c3aed);
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgb(59, 130, 246, 0.3);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active .modal-container {
  animation: modal-slide-down 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-slide-down {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(32px) scale(0.95);
  }
}

/* RTL Support */
[dir="rtl"] .modal-close {
  right: auto;
  left: 1.5rem;
}

[dir="rtl"] .level-card__header {
  flex-direction: row-reverse;
}

[dir="rtl"] .level-card__feature {
  flex-direction: row-reverse;
}

/* Responsive adjustments */
@media (width <= 1024px) {
  .levels-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-width: none;
    border-radius: 1rem;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
  }

  .levels-grid {
    gap: 1rem;
  }

  .level-card {
    padding: 1rem;
  }
}

@media (width <= 480px) {
  .modal-container {
    border-radius: 0.75rem;
  }

  .modal-header {
    padding: 1rem 1rem 0.75rem 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-container {
    animation: none !important;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: none !important;
  }

  .level-card {
    transition: none !important;
  }

  .modal-btn {
    transition: none !important;
  }
}
</style>
