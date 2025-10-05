/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { nextTick } from "vue";
import CheckoutForm from "@/components/payment/CheckoutForm.vue";
import type { PlanPricing } from "@/stores/payment";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("CheckoutForm Integration Tests", () => {
  let wrapper: any;
  let mockPlan: PlanPricing;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockPlan = {
      planId: "INTERMEDIATE",
      name: "Intermediate Plan",
      description: "Perfect for growing developers",
      features: ["Feature 1", "Feature 2"],
      usdPrice: 29.99,
      pricing: {
        USD: {
          currency: "USD",
          amount: 29.99,
          formatted: "$29.99",
          isEstimated: false,
        },
        JOD: {
          currency: "JOD",
          amount: 21.29,
          formatted: "21.29 JOD",
          isEstimated: true,
        },
      },
      popular: true,
    };

    wrapper = mount(CheckoutForm, {
      props: {
        selectedPlan: mockPlan,
      },
      global: {
        stubs: {
          LoadingState: true,
        },
      },
    });
  });

  describe("Component Rendering", () => {
    it("should render the checkout form", () => {
      expect(wrapper.find(".checkout-form").exists()).toBe(true);
      expect(wrapper.find("h2").text()).toBe("checkout.title");
    });

    it("should display plan information", () => {
      expect(wrapper.text()).toContain("Intermediate Plan");
      expect(wrapper.text()).toContain("Perfect for growing developers");
    });

    it("should show pricing information", () => {
      expect(wrapper.text()).toContain("$29.99");
    });
  });

  describe("Form Validation", () => {
    it("should validate required fields", async () => {
      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      // Check for validation errors
      expect(wrapper.text()).toContain("checkout.errors.nameRequired");
      expect(wrapper.text()).toContain("checkout.errors.emailRequired");
    });

    it("should validate email format", async () => {
      // Fill in valid data except email
      await wrapper.find('input[name="name"]').setValue("John Doe");
      await wrapper.find('input[name="email"]').setValue("invalid-email");
      await wrapper.find('input[name="street"]').setValue("123 Main St");
      await wrapper.find('input[name="city"]').setValue("New York");
      await wrapper.find('input[name="state"]').setValue("NY");
      await wrapper.find('input[name="postalCode"]').setValue("10001");
      await wrapper.find('select[name="country"]').setValue("US");

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      expect(wrapper.text()).toContain("checkout.errors.emailInvalid");
    });

    it("should pass validation with valid data", async () => {
      // Fill in all required fields
      await wrapper.find('input[name="name"]').setValue("John Doe");
      await wrapper.find('input[name="email"]').setValue("john@example.com");
      await wrapper.find('input[name="street"]').setValue("123 Main St");
      await wrapper.find('input[name="city"]').setValue("New York");
      await wrapper.find('input[name="state"]').setValue("NY");
      await wrapper.find('input[name="postalCode"]').setValue("10001");
      await wrapper.find('select[name="country"]').setValue("US");

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      // Should not show validation errors
      expect(wrapper.text()).not.toContain("checkout.errors.nameRequired");
      expect(wrapper.text()).not.toContain("checkout.errors.emailRequired");
    });
  });

  describe("Payment Processing", () => {
    beforeEach(async () => {
      // Fill in valid form data
      await wrapper.find('input[name="name"]').setValue("John Doe");
      await wrapper.find('input[name="email"]').setValue("john@example.com");
      await wrapper.find('input[name="street"]').setValue("123 Main St");
      await wrapper.find('input[name="city"]').setValue("New York");
      await wrapper.find('input[name="state"]').setValue("NY");
      await wrapper.find('input[name="postalCode"]').setValue("10001");
      await wrapper.find('select[name="country"]').setValue("US");
    });

    it("should handle successful PayPal payment", async () => {
      const mockResponse = {
        success: true,
        paymentGateway: "paypal",
        checkoutUrl: "https://paypal.com/checkout/123",
        paymentId: "pay_123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Mock window.location.href
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: "" };

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      expect(mockFetch).toHaveBeenCalledWith("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
        body: JSON.stringify({
          planType: "INTERMEDIATE",
          currency: "USD",
          billingCycle: "monthly",
          billingAddress: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "US",
          },
        }),
      });

      // Restore window.location
      window.location = originalLocation;
    });

    it("should handle successful APS payment", async () => {
      const mockResponse = {
        success: true,
        paymentGateway: "aps",
        checkoutUrl: "https://aps.com/checkout/123",
        paymentId: "aps_123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Mock window.location.href
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: "" };

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      expect(mockFetch).toHaveBeenCalled();
      expect(window.location.href).toBe("https://aps.com/checkout/123");

      // Restore window.location
      window.location = originalLocation;
    });

    it("should handle successful HyperPay payment", async () => {
      const mockResponse = {
        success: true,
        paymentGateway: "hyperpay",
        checkoutUrl: "https://hyperpay.com/checkout/123",
        paymentId: "hp_123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Mock window.location.href
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: "" };

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      expect(mockFetch).toHaveBeenCalled();
      expect(window.location.href).toBe("https://hyperpay.com/checkout/123");

      // Restore window.location
      window.location = originalLocation;
    });

    it("should handle payment creation errors", async () => {
      const mockError = {
        error: "Payment failed",
        code: "PAYMENT_DECLINED",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockError),
      });

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      expect(wrapper.text()).toContain("errors.payment.declined");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      expect(wrapper.text()).toContain("Network error");
    });

    it("should show loading state during payment processing", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const submitButton = wrapper.find('button[type="submit"]');
      await submitButton.trigger("click");

      await nextTick();

      expect(wrapper.findComponent({ name: "LoadingState" }).exists()).toBe(true);
    });
  });

  describe("Billing Cycle Selection", () => {
    it("should toggle billing cycle between monthly and yearly", async () => {
      const monthlyButton = wrapper.find('input[value="monthly"]');
      const yearlyButton = wrapper.find('input[value="yearly"]');

      expect(monthlyButton.element.checked).toBe(true);
      expect(yearlyButton.element.checked).toBe(false);

      await yearlyButton.trigger("change");

      expect(monthlyButton.element.checked).toBe(false);
      expect(yearlyButton.element.checked).toBe(true);
    });
  });

  describe("Currency Handling", () => {
    it("should display different currencies based on selection", async () => {
      // Change currency to JOD
      wrapper.vm.paymentStore.setCurrency("JOD");
      await nextTick();

      expect(wrapper.text()).toContain("21.29 JOD");
      expect(wrapper.text()).toContain("checkout.estimatedPrice");
    });
  });

  describe("User Information Pre-filling", () => {
    it("should pre-fill user information when available", async () => {
      // Mock authenticated user
      wrapper.vm.authStore.user = {
        id: "1",
        email: "john@example.com",
        name: "John Doe",
      };

      await wrapper.vm.$nextTick();

      expect(wrapper.find('input[name="name"]').element.value).toBe("John Doe");
      expect(wrapper.find('input[name="email"]').element.value).toBe("john@example.com");
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels", () => {
      const nameInput = wrapper.find('input[name="name"]');
      const emailInput = wrapper.find('input[name="email"]');

      expect(nameInput.attributes("aria-label")).toBeDefined();
      expect(emailInput.attributes("aria-label")).toBeDefined();
    });

    it("should have proper error associations", async () => {
      await wrapper.find('button[type="submit"]').trigger("click");
      await nextTick();

      const errorElements = wrapper.findAll(".form-error");
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  describe("RTL Support", () => {
    it("should handle RTL layout", async () => {
      // Simulate RTL by changing document direction
      document.dir = "rtl";

      await wrapper.vm.$nextTick();

      // Check if RTL-specific classes are applied
      expect(wrapper.find(".checkout-form").classes()).toContain("rtl");
    });
  });
});
