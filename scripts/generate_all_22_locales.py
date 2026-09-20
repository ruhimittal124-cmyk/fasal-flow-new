import json
import os
import copy

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN_PATH = os.path.join(BASE_DIR, 'src', 'locales', 'en', 'translation.json')
HI_PATH = os.path.join(BASE_DIR, 'src', 'locales', 'hi', 'translation.json')
MR_PATH = os.path.join(BASE_DIR, 'src', 'locales', 'mr', 'translation.json')
PA_PATH = os.path.join(BASE_DIR, 'src', 'locales', 'pa', 'translation.json')

with open(EN_PATH, 'r', encoding='utf-8') as f:
    en_base = json.load(f)

with open(HI_PATH, 'r', encoding='utf-8') as f:
    hi_base = json.load(f)

# Comprehensive vocabulary for all 22 official languages
LANG_DATA = {
    'gu': {
        'name': 'Gujarati', 'native': 'ગુજરાતી', 'script': 'Gujarati',
        'nav': {
            'home': 'હોમ', 'dashboard': 'ડેશબોર્ડ', 'fpoPooling': 'FPO પૂલિંગ', 'mandiPrices': 'મંડી ભાવ',
            'browseLots': 'પાક ખરીદો', 'myLots': 'મારા પાક', 'passbookEscrow': 'પાસબુક અને એસ્ક્રો',
            'transport': 'લોજિસ્ટિક્સ', 'chat': 'સંદેશા', 'profile': 'પ્રોફાઇલ', 'createLot': 'પાક વેચો',
            'aiMitra': 'AI મિત્ર', 'login': 'સાઇન ઇન', 'logout': 'સાઇન આઉટ',
            'directNetwork': 'સીધું મંડી અને ખેડૂત નેટવર્ક', 'agmarknetLive': 'એગમાર્કનેટ લાઈવ'
        },
        'mandiPrices': {
            'title': 'APMC મંડી ભાવ વિશ્લેષણ',
            'subtitle': 'સરકારી એગમાર્કનેટ પોર્ટલ પરથી સીધા મુખ્ય મંડીઓના લાઈવ ભાવ',
            'searchPlaceholder': 'મંડી, જિલ્લો અથવા પાક શોધો...',
            'allCrops': 'બધા પાકો', 'allDistricts': 'બધા જિલ્લાઓ', 'syncNow': 'એગમાર્કનેટ સમન્વય કરો',
            'syncing': 'લાઈવ મંડીઓ સિંક થઈ રહી છે...', 'activeYards': 'સક્રિય મંડી યાર્ડ',
            'lastSync': 'છેલ્લો સિંક સમય', 'minRate': 'ન્યૂનતમ / ક્વિન્ટલ', 'maxRate': 'મહત્તમ / ક્વિન્ટલ',
            'modalRate': 'મોડલ ભાવ / ક્વિન્ટલ', 'arrivalsToday': 'આજની આવક', 'trend': 'બજાર વલણ',
            'viewLots': 'સંબંધિત પાક જુઓ'
        },
        'profile': {
            'title': 'વપરાશકર્તા પ્રોફાઇલ અને ઓળખ ચકાસણી',
            'subtitle': 'ડાયરેક્ટ બેંક એકાઉન્ટ, UPI વિગતો અને એસ્ક્રો વૉલેટ સેટિંગ્સ',
            'switchRole': 'ભૂમિકા બદલો', 'saveProfile': 'ફેરફારો સાચવો', 'bankDetails': 'ચુકવણી બેંક અને UPI વિગતો',
            'name': 'પૂરું નામ', 'phone': 'મોબાઇલ નંબર', 'district': 'જિલ્લો', 'role': 'પ્લેટફોર્મ ભૂમિકા',
            'kycVerified': 'KYC ચકાસાયેલ', 'traderRating': 'વેપારી રેટિંગ', 'trustScore': 'વિશ્વાસ સ્કોર',
            'escrowBalance': 'એસ્ક્રો અને વૉલેટ બેલેન્સ', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'બેંકનું નામ', 'accountNumber': 'બેંક ખાતા નંબર', 'ifsc': 'IFSC કોડ',
            'saveChanges': 'પ્રોફાઇલ સાચવો', 'saving': 'સાચવી રહ્યું છે...'
        },
        'transport': {
            'title': 'ગ્રામીણ ખેત-પરિવહન અને લોજિસ્ટિક્સ',
            'subtitle': 'ખેતરેથી સીધા પિકઅપ માટે ચકાસાયેલા ટ્રાન્સપોર્ટરો બુક કરો',
            'farmGatePickup': 'ખેતર પિકઅપ', 'searchTrucks': 'ટ્રક શોધો', 'calculatorTitle': 'ભાડા કેલ્ક્યુલેટર',
            'pickup': 'પિકઅપ જિલ્લો', 'drop': 'ડ્રોપ મંડી/જિલ્લો', 'distance': 'અંદાજિત અંતર',
            'vehicleType': 'વાહનનો પ્રકાર', 'weight': 'કુલ વજન (ક્વિન્ટલ)', 'baseFare': 'મૂળ ભાડું',
            'platformFee': 'પ્લેટફોર્મ ફી', 'estimatedFare': 'કુલ અંદાજિત ભાડું', 'payOnDelivery': 'ડિલિવરી વખતે ચૂકવો',
            'availableTransporters': 'ઉપલબ્ધ ટ્રાન્સપોર્ટરો', 'bookNow': 'ટ્રક બુક કરો', 'activeVehicles': 'સક્રિય વાહનો'
        },
        'aggregation': {
            'title': 'FPO પાક પૂલિંગ અને એગ્રીગેશન હબ',
            'subtitle': 'ખેડૂતોનો પાક એકત્રિત કરીને મિલોને જથ્થાબંધ વેચો અને વધુ નફો મેળવો',
            'fpoPortal': 'FPO પોર્ટલ', 'hubTitle': 'FPO એગ્રીગેશન કેન્દ્ર', 'activePools': 'સક્રિય પૂલ',
            'targetVolume': 'લક્ષ્ય વોલ્યુમ', 'pledgeCrop': 'પાક નોંધાવો', 'buyBulk': 'જથ્થાબંધ ખરીદો',
            'statutoryFormula': 'કાયદાકીય ફોર્મ્યુલા', 'memberPayouts': 'સભ્ય ચૂકવણી', 'netPayout': 'ચોખ્ખી ચૂકવણી'
        },
        'crops': {
            'soybean': 'સોયાબીન', 'cotton': 'કપાસ', 'wheat': 'ઘઉં', 'onion': 'ડુંગળી',
            'chana': 'ચણા', 'tur': 'તુવેર', 'maize': 'મકાઈ'
        }
    },
    'bn': {
        'name': 'Bengali', 'native': 'বাংলা', 'script': 'Bengali',
        'nav': {
            'home': 'হোম', 'dashboard': 'ড্যাশবোর্ড', 'fpoPooling': 'এফপিও পুলিং', 'mandiPrices': 'মান্ডি দর',
            'browseLots': 'শস্য কিনুন', 'myLots': 'আমার শস্য', 'passbookEscrow': 'পাসবুক ও এসক্রো',
            'transport': 'লজিস্টিকস', 'chat': 'বার্তা', 'profile': 'প্রোফাইল', 'createLot': 'শস্য বিক্রি করুন',
            'aiMitra': 'এআই মিত্র', 'login': 'সাইন ইন', 'logout': 'সাইন আউট',
            'directNetwork': 'সরাসরি মান্ডি ও কৃষক নেটওয়ার্ক', 'agmarknetLive': 'এগমार्कনেট লাইভ'
        },
        'mandiPrices': {
            'title': 'এপিএমসি মান্ডি দর বিশ্লেষণ',
            'subtitle': 'সরকারি এগমार्कনেট পোর্টাল থেকে সরাসরি প্রধান মান্ডিগুলির লাইভ দর',
            'searchPlaceholder': 'মান্ডি, জেলা বা শস্য অনুসন্ধান করুন...',
            'allCrops': 'সমস্ত ফসল', 'allDistricts': 'সমস্ত জেলা', 'syncNow': 'এগমार्कনেট সিঙ্ক করুন',
            'syncing': 'লাইভ মান্ডি সিঙ্ক হচ্ছে...', 'activeYards': 'সক্রিয় মান্ডি ইয়ার্ড',
            'lastSync': 'সর্বশেষ সিঙ্ক সময়', 'minRate': 'সর্বনিম্ন / কুইন্টাল', 'maxRate': 'সর্বোচ্চ / কুইন্টাল',
            'modalRate': 'মডেল দর / কুইন্টাল', 'arrivalsToday': 'আজকের আগমন', 'trend': 'বাজারের প্রবণতা',
            'viewLots': 'সম্পর্কিত ফসল দেখুন'
        },
        'profile': {
            'title': 'ব্যবহারকারী প্রোফাইল ও যাচাইকরণ',
            'subtitle': 'সরাসরি ব্যাংক অ্যাকাউন্ট, ইউপিআই এবং এসক্রো ওয়ালেট সেটিংস',
            'switchRole': 'ভূমিকা পরিবর্তন', 'saveProfile': 'পরিবর্তন সংরক্ষণ করুন', 'bankDetails': 'পেমেন্ট ব্যাংক ও ইউপিআই বিবরণ',
            'name': 'সম্পূর্ণ নাম', 'phone': 'মোবাইল নম্বর', 'district': 'জেলা', 'role': 'প্ল্যাটফর্ম ভূমিকা',
            'kycVerified': 'কেওয়াইসি যাচাইকৃত', 'traderRating': 'ব্যবসায়ী রেটিং', 'trustScore': 'বিশ্বাস স্কোর',
            'escrowBalance': 'এসক্রো ও ওয়ালেট ব্যালেন্স', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'ব্যাংকের নাম', 'accountNumber': 'ব্যাংক অ্যাকাউন্ট নম্বর', 'ifsc': 'আইএফএসসি কোড',
            'saveChanges': 'প্রোফাইল সংরক্ষণ করুন', 'saving': 'সংরক্ষণ করা হচ্ছে...'
        },
        'transport': {
            'title': 'গ্রামীণ খামার পরিবহন ও লজিস্টিকস',
            'subtitle': 'খামার থেকে সরাসরি পিকআপের জন্য যাচাইকৃত ট্রাক বুক করুন',
            'farmGatePickup': 'খামার পিকআপ', 'searchTrucks': 'ট্রাক খুঁজুন', 'calculatorTitle': 'ভাড়া ক্যালকুলেটর',
            'pickup': 'পিকআপ জেলা', 'drop': 'গন্তব্য জেলা/মান্ডি', 'distance': 'আনুমানিক দূরত্ব',
            'vehicleType': 'গাড়ির ধরন', 'weight': 'মোট ওজন (কুইন্টাল)', 'baseFare': 'বেস ভাড়া',
            'platformFee': 'প্ল্যাটফর্ম ফি', 'estimatedFare': 'মোট আনুমানিক ভাড়া', 'payOnDelivery': 'ডেলিভারিতে অর্থপ্রদান করুন',
            'availableTransporters': 'উপলব্ধ পরিবহনকারী', 'bookNow': 'ট্রাক বুক করুন', 'activeVehicles': 'সক্রিয় যানবাহন'
        },
        'aggregation': {
            'title': 'এফপিও ফসল পুলিং ও একত্রীকরণ হাব',
            'subtitle': 'কৃষকদের ফসল একত্রিত করে সরাসরি মিলগুলিতে পাইকারি বিক্রি করুন ও বেশি লাভ পান',
            'fpoPortal': 'এফপিও পোর্টাল', 'hubTitle': 'এফপিও একত্রীকরণ কেন্দ্র', 'activePools': 'সক্রিয় পুল',
            'targetVolume': 'লক্ষ্যমাত্রা', 'pledgeCrop': 'ফসল জমা দিন', 'buyBulk': 'পাইকারি কিনুন',
            'statutoryFormula': 'বিধিবদ্ধ সূত্র', 'memberPayouts': 'সদস্যদের পাওনা', 'netPayout': 'নিট পাওনা'
        },
        'crops': {
            'soybean': 'সয়াবিন', 'cotton': 'তুলা', 'wheat': 'গম', 'onion': 'পেঁয়াজ',
            'chana': 'ছোলা', 'tur': 'অড়হর', 'maize': 'ভুট্টা'
        }
    },
    'ta': {
        'name': 'Tamil', 'native': 'தமிழ்', 'script': 'Tamil',
        'nav': {
            'home': 'முகப்பு', 'dashboard': 'டாஷ்போர்டு', 'fpoPooling': 'FPO தொகுத்தல்', 'mandiPrices': 'மண்டி விலைகள்',
            'browseLots': 'பயிர்களை வாங்கு', 'myLots': 'எனது பயிர்கள்', 'passbookEscrow': 'பாஸ்புக் & எஸ்க்ரோ',
            'transport': 'தளவாடங்கள்', 'chat': 'செய்திகள்', 'profile': 'சுயவிவரம்', 'createLot': 'பயிர் விற்பனை',
            'aiMitra': 'AI மித்ரா', 'login': 'உள்நுழைக', 'logout': 'வெளியேறுக',
            'directNetwork': 'நேரடி மண்டி & விவசாயி நெட்வொர்க்', 'agmarknetLive': 'அக்மார்க்நெட் நேரலை'
        },
        'mandiPrices': {
            'title': 'APMC மண்டி விலை பகுப்பாய்வு',
            'subtitle': 'அரசு அக்மார்க்நெட் போர்ட்டலில் இருந்து நேரடி மண்டி விலை நிலவரம்',
            'searchPlaceholder': 'மண்டி, மாவட்டம் அல்லது பயிரைத் தேடுங்கள்...',
            'allCrops': 'அனைத்து பயிர்கள்', 'allDistricts': 'அனைத்து மாவட்டங்கள்', 'syncNow': 'அக்மார்க்நெட் ஒத்திசை',
            'syncing': 'மண்டி விலைகள் புதுப்பிக்கப்படுகின்றன...', 'activeYards': 'செயலில் உள்ள மண்டிகள்',
            'lastSync': 'கடைசி புதுப்பிப்பு', 'minRate': 'குறைந்தபட்சம் / குவிண்டால்', 'maxRate': 'அதிகபட்சம் / குவிண்டால்',
            'modalRate': 'மாதிரி விலை / குவிண்டால்', 'arrivalsToday': 'இன்றைய வரத்து', 'trend': 'சந்தை போக்கு',
            'viewLots': 'தொடர்புடைய பயிர்களைப் பார்க்கவும்'
        },
        'profile': {
            'title': 'பயனர் சுயவிவரம் மற்றும் சரிபார்ப்பு',
            'subtitle': 'நேரடி வங்கி கணக்கு, யுபிஐ மற்றும் எஸ்க்ரோ பணப்பை அமைப்புகள்',
            'switchRole': 'பங்கை மாற்று', 'saveProfile': 'மாற்றங்களை சேமிக்க', 'bankDetails': 'வங்கி & யுபிஐ விவரங்கள்',
            'name': 'முழு பெயர்', 'phone': 'மொபைல் எண்', 'district': 'மாவட்டம்', 'role': 'தளத்தின் பங்கு',
            'kycVerified': 'KYC சரிபார்க்கப்பட்டது', 'traderRating': 'வணிகர் மதிப்பீடு', 'trustScore': 'நம்பகத்தன்மை மதிப்பெண்',
            'escrowBalance': 'எஸ்க்ரோ மற்றும் வாலட் இருப்பு', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'வங்கி பெயர்', 'accountNumber': 'வங்கி கணக்கு எண்', 'ifsc': 'IFSC குறியீடு',
            'saveChanges': 'சுயவிவரத்தை சேமிக்க', 'saving': 'சேமிக்கப்படுகிறது...'
        },
        'transport': {
            'title': 'கிராமப்புற பண்ணை போக்குவரத்து மற்றும் தளவாடங்கள்',
            'subtitle': 'பண்ணையிலிருந்து நேரடியாக பொருட்களை கொண்டு செல்ல சரிபார்க்கப்பட்ட லாரிகளை பதிவு செய்யுங்கள்',
            'farmGatePickup': 'பண்ணை பிக்கப்', 'searchTrucks': 'லாரிகளை தேடுங்கள்', 'calculatorTitle': 'கட்டண கணக்கீடு',
            'pickup': 'பிக்கப் மாவட்டம்', 'drop': 'டெலிவரி மண்டி/மாவட்டம்', 'distance': 'மதிப்பிடப்பட்ட தூரம்',
            'vehicleType': 'வாகன வகை', 'weight': 'மொத்த எடை (குவிண்டால்)', 'baseFare': 'அடிப்படை கட்டணம்',
            'platformFee': 'தள கட்டணம்', 'estimatedFare': 'மதிப்பிடப்பட்ட மொத்த கட்டணம்', 'payOnDelivery': 'டெலிவரியின் போது செலுத்தவும்',
            'availableTransporters': 'கிடைக்கும் டிரான்ஸ்போர்ட்டர்கள்', 'bookNow': 'லாரியை பதிவு செய்', 'activeVehicles': 'செயலில் உள்ள வாகனங்கள்'
        },
        'aggregation': {
            'title': 'FPO பயிர் தொகுத்தல் மற்றும் மைய மையம்',
            'subtitle': 'விவசாயிகளின் விளைபொருட்களை ஒன்று திரட்டி மொத்தமாக மில்களுக்கு விற்று அதிக லாபம் பெறுங்கள்',
            'fpoPortal': 'FPO போர்ட்டல்', 'hubTitle': 'FPO தொகுப்பு மையம்', 'activePools': 'செயலில் உள்ள குழுக்கள்',
            'targetVolume': 'இலக்கு அளவு', 'pledgeCrop': 'பயிரை பதிவு செய்', 'buyBulk': 'மொத்தமாக வாங்கவும்',
            'statutoryFormula': 'சட்டரீதியான சூத்திரம்', 'memberPayouts': 'உறுப்பினர் கொடுப்பனவுகள்', 'netPayout': 'நிகர கொடுப்பனவு'
        },
        'crops': {
            'soybean': 'சோயாபீன்', 'cotton': 'பருத்தி', 'wheat': 'கோதுமை', 'onion': 'வெங்காயம்',
            'chana': 'கொண்டைக்கடலை', 'tur': 'துவரை', 'maize': 'மக்காச்சோளம்'
        }
    },
    'te': {
        'name': 'Telugu', 'native': 'తెలుగు', 'script': 'Telugu',
        'nav': {
            'home': 'హోమ్', 'dashboard': 'డాష్‌బోర్డ్', 'fpoPooling': 'FPO పూలింగ్', 'mandiPrices': 'మార్కెట్ ధరలు',
            'browseLots': 'పంటలు కొనండి', 'myLots': 'నా పంటలు', 'passbookEscrow': 'పాస్‌బుక్ & ఎస్క్రో',
            'transport': 'లాజిస్టిక్స్', 'chat': 'సందేశాలు', 'profile': 'ప్రొఫైల్', 'createLot': 'పంటను అమ్మండి',
            'aiMitra': 'AI మిత్ర', 'login': 'సైన్ ఇన్', 'logout': 'సైన్ అవుట్',
            'directNetwork': 'ప్రత్యక్ష మార్కెట్ & రైతు నెట్‌వర్క్', 'agmarknetLive': 'ఎగ్‌మార్క్‌నెట్ లైవ్'
        },
        'mandiPrices': {
            'title': 'APMC మార్కెట్ ధరల విశ్లేషణ',
            'subtitle': 'ప్రభుత్వ ఎగ్‌మార్క్‌నెట్ పోర్టల్ నుండి నేరుగా ప్రముఖ మార్కెట్ల లైవ్ ధరలు',
            'searchPlaceholder': 'మార్కెట్, జిల్లా లేదా పంటను శోధించండి...',
            'allCrops': 'అన్ని పంటలు', 'allDistricts': 'అన్ని జిల్లాలు', 'syncNow': 'ఎగ్‌మార్క్‌నెట్ సమకాలీకరించండి',
            'syncing': 'ధరలు అప్‌డేట్ అవుతున్నాయి...', 'activeYards': 'క్రియాశీల యార్డులు',
            'lastSync': 'చివరి సమకాలీకరణ', 'minRate': 'కనిష్ట ధర / క్వింటాల్', 'maxRate': 'గరిష్ట ధర / క్వింటాల్',
            'modalRate': 'మోడల్ ధర / క్వింటాల్', 'arrivalsToday': 'నేటి రాకలు', 'trend': 'మార్కెట్ సరళి',
            'viewLots': 'సంబంధిత పంటలను చూడండి'
        },
        'profile': {
            'title': 'వినియోగదారు ప్రొఫైల్ మరియు ధృవీకరణ',
            'subtitle': 'డైరెక్ట్ బ్యాంక్ ఖాతా, UPI మరియు ఎస్క్రో వాలెట్ సెట్టింగ్‌లు',
            'switchRole': 'పాత్ర మార్చండి', 'saveProfile': 'మార్పులను సేవ్ చేయండి', 'bankDetails': 'చెల్లింపు బ్యాంక్ & UPI వివరాలు',
            'name': 'పూర్తి పేరు', 'phone': 'మొబైల్ నంబర్', 'district': 'జిల్లా', 'role': 'ప్లాట్‌ఫారమ్ పాత్ర',
            'kycVerified': 'KYC ధృవీకరించబడింది', 'traderRating': 'వ్యాపారి రేటింగ్', 'trustScore': 'నమ్మక స్కోరు',
            'escrowBalance': 'ఎస్క్రో & వాలెట్ బ్యాలెన్స్', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'బ్యాంకు పేరు', 'accountNumber': 'బ్యాంక్ ఖాతా సంఖ్య', 'ifsc': 'IFSC కోడ్',
            'saveChanges': 'ప్రొఫైల్ సేవ్ చేయండి', 'saving': 'సేవ్ అవుతోంది...'
        },
        'transport': {
            'title': 'గ్రామీణ వ్యవసాయ రవాణా మరియు లాజిస్టిక్స్',
            'subtitle': 'పొలం వద్ద నుండి నేరుగా తీసుకెళ్లడానికి ధృవీకరించబడిన వాహనాలను బుక్ చేయండి',
            'farmGatePickup': 'పొలం పికప్', 'searchTrucks': 'ట్రక్కులను శోధించండి', 'calculatorTitle': 'ఛార్జీల కాలిక్యులేటర్',
            'pickup': 'పికప్ జిల్లా', 'drop': 'డెలివరీ మార్కెట్/జిల్లా', 'distance': 'అంచనా దూరం',
            'vehicleType': 'వాహనం రకం', 'weight': 'మొత్తం బరువు (క్వింటాళ్ళు)', 'baseFare': 'ప్రాథమిక ఛార్జీ',
            'platformFee': 'ప్లాట్‌ఫారమ్ రుసుము', 'estimatedFare': 'మొత్తం అంచనా ఛార్జీ', 'payOnDelivery': 'డెలివరీ వద్ద చెల్లించండి',
            'availableTransporters': 'అందుబాటులో ఉన్న రవాణాదారులు', 'bookNow': 'ట్రక్ బుక్ చేయండి', 'activeVehicles': 'క్రియాశీల వాహనాలు'
        },
        'aggregation': {
            'title': 'FPO పంటల సమీకరణ మరియు కేంద్రం',
            'subtitle': 'రైతుల ఉత్పత్తులను సమీకరించి నేరుగా మిల్లులకు విక్రయించి అధిక లాభాలు పొందండి',
            'fpoPortal': 'FPO పోర్టల్', 'hubTitle': 'FPO సమీకరణ కేంద్రం', 'activePools': 'క్రియాశీల పూల్స్',
            'targetVolume': 'లక్ష్య పరిమాణం', 'pledgeCrop': 'పంటను నమోదు చేయండి', 'buyBulk': 'బల్క్‌గా కొనండి',
            'statutoryFormula': 'చట్టబద్ధమైన సూత్రం', 'memberPayouts': 'సభ్యుల చెల్లింపులు', 'netPayout': 'నికర చెల్లింపు'
        },
        'crops': {
            'soybean': 'సోయాబీన్', 'cotton': 'ప్రత్తి', 'wheat': 'గోధుమలు', 'onion': 'ఉల్లిపాయ',
            'chana': 'శనగలు', 'tur': 'కందులు', 'maize': 'మొక్కజొన్న'
        }
    },
    'kn': {
        'name': 'Kannada', 'native': 'ಕನ್ನಡ', 'script': 'Kannada',
        'nav': {
            'home': 'ಮುಖಪುಟ', 'dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'fpoPooling': 'FPO ಪೂಲಿಂಗ್', 'mandiPrices': 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
            'browseLots': 'ಬೆಳೆಗಳನ್ನು ಖರೀದಿಸಿ', 'myLots': 'ನನ್ನ ಬೆಳೆಗಳು', 'passbookEscrow': 'ಪಾಸ್‌ಬುಕ್ ಮತ್ತು ಎಸ್ಕ್ರೊ',
            'transport': 'ಸಾರಿಗೆ', 'chat': 'ಸಂದೇಶಗಳು', 'profile': 'ಪ್ರೊಫೈಲ್', 'createLot': 'ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ',
            'aiMitra': 'AI ಮಿತ್ರ', 'login': 'ಸೈನ್ ಇನ್', 'logout': 'ಸೈನ್ ಔಟ್',
            'directNetwork': 'ನೇರ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ರೈತ ಜಾಲ', 'agmarknetLive': 'ಅಗ್ಮಾರ್ಕ್‌ನೆಟ್ ಲೈವ್'
        },
        'mandiPrices': {
            'title': 'APMC ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ವಿಶ್ಲೇಷಣೆ',
            'subtitle': 'ಸರ್ಕಾರಿ ಅಗ್ಮಾರ್ಕ್‌ನೆಟ್ ಪೋರ್ಟಲ್‌ನಿಂದ ನೇರ ಮಾರುಕಟ್ಟೆ ದರಗಳು',
            'searchPlaceholder': 'ಮಾರುಕಟ್ಟೆ, ಜಿಲ್ಲೆ ಅಥವಾ ಬೆಳೆಯನ್ನು ಹುಡುಕಿ...',
            'allCrops': 'ಎಲ್ಲಾ ಬೆಳೆಗಳು', 'allDistricts': 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು', 'syncNow': 'ಅಗ್ಮಾರ್ಕ್‌ನೆಟ್ ನವೀಕರಿಸಿ',
            'syncing': 'ಬೆಲೆಗಳು ನವೀಕರಣಗೊಳ್ಳುತ್ತಿವೆ...', 'activeYards': 'ಸಕ್ರಿಯ ಮಾರುಕಟ್ಟೆಗಳು',
            'lastSync': 'ಕೊನೆಯ ನವೀಕರಣ', 'minRate': 'ಕನಿಷ್ಠ / ಕ್ವಿಂಟಾಲ್', 'maxRate': 'ಗರಿಷ್ಠ / ಕ್ವಿಂಟಾಲ್',
            'modalRate': 'ಮಾದರಿ ಬೆಲೆ / ಕ್ವಿಂಟಾಲ್', 'arrivalsToday': 'ಇಂದಿನ ಆವಕ', 'trend': 'ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ',
            'viewLots': 'ಸಂಬಂಧಿತ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
        },
        'profile': {
            'title': 'ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಪರಿಶೀಲನೆ',
            'subtitle': 'ನೇರ ಬ್ಯಾಂಕ್ ಖಾತೆ, ಯುಪಿಐ ಮತ್ತು ಎಸ್ಕ್ರೊ ವಾಲೆಟ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
            'switchRole': 'ಪಾತ್ರ ಬದಲಾಯಿಸಿ', 'saveProfile': 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ', 'bankDetails': 'ಪಾವತಿ ಬ್ಯಾಂಕ್ ಮತ್ತು ಯುಪಿಐ ವಿವರಗಳು',
            'name': 'ಪೂರ್ಣ ಹೆಸರು', 'phone': 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', 'district': 'ಜಿಲ್ಲೆ', 'role': 'ವೇದಿಕೆಯ ಪಾತ್ರ',
            'kycVerified': 'KYC ಪರಿಶೀಲಿಸಲಾಗಿದೆ', 'traderRating': 'ವ್ಯಾಪಾರಿ ರೇಟಿಂಗ್', 'trustScore': 'ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಕೋರ್',
            'escrowBalance': 'ಎಸ್ಕ್ರೊ ಮತ್ತು ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'ಬ್ಯಾಂಕ್ ಹೆಸರು', 'accountNumber': 'ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ', 'ifsc': 'IFSC ಕೋಡ್',
            'saveChanges': 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ', 'saving': 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...'
        },
        'transport': {
            'title': 'ಗ್ರಾಮೀಣ ಕೃಷಿ ಸಾರಿಗೆ ಮತ್ತು ಲಾಜಿಸ್ಟಿಕ್ಸ್',
            'subtitle': 'ಜಮೀನಿನಿಂದಲೇ ನೇರ ಸಾಗಣೆಗೆ ಪರಿಶೀಲಿಸಿದ ವಾಹನಗಳನ್ನು ಬುಕ್ ಮಾಡಿ',
            'farmGatePickup': 'ಜಮೀನಿನಿಂದ ಪಿಕಪ್', 'searchTrucks': 'ಟ್ರಕ್‌ಗಳನ್ನು ಹುಡುಕಿ', 'calculatorTitle': 'ದರ ಲೆಕ್ಕಾಚಾರ',
            'pickup': 'ಪಿಕಪ್ ಜಿಲ್ಲೆ', 'drop': 'ಡೆಲಿವರಿ ಮಾರುಕಟ್ಟೆ/ಜಿಲ್ಲೆ', 'distance': 'ಅಂದಾಜು ದೂರ',
            'vehicleType': 'ವಾಹನದ ಪ್ರಕಾರ', 'weight': 'ಒಟ್ಟು ತೂಕ (ಕ್ವಿಂಟಾಲ್)', 'baseFare': 'ಮೂಲ ದರ',
            'platformFee': 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕ', 'estimatedFare': 'ಅಂದಾಜು ಒಟ್ಟು ದರ', 'payOnDelivery': 'ವಿತರಣೆಯ ನಂತರ ಪಾವತಿಸಿ',
            'availableTransporters': 'ಲಭ್ಯವಿರುವ ಸಾರಿಗೆದಾರರು', 'bookNow': 'ಟ್ರಕ್ ಬುಕ್ ಮಾಡಿ', 'activeVehicles': 'ಸಕ್ರಿಯ ವಾಹನಗಳು'
        },
        'aggregation': {
            'title': 'FPO ಬೆಳೆ ಕ್ರೋಢೀಕರಣ ಮತ್ತು ಕೇಂದ್ರ',
            'subtitle': 'ರೈತರ ಬೆಳೆಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸಿ ಗಿರಣಿಗಳಿಗೆ ಸಗಟು ಮಾರಾಟ ಮಾಡಿ ಹೆಚ್ಚಿನ ಲಾಭ ಪಡೆಯಿರಿ',
            'fpoPortal': 'FPO ಪೋರ್ಟಲ್', 'hubTitle': 'FPO ಕ್ರೋಢೀಕರಣ ಕೇಂದ್ರ', 'activePools': 'ಸಕ್ರಿಯ ಪೂಲ್‌ಗಳು',
            'targetVolume': 'ಗುರಿ ಪ್ರಮಾಣ', 'pledgeCrop': 'ಬೆಳೆ ನೋಂದಾಯಿಸಿ', 'buyBulk': 'ಸಗಟು ಖರೀದಿಸಿ',
            'statutoryFormula': 'ಕಾನೂನುಬದ್ಧ ಸೂತ್ರ', 'memberPayouts': 'ಸದಸ್ಯರ ಪಾವತಿಗಳು', 'netPayout': 'ನಿವ್ವಳ ಪಾವತಿ'
        },
        'crops': {
            'soybean': 'ಸೋಯಾಬೀನ್', 'cotton': 'ಹತ್ತಿ', 'wheat': 'ಗೋಧಿ', 'onion': 'ಈರುಳ್ಳಿ',
            'chana': 'ಕಡಲೆ', 'tur': 'ತೊಗರಿ', 'maize': 'ಮೆಕ್ಕೆಜೋಳ'
        }
    },
    'ml': {
        'name': 'Malayalam', 'native': 'മലയാളം', 'script': 'Malayalam',
        'nav': {
            'home': 'ഹോം', 'dashboard': 'ഡാഷ്‌ബോർഡ്', 'fpoPooling': 'FPO പൂളിംഗ്', 'mandiPrices': 'മാർക്കറ്റ് വിലകൾ',
            'browseLots': 'വിളകൾ വാങ്ങുക', 'myLots': 'എന്റെ വിളകൾ', 'passbookEscrow': 'പാസ്ബുക്കും എസ്ക്രോയും',
            'transport': 'ലോജിസ്റ്റിക്സ്', 'chat': 'സന്ദേശങ്ങൾ', 'profile': 'പ്രൊഫൈൽ', 'createLot': 'വിള വിൽക്കുക',
            'aiMitra': 'AI മിത്ര', 'login': 'സൈൻ ഇൻ', 'logout': 'സൈൻ ഔട്ട്',
            'directNetwork': 'നേരിട്ടുള്ള വിപണി & കർഷക ശൃംഖല', 'agmarknetLive': 'അഗ്മാർക്ക്നെറ്റ് ലൈവ്'
        },
        'mandiPrices': {
            'title': 'APMC മാർക്കറ്റ് വില വിശകലനം',
            'subtitle': 'സർക്കാർ അഗ്മാർക്ക്നെറ്റ് പോർട്ടലിൽ നിന്നുള്ള തത്സമയ മാർക്കറ്റ് വിലകൾ',
            'searchPlaceholder': 'മാർക്കറ്റ്, ജില്ല അല്ലെങ്കിൽ വിള തിരയുക...',
            'allCrops': 'എല്ലാ വിളകളും', 'allDistricts': 'എല്ലാ ജില്ലകളും', 'syncNow': 'അഗ്മാർക്ക്നെറ്റ് സിങ്ക് ചെയ്യുക',
            'syncing': 'വിലകൾ പുതുക്കുന്നു...', 'activeYards': 'സജീവ മാർക്കറ്റുകൾ',
            'lastSync': 'അവസാന സിങ്ക് സമയം', 'minRate': 'കുറഞ്ഞ നിരക്ക് / ക്വിന്റൽ', 'maxRate': 'കൂടിയ നിരക്ക് / ക്വിന്റൽ',
            'modalRate': 'ശരാശരി നിരക്ക് / ക്വിന്റൽ', 'arrivalsToday': 'ഇന്നത്തെ വരവ്', 'trend': 'വിപണി പ്രവണത',
            'viewLots': 'വിളകൾ കാണുക'
        },
        'profile': {
            'title': 'ഉപയോക്തൃ പ്രൊഫൈലും പരിശോധനയും',
            'subtitle': 'ബാങ്ക് അക്കൗണ്ട്, യുപിഐ, എസ്ക്രോ വാലറ്റ് ക്രമീകരണങ്ങൾ',
            'switchRole': 'റോൾ മാറ്റുക', 'saveProfile': 'മാറ്റങ്ങൾ സൂക്ഷിക്കുക', 'bankDetails': 'പേയ്‌മെന്റ് ബാങ്ക് & യുപിഐ വിവരങ്ങൾ',
            'name': 'പൂർണ്ണമായ പേര്', 'phone': 'മൊബൈൽ നമ്പർ', 'district': 'ജില്ല', 'role': 'പ്ലാറ്റ്‌ഫോം റോൾ',
            'kycVerified': 'KYC പരിശോധിച്ചു', 'traderRating': 'വ്യാപാരി റേറ്റിംഗ്', 'trustScore': 'വിശ്വാസ്യത സ്കോർ',
            'escrowBalance': 'എസ്ക്രോ വാലറ്റ് ബാലൻസ്', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'ബാങ്ക് പേര്', 'accountNumber': 'അക്കൗണ്ട് നമ്പർ', 'ifsc': 'IFSC കോഡ്',
            'saveChanges': 'പ്രൊഫൈൽ സൂക്ഷിക്കുക', 'saving': 'സൂക്ഷിക്കുന്നു...'
        },
        'transport': {
            'title': 'ഗ്രാമീണ കാർഷിക ഗതാഗതവും ലോജിസ്റ്റിക്സും',
            'subtitle': 'പാടശേഖരങ്ങളിൽ നിന്ന് നേരിട്ട് ഉൽപന്നങ്ങൾ കൊണ്ടുപോകാൻ വാഹനം ബുക്ക് ചെയ്യുക',
            'farmGatePickup': 'ഫാം പിക്കപ്പ്', 'searchTrucks': 'വാഹനങ്ങൾ തിരയുക', 'calculatorTitle': 'നിരക്ക് കാൽക്കുലേറ്റർ',
            'pickup': 'പിക്കപ്പ് ജില്ല', 'drop': 'ഡെലിവറി മാർക്കറ്റ്/ജില്ല', 'distance': 'അനുമാന ദൂരം',
            'vehicleType': 'വാഹന ഇനം', 'weight': 'ആകെ ഭാരം (ക്വിന്റൽ)', 'baseFare': 'അടിസ്ഥാന നിരക്ക്',
            'platformFee': 'പ്ലാറ്റ്‌ഫോം ഫീസ്', 'estimatedFare': 'ആകെ നിരക്ക്', 'payOnDelivery': 'ഡെലിവറിയിൽ പണം നൽകുക',
            'availableTransporters': 'ലഭ്യമായ വാഹനങ്ങൾ', 'bookNow': 'വാഹനം ബുക്ക് ചെയ്യുക', 'activeVehicles': 'സജീവ വാഹനങ്ങൾ'
        },
        'aggregation': {
            'title': 'FPO വിള ശേഖരണവും ഹബ്ബും',
            'subtitle': 'കർഷകരുടെ വിളകൾ ഒരുമിച്ച് ശേഖരിച്ച് മില്ലുകൾക്ക് മൊത്തമായി വിറ്റ് കൂടുതൽ ലാഭം നേടുക',
            'fpoPortal': 'FPO പോർട്ടൽ', 'hubTitle': 'FPO ശേഖരണ കേന്ദ്രം', 'activePools': 'സജീവ ഗ്രൂപ്പുകൾ',
            'targetVolume': 'ലക്ഷ്യ അളവ്', 'pledgeCrop': 'വിള രജിസ്റ്റർ ചെയ്യുക', 'buyBulk': 'മൊത്തമായി വാങ്ങുക',
            'statutoryFormula': 'നിയമാനുസൃത ഫോർമുല', 'memberPayouts': 'അംഗങ്ങളുടെ വിഹിതം', 'netPayout': 'അറ്റ വിഹിതം'
        },
        'crops': {
            'soybean': 'സോയാബീൻ', 'cotton': 'പരുത്തി', 'wheat': 'ഗോതമ്പ്', 'onion': 'സവാള',
            'chana': 'കടല', 'tur': 'തുവര', 'maize': 'മക്കച്ചോളം'
        }
    },
    'or': {
        'name': 'Odia', 'native': 'ଓଡ଼ିଆ', 'script': 'Odia',
        'nav': {
            'home': 'ମୁଖ୍ୟପୃଷ୍ଠା', 'dashboard': 'ଡ୍ୟାସବୋର୍ଡ', 'fpoPooling': 'FPO ପୁଲିଂ', 'mandiPrices': 'ମଣ୍ଡି ଦର',
            'browseLots': 'ଫସଲ କିଣନ୍ତୁ', 'myLots': 'ମୋର ଫସଲ', 'passbookEscrow': 'ପାସବୁକ୍ ଏବଂ ଏସକ୍ରୋ',
            'transport': 'ପରିବହନ', 'chat': 'ବାର୍ତ୍ତା', 'profile': 'ପ୍ରୋଫାଇଲ୍', 'createLot': 'ଫସଲ ବିକ୍ରୟ',
            'aiMitra': 'AI ମିତ୍ର', 'login': 'ଲଗ୍ ଇନ୍', 'logout': 'ଲଗ୍ ଆଉଟ୍',
            'directNetwork': 'ସିଧାସଳଖ ମଣ୍ଡି ଓ ଚାଷୀ ନେଟୱାର୍କ', 'agmarknetLive': 'ଆଗମାର୍କନେଟ୍ ଲାଇଭ୍'
        },
        'mandiPrices': {
            'title': 'APMC ମଣ୍ଡି ଦର ବିଶ୍ଳେଷଣ',
            'subtitle': 'ସରକାରୀ ଆଗମାର୍କନେଟ୍ ପୋର୍ଟାଲରୁ ସିଧାସଳଖ ଲାଇଭ୍ ଦର',
            'searchPlaceholder': 'ମଣ୍ଡି, ଜିଲ୍ଲା କିମ୍ବା ଫସଲ ଖୋଜନ୍ତୁ...',
            'allCrops': 'ସମସ୍ତ ଫସଲ', 'allDistricts': 'ସମସ୍ତ ଜିଲ୍ଲା', 'syncNow': 'ଆଗମାର୍କନେଟ୍ ସିଙ୍କ୍',
            'syncing': 'ମଣ୍ଡି ଦର ଅପଡେଟ୍ ହେଉଛି...', 'activeYards': 'ସକ୍ରିୟ ମଣ୍ଡି',
            'lastSync': 'ଶେଷ ସିଙ୍କ୍ ସମୟ', 'minRate': 'ସର୍ବନିମ୍ନ / କ୍ୱିଣ୍ଟାଲ', 'maxRate': 'ସର୍ବାଧିକ / କ୍ୱିଣ୍ଟାଲ',
            'modalRate': 'ମଡେଲ ଦର / କ୍ୱିଣ୍ଟାଲ', 'arrivalsToday': 'ଆଜିର ଆମଦାନୀ', 'trend': 'ବଜାର ଧାରା',
            'viewLots': 'ଫସଲ ଦେଖନ୍ତୁ'
        },
        'profile': {
            'title': 'ଉପଭୋକ୍ତା ପ୍ରୋଫାଇଲ୍ ଏବଂ ଯାଞ୍ଚ',
            'subtitle': 'ସିଧାସଳଖ ବ୍ୟାଙ୍କ ଖାତା, UPI ଏବଂ ଏସକ୍ରୋ ସେଟିଙ୍ଗ୍ସ',
            'switchRole': 'ଭୂମିକା ପରିବର୍ତ୍ତନ', 'saveProfile': 'ସଂରକ୍ଷଣ କରନ୍ତୁ', 'bankDetails': 'ପେମେଣ୍ଟ ବ୍ୟାଙ୍କ ଓ UPI ବିବରଣୀ',
            'name': 'ପୂରା ନାମ', 'phone': 'ମୋବାଇଲ୍ ନମ୍ବର', 'district': 'ଜିଲ୍ଲା', 'role': 'ପ୍ଲାଟଫର୍ମ ଭୂମିକା',
            'kycVerified': 'KYC ପ୍ରମାଣିତ', 'traderRating': 'ବ୍ୟବସାୟୀ ରେଟିଂ', 'trustScore': 'ବିଶ୍ୱାସ ସ୍କୋର',
            'escrowBalance': 'ଏସକ୍ରୋ ଓ ୱାଲେଟ୍ ବାଲାନ୍ସ', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'ବ୍ୟାଙ୍କ ନାମ', 'accountNumber': 'ଖାତା ନମ୍ବର', 'ifsc': 'IFSC କୋଡ୍',
            'saveChanges': 'ପ୍ରୋଫାଇଲ୍ ସଂରକ୍ଷଣ', 'saving': 'ସଂରକ୍ଷଣ ହେଉଛି...'
        },
        'transport': {
            'title': 'ଗ୍ରାମୀଣ କୃଷି ପରିବହନ ଓ ଲଜିଷ୍ଟିକ୍ସ',
            'subtitle': 'ଜମିରୁ ସିଧାସଳଖ ପରିବହନ ପାଇଁ ଯାଞ୍ଚ ହୋଇଥିବା ଗାଡି ବୁକ୍ କରନ୍ତୁ',
            'farmGatePickup': 'ଜମିରୁ ପିକଅପ୍', 'searchTrucks': 'ଟ୍ରକ୍ ଖୋଜନ୍ତୁ', 'calculatorTitle': 'ଭଡ଼ା ଗଣନା',
            'pickup': 'ପିକଅପ୍ ଜିଲ୍ଲା', 'drop': 'ଗନ୍ତବ୍ୟ ଜିଲ୍ଲା/ମଣ୍ଡି', 'distance': 'ଆନୁମାନିକ ଦୂରତା',
            'vehicleType': 'ଗାଡ଼ି ପ୍ରକାର', 'weight': 'ମୋଟ ଓଜନ (କ୍ୱିଣ୍ଟାଲ)', 'baseFare': 'ମୂଳ ଭଡ଼ା',
            'platformFee': 'ପ୍ଲାଟଫର୍ମ ଫି', 'estimatedFare': 'ଆନୁମାନିକ ଭଡ଼ା', 'payOnDelivery': 'ଡେଲିଭରୀ ବେଳେ ପ୍ରଦାନ କରନ୍ତୁ',
            'availableTransporters': 'ଉପଲବ୍ଧ ପରିବହନକାରୀ', 'bookNow': 'ଟ୍ରକ୍ ବୁକ୍ କରନ୍ତୁ', 'activeVehicles': 'ସକ୍ରିୟ ଗାଡ଼ି'
        },
        'aggregation': {
            'title': 'FPO ଫସଲ ଏକତ୍ରିକରଣ ଓ କେନ୍ଦ୍ର',
            'subtitle': 'ଚାଷୀଙ୍କ ଫସଲ ଏକତ୍ର କରି ସିଧାସଳଖ ମିଲ୍ କୁ ପାଇକାରୀ ବିକ୍ରୟ କରି ଅଧିକ ଲାଭ ପାଆନ୍ତୁ',
            'fpoPortal': 'FPO ପୋର୍ଟାଲ୍', 'hubTitle': 'FPO ଏକତ୍ରିକରଣ କେନ୍ଦ୍ର', 'activePools': 'ସକ୍ରିୟ ଗ୍ରୁପ୍',
            'targetVolume': 'ଲକ୍ଷ୍ୟ ପରିମାଣ', 'pledgeCrop': 'ଫସଲ ପଞ୍ଜୀକରଣ', 'buyBulk': 'ପାଇକାରୀ କିଣନ୍ତୁ',
            'statutoryFormula': 'ନିୟମିତ ଫର୍ମୁଲା', 'memberPayouts': 'ସଦସ୍ୟ ପ୍ରଦାନ', 'netPayout': 'ମୋଟ ପ୍ରଦାନ'
        },
        'crops': {
            'soybean': 'ସୋୟାବିନ୍', 'cotton': 'କପା', 'wheat': 'ଗହମ', 'onion': 'ପିଆଜ',
            'chana': 'ଚଣା', 'tur': 'ହରଡ଼', 'maize': 'ମକା'
        }
    },
    'as': {
        'name': 'Assamese', 'native': 'অসমীয়া', 'script': 'Bengali-Assamese',
        'nav': {
            'home': 'মুখ্যপৃষ্ঠা', 'dashboard': 'ডেশ্ববৰ্ড', 'fpoPooling': 'FPO পুলিং', 'mandiPrices': 'বজাৰ দৰ',
            'browseLots': 'শস্য ক্ৰয় কৰক', 'myLots': 'মোৰ শস্য', 'passbookEscrow': 'পাছবুক আৰু এছক্ৰ’',
            'transport': 'পৰিবহণ', 'chat': 'বাৰ্তা', 'profile': 'প্ৰফাইল', 'createLot': 'শস্য বিক্ৰী কৰক',
            'aiMitra': 'AI মিত্ৰ', 'login': 'লগ ইন', 'logout': 'লগ আউট',
            'directNetwork': 'প্ৰত্যক্ষ বজাৰ আৰু কৃষক নেটৱৰ্ক', 'agmarknetLive': 'এগমাৰ্কনেট লাইভ'
        },
        'mandiPrices': {
            'title': 'APMC বজাৰ দৰ বিশ্লেষণ',
            'subtitle': 'চৰকাৰী এগমাৰ্কনেট পৰ্টেলৰ পৰা লাইভ বজাৰ দৰ',
            'searchPlaceholder': 'বজাৰ, জিলা বা শস্য সন্ধান কৰক...',
            'allCrops': 'সকলো শস্য', 'allDistricts': 'সকলো জিলা', 'syncNow': 'এগমাৰ্কনেট সমন্বয়',
            'syncing': 'দৰ নৱীকৰণ হৈ আছে...', 'activeYards': 'সক্ৰিয় বজাৰ',
            'lastSync': 'অন্তিম সময়', 'minRate': 'নূন্যতম / কুইণ্টল', 'maxRate': 'সৰ্বোচ্চ / কুইণ্টল',
            'modalRate': 'মডেল দৰ / কুইণ্টল', 'arrivalsToday': 'আজিৰ আমদানি', 'trend': 'বজাৰ প্ৰৱণতা',
            'viewLots': 'শস্য চাওক'
        },
        'profile': {
            'title': 'ব্যৱহাৰকাৰী প্ৰফাইল আৰু পৰীক্ষণ',
            'subtitle': 'প্ৰত্যক্ষ বেংক একাউণ্ট, UPI আৰু এছক্ৰ’ ৱালেট ছেটিংছ',
            'switchRole': 'ভূমিকা সলনি', 'saveProfile': 'সংৰক্ষণ কৰক', 'bankDetails': 'বেংক আৰু UPI সবিশেষ',
            'name': 'সম্পূৰ্ণ নাম', 'phone': 'মোবাইল নম্বৰ', 'district': 'জিলা', 'role': 'প্লেটফৰ্ম ভূমিকা',
            'kycVerified': 'KYC সত্যায়িত', 'traderRating': 'ব্যৱসায়ী ৰেটিং', 'trustScore': 'বিশ্বাস স্কোৰ',
            'escrowBalance': 'এছক্ৰ’ আৰু ৱালেট বেলেন্স', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'বেংকৰ নাম', 'accountNumber': 'একাউণ্ট নম্বৰ', 'ifsc': 'IFSC ক’ড',
            'saveChanges': 'প্ৰফাইল সংৰক্ষণ কৰক', 'saving': 'সংৰক্ষণ হৈ আছে...'
        },
        'transport': {
            'title': 'গ্ৰাম্য কৃষি পৰিবহণ আৰু লজিষ্টিকছ',
            'subtitle': 'পথাৰৰ পৰা পোনপটীয়া পৰিবহণৰ বাবে পৰীক্ষিত বাহন বুক কৰক',
            'farmGatePickup': 'পথাৰৰ পৰা পিকআপ', 'searchTrucks': 'ট্ৰাক সন্ধান কৰক', 'calculatorTitle': 'ভাৰা গণনা',
            'pickup': 'পিকআপ জিলা', 'drop': 'গন্তব্য জিলা/বজাৰ', 'distance': 'আনুমানিক দূৰত্ব',
            'vehicleType': 'বাহনৰ প্ৰকাৰ', 'weight': 'মুঠ ওজন (কুইণ্টল)', 'baseFare': 'মূল ভাৰা',
            'platformFee': 'প্লেটফৰ্ম মাচুল', 'estimatedFare': 'মুঠ আনুমানিক ভাৰা', 'payOnDelivery': 'ডেলিভাৰীত পৰিশোধ কৰক',
            'availableTransporters': 'উপলব্ধ পৰিবহণকাৰী', 'bookNow': 'ট্ৰাক বুক কৰক', 'activeVehicles': 'সক্ৰিয় বাহন'
        },
        'aggregation': {
            'title': 'FPO শস্য একত্ৰীকৰণ আৰু কেন্দ্ৰ',
            'subtitle': 'কৃষকৰ শস্য একত্ৰিত কৰি মিলসমূহক পাইকাৰী বিক্ৰী কৰক আৰু অধিক লাভ পাওক',
            'fpoPortal': 'FPO পৰ্টেল', 'hubTitle': 'FPO একত্ৰীকৰণ কেন্দ্ৰ', 'activePools': 'সক্ৰিয় পুল',
            'targetVolume': 'লক্ষ্য পৰিমাণ', 'pledgeCrop': 'শস্য পঞ্জীয়ন', 'buyBulk': 'পাইকাৰী ক্ৰয় কৰক',
            'statutoryFormula': 'আইনী সূত্ৰ', 'memberPayouts': 'সদস্যৰ ধন', 'netPayout': 'মুঠ প্ৰাপ্য'
        },
        'crops': {
            'soybean': 'চয়াবিন', 'cotton': 'কপাহ', 'wheat': 'ঘেঁহু', 'onion': 'পিয়াঁজ',
            'chana': 'বুট', 'tur': 'অৰহৰ', 'maize': 'মাকৈ'
        }
    },
    'ur': {
        'name': 'Urdu', 'native': 'اردو', 'script': 'Perso-Arabic',
        'nav': {
            'home': 'ہوم', 'dashboard': 'ڈیش بورڈ', 'fpoPooling': 'ایف پی او پولنگ', 'mandiPrices': 'منڈی کے بھاؤ',
            'browseLots': 'فصل خریدیں', 'myLots': 'میری فصلیں', 'passbookEscrow': 'پاس بک اور ایسکرو',
            'transport': 'نقل و حمل', 'chat': 'پیغامات', 'profile': 'پروفائل', 'createLot': 'فصل فروخت کریں',
            'aiMitra': 'اے آئی مترا', 'login': 'سائن ان', 'logout': 'سائن آؤٹ',
            'directNetwork': 'براہ راست منڈی اور کسان نیٹ ورک', 'agmarknetLive': 'ایگمارک نیٹ لائیو'
        },
        'mandiPrices': {
            'title': 'اے پی ایم سی منڈی قیمتوں کا تجزیہ',
            'subtitle': 'سرکاری ایگمارک نیٹ پورٹل سے منڈیوں کے براہ راست نرخ',
            'searchPlaceholder': 'منڈی، ضلع یا فصل تلاش کریں...',
            'allCrops': 'تمام فصلیں', 'allDistricts': 'تمام اضلاع', 'syncNow': 'ہم وقت سازی کریں',
            'syncing': 'قیمتیں اپ ڈیٹ ہو رہی ہیں...', 'activeYards': 'فعال منڈیاں',
            'lastSync': 'آخری اپ ڈیٹ', 'minRate': 'کم از کم / کوئنٹل', 'maxRate': 'زیادہ سے زیادہ / کوئنٹل',
            'modalRate': 'ماڈل قیمت / کوئنٹل', 'arrivalsToday': 'آج کی آمد', 'trend': 'مارکیٹ کا رجحان',
            'viewLots': 'فصلیں دیکھیں'
        },
        'profile': {
            'title': 'صارف کا پروفائل اور تصدیق',
            'subtitle': 'براہ راست بینک اکاؤنٹ، یو پی آئی اور ایسکرو والٹ ترتیبات',
            'switchRole': 'کردار تبدیل کریں', 'saveProfile': 'تبدیلیاں محفوظ کریں', 'bankDetails': 'بینک اور یو پی آئی تفصیلات',
            'name': 'مکمل نام', 'phone': 'موبائل نمبر', 'district': 'ضلع', 'role': 'پلیٹ فارم کا کردار',
            'kycVerified': 'کے وائی سی تصدیق شدہ', 'traderRating': 'تاجر ریٹنگ', 'trustScore': 'اعتماد اسکور',
            'escrowBalance': 'ایسکرو اور والٹ بیلنس', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'بینک کا نام', 'accountNumber': 'بینک اکاؤنٹ نمبر', 'ifsc': 'IFSC کوڈ',
            'saveChanges': 'پروفائل محفوظ کریں', 'saving': 'محفوظ ہو رہا ہے...'
        },
        'transport': {
            'title': 'دیہی زرعی نقل و حمل اور لاجسٹکس',
            'subtitle': 'کھیت سے براہ راست مال اٹھانے کے لیے تصدیق شدہ ٹرک بک کریں',
            'farmGatePickup': 'کھیت سے پک اپ', 'searchTrucks': 'ٹرک تلاش کریں', 'calculatorTitle': 'کرایہ کیلکولیٹر',
            'pickup': 'پک اپ کا ضلع', 'drop': 'منزل کا ضلع/منڈی', 'distance': 'متوقع فاصلہ',
            'vehicleType': 'گاڑی کی قسم', 'weight': 'کل وزن (کوئنٹل)', 'baseFare': 'بنیادی کرایہ',
            'platformFee': 'پلیٹ فارم فیس', 'estimatedFare': 'کل متوقع کرایہ', 'payOnDelivery': 'ڈیلیوری پر ادائیگی کریں',
            'availableTransporters': 'دستیاب ٹرانسپورٹرز', 'bookNow': 'ٹرک بک کریں', 'activeVehicles': 'فعال گاڑیاں'
        },
        'aggregation': {
            'title': 'ایف پی او فصل پولنگ اور ایگریگیشن ہب',
            'subtitle': 'کسانوں کی فصلیں جمع کر کے ملوں کو تھوک میں فروخت کریں اور زیادہ منافع کمائیں',
            'fpoPortal': 'ایف پی او پورٹل', 'hubTitle': 'ایف پی او ایگریگیشن سنٹر', 'activePools': 'فعال پولز',
            'targetVolume': 'ہدف حجم', 'pledgeCrop': 'فصل درج کریں', 'buyBulk': 'تھوک خریدیں',
            'statutoryFormula': 'قانونی فارمولا', 'memberPayouts': 'ارکان کی ادائیگیاں', 'netPayout': 'خالص رقم'
        },
        'crops': {
            'soybean': 'سویا بین', 'cotton': 'کپاس', 'wheat': 'گندم', 'onion': 'پیاز',
            'chana': 'چنا', 'tur': 'ارہر', 'maize': 'مکئی'
        }
    },
    'sa': {
        'name': 'Sanskrit', 'native': 'संस्कृतम्', 'script': 'Devanagari',
        'nav': {
            'home': 'गृहम्', 'dashboard': 'फलकम्', 'fpoPooling': 'FPO संचयनम्', 'mandiPrices': 'विपणि मूल्यानि',
            'browseLots': 'सस्यं क्रीणातु', 'myLots': 'मम सस्यानि', 'passbookEscrow': 'कोषपत्रं न्यासश्च',
            'transport': 'यानव्यवस्था', 'chat': 'सन्देशाः', 'profile': 'परिचयपत्रम्', 'createLot': 'सस्यं विक्रीणातु',
            'aiMitra': 'AI मित्रम्', 'login': 'प्रवेशः', 'logout': 'निर्गमः',
            'directNetwork': 'साक्षात् विपणि कृषक जालम्', 'agmarknetLive': 'एगमार्कनेट प्रत्यक्षम्'
        },
        'mandiPrices': {
            'title': 'APMC विपणि मूल्य विश्लेषणम्',
            'subtitle': 'सर्वकारीय एगमार्कनेट द्वारा साक्षात् विपणि मूल्यानि',
            'searchPlaceholder': 'विपणिं, मण्डलं सस्यं वा अन्विषतु...',
            'allCrops': 'सर्वाणि सस्यानि', 'allDistricts': 'सर्वे मण्डलाः', 'syncNow': 'नवीकरोतु',
            'syncing': 'मूल्यानि नवीक्रियन्ते...', 'activeYards': 'सक्रिया विपणयः',
            'lastSync': 'अन्तिम समयः', 'minRate': 'न्यूनतमम् / क्विण्टल्', 'maxRate': 'अधिकतमम् / क्विण्टल्',
            'modalRate': 'मानक मूल्यम् / क्विण्टल्', 'arrivalsToday': 'अद्यतनी आवक', 'trend': 'विपणि प्रवृत्तिः',
            'viewLots': 'सस्यानि पश्यतु'
        },
        'profile': {
            'title': 'उपयोक्तृ परिचयपत्रं प्रमाणनञ्च',
            'subtitle': 'साक्षात् वित्तकोष विवरणानि, UPI तथा न्यास सम्पुटिका',
            'switchRole': 'भूमिका परिवर्तनम्', 'saveProfile': 'परिवर्तनानि रक्षतु', 'bankDetails': 'वित्तकोष विवरणानि',
            'name': 'पूर्णं नाम', 'phone': 'चलभाष सङ्ख्या', 'district': 'मण्डलम्', 'role': 'मञ्च भूमिका',
            'kycVerified': 'KYC प्रमाणितम्', 'traderRating': 'वणिग् श्रेणी', 'trustScore': 'विश्वास गुणाङ्कः',
            'escrowBalance': 'न्यास धनशेषः', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'वित्तकोष नाम', 'accountNumber': 'खाता सङ्ख्या', 'ifsc': 'IFSC सङ्केतः',
            'saveChanges': 'परिचयपत्रं रक्षतु', 'saving': 'संरक्षणं भवति...'
        },
        'transport': {
            'title': 'ग्रामीण कृषियान व्यवस्था',
            'subtitle': 'क्षेत्रात् साक्षात् सस्यनयनाय प्रमाणितानि वाहनानि नियोजयतु',
            'farmGatePickup': 'क्षेत्रात् स्वीकरणम्', 'searchTrucks': 'वाहनानि अन्विषतु', 'calculatorTitle': 'भाटक गणकम्',
            'pickup': 'स्वीकरण मण्डलम्', 'drop': 'प्रापण मण्डलम्', 'distance': 'अनुमानित दूरम्',
            'vehicleType': 'वाहन प्रकारः', 'weight': 'कुल भारः (क्विण्टल्)', 'baseFare': 'मूल भाटकम्',
            'platformFee': 'मञ्च शुल्कम्', 'estimatedFare': 'अनुमानित कुल भाटकम्', 'payOnDelivery': 'प्रापण समये ददातु',
            'availableTransporters': 'उपलब्ध वाहनानि', 'bookNow': 'यानं नियोजयतु', 'activeVehicles': 'सक्रिय वाहनानि'
        },
        'aggregation': {
            'title': 'FPO सस्य संचयन केन्द्रम्',
            'subtitle': 'कृषकाणां सस्यं संगृह्य पेषणशालाभ्यः साक्षात् विक्रीय अधिकं लाभं प्राप्नुवन्तु',
            'fpoPortal': 'FPO प्रवेशद्वारम्', 'hubTitle': 'FPO संचयन केन्द्रम्', 'activePools': 'सक्रिय समूहाः',
            'targetVolume': 'लक्ष्य परिमाणम्', 'pledgeCrop': 'सस्यं पञ्जीकरोतु', 'buyBulk': 'स्थूलरूपेण क्रीणातु',
            'statutoryFormula': 'वैधानिक सूत्रम्', 'memberPayouts': 'सदस्य पारिश्रमिकम्', 'netPayout': 'शुद्ध धनम्'
        },
        'crops': {
            'soybean': 'सोयाबीन', 'cotton': 'कार्पासः', 'wheat': 'गोधूमः', 'onion': 'पलाण्डुः',
            'chana': 'चणकः', 'tur': 'आढकी', 'maize': 'मक्कः'
        }
    },
    'ne': {
        'name': 'Nepali', 'native': 'नेपाली', 'script': 'Devanagari',
        'nav': {
            'home': 'गृहपृष्ठ', 'dashboard': 'ड्यासबோர्ड', 'fpoPooling': 'FPO पूलिङ', 'mandiPrices': 'मण्डी भाउ',
            'browseLots': 'बाली किन्नुहोस्', 'myLots': 'मेरो बाली', 'passbookEscrow': 'पासबुक र एस्क्रो',
            'transport': 'ढुवानी', 'chat': 'सन्देश', 'profile': 'प्रोफाइल', 'createLot': 'बाली बेच्नुहोस्',
            'aiMitra': 'AI मित्र', 'login': 'साइन इन', 'logout': 'साइन आउट',
            'directNetwork': 'प्रत्यक्ष मण्डी र किसान सञ्जाल', 'agmarknetLive': 'एगमार्कनेट प्रत्यक्ष'
        },
        'mandiPrices': {
            'title': 'APMC मण्डी भाउ विश्लेषण',
            'subtitle': 'सरकारी एगमार्कनेट पोर्टलबाट सिधै प्रत्यक्ष मण्डी भाउ',
            'searchPlaceholder': 'मण्डी, जिल्ला वा बाली खोज्नुहोस्...',
            'allCrops': 'सबै बालीहरू', 'allDistricts': 'सबै जिल्लाहरू', 'syncNow': 'सिङ्क गर्नुहोस्',
            'syncing': 'भाउ अद्यावधिक हुँदैछ...', 'activeYards': 'सक्रिय मण्डीहरू',
            'lastSync': 'पछिल्लो समय', 'minRate': 'न्यूनतम / क्विन्टल', 'maxRate': 'अधिकतम / क्विन्टल',
            'modalRate': 'मोडल भाउ / क्विन्टल', 'arrivalsToday': 'आजको आवक', 'trend': 'बजार प्रवृत्ति',
            'viewLots': 'बाली हेर्नुहोस्'
        },
        'profile': {
            'title': 'प्रयोगकर्ता प्रोफाइल र प्रमाणीकरण',
            'subtitle': 'प्रत्यक्ष बैंक खाता, UPI र एस्क्रो वालेट सेटिङहरू',
            'switchRole': 'भूमिका बदल्नुहोस्', 'saveProfile': 'परिवर्तन सुरक्षित गर्नुहोस्', 'bankDetails': 'भुक्तानी बैंक र UPI विवरण',
            'name': 'पूरा नाम', 'phone': 'मोबाइल नम्बर', 'district': 'जिल्ला', 'role': 'प्लेटफर्म भूमिका',
            'kycVerified': 'KYC प्रमाणित', 'traderRating': 'व्यापारी मूल्याङ्कन', 'trustScore': 'विश्वास स्कोर',
            'escrowBalance': 'एस्क्रो र वालेट मौज्दात', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'बैंकको नाम', 'accountNumber': 'बैंक खाता नम्बर', 'ifsc': 'IFSC कोड',
            'saveChanges': 'प्रोफाइल सुरक्षित गर्नुहोस्', 'saving': 'सुरक्षित हुँदैछ...'
        },
        'transport': {
            'title': 'ग्रामीण कृषि ढुवानी र लजिस्टिक्स',
            'subtitle': 'खेतबाटै सिधै ढुवानीका लागि प्रमाणित ट्रकहरू बुक गर्नुहोस्',
            'farmGatePickup': 'खेतबाटै पिकअप', 'searchTrucks': 'ट्रक खोज्नुहोस्', 'calculatorTitle': 'भाडा क्यालकुलेटर',
            'pickup': 'पिकअप जिल्ला', 'drop': 'गन्तव्य जिल्ला/मण्डी', 'distance': 'अनुमानित दूरी',
            'vehicleType': 'गाडीको प्रकार', 'weight': 'कुल वजन (क्विन्टल)', 'baseFare': 'आधार भाडा',
            'platformFee': 'प्लेटफर्म शुल्क', 'estimatedFare': 'अनुमानित कुल भाडा', 'payOnDelivery': 'डेलिभरीमा भुक्तानी गर्नुहोस्',
            'availableTransporters': 'उपलब्ध ढुवानीकर्ताहरू', 'bookNow': 'ट्रक बुक गर्नुहोस्', 'activeVehicles': 'सक्रिय गाडीहरू'
        },
        'aggregation': {
            'title': 'FPO बाली संकलन र हब',
            'subtitle': 'किसानहरूको बाली संकलन गरी मिलहरूलाई थोकमा बेचेर बढी नाफा कमाउनुहोस्',
            'fpoPortal': 'FPO पोर्टल', 'hubTitle': 'FPO संकलन केन्द्र', 'activePools': 'सक्रिय समूहहरू',
            'targetVolume': 'लक्ष्य परिमाण', 'pledgeCrop': 'बाली दर्ता गर्नुहोस्', 'buyBulk': 'थोक किन्नुहोस्',
            'statutoryFormula': 'वैधानिक सूत्र', 'memberPayouts': 'सदस्य भुक्तानी', 'netPayout': 'खुद भुक्तानी'
        },
        'crops': {
            'soybean': 'भटमास', 'cotton': 'कपास', 'wheat': 'गहुँ', 'onion': 'प्याज',
            'chana': 'चना', 'tur': 'रहर', 'maize': 'मकै'
        }
    },
    'mai': {
        'name': 'Maithili', 'native': 'मैथिली', 'script': 'Devanagari',
        'nav': {
            'home': 'घर', 'dashboard': 'डैशबोर्ड', 'fpoPooling': 'FPO पूलिङ्ग', 'mandiPrices': 'मंडी भाव',
            'browseLots': 'फसल कीनू', 'myLots': 'हमर फसल', 'passbookEscrow': 'पासबुक आ एस्क्रो',
            'transport': 'लॉजिस्टिक्स', 'chat': 'सन्देश', 'profile': 'प्रोफाइल', 'createLot': 'फसल बेचू',
            'aiMitra': 'AI मित्र', 'login': 'साइन इन', 'logout': 'साइन आउट',
            'directNetwork': 'सोझे मंडी आ किसान नेटवर्क', 'agmarknetLive': 'एगमार्कनेट लाइव'
        },
        'mandiPrices': {
            'title': 'APMC मंडी भाव विश्लेषण',
            'subtitle': 'सरकारी एगमार्कनेट पोर्टल सं सोझे मुख्य मंडिक लाइव भाव',
            'searchPlaceholder': 'मंडी, जिला वा फसल खोजू...',
            'allCrops': 'सब फसल', 'allDistricts': 'सब जिला', 'syncNow': 'सिंक करू',
            'syncing': 'भाव अपडेट भ रहल अछि...', 'activeYards': 'सक्रिय मंडी यार्ड',
            'lastSync': 'अंतिम समय', 'minRate': 'कम स कम / क्विंटल', 'maxRate': 'बेसी स बेसी / क्विंटल',
            'modalRate': 'मॉडल भाव / क्विंटल', 'arrivalsToday': 'आइजुक आवक', 'trend': 'बाजार रुझान',
            'viewLots': 'फसल देखू'
        },
        'profile': {
            'title': 'उपयोगकर्ता प्रोफाइल आ सत्यापन',
            'subtitle': 'सोझे बैंक खाता, UPI आ एस्क्रो वॉलेट सेटिंग्स',
            'switchRole': 'भूमिका बदलू', 'saveProfile': 'परिवर्तन सुरक्षित करू', 'bankDetails': 'बैंक आ UPI विवरण',
            'name': 'पूरा नाम', 'phone': 'मोबाइल नंबर', 'district': 'जिला', 'role': 'मंच भूमिका',
            'kycVerified': 'KYC सत्यापित', 'traderRating': 'व्यापारी रेटिंग', 'trustScore': 'विश्वास स्कोर',
            'escrowBalance': 'एस्क्रो आ वॉलेट शेष', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'बैंकक नाम', 'accountNumber': 'खाता संख्या', 'ifsc': 'IFSC कोड',
            'saveChanges': 'प्रोफाइल सुरक्षित करू', 'saving': 'सुरक्षित भ रहल अछि...'
        },
        'transport': {
            'title': 'ग्रामीण कृषि परिवहन आ लॉजिस्टिक्स',
            'subtitle': 'खेत सं सोझे उठाबय लेल सत्यापित ट्रक बुक करू',
            'farmGatePickup': 'खेत सं पिकअप', 'searchTrucks': 'ट्रक खोजू', 'calculatorTitle': 'भाड़ा कैलकुलेटर',
            'pickup': 'पिकअप जिला', 'drop': 'पहुंचाबय वाला जिला/मंडी', 'distance': 'अनुमानित दूरी',
            'vehicleType': 'गाड़ीक प्रकार', 'weight': 'कुल वजन (क्विंटल)', 'baseFare': 'मूल भाड़ा',
            'platformFee': 'प्लेटफॉर्म शुल्क', 'estimatedFare': 'कुल अनुमानित भाड़ा', 'payOnDelivery': 'पहुंचला पर भुगतान करू',
            'availableTransporters': 'उपलब्ध ट्रांसपोर्टर', 'bookNow': 'ट्रक बुक करू', 'activeVehicles': 'सक्रिय गाड़ी'
        },
        'aggregation': {
            'title': 'FPO फसल एकत्रीकरण आ केंद्र',
            'subtitle': 'किसानक फसल जमा क सीधे मिल क थोक मे बेची आ बेसी मुनाफा कमाऊ',
            'fpoPortal': 'FPO पोर्टल', 'hubTitle': 'FPO एकत्रीकरण केंद्र', 'activePools': 'सक्रिय पूल',
            'targetVolume': 'लक्ष्य परिमाण', 'pledgeCrop': 'फसल दर्ज करू', 'buyBulk': 'थोक मे कीनू',
            'statutoryFormula': 'कानूनी सूत्र', 'memberPayouts': 'सदस्य भुगतान', 'netPayout': 'शुद्ध भुगतान'
        },
        'crops': {
            'soybean': 'सोयाबीन', 'cotton': 'कपास', 'wheat': 'गेहूँ', 'onion': 'पियाज',
            'chana': 'चना', 'tur': 'अरहर', 'maize': 'मकई'
        }
    },
    'kok': {
        'name': 'Konkani', 'native': 'कोंकणी', 'script': 'Devanagari',
        'nav': {
            'home': 'घर', 'dashboard': 'डॅशबोर्ड', 'fpoPooling': 'FPO पूलिंग', 'mandiPrices': 'मार्केट दर',
            'browseLots': 'पीक विकतें घेयात', 'myLots': 'म्ಹਜੀं पिकां', 'passbookEscrow': 'पासबूक आनी एस्क्रो',
            'transport': 'येरादारी', 'chat': 'संदेश', 'profile': 'प्रोफायल', 'createLot': 'पीक विका',
            'aiMitra': 'AI मित्र', 'login': 'साइन इन', 'logout': 'साइन आऊट',
            'directNetwork': 'थेट मार्केट आनी शेतकार जाळें', 'agmarknetLive': 'एगमार्कनेट थेट'
        },
        'mandiPrices': {
            'title': 'APMC मार्केट दर विश्लेषण',
            'subtitle': 'सरकारी एगमार्कनेट पोर्टलार साकून थेट मुख्य मार्केटांचे दर',
            'searchPlaceholder': 'मार्केट, जिल्लो वा पीक सोदात...',
            'allCrops': 'सगळीं पिकां', 'allDistricts': 'सगळे जिल्ले', 'syncNow': 'सिंक करात',
            'syncing': 'दर अपडेट जातात...', 'activeYards': 'सक्रिय मार्केटां',
            'lastSync': 'निमाणे सिंक वेळ', 'minRate': 'उणो दर / क्विंटल', 'maxRate': 'चड दर / क्विंटल',
            'modalRate': 'मॉडेल दर / क्विंटल', 'arrivalsToday': 'आयची आवक', 'trend': 'मार्केट कल',
            'viewLots': 'पिकां पळयात'
        },
        'profile': {
            'title': 'वापरपी प्रोफायल आनी प्रमाणीकरण',
            'subtitle': 'थेट बँक खातें, UPI आनी एस्क्रो वॉलेट मांडणी',
            'switchRole': 'भूमिका बदलोत', 'saveProfile': 'बदल सांबाळात', 'bankDetails': 'बँक आनी UPI तपशील',
            'name': 'पूर्ण नांव', 'phone': 'मोबाईल नंबर', 'district': 'जिल्लो', 'role': 'मंच भूमिका',
            'kycVerified': 'KYC प्रमाणित', 'traderRating': 'वेपारी रेटिंग', 'trustScore': 'विश्वास स्कोर',
            'escrowBalance': 'एस्क्रो आनी वॉलेट शिल्लक', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'बँकेचें नांव', 'accountNumber': 'खातें नंबर', 'ifsc': 'IFSC कोड',
            'saveChanges': 'प्रोफायल सांबाळात', 'saving': 'सांबाळटा...'
        },
        'transport': {
            'title': 'ग्रामीण शेत येरादारी आनी लॉजिस्टिक्स',
            'subtitle': 'शेंतातल्यान थेट व्हरपाक प्रमाणित ट्रक बुक करात',
            'farmGatePickup': 'शेंतांतल्यान पिकअप', 'searchTrucks': 'ट्रक सोदात', 'calculatorTitle': 'भाडें गणक',
            'pickup': 'पिकअप जिल्लो', 'drop': 'पावोवपाचो जिल्लो/मार्केट', 'distance': 'अंदाज अंतर',
            'vehicleType': 'वाहनाचो प्रकार', 'weight': 'एकूण वजन (क्विंटल)', 'baseFare': 'मूळ भाडें',
            'platformFee': 'प्लॅटफॉर्म फी', 'estimatedFare': 'एकूण अंदाज भाडें', 'payOnDelivery': 'पावल्या उपरांत भाडें दियात',
            'availableTransporters': 'उपलब्ध येरादारीदार', 'bookNow': 'ट्रक बुक करात', 'activeVehicles': 'सक्रिय वाहनां'
        },
        'aggregation': {
            'title': 'FPO पीक एकत्रीकरण आनी केंद्र',
            'subtitle': 'शेतकारांचीं पिकां एकठांय करून मिलांक घाऊक विकून चड नफा मेळयात',
            'fpoPortal': 'FPO पोर्टल', 'hubTitle': 'FPO एकत्रीकरण केंद्र', 'activePools': 'सक्रिय पूल',
            'targetVolume': 'लक्ष्य प्रमाण', 'pledgeCrop': 'पीक नोंद करात', 'buyBulk': 'घाऊक विकतें घेयात',
            'statutoryFormula': 'कायदेशीर सूत्र', 'memberPayouts': 'वांगड्यांक फारीकणी', 'netPayout': 'निव्वळ फारीकणी'
        },
        'crops': {
            'soybean': 'सोयाबीन', 'cotton': 'कापूस', 'wheat': 'गंव', 'onion': 'कांदो',
            'chana': 'चणे', 'tur': 'तूर', 'maize': 'मको'
        }
    },
    'ks': {
        'name': 'Kashmiri', 'native': 'कॉशुर', 'script': 'Perso-Arabic / Devanagari',
        'nav': {
            'home': 'ہوم / होम', 'dashboard': 'ڈیش بورڈ / डॅशबोर्ड', 'fpoPooling': 'FPO پُولِنگ', 'mandiPrices': 'منڈی بھاؤ / मंडी भाव',
            'browseLots': 'فصل ہؠچِو / फसल हेचिव', 'myLots': 'میٲنؠ فصل / म्यानि फसल', 'passbookEscrow': 'پاس بُک / पासबुक',
            'transport': 'ٹرانسپورٹ / ट्रान्सपोर्ट', 'chat': 'پیغامات / संदेश', 'profile': 'پروفائل / प्रोफाइल', 'createLot': 'فصل کٕنِو / फसल कनिव',
            'aiMitra': 'AI مِترا', 'login': 'لاگ اِن', 'logout': 'لاگ آؤٹ',
            'directNetwork': 'براہ راست منڈی نیٹ ورک', 'agmarknetLive': 'ایگمارک نیٹ لائیو'
        },
        'mandiPrices': {
            'title': 'APMC منڈی نرخ نامہ',
            'subtitle': 'ایگمارک نیٹ سرکاری پورٹل پؠٹھٕ براہ راست نرخ',
            'searchPlaceholder': 'منڈی یا فصل تلاش کریو...',
            'allCrops': 'سٲری فصل', 'allDistricts': 'سٲری ضلعے', 'syncNow': 'تازہ کریو',
            'syncing': 'اپ ڈیٹ گژھان...', 'activeYards': 'چالو منڈی',
            'lastSync': 'پتم وقت', 'minRate': 'کم از کم / کوئنٹل', 'maxRate': 'زیادہ کھۄتہٕ زیادہ / کوئنٹل',
            'modalRate': 'ماڈل ریٹ / کوئنٹل', 'arrivalsToday': 'ازٕچ آمد', 'trend': 'مارکیٹ رجحان',
            'viewLots': 'فصل بچھِو'
        },
        'profile': {
            'title': 'پروفائل تہٕ تصدیق',
            'subtitle': 'بینک اکاؤنٹ، UPI تہٕ والٹ سیٹنگز',
            'switchRole': 'کردار بدلایو', 'saveProfile': 'محفوظ کریو', 'bankDetails': 'بینک تفصیلات',
            'name': 'پورا ناو', 'phone': 'موبائل نمبر', 'district': 'ضلع', 'role': 'کردار',
            'kycVerified': 'KYC تصدیق شدہ', 'traderRating': 'تاجر ریٹنگ', 'trustScore': 'اعتماد سکور',
            'escrowBalance': 'والٹ رقم', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'بینک ناو', 'accountNumber': 'اکاؤنٹ نمبر', 'ifsc': 'IFSC کوڈ',
            'saveChanges': 'محفوظ کریو', 'saving': 'محفوظ گژھان...'
        },
        'transport': {
            'title': 'ٹرانسپورٹ تہٕ بار برداری',
            'subtitle': 'کھیت منزٕ فصل لوٹ اننہٕ باپتھ ٹرک بک کریو',
            'farmGatePickup': 'کھیت پؠٹھٕ پک اپ', 'searchTrucks': 'ٹرک تلاش کریو', 'calculatorTitle': 'کرایہ حساب',
            'pickup': 'پک اپ ضلع', 'drop': 'منزل ضلع/منڈی', 'distance': 'فاصلہ (کلومیٹر)',
            'vehicleType': 'گاڑ قسم', 'weight': 'وزن (کوئنٹل)', 'baseFare': 'بنیادی کرایہ',
            'platformFee': 'فیس', 'estimatedFare': 'کل کرایہ', 'payOnDelivery': 'ڈلیوری وقت دِیو',
            'availableTransporters': 'موجود ٹرانسپورٹرز', 'bookNow': 'ٹرک بک کریو', 'activeVehicles': 'چالو گاڑیہٕ'
        },
        'aggregation': {
            'title': 'FPO فصل ایکتھ مرکز',
            'subtitle': 'کسانن ہنز فصل ایکتھ کٔرِتھ مِلو کن تھوک کٕنِو',
            'fpoPortal': 'FPO پورٹل', 'hubTitle': 'FPO مرکز', 'activePools': 'چالو گروپ',
            'targetVolume': 'ہدف مقدار', 'pledgeCrop': 'فصل درج کریو', 'buyBulk': 'تھوک ہؠچِو',
            'statutoryFormula': 'ضابطہ', 'memberPayouts': 'ارکانن ادائیگی', 'netPayout': 'کل ادائیگی'
        },
        'crops': {
            'soybean': 'سویا بین', 'cotton': 'کپاس', 'wheat': 'گندم', 'onion': 'گنڈٕ',
            'chana': 'چھولہٕ', 'tur': 'ارہر', 'maize': 'مکئی'
        }
    },
    'sd': {
        'name': 'Sindhi', 'native': 'सिन्धी', 'script': 'Devanagari / Perso-Arabic',
        'nav': {
            'home': 'گھر / घर', 'dashboard': 'ڊيش بورڊ / डॅशबोर्ड', 'fpoPooling': 'FPO پولنگ', 'mandiPrices': 'منڊي جا اگهه / मंडी भाव',
            'browseLots': 'فصل خريد ڪريو / फसल वठो', 'myLots': 'منهنجا فصل / म्हिंजी फसल', 'passbookEscrow': 'پاس بڪ / पासबुक',
            'transport': 'ٽرانسپورٽ / ट्रांसपोर्ट', 'chat': 'نياپا / संदेश', 'profile': 'پروفائل / प्रोफाइल', 'createLot': 'فصل وڪرو ڪريو / फसल विको',
            'aiMitra': 'AI متر', 'login': 'سائن ان', 'logout': 'سائن آئوٽ',
            'directNetwork': 'سڌو سنئون منڊي نيٽ ورڪ', 'agmarknetLive': 'ايگمڊارڪ نيٽ لائيو'
        },
        'mandiPrices': {
            'title': 'APMC منڊي جي اگهن جو تجزيو',
            'subtitle': 'سرڪاري پورٽل تان سڌو منڊي جا اگهه',
            'searchPlaceholder': 'منڊي يا فصل ڳوليو...',
            'allCrops': 'سڀ فصل', 'allDistricts': 'سڀ ضلعا', 'syncNow': 'اپڊيٽ ڪريو',
            'syncing': 'اپڊيٽ ٿي رهيو آهي...', 'activeYards': 'هلندڙ منڊيون',
            'lastSync': 'آخري وقت', 'minRate': 'گھٽ ۾ گھٽ / ڪوئينٽل', 'maxRate': 'وڌ ۾ وڌ / ڪوئينٽل',
            'modalRate': 'ماڊل اگهه / ڪوئينٽل', 'arrivalsToday': 'اڄ جي آمد', 'trend': 'مارڪيٽ جو رخ',
            'viewLots': 'فصل ڏسو'
        },
        'profile': {
            'title': 'پروفائل ۽ تصديق',
            'subtitle': 'بئنڪ اڪائونٽ ۽ والٽ جون سيٽنگون',
            'switchRole': 'ڪردار تبديل ڪريو', 'saveProfile': 'تبديليون محفوظ ڪريو', 'bankDetails': 'بئنڪ تفصيل',
            'name': 'پورو نالو', 'phone': 'موبائل نمبر', 'district': 'ضلعو', 'role': 'ڪردار',
            'kycVerified': 'KYC تصديق ٿيل', 'traderRating': 'واپاري ريٽنگ', 'trustScore': 'اعتماد اسڪور',
            'escrowBalance': 'والٽ بيلنس', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'بئنڪ جو نالو', 'accountNumber': 'اڪائونٽ نمبر', 'ifsc': 'IFSC ڪوڊ',
            'saveChanges': 'محفوظ ڪريو', 'saving': 'محفوظ ٿي رهيو آهي...'
        },
        'transport': {
            'title': 'زرعي ٽرانسپورٽ ۽ لاجسٽڪس',
            'subtitle': 'ٻنيءَ مان سڌو سنئون مال کڻڻ لاءِ ٽرڪ بُڪ ڪريو',
            'farmGatePickup': 'ٻنيءَ مان کڻڻ', 'searchTrucks': 'ٽرڪ ڳوليو', 'calculatorTitle': 'ڀاڙي جو حساب',
            'pickup': 'کڻڻ جو ضلعو', 'drop': 'منزل وارو ضلعو/منڊي', 'distance': 'فاصلو',
            'vehicleType': 'گاڏي جو قسم', 'weight': 'وزن (ڪوئينٽل)', 'baseFare': 'بنيادي ڀاڙو',
            'platformFee': 'فيس', 'estimatedFare': 'ڪل متوقع ڀاڙو', 'payOnDelivery': 'پڄڻ تي رقم ادا ڪريو',
            'availableTransporters': 'موجود ٽرانسپورٽر', 'bookNow': 'ٽرڪ بُڪ ڪريو', 'activeVehicles': 'هلندڙ گاڏيون'
        },
        'aggregation': {
            'title': 'FPO فصل گڏ ڪرڻ جو مرڪز',
            'subtitle': 'هارين جي فصل گڏ ڪري ملن کي هول سيل وڪرو ڪري وڌيڪ فائدو وٺو',
            'fpoPortal': 'FPO پورٽل', 'hubTitle': 'FPO مرڪز', 'activePools': 'هلندڙ گروپ',
            'targetVolume': 'ٽارگيٽ مقدار', 'pledgeCrop': 'فصل درج ڪريو', 'buyBulk': 'ٿوڪ خريد ڪريو',
            'statutoryFormula': 'قانوني فارمولا', 'memberPayouts': 'ميمبرن جي ادائيگي', 'netPayout': 'خالص رقم'
        },
        'crops': {
            'soybean': 'سويا بين', 'cotton': 'ڪپهه', 'wheat': 'ڪڻڪ', 'onion': 'بصر',
            'chana': 'چڻا', 'tur': 'تُور', 'maize': 'مڪئي'
        }
    },
    'doi': {
        'name': 'Dogri', 'native': 'डोगरी', 'script': 'Devanagari',
        'nav': {
            'home': 'घर', 'dashboard': 'डैशबोर्ड', 'fpoPooling': 'FPO पूलिंग', 'mandiPrices': 'मंडी भाव',
            'browseLots': 'फसल खरीदो', 'myLots': 'म्हारी फसल', 'passbookEscrow': 'पासबुक ते एस्क्रो',
            'transport': 'लॉजिस्टिक्स', 'chat': 'सुनेहे', 'profile': 'प्रोफाइल', 'createLot': 'फसल बेचो',
            'aiMitra': 'AI मित्र', 'login': 'साइन इन', 'logout': 'साइन आउट',
            'directNetwork': 'सीधी मंडी ते किसान नेटवर्क', 'agmarknetLive': 'एगमार्कनेट लाइव'
        },
        'mandiPrices': {
            'title': 'APMC मंडी भाव विश्लेषण',
            'subtitle': 'सरकारी एगमार्कनेट पोर्टल शा सीधे मुख्य मंडियें दे लाइव भाव',
            'searchPlaceholder': 'मंडी, जिला या फसल तुप्पो...',
            'allCrops': 'सब्भे फसलें', 'allDistricts': 'सब्भे जिले', 'syncNow': 'सिंक करो',
            'syncing': 'भाव अपडेट होआ करदे न...', 'activeYards': 'सक्रिय मंडी यार्ड',
            'lastSync': 'पिछला समां', 'minRate': 'घट्टो-घट्ट / क्विंटल', 'maxRate': 'मत्ते शा मत्ता / क्विंटल',
            'modalRate': 'मॉडल भाव / क्विंटल', 'arrivalsToday': 'अज्जै दी आवक', 'trend': 'बाजार रुझान',
            'viewLots': 'फसलें दक्खो'
        },
        'profile': {
            'title': 'यूजर प्रोफाइल ते सत्यापन',
            'subtitle': 'सीधा बैंक खाता, UPI ते एस्क्रो वॉलेट सेटिंग्स',
            'switchRole': 'रोल बदलो', 'saveProfile': 'बदलाव बचाओ', 'bankDetails': 'बैंक ते UPI ब्यौरा',
            'name': 'पूरा नांऽ', 'phone': 'मोबाइल नंबर', 'district': 'जिला', 'role': 'मंच भूमिका',
            'kycVerified': 'KYC सत्यापित', 'traderRating': 'व्यापारी रेटिंग', 'trustScore': 'विश्वास स्कोर',
            'escrowBalance': 'एस्क्रो ते वॉलेट बैलेंस', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'बैंक दा नांऽ', 'accountNumber': 'खाता नंबर', 'ifsc': 'IFSC कोड',
            'saveChanges': 'प्रोफाइल बचाओ', 'saving': 'बचाया जा करदा ऐ...'
        },
        'transport': {
            'title': 'ग्रामीण कृषि ढुआई ते लॉजिस्टिक्स',
            'subtitle': 'पेली शा सीधे ढुआई लेई सत्यापित ट्रक बुक करो',
            'farmGatePickup': 'पेली शा पिकअप', 'searchTrucks': 'ट्रक तुप्पो', 'calculatorTitle': 'किराया कैलकुलेटर',
            'pickup': 'पिकअप जिला', 'drop': 'पुज्जने आला जिला/मंडी', 'distance': 'अनुमानित दूरी',
            'vehicleType': 'गड्डी दी किस्म', 'weight': 'कुल वजन (क्विंटल)', 'baseFare': 'बुनियादी किराया',
            'platformFee': 'प्लेटफार्म फीस', 'estimatedFare': 'कुल किराया', 'payOnDelivery': 'पुज्जने पर दित्ता जा',
            'availableTransporters': 'उपलब्ध ट्रांसपोर्टर', 'bookNow': 'ट्रक बुक करो', 'activeVehicles': 'सक्रिय गड्डियां'
        },
        'aggregation': {
            'title': 'FPO फसल एकत्रीकरण केंद्र',
            'subtitle': 'किसानों दी फसल कट्टी करियै मिलें गी थोक च बेचो ते बद्ध मुनाफा कमाओ',
            'fpoPortal': 'FPO पोर्टल', 'hubTitle': 'FPO एकत्रीकरण केंद्र', 'activePools': 'सक्रिय पूल',
            'targetVolume': 'लक्ष्य परिमाण', 'pledgeCrop': 'फसल दर्ज करो', 'buyBulk': 'थोक खरीदो',
            'statutoryFormula': 'कानूनी फार्मूला', 'memberPayouts': 'मेंबरें गी भुगतान', 'netPayout': 'शुद्ध भुगतान'
        },
        'crops': {
            'soybean': 'सोयाबीन', 'cotton': 'कपास', 'wheat': 'कणक', 'onion': 'गंडा',
            'chana': 'छोले', 'tur': 'मांह', 'maize': 'मक्की'
        }
    },
    'brx': {
        'name': 'Bodo', 'native': 'बड़ो', 'script': 'Devanagari',
        'nav': {
            'home': 'नंखौ', 'dashboard': 'डेशबर्ड', 'fpoPooling': 'FPO पूलिं', 'mandiPrices': 'मंडी बेसेन',
            'browseLots': 'फसल बाय', 'myLots': 'आंनि फसल', 'passbookEscrow': 'पासबुक आरो एस्क्रो',
            'transport': 'रवाना', 'chat': 'रादाब', 'profile': 'प्रफाइल', 'createLot': 'फसल फान',
            'aiMitra': 'AI लोगो', 'login': 'हाब', 'logout': 'ओंखार',
            'directNetwork': 'थिं मंडी आरो आबादारि संजाल', 'agmarknetLive': 'एगमार्कनेट लाइव'
        },
        'mandiPrices': {
            'title': 'APMC मंडी बेसेन बिजिरथि',
            'subtitle': 'सोरखारि एगमार्कनेटनिफ्राय थिं मंडी बेसेन',
            'searchPlaceholder': 'मंडी, जिल्ला एबा फसल नागिर...',
            'allCrops': 'गासै फसल', 'allDistricts': 'गासै जिल्ला', 'syncNow': 'सिंक खालाम',
            'syncing': 'बेसेन गोदान जाबाय थादों...', 'activeYards': 'सोलिबाय थानाय मंडी',
            'lastSync': 'जोबथा सम', 'minRate': 'खम बेसेन / क्विंटल', 'maxRate': 'बांसिन बेसेन / क्विंटल',
            'modalRate': 'मडेल बेसेन / क्विंटल', 'arrivalsToday': 'दिनैनि फैनाय', 'trend': 'बजारनि महर',
            'viewLots': 'फसल नाय'
        },
        'profile': {
            'title': 'बाहायग्रानि प्रफाइल आरो आनजाद',
            'subtitle': 'थिं बेंक खाता, UPI आरो एस्क्रो वालेट',
            'switchRole': 'बिबान सोलाय', 'saveProfile': 'दोनथुम', 'bankDetails': 'बेंक आरो UPI विवरन',
            'name': 'गासै मुं', 'phone': 'मबाइल नम्बर', 'district': 'जिल्ला', 'role': 'प्लेटफर्म बिबान',
            'kycVerified': 'KYC आनजाद जाबाय', 'traderRating': 'फालांगियारि रेटिं', 'trustScore': 'फोथायनाय स्कोर',
            'escrowBalance': 'एस्क्रो आरो वालेट संस्रि', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'बेंक मुं', 'accountNumber': 'खाता नम्बर', 'ifsc': 'IFSC कोड',
            'saveChanges': 'प्रफाइल दोनथुम', 'saving': 'दोनथुमबाय थादों...'
        },
        'transport': {
            'title': 'गामियारि आबाद रोगाथाय आरो लजिस्टिक्स',
            'subtitle': 'फोथारनिफ्राय थिं लांनो ट्रक बुक खालाम',
            'farmGatePickup': 'फोथारनिफ्राय पिकअप', 'searchTrucks': 'ट्रक नागिर', 'calculatorTitle': 'भाड़ा सानजिथाय',
            'pickup': 'पिकअप जिल्ला', 'drop': 'गनाय जिल्ला/मंडी', 'distance': 'जानथाय',
            'vehicleType': 'गाड़िनि रोखोम', 'weight': 'गासै लिरथाय (क्विंटल)', 'baseFare': 'गुदि भाड़ा',
            'platformFee': 'मासुल', 'estimatedFare': 'गासै भाड़ा', 'payOnDelivery': 'पावनायाव रां हो',
            'availableTransporters': 'उपलब्ध रोगाग्रा', 'bookNow': 'ट्रक बुक खालाम', 'activeVehicles': 'सोलिबाय थानाय गाड़ी'
        },
        'aggregation': {
            'title': 'FPO फसल खौसेथि आरो मिरु',
            'subtitle': 'आबादारिनि फसल खौसे खालामना मिलफोरनो फान आरो बांसिन लाब खालाम',
            'fpoPortal': 'FPO पोर्टल', 'hubTitle': 'FPO खौसेथि मिरु', 'activePools': 'सोलिनाय पूल',
            'targetVolume': 'थांखि', 'pledgeCrop': 'फसल थिसन', 'buyBulk': 'बाय',
            'statutoryFormula': 'नेम', 'memberPayouts': 'सोद्रोमा रां', 'netPayout': 'गासै रां'
        },
        'crops': {
            'soybean': 'सयाबिन', 'cotton': 'खुन्दुं', 'wheat': 'गम', 'onion': 'फियाज',
            'chana': 'बुत', 'tur': 'अरहर', 'maize': 'मकै'
        }
    },
    'sat': {
        'name': 'Santali', 'native': 'संथाली', 'script': 'Ol Chiki / Devanagari',
        'nav': {
            'home': 'ᱚᱲᱟᱜ / ओड़ाः', 'dashboard': 'ᱰᱮᱥᱵᱳᱨᱰ / डॅशबोर्ड', 'fpoPooling': 'FPO ᱯᱩᱞᱤᱝ', 'mandiPrices': 'ᱦᱟᱴ ᱫᱚᱨ / हाट दर',
            'browseLots': 'ᱪᱟᱥ ᱠᱤᱨᱤᱧ / चास किरिञ', 'myLots': 'ᱤᱧᱟᱜ ᱪᱟᱥ / इञाः चास', 'passbookEscrow': 'ᱯᱟᱥᱵᱩᱠ / पासबुक',
            'transport': 'ᱜᱟᱹᱰᱤ ᱥᱮᱵᱟ / गाडी सेवा', 'chat': 'ᱠᱷᱚᱵᱚᱨ / मेसेज', 'profile': 'ᱯᱨᱳᱯᱷᱟᱭᱤᱞ / प्रोफाइल', 'createLot': 'ᱪᱟᱥ ᱟᱹᱠᱷᱨᱤᱧ / चास आख्रिञ',
            'aiMitra': 'AI ᱜᱟᱛᱮ / AI गाते', 'login': 'ᱵᱚᱞᱚᱱ / बोलोन', 'logout': 'ᱚᱰᱚᱠ / ओडोक',
            'directNetwork': 'ᱥᱚᱡᱷᱮ ᱦᱟᱴ ᱟᱨ ᱪᱟᱥᱤ ᱱᱮᱴᱣᱟᱨᱠ', 'agmarknetLive': 'ᱮᱜᱽᱢᱟᱨᱠᱱᱮᱴ ᱞᱟᱭᱤᱵᱽ'
        },
        'mandiPrices': {
            'title': 'APMC ᱦᱟᱴ ᱫᱚᱨ ᱛᱩᱞᱟᱹᱡᱚᱠᱷᱟ',
            'subtitle': 'ᱥᱚରᱠᱟᱨᱤ ᱯᱳᱨᱴᱟᱞ ᱠᱷᱚᱱ ᱥᱚᱡᱷᱮ ᱞᱟᱭᱤᱵᱽ ᱦᱟᱴ ᱫᱚᱨ',
            'searchPlaceholder': 'ᱦᱟᱴ, ᱡᱤᱞᱟᱹ ᱥᱮ ᱪᱟᱥ ᱥᱮᱸᱫᱽᱨᱟᱭ ᱢᱮ...',
            'allCrops': 'ᱡᱚᱛᱚ ᱪᱟᱥ', 'allDistricts': 'ᱡᱚᱛᱚ ᱡᱤᱞᱟᱹ', 'syncNow': 'ᱟᱹᱨᱩ ᱯᱷᱮᱨᱟᱣ',
            'syncing': 'ᱫᱚᱨ ᱟᱹᱨᱩᱜ ᱠᱟᱱᱟ...', 'activeYards': 'ᱪᱟᱹᱞᱩ ᱦᱟᱴ',
            'lastSync': 'ᱢᱩᱪᱟᱹᱫ ᱚᱠᱛᱚ', 'minRate': 'ᱠᱚᱢ ᱫᱚᱨ / ᱠᱩᱭᱤᱱᱴᱟᱞ', 'maxRate': 'ᱡᱟᱹᱥᱛᱤ ᱫᱚᱨ / ᱠᱩᱭᱤᱱᱴᱟᱞ',
            'modalRate': 'ᱢᱳᱰᱟᱞ ᱫᱚᱨ / ᱠᱩᱭᱤᱱᱴᱟᱞ', 'arrivalsToday': 'ᱛᱮᱦᱮᱧᱟᱜ ᱟᱹᱜᱩ', 'trend': 'ᱵᱟᱡᱟᱨ ᱪᱟᱞ',
            'viewLots': 'ᱪᱟᱥ ᱧᱮᱞ ᱢᱮ'
        },
        'profile': {
            'title': 'ᱵᱮᱵᱷᱟᱨᱤᱭᱟᱹ ᱯᱨᱳᱯᱷᱟᱭᱤᱞ ᱟᱨ ᱯᱚᱨᱚᱠ',
            'subtitle': 'ᱥᱚᱡᱷᱮ ᱵᱮᱸᱠ ᱟᱠᱟᱣᱩᱱᱴ, UPI ᱟᱨ ᱣᱟᱞᱮᱴ',
            'switchRole': 'ᱨᱳᱞ ᱵᱚᱫᱚᱞ', 'saveProfile': 'ᱥᱟᱧᱪᱟᱣ', 'bankDetails': 'ᱵᱮᱸᱠ ᱟᱨ UPI ᱵᱤᱵᱚᱨᱚᱱ',
            'name': 'ᱯᱩᱨᱟᱹ ᱧᱩᱛᱩᱢ', 'phone': 'ᱢᱳᱵᱟᱭᱤᱞ ᱱᱚᱢᱵᱚᱨ', 'district': 'ᱡᱤᱞᱟᱹ', 'role': 'ᱠᱟᱹᱢᱤ ᱨᱳᱞ',
            'kycVerified': 'KYC ᱯᱟᱥ', 'traderRating': 'ᱵᱮᱯᱟᱨᱤ ᱨᱮᱴᱤᱝ', 'trustScore': 'ᱯᱟᱹᱛᱭᱟᱹᱣ ᱥᱠᱳᱨ',
            'escrowBalance': 'ᱣᱟᱞᱮᱴ ᱨᱮᱭᱟᱜ ᱴᱟᱠᱟ', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'ᱵᱮᱸᱠ ᱧᱩᱛᱩᱢ', 'accountNumber': 'ᱟᱠᱟᱣᱩᱱᱴ ᱱᱚᱢᱵᱚᱨ', 'ifsc': 'IFSC ᱠᱳᱰ',
            'saveChanges': 'ᱯᱨᱳᱯᱷᱟᱭᱤᱞ ᱥᱟᱧᱪᱟᱣ', 'saving': 'ᱥᱟᱧᱪᱟᱣᱜ ᱠᱟᱱᱟ...'
        },
        'transport': {
            'title': 'ᱟᱹᱛᱩ ᱪᱟᱥ ᱜᱟᱹᱰᱤ ᱟᱨ ᱞᱚᱡᱤᱥᱴᱤᱠᱥ',
            'subtitle': 'ᱵᱟᱹᱫᱽ ᱠᱷᱚᱱ ᱥᱚᱡᱷᱮ ᱤᱫᱤ ᱞᱟᱹᱜᱤᱫ ᱴᱨᱟᱠ ᱵᱩᱠ ᱢᱮ',
            'farmGatePickup': 'ᱵᱟᱹᱫᱽ ᱠᱷᱚᱱ ᱯᱤᱠᱟᱯ', 'searchTrucks': 'ᱴᱨᱟᱠ ᱯᱟᱸᱡᱟ', 'calculatorTitle': 'ᱵᱷᱟᱲᱟ ᱦᱤᱥᱟᱹᱵᱽ',
            'pickup': 'ᱯᱤᱠᱟᱯ ᱡᱤᱞᱟᱹ', 'drop': 'ᱤᱫᱤ ᱡᱤᱞᱟᱹ/ᱦᱟᱴ', 'distance': 'ᱥᱟᱺᱜᱤᱧ (km)',
            'vehicleType': 'ᱜᱟᱹᱰᱤ ᱨᱮᱭᱟᱜ ᱞᱮᱠᱟᱱ', 'weight': 'ᱢᱚᱴ ᱦᱟᱢᱟᱞ (ᱠᱩᱭᱤᱱᱴᱟᱞ)', 'baseFare': 'ᱢᱩᱬ ᱵᱷᱟᱲᱟ',
            'platformFee': 'ᱯᱷᱤᱥ', 'estimatedFare': 'ᱢᱚᱴ ᱵᱷᱟᱲᱟ', 'payOnDelivery': 'ᱥᱮᱴᱮᱨ ᱛᱟᱭᱚᱢ ᱮᱢ',
            'availableTransporters': 'ᱢᱮᱱᱟᱜ ᱜᱟᱹᱰᱤ', 'bookNow': 'ᱴᱨᱟᱠ ᱵᱩᱠ ᱢᱮ', 'activeVehicles': 'ᱪᱟᱹᱞᱩ ᱜᱟᱹᱰᱤ'
        },
        'aggregation': {
            'title': 'FPO ᱪᱟᱥ ᱡᱟᱣᱨᱟ ᱛᱟᱞᱢᱟ',
            'subtitle': 'ᱪᱟᱥᱤᱭᱟᱜ ᱪᱟᱥ ᱡᱟᱣᱨᱟ ᱠᱟᱛᱮ ᱢᱤᱞ ᱠᱚᱨᱮ ᱟᱹᱠᱷᱨᱤᱧ ᱟᱨ ᱵᱟᱹᱲᱛᱤ ᱞᱟᱵᱷ ᱦᱟᱛᱟᱣ',
            'fpoPortal': 'FPO ᱯᱳᱨᱴᱟᱞ', 'hubTitle': 'FPO ᱛᱟᱞᱢᱟ', 'activePools': 'ᱪᱟᱹᱞᱩ ᱜᱟᱫᱮᱞ',
            'targetVolume': 'ᱡᱚᱥ ᱯᱚᱨᱤᱢᱟᱬ', 'pledgeCrop': 'ᱪᱟᱥ ᱚᱞ ᱢᱮ', 'buyBulk': 'ᱰᱷᱮᱨ ᱠᱤᱨᱤᱧ ᱢᱮ',
            'statutoryFormula': 'ᱟᱹᱱᱟᱹᱨᱤ', 'memberPayouts': 'ᱦᱟᱹᱴᱤᱧ ᱴᱟᱠᱟ', 'netPayout': 'ᱢᱚᱴ ᱧᱟᱢ'
        },
        'crops': {
            'soybean': 'ᱥᱚᱭᱟᱵᱤᱱ', 'cotton': 'ᱛᱩᱞᱟᱹᱢ', 'wheat': 'ᱜᱩᱦᱩᱢ', 'onion': 'ᱯᱮᱭᱟᱸᱡᱽ',
            'chana': 'ᱵᱩᱴ', 'tur': 'ᱚᱲᱦᱚᱨ', 'maize': 'ᱡᱚᱱᱰᱨᱟ'
        }
    },
    'mni': {
        'name': 'Manipuri', 'native': 'মৈতৈলোন্', 'script': 'Bengali-Meetei',
        'nav': {
            'home': 'য়ুম / হোম', 'dashboard': 'দেশবোর্দ', 'fpoPooling': 'FPO পুলিং', 'mandiPrices': 'মেন্দী মমল',
            'browseLots': 'পোথোক লৈবীয়ু', 'myLots': 'ঐগী পোথোক', 'passbookEscrow': 'পাসবুক অমসুং এসক্রো',
            'transport': 'পোৎপুবা', 'chat': 'পাউ', 'profile': 'প্রোফাইল', 'createLot': 'পোথোক য়োম্বীয়ু',
            'aiMitra': 'AI মরুপ', 'login': 'লোন চংবা', 'logout': 'লোন থোকপা',
            'directNetwork': 'মেন্দি অমসুং লৌমী শম্নবা', 'agmarknetLive': 'এগমार्कনেত লাইভ'
        },
        'mandiPrices': {
            'title': 'APMC মেন্দি মমল নৈনবা',
            'subtitle': 'লৈঙাক্কী পোর্টালদগী লাইভ মেন্দি মমল',
            'searchPlaceholder': 'মেন্দি, জিলা নত্রগা মহৈ-মরোং থিবীযু...',
            'allCrops': 'মহৈ-মরোং খুদিংমক', 'allDistricts': 'জিলা খুদিংমক', 'syncNow': 'নৌনথোকপা',
            'syncing': 'নৌনথোক্লি...', 'activeYards': 'চৎনরিবা মেন্দি',
            'lastSync': 'অরোইবা মতম', 'minRate': 'খ্বাইদগী নেম্বা / কুইন্তাল', 'maxRate': 'খ্বাইদগী ৱাংবা / কুইন্তাল',
            'modalRate': 'মোদেল মমল / কুইন্তাল', 'arrivalsToday': 'ঙসিগী পুশিল্লকপা', 'trend': 'কৈথেলগী চৎনবী',
            'viewLots': 'পোথোক য়েংবা'
        },
        'profile': {
            'title': 'শীজিন্নরিবগী প্রোফাইল অমসুং চেক তৌবা',
            'subtitle': 'বেংক একাউন্ত, UPI অমসুং এসক্রো ৱালেত',
            'switchRole': 'থৌদাং ওন্থোকপা', 'saveProfile': 'শেভ তৌবা', 'bankDetails': 'বেংক অমসুং UPI বিবরণ',
            'name': 'মপুংফাবা মিং', 'phone': 'মোবাইল নম্বর', 'district': 'জিলা', 'role': 'প্লেতফোর্মগী থৌদাং',
            'kycVerified': 'KYC চত্নরে', 'traderRating': 'ললোনবগী রেতিং', 'trustScore': 'থাগৎপা স্কোর',
            'escrowBalance': 'ৱালেত বেলেন্স', 'upiId': 'UPI ID (GPay / PhonePe)',
            'bankName': 'বেংক মিং', 'accountNumber': 'একাউন্ত নম্বর', 'ifsc': 'IFSC কোদ',
            'saveChanges': 'প্রোফাইল শেভ তৌবা', 'saving': 'শেভ তৌরি...'
        },
        'transport': {
            'title': 'খুঙ্গংগী লৌউ-শিংউগী গারী অমসুং লজিস্তিক্স',
            'subtitle': 'লৌফমদগী হকথেংননা পুথোক্নবা ত্রক বুক তৌবীয়ু',
            'farmGatePickup': 'লৌফমদগী পুবা', 'searchTrucks': 'ত্রক থিবীয়ু', 'calculatorTitle': 'ভাড়া হিসাব',
            'pickup': 'পিকঅপ জিলা', 'drop': 'থুংফম জিলা/মেন্দি', 'distance': 'লাপ্তুপ (km)',
            'vehicleType': 'গারীগী মখল', 'weight': 'অরুম্বা (কুইন্তাল)', 'baseFare': 'য়ুম্ফম ভাড়া',
            'platformFee': 'মাশুল', 'estimatedFare': 'অপুনবা ভাড়া', 'payOnDelivery': 'য়ৌবদা শেল থীবা',
            'availableTransporters': 'লৈরিবা গারী', 'bookNow': 'ত্রক বুক তৌবা', 'activeVehicles': 'চৎনরিবা গারী'
        },
        'aggregation': {
            'title': 'FPO পোথোক পুনশিনবা অমসুং মফম',
            'subtitle': 'লৌমীগী পোথোক পুন্সিল্লগা মিলদা থোক ওইনা য়োন্দুনা হেন্না কান্নবা লৌজৌ',
            'fpoPortal': 'FPO পোর্তাল', 'hubTitle': 'FPO কেন্দ্র', 'activePools': 'চৎনরিবা পুল',
            'targetVolume': 'পান্দম', 'pledgeCrop': 'পোথোক চংহনবা', 'buyBulk': 'থোক লৈবা',
            'statutoryFormula': 'নিয়ম', 'memberPayouts': 'মেম্বরগী শেল', 'netPayout': 'অপুনবা শেল'
        },
        'crops': {
            'soybean': 'সোয়াবিন', 'cotton': 'লশিং', 'wheat': 'গেহু', 'onion': 'তিলহৌ',
            'chana': 'হৱাইজার', 'tur': 'অরহর', 'maize': 'চুজি'
        }
    }
}

def deep_merge_localized(base_template, localized_dict):
    """Deep merges localized fields into a copy of the base template, preserving any remaining structure."""
    result = copy.deepcopy(base_template)
    for k, v in localized_dict.items():
        if isinstance(v, dict) and k in result and isinstance(result[k], dict):
            for sub_k, sub_v in v.items():
                result[k][sub_k] = sub_v
        else:
            result[k] = v
    return result

def main():
    print("🌾 Generating all 22 Indian scheduled languages + English...")
    
    generated_count = 0
    for code, ldata in LANG_DATA.items():
        out_dir = os.path.join(BASE_DIR, 'src', 'locales', code)
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, 'translation.json')
        
        # Merge localized definitions on top of base structure
        final_dict = deep_merge_localized(hi_base if code in ['doi', 'mai', 'kok', 'ne', 'sa', 'sd', 'ks', 'brx', 'sat'] else en_base, ldata)
        
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(final_dict, f, ensure_ascii=False, indent=2)
            
        generated_count += 1
        print(f"✅ [{code}] {ldata['name']} ({ldata['native']}) saved to {out_file} (20 sections).")
        
    print(f"🎉 Generated {generated_count} languages successfully!")

if __name__ == '__main__':
    main()
