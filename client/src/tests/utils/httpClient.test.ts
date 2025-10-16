import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { httpClient, HttpClient, getAuthHeaders, getErrorMessage } from "@/utils/httpClient";
import { handleApiResponse } from "@/utils/apiHelpers";
import { AUTH_CONSTANTS, HTTP_HEADERS } from "@/config/constants";

// Mock dependencies
vi.mock("@/utils/apiHelpers", () => ({
  handleApiResponse: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock AbortController
const mockAbortController = {
  signal: {},
  abort: vi.fn(),
};

global.AbortController = vi.fn(() => mockAbortController) as any;

describe("HTTP Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAbortController.abort.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getAuthHeaders", () => {
    it("should return empty object for cookie-based auth", () => {
      const headers = getAuthHeaders(false);
      expect(headers).toEqual({});
    });

    it("should return Bearer token headers for bearer auth", () => {
      const headers = getAuthHeaders(true);
      expect(headers).toEqual({
        [HTTP_HEADERS.AUTHORIZATION]: `${AUTH_CONSTANTS.BEARER_PREFIX} ${AUTH_CONSTANTS.COOKIE_BASED_TOKEN}`,
      });
    });

    it("should use custom token when provided", () => {
      const customToken = "custom-token-123";
      const headers = getAuthHeaders(true, customToken);
      expect(headers).toEqual({
        [HTTP_HEADERS.AUTHORIZATION]: `${AUTH_CONSTANTS.BEARER_PREFIX} ${customToken}`,
      });
    });
  });

  describe("HttpClient Class", () => {
    let client: HttpClient;

    beforeEach(() => {
      client = new HttpClient();
    });

    describe("Constructor", () => {
      it("should initialize with default config", () => {
        const defaultClient = new HttpClient();
        expect(defaultClient).toBeDefined();
      });

      it("should merge custom config with defaults", () => {
        const customClient = new HttpClient({
          baseURL: "https://api.example.com",
          timeout: 5000,
          defaultHeaders: { "Custom-Header": "value" },
        });
        expect(customClient).toBeDefined();
      });
    });

    describe("GET requests", () => {
      it("should make GET request successfully", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        const result = await client.get("/api/test");

        expect(mockFetch).toHaveBeenCalledWith("/api/test", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: undefined,
        });
        expect(result).toEqual(mockResponse);
      });

      it("should include auth headers when requireAuth is true with useBearer", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        await client.get("/api/test", { requireAuth: true, useBearer: true });

        expect(mockFetch).toHaveBeenCalledWith("/api/test", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            [HTTP_HEADERS.AUTHORIZATION]: `${AUTH_CONSTANTS.BEARER_PREFIX} ${AUTH_CONSTANTS.COOKIE_BASED_TOKEN}`,
          },
          credentials: "include",
          signal: undefined,
        });
      });

      it("should use cookie auth when requireAuth is true without useBearer", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        await client.get("/api/test", { requireAuth: true });

        expect(mockFetch).toHaveBeenCalledWith("/api/test", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: undefined,
        });
      });

      it("should use bearer auth when useBearer is true", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        await client.get("/api/test", { requireAuth: true, useBearer: true });

        expect(mockFetch).toHaveBeenCalledWith(
          "/api/test",
          expect.objectContaining({
            headers: expect.objectContaining({
              [HTTP_HEADERS.AUTHORIZATION]: `${AUTH_CONSTANTS.BEARER_PREFIX} ${AUTH_CONSTANTS.COOKIE_BASED_TOKEN}`,
            }),
          })
        );
      });

      it("should merge custom headers", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        const customHeaders = { "X-Custom": "value" };
        await client.get("/api/test", { headers: customHeaders });

        expect(mockFetch).toHaveBeenCalledWith(
          "/api/test",
          expect.objectContaining({
            headers: expect.objectContaining(customHeaders),
          })
        );
      });
    });

    describe("POST requests", () => {
      it("should make POST request with body", async () => {
        const mockResponse = { success: true };
        const mockFetchResponse = { ok: true, status: 201 };
        const requestBody = { name: "test", value: 123 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        const result = await client.post("/api/test", requestBody);

        expect(mockFetch).toHaveBeenCalledWith("/api/test", {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: undefined,
        });
        expect(result).toEqual(mockResponse);
      });

      it("should make POST request without body", async () => {
        const mockResponse = { success: true };
        const mockFetchResponse = { ok: true, status: 201 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        await client.post("/api/test");

        expect(mockFetch).toHaveBeenCalledWith(
          "/api/test",
          expect.objectContaining({
            method: "POST",
            body: undefined,
          })
        );
      });
    });

    describe("PUT requests", () => {
      it("should make PUT request with body", async () => {
        const mockResponse = { updated: true };
        const mockFetchResponse = { ok: true, status: 200 };
        const requestBody = { id: 1, name: "updated" };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        const result = await client.put("/api/test/1", requestBody);

        expect(mockFetch).toHaveBeenCalledWith("/api/test/1", {
          method: "PUT",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: undefined,
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("PATCH requests", () => {
      it("should make PATCH request with body", async () => {
        const mockResponse = { patched: true };
        const mockFetchResponse = { ok: true, status: 200 };
        const requestBody = { name: "patched" };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        const result = await client.patch("/api/test/1", requestBody);

        expect(mockFetch).toHaveBeenCalledWith("/api/test/1", {
          method: "PATCH",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: undefined,
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("DELETE requests", () => {
      it("should make DELETE request", async () => {
        const mockResponse = { deleted: true };
        const mockFetchResponse = { ok: true, status: 204 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        const result = await client.delete("/api/test/1");

        expect(mockFetch).toHaveBeenCalledWith("/api/test/1", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: undefined,
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe("Timeout handling", () => {
      it("should abort request after timeout", async () => {
        const timeoutError = new Error("Request timeout");
        timeoutError.name = "AbortError";

        mockFetch.mockRejectedValueOnce(timeoutError);

        await expect(client.get("/api/slow", { timeout: 1000 })).rejects.toThrow("Request timeout");
      });

      it("should use custom timeout", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        await client.get("/api/test", { timeout: 5000 });

        // Verify timeout was set (we can't easily test the actual timeout behavior)
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    describe("Error handling", () => {
      it("should throw errors by default", async () => {
        const error = new Error("Network error");
        mockFetch.mockRejectedValueOnce(error);

        await expect(client.get("/api/test")).rejects.toThrow("Network error");
      });

      it("should return null in silent mode", async () => {
        const error = new Error("Network error");
        mockFetch.mockRejectedValueOnce(error);

        const result = await client.get("/api/test", { silent: true });

        expect(result).toBeNull();
      });

      it("should handle AbortError as timeout", async () => {
        const abortError = new Error("Request aborted");
        abortError.name = "AbortError";
        mockFetch.mockRejectedValueOnce(abortError);

        await expect(client.get("/api/test")).rejects.toThrow("Request timeout");
      });
    });

    describe("Header merging", () => {
      it("should merge default headers with custom headers", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        const customHeaders = { "X-Custom": "value", "Content-Type": "application/xml" };
        await client.get("/api/test", { headers: customHeaders });

        expect(mockFetch).toHaveBeenCalledWith(
          "/api/test",
          expect.objectContaining({
            headers: expect.objectContaining({
              "X-Custom": "value",
              "Content-Type": "application/xml",
            }),
          })
        );
      });
    });

    describe("Credentials", () => {
      it("should always include credentials", async () => {
        const mockResponse = { data: "test" };
        const mockFetchResponse = { ok: true, status: 200 };

        mockFetch.mockResolvedValueOnce(mockFetchResponse);
        vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

        await client.get("/api/test");

        expect(mockFetch).toHaveBeenCalledWith(
          "/api/test",
          expect.objectContaining({
            credentials: "include",
          })
        );
      });
    });
  });

  describe("Singleton httpClient", () => {
    it("should be an instance of HttpClient", () => {
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it("should work with GET requests", async () => {
      const mockResponse = { data: "test" };
      const mockFetchResponse = { ok: true, status: 200 };

      mockFetch.mockResolvedValueOnce(mockFetchResponse);
      vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

      const result = await httpClient.get("/api/test");

      expect(result).toEqual(mockResponse);
    });

    it("should work with POST requests", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = { ok: true, status: 201 };
      const requestBody = { name: "test" };

      mockFetch.mockResolvedValueOnce(mockFetchResponse);
      vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

      const result = await httpClient.post("/api/test", requestBody);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("Edge cases", () => {
    let client: HttpClient;

    beforeEach(() => {
      client = new HttpClient();
    });

    it("should handle empty request body", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = { ok: true, status: 200 };

      mockFetch.mockResolvedValueOnce(mockFetchResponse);
      vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

      await client.post("/api/test", null);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });

    it("should handle undefined request body", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = { ok: true, status: 200 };

      mockFetch.mockResolvedValueOnce(mockFetchResponse);
      vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

      await client.post("/api/test", undefined);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });

    it("should handle empty string request body", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = { ok: true, status: 200 };

      mockFetch.mockResolvedValueOnce(mockFetchResponse);
      vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

      await client.post("/api/test", "");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });

    it("should handle zero request body", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = { ok: true, status: 200 };

      mockFetch.mockResolvedValueOnce(mockFetchResponse);
      vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

      await client.post("/api/test", 0);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });

    it("should handle false request body", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = { ok: true, status: 200 };

      mockFetch.mockResolvedValueOnce(mockFetchResponse);
      vi.mocked(handleApiResponse).mockResolvedValueOnce(mockResponse);

      await client.post("/api/test", false);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });
  });
});
