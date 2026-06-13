import { useState, useEffect } from 'react';
import { dailyDuas } from '../data/duas';

export function useDailyDua() {
  const [dailyDua, setDailyDua] = useState(dailyDuas[0]);

  useEffect(() => {
    // Generate a new index based on the current date, to ensure it changes consistently every day
    const dateStr = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % dailyDuas.length;
    setDailyDua(dailyDuas[index]);
  }, []);

  return dailyDua;
}
