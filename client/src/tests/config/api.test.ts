import { describe, it, expect, vi, beforeEach } from "vitest";
import { API_ENDPOINTS } from "@/config/api";

describe("API Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication Endpoints", () => {
    it("should have login endpoint", () => {
      expect(API_ENDPOINTS.auth.login()).toBe("http://localhost:3000/api/v1/auth/login");
    });

    it("should have register endpoint", () => {
      expect(API_ENDPOINTS.auth.register()).toBe("http://localhost:3000/api/v1/auth/register");
    });

    it("should have logout endpoint", () => {
      expect(API_ENDPOINTS.auth.logout()).toBe("http://localhost:3000/api/v1/auth/logout");
    });

    it("should have refresh token endpoint", () => {
      expect(API_ENDPOINTS.auth.refresh()).toBe("http://localhost:3000/api/v1/auth/refresh");
    });

    it("should have forgot password endpoint", () => {
      expect(API_ENDPOINTS.auth.forgotPassword()).toBe(
        "http://localhost:3000/api/v1/auth/forgot-password"
      );
    });

    it("should have reset password endpoint", () => {
      expect(API_ENDPOINTS.auth.resetPassword()).toBe(
        "http://localhost:3000/api/v1/auth/reset-password-complete"
      );
    });

    it("should have verify email endpoint", () => {
      expect(API_ENDPOINTS.auth.verifyEmail()).toBe(
        "http://localhost:3000/api/v1/auth/verify-email-complete"
      );
    });

    it("should have resend verification endpoint", () => {
      expect(API_ENDPOINTS.auth.resendVerification()).toBe(
        "http://localhost:3000/api/v1/auth/resend-verification"
      );
    });

    it("should have change password endpoint", () => {
      expect(API_ENDPOINTS.auth.changePassword()).toBe(
        "http://localhost:3000/api/v1/auth/change-password"
      );
    });

    it("should have me endpoint", () => {
      expect(API_ENDPOINTS.auth.me()).toBe("http://localhost:3000/api/v1/auth/me");
    });

    it("should have google auth endpoint", () => {
      expect(API_ENDPOINTS.auth.google()).toBe("http://localhost:3000/api/v1/auth/google");
    });
  });

  describe("Questions Endpoints", () => {
    it("should have questions endpoint", () => {
      expect(API_ENDPOINTS.questions.list()).toBe("http://localhost:3000/api/v1/questions");
    });

    it("should have random questions endpoint", () => {
      expect(API_ENDPOINTS.questions.random()).toBe(
        "http://localhost:3000/api/v1/questions/random"
      );
    });

    it("should have questions by ID endpoint", () => {
      const questionId = "507f1f77bcf86cd799439011";
      expect(API_ENDPOINTS.questions.byId(questionId)).toBe(
        `http://localhost:3000/api/v1/questions/${questionId}`
      );
    });

    it("should have bookmarks endpoint", () => {
      expect(API_ENDPOINTS.questions.bookmarks()).toBe(
        "http://localhost:3000/api/v1/questions/bookmarks"
      );
    });

    it("should have toggle bookmark endpoint", () => {
      const questionId = "507f1f77bcf86cd799439011";
      expect(API_ENDPOINTS.questions.toggleBookmark(questionId)).toBe(
        `http://localhost:3000/api/v1/questions/bookmarks/${questionId}`
      );
    });

    it("should have quiz endpoint", () => {
      expect(API_ENDPOINTS.questions.quiz()).toBe(
        "http://localhost:3000/api/v1/questions/quiz/questions"
      );
    });

    it("should have submit endpoint", () => {
      expect(API_ENDPOINTS.questions.submit()).toBe(
        "http://localhost:3000/api/v1/questions/submit"
      );
    });
  });

  describe("Progress Endpoints", () => {
    it("should have progress endpoint", () => {
      expect(API_ENDPOINTS.progress.get()).toBe("http://localhost:3000/api/v1/progress");
    });

    it("should have progress stats endpoint", () => {
      expect(API_ENDPOINTS.progress.stats()).toBe("http://localhost:3000/api/v1/progress/stats");
    });

    it("should have progress update endpoint", () => {
      expect(API_ENDPOINTS.progress.update()).toBe("http://localhost:3000/api/v1/progress/update");
    });

    it("should have progress question endpoint", () => {
      const questionId = "507f1f77bcf86cd799439011";
      expect(API_ENDPOINTS.progress.question(questionId)).toBe(
        `http://localhost:3000/api/v1/progress/question/${questionId}`
      );
    });

    it("should have next question endpoint", () => {
      expect(API_ENDPOINTS.progress.nextQuestion()).toBe(
        "http://localhost:3000/api/v1/progress/next-question"
      );
    });

    it("should have session complete endpoint", () => {
      expect(API_ENDPOINTS.progress.sessionComplete()).toBe(
        "http://localhost:3000/api/v1/progress/session/complete"
      );
    });
  });

  describe("Gamification Endpoints", () => {
    it("should have badges endpoint", () => {
      expect(API_ENDPOINTS.gamification.badges()).toBe(
        "http://localhost:3000/api/v1/gamification/badges"
      );
    });

    it("should have badges earned endpoint", () => {
      expect(API_ENDPOINTS.gamification.badgesEarned()).toBe(
        "http://localhost:3000/api/v1/gamification/badges/earned"
      );
    });

    it("should have badges secret endpoint", () => {
      expect(API_ENDPOINTS.gamification.badgesSecret()).toBe(
        "http://localhost:3000/api/v1/gamification/badges/secret"
      );
    });

    it("should have leaderboard endpoint", () => {
      expect(API_ENDPOINTS.gamification.leaderboard()).toBe(
        "http://localhost:3000/api/v1/gamification/leaderboard"
      );
    });

    it("should have leaderboard by type endpoint", () => {
      expect(API_ENDPOINTS.gamification.leaderboardByType("daily")).toBe(
        "http://localhost:3000/api/v1/gamification/leaderboard/daily"
      );
    });

    it("should have leaderboard rank endpoint", () => {
      expect(API_ENDPOINTS.gamification.leaderboardRank("daily")).toBe(
        "http://localhost:3000/api/v1/gamification/leaderboard/daily/rank"
      );
    });

    it("should have achievements endpoint", () => {
      expect(API_ENDPOINTS.gamification.achievements()).toBe(
        "http://localhost:3000/api/v1/gamification/achievements"
      );
    });

    it("should have XP endpoint", () => {
      expect(API_ENDPOINTS.gamification.xp()).toBe("http://localhost:3000/api/v1/gamification/xp");
    });

    it("should have summary endpoint", () => {
      expect(API_ENDPOINTS.gamification.summary()).toBe(
        "http://localhost:3000/api/v1/gamification/summary"
      );
    });

    it("should have streak endpoint", () => {
      expect(API_ENDPOINTS.gamification.streak()).toBe(
        "http://localhost:3000/api/v1/gamification/streak"
      );
    });
  });

  describe("Payments Endpoints", () => {
    it("should have payment methods endpoint", () => {
      expect(API_ENDPOINTS.payments.methods()).toBe(
        "http://localhost:3000/api/v1/payments/methods"
      );
    });

    it("should have checkout endpoint", () => {
      expect(API_ENDPOINTS.payments.checkout()).toBe(
        "http://localhost:3000/api/v1/payments/checkout"
      );
    });

    it("should have payment status endpoint", () => {
      const paymentId = "507f1f77bcf86cd799439011";
      expect(API_ENDPOINTS.payments.status(paymentId)).toBe(
        `http://localhost:3000/api/v1/payments/status/${paymentId}`
      );
    });

    it("should have pricing endpoint", () => {
      expect(API_ENDPOINTS.payments.pricing()).toBe(
        "http://localhost:3000/api/v1/payments/pricing"
      );
    });

    it("should have pricing with currency endpoint", () => {
      expect(API_ENDPOINTS.payments.pricing("USD")).toBe(
        "http://localhost:3000/api/v1/payments/pricing/USD"
      );
    });

    it("should have currency rates endpoint", () => {
      expect(API_ENDPOINTS.payments.currencyRates()).toBe(
        "http://localhost:3000/api/v1/payments/currencies/rates"
      );
    });

    it("should have create payment endpoint", () => {
      expect(API_ENDPOINTS.payments.create()).toBe("http://localhost:3000/api/v1/payments/create");
    });

    it("should have payment history endpoint", () => {
      expect(API_ENDPOINTS.payments.history()).toBe(
        "http://localhost:3000/api/v1/payments/history"
      );
    });

    it("should have payment history with params endpoint", () => {
      expect(API_ENDPOINTS.payments.history(10, 20)).toBe(
        "http://localhost:3000/api/v1/payments/history?limit=10&skip=20"
      );
    });

    it("should have subscription endpoint", () => {
      expect(API_ENDPOINTS.payments.subscription()).toBe(
        "http://localhost:3000/api/v1/payments/subscription"
      );
    });

    it("should have cancel subscription endpoint", () => {
      expect(API_ENDPOINTS.payments.cancelSubscription()).toBe(
        "http://localhost:3000/api/v1/payments/subscription/cancel"
      );
    });

    it("should have callback endpoint", () => {
      expect(API_ENDPOINTS.payments.callback("paypal")).toBe(
        "http://localhost:3000/api/v1/payments/callback/paypal"
      );
    });
  });

  describe("PayPal Endpoints", () => {
    it("should have PayPal create order endpoint", () => {
      expect(API_ENDPOINTS.paypal.createOrder()).toBe(
        "http://localhost:3000/api/v1/payments/paypal/orders"
      );
    });

    it("should have PayPal capture order endpoint", () => {
      const orderId = "PAYPAL_ORDER_ID";
      expect(API_ENDPOINTS.paypal.captureOrder(orderId)).toBe(
        `http://localhost:3000/api/v1/payments/paypal/orders/${orderId}/capture`
      );
    });
  });

  describe("Checkout Endpoints", () => {
    it("should have checkout session endpoint", () => {
      expect(API_ENDPOINTS.checkout.session()).toBe(
        "http://localhost:3000/api/v1/checkout/session"
      );
    });

    it("should have checkout create endpoint", () => {
      expect(API_ENDPOINTS.checkout.create()).toBe("http://localhost:3000/api/v1/checkout/create");
    });

    it("should have one click checkout endpoint", () => {
      expect(API_ENDPOINTS.checkout.oneClick()).toBe(
        "http://localhost:3000/api/v1/checkout/one-click"
      );
    });

    it("should have validate coupon endpoint", () => {
      expect(API_ENDPOINTS.checkout.validateCoupon()).toBe(
        "http://localhost:3000/api/v1/checkout/validate-coupon"
      );
    });
  });

  describe("Coupons Endpoints", () => {
    it("should have validate coupon endpoint", () => {
      expect(API_ENDPOINTS.coupons.validate()).toBe(
        "http://localhost:3000/api/v1/coupons/validate"
      );
    });
  });

  describe("Quiz Results Endpoints", () => {
    it("should have quiz results create endpoint", () => {
      expect(API_ENDPOINTS.quizResults.create()).toBe("http://localhost:3000/api/v1/quiz/results");
    });

    it("should have quiz results submit endpoint", () => {
      expect(API_ENDPOINTS.quizResults.submit()).toBe(
        "http://localhost:3000/api/v1/quiz/results/submit"
      );
    });

    it("should have quiz results list endpoint", () => {
      expect(API_ENDPOINTS.quizResults.list()).toBe("http://localhost:3000/api/v1/quiz/results");
    });

    it("should have quiz results latest endpoint", () => {
      expect(API_ENDPOINTS.quizResults.latest()).toBe(
        "http://localhost:3000/api/v1/quiz/results/latest"
      );
    });

    it("should have quiz results by ID endpoint", () => {
      const resultId = "507f1f77bcf86cd799439011";
      expect(API_ENDPOINTS.quizResults.byId(resultId)).toBe(
        `http://localhost:3000/api/v1/quiz/results/${resultId}`
      );
    });

    it("should have quiz results history endpoint", () => {
      expect(API_ENDPOINTS.quizResults.history()).toBe(
        "http://localhost:3000/api/v1/quiz/results/history"
      );
    });

    it("should have quiz results stats endpoint", () => {
      expect(API_ENDPOINTS.quizResults.stats()).toBe(
        "http://localhost:3000/api/v1/quiz/results/stats"
      );
    });

    it("should have quiz results weak areas endpoint", () => {
      expect(API_ENDPOINTS.quizResults.weakAreas()).toBe(
        "http://localhost:3000/api/v1/quiz/results/weak-areas"
      );
    });

    it("should have quiz results wrong questions endpoint", () => {
      const quizId = "507f1f77bcf86cd799439011";
      expect(API_ENDPOINTS.quizResults.wrongQuestions(quizId)).toBe(
        `http://localhost:3000/api/v1/quiz/results/${quizId}/wrong-questions`
      );
    });
  });

  describe("Entitlements Endpoints", () => {
    it("should have entitlements me endpoint", () => {
      expect(API_ENDPOINTS.entitlements.me()).toBe(
        "http://localhost:3000/api/v1/entitlements/me/entitlements"
      );
    });

    it("should have entitlements check endpoint", () => {
      expect(API_ENDPOINTS.entitlements.check()).toBe(
        "http://localhost:3000/api/v1/entitlements/check"
      );
    });

    it("should have entitlements check content endpoint", () => {
      expect(API_ENDPOINTS.entitlements.checkContent()).toBe(
        "http://localhost:3000/api/v1/entitlements/check-content"
      );
    });
  });

  describe("Downloads Endpoints", () => {
    it("should have downloads generate endpoint", () => {
      expect(API_ENDPOINTS.downloads.generate("books", "file.pdf")).toBe(
        "http://localhost:3000/api/v1/downloads/generate/books/file.pdf"
      );
    });

    it("should have downloads generate with expiration endpoint", () => {
      expect(API_ENDPOINTS.downloads.generate("books", "file.pdf", 3600)).toBe(
        "http://localhost:3000/api/v1/downloads/generate/books/file.pdf?expiresIn=3600"
      );
    });

    it("should have downloads categories endpoint", () => {
      expect(API_ENDPOINTS.downloads.categories()).toBe(
        "http://localhost:3000/api/v1/downloads/categories"
      );
    });
  });

  describe("Admin Endpoints", () => {
    it("should have admin users endpoint", () => {
      expect(API_ENDPOINTS.admin.users()).toBe("http://localhost:3000/api/v1/admin/users");
    });

    it("should have admin questions endpoint", () => {
      expect(API_ENDPOINTS.admin.questions()).toBe("http://localhost:3000/api/v1/admin/questions");
    });

    it("should have admin user by ID endpoint", () => {
      const userId = "507f1f77bcf86cd799439011";
      expect(API_ENDPOINTS.admin.userById(userId)).toBe(
        `http://localhost:3000/api/v1/admin/users/${userId}`
      );
    });

    it("should have admin stats endpoint", () => {
      expect(API_ENDPOINTS.admin.stats()).toBe("http://localhost:3000/api/v1/admin/stats");
    });
  });

  describe("Plans Endpoints", () => {
    it("should have plans endpoint", () => {
      expect(API_ENDPOINTS.plans.list()).toBe("http://localhost:3000/api/v1/plans");
    });
  });

  describe("Pricing Endpoints", () => {
    it("should have pricing endpoint", () => {
      expect(API_ENDPOINTS.pricing.list()).toBe("http://localhost:3000/api/v1/pricing");
    });

    it("should have pricing plans endpoint", () => {
      expect(API_ENDPOINTS.pricing.plans()).toBe("http://localhost:3000/api/v1/pricing/plans");
    });

    it("should have pricing rates endpoint", () => {
      expect(API_ENDPOINTS.pricing.rates()).toBe("http://localhost:3000/api/v1/pricing/rates");
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in IDs", () => {
      const specialId = "507f1f77bcf86cd799439011!@#$%^&*()";
      expect(API_ENDPOINTS.questions.byId(specialId)).toBe(
        `http://localhost:3000/api/v1/questions/${specialId}`
      );
    });

    it("should handle empty strings in IDs", () => {
      const emptyId = "";
      expect(API_ENDPOINTS.questions.byId(emptyId)).toBe("http://localhost:3000/api/v1/questions/");
    });

    it("should handle very long IDs", () => {
      const longId = "a".repeat(1000);
      expect(API_ENDPOINTS.questions.byId(longId)).toBe(
        `http://localhost:3000/api/v1/questions/${longId}`
      );
    });

    it("should handle numeric IDs", () => {
      const numericId = "123456789";
      expect(API_ENDPOINTS.questions.byId(numericId)).toBe(
        `http://localhost:3000/api/v1/questions/${numericId}`
      );
    });

    it("should handle UUIDs", () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      expect(API_ENDPOINTS.questions.byId(uuid)).toBe(
        `http://localhost:3000/api/v1/questions/${uuid}`
      );
    });

    it("should handle case sensitivity in gateway names", () => {
      expect(API_ENDPOINTS.payments.callback("PAYPAL")).toBe(
        "http://localhost:3000/api/v1/payments/callback/PAYPAL"
      );
      expect(API_ENDPOINTS.payments.callback("PayPal")).toBe(
        "http://localhost:3000/api/v1/payments/callback/PayPal"
      );
      expect(API_ENDPOINTS.payments.callback("paypal")).toBe(
        "http://localhost:3000/api/v1/payments/callback/paypal"
      );
    });
  });

  describe("URL Construction", () => {
    it("should construct URLs correctly", () => {
      const endpoint = API_ENDPOINTS.auth.login();
      expect(endpoint).toBe("http://localhost:3000/api/v1/auth/login");
    });

    it("should handle nested endpoints", () => {
      const endpoint = API_ENDPOINTS.admin.userById("123");
      expect(endpoint).toBe("http://localhost:3000/api/v1/admin/users/123");
    });

    it("should handle multiple parameters", () => {
      const endpoint = API_ENDPOINTS.payments.history(10, 20);
      expect(endpoint).toBe("http://localhost:3000/api/v1/payments/history?limit=10&skip=20");
    });

    it("should maintain consistent URL structure", () => {
      const endpoints = [
        API_ENDPOINTS.auth.login(),
        API_ENDPOINTS.questions.list(),
        API_ENDPOINTS.progress.get(),
        API_ENDPOINTS.gamification.badges(),
        API_ENDPOINTS.payments.methods(),
        API_ENDPOINTS.plans.list(),
        API_ENDPOINTS.admin.users(),
      ];

      endpoints.forEach((endpoint) => {
        expect(endpoint).toMatch(/^http:\/\/localhost:3000\/api\/v1\//);
      });
    });
  });
});
