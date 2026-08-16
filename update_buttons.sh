sed -i 's/<div className="grid grid-cols-2 gap-3">/<div className="grid grid-cols-1 md:grid-cols-3 gap-3">/g' src/pages/AIPracticeView.tsx

# I will just use sed to insert the new button before Next Ayah
sed -i '/<button.*handleNextAyah/i \
                                <button \
                                    onClick={() => { /* stub for problem words */ }} \
                                    className="flex flex-col items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-600 p-4 rounded-xl shadow-sm border border-orange-200 transition-colors font-bold text-sm text-center"\
                                >\
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />\
                                    <span>Problem Words</span>\
                                    <span className="text-xs font-normal text-orange-500">غلطی والے الفاظ</span>\
                                </button>' src/pages/AIPracticeView.tsx
