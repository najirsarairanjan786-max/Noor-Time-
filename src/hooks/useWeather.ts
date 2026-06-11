import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
}

export function useWeather(location: { lat: number; lng: number } | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    if (!location) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,weather_code&daily=precipitation_probability_max&timezone=auto`);
        
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        
        const prob = data.daily?.precipitation_probability_max?.[0] || 0;
        
        setWeather({
          temperature: data.current?.temperature_2m || 0,
          precipitationProbability: prob,
          weatherCode: data.current?.weather_code || 0
        });
      } catch (err) {
        console.warn("Could not fetch weather:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location?.lat, location?.lng]);

  return { weather, loading, error };
}
