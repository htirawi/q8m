import { FxRate } from "../models/FxRate.js";
import { env } from "../config/env.js";

export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  rateSource: "cache" | "api" | "fallback";
  rateAge: number; // in hours
  timestamp: Date;
}

export interface PricingInfo {
  currency: string;
  amount: number;
  formatted: string;
  exchangeRate?: number;
  isEstimated: boolean;
  rateUsed?: number;
  settlementCurrency?: string;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private fallbackRates: Record<string, number> = {
    JOD: 0.709, // 1 USD = 0.709 JOD (approximate)
    SAR: 3.75, // 1 USD = 3.75 SAR (approximate)
  };

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  /**
   * Convert amount from USD to target currency
   */
  async convertFromUSD(
    amount: number,
    targetCurrency: "JOD" | "SAR"
  ): Promise<CurrencyConversionResult> {
    const rate = await this.getExchangeRate("USD", targetCurrency);

    return {
      originalAmount: amount,
      originalCurrency: "USD",
      convertedAmount: Math.round(amount * rate.rate * 100) / 100, // Round to 2 decimal places
      convertedCurrency: targetCurrency,
      exchangeRate: rate.rate,
      rateSource: rate.source as "cache" | "api" | "fallback",
      rateAge: rate.ageInHours ?? 0,
      timestamp: new Date(),
    };
  }

  /**
   * Convert amount from target currency to USD
   */
  async convertToUSD(
    amount: number,
    sourceCurrency: "JOD" | "SAR"
  ): Promise<CurrencyConversionResult> {
    const rate = await this.getExchangeRate("USD", sourceCurrency);

    return {
      originalAmount: amount,
      originalCurrency: sourceCurrency,
      convertedAmount: Math.round((amount / rate.rate) * 100) / 100,
      convertedCurrency: "USD",
      exchangeRate: rate.rate,
      rateSource: rate.source as "cache" | "api" | "fallback",
      rateAge: rate.ageInHours ?? 0,
      timestamp: new Date(),
    };
  }

  /**
   * Get exchange rate for currency pair
   */
  async getExchangeRate(
    baseCurrency: "USD",
    targetCurrency: "JOD" | "SAR"
  ): Promise<{ rate: number; source: string; ageInHours: number }> {
    // Try to get fresh rate from cache first
    let fxRate = await FxRate.getFreshRate(baseCurrency, targetCurrency, 24);

    if (fxRate && fxRate.isFresh()) {
      return {
        rate: fxRate.rate,
        source: "cache",
        ageInHours: ((fxRate as any).ageInHours ?? 0) as number,
      };
    }

    // Try to get any active rate from cache
    fxRate = await FxRate.getLatestRate(baseCurrency, targetCurrency);

    if (fxRate && !fxRate.isExpired) {
      return {
        rate: fxRate.rate,
        source: "cache",
        ageInHours: ((fxRate as any).ageInHours ?? 0) as number,
      };
    }

    // Fetch fresh rate from API
    try {
      const freshRate = await this.fetchRateFromAPI(targetCurrency);
      return {
        rate: freshRate.rate,
        source: "api",
        ageInHours: 0,
      };
    } catch (error) {
      console.error(`Failed to fetch rate from API: ${error}`);

      // Use fallback rate
      const fallbackRate = this.fallbackRates[targetCurrency];
      if (!fallbackRate) {
        throw new Error(`No fallback rate available for ${targetCurrency}`);
      }
      await FxRate.createFallbackRate(targetCurrency, fallbackRate, "API unavailable");

      return {
        rate: fallbackRate,
        source: "fallback",
        ageInHours: 0,
      };
    }
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchRateFromAPI(targetCurrency: "JOD" | "SAR"): Promise<{ rate: number }> {
    const apiKey = env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      throw new Error("Exchange rate API key not configured");
    }

    const url = `https://api.exchangerate-api.com/v4/latest/USD`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Quiz-Platform/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const rate = data.rates[targetCurrency];

      if (!rate || typeof rate !== "number") {
        throw new Error(`Invalid rate received for ${targetCurrency}`);
      }

      // Save rate to database
      await this.saveRateToDatabase(targetCurrency, rate, "api", "exchangerate-api", data);

      return { rate };
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      throw error;
    }
  }

  /**
   * Save exchange rate to database
   */
  private async saveRateToDatabase(
    targetCurrency: "JOD" | "SAR",
    rate: number,
    source: "api" | "manual" | "fallback",
    provider: string,
    providerResponse?: any
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    await FxRate.create({
      baseCurrency: "USD",
      targetCurrency,
      rate,
      source,
      provider,
      fetchedAt: now,
      expiresAt,
      metadata: providerResponse ? { providerResponse } : undefined,
    });
  }

  /**
   * Get pricing information for a product in specified currency
   */
  async getPricingInfo(
    usdAmount: number,
    targetCurrency: "USD" | "JOD" | "SAR"
  ): Promise<PricingInfo> {
    if (targetCurrency === "USD") {
      return {
        currency: "USD",
        amount: usdAmount,
        formatted: this.formatCurrency(usdAmount, "USD"),
        isEstimated: false,
      };
    }

    const conversion = await this.convertFromUSD(usdAmount, targetCurrency as "JOD" | "SAR");

    return {
      currency: targetCurrency,
      amount: conversion.convertedAmount,
      formatted: this.formatCurrency(conversion.convertedAmount, targetCurrency),
      exchangeRate: conversion.exchangeRate,
      isEstimated: conversion.rateSource === "fallback" || conversion.rateAge > 24,
    };
  }

  /**
   * Get pricing for multiple currencies
   */
  async getMultiCurrencyPricing(
    usdAmount: number,
    currencies: ("USD" | "JOD" | "SAR")[] = ["USD", "JOD", "SAR"]
  ): Promise<Record<string, PricingInfo>> {
    const results: Record<string, PricingInfo> = {};

    for (const currency of currencies) {
      results[currency] = await this.getPricingInfo(usdAmount, currency);
    }

    return results;
  }

  /**
   * Format currency amount with proper symbols and formatting
   */
  private formatCurrency(amount: number, currency: string): string {
    const formatters: Record<string, Intl.NumberFormat> = {
      USD: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      JOD: new Intl.NumberFormat("ar-JO", {
        style: "currency",
        currency: "JOD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      SAR: new Intl.NumberFormat("ar-SA", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };

    return formatters[currency]?.format(amount) || `${amount} ${currency}`;
  }

  /**
   * Update fallback rates manually (admin function)
   */
  async updateFallbackRates(rates: { JOD?: number; SAR?: number }): Promise<void> {
    if (rates.JOD !== undefined) {
      this.fallbackRates.JOD = rates.JOD;
      await FxRate.createFallbackRate("JOD", rates.JOD, "Manual update");
    }

    if (rates.SAR !== undefined) {
      this.fallbackRates.SAR = rates.SAR;
      await FxRate.createFallbackRate("SAR", rates.SAR, "Manual update");
    }
  }

  /**
   * Get currency statistics and health
   */
  async getCurrencyHealth(): Promise<{
    rates: Array<{
      currency: string;
      latestRate: number;
      rateAge: number;
      source: string;
      isHealthy: boolean;
    }>;
    overallHealth: "healthy" | "degraded" | "critical";
  }> {
    const currencies: ("JOD" | "SAR")[] = ["JOD", "SAR"];
    const rates = [];

    for (const currency of currencies) {
      const latestRate = await FxRate.getLatestRate("USD", currency);

      if (latestRate) {
        rates.push({
          currency,
          latestRate: latestRate.rate,
          rateAge: latestRate.ageInHours,
          source: latestRate.source,
          isHealthy: latestRate.isFresh(48) && latestRate.source !== "fallback", // 48 hours tolerance
        });
      } else {
        rates.push({
          currency,
          latestRate: this.fallbackRates[currency],
          rateAge: 999, // Very old
          source: "fallback",
          isHealthy: false,
        });
      }
    }

    const healthyRates = rates.filter((rate) => rate.isHealthy).length;
    const totalRates = rates.length;

    let overallHealth: "healthy" | "degraded" | "critical";
    if (healthyRates === totalRates) {
      overallHealth = "healthy";
    } else if (healthyRates >= totalRates / 2) {
      overallHealth = "degraded";
    } else {
      overallHealth = "critical";
    }

    return { rates, overallHealth };
  }

  /**
   * Clean up old exchange rates (maintenance function)
   */
  async cleanupOldRates(): Promise<number> {
    const result = await FxRate.cleanupExpired();
    return result.deletedCount || 0;
  }
}

// Export singleton instance
export const currencyService = CurrencyService.getInstance();
