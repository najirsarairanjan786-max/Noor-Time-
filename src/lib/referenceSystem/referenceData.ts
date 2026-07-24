export type Authenticity = "Sahih" | "Hasan" | "Da'if" | "Mutawatir";
export type SourceType = "Quran" | "Hadith";

export interface QuranReference {
  id: string;
  type: "Quran";
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: {
    en: string;
    ur: string;
    hi: string;
  };
  topics: string[];
}

export interface HadithReference {
  id: string;
  type: "Hadith";
  bookName: string;
  chapterName: string;
  hadithNumber: string | number;
  arabicText: string;
  translation: {
    en: string;
    ur: string;
    hi: string;
  };
  authenticity: Authenticity;
  topics: string[];
}

export type IslamicReference = QuranReference | HadithReference;

export const REFERENCE_DB: IslamicReference[] = [
  // Ramadan
  {
    id: "q_2_183",
    type: "Quran",
    surahName: "Al-Baqarah",
    surahNumber: 2,
    ayahNumber: 183,
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
    translation: {
      en: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous",
      ur: "اے ایمان والو! تم پر روزے فرض کیے گئے ہیں جیسا کہ تم سے پہلے لوگوں پر فرض کیے گئے تھے تاکہ تم پرہیزگار بن جاؤ",
      hi: "ऐ ईमान वालों! तुम पर रोज़े अनिवार्य किए गए हैं जैसे कि तुम से पहले लोगों पर अनिवार्य किए गए थे ताकि तुम संयमी बन सको"
    },
    topics: ["Ramadan Information", "Fasting"]
  },
  {
    id: "h_bukhari_1901",
    type: "Hadith",
    bookName: "Sahih al-Bukhari",
    chapterName: "Book of Fasting",
    hadithNumber: 1901,
    arabicText: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    translation: {
      en: "Whoever observes fasts during the month of Ramadan out of sincere faith, and hoping to attain Allah's rewards, then all his past sins will be forgiven.",
      ur: "جس نے رمضان کے روزے ایمان اور ثواب کی نیت سے رکھے اس کے پچھلے تمام گناہ معاف کر دیے جائیں گے۔",
      hi: "जिसने रमज़ान के रोज़े ईमान और सवाब की नियत से रखे, उसके पिछले सभी गुनाह माफ़ कर दिए जाएंगे।"
    },
    authenticity: "Sahih",
    topics: ["Ramadan Information", "Fasting"]
  },
  // Zakat
  {
    id: "q_2_43",
    type: "Quran",
    surahName: "Al-Baqarah",
    surahNumber: 2,
    ayahNumber: 43,
    arabicText: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ",
    translation: {
      en: "And establish prayer and give zakah and bow with those who bow [in worship and obedience].",
      ur: "اور نماز قائم کرو اور زکوٰۃ ادا کرو اور رکوع کرنے والوں کے ساتھ رکوع کرو۔",
      hi: "और नमाज़ क़ायम करो और ज़कात दो और झुकने वालों के साथ झुको।"
    },
    topics: ["Zakat"]
  },
  {
    id: "h_bukhari_1395",
    type: "Hadith",
    bookName: "Sahih al-Bukhari",
    chapterName: "Book of Zakat",
    hadithNumber: 1395,
    arabicText: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالحَجِّ، وَصَوْمِ رَمَضَانَ",
    translation: {
      en: "Islam is based on (the following) five (principles): 1. To testify that none has the right to be worshipped but Allah and Muhammad is Allah's Messenger(ﷺ). 2. To offer the (compulsory congregational) prayers dutifully and perfectly. 3. To pay Zakat (i.e. obligatory charity). 4. To perform Hajj. (i.e. Pilgrimage to Mecca) 5. To observe fast during the month of Ramadan.",
      ur: "اسلام کی بنیاد پانچ چیزوں پر ہے: اس بات کی گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور محمد (ﷺ) اللہ کے رسول ہیں، نماز قائم کرنا، زکوٰۃ ادا کرنا، حج کرنا، اور رمضان کے روزے رکھنا۔",
      hi: "इस्लाम की नींव पांच चीज़ों पर है: इस बात की गवाही देना कि अल्लाह के सिवा कोई पूज्य नहीं और मुहम्मद (ﷺ) अल्लाह के रसूल हैं, नमाज़ क़ायम करना, ज़कात देना, हज करना, और रमज़ान के रोज़े रखना।"
    },
    authenticity: "Sahih",
    topics: ["Zakat"]
  },
  // Hajj
  {
    id: "q_3_97",
    type: "Quran",
    surahName: "Ali 'Imran",
    surahNumber: 3,
    ayahNumber: 97,
    arabicText: "وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا",
    translation: {
      en: "And [due] to Allah from the people is a pilgrimage to the House - for whoever is able to find thereto a way.",
      ur: "اور اللہ کے لیے لوگوں پر اس گھر کا حج فرض ہے جو اس تک پہنچنے کی استطاعت رکھتا ہو۔",
      hi: "और अल्लाह के लिए लोगों पर इस घर का हज अनिवार्य है जो इस तक पहुंचने का सामर्थ्य रखता हो।"
    },
    topics: ["Hajj", "Umrah"]
  },
  {
    id: "h_bukhari_1521",
    type: "Hadith",
    bookName: "Sahih al-Bukhari",
    chapterName: "Book of Hajj",
    hadithNumber: 1521,
    arabicText: "الْعُمْرَةُ إِلَى الْعُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا، وَالْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلاَّ الْجَنَّةُ",
    translation: {
      en: "The performance of 'Umra is an expiation for the sins committed between it and the previous ones. And the reward for Hajj Mabrur (an accepted Hajj) is nothing but Paradise.",
      ur: "ایک عمرہ دوسرے عمرے تک کے درمیانی گناہوں کا کفارہ ہے، اور حج مبرور (مقبول حج) کا ثواب جنت کے سوا کچھ نہیں۔",
      hi: "एक उमरा दूसरे उमरा तक के बीच के गुनाहों का प्रायश्चित है, और हज मबरूर (स्वीकृत हज) का प्रतिफल जन्नत के सिवा कुछ नहीं।"
    },
    authenticity: "Sahih",
    topics: ["Hajj", "Umrah"]
  },
  // Tasbih / Azkar
  {
    id: "q_33_41",
    type: "Quran",
    surahName: "Al-Ahzab",
    surahNumber: 33,
    ayahNumber: 41,
    arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا",
    translation: {
      en: "O you who have believed, remember Allah with much remembrance",
      ur: "اے ایمان والو! اللہ کا کثرت سے ذکر کیا کرو",
      hi: "ऐ ईमान वालों! अल्लाह का कثرत से ज़िक्र (स्मरण) किया करो"
    },
    topics: ["Tasbih", "Azkar", "Dua"]
  },
  {
    id: "h_muslim_2698",
    type: "Hadith",
    bookName: "Sahih Muslim",
    chapterName: "The Book of Remembrance",
    hadithNumber: 2698,
    arabicText: "أَحَبُّ الْكَلاَمِ إِلَى اللَّهِ أَرْبَعٌ سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ. لاَ يَضُرُّكَ بِأَيِّهِنَّ بَدَأْتَ",
    translation: {
      en: "The most beloved words to Allah are four: Subhan Allah, Al-hamdu Lillah, La ilaha illallah, and Allahu Akbar. It does not matter with which of them you begin.",
      ur: "اللہ کو چار کلمات سب سے زیادہ پسند ہیں: سبحان اللہ، الحمد للہ، لا الہ الا اللہ، اور اللہ اکبر۔ تم ان میں سے جس سے بھی ابتدا کرو کوئی حرج نہیں۔",
      hi: "अल्लाह को चार कलमे सबसे ज़्यादा पसंद हैं: सुभान अल्लाह, अल्हम्दुलिल्लाह, ला इलाहा इल्लल्लाह, और अल्लाहु अकबर। तुम इनमें से किसी से भी शुरुआत करो, कोई हर्ज नहीं।"
    },
    authenticity: "Sahih",
    topics: ["Tasbih", "Azkar"]
  },
  // Dua
  {
    id: "q_40_60",
    type: "Quran",
    surahName: "Ghafir",
    surahNumber: 40,
    ayahNumber: 60,
    arabicText: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    translation: {
      en: "And your Lord says, 'Call upon Me; I will respond to you.'",
      ur: "اور تمہارے رب نے فرمایا: مجھ سے دعا کرو، میں تمہاری دعا قبول کروں گا۔",
      hi: "और तुम्हारे रब ने फरमाया: मुझसे दुआ करो, मैं तुम्हारी दुआ क़ुबूल करूंगा।"
    },
    topics: ["Dua"]
  },
  {
    id: "h_tirmidhi_3372",
    type: "Hadith",
    bookName: "Jami' at-Tirmidhi",
    chapterName: "Chapters on Supplication",
    hadithNumber: 3372,
    arabicText: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
    translation: {
      en: "Supplication is worship itself.",
      ur: "دعا ہی عبادت ہے۔",
      hi: "दुआ ही इबादत है।"
    },
    authenticity: "Sahih",
    topics: ["Dua"]
  },
  // Islamic Events / Anniversary
  {
    id: "q_10_58",
    type: "Quran",
    surahName: "Yunus",
    surahNumber: 10,
    ayahNumber: 58,
    arabicText: "قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا هُوَ خَيْرٌ مِّمَّا يَجْمَعُونَ",
    translation: {
      en: "Say, 'In the bounty of Allah and in His mercy - in that let them rejoice; it is better than what they accumulate.'",
      ur: "کہہ دیجیے کہ یہ سب اللہ کے فضل اور اس کی رحمت سے ہے، پس اسی پر انہیں خوش ہونا چاہیے۔ یہ اس سے بہتر ہے جو وہ جمع کرتے ہیں۔",
      hi: "कह दीजिए कि यह सब अल्लाह के फज़्ल (कृपा) और उसकी रहमत से है, पस इसी पर उन्हें खुश होना चाहिए। यह उससे बेहतर है जो वे जमा करते हैं।"
    },
    topics: ["Islamic Event", "Islamic Anniversary"]
  }
];
