import { Request, Response } from 'express';
import redis from '../services/cacheService';

let memoryWeather = 'Sunny';
let memoryTemp = 32;

export const getWeather = async (req: Request, res: Response) => {
  try {
    let weather = memoryWeather;
    let temp = memoryTemp;
    
    try {
      const cached = await redis.get('weather:status');
      if (cached) {
        const parsed = JSON.parse(cached);
        weather = parsed.weather;
        temp = parsed.temp;
      } else {
        await redis.set('weather:status', JSON.stringify({ weather, temp }));
      }
    } catch (redisError) {
      console.warn('Redis unavailable, using memory weather state');
    }
    
    res.json({ weather, temp });
  } catch (error) {
    console.error('Failed to get weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather status' });
  }
};

export const toggleWeather = async (req: Request, res: Response) => {
  try {
    let currentWeather = memoryWeather;

    try {
      const cached = await redis.get('weather:status');
      if (cached) {
        const parsed = JSON.parse(cached);
        currentWeather = parsed.weather;
      }
    } catch (redisError) {}

    const newWeather = currentWeather === 'Sunny' ? 'Rainy' : 'Sunny';
    const newTemp = newWeather === 'Sunny' ? 32 : 24;

    memoryWeather = newWeather;
    memoryTemp = newTemp;

    try {
      await redis.set('weather:status', JSON.stringify({ weather: newWeather, temp: newTemp }));
    } catch (redisError) {}

    console.log(`[Weather] Toggled weather to ${newWeather} (${newTemp}°C)`);
    res.json({ weather: newWeather, temp: newTemp });
  } catch (error) {
    console.error('Failed to toggle weather:', error);
    res.status(500).json({ error: 'Failed to toggle weather status' });
  }
};
