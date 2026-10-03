import axios from 'axios';

export interface RegisterUserData {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
}

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Buscar dados do utilizador logado
export const getMe = async () => {
  const response = await api.get('/auth/me/');
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