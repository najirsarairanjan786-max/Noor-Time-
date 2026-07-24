import React, { useState, useMemo } from "react";
import { Search, BookOpen, Library, Bookmark, Heart, History, Clock } from "lucide-react";
import { REFERENCE_DB, IslamicReference } from "./referenceData";
import { ReferenceModal } from "./ReferenceModal";
import { useLocalStorage } from "usehooks-ts";

export function ReferenceSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"All" | "Quran" | "Hadith" | "Favorites" | "Recent">("All");
  const [selectedReference, setSelectedReference] = useState<IslamicReference | null>(null);

  const [favorites, setFavorites] = useLocalStorage<string[]>("ref_favorites", []);
  const [recent, setRecent] = useLocalStorage<string[]>("ref_recent", []);

  const handleOpen = (ref: IslamicReference) => {
    setSelectedReference(ref);
    setRecent((prev) => {
      const filtered = prev.filter((id) => id !== ref.id);
      return [ref.id, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  const filteredRefs = useMemo(() => {
    return REFERENCE_DB.filter((ref) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        ref.arabicText.toLowerCase().includes(searchLower) ||
        ref.translation.en.toLowerCase().includes(searchLower) ||
        (ref.type === "Quran" && (
          ref.surahName.toLowerCase().includes(searchLower) ||
          `${ref.surahNumber}:${ref.ayahNumber}`.includes(searchLower)
        )) ||
        (ref.type === "Hadith" && (
          ref.bookName.toLowerCase().includes(searchLower) ||
          String(ref.hadithNumber).includes(searchLower) ||
          ref.chapterName.toLowerCase().includes(searchLower)
        ));

      if (!matchesSearch) return false;

      // Filter
      if (filter === "Quran" && ref.type !== "Quran") return false;
      if (filter === "Hadith" && ref.type !== "Hadith") return false;
      if (filter === "Favorites" && !favorites.includes(ref.id)) return false;
      if (filter === "Recent" && !recent.includes(ref.id)) return false;

      return true;
    });
  }, [searchTerm, filter, favorites, recent]);

  // If recent filter is applied, sort by recent order
  if (filter === "Recent") {
    filteredRefs.sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-emerald-500/50" />
        </div>
        <input
          type="text"
          placeholder="Search by Surah, Ayah, Hadith No, or Keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-emerald-900/20 border border-emerald-500/20 text-white rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(["All", "Quran", "Hadith", "Favorites", "Recent"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === f 
                ? "bg-emerald-500 text-slate-900" 
                : "bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/60"
            }`}
          >
            {f === "Quran" && <BookOpen className="w-4 h-4" />}
            {f === "Hadith" && <Library className="w-4 h-4" />}
            {f === "Favorites" && <Heart className="w-4 h-4" />}
            {f === "Recent" && <History className="w-4 h-4" />}
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 pb-24">
        {filteredRefs.map((ref) => (
          <button
            key={ref.id}
            onClick={() => handleOpen(ref)}
            className="w-full text-left p-4 rounded-xl bg-slate-800/40 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                ref.type === "Quran" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
              }`}>
                {ref.type === "Quran" ? "📖 Quran" : "📚 Hadith"}
              </span>
              {favorites.includes(ref.id) && <Heart className="w-4 h-4 text-red-400 fill-current" />}
            </div>
            
            <h4 className="text-white font-medium mb-1">
              {ref.type === "Quran" 
                ? `Surah ${ref.surahName} (${ref.surahNumber}:${ref.ayahNumber})`
                : `${ref.bookName} - Hadith ${ref.hadithNumber}`
              }
            </h4>
            
            <p className="text-slate-400 text-sm line-clamp-2">
              {ref.translation.en}
            </p>
          </button>
        ))}

        {filteredRefs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No references found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedReference && (
        <ReferenceModal
          reference={selectedReference}
          onClose={() => setSelectedReference(null)}
        />
      )}
    </div>
  );
}
