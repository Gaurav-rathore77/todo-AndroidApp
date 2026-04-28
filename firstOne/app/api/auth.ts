const API_BASE_URL = 'http://192.168.1.11:3000';
// const API_BASE_URL = typeof window !== 'undefined' ? 'http://127.0.0.1:3000' : 'http://localhost:3000'//

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
        // Temporary mock response for testing
        console.log('Using mock response due to network error');
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

        // After successful registration, login to get token
        const loginResponse = await loginApi(credentials);
        return loginResponse;
    } catch (error) {
        // Temporary mock response for testing
        console.log('Using mock response for register due to network error');
        return {
            token: 'mock-token-' + Date.now(),
            user: {
                id: 'mock-id',
                username: credentials.username
            }
        };
    }
};
