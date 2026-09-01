// utils/examConfig.ts

// --- 1. القوالب البصرية الـ 15 المشتركة ---
export const LAYOUT_TEMPLATES = [
  { id: 'classic', label: 'Classic (التقليدي)', desc: 'توزيع متوازن (يمين، وسط، يسار)' },
  { id: 'ministry', label: 'Ministry (الوزاري)', desc: 'جدول رسمي بإطارات قوية' },
  { id: 'modern', label: 'Modern (العصري)', desc: 'زوايا دائرية وتوزيع مرن' },
  { id: 'minimalist', label: 'Minimalist (البسيط)', desc: 'مساحات بيضاء وخطوط دقيقة' },
  { id: 'boxed', label: 'Boxed (المُؤطَر)', desc: 'صناديق منفصلة لكل قسم' },
  { id: 'elegant', label: 'Elegant (الراقي)', desc: 'خطوط مزدوجة وتوسيط فاخر' },
  { id: 'centered', label: 'Centered (المركزي)', desc: 'كل العناصر مكدسة بمنتصف الصفحة' },
  { id: 'ribbon', label: 'Ribbon (الشريطي)', desc: 'شريط ملون عريض لعنوان الاختبار' },
  { id: 'grid', label: 'Grid (الشبكي)', desc: 'شبكة خلايا منظمة للبيانات' },
  { id: 'split', label: 'Split (المنقسم)', desc: 'تقسيم ثنائي حاد (يمين ويسار)' },
  { id: 'compact', label: 'Compact (المضغوط)', desc: 'توفير أقصى مساحة لورقة الأسئلة' },
  { id: 'underlined', label: 'Underlined (المُسطّر)', desc: 'خطوط سفلية لكل معلومة في الرأس' },
  { id: 'rounded', label: 'Pill/Rounded (الكبسولة)', desc: 'خلفيات بيضاوية ناعمة وعصرية' },
  { id: 'academic', label: 'Academic (الأكاديمي)', desc: 'ترويسة جامعية رسمية' },
  { id: 'bold', label: 'Bold (العريض)', desc: 'تركيز عالي وضخم على العنوان' }
];

// --- 2. خيارات الألوان الموحدة ---
export const COLOR_OPTIONS = [
  { label: 'أسود فحمي', value: '#0f172a' },
  { label: 'زيتوني داكن', value: '#3f4a2e' },
  { label: 'زيتوني أساسي', value: '#4B5320' },
  { label: 'أزرق ملكي', value: '#1e3a8a' },
  { label: 'أزرق بحري', value: '#1A365D' },
  { label: 'أخضر زمردي', value: '#065f46' },
  { label: 'عنابي داكن', value: '#7f1d1d' },
  { label: 'رمادي صلب', value: '#334155' },
  { label: 'أحمر قرمزي', value: '#be123c' },
  { label: 'أزرق سماوي', value: '#0e7490' }
];

// --- 3. خيارات الخطوط (عربي وإنجليزي) ---
export const ARABIC_FONTS = [
  { label: 'العربي التقليدي (Traditional Arabic)', value: 'Traditional Arabic' },
  { label: 'العربي المبسط (Simplified Arabic)', value: 'Simplified Arabic' },
  { label: 'كايرو (Cairo - عصري)', value: 'Cairo' },
  { label: 'تجوال (Tajawal - انسيابي)', value: 'Tajawal' },
  { label: 'أميري (Amiri - للبحوث والكتب)', value: 'Amiri' },
  { label: 'تخطيط العربية (Arabic Typesetting)', value: 'Arabic Typesetting' }
];

export const ENGLISH_FONTS = [
  { label: 'تايمز نيو رومان (Times New Roman - رسمي وزاري)', value: 'Times New Roman' },
  { label: 'أريال (Arial - عصري واضح)', value: 'Arial' },
  { label: 'جورجيا (Georgia - فخم)', value: 'Georgia' },
  { label: 'كاليبري (Calibri - سلس)', value: 'Calibri' },
  { label: 'روبوتو (Roboto)', value: 'Roboto' }
];

// --- 4. خيارات الأحجام والتباعد ---
export const SIZE_OPTIONS = [
  { label: 'صغير جداً (10px)', value: '10px' },
  { label: 'صغير (12px)', value: '12px' },
  { label: 'أساسي (14px)', value: '14px' },
  { label: 'متوسط (15px)', value: '15px' },
  { label: 'كبير (17px)', value: '17px' },
  { label: 'كبير جداً (20px)', value: '20px' },
  { label: 'ضخم (24px)', value: '24px' }
];

export const LINE_SPACING_OPTIONS = [
  { label: 'متراص جداً (1.3)', value: '1.3' },
  { label: 'متراص (1.4)', value: '1.4' },
  { label: 'عادي (1.65)', value: '1.65' },
  { label: 'مريح (1.95)', value: '1.95' },
  { label: 'واسع (2.3)', value: '2.3' },
  { label: 'واسع جداً (2.6)', value: '2.6' }
];

// --- 5. خيارات التظليل والإطارات ---
export const HEADER_SHADING_OPTIONS = [
  { label: 'بدون تظليل (أبيض)', value: 'none' },
  { label: 'تأثير زجاجي فخم', value: 'glass' },
  { label: 'تدرج فخم (Gradient)', value: 'gradient' },
  { label: 'أزرق هادئ', value: 'blue_light' },
  { label: 'رمادي عصري', value: 'gray_light' },
  { label: 'أخضر هادئ', value: 'green_light' }
];

export const BORDER_STYLES_OPTIONS = [
  { label: 'بدون إطار (None)', value: 'none' },
  { label: 'مزدوج رسمي (Double)', value: 'double' },
  { label: 'خط متصل (Solid)', value: 'solid' },
  { label: 'خط منقط (Dashed)', value: 'dashed' },
  { label: 'نقطي دقيق (Dotted)', value: 'dotted' },
  { label: 'ثلاثي الأبعاد غروفي (Groove)', value: 'groove' },
  { label: 'حافة بارزة (Ridge)', value: 'ridge' }
];

export const BORDER_WIDTH_OPTIONS = [
  { label: 'رفيع (2px)', value: '2px' },
  { label: 'متوسط (4px)', value: '4px' },
  { label: 'سميك (6px)', value: '6px' },
  { label: 'عريض جداً (8px)', value: '8px' }
];

// --- 6. خيارات الترقيم والفروع ---
export const SUB_STYLE_OPTIONS = [
  { label: 'حروف أبجدية (أ، ب...) / إنجليزية (a، b...)', value: 'letters' },
  { label: 'أرقام (1، 2...)', value: 'numbers' }
];

export const NUMBERING_STYLE_OPTIONS = [
  { label: 'أرقام إنجليزية/غربية (1, 2, 3)', value: 'western' },
  { label: 'أرقام عربية مشرقية (١، ٢، ٣)', value: 'eastern' }
];

// --- 7. دوال مساعدة عامة ---
export const isColorValue = (val: string) => val && (val.startsWith('#') || val.startsWith('rgba'));

export const formatNum = (num: number | string, style: string = 'eastern') => {
  const strNum = String(num);
  if (style === 'eastern') {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return strNum.replace(/\d/g, (d) => arabicNumbers[parseInt(d, 10)]);
  }
  return strNum; 
};