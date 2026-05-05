import { create } from "zustand";
import { loginApi } from "../../api/auth";

interface User {
  id: string;
  username: string;
  email?: string;
  profileImage?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  fingerprintLogin: () => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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

  fingerprintLogin: () => {
    console.log("👆 Fingerprint login");
    const mockUser = {
      id: "fingerprint_user",
      username: "Fingerprint User",
      email: "user@fingerprint.com",
      profileImage: undefined
    };
    
    const mockToken = "fingerprint_token_" + Date.now();
    
    set({
      user: mockUser,
      token: mockToken,
      isLoading: false,
      error: null
    });
  },

  logout: () => {
    console.log("🌐 Web logout");
    set({ user: null, token: null, error: null });
  },

  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  },
}));
