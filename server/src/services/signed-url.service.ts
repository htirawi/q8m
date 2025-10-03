import { createHmac } from "crypto";
import { env } from "../config/env.js";

interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 1 hour
  userId?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

interface SignedUrlData {
  url: string;
  expiresAt: Date;
  signature: string;
}

export class SignedUrlService {
  private static instance: SignedUrlService;
  private secretKey: string;

  private constructor() {
    this.secretKey = env.SIGNED_URL_SECRET || env.JWT_SECRET || "default-secret-key";
  }

  public static getInstance(): SignedUrlService {
    if (!SignedUrlService.instance) {
      SignedUrlService.instance = new SignedUrlService();
    }
    return SignedUrlService.instance;
  }

  /**
   * Generate a signed URL for secure access to resources
   */
  public generateSignedUrl(baseUrl: string, options: SignedUrlOptions = {}): SignedUrlData {
    const {
      expiresIn = 3600, // 1 hour default
      userId,
      resource,
      metadata = {},
    } = options;

    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const expiresTimestamp = Math.floor(expiresAt.getTime() / 1000);

    // Create payload
    const payload = {
      url: baseUrl,
      exp: expiresTimestamp,
      userId,
      resource,
      metadata,
    };

    // Create signature
    const payloadString = JSON.stringify(payload);
    const signature = this.createSignature(payloadString);

    // Append signature to URL
    const separator = baseUrl.includes("?") ? "&" : "?";
    const signedUrl = `${baseUrl}${separator}signature=${signature}&expires=${expiresTimestamp}${
      userId ? `&user=${userId}` : ""
    }${resource ? `&resource=${resource}` : ""}`;

    return {
      url: signedUrl,
      expiresAt,
      signature,
    };
  }

  /**
   * Verify a signed URL
   */
  public verifySignedUrl(url: string): {
    isValid: boolean;
    isExpired: boolean;
    userId?: string;
    resource?: string;
    error?: string;
  } {
    try {
      const urlObj = new URL(url);
      const signature = urlObj.searchParams.get("signature");
      const expires = urlObj.searchParams.get("expires");
      const userId = urlObj.searchParams.get("user") || undefined;
      const resource = urlObj.searchParams.get("resource") || undefined;

      if (!signature || !expires) {
        return {
          isValid: false,
          isExpired: false,
          error: "Missing signature or expiration",
        };
      }

      // Check if expired
      const expiresTimestamp = parseInt(expires, 10);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = expiresTimestamp < now;

      if (isExpired) {
        return {
          isValid: false,
          isExpired: true,
          error: "URL has expired",
        };
      }

      // Recreate the base URL without signature parameters
      const baseUrl = url.split("?")[0];
      const payload = {
        url: baseUrl,
        exp: expiresTimestamp,
        userId,
        resource,
        metadata: {},
      };

      const payloadString = JSON.stringify(payload);
      const expectedSignature = this.createSignature(payloadString);

      // Verify signature
      const isValid = signature === expectedSignature;

      return {
        isValid,
        isExpired: false,
        userId,
        resource,
        error: isValid ? undefined : "Invalid signature",
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        error: "Invalid URL format",
      };
    }
  }

  /**
   * Create HMAC signature for payload
   */
  private createSignature(payload: string): string {
    return createHmac("sha256", this.secretKey).update(payload).digest("hex");
  }

  /**
   * Generate signed download URL for protected content
   */
  public generateDownloadUrl(
    filePath: string,
    userId: string,
    options: SignedUrlOptions = {}
  ): SignedUrlData {
    const baseUrl = `${env.SERVER_URL || "http://localhost:3000"}/download/${filePath}`;

    return this.generateSignedUrl(baseUrl, {
      ...options,
      userId,
      resource: filePath,
      expiresIn: options.expiresIn || 3600, // 1 hour for downloads
    });
  }

  /**
   * Generate signed preview URL for protected content
   */
  public generatePreviewUrl(
    filePath: string,
    userId: string,
    options: SignedUrlOptions = {}
  ): SignedUrlData {
    const baseUrl = `${env.SERVER_URL || "http://localhost:3000"}/preview/${filePath}`;

    return this.generateSignedUrl(baseUrl, {
      ...options,
      userId,
      resource: filePath,
      expiresIn: options.expiresIn || 1800, // 30 minutes for previews
    });
  }

  /**
   * Generate signed stream URL for protected content
   */
  public generateStreamUrl(
    streamId: string,
    userId: string,
    options: SignedUrlOptions = {}
  ): SignedUrlData {
    const baseUrl = `${env.SERVER_URL || "http://localhost:3000"}/stream/${streamId}`;

    return this.generateSignedUrl(baseUrl, {
      ...options,
      userId,
      resource: streamId,
      expiresIn: options.expiresIn || 7200, // 2 hours for streams
    });
  }

  /**
   * Generate signed API URL for protected endpoints
   */
  public generateApiUrl(
    endpoint: string,
    userId: string,
    options: SignedUrlOptions = {}
  ): SignedUrlData {
    const baseUrl = `${env.SERVER_URL || "http://localhost:3000"}/api/${endpoint}`;

    return this.generateSignedUrl(baseUrl, {
      ...options,
      userId,
      resource: endpoint,
      expiresIn: options.expiresIn || 900, // 15 minutes for API access
    });
  }

  /**
   * Extract user ID from signed URL without verification
   * (for logging purposes)
   */
  public extractUserIdFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("user");
    } catch {
      return null;
    }
  }

  /**
   * Get expiration time from signed URL
   */
  public getExpirationFromUrl(url: string): Date | null {
    try {
      const urlObj = new URL(url);
      const expires = urlObj.searchParams.get("expires");
      if (expires) {
        return new Date(parseInt(expires, 10) * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const signedUrlService = SignedUrlService.getInstance();
