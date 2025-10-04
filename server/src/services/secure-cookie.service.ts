import { env } from "../config/env.js";
import crypto from "crypto";

export interface SecureCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
  domain?: string;
}

export class SecureCookieService {
  private readonly cookieSecret: string;
  // cookieSecret is used for cookie signing and verification

  constructor() {
    this.cookieSecret = env.CSRF_SECRET;
    // cookieSecret is used for cookie signing and verification
  }

  /**
   * Set a secure httpOnly cookie
   */
  setSecureCookie(
    reply: any,
    name: string,
    value: string,
    options: Partial<SecureCookieOptions> = {}
  ): void {
    const defaultOptions: SecureCookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    };

    const cookieOptions = { ...defaultOptions, ...options };

    reply.setCookie(name, value, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
      domain: cookieOptions.domain,
    });
  }

  /**
   * Set access token cookie
   */
  setAccessTokenCookie(reply: any, token: string): void {
    this.setSecureCookie(reply, "accessToken", token, {
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  /**
   * Set refresh token cookie
   */
  setRefreshTokenCookie(reply: any, token: string): void {
    this.setSecureCookie(reply, "refreshToken", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(reply: any): void {
    reply.clearCookie("accessToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    reply.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Set CSRF token cookie
   */
  setCSRFTokenCookie(reply: any, token: string): void {
    this.setSecureCookie(reply, "csrfToken", token, {
      maxAge: 60 * 60 * 1000, // 1 hour
    });
  }

  /**
   * Verify CSRF token
   */
  verifyCSRFToken(requestToken: string, cookieToken: string): boolean {
    if (!requestToken || !cookieToken) {
      return false;
    }
    return requestToken === cookieToken;
  }

  /**
   * Get the cookie secret for external use
   */
  getCookieSecret(): string {
    return this.cookieSecret;
  }
}

export const secureCookieService = new SecureCookieService();
