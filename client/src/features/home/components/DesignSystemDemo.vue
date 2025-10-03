<template>
  <section class="design-system-demo" aria-labelledby="demo-title">
    <div class="demo-container">
      <div class="demo-header">
        <h2 id="demo-title" class="demo-title">
          {{ $t('home.demo.title') }}
        </h2>
        <p class="demo-description">
          {{ $t('home.demo.description') }}
        </p>
      </div>
      
      <div class="demo-content">
        <!-- Component Showcase -->
        <div class="demo-section">
          <h3 class="demo-section-title">{{ $t('home.demo.components') }}</h3>
          <div class="demo-components">
            <div class="demo-component">
              <h4 class="demo-component-title">{{ $t('home.demo.buttons') }}</h4>
              <div class="demo-buttons">
                <Button variant="primary" size="sm">{{ $t('home.demo.small') }}</Button>
                <Button variant="primary" size="md">{{ $t('home.demo.medium') }}</Button>
                <Button variant="primary" size="lg">{{ $t('home.demo.large') }}</Button>
                <Button variant="secondary" size="md">{{ $t('home.demo.secondary') }}</Button>
                <Button variant="outline" size="md">{{ $t('home.demo.outline') }}</Button>
              </div>
            </div>
            
            <div class="demo-component">
              <h4 class="demo-component-title">{{ $t('home.demo.form') }}</h4>
              <Card class="demo-form-card">
                <FormField
                  :label="$t('home.demo.email')"
                  :error="emailError"
                  required
                >
                  <Input
                    v-model="email"
                    type="email"
                    :placeholder="$t('home.demo.emailPlaceholder')"
                    :aria-describedby="emailError ? 'email-error' : undefined"
                  />
                </FormField>
                <FormField
                  :label="$t('home.demo.framework')"
                  :helper-text="$t('home.demo.frameworkHelp')"
                >
                  <Select
                    v-model="framework"
                    :options="frameworkOptions"
                    :placeholder="$t('home.demo.selectFramework')"
                  />
                </FormField>
                <div class="demo-form-actions">
                  <Button variant="primary" size="md" :disabled="!isFormValid">
                    {{ $t('home.demo.submit') }}
                  </Button>
                  <Button variant="outline" size="md">
                    {{ $t('home.demo.cancel') }}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <!-- State Examples -->
        <div class="demo-section">
          <h3 class="demo-section-title">{{ $t('home.demo.states') }}</h3>
          <div class="demo-states">
            <Card class="demo-state-card">
              <div class="demo-state-content">
                <LoadingSpinner size="md" />
                <span>{{ $t('home.demo.loading') }}</span>
              </div>
            </Card>
            <Card class="demo-state-card">
              <div class="demo-state-content">
                <div class="demo-empty-state">
                  <div class="empty-icon" aria-hidden="true">📝</div>
                  <p>{{ $t('home.demo.empty') }}</p>
                </div>
              </div>
            </Card>
            <Card class="demo-state-card">
              <div class="demo-state-content">
                <div class="demo-error-state">
                  <div class="error-icon" aria-hidden="true">⚠️</div>
                  <p>{{ $t('home.demo.error') }}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import FormField from '@/components/ui/FormField.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Form state
const email = ref('')
const framework = ref('')

// Validation
const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : 'Invalid email format'
})

const isFormValid = computed(() => {
  return email.value && !emailError.value && framework.value
})

// Framework options
const frameworkOptions = [
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' }
]
</script>

<style scoped>
.design-system-demo {
  @apply py-16 md:py-24 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700;
}

.demo-container {
  @apply container mx-auto px-4;
}

.demo-header {
  @apply text-center mb-16;
}

.demo-title {
  @apply text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4;
}

.demo-description {
  @apply text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto;
}

.demo-content {
  @apply space-y-16;
}

.demo-section {
  @apply space-y-8;
}

.demo-section-title {
  @apply text-2xl font-semibold text-gray-900 dark:text-white mb-6;
}

.demo-components {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8;
}

.demo-component {
  @apply space-y-4;
}

.demo-component-title {
  @apply text-lg font-medium text-gray-900 dark:text-white;
}

.demo-buttons {
  @apply flex flex-wrap gap-3;
}

.demo-form-card {
  @apply p-6;
}

.demo-form-actions {
  @apply flex gap-3 pt-4;
}

.demo-states {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.demo-state-card {
  @apply p-6;
}

.demo-state-content {
  @apply flex flex-col items-center justify-center space-y-4 min-h-[120px];
}

.demo-empty-state,
.demo-error-state {
  @apply text-center space-y-2;
}

.empty-icon,
.error-icon {
  @apply text-2xl;
}

.demo-empty-state p,
.demo-error-state p {
  @apply text-gray-600 dark:text-gray-300 text-sm;
}

/* Focus styles */
.demo-buttons button:focus,
.demo-form-actions button:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .demo-components {
    @apply grid-cols-1;
  }
  
  .demo-states {
    @apply grid-cols-1;
  }
  
  .demo-buttons {
    @apply flex-col;
  }
  
  .demo-form-actions {
    @apply flex-col;
  }
}
</style>
