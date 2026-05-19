import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-50 drop-shadow-md">
        {format(time, 'hh:mm')}
        <span className="text-xl md:text-2xl ml-2 text-emerald-300 font-medium">{format(time, 'a')}</span>
      </div>
      <div className="mt-2 text-base md:text-lg font-sans text-emerald-200/90 font-medium">
        {format(time, 'EEEE, dd MMMM yyyy')}
      </div>
    </div>
  );
}
