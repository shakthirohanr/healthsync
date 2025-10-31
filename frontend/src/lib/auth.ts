// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Auth token management
export const TOKEN_KEY = 'healthsync_access_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// User type
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  image?: string | null;
  phoneNumber?: string | null;
  age?: number | null;
  gender?: string | null;
}

// Auth API calls
export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 uses 'username' field for email
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Invalid credentials');
  }

  const data = await response.json();
  setToken(data.access_token);
  return data;
}

export async function register(
  name: string, 
  email: string, 
  password: string, 
  role: 'PATIENT' | 'DOCTOR' = 'PATIENT',
  phoneNumber?: string,
  age?: number,
  gender?: string
): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role, phoneNumber, age, gender }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(error.detail || 'Registration failed');
  }

  return await response.json();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    removeToken();
    return null;
  }

  return await response.json();
}

export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
