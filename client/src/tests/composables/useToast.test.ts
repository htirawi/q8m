/* eslint-disable @typescript-eslint/no-unused-vars */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useToast } from "@/composables/useToast";

describe("useToast Integration Tests", () => {
  let toast: ReturnType<typeof useToast>;

  beforeEach(() => {
    setActivePinia(createPinia());
    toast = useToast();
    vi.clearAllMocks();
  });

  describe("addToast", () => {
    it("should add a success toast", () => {
      const id = toast.addToast("success", "Success Title", "Success message");

      expect(id).toBeTypeOf("string");
      expect(toast.toasts.value).toHaveLength(1);

      const addedToast = toast.toasts.value[0];
      expect(addedToast.type).toBe("success");
      expect(addedToast.title).toBe("Success Title");
      expect(addedToast.message).toBe("Success message");
      expect(addedToast.duration).toBe(5000);
      expect(addedToast.persistent).toBe(false);
    });

    it("should add an error toast with custom duration", () => {
      const id = toast.addToast("error", "Error Title", "Error message", {
        duration: 10000,
      });

      const addedToast = toast.toasts.value[0];
      expect(addedToast.type).toBe("error");
      expect(addedToast.duration).toBe(10000);
    });

    it("should add a persistent toast", () => {
      const id = toast.addToast("warning", "Warning Title", "Warning message", {
        persistent: true,
      });

      const addedToast = toast.toasts.value[0];
      expect(addedToast.persistent).toBe(true);
      expect(addedToast.duration).toBeUndefined();
    });

    it("should add a toast with action", () => {
      const actionHandler = vi.fn();
      const id = toast.addToast("info", "Info Title", "Info message", {
        action: {
          label: "Retry",
          handler: actionHandler,
        },
      });

      const addedToast = toast.toasts.value[0];
      expect(addedToast.action).toEqual({
        label: "Retry",
        handler: actionHandler,
      });
    });
  });

  describe("removeToast", () => {
    it("should remove a toast by id", () => {
      const id1 = toast.addToast("success", "Title 1", "Message 1");
      const id2 = toast.addToast("error", "Title 2", "Message 2");

      expect(toast.toasts.value).toHaveLength(2);

      toast.removeToast(id1);

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].id).toBe(id2);
    });

    it("should handle removing non-existent toast", () => {
      toast.addToast("success", "Title", "Message");
      expect(toast.toasts.value).toHaveLength(1);

      toast.removeToast("non-existent-id");

      expect(toast.toasts.value).toHaveLength(1);
    });
  });

  describe("clearAllToasts", () => {
    it("should remove all toasts", () => {
      toast.addToast("success", "Title 1", "Message 1");
      toast.addToast("error", "Title 2", "Message 2");
      toast.addToast("warning", "Title 3", "Message 3");

      expect(toast.toasts.value).toHaveLength(3);

      toast.clearAllToasts();

      expect(toast.toasts.value).toHaveLength(0);
    });
  });

  describe("convenience methods", () => {
    it("should create success toast", () => {
      const id = toast.success("Success Title", "Success message");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("success");
      expect(toast.toasts.value[0].title).toBe("Success Title");
      expect(toast.toasts.value[0].message).toBe("Success message");
    });

    it("should create error toast", () => {
      const id = toast.error("Error Title", "Error message");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("error");
      expect(toast.toasts.value[0].title).toBe("Error Title");
      expect(toast.toasts.value[0].message).toBe("Error message");
      expect(toast.toasts.value[0].duration).toBe(8000); // Error toasts last longer
    });

    it("should create warning toast", () => {
      const id = toast.warning("Warning Title", "Warning message");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("warning");
      expect(toast.toasts.value[0].title).toBe("Warning Title");
      expect(toast.toasts.value[0].message).toBe("Warning message");
    });

    it("should create info toast", () => {
      const id = toast.info("Info Title", "Info message");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("info");
      expect(toast.toasts.value[0].title).toBe("Info Title");
      expect(toast.toasts.value[0].message).toBe("Info message");
    });
  });

  describe("predefined toasts", () => {
    it("should create payment success toast", () => {
      const id = toast.paymentSuccess("29.99", "USD");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("success");
      expect(toast.toasts.value[0].title).toBe("toasts.payment.success.title");
      expect(toast.toasts.value[0].message).toBe("toasts.payment.success.message");
    });

    it("should create payment error toast", () => {
      const id = toast.paymentError("Payment declined");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("error");
      expect(toast.toasts.value[0].title).toBe("toasts.payment.error.title");
      expect(toast.toasts.value[0].message).toBe("Payment declined");
    });

    it("should create subscription updated toast", () => {
      const id = toast.subscriptionUpdated("INTERMEDIATE");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("success");
      expect(toast.toasts.value[0].title).toBe("toasts.subscription.updated.title");
      expect(toast.toasts.value[0].message).toBe("toasts.subscription.updated.message");
    });

    it("should create subscription cancelled toast", () => {
      const id = toast.subscriptionCancelled();

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("warning");
      expect(toast.toasts.value[0].title).toBe("toasts.subscription.cancelled.title");
      expect(toast.toasts.value[0].message).toBe("toasts.subscription.cancelled.message");
    });

    it("should create auth success toast", () => {
      const id = toast.authSuccess("logged in");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("success");
      expect(toast.toasts.value[0].title).toBe("toasts.auth.success.title");
      expect(toast.toasts.value[0].message).toBe("toasts.auth.success.message");
    });

    it("should create auth error toast", () => {
      const id = toast.authError("Invalid credentials");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("error");
      expect(toast.toasts.value[0].title).toBe("toasts.auth.error.title");
      expect(toast.toasts.value[0].message).toBe("Invalid credentials");
    });

    it("should create network error toast", () => {
      const id = toast.networkError();

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("error");
      expect(toast.toasts.value[0].title).toBe("toasts.network.error.title");
      expect(toast.toasts.value[0].message).toBe("toasts.network.error.message");
    });

    it("should create currency updated toast", () => {
      const id = toast.currencyUpdated("JOD");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("info");
      expect(toast.toasts.value[0].title).toBe("toasts.currency.updated.title");
      expect(toast.toasts.value[0].message).toBe("toasts.currency.updated.message");
    });

    it("should create entitlement upgraded toast", () => {
      const id = toast.entitlementUpgraded("INTERMEDIATE");

      expect(toast.toasts.value).toHaveLength(1);
      expect(toast.toasts.value[0].type).toBe("success");
      expect(toast.toasts.value[0].title).toBe("toasts.entitlement.upgraded.title");
      expect(toast.toasts.value[0].message).toBe("toasts.entitlement.upgraded.message");
    });
  });

  describe("auto-dismiss behavior", () => {
    it("should auto-dismiss non-persistent toasts", () => {
      vi.useFakeTimers();

      toast.addToast("success", "Title", "Message", { duration: 1000 });
      expect(toast.toasts.value).toHaveLength(1);

      vi.advanceTimersByTime(1000);
      expect(toast.toasts.value).toHaveLength(0);

      vi.useRealTimers();
    });

    it("should not auto-dismiss persistent toasts", () => {
      vi.useFakeTimers();

      toast.addToast("success", "Title", "Message", { persistent: true });
      expect(toast.toasts.value).toHaveLength(1);

      vi.advanceTimersByTime(10000);
      expect(toast.toasts.value).toHaveLength(1);

      vi.useRealTimers();
    });
  });

  describe("toast properties", () => {
    it("should generate unique IDs", () => {
      const id1 = toast.addToast("success", "Title 1", "Message 1");
      const id2 = toast.addToast("success", "Title 2", "Message 2");

      expect(id1).not.toBe(id2);
      expect(toast.toasts.value[0].id).toBe(id1);
      expect(toast.toasts.value[1].id).toBe(id2);
    });

    it("should set correct default duration based on type", () => {
      toast.addToast("success", "Success", "Message");
      toast.addToast("error", "Error", "Message");
      toast.addToast("warning", "Warning", "Message");
      toast.addToast("info", "Info", "Message");

      expect(toast.toasts.value[0].duration).toBe(5000); // success
      expect(toast.toasts.value[1].duration).toBe(8000); // error
      expect(toast.toasts.value[2].duration).toBe(5000); // warning
      expect(toast.toasts.value[3].duration).toBe(5000); // info
    });
  });
});
