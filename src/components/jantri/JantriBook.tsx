import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronDown, ChevronUp, ChevronLeft, Clock,
  Search as Search,
  BookmarkIcon as Bookmark,
  HijriCalendarIcon as Calendar,
  CrescentMoonIcon as Moon,
  StarCrescentIcon as Star,
  BookOpenIcon as BookOpen
} from "@/src/lib/icons";
import { useLocalStorage } from "usehooks-ts";
import { useJantriBook } from "../../hooks/useJantriBook";
import { useSettings } from "../../hooks/useSettings";
import { jantriCategories } from "../../data/jantriBookData";
import { IslamicCalendar } from "./IslamicCalendar";
import { useTranslation } from "../../lib/i18n";
export function JantriBook() {
  const { data: jantriBookData, loading } = useJantriBook();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [bookmarkedArr, setBookmarkedArr] = useLocalStorage<string[]>("jantri_bookmarks_v1", []);
  const bookmarked = useMemo(() => new Set(bookmarkedArr), [bookmarkedArr]);

  const [recentlyReadArr, setRecentlyReadArr] = useLocalStorage<string[]>("jantri_recent_v1", []);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const lang = settings.language || 'en';

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = new Set(bookmarked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBookmarkedArr(Array.from(next));
  };

  const markAsRead = (id: string) => {
    setRecentlyReadArr(prev => {
      const filtered = prev.filter(item => item !== id);
      return [id, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      markAsRead(id);
    }
  };

  const getTitle = (chapter: any) => {
    switch (lang) {
      case 'ur': return chapter.title_ur || chapter.title_en || chapter.title || '';
      case 'hi': return chapter.title_hi || chapter.title_en || chapter.title || '';
      case 'ar': return chapter.title_ar || chapter.title_en || chapter.titleAr || chapter.title || '';
      default: return chapter.title_en || chapter.title || '';
    }
  };

  const getContent = (chapter: any) => {
    switch (lang) {
      case 'ur': return chapter.content_ur || chapter.content_en || chapter.content || '';
      case 'hi': return chapter.content_hi || chapter.content_en || chapter.content || '';
      case 'ar': return chapter.content_ar || chapter.content_en || chapter.content || '';
      default: return chapter.content_en || chapter.content || '';
    }
  };

  const filteredData = useMemo(() => {
    return jantriBookData.filter(item => {
      const matchesSearch = !searchTerm || 
        getTitle(item).toLowerCase().includes(searchTerm.toLowerCase()) || 
        getContent(item).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        (selectedCategory === "bookmarked" ? bookmarked.has(item.id) : 
         selectedCategory === "recent" ? recentlyReadArr.includes(item.id) :
         item.category === selectedCategory);
        
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, jantriBookData, bookmarked, recentlyReadArr, lang]);

  if (loading) {
    return <div className="text-center py-10 text-emerald-100/50">Loading Jantri Book...</div>;
  }

  const isSearchActive = searchTerm.length > 0;
  const showCategoryGrid = !isSearchActive && !selectedCategory;
  const showList = isSearchActive || (selectedCategory && selectedCategory !== "calendar");
  const showCalendar = selectedCategory === "calendar" && !isSearchActive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-20"
    >
      <div className="relative z-10">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Jantri topics, events, months..."
          className="w-full bg-emerald-950/40 border border-emerald-500/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-emerald-100/40 focus:outline-none focus:border-emerald-400 focus:bg-emerald-950/60 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
      </div>

      {showCategoryGrid && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 mt-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedCategory("calendar")}
              className="bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-900/30 hover:border-emerald-500/30 transition-all rounded-xl p-4 text-left group flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Calendar size={32} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-white group-hover:text-emerald-100 line-clamp-2 text-sm">Islamic Calendar</span>
            </button>

            <button
              onClick={() => setSelectedCategory("months")}
              className="bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-900/30 hover:border-emerald-500/30 transition-all rounded-xl p-4 text-left group flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Moon size={32} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-white group-hover:text-emerald-100 line-clamp-2 text-sm">Islamic Months</span>
            </button>

            <button
              onClick={() => setSelectedCategory("events")}
              className="bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-900/30 hover:border-emerald-500/30 transition-all rounded-xl p-4 text-left group flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Star size={32} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-white group-hover:text-emerald-100 line-clamp-2 text-sm">Islamic Events</span>
            </button>

            <button
              onClick={() => searchInputRef.current?.focus()}
              className="bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-900/30 hover:border-emerald-500/30 transition-all rounded-xl p-4 text-left group flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Search size={32} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-white group-hover:text-emerald-100 line-clamp-2 text-sm">Search</span>
            </button>

            <button
              onClick={() => setSelectedCategory("bookmarked")}
              className="bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-900/30 hover:border-emerald-500/30 transition-all rounded-xl p-4 text-left group flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Bookmark size={32} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-white group-hover:text-emerald-100 line-clamp-2 text-sm">Bookmarks</span>
            </button>

            <button
              onClick={() => setSelectedCategory("recent")}
              className="bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-900/30 hover:border-emerald-500/30 transition-all rounded-xl p-4 text-left group flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <BookOpen size={32} strokeWidth={1.5} />
              </div>
              <span className="font-medium text-white group-hover:text-emerald-100 line-clamp-2 text-sm">Recently Read</span>
            </button>
          </div>
        </motion.div>
      )}

      {showCalendar && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 mb-4 mt-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="w-12 h-12 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-700/50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-white">
              Islamic Calendar
            </h2>
          </div>
          <IslamicCalendar />
        </motion.div>
      )}

      {showList && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {!isSearchActive && selectedCategory && (
            <div className="flex items-center gap-3 mb-4 mt-2">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-12 h-12 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-700/50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-bold text-white">
                {selectedCategory === "bookmarked" ? "Bookmarks" : 
                 selectedCategory === "recent" ? "Recently Read" :
                 selectedCategory === "months" ? "Islamic Months" :
                 selectedCategory === "events" ? "Islamic Events" :
                 jantriCategories.find(c => c.id === selectedCategory)?.label || "Search Results"}
              </h2>
            </div>
          )}

          <div className="text-xs text-emerald-100/50 px-1 mb-2">
            {filteredData.length} chapter(s) found
          </div>

          <div className="space-y-3">
            {filteredData.map(chapter => (
              <div key={chapter.id} className="bg-emerald-900/40 border border-emerald-500/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleExpand(chapter.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-emerald-700/40 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-white">{getTitle(chapter)}</h3>
                    
                    {lang !== 'ar' && chapter.title_ar && <p className="text-emerald-400/80 font-arabic text-sm mt-1">{chapter.title_ar}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => toggleBookmark(e, chapter.id)} className="p-2 rounded-full hover:bg-emerald-700/50/50 transition-colors">
                      <Bookmark className={`w-5 h-5 ${bookmarked.has(chapter.id) ? 'fill-emerald-400 text-emerald-400' : 'text-emerald-500/50'}`} />
                    </div>
                    {expandedId === chapter.id ? (
                      <ChevronUp className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-emerald-500/50" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedId === chapter.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <div className="pt-3 border-t border-emerald-500/20 space-y-4">
                        {chapter.content_ar && (
                          <div className="text-right">
                            <p className="text-emerald-300 font-arabic text-2xl leading-relaxed whitespace-pre-wrap">{chapter.content_ar}</p>
                          </div>
                        )}
                        {lang !== 'ar' && getContent(chapter) && (
                          <div className={`pt-3 border-t border-emerald-500/10 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
                            <p className={`${lang === 'ur' ? 'font-arabic text-xl text-emerald-200/90' : 'text-emerald-100/90 text-[15px] font-medium'} leading-relaxed whitespace-pre-wrap`}>
                              {getContent(chapter)}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            {filteredData.length === 0 && (
              <div className="text-center py-12 text-emerald-200/50">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                <p>No chapters found.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
