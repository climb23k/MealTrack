import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, DailyStats, LoginResponse, Meal } from '../types/api';

const API_URL = __DEV__ ? 'http://localhost:5000' : 'https://your-production-url.com';

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

async function setAuthToken(token: string): Promise<void> {
  return AsyncStorage.setItem('auth_token', token);
}

async function clearAuthToken(): Promise<void> {
  return AsyncStorage.removeItem('auth_token');
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No auth token');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export async function login(lastName: string, birthdate: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ last_name: lastName, birthdate }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  await setAuthToken(data.token);
}

export async function logout(): Promise<void> {
  await clearAuthToken();
}

export async function getMeals(date?: string): Promise<Meal[]> {
  const endpoint = date ? `/api/meals?date=${date}` : '/api/meals';
  const response = await fetchWithAuth(endpoint);
  return response.meals;
}

export async function addMeal(formData: FormData): Promise<Meal> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No auth token');
  }

  const response = await fetch(`${API_URL}/api/meals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to add meal');
  }

  return response.json();
}

export async function addGlucoseReading(
  mealId: number,
  timestamp: string,
  value: number
): Promise<void> {
  await fetchWithAuth(`/api/meals/${mealId}/glucose`, {
    method: 'POST',
    body: JSON.stringify({ timestamp, value }),
  });
}

export async function getDailyStats(date: string): Promise<DailyStats> {
  return fetchWithAuth(`/api/stats/daily?date=${date}`);
}
