import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | string;

interface QuizViewProps {
  setView: Dispatch<SetStateAction<ViewType>>;
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
