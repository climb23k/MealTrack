import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID = '89AnwICSuVGoR2doNsAi6xQi9dAoXca3';
const CLIENT_SECRET = '5sPctIPhYRDFLiDu';
const DEXCOM_API_URL = 'https://api.dexcom.com';
const REDIRECT_URI = 'mealtrack://auth/callback';

interface DexcomToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  scope: string;
}

interface GlucoseReading {
  systemTime: string;
  value: number;
  status: string;
}

let cachedToken: string | null = null;

async function getStoredToken(): Promise<DexcomToken | null> {
  const tokenStr = await AsyncStorage.getItem('dexcom_token');
  if (!tokenStr) return null;
  return JSON.parse(tokenStr);
}

async function storeToken(token: DexcomToken): Promise<void> {
  await AsyncStorage.setItem('dexcom_token', JSON.stringify(token));
  cachedToken = token.access_token;
}

async function refreshAccessToken(refreshToken: string): Promise<DexcomToken> {
  const response = await fetch(`${DEXCOM_API_URL}/v2/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const token: DexcomToken = await response.json();
  await storeToken(token);
  return token;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const storedToken = await getStoredToken();
  if (!storedToken) {
    throw new Error('No Dexcom token found');
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const tokenData = JSON.parse(atob(storedToken.access_token.split('.')[1]));
  const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (currentTime + fiveMinutes >= expirationTime) {
    const newToken = await refreshAccessToken(storedToken.refresh_token);
    return newToken.access_token;
  }

  cachedToken = storedToken.access_token;
  return storedToken.access_token;
}

export async function getGlucoseReadings(startTime: Date, endTime: Date): Promise<GlucoseReading[]> {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${DEXCOM_API_URL}/v3/users/self/egvs?startDate=${startTime.toISOString()}&endDate=${endTime.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch glucose readings');
    }

    const data = await response.json();
    return data.records;
  } catch (error) {
    console.error('Error fetching glucose readings:', error);
    throw error;
  }
}

export async function getLatestReading(): Promise<GlucoseReading | null> {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 10 * 60 * 1000); // Last 10 minutes
    const readings = await getGlucoseReadings(startTime, endTime);
    return readings.length > 0 ? readings[readings.length - 1] : null;
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return null;
  }
}

export function generateAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'offline_access',
  });

  return `${DEXCOM_API_URL}/v2/oauth2/login?${params.toString()}`;
}

export async function handleAuthCode(code: string): Promise<void> {
  const response = await fetch(`${DEXCOM_API_URL}/v2/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange auth code for token');
  }

  const token: DexcomToken = await response.json();
  await storeToken(token);
}
