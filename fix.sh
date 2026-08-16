cat src/pages/QuranView.tsx | awk '
BEGIN { skip = 0 }
/Create daily plan for the recitation of Quran/ {
  print $0
  print "                  </div>"
  print "                </div>"
  print "              </div>"
  print "              {/* Tilawat Check Banner */}"
  print "              <div"
  print "                onClick={() => setView(\"aipractice\")}"
  print "                className=\"bg-white rounded-[18px] p-4 shadow-sm border-b-[8px] border-[#fb6060] flex items-center gap-4 cursor-pointer active:scale-95 transition-transform relative overflow-hidden mb-2\""
  print "              >"
  print "                <div className=\"absolute top-2 right-2 bg-[#df4b4b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider\">"
  print "                  New"
  print "                </div>"
  print "                <div className=\"w-[64px] h-[64px] bg-[#fff0f0] rounded-2xl flex items-center justify-center shrink-0 text-[#fb6060] relative\">"
  print "                  <BookOpen className=\"w-8 h-8 absolute opacity-40\" />"
  print "                  <Mic className=\"w-6 h-6 absolute z-10 text-[#df4b4b]\" />"
  print "                </div>"
  print "                <div className=\"flex-1\">"
  print "                  <h3 className=\"text-[19px] font-extrabold text-gray-900 leading-none mb-1\">Tilawat Check</h3>"
  print "                  <p className=\"text-[15px] font-bold text-[#df4b4b] mb-1 font-arabic leading-none\" dir=\"rtl\">تلاوت چیک کریں</p>"
  print "                  <p className=\"text-[12px] text-gray-500 font-medium leading-tight\">Recite Quran and check your reading</p>"
  print "                </div>"
  print "              </div>"
  skip = 1
  next
}
/{\/\* Grid \*\/}/ {
  skip = 0
}
{ if (!skip) print $0 }
' > tmp_QuranView.tsx
mv tmp_QuranView.tsx src/pages/QuranView.tsx
