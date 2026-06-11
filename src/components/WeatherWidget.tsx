import React from 'react';
import { CloudRain, Cloud, Sun, CloudLightning, Snowflake, MapPin, Loader2 } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useSettings } from '../hooks/useSettings';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export function WeatherWidget() {
  const { settings } = useSettings();
  const { weather, loading, error } = useWeather(settings.location);

  if (!settings.location) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-medium text-white/60 mt-1">
        <MapPin className="w-4 h-4" />
        <span>Location pending for weather</span>
      </div>
    );
  }

  if (error) {
    return null; // hide weather widget if it fails to fetch (ad blocker, network issue)
  }

  if (loading || !weather) {
     return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-medium text-white mt-1 h-[58px]">
        <Loader2 className="w-4 h-4 animate-spin opacity-70" />
        <span className="opacity-70">Loading...</span>
      </div>
    );
  }

  // Open-meteo weather codes
  let Icon = Cloud;
  const code = weather.weatherCode;
  if (code <= 1) Icon = Sun;
  else if (code <= 3 || code === 45 || code === 48) Icon = Cloud;
  else if (code >= 51 && code <= 67 || (code >= 80 && code <= 82)) Icon = CloudRain;
  else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) Icon = Snowflake;
  else if (code >= 95) Icon = CloudLightning;

  const rainData = [{ value: weather.precipitationProbability }];

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-sm font-semibold transition drop-shadow-md text-white mt-1 shadow-black/20">
      <div className="flex flex-col items-center justify-center">
        <Icon className="w-6 h-6 fill-white/20 mb-1" strokeWidth={2.5} />
        <span className="text-lg font-bold leading-none">{weather.temperature.toFixed(0)}°</span>
      </div>
      
      <div className="w-px h-10 bg-white/20 mx-1"></div>

      <div className="flex flex-col items-center justify-center relative w-12 h-12">
        <RadialBarChart 
          width={48} 
          height={48} 
          innerRadius={18} 
          outerRadius={24} 
          data={rainData} 
          startAngle={90} 
          endAngle={-270}
          barSize={4}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            dataKey="value"
            cornerRadius={10}
            fill="#60a5fa" /* blue-400 */
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CloudRain className="w-2.5 h-2.5 text-blue-300 mb-[1px]" />
          <span className="text-[9px] text-blue-200 font-bold leading-none">{weather.precipitationProbability}%</span>
        </div>
      </div>
    </div>
  );
}
