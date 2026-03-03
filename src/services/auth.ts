import type { LoginCredentials, AuthResponse } from '../types';

const WORKER_URL = import.meta.env.VITE_WORKER_API_URL;
const TOKEN_KEY = 'bunnyt_app_token';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${WORKER_URL}/managment/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const json = await response.json();
    if (json.ok && json.data.token) {
      localStorage.setItem(TOKEN_KEY, json.data.token);
      return { success: true, token: json.data.token };
    }

    return {
      success: false,
      message: json.message || 'Error al iniciar sesión'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'No se pudo conectar con el servidor de autenticación'
    };
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  // Opcional: Validar si el token ha expirado decodificando el JWT base64
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    return true; // Si no se puede decodificar, asumimos que es válido hasta que el backend diga lo contrario
  }
};
