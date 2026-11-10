import axios from 'axios';

const PUNE = { lat: 18.5204, lng: 73.8567 };

/** WMO weather codes → short label. */
const label = (code: number) => {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Storm';
};

/** Current Pune weather from Open-Meteo (free, no key). */
export async function puneWeather() {
  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: { latitude: PUNE.lat, longitude: PUNE.lng, current: 'temperature_2m,weather_code', timezone: 'Asia/Kolkata' },
    timeout: 5000,
  });
  const code = Number(data?.current?.weather_code ?? 0);
  return {
    tempC: Math.round(Number(data?.current?.temperature_2m)),
    code,
    condition: label(code),
    isRaining: code >= 51 && code <= 82,
  };
}
