import { useEffect, useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Loader2,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import type { WeatherData, WeatherWidgetProps } from '@/types/GardenPage.types';

function weatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 2) return 'Mostly clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Heavy snow';
  if (code <= 99) return 'Thunderstorm';
  return 'Changing weather';
}

function weatherIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code <= 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 57) return CloudRain;
  if (code <= 67) return CloudRain;
  if (code <= 77) return CloudSnow;
  if (code <= 82) return CloudRain;
  if (code <= 86) return CloudSnow;
  return CloudRain;
}

function getWeatherTheme(code: number) {
  if (code === 0) return { panel: 'bg-[linear-gradient(135deg,#fef3c7_0%,#facc15_25%,#f1f5f9_100%)]', icon: 'bg-amber-200/80 text-amber-900', text: 'text-slate-800' };
  if (code <= 3) return { panel: 'bg-[linear-gradient(135deg,#e2e8f0_0%,#bae6fd_40%,#f8fafc_100%)]', icon: 'bg-sky-200/80 text-sky-900', text: 'text-slate-800' };
  if (code <= 48) return { panel: 'bg-[linear-gradient(135deg,#dfe7ef_0%,#cbd5e1_30%,#f3f4f6_100%)]', icon: 'bg-slate-300/80 text-slate-800', text: 'text-slate-800' };
  if (code <= 57) return { panel: 'bg-[linear-gradient(135deg,#dbeafe_0%,#93c5fd_35%,#e0f2fe_100%)]', icon: 'bg-blue-200/80 text-blue-900', text: 'text-blue-950' };
  if (code <= 67) return { panel: 'bg-[linear-gradient(135deg,#dbeafe_0%,#60a5fa_35%,#0f172a_100%)]', icon: 'bg-sky-200/80 text-sky-950', text: 'text-sky-50' };
  if (code <= 77) return { panel: 'bg-[linear-gradient(135deg,#e2e8f0_0%,#c4b5fd_35%,#eef2ff_100%)]', icon: 'bg-violet-200/80 text-violet-900', text: 'text-violet-950' };
  if (code <= 82) return { panel: 'bg-[linear-gradient(135deg,#dbeafe_0%,#38bdf8_35%,#082f49_100%)]', icon: 'bg-cyan-200/80 text-cyan-950', text: 'text-cyan-50' };
  if (code <= 86) return { panel: 'bg-[linear-gradient(135deg,#e2e8f0_0%,#a5b4fc_32%,#111827_100%)]', icon: 'bg-indigo-200/80 text-indigo-950', text: 'text-indigo-50' };
  return { panel: 'bg-[linear-gradient(135deg,#fef2f2_0%,#fca5a5_28%,#0f172a_100%)]', icon: 'bg-red-200/80 text-red-950', text: 'text-red-50' };
}

export function WeatherWidget({ address, addressNumber, latitude, longitude }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [locationName, setLocationName] = useState('');

  const fullAddress = addressNumber ? `${address} ${addressNumber}` : address;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    async function fetchWeather() {
      try {
        const weatherTarget =
          typeof latitude === 'number' && typeof longitude === 'number'
            ? { latitude, longitude }
            : null;

        let latitudeValue = latitude;
        let longitudeValue = longitude;

        if (!weatherTarget) {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(fullAddress)}&count=1&language=en&format=json`,
          );
          if (!geoRes.ok) throw new Error('geocoding failed');

          const geoData = (await geoRes.json()) as {
            results?: { latitude: number; longitude: number; name: string; country: string }[];
          };
          const loc = geoData.results?.[0];
          if (!loc) throw new Error('location not found');

          latitudeValue = loc.latitude;
          longitudeValue = loc.longitude;
          setLocationName(`${loc.name}${loc.country ? `, ${loc.country}` : ''}`);
        } else {
          setLocationName(fullAddress);
        }

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitudeValue}&longitude=${longitudeValue}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`,
        );
        if (!weatherRes.ok) throw new Error('weather fetch failed');

        const weatherData = (await weatherRes.json()) as {
          current: {
            temperature_2m: number;
            apparent_temperature: number;
            relative_humidity_2m: number;
            weather_code: number;
            wind_speed_10m: number;
          };
        };

        if (cancelled) return;

        setWeather({
          temperature: weatherData.current.temperature_2m,
          windspeed: weatherData.current.wind_speed_10m,
          humidity: weatherData.current.relative_humidity_2m,
          weatherCode: weatherData.current.weather_code,
          description: weatherDescription(weatherData.current.weather_code),
        });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchWeather();
    return () => { cancelled = true; };
  }, [fullAddress, latitude, longitude]);

  const Icon = weather ? weatherIcon(weather.weatherCode) : Cloud;
  const theme = weather ? getWeatherTheme(weather.weatherCode) : { panel: 'bg-[linear-gradient(135deg,#f1f5f9_0%,#dbeafe_25%,#f8fafc_100%)]', icon: 'bg-slate-200/80 text-slate-800', text: 'text-slate-800' };

  return (
    <div className={`flex items-center gap-5 px-6 py-5 ${theme.panel}`}>
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_4px_rgba(15,23,42,0.08)] backdrop-blur-sm ${theme.icon}`}>
        {loading ? (
          <Loader2 className="text-primary h-7 w-7 animate-spin" />
        ) : error ? (
          <Cloud className="text-primary h-8 w-8" />
        ) : (
          <Icon className="text-primary h-8 w-8" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${theme.text} opacity-80`}>Weather at</p>
        <p className={`truncate text-lg font-semibold ${theme.text}`}>{locationName || fullAddress}</p>
      </div>

      {loading ? (
        <div className={`text-sm ${theme.text} opacity-80`}>Loading…</div>
      ) : error ? (
        <p className={`text-sm ${theme.text} opacity-80`}>Weather unavailable</p>
      ) : weather ? (
        <div className="flex flex-wrap items-center justify-end gap-5">
          <div className="text-center">
            <p className={`text-4xl font-bold leading-none ${theme.text}`}>{Math.round(weather.temperature)}°C</p>
            <p className={`mt-1 text-xs ${theme.text} opacity-80`}>{weather.description}</p>
          </div>

          <div className={`flex flex-col gap-1.5 text-sm ${theme.text} opacity-90`}>
            <span className="flex items-center gap-1.5">
              <Wind className="h-4 w-4" />
              {Math.round(weather.windspeed)} km/h
            </span>
            <span className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4" />
              {weather.humidity}% humidity
            </span>
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4" />
              Feels like {Math.round(weather.temperature)}°C
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
