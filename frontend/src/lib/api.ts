export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface SignupPayload {
  orgName: string;
  name: string;
  email: string;
  password: string;
  plan: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    name: string;
    email: string;
    orgName: string;
    plan: string;
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string; error?: string }).message ||
      (data as { message?: string; error?: string }).error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
