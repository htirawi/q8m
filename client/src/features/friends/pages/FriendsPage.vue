<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Friends</h1>
      <p class="mt-2 text-gray-600">Connect with other learners and compete together</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
          ]"
          type="button"
        >
          {{ tab.label }}

          <span
            v-if="tab.count > 0"
            :class="[
              'ml-2 rounded-full px-2 py-0.5 text-xs',
              activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600',
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div class="mt-6">
      <!-- Friends List Tab -->
      <div v-if="activeTab === 'friends'">
        <FriendList />
      </div>

      <!-- Requests Tab -->
      <div v-else-if="activeTab === 'requests'">
        <FriendRequests />
      </div>

      <!-- Find Friends Tab -->
      <div v-else-if="activeTab === 'find'">
        <div class="space-y-6">
          <!-- Search -->
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Search Users</h2>
            <UserSearch />
          </div>

          <!-- Suggestions -->
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Suggested Friends</h2>
            <FriendSuggestions />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { useFriendsStore } from "@/stores/friends";

import FriendList from "../components/FriendList.vue";
import FriendRequests from "../components/FriendRequests.vue";
import FriendSuggestions from "../components/FriendSuggestions.vue";
import UserSearch from "../components/UserSearch.vue";

const friendsStore = useFriendsStore();
const activeTab = ref<"friends" | "requests" | "find">("friends");

const tabs = computed(() => [
  {
    id: "friends" as const,
    label: "My Friends",
    count: friendsStore.friends.length,
  },
  {
    id: "requests" as const,
    label: "Requests",
    count: friendsStore.receivedRequests.length,
  },
  {
    id: "find" as const,
    label: "Find Friends",
    count: 0,
  },
]);

onMounted(async () => {
  await Promise.all([
    friendsStore.getFriends(),
    friendsStore.getReceivedRequests(),
    friendsStore.getSuggestions(),
  ]);
});
</script>
