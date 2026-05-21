import { useState, useEffect } from "react";
import { ArrowLeft, Target } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
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
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    if (settings.location) {
      const { lat, lng } = settings.location;
      // Calculate Qibla
      const meccaLat = 21.4224779;
      const meccaLng = 39.8251832;

      const lat1 = (lat * Math.PI) / 180;
      const lon1 = (lng * Math.PI) / 180;
      const lat2 = (meccaLat * Math.PI) / 180;
      const lon2 = (meccaLng * Math.PI) / 180;

      const y = Math.sin(lon2 - lon1);
      const x =
        Math.cos(lat1) * Math.tan(lat2) -
        Math.sin(lat1) * Math.cos(lon2 - lon1);

      let qibla = (Math.atan2(y, x) * 180) / Math.PI;
      qibla = (qibla + 360) % 360;
      setQiblaAngle(qibla);
    }
  }, [settings.location]);

  useEffect(() => {
    const handleOrientation = (event: any) => {
      let alpha = event.alpha;
      if (typeof event.webkitCompassHeading !== "undefined") {
        alpha = event.webkitCompassHeading;
      } else if (alpha !== null) {
        alpha = 360 - alpha;
      }
      if (alpha !== null) {
        setDeviceHeading(alpha);
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Need user interaction to request permission in reality
      }
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation as any
      );
      window.addEventListener("deviceorientation", handleOrientation as any);
    }

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation as any
      );
      window.removeEventListener("deviceorientation", handleOrientation as any);
    };
  }, []);

  const handleImproveAccuracy = async () => {
    setIsImproving(true);
    try {
      await requestLocation();
      // On iOS we could request permission here
      // @ts-ignore
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          // Handled by existing listener if it had permission
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImproving(false);
    }
  };

  // 0 deg indicates device points North
  // Qibla angle is absolute (0=North, 90=East)
  // Compass rotation matches device heading
  const compassRotation = -deviceHeading;

  return (
    <div className="absolute inset-0 z-50 bg-[#e2e2e2] flex flex-col font-sans h-full overflow-hidden">
      {/* Header */}
      <div className="bg-[#de4936] text-white flex items-center justify-between px-4 py-3 shadow-md shrink-0 z-10 pt-safe">
        <button
          onClick={() => setView("home")}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1 ml-2">Qibla Direction</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-white/10 transition">
          <Target className="w-6 h-6" />
        </button>
      </div>

      {/* Map Background Pattern */}
      <div className="absolute inset-0 top-[60px] opacity-30 z-0 flex flex-wrap text-black items-center justify-center pointer-events-none select-none">
        <svg fill="currentColor" opacity="0.1" viewBox="0 0 100 100" className="w-[200%] h-[200%] max-w-none max-h-none">
          <path d="M0 0h100v100H0z"/>
          {/* Fancier patterns to look like map lines */}
          <path d="M 0 50 Q 25 -25 50 50 T 100 50" stroke="currentColor" fill="none" strokeWidth="0.5"/>
          <path d="M 0 20 Q 25 80 50 20 T 100 20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
          {/* A realistic touch could just be random paths */}
        </svg>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-6 pt-6 pb-20 relative z-10">
        
        {/* Location Display */}
        <div className="bg-white/95 backdrop-blur rounded shadow-sm flex items-center justify-center py-3 w-full self-start scale-100 uppercase tracking-wide px-4 border border-slate-200">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-800">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="font-bold text-gray-800 tracking-wide text-[16px]">
              {settings.location
                ? `${settings.location.lat.toFixed(5)} , ${settings.location.lng.toFixed(5)}`
                : "UNKNOWN LOCATION"}
            </span>
          </div>
        </div>

        {/* Compass Assembly */}
        <div className="relative w-[340px] h-[340px] flex items-center justify-center shrink-0 my-auto">
          {/* Compass Background dial */}
          <div 
             className="absolute w-full h-full rounded-full bg-[#20252a] shadow-2xl overflow-hidden border-[8px] border-[#da4537] transition-transform duration-100 ease-out will-change-transform"
             style={{ transform: `rotate(${compassRotation}deg)` }}
          >
             {/* Central inner dark circles */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-[#2a2f34] shadow-inner" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full bg-[#20252a] shadow-inner" />

             {/* Inner Qibla Pointer & Track */}
             {/* The Qibla Pointer rotates relative to the Compass Dial, so its rotation is just QiblaAngle */}
             <div 
               className="absolute top-0 left-0 w-full h-full"
               style={{ transform: `rotate(${qiblaAngle}deg)` }}
             >
                {/* Red wedge Base */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] rounded-full bg-[#d74c3d]" />
                <div 
                  className="absolute left-1/2 border-l-[30px] border-r-[30px] border-b-[80px] border-l-transparent border-r-transparent border-b-[#d74c3d] drop-shadow-md"
                  style={{
                    top: '20%',
                    transform: 'translate(-50%, -20%)',
                    width: 0,
                    height: 0
                  }}
                />
                
                {/* Green Dotted Line pointing to outer rim */}
                <div 
                  className="absolute left-1/2 top-[5%] -translate-x-1/2 w-1 border-r-[3px] border-r-[#00ff00] border-dotted"
                  style={{ height: '35%' }}
                />

                {/* Circular marks on pointer */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-white/40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85px] h-[85px] rounded-full border-2 border-white border-dashed bg-[#b3372c]" />

                {/* Kaaba inside pointer */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white rounded bg-transparent flex items-center justify-center">
                  <svg viewBox="0 0 100 100" fill="currentColor" width="100%" height="100%">
                    <rect x="25" y="32" width="50" height="50" rx="2" />
                    <rect x="25" y="47" width="50" height="4" fill="#b3372c" />
                    <rect x="25" y="60" width="50" height="2" fill="#b3372c" />
                    <rect x="42" y="62" width="16" height="20" fill="#b3372c" />
                  </svg>
                </div>
             </div>

             {/* Ticks & Labels on the compass dial (fixed to the dial) */}
             <div className="absolute top-0 left-0 w-full h-full text-white">
                {/* Tick generation */}
                {Array.from({ length: 72 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-white origin-bottom"
                    style={{
                      height: '100%',
                      transform: `rotate(${i * 5}deg)`,
                      background: 'transparent'
                    }}
                  >
                     <div className={`mx-auto bg-white ${i % 18 === 0 ? 'h-6 w-1 mt-2' : i % 2 === 0 ? 'h-4 w-0.5 mt-2' : 'h-3 w-px mt-3'}`} />
                  </div>
                ))}
                
                {/* Compass Labels */}
                <span className="absolute top-[30px] left-1/2 -translate-x-1/2  text-4xl font-serif tracking-widest font-bold">N</span>
                <span className="absolute bottom-[30px] left-1/2 -translate-x-1/2  text-4xl font-serif tracking-widest font-light">S</span>
                <span className="absolute left-[30px] top-1/2 -translate-y-1/2 -rotate-90 text-4xl font-serif tracking-[0.2em] font-light">W</span>
                <span className="absolute right-[30px] top-1/2 -translate-y-1/2 rotate-90 text-4xl font-serif tracking-[0.2em] font-light">E</span>
             </div>
          </div>
        </div>

        {/* Bottom Metrics Details */}
        <div className="w-full space-y-4">
           {/* Current Heading Display */}
           <div className="bg-white/30 backdrop-blur border border-red-500/50 rounded flex items-center justify-center p-3 relative shadow-sm">
             {/* Red outline imitating the image */}
             <div className="absolute inset-0 border border-[#de4936] rounded" />
             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#de4936] opacity-30" />
             <span className="font-bold text-gray-800 text-3xl font-mono tracking-tight z-10">
                {qiblaAngle.toFixed(1)}
             </span>
           </div>

           {/* Improve button */}
           <button 
             onClick={handleImproveAccuracy}
             disabled={isImproving}
             className="w-full py-4 px-6 bg-[#265e28] hover:bg-[#1f4d21] text-white font-bold tracking-wide uppercase text-sm shadow text-center rounded active:bg-[#1a401c] transition border-b-4 border-b-[#143717]"
           >
             {isImproving ? "CALIBRATING..." : "TAP HERE TO IMPROVE ACCURACY"}
           </button>
        </div>
      </div>
    </div>
  );
}
