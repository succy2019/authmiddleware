import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface Developer {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface Session {
  token: string;
  developer: Developer;
}

interface AuthContextType {
  session: Session | null;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => {
    const stored = localStorage.getItem("toklify_session");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem("toklify_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("toklify_session");
    }
  }, [session]);

  const setSession = (s: Session | null) => setSessionState(s);

  const logout = () => {
    setSessionState(null);
  };

  return (
    <AuthContext.Provider value={{ session, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
