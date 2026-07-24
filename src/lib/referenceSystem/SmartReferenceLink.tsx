import React, { useState } from "react";
import { BookOpenIcon, LibraryIcon } from "lucide-react";
import { REFERENCE_DB, IslamicReference } from "./referenceData";
import { ReferenceModal } from "./ReferenceModal";
import { motion } from "motion/react";

interface SmartReferenceLinkProps {
  topic: string;
}

export function SmartReferenceLink({ topic }: SmartReferenceLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<IslamicReference | null>(null);

  // Find references for this topic
  const refsForTopic = REFERENCE_DB.filter((ref) => ref.topics.includes(topic));

  if (refsForTopic.length === 0) return null;

  const quranRefs = refsForTopic.filter((r) => r.type === "Quran");
  const hadithRefs = refsForTopic.filter((r) => r.type === "Hadith");

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {quranRefs.map((ref) => (
        <motion.button
          key={ref.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReference(ref);
            setIsOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20 transition-colors"
        >
          <BookOpenIcon className="w-3.5 h-3.5" />
          <span>Quran Reference</span>
        </motion.button>
      ))}
      
      {hadithRefs.map((ref) => (
        <motion.button
          key={ref.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReference(ref);
            setIsOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20 transition-colors"
        >
          <LibraryIcon className="w-3.5 h-3.5" />
          <span>Hadith Reference</span>
        </motion.button>
      ))}

      {isOpen && selectedReference && (
        <ReferenceModal
          reference={selectedReference}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
