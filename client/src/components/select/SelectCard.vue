<template>
  <article
    :id="`select-card-${option.id}`"
    class="select-card"
    :class="{
      'select-card--selected': isSelected,
      'select-card--locked': option.isLocked,
      'select-card--disabled': option.disabled,
    }"
    role="button"
    :tabindex="option.isLocked || option.disabled ? -1 : 0"
    :aria-label="$t('select.cardAriaLabel', { title: $t(option.titleKey) })"
    :aria-pressed="isSelected"
    :aria-disabled="option.isLocked || option.disabled"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Lock overlay -->
    <div v-if="option.isLocked" class="select-card__lock-overlay">
      <div class="lock-icon" aria-hidden="true">🔒</div>
      <p class="lock-text">{{ $t("select.requiresPlan", { plan: option.requiredPlan }) }}</p>
    </div>

    <!-- Badge -->
    <div
      v-if="option.badge && !option.isLocked"
      class="select-card__badge"
      :class="`badge--${option.badge.variant}`"
    >
      {{ $t(option.badge.textKey) }}
    </div>

    <!-- Content -->
    <div class="select-card__content">
      <!-- Icon (optional) -->
      <div v-if="option.icon" class="select-card__icon" aria-hidden="true">
        {{ option.icon }}
      </div>

      <!-- Title -->
      <h3 class="select-card__title">
        {{ $t(option.titleKey) }}
      </h3>

      <!-- Subtitle -->
      <p class="select-card__subtitle">
        {{ $t(option.subtitleKey) }}
      </p>

      <!-- Description -->
      <p class="select-card__description">
        {{ $t(option.descriptionKey) }}
      </p>

      <!-- Duration -->
      <div class="select-card__meta">
        <span class="meta-icon" aria-hidden="true">⏱️</span>
        <span class="meta-text">{{ $t(option.durationKey) }}</span>
      </div>

      <!-- Progress bar (if progress > 0) -->
      <div
        v-if="option.progress && option.progress > 0 && !option.isLocked"
        class="select-card__progress"
      >
        <div
          class="progress-bar"
          role="progressbar"
          :aria-valuenow="option.progress"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="$t('select.progressLabel', { progress: option.progress })"
        >
          <div class="progress-fill" :style="{ width: `${option.progress}%` }"></div>
        </div>
        <span class="progress-text">{{ option.progress }}% {{ $t("select.complete") }} </span>
      </div>

      <!-- CTA -->
      <button
        v-if="!option.isLocked"
        type="button"
        class="select-card__cta"
        :aria-pressed="isSelected"
        @click.stop="handleClick"
      >
        <span v-if="isSelected">{{ $t("select.selected") }} </span>
        <span v-else>{{ $t("select.choose") }} </span>
      </button>

      <button
        v-else
        type="button"
        class="select-card__cta select-card__cta--upgrade"
        @click.stop="handleUpgrade"
      >
        {{ $t("select.upgrade") }}
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { ISelectOption } from "@/types/select";
import { analytics, EventCategory, EventAction } from "@/services/analytics";

interface ISelectCardProps {
  /** The option data to display */
  option: ISelectOption;

  /** Whether this card is currently selected */
  isSelected: boolean;
}

interface ISelectCardEmits {
  (e: "select", id: string): void;
}

const props = defineProps<ISelectCardProps>();
const emit = defineEmits<ISelectCardEmits>();

const router = useRouter();
const { locale } = useI18n();

const handleClick = (): void => {
  if (props.option.isLocked || props.option.disabled) {
    return;
  }

  emit("select", props.option.id);

  analytics.track(
    "select_card_clicked",
    {
      option_id: props.option.id,
      difficulty: props.option.difficulty,
      is_selected: props.isSelected,
    },
    {
      category: EventCategory.LevelSelection,
      action: EventAction.Click,
    }
  );
};

const handleUpgrade = (): void => {
  analytics.track(
    "select_card_upgrade_clicked",
    {
      option_id: props.option.id,
      difficulty: props.option.difficulty,
    },
    {
      category: EventCategory.Conversion,
      action: EventAction.Click,
    }
  );

  router.push(`/${locale.value}/pricing`);
};
</script>

<style scoped>
.select-card {
  @apply relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md;
  @apply transition-all duration-300 ease-out;
  @apply focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;

  box-shadow: 0 10px 30px -5px rgb(0, 0, 0, 0.3);
  animation: fade-in-up 0.6s ease-out backwards;
}

.select-card:not(.select-card--locked, .select-card--disabled):hover {
  @apply cursor-pointer border-white/30 bg-white/15;

  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 50px -10px rgb(0, 0, 0, 0.4);
}

.select-card:not(.select-card--locked, .select-card--disabled):active {
  transform: translateY(-2px) scale(1.01);
}

.select-card--selected {
  @apply border-white/40 bg-white/20;

  box-shadow:
    0 20px 60px -10px rgb(0, 0, 0, 0.5),
    0 0 0 2px rgb(255, 255, 255, 0.3);
}

.select-card--locked {
  @apply cursor-not-allowed opacity-60;
}

.select-card--disabled {
  @apply cursor-not-allowed opacity-50;
}

/* Lock overlay */
.select-card__lock-overlay {
  @apply absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm;
}

.lock-icon {
  @apply mb-2 text-4xl;
}

.lock-text {
  @apply text-sm font-semibold text-white;
}

/* Badge */
.select-card__badge {
  @apply absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider;
  @apply z-20;
}

.badge--success {
  @apply bg-green-500 text-white;
}

.badge--warning {
  @apply bg-yellow-500 text-gray-900;
}

.badge--info {
  @apply bg-blue-500 text-white;
}

.badge--primary {
  @apply bg-purple-500 text-white;
}

/* Content */
.select-card__content {
  @apply relative z-10 flex flex-col gap-3;
}

.select-card__icon {
  @apply text-4xl;
}

.select-card__title {
  @apply text-2xl font-bold text-white;
}

.select-card__subtitle {
  @apply text-sm font-medium uppercase tracking-wide text-white/80;
}

.select-card__description {
  @apply text-base leading-relaxed text-white/70;
}

.select-card__meta {
  @apply flex items-center gap-2 text-sm text-white/60;
}

.meta-icon {
  @apply text-base;
}

.meta-text {
  @apply font-medium;
}

/* Progress */
.select-card__progress {
  @apply mt-2 flex flex-col gap-2;
}

.progress-bar {
  @apply h-2 w-full overflow-hidden rounded-full bg-white/20;
}

.progress-fill {
  @apply h-full rounded-full bg-white transition-all duration-500;
}

.progress-text {
  @apply text-xs font-medium text-white/60;
}

/* CTA */
.select-card__cta {
  @apply mt-4 w-full rounded-xl px-6 py-3 text-sm font-bold;
  @apply transition-all duration-200 ease-out;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
  @apply bg-white text-purple-600 hover:bg-white/90;
}

.select-card__cta--upgrade {
  @apply bg-yellow-400 text-gray-900 hover:bg-yellow-300;
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .select-card {
    animation: none !important;
    transition: none !important;
  }

  .select-card:hover {
    transform: none !important;
  }
}
</style>
