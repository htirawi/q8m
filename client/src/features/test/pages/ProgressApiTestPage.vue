<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useProgress } from "@/composables/useProgress";

const { isLoading, error, progress, stats, getProgress, getStats } = useProgress();

const activeTab = ref<"overview" | "stats">("overview");

onMounted(async () => {
  await getProgress();
  await getStats();
});

async function refreshData() {
  await getProgress();
  await getStats();
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}
</script>

<template>
  <div class="test-progress-dashboard">
    <header class="dashboard-header">
      <h1>Progress Dashboard (Test)</h1>
      <button @click="refreshData" :disabled="isLoading" class="refresh-btn">
        {{ isLoading ? "Loading..." : "Refresh Data" }}
      </button>
    </header>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-if="isLoading && !progress" class="loading-state">Loading progress data...</div>

    <div v-else-if="progress" class="dashboard-content">
      <!-- Tabs -->
      <div class="tabs">
        <button
          @click="activeTab = 'overview'"
          :class="{ active: activeTab === 'overview' }"
          class="tab-btn"
        >
          Overview
        </button>
        <button
          @click="activeTab = 'stats'"
          :class="{ active: activeTab === 'stats' }"
          class="tab-btn"
        >
          Detailed Stats
        </button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- XP & Level Section -->
        <section class="section">
          <h2>Experience & Level</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Current XP</div>
              <div class="stat-value">{{ progress.xp }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Level</div>
              <div class="stat-value">{{ progress.level }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Badges</div>
              <div class="stat-value">{{ progress.badges?.length ?? 0 }}</div>
            </div>
          </div>
        </section>

        <!-- Mastery Stats Section -->
        <section v-if="progress.masteryStats" class="section">
          <h2>Mastery Breakdown</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Mastered</div>
              <div class="stat-value mastered">{{ progress.masteryStats.mastered }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Familiar</div>
              <div class="stat-value familiar">{{ progress.masteryStats.familiar }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Learning</div>
              <div class="stat-value learning">{{ progress.masteryStats.learning }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">New</div>
              <div class="stat-value new">{{ progress.masteryStats.new }}</div>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Questions</div>
              <div class="stat-value">{{ progress.masteryStats.totalQuestions }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Accuracy</div>
              <div class="stat-value">{{ progress.masteryStats.accuracy }}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Due for Review</div>
              <div class="stat-value">{{ progress.masteryStats.dueForReview }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Overdue Reviews</div>
              <div class="stat-value">{{ progress.masteryStats.overdueReviews }}</div>
            </div>
          </div>
        </section>

        <!-- Streaks Section -->
        <section class="section">
          <h2>Study Streaks</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Current Streak</div>
              <div class="stat-value streak">
                {{ progress.streaks?.currentStreak ?? 0 }}

                days
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Longest Streak</div>
              <div class="stat-value">
                {{ progress.streaks?.longestStreak ?? 0 }}

                days
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Last Activity</div>
              <div class="stat-value">
                {{ formatDate(progress.streaks?.lastActivityDate ?? new Date()) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Difficulty Progress Section -->
        <section class="section">
          <h2>Difficulty Progress</h2>
          <div class="difficulty-grid">
            <div class="difficulty-card">
              <h3>Easy</h3>
              <p>
                Mastered: <strong>{{ progress.difficultyProgress?.easy?.mastered ?? 0 }} </strong>
              </p>
              <p>
                Familiar: <strong>{{ progress.difficultyProgress?.easy?.familiar ?? 0 }} </strong>
              </p>
              <p>
                Learning: <strong>{{ progress.difficultyProgress?.easy?.learning ?? 0 }} </strong>
              </p>
              <p>
                New: <strong>{{ progress.difficultyProgress?.easy?.new ?? 0 }} </strong>
              </p>
            </div>
            <div class="difficulty-card">
              <h3>Medium</h3>
              <p>
                Mastered: <strong>{{ progress.difficultyProgress?.medium?.mastered ?? 0 }} </strong>
              </p>
              <p>
                Familiar: <strong>{{ progress.difficultyProgress?.medium?.familiar ?? 0 }} </strong>
              </p>
              <p>
                Learning: <strong>{{ progress.difficultyProgress?.medium?.learning ?? 0 }} </strong>
              </p>
              <p>
                New: <strong>{{ progress.difficultyProgress?.medium?.new ?? 0 }} </strong>
              </p>
            </div>
            <div class="difficulty-card">
              <h3>Hard</h3>
              <p>
                Mastered: <strong>{{ progress.difficultyProgress?.hard?.mastered ?? 0 }} </strong>
              </p>
              <p>
                Familiar: <strong>{{ progress.difficultyProgress?.hard?.familiar ?? 0 }} </strong>
              </p>
              <p>
                Learning: <strong>{{ progress.difficultyProgress?.hard?.learning ?? 0 }} </strong>
              </p>
              <p>
                New: <strong>{{ progress.difficultyProgress?.hard?.new ?? 0 }} </strong>
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Detailed Stats Tab -->
      <div v-if="activeTab === 'stats' && stats" class="tab-content">
        <section class="section">
          <h2>Study Statistics</h2>
          <div class="stats-table">
            <table>
              <tr>
                <td>Total Study Time</td>
                <td>
                  <strong
                    >{{ Math.round(stats.totalStudyTimeMinutes) }}

                    minutes</strong
                  >
                </td>
              </tr>
              <tr>
                <td>Total Study Sessions</td>
                <td>
                  <strong>{{ stats.totalStudySessions }} </strong>
                </td>
              </tr>
              <tr>
                <td>Average Session Duration</td>
                <td>
                  <strong
                    >{{ Math.round(stats.averageSessionDurationMinutes) }}

                    minutes</strong
                  >
                </td>
              </tr>
              <tr>
                <td>Questions Attempted</td>
                <td>
                  <strong>{{ stats.totalQuestionsAttempted }} </strong>
                </td>
              </tr>
              <tr>
                <td>Questions Correct</td>
                <td>
                  <strong>{{ stats.totalQuestionsCorrect }} </strong>
                </td>
              </tr>
              <tr>
                <td>Overall Accuracy</td>
                <td>
                  <strong>{{ stats.overallAccuracy }}%</strong>
                </td>
              </tr>
            </table>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="empty-state">
      No progress data available. Start studying to see your progress!
    </div>
  </div>
</template>

<style scoped>
.test-progress-dashboard {
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

.stat-value.mastered {
  color: #10b981;
}

.stat-value.familiar {
  color: #3b82f6;
}

.stat-value.learning {
  color: #f59e0b;
}

.stat-value.new {
  color: #6b7280;
}

.stat-value.streak {
  color: #ef4444;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.difficulty-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.difficulty-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1a202c;
}

.difficulty-card p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.stats-table table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table tr {
  border-bottom: 1px solid #e5e7eb;
}

.stats-table td {
  padding: 1rem;
}

.stats-table td:first-child {
  color: #6b7280;
}

.stats-table td:last-child {
  text-align: right;
}
</style>
