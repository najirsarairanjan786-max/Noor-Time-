import { ArrowLeft, Languages as LanguagesIcon } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { useSettings } from "../hooks/useSettings";
import { cn } from "../lib/utils";
import { ViewType } from "../App";
import { useTranslation } from "../lib/i18n";

export function LanguagesView({
  setView,
}: {
  setView: Dispatch<SetStateAction<ViewType>>;
}) {
  const { settings, setSettings } = useSettings();
  const { t, isRTL } = useTranslation(settings.language);

  const handleLanguageSelect = (langName: string) => {
    setSettings((prev) => ({ ...prev, language: langName }));
  };

  const languages = [
    { name: "Arabic", native: "العربية" },
    { name: "English", native: "English" },
    { name: "Urdu", native: "اردو" },
    { name: "Bangla", native: "বাংলা" },
    { name: "Gujarati", native: "ગુજરાતી" },
    { name: "Hindi", native: "हिंदी" },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-[#f5f5f5] flex flex-col font-sans h-full overflow-hidden">
      {/* Header */}
      <div className={cn("bg-[#de4936] text-white flex items-center px-4 py-3 shadow-md shrink-0 z-10 pt-safe", isRTL && "flex-row-reverse")}>
        <button
          onClick={() => setView("home")}
          className={cn("p-2 rounded-full hover:bg-white/10 transition", isRTL ? "-mr-2" : "-ml-2")}
        >
          <ArrowLeft className={cn("w-6 h-6", isRTL && "rotate-180")} />
        </button>
        <h1 className={cn("text-[22px] font-semibold flex-1 tracking-wide", isRTL ? "mr-4 text-right" : "ml-4")}>
          {t('languages')}
        </h1>
      </div>

      {/* Pattern Background */}
      <div
        className="absolute inset-0 top-[60px] opacity-[0.03] z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%23000000' fill-opacity='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto z-10 px-4 py-4 space-y-3">
        {languages.map((lang) => {
          const isSelected =
            settings.language.toLowerCase() === lang.name.toLowerCase() ||
            (settings.language === "en" && lang.name === "English") ||
            (settings.language === "ur" && lang.name === "Urdu");
          return (
            <button
              key={lang.name}
              onClick={() => handleLanguageSelect(lang.name)}
              className={cn(
                "w-full flex items-center bg-white rounded-md shadow-sm overflow-hidden min-h-[64px] border transition active:scale-[0.98]",
                isSelected
                  ? "border-[#de4936] ring-1 ring-[#de4936]/10"
                  : "border-slate-200",
              )}
            >
              {/* Red left bar */}
              {isSelected ? (
                <div className="w-[4px] h-full self-stretch bg-[#de4936]" />
              ) : (
                <div className="w-[4px] h-full self-stretch bg-transparent" />
              )}

              <div className="flex items-center w-full px-4 gap-4 py-4">
                <LanguagesIcon
                  className={cn(
                    "w-7 h-7",
                    isSelected ? "text-[#de4936]" : "text-[#de4936]/80",
                  )}
                  strokeWidth={1.5}
                />
                <div className="flex items-center text-[17px] font-bold text-slate-800">
                  <span>{lang.name}</span>
                  <span className="ml-2 font-medium">( {lang.native} )</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
