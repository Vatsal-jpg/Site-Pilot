import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  name: string;
  email: string;
  orgName: string;
  plan: "starter" | "pro" | "enterprise";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    orgName: string;
    plan: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// ── Provider ──────────────────────────────────────────────────────────────────

const TOKEN_KEY = "sitepilot_token";
const USER_KEY = "sitepilot_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );

  // Keep localStorage in sync whenever user / token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<void> => {
    const res = await authApi.login({ email, password });

    setToken(res.token);

    // If the API returns user details use them, otherwise fall back to email
    setUser({
      name: res.user?.name ?? email.split("@")[0],
      email: res.user?.email ?? email,
      orgName: res.user?.orgName ?? "",
      plan: (res.user?.plan as User["plan"]) ?? "starter",
    });
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = async (data: {
    name: string;
    email: string;
    orgName: string;
    plan: string;
    password: string;
  }): Promise<void> => {
    const res = await authApi.signup({
      orgName: data.orgName,
      name: data.name,
      email: data.email,
      password: data.password,
      plan: data.plan,
    });

    setToken(res.token);

    setUser({
      name: res.user?.name ?? data.name,
      email: res.user?.email ?? data.email,
      orgName: res.user?.orgName ?? data.orgName,
      plan: (res.user?.plan as User["plan"]) ?? (data.plan as User["plan"]) ?? "starter",
    });
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user && !!token, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
