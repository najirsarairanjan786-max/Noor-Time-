import { addDays, format } from 'date-fns';

export interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string;
  Sunset: string;
  Imsak?: string;
  Midnight?: string;
  Firstthird?: string;
  Lastthird?: string;
}

export interface HijriDateInfo {
  day: string;
  month: { en: string; ar: string; number: number };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

export interface GregorianDateInfo {
  day: string;
  month: { en: string; number: number };
  year: string;
  weekday: { en: string };
}

export interface AladhanResponse {
  code: number;
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      timestamp: string;
      gregorian: GregorianDateInfo;
      hijri: HijriDateInfo;
    };
  };
}

export async function fetchPayerTimes(lat: number, lng: number, method: number = 1, school: number = 1): Promise<AladhanResponse['data']> {
  const dateStr = format(new Date(), 'dd-MM-yyyy');
  const cacheKey = `prayer_times_${dateStr}_${lat}_${lng}_${method}_${school}`;
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn("Failed to parse cached prayer times", e);
      }
    }
  }

  try {
    const response = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`);
    const data = await response.json();
    if (typeof window !== 'undefined' && data?.data) {
      localStorage.setItem(cacheKey, JSON.stringify(data.data));
    }
    return data.data;
  } catch (err) {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    }
    throw err;
  }
}

export async function fetchHijriDate(date: Date): Promise<HijriDateInfo> {
  const dateStr = format(date, 'dd-MM-yyyy');
  const cacheKey = `hijri_date_${dateStr}`;
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn("Failed to parse cached hijri date", e);
      }
    }
  }

  try {
    const response = await fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`);
    const data = await response.json();
    if (typeof window !== 'undefined' && data?.data?.hijri) {
      localStorage.setItem(cacheKey, JSON.stringify(data.data.hijri));
    }
    return data.data.hijri;
  } catch (err) {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    }
    throw err;
  }
}
