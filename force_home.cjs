const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// just manually construct the top of the file
const top = `
import React, { useState, useEffect } from 'react';
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
import {
  Menu, Sun, CheckSquare, Clock, MessageCircle, Radio, Share2, Smartphone, BookText, Sunrise, UserCircle,
  Mosque, Kaaba, Compass, MoonStars, DotsThreeCircle, HandsPraying, HandCoins, StarAndCrescent, BellRinging,
  CalendarBlank, BookOpenText, Moon, Settings, Globe, MapPin, CloudSun, Search, Bookmark, Heart, History,
  User, Bell, ShieldCheck, Phone, Mail, HelpCircle, ShieldWarning, FileText, Star, ShareNetwork, DownloadSimple,
  UploadSimple, FloppyDisk, Trash, Pencil, Plus, Minus, CheckCircle, XCircle, Warning, Info, BookOpen,
  CrescentMoonIcon, LanternCrescentIcon, BookOpenIcon, HijriCalendarIcon, TasbihIcon, BookA
} from "@/src/lib/icons";
import { type Dispatch, type SetStateAction } from "react";
`;

// Find `type ViewType`
const idx = content.indexOf('type ViewType');
if (idx > -1) {
  content = top + content.substring(idx);
  fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
}
