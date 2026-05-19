import { useState, useEffect } from 'react';
import { fetchPayerTimes, PrayerTimings, GregorianDateInfo, AladhanResponse } from '../lib/api';

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export function useData(location: Location | null, method: number = 1, school: number = 1) {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [gregorian, setGregorian] = useState<GregorianDateInfo | null>(null);
  const [date, setDate] = useState<AladhanResponse['data']['date'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!location) return;
      try {
        setLoading(true);
        const data = await fetchPayerTimes(location.lat, location.lng, method, school);
        if (isMounted) {
          setTimings(data.timings);
          setGregorian(data.date.gregorian);
          setDate(data.date);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load prayer times", error);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    // reload at midnight
    const interval = setInterval(() => {
      loadData();
    }, 60 * 60 * 1000); // Check every hour

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location?.lat, location?.lng, method, school]);

  return { timings, gregorian, date, loading };
}
