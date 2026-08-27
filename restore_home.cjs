const fs = require('fs');
const file = 'src/pages/Home.tsx';
let content = fs.readFileSync(file, 'utf8');

const missingImports = `
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { useSettings } from '../hooks/useSettings';
import { useData } from '../hooks/useData';
import { useHijriDate } from '../hooks/useHijriDate';
import { useDailyDua } from '../hooks/useDailyDua';
import { useAlarmSystem } from '../hooks/useAlarmSystem';
import { PrayerTimesList } from '../components/PrayerTimesList';
import { SAHIH_BUKHARI_HADEES } from '../data/hadees';
import { NewsFeed } from '../components/NewsFeed';
import { Sidebar } from '../components/Sidebar';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { ThemeModal } from "../components/ThemeModal";
import { useTranslation } from "../lib/i18n";
import { useAuth } from "../hooks/useAuth";
import { RamadanTracker } from "../components/RamadanTracker";
`;

content = missingImports + content;
fs.writeFileSync(file, content, 'utf8');
