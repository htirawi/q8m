export const LOCALES = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flag: "🇺🇸",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    flag: "🇸🇦",
    currency: "JOD",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  },
} as const;

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Array<keyof typeof LOCALES>;

export const DEFAULT_LOCALE = "en" as const;

export const LOCALE_DIRECTIONS = {
  en: "ltr",
  ar: "rtl",
} as const;

export const LOCALE_CURRENCIES = {
  en: "USD",
  ar: "JOD",
} as const;

export type Locale = keyof typeof LOCALES;

export const isRTL = (locale: Locale): boolean => {
  return LOCALES[locale].dir === "rtl";
};

export const getLocaleDirection = (locale: Locale): "ltr" | "rtl" => {
  return LOCALES[locale].dir;
};

export const getLocaleCurrency = (locale: Locale): string => {
  return LOCALES[locale].currency;
};

export const formatDate = (date: Date, locale: Locale): string => {
  const localeCode = locale === "en" ? "en-US" : "ar-SA";
  return new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const formatTime = (date: Date, locale: Locale): string => {
  const localeCode = locale === "en" ? "en-US" : "ar-SA";
  const timeFormat = LOCALES[locale].timeFormat === "12h" ? "h:mm a" : "HH:mm";

  return new Intl.DateTimeFormat(localeCode, {
    hour: "numeric",
    minute: "2-digit",
    hour12: LOCALES[locale].timeFormat === "12h",
  }).format(date);
};

export const formatNumber = (number: number, locale: Locale): string => {
  const localeCode = locale === "en" ? "en-US" : "ar-SA";
  return new Intl.NumberFormat(localeCode).format(number);
};

export const formatCurrency = (amount: number, locale: Locale): string => {
  const localeCode = locale === "en" ? "en-US" : "ar-SA";
  const currency = getLocaleCurrency(locale);

  return new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency,
  }).format(amount);
};

export const detectLocale = (): Locale => {
  // Try to detect from browser language
  if (typeof window !== "undefined") {
    const browserLang = navigator.language.split("-")[0];
    if (browserLang in LOCALES) {
      return browserLang as Locale;
    }
  }

  // Try to detect from Accept-Language header
  if (typeof window !== "undefined") {
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      const code = lang.split("-")[0];
      if (code in LOCALES) {
        return code as Locale;
      }
    }
  }

  return DEFAULT_LOCALE;
};

export const parseLocale = (locale: string): Locale => {
  if (locale in LOCALES) {
    return locale as Locale;
  }

  // Try to match by language code
  const langCode = locale.split("-")[0];
  if (langCode in LOCALES) {
    return langCode as Locale;
  }

  return DEFAULT_LOCALE;
};
