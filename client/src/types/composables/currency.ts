/**
 * Currency Composable Types
 */

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  country: string;
  rate: number;
}

export interface GeoLocationInfo {
  country: string;
  currency: string;
  timezone: string;
}
