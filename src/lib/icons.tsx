import React, { forwardRef } from 'react';
import * as LucideIcons from 'lucide-react';

export * from 'lucide-react';

// Custom Islamic Icons
export const Mosque = forwardRef<SVGSVGElement, any>((props, ref) => (
  <svg ref={ref} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2M12 4a4 4 0 0 1 4 4v2h2v10H6V10h2V8a4 4 0 0 1 4-4zM6 10H4v10M20 10h2v10" />
    <path d="M10 20v-4a2 2 0 0 1 4 0v4" />
  </svg>
));

export const Kaaba = forwardRef<SVGSVGElement, any>((props, ref) => (
  <svg ref={ref} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10v10l8 2 8-2V10L12 8 4 10z" />
    <path d="M4 10l8 2 8-2" />
    <path d="M12 12v10" />
    <path d="M8 11.5v2" />
    <path d="M16 11.5v2" />
  </svg>
));

export const TasbihIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <svg ref={ref} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" strokeDasharray="4 4" />
    <path d="M12 20v4M12 4v-4" />
  </svg>
));

export const CrescentMoonIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <LucideIcons.Moon ref={ref} {...props} />
));

export const LanternCrescentIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <svg ref={ref} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2M10 4h4M9 4l1 6h4l1-6M9 10v10h6V10M10 20h4" />
    <path d="M12 10v10" />
  </svg>
));

export const HijriCalendarIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <LucideIcons.CalendarDays ref={ref} {...props} />
));

export const BookOpenIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <LucideIcons.BookOpen ref={ref} {...props} />
));

export const CalendarBellIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <LucideIcons.CalendarDays ref={ref} {...props} />
));

export const CharityHandIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <LucideIcons.HandCoins ref={ref} {...props} />
));

// Map missing specific aliases that might be used
export const PrayerTimesMosque = Mosque;
export const MosqueIcon = Mosque;
export const KaabaIcon = Kaaba;
export const CompassKaabaIcon = LucideIcons.Compass;
export const JantriBook = LucideIcons.Book;
export const RaisedHands = LucideIcons.Hand;
export const RaisedHandsIcon = LucideIcons.Hand;
export const HandsPraying = LucideIcons.Hand;
export const StarAndCrescent = LucideIcons.Moon;
export const StarCrescent = LucideIcons.Moon;
export const StarCrescentIcon = LucideIcons.Moon;
export const TasbihBeads = TasbihIcon;
export const CharityHand = LucideIcons.HandCoins;
export const CalendarBell = LucideIcons.CalendarDays;
export const QuranBook = LucideIcons.BookOpen;
export const MosqueMapPin = LucideIcons.MapPin;

// Lucide icon aliases for backwards compatibility in this project
export const DeviceMobile = LucideIcons.Smartphone;
export const DocumentText = LucideIcons.FileText;
export const FloppyDisk = LucideIcons.Save;
export const Gear = LucideIcons.Settings;
export const GearIcon = LucideIcons.Settings;
export const GlobeIcon = LucideIcons.Globe;
export const BookmarkIcon = LucideIcons.Bookmark;
export const ShareNetwork = LucideIcons.Share2;
export const ShieldAlert = LucideIcons.ShieldAlert;
export const ShieldCheck = LucideIcons.ShieldCheck;
export const ShieldWarning = LucideIcons.ShieldAlert;
export const SpeakerHigh = LucideIcons.Volume2;
export const SpeakerX = LucideIcons.VolumeX;
export const ThumbsUp = LucideIcons.ThumbsUp;
export const UserCircle = LucideIcons.UserCircle;
export const UserIcon = LucideIcons.User;
export const Warning = LucideIcons.AlertTriangle;
export const DownloadSimple = LucideIcons.Download;
export const UploadSimple = LucideIcons.Upload;
export const DotsThreeCircle = LucideIcons.MoreHorizontal;
export const MoonStars = LucideIcons.Moon;
export const CalendarBlank = LucideIcons.Calendar;
export const CheckSquare = LucideIcons.CheckSquare;
export const BookOpenText = LucideIcons.BookOpenText;
export const CheckCircle2 = LucideIcons.CheckCircle;
export const BarChart3 = LucideIcons.BarChart;
export const Image = LucideIcons.Image;
export const ImageIcon = LucideIcons.Image;
export const ArrowLeft = LucideIcons.ArrowLeft;
export const Search = LucideIcons.Search;
export const Clock = LucideIcons.Clock;
export const Activity = LucideIcons.Activity;
export const ArrowRight = LucideIcons.ArrowRight;
export const Ban = LucideIcons.Ban;
export const BarChart = LucideIcons.BarChart;
export const BarChartIcon = LucideIcons.BarChart;
export const Bell = LucideIcons.Bell;
export const BellIcon = LucideIcons.Bell;
export const BellOff = LucideIcons.BellOff;
export const Book = LucideIcons.Book;
export const BookIcon = LucideIcons.Book;
export const BookA = LucideIcons.BookA;
export const Calculator = LucideIcons.Calculator;
export const Calendar = LucideIcons.Calendar;
export const CalendarCheck = LucideIcons.CalendarCheck;
export const CalendarDays = LucideIcons.CalendarDays;
export const CalendarIcon = LucideIcons.Calendar;
export const Check = LucideIcons.Check;
export const CheckCircle = LucideIcons.CheckCircle;
export const ChevronDown = LucideIcons.ChevronDown;
export const ChevronLeft = LucideIcons.ChevronLeft;
export const ChevronRight = LucideIcons.ChevronRight;
export const ChevronUp = LucideIcons.ChevronUp;
export const Circle = LucideIcons.Circle;
export const Cloud = LucideIcons.Cloud;
export const CloudFog = LucideIcons.CloudFog;
export const CloudLightning = LucideIcons.CloudLightning;
export const CloudOff = LucideIcons.CloudOff;
export const CloudRain = LucideIcons.CloudRain;
export const CloudSun = LucideIcons.CloudSun;
export const Coins = LucideIcons.Coins;
export const Copy = LucideIcons.Copy;
export const Database = LucideIcons.Database;
export const DollarSign = LucideIcons.DollarSign;
export const Download = LucideIcons.Download;
export const Edit2 = LucideIcons.Edit2;
export const Edit3 = LucideIcons.Edit3;
export const Envelope = LucideIcons.Mail;
export const FileText = LucideIcons.FileText;
export const Globe = LucideIcons.Globe;
export const Handshake = LucideIcons.Handshake;
export const Heart = LucideIcons.Heart;
export const HeartHandshake = LucideIcons.HeartHandshake;
export const HelpCircle = LucideIcons.HelpCircle;
export const History = LucideIcons.History;
export const Info = LucideIcons.Info;
export const Landmark = LucideIcons.Landmark;
export const Languages = LucideIcons.Languages;
export const LanguagesIcon = LucideIcons.Languages;
export const Layers = LucideIcons.Layers;
export const LayoutDashboard = LucideIcons.LayoutDashboard;
export const Library = LucideIcons.Library;
export const Lightbulb = LucideIcons.Lightbulb;
export const Lightning = LucideIcons.Zap;
export const List = LucideIcons.List;
export const Loader2 = LucideIcons.Loader2;
export const Lock = LucideIcons.Lock;
export const LogOut = LucideIcons.LogOut;
export const Mail = LucideIcons.Mail;
export const Map = LucideIcons.Map;
export const MapPin = LucideIcons.MapPin;
export const MapPinOff = LucideIcons.MapPinOff;
export const Menu = LucideIcons.Menu;
export const MessageCircle = LucideIcons.MessageCircle;
export const MessageSquare = LucideIcons.MessageSquare;
export const Minus = LucideIcons.Minus;
export const Moon = LucideIcons.Moon;
export const MoonStar = LucideIcons.MoonStar;
export const MoreVertical = LucideIcons.MoreVertical;
export const Palette = LucideIcons.Palette;
export const Pause = LucideIcons.Pause;
export const Pencil = LucideIcons.Pencil;
export const Phone = LucideIcons.Phone;
export const Play = LucideIcons.Play;
export const Plus = LucideIcons.Plus;
export const Printer = LucideIcons.Printer;
export const Radio = LucideIcons.Radio;
export const RefreshCw = LucideIcons.RefreshCw;
export const RotateCcw = LucideIcons.RotateCcw;
export const Save = LucideIcons.Save;
export const Send = LucideIcons.Send;
export const Settings = LucideIcons.Settings;
export const Settings2 = LucideIcons.Settings2;
export const Share2 = LucideIcons.Share2;
export const Shirt = LucideIcons.Shirt;
export const ShoppingBag = LucideIcons.ShoppingBag;
export const Smartphone = LucideIcons.Smartphone;
export const Snowflake = LucideIcons.Snowflake;
export const Sparkle = LucideIcons.Sparkle;
export const Sparkles = LucideIcons.Sparkles;
export const Speaker = LucideIcons.Speaker;
export const Spinner = LucideIcons.Loader2;
export const Star = LucideIcons.Star;
export const Sun = LucideIcons.Sun;
export const SunMedium = LucideIcons.SunMedium;
export const Sunrise = LucideIcons.Sunrise;
export const Sunset = LucideIcons.Sunset;
export const Target = LucideIcons.Target;
export const Trash = LucideIcons.Trash;
export const Trash2 = LucideIcons.Trash2;
export const TrendingUp = LucideIcons.TrendingUp;
export const Trophy = LucideIcons.Trophy;
export const Undo2 = LucideIcons.Undo2;
export const Upload = LucideIcons.Upload;
export const User = LucideIcons.User;
export const Users = LucideIcons.Users;
export const Vibrate = LucideIcons.Vibrate;
export const Video = LucideIcons.Video;
export const Volume2 = LucideIcons.Volume2;
export const VolumeX = LucideIcons.VolumeX;
export const X = LucideIcons.X;
export const XCircle = LucideIcons.XCircle;
export const Compass = LucideIcons.Compass;
export const AlarmClock = LucideIcons.AlarmClock;
export const AlertTriangle = LucideIcons.AlertTriangle;
export const Camera = LucideIcons.Camera;
