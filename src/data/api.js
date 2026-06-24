const API_BASE_URL = 'http://localhost:3000/api';

export const fetchPlaces = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.q) query.append('q', params.q);
  if (params.isSaved) query.append('isSaved', 'true');
  if (params.isDiscovered) query.append('isDiscovered', 'true');
  
  const url = `${API_BASE_URL}/places?${query.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch places');
  return response.json();
};

export const fetchEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/events`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

export const fetchItinerary = async () => {
  const response = await fetch(`${API_BASE_URL}/itinerary`);
  if (!response.ok) throw new Error('Failed to fetch itinerary');
  return response.json();
};

export const updateStopStatus = async (id, done) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done })
  });
  if (!response.ok) throw new Error('Failed to update stop status');
  return response.json();
};

export const addStopToItinerary = async (stopData) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stopData)
  });
  if (!response.ok) throw new Error('Failed to add stop');
  return response.json();
};

export const deleteStopFromItinerary = async (id) => {
  const response = await fetch(`${API_BASE_URL}/itinerary/stops/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete stop');
  return response.json();
};

export const toggleSavePlace = async (id, isSaved) => {
  const response = await fetch(`${API_BASE_URL}/places/${id}/save`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isSaved })
  });
  if (!response.ok) throw new Error('Failed to toggle save status');
  return response.json();
};

export const fetchUserStats = async () => {
  const response = await fetch(`${API_BASE_URL}/user/stats`);
  if (!response.ok) throw new Error('Failed to fetch user stats');
  return response.json();
};
