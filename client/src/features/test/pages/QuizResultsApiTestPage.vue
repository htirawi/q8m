<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useQuizResults } from "@/composables/useQuizResults";

const { isLoading, error, quizHistory, quizStats, weakAreas, getHistory, getStats, getWeakAreas } =
  useQuizResults();

const activeTab = ref<"history" | "stats" | "weak-areas">("history");
const historyLimit = ref(10);

onMounted(async () => {
  await loadData();
});

async function loadData() {
  await getHistory({ limit: historyLimit.value });
  await getStats();
  await getWeakAreas();
}

async function refreshData() {
  await loadData();
}

async function loadMore() {
  historyLimit.value += 10;
  await getHistory({ limit: historyLimit.value });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 80) return "#3b82f6";
  if (score >= 70) return "#f59e0b";
  return "#ef4444";
}
</script>

<template>
  <div class="test-quiz-results">
    <header class="dashboard-header">
      <h1>Quiz Results (Test)</h1>
      <button @click="refreshData" :disabled="isLoading" class="refresh-btn">
        {{ isLoading ? "Loading..." : "Refresh Data" }}
      </button>
    </header>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-if="isLoading && !quizHistory.length" class="loading-state">Loading quiz results...</div>

    <div v-else class="dashboard-content">
      <!-- Tabs -->
      <div class="tabs">
        <button
          @click="activeTab = 'history'"
          :class="{ active: activeTab === 'history' }"
          class="tab-btn"
        >
          History
        </button>
        <button
          @click="activeTab = 'stats'"
          :class="{ active: activeTab === 'stats' }"
          class="tab-btn"
        >
          Statistics
        </button>
        <button
          @click="activeTab = 'weak-areas'"
          :class="{ active: activeTab === 'weak-areas' }"
          class="tab-btn"
        >
          Weak Areas
        </button>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <section class="section">
          <h2>Quiz History</h2>

          <div v-if="quizHistory.length === 0" class="empty-state">
            No quiz history available. Complete a quiz to see your results here!
          </div>

          <div v-else class="quiz-history-list">
            <div v-for="quiz in quizHistory" :key="quiz.id" class="quiz-card">
              <div class="quiz-header">
                <div class="quiz-type-badge">{{ quiz.quizType }}</div>
                <div class="quiz-level-badge">{{ quiz.level ?? 0 }}</div>
                <div class="quiz-score" :style="{ color: getScoreColor(quiz.score) }">
                  {{ quiz.score ?? 0 }}%
                </div>
              </div>

              <div class="quiz-details">
                <div class="detail-row">
                  <span class="detail-label">Questions:</span>
                  <span class="detail-value">
                    {{ quiz.correctAnswers }} / {{ quiz.totalQuestions }}

                    correct
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">{{ formatDuration(quiz.totalTimeSeconds) }} </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">XP Earned:</span>
                  <span class="detail-value"
                    >+{{ quiz.xpEarned }}

                    XP</span
                  >
                </div>
                <div v-if="quiz.badgesEarned.length > 0" class="detail-row">
                  <span class="detail-label">Badges:</span>
                  <span class="detail-value"
                    >{{ quiz.badgesEarned?.length ?? 0 }}

                    earned 🏆</span
                  >
                </div>
                <div v-if="quiz.weakCategories.length > 0" class="detail-row">
                  <span class="detail-label">Weak Categories:</span>
                  <span class="detail-value weak">{{ quiz.weakCategories?.join(", ") }} </span>
                </div>
              </div>

              <div class="quiz-date">
                {{ new Date(quiz.createdAt).toLocaleString() }}
              </div>
            </div>

            <button
              v-if="quizHistory.length >= historyLimit"
              @click="loadMore"
              :disabled="isLoading"
              class="load-more-btn"
            >
              Load More
            </button>
          </div>
        </section>
      </div>

      <!-- Statistics Tab -->
      <div v-if="activeTab === 'stats' && quizStats" class="tab-content">
        <section class="section">
          <h2>Quiz Statistics</h2>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Quizzes</div>
              <div class="stat-value">{{ quizStats.totalQuizzes }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Questions</div>
              <div class="stat-value">{{ quizStats.totalQuestions }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Overall Accuracy</div>
              <div class="stat-value">{{ quizStats.overallAccuracy }}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total XP</div>
              <div class="stat-value">{{ quizStats.totalXPFromQuizzes }}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Perfect Quizzes</div>
              <div class="stat-value perfect">{{ quizStats.perfectQuizzes }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Excellent (90%+)</div>
              <div class="stat-value excellent">{{ quizStats.excellentQuizzes }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Good (80-89%)</div>
              <div class="stat-value good">{{ quizStats.goodQuizzes }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Passing (70-79%)</div>
              <div class="stat-value passing">{{ quizStats.passingQuizzes }}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Time</div>
              <div class="stat-value">
                {{ Math.round(quizStats.totalTimeMinutes) }}

                m
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Avg Quiz Duration</div>
              <div class="stat-value">
                {{ quizStats.averageQuizDuration }}

                m
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Fastest Quiz</div>
              <div class="stat-value">{{ formatDuration(quizStats.fastestQuiz) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Recent Accuracy</div>
              <div class="stat-value">{{ quizStats.recentAccuracy }}%</div>
            </div>
          </div>
        </section>
      </div>

      <!-- Weak Areas Tab -->
      <div v-if="activeTab === 'weak-areas'" class="tab-content">
        <section class="section">
          <h2>Weak Areas</h2>
          <p class="section-subtitle">Categories where your accuracy is below 70%</p>

          <div v-if="weakAreas.length === 0" class="empty-state">
            No weak areas detected! Great job! 🎉
          </div>

          <div v-else class="weak-areas-list">
            <div v-for="area in weakAreas" :key="area.category" class="weak-area-card">
              <div class="weak-area-header">
                <h3>{{ area.category }}</h3>
                <div
                  class="accuracy-badge"
                  :style="{ backgroundColor: getScoreColor(area.accuracy) }"
                >
                  {{ Math.round(area.accuracy) }}%
                </div>
              </div>

              <div class="weak-area-details">
                <div class="detail-row">
                  <span class="detail-label">Questions Attempted:</span>
                  <span class="detail-value">{{ area.questionsAttempted }} </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Questions Correct:</span>
                  <span class="detail-value">{{ area.questionsCorrect }} </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Last Attempt:</span>
                  <span class="detail-value">
                    {{ new Date(area.lastAttemptDate).toLocaleDateString() }}
                  </span>
                </div>
              </div>

              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: `${area.accuracy}%`,
                    backgroundColor: getScoreColor(area.accuracy),
                  }"
                ></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base styles reused */
.test-quiz-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.refresh-btn {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-banner {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  font-size: 1.125rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.section-subtitle {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-value.perfect {
  color: #10b981;
}

.stat-value.excellent {
  color: #3b82f6;
}

.stat-value.good {
  color: #f59e0b;
}

.stat-value.passing {
  color: #ef4444;
}

/* Quiz History styles */
.quiz-history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.quiz-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
}

.quiz-type-badge,
.quiz-level-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.quiz-type-badge {
  background: #dbeafe;
  color: #1e40af;
}

.quiz-level-badge {
  background: #fef3c7;
  color: #92400e;
}

.quiz-score {
  margin-left: auto;
  font-size: 1.5rem;
  font-weight: 700;
}

.quiz-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  font-weight: 600;
  color: #1a202c;
}

.detail-value.weak {
  color: #ef4444;
}

.quiz-date {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: right;
  margin-top: 0.5rem;
}

.load-more-btn {
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 600;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #f9fafb;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Weak Areas styles */
.weak-areas-list {
  display: grid;
  gap: 1rem;
}

.weak-area-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.weak-area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.weak-area-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
}

.accuracy-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
}

.weak-area-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}
</style>
