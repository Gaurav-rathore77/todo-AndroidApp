const API_BASE_URL = 'http://localhost:3000';

export default async function fetchUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
