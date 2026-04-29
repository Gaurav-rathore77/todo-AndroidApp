import { create } from "zustand";
import { loginApi } from "../../api/auth";

interface User {
  id: string;
  username: string;
  profileImage?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log("🌐 Web login attempt:", username);
      const data = await loginApi({ username, password });
      console.log("✅ Web login success:", data);
      set({ token: data.token, user: data.user, isLoading: false });
      return true;
    } catch (error) {
      console.error("❌ Web login error:", error);
      set({ 
        error: error instanceof Error ? error.message : "Login failed", 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    console.log("🌐 Web logout");
    set({ user: null, token: null, error: null });
  },
}));
