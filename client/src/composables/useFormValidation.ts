import { useI18n } from "vue-i18n";

/**
 * useFormValidation Composable
 * Centralized form validation logic with common validators.
 * Provides consistent validation across all forms with i18n support.
 *
 * @example
 * const { validateEmail, validatePassword, validateRequired } = useFormValidation();
 * const emailError = validateEmail(email.value);
 */
export function useFormValidation() {
  const { t } = useI18n();

  /**
   * Validates email format
   * @param email - Email address to validate
   * @returns Error message or undefined if valid
   */
  const validateEmail = (email: string): string | undefined => {
    if (!email || !email.trim()) {
      return t("auth.validation.emailRequired");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t("auth.validation.emailInvalid");
    }

    return undefined;
  };

  /**
   * Validates password strength
   * @param password - Password to validate
   * @param minLength - Minimum password length (default: 8)
   * @returns Error message or undefined if valid
   */
  const validatePassword = (password: string, minLength = 8): string | undefined => {
    if (!password || !password.trim()) {
      return t("auth.validation.passwordRequired");
    }

    if (password.length < minLength) {
      return t("auth.validation.passwordMinLength", { min: minLength });
    }

    return undefined;
  };

  /**
   * Validates required field
   * @param value - Field value to validate
   * @param fieldName - Field name for error message key
   * @returns Error message or undefined if valid
   */
  const validateRequired = (value: string, fieldName: string): string | undefined => {
    if (!value || !value.trim()) {
      return t(`validation.${fieldName}Required`);
    }

    return undefined;
  };

  /**
   * Validates minimum length
   * @param value - Field value to validate
   * @param minLength - Minimum required length
   * @param fieldName - Field name for error message key
   * @returns Error message or undefined if valid
   */
  const validateMinLength = (
    value: string,
    minLength: number,
    fieldName: string
  ): string | undefined => {
    if (!value || value.trim().length < minLength) {
      return t(`validation.${fieldName}MinLength`, { min: minLength });
    }

    return undefined;
  };

  /**
   * Validates name format (letters, spaces, hyphens only)
   * @param name - Name to validate
   * @param minLength - Minimum name length (default: 2)
   * @returns Error message or undefined if valid
   */
  const validateName = (name: string, minLength = 2): string | undefined => {
    if (!name || !name.trim()) {
      return t("auth.validation.nameRequired");
    }

    if (name.trim().length < minLength) {
      return t("auth.validation.nameMinLength", { min: minLength });
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) {
      return t("auth.validation.nameInvalid");
    }

    return undefined;
  };

  /**
   * Validates phone number format
   * @param phone - Phone number to validate
   * @returns Error message or undefined if valid
   */
  const validatePhone = (phone: string): string | undefined => {
    if (!phone || !phone.trim()) {
      return t("validation.phoneRequired");
    }

    // Basic international phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-()]/g, ""))) {
      return t("validation.phoneInvalid");
    }

    return undefined;
  };

  /**
   * Validates confirmation field matches original
   * @param value - Confirmation value
   * @param originalValue - Original value to match
   * @param fieldName - Field name for error message key
   * @returns Error message or undefined if valid
   */
  const validateMatch = (
    value: string,
    originalValue: string,
    fieldName: string
  ): string | undefined => {
    if (value !== originalValue) {
      return t(`validation.${fieldName}NoMatch`);
    }

    return undefined;
  };

  /**
   * Validates checkbox/terms acceptance
   * @param accepted - Boolean indicating acceptance
   * @param fieldName - Field name for error message key
   * @returns Error message or undefined if valid
   */
  const validateAcceptance = (accepted: boolean, fieldName: string): string | undefined => {
    if (!accepted) {
      return t(`validation.${fieldName}Required`);
    }

    return undefined;
  };

  return {
    validateEmail,
    validatePassword,
    validateRequired,
    validateMinLength,
    validateName,
    validatePhone,
    validateMatch,
    validateAcceptance,
  };
}
