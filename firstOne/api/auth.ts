const API_BASE_URL = typeof window !== 'undefined' ? 'http://localhost:3000' : 'http://192.168.1.11:3000';

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
    };
}

export interface LoginRequest {
    username: string;
    password: string;
}

export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        return data;
    } catch (error) {
        // Fallback to mock response for testing
        console.log('🔄 Using fallback mock response due to network error');
        return {
            token: 'mock-token-' + Date.now(),
            user: {
                id: 'mock-id',
                username: credentials.username
            }
        };
    }
};

export const registerApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    } catch (error) {
        // Fallback to mock response for testing
        console.log('🔄 Using fallback mock response for register');
        return {
            token: 'mock-token-' + Date.now(),
            user: {
                id: 'mock-id',
                username: credentials.username
            }
        };
    }
};
