import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { httpClient, getErrorMessage } from '@/utils/httpClient';
import { storage } from '@/utils/storage';
import { AUTH_CONSTANTS, STORAGE_KEYS } from '@/config/constants';
import type { User } from '@shared/types/auth';
import type { AuthTokens, LoginFormData, RegisterFormData } from '@/types/domain/auth';

// Mock dependencies
vi.mock('@/utils/httpClient', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  getErrorMessage: vi.fn((err, defaultMsg) => {
    if (err instanceof Error) return err.message;
    return defaultMsg;
  }),
}));

vi.mock('@/utils/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/config/api', () => ({
  API_ENDPOINTS: {
    auth: {
      login: () => '/api/v1/auth/login',
      register: () => '/api/v1/auth/register',
      logout: () => '/api/v1/auth/logout',
      me: () => '/api/v1/auth/me',
      refresh: () => '/api/v1/auth/refresh',
      verifyEmail: () => '/api/v1/auth/verify-email',
      resendVerification: () => '/api/v1/auth/resend-verification',
      forgotPassword: () => '/api/v1/auth/forgot-password',
      resetPassword: () => '/api/v1/auth/reset-password',
    },
  },
}));

// Mock environment variables
vi.mock('import.meta.env', () => ({
  DEV: false,
  VITE_API_BASE_URL: 'http://localhost:3000',
}));

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    vi.clearAllMocks();
    
    // Mock getErrorMessage to return the error message
    vi.mocked(getErrorMessage).mockImplementation((err, defaultMsg) => {
      if (err instanceof Error) return err.message;
      return defaultMsg;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.isLoading).toBe(false);
      expect(authStore.error).toBeNull();
      expect(authStore.tokens).toBeNull();
      expect(authStore.isInitialized).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      isEmailVerified: true,
      permissions: ['READ', 'WRITE'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    beforeEach(() => {
      authStore.setUser(mockUser);
    });

    it('should check user entitlements correctly', () => {
      expect(authStore.hasEntitlement('READ')).toBe(true);
      expect(authStore.hasEntitlement('WRITE')).toBe(true);
      expect(authStore.hasEntitlement('ADMIN')).toBe(false);
    });

    it('should return false for entitlements when user is null', () => {
      authStore.setUser(null);
      expect(authStore.hasEntitlement('READ')).toBe(false);
    });

    it('should check email verification status', () => {
      expect(authStore.isEmailVerified).toBe(true);
      
      authStore.setUser({ ...mockUser, isEmailVerified: false });
      expect(authStore.isEmailVerified).toBe(false);
    });

    it('should return user role', () => {
      expect(authStore.userRole).toBe('user');
    });

    it('should check user roles correctly', () => {
      expect(authStore.hasRole('user')).toBe(true);
      expect(authStore.hasRole('admin')).toBe(false);
    });

    it('should return false for role check when user is null', () => {
      authStore.setUser(null);
      expect(authStore.hasRole('user')).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      isEmailVerified: true,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should set user and authentication status', () => {
      authStore.setUser(mockUser);
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should clear user and authentication status', () => {
      authStore.setUser(null);
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('should set loading status', () => {
      authStore.setLoading(true);
      expect(authStore.isLoading).toBe(true);
      
      authStore.setLoading(false);
      expect(authStore.isLoading).toBe(false);
    });

    it('should set error message', () => {
      authStore.setError('Test error');
      expect(authStore.error).toBe('Test error');
      
      authStore.setError(null);
      expect(authStore.error).toBeNull();
    });

    it('should set tokens and handle storage', () => {
      const tokens: AuthTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };

      authStore.setTokens(tokens);
      expect(authStore.tokens).toEqual(tokens);
    });

    it('should clear tokens and storage when setting null', () => {
      authStore.setTokens(null);
      expect(authStore.tokens).toBeNull();
      expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
      expect(storage.remove).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
    });
  });

  describe('Login', () => {
    const mockCredentials: LoginFormData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      isEmailVerified: true,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should login successfully', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({ user: mockUser });

      const result = await authStore.login(mockCredentials);

      expect(result).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.tokens).toEqual({
        accessToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        refreshToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY_SECONDS,
      });
      expect(authStore.error).toBeNull();
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error(errorMessage));

      const result = await authStore.login(mockCredentials);

      expect(result).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.error).toBe(errorMessage);
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle dev login for whitelisted emails', async () => {
      // Mock dev environment
      vi.mocked(import.meta.env).DEV = true;
      
      const devCredentials: LoginFormData = {
        email: AUTH_CONSTANTS.DEV_WHITELIST[0],
        password: 'password123',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ user: mockUser });

      const result = await authStore.login(devCredentials);

      expect(result).toBe(true);
      expect(httpClient.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/dev-login',
        { email: devCredentials.email }
      );
    });
  });

  describe('Register', () => {
    const mockUserData: RegisterFormData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register successfully', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({});

      const result = await authStore.register(mockUserData);

      expect(result).toBe(true);
      expect(authStore.user).toBeNull(); // User not set until email verification
      expect(authStore.error).toBeNull();
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle registration failure', async () => {
      const errorMessage = 'Email already exists';
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error(errorMessage));

      const result = await authStore.register(mockUserData);

      expect(result).toBe(false);
      expect(authStore.error).toBe(errorMessage);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Set up authenticated state
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        isEmailVerified: true,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      authStore.setUser(mockUser);
      authStore.setTokens({ accessToken: 'token', refreshToken: 'refresh', expiresIn: 3600 });

      vi.mocked(httpClient.post).mockResolvedValueOnce({});

      const result = await authStore.logout();

      expect(result).toBe(true);
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.tokens).toBeNull();
      expect(authStore.error).toBeNull();
      expect(authStore.isLoading).toBe(false);
    });

    it('should clear local state even if API call fails', async () => {
      // Set up authenticated state
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        isEmailVerified: true,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      authStore.setUser(mockUser);
      authStore.setTokens({ accessToken: 'token', refreshToken: 'refresh', expiresIn: 3600 });

      const errorMessage = 'Network error';
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error(errorMessage));

      const result = await authStore.logout();

      expect(result).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.tokens).toBeNull();
      expect(authStore.error).toBe(errorMessage);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      isEmailVerified: true,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should get current user successfully when tokens exist', async () => {
      // Set up tokens first
      authStore.setTokens({ accessToken: 'cookie-based', refreshToken: 'cookie-based', expiresIn: 900 });
      
      vi.mocked(httpClient.get).mockResolvedValueOnce({ user: mockUser });

      const result = await authStore.getCurrentUser();

      expect(result).toBe(true);
      expect(authStore.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.error).toBeNull();
    });

    it('should return false when no tokens exist', async () => {
      // Ensure no tokens
      authStore.setTokens(null);

      const result = await authStore.getCurrentUser();

      expect(result).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      const email = 'test@example.com';
      vi.mocked(httpClient.post).mockResolvedValueOnce({});

      const result = await authStore.resendVerificationEmail(email);

      expect(result).toBe(true);
      expect(authStore.error).toBeNull();
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle resend verification failure', async () => {
      const email = 'test@example.com';
      const errorMessage = 'Email not found';
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error(errorMessage));

      const result = await authStore.resendVerificationEmail(email);

      expect(result).toBe(false);
      expect(authStore.error).toBe(errorMessage);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      const email = 'test@example.com';
      vi.mocked(httpClient.post).mockResolvedValueOnce({});

      const result = await authStore.forgotPassword(email);

      expect(result).toBe(true);
      expect(authStore.error).toBeNull();
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle forgot password failure', async () => {
      const email = 'test@example.com';
      const errorMessage = 'Email not found';
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error(errorMessage));

      const result = await authStore.forgotPassword(email);

      expect(result).toBe(false);
      expect(authStore.error).toBe(errorMessage);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const data = {
        token: 'reset-token',
        password: 'newpassword123',
      };
      vi.mocked(httpClient.post).mockResolvedValueOnce({});

      const result = await authStore.resetPassword(data);

      expect(result).toBe(true);
      expect(authStore.error).toBeNull();
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle password reset failure', async () => {
      const data = {
        token: 'invalid-token',
        password: 'newpassword123',
      };
      const errorMessage = 'Invalid token';
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error(errorMessage));

      const result = await authStore.resetPassword(data);

      expect(result).toBe(false);
      expect(authStore.error).toBe(errorMessage);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('initializeAuth', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      isEmailVerified: true,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should initialize with user data from server', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ user: mockUser });

      await authStore.initializeAuth();

      expect(authStore.user).toEqual(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.isInitialized).toBe(true);
      // Should set cookie-based tokens
      expect(authStore.tokens).toEqual({
        accessToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        refreshToken: AUTH_CONSTANTS.COOKIE_BASED_TOKEN,
        expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY_SECONDS,
      });
    });

    it('should initialize without stored tokens', async () => {
      vi.mocked(storage.get).mockReturnValue(null);

      await authStore.initializeAuth();

      expect(authStore.tokens).toBeNull();
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.isInitialized).toBe(true);
    });

    it('should handle initialization error gracefully', async () => {
      vi.mocked(storage.get).mockReturnValue('stored-token');
      vi.mocked(httpClient.get).mockRejectedValueOnce(new Error('Network error'));

      await authStore.initializeAuth();

      expect(authStore.isInitialized).toBe(true);
      expect(authStore.user).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });
});
