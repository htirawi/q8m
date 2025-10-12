<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Easy Quizzes
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Test your knowledge with beginner-friendly questions
        </p>
      </div>

      <!-- Quiz Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Available Quizzes -->
        <div class="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                JavaScript Basics
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                20 questions • 15 min
              </p>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Free
            </span>
          </div>
          <button
            type="button"
            class="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Start Quiz
          </button>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                HTML & CSS Fundamentals
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                15 questions • 10 min
              </p>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Free
            </span>
          </div>
          <button
            type="button"
            class="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Start Quiz
          </button>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Algorithms
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                25 questions • 20 min
              </p>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Free
            </span>
          </div>
          <button
            type="button"
            class="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Start Quiz
          </button>
        </div>

        <!-- Locked Advanced Quizzes -->
        <div class="relative rounded-lg bg-white p-6 shadow-sm opacity-75 dark:bg-gray-800">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Advanced JavaScript
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                30 questions • 25 min
              </p>
            </div>
            <LockedBadge required-plan="intermediate" />
          </div>
          <button
            type="button"
            class="mt-4 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            disabled
          >
            Upgrade to Access
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LockedBadge from "@/components/paywall/LockedBadge.vue";
</script>
