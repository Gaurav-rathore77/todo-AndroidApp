import { create } from "zustand";
// Temporarily disable persist to avoid AsyncStorage errors
// import { persist, createJSONStorage } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";
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
          console.log("📱 Mobile login attempt:", username);
          const data = await loginApi({ username, password });
          console.log("✅ Mobile login success:", data);
          
          // Force fix profile image URL if it has typo
          if (data.user.profileImage && data.user.profileImage.includes('profiless')) {
            console.log("🔧 Fixing profile image URL in login...");
            data.user.profileImage = data.user.profileImage.replace('profiless', 'profiles');
            console.log("✅ Fixed URL:", data.user.profileImage);
          }
          
          set({ token: data.token, user: data.user, isLoading: false });
          return true;
        } catch (error) {
          console.error("❌ Mobile login error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Login failed", 
            isLoading: false 
          });
          return false;
        }
      },

      logout: () => {
        console.log("📱 Mobile logout");
        set({ user: null, token: null, error: null });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },
    })
);
