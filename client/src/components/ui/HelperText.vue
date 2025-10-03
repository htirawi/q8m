<template>
  <div
    :id="id"
    :class="helperTextClasses"
    :aria-live="ariaLive"
    :role="role"
  >
    <slot>
      {{ text }}
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface HelperTextProps {
  id?: string
  text?: string
  error?: string
  ariaLive?: 'polite' | 'assertive' | 'off'
}

const props = withDefaults(defineProps<HelperTextProps>(), {
  ariaLive: 'polite'
})

// Computed properties
const helperTextClasses = computed(() => {
  const baseClasses = ['text-sm']
  
  if (props.error) {
    return [
      ...baseClasses,
      'text-red-600 dark:text-red-400'
    ].join(' ')
  }
  
  return [
    ...baseClasses,
    'text-gray-500 dark:text-gray-400'
  ].join(' ')
})

const role = computed(() => {
  return props.error ? 'alert' : undefined
})
</script>
