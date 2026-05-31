import { motion } from "motion/react";
import { Dispatch, SetStateAction } from "react";
import { ViewType } from "../App";

interface Home2Props {
  setView: Dispatch<SetStateAction<ViewType>>;
}

export function Home2({ setView }: Home2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      onDoubleClick={() => setView('home')}
      className="pb-24 w-full min-h-screen bg-[#2b3c5a] flex flex-col items-center justify-center text-white"
    >
      <h1 className="text-3xl font-bold mb-4">Secondary Home Screen</h1>
      <p className="text-base text-slate-300 mb-8 text-center px-6">
        You reached the alternate home screen. Double tap anywhere to go back.
      </p>
      
      <button 
        onClick={() => setView('home')}
        className="px-6 py-2 bg-emerald-500 rounded-full font-medium hover:bg-emerald-600 transition-colors"
      >
        Go Back to Main Home
      </button>
    </motion.div>
  );
}
