const API_BASE_URL = 'http://localhost:3000/api';

export const fetchPlaces = async (category = 'All') => {
  const url = category === 'All' ? `${API_BASE_URL}/places` : `${API_BASE_URL}/places?category=${category}`;
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
