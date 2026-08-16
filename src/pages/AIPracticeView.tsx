import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Mic, MicOff, Play, RefreshCcw, BarChart2, Star, Clock, Trophy, History, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { RecitationRecognitionService, RecitationAnalysis, WordResult } from "../lib/RecitationRecognitionService";

export const AIPracticeView = ({ setView, previousView = "Quran" }: { setView: (v: string) => void, previousView?: string }) => {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<RecitationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'practice' | 'dashboard'>('practice');
  const [history, setHistory] = useLocalStorage<any[]>('quran-ai-practice-history-v2', []);
  
  const recognitionService = useMemo(() => new RecitationRecognitionService(), []);
  
  // Audio playback
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((res) => res.json())
      .then((data) => setSurahs(data.data))
      .catch((err) => console.error("Error fetching surahs", err));
  }, []);

  useEffect(() => {
    if (selectedSurah) {
      setLoading(true);
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}`)
        .then((res) => res.json())
        .then((data) => {
          setAyahs(data.data.ayahs);
          setSelectedAyah(data.data.ayahs[0].numberInSurah);
          setLoading(false);
          setAnalysisResult(null);
          setRecognizedText("");
          setAudioUrl(null);
        })
        .catch((err) => {
          console.error("Error fetching ayahs", err);
          setLoading(false);
        });
    }
  }, [selectedSurah]);

  const currentAyahText = ayahs.find(a => a.numberInSurah === selectedAyah)?.text || "";

  const startRecording = async () => {
    setRecognizedText("");
    setAnalysisResult(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorder.start();
      
      recognitionService.startRecording(
        (text, isFinal) => {
          setRecognizedText(prev => prev + " " + text);
        },
        (err) => {
          console.error("Recognition Error:", err);
          stopRecording();
        }
      );
      
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for recitation practice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    recognitionService.stopRecording();
    setRecording(false);
    analyzeRecording();
  };

  const analyzeRecording = async () => {
    setIsAnalyzing(true);
    // Give it a tiny delay to allow final text to process
    setTimeout(async () => {
      const result = await recognitionService.analyzeRecitation(currentAyahText, recognizedText);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      // Save history
      const newHistoryItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        surah: selectedSurah,
        ayah: selectedAyah,
        accuracy: result.accuracy,
        confidence: result.overallConfidence
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    }, 1000);
  };

  // Stats calculation
  const totalPractices = history.length;
  const averageAccuracy = totalPractices > 0 ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalPractices) : 0;
  const bestAccuracy = totalPractices > 0 ? Math.max(...history.map(h => h.accuracy)) : 0;

  const handleNextAyah = () => {
    const currentIndex = ayahs.findIndex(a => a.numberInSurah === selectedAyah);
    if (currentIndex < ayahs.length - 1) {
      setSelectedAyah(ayahs[currentIndex + 1].numberInSurah);
      setAnalysisResult(null);
      setRecognizedText("");
      setAudioUrl(null);
    }
  };

  const WordFeedback: React.FC<{ word: any; key?: any }> = ({ word }) => {
    let colorClass = "text-gray-400"; // low confidence
    let bgClass = "bg-gray-100";
    
    if (word.confidence > 0.6) {
      if (word.matchStatus === 'correct') {
        colorClass = "text-emerald-600";
        bgClass = "bg-emerald-50 border-emerald-200";
      } else if (word.matchStatus === 'wrong' || word.matchStatus === 'missing') {
        colorClass = "text-red-600";
        bgClass = "bg-red-50 border-red-200";
      } else if (word.matchStatus === 'extra') {
        colorClass = "text-blue-600";
        bgClass = "bg-blue-50 border-blue-200";
      }
    } else if (word.confidence > 0.3) {
      // Medium confidence
      colorClass = "text-orange-500";
      bgClass = "bg-orange-50 border-orange-200";
    }

    return (
      <div className={`p-3 rounded-lg border ${bgClass} flex flex-col items-center justify-center min-w-[80px]`}>
        <span className={`font-arabic text-2xl ${colorClass}`}>
          {word.expected || word.recognized}
        </span>
        {word.issue && (
          <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight">
            {word.issue}
          </span>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 px-4 pt-12 max-w-lg mx-auto min-h-[100dvh] flex flex-col bg-gray-50 text-gray-800"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView(previousView)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Advanced Tilawat</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex bg-white rounded-full p-1.5 shadow-sm mb-6 border border-gray-200">
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-2 rounded-full font-bold text-[13px] transition-colors ${
            activeTab === 'practice'
              ? "bg-[#df4b4b] text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Recitation (تلاوت)
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 rounded-full font-bold text-[13px] transition-colors ${
            activeTab === 'dashboard'
              ? "bg-[#df4b4b] text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Progress (ترقی)
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
        {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col flex-1">
                
                <div className="bg-emerald-50 rounded-xl p-3 mb-4 flex items-start gap-3 border border-emerald-100">
                    <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800">
                        <strong>Teacher Notice:</strong> Automatic recitation checking is an assistive tool. For detailed Tajweed and pronunciation learning, consult a qualified Quran teacher.
                    </p>
                </div>

                {!analysisResult && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Surah</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none font-medium text-gray-800"
                                    value={selectedSurah} 
                                    onChange={(e) => setSelectedSurah(Number(e.target.value))}
                                >
                                    {surahs.map(s => (
                                        <option key={s.number} value={s.number}>{s.number}. {s.englishName} ({s.name})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Ayah</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none font-medium text-gray-800"
                                    value={selectedAyah} 
                                    onChange={(e) => setSelectedAyah(Number(e.target.value))}
                                    disabled={loading}
                                >
                                    {ayahs.map(a => (
                                        <option key={a.numberInSurah} value={a.numberInSurah}>Ayah {a.numberInSurah}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#df4b4b] border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            <div className="min-h-[150px] flex flex-col items-center justify-center py-6">
                                <p className="font-arabic text-3xl md:text-4xl text-center leading-[2] text-gray-900 mb-8" dir="rtl">
                                    {currentAyahText}
                                </p>

                                <button 
                                    onClick={recording ? stopRecording : startRecording}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                                        recording 
                                        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                                        : 'bg-[#df4b4b] text-white shadow-lg hover:bg-[#c93d3d]'
                                    }`}
                                >
                                    {recording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                </button>
                                <p className="mt-4 font-bold text-gray-600 text-sm">
                                    {recording ? "تلاوت روکیں (Stop)" : "تلاوت شروع کریں (Start)"}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {isAnalyzing && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-4 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#df4b4b] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-gray-600">Analyzing Recitation...</p>
                    </div>
                )}

                {analysisResult && !isAnalyzing && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                        
                        {/* Result Summary */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center justify-between">
                                <span>Recitation Result</span>
                                <span className="text-[#df4b4b]">تلاوت کا نتیجہ</span>
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <div className="text-3xl font-extrabold text-gray-800">{analysisResult.accuracy}%</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Accuracy</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <div className="text-3xl font-extrabold text-[#df4b4b]">{analysisResult.overallConfidence}%</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Confidence</div>
                                </div>
                            </div>
                        </div>

                        {/* Word by Word Analysis */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-md mb-4 border-b pb-2">Word-by-Word Review</h3>
                            
                            <div className="flex flex-wrap gap-2 justify-end mb-6" dir="rtl">
                                {analysisResult.words.map((word, i) => (
                                    
<WordFeedback key={i} word={word} />
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs font-semibold justify-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span> High Confidence (Correct)</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span> High Confidence (Mismatch)</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-400 rounded-full inline-block"></span> Medium Confidence</div>
                                <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span> Low Confidence</div>
                            </div>
                        </div>

                        {/* Tajweed Review */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-md mb-4 border-b pb-2 flex justify-between items-center">
                                <span>Tajweed Review</span>
                                <span>تجوید کا جائزہ</span>
                            </h3>
                            <div className="space-y-2">
                                {analysisResult.tajweed.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                                        <span className="font-semibold text-gray-700">{t.rule}</span>
                                        {t.status === 'not_verified' ? (
                                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                                                <AlertTriangle className="w-3.5 h-3.5" /> {t.message}
                                            </span>
                                        ) : t.status === 'verified_correct' ? (
                                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Issue Detected
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-2">
                            {audioUrl && (
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-xs font-bold text-gray-500 mb-2">Your Recording:</p>
                                    <audio src={audioUrl} controls className="w-full h-10" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setAnalysisResult(null)} 
                                    className="flex flex-col items-center justify-center gap-1 bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 transition-colors font-bold text-sm"
                                >
                                    <RefreshCcw className="w-5 h-5 text-gray-500" />
                                    <span>Try Again</span>
                                    <span className="text-xs font-normal text-gray-500">دوبارہ کوشش کریں</span>
                                </button>
                                <button 
                                    onClick={handleNextAyah} 
                                    className="flex flex-col items-center justify-center gap-1 bg-[#df4b4b] hover:bg-[#c93d3d] text-white p-4 rounded-xl shadow-sm transition-colors font-bold text-sm"
                                >
                                    <Play className="w-5 h-5" />
                                    <span>Next Ayah</span>
                                    <span className="text-xs font-normal text-white/80">اگلی آیت</span>
                                </button>
                            </div>
                        </div>

                    </motion.div>
                )}
            </motion.div>
        )}

        {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{bestAccuracy}%</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Best Accuracy</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <BarChart2 className="w-8 h-8 text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{totalPractices}</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Total Practices</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <Star className="w-8 h-8 text-emerald-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{averageAccuracy}%</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Avg Accuracy</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <History className="w-8 h-8 text-purple-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-800">{history.length}</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Attempts</div>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-400" /> Recent Practice
                </h3>
                
                <div className="space-y-3">
                    {history.slice(0, 10).map((h, i) => (
                        <div key={h.id || i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-800">Surah {h.surah}, Ayah {h.ayah}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold text-lg ${h.accuracy >= 80 ? 'text-emerald-500' : h.accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {h.accuracy}%
                                </div>
                                <div className="text-[10px] text-gray-400 font-medium">ACCURACY</div>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="text-center text-gray-500 py-8 bg-white shadow-sm rounded-xl border border-gray-100">
                            No practice history yet.
                        </div>
                    )}
                </div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
