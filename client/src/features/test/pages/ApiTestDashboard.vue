<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="test-index">
    <header class="header">
      <h1>API Test Dashboard</h1>
      <p class="subtitle">Test all backend gamification & progress tracking APIs</p>
    </header>

    <div class="test-cards">
      <div class="test-card" @click="navigateTo('/en/test/progress')">
        <div class="card-icon">📊</div>
        <h2>Progress Dashboard</h2>
        <p>View user progress, mastery stats, streaks, and study time</p>
        <ul class="feature-list">
          <li>XP & Level tracking</li>
          <li>Mastery breakdown (new/learning/familiar/mastered)</li>
          <li>Study streaks</li>
          <li>Difficulty progress</li>
        </ul>
        <div class="api-endpoints">
          <span class="endpoint">GET /api/progress</span>
          <span class="endpoint">GET /api/progress/stats</span>
        </div>
      </div>

      <div class="test-card" @click="navigateTo('/en/test/gamification')">
        <div class="card-icon">🏆</div>
        <h2>Gamification</h2>
        <p>Badges, leaderboards, XP, and achievements system</p>
        <ul class="feature-list">
          <li>IBadge collection with progress</li>
          <li>Leaderboards (weekly/monthly/all-time)</li>
          <li>XP & level information</li>
          <li>Streak tracking</li>
        </ul>
        <div class="api-endpoints">
          <span class="endpoint">GET /api/gamification/badges</span>
          <span class="endpoint">GET /api/gamification/leaderboard/:type</span>
          <span class="endpoint">GET /api/gamification/summary</span>
        </div>
      </div>

      <div class="test-card" @click="navigateTo('/en/test/quiz-results')">
        <div class="card-icon">📝</div>
        <h2>Quiz Results</h2>
        <p>Quiz history, analytics, and weak area detection</p>
        <ul class="feature-list">
          <li>Quiz history with filtering</li>
          <li>Detailed statistics</li>
          <li>Weak area detection</li>
          <li>Performance trends</li>
        </ul>
        <div class="api-endpoints">
          <span class="endpoint">GET /api/quiz/results/history</span>
          <span class="endpoint">GET /api/quiz/results/stats</span>
          <span class="endpoint">GET /api/quiz/results/weak-areas</span>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>How to Test</h3>
      <ol>
        <li><strong>Make sure you're logged in</strong> - These APIs require authentication</li>
        <li><strong>Start the server</strong> - <code>cd server && pnpm dev</code></li>
        <li><strong>Click any card above</strong> to test that API area</li>
        <li><strong>Use the refresh button</strong> on each page to reload data</li>
      </ol>

      <h3>API Features Implemented</h3>
      <div class="features-grid">
        <div class="feature-group">
          <h4>Progress Tracking (5 endpoints)</h4>
          <ul>
            <li>Get user progress</li>
            <li>Update question progress</li>
            <li>Get next adaptive questions</li>
            <li>Complete study session</li>
            <li>Get detailed statistics</li>
          </ul>
        </div>

        <div class="feature-group">
          <h4>Gamification (7 endpoints)</h4>
          <ul>
            <li>Get all badges with progress</li>
            <li>Get earned badges</li>
            <li>Get secret badges</li>
            <li>Get leaderboards (3 types)</li>
            <li>Get user rank</li>
            <li>Get XP info</li>
            <li>Get streak info</li>
          </ul>
        </div>

        <div class="feature-group">
          <h4>Quiz Results (6 endpoints)</h4>
          <ul>
            <li>Submit quiz results</li>
            <li>Get quiz history</li>
            <li>Get quiz statistics</li>
            <li>Get weak areas</li>
            <li>Get wrong questions</li>
            <li>Get specific quiz result</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="tech-stack">
      <h3>Backend Stack</h3>
      <div class="tech-tags">
        <span class="tech-tag">Fastify</span>
        <span class="tech-tag">MongoDB</span>
        <span class="tech-tag">Mongoose</span>
        <span class="tech-tag">TypeScript</span>
        <span class="tech-tag">Zod Validation</span>
        <span class="tech-tag">JWT Auth</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-index {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

.test-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.test-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.test-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 10px 30px rgb(59, 130, 246, 0.1);
  transform: translateY(-4px);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.test-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.test-card p {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.feature-list li::before {
  content: "✓ ";
  color: #10b981;
  font-weight: 700;
  margin-right: 0.5rem;
}

.api-endpoints {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.endpoint {
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  color: #3b82f6;
}

.info-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.info-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.info-section ol {
  margin-left: 1.5rem;
  color: #4b5563;
  line-height: 1.8;
}

.info-section ol li {
  margin-bottom: 0.5rem;
}

.info-section code {
  font-family: monospace;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature-group {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.feature-group h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.feature-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-group li {
  padding: 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
}

.feature-group li:last-child {
  border-bottom: none;
}

.tech-stack {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
}

.tech-stack h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.tech-tag {
  background: rgb(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
