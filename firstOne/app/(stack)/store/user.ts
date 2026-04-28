import { create } from 'zustand'

// No persistence for now - in-memory only
import { loginApi } from '../../api/auth'

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

export const useUserStore = create<UserState>((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
            console.log('Attempting login with:', username)
            const data = await loginApi({ username, password })
            console.log('Login response:', data)
            set({ token: data.token, user: data.user, isLoading: false })
            return true
        } catch (error) {
            console.error('Login error:', error)
            set({ error: error instanceof Error ? error.message : 'Login failed', isLoading: false })
            return false
        }
    },

    logout: () => {
        set({ user: null, token: null, error: null })
    },
}))
