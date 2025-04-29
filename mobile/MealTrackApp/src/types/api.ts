export interface User {
  id: number;
  last_name: string;
  birthdate: string;
}

export interface GlucoseReading {
  id: number;
  timestamp: string;
  value: number;
}

export interface Meal {
  id: number;
  date: string;
  calories: number;
  protein: number;
  high_confidence: boolean;
  image?: string;
  glucose_readings: GlucoseReading[];
}

export interface DailyStats {
  date: string;
  high_confidence_calories: number;
  low_confidence_calories: number;
  total_protein: number;
}

export interface LoginResponse {
  token: string;
}

export interface ApiError {
  error: string;
}
