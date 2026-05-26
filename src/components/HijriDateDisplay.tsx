import { useHijriDate } from "../hooks/useHijriDate";

export function HijriDateDisplay() {
  const { hijriDate, loading } = useHijriDate();

  if (loading || !hijriDate) {
    return (
      <div className="h-8 animate-pulse bg-emerald-800/50 rounded w-48 mx-auto mt-4"></div>
    );
  }

  // Map Arabic month names to Urdu if needed, but Arabic ones from API are generally understood (e.g. شوال)
  // Converting English numbering to Urdu/Arabic numbering
  const arabicDay = hijriDate.day
    .split("")
    .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
    .join("");
  const arabicYear = hijriDate.year
    .split("")
    .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
    .join("");

  return (
    <div className="mt-5 flex flex-col items-center">
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-800/40 border border-emerald-600/30 text-emerald-100 font-serif text-xs md:text-sm shadow-sm">
        <span className="mr-2">🌙</span>
        {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
      </div>
      <div
        className="mt-2 text-xl md:text-2xl font-serif text-emerald-200/90 tracking-wide font-medium"
        dir="rtl"
      >
        {arabicDay} {hijriDate.month.ar} {arabicYear} هـ
      </div>
    </div>
  );
}
