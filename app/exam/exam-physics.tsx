// app/exam/exam-chemistry.tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

import { useSubscription } from '../../context/SubscriptionContext';

interface QuestionBranch {
  id: string;
  text: string;
  marks: string; 
  color: string;
}

interface QuestionItem {
  id: string;
  questionText: string;
  marks: string; 
  color: string;
  branches: QuestionBranch[];
  imageUri: string | null;
  imageAlign: 'right' | 'center' | 'left';
}

const TEMPLATES_DATA = [
  { id: 1, name: 'الكلاسيكي المزدوج', desc: 'تخطيط شبكي قياسي مع إطار خارجي مزدوج' },
  { id: 2, name: 'الترويسة المجدولة', desc: 'الترويسة موضوعة داخل جدول هندسي صارم' },
  { id: 3, name: 'التخطيط المركزي', desc: 'عناصر الترويسة مرتبة عمودياً في المنتصف' },
  { id: 4, name: 'الحواف الدائرية الواسعة', desc: 'ورقة بإطار دائري كبير (شكل بطاقة)' },
  { id: 5, name: 'الترويسة المنفصلة', desc: 'صندوق مغلق للترويسة مفصول عن الأسئلة' },
  { id: 6, name: 'كبسولات العناوين', desc: 'نصوص الترويسة داخل أشكال بيضوية (كبسولات)' },
  { id: 7, name: 'الإطار الجانبي فقط', desc: 'إطار سميك من اليمين واليسار بدون أعلى وأسفل' },
  { id: 8, name: 'بطاقات الأسئلة', desc: 'كل سؤال موضوع داخل بطاقة (مستطيل) مستقل' },
  { id: 9, name: 'البانر الجانبي العمودي', desc: 'اسم المدرسة مكتوب عمودياً في شريط جانبي' },
  { id: 10, name: 'الترويسة المظللة', desc: 'كتلة الترويسة بالكامل معبأة بلون داكن ونص فاتح' },
  { id: 11, name: 'الخطوط الأفقية (الدفتر)', desc: 'فواصل خطية ممتدة تحت كل جزء من الترويسة' },
  { id: 12, name: 'الزوايا المقطوعة', desc: 'تصميم هندسي بحواف حادة وزوايا غير تقليدية' },
  { id: 13, name: 'الإطار ثلاثي الأبعاد', desc: 'تأثير إطار بارز أو غائر (Outset/Inset)' },
  { id: 14, name: 'التقسيم الثنائي', desc: 'الترويسة مقسمة لعمودين فقط بدل ثلاثة' },
  { id: 15, name: 'ترويسة التذييل', desc: 'نقل جزء من معلومات الترويسة إلى أسفل الورقة' },
];

const COLORS_LIST = [
  { label: 'أسود فحمي', value: '#0f172a' },
  { label: 'رمادي داكن', value: '#334155' },
  { label: 'أزرق ملكي', value: '#1e3a8a' },
  { label: 'أزرق أساسي', value: '#2B6CB0' },
  { label: 'أزرق بحري', value: '#0e7490' },
  { label: 'تركوازي', value: '#008080' },
  { label: 'أخضر داكن', value: '#006400' },
  { label: 'أخضر زمردي', value: '#065f46' },
  { label: 'زيتوني داكن', value: '#3f4a2e' },
  { label: 'زيتوني أساسي', value: '#4B5320' },
  { label: 'بني خشبي', value: '#744210' },
  { label: 'عنابي داكن', value: '#7f1d1d' },
  { label: 'أحمر قرمزي', value: '#be123c' },
  { label: 'بنفسجي داكن', value: '#553C9A' }
];

const CHEMICAL_SYMBOLS = [
  { label: 'سهم تفاعل', value: '→' },
  { label: 'تفاعل انعكاسي', value: '⇌' },
  { label: 'حرارة (Δ)', value: 'Δ' },
  { label: 'غاز (↑)', value: '↑' },
  { label: 'راسب (↓)', value: '↓' },
  { label: 'سيليزية (°C)', value: '°C' },
  { label: 'أس هيدروجيني (pH)', value: 'pH' },
  { label: 'إلكترون (e⁻)', value: 'e⁻' },
  { label: 'أيون موجب (⁺)', value: '⁺' },
  { label: 'أيون سالب (⁻)', value: '⁻' },
  { label: 'تركيز [H⁺]', value: '[H⁺]' }
];

const EQUATION_TEMPLATES = [
  { label: 'تفاعل تعادل حامض وقاعدة', value: 'HCl + NaOH → NaCl + H_2O' },
  { label: 'احتراق الميثان', value: 'CH_4 + 2O_2 → CO_2 + 2H_2O' },
  { label: 'تأين حامض ضعيف', value: 'HA ⇌ H^+ + A^-' },
  { label: 'تكوين الأمونيا (هابر)', value: 'N_2 + 3H_2 ⇌ 2NH_3' },
  { label: 'تفكك كاربونات الكالسيوم', value: 'CaCO_3 →^Δ CaO + CO_2' }
];

export default function ExamChemistryScreen() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [fontFamily, setFontFamily] = useState<string>('Cairo');
  const [fontSize, setFontSize] = useState<string>('14px');
  
  const [headerColor, setHeaderColor] = useState<string>('#0f172a');
  const [primaryColor, setPrimaryColor] = useState<string>('#2B6CB0'); 

  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [schoolName, setSchoolName] = useState<string>('مدرسة النهرين الأهلية');
  const [examTitle, setExamTitle] = useState<string>('امتحان الفصل الدراسي الأول');
  const [academicYear, setAcademicYear] = useState<string>('2025 - 2026');
  const [gradeClass, setGradeClass] = useState<string>('السادس العلمي (الشعبة أ)');
  const [subject, setSubject] = useState<string>('مادة الكيمياء');
  const [duration, setDuration] = useState<string>('ساعتان');

  const [teacherName, setTeacherName] = useState<string>('الأستاذ مصطفى خالد');

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: '1',
      questionText: 'أجب عما يأتي مستعيناً بالمعادلات الكيميائية الموزونة:',
      marks: '10 درجات',
      color: '#0f172a',
      branches: [
        { id: 'b1', text: 'أ) اكتب تفاعل تعادل هيدروكسيد الصوديوم مع حامض الهيدروكلوريك.', marks: '5 درجات', color: '#0f172a' }
      ],
      imageUri: null,
      imageAlign: 'center'
    }
  ]);

  const toggleDropdown = (name: string) => {
    Haptics.selectionAsync();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleAddQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newQ: QuestionItem = {
      id: Date.now().toString(),
      questionText: '',
      marks: '10 درجات',
      color: '#0f172a',
      branches: [{ id: Date.now().toString() + '1', text: 'أ) الفرع الأول...', marks: '10 درجات', color: '#0f172a' }],
      imageUri: null,
      imageAlign: 'center'
    };
    setQuestions([...questions, newQ]);
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      Alert.alert('تنبيه', 'يجب أن تحتوي ورقة الامتحان على سؤال واحد على الأقل.');
      return;
    }
    Alert.alert('حذف السؤال', `هل أنت متأكد من حذف س${qIndex + 1}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          const updated = questions.filter((_, idx) => idx !== qIndex);
          setQuestions(updated);
        }
      }
    ]);
  };

  const handleAddBranch = (qIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...questions];
    const branchLetters = ['أ', 'ب', 'جـ', 'د', 'هـ', 'و', 'ز'];
    const nextLetter = branchLetters[updated[qIndex].branches.length] || '-';
    updated[qIndex].branches.push({
      id: Date.now().toString(),
      text: `${nextLetter}) نص الفرع الجديد...`,
      marks: '',
      color: '#0f172a'
    });
    setQuestions(updated);
  };

  const handleDeleteBranch = (qIndex: number, bIndex: number) => {
    const updated = [...questions];
    updated[qIndex].branches = updated[qIndex].branches.filter((_, idx) => idx !== bIndex);
    setQuestions(updated);
  };

  const handlePickImage = async (qIndex: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const updated = [...questions];
      updated[qIndex].imageUri = result.assets[0].uri;
      setQuestions(updated);
    }
  };

  const handleInsertSymbol = (qIndex: number, symbol: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...questions];
    updated[qIndex].questionText += (updated[qIndex].questionText.endsWith(' ') ? '' : ' ') + symbol + ' ';
    setQuestions(updated);
  };

  const parseFormats = (text: string) => {
    if (!text) return '';
    let parsed = text.replace(
      /([a-zA-Z0-9\.\-\+]+)\^([a-zA-Z0-9\.\-\+Δ]+)/g,
      '<span dir="ltr" style="display: inline-block; unicode-bidi: isolate; direction: ltr;">$1<sup style="font-size: 0.75em; vertical-align: super;">$2</sup></span>'
    );
    parsed = parsed.replace(
      /([a-zA-Z0-9\.\-\+]+)_([a-zA-Z0-9\.\-\+]+)/g,
      '<span dir="ltr" style="display: inline-block; unicode-bidi: isolate; direction: ltr;">$1<sub style="font-size: 0.75em; vertical-align: sub;">$2</sub></span>'
    );
    return parsed;
  };

  const getExamHTML = () => {
    let headerHTML = '';
    if (selectedTemplate === 2) {
      headerHTML = `
        <table class="header-table">
          <tr>
            <td>المدرسة: ${schoolName}</td>
            <td style="text-align:center;"><b>${examTitle}</b></td>
            <td>الصف: ${gradeClass}</td>
          </tr>
          <tr>
            <td>العام الدراسي: <span class="ltr-text">${academicYear}</span></td>
            <td style="text-align:center;">المادة: ${subject}</td>
            <td>الوقت: ${duration}</td>
          </tr>
        </table>
      `;
    } else if (selectedTemplate === 3) {
      headerHTML = `
        <div class="header-centered">
          <h2>${schoolName}</h2>
          <h1>${examTitle}</h1>
          <p>المادة: ${subject} | الصف: ${gradeClass} | الوقت: ${duration} | العام الدراسي: <span class="ltr-text">${academicYear}</span></p>
        </div>
      `;
    } else if (selectedTemplate === 14) {
      headerHTML = `
        <div class="header-split">
          <div style="width: 50%;">
            <h3>${schoolName}</h3>
            <p>المادة: ${subject}<br>الصف: ${gradeClass}</p>
          </div>
          <div style="width: 50%; text-align: left;">
            <h3>${examTitle}</h3>
            <p>العام الدراسي: <span class="ltr-text">${academicYear}</span><br>الوقت: ${duration}</p>
          </div>
        </div>
      `;
    } else {
      headerHTML = `
        <div class="header-grid">
          <div class="header-right">
            ${selectedTemplate === 6 ? `<div class="capsule-box">${schoolName}</div>` : schoolName}
          </div>
          <div class="header-center">
            ${selectedTemplate === 6 ? `<div class="capsule-box">${examTitle}</div>` : `<h1>${examTitle}</h1>`}
            <p>العام الدراسي: <span class="ltr-text">${academicYear}</span></p>
          </div>
          <div class="header-left">
            <div>الصف: ${gradeClass}</div>
            <div>المادة: ${subject}</div>
            <div>الوقت: ${duration}</div>
          </div>
        </div>
      `;
    }

    const questionsHTML = questions.map((q, idx) => `
      <div class="question-block" style="color: ${q.color};">
        <div class="question-title">
          <span>س${idx + 1}: <span>${parseFormats(q.questionText)}</span></span>
          ${q.marks ? `<span class="marks-text">(${q.marks})</span>` : ''}
        </div>
        ${q.imageUri ? `
          <div class="image-container" style="text-align: ${q.imageAlign};">
            <img src="${q.imageUri}" class="question-img" />
          </div>
        ` : ''}
        <div style="margin-top: 5px;">
          ${q.branches.map(b => `
            <div class="branch-item" style="color: ${b.color};">
              <span>${parseFormats(b.text)}</span>
              ${b.marks ? `<span class="branch-marks">(${b.marks})</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { 
            font-family: '${fontFamily}', sans-serif; 
            font-size: ${fontSize}; 
            margin: 0; 
            padding: 0; 
            color: #0f172a; 
            background-color: #fff;
          }
          
          .page-container {
            width: 190mm; 
            min-height: 277mm; 
            box-sizing: border-box;
            position: relative;
            margin: 0 auto;
            padding: ${selectedTemplate === 9 ? '0' : '22px'};
            ${selectedTemplate === 1 ? 'border: 4px double #0f172a;' : ''}
            ${selectedTemplate === 4 ? 'border: 3px solid #0f172a; border-radius: 40px;' : ''}
            ${selectedTemplate === 7 ? 'border-right: 6px solid #0f172a; border-left: 6px solid #0f172a; padding-top: 40px;' : ''}
            ${selectedTemplate === 12 ? 'border: 2px solid #0f172a; border-radius: 0 40px 0 40px;' : ''}
            ${selectedTemplate === 13 ? 'border: 5px outset #888;' : ''}
            ${selectedTemplate === 9 ? 'display: flex; border: 2px solid #0f172a;' : 'border: 1px solid #cbd5e1;'}
            overflow: hidden;
          }

          .side-banner { width: 40px; background-color: ${primaryColor}; color: white; writing-mode: vertical-rl; text-align: center; font-size: 20px; font-weight: bold; padding: 20px 0; z-index: 1; }
          .main-content { flex: 1; padding: 20px; z-index: 1; }
          .header-grid, .header-table, .header-centered, .header-split { color: ${headerColor}; z-index: 1; position: relative; }
          .header-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; ${selectedTemplate === 5 ? 'border: 2px solid #0f172a; padding: 15px; border-radius: 8px;' : ''} ${selectedTemplate === 10 ? `background-color: ${primaryColor}; color: white; padding: 20px; border-radius: 10px;` : ''} ${selectedTemplate === 11 ? 'border-bottom: 2px solid #0f172a; padding-bottom: 10px;' : ''} ${(selectedTemplate !== 5 && selectedTemplate !== 10 && selectedTemplate !== 11) ? 'border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;' : ''} }
          .header-split { display:flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; }
          .header-right { text-align: right; width: 33%; font-weight: bold; font-size: 16px; }
          .header-center { text-align: center; width: 34%; }
          .header-center h1 { font-size: 15px; margin: 0 0 5px 0; font-weight: bold; }
          .header-center p { font-size: 12px; margin: 0; }
          .header-left { text-align: left; width: 33%; font-size: 11px; line-height: 1.5; font-weight: bold; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { border: 1px solid #0f172a; padding: 10px; font-size: 12px; font-weight: bold; }
          .header-centered { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .header-centered h2 { margin: 0 0 5px 0; font-size: 18px; }
          .header-centered h1 { margin: 0 0 10px 0; font-size: 16px; }
          .header-centered p { margin: 0; font-size: 12px; font-weight: bold; }
          .capsule-box { border: 2px solid ${headerColor}; padding: 5px 15px; border-radius: 30px; display: inline-block; }
          .question-block { margin-bottom: 18px; z-index: 1; position: relative; ${selectedTemplate === 8 ? 'border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background-color: rgba(250,250,250,0.8);' : ''} ${selectedTemplate === 11 ? 'border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;' : ''} }
          .question-title { font-weight: bold; margin-bottom: 6px; display: flex; justify-content: space-between; font-size: 1.05em; }
          .marks-text { font-weight: normal; font-size: 0.9em; opacity: 0.8; }
          .branch-item { margin-right: 15px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
          .branch-marks { font-size: 0.85em; opacity: 0.8; }
          .image-container { margin: 8px 0; }
          .question-img { max-width: 150px; max-height: 120px; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 6px; }
          .ltr-text { direction: ltr; unicode-bidi: embed; display: inline-block; }
          .footer { position: absolute; bottom: 15px; left: 20px; right: 20px; display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 12px; font-weight: bold; color: ${headerColor}; z-index: 1; }
        </style>
      </head>
      <body>
        <div class="page-container">
          ${selectedTemplate === 9 ? `
            <div class="side-banner">${schoolName}</div>
            <div class="main-content">
              <div class="header-grid">
                <div class="header-right"></div>
                <div class="header-center">
                  <h1>${examTitle}</h1>
                  <p>العام الدراسي: <span class="ltr-text">${academicYear}</span></p>
                </div>
                <div class="header-left">
                  <div>الصف: ${gradeClass}</div>
                  <div>المادة: ${subject}</div>
                  <div>الوقت: ${duration}</div>
                </div>
              </div>
              <div style="margin-top: 15px;">${questionsHTML}</div>
            </div>
          ` : `
            ${headerHTML}
            <div style="margin-top: 15px;">${questionsHTML}</div>
          `}

          <div class="footer">
            ${selectedTemplate === 15 ? `<span>الصف: ${gradeClass} | المادة: ${subject}</span>` : '<span></span>'}
            <span>إعداد المدرس: ${teacherName}</span>
          </div>
          
          ${getWatermarkHTML()}
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    const canPrint = await handleExportAttempt();
    if (!canPrint) return;

    setIsPrinting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const htmlContent = getExamHTML();
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('Print Error:', error);
      Alert.alert('خطأ', 'تعذرت عملية الطباعة.');
    } finally {
      setIsPrinting(false);
    }
  };

  const currentTemplateObj = TEMPLATES_DATA.find(t => t.id === selectedTemplate) || TEMPLATES_DATA[0];

  const renderTemplateWireframe = (id: number) => {
    let containerStyle: any = { width: 34, height: 42, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(43, 108, 176, 0.5)', padding: 2, overflow: 'hidden' };
    if (id === 1) containerStyle.borderWidth = 2;
    if (id === 4) containerStyle.borderRadius = 8;
    if (id === 7) { containerStyle.borderTopWidth = 0; containerStyle.borderBottomWidth = 0; containerStyle.borderLeftWidth = 2; containerStyle.borderRightWidth = 2; }
    if (id === 12) { containerStyle.borderTopRightRadius = 10; containerStyle.borderBottomLeftRadius = 10; }

    return (
      <View style={[styles.templateThumbPreview, containerStyle]}>
         <View style={{ marginTop: 6, flex: 1, paddingRight: id === 9 ? 6 : 0 }}>
           <View style={{ width: '90%', height: 2, backgroundColor: '#cbd5e1', marginBottom: 3 }}/>
           <View style={{ width: '70%', height: 2, backgroundColor: '#cbd5e1' }}/>
        </View>
      </View>
    );
  };

  const renderUniversalDropdown = (
    keyName: string, label: string, currentValueText: string, 
    itemsList: { label: string; value: any; desc?: string }[], 
    onSelect: (val: any) => void, isTemplateList: boolean = false
  ) => {
    const isOpen = activeDropdown === keyName;
    return (
      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.glassToggle} onPress={() => toggleDropdown(keyName)} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {isTemplateList && renderTemplateWireframe(selectedTemplate)}
            <View style={{ alignItems: 'flex-end', flex: 1, marginRight: isTemplateList ? 10 : 0 }}>
              <Text style={styles.glassToggleText}>{currentValueText}</Text>
              {isTemplateList && <Text style={styles.dropdownSubText}>{currentTemplateObj.desc}</Text>}
            </View>
            <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#2B6CB0" />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.glassDropdownContainer}>
            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 280 }} showsVerticalScrollIndicator={true}>
              {itemsList.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.glassDropdownItem, currentValueText.includes(item.label) && styles.glassItemActive]}
                  onPress={() => { onSelect(item.value); setActiveDropdown(null); Haptics.selectionAsync(); }}
                  activeOpacity={0.7}
                >
                  {isTemplateList && renderTemplateWireframe(item.value)}
                  <View style={{ alignItems: 'flex-end', flex: 1, marginRight: isTemplateList ? 10 : 0 }}>
                    <Text style={[styles.glassItemText, currentValueText.includes(item.label) && styles.glassItemTextActive]}>
                      {item.label}
                    </Text>
                    {item.desc && <Text style={styles.dropdownItemDesc}>{item.desc}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderCompactColorDropdown = (dropdownKey: string, currentValue: string, onSelect: (val: string) => void) => {
    const isOpen = activeDropdown === dropdownKey;
    const selectedColorObj = COLORS_LIST.find(c => c.value === currentValue) || COLORS_LIST[0];
    
    return (
      <View style={{ marginBottom: 0 }}>
        <TouchableOpacity 
          style={styles.colorPillTrigger} 
          onPress={() => toggleDropdown(dropdownKey)} 
          activeOpacity={0.8}
        >
          <View style={[styles.colorDotIndicator, { backgroundColor: selectedColorObj.value }]} />
          <Text style={styles.colorPillText} numberOfLines={1}>{selectedColorObj.label}</Text>
          <Ionicons name="chevron-down" size={12} color="#64748b" />
        </TouchableOpacity>

        <Modal 
          visible={isOpen} 
          transparent={true} 
          animationType="fade" 
          onRequestClose={() => setActiveDropdown(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setActiveDropdown(null)}
          >
            <View style={styles.colorModalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>اختيار لون النص</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)} style={styles.closeIconBtn} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                <View style={styles.colorGridContainer}>
                  {COLORS_LIST.map((c) => {
                    const isSelected = c.value === currentValue;
                    return (
                      <TouchableOpacity 
                        key={c.value} 
                        style={[styles.colorGridItem, isSelected && styles.colorGridItemSelected]} 
                        onPress={() => {
                          Haptics.selectionAsync();
                          onSelect(c.value);
                          setActiveDropdown(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.colorSwatchCircle, { backgroundColor: c.value }]} />
                        <Text style={[styles.colorItemLabel, isSelected && styles.colorItemLabelSelected]}>{c.label}</Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={16} color="#2B6CB0" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7f6" />
      
      <View style={styles.topNavRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={22} color="#4B5320" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>صانع ورقة امتحان الكيمياء</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <BlurView intensity={40} tint="light" style={styles.glassSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="grid-outline" size={18} color="#2B6CB0" />
            </View>
            <Text style={styles.sectionTitle}>1. اختيار قالب التخطيط البصري</Text>
          </View>
          {renderUniversalDropdown(
            'template',
            'التخطيط النشط:',
            `نموذج (${selectedTemplate}): ${currentTemplateObj.name}`,
            TEMPLATES_DATA.map(t => ({ label: `${t.id}. ${t.name}`, value: t.id, desc: t.desc })),
            (val) => setSelectedTemplate(val),
            true
          )}
        </BlurView>

        <BlurView intensity={40} tint="light" style={styles.glassSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="text-outline" size={18} color="#2B6CB0" />
            </View>
            <Text style={styles.sectionTitle}>2. إعدادات الخطوط ولون الرأس</Text>
          </View>
          {renderUniversalDropdown(
            'fontFamily',
            'نوع الخط:',
            fontFamily,
            ['Cairo', 'Amiri', 'Tajawal', 'Almarai', 'Changa', 'Reem Kufi', 'Arial', 'Times New Roman'].map(f => ({ label: f, value: f })),
            (val) => setFontFamily(val)
          )}
          {renderUniversalDropdown(
            'fontSize',
            'حجم الخط:',
            fontSize,
            ['12px', '13px', '14px', '15px', '16px', '18px'].map(s => ({ label: s, value: s })),
            (val) => setFontSize(val)
          )}
          
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>لون الترويسة (الرأس):</Text>
            {renderCompactColorDropdown('headerColor', headerColor, setHeaderColor)}
          </View>
        </BlurView>

        <BlurView intensity={40} tint="light" style={styles.glassSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={18} color="#2B6CB0" />
            </View>
            <Text style={styles.sectionTitle}>3. بيانات الترويسة والذيل</Text>
          </View>
          
          <Text style={styles.label}>اسم المدرسة (اليمين):</Text>
          <TextInput style={styles.glassInput} value={schoolName} onChangeText={setSchoolName} placeholderTextColor="#94a3b8" />
          
          <View style={styles.rowContainer}>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.label}>عنوان الامتحان:</Text>
              <TextInput style={styles.glassInput} value={examTitle} onChangeText={setExamTitle} placeholderTextColor="#94a3b8" />
            </View>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.label}>السنة الدراسية:</Text>
              <TextInput style={styles.glassInput} value={academicYear} onChangeText={setAcademicYear} placeholderTextColor="#94a3b8" />
            </View>
          </View>

          <Text style={styles.label}>الصف / الشعبة (اليسار):</Text>
          <TextInput style={styles.glassInput} value={gradeClass} onChangeText={setGradeClass} placeholderTextColor="#94a3b8" />

          <View style={styles.rowContainer}>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.label}>المادة:</Text>
              <TextInput style={styles.glassInput} value={subject} onChangeText={setSubject} placeholderTextColor="#94a3b8" />
            </View>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.label}>الوقت:</Text>
              <TextInput style={styles.glassInput} value={duration} onChangeText={setDuration} placeholderTextColor="#94a3b8" />
            </View>
          </View>

          <Text style={styles.label}>اسم الأستاذ في الذيل:</Text>
          <TextInput style={styles.glassInput} value={teacherName} onChangeText={setTeacherName} placeholderTextColor="#94a3b8" />
        </BlurView>

        <BlurView intensity={40} tint="light" style={styles.glassSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="flask-outline" size={18} color="#2B6CB0" />
            </View>
            <Text style={styles.sectionTitle}>4. إدارة الأسئلة والصيغ الكيميائية المتقدمة</Text>
          </View>
          
          <View style={styles.instructionBox}>
            <Ionicons name="information-circle-outline" size={16} color="#065f46" style={{ marginLeft: 6 }} />
            <Text style={styles.instructionText}>
              💡 لكتابة الأسس العلوية استخدم ( ^ ) مثل 10^5 أو Na^+ وللأرقام السفلية استخدم ( _ ) مثل H_2O.
            </Text>
          </View>

          {questions.map((q, qIndex) => (
            <View key={q.id} style={styles.questionCard}>
              
              <View style={styles.questionHeaderBar}>
                <View style={styles.questionBadgeContainer}>
                  <View style={styles.questionNumberBadge}>
                    <Text style={styles.questionNumberBadgeText}>س{qIndex + 1}</Text>
                  </View>
                  <Text style={styles.questionBadgeLabel}>تفاصيل وإعدادات السؤال</Text>
                </View>

                {questions.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => handleDeleteQuestion(qIndex)} 
                    style={styles.deleteQuestionBtn} 
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.rowContainer, { marginBottom: 10, alignItems: 'center' }]}>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>درجة السؤال:</Text>
                  <TextInput 
                    style={[styles.glassInput, { marginBottom: 0, textAlign: 'center', minHeight: 46 }]} 
                    value={q.marks} 
                    placeholder="10 درجات" 
                    placeholderTextColor="#94a3b8" 
                    onChangeText={(text) => {
                      const updated = [...questions];
                      updated[qIndex].marks = text;
                      setQuestions(updated);
                    }} 
                  />
                </View>

                <View style={{ flex: 1.3 }}>
                  <Text style={styles.label}>لون خط السؤال:</Text>
                  {renderCompactColorDropdown(`q_col_${q.id}`, q.color, (val) => {
                    const updated = [...questions];
                    updated[qIndex].color = val;
                    setQuestions(updated);
                  })}
                </View>
              </View>

              <View style={styles.questionInputLabelRow}>
                <Text style={styles.label}>نص السؤال (س{qIndex + 1}):</Text>
                <View style={styles.swipeHintBadge}>
                  <Ionicons name="swap-horizontal" size={14} color="#0284c7" />
                  <Text style={styles.swipeHintText}>يمكن التمرير أفقياً</Text>
                </View>
              </View>

              <View style={styles.horizontalScrollOuterContainer}>
                <ScrollView 
                  horizontal 
                  nestedScrollEnabled={true} 
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={styles.horizontalScrollContent}
                  style={styles.horizontalScrollView}
                >
                  <TextInput 
                    style={styles.questionLargeTextArea} 
                    value={q.questionText} 
                    multiline={true} 
                    textAlignVertical="top" 
                    placeholder={`اكتب نص السؤال س{qIndex + 1} هنا والمعادلات الكيميائية...`} 
                    placeholderTextColor="#94a3b8" 
                    onChangeText={(text) => {
                      const updated = [...questions];
                      updated[qIndex].questionText = text;
                      setQuestions(updated);
                    }} 
                  />
                </ScrollView>
              </View>

              <Text style={styles.subLabel}>🔣 رموز كيميائية سريعة لإدراجها في س{qIndex + 1}:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {CHEMICAL_SYMBOLS.map((sym, sIdx) => (
                  <TouchableOpacity 
                    key={sIdx} 
                    style={styles.chemChip} 
                    onPress={() => handleInsertSymbol(qIndex, sym.value)} 
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chemChipText}>{sym.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.subLabel}>⚗️ معادلات شائعة جاهزة:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {EQUATION_TEMPLATES.map((eq, eIdx) => (
                  <TouchableOpacity 
                    key={eIdx} 
                    style={[styles.chemChip, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]} 
                    onPress={() => handleInsertSymbol(qIndex, eq.value)} 
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chemChipText, { color: '#1e40af' }]}>{eq.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.imageConfigRow}>
                <TouchableOpacity style={styles.imagePickBtn} onPress={() => handlePickImage(qIndex)} activeOpacity={0.8}>
                  <Ionicons name="image-outline" size={16} color="#fff" style={{ marginLeft: 6 }} />
                  <Text style={styles.imagePickBtnText}>{q.imageUri ? 'تغيير الصورة' : 'إدراج صورة توضيحية'}</Text>
                </TouchableOpacity>

                {q.imageUri && (
                  <View style={styles.alignContainer}>
                    {(['right', 'center', 'left'] as const).map((align) => (
                      <TouchableOpacity 
                        key={align} 
                        style={[styles.alignBtn, q.imageAlign === align && styles.alignBtnActive]} 
                        onPress={() => {
                          Haptics.selectionAsync();
                          const updated = [...questions];
                          updated[qIndex].imageAlign = align;
                          setQuestions(updated);
                        }} 
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.alignText, q.imageAlign === align && styles.alignTextActive]}>
                          {align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'يسار'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {q.imageUri && (
                <View style={{ alignItems: 'center', marginVertical: 8 }}>
                  <Image source={{ uri: q.imageUri }} style={{ width: 90, height: 70, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' }} />
                </View>
              )}

              <Text style={styles.subLabel}>الأفرع الداخلية لسؤال (س{qIndex + 1}):</Text>
              {q.branches.map((branch, bIndex) => (
                <View key={branch.id} style={styles.branchContainerCard}>
                  <View style={[styles.rowContainer, { marginBottom: 6 }]}>
                    <View style={{ flex: 2.3, marginLeft: 6 }}>
                      <TextInput 
                        style={[styles.glassInput, { backgroundColor: '#fff', marginBottom: 0 }]} 
                        value={branch.text} 
                        placeholder="نص الفرع..." 
                        placeholderTextColor="#94a3b8" 
                        onChangeText={(text) => {
                          const updated = [...questions];
                          updated[qIndex].branches[bIndex].text = text;
                          setQuestions(updated);
                        }} 
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 6 }}>
                      <TextInput 
                        style={[styles.glassInput, { backgroundColor: '#fff', marginBottom: 0, textAlign: 'center' }]} 
                        value={branch.marks} 
                        placeholder="الدرجة" 
                        placeholderTextColor="#94a3b8" 
                        onChangeText={(text) => {
                          const updated = [...questions];
                          updated[qIndex].branches[bIndex].marks = text;
                          setQuestions(updated);
                        }} 
                      />
                    </View>
                    <View style={{ flex: 1.3 }}>
                      {renderCompactColorDropdown(`b_col_${branch.id}`, branch.color, (val) => {
                        const updated = [...questions];
                        updated[qIndex].branches[bIndex].color = val;
                        setQuestions(updated);
                      })}
                    </View>
                  </View>

                  {q.branches.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => handleDeleteBranch(qIndex, bIndex)} 
                      style={styles.deleteBranchTextBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={14} color="#ef4444" />
                      <Text style={styles.deleteBranchText}>حذف هذا الفرع</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addBranchBtn} onPress={() => handleAddBranch(qIndex)} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={16} color="#4B5320" style={{ marginLeft: 6 }} />
                <Text style={styles.addBranchBtnText}>إضافة فرع إضافي لـ (س{qIndex + 1})</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addQuestionBtn} onPress={handleAddQuestion} activeOpacity={0.85}>
            <Ionicons name="add-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
            <Text style={styles.addQuestionBtnText}>إضافة سؤال جديد (س{questions.length + 1})</Text>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>

      {/* شريط الإجراءات العائم السفلي بدون زر التصدير */}
      <View style={styles.floatingDockContainer}>
        <BlurView intensity={80} tint="light" style={styles.floatingDock}>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsPreviewVisible(true); }} style={styles.dockBtn} activeOpacity={0.7}>
            <View style={[styles.dockIconBg, { backgroundColor: 'rgba(43, 108, 176, 0.1)' }]}>
              <Ionicons name="eye-outline" size={20} color="#2B6CB0" />
            </View>
            <Text style={[styles.dockBtnText, { color: '#2B6CB0' }]} numberOfLines={1}>معاينة الورقة</Text>
          </TouchableOpacity>
          
          <View style={styles.dockDivider} />

          <TouchableOpacity onPress={handlePrint} style={styles.dockBtn} disabled={isPrinting} activeOpacity={0.7}>
            <View style={[styles.dockIconBg, { backgroundColor: 'rgba(43, 108, 176, 0.1)' }]}>
              {isPrinting ? (
                <ActivityIndicator color="#2B6CB0" size="small" />
              ) : (
                <Ionicons name="print-outline" size={20} color="#2B6CB0" />
              )}
            </View>
            <Text style={[styles.dockBtnText, { color: '#2B6CB0' }]} numberOfLines={1}>طباعة الورقة</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      <Modal visible={isPreviewVisible} animationType="slide" onRequestClose={() => setIsPreviewVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsPreviewVisible(false)} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>إغلاق المعاينة</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>معاينة امتحان الكيمياء</Text>
          </View>
          <WebView source={{ html: getExamHTML() }} style={{ flex: 1 }} originWhitelist={['*']} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ---------------- STYLES ---------------- //
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7f6' },
  container: { padding: 16, paddingBottom: 110 },
  
  topNavRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(75, 83, 32, 0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  mainTitle: { fontSize: 17, fontWeight: '900', color: '#1e293b' },
  
  glassSection: { borderRadius: 20, padding: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(43, 108, 176, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.85)' },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 14 },
  iconContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(43, 108, 176, 0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
  
  dropdownWrapper: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 6, textAlign: 'right' },
  
  glassToggle: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  glassToggleText: { fontSize: 13, color: '#1e293b', fontWeight: '800', textAlign: 'right' },
  dropdownSubText: { fontSize: 11, color: '#64748b', marginTop: 3, textAlign: 'right' },
  
  glassDropdownContainer: { backgroundColor: '#fff', borderRadius: 12, marginTop: 6, borderWidth: 1, borderColor: '#cbd5e1', overflow: 'hidden', elevation: 3 },
  glassDropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row-reverse', alignItems: 'center' },
  glassItemActive: { backgroundColor: '#eff6ff' },
  glassItemText: { fontSize: 13, color: '#334155', fontWeight: '700' },
  glassItemTextActive: { color: '#2B6CB0', fontWeight: '900' },
  dropdownItemDesc: { fontSize: 11, color: '#94a3b8', marginTop: 3, textAlign: 'right' },

  colorPillTrigger: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 10, 
    minHeight: 46 
  },
  colorDotIndicator: { width: 15, height: 15, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', marginLeft: 6 },
  colorPillText: { fontSize: 11, color: '#1e293b', fontWeight: '800', flex: 1, textAlign: 'right' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  colorModalCard: { width: '100%', maxWidth: 360, backgroundColor: '#ffffff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  closeIconBtn: { padding: 6, borderRadius: 10, backgroundColor: '#f1f5f9' },
  colorGridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginTop: 10 },
  colorGridItem: { width: '48%', flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f8fafc', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'space-between' },
  colorGridItemSelected: { backgroundColor: '#eff6ff', borderColor: '#2B6CB0' },
  colorSwatchCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  colorItemLabel: { fontSize: 12, fontWeight: '700', color: '#334155', flex: 1, textAlign: 'right', marginRight: 8 },
  colorItemLabelSelected: { color: '#2B6CB0', fontWeight: '900' },
  
  instructionBox: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#d1e7dd', padding: 10, borderRadius: 10, marginBottom: 14 },
  instructionText: { fontSize: 11, color: '#065f46', textAlign: 'right', fontWeight: '700', flex: 1 },
  
  chipsScroll: { flexDirection: 'row-reverse', gap: 6, marginBottom: 12, paddingVertical: 2 },
  chemChip: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, justifyContent: 'center', alignItems: 'center' },
  chemChipText: { fontSize: 12, fontWeight: '800', color: '#334155' },

  glassInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 12, textAlign: 'right', fontSize: 13, color: '#0f172a', fontWeight: '700' },
  
  rowContainer: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  
  questionCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  
  questionHeaderBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10, marginBottom: 12 },
  questionBadgeContainer: { flexDirection: 'row-reverse', alignItems: 'center' },
  questionNumberBadge: { backgroundColor: '#2B6CB0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  questionNumberBadgeText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  questionBadgeLabel: { fontSize: 13, fontWeight: '800', color: '#334155' },
  deleteQuestionBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },

  questionInputLabelRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  swipeHintBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  swipeHintText: { fontSize: 10, fontWeight: '800', color: '#0369a1' },

  horizontalScrollOuterContainer: { width: '100%', marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff', overflow: 'hidden' },
  horizontalScrollView: { width: '100%' },
  horizontalScrollContent: { minWidth: '100%', padding: 4 },
  questionLargeTextArea: { minWidth: 540, minHeight: 90, padding: 10, fontSize: 14, color: '#0f172a', fontWeight: '700', textAlign: 'right', textAlignVertical: 'top' },

  subLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 6, textAlign: 'right' },
  
  imageConfigRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  imagePickBtn: { backgroundColor: '#2B6CB0', borderRadius: 10, padding: 10, flex: 1, marginLeft: 10, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center' },
  imagePickBtnText: { color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: '800' },
  
  alignContainer: { flexDirection: 'row-reverse', flex: 2, justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 10, padding: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  alignBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  alignBtnActive: { backgroundColor: '#2B6CB0' },
  alignText: { fontSize: 11, color: '#64748b', fontWeight: '800' },
  alignTextActive: { color: '#fff' },
  
  templateThumbPreview: { justifyContent: 'flex-start', alignItems: 'center', borderRadius: 6 },
  
  branchContainerCard: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 12, marginBottom: 8 },
  deleteBranchTextBtn: { flexDirection: 'row-reverse', alignItems: 'center', alignSelf: 'flex-start', marginTop: 4, gap: 4 },
  deleteBranchText: { fontSize: 11, color: '#ef4444', fontWeight: '700' },

  addBranchBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginTop: 4, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center' },
  addBranchBtnText: { color: '#475569', textAlign: 'center', fontSize: 12, fontWeight: '800' },
  
  addQuestionBtn: { backgroundColor: '#2B6CB0', borderRadius: 14, padding: 14, marginTop: 8, alignItems: 'center', flexDirection: 'row-reverse', justifyContent: 'center', elevation: 2 },
  addQuestionBtnText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  
  floatingDockContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 25 : 15, left: 16, right: 16, alignItems: 'center', justifyContent: 'center' },
  floatingDock: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 24, overflow: 'hidden', padding: 8, borderWidth: 1, borderColor: 'rgba(43, 108, 176, 0.2)', width: '100%', maxWidth: 380, backgroundColor: 'rgba(255, 255, 255, 0.9)' },
  dockBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 },
  dockIconBg: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  dockBtnText: { fontSize: 13, fontWeight: '900' },
  dockDivider: { width: 1, height: '60%', backgroundColor: 'rgba(0, 0, 0, 0.1)' },
  
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
  closeBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  closeBtnText: { color: '#475569', fontWeight: '800', fontSize: 13 }
});