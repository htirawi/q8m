import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { httpClient, getErrorMessage as extractErrorMessage } from "@/utils/httpClient";
import { useAuthStore } from "./auth";
import { useToast } from "@/composables/useToast";
import type {
  ILearningPath,
  IPathEnrollment,
  IPathStats,
  ICertificate,
  PathCategory,
  PathDifficulty,
} from "@shared/types/learning-paths";

// Re-export types for use in other modules
export type {
  ILearningPath,
  IPathEnrollment,
  IPathStats,
  ICertificate,
  PathCategory,
  PathDifficulty,
} from "@shared/types/learning-paths";

// Helper to extract error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return extractErrorMessage(error) || defaultMessage;
}

export const useLearningPathsStore = defineStore("learningPaths", () => {
  const authStore = useAuthStore();
  const toast = useToast();

  // State
  const paths = ref<ILearningPath[]>([]);
  const currentPath = ref<ILearningPath | null>(null);
  const enrollments = ref<IPathEnrollment[]>([]);
  const currentEnrollment = ref<IPathEnrollment | null>(null);
  const stats = ref<IPathStats>({
    totalPaths: 0,
    enrolledPaths: 0,
    completedPaths: 0,
    inProgressPaths: 0,
    totalTimeSpent: 0,
    certificatesEarned: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);

  // API Base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Computed
  const inProgressEnrollments = computed(() =>
    enrollments.value.filter((e) => e.status === "in-progress")
  );

  const completedEnrollments = computed(() =>
    enrollments.value.filter((e) => e.status === "completed")
  );

  const currentPathProgress = computed(() => {
    if (!currentEnrollment.value) return 0;
    return currentEnrollment.value.progress;
  });

  const isEnrolledInCurrentPath = computed(() => {
    if (!currentPath.value || !authStore.isAuthenticated) return false;
    return enrollments.value.some((e) => e.pathId === currentPath.value!._id);
  });

  /**
   * Fetch all published learning paths
   */
  const fetchPaths = async (filters?: {
    category?: PathCategory;
    difficulty?: PathDifficulty;
    framework?: string;
    isPremium?: boolean;
  }): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.difficulty) params.append("difficulty", filters.difficulty);
      if (filters?.framework) params.append("framework", filters.framework);
      if (filters?.isPremium !== undefined)
        params.append("isPremium", filters.isPremium.toString());

      const url = `${API_URL}/api/v1/learning-paths?${params.toString()}`;
      const data = await httpClient.get<{ paths: ILearningPath[]; total: number }>(url);

      paths.value = data.paths;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load learning paths");
      toast.error("Error", error.value);
      console.error("Error fetching learning paths:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch single learning path by slug
   */
  const fetchPathBySlug = async (slug: string): Promise<ILearningPath | null> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{
        path: ILearningPath;
        isEnrolled: boolean;
        enrollment?: IPathEnrollment;
      }>(`${API_URL}/api/v1/learning-paths/${slug}`);

      currentPath.value = data.path;
      if (data.enrollment) {
        currentEnrollment.value = data.enrollment;
      }

      return data.path;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load learning path");
      toast.error("Error", error.value);
      console.error("Error fetching learning path:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch user's enrollments
   */
  const fetchEnrollments = async (
    status?: "in-progress" | "completed" | "abandoned"
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const url = `${API_URL}/api/v1/learning-paths/my/enrollments?${params.toString()}`;
      const data = await httpClient.get<{
        enrollments: IPathEnrollment[];
        total: number;
      }>(url, { requireAuth: true });

      enrollments.value = data.enrollments;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load enrollments");
      toast.error("Error", error.value);
      console.error("Error fetching enrollments:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Enroll in a learning path
   */
  const enrollInPath = async (pathId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.post<{
        success: boolean;
        enrollment: IPathEnrollment;
      }>(`${API_URL}/api/v1/learning-paths/${pathId}/enroll`, {}, { requireAuth: true });

      if (data.success) {
        currentEnrollment.value = data.enrollment;
        enrollments.value.unshift(data.enrollment);
        toast.success("Successfully enrolled in learning path!");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to enroll in learning path");
      toast.error("Error", error.value);
      console.error("Error enrolling in path:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch enrollment progress for a specific path
   */
  const fetchEnrollmentProgress = async (pathId: string): Promise<IPathEnrollment | null> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ enrollment: IPathEnrollment }>(
        `${API_URL}/api/v1/learning-paths/${pathId}/enrollment`,
        { requireAuth: true }
      );

      currentEnrollment.value = data.enrollment;
      return data.enrollment;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load enrollment progress");
      console.error("Error fetching enrollment progress:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Complete a module
   */
  const completeModule = async (
    pathId: string,
    moduleId: string,
    data: {
      questionsCompleted: number;
      score?: number;
      timeSpentMinutes: number;
    }
  ): Promise<{
    success: boolean;
    pathCompleted: boolean;
    certificateIssued: boolean;
    nextModuleId?: string;
  }> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await httpClient.post<{
        success: boolean;
        progress: number;
        pathCompleted: boolean;
        certificateIssued: boolean;
        nextModuleId?: string;
      }>(`${API_URL}/api/v1/learning-paths/${pathId}/modules/${moduleId}/complete`, data, {
        requireAuth: true,
      });

      if (result.success) {
        // Update current enrollment
        if (currentEnrollment.value) {
          currentEnrollment.value.progress = result.progress;
        }

        // Refresh enrollment progress
        await fetchEnrollmentProgress(pathId);

        if (result.pathCompleted) {
          toast.success("Congratulations! You completed the learning path!");
        } else {
          toast.success("Module completed successfully!");
        }

        return {
          success: true,
          pathCompleted: result.pathCompleted,
          certificateIssued: result.certificateIssued,
          nextModuleId: result.nextModuleId,
        };
      }

      return {
        success: false,
        pathCompleted: false,
        certificateIssued: false,
      };
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to complete module");
      toast.error("Error", error.value);
      console.error("Error completing module:", err);
      return {
        success: false,
        pathCompleted: false,
        certificateIssued: false,
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get certificate for completed path
   */
  const getCertificate = async (pathId: string): Promise<ICertificate | null> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ certificate: ICertificate }>(
        `${API_URL}/api/v1/learning-paths/${pathId}/certificate`,
        { requireAuth: true }
      );

      return data.certificate;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load certificate");
      toast.error("Error", error.value);
      console.error("Error fetching certificate:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch user's learning path statistics
   */
  const fetchStats = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ stats: IPathStats }>(
        `${API_URL}/api/v1/learning-paths/my/stats`,
        { requireAuth: true }
      );

      stats.value = data.stats;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load statistics");
      console.error("Error fetching stats:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get path by ID from current paths list
   */
  const getPathById = (pathId: string): ILearningPath | undefined => {
    return paths.value.find((p) => p._id === pathId);
  };

  /**
   * Get path by slug from current paths list
   */
  const getPathBySlug = (slug: string): ILearningPath | undefined => {
    return paths.value.find((p) => p.slug === slug);
  };

  /**
   * Clear current path
   */
  const clearCurrentPath = (): void => {
    currentPath.value = null;
    currentEnrollment.value = null;
  };

  return {
    // State
    paths,
    currentPath,
    enrollments,
    currentEnrollment,
    stats,
    loading,
    error,

    // Computed
    inProgressEnrollments,
    completedEnrollments,
    currentPathProgress,
    isEnrolledInCurrentPath,

    // Actions
    fetchPaths,
    fetchPathBySlug,
    fetchEnrollments,
    enrollInPath,
    fetchEnrollmentProgress,
    completeModule,
    getCertificate,
    fetchStats,
    getPathById,
    getPathBySlug,
    clearCurrentPath,
  };
});
