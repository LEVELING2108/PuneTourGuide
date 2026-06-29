const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch places');
  return response.json();
};

export const fetchEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/events`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

export const fetchItinerary = async () => {
  const response = await fetch(`${API_BASE_URL}/itinerary`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch itinerary');
  return response.json();
};

export const updateStopStatus = async (id, done) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ done })
  });
  if (!response.ok) throw new Error('Failed to update stop status');
  return response.json();
};

export const addStopToItinerary = async (stopData) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(stopData)
  });
  if (!response.ok) throw new Error('Failed to add stop');
  return response.json();
};

export const deleteStopFromItinerary = async (id) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete stop');
  return response.json();
};

export const toggleSavePlace = async (id, isSaved) => {
  const response = await fetch(`${API_BASE_URL}/places/${id}/save`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ isSaved })
  });
  if (!response.ok) throw new Error('Failed to toggle save status');
  return response.json();
};

export const fetchUserStats = async () => {
  const response = await fetch(`${API_BASE_URL}/user/stats`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch user stats');
  return response.json();
};

export const optimizeItinerary = async (itineraryDayId, mode) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/optimize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ itineraryDayId, mode })
  });
  if (!response.ok) throw new Error('Failed to optimize itinerary');
  return response.json();
};
