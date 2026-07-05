import { X } from "@/src/lib/icons";
import { type Dispatch, type SetStateAction } from "react";

type ViewType = "home" | "calendar" | "settings" | "prayer" | string;

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
  setView?: Dispatch<SetStateAction<ViewType>>;
}

export function QiblaModal({ isOpen, onClose, setView }: QiblaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-[340px] shadow-2xl relative p-6 pt-16 pb-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#d0dbe5] text-white flex items-center justify-center hover:bg-[#b5c5d3] transition z-50 shadow-sm"
        >
          <X className="w-4 h-4 text-white" strokeWidth={3} />
        </button>

        <div className="flex gap-4 justify-between mt-2">
          {/* Camera Qibla Finder */}
          <button
            onClick={() => {
              window.open('https://qiblafinder.withgoogle.com/', '_blank');
              onClose();
            }}
            className="flex-1 bg-[#c5d3df] hover:bg-[#bacbd8] active:bg-[#aabace] rounded-3xl flex flex-col aspect-square relative overflow-hidden transition shadow-sm group font-sans border-0"
          >
            {/* Kaaba Silhouette */}
            <div className="absolute bottom-12 -left-2 w-[70px] h-[70px] text-[#9eb2c5] z-0">
               <svg viewBox="0 0 100 100" fill="currentColor" width="100%" height="100%">
                 {/* Main Cube */}
                 <rect x="25" y="32" width="45" height="48" rx="1" />
                 {/* Base Lines */}
                 <rect x="18" y="80" width="59" height="5" rx="1" />
                 <rect x="10" y="85" width="75" height="6" rx="1" />
                 {/* Detail Cutouts */}
                 <rect x="25" y="47" width="45" height="4" fill="#c5d3df" />
                 <rect x="25" y="60" width="45" height="2" fill="#c5d3df" />
                 <rect x="42" y="62" width="16" height="18" fill="#c5d3df" />
                 {/* Right Edge line */}
                 <rect x="62" y="32" width="2" height="48" fill="#c5d3df" opacity="0.5" />
               </svg>
            </div>

            {/* White Circle Background */}
            <div className="absolute -top-4 -right-4 w-[5.5rem] h-[5.5rem] bg-white rounded-full z-0 pointer-events-none" />

            {/* Icon */}
            <div className="absolute top-3 right-3 z-10 text-[#304154]">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                  {/* Camera body */}
                  <path d="M4 8C2.9 8 2 8.9 2 10V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V10C22 8.9 21.1 8 20 8H16.83L15 6H9L7.17 8H4Z" />
                  {/* Lens punchout */}
                  <circle cx="12" cy="14" r="3.5" fill="white" />
                  <circle cx="12" cy="14" r="2" fill="currentColor" />
                  {/* Rays representing flash/light */}
                  <line x1="12" y1="2" x2="12" y2="4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="7.5" y1="3" x2="9.5" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="16.5" y1="3" x2="14.5" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
            </div>
            
            <div className="mt-auto relative z-10 w-full pb-4">
              <div className="text-[#324558] font-black text-[18px] leading-none uppercase tracking-tight">CAMERA</div>
              <div className="text-[#324558] font-medium text-[11px] leading-tight uppercase tracking-wide opacity-90 mt-1">QIBLA FINDER</div>
            </div>
          </button>

          {/* Compass Qibla Direction */}
          <button
            onClick={() => {
              setView?.("qibla");
              onClose();
            }}
            className="flex-1 bg-[#c5d3df] hover:bg-[#bacbd8] active:bg-[#aabace] rounded-3xl flex flex-col aspect-square relative overflow-hidden transition shadow-sm group font-sans border-0"
          >
            {/* Kaaba Silhouette */}
            <div className="absolute bottom-12 -left-2 w-[70px] h-[70px] text-[#9eb2c5] z-0">
               <svg viewBox="0 0 100 100" fill="currentColor" width="100%" height="100%">
                 {/* Main Cube */}
                 <rect x="25" y="32" width="45" height="48" rx="1" />
                 {/* Base Lines */}
                 <rect x="18" y="80" width="59" height="5" rx="1" />
                 <rect x="10" y="85" width="75" height="6" rx="1" />
                 {/* Detail Cutouts */}
                 <rect x="25" y="47" width="45" height="4" fill="#c5d3df" />
                 <rect x="25" y="60" width="45" height="2" fill="#c5d3df" />
                 <rect x="42" y="62" width="16" height="18" fill="#c5d3df" />
                 {/* Right Edge line */}
                 <rect x="62" y="32" width="2" height="48" fill="#c5d3df" opacity="0.5" />
               </svg>
            </div>

            {/* White Circle Background */}
            <div className="absolute -top-4 -right-4 w-[5.5rem] h-[5.5rem] bg-white rounded-full z-0 pointer-events-none" />

            {/* Icon */}
            <div className="absolute top-2.5 right-2.5 z-10 text-[#304154]">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                  {/* Outer ring */}
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <circle cx="12" cy="12" r="7.5" fill="white" />
                  {/* Compass needle */}
                  <path d="M12 6L14 12L12 18L10 12L12 6Z" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="white" />
                  
                  {/* Tick marks around outer ring */}
                  <path d="M 12 4 L 12 5 M 4 12 L 5 12 M 20 12 L 19 12 M 12 20 L 12 19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>
            
            <div className="mt-auto relative z-10 w-full pb-4">
              <div className="text-[#324558] font-black text-[18px] leading-none uppercase tracking-tight">COMPASS</div>
              <div className="text-[#324558] font-medium text-[11px] leading-tight uppercase tracking-wide opacity-90 mt-1">QIBLA DIRECTION</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
