export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
  cta: string;
}

export interface CurrencyRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  expiresAt: Date;
}

export interface Purchase {
  _id: string;
  userId: string;
  productId: string; // 'INTERMEDIATE', 'SENIOR', 'BUNDLE'
  amount: {
    displayCurrency: string; // 'USD', 'JOD', 'SAR'
    displayAmount: number;
    nativeCurrency: string; // 'USD'
    nativeAmount: number;
    fxRate: number;
    fxTimestamp: Date;
  };
  paymentMethod: "paypal" | "aps";
  paymentId: string; // external payment ID
  status: "pending" | "completed" | "failed" | "refunded";
  entitlements: string[]; // ['INTERMEDIATE', 'SENIOR']
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entitlement {
  userId: string;
  tier: "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  expiresAt?: Date; // undefined for lifetime
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceSnapshot {
  tierId: string;
  displayCurrency: string;
  displayAmount: number;
  nativeCurrency: string;
  nativeAmount: number;
  fxRate: number;
  fxTimestamp: Date;
  createdAt: Date;
}

export interface CurrencyConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  rate: number;
  timestamp: Date;
}

export interface PricingResponse {
  tiers: PricingTier[];
  currency: string;
  supportedCurrencies: string[];
  exchangeRates: Record<string, number>;
}
