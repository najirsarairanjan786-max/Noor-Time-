import { useState, useEffect } from 'react';
import { SAHIH_BUKHARI_HADEES } from '../data/hadees';

export function useDailyHadees() {
  const [dailyHadees, setDailyHadees] = useState(SAHIH_BUKHARI_HADEES[0]);

  useEffect(() => {
    // Calculate the day of the year to pick a hadees deterministically but changing daily
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const hadeesIndex = dayOfYear % SAHIH_BUKHARI_HADEES.length;
    setDailyHadees(SAHIH_BUKHARI_HADEES[hadeesIndex]);
  }, []);

  return dailyHadees;
}
