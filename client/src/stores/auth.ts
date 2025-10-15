import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@shared/types/auth";
import type { AuthTokens, LoginFormData, RegisterFormData } from "@/types/domain/auth";
import { httpClient, getErrorMessage } from "@/utils/httpClient";
import { API_ENDPOINTS } from "@/config/api";
import { AUTH_CONSTANTS, STORAGE_KEYS } from "@/config/constants";
import { storage } from "@/utils/storage";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const tokens = ref<AuthTokens | null>(null);
  const isInitialized = ref(false);

  // Computed properties
  const hasEntitlement = computed(() => {
    return (entitlement: string) => {
      return user.value?.permissions?.includes(entitlement) ?? false;
    };
  });

  const isEmailVerified = computed(() => {
    return user.value?.isEmailVerified ?? false;
  });

  const userRole = computed(() => {
    return user.value?.role ?? "user";
  });

  // Role checking helper
  const hasRole = computed(() => {
    return (role: string) => {
      return user.value?.role === role || false;
    };
  });

  // Helper functions
  function setUser(newUser: User | null) {
    user.value = newUser;
    isAuthenticated.value = !!newUser;
  }

  function setLoading(status: boolean) {
    isLoading.value = status;
  }

  function setError(message: string | null) {
    error.value = message;
  }

  function setTokens(newTokens: AuthTokens | null) {
    tokens.value = newTokens;
    if (newTokens) {
      // Tokens are now handled by httpOnly cookies
      // No need to store in storage
    } else {
      // Clear any existing tokens
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  // API calls
  async function login(credentials: LoginFormData): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      // Use dev-login endpoint for whitelisted dev emails in development
      const isDev = import.meta.env.DEV;
      const isDevEmail = AUTH_CONSTANTS.DEV_WHITELIST.includes(credentials.email.toLowerCase());

      // Note: dev-login not in API_ENDPOINTS, using manual construction for dev
      const endpoint = isDev && isDevEmail
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/auth/dev-login`
        : API_ENDPOINTS.auth.login();

      const body = isDev && isDevEmail
        ? { email: credentials.email }
        : credentials;

      if (isDev && isDevEmail) {
        console.warn(`[DEV] Using dev-login endpoint for: ${credentials.email}`);
      }

      const data = await httpClient.post<{ user: User }>(endpoint, body);

      setUser(data.user);

      // Tokens are now handled by httpOnly cookies
      // We still need to set a dummy token object for compatibility
      setTokens({
        accessToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        refreshToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY_SECONDS,
      });

      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Login failed");
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(userData: RegisterFormData): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await httpClient.post(API_ENDPOINTS.auth.register(), userData);

      // Don't set user/tokens for registration - email verification required
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Registration failed");
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout(): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await httpClient.post(API_ENDPOINTS.auth.logout());

      // Clear local state regardless of API response
      setUser(null);
      setTokens(null);

      return true;
    } catch (err) {
      // Still clear local state even if API call fails
      setUser(null);
      setTokens(null);
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logoutFromAllDevices(): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await httpClient.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/auth/logout-all`,
        {},
        { requireAuth: true, useBearer: true }
      );

      setUser(null);
      setTokens(null);

      return true;
    } catch (err) {
      setUser(null);
      setTokens(null);
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      await httpClient.post(API_ENDPOINTS.auth.refresh());

      // Tokens are now handled by httpOnly cookies
      // We still need to set a dummy token object for compatibility
      setTokens({
        accessToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        refreshToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY_SECONDS,
      });

      return true;
    } catch (_err) {
      // Refresh failed, clear auth state
      setUser(null);
      setTokens(null);
      return false;
    }
  }

  async function getCurrentUser(): Promise<boolean> {
    if (!tokens.value?.accessToken) {
      return false;
    }

    try {
      // If using cookie-based auth (OAuth), use cookies instead of Bearer token
      const useCookies = tokens.value.accessToken === AUTH_CONSTANTS.COOKIE_BASED_TOKEN;
      const useBearer = !useCookies;

      try {
        const data = await httpClient.get<{ user: User }>(
          API_ENDPOINTS.auth.me(),
          {
            useBearer,
            requireAuth: useBearer,
          }
        );

        setUser(data.user);
        return true;
      } catch (err) {
        // If 401, try to refresh token once
        if (err instanceof Error && err.message.includes('401')) {
          const refreshed = await refreshToken();
          if (refreshed) {
            return getCurrentUser(); // Retry with new token
          }
        }
        throw err;
      }
    } catch (_err) {
      setUser(null);
      setTokens(null);
      return false;
    }
  }

  // Email verification is now handled via secure session cookies
  // The verification flow is:
  // 1. User clicks link in email -> hits backend /api/auth/verify-email/:token
  // 2. Backend sets secure httpOnly cookie and redirects to frontend /verify-email
  // 3. Frontend /verify-email calls /api/auth/verify-email-complete with cookie
  // This ensures no tokens are exposed in URLs or browser history

  async function resendVerificationEmail(email: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await httpClient.post(API_ENDPOINTS.auth.resendVerification(), { email });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend verification email";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword(email: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await httpClient.post(API_ENDPOINTS.auth.forgotPassword(), { email });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send password reset email";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Password reset is now handled via secure session cookies
  // The reset flow is:
  // 1. User clicks link in email -> hits backend /api/auth/reset-password-init/:token
  // 2. Backend sets secure httpOnly cookie and redirects to frontend /reset-password
  // 3. Frontend /reset-password calls /api/auth/reset-password-complete with cookie
  // This ensures no tokens are exposed in URLs or browser history
  async function resetPassword(password: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await httpClient.post(API_ENDPOINTS.auth.resetPassword(), { password });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Password reset failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await httpClient.post(
        API_ENDPOINTS.auth.changePassword(),
        { currentPassword, newPassword },
        { requireAuth: true, useBearer: true }
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Password change failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function checkEmailExists(email: string): Promise<boolean> {
    try {
      const data = await httpClient.post<{ exists: boolean }>(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/auth/check-email`,
        { email }
      );

      return data.exists ?? false;
    } catch (err) {
      console.warn("checkEmailExists: API not available", getErrorMessage(err));
      return false;
    }
  }

  // Initialize auth state from server (httpOnly cookies)
  async function initializeAuth() {
    // Skip if already initialized
    if (isInitialized.value) {
      return;
    }

    try {
      // Try to get current user from server (will use httpOnly cookies)
      // Use silent mode to avoid console errors when not logged in
      const data = await httpClient.get<{ user: User }>(
        API_ENDPOINTS.auth.me(),
        { silent: true }
      );

      // If we got a response (user is logged in)
      if (data?.user) {
        setUser(data.user);

        // Set dummy tokens to indicate authenticated state
        setTokens({
          accessToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
          refreshToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
          expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY_SECONDS,
        });
      } else {
        // No user data - stay logged out
        setUser(null);
        setTokens(null);
      }
    } catch (_err) {
      // Failed to get user - stay logged out
      setUser(null);
      setTokens(null);
    } finally {
      isInitialized.value = true;
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    tokens,
    isInitialized,

    // Computed
    hasEntitlement,
    isEmailVerified,
    userRole,
    hasRole,

    // Actions
    login,
    register,
    logout,
    logoutFromAllDevices,
    refreshToken,
    getCurrentUser,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    checkEmailExists,
    initializeAuth,

    // Helpers
    setUser,
    setLoading,
    setError,
    setTokens,
  };
});
