export const CURRENCIES = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    decimals: 2,
    locale: "en-US",
  },
  JOD: {
    code: "JOD",
    name: "Jordanian Dinar",
    symbol: "د.أ",
    decimals: 3,
    locale: "ar-JO",
  },
  SAR: {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "ر.س",
    decimals: 2,
    locale: "ar-SA",
  },
} as const;

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>;

export const DEFAULT_CURRENCY = "USD" as const;

export const CURRENCY_LOCALES = {
  USD: "en-US",
  JOD: "ar-JO",
  SAR: "ar-SA",
} as const;

export const CURRENCY_SYMBOLS = {
  USD: "$",
  JOD: "د.أ",
  SAR: "ر.س",
} as const;

export const CURRENCY_DECIMALS = {
  USD: 2,
  JOD: 3,
  SAR: 2,
} as const;

export type Currency = keyof typeof CURRENCIES;

export const formatCurrency = (amount: number, currency: Currency): string => {
  const currencyConfig = CURRENCIES[currency];
  const formatter = new Intl.NumberFormat(currencyConfig.locale, {
    style: "currency",
    currency: currencyConfig.code,
    minimumFractionDigits: currencyConfig.decimals,
    maximumFractionDigits: currencyConfig.decimals,
  });

  return formatter.format(amount);
};

export const parseCurrency = (value: string, currency: Currency): number => {
  const currencyConfig = CURRENCIES[currency];
  const cleanValue = value.replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleanValue);

  return isNaN(parsed)
    ? 0
    : Math.round(parsed * Math.pow(10, currencyConfig.decimals)) /
        Math.pow(10, currencyConfig.decimals);
};
