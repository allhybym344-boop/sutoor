// app/exam/exam-chemistry.tsx
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSubscription } from '../context/SubscriptionContext';

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
  { label: 'أسود', value: '#000000' },
  { label: 'رمادي داكن', value: '#333333' },
  { label: 'أزرق بحري', value: '#1A365D' },
  { label: 'أزرق فاتح', value: '#2B6CB0' },
  { label: 'كحلي', value: '#000080' },
  { label: 'تركوازي', value: '#008080' },
  { label: 'أخضر داكن', value: '#006400' },
  { label: 'أخضر عشبي', value: '#276749' },
  { label: 'زيتي', value: '#808000' },
  { label: 'بني خشبي', value: '#744210' },
  { label: 'أحمر داكن', value: '#8B0000' },
  { label: 'قرمزي', value: '#C53030' },
  { label: 'أرجواني', value: '#702459' },
  { label: 'بنفسجي', value: '#553C9A' },
  { label: 'كحلي رمادي', value: '#2D3748' }
];

const CHEMICAL_SYMBOLS = [
  { label: 'سهم تفاعل', value: '→' },
  { label: 'تفاعل انعكاسي', value: '⇌' },
  { label: 'حرارة (دلتا)', value: 'Δ' },
  { label: 'غاز متصاعد', value: '↑' },
  { label: 'راسب', value: '↓' },
  { label: 'درجة سيليزية', value: '°C' },
  { label: 'أس هيدروجيني', value: 'pH' },
  { label: 'إلكترون', value: 'e⁻' },
  { label: 'أيون موجب', value: '⁺' },
  { label: 'أيون سالب', value: '⁻' },
  { label: 'تركيز أيون الهيدروجين', value: '[H⁺]' }
];

const EQUATION_TEMPLATES = [
  { label: 'تفاعل تعادل', value: 'HCl + NaOH → NaCl + H_2O' },
  { label: 'تفاعل احتراق الميثان', value: 'CH_4 + 2O_2 → CO_2 + 2H_2O' },
  { label: 'تأين حامض ضعيف', value: 'HA ⇌ H^+ + A^-' },
  { label: 'تفاعل تكوين الأمونيا', value: 'N_2 + 3H_2 ⇌ 2NH_3' },
  { label: 'تفكك كاربونات الكالسيوم', value: 'CaCO_3 →^Δ CaO + CO_2' }
];

export default function ExamChemistryScreen() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);

  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [fontFamily, setFontFamily] = useState<string>('Cairo');
  const [fontSize, setFontSize] = useState<string>('14px');
  
  const [headerColor, setHeaderColor] = useState<string>('#000000');
  const [primaryColor, setPrimaryColor] = useState<string>('#2B6CB0'); 

  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
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
      color: '#000000',
      branches: [
        { id: 'b1', text: 'أ) اكتب تفاعل تعادل هيدروكسيد الصوديوم.', marks: '5 درجات', color: '#000000' }
      ],
      imageUri: null,
      imageAlign: 'center'
    }
  ]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleAddQuestion = () => {
    const newQ: QuestionItem = {
      id: Date.now().toString(),
      questionText: 'سؤال جديد...',
      marks: '10 درجات',
      color: '#000000',
      branches: [{ id: Date.now().toString() + '1', text: 'أ) الفرع الأول...', marks: '10 درجات', color: '#000000' }],
      imageUri: null,
      imageAlign: 'center'
    };
    setQuestions([...questions, newQ]);
  };

  const handleAddBranch = (qIndex: number) => {
    const updated = [...questions];
    const branchLetters = ['أ', 'ب', 'جـ', 'د', 'هـ', 'و', 'ز'];
    const nextLetter = branchLetters[updated[qIndex].branches.length] || '-';
    updated[qIndex].branches.push({
      id: Date.now().toString(),
      text: `${nextLetter}) نص الفرع الجديد...`,
      marks: '',
      color: '#000000'
    });
    setQuestions(updated);
  };

  const handlePickImage = async (qIndex: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const updated = [...questions];
      updated[qIndex].imageUri = result.assets[0].uri;
      setQuestions(updated);
    }
  };

  const handleInsertSymbol = (qIndex: number, symbol: string) => {
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
          <span>السؤال ${idx + 1}: <span>${parseFormats(q.questionText)}</span></span>
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
            color: #000; 
            background-color: #fff;
          }
          
          .page-container {
            width: 190mm; 
            min-height: 277mm; 
            box-sizing: border-box;
            position: relative;
            margin: 0 auto;
            padding: ${selectedTemplate === 9 ? '0' : '22px'};
            ${selectedTemplate === 1 ? 'border: 4px double #000;' : ''}
            ${selectedTemplate === 4 ? 'border: 3px solid #000; border-radius: 40px;' : ''}
            ${selectedTemplate === 7 ? 'border-right: 6px solid #000; border-left: 6px solid #000; padding-top: 40px;' : ''}
            ${selectedTemplate === 12 ? 'border: 2px solid #000; border-radius: 0 40px 0 40px;' : ''}
            ${selectedTemplate === 13 ? 'border: 5px outset #888;' : ''}
            ${selectedTemplate === 9 ? 'display: flex; border: 2px solid #000;' : 'border: 1px solid #000;'}
            overflow: hidden;
          }

          .side-banner { width: 40px; background-color: ${primaryColor}; color: white; writing-mode: vertical-rl; text-align: center; font-size: 20px; font-weight: bold; padding: 20px 0; z-index: 1; }
          .main-content { flex: 1; padding: 20px; z-index: 1; }
          .header-grid, .header-table, .header-centered, .header-split { color: ${headerColor}; z-index: 1; position: relative; }
          .header-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; ${selectedTemplate === 5 ? 'border: 2px solid #000; padding: 15px; border-radius: 8px;' : ''} ${selectedTemplate === 10 ? `background-color: ${primaryColor}; color: white; padding: 20px; border-radius: 10px;` : ''} ${selectedTemplate === 11 ? 'border-bottom: 2px solid #000; padding-bottom: 10px;' : ''} ${(selectedTemplate !== 5 && selectedTemplate !== 10 && selectedTemplate !== 11) ? 'border-bottom: 1px dashed #666; padding-bottom: 10px;' : ''} }
          .header-split { display:flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header-right { text-align: right; width: 33%; font-weight: bold; font-size: 16px; }
          .header-center { text-align: center; width: 34%; }
          .header-center h1 { font-size: 15px; margin: 0 0 5px 0; font-weight: bold; }
          .header-center p { font-size: 12px; margin: 0; }
          .header-left { text-align: left; width: 33%; font-size: 11px; line-height: 1.5; font-weight: bold; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-table td { border: 1px solid #000; padding: 10px; font-size: 12px; font-weight: bold; }
          .header-centered { text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 20px; }
          .header-centered h2 { margin: 0 0 5px 0; font-size: 18px; }
          .header-centered h1 { margin: 0 0 10px 0; font-size: 16px; }
          .header-centered p { margin: 0; font-size: 12px; font-weight: bold; }
          .capsule-box { border: 2px solid ${headerColor}; padding: 5px 15px; border-radius: 30px; display: inline-block; }
          .question-block { margin-bottom: 18px; z-index: 1; position: relative; ${selectedTemplate === 8 ? 'border: 1px solid #000; border-radius: 8px; padding: 10px; background-color: rgba(250,250,250,0.8);' : ''} ${selectedTemplate === 11 ? 'border-bottom: 1px solid #ccc; padding-bottom: 10px;' : ''} }
          .question-title { font-weight: bold; margin-bottom: 6px; display: flex; justify-content: space-between; }
          .marks-text { font-weight: normal; font-size: 0.9em; opacity: 0.8; }
          .branch-item { margin-right: 15px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
          .branch-marks { font-size: 0.85em; opacity: 0.8; }
          .image-container { margin: 8px 0; }
          .question-img { max-width: 150px; max-height: 120px; object-fit: contain; border: 1px solid #ccc; border-radius: 6px; }
          .ltr-text { direction: ltr; unicode-bidi: embed; display: inline-block; }
          .footer { position: absolute; bottom: 15px; left: 20px; right: 20px; display: flex; justify-content: space-between; border-top: 1px solid #ccc; padding-top: 8px; font-size: 12px; font-weight: bold; color: ${headerColor}; z-index: 1; }
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

  const handleExportPDF = async () => {
    // فحص الاشتراك والمحاولات المجانية (3 محاولات) قبل التصدير
    const canExport = await handleExportAttempt();
    if (!canExport) return;

    try {
      const htmlContent = getExamHTML();
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('PDF Export Error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير ملف الـ PDF.');
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
           <View style={{ width: '90%', height: 2, backgroundColor: '#eee', marginBottom: 3 }}/>
           <View style={{ width: '70%', height: 2, backgroundColor: '#eee' }}/>
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
        <TouchableOpacity style={styles.glassToggle} onPress={() => toggleDropdown(keyName)}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {isTemplateList && renderTemplateWireframe(selectedTemplate)}
            <View style={{ alignItems: 'flex-end', flex: 1, marginRight: isTemplateList ? 10 : 0 }}>
              <Text style={styles.glassToggleText}>{currentValueText}</Text>
              {isTemplateList && <Text style={styles.dropdownSubText}>{currentTemplateObj.desc}</Text>}
            </View>
            <Text style={{ color: '#2B6CB0', fontWeight: 'bold', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.glassDropdownContainer}>
            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 280 }} showsVerticalScrollIndicator={true}>
              {itemsList.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.glassDropdownItem, currentValueText.includes(item.label) && styles.glassItemActive]}
                  onPress={() => { onSelect(item.value); setActiveDropdown(null); }}
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
          style={[styles.glassInput, { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, paddingVertical: 10, paddingHorizontal: 8 }]} 
          onPress={() => toggleDropdown(dropdownKey)}
        >
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: selectedColorObj.value, marginLeft: 6, borderWidth: 1, borderColor: '#ccc' }} />
            <Text style={{ fontSize: 10, color: '#333', fontWeight: 'bold' }}>{selectedColorObj.label}</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#2B6CB0' }}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.compactColorMenu}>
            {COLORS_LIST.map((c) => (
              <TouchableOpacity 
                key={c.value} 
                style={styles.compactColorItem} 
                onPress={() => { onSelect(c.value); setActiveDropdown(null); }}
              >
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.value, marginLeft: 6, borderWidth: 1, borderColor: '#ccc' }} />
                <Text style={{ fontSize: 10, color: '#333' }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderInlineInsertDropdown = (
    dropdownKey: string,
    label: string,
    items: { label: string; value: string }[],
    onInsert: (val: string) => void
  ) => {
    const isOpen = activeDropdown === dropdownKey;
    return (
      <View style={{ flex: 1, marginHorizontal: 4 }}>
        <TouchableOpacity
          style={[styles.glassInput, { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, paddingVertical: 10, paddingHorizontal: 10 }]}
          onPress={() => toggleDropdown(dropdownKey)}
        >
          <Text style={{ fontSize: 12, color: '#1e293b', fontWeight: 'bold' }}>{label}</Text>
          <Text style={{ fontSize: 10, color: '#2B6CB0' }}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.insertMenuContainer}>
            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 180 }}>
              {items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.insertMenuItem}
                  onPress={() => { onInsert(item.value); setActiveDropdown(null); }}
                >
                  <Text style={{ fontSize: 12, color: '#475569', fontWeight: 'bold', flex: 1, textAlign: 'right' }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, color: '#2B6CB0', direction: 'ltr', marginLeft: 10 }}>{item.value}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>صانع ورقة امتحان الكيمياء (تطبيق سطور)</Text>

        <View style={styles.glassSection}>
          <Text style={styles.sectionTitle}>1. اختيار قالب التخطيط البصري</Text>
          {renderUniversalDropdown(
            'template',
            'التخطيط النشط:',
            `نموذج (${selectedTemplate}): ${currentTemplateObj.name}`,
            TEMPLATES_DATA.map(t => ({ label: `${t.id}. ${t.name}`, value: t.id, desc: t.desc })),
            (val) => setSelectedTemplate(val),
            true
          )}
        </View>

        <View style={styles.glassSection}>
          <Text style={styles.sectionTitle}>2. إعدادات الخطوط ولون الرأس</Text>
          {renderUniversalDropdown(
            'fontFamily',
            'نوع الخط:',
            fontFamily,
            ['Cairo', 'Amiri', 'Tajawal', 'Almarai', 'Changa', 'Reem Kufi', 'Arial', 'Times New Roman', 'El Messiri', 'Lateef'].map(f => ({ label: f, value: f })),
            (val) => setFontFamily(val)
          )}
          {renderUniversalDropdown(
            'fontSize',
            'حجم الخط:',
            fontSize,
            ['12px', '13px', '14px', '15px', '16px', '18px'].map(s => ({ label: s, value: s })),
            (val) => setFontSize(val)
          )}
          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>لون الترويسة (الرأس):</Text>
            {renderCompactColorDropdown('headerColor', headerColor, setHeaderColor)}
          </View>
        </View>

        <View style={styles.glassSection}>
          <Text style={styles.sectionTitle}>3. بيانات الترويسة والذيل</Text>
          <Text style={styles.label}>اسم المدرسة (اليمين):</Text>
          <TextInput style={styles.glassInput} value={schoolName} onChangeText={setSchoolName} />
          
          <View style={styles.rowContainer}>
            <View style={{ flex: 1, marginLeft: 5 }}>
              <Text style={styles.label}>عنوان الامتحان (الوسط):</Text>
              <TextInput style={styles.glassInput} value={examTitle} onChangeText={setExamTitle} />
            </View>
            <View style={{ flex: 1, marginRight: 5 }}>
              <Text style={styles.label}>السنة الدراسية (الوسط):</Text>
              <TextInput style={styles.glassInput} value={academicYear} onChangeText={setAcademicYear} />
            </View>
          </View>

          <Text style={styles.label}>الصف / الشعبة (اليسار):</Text>
          <TextInput style={styles.glassInput} value={gradeClass} onChangeText={setGradeClass} />

          <View style={styles.rowContainer}>
            <View style={{ flex: 1, marginLeft: 5 }}>
              <Text style={styles.label}>المادة (اليسار):</Text>
              <TextInput style={styles.glassInput} value={subject} onChangeText={setSubject} />
            </View>
            <View style={{ flex: 1, marginRight: 5 }}>
              <Text style={styles.label}>الوقت (اليسار):</Text>
              <TextInput style={styles.glassInput} value={duration} onChangeText={setDuration} />
            </View>
          </View>

          <Text style={styles.label}>اسم الأستاذ في الذيل:</Text>
          <TextInput style={styles.glassInput} value={teacherName} onChangeText={setTeacherName} />
        </View>

        <View style={styles.glassSection}>
          <Text style={styles.sectionTitle}>4. إدارة الأسئلة، الدرجات، والصيغ الكيميائية</Text>
          
          <Text style={styles.instructionText}>
            💡 لكتابة الأسس العلوية، استخدم ( ^ ) مثل 10^5 أو Na^+ وللأرقام السفلية استخدم ( _ ) مثل H_2O.
          </Text>

          {questions.map((q, qIndex) => (
            <View key={q.id} style={styles.questionCard}>
              
              <View style={styles.rowContainer}>
                <View style={{ flex: 2.5, marginLeft: 5 }}>
                  <Text style={styles.label}>نص السؤال {qIndex + 1}:</Text>
                  <TextInput 
                    style={styles.glassInput} 
                    value={q.questionText} 
                    onChangeText={(text) => {
                      const updated = [...questions];
                      updated[qIndex].questionText = text;
                      setQuestions(updated);
                    }} 
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 5 }}>
                  <Text style={styles.label}>الدرجة:</Text>
                  <TextInput 
                    style={[styles.glassInput, { textAlign: 'center' }]} 
                    value={q.marks} 
                    placeholder="مثال: 10"
                    onChangeText={(text) => {
                      const updated = [...questions];
                      updated[qIndex].marks = text;
                      setQuestions(updated);
                    }} 
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.label}>لون السؤال:</Text>
                  {renderCompactColorDropdown(`q_col_${q.id}`, q.color, (val) => {
                    const updated = [...questions];
                    updated[qIndex].color = val;
                    setQuestions(updated);
                  })}
                </View>
              </View>

              <Text style={styles.subLabel}>أدوات مساعدة للكيمياء:</Text>
              <View style={{ flexDirection: 'row-reverse', marginBottom: 15, zIndex: 10 }}>
                {renderInlineInsertDropdown(
                  `sym_${q.id}`,
                  '🔣 إدراج رمز كيميائي',
                  CHEMICAL_SYMBOLS,
                  (val) => handleInsertSymbol(qIndex, val)
                )}
                {renderInlineInsertDropdown(
                  `eq_${q.id}`,
                  '⚗️ قوالب معادلات جاهزة',
                  EQUATION_TEMPLATES,
                  (val) => handleInsertSymbol(qIndex, val)
                )}
              </View>

              <View style={styles.imageConfigRow}>
                <TouchableOpacity style={styles.imagePickBtn} onPress={() => handlePickImage(qIndex)}>
                  <Text style={styles.imagePickBtnText}>{q.imageUri ? 'تغيير الصورة' : 'إدراج صورة صغيرة'}</Text>
                </TouchableOpacity>

                {q.imageUri && (
                  <View style={styles.alignContainer}>
                    {(['right', 'center', 'left'] as const).map((align) => (
                      <TouchableOpacity 
                        key={align} 
                        style={[styles.alignBtn, q.imageAlign === align && styles.alignBtnActive]}
                        onPress={() => {
                          const updated = [...questions];
                          updated[qIndex].imageAlign = align;
                          setQuestions(updated);
                        }}
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
                <View style={{ alignItems: 'center', marginVertical: 6 }}>
                  <Image source={{ uri: q.imageUri }} style={{ width: 80, height: 60, borderRadius: 6 }} />
                </View>
              )}

              <Text style={styles.subLabel}>الأفرع الداخلية (أ، ب، جـ):</Text>
              {q.branches.map((branch, bIndex) => (
                <View key={branch.id} style={[styles.rowContainer, { marginBottom: 6 }]}>
                  <View style={{ flex: 2.5, marginLeft: 5 }}>
                    <TextInput
                      style={[styles.glassInput, { backgroundColor: 'rgba(255, 255, 255, 0.9)', marginBottom: 0 }]}
                      value={branch.text}
                      placeholder="نص الفرع..."
                      onChangeText={(text) => {
                        const updated = [...questions];
                        updated[qIndex].branches[bIndex].text = text;
                        setQuestions(updated);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <TextInput
                      style={[styles.glassInput, { backgroundColor: 'rgba(255, 255, 255, 0.9)', marginBottom: 0, textAlign: 'center' }]}
                      value={branch.marks}
                      placeholder="الدرجة"
                      onChangeText={(text) => {
                        const updated = [...questions];
                        updated[qIndex].branches[bIndex].marks = text;
                        setQuestions(updated);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    {renderCompactColorDropdown(`b_col_${branch.id}`, branch.color, (val) => {
                      const updated = [...questions];
                      updated[qIndex].branches[bIndex].color = val;
                      setQuestions(updated);
                    })}
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addBranchBtn} onPress={() => handleAddBranch(qIndex)}>
                <Text style={styles.addBranchBtnText}>+ إضافة فرع إضافي</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addQuestionBtn} onPress={handleAddQuestion}>
            <Text style={styles.addQuestionBtnText}>+ إضافة سؤال جديد</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.previewBtn} onPress={() => setIsPreviewVisible(true)}>
          <Text style={styles.previewBtnText}>معاينة الورقة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportPDF}>
          <Text style={styles.exportBtnText}>تصدير PDF</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isPreviewVisible} animationType="slide" onRequestClose={() => setIsPreviewVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsPreviewVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>إغلاق</Text>
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
  container: { padding: 15, paddingBottom: 100 },
  mainTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50', marginTop: 10 },
  
  glassSection: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#2B6CB0', textAlign: 'right' },
  
  dropdownWrapper: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 6, textAlign: 'right' },
  
  glassToggle: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  glassToggleText: { fontSize: 14, color: '#1e293b', fontWeight: 'bold', textAlign: 'right' },
  dropdownSubText: { fontSize: 11, color: '#64748b', marginTop: 3, textAlign: 'right' },
  
  glassDropdownContainer: { backgroundColor: '#fff', borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#cbd5e1', overflow: 'hidden' },
  glassDropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row-reverse', alignItems: 'center' },
  glassItemActive: { backgroundColor: '#eff6ff' },
  glassItemText: { fontSize: 14, color: '#334155' },
  glassItemTextActive: { color: '#2B6CB0', fontWeight: 'bold' },
  dropdownItemDesc: { fontSize: 11, color: '#94a3b8', marginTop: 3, textAlign: 'right' },
  
  compactColorMenu: { backgroundColor: '#fff', borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#e2e8f0', padding: 5, flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-start' },
  compactColorItem: { flexDirection: 'row-reverse', alignItems: 'center', width: '48%', padding: 5, marginBottom: 5 },
  
  insertMenuContainer: { backgroundColor: '#fff', borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#cbd5e1', overflow: 'hidden' },
  insertMenuItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },

  glassInput: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 15, textAlign: 'right', fontSize: 13, color: '#0f172a' },
  
  rowContainer: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  instructionText: { fontSize: 12, color: '#0f5132', marginBottom: 15, textAlign: 'right', backgroundColor: '#d1e7dd', padding: 10, borderRadius: 8, overflow: 'hidden' },
  
  questionCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  subLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8, textAlign: 'right' },
  
  imageConfigRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 5 },
  imagePickBtn: { backgroundColor: '#2B6CB0', borderRadius: 8, padding: 10, flex: 1, marginLeft: 10 },
  imagePickBtnText: { color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: 'bold' },
  
  alignContainer: { flexDirection: 'row-reverse', flex: 2, justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 8, padding: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  alignBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  alignBtnActive: { backgroundColor: '#2B6CB0' },
  alignText: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  alignTextActive: { color: '#fff' },
  
  templateThumbPreview: { justifyContent: 'flex-start', alignItems: 'center' },
  
  addBranchBtn: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 5, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed' },
  addBranchBtnText: { color: '#475569', textAlign: 'center', fontSize: 13, fontWeight: 'bold' },
  
  addQuestionBtn: { backgroundColor: '#2B6CB0', borderRadius: 10, padding: 15, marginTop: 5, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 3 },
  addQuestionBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  
  footerButtons: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', position: 'absolute', bottom: 0, left: 0, right: 0 },
  previewBtn: { flex: 1, backgroundColor: '#475569', borderRadius: 8, padding: 12, marginLeft: 10, alignItems: 'center' },
  previewBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  exportBtn: { flex: 1, backgroundColor: '#e53e3e', borderRadius: 8, padding: 12, marginRight: 10, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  closeBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  closeBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 14 }
});