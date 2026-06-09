import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPinOff, X } from 'lucide-react';

export function LocationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!navigator.permissions || !navigator.permissions.query) return;
      
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        
        if (result.state === 'denied') {
          const hasDismissed = localStorage.getItem('location_prompt_dismissed');
          if (!hasDismissed) {
             setShowPrompt(true);
          }
        }
        
        // Listen for changes
        result.onchange = () => {
          if (result.state === 'denied') {
             const hasDismissed = localStorage.getItem('location_prompt_dismissed');
             if (!hasDismissed) {
                setShowPrompt(true);
             }
          } else if (result.state === 'granted') {
             setShowPrompt(false);
             localStorage.removeItem('location_prompt_dismissed');
          }
        };
      } catch (error) {
        // Some older browsers might throw an error
        console.error("Error asking for location permissions status", error);
      }
    };
    
    checkPermission();
  }, []);

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('location_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="absolute bottom-24 left-4 right-4 bg-emerald-950/95 backdrop-blur-sm border border-red-500/30 p-4 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500/80"></div>
          <button 
            onClick={dismiss}
            className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-100 transition-colors bg-emerald-900/50 rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-4 mr-4">
            <div className="bg-red-500/20 p-2.5 rounded-full mt-0.5 border border-red-500/20 shrink-0">
              <MapPinOff className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold mb-1">Location Services Disabled</h3>
              <p className="text-emerald-200/90 text-xs leading-relaxed mb-2 pr-2">
                Prayer calculations require your precise location. For accurate Adhan timings, please enable location permissions in your browser or device settings.
              </p>
              <button 
                onClick={dismiss}
                className="text-xs font-medium text-emerald-400 border border-emerald-800 bg-emerald-900/50 px-3 py-1.5 rounded hover:bg-emerald-800/80 transition-colors"
              >
                I understand
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
