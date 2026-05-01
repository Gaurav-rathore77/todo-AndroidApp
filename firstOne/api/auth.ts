// Centralized IP Configuration - Change IP in app/config/ip.ts only
import { IP_ADDRESS } from '../app/config/ip';

// Auto-generate URLs from centralized IP
const API_URLS = [
  `http://${IP_ADDRESS}:3000`,  
        
];

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email?: string;
        profileImage?: string;
    };
}

export interface LoginRequest {
    username: string;
    email?: string;
    password: string;
    profileImage?: string;
}

export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
    let lastError: Error | null = null;
    
    // Try each URL until one works
    for (const apiUrl of API_URLS) {
        try {
            console.log(`🔍 Trying login API: ${apiUrl}`);
            const response = await fetch(`${apiUrl}/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            console.log(`✅ Login API working: ${apiUrl}`);
            return data;
        } catch (error) {
            console.log(`❌ Failed to connect to ${apiUrl}:`, error instanceof Error ? error.message : 'Unknown error');
            lastError = error instanceof Error ? error : new Error('Unknown error');
            continue;
        }
    }
    
    throw lastError || new Error('Network connection failed. Please check your internet connection and make sure backend is running on 192.168.1.4:3000');
};

export const registerApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
    let lastError: Error | null = null;
    
    // Try each URL until one works
    for (const apiUrl of API_URLS) {
        try {
            console.log(`🔍 Trying register API: ${apiUrl}`);
            const response = await fetch(`${apiUrl}/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            console.log(`✅ Register API working: ${apiUrl}`);
            return data;
        } catch (error) {
            console.log(`❌ Failed to connect to ${apiUrl}:`, error instanceof Error ? error.message : 'Unknown error');
            lastError = error instanceof Error ? error : new Error('Unknown error');
            continue;
        }
    }
    
    throw lastError || new Error('Network connection failed. Please check your internet connection and make sure backend is running on 192.168.1.4:3000');
};
