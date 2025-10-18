<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

          <!-- Modal -->
          <div class="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
            <!-- Close button -->
            <button
              @click="closeModal"
              class="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Header -->
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-900">Share Your Achievement</h3>
              <p class="mt-2 text-sm text-gray-600">{{ preview?.title || 'Share with your friends' }}

</p>
            </div>

            <!-- Preview Card -->
            <div v-if="preview" class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div class="flex items-start space-x-4">
                <img
                  v-if="preview.imageUrl"
                  :src="preview.imageUrl"
                  alt="Share preview"
                  class="h-16 w-16 rounded-lg object-cover"
                />
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">{{ preview.title }}

</h4>
                  <p class="mt-1 text-sm text-gray-600">{{ preview.description }}</p>
                </div>
              </div>
            </div>

            <!-- Share Options -->
            <div class="space-y-3">
              <button
                v-for="option in shareOptions"
                :key="option.platform"
                @click="handleShare(option.platform)"
                :disabled="loading"
                class="flex w-full items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 disabled:opacity-50"
                type="button"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full" :style="{ backgroundColor: option.color }">
                  <component :is="option.icon" class="h-5 w-5 text-white" />
                </div>
                <span class="flex-1 text-left font-medium text-gray-900">{{ option.label }}</span>
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="mt-4 text-center">
              <svg class="mx-auto h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="mt-2 text-sm text-gray-600">Opening share dialog...</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import type { SharePlatform, SharePreviewData, ShareType } from '@/stores/shares';
import { useSharesStore } from '@/stores/shares';

interface shareoption {
  platform: SharePlatform;
  label: string;
  color: string;
  icon: string;
}

interface props {
  isOpen: boolean;
  shareType: ShareType;
  entityId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'share-success', platform: SharePlatform): void
}>();

const sharesStore = useSharesStore();
const preview = ref<SharePreviewData | null>(null);
const loading = computed(() => sharesStore.loading);

const shareOptions: ShareOption[] = [
  {
    platform: 'twitter',
    label: 'Twitter',
    color: '#1DA1F2',
    icon: 'TwitterIcon',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    color: '#4267B2',
    icon: 'FacebookIcon',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    color: '#0077B5',
    icon: 'LinkedInIcon',
  },
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    icon: 'WhatsAppIcon',
  },
  {
    platform: 'email',
    label: 'Email',
    color: '#EA4335',
    icon: 'EmailIcon',
  },
  {
    platform: 'copy_link',
    label: 'Copy Link',
    color: '#9CA3AF',
    icon: 'LinkIcon',
  },
];

const closemodal = () => {
  emit('close');
};

const handleshare = async (platform: SharePlatform) => {
  const success = await sharesStore.shareToSocial(props.shareType, props.entityId, platform);
  if (success) {
    emit('share-success', platform);
    if (platform === 'copy_link') {
      // Keep modal open briefly for copy_link to show success message
      setTimeout(() => {
        closeModal();
      }, 1500);
    }

 else {
      closeModal();
    }
  }
};

const loadpreview = async () => {
  preview.value = await sharesStore.getSharePreview(props.shareType, props.entityId);
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadPreview();
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    loadPreview();
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
