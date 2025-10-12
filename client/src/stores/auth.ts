import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@shared/types/auth";
import type { AuthTokens, LoginFormData, RegisterFormData } from "@/types/domain/auth";
import { handleApiResponse, getErrorMessage } from "@/utils/apiHelpers";

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
      // No need to store in localStorage
    } else {
      // Clear any existing tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  // API calls
  async function login(credentials: LoginFormData): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      // Mock login for whitelisted dev emails
      const DEV_WHITELIST = ["dev@example.com"];
      const isDev = import.meta.env.DEV;

      if (isDev && DEV_WHITELIST.includes(credentials.email.toLowerCase())) {
        // Mock successful login with test user
        console.warn(`[DEV] Mock login for whitelisted email: ${credentials.email}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser: User = {
          id: "dev-user-123",
          email: credentials.email,
          name: "Dev User",
          role: "admin",
          isEmailVerified: true,
          permissions: ["read", "write", "admin"],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setUser(mockUser);
        setTokens({
          accessToken: "dev-mock-token",
          refreshToken: "dev-mock-refresh-token",
          expiresIn: 15 * 60,
        });

        return true;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify(credentials),
      });

      // Use safe JSON parsing to handle 500 errors
      const data = await handleApiResponse<{ user: User }>(response);

      setUser(data.user);

      // Tokens are now handled by httpOnly cookies
      // We still need to set a dummy token object for compatibility
      setTokens({
        accessToken: "cookie-based", // Placeholder since token is in cookie
        refreshToken: "cookie-based", // Placeholder since token is in cookie
        expiresIn: 15 * 60, // 15 minutes
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      // Use safe JSON parsing to handle 500 errors
      await handleApiResponse(response);

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
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies in request
        headers: {
          "Content-Type": "application/json",
        },
      });

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
      await fetch("/api/auth/logout-all", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.value?.accessToken}`,
        },
      });

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
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include cookies in request
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Token refresh failed");
      }

      // Tokens are now handled by httpOnly cookies
      // We still need to set a dummy token object for compatibility
      setTokens({
        accessToken: "cookie-based", // Placeholder since token is in cookie
        refreshToken: "cookie-based", // Placeholder since token is in cookie
        expiresIn: 15 * 60, // 15 minutes
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
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${tokens.value.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await refreshToken();
          if (refreshed) {
            return getCurrentUser(); // Retry with new token
          }
        }
        throw new Error("Failed to get user info");
      }

      const data = await response.json();
      setUser(data.user);
      return true;
    } catch (_err) {
      setUser(null);
      setTokens(null);
      return false;
    }
  }

  async function verifyEmail(token: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Email verification failed");
      }

      // Update user if logged in
      if (user.value) {
        user.value.isEmailVerified = true;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Email verification failed";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function resendVerificationEmail(email: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to resend verification email");
      }

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
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to send password reset email");
      }

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

  async function resetPassword(token: string, password: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Password reset failed");
      }

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
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.value?.accessToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Password change failed");
      }

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
    // Whitelist for development testing
    const DEV_WHITELIST = ["dev@example.com"];
    const isDev = import.meta.env.DEV;

    if (isDev && DEV_WHITELIST.includes(email.toLowerCase())) {
      console.warn(`[DEV] Whitelisted email detected: ${email} - treating as existing account`);
      return true;
    }

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // Use safe JSON parsing
      const data = await handleApiResponse<{ exists: boolean }>(response);

      return data.exists ?? false;
    } catch (err) {
      // Fallback mock behavior for development
      // In production, this should always hit the real API
      console.warn("checkEmailExists: API not available, using mock behavior", getErrorMessage(err));
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
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Include httpOnly cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Set dummy tokens to indicate authenticated state
        setTokens({
          accessToken: "cookie-based",
          refreshToken: "cookie-based",
          expiresIn: 15 * 60,
        });
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
    verifyEmail,
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
