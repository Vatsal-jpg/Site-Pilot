import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  name: string;
  email: string;
  orgName: string;
  plan: "starter" | "pro" | "enterprise";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (data: { name: string; email: string; orgName: string; plan: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (_email: string, _password: string) => {
    setUser({
      name: "John Smith",
      email: _email,
      orgName: "Acme Corp",
      plan: "pro",
    });
  };

  const signup = (data: { name: string; email: string; orgName: string; plan: string }) => {
    setUser({
      name: data.name,
      email: data.email,
      orgName: data.orgName,
      plan: data.plan as User["plan"],
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
