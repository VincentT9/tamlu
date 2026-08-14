import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@/shared/api/domain";

interface AuthState {
  token: string | null;
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
  rememberSession: boolean;
  setSession: (payload: { token: string | null; user: User | null; roles: string[]; remember?: boolean }) => void;
  setProfile: (payload: { user: User; roles: string[] }) => void;
  logout: () => void;
  hasAnyRole: (roles: string[]) => boolean;
}

const authStorage = {
  getItem: (name: string) => localStorage.getItem(name) ?? sessionStorage.getItem(name),
  setItem: (name: string, value: string) => {
    const remembered = Boolean((JSON.parse(value) as { state?: { rememberSession?: boolean } }).state?.rememberSession);
    const targetStorage = remembered ? localStorage : sessionStorage;
    const otherStorage = remembered ? sessionStorage : localStorage;
    otherStorage.removeItem(name);
    targetStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      roles: [],
      isAuthenticated: false,
      rememberSession: false,
      setSession: ({ token, user, roles, remember = false }) => set({ token, user, roles, isAuthenticated: Boolean(token), rememberSession: remember }),
      setProfile: ({ user, roles }) => set({ user, roles }),
      logout: () => set({ token: null, user: null, roles: [], isAuthenticated: false, rememberSession: false }),
      hasAnyRole: (roles) => roles.some((role) => get().roles.includes(role)),
    }),
    { name: "tamlu-auth", storage: createJSONStorage(() => authStorage) },
  ),
);
