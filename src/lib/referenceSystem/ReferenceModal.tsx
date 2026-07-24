import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Share2, Bookmark, Heart, History } from "lucide-react";
import { IslamicReference } from "./referenceData";
import { useSettings } from "../../hooks/useSettings";
import { useLocalStorage } from "usehooks-ts";

interface ReferenceModalProps {
  reference: IslamicReference;
  onClose: () => void;
}

export function ReferenceModal({ reference, onClose }: ReferenceModalProps) {
  const { settings } = useSettings();
  const lang = settings.language || 'en';
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useLocalStorage<string[]>("ref_favorites", []);

  const isFavorite = favorites.includes(reference.id);

  const toggleFavorite = () => {
    if (isFavorite) {
      setFavorites(favorites.filter(id => id !== reference.id));
    } else {
      setFavorites([reference.id, ...favorites]);
    }
  };

  const handleCopy = () => {
    let text = "";
    if (reference.type === "Quran") {
      text = `Quran ${reference.surahNumber}:${reference.ayahNumber}\n${reference.arabicText}\n\n${reference.translation[lang as keyof typeof reference.translation]}`;
    } else {
      text = `${reference.bookName} ${reference.hadithNumber}\n${reference.arabicText}\n\n${reference.translation[lang as keyof typeof reference.translation]}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    let text = "";
    if (reference.type === "Quran") {
      text = `Quran ${reference.surahNumber}:${reference.ayahNumber}\n${reference.arabicText}\n\n${reference.translation[lang as keyof typeof reference.translation]}`;
    } else {
      text = `${reference.bookName} ${reference.hadithNumber}\n${reference.arabicText}\n\n${reference.translation[lang as keyof typeof reference.translation]}`;
    }
    if (navigator.share) {
      navigator.share({
        title: "Islamic Reference",
        text: text,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {reference.type === "Quran" ? (
                  <>
                    <span className="text-emerald-400">📖</span>
                    Quran Reference
                  </>
                ) : (
                  <>
                    <span className="text-blue-400">📚</span>
                    Hadith Reference
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {reference.type === "Quran" 
                  ? `Surah ${reference.surahName} (${reference.surahNumber}:${reference.ayahNumber})`
                  : `${reference.bookName} - ${reference.chapterName} (Hadith ${reference.hadithNumber})`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Authenticity Badge for Hadith */}
            {reference.type === "Hadith" && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                Authenticity: {reference.authenticity}
              </div>
            )}

            {/* Arabic */}
            <div className="text-right">
              <p className="font-arabic text-2xl leading-loose text-amber-50" dir="rtl">
                {reference.arabicText}
              </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-800/80" />

            {/* Translation */}
            <div>
              <p className={`text-[15px] leading-relaxed text-slate-300 ${lang === 'ur' || lang === 'ar' ? 'text-right font-arabic' : 'text-left'}`}>
                {reference.translation[lang as keyof typeof reference.translation]}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
            
            <button
              onClick={toggleFavorite}
              className={`p-2.5 rounded-xl transition-colors ${
                isFavorite ? "bg-red-500/20 text-red-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
