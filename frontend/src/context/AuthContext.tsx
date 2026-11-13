import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api, tokenStore } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  /** Stores the token + user returned by login / signup / google / reset-password. */
  signIn: (res: AuthResponse) => void;
  setUser: (user: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    api<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(
    (res: AuthResponse) => {
      tokenStore.set(res.token);
      setUser(res.user);
      qc.invalidateQueries();
    },
    [qc],
  );

  const signOut = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    qc.clear();
  }, [qc]);

  const value = useMemo<AuthState>(
    () => ({ user, loading, isAdmin: user?.role === "admin", signIn, setUser, signOut }),
    [user, loading, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
