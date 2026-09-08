import React, { useState, useEffect } from 'react';
import {
  Sun,
  SunMedium,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Search,
  Check,
  Thermometer,
} from 'lucide-react';
import { WeatherData, WidgetSize } from '../../types';
import { fetchWeatherData, searchCities, getWeatherInfo } from '../../services/weatherService';

interface WeatherWidgetProps {
  size: WidgetSize;
  settings?: {
    city?: string;
    country?: string;
    lat?: number;
    lon?: number;
    units?: 'celsius' | 'fahrenheit';
  };
  onUpdateSettings?: (settings: any) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  size,
  settings,
  onUpdateSettings,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const city = settings?.city || 'San Francisco';
  const country = settings?.country || 'US';
  const lat = settings?.lat ?? 37.7749;
  const lon = settings?.lon ?? -122.4194;
  const units = settings?.units || 'fahrenheit';

  const loadWeather = async (
    targetLat = lat,
    targetLon = lon,
    targetCity = city,
    targetCountry = country,
    targetUnits = units
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(
        targetLat,
        targetLon,
        targetCity,
        targetCountry,
        targetUnits
      );
      setWeather(data);
    } catch (err: any) {
      console.error('Weather load error:', err);
      setError('Unable to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(lat, lon, city, country, units);
  }, [lat, lon, city, country, units]);

  // Request browser geolocation on user click
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uLat = pos.coords.latitude;
        const uLon = pos.coords.longitude;
        try {
          // Reverse geocode or fetch weather directly
          const newSettings = {
            city: 'My Location',
            country: '',
            lat: uLat,
            lon: uLon,
            units,
          };
          onUpdateSettings?.(newSettings);
          await loadWeather(uLat, uLon, 'My Location', '', units);
          setShowSearch(false);
        } catch {
          setError('Location lookup failed');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed', err);
        setLoading(false);
        setError('Location access denied');
      }
    );
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = (result: any) => {
    const newSettings = {
      city: result.name,
      country: result.country,
      lat: result.lat,
      lon: result.lon,
      units,
    };
    onUpdateSettings?.(newSettings);
    loadWeather(result.lat, result.lon, result.name, result.country, units);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const toggleUnits = () => {
    const nextUnits = units === 'celsius' ? 'fahrenheit' : 'celsius';
    onUpdateSettings?.({
      ...settings,
      units: nextUnits,
    });
  };

  const renderWeatherIcon = (code: number, className = 'w-6 h-6') => {
    const info = getWeatherInfo(code);
    switch (info.icon) {
      case 'Sun':
        return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
      case 'SunMedium':
        return <SunMedium className={`${className} text-amber-300`} />;
      case 'CloudSun':
        return <CloudSun className={`${className} text-amber-300`} />;
      case 'Cloud':
        return <Cloud className={`${className} text-zinc-300`} />;
      case 'CloudFog':
        return <CloudFog className={`${className} text-zinc-400`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={`${className} text-blue-300`} />;
      case 'CloudRain':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'CloudRainWind':
        return <CloudRainWind className={`${className} text-indigo-400`} />;
      case 'CloudSnow':
        return <CloudSnow className={`${className} text-sky-200`} />;
      case 'Snowflake':
        return <Snowflake className={`${className} text-sky-100`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${className} text-amber-400`} />;
      default:
        return <Sun className={`${className} text-amber-400`} />;
    }
  };

  const isCompact = size === '1x1';

  return (
    <div className="relative h-full flex flex-col justify-between">
      {/* Top Bar: Location & Controls */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700/50 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate max-w-[120px]">{city}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleUnits}
            className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 hover:text-indigo-300 hover:bg-zinc-700 transition-colors"
            title="Toggle °C / °F"
          >
            {units === 'celsius' ? '°C' : '°F'}
          </button>
          <button
            type="button"
            onClick={() => loadWeather()}
            disabled={loading}
            className={`p-1 text-zinc-400 hover:text-zinc-200 rounded transition-colors ${
              loading ? 'animate-spin' : ''
            }`}
            title="Refresh weather"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* City Search Popup */}
      {showSearch && (
        <div className="absolute top-8 left-0 right-0 z-30 bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <form onSubmit={handleCitySearch} className="flex gap-1.5 mb-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city (e.g. Tokyo, London)..."
                className="w-full bg-zinc-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              {searching ? '...' : <Search className="w-3.5 h-3.5" />}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 mb-2 text-xs text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
          >
            <MapPin className="w-3 h-3" />
            <span>Use current GPS location</span>
          </button>

          {searchResults.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectCity(res)}
                  className="w-full text-left px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded flex items-center justify-between"
                >
                  <span className="truncate">
                    {res.name}
                    {res.admin1 ? `, ${res.admin1}` : ''}
                  </span>
                  <span className="text-[10px] text-zinc-400 ml-1">{res.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Weather Info */}
      {loading && !weather ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          <span className="text-xs text-zinc-400">Loading forecast...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
          <p className="text-xs text-rose-400 mb-2">{error}</p>
          <button
            type="button"
            onClick={() => loadWeather()}
            className="px-2 py-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
          >
            Retry
          </button>
        </div>
      ) : weather ? (
        <div className="flex-1 flex flex-col justify-between gap-3">
          {/* Current Temperature & Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
                {renderWeatherIcon(weather.current.weatherCode, 'w-8 h-8')}
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                  <span>{weather.current.temp}°</span>
                  <span className="text-sm font-normal text-zinc-400 uppercase">
                    {units === 'celsius' ? 'C' : 'F'}
                  </span>
                </div>
                <div className="text-xs font-medium text-zinc-300 capitalize">
                  {weather.current.weatherText}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-1 text-xs text-zinc-400">
                <Thermometer className="w-3 h-3 text-zinc-500" />
                <span>Feels {weather.current.feelsLike}°</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-zinc-400">
                <Droplets className="w-3 h-3 text-blue-400" />
                <span>{weather.current.humidity}%</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-zinc-400">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>
                  {weather.current.windSpeed} {units === 'celsius' ? 'km/h' : 'mph'}
                </span>
              </div>
            </div>
          </div>

          {/* Hourly Forecast (If wide or large size) */}
          {!isCompact && weather.hourly && weather.hourly.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/60">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Hourly Forecast
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {weather.hourly.slice(0, 6).map((h, idx) => {
                  const hourDate = new Date(h.time);
                  const hourLabel = hourDate.toLocaleTimeString([], {
                    hour: 'numeric',
                    hour12: true,
                  });
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[50px] flex flex-col items-center p-1.5 rounded-lg bg-zinc-800/40 border border-zinc-700/30 text-center"
                    >
                      <span className="text-[10px] text-zinc-400">{hourLabel}</span>
                      <div className="my-1">{renderWeatherIcon(h.weatherCode, 'w-4 h-4')}</div>
                      <span className="text-xs font-semibold text-zinc-200">{h.temp}°</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5-Day Daily Forecast (If tall/large size like 1x2, 2x2, 3x2) */}
          {(size === '1x2' || size === '2x2' || size === '3x2') && weather.daily && (
            <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Upcoming Days
              </div>
              {weather.daily.slice(1, 5).map((d, idx) => {
                const dayDate = new Date(d.date + 'T00:00:00');
                const dayName = dayDate.toLocaleDateString([], { weekday: 'short' });
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-800/30"
                  >
                    <span className="w-10 font-medium text-zinc-300">{dayName}</span>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      {renderWeatherIcon(d.weatherCode, 'w-3.5 h-3.5')}
                      <span className="text-[11px] truncate max-w-[80px]">{d.weatherText}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                      <span>{d.tempMax}°</span>
                      <span className="text-zinc-500 font-normal text-[11px]">{d.tempMin}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
