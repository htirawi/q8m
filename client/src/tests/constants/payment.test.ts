import { describe, it, expect } from "vitest";
import {
  PAYMENT_METHODS,
  getAvailablePaymentMethods,
  getDefaultPaymentMethod,
  YEARLY_DISCOUNT_PERCENTAGE,
  YEARLY_DISCOUNT_MULTIPLIER,
  type PaymentMethodConfig,
} from "@/constants/payment";

describe("Payment Constants", () => {
  describe("PAYMENT_METHODS array", () => {
    it("should contain expected payment methods", () => {
      expect(PAYMENT_METHODS).toHaveLength(3);

      // Check PayPal
      expect(PAYMENT_METHODS[0]).toEqual({
        id: "paypal",
        name: "PayPal",
        description: "Pay securely with PayPal",
        icon: "/icons/paypal.svg",
        availableForCurrencies: ["USD", "SAR", "JOD"],
        isDefault: true,
      });

      // Check APS
      expect(PAYMENT_METHODS[1]).toEqual({
        id: "aps",
        name: "Amazon Payment Services",
        description: "Pay with credit/debit card via APS",
        icon: "/icons/aps.svg",
        availableForCurrencies: ["SAR", "JOD"],
      });

      // Check HyperPay
      expect(PAYMENT_METHODS[2]).toEqual({
        id: "hyperpay",
        name: "HyperPay",
        description: "Pay with credit/debit card via HyperPay",
        icon: "/icons/hyperpay.svg",
        availableForCurrencies: ["SAR", "JOD"],
      });
    });

    it("should have all payment methods with required properties", () => {
      PAYMENT_METHODS.forEach((method) => {
        expect(method).toHaveProperty("id");
        expect(method).toHaveProperty("name");
        expect(method).toHaveProperty("description");
        expect(method).toHaveProperty("icon");
        expect(method).toHaveProperty("availableForCurrencies");

        expect(typeof method.id).toBe("string");
        expect(typeof method.name).toBe("string");
        expect(typeof method.description).toBe("string");
        expect(typeof method.icon).toBe("string");
        expect(Array.isArray(method.availableForCurrencies)).toBe(true);

        if (method.isDefault !== undefined) {
          expect(typeof method.isDefault).toBe("boolean");
        }
      });
    });

    it("should have unique payment method IDs", () => {
      const ids = PAYMENT_METHODS.map((method) => method.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique payment method names", () => {
      const names = PAYMENT_METHODS.map((method) => method.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have valid currency codes in availableForCurrencies", () => {
      PAYMENT_METHODS.forEach((method) => {
        method.availableForCurrencies.forEach((currency) => {
          expect(currency.length).toBe(3); // ISO currency codes are 3 characters
          expect(currency).toMatch(/^[A-Z]{3}$/); // Should be uppercase letters
        });
      });
    });

    it("should have valid icon paths", () => {
      PAYMENT_METHODS.forEach((method) => {
        expect(method.icon).toMatch(/^\/icons\/.+\.svg$/);
      });
    });

    it("should have only one default payment method", () => {
      const defaultMethods = PAYMENT_METHODS.filter((method) => method.isDefault);
      expect(defaultMethods.length).toBe(1);
      expect(defaultMethods[0].id).toBe("paypal");
    });
  });

  describe("getAvailablePaymentMethods", () => {
    it("should return PayPal for USD currency", () => {
      const result = getAvailablePaymentMethods("USD");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("paypal");
    });

    it("should return all methods for SAR currency", () => {
      const result = getAvailablePaymentMethods("SAR");
      expect(result).toHaveLength(3);
      expect(result.map((m) => m.id)).toEqual(["paypal", "aps", "hyperpay"]);
    });

    it("should return all methods for JOD currency", () => {
      const result = getAvailablePaymentMethods("JOD");
      expect(result).toHaveLength(3);
      expect(result.map((m) => m.id)).toEqual(["paypal", "aps", "hyperpay"]);
    });

    it("should return empty array for unsupported currency", () => {
      const result = getAvailablePaymentMethods("EUR");
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      const result = getAvailablePaymentMethods("");
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should be case sensitive", () => {
      const result = getAvailablePaymentMethods("usd"); // lowercase
      expect(result).toHaveLength(0);
    });

    it("should work for all supported currencies", () => {
      const supportedCurrencies = ["USD", "SAR", "JOD"];

      supportedCurrencies.forEach((currency) => {
        const result = getAvailablePaymentMethods(currency);
        expect(result.length).toBeGreaterThan(0);
        result.forEach((method) => {
          expect(method.availableForCurrencies).toContain(currency);
        });
      });
    });
  });

  describe("getDefaultPaymentMethod", () => {
    it("should return PayPal as default for USD", () => {
      const result = getDefaultPaymentMethod("USD");
      expect(result?.id).toBe("paypal");
      expect(result?.isDefault).toBe(true);
    });

    it("should return PayPal as default for SAR", () => {
      const result = getDefaultPaymentMethod("SAR");
      expect(result?.id).toBe("paypal");
      expect(result?.isDefault).toBe(true);
    });

    it("should return PayPal as default for JOD", () => {
      const result = getDefaultPaymentMethod("JOD");
      expect(result?.id).toBe("paypal");
      expect(result?.isDefault).toBe(true);
    });

    it("should return undefined for unsupported currency", () => {
      const result = getDefaultPaymentMethod("EUR");
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const result = getDefaultPaymentMethod("");
      expect(result).toBeUndefined();
    });

    it("should be case sensitive", () => {
      const result = getDefaultPaymentMethod("usd"); // lowercase
      expect(result).toBeUndefined();
    });

    it("should always return the default method when available", () => {
      const currencies = ["USD", "SAR", "JOD"];

      currencies.forEach((currency) => {
        const result = getDefaultPaymentMethod(currency);
        expect(result).toBeDefined();
        expect(result?.isDefault).toBe(true);
        expect(result?.id).toBe("paypal");
      });
    });
  });

  describe("discount constants", () => {
    it("should have correct yearly discount percentage", () => {
      expect(YEARLY_DISCOUNT_PERCENTAGE).toBe(17);
      expect(typeof YEARLY_DISCOUNT_PERCENTAGE).toBe("number");
    });

    it("should have correct yearly discount multiplier", () => {
      expect(YEARLY_DISCOUNT_MULTIPLIER).toBe(0.83);
      expect(typeof YEARLY_DISCOUNT_MULTIPLIER).toBe("number");
    });

    it("should calculate discount multiplier correctly", () => {
      const expectedMultiplier = 1 - YEARLY_DISCOUNT_PERCENTAGE / 100;
      expect(YEARLY_DISCOUNT_MULTIPLIER).toBe(expectedMultiplier);
      expect(YEARLY_DISCOUNT_MULTIPLIER).toBeCloseTo(0.83, 2);
    });

    it("should have reasonable discount values", () => {
      expect(YEARLY_DISCOUNT_PERCENTAGE).toBeGreaterThan(0);
      expect(YEARLY_DISCOUNT_PERCENTAGE).toBeLessThan(100);
      expect(YEARLY_DISCOUNT_MULTIPLIER).toBeGreaterThan(0);
      expect(YEARLY_DISCOUNT_MULTIPLIER).toBeLessThan(1);
    });
  });

  describe("type safety", () => {
    it("should have correct PaymentMethodConfig interface structure", () => {
      const sampleMethod: PaymentMethodConfig = {
        id: "test",
        name: "Test Method",
        description: "Test description",
        icon: "/icons/test.svg",
        availableForCurrencies: ["USD"],
        isDefault: false,
      };

      expect(typeof sampleMethod.id).toBe("string");
      expect(typeof sampleMethod.name).toBe("string");
      expect(typeof sampleMethod.description).toBe("string");
      expect(typeof sampleMethod.icon).toBe("string");
      expect(Array.isArray(sampleMethod.availableForCurrencies)).toBe(true);
      expect(typeof sampleMethod.isDefault).toBe("boolean");
    });

    it("should allow optional isDefault property", () => {
      const methodWithoutDefault: PaymentMethodConfig = {
        id: "test",
        name: "Test Method",
        description: "Test description",
        icon: "/icons/test.svg",
        availableForCurrencies: ["USD"],
      };

      expect(methodWithoutDefault.id).toBe("test");
      expect(methodWithoutDefault.name).toBe("Test Method");
      expect(methodWithoutDefault.isDefault).toBeUndefined();
    });
  });

  describe("data integrity", () => {
    it("should have consistent data structure across all methods", () => {
      PAYMENT_METHODS.forEach((method) => {
        expect(method).toMatchObject({
          id: expect.stringMatching(/^[a-z]+$/),
          name: expect.any(String),
          description: expect.any(String),
          icon: expect.stringMatching(/^\/icons\/.+\.svg$/),
          availableForCurrencies: expect.arrayContaining([expect.stringMatching(/^[A-Z]{3}$/)]),
        });
      });
    });

    it("should not have duplicate entries", () => {
      const ids = PAYMENT_METHODS.map((m) => m.id);
      const names = PAYMENT_METHODS.map((m) => m.name);

      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(names).size).toBe(names.length);
    });

    it("should have at least one currency per payment method", () => {
      PAYMENT_METHODS.forEach((method) => {
        expect(method.availableForCurrencies.length).toBeGreaterThan(0);
      });
    });

    it("should support all currencies that are available", () => {
      const allCurrencies = new Set<string>();
      PAYMENT_METHODS.forEach((method) => {
        method.availableForCurrencies.forEach((currency) => {
          allCurrencies.add(currency);
        });
      });

      // Verify that we can get payment methods for all supported currencies
      allCurrencies.forEach((currency) => {
        const methods = getAvailablePaymentMethods(currency);
        expect(methods.length).toBeGreaterThan(0);
      });
    });
  });
});
