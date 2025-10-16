import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  getCountryByCode,
  getCountriesByCurrency,
  type Country,
} from "@/constants/countries";

describe("Countries Constants", () => {
  describe("COUNTRIES array", () => {
    it("should contain expected countries", () => {
      expect(COUNTRIES).toHaveLength(13);

      // Check some specific countries
      expect(COUNTRIES).toContainEqual({ code: "US", name: "United States", currency: "USD" });
      expect(COUNTRIES).toContainEqual({ code: "JO", name: "Jordan", currency: "JOD" });
      expect(COUNTRIES).toContainEqual({ code: "SA", name: "Saudi Arabia", currency: "SAR" });
      expect(COUNTRIES).toContainEqual({
        code: "AE",
        name: "United Arab Emirates",
        currency: "AED",
      });
    });

    it("should have all countries with required properties", () => {
      COUNTRIES.forEach((country) => {
        expect(country).toHaveProperty("code");
        expect(country).toHaveProperty("name");
        expect(typeof country.code).toBe("string");
        expect(typeof country.name).toBe("string");
        expect(country.code.length).toBe(2); // ISO country codes are 2 characters
      });
    });

    it("should have unique country codes", () => {
      const codes = COUNTRIES.map((country) => country.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it("should have unique country names", () => {
      const names = COUNTRIES.map((country) => country.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should include all Middle Eastern countries", () => {
      const middleEasternCountries = [
        { code: "JO", name: "Jordan" },
        { code: "SA", name: "Saudi Arabia" },
        { code: "AE", name: "United Arab Emirates" },
        { code: "KW", name: "Kuwait" },
        { code: "QA", name: "Qatar" },
        { code: "BH", name: "Bahrain" },
        { code: "OM", name: "Oman" },
        { code: "EG", name: "Egypt" },
        { code: "LB", name: "Lebanon" },
        { code: "SY", name: "Syria" },
        { code: "IQ", name: "Iraq" },
        { code: "YE", name: "Yemen" },
      ];

      middleEasternCountries.forEach((expectedCountry) => {
        expect(COUNTRIES).toContainEqual(
          expect.objectContaining({
            code: expectedCountry.code,
            name: expectedCountry.name,
          })
        );
      });
    });

    it("should include United States", () => {
      expect(COUNTRIES).toContainEqual(
        expect.objectContaining({
          code: "US",
          name: "United States",
        })
      );
    });
  });

  describe("getCountryByCode", () => {
    it("should return correct country for valid code", () => {
      const result = getCountryByCode("US");
      expect(result).toEqual({ code: "US", name: "United States", currency: "USD" });
    });

    it("should return correct country for Jordan", () => {
      const result = getCountryByCode("JO");
      expect(result).toEqual({ code: "JO", name: "Jordan", currency: "JOD" });
    });

    it("should return correct country for Saudi Arabia", () => {
      const result = getCountryByCode("SA");
      expect(result).toEqual({ code: "SA", name: "Saudi Arabia", currency: "SAR" });
    });

    it("should return undefined for invalid code", () => {
      const result = getCountryByCode("XX");
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const result = getCountryByCode("");
      expect(result).toBeUndefined();
    });

    it("should be case sensitive", () => {
      const result = getCountryByCode("us"); // lowercase
      expect(result).toBeUndefined();
    });

    it("should work for all valid country codes", () => {
      COUNTRIES.forEach((country) => {
        const result = getCountryByCode(country.code);
        expect(result).toEqual(country);
      });
    });
  });

  describe("getCountriesByCurrency", () => {
    it("should return countries with USD currency", () => {
      const result = getCountriesByCurrency("USD");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ code: "US", name: "United States", currency: "USD" });
    });

    it("should return countries with JOD currency", () => {
      const result = getCountriesByCurrency("JOD");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ code: "JO", name: "Jordan", currency: "JOD" });
    });

    it("should return empty array for non-existent currency", () => {
      const result = getCountriesByCurrency("EUR");
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      const result = getCountriesByCurrency("");
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should be case sensitive", () => {
      const result = getCountriesByCurrency("usd"); // lowercase
      expect(result).toHaveLength(0);
    });

    it("should work for all currencies in the list", () => {
      const currencies = [
        "USD",
        "JOD",
        "SAR",
        "AED",
        "KWD",
        "QAR",
        "BHD",
        "OMR",
        "EGP",
        "LBP",
        "SYP",
        "IQD",
        "YER",
      ];

      currencies.forEach((currency) => {
        const result = getCountriesByCurrency(currency);
        expect(result.length).toBeGreaterThan(0);
        result.forEach((country) => {
          expect(country.currency).toBe(currency);
        });
      });
    });

    it("should return all countries with their respective currencies", () => {
      // Test that each country's currency matches when searched
      COUNTRIES.forEach((country) => {
        if (country.currency) {
          const result = getCountriesByCurrency(country.currency);
          expect(result).toContainEqual(country);
        }
      });
    });
  });

  describe("type safety", () => {
    it("should have correct Country interface structure", () => {
      const sampleCountry: Country = { code: "US", name: "United States", currency: "USD" };

      expect(typeof sampleCountry.code).toBe("string");
      expect(typeof sampleCountry.name).toBe("string");
      expect(typeof sampleCountry.currency).toBe("string");
    });

    it("should allow optional currency property", () => {
      const countryWithoutCurrency: Country = { code: "US", name: "United States" };
      expect(countryWithoutCurrency.code).toBe("US");
      expect(countryWithoutCurrency.name).toBe("United States");
      expect(countryWithoutCurrency.currency).toBeUndefined();
    });
  });

  describe("data integrity", () => {
    it("should have all countries with valid currency codes", () => {
      COUNTRIES.forEach((country) => {
        if (country.currency) {
          expect(country.currency.length).toBe(3); // ISO currency codes are 3 characters
          expect(country.currency).toMatch(/^[A-Z]{3}$/); // Should be uppercase letters
        }
      });
    });

    it("should have consistent data structure", () => {
      COUNTRIES.forEach((country) => {
        expect(country).toMatchObject({
          code: expect.stringMatching(/^[A-Z]{2}$/),
          name: expect.any(String),
        });

        if (country.currency) {
          expect(country.currency).toMatch(/^[A-Z]{3}$/);
        }
      });
    });

    it("should not have duplicate entries", () => {
      const codes = COUNTRIES.map((c) => c.code);
      const names = COUNTRIES.map((c) => c.name);

      expect(new Set(codes).size).toBe(codes.length);
      expect(new Set(names).size).toBe(names.length);
    });
  });
});
