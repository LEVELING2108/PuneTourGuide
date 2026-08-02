const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// ── Client-Side In-Memory Cache ───────────────────────────
const apiCache = new Map();
const CACHE_TTL_MS = 45 * 1000; // 45 seconds TTL

const getCached = (key) => {
  const item = apiCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return item.data;
};

const setCache = (key, data) => {
  apiCache.set(key, { timestamp: Date.now(), data });
};

export const clearApiCache = (prefix = '') => {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
};

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('pune_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const loginUser = async (email, password) => {
  clearApiCache();
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }
  
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('pune_auth_token', data.token);
    localStorage.setItem('pune_user_name', data.user.name);
  }
  return data;
};

export const registerUser = async (name, email, password) => {
  clearApiCache();
  const response = await fetch(`${API_BASE_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }
  
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('pune_auth_token', data.token);
    localStorage.setItem('pune_user_name', data.user.name);
  }
  return data;
};

export const logoutUser = () => {
  clearApiCache();
  localStorage.removeItem('pune_auth_token');
  localStorage.removeItem('pune_user_name');
  localStorage.removeItem('pune_user_bio');
  localStorage.removeItem('pune_user_avatar');
};

export const fetchPlaces = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.q) query.append('q', params.q);
  if (params.isSaved) query.append('isSaved', 'true');
  if (params.isDiscovered) query.append('isDiscovered', 'true');
  
  const url = `${API_BASE_URL}/places?${query.toString()}`;
  const cached = getCached(url);
  if (cached) return cached;

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch places');
  const data = await response.json();
  setCache(url, data);
  return data;
};

export const fetchEvents = async () => {
  const cacheKey = `${API_BASE_URL}/events`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await fetch(cacheKey, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch events');
  const data = await response.json();
  setCache(cacheKey, data);
  return data;
};

export const fetchItinerary = async () => {
  const cacheKey = `${API_BASE_URL}/itinerary`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await fetch(cacheKey, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch itinerary');
  const data = await response.json();
  setCache(cacheKey, data);
  return data;
};

export const updateStopStatus = async (id, done) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ done })
  });
  if (!response.ok) throw new Error('Failed to update stop status');
  clearApiCache('http');
  return response.json();
};

export const addStopToItinerary = async (stopData) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(stopData)
  });
  if (!response.ok) throw new Error('Failed to add stop');
  clearApiCache('http');
  return response.json();
};

export const deleteStopFromItinerary = async (id) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete stop');
  clearApiCache('http');
  return response.json();
};

export const toggleSavePlace = async (id, isSaved) => {
  const response = await fetch(`${API_BASE_URL}/places/${id}/save`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ isSaved })
  });
  if (!response.ok) throw new Error('Failed to toggle save status');
  clearApiCache('http');
  return response.json();
};

export const fetchUserStats = async () => {
  const cacheKey = `${API_BASE_URL}/user/stats`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await fetch(cacheKey, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user stats');
  const data = await response.json();
  setCache(cacheKey, data);
  return data;
};

export const optimizeItinerary = async (itineraryDayId, mode) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/optimize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ itineraryDayId, mode })
  });
  if (!response.ok) throw new Error('Failed to optimize itinerary');
  clearApiCache('http');
  return response.json();
};

export const generateItinerary = async (generationParams) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/generate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(generationParams)
  });
  if (!response.ok) throw new Error('Failed to generate itinerary');
  clearApiCache('http');
  return response.json();
};

export const fetchWeather = async () => {
  const cacheKey = `${API_BASE_URL}/weather`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await fetch(cacheKey, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch weather status');
  const data = await response.json();
  setCache(cacheKey, data);
  return data;
};

export const toggleWeather = async () => {
  const response = await fetch(`${API_BASE_URL}/weather/toggle`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to toggle weather status');
  clearApiCache('http');
  return response.json();
};

export const adaptItineraryForWeather = async (itineraryDayId, userLanguage) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/adapt-weather`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ itineraryDayId, userLanguage })
  });
  if (!response.ok) throw new Error('Failed to adapt itinerary for weather');
  clearApiCache('http');
  return response.json();
};
