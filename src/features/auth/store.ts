import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/shared/api/domain";

interface AuthState {
  token: string | null;
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
  setSession: (payload: { token: string | null; user: User | null; roles: string[] }) => void;
  setProfile: (payload: { user: User; roles: string[] }) => void;
  logout: () => void;
  hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      roles: [],
      isAuthenticated: false,
      setSession: ({ token, user, roles }) => set({ token, user, roles, isAuthenticated: Boolean(token) }),
      setProfile: ({ user, roles }) => set({ user, roles }),
      logout: () => set({ token: null, user: null, roles: [], isAuthenticated: false }),
      hasAnyRole: (roles) => roles.some((role) => get().roles.includes(role)),
    }),
    { name: "tamlu-auth" },
  ),
);
