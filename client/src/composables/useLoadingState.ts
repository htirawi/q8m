import { ref } from "vue";

/**
 * useLoadingState Composable
 * Manages loading, error, and success states consistently across components.
 * Provides a clean API for wrapping async operations with automatic state management.
 *
 * @example
 * const { isLoading, error, withLoading, clearError } = useLoadingState();
 *
 * await withLoading(async () => {
 *   await apiCall();
 * });
 */
export function useLoadingState() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Wraps an async function with automatic loading and error state management
   * @param fn - Async function to execute
   * @returns Promise resolving to the function's return value
   */
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await fn();
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Manually clears the error state
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Manually sets loading state
   * @param loading - Loading state to set
   */
  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  /**
   * Manually sets error state
   * @param errorMessage - Error message to set
   */
  const setError = (errorMessage: string) => {
    error.value = errorMessage;
  };

  return {
    isLoading,
    error,
    withLoading,
    clearError,
    setLoading,
    setError,
  };
}
