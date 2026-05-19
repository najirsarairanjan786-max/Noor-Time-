import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Search, Compass, Book } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | string;

interface FeatureViewProps {
  title: string;
  setView: Dispatch<SetStateAction<ViewType>>;
  key?: string;
}

export function FeatureView({ title, setView }: FeatureViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 px-4 pt-12 max-w-lg mx-auto min-h-[100dvh] flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setView('home')} 
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl overflow-y-auto">
        <div className="flex flex-col items-center justify-center text-center h-full gap-4 text-slate-500 py-20">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Coming Soon</h2>
          <p className="text-sm px-4">
            The {title} module is currently under development. Check back in a future update!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
