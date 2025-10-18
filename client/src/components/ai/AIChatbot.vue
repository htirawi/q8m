<template>
  <div
    class="ai-chatbot"
    :class="{ 'ai-chatbot--open': isOpen, 'ai-chatbot--fullscreen': isFullscreen }"
  >
    <!-- Floating action button -->
    <Transition name="scale">
      <button
        v-if="!isOpen"
        class="ai-chatbot__fab"
        @click="openChat"
        :aria-label="$t('ai.openChat')"
      >
        <div class="ai-chatbot__fab-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        </div>
        <div class="ai-chatbot__fab-pulse"></div>
        <span v-if="unreadCount > 0" class="ai-chatbot__unread">{{ unreadCount }} </span>
      </button>
    </Transition>

    <!-- Chat window -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="ai-chatbot__window">
        <!-- Header -->
        <div class="ai-chatbot__header">
          <div class="ai-chatbot__header-left">
            <div class="ai-chatbot__avatar">
              <div class="ai-chatbot__avatar-ring">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div class="ai-chatbot__header-info">
              <h3 class="ai-chatbot__title">{{ $t("ai.assistantName", "Q8M AI Assistant") }}</h3>
              <span class="ai-chatbot__status" :class="statusClass">
                <span class="ai-chatbot__status-dot"></span>
                {{ statusText }}
              </span>
            </div>
          </div>

          <div class="ai-chatbot__header-actions">
            <button
              class="ai-chatbot__action"
              @click="toggleVoice"
              :aria-label="$t('ai.toggleVoice')"
              :title="$t('ai.toggleVoice')"
              v-if="voiceEnabled"
            >
              <svg v-if="voiceActive" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <button
              class="ai-chatbot__action"
              @click="toggleFullscreen"
              :aria-label="$t('ai.toggleFullscreen')"
              :title="$t('ai.toggleFullscreen')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  v-if="!isFullscreen"
                  d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                />
                <path
                  v-else
                  d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                />
              </svg>
            </button>

            <button
              class="ai-chatbot__action"
              @click="showSettings = true"
              :aria-label="$t('ai.settings')"
              :title="$t('ai.settings')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"
                />
              </svg>
            </button>

            <button
              class="ai-chatbot__action ai-chatbot__close"
              @click="closeChat"
              :aria-label="$t('ai.closeChat')"
              :title="$t('ai.closeChat')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Suggestions bar -->
        <TransitionGroup
          name="fade"
          tag="div"
          class="ai-chatbot__suggestions"
          v-if="showSuggestions"
        >
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="ai-chatbot__suggestion"
            @click="selectSuggestion(suggestion)"
          >
            <span class="ai-chatbot__suggestion-icon">{{ suggestion.icon }} </span>
            <span class="ai-chatbot__suggestion-text">{{ suggestion.text }} </span>
          </button>
        </TransitionGroup>

        <!-- Messages area -->
        <div class="ai-chatbot__messages" ref="messagesContainer">
          <!-- Welcome message -->
          <div v-if="messages.length === 0" class="ai-chatbot__welcome">
            <h4 class="ai-chatbot__welcome-title">{{ $t("ai.welcomeTitle") }}</h4>
            <p class="ai-chatbot__welcome-text">{{ $t("ai.welcomeText") }}</p>

            <div class="ai-chatbot__quick-actions">
              <button
                v-for="action in quickActions"
                :key="action.id"
                class="ai-chatbot__quick-action"
                @click="handleQuickAction(action)"
              >
                <span class="ai-chatbot__quick-action-icon">{{ action.icon }} </span>
                <span class="ai-chatbot__quick-action-label">{{ action.label }} </span>
                <span class="ai-chatbot__quick-action-desc">{{ action.description ?? "" }}</span>
              </button>
            </div>
          </div>

          <!-- Message list -->
          <TransitionGroup name="message" tag="div" class="ai-chatbot__message-list">
            <div
              v-for="message in messages"
              :key="message.id"
              class="ai-chatbot__message"
              :class="`ai-chatbot__message--${message.role}`"
            >
              <!-- Avatar -->
              <div class="ai-chatbot__message-avatar">
                <svg
                  v-if="message.role === 'assistant'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                </svg>
                <svg
                  v-else-if="message.role === 'user'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21v-2a7 7 0 0 1 13 0v2" />
                </svg>
              </div>

              <!-- Message content -->
              <div class="ai-chatbot__message-content">
                <!-- Typing indicator -->
                <div v-if="message.streaming && !message.content" class="ai-chatbot__typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <!-- Message text with markdown support -->
                <div
                  v-else
                  class="ai-chatbot__message-text"
                  v-html="renderMarkdown(message.content)"
                ></div>

                <!-- Code blocks -->
                <div v-if="message.metadata?.codeBlocks" class="ai-chatbot__code-blocks">
                  <div
                    v-for="(block, index) in message.metadata.codeBlocks"
                    :key="index"
                    class="ai-chatbot__code-block"
                  >
                    <div class="ai-chatbot__code-header">
                      <span class="ai-chatbot__code-lang">{{ block.language }}</span>
                      <button class="ai-chatbot__code-copy" @click="copyCode(block.code)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                    </div>
                    <pre><code :class="`language-${block.language}`">{{ block.code }}

</code></pre>
                  </div>
                </div>

                <!-- Attachments -->
                <div v-if="message.attachments?.length" class="ai-chatbot__attachments">
                  <div
                    v-for="attachment in message.attachments"
                    :key="attachment.id"
                    class="ai-chatbot__attachment"
                    @click="viewAttachment(attachment)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                      />
                    </svg>
                    <span>{{ attachment.filename }} </span>
                  </div>
                </div>

                <!-- Message actions -->
                <div class="ai-chatbot__message-actions">
                  <span class="ai-chatbot__message-time">{{ formatTime(message.timestamp) }}</span>

                  <div class="ai-chatbot__message-buttons">
                    <button
                      class="ai-chatbot__message-btn"
                      @click="copyMessage(message.content)"
                      :aria-label="$t('ai.copy')"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>

                    <button
                      v-if="message.role === 'assistant'"
                      class="ai-chatbot__message-btn"
                      @click="regenerateMessage(message)"
                      :aria-label="$t('ai.regenerate')"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                        />
                      </svg>
                    </button>

                    <button
                      v-if="message.role === 'assistant'"
                      class="ai-chatbot__message-btn"
                      @click="speakMessage(message.content)"
                      :aria-label="$t('ai.speak')"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                    </button>

                    <button
                      class="ai-chatbot__message-btn"
                      @click="toggleReaction(message, 'helpful')"
                      :class="{ active: hasReaction(message, 'helpful') }"
                      :aria-label="$t('ai.helpful')"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="ai-chatbot__loading">
            <div class="ai-chatbot__loading-spinner"></div>
            <span>{{ $t("ai.thinking") }} </span>
          </div>
        </div>

        <!-- Input area -->
        <div class="ai-chatbot__input-area">
          <!-- File attachment -->
          <button
            class="ai-chatbot__attach"
            @click="selectFile"
            :aria-label="$t('ai.attach')"
            :title="$t('ai.attach')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
              />
            </svg>
          </button>

          <!-- Text input -->
          <div class="ai-chatbot__input-wrapper">
            <textarea
              ref="inputField"
              v-model="inputText"
              class="ai-chatbot__input"
              :placeholder="inputPlaceholder"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.prevent="inputText += '\n'"
              @input="handleInput"
              :disabled="isLoading"
              rows="1"
            ></textarea>

            <!-- Character count -->
            <span v-if="showCharCount" class="ai-chatbot__char-count">
              {{ inputText.length ?? 0 }} / {{ maxChars }}
            </span>
          </div>

          <!-- Voice input -->
          <button
            v-if="voiceEnabled"
            class="ai-chatbot__voice-btn"
            :class="{ 'ai-chatbot__voice-btn--recording': isRecording }"
            @click="toggleRecording"
            :aria-label="$t('ai.voiceInput')"
            :title="$t('ai.voiceInput')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </button>

          <!-- Send button -->
          <button
            class="ai-chatbot__send"
            :disabled="!canSend"
            @click="sendMessage"
            :aria-label="$t('ai.send')"
            :title="$t('ai.send')"
          >
            <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <svg
              v-else
              class="ai-chatbot__send-loading"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </button>
        </div>

        <!-- Context indicator -->
        <div v-if="currentContext" class="ai-chatbot__context">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{{ contextDescription }} </span>
          <button @click="clearContext" class="ai-chatbot__context-clear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Settings modal -->
    <Teleport to="body">
      <AIChatSettings v-if="showSettings" @close="showSettings = false" @update="updateSettings" />
    </Teleport>

    <!-- File input (hidden) -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="handleFileSelect"
      accept=".txt,.js,.ts,.vue,.jsx,.tsx,.json,.md,.html,.css,.scss,.py,.java,.cpp,.c,.go,.rs,.php,.rb,.swift"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { aiService } from "@/services/ai/aiService";
import type { IChatMessage, IChatContext, IChatAttachment } from "@/types/ai";
import { analytics } from "@/services/analytics";
import AIChatSettings from "./AIChatSettings.vue";

// Props
interface Props {
  context?: IChatContext;
  startOpen?: boolean;
  voiceEnabled?: boolean;
  showSuggestions?: boolean;
  maxChars?: number;
}

const props = withDefaults(defineProps<Props>(), {
  startOpen: false,
  voiceEnabled: true,
  showSuggestions: true,
  maxChars: 2000,
});

// Emits
const emit = defineEmits<{
  "message-sent": [message: IChatMessage];
  "context-changed": [context: IChatContext | null];
}>();

// i18n
const { t } = useI18n();

// Refs
const isOpen = ref(props.startOpen);
const isFullscreen = ref(false);
const isLoading = ref(false);
const inputText = ref("");
const messages = ref<IChatMessage[]>([]);
const messagesContainer = ref<HTMLElement>();
const inputField = ref<HTMLTextAreaElement>();
const fileInput = ref<HTMLInputElement>();
const showSettings = ref(false);
const voiceActive = ref(false);
const isRecording = ref(false);
const unreadCount = ref(0);
const currentContext = ref<IChatContext | null>(props.context || null);
const sessionId = ref<string | null>(null);

// Quick actions for welcome screen
const quickActions = [
  {
    id: "explain",
    icon: "💡",
    label: t("ai.quickActions.explain"),
    description: t("ai.quickActions.explainDesc"),
    prompt: "Can you explain the concept I'm working on?",
  },
  {
    id: "debug",
    icon: "🐛",
    label: t("ai.quickActions.debug"),
    description: t("ai.quickActions.debugDesc"),
    prompt: "Help me debug this code",
  },
  {
    id: "improve",
    icon: "✨",
    label: t("ai.quickActions.improve"),
    description: t("ai.quickActions.improveDesc"),
    prompt: "How can I improve this solution?",
  },
  {
    id: "learn",
    icon: "📚",
    label: t("ai.quickActions.learn"),
    description: t("ai.quickActions.learnDesc"),
    prompt: "Create a study plan for me",
  },
];

// Suggestions
const suggestions = ref([
  { id: "1", icon: "💡", text: "Explain this concept" },
  { id: "2", icon: "🔍", text: "Show me an example" },
  { id: "3", icon: "📝", text: "Give me practice problems" },
  { id: "4", icon: "🎯", text: "What should I learn next?" },
]);

// Computed
const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !isLoading.value;
});

const showCharCount = computed(() => {
  return inputText.value.length > props.maxChars * 0.8;
});

const inputPlaceholder = computed(() => {
  if (isLoading.value) return t("ai.thinking");
  if (isRecording.value) return t("ai.listening");
  return t("ai.inputPlaceholder");
});

const statusClass = computed(() => {
  if (isLoading.value) return "ai-chatbot__status--thinking";
  if (voiceActive.value) return "ai-chatbot__status--listening";
  return "ai-chatbot__status--online";
});

const statusText = computed(() => {
  if (isLoading.value) return t("ai.statusThinking");
  if (voiceActive.value) return t("ai.statusListening");
  return t("ai.statusOnline");
});

const contextDescription = computed(() => {
  if (!currentContext.value) return "";

  const parts = [];
  if (currentContext.value.topic) parts.push(currentContext.value.topic);
  if (currentContext.value.difficulty) parts.push(currentContext.value.difficulty);
  if (currentContext.value.framework) parts.push(currentContext.value.framework);

  return parts.join(" • ");
});

// Methods
const openChat = () => {
  isOpen.value = true;
  unreadCount.value = 0;
  emit("open");

  analytics.track("ai_chat_opened", {
    context: currentContext.value,
  });

  nextTick(() => {
    inputField.value?.focus();
  });
};

const closeChat = () => {
  isOpen.value = false;
  emit("close");

  analytics.track("ai_chat_closed", {
    messages_count: messages.value.length,
    session_id: sessionId.value,
  });
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;

  analytics.track("ai_chat_fullscreen", {
    fullscreen: isFullscreen.value,
  });
};

const toggleVoice = () => {
  voiceActive.value = !voiceActive.value;

  if (voiceActive.value) {
    startVoiceRecognition();
  } else {
    stopVoiceRecognition();
  }
};

const sendMessage = async () => {
  if (!canSend.value) return;
  const messageText = inputText.value.trim();
  inputText.value = "";
  try {
    isLoading.value = true;

    // Create user message
    const userMessage: IChatMessage = {
      id: generateId(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    messages.value.push(userMessage);
    emit("message-sent", userMessage);

    // Scroll to bottom
    scrollToBottom();

    // Send to AI service
    const response = await aiService.sendMessage(
      messageText,
      currentContext.value || undefined,
      sessionId.value || undefined
    );

    messages.value.push(response);

    // Track analytics
    analytics.track("ai_message_sent", {
      message_length: messageText.length,
      context: currentContext.value,
      session_id: sessionId.value,
    });

    // Auto-scroll to new message
    scrollToBottom();
  } catch (error) {
    console.error("Error sending message:", error);
    // Add user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userFriendlyMessage = t("ai.errorSending");

    if (errorMessage.includes("401")) {
      userFriendlyMessage = "🔐 Authentication required. Please refresh the page and try again.";
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      userFriendlyMessage = "🌐 Network error. Please check your connection and try again.";
    } else if (errorMessage.includes("timeout")) {
      userFriendlyMessage = "⏱️ Request timed out. Please try again.";
    }

    messages.value.push({
      id: generateId(),
      role: "error",
      content: userFriendlyMessage,
      timestamp: new Date(),
      metadata: {
        originalError: errorMessage,
        retryable: true,
      },
    });
  } finally {
    isLoading.value = false;
  }
};

const handleQuickAction = (action: any) => {
  inputText.value = action.prompt;
  sendMessage();
};

const selectSuggestion = (suggestion: any) => {
  inputText.value = suggestion.text;
  sendMessage();
};

const regenerateMessage = async (message: IChatMessage) => {
  const index = messages.value.findIndex((m) => m.id === message.id);
  if (index === -1) return;

  // Remove this message and all after it
  messages.value = messages.value.slice(0, index);

  // Resend the previous user message
  const previousUserMessage = messages.value[index - 1];
  if (previousUserMessage && previousUserMessage.role === "user") {
    inputText.value = previousUserMessage.content;
    sendMessage();
  }
};

const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content);

  // Show toast notification
  analytics.track("ai_message_copied");
};

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code);
  analytics.track("ai_code_copied");
};

const speakMessage = (content: string) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(content);
    speechSynthesis.speak(utterance);
  }
};

const toggleReaction = (_message: IChatMessage, type: string) => {
  // Implementation for reactions
  analytics.track("ai_message_reaction", { type });
};

const hasReaction = (message: IChatMessage, type: string): boolean => {
  return message.reactions?.some((r) => r.type === type && r.userReacted) || false;
};

const handleInput = () => {
  // Auto-resize textarea
  if (inputField.value) {
    inputField.value.style.height = "auto";
    inputField.value.style.height = `${Math.min(inputField.value.scrollHeight, 120)}px`;
  }
};

const selectFile = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // Read file content
    const content = await readFile(file);

    // Add as attachment or include in message
    inputText.value = `\`\`\`${getFileLanguage(file.name)}\n${content}\n\`\`\`\n\n`;

    analytics.track("ai_file_attached", {
      file_type: file.type,
      file_size: file.size,
    });
  }
};

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const getFileLanguage = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    vue: "vue",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    swift: "swift",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    md: "markdown",
  };
  return langMap[ext || ""] || "text";
};

const viewAttachment = (attachment: IChatAttachment) => {
  // Implementation for viewing attachments
  console.log("View attachment:", attachment);
};

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const startRecording = () => {
  // Implementation for voice recording
  isRecording.value = true;
  analytics.track("ai_voice_recording_started");
};

const stopRecording = () => {
  // Implementation for voice recording
  isRecording.value = false;
  analytics.track("ai_voice_recording_stopped");
};

const startVoiceRecognition = () => {
  // Implementation for voice recognition
  analytics.track("ai_voice_recognition_started");
};

const stopVoiceRecognition = () => {
  // Implementation for voice recognition
  analytics.track("ai_voice_recognition_stopped");
};

const clearContext = () => {
  currentContext.value = null;
  emit("context-changed", null);
};

const updateSettings = (settings: any) => {
  // Update AI service settings
  console.log("Update settings:", settings);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatTime = (timestamp: Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return t("ai.justNow");
  if (minutes < 60) return t("ai.minutesAgo", { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("ai.hoursAgo", { count: hours });

  return date.toLocaleDateString();
};

const renderMarkdown = (content: string): string => {
  // Simple markdown to HTML converter
  // Replace **bold** with <strong>
  let html = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Replace *italic* with <em>
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Replace `code` with <code>
  html = html.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
  // Replace newlines with <br>
  html = html.replace(/\n/g, "<br>");
  return html;
};

const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Lifecycle
onMounted(() => {
  // Initialize AI service if needed
  if (!aiService.isInitialized) {
    // Initialize with API key from environment or user settings
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      aiService.initialize(apiKey);
    }
  }

  // Load previous session if exists
  const sessions = aiService.getSessions();
  if (sessions.length > 0) {
    const latestSession = sessions[sessions.length - 1];
    if (latestSession) {
      sessionId.value = latestSession.id;
      messages.value = latestSession.messages;
    }
  }

  // Set up keyboard shortcut
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === "A") {
      e.preventDefault();
      if (isOpen.value) {
        closeChat();
      } else {
        openChat();
      }
    }
  };

  window.addEventListener("keydown", handleKeydown);

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
});

// Watch for context changes
watch(
  () => props.context,
  (newContext) => {
    currentContext.value = newContext || null;
  }
);
</script>

<style scoped>
/* Container */
.ai-chatbot {
  @apply fixed z-[9998];

  pointer-events: none;
}

/* Floating action button */
.ai-chatbot__fab {
  @apply fixed bottom-6 right-6 z-[9999];
  @apply h-16 w-16 rounded-full;
  @apply bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600;
  @apply text-white shadow-2xl;
  @apply flex items-center justify-center;
  @apply hover:scale-110 hover:shadow-2xl;
  @apply transition-all duration-300 ease-out;
  @apply cursor-pointer;
  @apply border-2 border-white/20;
  @apply backdrop-blur-sm;

  pointer-events: auto;
  box-shadow:
    0 20px 40px -12px rgb(59, 130, 246, 0.4),
    0 0 0 1px rgb(255, 255, 255, 0.1),
    inset 0 1px 0 rgb(255, 255, 255, 0.2);
}

.ai-chatbot__fab:hover {
  box-shadow:
    0 25px 50px -12px rgb(59, 130, 246, 0.5),
    0 0 0 1px rgb(255, 255, 255, 0.2),
    inset 0 1px 0 rgb(255, 255, 255, 0.3);
  transform: scale(1.1) translateY(-2px);
}

.ai-chatbot__fab-icon {
  @apply h-8 w-8;
  @apply transition-transform duration-300;
}

.ai-chatbot__fab:hover .ai-chatbot__fab-icon {
  @apply scale-110;
}

.ai-chatbot__fab-icon svg {
  @apply h-full w-full;
  @apply drop-shadow-sm;
}

.ai-chatbot__fab-pulse {
  @apply absolute inset-0 rounded-full;
  @apply bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500;
  @apply animate-ping opacity-60;
}

.ai-chatbot__unread {
  @apply absolute -right-2 -top-2;
  @apply h-6 w-6 rounded-full;
  @apply bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white;
  @apply flex items-center justify-center;
  @apply font-bold;
  @apply border-2 border-white;
  @apply shadow-lg;
  @apply animate-bounce;
}

/* Chat window */
.ai-chatbot__window {
  @apply fixed bottom-28 right-6 z-[9998];
  @apply h-[650px] w-[420px];
  @apply bg-white/95 dark:bg-gray-800/95;
  @apply rounded-3xl shadow-2xl;
  @apply border border-gray-200/50 dark:border-gray-700/50;
  @apply flex flex-col overflow-hidden;
  @apply backdrop-blur-xl;

  pointer-events: auto;
  box-shadow:
    0 25px 50px -12px rgb(0, 0, 0, 0.25),
    0 0 0 1px rgb(255, 255, 255, 0.1),
    inset 0 1px 0 rgb(255, 255, 255, 0.2);
}

.ai-chatbot--fullscreen .ai-chatbot__window {
  @apply fixed inset-4;
  @apply h-auto w-auto;
  @apply mx-auto max-w-7xl;
  @apply rounded-2xl;
}

/* Header */
.ai-chatbot__header {
  @apply flex items-center justify-between;
  @apply px-6 py-4;
  @apply bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700;
  @apply text-white;
  @apply backdrop-blur-sm;
  @apply border-b border-white/10;
}

.ai-chatbot__header-left {
  @apply flex items-center gap-4;
}

.ai-chatbot__avatar {
  @apply relative;
}

.ai-chatbot__avatar-ring {
  @apply h-12 w-12 rounded-full;
  @apply bg-white/20 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply animate-pulse;
  @apply border-2 border-white/30;
  @apply shadow-lg;
}

.ai-chatbot__avatar-ring svg {
  @apply h-7 w-7;
  @apply drop-shadow-sm;
}

.ai-chatbot__header-info {
  @apply flex flex-col;
}

.ai-chatbot__title {
  @apply text-base font-bold;
  @apply drop-shadow-sm;
}

.ai-chatbot__status {
  @apply flex items-center gap-2 text-sm opacity-90;
}

.ai-chatbot__status-dot {
  @apply h-2.5 w-2.5 rounded-full bg-green-400;
  @apply animate-pulse;
  @apply shadow-sm;
}

.ai-chatbot__status--thinking .ai-chatbot__status-dot {
  @apply bg-yellow-400;
}

.ai-chatbot__status--listening .ai-chatbot__status-dot {
  @apply bg-blue-400;
}

.ai-chatbot__header-actions {
  @apply flex items-center gap-2;
}

.ai-chatbot__action {
  @apply h-9 w-9 rounded-xl;
  @apply text-white/80 hover:text-white;
  @apply hover:bg-white/20;
  @apply transition-all duration-200;
  @apply flex items-center justify-center;
  @apply backdrop-blur-sm;
}

.ai-chatbot__action:hover {
  @apply scale-110;
}

.ai-chatbot__action svg {
  @apply h-5 w-5;
}

/* Suggestions */
.ai-chatbot__suggestions {
  @apply flex gap-3 px-6 py-3;
  @apply bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800;
  @apply border-b border-gray-200/50 dark:border-gray-700/50;
  @apply overflow-x-auto;
  @apply backdrop-blur-sm;
}

.ai-chatbot__suggestion {
  @apply flex items-center gap-2;
  @apply rounded-2xl px-4 py-2.5;
  @apply bg-white/90 dark:bg-gray-800/90;
  @apply border border-gray-200/50 dark:border-gray-700/50;
  @apply whitespace-nowrap text-sm;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400;
  @apply hover:scale-105 hover:shadow-md;
  @apply transition-all duration-200;
  @apply backdrop-blur-sm;
  @apply font-medium;
}

.ai-chatbot__suggestion:hover {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.ai-chatbot__suggestion-icon {
  @apply text-lg;
}

/* Messages area */
.ai-chatbot__messages {
  @apply flex-1 overflow-y-auto;
  @apply px-6 py-6;
  @apply bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800;
}

/* Welcome */
.ai-chatbot__welcome {
  @apply py-8 text-center;
}

.ai-chatbot__welcome-title {
  @apply mb-3 text-xl font-bold text-gray-900 dark:text-white;
  @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
}

.ai-chatbot__welcome-text {
  @apply mb-8 text-sm text-gray-600 dark:text-gray-400;
  @apply leading-relaxed;
}

.ai-chatbot__quick-actions {
  @apply grid grid-cols-2 gap-4;
}

.ai-chatbot__quick-action {
  @apply flex flex-col items-center gap-3;
  @apply rounded-2xl p-5;
  @apply bg-white/80 dark:bg-gray-800/80;
  @apply border border-gray-200/50 dark:border-gray-700/50;
  @apply hover:scale-105 hover:border-blue-300 hover:shadow-lg;
  @apply transition-all duration-200;
  @apply text-left;
  @apply backdrop-blur-sm;
}

.ai-chatbot__quick-action:hover {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.ai-chatbot__quick-action-icon {
  @apply text-3xl;
}

.ai-chatbot__quick-action-label {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.ai-chatbot__quick-action-desc {
  @apply text-xs text-gray-600 dark:text-gray-400;
  @apply text-center;
}

/* Message list */
.ai-chatbot__message-list {
  @apply space-y-4;
}

/* Message */
.ai-chatbot__message {
  @apply flex gap-3;

  animation: message-in 0.3s ease-out;
}

@keyframes message-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-chatbot__message--user {
  @apply flex-row-reverse;
}

.ai-chatbot__message-avatar {
  @apply h-8 w-8 flex-shrink-0 rounded-full;
  @apply bg-gray-200 dark:bg-gray-700;
  @apply flex items-center justify-center;
}

.ai-chatbot__message-avatar svg {
  @apply h-5 w-5 text-gray-600 dark:text-gray-400;
}

.ai-chatbot__message--assistant .ai-chatbot__message-avatar {
  @apply bg-gradient-to-r from-primary to-secondary;
}

.ai-chatbot__message--assistant .ai-chatbot__message-avatar svg {
  @apply text-white;
}

.ai-chatbot__message-content {
  @apply min-w-0 flex-1;
}

/* Message text */
.ai-chatbot__message-text {
  @apply inline-block rounded-2xl px-4 py-2;
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
  @apply text-sm text-gray-900 dark:text-white;
  @apply max-w-[85%];

  word-wrap: break-word;
}

.ai-chatbot__message--user .ai-chatbot__message-text {
  @apply bg-gradient-to-r from-blue-500 to-purple-600;
  @apply border-0 text-white;
  @apply shadow-md;
}

.ai-chatbot__message--error .ai-chatbot__message-text {
  @apply bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20;
  @apply border-red-200 dark:border-red-800;
  @apply text-red-700 dark:text-red-300;
  @apply shadow-sm;
}

/* Typing indicator */
.ai-chatbot__typing {
  @apply flex gap-1 px-4 py-3;
  @apply bg-white dark:bg-gray-800;
  @apply inline-flex rounded-2xl;
  @apply border border-gray-200 dark:border-gray-700;
}

.ai-chatbot__typing span {
  @apply h-2 w-2 rounded-full bg-gray-400;

  animation: typing 1.4s infinite;
}

.ai-chatbot__typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.ai-chatbot__typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-10px);
  }
}

/* Message actions */
.ai-chatbot__message-actions {
  @apply mt-1 flex items-center justify-between;
  @apply text-xs text-gray-500 dark:text-gray-500;
}

.ai-chatbot__message-buttons {
  @apply flex gap-1 opacity-0 transition-opacity;
}

.ai-chatbot__message:hover .ai-chatbot__message-buttons {
  @apply opacity-100;
}

.ai-chatbot__message-btn {
  @apply h-6 w-6 rounded;
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
  @apply flex items-center justify-center;
}

.ai-chatbot__message-btn svg {
  @apply h-4 w-4;
}

.ai-chatbot__message-btn.active {
  @apply bg-primary-100 text-primary dark:bg-primary-900/30;
}

/* Loading */
.ai-chatbot__loading {
  @apply flex items-center justify-center gap-3 py-4;
  @apply text-gray-600 dark:text-gray-400;
}

.ai-chatbot__loading-spinner {
  @apply h-5 w-5 border-2 border-primary border-t-transparent;
  @apply animate-spin rounded-full;
}

/* Input area */
.ai-chatbot__input-area {
  @apply flex items-end gap-4 p-6;
  @apply bg-gradient-to-r from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95;
  @apply border-t border-gray-200/50 dark:border-gray-700/50;
  @apply backdrop-blur-xl;
  @apply shadow-lg;
}

.ai-chatbot__attach {
  @apply h-11 w-11 rounded-xl;
  @apply text-gray-500 hover:text-gray-700 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-200;
  @apply flex items-center justify-center;
  @apply backdrop-blur-sm;
  @apply border border-gray-200/50 dark:border-gray-700/50;
}

.ai-chatbot__attach:hover {
  @apply scale-110 shadow-md;
}

.ai-chatbot__attach svg {
  @apply h-5 w-5;
}

.ai-chatbot__input-wrapper {
  @apply relative flex-1;
}

.ai-chatbot__input {
  @apply w-full px-6 py-4;
  @apply bg-white/90 dark:bg-gray-900/90;
  @apply resize-none rounded-2xl;
  @apply text-sm text-gray-900 dark:text-white;
  @apply placeholder-gray-500 dark:placeholder-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/50;
  @apply transition-all duration-200;
  @apply backdrop-blur-sm;
  @apply border border-gray-200/50 dark:border-gray-700/50;
  @apply shadow-sm;

  min-height: 48px;
  max-height: 120px;
}

.ai-chatbot__input:focus {
  @apply bg-white dark:bg-gray-800;
  @apply border-blue-300 dark:border-blue-600;
  @apply shadow-md;
}

.ai-chatbot__char-count {
  @apply absolute bottom-3 right-5;
  @apply text-xs text-gray-500;
  @apply bg-white/80 dark:bg-gray-800/80;
  @apply rounded px-2 py-1;
  @apply backdrop-blur-sm;
}

.ai-chatbot__voice-btn,
.ai-chatbot__send {
  @apply h-11 w-11 rounded-xl;
  @apply bg-gradient-to-r from-blue-500 to-purple-600 text-white;
  @apply hover:from-blue-600 hover:to-purple-700;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
  @apply transition-all duration-200;
  @apply flex items-center justify-center;
  @apply shadow-md;
  @apply border border-white/20;
}

.ai-chatbot__voice-btn:hover,
.ai-chatbot__send:hover {
  @apply scale-110 shadow-lg;
}

.ai-chatbot__voice-btn svg,
.ai-chatbot__send svg {
  @apply h-5 w-5;
}

.ai-chatbot__voice-btn--recording {
  @apply bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700;
  @apply animate-pulse;
}

.ai-chatbot__send-loading {
  @apply animate-spin;
}

/* Context indicator */
.ai-chatbot__context {
  @apply flex items-center gap-2 px-4 py-2;
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply border-t border-blue-200 dark:border-blue-800;
  @apply text-xs text-blue-700 dark:text-blue-300;
}

.ai-chatbot__context svg {
  @apply h-4 w-4;
}

.ai-chatbot__context-clear {
  @apply ml-auto h-5 w-5 rounded;
  @apply hover:bg-blue-100 dark:hover:bg-blue-900/40;
  @apply transition-all duration-fast;
  @apply flex items-center justify-center;
}

.ai-chatbot__context-clear svg {
  @apply h-3 w-3;
}

/* Transitions */
.scale-enter-active,
.scale-leave-active {
  @apply transition-all duration-fast;
}

.scale-enter-from,
.scale-leave-to {
  @apply scale-0 opacity-0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  @apply transition-all duration-moderate;
}

.slide-up-enter-from,
.slide-up-leave-to {
  @apply translate-y-full opacity-0;
}

.message-enter-active,
.message-leave-active {
  @apply transition-all duration-fast;
}

.message-enter-from {
  @apply translate-y-4 opacity-0;
}

.message-leave-to {
  @apply -translate-y-4 opacity-0;
}

.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-fast;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

/* Mobile responsiveness */
@media (width <= 640px) {
  .ai-chatbot__window {
    @apply fixed inset-0;
    @apply h-full w-full;
    @apply rounded-none;
    @apply bottom-0 right-0;
  }

  .ai-chatbot__quick-actions {
    @apply grid-cols-1;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ai-chatbot__fab-pulse,
  .ai-chatbot__typing span,
  .ai-chatbot__loading-spinner,
  .ai-chatbot__message {
    animation: none !important;
  }

  .ai-chatbot__status-dot {
    animation: none;
  }
}
</style>
