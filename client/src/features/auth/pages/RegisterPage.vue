<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {{ $t("auth.register.title") }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ $t("auth.register.subtitle") }}
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card px-4 py-8 sm:px-10">
        <RegisterForm
          @oauth-login="handleOAuthLogin"
          @registration-success="handleRegistrationSuccess"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RegisterForm from "@/components/auth/RegisterForm.vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

function handleOAuthLogin(provider: "google" | "facebook") {
  // TODO: Implement OAuth login
  console.log(`OAuth login with ${provider}`);
}

function handleRegistrationSuccess(email: string) {
  // Redirect to verification page or show success message
  router.push({
    name: "auth-verify",
    query: { email }
  });
}
</script>

<style scoped>
/* Additional page-specific styles if needed */
</style>
