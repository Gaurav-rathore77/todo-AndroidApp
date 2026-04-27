import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loginApi } from '../api/auth'

interface User {
    id: string
    username: string
}

interface UserState {
    user: User | null
    token: string | null
    isLoading: boolean
    error: string | null
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            login: async (username: string, password: string) => {
                set({ isLoading: true, error: null })
                try {
                    const data = await loginApi({ username, password })
                    set({ token: data.token, user: data.user, isLoading: false })
                    return true
                } catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Login failed', isLoading: false })
                    return false
                }
            },

            logout: () => {
                set({ user: null, token: null, error: null })
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
)
