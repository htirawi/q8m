import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { useCheckoutRedirect } from "@/composables/useCheckoutRedirect";
import { defineComponent } from "vue";

// Mock component to test the composable
const TestComponent = defineComponent({
  setup() {
    const checkoutRedirect = useCheckoutRedirect();
    return { checkoutRedirect };
  },
  template: "<div></div>",
});

describe("useCheckoutRedirect", () => {
  let router: ReturnType<typeof createRouter>;
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    // Setup sessionStorage mock
    sessionStorageMock = {};
    global.sessionStorage = {
      getItem: vi.fn((key: string) => sessionStorageMock[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        sessionStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete sessionStorageMock[key];
      }),
      clear: vi.fn(() => {
        sessionStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    // Setup router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/:locale/login",
          name: "login",
          component: { template: "<div>Login</div>" },
        },
        {
          path: "/:locale/checkout",
          name: "checkout",
          component: { template: "<div>Checkout</div>" },
        },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sanitizes plan parameter correctly", async () => {
    await router.push("/en/login?plan=intermediate&billing=monthly");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { plan } = wrapper.vm.checkoutRedirect;
    expect(plan.value).toBe("intermediate");

    wrapper.unmount();
  });

  it("falls back to default plan when invalid", async () => {
    await router.push("/en/login?plan=invalid&billing=monthly");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { plan } = wrapper.vm.checkoutRedirect;
    expect(plan.value).toBe("intermediate"); // default

    wrapper.unmount();
  });

  it("sanitizes billing parameter correctly", async () => {
    await router.push("/en/login?plan=intermediate&billing=yearly");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { billing } = wrapper.vm.checkoutRedirect;
    expect(billing.value).toBe("yearly");

    wrapper.unmount();
  });

  it("falls back to default billing when invalid", async () => {
    await router.push("/en/login?plan=intermediate&billing=invalid");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { billing } = wrapper.vm.checkoutRedirect;
    expect(billing.value).toBe("monthly"); // default

    wrapper.unmount();
  });

  it("sanitizes redirect parameter correctly", async () => {
    await router.push("/en/login?plan=intermediate&billing=monthly&redirect=/checkout");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { redirect } = wrapper.vm.checkoutRedirect;
    expect(redirect.value).toBe("/checkout");

    wrapper.unmount();
  });

  it("rejects redirect with protocol", async () => {
    await router.push("/en/login?plan=intermediate&billing=monthly&redirect=https://evil.com");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { redirect } = wrapper.vm.checkoutRedirect;
    expect(redirect.value).toBe("/checkout"); // default

    wrapper.unmount();
  });

  it("rejects redirect without leading slash", async () => {
    await router.push("/en/login?plan=intermediate&billing=monthly&redirect=evil");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { redirect } = wrapper.vm.checkoutRedirect;
    expect(redirect.value).toBe("/checkout"); // default

    wrapper.unmount();
  });

  it("constructs checkout URL with locale and query params", async () => {
    await router.push("/en/login?plan=advanced&billing=yearly");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { checkoutUrl } = wrapper.vm.checkoutRedirect;
    expect(checkoutUrl.value).toBe("/en/checkout?plan=advanced&billing=yearly");

    wrapper.unmount();
  });

  it("preserves locale in checkout URL", async () => {
    await router.push("/ar/login?plan=intermediate&billing=monthly");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { checkoutUrl } = wrapper.vm.checkoutRedirect;
    expect(checkoutUrl.value).toBe("/ar/checkout?plan=intermediate&billing=monthly");

    wrapper.unmount();
  });

  it("saves parameters to sessionStorage", async () => {
    await router.push("/en/login?plan=advanced&billing=yearly");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { saveParams } = wrapper.vm.checkoutRedirect;
    saveParams();

    expect(sessionStorage.setItem).toHaveBeenCalledWith("checkout_plan", "advanced");
    expect(sessionStorage.setItem).toHaveBeenCalledWith("checkout_billing", "yearly");
    expect(sessionStorage.setItem).toHaveBeenCalledWith("checkout_redirect", "/checkout");

    wrapper.unmount();
  });

  it("loads parameters from sessionStorage when query params are missing", async () => {
    // Pre-populate sessionStorage
    sessionStorageMock.checkout_plan = "basic";
    sessionStorageMock.checkout_billing = "yearly";
    sessionStorageMock.checkout_redirect = "/custom";

    await router.push("/en/login");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { plan, billing, redirect } = wrapper.vm.checkoutRedirect;
    expect(plan.value).toBe("basic");
    expect(billing.value).toBe("yearly");
    expect(redirect.value).toBe("/custom");

    wrapper.unmount();
  });

  it("clears parameters from sessionStorage", async () => {
    // Pre-populate sessionStorage
    sessionStorageMock.checkout_plan = "intermediate";
    sessionStorageMock.checkout_billing = "monthly";
    sessionStorageMock.checkout_redirect = "/checkout";

    await router.push("/en/login");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { clearParams } = wrapper.vm.checkoutRedirect;
    clearParams();

    expect(sessionStorage.removeItem).toHaveBeenCalledWith("checkout_plan");
    expect(sessionStorage.removeItem).toHaveBeenCalledWith("checkout_billing");
    expect(sessionStorage.removeItem).toHaveBeenCalledWith("checkout_redirect");

    wrapper.unmount();
  });

  it("uses defaults when no query params and no sessionStorage", async () => {
    await router.push("/en/login");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { plan, billing, redirect, checkoutUrl } = wrapper.vm.checkoutRedirect;
    expect(plan.value).toBe("intermediate");
    expect(billing.value).toBe("monthly");
    expect(redirect.value).toBe("/checkout");
    expect(checkoutUrl.value).toBe("/en/checkout?plan=intermediate&billing=monthly");

    wrapper.unmount();
  });

  it("auto-saves to session when query params exist", async () => {
    await router.push("/en/login?plan=advanced&billing=yearly");
    await router.isReady();

    mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    // Auto-save should have been triggered
    expect(sessionStorage.setItem).toHaveBeenCalledWith("checkout_plan", "advanced");
    expect(sessionStorage.setItem).toHaveBeenCalledWith("checkout_billing", "yearly");
  });

  it("handles case-insensitive plan values", async () => {
    await router.push("/en/login?plan=ADVANCED&billing=monthly");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { plan } = wrapper.vm.checkoutRedirect;
    expect(plan.value).toBe("advanced");

    wrapper.unmount();
  });

  it("handles case-insensitive billing values", async () => {
    await router.push("/en/login?plan=intermediate&billing=YEARLY");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { billing } = wrapper.vm.checkoutRedirect;
    expect(billing.value).toBe("yearly");

    wrapper.unmount();
  });

  it("trims whitespace from parameters", async () => {
    await router.push("/en/login?plan=%20intermediate%20&billing=%20monthly%20");
    await router.isReady();

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { plan, billing } = wrapper.vm.checkoutRedirect;
    expect(plan.value).toBe("intermediate");
    expect(billing.value).toBe("monthly");

    wrapper.unmount();
  });

  it("handles all valid plan values", async () => {
    const validPlans = ["basic", "intermediate", "advanced"];

    for (const plan of validPlans) {
      await router.push(`/en/login?plan=${plan}&billing=monthly`);
      await router.isReady();

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router],
        },
      });

      const { plan: resultPlan } = wrapper.vm.checkoutRedirect;
      expect(resultPlan.value).toBe(plan);

      wrapper.unmount();
    }
  });

  it("handles all valid billing values", async () => {
    const validBilling = ["monthly", "yearly"];

    for (const billing of validBilling) {
      await router.push(`/en/login?plan=intermediate&billing=${billing}`);
      await router.isReady();

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router],
        },
      });

      const { billing: resultBilling } = wrapper.vm.checkoutRedirect;
      expect(resultBilling.value).toBe(billing);

      wrapper.unmount();
    }
  });

  it("handles graceful failure when sessionStorage is unavailable", async () => {
    // Simulate sessionStorage being unavailable
    global.sessionStorage = {
      getItem: vi.fn(() => {
        throw new Error("sessionStorage unavailable");
      }),
      setItem: vi.fn(() => {
        throw new Error("sessionStorage unavailable");
      }),
      removeItem: vi.fn(() => {
        throw new Error("sessionStorage unavailable");
      }),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as Storage;

    await router.push("/en/login?plan=intermediate&billing=monthly");
    await router.isReady();

    // Should not throw
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });

    const { plan, billing, saveParams, clearParams } = wrapper.vm.checkoutRedirect;
    expect(plan.value).toBe("intermediate");
    expect(billing.value).toBe("monthly");

    // These should not throw
    expect(() => saveParams()).not.toThrow();
    expect(() => clearParams()).not.toThrow();

    wrapper.unmount();
  });
});

