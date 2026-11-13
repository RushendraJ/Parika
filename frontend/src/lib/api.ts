const TOKEN_KEY = "parika_token";

/** Backend origin. Empty in development (Vite proxies /api and /uploads). */
export const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "");

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t: string) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage unavailable */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Options = { method?: string; body?: unknown; form?: FormData };

export async function api<T = unknown>(path: string, { method = "GET", body, form }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Please try again.");
  }

  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new ApiError(res.status, data.message || "Something went wrong");
  return data as T;
}

/** Turns a stored image path ("/uploads/x.jpg") into a URL the browser can load. */
export function assetUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`;
}
