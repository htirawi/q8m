<template>
  <div class="smart-explanation" :class="{ 'smart-explanation--expanded': isExpanded }">
    <!-- Header -->
    <div class="smart-explanation__header" @click="toggleExpand">
      <div class="smart-explanation__header-left">
        <div class="smart-explanation__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="smart-explanation__header-info">
          <h3 class="smart-explanation__title">{{ concept }}</h3>
          <div class="smart-explanation__meta">
            <span class="smart-explanation__difficulty" :class="`smart-explanation__difficulty--${difficulty}`">
              {{ $t(`difficulty.${difficulty}`) }}

            </span>
            <span class="smart-explanation__reading-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {{ readingTime }} {{ $t('common.minRead') }}

            </span>
          </div>
        </div>
      </div>

      <button
        class="smart-explanation__expand-btn"
        :aria-label="isExpanded ? $t('common.collapse') : $t('common.expand')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path v-if="!isExpanded" d="M19 9l-7 7-7-7" />
          <path v-else d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>

    <!-- Quick Preview (collapsed state) -->
    <div v-if="!isExpanded" class="smart-explanation__preview">
      <p>{{ previewText }}

</p>
      <button class="smart-explanation__learn-more" @click="toggleExpand">
        {{ $t('ai.learnMore') }}

 →
      </button>
    </div>

    <!-- Full Content (expanded state) -->
    <Transition name="expand">
      <div v-if="isExpanded" class="smart-explanation__content">
        <!-- Loading State -->
        <div v-if="isLoading" class="smart-explanation__loading">
          <div class="smart-explanation__loading-spinner"></div>
          <p>{{ $t('ai.generatingExplanation') }}

</p>
        </div>

        <!-- Content Sections -->
        <div v-else class="smart-explanation__sections">
          <!-- Definition Section -->
          <div class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ $t('ai.whatIs') }}

            </h4>
            <div class="explanation-section__content" v-html="renderMarkdown(explanation.definition)"></div>
          </div>

          <!-- Why It Matters -->
          <div class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {{ $t('ai.whyItMatters') }}

            </h4>
            <div class="explanation-section__content" v-html="renderMarkdown(explanation.importance)"></div>
          </div>

          <!-- Code Examples -->
          <div v-if="explanation.examples?.length" class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {{ $t('ai.examples') }}

            </h4>
            <div class="explanation-section__content">
              <div
                v-for="(example, index) in explanation.examples"
                :key="index"
                class="code-example"
              >
                <div class="code-example__header">
                  <h5 class="code-example__title">{{ example.title }}</h5>
                  <button
                    class="code-example__copy"
                    @click="copyCode(example.code)"
                    :aria-label="$t('common.copy')"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                </div>
                <pre class="code-example__code"><code :class="`language-${example.language}`">{{ example.code }}

</code></pre>
                <div v-if="example.explanation" class="code-example__explanation">
                  {{ example.explanation }}

                </div>
                <div v-if="example.output" class="code-example__output">
                  <span class="code-example__output-label">{{ $t('ai.output') }}

:</span>
                  <code>{{ example.output }}

</code>
                </div>
              </div>
            </div>
          </div>

          <!-- Visual Aids -->
          <div v-if="explanation.visualAids?.length" class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ $t('ai.visualAids') }}

            </h4>
            <div class="explanation-section__content">
              <div
                v-for="(visual, index) in explanation.visualAids"
                :key="index"
                class="visual-aid"
              >
                <img
                  v-if="visual.url"
                  :src="visual.url"
                  :alt="visual.description"
                  class="visual-aid__image"
                />
                <div
                  v-if="visual.svg"
                  class="visual-aid__svg"
                  v-html="visual.svg"
                ></div>
                <p class="visual-aid__description">{{ visual.description }}

</p>
              </div>
            </div>
          </div>

          <!-- Common Pitfalls -->
          <div v-if="explanation.pitfalls?.length" class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {{ $t('ai.commonPitfalls') }}

            </h4>
            <div class="explanation-section__content">
              <ul class="pitfalls-list">
                <li v-for="(pitfall, index) in explanation.pitfalls" :key="index" class="pitfalls-list__item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{{ pitfall }}

</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Practice Problems -->
          <div v-if="explanation.practiceProblems?.length" class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {{ $t('ai.practiceProblems') }}
            </h4>
            <div class="explanation-section__content">
              <div
                v-for="problem in explanation.practiceProblems"
                :key="problem.id"
                class="practice-problem"
              >
                <div class="practice-problem__header">
                  <span class="practice-problem__difficulty" :class="`practice-problem__difficulty--${problem.difficulty}`">
                    {{ problem.difficulty }}

                  </span>
                  <h5 class="practice-problem__question">{{ problem.question }}

</h5>
                </div>

                <div v-if="showSolution[problem.id]" class="practice-problem__solution">
                  <h6>{{ $t('ai.solution') }}

:</h6>
                  <pre><code>{{ problem.solution }}

</code></pre>
                  <p v-if="problem.explanation">{{ problem.explanation }}

</p>
                </div>

                <div class="practice-problem__actions">
                  <button
                    class="practice-problem__btn"
                    @click="toggleSolution(problem.id)"
                  >
                    {{ showSolution[problem.id] ? $t('ai.hideSolution') : $t('ai.showSolution')$t }}

                  </button>
                  <button
                    v-if="problem.hints?.length"
                    class="practice-problem__btn"
                    @click="showHint(problem.id)"
                  >
                    {{ $t('ai.getHint') }}

                  </button>
                </div>

                <div v-if="hints[problem.id]" class="practice-problem__hint">
                  💡 {{ hints[problem.id] }}

                </div>
              </div>
            </div>
          </div>

          <!-- Related Concepts -->
          <div v-if="explanation.relatedConcepts?.length" class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {{ $t('ai.relatedConcepts') }}

            </h4>
            <div class="explanation-section__content">
              <div class="related-concepts">
                <button
                  v-for="related in explanation.relatedConcepts"
                  :key="related"
                  class="related-concept"
                  @click="explainConcept(related)"
                >
                  {{ related }}

                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Resources -->
          <div v-if="explanation.resources?.length" class="explanation-section">
            <h4 class="explanation-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {{ $t('ai.additionalResources') }}

            </h4>
            <div class="explanation-section__content">
              <div class="resources-list">
                <a
                  v-for="resource in explanation.resources"
                  :key="resource.url"
                  :href="resource.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="resource-item"
                >
                  <div class="resource-item__icon">
                    <svg v-if="resource.type === 'video'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="resource.type === 'article'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div class="resource-item__content">
                    <h5 class="resource-item__title">{{ resource.title }}

</h5>
                    <p class="resource-item__description">{{ resource.description }}

</p>
                    <div class="resource-item__meta">
                      <span v-if="resource.duration">{{ resource.duration }}

</span>
                      <span v-if="resource.free" class="resource-item__badge">{{ $t('common.free') }}

</span>
                      <span v-if="resource.recommended" class="resource-item__badge resource-item__badge--recommended">
                        {{ $t('common.recommended') }}

                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="smart-explanation__footer">
          <div class="smart-explanation__feedback">
            <span>{{ $t('ai.wasHelpful') }}</span>
            <button
              class="feedback-btn feedback-btn--yes"
              :class="{ active: feedback === 'helpful' }"
              @click="submitFeedback('helpful')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              class="feedback-btn feedback-btn--no"
              :class="{ active: feedback === 'unhelpful' }"
              @click="submitFeedback('unhelpful')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .904-.405.904-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
          </div>

          <div class="smart-explanation__actions">
            <button class="action-btn" @click="regenerate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ $t('ai.regenerate') }}

            </button>
            <button class="action-btn" @click="share">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 8.326a9.001 9.001 0 11-13.432 0m13.432 0A9.001 9.001 0 015.284 4.016m13.432 15.968A9.002 9.002 0 0112 21a9.002 9.002 0 01-6.716-2.016" />
              </svg>
              {{ $t('ai.share') }}

            </button>
            <button class="action-btn action-btn--primary" @click="openInChat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {{ $t('ai.discussInChat') }}

            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { aiService } from '@/services/ai/aiService';
import type { ISmartExplanation, ICodeExample } from '@/types/ai';
import { analytics } from '@/services/analytics';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Props
interface Props {
  concept: string;
  questionId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  autoExpand?: boolean;
  context?: any;
}

const props = withDefaults(defineProps<Props>(), {
  autoExpand: false
});

// Emits
const emit = defineEmits<{
  'concept-clicked': [concept: string];
  'feedback': [type: string];
  'open-chat': [context: any];
}>();

// i18n
const { t } = useI18n();

// State
const isExpanded = ref(props.autoExpand);
const isLoading = ref(false);
const explanation = ref<Partial<ISmartExplanation>>({});
const showSolution = ref<Record<string, boolean>>({});
const hints = ref<Record<string, string>>({});
const feedback = ref<string | null>(null);
const readingTime = ref(5);

// Mock explanation data (replace with actual AI service call)
const mockExplanation: Partial<ISmartExplanation> = {
  definition: `**${props.concept}

** is a fundamental concept in modern web development that enables developers to build more efficient and maintainable applications.

It works by creating a layer of abstraction that separates concerns and provides a clear interface for interaction between different parts of your application.`,

  importance: `Understanding ${props.concept}

 is crucial because:

- It significantly improves code organization and reusability
- It reduces complexity in large-scale applications
- It enables better testing and debugging
- It's a pattern used by most modern frameworks and libraries
- It's frequently asked about in technical interviews`,
  examples: [
    {;
      output: '{ name: "Example", value: 42 }'
    },
    {;
      language: 'typescript',
      code: `// Advanced ${props.concept} with TypeScript
interface ExampleInterface {;
  name: string;;
  value: number;;
  process(): void;
}

class AdvancedExample implements ExampleInterface {
  constructor(public name: string, public value: number) {};
  process(): void {
    console.log(\`Processing \${this.name} with value \${this.value}\`);
  }
}`,
  pitfalls: [
    'Not properly understanding the scope and context',
    'Overcomplicating simple implementations',
    'Ignoring performance implications',
    'Not following established best practices',
    'Mixing concerns that should be separated'
  ],
  practiceProblems: [
    {;
    createdAt: new Date()
  };
}`,
      explanation: 'This solution demonstrates the core pattern with minimal complexity.'
    },
    {;
      id: 'p2',
      question: `Refactor this code to properly implement ${props.concept}`,
      difficulty: 'medium',
      hints: ['Identify repeated logic', 'Extract common functionality'],
      solution: 'Solution would go here...'
    }
  ],
  relatedConcepts: ['Design Patterns', 'SOLID Principles', 'Functional Programming', 'Object-Oriented Programming'],
  resources: [
    {;
      duration: '45 min',
      recommended: true
    },
    {;
      type: 'article',
      title: `Deep Dive into ${props.concept}`,
      url: 'https://example.com/article',
      description: 'Detailed written guide with examples',
      free: true
    }
  ]
};

// Computed
const previewText = computed(() => {
  const text = explanation.value.definition || mockExplanation.definition || '';
  return text.replace(/[*_#]/g, '').substring(0, 150) + '...';
});

// Methods
const toggleExpand = async () => {
  isExpanded.value = !isExpanded.value;

  if (isExpanded.value && !explanation.value.id) {
    await loadExplanation();
  }

  analytics.track('smart_explanation_toggled', {
    concept: props.concept,
    expanded: isExpanded.value
  });
};

const loadexplanation = async () => {
  isLoading.value = true;
  try {
    // In production, call the AI service
    // const result = await aiService.generateExplanation(
    //   props.concept,
    //   props.questionId,
    //   props.difficulty
    // );
    // explanation.value = result;

    // For now, use mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    explanation.value = mockExplanation;
    readingTime.value = Math.ceil((mockExplanation.definition?.split(' ').length || 0) / 200);

    analytics.track('smart_explanation_loaded', {
      concept: props.concept,
      questionId: props.questionId,
      difficulty: props.difficulty
    });
  } catch (error) {
    console.error('Failed to load explanation:', error);
  }

 finally {
    isLoading.value = false;
  }
};

const copycode = (code: string) => {
  navigator.clipboard.writeText(code);
  analytics.track('explanation_code_copied', { concept: props.concept });
};

const togglesolution = (problemId: string) => {
  showSolution.value[problemId] = !showSolution.value[problemId];
  analytics.track('practice_solution_viewed', {
    concept: props.concept,
    problemId
  });
};

const showhint = (problemId: string) => {
  const problem = explanation.value.practiceProblems?.find(p => p.id === problemId);
  if (problem?.hints) {
    const currentHintIndex = hints.value[problemId] ? problem.hints.indexOf(hints.value[problemId]) : -1;currentHintIndexhints.valueproblemIdproblem.hints.indexOf
    const nextHintIndex = Math.min(currentHintIndex + 1, problem.hints.length - 1);
    hints.value[problemId] = problem.hints[nextHintIndex];
  }
};

const explainconcept = (concept: string) => {
  emit('concept-clicked', concept);
};

const submitfeedback = (type: string) => {
  feedback.value = type;
  emit('feedback', type);

  analytics.track('explanation_feedback', {
    concept: props.concept,
    feedback: type
  });
};

const regenerate = async () => {
  analytics.track('explanation_regenerate', { concept: props.concept });
  await loadExplanation();
};

const share = () => {
  // Implementation for sharing
  analytics.track('explanation_shared', { concept: props.concept });
};

const openinchat = () => {
  emit('open-chat', {
    concept: props.concept,
    explanation: explanation.value
  });

  analytics.track('explanation_opened_in_chat', { concept: props.concept });
};

const renderMarkdown = (content: string): string => {
  if (!content) return '';

  marked.setOptions({
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
  });

  return marked(content);
};

// Lifecycle
onMounted(() => {
  if (props.autoExpand) {
    loadExplanation();
  }
});
</script>

<style scoped>
/* Container */
.smart-explanation {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-xl shadow-sm;
  @apply border border-gray-200 dark:border-gray-700;
  @apply transition-all duration-moderate;
}

.smart-explanation--expanded {
  @apply shadow-lg;
}

/* Header */
.smart-explanation__header {
  @apply flex items-center justify-between;
  @apply p-4 cursor-pointer;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/30;
  @apply transition-colors duration-fast;
}

.smart-explanation__header-left {
  @apply flex items-center gap-3;
}

.smart-explanation__icon {
  @apply w-10 h-10 rounded-lg;
  @apply bg-gradient-to-br from-primary-100 to-secondary-100;
  @apply dark:from-primary-900/50 dark:to-secondary-900/50;
  @apply flex items-center justify-center;
}

.smart-explanation__icon svg {
  @apply w-6 h-6 text-primary-600 dark:text-primary-400;
}

.smart-explanation__header-info {
  @apply space-y-1;
}

.smart-explanation__title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.smart-explanation__meta {
  @apply flex items-center gap-3 text-xs;
}

.smart-explanation__difficulty {
  @apply px-2 py-0.5 rounded-full font-medium;
}

.smart-explanation__difficulty--beginner {
  @apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400;
}

.smart-explanation__difficulty--intermediate {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400;
}

.smart-explanation__difficulty--advanced {
  @apply bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400;
}

.smart-explanation__reading-time {
  @apply flex items-center gap-1 text-gray-600 dark:text-gray-400;
}

.smart-explanation__reading-time svg {
  @apply w-3 h-3;
}

.smart-explanation__expand-btn {
  @apply w-8 h-8 rounded-lg;
  @apply text-gray-500 hover:text-gray-700 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
  @apply flex items-center justify-center;
}

.smart-explanation__expand-btn svg {
  @apply w-5 h-5;
  @apply transition-transform duration-fast;
}

/* Preview */
.smart-explanation__preview {
  @apply px-4 pb-4;
}

.smart-explanation__preview p {
  @apply text-sm text-gray-600 dark:text-gray-400;
  @apply mb-2;
}

.smart-explanation__learn-more {
  @apply text-sm font-medium text-primary;
  @apply hover:text-primary-700;
  @apply transition-colors duration-fast;
}

/* Content */
.smart-explanation__content {
  @apply border-t border-gray-200 dark:border-gray-700;
}

/* Loading */
.smart-explanation__loading {
  @apply flex flex-col items-center justify-center py-12;
  @apply text-gray-600 dark:text-gray-400;
}

.smart-explanation__loading-spinner {
  @apply w-8 h-8 border-2 border-primary border-t-transparent;
  @apply rounded-full animate-spin mb-3;
}

/* Sections */
.smart-explanation__sections {
  @apply divide-y divide-gray-200 dark:divide-gray-700;
}

.explanation-section {
  @apply p-6;
}

.explanation-section__title {
  @apply flex items-center gap-2 mb-4;
  @apply text-base font-semibold text-gray-900 dark:text-white;
}

.explanation-section__title svg {
  @apply w-5 h-5 text-primary;
}

.explanation-section__content {
  @apply text-sm text-gray-700 dark:text-gray-300;
  @apply prose dark:prose-invert max-w-none;
}

/* Code examples */
.code-example {
  @apply mb-4 last:mb-0;
}

.code-example__header {
  @apply flex items-center justify-between mb-2;
}

.code-example__title {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.code-example__copy {
  @apply w-6 h-6 rounded;
  @apply text-gray-500 hover:text-gray-700 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
  @apply flex items-center justify-center;
}

.code-example__copy svg {
  @apply w-4 h-4;
}

.code-example__code {
  @apply bg-gray-900 text-gray-100;
  @apply p-4 rounded-lg overflow-x-auto;
  @apply text-xs leading-relaxed;
}

.code-example__explanation {
  @apply mt-2 text-xs text-gray-600 dark:text-gray-400;
}

.code-example__output {
  @apply mt-2 p-2 rounded;
  @apply bg-gray-100 dark:bg-gray-900;
  @apply text-xs;
}

.code-example__output-label {
  @apply font-medium text-gray-700 dark:text-gray-300;
}

/* Visual aids */
.visual-aid {
  @apply mb-4 last:mb-0;
}

.visual-aid__image {
  @apply w-full rounded-lg mb-2;
}

.visual-aid__description {
  @apply text-xs text-gray-600 dark:text-gray-400 italic;
}

/* Pitfalls */
.pitfalls-list {
  @apply space-y-2;
}

.pitfalls-list__item {
  @apply flex items-start gap-2;
}

.pitfalls-list__item svg {
  @apply w-4 h-4 text-red-500 flex-shrink-0 mt-0.5;
}

/* Practice problems */
.practice-problem {
  @apply mb-4 last:mb-0;
  @apply p-4 rounded-lg;
  @apply bg-gray-50 dark:bg-gray-900;
  @apply border border-gray-200 dark:border-gray-700;
}

.practice-problem__header {
  @apply mb-3;
}

.practice-problem__difficulty {
  @apply inline-block px-2 py-0.5 rounded text-xs font-medium mb-2;
}

.practice-problem__difficulty--easy {
  @apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400;
}

.practice-problem__difficulty--medium {
  @apply bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400;
}

.practice-problem__difficulty--hard {
  @apply bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400;
}

.practice-problem__question {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.practice-problem__solution {
  @apply mt-3 p-3 rounded;
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
}

.practice-problem__solution h6 {
  @apply text-xs font-medium text-gray-700 dark:text-gray-300 mb-2;
}

.practice-problem__solution pre {
  @apply bg-gray-900 text-gray-100;
  @apply p-3 rounded text-xs overflow-x-auto mb-2;
}

.practice-problem__solution p {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.practice-problem__actions {
  @apply flex gap-2 mt-3;
}

.practice-problem__btn {
  @apply px-3 py-1 rounded text-xs font-medium;
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-300 dark:border-gray-600;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
  @apply transition-colors duration-fast;
}

.practice-problem__hint {
  @apply mt-3 p-3 rounded;
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply text-xs text-blue-700 dark:text-blue-400;
  @apply border border-blue-200 dark:border-blue-800;
}

/* Related concepts */
.related-concepts {
  @apply flex flex-wrap gap-2;
}

.related-concept {
  @apply flex items-center gap-1;
  @apply px-3 py-1.5 rounded-full;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-sm text-gray-700 dark:text-gray-300;
  @apply hover:bg-primary-100 hover:text-primary-700;
  @apply dark:hover:bg-primary-900/30 dark:hover:text-primary-400;
  @apply transition-all duration-fast;
}

.related-concept svg {
  @apply w-3 h-3;
}

/* Resources */
.resources-list {
  @apply space-y-3;
}

.resource-item {
  @apply flex gap-3 p-3 rounded-lg;
  @apply bg-gray-50 dark:bg-gray-900;
  @apply border border-gray-200 dark:border-gray-700;
  @apply hover:border-primary-300 dark:hover:border-primary-700;
  @apply transition-all duration-fast;
  @apply no-underline;
}

.resource-item__icon {
  @apply w-10 h-10 rounded-lg flex-shrink-0;
  @apply bg-gray-200 dark:bg-gray-700;
  @apply flex items-center justify-center;
}

.resource-item__icon svg {
  @apply w-5 h-5 text-gray-600 dark:text-gray-400;
}

.resource-item__content {
  @apply flex-1;
}

.resource-item__title {
  @apply text-sm font-medium text-gray-900 dark:text-white;
  @apply mb-1;
}

.resource-item__description {
  @apply text-xs text-gray-600 dark:text-gray-400;
  @apply mb-1;
}

.resource-item__meta {
  @apply flex items-center gap-2;
  @apply text-xs text-gray-500;
}

.resource-item__badge {
  @apply px-2 py-0.5 rounded-full;
  @apply bg-green-100 text-green-700;
  @apply dark:bg-green-900/30 dark:text-green-400;
  @apply font-medium;
}

.resource-item__badge--recommended {
  @apply bg-primary-100 text-primary-700;
  @apply dark:bg-primary-900/30 dark:text-primary-400;
}

/* Footer */
.smart-explanation__footer {
  @apply flex items-center justify-between;
  @apply px-6 py-4;
  @apply bg-gray-50 dark:bg-gray-900;
  @apply border-t border-gray-200 dark:border-gray-700;
}

.smart-explanation__feedback {
  @apply flex items-center gap-2;
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.feedback-btn {
  @apply w-8 h-8 rounded-lg;
  @apply text-gray-500 hover:text-gray-700 dark:hover:text-gray-300;
  @apply hover:bg-gray-200 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
  @apply flex items-center justify-center;
}

.feedback-btn svg {
  @apply w-5 h-5;
}

.feedback-btn--yes:hover,
.feedback-btn--yes.active {
  @apply text-green-600 bg-green-100;
  @apply dark:text-green-400 dark:bg-green-900/30;
}

.feedback-btn--no:hover,
.feedback-btn--no.active {
  @apply text-red-600 bg-red-100;
  @apply dark:text-red-400 dark:bg-red-900/30;
}

.smart-explanation__actions {
  @apply flex gap-2;
}

.action-btn {
  @apply flex items-center gap-2;
  @apply px-3 py-1.5 rounded-lg;
  @apply text-sm font-medium;
  @apply border border-gray-300 dark:border-gray-600;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
}

.action-btn svg {
  @apply w-4 h-4;
}

.action-btn--primary {
  @apply bg-primary text-white border-primary;
  @apply hover:bg-primary-700;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  @apply transition-all duration-moderate;
}

.expand-enter-from,
.expand-leave-to {
  @apply opacity-0;

  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  @apply opacity-100;

  max-height: 2000px;
}
</style>