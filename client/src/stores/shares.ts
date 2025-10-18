import { computed, ref } from "vue";
import { defineStore } from "pinia";

import { useToast } from "@/composables/useToast";
import { getErrorMessage as extractErrorMessage, httpClient } from "@/utils/httpClient";

// Types
export type ShareType =
  | "quiz_result"
  | "achievement"
  | "streak"
  | "challenge_victory"
  | "profile"
  | "badge";
export type SharePlatform =
  | "twitter"
  | "facebook"
  | "linkedin"
  | "whatsapp"
  | "email"
  | "copy_link";

export interface SharePreviewData {
  title: string;
  description: string;
  imageUrl: string;
  metadata: Record<string, unknown>;
}

export interface CreateShareData {
  shareType: ShareType;
  entityId: string;
  platform: SharePlatform;
  metadata?: Record<string, unknown>;
}

export interface ShareStats {
  totalShares: number;
  totalClicks: number;
  sharesByType: Record<string, number>;
  sharesByPlatform: Record<string, number>;
}

// Helper to extract error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return extractErrorMessage(error) || defaultMessage;
}

export const useSharesStore = defineStore("shares", () => {
  const toast = useToast();

  // State
  const sharePreview = ref<SharePreviewData | null>(null);
  const stats = ref<ShareStats>({
    totalShares: 0,
    totalClicks: 0,
    sharesByType: {},
    sharesByPlatform: {},
  });
  const loading = ref(false);
  const error = ref<string | null>(null);

  // API Base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  /**
   * Get share preview data
   */
  const getSharePreview = async (
    shareType: ShareType,
    entityId: string
  ): Promise<SharePreviewData | null> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ success: boolean; data: SharePreviewData }>(
        `${API_URL}/api/v1/shares/preview/${shareType}/${entityId}`,
        { requireAuth: true }
      );

      if (data.success) {
        sharePreview.value = data.data;
        return data.data;
      }

      return null;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load share preview");
      console.error("Error fetching share preview:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create/track a share
   */
  const createShare = async (data: CreateShareData): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await httpClient.post<{ success: boolean }>(`${API_URL}/api/v1/shares`, data, {
        requireAuth: true,
      });

      if (result.success) {
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to share");
      console.error("Error creating share:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get user's share statistics
   */
  const getShareStats = async (period: "day" | "week" | "month" | "all" = "all"): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      params.append("period", period);

      const result = await httpClient.get<{ success: boolean; data: ShareStats }>(
        `${API_URL}/api/v1/shares/stats?${params.toString()}`,
        { requireAuth: true }
      );

      if (result.success) {
        stats.value = result.data;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load share statistics");
      console.error("Error fetching share stats:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Track share click
   */
  const trackShareClick = async (shareId: string): Promise<void> => {
    try {
      await httpClient.post<{ success: boolean }>(
        `${API_URL}/api/v1/shares/${shareId}/click`,
        {},
        { requireAuth: false }
      );
    } catch (err: unknown) {
      console.error("Error tracking share click:", err);
    }
  };

  /**
   * Share to specific platform
   */
  const shareToSocial = async (
    shareType: ShareType,
    entityId: string,
    platform: SharePlatform
  ): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      // Get share preview first
      const preview = await getSharePreview(shareType, entityId);
      if (!preview) {
        toast.error("Error", "Failed to generate share content");
        return false;
      }

      // Track the share
      await createShare({
        shareType,
        entityId,
        platform,
        metadata: preview.metadata,
      });

      // Generate share URL
      const shareUrl = `${window.location.origin}/share/${shareType}/${entityId}`;
      const encodedUrl = encodeURIComponent(shareUrl);
      const encodedTitle = encodeURIComponent(preview.title);
      const encodedDescription = encodeURIComponent(preview.description);

      let shareLink = "";

      switch (platform) {
        case "twitter":
          shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
          break;
        case "facebook":
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case "linkedin":
          shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          break;
        case "whatsapp":
          shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
          break;
        case "email":
          shareLink = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
          break;
        case "copy_link":
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Success", "Link copied to clipboard!");
            return true;
          } catch (_clipboardErr) {
            toast.error("Error", "Failed to copy link");
            return false;
          }
      }

      if (shareLink) {
        window.open(shareLink, "_blank", "width=600,height=400");
        toast.success("Success", "Opening share dialog...");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to share");
      toast.error("Error", error.value);
      console.error("Error sharing to social:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Generate shareable image URL (placeholder for future OG image generation)
   */
  const generateShareImage = (shareType: ShareType, entityId: string): string => {
    return `${API_URL}/api/v1/shares/image/${shareType}/${entityId}.png`;
  };

  /**
   * Clear share preview
   */
  const clearSharePreview = (): void => {
    sharePreview.value = null;
  };

  // Computed
  const hasShares = computed(() => stats.value.totalShares > 0);
  const mostSharedType = computed(() => {
    const types = Object.entries(stats.value.sharesByType);
    if (types.length === 0) return null;
    return types.reduce(
      (max, [type, count]) => (count > max[1] ? [type, count] : max),
      types[0]
    )[0];
  });
  const mostUsedPlatform = computed(() => {
    const platforms = Object.entries(stats.value.sharesByPlatform);
    if (platforms.length === 0) return null;
    return platforms.reduce(
      (max, [platform, count]) => (count > max[1] ? [platform, count] : max),
      platforms[0]
    )[0];
  });

  return {
    // State
    sharePreview,
    stats,
    loading,
    error,

    // Computed
    hasShares,
    mostSharedType,
    mostUsedPlatform,

    // Actions
    getSharePreview,
    createShare,
    getShareStats,
    trackShareClick,
    shareToSocial,
    generateShareImage,
    clearSharePreview,
  };
});
