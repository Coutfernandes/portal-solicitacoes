import axios from 'axios';

export interface RegisterUserData {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Interceptor de Requisição: Injeta o Token JWT em todas as chamadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Trata a expiração/ausência de sessão (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpa os tokens inválidos ou expirados do armazenamento local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Força o redirecionamento caso o app não trate o estado globalmente
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Buscar dados do utilizador logado
export const getMe = async (): Promise<AuthenticatedUser> => {
  const response = await api.get<AuthenticatedUser>('/auth/me/');
  return response.data;
};

// Registar novo utilizador
export const registerUser = async (userData: RegisterUserData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

// Exportar CSV
export const exportarCSV = async () => {
  const response = await api.get('/solicitacoes/exportar_csv/', {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'solicitacoes.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};