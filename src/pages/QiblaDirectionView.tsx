import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft, MapPin, Target, RotateCw, Settings, CheckCircle2, Compass } from "lucide-react";
import { useSettings } from "../hooks/useSettings";

type ViewType =
  | "home"
  | "calendar"
  | "settings"
  | "prayer"
  | "Quran"
  | "Question & Answer"
  | string;

interface QiblaDirectionViewProps {
  setView: Dispatch<SetStateAction<ViewType>>;
}

export function QiblaDirectionView({ setView }: QiblaDirectionViewProps) {
  const { settings, requestLocation } = useSettings();
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [qiblaAngle, setQiblaAngle] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [isImproving, setIsImproving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAligned, setIsAligned] = useState(false);
  const lastVibrate = useRef<number>(0);

  const MECCA_LAT = 21.4224779;
  const MECCA_LNG = 39.8251832;

  useEffect(() => {
    if (settings.location) {
      const { lat, lng } = settings.location;
      
      // Calculate Qibla Angle
      const lat1 = (lat * Math.PI) / 180;
      const lon1 = (lng * Math.PI) / 180;
      const lat2 = (MECCA_LAT * Math.PI) / 180;
      const lon2 = (MECCA_LNG * Math.PI) / 180;
      
      const y = Math.sin(lon2 - lon1);
      const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lon2 - lon1);
      let qibla = (Math.atan2(y, x) * 180) / Math.PI;
      qibla = (qibla + 360) % 360;
      setQiblaAngle(qibla);

      // Calculate Distance (Haversine)
      const R = 6371; // km
      const dLat = (MECCA_LAT - lat) * (Math.PI / 180);
      const dLon = (MECCA_LNG - lng) * (Math.PI / 180);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * (Math.PI / 180)) * Math.cos(MECCA_LAT * (Math.PI / 180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      setDistance(R * c);
    }
  }, [settings.location]);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let alpha = event.alpha;
      // @ts-ignore
      if (typeof event.webkitCompassHeading !== "undefined") {
        // @ts-ignore
        alpha = event.webkitCompassHeading;
      } else if (alpha !== null) {
        alpha = 360 - alpha;
      }
      
      if (alpha !== null) {
        setDeviceHeading(alpha);
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientationabsolute", handleOrientation as any);
      window.addEventListener("deviceorientation", handleOrientation as any);
    }
    
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation as any);
      window.removeEventListener("deviceorientation", handleOrientation as any);
    };
  }, []);

  useEffect(() => {
    // Check alignment
    const currentCompass = deviceHeading; // Device heading (North is 0)
    
    // Calculate smallest difference between angles
    let diff = Math.abs(currentCompass - qiblaAngle);
    if (diff > 180) diff = 360 - diff;
    
    const aligned = diff < 2; // within 2 degrees
    
    if (aligned && !isAligned) {
      setIsAligned(true);
      const now = Date.now();
      if (vibrationEnabled && navigator.vibrate && (now - lastVibrate.current > 2000)) {
        navigator.vibrate([100, 50, 100]);
        lastVibrate.current = now;
      }
      if (soundEnabled) {
        // Optional sound effect could go here
      }
    } else if (!aligned && isAligned) {
      setIsAligned(false);
    }
  }, [deviceHeading, qiblaAngle, vibrationEnabled, soundEnabled, isAligned]);

  const handleImproveAccuracy = async () => {
    setIsImproving(true);
    try {
      await requestLocation();
      // @ts-ignore
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          // Perm granted
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setTimeout(() => setIsImproving(false), 800);
    }
  };

  const compassRotation = -deviceHeading;

  return (
    <div className="absolute inset-0 z-50 bg-[#064E3B] bg-gradient-to-br from-emerald-950 via-[#022c22] to-slate-900 flex flex-col font-sans h-full overflow-hidden text-emerald-50">
      {/* Header */}
      <div className="bg-emerald-900/80 backdrop-blur-md flex items-center justify-between px-4 py-4 border-b border-emerald-800/50 shrink-0 z-20 pt-safe">
        <button onClick={() => setView("home")} className="p-2 -ml-2 rounded-full hover:bg-emerald-800/50 transition">
          <ArrowLeft className="w-6 h-6 text-emerald-100" />
        </button>
        <h1 className="text-xl font-bold flex-1 ml-2 text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" /> Qibla Finder
        </h1>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 -mr-2 rounded-full hover:bg-emerald-800/50 transition">
          <Settings className="w-6 h-6 text-emerald-100" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 relative z-10 overflow-y-auto">
        
        {/* Settings Panel Overlay */}
        {showSettings && (
          <div className="absolute top-4 left-4 right-4 bg-emerald-900/95 backdrop-blur-xl border border-emerald-700 p-4 rounded-2xl shadow-2xl z-30">
            <h3 className="text-lg font-bold text-white mb-4">Qibla Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Vibrate on Alignment</span>
                <button onClick={() => setVibrationEnabled(!vibrationEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${vibrationEnabled ? 'bg-amber-500' : 'bg-emerald-800'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${vibrationEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>Sound on Alignment</span>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-amber-500' : 'bg-emerald-800'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-6 py-2 bg-emerald-800 rounded-xl text-white font-medium hover:bg-emerald-700 transition">Close</button>
          </div>
        )}

        {/* Location Card */}
        <div className="w-full bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <MapPin className="w-5 h-5" />
              <span className="font-bold text-white text-lg truncate pr-2">
                {settings.location ? settings.location.name : "Unknown Location"}
              </span>
            </div>
            <button onClick={handleImproveAccuracy} disabled={isImproving} className="p-2 bg-emerald-800/50 rounded-full hover:bg-emerald-700/50 transition shrink-0">
              <RotateCw className={`w-5 h-5 text-emerald-200 ${isImproving ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {settings.location ? (
            <div className="flex items-center justify-between text-xs text-emerald-300/70 font-mono">
              <span>{settings.location.lat.toFixed(4)}°, {settings.location.lng.toFixed(4)}°</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                GPS Active
              </div>
            </div>
          ) : (
            <div className="text-xs text-red-300/70">Location not available. Tap refresh to locate.</div>
          )}
        </div>

        {/* Compass Assembly */}
        <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] flex items-center justify-center shrink-0 my-6">
          {/* Compass Dial */}
          <div
             className="absolute w-full h-full rounded-full bg-emerald-950 shadow-[0_0_40px_rgba(16,185,129,0.15)] border-[4px] border-emerald-800 transition-transform duration-150 ease-out will-change-transform"
             style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            {/* Inner decorative rings */}
            <div className="absolute inset-4 rounded-full border border-emerald-700/30" />
            <div className="absolute inset-12 rounded-full border border-amber-500/20 bg-emerald-900/20" />
            
            {/* Ticks & Labels */}
            <div className="absolute inset-0 text-emerald-400/80">
              {Array.from({ length: 72 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 origin-bottom"
                  style={{
                    height: '100%',
                    transform: `rotate(${i * 5}deg)`,
                  }}
                >
                  <div className={`mx-auto ${i % 18 === 0 ? 'bg-amber-400 h-4 w-1' : i % 2 === 0 ? 'bg-emerald-600 h-3 w-[1.5px]' : 'bg-emerald-700 h-2 w-px'}`} />
                </div>
              ))}
              
              <span className="absolute top-[16px] left-1/2 -translate-x-1/2 text-2xl font-serif font-bold text-amber-400 drop-shadow-md">N</span>
              <span className="absolute bottom-[16px] left-1/2 -translate-x-1/2 text-xl font-serif font-bold drop-shadow-md">S</span>
              <span className="absolute left-[20px] top-1/2 -translate-y-1/2 -rotate-90 text-xl font-serif font-bold drop-shadow-md">W</span>
              <span className="absolute right-[20px] top-1/2 -translate-y-1/2 rotate-90 text-xl font-serif font-bold drop-shadow-md">E</span>
            </div>

            {/* Qibla Pointer */}
            <div
              className="absolute inset-0 transition-transform duration-300"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              {/* Pointer line */}
              <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[2px] h-[32%] bg-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
              
              {/* Kaaba Icon at the tip */}
              <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-9 h-9 flex items-center justify-center bg-[#111] rounded shadow-[0_0_15px_rgba(245,158,11,0.4)] border-2 border-amber-500/80">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-6 h-6 text-white">
                  <rect x="20" y="20" width="60" height="60" rx="3" />
                  <rect x="20" y="38" width="60" height="5" fill="#fbbf24" />
                  <rect x="20" y="55" width="60" height="3" fill="#fbbf24" />
                  <rect x="42" y="60" width="16" height="20" fill="#fbbf24" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Static Center Device Pointer */}
          <div className="absolute z-10 w-24 h-24 rounded-full bg-emerald-900 border-4 border-emerald-950 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
            {/* Device pointing direction indicator */}
            <div className="absolute -top-3 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-emerald-400 drop-shadow-md" />
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-white drop-shadow-sm">{Math.round(deviceHeading)}°</div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Target className="w-6 h-6 text-amber-400 mb-2" />
            <div className="text-sm text-emerald-200">Qibla Angle</div>
            <div className="text-xl font-bold text-white">{qiblaAngle.toFixed(1)}°</div>
          </div>
          <div className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Compass className="w-6 h-6 text-emerald-400 mb-2" />
            <div className="text-sm text-emerald-200">Distance</div>
            <div className="text-xl font-bold text-white">{Math.round(distance).toLocaleString()} km</div>
          </div>
        </div>

        {/* Alignment Indicator */}
        <div className={`mt-6 w-full py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-500 ${isAligned ? 'bg-amber-500/20 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-emerald-900/20 border border-transparent'}`}>
          {isAligned ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-amber-400 animate-pulse" />
              <span className="font-bold text-amber-400 text-lg">Perfectly Aligned!</span>
            </>
          ) : (
            <span className="text-emerald-300/60 text-sm font-medium tracking-wide">Rotate your device to align with the Kaaba</span>
          )}
        </div>

      </div>
    </div>
  );
}
