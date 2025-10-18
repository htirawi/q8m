<template>
    <div v-if="showWarningDialog" class="session-timeout-overlay">
        <div class="session-timeout-modal">
            <div class="session-timeout-header">
                <div class="session-timeout-icon">⏰</div>
                <h3 class="session-timeout-title">{{ t('sessionTimeout.title') }}

</h3>
            </div>

            <div class="session-timeout-content">
                <p class="session-timeout-message">
                    {{ t('sessionTimeout.message') }}

                </p>

                <div class="session-timeout-timer">
                    <div class="timer-circle">
                        <svg class="timer-svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#ef4444" stroke-width="8"
                                stroke-linecap="round" :stroke-dasharray="circumference"
                                :stroke-dashoffset="strokeDashoffset" class="timer-progress" />
                        </svg>
                        <div class="timer-text">
                            {{ formatTime(timeRemaining) }}

                        </div>
                    </div>
                </div>
            </div>

            <div class="session-timeout-actions">
                <button type="button" class="btn btn--secondary" @click="logout">
                    {{ t('sessionTimeout.logout') }}

                </button>
                <button type="button" class="btn btn--primary" @click="extendSession">
                    {{ t('sessionTimeout.stayLoggedIn') }}

                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface props {
    showWarningDialog: boolean;
    timeRemaining: number;
}

interface emits {
    (e: 'extend'): void;
    (e: 'logout'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

// Timer circle calculations
const circumference = 2 * Math.PI * 45; // radius = 45
const strokeDashoffset = computed(() => {
    const totalTime = 5 * 60 * 1000; // 5 minutes in ms
    const progress = props.timeRemaining / totalTime;
    return circumference * (1 - progress);
});

const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const extendsession = () => {
    emit('extend');
};

const logout = () => {
    emit('logout');
};

</script>

<style scoped>
.session-timeout-overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center;
    @apply bg-black bg-opacity-50 backdrop-blur-sm;
}

.session-timeout-modal {
    @apply bg-white dark:bg-gray-800 rounded-2xl shadow-2xl;
    @apply max-w-md w-full mx-4 p-6;
    @apply animate-pulse;
}

.session-timeout-header {
    @apply text-center mb-6;
}

.session-timeout-icon {
    @apply text-4xl mb-3;
}

.session-timeout-title {
    @apply text-xl font-bold text-gray-900 dark:text-white;
}

.session-timeout-content {
    @apply text-center mb-6;
}

.session-timeout-message {
    @apply text-gray-600 dark:text-gray-300 mb-4;
}

.session-timeout-timer {
    @apply flex justify-center;
}

.timer-circle {
    @apply relative w-24 h-24;
}

.timer-svg {
    @apply w-full h-full transform -rotate-90;
}

.timer-progress {
    @apply transition-all duration-1000 ease-linear;
}

.timer-text {
    @apply absolute inset-0 flex items-center justify-center;
    @apply text-lg font-bold text-gray-900 dark:text-white;
}

.session-timeout-actions {
    @apply flex gap-3;
}

.btn {
    @apply flex-1 px-4 py-2 rounded-lg font-medium transition-all;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn--primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
    @apply focus:ring-blue-500;
}

.btn--secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
    @apply dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
    @apply focus:ring-gray-500;
}
</style>
