import { IP_ADDRESS, getApiUrl } from "../app/config/ip";

export interface Product {
    _id: string;
    name: string;
    price: number;
    description?: string;
    image?: string;
}

class productService {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }
    private async apiCall(endpoint: string, options: RequestInit = {}) {
        const url = `${getApiUrl('/product')}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers,
        };
   
        try {
            const response = await fetch(url, { ...options, headers });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async getAllProducts(): Promise<Product[]> {
        return await this.apiCall('/all');
    }
}

const productServiceInstance = new productService();
export default productServiceInstance;

























// class ProductService {
//     private token: string | null = null;

//     setToken(token: string | null) {
//         this.token = token;
//     }

//     // Centralized API call method
//     private async apiCall(endpoint: string, options: RequestInit = {}) {
//         const url = `${getApiUrl('/product')}${endpoint}`;
//         const headers = {
//             'Content-Type': 'application/json',
//             ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
//             ...options.headers,
//         };
   
//         try {
//             const response = await fetch(url, { ...options, headers });
            
//             if (!response.ok) {
//                 throw new Error(`API Error: ${response.status} - ${response.statusText}`);
//             }

//             return await response.json();
//         } catch (error) {
//             console.error(`API call failed for ${endpoint}:`, error);
//             throw error;
//         }
//     }

//     // Get all products
//     async getAllProducts(): Promise<Product[]> {
//         return await this.apiCall('/all');
//     }

//     // Create new product
//     async createProduct(productData: Omit<Product, '_id'>): Promise<Product> {
//         return await this.apiCall('/create', {
//             method: 'POST',
//             body: JSON.stringify(productData),
//         });
//     }

//     // Update product
//     async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
//         return await this.apiCall(`/${id}`, {
//             method: 'PUT',
//             body: JSON.stringify(productData),
//         });
//     }

//     // Delete product
//     async deleteProduct(id: string): Promise<void> {
//         return await this.apiCall(`/${id}`, {
//             method: 'DELETE',
//         });
//     }

//     // Get single product
//     async getProduct(id: string): Promise<Product> {
//         return await this.apiCall(`/${id}`);
//     }
// }

// Singleton instance
// export const productService = new ProductService();
