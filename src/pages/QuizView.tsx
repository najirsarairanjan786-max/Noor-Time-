import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | string;

interface QuizViewProps {
  setView: Dispatch<SetStateAction<ViewType>>;
  key?: string;
}

const QUESTIONS = [
  {
    questionEn: "What is the very first pillar of Islam?",
    questionHi: "इस्लाम का सबसे पहला स्तंभ क्या है?",
    questionAr: "ما هو الركن الأول من أركان الإسلام؟",
    options: [
      { en: "Shahadah", hi: "कलमा (गवाही)", ar: "الشهادة" },
      { en: "Salah", hi: "नमाज़", ar: "الصلاة" },
      { en: "Zakat", hi: "ज़कात", ar: "الزكاة" },
      { en: "Hajj", hi: "हज", ar: "الحج" }
    ],
    correctIndex: 0
  },
  {
    questionEn: "Which Angel brought the revelation of the Quran?",
    questionHi: "कुरान की वही (संदेश) कौन से फरिश्ते लेकर आए?",
    questionAr: "من هو الملك الذي نزل بالقرآن؟",
    options: [
      { en: "Mika'il", hi: "हज़रत मीकाईल", ar: "ميكائيل" },
      { en: "Jibra'il", hi: "हज़रत जिब्राईल", ar: "جبريل" },
      { en: "Israfil", hi: "हज़रत इस्राफील", ar: "إسرافيل" },
      { en: "Izra'il", hi: "हज़रत इज़राईल", ar: "عزرائيل" }
    ],
    correctIndex: 1
  },
  {
    questionEn: "What is the name of the holy book in Islam?",
    questionHi: "इस्लाम में पवित्र ग्रंथ का क्या नाम है?",
    questionAr: "ما هو اسم الكتاب المقدس في الإسلام؟",
    options: [
      { en: "Injeel", hi: "इन्जील", ar: "الإنجيل" },
      { en: "Zabur", hi: "ज़बूर", ar: "الزبور" },
      { en: "Tawrat", hi: "तौरेत", ar: "التوراة" },
      { en: "Quran", hi: "क़ुरआन", ar: "القرآن" }
    ],
    correctIndex: 3
  },
  {
    questionEn: "In which Islamic month do Muslims observe fasting?",
    questionHi: "मुसलमान किस इस्लामी महीने में रोज़ा रखते हैं?",
    questionAr: "في أي شهر إسلامي يصوم المسلمون؟",
    options: [
      { en: "Muharram", hi: "मुहर्रम", ar: "محرم" },
      { en: "Shawwal", hi: "शव्वाल", ar: "شوال" },
      { en: "Ramadan", hi: "रमज़ान", ar: "رمضان" },
      { en: "Rajab", hi: "रजब", ar: "رجب" }
    ],
    correctIndex: 2
  },
  {
    questionEn: "How many obligatory prayers must a Muslim perform daily?",
    questionHi: "एक मुसलमान को दिन भर में कितनी फ़र्ज़ नमाज़ें पढ़नी चाहिए?",
    questionAr: "كم عدد الصلوات المفروضة على المسلم يومياً؟",
    options: [
      { en: "Three", hi: "तीन", ar: "ثلاث" },
      { en: "Four", hi: "चार", ar: "أربع" },
      { en: "Five", hi: "पांच", ar: "خمس" },
      { en: "Six", hi: "छह", ar: "ست" }
    ],
    correctIndex: 2
  },
  {
    questionEn: "Who was the first prophet in Islam?",
    questionHi: "इस्लाम के पहले नबी कौन थे?",
    questionAr: "من هو أول نبي في الإسلام؟",
    options: [
      { en: "Prophet Muhammad (PBUH)", hi: "हज़रत मुहम्मद (PBUH)", ar: "النبي محمد" },
      { en: "Prophet Ibrahim (AS)", hi: "हज़रत इब्राहीम (AS)", ar: "إبراهيم" },
      { en: "Prophet Musa (AS)", hi: "हज़रत मूसा (AS)", ar: "موسى" },
      { en: "Prophet Adam (AS)", hi: "हज़रत आदम (AS)", ar: "آدم" }
    ],
    correctIndex: 3
  },
  {
    questionEn: "What is the direction that Muslims face when they pray?",
    questionHi: "मुसलमान नमाज़ के दौरान किस दिशा की ओर मुँह करते हैं?",
    questionAr: "ما هو الاتجاه الذي يواجهه المسلمون في الصلاة؟",
    options: [
      { en: "East", hi: "पूर्व", ar: "الشرق" },
      { en: "The Qibla (Kaaba)", hi: "क़िबला (काबा)", ar: "القبلة (الكعبة)" },
      { en: "North", hi: "उत्तर", ar: "الشمال" },
      { en: "Al-Aqsa Mosque", hi: "अल-अक्सा मस्जिद", ar: "المسجد الأقصى" }
    ],
    correctIndex: 1
  },
  {
    questionEn: "In which city was Prophet Muhammad (PBUH) born?",
    questionHi: "हज़रत मुहम्मद (PBUH) का जन्म किस शहर में हुआ था?",
    questionAr: "في أي مدينة ولد النبي محمد (صلى الله عليه وسلم)؟",
    options: [
      { en: "Madinah", hi: "मदीना", ar: "المدينة" },
      { en: "Jerusalem", hi: "यरूशलेम", ar: "القدس" },
      { en: "Makkah", hi: "मक्का", ar: "مكة" },
      { en: "Damascus", hi: "दमिश्क", ar: "دمشق" }
    ],
    correctIndex: 2
  },
  {
    questionEn: "Who was the first Caliph of Islam?",
    questionHi: "इस्लाम के पहले खलीफा कौन थे?",
    questionAr: "من هو أول خليفة في الإسلام؟",
    options: [
      { en: "Umar ibn Al-Khattab", hi: "उमर इब्न अल-खत्ताब", ar: "عمر بن الخطاب" },
      { en: "Ali ibn Abi Talib", hi: "अली इब्न अबी तालिब", ar: "علي بن أبي طالب" },
      { en: "Uthman ibn Affan", hi: "उस्मान इब्न अफ्फान", ar: "عثمان بن عفان" },
      { en: "Abu Bakr As-Siddiq", hi: "अबू बकर अस-सिद्दीक", ar: "أبو بكر الصديق" }
    ],
    correctIndex: 3
  },
  {
    questionEn: "Which Surah is known as the 'Heart of the Quran'?",
    questionHi: "किस सूरह को 'कुरान का दिल' कहा जाता है?",
    questionAr: "أي سورة تسمى 'قلب القرآن'؟",
    options: [
      { en: "Surah Al-Mulk", hi: "सूरह अल-मुल्क", ar: "سورة الملك" },
      { en: "Surah Yaseen", hi: "सूरह यासीन", ar: "سورة يس" },
      { en: "Surah Ar-Rahman", hi: "सूरह अर-रहमान", ar: "سورة الرحمن" },
      { en: "Surah Al-Kahf", hi: "सूरह अल-कहफ", ar: "سورة الكهف" }
    ],
    correctIndex: 1
  },
  {
    questionEn: "What is the name of the cave where the first revelation was received?",
    questionHi: "उस गुफा का नाम क्या है जहां सबसे पहली वही (प्रकाशना) प्राप्त हुई थी?",
    questionAr: "ما اسم الغار الذي نزل فيه الوحي لأول مرة؟",
    options: [
      { en: "Cave Thawr", hi: "गारे सौर", ar: "غار ثور" },
      { en: "Cave Uhud", hi: "गारे उहुद", ar: "غار أحد" },
      { en: "Cave Hira", hi: "गारे हिरा", ar: "غار حراء" },
      { en: "Cave Safa", hi: "गारे सफा", ar: "غار صفا" }
    ],
    correctIndex: 2
  },
  {
    questionEn: "How many Surahs (chapters) are there in the Holy Quran?",
    questionHi: "पवित्र कुरान में कितनी सूरह (अध्याय) हैं?",
    questionAr: "كم عدد السور في القرآن الكريم؟",
    options: [
      { en: "114", hi: "114", ar: "114" },
      { en: "99", hi: "99", ar: "99" },
      { en: "120", hi: "120", ar: "120" },
      { en: "100", hi: "100", ar: "100" }
    ],
    correctIndex: 0
  },
  {
    questionEn: "Which angel will blow the Trumpet on the Day of Judgment?",
    questionHi: "क़यामत के दिन कौन सा फरिश्ता सूर (तुरही) फूंकेगा?",
    questionAr: "من هو الملك الذي سينفخ في الصور يوم القيامة؟",
    options: [
      { en: "Jibra'il", hi: "हज़रत जिब्राईल", ar: "جبريل" },
      { en: "Israfil", hi: "हज़रत इस्राफील", ar: "إسرافيل" },
      { en: "Mika'il", hi: "हज़रत मीकाईल", ar: "ميكائيل" },
      { en: "Izra'il", hi: "हज़रत इज़राईल", ar: "عزرائيل" }
    ],
    correctIndex: 1
  },
  {
    questionEn: "What is the shortest Surah in the Holy Quran?",
    questionHi: "पवित्र कुरान की सबसे छोटी सूरह कौन सी है?",
    questionAr: "ما هي أقصر سورة في القرآن الكريم؟",
    options: [
      { en: "Surah Al-Asr", hi: "सूरह अल-अस्र", ar: "سورة العصر" },
      { en: "Surah Al-Ikhlas", hi: "सूरह अल-इखलास", ar: "سورة الإخلاص" },
      { en: "Surah Al-Kawthar", hi: "सूरह अल-कौसर", ar: "سورة الكوثر" },
      { en: "Surah An-Nas", hi: "सूरह अन-नास", ar: "سورة الناس" }
    ],
    correctIndex: 2
  }
];

export function QuizView({ setView }: QuizViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedOption(index);
    setShowResult(true);

    if (index === QUESTIONS[currentQuestion].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      // Quiz completed - handled in render
      setCurrentQuestion(c => c + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
  };

  const isCompleted = currentQuestion >= QUESTIONS.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-32 px-4 pt-12 max-w-lg mx-auto min-h-[100dvh] flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setView('home')} 
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">Question & Answer</h1>
      </div>

      <div className="flex-1 bg-white rounded-3xl p-6 shadow-2xl flex flex-col">
        {isCompleted ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🌟</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
            <p className="text-slate-600 mb-8">
              Your score: <span className="font-bold text-emerald-600">{score}</span> out of {QUESTIONS.length}
            </p>
            <button 
              onClick={resetQuiz}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                Question {currentQuestion + 1}/{QUESTIONS.length}
              </span>
              <span className="text-slate-500 font-medium text-sm">
                Score: {score}
              </span>
            </div>

            <div className="mb-8 space-y-3">
              <h2 className="text-[19px] leading-snug font-bold text-slate-800">
                {QUESTIONS[currentQuestion].questionEn}
              </h2>
              <h2 className="text-[18px] leading-snug font-semibold text-slate-700">
                {QUESTIONS[currentQuestion].questionHi}
              </h2>
              <h2 className="text-[22px] leading-snug font-arabic font-bold text-slate-800 text-right">
                {QUESTIONS[currentQuestion].questionAr}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {QUESTIONS[currentQuestion].options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === QUESTIONS[currentQuestion].correctIndex;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                let buttonClass = "flex items-center justify-between p-4 rounded-2xl border-2 transition-all ";
                
                if (showCorrect) {
                  buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-800";
                } else if (showWrong) {
                  buttonClass += "border-rose-500 bg-rose-50 text-rose-800";
                } else if (isSelected) {
                  buttonClass += "border-emerald-500 bg-emerald-50";
                } else if (showResult) {
                  buttonClass += "border-slate-100 bg-slate-50 opacity-50";
                } else {
                  buttonClass += "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 text-slate-700";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between w-full">
                         <span className="font-semibold text-left">{option.en}</span>
                         <span className="font-arabic font-bold text-lg text-right">{option.ar}</span>
                      </div>
                      <span className="font-medium text-slate-600 text-sm text-left mt-1">{option.hi}</span>
                    </div>
                    {showCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 ml-3" />}
                    {showWrong && <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0 ml-3" />}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-end"
              >
                <button
                  onClick={handleNext}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all w-full sm:w-auto"
                >
                  {currentQuestion === QUESTIONS.length - 1 ? 'Finish' : 'Next Question'}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
