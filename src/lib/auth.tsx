import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS, DEMO_PASSWORD, type User, type Role } from "./mock-data";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);
const STORAGE_KEY = "bakery_auth_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { user: User; token: string; exp: number };
        if (parsed.exp > Date.now()) {
          setUser(parsed.user);
          setToken(parsed.token);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error("No account with that email.");
    if (found.status === "disabled") throw new Error("This account is disabled.");
    if (password !== DEMO_PASSWORD) throw new Error("Incorrect password.");
    const tok = `mock.jwt.${found.id}.${Date.now()}`;
    const exp = Date.now() + 1000 * 60 * 60 * 8; // 8h
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: found, token: tok, exp }));
    setUser(found);
    setToken(tok);
    return found;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  salesperson: "Salesperson",
};
