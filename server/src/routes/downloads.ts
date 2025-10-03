import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { entitlementService } from "../services/entitlement.service.js";
import { signedUrlService } from "../services/signed-url.service.js";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";

// Content access levels mapping
const CONTENT_ACCESS_LEVELS: Record<string, "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE"> = {
  // Junior content (free)
  "intro-guides": "JUNIOR",
  "basic-tutorials": "JUNIOR",
  "community-resources": "JUNIOR",
  
  // Intermediate content
  "advanced-tutorials": "INTERMEDIATE",
  "project-templates": "INTERMEDIATE",
  "coding-challenges": "INTERMEDIATE",
  "best-practices": "INTERMEDIATE",
  
  // Senior content
  "senior-guides": "SENIOR",
  "architecture-patterns": "SENIOR",
  "performance-optimization": "SENIOR",
  "security-best-practices": "SENIOR",
  "interview-preparation": "SENIOR",
  
  // Bundle content (all access)
  "exclusive-content": "BUNDLE",
  "mentorship-sessions": "BUNDLE",
  "early-access": "BUNDLE",
  "premium-resources": "BUNDLE",
};

export default async function downloadRoutes(fastify: FastifyInstance) {
  // Generate signed download URL
  fastify.get(
    "/generate/:category/:filename",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          category: z.string(),
          filename: z.string(),
        }),
        querystring: z.object({
          expiresIn: z.string().transform(Number).optional().default(3600),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { category, filename } = request.params as { category: string; filename: string };
        const { expiresIn } = request.query as { expiresIn: number };
        const userId = request.user!.id;

        // Check if user has access to this content category
        const requiredLevel = CONTENT_ACCESS_LEVELS[category];
        if (!requiredLevel) {
          return reply.status(404).send({
            success: false,
            error: "Content category not found",
          });
        }

        // Check user's entitlements
        const entitlementCheck = await entitlementService.checkContentAccess(userId, requiredLevel);
        if (!entitlementCheck.hasAccess) {
          return reply.status(403).send({
            success: false,
            error: entitlementCheck.reason,
            upgradeRequired: entitlementCheck.upgradeRequired,
          });
        }

        // Generate file path
        const filePath = `${category}/${filename}`;
        
        // Generate signed URL
        const signedUrl = signedUrlService.generateDownloadUrl(filePath, userId, {
          expiresIn,
          resource: filePath,
        });

        reply.send({
          success: true,
          downloadUrl: signedUrl.url,
          expiresAt: signedUrl.expiresAt,
          filePath,
          category,
          requiredLevel,
        });
      } catch (error: any) {
        request.log.error("Generate download URL error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to generate download URL",
        });
      }
    }
  );

  // Serve protected file downloads
  fastify.get(
    "/download/:category/:filename",
    {
      preHandler: [optionalAuth],
      schema: {
        params: z.object({
          category: z.string(),
          filename: z.string(),
        }),
        querystring: z.object({
          signature: z.string(),
          expires: z.string(),
          user: z.string().optional(),
          resource: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { category, filename } = request.params as { category: string; filename: string };
        const { signature, expires, user, resource } = request.query as {
          signature: string;
          expires: string;
          user?: string;
          resource?: string;
        };

        // Reconstruct the URL for verification
        const currentUrl = `${request.protocol}://${request.hostname}${request.url}`;
        
        // Verify signed URL
        const verification = signedUrlService.verifySignedUrl(currentUrl);
        if (!verification.isValid) {
          return reply.status(403).send({
            success: false,
            error: verification.error || "Invalid download link",
          });
        }

        // Additional check: verify user matches if authenticated
        if (request.user && verification.userId !== request.user.id) {
          return reply.status(403).send({
            success: false,
            error: "Download link not valid for current user",
          });
        }

        // Check content access level
        const requiredLevel = CONTENT_ACCESS_LEVELS[category];
        if (!requiredLevel) {
          return reply.status(404).send({
            success: false,
            error: "Content not found",
          });
        }

        // If user is authenticated, double-check entitlements
        if (request.user) {
          const entitlementCheck = await entitlementService.checkContentAccess(
            request.user.id,
            requiredLevel
          );
          if (!entitlementCheck.hasAccess) {
            return reply.status(403).send({
              success: false,
              error: "Access denied to this content",
            });
          }
        }

        // Construct file path
        const filePath = `${category}/${filename}`;
        const fullPath = `${process.cwd()}/protected-content/${filePath}`;

        // Check if file exists
        const fs = await import("fs/promises");
        try {
          await fs.access(fullPath);
        } catch {
          return reply.status(404).send({
            success: false,
            error: "File not found",
          });
        }

        // Set appropriate headers
        reply.header("Content-Disposition", `attachment; filename="${filename}"`);
        reply.header("X-Content-Type-Options", "nosniff");
        reply.header("X-Download-Options", "noopen");

        // Stream the file
        return reply.sendFile(filename, `${process.cwd()}/protected-content/${category}/`);
      } catch (error: any) {
        request.log.error("Download file error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to download file",
        });
      }
    }
  );

  // Generate preview URL for content
  fastify.get(
    "/preview/:category/:filename",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          category: z.string(),
          filename: z.string(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { category, filename } = request.params as { category: string; filename: string };
        const userId = request.user!.id;

        // Check content access
        const requiredLevel = CONTENT_ACCESS_LEVELS[category];
        if (!requiredLevel) {
          return reply.status(404).send({
            success: false,
            error: "Content category not found",
          });
        }

        const entitlementCheck = await entitlementService.checkContentAccess(userId, requiredLevel);
        if (!entitlementCheck.hasAccess) {
          return reply.status(403).send({
            success: false,
            error: entitlementCheck.reason,
            upgradeRequired: entitlementCheck.upgradeRequired,
          });
        }

        // Generate preview URL (shorter expiration)
        const filePath = `${category}/${filename}`;
        const signedUrl = signedUrlService.generatePreviewUrl(filePath, userId, {
          expiresIn: 1800, // 30 minutes
        });

        reply.send({
          success: true,
          previewUrl: signedUrl.url,
          expiresAt: signedUrl.expiresAt,
        });
      } catch (error: any) {
        request.log.error("Generate preview URL error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to generate preview URL",
        });
      }
    }
  );

  // List available content categories
  fastify.get(
    "/categories",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.user!.id;

        // Get user's current entitlements
        const userEntitlements = await entitlementService.getUserEntitlements(userId);
        const userLevel = userEntitlements.entitlements.includes("BUNDLE") 
          ? "BUNDLE" 
          : userEntitlements.entitlements.includes("SENIOR")
          ? "SENIOR"
          : userEntitlements.entitlements.includes("INTERMEDIATE")
          ? "INTERMEDIATE"
          : "JUNIOR";

        // Filter categories based on user's access level
        const availableCategories = Object.entries(CONTENT_ACCESS_LEVELS)
          .filter(([_, level]) => {
            const hierarchy = entitlementService.getEntitlementHierarchy();
            const userLevelEntitlements = hierarchy[userLevel] || [];
            return userLevelEntitlements.includes(level);
          })
          .map(([category, level]) => ({
            category,
            level,
            description: this.getCategoryDescription(category),
          }));

        reply.send({
          success: true,
          categories: availableCategories,
          userLevel,
          hasAccess: userEntitlements.isActive,
        });
      } catch (error: any) {
        request.log.error("List categories error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to list content categories",
        });
      }
    }
  );

  // Get content metadata
  fastify.get(
    "/metadata/:category",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          category: z.string(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { category } = request.params as { category: string };
        const userId = request.user!.id;

        // Check if category exists and user has access
        const requiredLevel = CONTENT_ACCESS_LEVELS[category];
        if (!requiredLevel) {
          return reply.status(404).send({
            success: false,
            error: "Content category not found",
          });
        }

        const entitlementCheck = await entitlementService.checkContentAccess(userId, requiredLevel);
        if (!entitlementCheck.hasAccess) {
          return reply.status(403).send({
            success: false,
            error: entitlementCheck.reason,
            upgradeRequired: entitlementCheck.upgradeRequired,
          });
        }

        // Get category metadata
        const metadata = {
          category,
          level: requiredLevel,
          description: this.getCategoryDescription(category),
          fileCount: await this.getCategoryFileCount(category),
          lastUpdated: await this.getCategoryLastUpdated(category),
        };

        reply.send({
          success: true,
          metadata,
        });
      } catch (error: any) {
        request.log.error("Get content metadata error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get content metadata",
        });
      }
    }
  );

  // Helper methods
  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      "intro-guides": "Introduction guides for beginners",
      "basic-tutorials": "Basic programming tutorials",
      "community-resources": "Community-contributed resources",
      "advanced-tutorials": "Advanced programming concepts",
      "project-templates": "Ready-to-use project templates",
      "coding-challenges": "Programming challenges and exercises",
      "best-practices": "Industry best practices and standards",
      "senior-guides": "Senior-level development guides",
      "architecture-patterns": "Software architecture patterns",
      "performance-optimization": "Performance optimization techniques",
      "security-best-practices": "Security implementation guides",
      "interview-preparation": "Technical interview preparation",
      "exclusive-content": "Exclusive premium content",
      "mentorship-sessions": "One-on-one mentorship sessions",
      "early-access": "Early access to new features",
      "premium-resources": "Premium development resources",
    };
    return descriptions[category] || "Content category";
  }

  private async getCategoryFileCount(category: string): Promise<number> {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const categoryPath = path.join(process.cwd(), "protected-content", category);
      
      try {
        const files = await fs.readdir(categoryPath);
        return files.filter(file => !file.startsWith('.')).length;
      } catch {
        return 0;
      }
    } catch {
      return 0;
    }
  }

  private async getCategoryLastUpdated(category: string): Promise<Date | null> {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const categoryPath = path.join(process.cwd(), "protected-content", category);
      
      try {
        const stats = await fs.stat(categoryPath);
        return stats.mtime;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }
}
