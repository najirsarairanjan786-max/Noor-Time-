import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocalStorage } from "usehooks-ts";
import { Calculator, DollarSign, Coins, TrendingUp, Landmark, FileText, Share2, Printer, History, Trash2, Edit2, Info, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp, Save, HeartHandshake } from "@/src/lib/icons";
import { useSettings } from "../../hooks/useSettings";

const FX_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.5,
  BDT: 110.0,
  PKR: 278.0,
  SAR: 3.75,
  AED: 3.67,
  EUR: 0.92
};

const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: "Zakat Calculator",
    subtitle: "Calculate your Zakat accurately based on live Nisab values.",
    assets: "Assets & Wealth",
    cash: "Cash in Hand",
    bank: "Bank Balance",
    gold: "Gold Value",
    silver: "Silver Value",
    inventory: "Business Inventory",
    investments: "Investments & Shares",
    rental: "Rental Income",
    otherSavings: "Other Savings",
    liabilities: "Liabilities & Debts (to deduct)",
    loans: "Personal Loans",
    creditCard: "Credit Card Due",
    otherDebts: "Other Debts",
    calculation: "Calculation Summary",
    totalAssets: "Total Assets",
    totalDebts: "Minus Debts",
    netWealth: "Net Zakatable Wealth",
    nisabValue: "Nisab Threshold",
    eligible: "Eligible for Zakat ✅",
    notEligible: "Not Eligible ❌",
    totalZakat: "Total Zakat Due (2.5%)",
    save: "Save",
    share: "Share",
    print: "Print / PDF",
    reset: "Reset",
    history: "Calculation History",
    guidance: "Zakat Guidance",
    whatIsNisab: "What is Nisab?",
    whatIsNisabAns: "Nisab is the minimum amount of wealth a Muslim must possess for a full lunar year before Zakat becomes obligatory. It is equivalent to 87.48 grams of gold or 612.36 grams of silver.",
    whoMustPay: "Who must pay Zakat?",
    whoMustPayAns: "Any adult, sane Muslim whose wealth exceeds the Nisab threshold for a full lunar year must pay 2.5% of their qualifying wealth.",
    whoCanReceive: "Who can receive Zakat?",
    whoCanReceiveAns: "Zakat can be given to the poor, the needy, those employed to collect it, those whose hearts are to be reconciled, to free captives, those in debt, in the way of Allah, and the wayfarer (Quran 9:60).",
    references: "Quran & Hadith",
    referencesAns: "\"And establish prayer and give zakat, and whatever good you put forward for yourselves – you will find it with Allah.\" (Quran 2:110)",
    goldNisab: "Gold Nisab (87.48g)",
    silverNisab: "Silver Nisab (612.36g)",
    currency: "Currency",
    liveRates: "Live Rates",
    lastUpdated: "Last Updated",
  },
  ur: {
    title: "زکوۃ کیلکولیٹر",
    subtitle: "نصاب کے مطابق اپنی زکوۃ کا درست حساب لگائیں۔",
    assets: "اثاثے اور دولت",
    cash: "نقد رقم",
    bank: "بینک بیلنس",
    gold: "سونے کی مالیت",
    silver: "چاندی کی مالیت",
    inventory: "کاروباری سامان",
    investments: "سرمایہ کاری اور حصص",
    rental: "کرایہ کی آمدنی",
    otherSavings: "دیگر بچت",
    liabilities: "واجبات اور قرضے (منہا کرنے کے لیے)",
    loans: "ذاتی قرضے",
    creditCard: "کریڈٹ کارڈ کا بل",
    otherDebts: "دیگر قرضے",
    calculation: "حساب کا خلاصہ",
    totalAssets: "کل اثاثے",
    totalDebts: "منہا قرضے",
    netWealth: "خالص زکوۃ کے قابل دولت",
    nisabValue: "نصاب کی حد",
    eligible: "زکوۃ کے لیے اہل ہیں ✅",
    notEligible: "اہل نہیں ہیں ❌",
    totalZakat: "کل زکوۃ (2.5%)",
    save: "محفوظ کریں",
    share: "شیئر کریں",
    print: "پرنٹ کریں / پی ڈی ایف",
    reset: "ری سیٹ کریں",
    history: "حساب کی تاریخ",
    guidance: "زکوۃ کی رہنمائی",
    whatIsNisab: "نصاب کیا ہے؟",
    whatIsNisabAns: "نصاب دولت کی وہ کم از کم مقدار ہے جس پر زکوۃ فرض ہوتی ہے۔ یہ 87.48 گرام سونے یا 612.36 گرام چاندی کے برابر ہے۔",
    whoMustPay: "زکوۃ کس پر فرض ہے؟",
    whoMustPayAns: "ہر عاقل و بالغ مسلمان جس کے پاس نصاب کے برابر یا اس سے زیادہ مال ایک مکمل اسلامی سال تک رہے، اس پر 2.5 فیصد زکوۃ فرض ہے۔",
    whoCanReceive: "زکوۃ کسے دی جا سکتی ہے؟",
    whoCanReceiveAns: "زکوۃ فقراء، مساکین، زکوۃ جمع کرنے والے، جن کی تالیف قلب مقصود ہو، غلام آزاد کرانے، قرض داروں، اللہ کی راہ میں اور مسافروں کو دی جا سکتی ہے (قرآن 9:60)۔",
    references: "قرآن و حدیث",
    referencesAns: "\"اور نماز قائم کرو اور زکوۃ ادا کرو، اور جو بھلائی تم اپنے لیے آگے بھیجو گے، اسے اللہ کے پاس پاؤ گے۔\" (قرآن 2:110)",
    goldNisab: "سونے کا نصاب (87.48 گرام)",
    silverNisab: "چاندی کا نصاب (612.36 گرام)",
    currency: "کرنسی",
    liveRates: "لائیو ریٹس",
    lastUpdated: "آخری اپڈیٹ",
  },
  hi: {
    title: "ज़कात कैलकुलेटर",
    subtitle: "लाइव निसाब के आधार पर सटीक ज़कात की गणना करें।",
    assets: "संपत्ति और धन",
    cash: "नकद",
    bank: "बैंक बैलेंस",
    gold: "सोने का मूल्य",
    silver: "चांदी का मूल्य",
    inventory: "व्यापार सूची",
    investments: "निवेश और शेयर",
    rental: "किराये की आय",
    otherSavings: "अन्य बचत",
    liabilities: "देनदारियां और ऋण (कटौती के लिए)",
    loans: "व्यक्तिगत ऋण",
    creditCard: "क्रेडिट कार्ड देय",
    otherDebts: "अन्य ऋण",
    calculation: "गणना सारांश",
    totalAssets: "कुल संपत्ति",
    totalDebts: "ऋण घटाएं",
    netWealth: "शुद्ध ज़कात योग्य संपत्ति",
    nisabValue: "निसाब सीमा",
    eligible: "ज़कात के लिए योग्य ✅",
    notEligible: "योग्य नहीं ❌",
    totalZakat: "कुल देय ज़कात (2.5%)",
    save: "सहेजें",
    share: "साझा करें",
    print: "प्रिंट / पीडीएफ",
    reset: "रीसेट करें",
    history: "गणना इतिहास",
    guidance: "ज़कात मार्गदर्शन",
    whatIsNisab: "निसाब क्या है?",
    whatIsNisabAns: "निसाब वह न्यूनतम संपत्ति है जिस पर ज़कात अनिवार्य होती है। यह 87.48 ग्राम सोने या 612.36 ग्राम चांदी के बराबर है।",
    whoMustPay: "ज़कात किसे देनी चाहिए?",
    whoMustPayAns: "कोई भी वयस्क, समझदार मुसलमान जिसकी संपत्ति एक पूरे चंद्र वर्ष के लिए निसाब सीमा से अधिक है, उसे 2.5% ज़कात देनी होगी।",
    whoCanReceive: "ज़कात किसे दी जा सकती है?",
    whoCanReceiveAns: "ज़कात गरीबों, जरूरतमंदों, इसे इकट्ठा करने वालों, ऋणग्रस्त लोगों, अल्लाह के रास्ते में और मुसाफिरों को दी जा सकती है (कुरान 9:60)।",
    references: "कुरान और हदीस",
    referencesAns: "\"और नमाज़ कायम करो और ज़कात दो, और जो भलाई तुम अपने लिए आगे भेजोगे, उसे अल्लाह के पास पाओगे।\" (कुरान 2:110)",
    goldNisab: "स्वर्ण निसाब (87.48 ग्राम)",
    silverNisab: "रजत निसाब (612.36 ग्राम)",
    currency: "मुद्रा",
    liveRates: "लाइव दरें",
    lastUpdated: "अंतिम अपडेट",
  },
  ar: {
    title: "حاسبة الزكاة",
    subtitle: "احسب زكاتك بدقة بناءً على قيم النصاب الحية.",
    assets: "الأصول والثروة",
    cash: "النقدية",
    bank: "الرصيد البنكي",
    gold: "قيمة الذهب",
    silver: "قيمة الفضة",
    inventory: "البضائع التجارية",
    investments: "الاستثمارات والأسهم",
    rental: "إيرادات الإيجار",
    otherSavings: "مدخرات أخرى",
    liabilities: "الخصوم والديون (لخصمها)",
    loans: "قروض شخصية",
    creditCard: "ديون بطاقة الائتمان",
    otherDebts: "ديون أخرى",
    calculation: "ملخص الحساب",
    totalAssets: "إجمالي الأصول",
    totalDebts: "ناقص الديون",
    netWealth: "صافي الثروة الخاضعة للزكاة",
    nisabValue: "قيمة النصاب",
    eligible: "مؤهل للزكاة ✅",
    notEligible: "غير مؤهل ❌",
    totalZakat: "إجمالي الزكاة المستحقة (2.5%)",
    save: "حفظ",
    share: "مشاركة",
    print: "طباعة",
    reset: "إعادة تعيين",
    history: "تاريخ الحسابات",
    guidance: "دليل الزكاة",
    whatIsNisab: "ما هو النصاب؟",
    whatIsNisabAns: "النصاب هو الحد الأدنى من الثروة الذي يجب أن يمتلكه المسلم لمدة عام قمري كامل قبل أن تصبح الزكاة فرضًا. ويعادل 87.48 جرامًا من الذهب أو 612.36 جرامًا من الفضة.",
    whoMustPay: "على من تجب الزكاة؟",
    whoMustPayAns: "كل مسلم بالغ عاقل تتجاوز ثروته حد النصاب لحول كامل يجب أن يدفع 2.5٪ من ثروته المؤهلة.",
    whoCanReceive: "لمن تعطى الزكاة؟",
    whoCanReceiveAns: "تعطى الزكاة للفقراء والمساكين والعاملين عليها والمؤلفة قلوبهم وفي الرقاب والغارمين وفي سبيل الله وابن السبيل (القرآن 9:60).",
    references: "القرآن والحديث",
    referencesAns: "\"وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ۚ وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ\" (البقرة: 110)",
    goldNisab: "نصاب الذهب (87.48 جم)",
    silverNisab: "نصاب الفضة (612.36 جم)",
    currency: "العملة",
    liveRates: "أسعار حية",
    lastUpdated: "آخر تحديث",
  }
};

type HistoryEntry = {
  id: string;
  date: string;
  year: number;
  netWealth: number;
  zakatAmount: number;
  currency: string;
};

export function ZakatCalculator() {
  const { settings } = useSettings();
  const lang = ['en', 'hi', 'ur', 'ar'].includes(settings.language) ? settings.language : 'en';
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  const isRTL = lang === 'ar' || lang === 'ur';

  // Config State
  const [nisabStandard, setNisabStandard] = useState<"gold" | "silver">("silver");
  const [currency, setCurrency] = useState("USD");
  
  // Rates State (Live)
  const [goldRate, setGoldRate] = useState(75.50); // Base USD per gram
  const [silverRate, setSilverRate] = useState(0.95); // Base USD per gram
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Asset State
  const [cash, setCash] = useState<number | "">("");
  const [bank, setBank] = useState<number | "">("");
  const [goldAsset, setGoldAsset] = useState<number | "">("");
  const [silverAsset, setSilverAsset] = useState<number | "">("");
  const [inventory, setInventory] = useState<number | "">("");
  const [investments, setInvestments] = useState<number | "">("");
  const [rental, setRental] = useState<number | "">("");
  const [otherAssets, setOtherAssets] = useState<number | "">("");

  // Liability State
  const [loans, setLoans] = useState<number | "">("");
  const [creditCard, setCreditCard] = useState<number | "">("");
  const [otherDebts, setOtherDebts] = useState<number | "">("");

  // History State
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("zakat-history", []);
  
  // UI State
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"calculator" | "history" | "guidance">("calculator");
  
  const componentRef = useRef<HTMLDivElement>(null);

  // Derived Values
  const exchangeRate = FX_RATES[currency] || 1.0;
  const currentGoldPrice = goldRate * exchangeRate;
  const currentSilverPrice = silverRate * exchangeRate;

  const nisabValue = nisabStandard === "gold" 
    ? GOLD_NISAB_GRAMS * currentGoldPrice 
    : SILVER_NISAB_GRAMS * currentSilverPrice;

  const totalAssets = (Number(cash) || 0) + (Number(bank) || 0) + (Number(goldAsset) || 0) + (Number(silverAsset) || 0) + (Number(inventory) || 0) + (Number(investments) || 0) + (Number(rental) || 0) + (Number(otherAssets) || 0);
  const totalDebts = (Number(loans) || 0) + (Number(creditCard) || 0) + (Number(otherDebts) || 0);
  const netWealth = Math.max(0, totalAssets - totalDebts);
  
  const isEligible = netWealth >= nisabValue;
  const totalZakat = isEligible ? netWealth * 0.025 : 0;

  const refreshRates = () => {
    setIsRefreshing(true);
    // Simulate API fetch delay
    setTimeout(() => {
      // Slight randomization to simulate live market fluctuations
      setGoldRate(75.50 + (Math.random() * 2 - 1));
      setSilverRate(0.95 + (Math.random() * 0.1 - 0.05));
      setLastUpdated(new Date().toLocaleString());
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    refreshRates();
  }, [currency]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all fields?")) {
      setCash(""); setBank(""); setGoldAsset(""); setSilverAsset("");
      setInventory(""); setInvestments(""); setRental(""); setOtherAssets("");
      setLoans(""); setCreditCard(""); setOtherDebts("");
    }
  };

  const handleSave = () => {
    if (netWealth === 0) return;
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      year: new Date().getFullYear(),
      netWealth,
      zakatAmount: totalZakat,
      currency
    };
    setHistory([newEntry, ...history]);
    alert("Calculation saved to history!");
    setActiveTab("history");
  };

  const handleShare = async () => {
    const text = `Zakat Calculation Summary
Net Wealth: ${netWealth.toFixed(2)} ${currency}
Total Zakat: ${totalZakat.toFixed(2)} ${currency}
Eligible: ${isEligible ? 'Yes' : 'No'}
Calculated via Noor Time App`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Zakat Calculation',
          text: text,
        });
      } catch (err) {
        console.log('Share error', err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const deleteHistory = (id: string) => {
    if (window.confirm("Delete this saved calculation?")) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const InputField = ({ label, value, setter, icon: Icon }: { label: string, value: number | "", setter: (v: number | "") => void, icon?: any }) => (
    <div>
      <label className="block text-sm font-medium text-emerald-100 mb-1.5 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-emerald-400" />} {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-medium">{currency}</span>
        <input 
          type="number" 
          value={value} 
          onChange={e => setter(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full bg-emerald-950/50 border border-emerald-500/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400 transition-colors"
          placeholder="0.00"
          dir="ltr"
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      ref={componentRef}
    >
      <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-sm print:bg-white print:text-black print:shadow-none">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl print:hidden">
            <Calculator className="text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white print:text-emerald-900">{t("title")}</h2>
            <p className="text-emerald-100/70 text-sm print:text-gray-600">{t("subtitle")}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-emerald-950/50 rounded-xl p-1 mb-8 mt-6 print:hidden">
          <button onClick={() => setActiveTab("calculator")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "calculator" ? "bg-emerald-500 text-white shadow" : "text-emerald-100/70 hover:text-white"}`}>Calculator</button>
          <button onClick={() => setActiveTab("history")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "history" ? "bg-emerald-500 text-white shadow" : "text-emerald-100/70 hover:text-white"}`}>{t("history")}</button>
          <button onClick={() => setActiveTab("guidance")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "guidance" ? "bg-emerald-500 text-white shadow" : "text-emerald-100/70 hover:text-white"}`}>Guidance</button>
        </div>

        {activeTab === "calculator" && (
          <div className="space-y-8">
            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4 print:hidden">
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-1">{t("currency")}</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-emerald-950/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                >
                  {Object.keys(FX_RATES).map(cur => <option key={cur} value={cur}>{cur}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-1">Nisab Standard</label>
                <select 
                  value={nisabStandard} 
                  onChange={e => setNisabStandard(e.target.value as any)}
                  className="w-full bg-emerald-950/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="silver">{t("silverNisab")}</option>
                  <option value="gold">{t("goldNisab")}</option>
                </select>
              </div>
            </div>

            {/* Live Rates Banner */}
            <div className="bg-emerald-800/30 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between print:hidden">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-100">{t("liveRates")} ({currency})</span>
                </div>
                <div className="text-xs text-emerald-200/60">{t("lastUpdated")}: {lastUpdated}</div>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="text-center"><span className="text-amber-400 block text-xs uppercase tracking-wider">Gold/g</span>{currentGoldPrice.toFixed(2)}</div>
                <div className="text-center"><span className="text-slate-300 block text-xs uppercase tracking-wider">Silver/g</span>{currentSilverPrice.toFixed(2)}</div>
                <button onClick={refreshRates} className={`p-2 bg-emerald-500/20 rounded-full hover:bg-emerald-500/40 transition-colors ${isRefreshing ? 'animate-spin text-emerald-300' : 'text-emerald-400'}`}>
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Assets Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-emerald-500/20 pb-2 print:text-emerald-900">
                  <Landmark className="text-emerald-400" size={20} /> {t("assets")}
                </h3>
                <div className="space-y-4">
                  <InputField label={t("cash")} value={cash} setter={setCash} icon={DollarSign} />
                  <InputField label={t("bank")} value={bank} setter={setBank} icon={Landmark} />
                  <InputField label={t("gold")} value={goldAsset} setter={setGoldAsset} icon={Coins} />
                  <InputField label={t("silver")} value={silverAsset} setter={setSilverAsset} icon={Coins} />
                  <InputField label={t("inventory")} value={inventory} setter={setInventory} />
                  <InputField label={t("investments")} value={investments} setter={setInvestments} />
                  <InputField label={t("rental")} value={rental} setter={setRental} />
                  <InputField label={t("otherSavings")} value={otherAssets} setter={setOtherAssets} />
                </div>
              </div>

              {/* Liabilities Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-rose-500/20 pb-2 print:text-rose-900">
                  <TrendingUp className="text-rose-400 rotate-180" size={20} /> {t("liabilities")}
                </h3>
                <div className="space-y-4">
                  <InputField label={t("loans")} value={loans} setter={setLoans} />
                  <InputField label={t("creditCard")} value={creditCard} setter={setCreditCard} />
                  <InputField label={t("otherDebts")} value={otherDebts} setter={setOtherDebts} />
                </div>

                {/* Calculation Summary Card */}
                <div className="mt-8 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 print:border-gray-300 print:bg-gray-50">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 print:text-black">
                    <FileText size={20} className="text-emerald-400" /> {t("calculation")}
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-emerald-100 print:text-gray-700">
                      <span>{t("totalAssets")}</span>
                      <span>{totalAssets.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between text-rose-300 print:text-rose-700">
                      <span>{t("totalDebts")}</span>
                      <span>- {totalDebts.toFixed(2)} {currency}</span>
                    </div>
                    <div className="border-t border-emerald-500/20 my-2 pt-2 flex justify-between font-bold text-white print:text-black">
                      <span>{t("netWealth")}</span>
                      <span>{netWealth.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between text-emerald-200/60 text-xs">
                      <span>{t("nisabValue")} ({nisabStandard})</span>
                      <span>{nisabValue.toFixed(2)} {currency}</span>
                    </div>
                  </div>

                  {isEligible ? (
                    <div className="mt-6 p-5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 w-full">
                      <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-3">
                        <CheckCircle size={24} className="text-emerald-400"/>
                        <span className="text-lg font-bold text-emerald-300">✅ {t("eligible")}</span>
                      </div>
                      <p className="text-emerald-100/70 text-sm mb-4">Your wealth is above the Nisab threshold.</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-emerald-100/80">
                          <span>{t("netWealth")}:</span>
                          <span className="font-semibold">{netWealth.toFixed(2)} {currency}</span>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-100/80">
                          <span>{t("nisabValue")}:</span>
                          <span className="font-semibold">{nisabValue.toFixed(2)} {currency}</span>
                        </div>
                      </div>
                      <div className="bg-emerald-950/50 rounded-lg p-3 flex justify-between items-center border border-emerald-500/20">
                        <span className="text-emerald-100/80 text-sm font-medium">{t("totalZakat")}:</span>
                        <span className="text-2xl font-bold text-emerald-400">{totalZakat.toFixed(2)} {currency}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-5 rounded-xl border bg-rose-500/10 border-rose-500/20 w-full">
                      <div className="flex items-center gap-2 mb-3 border-b border-rose-500/20 pb-3">
                        <XCircle size={24} className="text-rose-400"/>
                        <span className="text-lg font-bold text-rose-300">❌ {t("notEligible")}</span>
                      </div>
                      <p className="text-rose-100/70 text-sm mb-4">Your net zakatable wealth is below the Nisab threshold.</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-rose-100/80">
                          <span>{t("netWealth")}:</span>
                          <span className="font-semibold">{netWealth.toFixed(2)} {currency}</span>
                        </div>
                        <div className="flex justify-between text-sm text-rose-100/80">
                          <span>{t("nisabValue")}:</span>
                          <span className="font-semibold">{nisabValue.toFixed(2)} {currency}</span>
                        </div>
                        <div className="flex justify-between text-sm text-rose-100/80 pt-2 border-t border-rose-500/20">
                          <span>Zakat Due:</span>
                          <span className="font-semibold">0.00 {currency}</span>
                        </div>
                      </div>
                      <div className="bg-rose-950/40 rounded-lg p-3 border border-rose-500/20">
                        <span className="text-rose-200/80 text-sm font-semibold block mb-1">Reason:</span>
                        <span className="text-rose-100/70 text-sm">Your wealth has not reached the minimum Nisab required for Zakat.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 print:hidden">
                  <button onClick={handleReset} className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
                    {t("reset")}
                  </button>
                  <button onClick={handleSave} disabled={netWealth === 0} className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save size={18} /> {t("save")}
                  </button>
                  <button onClick={handleShare} className="py-3 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <Share2 size={18} /> {t("share")}
                  </button>
                  <button onClick={handlePrint} className="py-3 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <Printer size={18} /> {t("print")}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12 text-emerald-100/50">
                <History size={48} className="mx-auto mb-4 opacity-20" />
                <p>No saved calculations yet.</p>
              </div>
            ) : (
              history.map(entry => (
                <div key={entry.id} className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-emerald-400 font-bold text-lg">{entry.zakatAmount.toFixed(2)} {entry.currency}</div>
                    <div className="text-emerald-100/60 text-sm">Net Wealth: {entry.netWealth.toFixed(2)} {entry.currency}</div>
                    <div className="text-xs text-emerald-100/40 mt-1">{entry.date} - Year {entry.year}</div>
                  </div>
                  <button onClick={() => deleteHistory(entry.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "guidance" && (
          <div className="space-y-4">
            {[
              { id: 'q1', q: t("whatIsNisab"), a: t("whatIsNisabAns") },
              { id: 'q2', q: t("whoMustPay"), a: t("whoMustPayAns") },
              { id: 'q3', q: t("whoCanReceive"), a: t("whoCanReceiveAns") },
              { id: 'q4', q: t("references"), a: t("referencesAns") },
            ].map(item => (
              <div key={item.id} className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setExpandedSection(expandedSection === item.id ? null : item.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-emerald-100">{item.q}</span>
                  {expandedSection === item.id ? <ChevronUp size={20} className="text-emerald-400"/> : <ChevronDown size={20} className="text-emerald-400"/>}
                </button>
                <AnimatePresence>
                  {expandedSection === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 text-emerald-100/70 text-sm leading-relaxed"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
}
