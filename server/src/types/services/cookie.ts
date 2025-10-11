/**
 * Cookie Service Types
 *
 * Type definitions for secure cookie operations
 */

export interface SecureCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
  domain?: string;
}
