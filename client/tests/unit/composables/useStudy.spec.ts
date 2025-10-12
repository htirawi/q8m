import { describe, it, expect, beforeEach, vi } from "vitest";
import { useStudy } from "./useStudy";

// Mock dependencies
const mockRouterPush = vi.fn().mockResolvedValue(undefined);
const mockHandlePlanEntryClick = vi.fn().mockResolvedValue(undefined);
const mockTrackStudyEvent = vi.fn();
const mockTrackGenericEvent = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("@/composables/usePlanEntry", () => ({
  usePlanEntry: () => ({
    handlePlanEntryClick: mockHandlePlanEntryClick,
  }),
}));

vi.mock("@/composables/useAnalytics", () => ({
  useAnalytics: () => ({
    trackStudyEvent: mockTrackStudyEvent,
    trackGenericEvent: mockTrackGenericEvent,
  }),
}));

describe("useStudy", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock = {};

    // Mock localStorage with full implementation
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe("Auto-start preference management", () => {
    it("should return true by default when no preference is stored", () => {
      const { getAutoStart } = useStudy();
      expect(getAutoStart()).toBe(true);
    });

    it("should return stored preference when available", () => {
      localStorageMock["q8m_study_autostart"] = "false";
      const { getAutoStart } = useStudy();
      expect(getAutoStart()).toBe(false);
    });

    it("should save auto-start preference to localStorage", () => {
      const { setAutoStart } = useStudy();
      setAutoStart(false);

      expect(localStorage.setItem).toHaveBeenCalledWith("q8m_study_autostart", "false");
      expect(localStorageMock["q8m_study_autostart"]).toBe("false");
    });

    it("should handle localStorage availability", () => {
      const { getAutoStart, setAutoStart } = useStudy();

      // Should work with localStorage
      setAutoStart(false);
      expect(localStorageMock["q8m_study_autostart"]).toBe("false");
      expect(getAutoStart()).toBe(false);
    });
  });

  describe("Last session management", () => {
    it("should return null when no session is stored", () => {
      const { getLastSession } = useStudy();
      expect(getLastSession()).toBeNull();
    });

    it("should return stored session when available and not stale", () => {
      const session = {
        difficulty: "easy" as const,
        questionIndex: 5,
        timestamp: Date.now(),
      };
      localStorageMock["q8m_study_last_session"] = JSON.stringify(session);

      const { getLastSession } = useStudy();
      const result = getLastSession();

      expect(result).toEqual(session);
    });

    it("should remove and return null for stale sessions (>7 days)", () => {
      const staleSession = {
        difficulty: "easy" as const,
        questionIndex: 5,
        timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
      };
      localStorageMock["q8m_study_last_session"] = JSON.stringify(staleSession);

      const { getLastSession } = useStudy();
      const result = getLastSession();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("q8m_study_last_session");
    });

    it("should handle invalid JSON gracefully", () => {
      localStorageMock["q8m_study_last_session"] = "invalid-json";

      const { getLastSession } = useStudy();
      const result = getLastSession();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("q8m_study_last_session");
    });

    it("should save session with correct structure", () => {
      const { saveLastSession } = useStudy();
      saveLastSession("medium", 10);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "q8m_study_last_session",
        expect.stringContaining('"difficulty":"medium"')
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "q8m_study_last_session",
        expect.stringContaining('"questionIndex":10')
      );
    });

    it("should clear last session", () => {
      const session = {
        difficulty: "easy" as const,
        questionIndex: 5,
        timestamp: Date.now(),
      };
      localStorageMock["q8m_study_last_session"] = JSON.stringify(session);

      const { clearLastSession } = useStudy();
      clearLastSession();

      expect(localStorage.removeItem).toHaveBeenCalledWith("q8m_study_last_session");
    });
  });

  describe("computed properties", () => {
    it("should correctly compute lastSessionDifficulty", () => {
      const { lastSessionDifficulty, saveLastSession } = useStudy();

      expect(lastSessionDifficulty.value).toBeNull();

      saveLastSession("medium", 5);
      expect(lastSessionDifficulty.value).toBe("medium");

      saveLastSession("hard", 10);
      expect(lastSessionDifficulty.value).toBe("hard");
    });
  });

  describe("edge cases", () => {
    it("should handle missing localStorage gracefully", () => {
      // Simulate missing localStorage (SSR scenario)
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      const { getAutoStart, setAutoStart, getLastSession, saveLastSession } = useStudy();

      // Should not throw errors
      expect(getAutoStart()).toBe(true); // Default value
      expect(() => setAutoStart(false)).not.toThrow();
      expect(getLastSession()).toBeNull();
      expect(() => saveLastSession("easy", 1)).not.toThrow();
    });

    it("should handle corrupt localStorage data", () => {
      localStorageMock["q8m_study_autostart"] = "not-a-boolean";
      localStorageMock["q8m_study_last_session"] = "{invalid-json";

      const { getAutoStart, getLastSession } = useStudy();

      expect(getAutoStart()).toBe(false); // "not-a-boolean" === "true" is false
      expect(getLastSession()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("q8m_study_last_session");
    });
  });

  describe("state management", () => {
    it("should initialize with idle loading state", () => {
      const { loadingState } = useStudy();
      expect(loadingState.value).toBe("idle");
    });

    it("should initialize with null error message", () => {
      const { errorMessage } = useStudy();
      expect(errorMessage.value).toBeNull();
    });

    it("should compute isAutoStartEnabled correctly", () => {
      const { isAutoStartEnabled } = useStudy();
      expect(isAutoStartEnabled.value).toBe(true);

      localStorageMock["q8m_study_autostart"] = "false";
      const { isAutoStartEnabled: disabled } = useStudy();
      expect(disabled.value).toBe(false);
    });

    it("should compute hasLastSession correctly", () => {
      const { hasLastSession } = useStudy();
      expect(hasLastSession.value).toBe(false);

      const session = {
        difficulty: "easy" as const,
        questionIndex: 5,
        timestamp: Date.now(),
      };
      localStorageMock["q8m_study_last_session"] = JSON.stringify(session);

      const { hasLastSession: hasSession } = useStudy();
      expect(hasSession.value).toBe(true);
    });
  });
});
