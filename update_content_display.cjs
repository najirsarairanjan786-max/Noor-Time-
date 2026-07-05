const fs = require('fs');

const file = 'src/components/jantri/JantriBook.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldStr = `<div className="pt-3 border-t border-emerald-500/20 space-y-4">
                        {chapter.content_ar && (
                          <div className="text-right">
                            <p className="text-emerald-300 font-arabic text-xl leading-relaxed whitespace-pre-wrap">{chapter.content_ar}</p>
                          </div>
                        )}
                        {chapter.content_hi && (
                          <div className="text-left pt-3 border-t border-emerald-500/10">
                            <p className="text-emerald-100/90 text-sm leading-relaxed whitespace-pre-wrap font-medium">{chapter.content_hi}</p>
                          </div>
                        )}
                        {chapter.content_ur && (
                          <div className="text-right pt-3 border-t border-emerald-500/10">
                            <p className="text-emerald-200/80 font-arabic text-lg leading-relaxed whitespace-pre-wrap">{chapter.content_ur}</p>
                          </div>
                        )}
                        {chapter.content_en && (
                          <div className="text-left pt-3 border-t border-emerald-500/10">
                            <p className="text-emerald-500/50 text-xs leading-relaxed whitespace-pre-wrap">{chapter.content_en}</p>
                          </div>
                        )}
                      </div>`;

const newStr = `<div className="pt-3 border-t border-emerald-500/20 space-y-4">
                        {chapter.content_ar && (
                          <div className="text-right">
                            <p className="text-emerald-300 font-arabic text-2xl leading-relaxed whitespace-pre-wrap">{chapter.content_ar}</p>
                          </div>
                        )}
                        {lang !== 'ar' && getContent(chapter) && (
                          <div className={\`pt-3 border-t border-emerald-500/10 \${lang === 'ur' ? 'text-right' : 'text-left'}\`}>
                            <p className={\`\${lang === 'ur' ? 'font-arabic text-xl text-emerald-200/90' : 'text-emerald-100/90 text-[15px] font-medium'} leading-relaxed whitespace-pre-wrap\`}>
                              {getContent(chapter)}
                            </p>
                          </div>
                        )}
                      </div>`;

content = content.replace(oldStr, newStr);

fs.writeFileSync(file, content, 'utf8');
