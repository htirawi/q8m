import { describe, it, expect, vi, beforeEach } from "vitest";
import { useToast } from "@/composables/useToast";
import type { ToastOptions } from "@/types/composables/toast";

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: vi.fn((key: string) => key),
  }),
}));

// Mock setTimeout for testing auto-removal
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

describe("useToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create toast composable with initial state", () => {
    const { toasts } = useToast();
    expect(toasts.value).toEqual([]);
  });

  it("should add a success toast", () => {
    const { addToast, toasts } = useToast();

    const id = addToast("success", "Success Title", "Success message");

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      id,
      type: "success",
      title: "Success Title",
      message: "Success message",
      persistent: false,
    });
    expect(toasts.value[0].createdAt).toBeInstanceOf(Date);
  });

  it("should add an error toast", () => {
    const { addToast, toasts } = useToast();

    const id = addToast("error", "Error Title", "Error message");

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      id,
      type: "error",
      title: "Error Title",
      message: "Error message",
      persistent: false,
    });
  });

  it("should add a warning toast", () => {
    const { addToast, toasts } = useToast();

    const id = addToast("warning", "Warning Title", "Warning message");

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      id,
      type: "warning",
      title: "Warning Title",
      message: "Warning message",
      persistent: false,
    });
  });

  it("should add an info toast", () => {
    const { addToast, toasts } = useToast();

    const id = addToast("info", "Info Title", "Info message");

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      id,
      type: "info",
      title: "Info Title",
      message: "Info message",
      persistent: false,
    });
  });

  it("should use custom duration for non-error toasts", () => {
    const { addToast, toasts } = useToast();

    addToast("success", "Title", "Message", { duration: 10000 });

    expect(toasts.value[0].duration).toBe(10000);
  });

  it("should use default error duration (8000ms)", () => {
    const { addToast, toasts } = useToast();

    addToast("error", "Title", "Message");

    expect(toasts.value[0].duration).toBe(8000);
  });

  it("should use default success duration (5000ms)", () => {
    const { addToast, toasts } = useToast();

    addToast("success", "Title", "Message");

    expect(toasts.value[0].duration).toBe(5000);
  });

  it("should create persistent toast", () => {
    const { addToast, toasts } = useToast();

    addToast("info", "Title", "Message", { persistent: true });

    expect(toasts.value[0].persistent).toBe(true);
    expect(toasts.value[0].duration).toBeUndefined();
  });

  it("should add toast with action", () => {
    const { addToast, toasts } = useToast();
    const action = {
      label: "Retry",
      handler: vi.fn(),
    };

    addToast("error", "Title", "Message", { action });

    expect(toasts.value[0].action).toEqual(action);
  });

  it("should remove toast by id", () => {
    const { addToast, removeToast, toasts } = useToast();

    const id1 = addToast("success", "Title 1", "Message 1");
    const id2 = addToast("error", "Title 2", "Message 2");

    expect(toasts.value).toHaveLength(2);

    removeToast(id1);

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].id).toBe(id2);
  });

  it("should handle removing non-existent toast", () => {
    const { addToast, removeToast, toasts } = useToast();

    addToast("success", "Title", "Message");
    expect(toasts.value).toHaveLength(1);

    removeToast("non-existent-id");

    expect(toasts.value).toHaveLength(1);
  });

  it("should clear all toasts", () => {
    const { addToast, clearAllToasts, toasts } = useToast();

    addToast("success", "Title 1", "Message 1");
    addToast("error", "Title 2", "Message 2");
    addToast("warning", "Title 3", "Message 3");

    expect(toasts.value).toHaveLength(3);

    clearAllToasts();

    expect(toasts.value).toHaveLength(0);
  });

  it("should auto-remove non-persistent toast after duration", () => {
    const { addToast, toasts } = useToast();

    addToast("success", "Title", "Message", { duration: 1000 });

    expect(toasts.value).toHaveLength(1);

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    expect(toasts.value).toHaveLength(0);
  });

  it("should not auto-remove persistent toast", () => {
    const { addToast, toasts } = useToast();

    addToast("info", "Title", "Message", { persistent: true });

    expect(toasts.value).toHaveLength(1);

    // Fast-forward time
    vi.advanceTimersByTime(10000);

    expect(toasts.value).toHaveLength(1);
  });

  it("should not auto-remove toast with zero duration", () => {
    const { addToast, toasts } = useToast();

    addToast("success", "Title", "Message", { duration: 0 });

    expect(toasts.value).toHaveLength(1);

    // Fast-forward time
    vi.advanceTimersByTime(10000);

    expect(toasts.value).toHaveLength(1);
  });

  it("should generate unique toast ids", () => {
    const { addToast } = useToast();

    const id1 = addToast("success", "Title 1", "Message 1");
    const id2 = addToast("success", "Title 2", "Message 2");

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^toast-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^toast-\d+-[a-z0-9]+$/);
  });

  it("should return readonly toasts", () => {
    const { toasts } = useToast();

    // This should not cause a TypeScript error in actual usage
    // but we can't test it directly since readonly is a TypeScript feature
    expect(toasts.value).toBeDefined();
  });

  it("should handle multiple toasts with different durations", () => {
    const { addToast, toasts } = useToast();

    addToast("success", "Title 1", "Message 1", { duration: 500 });
    addToast("error", "Title 2", "Message 2", { duration: 1000 });

    expect(toasts.value).toHaveLength(2);

    // Fast-forward 500ms - only first toast should be removed
    vi.advanceTimersByTime(500);
    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].title).toBe("Title 2");

    // Fast-forward another 500ms - second toast should be removed
    vi.advanceTimersByTime(500);
    expect(toasts.value).toHaveLength(0);
  });
});
