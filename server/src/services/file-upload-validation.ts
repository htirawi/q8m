/**
 * File Upload Validation Service
 * 
 * SECURITY: SEC-008 - MIME type validation using magic bytes, not just extensions
 * Prevents file upload attacks by verifying actual file content
 */

import { fileTypeFromBuffer } from "file-type";
import type { MultipartFile } from "@fastify/multipart";

/**
 * Allowed MIME types for file uploads
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
] as const;

type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

/**
 * File validation result
 */
interface FileValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
  detectedType?: AllowedMimeType;
}

/**
 * Validate file upload using magic byte detection
 * 
 * @param file - Multipart file from Fastify
 * @returns Validation result with detected MIME type
 */
export async function validateFileUpload(
  file: MultipartFile
): Promise<FileValidationResult> {
  try {
    // Read file buffer
    const buffer = await file.toBuffer();

    // Detect actual file type using magic bytes
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      return {
        isValid: false,
        error: "Unable to detect file type - file may be corrupted or unsupported",
      };
    }

    // Check if detected MIME type is allowed
    const isAllowed = ALLOWED_MIME_TYPES.includes(detectedType.mime as AllowedMimeType);

    if (!isAllowed) {
      return {
        isValid: false,
        error: `File type not allowed: ${detectedType.mime}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
        mimeType: detectedType.mime,
      };
    }

    return {
      isValid: true,
      mimeType: detectedType.mime,
      detectedType: detectedType.mime as AllowedMimeType,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown validation error";
    return {
      isValid: false,
      error: `File validation failed: ${errorMessage}`,
    };
  }
}

/**
 * Validate file size
 * 
 * @param fileSize - Size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns Validation result
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number
): FileValidationResult {
  if (fileSize > maxSize) {
    return {
      isValid: false,
      error: `File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Get allowed MIME types
 */
export function getAllowedMimeTypes(): readonly string[] {
  return ALLOWED_MIME_TYPES;
}

