/**
 * Currency Detection and Conversion Composable
 *
 * Handles currency detection, conversion, and formatting
 */

import { ref, computed, onMounted } from "vue";
import { usePaymentStore } from "@/stores/payment";
import type { CurrencyInfo, GeoLocationInfo } from "@/types/composables/currency";

export function useCurrency() {
  const paymentStore = usePaymentStore();

  const detectedCurrency = ref<string | null>(null);
  const geoLocation = ref<GeoLocationInfo | null>(null);
  const currencyRates = ref<Record<string, number>>({});
  const isDetecting = ref(false);

  // Supported currencies
  const supportedCurrencies = [
    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      locale: "en-US",
      country: "US",
      rate: 1,
    },
    {
      code: "JOD",
      name: "Jordanian Dinar",
      symbol: "د.أ",
      locale: "ar-JO",
      country: "JO",
      rate: 0.71,
    },
    {
      code: "SAR",
      name: "Saudi Riyal",
      symbol: "ر.س",
      locale: "ar-SA",
      country: "SA",
      rate: 3.75,
    },
  ];

  // Currency mapping by country
  const countryCurrencyMap: Record<string, string> = {
    // Middle East
    JO: "JOD",
    SA: "SAR",
    AE: "SAR", // UAE uses SAR for consistency
    KW: "SAR", // Kuwait uses SAR for consistency
    QA: "SAR", // Qatar uses SAR for consistency
    BH: "SAR", // Bahrain uses SAR for consistency
    OM: "SAR", // Oman uses SAR for consistency

    // North America
    US: "USD",
    CA: "USD", // Canada uses USD for consistency

    // Default
    default: "USD",
  };

  // Get currency info
  const getCurrencyInfo = (code: string): CurrencyInfo | null => {
    return supportedCurrencies.find((c) => c.code === code) || null;
  };

  // Detect user's currency based on various methods
  const detectUserCurrency = async (): Promise<string> => {
    isDetecting.value = true;

    try {
      // Method 1: Check localStorage for saved preference
      const savedCurrency = localStorage.getItem("preferred_currency");
      if (savedCurrency && supportedCurrencies.some((c) => c.code === savedCurrency)) {
        detectedCurrency.value = savedCurrency;
        return savedCurrency;
      }

      // Method 2: Detect from browser locale
      const browserCurrency = detectFromBrowserLocale();
      if (browserCurrency) {
        detectedCurrency.value = browserCurrency;
        return browserCurrency;
      }

      // Method 3: Detect from geo-location
      const geoCurrency = await detectFromGeoLocation();
      if (geoCurrency) {
        detectedCurrency.value = geoCurrency;
        return geoCurrency;
      }

      // Method 4: Detect from IP geolocation
      const ipCurrency = await detectFromIP();
      if (ipCurrency) {
        detectedCurrency.value = ipCurrency;
        return ipCurrency;
      }

      // Fallback to USD
      detectedCurrency.value = "USD";
      return "USD";
    } catch (error) {
      console.warn("Currency detection failed:", error);
      detectedCurrency.value = "USD";
      return "USD";
    } finally {
      isDetecting.value = false;
    }
  };

  // Detect currency from browser locale
  const detectFromBrowserLocale = (): string | null => {
    try {
      const browserLocale = navigator.language;

      // Extract country code from locale (e.g., "en-US" -> "US")
      const countryCode = browserLocale.split("-")[1]?.toUpperCase();

      if (countryCode && countryCurrencyMap[countryCode]) {
        return countryCurrencyMap[countryCode];
      }

      return null;
    } catch (error) {
      console.warn("Browser locale detection failed:", error);
      return null;
    }
  };

  // Detect currency from geo-location
  const detectFromGeoLocation = async (): Promise<string | null> => {
    try {
      if (!navigator.geolocation) {
        return null;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const country = await getCountryFromCoordinates(latitude, longitude);

              if (country && countryCurrencyMap[country]) {
                geoLocation.value = {
                  country,
                  currency: countryCurrencyMap[country],
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                };
                resolve(countryCurrencyMap[country]);
              } else {
                resolve(null);
              }
            } catch (error) {
              console.warn("Geolocation currency detection failed:", error);
              resolve(null);
            }
          },
          () => {
            // Geolocation failed, continue with other methods
            resolve(null);
          },
          {
            timeout: 5000,
            enableHighAccuracy: false,
          }
        );
      });
    } catch (error) {
      console.warn("Geolocation detection failed:", error);
      return null;
    }
  };

  // Detect currency from IP geolocation
  const detectFromIP = async (): Promise<string | null> => {
    try {
      // Use a free IP geolocation service
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      const countryCode = data.country_code as string | undefined;
      if (countryCode && countryCurrencyMap[countryCode]) {
        geoLocation.value = {
          country: countryCode,
          currency: countryCurrencyMap[countryCode],
          timezone:
            (data.timezone as string | undefined) ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        return countryCurrencyMap[countryCode];
      }

      return null;
    } catch (error) {
      console.warn("IP geolocation detection failed:", error);
      return null;
    }
  };

  // Get country from coordinates (simplified)
  const getCountryFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Use reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();

      return data.countryCode || null;
    } catch (_error) {
      console.warn("Reverse geocoding failed");
      return null;
    }
  };

  // Set user's preferred currency
  const setPreferredCurrency = (currency: string) => {
    if (supportedCurrencies.some((c) => c.code === currency)) {
      localStorage.setItem("preferred_currency", currency);
      paymentStore.setCurrentCurrency(currency as "USD" | "JOD" | "SAR");
      detectedCurrency.value = currency;
    }
  };

  // Get current currency
  const getCurrentCurrency = computed(() => {
    return paymentStore.currentCurrency;
  });

  // Get current currency info
  const getCurrentCurrencyInfo = computed(() => {
    return getCurrencyInfo(paymentStore.currentCurrency);
  });

  // Format amount in current currency
  const formatAmount = (amount: number, currency?: string) => {
    const targetCurrency = currency || paymentStore.currentCurrency;
    return paymentStore.formatCurrency(amount, targetCurrency);
  };

  // Convert amount between currencies
  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;

    // Get exchange rates from store
    const rates = paymentStore.currencyRates;
    if (!rates) return amount;

    // Helper to safely get rate
    const getRate = (currency: string): number => {
      if (currency === "USD") return rates.USD;
      if (currency === "JOD") return rates.JOD;
      if (currency === "SAR") return rates.SAR;
      return 1;
    };

    // Convert to USD first, then to target currency
    let usdAmount = amount;
    if (fromCurrency !== "USD") {
      const fromRate = getRate(fromCurrency);
      usdAmount = amount / fromRate;
    }

    if (toCurrency !== "USD") {
      const toRate = getRate(toCurrency);
      return usdAmount * toRate;
    }

    return usdAmount;
  };

  // Get exchange rate between currencies
  const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return 1;

    const rates = paymentStore.currencyRates;
    if (!rates) return 1;

    // Helper to safely get rate
    const getRate = (currency: string): number => {
      if (currency === "USD") return rates.USD;
      if (currency === "JOD") return rates.JOD;
      if (currency === "SAR") return rates.SAR;
      return 1;
    };

    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);

    return toRate / fromRate;
  };

  // Check if currency conversion is needed
  const needsConversion = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return false;

    const convertedAmount = convertAmount(amount, fromCurrency, toCurrency);
    const difference = Math.abs(convertedAmount - amount);
    const threshold = amount * 0.01; // 1% threshold

    return difference > threshold;
  };

  // Get currency symbol
  const getCurrencySymbol = (currency?: string) => {
    const targetCurrency = currency || paymentStore.currentCurrency;
    const info = getCurrencyInfo(targetCurrency);
    return info?.symbol || targetCurrency;
  };

  // Get all supported currencies
  const getAllSupportedCurrencies = computed(() => {
    return supportedCurrencies;
  });

  // Check if currency is supported
  const isCurrencySupported = (currency: string) => {
    return supportedCurrencies.some((c) => c.code === currency);
  };

  // Get currency display name
  const getCurrencyDisplayName = (currency: string, locale?: string) => {
    const targetLocale = locale || getCurrentCurrencyInfo.value?.locale || "en-US";

    try {
      const formatter = new Intl.DisplayNames([targetLocale], { type: "currency" });
      return formatter.of(currency);
    } catch (_error) {
      return currency;
    }
  };

  // Initialize currency detection
  const initializeCurrency = async () => {
    const detected = await detectUserCurrency();
    setPreferredCurrency(detected);
  };

  // Lifecycle
  onMounted(async () => {
    await initializeCurrency();
  });

  return {
    // State
    detectedCurrency,
    geoLocation,
    currencyRates,
    isDetecting,

    // Computed
    getCurrentCurrency,
    getCurrentCurrencyInfo,
    getAllSupportedCurrencies,

    // Methods
    detectUserCurrency,
    setPreferredCurrency,
    formatAmount,
    convertAmount,
    getExchangeRate,
    needsConversion,
    getCurrencySymbol,
    getCurrencyInfo,
    getCurrencyDisplayName,
    isCurrencySupported,
    initializeCurrency,
  };
}
