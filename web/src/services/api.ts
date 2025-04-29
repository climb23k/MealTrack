import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  last_name: string;
  birthdate: string;
}

export interface Meal {
  id: number;
  user_id: number;
  date: string;
  calories: number;
  protein: number;
  confidence: 'High' | 'Low';
  image_url?: string;
  glucose_readings: GlucoseReading[];
}

export interface GlucoseReading {
  timestamp: string;
  value: number;
}

export interface DailyStats {
  high_confidence_calories: number;
  low_confidence_calories: number;
  total_protein: number;
  date: string;
}

// Auth
export const login = async (lastName: string, birthdate: string) => {
  const response = await api.post('/auth/login', { last_name: lastName, birthdate });
  const { token } = response.data;
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// Initialize token from localStorage
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Meals
export const getMeals = async () => {
  const response = await api.get('/meals');
  return response.data as Meal[];
};

export const addMeal = async (data: FormData) => {
  const response = await api.post('/meals', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data as Meal;
};

// Stats
export const getDailyStats = async (date: string) => {
  const response = await api.get(`/stats/daily/${date}`);
  return response.data as DailyStats;
};

export default api;
