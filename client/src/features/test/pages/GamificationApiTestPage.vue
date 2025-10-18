<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useGamification } from "@/composables/useGamification";

const {
  isLoading,
  error,
  badges,
  earnedBadges,
  leaderboard,
  userRank,
  summary,
  streak,
  getBadges,
  getEarnedBadges,
  getLeaderboard,
  getUserRank,
  getXP,
  getSummary,
  getStreak,
} = useGamification();

const activeTab = ref<"summary" | "badges" | "leaderboard" | "streak">("summary");
const leaderboardType = ref<"weekly" | "monthly" | "all_time">("all_time");

onMounted(async () => {
  await loadData();
});

async function loadData() {
  await getSummary();
  await getXP();
  await getStreak();
  await getBadges();
  await getEarnedBadges();
  await getLeaderboard(leaderboardType.value);
  await getUserRank(leaderboardType.value);
}

async function refreshData() {
  await loadData();
}

async function changeleaderboardtype(type: "weekly" | "monthly" | "all_time") {
  leaderboardType.value = type;
  await getLeaderboard(type);
  await getUserRank(type);
}

function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case "rare":
      return "#3b82f6";
    case "common":
    default:
      return "#6b7280";
  }
}
</script>

<template>
  <div class="test-gamification">
    <header class="dashboard-header">
      <h1>Gamification Dashboard (Test)</h1>
      <button @click="refreshData" :disabled="isLoading" class="refresh-btn">
        {{ isLoading ? "Loading..." : "Refresh Data" }}
      </button>
    </header>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <div v-if="isLoading && !summary" class="loading-state">Loading gamification data...</div>

    <div v-else class="dashboard-content">
      <!-- Tabs -->
      <div class="tabs">
        <button
          @click="activeTab = 'summary'"
          :class="{ active: activeTab === 'summary' }"
          class="tab-btn"
        >
          Summary
        </button>
        <button
          @click="activeTab = 'badges'"
          :class="{ active: activeTab === 'badges' }"
          class="tab-btn"
        >
          Badges
        </button>
        <button
          @click="activeTab = 'leaderboard'"
          :class="{ active: activeTab === 'leaderboard' }"
          class="tab-btn"
        >
          Leaderboard
        </button>
        <button
          @click="activeTab = 'streak'"
          :class="{ active: activeTab === 'streak' }"
          class="tab-btn"
        >
          Streaks
        </button>
      </div>

      <!-- Summary Tab -->
      <div v-if="activeTab === 'summary' && summary" class="tab-content">
        <section class="section">
          <h2>Gamification Summary</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">XP</div>
              <div class="stat-value">{{ summary.xp }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Level</div>
              <div class="stat-value">{{ summary.level }}</div>
              <div class="stat-sublabel">{{ summary.levelTitle }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">XP to Next Level</div>
              <div class="stat-value">{{ summary.xpToNextLevel }}</div>
              <div class="stat-sublabel">{{ Math.round(summary.xpProgress) }}% Complete</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Badges</div>
              <div class="stat-value">{{ summary.totalBadges }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Rare+ Badges</div>
              <div class="stat-value legendary">{{ summary.rareBadges }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Current Streak</div>
              <div class="stat-value streak">
                {{ summary.currentStreak }}

                days
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Longest Streak</div>
              <div class="stat-value">
                {{ summary.longestStreak }}

                days
              </div>
            </div>
          </div>

          <div v-if="summary.leaderboardRank" class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Leaderboard Rank</div>
              <div class="stat-value rank">#{{ summary.leaderboardRank }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Percentile</div>
              <div class="stat-value">Top {{ summary.leaderboardPercentile }}%</div>
            </div>
          </div>
        </section>
      </div>

      <!-- Badges Tab -->
      <div v-if="activeTab === 'badges'" class="tab-content">
        <section class="section">
          <h2>All Badges ({{ badges.length }})</h2>
          <p class="section-subtitle">Earned: {{ earnedBadges.length }} / {{ badges.length }}</p>

          <div class="badges-grid">
            <div
              v-for="badge in badges"
              :key="badge.id"
              class="badge-card"
              :class="{ earned: badge.earned }"
            >
              <div class="badge-icon" :style="{ borderColor: getRarityColor(badge.rarity) }">
                <span v-if="badge.earned">🏆</span>
                <span v-else>🔒</span>
              </div>
              <div class="badge-info">
                <h3>{{ badge.name }}</h3>
                <p class="badge-description">{{ badge.description }}</p>
                <div class="badge-meta">
                  <span class="badge-rarity" :style="{ color: getRarityColor(badge.rarity) }">
                    {{ badge.rarity }}
                  </span>
                  <span class="badge-xp">{{ badge.xpReward }} XP</span>
                </div>
                <div v-if="!badge.earned" class="badge-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${badge.progress}%` }"></div>
                  </div>
                  <span class="progress-text">{{ Math.round(badge.progress) }}%</span>
                </div>
                <div v-else class="badge-earned-date">
                  Earned: {{ new Date(badge.earnedAt!).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Leaderboard Tab -->
      <div v-if="activeTab === 'leaderboard'" class="tab-content">
        <section class="section">
          <div class="section-header">
            <h2>Leaderboard</h2>
            <div class="leaderboard-type-selector">
              <button
                @click="changeLeaderboardType('weekly')"
                :class="{ active: leaderboardType === 'weekly' }"
                class="type-btn"
              >
                Weekly
              </button>
              <button
                @click="changeLeaderboardType('monthly')"
                :class="{ active: leaderboardType === 'monthly' }"
                class="type-btn"
              >
                Monthly
              </button>
              <button
                @click="changeLeaderboardType('all_time')"
                :class="{ active: leaderboardType === 'all_time' }"
                class="type-btn"
              >
                All Time
              </button>
            </div>
          </div>

          <div v-if="userRank" class="user-rank-banner">
            <strong>Your Rank:</strong> #{{ userRank.rank }} out of {{ userRank.totalEntries }} (Top
            {{ userRank.percentile }}%)
            <br />
            <strong>Your Score:</strong> {{ userRank.score }}

            XP
          </div>

          <div v-if="leaderboard" class="leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Level</th>
                  <th>Score</th>
                  <th>Streak</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in leaderboard.entries" :key="entry.userId">
                  <td>
                    <strong>#{{ entry.rank }} </strong>
                  </td>
                  <td>{{ entry.displayName }}</td>
                  <td>{{ entry.level }}</td>
                  <td>
                    {{ entry.score }}

                    XP
                  </td>
                  <td>
                    {{ entry.streak }}

                    days
                  </td>
                  <td>{{ entry.badges.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Streak Tab -->
      <div v-if="activeTab === 'streak' && streak" class="tab-content">
        <section class="section">
          <h2>Study Streaks</h2>
          <div class="streak-display">
            <div class="streak-main">
              <div class="streak-icon">🔥</div>
              <div class="streak-number">{{ streak.currentStreak }}</div>
              <div class="streak-label">Day Streak</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Current Streak</div>
              <div class="stat-value streak">
                {{ streak.currentStreak }}

                days
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Longest Streak</div>
              <div class="stat-value">
                {{ streak.longestStreak }}

                days
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Missed Days</div>
              <div class="stat-value">{{ streak.missedDays || 0 }}</div>
            </div>
          </div>

          <div class="streak-dates">
            <p v-if="streak.lastActivityDate">
              <strong>Last Activity:</strong>
              {{ new Date(streak.lastActivityDate).toLocaleDateString() }}
            </p>
            <p v-if="streak.streakStartDate">
              <strong>Streak Started:</strong>
              {{ new Date(streak.streakStartDate).toLocaleDateString() }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reuse most styles from TestProgressDashboard */
.test-gamification {
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

.loading-state {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.stat-sublabel {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.stat-value.legendary {
  color: #fbbf24;
}

.stat-value.streak {
  color: #ef4444;
}

.stat-value.rank {
  color: #3b82f6;
}

/* Badges specific styles */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.badge-card {
  display: flex;
  gap: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  opacity: 0.6;
  transition: all 0.2s;
}

.badge-card.earned {
  opacity: 1;
  background: white;
}

.badge-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.badge-info {
  flex: 1;
}

.badge-info h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.badge-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.badge-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.badge-rarity {
  text-transform: capitalize;
  font-weight: 600;
}

.badge-xp {
  color: #6b7280;
}

.badge-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.badge-earned-date {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

/* Leaderboard specific styles */
.leaderboard-type-selector {
  display: flex;
  gap: 0.5rem;
}

.type-btn {
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.user-rank-banner {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.leaderboard-table {
  overflow-x: auto;
}

.leaderboard-table table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table thead {
  background: #f9fafb;
}

.leaderboard-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  color: #1a202c;
  border-bottom: 2px solid #e5e7eb;
}

.leaderboard-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.leaderboard-table tbody tr:hover {
  background: #f9fafb;
}

/* Streak specific styles */
.streak-display {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.streak-main {
  text-align: center;
  padding: 2rem;
}

.streak-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.streak-number {
  font-size: 4rem;
  font-weight: 700;
  color: #ef4444;
  line-height: 1;
}

.streak-label {
  font-size: 1.5rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.streak-dates {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.streak-dates p {
  margin: 0.5rem 0;
  color: #6b7280;
}
</style>
