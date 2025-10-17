<script setup lang="ts">
// Account Page - User account management
import UserMenu from '@/components/layout/UserMenu.vue';
</script>

<template>
  <div class="account-page">
    <div class="flex items-center justify-between mb-6">
      <h1>Account</h1>
      <UserMenu />
    </div>
    <p>Account page coming soon...</p>
  </div>
</template>

<style scoped>
.account-page {
  @apply p-8;
}
</style>
