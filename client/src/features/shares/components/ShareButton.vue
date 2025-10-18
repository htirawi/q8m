<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleShare"
    type="button"
  >
    <svg
      v-if="!loading"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-5 h-5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
    <svg
      v-else
      class="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span v-if="showText" class="ml-2">{{ text }}

</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { SharePlatform, ShareType } from '@/stores/shares';
import { useSharesStore } from '@/stores/shares';

interface props {
  shareType: ShareType;
  entityId: string;
  platform?: SharePlatform;
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  disabled?: boolean;
  openModal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Share',
  variant: 'outline',
  size: 'md',
  showText: true,
  disabled: false,
  openModal: true,
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'share-success'): void;
  (e: 'share-error', error: string): void
}>();

const sharesStore = useSharesStore();
const loading = computed(() => sharesStore.loading);

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabled = props.disabled || loading.value ? 'opacity-50 cursor-not-allowed' : '';

  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${disabled}`;
});

const handleshare = async () => {
  if (props.disabled || loading.value) return;

  emit('click');

  // If openModal is true and no platform specified, emit click to open modal
  if (props.openModal && !props.platform) {
    return;
  }

  // If platform is specified, share directly
  if (props.platform) {
    try {
      const success = await sharesStore.shareToSocial(props.shareType, props.entityId, props.platform);
      if (success) {
        emit('share-success');
      }

 else {
        emit('share-error', 'Failed to share');
      }
    } catch (error) {
      emit('share-error', error instanceof Error ? error.message : 'Failed to share');
    }
  }
};
</script>
