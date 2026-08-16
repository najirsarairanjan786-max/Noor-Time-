sed -i '/{\/\* Tilawat Check Banner \*\/}/,/<\/div>/d' src/pages/QuranView.tsx

sed -i '/{\/\* Grid \*\/}/i \
              {/* Tilawat Check Banner */}\
              <div\
                onClick={() => setView("aipractice")}\
                className="bg-white rounded-[18px] p-4 shadow-sm border-b-[8px] border-[#fb6060] flex items-center gap-4 cursor-pointer active:scale-95 transition-transform relative overflow-hidden mb-2"\
              >\
                <div className="absolute top-2 right-2 bg-[#df4b4b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">\
                  New\
                </div>\
                <div className="w-[64px] h-[64px] bg-[#fff0f0] rounded-2xl flex items-center justify-center shrink-0 text-[#fb6060] relative">\
                  <BookOpen className="w-8 h-8 absolute opacity-40" />\
                  <Mic className="w-6 h-6 absolute z-10 text-[#df4b4b]" />\
                </div>\
                <div className="flex-1">\
                  <h3 className="text-[19px] font-extrabold text-gray-900 leading-none mb-1">Tilawat Check</h3>\
                  <p className="text-[15px] font-bold text-[#df4b4b] mb-1 font-arabic leading-none" dir="rtl">تلاوت چیک کریں</p>\
                  <p className="text-[12px] text-gray-500 font-medium leading-tight">Recite Quran and check your reading</p>\
                </div>\
              </div>\
' src/pages/QuranView.tsx
