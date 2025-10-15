/**
 * API Configuration
 * Central configuration for API endpoints and versioning
 */

export const API_VERSION = 'v1';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://api.quiz-platform.com');

export const API_BASE_PATH = `/api/${API_VERSION}`;

/**
 * Generate a full API URL for a given path
 * @param path - API path (without /api/v1 prefix)
 * @returns Full API URL
 *
 * @example
 * apiUrl('auth/login') // => 'http://localhost:3000/api/v1/auth/login'
 * apiUrl('/questions') // => 'http://localhost:3000/api/v1/questions'
 */
export function apiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}${API_BASE_PATH}/${cleanPath}`;
}

/**
 * API endpoints organized by feature
 */
export const API_ENDPOINTS = {
  auth: {
    register: () => apiUrl('auth/register'),
    login: () => apiUrl('auth/login'),
    logout: () => apiUrl('auth/logout'),
    me: () => apiUrl('auth/me'),
    refresh: () => apiUrl('auth/refresh'),
    verifyEmail: () => apiUrl('auth/verify-email-complete'),
    resendVerification: () => apiUrl('auth/resend-verification'),
    forgotPassword: () => apiUrl('auth/forgot-password'),
    resetPassword: () => apiUrl('auth/reset-password-complete'),
    changePassword: () => apiUrl('auth/change-password'),
    google: () => apiUrl('auth/google'),
  },
  questions: {
    list: () => apiUrl('questions'),
    byId: (id: string) => apiUrl(`questions/${id}`),
    random: () => apiUrl('questions/random'),
    bookmarks: () => apiUrl('questions/bookmarks'),
    toggleBookmark: (id: string) => apiUrl(`questions/bookmarks/${id}`),
    quiz: () => apiUrl('questions/quiz/questions'),
    submit: () => apiUrl('questions/submit'),
  },
  pricing: {
    list: () => apiUrl('pricing'),
    plans: () => apiUrl('pricing/plans'),
    rates: () => apiUrl('pricing/rates'),
  },
  payments: {
    methods: () => apiUrl('payments/methods'),
    checkout: () => apiUrl('payments/checkout'),
    status: (id: string) => apiUrl(`payments/status/${id}`),
    pricing: (currency?: string) => currency ? apiUrl(`payments/pricing/${currency}`) : apiUrl('payments/pricing'),
    currencyRates: () => apiUrl('payments/currencies/rates'),
    create: () => apiUrl('payments/create'),
    history: (limit?: number, skip?: number) => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (skip) params.append('skip', skip.toString());
      return apiUrl(`payments/history${params.toString() ? `?${params.toString()}` : ''}`);
    },
    subscription: () => apiUrl('payments/subscription'),
    cancelSubscription: () => apiUrl('payments/subscription/cancel'),
    callback: (gateway: string) => apiUrl(`payments/callback/${gateway}`),
  },
  paypal: {
    createOrder: () => apiUrl('payments/paypal/orders'),
    captureOrder: (id: string) => apiUrl(`payments/paypal/orders/${id}/capture`),
  },
  checkout: {
    session: () => apiUrl('checkout/session'),
    create: () => apiUrl('checkout/create'),
    oneClick: () => apiUrl('checkout/one-click'),
    validateCoupon: () => apiUrl('checkout/validate-coupon'),
  },
  coupons: {
    validate: () => apiUrl('coupons/validate'),
  },
  progress: {
    get: () => apiUrl('progress'),
    update: () => apiUrl('progress/update'),
    stats: () => apiUrl('progress/stats'),
    question: (questionId: string) => apiUrl(`progress/question/${questionId}`),
    nextQuestion: (params?: URLSearchParams) => apiUrl(`progress/next-question${params ? `?${params.toString()}` : ''}`),
    sessionComplete: () => apiUrl('progress/session/complete'),
  },
  quizResults: {
    create: () => apiUrl('quiz/results'),
    submit: () => apiUrl('quiz/results/submit'),
    list: () => apiUrl('quiz/results'),
    latest: () => apiUrl('quiz/results/latest'),
    byId: (id: string) => apiUrl(`quiz/results/${id}`),
    history: (params?: URLSearchParams) => apiUrl(`quiz/results/history${params ? `?${params.toString()}` : ''}`),
    stats: (params?: URLSearchParams) => apiUrl(`quiz/results/stats${params ? `?${params.toString()}` : ''}`),
    weakAreas: (params?: URLSearchParams) => apiUrl(`quiz/results/weak-areas${params ? `?${params.toString()}` : ''}`),
    wrongQuestions: (quizId: string) => apiUrl(`quiz/results/${quizId}/wrong-questions`),
  },
  gamification: {
    badges: (params?: URLSearchParams) => apiUrl(`gamification/badges${params ? `?${params.toString()}` : ''}`),
    badgesEarned: () => apiUrl('gamification/badges/earned'),
    badgesSecret: () => apiUrl('gamification/badges/secret'),
    leaderboard: () => apiUrl('gamification/leaderboard'),
    leaderboardByType: (type: string, params?: URLSearchParams) => apiUrl(`gamification/leaderboard/${type}${params ? `?${params.toString()}` : ''}`),
    leaderboardRank: (type: string, params?: URLSearchParams) => apiUrl(`gamification/leaderboard/${type}/rank${params ? `?${params.toString()}` : ''}`),
    achievements: () => apiUrl('gamification/achievements'),
    xp: () => apiUrl('gamification/xp'),
    summary: () => apiUrl('gamification/summary'),
    streak: () => apiUrl('gamification/streak'),
  },
  entitlements: {
    me: () => apiUrl('entitlements/me/entitlements'),
    check: () => apiUrl('entitlements/check'),
    checkContent: () => apiUrl('entitlements/check-content'),
  },
  downloads: {
    generate: (category: string, filename: string, expiresIn?: number) => {
      const params = expiresIn ? `?expiresIn=${expiresIn}` : '';
      return apiUrl(`downloads/generate/${category}/${filename}${params}`);
    },
    categories: () => apiUrl('downloads/categories'),
  },
  admin: {
    users: () => apiUrl('admin/users'),
    questions: () => apiUrl('admin/questions'),
    userById: (id: string) => apiUrl(`admin/users/${id}`),
    stats: () => apiUrl('admin/stats'),
  },
  plans: {
    list: () => apiUrl('plans'),
  },
} as const;
