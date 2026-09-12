/**
 * i18n — Translation strings for all UI chrome.
 * Emergency plan content is translated by the LLM; this is just buttons, labels, headers.
 */

export type LangKey = 'en' | 'bn' | 'hi';

const translations: Record<string, Record<LangKey, string>> = {
  // ─── App ───────────────────────────────────────────────────────────────
  'app.name': {
    en: 'RedFlag',
    bn: 'রেডফ্ল্যাগ',
    hi: 'रेडफ्लैग',
  },
  'app.tagline': {
    en: 'Your emergency scam defense system',
    bn: 'আপনার জরুরি প্রতারণা প্রতিরোধ ব্যবস্থা',
    hi: 'आपकी आपातकालीन धोखाधड़ी रक्षा प्रणाली',
  },
  'app.anti_impersonation': {
    en: 'RedFlag will NEVER ask for your OTP, PIN, or password.',
    bn: 'রেডফ্ল্যাগ কখনই আপনার OTP, PIN বা পাসওয়ার্ড চাইবে না।',
    hi: 'रेडफ्लैग कभी भी आपका OTP, PIN या पासवर्ड नहीं मांगेगा।',
  },

  // ─── Login ─────────────────────────────────────────────────────────────
  'login.title': {
    en: 'Sign In',
    bn: 'সাইন ইন করুন',
    hi: 'साइन इन करें',
  },
  'login.phone': {
    en: 'Phone Number',
    bn: 'ফোন নম্বর',
    hi: 'फ़ोन नंबर',
  },
  'login.otp': {
    en: 'OTP Code',
    bn: 'OTP কোড',
    hi: 'OTP कोड',
  },
  'login.submit': {
    en: 'Sign In',
    bn: 'সাইন ইন',
    hi: 'साइन इन',
  },
  'login.register': {
    en: 'Create Account',
    bn: 'অ্যাকাউন্ট তৈরি করুন',
    hi: 'खाता बनाएं',
  },
  'login.demo_note': {
    en: 'Demo OTP: 123456',
    bn: 'ডেমো OTP: ১২৩৪৫৬',
    hi: 'डेमो OTP: 123456',
  },

  // ─── Emergency ─────────────────────────────────────────────────────────
  'emergency.title': {
    en: 'What happened?',
    bn: 'কী হয়েছে?',
    hi: 'क्या हुआ?',
  },
  'emergency.subtitle': {
    en: 'Select all that apply — we\'ll create your action plan',
    bn: 'সব প্রযোজ্য বিকল্প নির্বাচন করুন — আমরা আপনার কর্ম পরিকল্পনা তৈরি করব',
    hi: 'सभी लागू विकल्प चुनें — हम आपकी कार्य योजना बनाएंगे',
  },
  'emergency.when': {
    en: 'When did this happen?',
    bn: 'এটা কখন হয়েছে?',
    hi: 'यह कब हुआ?',
  },
  'emergency.details': {
    en: 'A few more details',
    bn: 'আরো কিছু তথ্য',
    hi: 'कुछ और जानकारी',
  },
  'emergency.amount': {
    en: 'How much money?',
    bn: 'কত টাকা?',
    hi: 'कितने पैसे?',
  },
  'emergency.payment_method': {
    en: 'How did you pay?',
    bn: 'কীভাবে পেমেন্ট করেছেন?',
    hi: 'कैसे भुगतान किया?',
  },
  'emergency.remote_connected': {
    en: 'Are they still connected to your device?',
    bn: 'তারা কি এখনও আপনার ডিভাইসে সংযুক্ত?',
    hi: 'क्या वे अभी भी आपके डिवाइस से जुड़े हैं?',
  },
  'emergency.generating': {
    en: 'Creating your emergency plan...',
    bn: 'আপনার জরুরি পরিকল্পনা তৈরি করা হচ্ছে...',
    hi: 'आपकी आपातकालीन योजना बनाई जा रही है...',
  },
  'emergency.your_plan': {
    en: 'Your Emergency Plan',
    bn: 'আপনার জরুরি পরিকল্পনা',
    hi: 'आपकी आपातकालीन योजना',
  },

  // ─── Scan ──────────────────────────────────────────────────────────────
  'scan.title': {
    en: 'Check a Message',
    bn: 'একটি বার্তা পরীক্ষা করুন',
    hi: 'एक संदेश जांचें',
  },
  'scan.paste': {
    en: 'Paste the suspicious message here...',
    bn: 'সন্দেহজনক বার্তাটি এখানে পেস্ট করুন...',
    hi: 'संदिग्ध संदेश यहां पेस्ट करें...',
  },
  'scan.or': {
    en: 'or upload a screenshot',
    bn: 'অথবা একটি স্ক্রিনশট আপলোড করুন',
    hi: 'या एक स्क्रीनशॉट अपलोड करें',
  },
  'scan.check': {
    en: 'Check Message',
    bn: 'বার্তা পরীক্ষা করুন',
    hi: 'संदेश जांचें',
  },
  'scan.result': {
    en: 'Analysis Result',
    bn: 'বিশ্লেষণ ফলাফল',
    hi: 'विश्लेषण परिणाम',
  },

  // ─── Guardian ──────────────────────────────────────────────────────────
  'guardian.dashboard': {
    en: 'Guardian Dashboard',
    bn: 'গার্ডিয়ান ড্যাশবোর্ড',
    hi: 'गार्डियन डैशबोर्ड',
  },
  'guardian.alerts': {
    en: 'Alerts',
    bn: 'সতর্কতা',
    hi: 'अलर्ट',
  },
  'guardian.no_alerts': {
    en: 'No alerts — your family is safe',
    bn: 'কোনো সতর্কতা নেই — আপনার পরিবার নিরাপদ',
    hi: 'कोई अलर्ट नहीं — आपका परिवार सुरक्षित है',
  },
  'guardian.view_advice': {
    en: 'View Advice',
    bn: 'পরামর্শ দেখুন',
    hi: 'सलाह देखें',
  },
  'guardian.false_alarm': {
    en: 'Mark False Alarm',
    bn: 'ভুল সতর্কতা চিহ্নিত করুন',
    hi: 'गलत अलर्ट चिह्नित करें',
  },

  // ─── Family ────────────────────────────────────────────────────────────
  'family.link': {
    en: 'Link Family',
    bn: 'পরিবার সংযুক্ত করুন',
    hi: 'परिवार जोड़ें',
  },
  'family.create': {
    en: 'Create Family Group',
    bn: 'পারিবারিক গ্রুপ তৈরি করুন',
    hi: 'पारिवारिक समूह बनाएं',
  },
  'family.join': {
    en: 'Join Family Group',
    bn: 'পারিবারিক গ্রুপে যোগ দিন',
    hi: 'पारिवारिक समूह में शामिल हों',
  },
  'family.code': {
    en: 'Enter 6-digit code',
    bn: '৬-সংখ্যার কোড দিন',
    hi: '6-अंकों का कोड दर्ज करें',
  },

  // ─── Timeline ──────────────────────────────────────────────────────────
  'timeline.title': {
    en: 'Incident Timeline',
    bn: 'ঘটনার সময়রেখা',
    hi: 'घटना समयरेखा',
  },
  'timeline.export': {
    en: 'Export Evidence PDF',
    bn: 'প্রমাণ PDF রপ্তানি করুন',
    hi: 'साक्ष्य PDF निर्यात करें',
  },

  // ─── Common ────────────────────────────────────────────────────────────
  'common.next': {
    en: 'Next',
    bn: 'পরবর্তী',
    hi: 'अगला',
  },
  'common.back': {
    en: 'Back',
    bn: 'পিছনে',
    hi: 'पीछे',
  },
  'common.submit': {
    en: 'Submit',
    bn: 'জমা দিন',
    hi: 'जमा करें',
  },
  'common.loading': {
    en: 'Loading...',
    bn: 'লোড হচ্ছে...',
    hi: 'लोड हो रहा है...',
  },
  'common.error': {
    en: 'Something went wrong',
    bn: 'কিছু ভুল হয়েছে',
    hi: 'कुछ गलत हो गया',
  },
  'common.yes': {
    en: 'Yes',
    bn: 'হ্যাঁ',
    hi: 'हाँ',
  },
  'common.no': {
    en: 'No',
    bn: 'না',
    hi: 'नहीं',
  },
  'common.done': {
    en: 'Done',
    bn: 'সম্পন্ন',
    hi: 'हो गया',
  },
  'common.logout': {
    en: 'Sign Out',
    bn: 'সাইন আউট',
    hi: 'साइन आउट',
  },
};

export function t(key: string, lang: LangKey = 'en'): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

export default translations;
