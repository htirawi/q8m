/**
 * Schema Types (Zod inferred types)
 */

// Auth Schema Types
export interface IEmailStepInput {
  email: string;
}

export interface ILoginFormInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegisterFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
