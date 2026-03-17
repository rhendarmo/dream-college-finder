// frontend/src/lib/http.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in .env.local");
}

export type HttpOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

/**
 * Smart fetch helper:
 * - If body is FormData: do NOT set Content-Type (browser sets boundary)
 * - If body is a plain object: JSON.stringify and set application/json
 * - If body is already a string/Blob/etc: pass through and don't force JSON
 * - Always includes credentials (cookie auth)
 */
export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const method = options.method ?? "GET";
  const body = options.body;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  // If caller passed a plain object as body, treat it as JSON automatically.
  const isPlainObject =
    !!body &&
    typeof body === "object" &&
    !isFormData &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams);

  const finalBody =
    isPlainObject ? JSON.stringify(body) : (body as BodyInit | null | undefined);

  // Build headers safely:
  // - If FormData: do not set Content-Type
  // - If plain object JSON: set Content-Type unless caller already did
  const headers = new Headers(options.headers);

  if (isPlainObject && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (isFormData) {
    // Ensure we don't accidentally send an explicit content-type with no boundary
    headers.delete("Content-Type");
  }

  const res = await fetch(url, {
    ...options,
    method,
    body: finalBody,
    headers: headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  // If backend sometimes returns empty response body (204 etc.)
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // return text as any if not JSON
    return (await res.text()) as any as T;
  }

  return (await res.json()) as T;
}