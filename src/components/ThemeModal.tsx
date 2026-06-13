import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { settings, setSettings } = useSettings();
  const [selectedTheme, setSelectedTheme] = useState(settings.theme || 'dark');

  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(settings.theme || 'dark');
    }
  }, [isOpen, settings.theme]);

  const handleClose = () => {
    document.documentElement.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 400);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('theme-transition');
      document.documentElement.setAttribute('data-theme', selectedTheme);
      
      const timeout = setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [selectedTheme, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    setSettings(p => ({ ...p, theme: selectedTheme as any }));
    document.documentElement.setAttribute('data-theme', selectedTheme);
    onClose();
  };

  const themes = [
    { id: 'light', name: 'Light', color: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-200' },
    { id: 'dark', name: 'Dark', color: 'bg-[#1c1c1e]', text: 'text-emerald-50', border: 'border-slate-800' },
    { id: 'ocean', name: 'Ocean', color: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-200' },
    { id: 'desert', name: 'Desert', color: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-200' },
    { id: 'forest', name: 'Forest', color: 'bg-[#def0e3]', text: 'text-[#1d3e2a]', border: 'border-[#bee1c8]' },
    { id: 'sunset', name: 'Sunset', color: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 mt-2">
          <div className="flex-1" />
          <h2 className="text-2xl font-bold text-slate-800 text-center flex-1 whitespace-nowrap">Change Theme</h2>
          <div className="flex-1 flex justify-end">
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-[#3d4b5c] text-white flex items-center justify-center hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 pt-2">
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`relative rounded-2xl overflow-hidden aspect-[1/1.5] border-4 transition-all ${
                  selectedTheme === t.id ? 'border-[#3d4b5c] shadow-lg scale-100' : 'border-transparent shadow-sm hover:scale-[1.02]'
                }`}
              >
                <div className={`w-full h-full ${t.color} flex flex-col items-center justify-center border border-slate-100`}>
                  <div className={`w-3/4 h-[10%] ${t.border} border rounded-full mb-4 opacity-50`}></div>
                  <div className={`w-1/2 h-[5%] ${t.border} border rounded-full mb-4 opacity-50`}></div>
                  
                  <span className={`font-bold ${t.text} text-lg mb-4`}>{t.name}</span>
                  
                  <div className="grid grid-cols-2 gap-2 w-3/4">
                    <div className={`aspect-square ${t.border} border rounded-xl opacity-50`}></div>
                    <div className={`aspect-square ${t.border} border rounded-xl opacity-50`}></div>
                    <div className={`aspect-square ${t.border} border rounded-xl opacity-50`}></div>
                    <div className={`aspect-square ${t.border} border rounded-xl opacity-50`}></div>
                  </div>

                  {selectedTheme === t.id && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-white text-slate-800 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                        <Check className="w-6 h-6" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleApply}
            className="w-full mt-6 py-4 bg-[#3d4b5c] hover:bg-slate-800 text-white font-bold rounded-2xl transition text-lg shadow-md"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
