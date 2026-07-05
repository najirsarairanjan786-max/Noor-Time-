export interface JantriChapter {
  id: string;
  title?: string;
  titleAr?: string;
  content?: string;
  title_en: string;
  title_ur?: string;
  title_hi?: string;
  title_ar?: string;
  content_en: string;
  content_ur?: string;
  content_hi?: string;
  content_ar?: string;
  category: string;
}

export const jantriCategories = [
  { id: "calendar", label: "Islamic Calendar", icon: "Calendar" },
  { id: "months", label: "Islamic Months", icon: "Moon" },
  { id: "prayer", label: "Prayer Guide", icon: "Clock" },
  { id: "ramadan", label: "Ramadan Guide", icon: "LanternCrescentIcon" },
  { id: "duas", label: "Daily Duas", icon: "Heart" },
  { id: "azkar", label: "Tasbih & Azkar", icon: "Activity" },
  { id: "zakat", label: "Zakat Guide", icon: "PieChart" },
  { id: "hajj_umrah", label: "Hajj & Umrah", icon: "Globe" },
  { id: "events", label: "Islamic Events", icon: "CalendarDays" },
  { id: "women", label: "Women in Islam", icon: "Users" },
  { id: "janazah", label: "Janazah Guide", icon: "Archive" },
  { id: "manners", label: "Islamic Manners", icon: "Smile" },
  { id: "quran_hadith", label: "Quran & Hadith", icon: "BookOpen" },
  { id: "faq", label: "FAQ", icon: "HelpCircle" },
];

export const jantriBookData: JantriChapter[] = [
  {
    "id": "month_muharram",
    "category": "months",
    "title_en": "1. Muharram",
    "title_hi": "1. मुहर्रम",
    "title_ar": "١. محرم",
    "title_ur": "1. محرم",
    "content_en": "Introduction:\nMuharram is the first month of the Islamic calendar and one of the four sacred months.\n\nImportance:\nIt is highly blessed. The rewards of good deeds are multiplied.\n\nHistorical Significance:\nThe 10th of Muharram (Ashura) is when Allah saved Prophet Musa (AS) from Pharaoh. It is also the day of the tragic martyrdom of Imam Hussain (RA).\n\nRecommended Worship:\nFasting on the 9th and 10th (or 10th and 11th) of Muharram is highly recommended and wipes out the sins of the past year.",
    "content_hi": "परिचय:\nमुहर्रम इस्लामी कैलेंडर का पहला महीना है और चार पवित्र महीनों में से एक है।\n\nमहत्व:\nयह बहुत ही बरकत वाला महीना है। इसमें किए गए नेक कामों का सवाब कई गुना बढ़ जाता है।\n\nऐतिहासिक महत्व:\n10 मुहर्रम (आशूरा) के दिन अल्लाह ने हज़रत मूसा (अ.स.) को फिरौन से बचाया था। इसी दिन इमाम हुसैन (र.अ.) की शहादत का दर्दनाक वाकया भी पेश आया था।\n\nअनुशंसित इबादत:\n9 और 10 (या 10 और 11) मुहर्रम को रोज़ा रखना अत्यधिक अनुशंसित है, जो पिछले एक साल के गुनाहों को मिटा देता है।",
    "content_ar": "المقدمة:\nمحرم هو الشهر الأول في التقويم الإسلامي وأحد الأشهر الأربعة الحرم.\n\nالأهمية:\nإنه شهر مبارك تُضاعف فيه أجور الأعمال الصالحة.\n\nالأهمية التاريخية:\nفي العاشر من محرم (عاشوراء) نجّى الله النبي موسى (عليه السلام) من فرعون. وهو أيضاً يوم استشهاد الإمام الحسين (رضي الله عنه).\n\nالعبادات المستحبة:\nيُستحب بشدة صيام اليوم التاسع والعاشر (أو العاشر والحادي عشر) من محرم، وهو يكفر ذنوب السنة الماضية.",
    "content_ur": "تعارف:\nمحرم اسلامی کیلنڈر کا پہلا اور چار حرمت والے مہینوں میں سے ایک مہینہ ہے۔\n\nاہمیت:\nیہ بہت بابرکت مہینہ ہے جس میں نیک اعمال کا ثواب بڑھا دیا جاتا ہے۔\n\nتاریخی اہمیت:\n10 محرم (عاشورہ) کے دن اللہ تعالیٰ نے حضرت موسیٰ (ع) کو فرعون سے نجات دی تھی۔ اسی دن امام حسین (رض) کی شہادت کا عظیم واقعہ بھی پیش آیا۔\n\nمستحب عبادات:\n9 اور 10 (یا 10 اور 11) محرم کا روزہ رکھنا بہت مستحب ہے، یہ گزشتہ ایک سال کے گناہوں کا کفارہ بن جاتا ہے۔"
  },
  {
    "id": "month_safar",
    "category": "months",
    "title_en": "2. Safar",
    "title_hi": "2. सफर",
    "title_ar": "٢. صفر",
    "title_ur": "2. صفر",
    "content_en": "Introduction:\nSafar is the second month of the Islamic calendar.\n\nImportance:\nIslam teaches that no month is unlucky. Safar is as blessed as other normal months.\n\nHistorical Significance:\nMany important events occurred in early Islam during Safar.\n\nRecommended Worship:\nMaintain the five daily prayers, daily Dhikr, and charity.",
    "content_hi": "परिचय:\nसफर इस्लामी कैलेंडर का दूसरा महीना है।\n\nमहत्व:\nइस्लाम सिखाता है कि कोई भी महीना अशुभ नहीं होता। सफर भी अन्य महीनों की तरह ही बरकत वाला है।\n\nऐतिहासिक महत्व:\nइस्लाम के शुरुआती दौर में सफर के महीने में कई महत्वपूर्ण घटनाएँ घटीं।\n\nअनुशंसित इबादत:\nपांचों वक्त की नमाज़ कायम करें, रोज़ाना ज़िक्र करें और दान (सदका) दें।",
    "content_ar": "المقدمة:\nصفر هو الشهر الثاني في التقويم الإسلامي.\n\nالأهمية:\nيعلمنا الإسلام أنه لا يوجد شهر مشئوم. صفر مبارك كباقي الأشهر.\n\nالأهمية التاريخية:\nوقعت أحداث مهمة في فجر الإسلام خلال شهر صفر.\n\nالعبادات المستحبة:\nالمحافظة على الصلوات الخمس والذكر اليومي والصدقات.",
    "content_ur": "تعارف:\nصفر اسلامی کیلنڈر کا دوسرا مہینہ ہے۔\n\nاہمیت:\nاسلام ہمیں سکھاتا ہے کہ کوئی مہینہ منحوس نہیں ہوتا۔ صفر بھی دیگر مہینوں کی طرح بابرکت ہے۔\n\nتاریخی اہمیت:\nاوائل اسلام میں صفر کے مہینے میں کئی اہم واقعات پیش آئے۔\n\nمستحب عبادات:\nپانچوں وقت کی نماز کی پابندی کریں، روزانہ ذکر کریں اور صدقہ خیرات کریں۔"
  },
  {
    "id": "month_rabiawwal",
    "category": "months",
    "title_en": "3. Rabi al-Awwal",
    "title_hi": "3. रबी उल-अव्वल",
    "title_ar": "٣. ربيع الأول",
    "title_ur": "3. ربیع الاول",
    "content_en": "Introduction:\nRabi al-Awwal is the third month of the Islamic calendar.\n\nImportance:\nIt holds a special place in the hearts of Muslims as it is widely accepted as the birth month of Prophet Muhammad (PBUH).\n\nHistorical Significance:\nThe Prophet's (PBUH) birth, migration (Hijrah) to Madinah, and passing away all occurred in this month.\n\nRecommended Worship:\nIncrease in sending Salawat (Durood) upon the Prophet (PBUH) and studying his Seerah (biography).",
    "content_hi": "परिचय:\nरबी उल-अव्वल इस्लामी कैलेंडर का तीसरा महीना है।\n\nमहत्व:\nमुसलमानों के दिलों में इसका विशेष स्थान है क्योंकि इसे पैगंबर मुहम्मद (स.अ.व.) के जन्म का महीना माना जाता है।\n\nऐतिहासिक महत्व:\nपैगंबर (स.अ.व.) का जन्म, मदीना की ओर हिजरत (प्रवास), और वफात (निधन) सभी इसी महीने में हुए थे।\n\nअनुशंसित इबादत:\nपैगंबर (स.अ.व.) पर अधिक से अधिक दरूद शरीफ़ भेजें और उनकी सीरत (जीवनी) का अध्ययन करें।",
    "content_ar": "المقدمة:\nربيع الأول هو الشهر الثالث في التقويم الإسلامي.\n\nالأهمية:\nيحتل مكانة خاصة في قلوب المسلمين لأنه شهر ولادة النبي محمد (صلى الله عليه وسلم).\n\nالأهمية التاريخية:\nولادة النبي (صلى الله عليه وسلم)، وهجرته إلى المدينة، ووفاته، كلها حدثت في هذا الشهر.\n\nالعبادات المستحبة:\nالإكثار من الصلاة والسلام على النبي (صلى الله عليه وسلم) ودراسة سيرته النبوية العطرة.",
    "content_ur": "تعارف:\nربیع الاول اسلامی کیلنڈر کا تیسرا مہینہ ہے۔\n\nاہمیت:\nمسلمانوں کے دلوں میں اس کا خاص مقام ہے کیونکہ یہ نبی کریم (صلی اللہ علیہ وسلم) کی ولادت کا مہینہ ہے۔\n\nتاریخی اہمیت:\nنبی کریم (صلی اللہ علیہ وسلم) کی ولادت، مدینہ کی طرف ہجرت، اور وفات اسی مہینے میں ہوئی۔\n\nمستحب عبادات:\nنبی کریم (صلی اللہ علیہ وسلم) پر کثرت سے درود شریف پڑھیں اور آپ کی سیرت طیبہ کا مطالعہ کریں۔"
  },
  {
    "id": "month_rabithani",
    "category": "months",
    "title_en": "4. Rabi al-Thani",
    "title_hi": "4. रबी उल-सानी",
    "title_ar": "٤. ربيع الثاني",
    "title_ur": "4. ربیع الثانی",
    "content_en": "Introduction:\nRabi al-Thani (or Rabi al-Akhir) is the fourth month of the Islamic calendar.\n\nImportance:\nA month to continue the good habits built during the previous month.\n\nRecommended Worship:\nConsistency in daily prayers, reciting Quran, and helping others.",
    "content_hi": "परिचय:\nरबी उल-सानी (या रबी उल-आख़िर) इस्लामी कैलेंडर का चौथा महीना है।\n\nमहत्व:\nपिछले महीने में बनाई गई अच्छी आदतों को जारी रखने का महीना है।\n\nअनुशंसित इबादत:\nदैनिक नमाज़ों में निरंतरता, कुरान की तिलावत और दूसरों की मदद करना।",
    "content_ar": "المقدمة:\nربيع الثاني (أو ربيع الآخر) هو الشهر الرابع في التقويم الإسلامي.\n\nالأهمية:\nشهر للاستمرار في العادات الصالحة التي اكتسبناها.\n\nالعبادات المستحبة:\nالمداومة على الصلوات وقراءة القرآن ومساعدة الآخرين.",
    "content_ur": "تعارف:\nربیع الثانی اسلامی کیلنڈر کا چوتھا مہینہ ہے۔\n\nاہمیت:\nیہ پچھلے مہینے میں اپنائی گئی نیک عادات کو جاری رکھنے کا مہینہ ہے۔\n\nمستحب عبادات:\nپنجگانہ نماز کی پابندی، تلاوت قرآن اور دوسروں کی مدد کرنا۔"
  },
  {
    "id": "month_jumadaula",
    "category": "months",
    "title_en": "5. Jumada al-Ula",
    "title_hi": "5. जुमादा अल-उला",
    "title_ar": "٥. جمادى الأولى",
    "title_ur": "5. جمادی الاول",
    "content_en": "Introduction:\nJumada al-Ula is the fifth month of the Islamic calendar.\n\nImportance:\nThe name reflects the freezing of water, indicating it originally fell in the winter season.\n\nRecommended Worship:\nShowing gratitude for Allah's blessings and maintaining family ties.",
    "content_hi": "परिचय:\nजुमादा अल-उला इस्लामी कैलेंडर का पांचवां महीना है।\n\nमहत्व:\nइसका नाम पानी के जमने को दर्शाता है, जो बताता है कि यह मूल रूप से सर्दियों के मौसम में आता था।\n\nअनुशंसित इबादत:\nअल्लाह की नेमतों का शुक्र अदा करना और पारिवारिक संबंधों को बनाए रखना।",
    "content_ar": "المقدمة:\nجمادى الأولى هو الشهر الخامس في التقويم الإسلامي.\n\nالأهمية:\nالاسم يعكس تجمد الماء، مما يشير إلى أنه كان يقع قديماً في فصل الشتاء.\n\nالعبادات المستحبة:\nشكر الله على نعمه وصلة الأرحام.",
    "content_ur": "تعارف:\nجمادی الاول اسلامی کیلنڈر کا پانچواں مہینہ ہے۔\n\nاہمیت:\nاس کا نام پانی کے جمنے کی طرف اشارہ کرتا ہے، جس کا مطلب ہے کہ یہ ابتداء میں سردیوں کے موسم میں آتا تھا۔\n\nمستحب عبادات:\nاللہ کی نعمتوں کا شکر ادا کرنا اور صلہ رحمی قائم رکھنا۔"
  },
  {
    "id": "month_jumadaakhirah",
    "category": "months",
    "title_en": "6. Jumada al-Akhirah",
    "title_hi": "6. जुमादा अल-आख़िरह",
    "title_ar": "٦. جمادى الآخرة",
    "title_ur": "6. جمادی الثانی",
    "content_en": "Introduction:\nJumada al-Akhirah is the sixth month of the Islamic calendar.\n\nImportance:\nIt marks the halfway point of the Islamic year, reminding us to prepare for Ramadan.\n\nRecommended Worship:\nReflecting on our goals and increasing voluntary fasts.",
    "content_hi": "परिचय:\nजुमादा अल-आख़िरह इस्लामी कैलेंडर का छठा महीना है।\n\nमहत्व:\nयह इस्लामी वर्ष के मध्य बिंदु को दर्शाता है, जो हमें रमज़ान की तैयारी की याद दिलाता है।\n\nअनुशंसित इबादत:\nअपने लक्ष्यों पर विचार करना और नफ्ल (स्वैच्छिक) रोज़े बढ़ाना।",
    "content_ar": "المقدمة:\nجمادى الآخرة هو الشهر السادس في التقويم الإسلامي.\n\nالأهمية:\nيمثل منتصف السنة الهجرية، ويذكرنا بالاستعداد لرمضان.\n\nالعبادات المستحبة:\nمحاسبة النفس والإكثار من صيام التطوع.",
    "content_ur": "تعارف:\nجمادی الثانی اسلامی کیلنڈر کا چھٹا مہینہ ہے۔\n\nاہمیت:\nیہ اسلامی سال کا نصف حصہ ہے، جو ہمیں رمضان کی تیاری کی یاد دلاتا ہے۔\n\nمستحب عبادات:\nاپنے اعمال کا محاسبہ کرنا اور نفلی روزوں کی کثرت کرنا۔"
  },
  {
    "id": "month_rajab",
    "category": "months",
    "title_en": "7. Rajab",
    "title_hi": "7. रजब",
    "title_ar": "٧. رجب",
    "title_ur": "7. رجب",
    "content_en": "Introduction:\nRajab is the seventh month and one of the four sacred months in Islam.\n\nImportance:\nWarfare is forbidden in this month. It is known as the month of Allah.\n\nHistorical Significance:\nThe miraculous night journey (Al-Isra wal Mi'raj) of the Prophet (PBUH) is widely believed to have occurred in this month.\n\nRecommended Worship:\nSeeking forgiveness (Istighfar), fasting, and making Du'a for blessings to reach Ramadan.",
    "content_hi": "परिचय:\nरजब सातवां महीना है और इस्लाम के चार पवित्र महीनों में से एक है।\n\nमहत्व:\nइस महीने में युद्ध वर्जित है। इसे अल्लाह का महीना कहा जाता है।\n\nऐतिहासिक महत्व:\nमाना जाता है कि पैगंबर (स.अ.व.) की चमत्कारी रात की यात्रा (अल-इसरा वल-मेराज) इसी महीने में हुई थी।\n\nअनुशंसित इबादत:\nक्षमा मांगना (इस्तिगफार), रोज़ा रखना और रमज़ान तक पहुँचने के लिए अल्लाह से दुआ करना।",
    "content_ar": "المقدمة:\nرجب هو الشهر السابع وأحد الأشهر الأربعة الحرم.\n\nالأهمية:\nالقتال محرم فيه، ويُعرف بشهر الله.\n\nالأهمية التاريخية:\nيُعتقد أن رحلة الإسراء والمعراج للنبي (صلى الله عليه وسلم) حدثت في هذا الشهر.\n\nالعبادات المستحبة:\nالإكثار من الاستغفار والصيام والدعاء بالبركة وبلوغ رمضان.",
    "content_ur": "تعارف:\nرجب ساتواں اور چار حرمت والے مہینوں میں سے ایک ہے۔\n\nاہمیت:\nاس مہینے میں جنگ حرام ہے۔ اسے اللہ کا مہینہ کہا جاتا ہے۔\n\nتاریخی اہمیت:\nنبی کریم (صلی اللہ علیہ وسلم) کا عظیم معجزہ شبِ معراج اسی مہینے میں پیش آیا۔\n\nمستحب عبادات:\nکثرت سے استغفار کرنا، روزے رکھنا اور رمضان تک پہنچنے کی دعا کرنا۔"
  },
  {
    "id": "month_shaban",
    "category": "months",
    "title_en": "8. Sha'ban",
    "title_hi": "8. शाबान",
    "title_ar": "٨. شعبان",
    "title_ur": "8. شعبان",
    "content_en": "Introduction:\nSha'ban is the eighth month, bridging Rajab and Ramadan.\n\nImportance:\nIt is the month of the Prophet (PBUH). Deeds are presented to Allah in this month.\n\nHistorical Significance:\nThe 15th night (Shab-e-Barat) is observed by many as a night of forgiveness and salvation.\n\nRecommended Worship:\nThe Prophet (PBUH) fasted most of this month. It is highly recommended to fast and seek forgiveness.",
    "content_hi": "परिचय:\nशाबान आठवां महीना है, जो रजब और रमज़ान को जोड़ता है।\n\nमहत्व:\nयह पैगंबर (स.अ.व.) का महीना है। इस महीने में लोगों के कर्म (अमल) अल्लाह के सामने पेश किए जाते हैं।\n\nऐतिहासिक महत्व:\n15वीं रात (शब-ए-बरात) को कई लोग क्षमा और मुक्ति की रात के रूप में मनाते हैं।\n\nअनुशंसित इबादत:\nपैगंबर (स.अ.व.) इस महीने में सबसे अधिक रोज़े रखते थे। रोज़ा रखना और क्षमा मांगना अत्यधिक अनुशंसित है।",
    "content_ar": "المقدمة:\nشعبان هو الشهر الثامن، وهو الجسر بين رجب ورمضان.\n\nالأهمية:\nإنه شهر النبي (صلى الله عليه وسلم). تُرفع فيه الأعمال إلى الله.\n\nالأهمية التاريخية:\nليلة النصف من شعبان يحييها الكثيرون كليلة للمغفرة والرحمة.\n\nالعبادات المستحبة:\nكان النبي (صلى الله عليه وسلم) يُكثر من الصيام فيه، ويُستحب الإكثار من الصيام والاستغفار.",
    "content_ur": "تعارف:\nشعبان آٹھواں مہینہ ہے، جو رجب اور رمضان کے درمیان آتا ہے۔\n\nاہمیت:\nیہ نبی کریم (صلی اللہ علیہ وسلم) کا مہینہ ہے۔ اس مہینے میں اعمال اللہ کے حضور پیش کیے جاتے ہیں۔\n\nتاریخی اہمیت:\nاس کی 15ویں رات (شب برات) کو مغفرت اور بخشش کی رات سمجھا جاتا ہے۔\n\nمستحب عبادات:\nنبی کریم (صلی اللہ علیہ وسلم) اس مہینے میں کثرت سے روزے رکھتے تھے۔ اس میں روزہ رکھنا اور استغفار کرنا بہت مستحب ہے۔"
  },
  {
    "id": "month_ramadan",
    "category": "months",
    "title_en": "9. Ramadan",
    "title_hi": "9. रमज़ान",
    "title_ar": "٩. رمضان",
    "title_ur": "9. رمضان",
    "content_en": "Introduction:\nRamadan is the ninth and most sacred month of the Islamic calendar.\n\nImportance:\nFasting in Ramadan is one of the Five Pillars of Islam. The Quran was revealed in this month.\n\nHistorical Significance:\nThe Battle of Badr and the Conquest of Makkah occurred in this month. Laylatul Qadr (The Night of Decree) is in the last 10 days.\n\nRecommended Worship:\nFasting, reading Quran, Taraweeh prayers, giving Zakat/Sadaqah, and performing I'tikaf.",
    "content_hi": "परिचय:\nरमज़ान इस्लामी कैलेंडर का नौवां और सबसे पवित्र महीना है।\n\nमहत्व:\nरमज़ान में रोज़ा रखना इस्लाम के पांच स्तंभों में से एक है। इसी महीने में कुरान नाज़िल (अवतरित) हुआ था।\n\nऐतिहासिक महत्व:\nबद्र का युद्ध और मक्का की विजय इसी महीने में हुई थी। लैलतुल कद्र (शब-ए-कद्र) आख़िरी 10 दिनों में आती है।\n\nअनुशंसित इबादत:\nरोज़ा रखना, कुरान पढ़ना, तरावीह की नमाज़, ज़कात/सदका देना और एतिकाफ़ करना।",
    "content_ar": "المقدمة:\nرمضان هو الشهر التاسع وأقدس شهور التقويم الإسلامي.\n\nالأهمية:\nصيام رمضان ركن من أركان الإسلام الخمسة. وفيه أُنزل القرآن.\n\nالأهمية التاريخية:\nوقعت فيه غزوة بدر وفتح مكة. وفيه ليلة القدر في العشر الأواخر.\n\nالعبادات المستحبة:\nالصيام، تلاوة القرآن، صلاة التراويح، إخراج الزكاة والصدقات، والاعتكاف.",
    "content_ur": "تعارف:\nرمضان اسلامی کیلنڈر کا نواں اور سب سے مقدس مہینہ ہے۔\n\nاہمیت:\nرمضان کے روزے رکھنا اسلام کے پانچ ارکان میں سے ایک ہے۔ اسی مہینے میں قرآن مجید نازل ہوا۔\n\nتاریخی اہمیت:\nغزوہ بدر اور فتح مکہ اسی مہینے میں ہوئے۔ شب قدر آخری 10 راتوں میں واقع ہے۔\n\nمستحب عبادات:\nروزہ رکھنا، تلاوت قرآن، نماز تراویح، زکوٰۃ/صدقہ دینا اور اعتکاف بیٹھنا۔"
  },
  {
    "id": "month_shawwal",
    "category": "months",
    "title_en": "10. Shawwal",
    "title_hi": "10. शव्वाल",
    "title_ar": "١٠. شوال",
    "title_ur": "10. شوال",
    "content_en": "Introduction:\nShawwal is the tenth month of the Islamic calendar.\n\nImportance:\nIt begins with Eid al-Fitr, a day of celebration after a month of fasting.\n\nRecommended Worship:\nIt is highly recommended to fast six days in Shawwal. The Prophet (PBUH) said: 'Whoever fasts Ramadan, then follows it with six days of Shawwal, it is as if he fasted for a lifetime.'",
    "content_hi": "परिचय:\nशव्वाल इस्लामी कैलेंडर का दसवां महीना है।\n\nमहत्व:\nयह ईद उल-फ़ित्र के साथ शुरू होता है, जो रोज़े के एक महीने के बाद खुशी मनाने का दिन है।\n\nअनुशंसित इबादत:\nशव्वाल में छह दिन रोज़ा रखना अत्यधिक अनुशंसित है। पैगंबर (स.अ.व.) ने कहा: 'जिसने रमज़ान के रोज़े रखे और उसके बाद शव्वाल के छह रोज़े रखे, तो यह ऐसा है जैसे उसने उम्र भर रोज़ा रखा हो।'",
    "content_ar": "المقدمة:\nشوال هو الشهر العاشر في التقويم الإسلامي.\n\nالأهمية:\nيبدأ بعيد الفطر، يوم الجائزة والفرح بعد شهر من الصيام.\n\nالعبادات المستحبة:\nيُستحب بشدة صيام ستة أيام من شوال. قال النبي (صلى الله عليه وسلم): 'من صام رمضان ثم أتبعه ستاً من شوال، كان كصيام الدهر'.",
    "content_ur": "تعارف:\nشوال اسلامی کیلنڈر کا دسواں مہینہ ہے۔\n\nاہمیت:\nاس کا آغاز عید الفطر سے ہوتا ہے، جو ایک ماہ کے روزوں کے بعد خوشی کا دن ہے۔\n\nمستحب عبادات:\nشوال کے چھ روزے رکھنا بہت مستحب ہے۔ نبی کریم (صلی اللہ علیہ وسلم) نے فرمایا: 'جس نے رمضان کے روزے رکھے پھر شوال کے چھ روزے رکھے، گویا اس نے عمر بھر روزہ رکھا۔'"
  },
  {
    "id": "month_dhulqidah",
    "category": "months",
    "title_en": "11. Dhu al-Qi'dah",
    "title_hi": "11. ज़िल-कादा",
    "title_ar": "١١. ذو القعدة",
    "title_ur": "11. ذوالقعدہ",
    "content_en": "Introduction:\nDhu al-Qi'dah is the eleventh month and one of the four sacred months.\n\nImportance:\nIt translates to 'The Month of Sitting', historically a month where war was forbidden and people stayed home.\n\nRecommended Worship:\nMaintaining peace, performing Umrah (if possible), and preparing for Hajj.",
    "content_hi": "परिचय:\nज़िल-कादा ग्यारहवां महीना है और चार पवित्र महीनों में से एक है।\n\nमहत्व:\nइसका अर्थ है 'बैठने का महीना', ऐतिहासिक रूप से यह वह महीना था जब युद्ध मना था और लोग घरों में रहते थे।\n\nअनुशंसित इबादत:\nशांति बनाए रखना, उमराह करना (यदि संभव हो) और हज की तैयारी करना।",
    "content_ar": "المقدمة:\nذو القعدة هو الشهر الحادي عشر وأحد الأشهر الأربعة الحرم.\n\nالأهمية:\nيُعنى به 'شهر القعود'، حيث كان يُحرم فيه القتال في الجاهلية.\n\nالعبادات المستحبة:\nالحفاظ على السلام، أداء العمرة، والاستعداد لموسم الحج.",
    "content_ur": "تعارف:\nذوالقعدہ گیارہواں اور چار حرمت والے مہینوں میں سے ایک ہے۔\n\nاہمیت:\nاس کا مطلب ہے 'بیٹھنے کا مہینہ'، تاریخی طور پر یہ وہ مہینہ تھا جب جنگ منع تھی اور لوگ گھروں میں رہتے تھے۔\n\nمستحب عبادات:\nامن برقرار رکھنا، عمرہ کی ادائیگی (اگر ممکن ہو) اور حج کی تیاری کرنا۔"
  },
  {
    "id": "month_dhulhijjah",
    "category": "months",
    "title_en": "12. Dhu al-Hijjah",
    "title_hi": "12. ज़िल-हिज्जा",
    "title_ar": "١٢. ذو الحجة",
    "title_ur": "12. ذوالحجہ",
    "content_en": "Introduction:\nDhu al-Hijjah is the twelfth and final month of the Islamic calendar, and a sacred month.\n\nImportance:\nIt is the month of Hajj (Pilgrimage). The first 10 days are the most blessed days of the year.\n\nHistorical Significance:\nThe Day of Arafah (9th) and Eid al-Adha (10th) commemorate the devotion of Prophet Ibrahim (AS).\n\nRecommended Worship:\nPerforming Hajj, fasting on the Day of Arafah, abundant Dhikr (Takbeer), and offering Qurbani (sacrifice).",
    "content_hi": "परिचय:\nज़िल-हिज्जा इस्लामी कैलेंडर का बारहवां और अंतिम महीना है, और यह एक पवित्र महीना है।\n\nमहत्व:\nयह हज (तीर्थयात्रा) का महीना है। इसके पहले 10 दिन साल के सबसे उत्तम दिन माने जाते हैं।\n\nऐतिहासिक महत्व:\nअराफ़ात का दिन (9 तारीख) और ईद उल-अज़हा (10 तारीख) पैगंबर इब्राहीम (अ.स.) की वफादारी को याद दिलाते हैं।\n\nअनुशंसित इबादत:\nहज करना, अराफ़ात के दिन रोज़ा रखना, अधिक से अधिक ज़िक्र (तकबीर) करना, और क़ुर्बानी (बलिदान) करना।",
    "content_ar": "المقدمة:\nذو الحجة هو الشهر الثاني عشر والأخير، وهو من الأشهر الحرم.\n\nالأهمية:\nإنه شهر الحج. والعشر الأوائل منه هي أفضل أيام الدنيا.\n\nالأهمية التاريخية:\nيوم عرفة (التاسع) وعيد الأضحى (العاشر) يخلدان تضحية وإخلاص النبي إبراهيم (عليه السلام).\n\nالعبادات المستحبة:\nأداء الحج، صيام يوم عرفة، الإكثار من التكبير والذكر، وذبح الأضحية.",
    "content_ur": "تعارف:\nذوالحجہ اسلامی کیلنڈر کا بارہواں اور آخری مہینہ ہے، یہ بھی حرمت والا مہینہ ہے۔\n\nاہمیت:\nیہ حج کا مہینہ ہے۔ اس کے پہلے 10 دن سال کے سب سے افضل اور بابرکت دن ہیں۔\n\nتاریخی اہمیت:\nیوم عرفہ (9 ذوالحجہ) اور عید الاضحیٰ (10 ذوالحجہ) حضرت ابراہیم (علیہ السلام) کی قربانی اور وفاداری کی یاد دلاتے ہیں۔\n\nمستحب عبادات:\nحج کی ادائیگی، یوم عرفہ کا روزہ رکھنا، کثرت سے تکبیرات پڑھنا، اور قربانی کرنا۔"
  },
  {
    "id": "event_ramadan",
    "category": "events",
    "title_en": "Ramadan",
    "title_ar": "Ramadan",
    "title_ur": "Ramadan",
    "title_hi": "Ramadan",
    "content_en": "Detailed guide about Ramadan.\n\nDate: Month of Ramadan (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Ramadan",
    "content_ur": "Ramadan کے بارے میں تفصیلی معلومات",
    "content_hi": "Ramadan के बारे में विस्तृत जानकारी"
  },
  {
    "id": "event_eid_fitr",
    "category": "events",
    "title_en": "Eid-ul-Fitr",
    "title_ar": "Eid-ul-Fitr",
    "title_ur": "Eid-ul-Fitr",
    "title_hi": "Eid-ul-Fitr",
    "content_en": "Detailed guide about Eid-ul-Fitr.\n\nDate: 1 Shawwal (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Eid-ul-Fitr",
    "content_ur": "Eid-ul-Fitr کے بارے میں تفصیلی معلومات",
    "content_hi": "Eid-ul-Fitr के बारे में विस्तृत जानकारी"
  },
  {
    "id": "event_eid_adha",
    "category": "events",
    "title_en": "Eid-ul-Adha",
    "title_ar": "Eid-ul-Adha",
    "title_ur": "Eid-ul-Adha",
    "title_hi": "Eid-ul-Adha",
    "content_en": "Detailed guide about Eid-ul-Adha.\n\nDate: 10 Dhu al-Hijjah (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Eid-ul-Adha",
    "content_ur": "Eid-ul-Adha کے بارے میں تفصیلی معلومات",
    "content_hi": "Eid-ul-Adha के बारे में विस्तृत जानकारी"
  },
  {
    "id": "event_ashura",
    "category": "events",
    "title_en": "Ashura",
    "title_ar": "Ashura",
    "title_ur": "Ashura",
    "title_hi": "Ashura",
    "content_en": "Detailed guide about Ashura.\n\nDate: 10 Muharram (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Ashura",
    "content_ur": "Ashura کے بارے میں تفصیلی معلومات",
    "content_hi": "Ashura के बारे में विस्तृत जानकारी"
  },
  {
    "id": "event_new_year",
    "category": "events",
    "title_en": "Islamic New Year",
    "title_ar": "Islamic New Year",
    "title_ur": "Islamic New Year",
    "title_hi": "Islamic New Year",
    "content_en": "Detailed guide about Islamic New Year.\n\nDate: 1 Muharram (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Islamic New Year",
    "content_ur": "Islamic New Year کے بارے میں تفصیلی معلومات",
    "content_hi": "Islamic New Year के बारे में विस्तृत जानकारी"
  },
  {
    "id": "event_mawlid",
    "category": "events",
    "title_en": "Mawlid",
    "title_ar": "Mawlid",
    "title_ur": "Mawlid",
    "title_hi": "Mawlid",
    "content_en": "Detailed guide about Mawlid.\n\nDate: 12 Rabi al-Awwal (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Mawlid",
    "content_ur": "Mawlid کے بارے میں تفصیلی معلومات",
    "content_hi": "Mawlid के बारे में विस्तृत जानकारी"
  },
  {
    "id": "event_laylatul_qadr",
    "category": "events",
    "title_en": "Laylatul Qadr",
    "title_ar": "Laylatul Qadr",
    "title_ur": "Laylatul Qadr",
    "title_hi": "Laylatul Qadr",
    "content_en": "Detailed guide about Laylatul Qadr.\n\nDate: Last 10 nights of Ramadan (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Laylatul Qadr",
    "content_ur": "Laylatul Qadr کے بارے میں تفصیلی معلومات",
    "content_hi": "Laylatul Qadr के बारे में विस्तृत जानकारी"
  },
  {
    "id": "event_shabe_barat",
    "category": "events",
    "title_en": "Shab-e-Barat",
    "title_ar": "Shab-e-Barat",
    "title_ur": "Shab-e-Barat",
    "title_hi": "Shab-e-Barat",
    "content_en": "Detailed guide about Shab-e-Barat.\n\nDate: 15 Sha'ban (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.",
    "content_ar": "معلومات عن Shab-e-Barat",
    "content_ur": "Shab-e-Barat کے بارے میں تفصیلی معلومات",
    "content_hi": "Shab-e-Barat के बारे में विस्तृत जानकारी"
  },
  {
    "id": "dua_morning",
    "category": "azkar",
    "title_en": "Morning Adhkar",
    "title_ur": "صبح کے اذکار",
    "title_hi": "सुबह के अज़कार (प्रार्थनाएँ)",
    "title_ar": "أذكار الصباح",
    "content_en": "ऐ अल्लाह! हमने तेरे ही हुक्म से सुबह की और तेरे ही हुक्म से शाम करते हैं, तेरे ही हुक्म से हम जीते हैं और तेरे ही हुक्म से हम मरते हैं, और तेरी ही तरफ हमें लौट कर जाना है।\n\nاللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    "content_ur": "اے اللہ! ہم نے تیرے ہی حکم سے صبح کی، اور تیرے ہی حکم سے شام کی۔",
    "content_hi": "ऐ अल्लाह! हमने तेरे ही हुक्म से सुबह की और तेरे ही हुक्म से शाम करते हैं, तेरे ही हुक्म से हम जीते हैं और तेरे ही हुक्म से हम मरते हैं, और तेरी ही तरफ हमें लौट कर जाना है।\n\nاللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    "content_ar": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ"
  },
  {
    "id": "dua_evening",
    "category": "azkar",
    "title_en": "Evening Adhkar",
    "title_ur": "شام کے اذکار",
    "title_hi": "शाम के अज़कार (प्रार्थनाएँ)",
    "title_ar": "أذكار المساء",
    "content_en": "ऐ अल्लाह! हम तेरे ही हुक्म से शाम करते हैं और तेरे ही हुक्म से सुबह करते हैं, तेरे ही हुक्म से हम जीते हैं और तेरे ही हुक्म से हम मरते हैं, और तेरी ही तरफ हमें लौट कर जाना है।\n\nاللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    "content_ur": "اے اللہ ہم تیرے ہی حکم سے شام کرتے ہیں اور تیرے ہی حکم سے صبح کرتے ہیں۔",
    "content_hi": "ऐ अल्लाह! हम तेरे ही हुक्म से शाम करते हैं और तेरे ही हुक्म से सुबह करते हैं, तेरे ही हुक्म से हम जीते हैं और तेरे ही हुक्म से हम मरते हैं, और तेरी ही तरफ हमें लौट कर जाना है।\n\nاللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    "content_ar": "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ"
  },
  {
    "id": "fasting_guide",
    "category": "ramadan",
    "title_en": "Fasting Rules & Sunnahs",
    "title_ur": "روزے کے مسائل اور سنتیں",
    "title_hi": "रोज़ा के नियम और सुन्नतें",
    "title_ar": "أحكام وسنن الصيام",
    "content_en": "रमज़ान के दौरान सुबह (फज्र) से सूर्यास्त तक रोज़ा (उपवास) रखना अनिवार्य है। रोज़े की सुन्नतों में सेहरी (सुबह का भोजन) खाना और सूर्यास्त के तुरंत बाद इफ़्तार (रोज़ा खोलना) करना शामिल है।",
    "content_ur": "رمضان کے دوران طلوع فجر سے غروب آفتاب تک روزہ رکھنا فرض ہے۔",
    "content_hi": "रमज़ान के दौरान सुबह (फज्र) से सूर्यास्त तक रोज़ा (उपवास) रखना अनिवार्य है। रोज़े की सुन्नतों में सेहरी (सुबह का भोजन) खाना और सूर्यास्त के तुरंत बाद इफ़्तार (रोज़ा खोलना) करना शामिल है।",
    "content_ar": "الصيام واجب من الفجر حتى غروب الشمس في رمضان."
  },
  {
    "id": "zakat_guide",
    "category": "zakat",
    "title_en": "Zakat Guidelines",
    "title_ur": "زکوٰۃ کے مسائل",
    "title_hi": "ज़कात के नियम",
    "title_ar": "أحكام الزكاة",
    "content_en": "ज़कात इस्लाम के पांच स्तंभों में से एक है। यह निसाब की सीमा से अधिक जमा संपत्ति पर 2.5% की दर से अदा की जाती है। निसाब वह न्यूनतम संपत्ति है जिसका मालिक होने पर एक मुसलमान के लिए ज़कात देना अनिवार्य हो जाता है।",
    "content_ur": "زکوٰۃ اسلام کے پانچ ستونوں میں سے ایک ہے۔ یہ نصاب سے زیادہ مال پر 2.5% ادا کی جاتی ہے۔",
    "content_hi": "ज़कात इस्लाम के पांच स्तंभों में से एक है। यह निसाब की सीमा से अधिक जमा संपत्ति पर 2.5% की दर से अदा की जाती है। निसाब वह न्यूनतम संपत्ति है जिसका मालिक होने पर एक मुसलमान के लिए ज़कात देना अनिवार्य हो जाता है।",
    "content_ar": "الزكاة ركن من أركان الإسلام الخمسة."
  },
  {
    "id": "hajj_guide",
    "category": "hajj_umrah",
    "title_en": "Hajj Guide",
    "title_ur": "حج کی رہنمائی",
    "title_hi": "हज गाइड (तीर्थयात्रा)",
    "title_ar": "دليل الحج",
    "content_en": "हज सऊदी अरब के मक्का शहर की वार्षिक इस्लामी तीर्थयात्रा है। यह उन सभी वयस्क मुसलमानों के लिए जीवन में कम से कम एक बार अनिवार्य धार्मिक कर्तव्य है जो शारीरिक और आर्थिक रूप से सक्षम हैं।",
    "content_ur": "حج مسلمانوں پر زندگی میں ایک بار فرض ہے اگر وہ استطاعت رکھتے ہوں۔",
    "content_hi": "हज सऊदी अरब के मक्का शहर की वार्षिक इस्लामी तीर्थयात्रा है। यह उन सभी वयस्क मुसलमानों के लिए जीवन में कम से कम एक बार अनिवार्य धार्मिक कर्तव्य है जो शारीरिक और आर्थिक रूप से सक्षम हैं।",
    "content_ar": "الحج فريضة على كل مسلم بالغ قادر."
  },
  {
    "id": "umrah_guide",
    "category": "hajj_umrah",
    "title_en": "Umrah Guide",
    "title_ur": "عمرہ کی رہنمائی",
    "title_hi": "उमरा गाइड",
    "title_ar": "دليل العمرة",
    "content_en": "उमरा मक्का की एक गैर-अनिवार्य छोटी तीर्थयात्रा है जिसे साल के किसी भी समय मुसलमानों द्वारा किया जा सकता है।",
    "content_ur": "عمرہ ایک غیر فرض حج ہے جو سال کے کسی بھی وقت کیا جا سکتا ہے۔",
    "content_hi": "उमरा मक्का की एक गैर-अनिवार्य छोटी तीर्थयात्रा है जिसे साल के किसी भी समय मुसलमानों द्वारा किया जा सकता है।",
    "content_ar": "العمرة سنة مؤكدة ويمكن أداؤها في أي وقت من العام."
  },
  {
    "id": "surahs_important",
    "category": "quran_hadith",
    "title_en": "Frequently Recited Surahs",
    "title_ur": "اہم سورتیں",
    "title_hi": "महत्वपूर्ण सूरह (कुरान के अध्याय)",
    "title_ar": "سور مهمة",
    "content_en": "सूरह यासीन, सूरह अल-मुल्क, सूरह अल-कहफ, और सूरह अर-रहमान का नियमित रूप से पाठ करना उनके असीम आशीर्वाद और सुरक्षा के लिए अत्यधिक अनुशंसित है।",
    "content_ur": "سورۃ یس، سورۃ الملک، سورۃ الکہف، اور سورۃ الرحمٰن کی تلاوت کی بہت فضیلت ہے۔",
    "content_hi": "सूरह यासीन, सूरह अल-मुल्क, सूरह अल-कहफ, और सूरह अर-रहमान का नियमित रूप से पाठ करना उनके असीम आशीर्वाद और सुरक्षा के लिए अत्यधिक अनुशंसित है।",
    "content_ar": "قراءة سورة يس، تبارك، الكهف والرحمن لها فضل عظيم."
  },
  {
    "id": "daily_practices",
    "category": "daily",
    "title_en": "Daily Islamic Practices",
    "title_ur": "روزمرہ کے اسلامی اعمال",
    "title_hi": "दैनिक इस्लामी प्रथाएं",
    "title_ar": "الأعمال الإسلامية اليومية",
    "content_en": "मुसलमानों को रोज़ाना 5 वक्त की नमाज़ कायम करने, कुरान की तिलावत (पाठ) करने, दान (सदका) देने और अल्लाह के ज़िक्र (स्मरण) में लगातार लगे रहने के लिए प्रोत्साहित किया जाता है।",
    "content_ur": "مسلمانوں کو 5 وقت کی نماز، روزانہ قرآن کی تلاوت اور ذکر کی تلقین کی گئی ہے۔",
    "content_hi": "मुसलमानों को रोज़ाना 5 वक्त की नमाज़ कायम करने, कुरान की तिलावत (पाठ) करने, दान (सदका) देने और अल्लाह के ज़िक्र (स्मरण) में लगातार लगे रहने के लिए प्रोत्साहित किया जाता है।",
    "content_ar": "يُنصح المسلمون بالمحافظة على الصلوات الخمس وقراءة القرآن وذكر الله."
  },
  {
    "id": "jumuah_guide",
    "category": "prayer",
    "title_en": "Friday (Jumuah) Guidelines",
    "title_ur": "جمعہ کے احکام",
    "title_hi": "जुम्मा (शुक्रवार) के नियम",
    "title_ar": "أحكام الجمعة",
    "content_en": "जुम्मा इस्लाम में सप्ताह का सबसे महत्वपूर्ण दिन है। जुम्मा की सुन्नतों में गुसल (स्नान) करना, साफ कपड़े पहनना, इत्र (सुगंध) लगाना और सूरह अल-कहफ का पाठ करना शामिल है।",
    "content_ur": "جمعہ اسلام میں ہفتے کا سب سے اہم دن ہے۔ اس دن غسل کرنا اور سورۃ الکہف پڑھنا سنت ہے۔",
    "content_hi": "जुम्मा इस्लाम में सप्ताह का सबसे महत्वपूर्ण दिन है। जुम्मा की सुन्नतों में गुसल (स्नान) करना, साफ कपड़े पहनना, इत्र (सुगंध) लगाना और सूरह अल-कहफ का पाठ करना शामिल है।",
    "content_ar": "يوم الجمعة هو خير يوم طلعت عليه الشمس، ومن سننه الغسل وقراءة سورة الكهف."
  },
  {
    "id": "etiquettes",
    "category": "manners",
    "title_en": "Islamic Etiquettes (Adab)",
    "title_ur": "اسلامی آداب",
    "title_hi": "इस्लामी शिष्टाचार (आदाब)",
    "title_ar": "الآداب الإسلامية",
    "content_en": "इस्लाम हमें अच्छे शिष्टाचार सिखाता है, जैसे खाना शुरू करने से पहले 'बिस्मिल्लाह' पढ़ना, दाहिने हाथ से खाना, दूसरों को 'अस-सलाम अलैकुम' कहकर अभिवादन करना और बड़ों का सम्मान करना।",
    "content_ur": "اسلام ہمیں اچھے آداب سکھاتا ہے، جیسے کھانے سے پہلے بسم اللہ پڑھنا اور سلام کرنا۔",
    "content_hi": "इस्लाम हमें अच्छे शिष्टाचार सिखाता है, खाना शुरू करने से पहले 'बिस्मिल्लाह' पढ़ना, दाहिने हाथ से खाना, दूसरों को 'अस-सलाम अलैकुम' कहकर अभिवादन करना और बड़ों का सम्मान करना।",
    "content_ar": "يعلمنا الإسلام الآداب الحسنة كالتسمية قبل الأكل والسلام على الناس."
  },
  {
    "id": "events",
    "category": "events",
    "title_en": "Key Islamic Events",
    "title_ur": "اہم اسلامی واقعات",
    "title_hi": "महत्वपूर्ण इस्लामी घटनाएँ",
    "title_ar": "الأحداث الإسلامية الهامة",
    "content_en": "प्रमुख इस्लामी घटनाओं में ईद उल-फ़ित्र, ईद उल-अज़हा, इसरा और मेराज (शब-ए-मेराज), लैलत अल-कद्र (शब-ए-कद्र) और आशूरा का दिन शामिल हैं। इन घटनाओं का बहुत बड़ा ऐतिहासिक और आध्यात्मिक महत्व है।",
    "content_ur": "اہم واقعات میں عید الفطر، عید الاضحیٰ، شب معراج اور شب قدر شامل ہیں۔",
    "content_hi": "प्रमुख इस्लामी घटनाओं में ईद उल-फ़ित्र, ईद उल-अज़हा, इसरा और मेराज (शब-ए-मेराज), लैलत अल-कद्र (शब-ए-कद्र) और आशूरा का दिन शामिल हैं। इन घटनाओं का बहुत बड़ा ऐतिहासिक और आध्यात्मिक महत्व है।",
    "content_ar": "تشمل الأحداث الرئيسية عيد الفطر، عيد الأضحى، الإسراء والمعراج، وليلة القدر."
  },
  {
    "id": "women_guidance",
    "category": "women",
    "title_en": "Women's Islamic Guidance",
    "title_ur": "خواتین کے مسائل",
    "title_hi": "महिलाओं के लिए इस्लामी मार्गदर्शन",
    "title_ar": "أحكام النساء",
    "content_en": "इस्लाम महिलाओं की स्थिति को ऊंचा करता है। मार्गदर्शन में शालीनता (हिजाब), विवाह के अधिकार, विरासत (उत्तराधिकार) और नेक बच्चों की परवरिश का असीम प्रतिफल शामिल है।",
    "content_ur": "اسلام نے عورت کے مقام کو بلند کیا ہے۔ حجاب، وراثت، اور بچوں کی پرورش کے بارے میں احکام شامل ہیں۔",
    "content_hi": "इस्लाम महिलाओं की स्थिति को ऊंचा करता है। मार्गदर्शन में शालीनता (हिजाब), विवाह के अधिकार, विरासत (उत्तराधिकार) और नेक बच्चों की परवरिश का असीम प्रतिफल शामिल है।",
    "content_ar": "رفع الإسلام مكانة المرأة وأعطاها حقوقها في الميراث والزواج."
  },
  {
    "id": "children_learning",
    "category": "faq",
    "title_en": "Children's Islamic Learning",
    "title_ur": "بچوں کی تربیت",
    "title_hi": "बच्चों की इस्लामी शिक्षा",
    "title_ar": "تربية الأطفال في الإسلام",
    "content_en": "बच्चों को छोटी उम्र में ही बुनियादी मान्यताएं (अकीदा), नबियों (पैगंबरों) की कहानियाँ, वज़ू और नमाज़ कैसे अदा करें, और साधारण दुआएँ सिखानी चाहिए।",
    "content_ur": "بچوں کو کم عمری میں عقیدہ، انبیاء کے قصے، وضو اور نماز کا طریقہ سکھانا چاہیے۔",
    "content_hi": "बच्चों को छोटी उम्र में ही बुनियादी मान्यताएं (अकीदा), नबियों (पैगंबरों) की कहानियाँ, वज़ू और नमाज़ कैसे अदा करें, और साधारण दुआएँ सिखानी चाहिए।",
    "content_ar": "يجب تعليم الأطفال العقيدة، قصص الأنبياء، وكيفية الوضوء والصلاة منذ الصغر."
  },
];
