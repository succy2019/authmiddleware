const API_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = (await res.json()) as T & { valid?: boolean; error?: string };
  if (!res.ok && !data.valid && data.valid !== false) {
    throw new Error(data.error || "Request failed");
  }
  return data as T;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Auth
export function register(name: string, email: string) {
  return request<{
    developer: { id: string; name: string; email: string; created_at: string };
    api_key: string;
    session_token: string;
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
}

export function login(email: string) {
  return request<{ message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyLogin(email: string, otp: string) {
  return request<{
    valid: boolean;
    reason?: string;
    developer?: { id: string; name: string; email: string; created_at: string };
    session_token?: string;
  }>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

// Dashboard
export function getStats(token: string) {
  return request<{
    total_tokens: number;
    active_tokens: number;
    revoked_tokens: number;
    total_otps: number;
    verified_otps: number;
  }>("/dashboard/stats", {
    headers: authHeaders(token),
  });
}

export function regenerateApiKey(token: string) {
  return request<{ api_key: string }>("/dashboard/regenerate-key", {
    method: "POST",
    headers: authHeaders(token),
  });
}
