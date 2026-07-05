import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { jantriBookData as defaultJantriData, JantriChapter } from "../data/jantriBookData";

export function useJantriBook() {
  const [data, setData] = useState<JantriChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function initialize() {
      // 1. Try to load from cache first for instant display
      const cache = localStorage.getItem("jantri_book_data_v11");
      if (cache) {
        try {
          setData(JSON.parse(cache));
          setLoading(false);
        } catch (e) {
          console.error("Failed to parse jantri book cache", e);
        }
      }

      // 2. Fall back to default data if no cache, before network request finishes
      if (!cache) {
        setData(defaultJantriData);
        setLoading(false); // We have default data, no need to show loading screen
      }

      // 3. Set up real-time listener for background sync
      try {
        const jantriRef = collection(db, "jantri_book");
        unsubscribe = onSnapshot(jantriRef, (snapshot) => {
          if (!snapshot.empty) {
            const firestoreChapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JantriChapter));
            
            // Merge Firestore data with local data to ensure we have the latest translations
            const mergedChapters = firestoreChapters.map(fsChapter => {
              const localChapter = defaultJantriData.find(c => c.id === fsChapter.id);
              if (localChapter) {
                return { ...fsChapter, ...localChapter }; // Local takes precedence for translations
              }
              return fsChapter;
            });
            
            // Add any local chapters that aren't in Firestore yet
            const newLocalChapters = defaultJantriData.filter(lc => !firestoreChapters.some(fc => fc.id === lc.id));
            const finalChapters = [...mergedChapters, ...newLocalChapters];

            setData(finalChapters);
            localStorage.setItem("jantri_book_data_v11", JSON.stringify(finalChapters));
          }
        }, (error) => {
          console.error("Error syncing Jantri book data:", error);
          // Only log error, don't clear data so it falls back to cache/default safely
        });
      } catch (e) {
        console.error("Error setting up Jantri book listener:", e);
      }
    }

    initialize();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { data, loading };
}
