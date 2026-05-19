import { motion } from 'motion/react';
import { useData } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import { Compass, Book, Map } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PrayerDetails() {
  const { settings } = useSettings();
  const { timings } = useData(settings.location, settings.method ?? 1, settings.school ?? 1);
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    // Basic compass listener
    const handleOrientation = (event: any) => {
      let alpha = event.alpha;
      if (event.webkitCompassHeading) {
        alpha = event.webkitCompassHeading; // iOS
      } else if (alpha !== null) {
        alpha = 360 - alpha; // Android
      }
      setHeading(alpha);
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any);
      // fallback for older devices
      window.addEventListener('deviceorientation', handleOrientation as any);
    }
    
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
      window.removeEventListener('deviceorientation', handleOrientation as any);
    };
  }, []);

  const openMosqueFinder = () => {
    window.open('https://www.google.com/maps/search/mosques+near+me', '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="pb-32 px-4 pt-12 max-w-md mx-auto space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Prayer & Qibla</h2>
        <p className="text-emerald-300/80 mt-1">Resources for your daily prayers</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-800/50 flex items-center justify-center mb-3 relative overflow-hidden">
            <Compass 
              className="w-10 h-10 text-emerald-300 transition-transform duration-100 ease-linear" 
              style={{ transform: heading ? `rotate(${-heading + 45}deg)` : 'rotate(45deg)' }} 
            />
          </div>
          <h3 className="font-semibold text-emerald-50">Qibla Compass</h3>
          <p className="text-xs text-emerald-400/80 mt-1">Requires device sensors</p>
        </div>

        <button onClick={openMosqueFinder} className="glass-panel p-5 flex flex-col items-center justify-center text-center hover:bg-emerald-800/40 transition">
          <div className="w-16 h-16 rounded-full bg-emerald-800/50 flex items-center justify-center mb-3">
            <Map className="w-8 h-8 text-emerald-300" />
          </div>
          <h3 className="font-semibold text-emerald-50">Find Mosques</h3>
          <p className="text-xs text-emerald-400/80 mt-1">Open in Maps</p>
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Book className="w-6 h-6 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Dua After Prayer</h3>
        </div>
        <div className="space-y-4">
          <p className="text-right font-serif text-2xl leading-relaxed text-emerald-100" dir="rtl">
            اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ
          </p>
          <p className="text-emerald-300/90 text-sm italic">
            "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor."
          </p>
          <p className="text-xs text-emerald-500/80">Sahih Muslim 591</p>
        </div>
      </div>
    </motion.div>
  );
}
