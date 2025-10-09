import { createI18n } from "vue-i18n";
import en from "@/i18n/locales/en.json";
import ar from "@/i18n/locales/ar.json";

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    ar,
  },
  numberFormats: {
    en: {
      currency: {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      },
    },
    ar: {
      currency: {
        style: "currency",
        currency: "JOD",
        minimumFractionDigits: 2,
      },
    },
  },
  datetimeFormats: {
    en: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      },
    },
    ar: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      },
    },
  },
});

export default i18n;
