const fs = require('fs');

const file = 'src/components/jantri/JantriBook.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="pt-3 border-t border-slate-700/50">
                        <p className={\`text-emerald-100/90 whitespace-pre-wrap text-sm leading-relaxed \${['ar', 'ur'].includes(lang) ? 'text-right font-arabic text-lg' : ''}\`}>
                          {getContent(chapter)}
                        </p>
                      </div>`;

const newStr = `<div className="pt-3 border-t border-slate-700/50 space-y-4">
                        {chapter.content_ar && (
                          <div className="text-right">
                            <p className="text-emerald-300 font-arabic text-2xl leading-relaxed whitespace-pre-wrap">{chapter.content_ar}</p>
                          </div>
                        )}
                        {chapter.content_hi && (
                          <div className="text-left pt-3 border-t border-emerald-500/10">
                            <p className="text-emerald-100/90 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{chapter.content_hi}</p>
                          </div>
                        )}
                        {chapter.content_ur && (
                          <div className="text-right pt-3 border-t border-emerald-500/10">
                            <p className="text-emerald-200/80 font-arabic text-xl leading-relaxed whitespace-pre-wrap">{chapter.content_ur}</p>
                          </div>
                        )}
                        {chapter.content_en && (
                          <div className="text-left pt-3 border-t border-emerald-500/10">
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{chapter.content_en}</p>
                          </div>
                        )}
                      </div>`;

// Wait, the original code had:
// <div className="pt-3 border-t border-slate-700/50">
// <p className={`text-slate-300 whitespace-pre-wrap text-sm leading-relaxed ${['ar', 'ur'].includes(lang) ? 'text-right font-arabic text-lg' : ''}`}>
// {getContent(chapter)}
// </p>
// </div>

// In the previous step I ran `patch_ui_2.cjs` which changed `text-slate-300` to `text-emerald-100/90`. Let's double check what's actually there.
