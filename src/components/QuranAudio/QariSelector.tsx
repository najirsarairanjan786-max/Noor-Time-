import React from 'react';
import { RECITERS, Reciter } from './QuranAudioContext';

interface QariSelectorProps {
  activeReciter: Reciter;
  onSelect: (reciter: Reciter) => void;
}

export const QariSelector: React.FC<QariSelectorProps> = ({ activeReciter, onSelect }) => {
  return (
    <select
      value={activeReciter.id}
      onChange={(e) => {
        const r = RECITERS.find((x) => x.id === e.target.value);
        if (r) onSelect(r);
      }}
      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-800 outline-none focus:border-[#df4b4b]"
    >
      {RECITERS.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
};
