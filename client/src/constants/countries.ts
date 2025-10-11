/**
 * Country Constants
 *
 * List of supported countries for billing and payment processing.
 */

export interface Country {
  code: string;
  name: string;
  currency?: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "JO", name: "Jordan", currency: "JOD" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "KW", name: "Kuwait", currency: "KWD" },
  { code: "QA", name: "Qatar", currency: "QAR" },
  { code: "BH", name: "Bahrain", currency: "BHD" },
  { code: "OM", name: "Oman", currency: "OMR" },
  { code: "EG", name: "Egypt", currency: "EGP" },
  { code: "LB", name: "Lebanon", currency: "LBP" },
  { code: "SY", name: "Syria", currency: "SYP" },
  { code: "IQ", name: "Iraq", currency: "IQD" },
  { code: "YE", name: "Yemen", currency: "YER" },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find((country) => country.code === code);
};

export const getCountriesByCurrency = (currency: string): Country[] => {
  return COUNTRIES.filter((country) => country.currency === currency);
};
