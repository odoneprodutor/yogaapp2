import { User } from '../types';
import { apiClient } from './apiClient';

// Chaves para o LocalStorage
const SESSION_KEY = 'yogaflow_session';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<User> => {
    try {
      // 1. Tentar Login na API real
      interface LoginResponse {
        user: User;
        message: string;
      }
      const data = await apiClient.post<LoginResponse>('login.php', { email, password });
      const sessionUser: User = data.user;

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return sessionUser;

    } catch (apiError: any) {
      console.error("API Login failed:", apiError);

      // Se for erro de credenciais (401), repassamos o erro pro usuário
      if (apiError.message.includes('401') || apiError.message.toLowerCase().includes('inválid')) {
        throw new Error('Email ou senha inválidos.');
      }

      throw new Error('Erro de conexão com o servidor. Tente novamente mais tarde.');
    }
  },

  // Cadastro
  signup: async (name: string, email: string, password: string): Promise<User> => {
    try {
      interface RegisterResponse {
        user: User;
        message: string;
      }

      const data = await apiClient.post<RegisterResponse>('register.php', { name, email, password });
      const sessionUser: User = data.user;

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    } catch (apiError: any) {
      console.error("API Signup failed:", apiError);
      throw new Error(apiError.message || 'Erro ao realizar cadastro.');
    }
  },

  // Logout
  logout: async () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Verificar sessão atual ao recarregar página
  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
  }
};