/**
 * Currency Service Types
 *
 * Type definitions for currency conversion operations
 */

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
