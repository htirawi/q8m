<script setup lang="ts">
import { useSoftPaywall } from "@/composables/useSoftPaywall";
import SoftPaywallModal from "@/components/paywall/SoftPaywallModal.vue";

const { isVisible, targetRoute, suggestedPlan, hide } = useSoftPaywall();
</script>

<template>
  <div id="app">
    <RouterView />

    <!-- Global Soft Paywall Modal -->
    <SoftPaywallModal
      :is-visible="isVisible"
      :target-route="targetRoute"
      :suggested-plan="suggestedPlan"
      @dismiss="hide"
    />
  </div>
</template>

<style>
/* Global styles are imported in main.ts */
</style>
