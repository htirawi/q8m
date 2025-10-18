<template>
  <OnboardingWizard />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../../stores/auth";
import { useOnboarding } from "../../../composables/useOnboarding";
import OnboardingWizard from "../components/OnboardingWizard.vue";

const router = useRouter();
const authStore = useAuthStore();
const { startOnboarding } = useOnboarding();

onMounted(() => {
  // Redirect if not authenticated
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  // Redirect if already completed onboarding
  if (authStore.user?.onboarding?.isCompleted) {
    router.push("/");
    return;
  }

  // Start the onboarding process
  startOnboarding();
});
</script>
