import { WeatherData } from '../types';

// WMO Weather code interpretations
const WEATHER_CODES: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear sky', icon: 'Sun' },
  1: { text: 'Mainly clear', icon: 'SunMedium' },
  2: { text: 'Partly cloudy', icon: 'CloudSun' },
  3: { text: 'Overcast', icon: 'Cloud' },
  45: { text: 'Fog', icon: 'CloudFog' },
  48: { text: 'Depositing rime fog', icon: 'CloudFog' },
  51: { text: 'Light drizzle', icon: 'CloudDrizzle' },
  53: { text: 'Moderate drizzle', icon: 'CloudDrizzle' },
  55: { text: 'Dense drizzle', icon: 'CloudDrizzle' },
  61: { text: 'Slight rain', icon: 'CloudRain' },
  63: { text: 'Moderate rain', icon: 'CloudRain' },
  65: { text: 'Heavy rain', icon: 'CloudRainWind' },
  71: { text: 'Slight snow', icon: 'CloudSnow' },
  73: { text: 'Moderate snow', icon: 'CloudSnow' },
  75: { text: 'Heavy snow', icon: 'CloudSnow' },
  77: { text: 'Snow grains', icon: 'Snowflake' },
  80: { text: 'Slight rain showers', icon: 'CloudRain' },
  81: { text: 'Moderate rain showers', icon: 'CloudRain' },
  82: { text: 'Violent rain showers', icon: 'CloudRainWind' },
  85: { text: 'Slight snow showers', icon: 'CloudSnow' },
  86: { text: 'Heavy snow showers', icon: 'CloudSnow' },
  95: { text: 'Thunderstorm', icon: 'CloudLightning' },
  96: { text: 'Thunderstorm with slight hail', icon: 'CloudLightning' },
  99: { text: 'Thunderstorm with heavy hail', icon: 'CloudLightning' },
};

export function getWeatherInfo(code: number): { text: string; icon: string } {
  return WEATHER_CODES[code] || { text: 'Clear', icon: 'Sun' };
}

export async function searchCities(query: string) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => ({
      name: item.name,
      country: item.country_code || item.country || '',
      admin1: item.admin1 || '',
      lat: item.latitude,
      lon: item.longitude,
      timezone: item.timezone,
    }));
  } catch (err) {
    console.error('Error geocoding city:', err);
    return [];
  }
}

export async function fetchWeatherData(
  lat: number,
  lon: number,
  city: string,
  country: string,
  units: 'celsius' | 'fahrenheit' = 'fahrenheit'
): Promise<WeatherData> {
  const tempUnit = units === 'celsius' ? 'celsius' : 'fahrenheit';
  const windUnit = units === 'celsius' ? 'kmh' : 'mph';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await res.json();
  const current = data.current;
  const currentCode = current.weather_code ?? 0;
  const currentInfo = getWeatherInfo(currentCode);

  const daily = (data.daily?.time || []).map((dateStr: string, idx: number) => {
    const code = data.daily.weather_code[idx] ?? 0;
    return {
      date: dateStr,
      weatherCode: code,
      weatherText: getWeatherInfo(code).text,
      tempMax: Math.round(data.daily.temperature_2m_max[idx] ?? 0),
      tempMin: Math.round(data.daily.temperature_2m_min[idx] ?? 0),
      precipitationProb: data.daily.precipitation_probability_max?.[idx] ?? 0,
    };
  });

  // Next 12 hours from current hour
  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13);
  let startIdx = (data.hourly?.time || []).findIndex((t: string) => t.startsWith(currentHourISO));
  if (startIdx === -1) startIdx = 0;

  const hourly = (data.hourly?.time || [])
    .slice(startIdx, startIdx + 12)
    .map((timeStr: string, i: number) => {
      const idx = startIdx + i;
      return {
        time: timeStr,
        temp: Math.round(data.hourly.temperature_2m[idx] ?? 0),
        weatherCode: data.hourly.weather_code[idx] ?? 0,
      };
    });

  return {
    city,
    country,
    lat,
    lon,
    current: {
      temp: Math.round(current.temperature_2m ?? 0),
      feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
      weatherCode: currentCode,
      weatherText: currentInfo.text,
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      windDirection: current.wind_direction_10m ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      uvIndex: 4, // placeholder estimate
      isDay: current.is_day === 1,
      precipitation: current.precipitation ?? 0,
    },
    daily,
    hourly,
    units,
    updatedAt: Date.now(),
  };
}
