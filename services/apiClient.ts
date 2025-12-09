
// services/apiClient.ts

// Configuração central da API

// Detecta se estamos em DEV ou PROD
const IS_PROD = import.meta.env.PROD;

// URL Base:
// Em PROD (Web): /yogaflow/backend/api/
// Em DEV (Local): http://localhost/yogaflow/backend/api/ (Ajuste se sua pasta local for diferente)
export const API_BASE_URL = IS_PROD
    ? '/yogaflow/backend/api'
    : 'http://localhost/yogaflow/backend/api';

export const apiClient = {
    get: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error (${response.status}): ${error}`);
        }
        return response.json();
    },

    post: async <T>(endpoint: string, body: any): Promise<T> => {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error (${response.status}): ${error}`);
        }
        return response.json();
    }
};
