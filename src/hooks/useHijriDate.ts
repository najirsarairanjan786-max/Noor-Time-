import { useState, useEffect } from 'react';
import { addDays, getHours } from 'date-fns';
import { fetchHijriDate, HijriDateInfo } from '../lib/api';
import { useSettings } from './useSettings';

export function useHijriDate() {
  const { settings } = useSettings();
  const [hijriDate, setHijriDate] = useState<HijriDateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDate() {
      try {
        setLoading(true);
        const now = new Date();
        const currentHour = getHours(now);
        
        // As per user request: Urdu tarikh (Hijri date) changes at 7:00 PM (19:00) local time
        // If hour is 19 (7 PM) or later, we use tomorrow's date for calculation
        let targetDate = currentHour >= 19 ? addDays(now, 1) : now;
        
        let offset = Number(settings.hijriOffset);
        if (isNaN(offset)) offset = -1;
        // Default to -1 so today is 30
        if (offset === 0 && !localStorage.getItem('user_set_offset')) {
          offset = -1;
        }
        if (offset !== 0) {
          targetDate = addDays(targetDate, offset);
        }
        
        const data = await fetchHijriDate(targetDate);
        if (isMounted) {
          setHijriDate(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load Hijri Date", error);
        if (isMounted) setLoading(false);
      }
    }

    loadDate();

    // Check every minute if we crossed 7 PM boundary
    const interval = setInterval(() => {
      loadDate();
    }, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [settings.hijriOffset]);

  return { hijriDate, loading };
}
