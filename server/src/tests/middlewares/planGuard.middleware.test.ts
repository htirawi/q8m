/**
 * Plan Guard Middleware Tests
 * Tests server-side plan enforcement for study and quiz routes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createPlanGuard } from '../../middlewares/planGuard.middleware.js';

/**
 * Extended FastifyRequest for testing with auth user
 */
interface AuthenticatedRequest extends FastifyRequest {
  authUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    entitlements: string[];
    isEmailVerified: boolean;
  };
  sessionId?: string;
}

/**
 * Helper to get entitlements for a given plan tier
 */
function getEntitlementsForPlan(plan: 'free' | 'intermediate' | 'advanced'): string[] {
  switch (plan) {
    case 'free':
      return ['JUNIOR'];
    case 'intermediate':
      return ['JUNIOR', 'INTERMEDIATE'];
    case 'advanced':
      return ['JUNIOR', 'INTERMEDIATE', 'SENIOR'];
    default:
      return ['JUNIOR'];
  }
}

describe('Plan Guard Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockReply: Partial<FastifyReply>;
  let responseBody: unknown;

  beforeEach(() => {
    responseBody = null;

    mockRequest = {
      query: {},
      authUser: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        entitlements: ['JUNIOR'], // Free plan
        isEmailVerified: true,
      },
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn((body) => {
        responseBody = body;
        return mockReply as FastifyReply;
      }),
    } as Partial<FastifyReply>;
  });

  describe('Study Mode Guards', () => {
    it('should allow free users to access easy difficulty', async () => {
      mockRequest.query = { difficulty: 'easy' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should block free users from accessing medium difficulty', async () => {
      mockRequest.query = { difficulty: 'medium' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(responseBody).toMatchObject({
        code: 403,
        error: 'Forbidden',
        requiredPlan: 'intermediate',
        suggestedPlan: 'intermediate',
      });
    });

    it('should block free users from accessing hard difficulty', async () => {
      mockRequest.query = { difficulty: 'hard' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(responseBody).toMatchObject({
        code: 403,
        error: 'Forbidden',
        requiredPlan: 'advanced',
        suggestedPlan: 'intermediate', // Always suggest intermediate to free users
      });
    });

    it('should allow intermediate users to access medium difficulty', async () => {
      mockRequest.query = { difficulty: 'medium' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('intermediate');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should allow advanced users to access all difficulties', async () => {
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('advanced');

      const difficulties = ['easy', 'medium', 'hard'];
      for (const difficulty of difficulties) {
        mockRequest.query = { difficulty };

        const guard = createPlanGuard({ feature: 'study' });
        await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

        expect(mockReply.status).not.toHaveBeenCalledWith(403);
      }
    });

    it('should allow pro users to access all difficulties', async () => {
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('advanced'); // Pro is mapped to advanced

      const difficulties = ['easy', 'medium', 'hard'];
      for (const difficulty of difficulties) {
        mockRequest.query = { difficulty };

        const guard = createPlanGuard({ feature: 'study' });
        await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

        expect(mockReply.status).not.toHaveBeenCalledWith(403);
      }
    });
  });

  describe('Quiz Mode Guards', () => {
    it('should allow free users to access junior level', async () => {
      mockRequest.query = { level: 'junior' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'quiz' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should block free users from accessing intermediate level', async () => {
      mockRequest.query = { level: 'intermediate' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'quiz' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(responseBody).toMatchObject({
        code: 403,
        error: 'Forbidden',
        requiredPlan: 'intermediate',
      });
    });

    it('should block free users from accessing senior level', async () => {
      mockRequest.query = { level: 'senior' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'quiz' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(responseBody).toMatchObject({
        code: 403,
        error: 'Forbidden',
        requiredPlan: 'advanced',
      });
    });

    it('should allow intermediate users to access intermediate level', async () => {
      mockRequest.query = { level: 'intermediate' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('intermediate');

      const guard = createPlanGuard({ feature: 'quiz' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });
  });

  describe('Missing Authentication', () => {
    it('should return 401 when authUser is missing', async () => {
      mockRequest.query = { difficulty: 'medium' };
      delete mockRequest.authUser;

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(responseBody).toMatchObject({
        code: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });
  });

  describe('Response Format', () => {
    it('should include upgrade URL in 403 response', async () => {
      mockRequest.query = { difficulty: 'medium' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(responseBody).toMatchObject({
        upgradeUrl: '/pricing?plan=intermediate',
      });
    });

    it('should include suggested plan in 403 response', async () => {
      mockRequest.query = { difficulty: 'hard' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('intermediate');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(responseBody).toMatchObject({
        suggestedPlan: 'advanced',
      });
    });

    it('should include descriptive error message', async () => {
      mockRequest.query = { difficulty: 'medium' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(responseBody).toHaveProperty('message');
      expect((responseBody as { message: string }).message).toContain('medium');
      expect((responseBody as { message: string }).message).toContain('intermediate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing difficulty parameter gracefully', async () => {
      mockRequest.query = {};
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      // Should not throw error, just allow access (no difficulty = default access)
      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should handle invalid difficulty parameter', async () => {
      mockRequest.query = { difficulty: 'invalid' };
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'study' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      // Should not throw error
      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should handle missing level parameter gracefully', async () => {
      mockRequest.query = {};
      mockRequest.authUser!.entitlements = getEntitlementsForPlan('free');

      const guard = createPlanGuard({ feature: 'quiz' });
      await guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      // Should not throw error
      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });
  });

  describe('Plan Hierarchy', () => {
    it('should respect plan hierarchy for access control', () => {
      // Test that higher tier plans can access lower tier content
      const testCases = [
        { userPlan: 'intermediate', accessibleContent: ['easy', 'medium'] },
        { userPlan: 'advanced', accessibleContent: ['easy', 'medium', 'hard'] },
        { userPlan: 'advanced', accessibleContent: ['easy', 'medium', 'hard'] },
      ];

      for (const testCase of testCases) {
        for (const difficulty of testCase.accessibleContent) {
          mockRequest.query = { difficulty };
          mockRequest.authUser!.entitlements = getEntitlementsForPlan(
            testCase.userPlan as 'free' | 'intermediate' | 'advanced'
          );

          const guard = createPlanGuard({ feature: 'study' });
          guard(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

          expect(mockReply.status).not.toHaveBeenCalledWith(403);
        }
      }
    });
  });
});
