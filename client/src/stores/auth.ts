/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@shared/types/auth";
import type { AuthTokens, LoginFormData, RegisterFormData } from "@/types/domain/auth";

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
      return user.value?.permissions.includes(entitlement) || false;
    };
  });

  const isEmailVerified = computed(() => {
    return user.value?.isEmailVerified || false;
  });

  const userRole = computed(() => {
    return user.value?.role || "user";
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in request
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);

      // Tokens are now handled by httpOnly cookies
      // We still need to set a dummy token object for compatibility
      setTokens({
        accessToken: "cookie-based", // Placeholder since token is in cookie
        refreshToken: "cookie-based", // Placeholder since token is in cookie
        expiresIn: 15 * 60, // 15 minutes
      });

      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Don't set user/tokens for registration - email verification required
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
    } catch (err: any) {
      // Still clear local state even if API call fails
      setUser(null);
      setTokens(null);
      setError(err.message || "Logout failed");
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
    } catch (err: any) {
      setUser(null);
      setTokens(null);
      setError(err.message || "Logout failed");
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
        throw new Error(data.message || "Token refresh failed");
      }

      // Tokens are now handled by httpOnly cookies
      // We still need to set a dummy token object for compatibility
      setTokens({
        accessToken: "cookie-based", // Placeholder since token is in cookie
        refreshToken: "cookie-based", // Placeholder since token is in cookie
        expiresIn: 15 * 60, // 15 minutes
      });

      return true;
    } catch (err: any) {
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
    } catch (err: any) {
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
        throw new Error(data.message || "Email verification failed");
      }

      // Update user if logged in
      if (user.value) {
        user.value.isEmailVerified = true;
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Email verification failed");
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
        throw new Error(data.message || "Failed to resend verification email");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email");
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
        throw new Error(data.message || "Failed to send password reset email");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email");
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
        throw new Error(data.message || "Password reset failed");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Password reset failed");
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
        throw new Error(data.message || "Password change failed");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Password change failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Initialize auth state from localStorage
  function initializeAuth() {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken, expiresIn: 0 });
      // Try to get current user
      getCurrentUser();
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
    initializeAuth,

    // Helpers
    setUser,
    setLoading,
    setError,
    setTokens,
  };
});
