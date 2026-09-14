import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSubscription } from '../../context/SubscriptionContext';
import { setExamStore } from '../../utils/examStore';

const { width, height } = Dimensions.get('window');

// --- Constants & Types ---
const englishFonts = [
  { label: 'Open Sans (موصى به)', value: 'Open Sans' },
  { label: 'Montserrat (للعناوين)', value: 'Montserrat' },
  { label: 'Roboto (عصري)', value: 'Roboto' },
  { label: 'Inter (احترافي)', value: 'Inter' },
  { label: 'Poppins (انسيابي)', value: 'Poppins' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Courier New', value: 'Courier New' }
];

const sizeOptions = [
  { label: 'صغير جداً (12px)', value: '12px' },
  { label: 'صغير (14px)', value: '14px' },
  { label: 'متوسط (16px)', value: '16px' },
  { label: 'كبير (19px)', value: '19px' },
  { label: 'كبير جداً (22px)', value: '22px' },
  { label: 'ضخم (26px)', value: '26px' }
];

const lineSpacingOptions = [
  { label: 'مكثف جداً (0.8)', value: '0.8' },
  { label: 'مكثف (1.0)', value: '1.0' },
  { label: 'ضيق (1.2)', value: '1.2' },
  { label: 'متراص (1.4)', value: '1.4' },
  { label: 'عادي (1.6)', value: '1.6' },
  { label: 'مريح (2.0)', value: '2.0' }
];

const headerTemplates = [
  { label: '🏛️ القالب الوزاري الرسمي (جدول بإطارات)', value: 'ministry' },
  { label: '✨ القالب العصري (شريط علوي ملون)', value: 'modern' },
  { label: '📌 القالب التقليدي المتوازن', value: 'classic' },
  { label: '🎓 القالب الأكاديمي', value: 'academic' },
  { label: '🎗️ قالب الشريط العريض (Ribbon)', value: 'ribbon' },
  { label: '📐 القالب البسيط (Minimalist)', value: 'minimalist' },
  { label: '📦 قالب الصناديق (Boxed)', value: 'boxed' }
];

const textAlignOptions = [
  { label: 'يسار (Left)', value: 'left' },
  { label: 'وسط (Center)', value: 'center' },
  { label: 'يمين (Right)', value: 'right' },
  { label: 'ضبط (Justify)', value: 'justify' }
];

const textWeightOptions = [
  { label: 'عادي (400)', value: '400' },
  { label: 'متوسط (500)', value: '500' },
  { label: 'شبه عريض (600)', value: '600' },
  { label: 'عريض (700)', value: '700' },
  { label: 'عريض جداً (900)', value: '900' }
];

const colorOptions = [
  { label: 'أخضر غابات', value: '#15803d' },
  { label: 'زيتوني غامق', value: '#3f6212' },
  { label: 'أزرق ملكي', value: '#1d4ed8' },
  { label: 'أسود فحمي', value: '#0f172a' },
  { label: 'عنابي داكن', value: '#b91c1c' },
  { label: 'بنفسجي ملكي', value: '#9333ea' }
];

const glassColorOptions = [
  { label: 'بدون تأثير (إيقاف)', value: 'none' },
  { label: 'أبيض ثلجي', value: 'rgba(255, 255, 255, 0.45)' },
  { label: 'أخضر زجاجي خفيف', value: 'rgba(21, 128, 61, 0.2)' },
  { label: 'فحمي زجاجي', value: 'rgba(15, 23, 42, 0.25)' }
];

const pageTypeOptions = [
  { label: '📄 مستند نصي وعناوين فرعية', value: 'standard' },
  { label: '📝 قطعة خارجية + أسئلة', value: 'passage' },
  { label: '📊 جدول بيانات ومقارنة منظم', value: 'table' },
  { label: '🔤 بنك الكلمات وإسقاط الفراغات', value: 'word_drops' }
];

const sectionTypeOptions = [
  { label: '📄 فقرة قياسية (عنوان + نص)', value: 'standard' },
  { label: '📘 تعريف (مصطلح + الشرح)', value: 'definition' },
  { label: '💡 تعليل / شرح', value: 'reason' },
  { label: '❓ سؤال وجواب (Q&A منظم)', value: 'qa' }
];

const isColorValue = (val: string) => val && (val.startsWith('#') || val.startsWith('rgba'));

const DropdownSelector = ({ label, value, options, onSelect, isOpen, onToggle }: any) => {
  const selectedOpt = options.find((o: any) => o.value === value) || options[0];
  return (
    <View style={styles.dropdownWrapper}>
      {label ? <Text style={styles.subLabel}>{label}</Text> : null}
      <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.dropdownHeader}>
        <View style={styles.dropdownHeaderInner}>
          {isColorValue(selectedOpt?.value) ? (
            <View style={[styles.colorDot, { backgroundColor: selectedOpt.value.includes('rgba') ? selectedOpt.value.replace(/[\d.]+\)$/g, '1)') : selectedOpt.value }]} />
          ) : null}
          <Text style={styles.dropdownHeaderText} numberOfLines={1}>{selectedOpt ? selectedOpt.label : 'اختر...'}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#15803d" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onToggle}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onToggle}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'اختر الخيار'}</Text>
              <TouchableOpacity onPress={onToggle} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#15803d" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {options.map((opt: any) => {
                const isSelected = opt.value === value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.dropdownItem, isSelected ? styles.dropdownItemSelected : null]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onSelect(opt.value);
                      onToggle();
                    }}
                  >
                    <View style={styles.dropdownHeaderInner}>
                      {isColorValue(opt.value) ? (
                        <View style={[styles.colorDot, { backgroundColor: opt.value.includes('rgba') ? opt.value.replace(/[\d.]+\)$/g, '1)') : opt.value }]} />
                      ) : null}
                      <Text style={[styles.dropdownItemText, isSelected ? styles.dropdownItemTextSelected : null]}>
                        {opt.label}
                      </Text>
                    </View>
                    {isSelected ? <Ionicons name="checkmark-circle" size={20} color="#15803d" /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function EnglishSummary() {
  const router = useRouter();
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const [meta, setMeta] = useState({ 
    subject: 'English Language',
    chapter: 'Unit One: Grammar & Review',
    gradeLevel: 'Third Intermediate',
    author: 'Prepared by: Teacher Mustafa Khalid',
  });

  const [watermark, setWatermark] = useState({
    text: '',
    fontSize: '60px',
    color: '#bbf7d0',
    opacity: '0.12',
    rotation: '-30deg',
    font: 'Open Sans'
  });

  const [config, setConfig] = useState({ 
    color: '#15803d', 
    lineSpacing: '1.6', 
    pagePadding: '10mm 12mm', 
    borderStyle: 'double', 
    borderWidth: '4px',
    pageShading: 'none', 

    headerTemplate: 'classic',

    font: 'Open Sans',               
    size: '16px',                    
    textColor: '#0f172a',       
    textAlign: 'left',           
    textWeight: '600',          

    subtitleSize: '19px', 
    subtitleShape: 'sidebar', 
    subtitleShading: 'green_light', 
    subtitleFont: 'Montserrat',      
    sectionSpacing: '14px',      
    
    headerRightShading: 'green_light',
    headerCenterShading: 'none',
    headerLeftShading: 'olive_light',
    footerLeftShading: 'none',
    footerRightShading: 'none',

    glassEffects: {
      header: 'none',
      margin: 'none',
      border: 'none'
    }
  });

  const [entries, setEntries] = useState([
    { 
      id: '1', 
      pageType: 'standard', 
      pageTitle: 'Unit 1: Grammar & Vocabulary', 
      sections: [
        { 
          id: 's1', 
          type: 'definition', 
          title: 'Present Simple', 
          content: 'Used to describe habits, general truths, or fixed arrangements.', 
          imageBase64: null, 
          imageSize: '50%', 
          imageAlign: 'center' 
        }
      ], 
      passageText: '', 
      questions: [], 
      tableColumns: [], 
      tableRows: [], 
      wordBank: '', 
      dropQuestions: [] 
    }
  ]);

  const toggleDropdown = (key: string) => setActiveDropdown(activeDropdown === key ? null : key);

  const handleAddPage = () => { 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
    setEntries([
      ...entries, 
      { 
        id: Date.now().toString(), 
        pageType: 'standard', 
        pageTitle: 'New Unit Page', 
        sections: [{ id: Date.now().toString() + '_s', type: 'standard', title: '', content: '', imageBase64: null, imageSize: '50%', imageAlign: 'center' }], 
        passageText: '', 
        questions: [{ id: '1', text: 'Question?' }], 
        tableColumns: ['Column 1', 'Column 2'], 
        tableRows: [['', '']], 
        wordBank: '', 
        dropQuestions: [{ id: '1', text: 'Blank ____' }] 
      }
    ]); 
  };
  
  const handleDeletePage = (id: string) => { 
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); 
    setEntries(entries.filter(e => e.id !== id)); 
  };

  const updatePage = (id: string, field: string, value: any) => setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));

  const pickImageForSection = async (pageId: string, sectionId: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      updatePage(pageId, 'sections', entries.find(e => e.id === pageId)?.sections.map(s => s.id === sectionId ? { ...s, imageBase64: base64Img } : s));
    }
  };

  const getBackgroundColor = (type: string) => {
    const colors: Record<string, string> = {
      green_light: '#f0fdf4', olive_light: '#fefce8', gray_light: '#f8fafc',
      beige_light: '#fef3c7', navy_dark: '#1e3a8a', charcoal_dark: '#1e293b',
      none: 'transparent', gradient: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', glass: 'rgba(255,255,255,0.85)'
    };
    return colors[type] || 'transparent';
  };

  const renderHeaderHTML = (pageTitle: string) => {
    const tpl = config.headerTemplate;
    const { header: gHeader } = config.glassEffects;
    let headerStyle = `border-bottom: 2px solid ${config.color};`;
    if (gHeader !== 'none') {
      headerStyle = `background: ${gHeader}; border: 1px solid rgba(183, 211, 141, 0.4);`;
    }

    switch (tpl) {
      case 'ministry':
        return `
          <div style="margin-bottom:20px;">
            <table style="width: 100%; border-collapse: collapse; border: 2px solid ${config.color}; background: ${getBackgroundColor(config.headerRightShading)};">
              <tr>
                <td style="border: 1px solid ${config.color}; padding: 8px; width: 33%; text-align: left; font-weight: 900; color: ${config.color};">Subject: ${meta.subject}</td>
                <td style="border: 1px solid ${config.color}; padding: 8px; width: 34%; text-align: center; font-weight: 900; font-size: 16px; color: ${config.color};">${pageTitle || meta.chapter}</td>
                <td style="border: 1px solid ${config.color}; padding: 8px; width: 33%; text-align: right; font-weight: 900; color: ${config.color};">${meta.gradeLevel}</td>
              </tr>
            </table>
          </div>
        `;
      case 'modern':
        return `
          <div style="background: ${config.color}; color: #fff; border-radius: 12px; padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="font-weight: 900; font-size: 15px;">Subject: ${meta.subject}</div>
            <div style="font-weight: 900; font-size: 17px; background: rgba(255,255,255,0.2); padding: 4px 16px; border-radius: 20px;">${pageTitle || meta.chapter}</div>
            <div style="font-weight: 900; font-size: 15px;">${meta.gradeLevel}</div>
          </div>
        `;
      case 'academic':
        return `
          <div style="border-bottom: 4px solid ${config.color}; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 900; text-align: left; width: 30%;"><div>${meta.subject}</div><div>${meta.gradeLevel}</div></div>
            <div style="text-align: center; width: 40%;"><h2 style="margin: 0; color: ${config.color}; font-weight: 900;">${pageTitle || meta.chapter}</h2></div>
            <div style="text-align: right; width: 30%; font-weight: bold; color: #64748b;">Official Summary</div>
          </div>
        `;
      case 'ribbon':
        return `
          <div style="margin-bottom: 20px;">
            <div style="background: ${config.color}; color: white; text-align: center; padding: 10px; border-radius: 6px; font-weight: 900; font-size: 16px; margin-bottom: 8px;">${pageTitle || meta.chapter}</div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; padding: 0 5px; color: #475569;">
              <div>Subject: ${meta.subject}</div>
              <div>${meta.gradeLevel}</div>
            </div>
          </div>
        `;
      case 'minimalist':
        return `
          <div style="border-bottom: 1.5px solid #000; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-weight: bold;">
            <div>${pageTitle || meta.chapter}</div>
            <div>${meta.subject} | ${meta.gradeLevel}</div>
          </div>
        `;
      case 'boxed':
        return `
          <div style="display: flex; gap: 8px; margin-bottom: 20px;">
            <div style="flex: 1; border: 1.5px solid ${config.color}; padding: 8px; text-align: left; border-radius: 6px; font-weight: bold; color: ${config.color};">Subject: ${meta.subject}</div>
            <div style="flex: 1.5; border: 1.5px solid ${config.color}; padding: 8px; text-align: center; border-radius: 6px; font-weight: 900; color: ${config.color}; background: rgba(21,128,61,0.05);">${pageTitle || meta.chapter}</div>
            <div style="flex: 1; border: 1.5px solid ${config.color}; padding: 8px; text-align: right; border-radius: 6px; font-weight: bold; color: ${config.color};">${meta.gradeLevel}</div>
          </div>
        `;
      default:
        return `
          <div class="header-grid" style="${headerStyle}">
            <div class="header-left-box">Subject: ${meta.subject}</div>
            <div class="header-center-box">${pageTitle || meta.chapter}</div>
            <div class="header-right-box">${meta.gradeLevel}</div>
          </div>
        `;
    }
  };

  const generateHTML = () => {
    const { header: gHeader, margin: gMargin, border: gBorder } = config.glassEffects;
    let pageMarginValue = gMargin !== 'none' ? '0' : '6mm';
    let bodyCSS = '';
    let containerCSS = '';
    
    if (gMargin !== 'none') {
      bodyCSS = `
        background: ${gMargin};
        padding: 12mm;
        min-height: 297mm;
        box-sizing: border-box;
      `;
      containerCSS = `
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(21, 128, 61, 0.15);
        min-height: calc(297mm - 24mm);
      `;
    } else {
      bodyCSS = `background: ${getBackgroundColor(config.pageShading)};`;
      containerCSS = `
        background: #ffffff;
        border-radius: 6px;
        min-height: 281mm;
      `;
    }

    if (gBorder !== 'none') {
      containerCSS += `
        border: ${config.borderWidth} solid ${gBorder};
      `;
    } else if (gMargin === 'none') {
      containerCSS += `border: ${config.borderStyle === 'none' ? 'none' : `${config.borderWidth} ${config.borderStyle} ${config.color}`};`;
    } else {
      containerCSS += `border: 1px solid rgba(183, 211, 141, 0.6);`;
    }

    let titleRadius = '50px';
    let titlePadding = '4px 14px';
    let titleBorder = 'none';
    let subBgColor = getBackgroundColor(config.subtitleShading);

    if (config.subtitleShape === 'rounded_box') titleRadius = '6px';
    if (config.subtitleShape === 'sidebar') { titleRadius = '6px 0px 0px 6px'; titleBorder = `left: 4px solid ${config.color}`; }
    if (config.subtitleShape === 'badge') { titleRadius = '50%'; }
    if (config.subtitleShape === 'none') { titleRadius = '0px'; titlePadding = '0px'; subBgColor = 'transparent'; }

    return `
      <!DOCTYPE html>
      <html dir="ltr">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Inter:wght@400;600;700&family=Montserrat:wght@700;900&family=Open+Sans:wght@400;600;700&family=Poppins:wght@400;600&family=Roboto:wght@400;700&display=swap');
            @page { size: A4 portrait; margin: ${pageMarginValue}; }
            body { 
              font-family: '${config.font}', sans-serif; color: #0f172a; margin: 0; line-height: ${config.lineSpacing}; -webkit-print-color-adjust: exact; 
              ${bodyCSS}
            }
            .page { 
              padding: ${gMargin !== 'none' ? '8mm' : config.pagePadding}; 
              box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; position: relative; overflow: hidden; 
              ${containerCSS}
            }
            .watermark-overlay {
              position: absolute; top: 50%; left: 50%;
              transform: translate(-50%, -50%) rotate(${watermark.rotation});
              font-family: '${watermark.font}', sans-serif;
              font-size: ${watermark.fontSize}; color: ${watermark.color};
              opacity: ${watermark.opacity}; font-weight: 900; pointer-events: none; user-select: none; z-index: 0; white-space: nowrap; text-align: center;
            }
            .header-grid, .body, .footer-grid { position: relative; z-index: 1; }
            .header-grid { 
              padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; 
            }
            .header-left-box { background: ${getBackgroundColor(config.headerLeftShading)}; padding: 6px 12px; border-radius: 4px; font-weight: 900; font-size: 15px; color: ${config.color}; text-align: left; }
            .header-center-box { background: ${getBackgroundColor(config.headerCenterShading)}; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 15px; color: ${config.color}; text-align: center; }
            .header-right-box { background: ${getBackgroundColor(config.headerRightShading)}; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 14px; color: ${config.color}; text-align: right; }
            .body { flex: 1; display: flex; flex-direction: column; gap: 12px; text-align: left; }
            
            .section-block { 
              margin-bottom: ${config.sectionSpacing}; 
              display: flex; flex-direction: column;
              background: #ffffff;
              border-radius: 6px;
              padding: 4px 0;
            }
            .title-badge { 
              font-family: '${config.subtitleFont}', sans-serif;
              font-size: ${config.subtitleSize}; font-weight: bold; color: ${config.color}; background: ${subBgColor}; 
              display: inline-block; 
              padding: ${titlePadding}; border-radius: ${titleRadius}; border-${titleBorder}; 
              margin-bottom: 6px;
            }
            .content-text { 
              font-family: '${config.font}', sans-serif; font-size: ${config.size}; color: ${config.textColor}; 
              font-weight: ${config.textWeight}; text-align: ${config.textAlign}; white-space: pre-wrap; 
            }

            .def-container { 
              background: rgba(240, 253, 244, 0.7); 
              padding: 10px 14px; 
              border-radius: 8px; 
              border-left: 4px solid ${config.color}; 
              margin-bottom: ${config.sectionSpacing}; 
              text-align: left; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            }
            .def-term { 
              font-weight: 900; 
              color: ${config.color}; 
              font-size: calc(${config.size} + 1px); 
              display: inline; 
            }
            .def-desc { 
              display: inline; 
              font-family: '${config.font}', sans-serif; 
              font-size: ${config.size}; 
              color: ${config.textColor}; 
              font-weight: ${config.textWeight}; 
              margin-left: 6px; 
            }
            
            .reason-container { 
              background: rgba(254, 243, 199, 0.5); 
              border: 1px dashed ${config.color}; 
              border-radius: 8px; 
              padding: 12px 14px; 
              margin-bottom: ${config.sectionSpacing}; 
            }
            .reason-title { 
              font-weight: 900; 
              color: ${config.color}; 
              font-size: calc(${config.size} + 1px); 
              margin-bottom: 6px; 
              display: flex; 
              align-items: center; 
              gap: 6px; 
            }
            .reason-body { 
              font-family: '${config.font}', sans-serif; 
              font-size: ${config.size}; 
              color: ${config.textColor}; 
              font-weight: ${config.textWeight}; 
              padding-left: 8px;
            }

            .qa-container { 
              background: #f8fafc; 
              border: 1px solid #cbd5e1; 
              border-radius: 8px; 
              padding: 12px 16px; 
              margin-bottom: ${config.sectionSpacing}; 
              box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            }
            .qa-q { 
              font-weight: 900; 
              color: ${config.color}; 
              font-size: calc(${config.size} + 1px); 
              margin-bottom: 8px; 
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .qa-a { 
              font-family: '${config.font}', sans-serif; 
              font-size: ${config.size}; 
              color: ${config.textColor}; 
              font-weight: ${config.textWeight}; 
              padding-left: 14px; 
              border-left: 3px solid ${config.color}; 
            }

            .footer-grid { border-top: 1px dashed #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: bold; color: ${config.color}; }
            .footer-left-box { background: ${getBackgroundColor(config.footerLeftShading)}; padding: 4px 8px; border-radius: 4px; }
            .footer-right-box { background: ${getBackgroundColor(config.footerRightShading)}; padding: 4px 8px; border-radius: 4px; }
          </style>
        </head>
        <body>
          ${entries.map((page, idx) => `
            <div class="page">
              ${watermark.text ? `<div class="watermark-overlay">${watermark.text}</div>` : ''}
              
              ${renderHeaderHTML(page.pageTitle)}

              <div class="body">
                ${page.pageType === 'standard' ? page.sections.map(s => {
                  if (s.type === 'definition') {
                    return `
                      <div class="def-container">
                        <span class="def-term">${s.title}:</span>
                        <span class="def-desc">${s.content}</span>
                        ${s.imageBase64 ? `<div style="text-align: ${s.imageAlign || 'center'}; margin-top: 8px;"><img src="${s.imageBase64}" style="width: ${s.imageSize || '50%'}; max-width: 100%; border-radius: 6px;" /></div>` : ''}
                      </div>
                    `;
                  }
                  if (s.type === 'reason') {
                    return `
                      <div class="reason-container">
                        <div class="reason-title">💡 ${s.title}</div>
                        <div class="reason-body">
                          ${s.content}
                          ${s.imageBase64 ? `<div style="text-align: ${s.imageAlign || 'center'}; margin-top: 10px;"><img src="${s.imageBase64}" style="width: ${s.imageSize || '50%'}; max-width: 100%; border-radius: 6px;" /></div>` : ''}
                        </div>
                      </div>
                    `;
                  }
                  if (s.type === 'qa') {
                    return `
                      <div class="qa-container">
                        <div class="qa-q">Q: ${s.title}</div>
                        <div class="qa-a">
                          Ans: ${s.content}
                          ${s.imageBase64 ? `<div style="text-align: ${s.imageAlign || 'center'}; margin-top: 10px;"><img src="${s.imageBase64}" style="width: ${s.imageSize || '50%'}; max-width: 100%; border-radius: 6px;" /></div>` : ''}
                        </div>
                      </div>
                    `;
                  }
                  return `
                    <div class="section-block">
                      ${s.title ? `<div class="title-badge">${s.title}</div>` : ''}
                      <div class="content-text">
                        ${s.content}
                        ${s.imageBase64 ? `<div style="text-align: ${s.imageAlign || 'center'}; margin-top: 12px;"><img src="${s.imageBase64}" style="width: ${s.imageSize || '50%'}; max-width: 100%; border-radius: 8px;" /></div>` : ''}
                      </div>
                    </div>
                  `;
                }).join('') : ''}
              </div>
              <div class="footer-grid">
                <div class="footer-left-box">${meta.author}</div>
                <div class="footer-right-box">Page (${idx + 1} of ${entries.length})</div>
              </div>
            </div>
          `).join('')}
          ${getWatermarkHTML()}
        </body>
      </html>
    `;
  };

  const handlePreview = () => { 
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExamStore(generateHTML(), false, config.color); 
    router.push('/modal'); 
  };

  const handlePrint = async () => { 
    Keyboard.dismiss();
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    setIsPrinting(true);
    try { 
      await Print.printAsync({ html: generateHTML() }); 
    } catch { 
      Alert.alert('خطأ', 'تعذرت عملية الطباعة'); 
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        
        <View style={StyleSheet.absoluteFillObject} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.topNavRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-forward" size={20} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>صانع الملخصات الإنجليزية</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* اختيار قالب الرأس الجاهز */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}><Ionicons name="ribbon" size={20} color="#15803d" /></View>
              <Text style={styles.cardTitle}>قوالب الرأس الجاهزة (Header Templates)</Text>
            </View>
            <DropdownSelector 
              label="اختر تصميم وتخطيط الترويسة العليا:" 
              value={config.headerTemplate} 
              options={headerTemplates} 
              isOpen={activeDropdown === 'headerTemplate'} 
              onToggle={() => toggleDropdown('headerTemplate')} 
              onSelect={(v: any) => setConfig({ ...config, headerTemplate: v })} 
            />
          </View>

          {/* التأثيرات الزجاجية */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}><Ionicons name="water" size={20} color="#15803d" /></View>
              <Text style={styles.cardTitle}>التأثيرات الزجاجية الفاخرة</Text>
            </View>
            
            <View style={styles.rowInputs}>
              <View style={{flex:1}}><DropdownSelector label="لون الرأس الزجاجي" value={config.glassEffects.header} options={glassColorOptions} isOpen={activeDropdown === 'gHeader'} onToggle={() => toggleDropdown('gHeader')} onSelect={(v: any) => setConfig((p: any) => ({...p, glassEffects: {...p.glassEffects, header: v}}))} /></View>
              <View style={{flex:1}}><DropdownSelector label="لون الإطار الزجاجي" value={config.glassEffects.border} options={glassColorOptions} isOpen={activeDropdown === 'gBorder'} onToggle={() => toggleDropdown('gBorder')} onSelect={(v: any) => setConfig((p: any) => ({...p, glassEffects: {...p.glassEffects, border: v}}))} /></View>
            </View>
          </View>
          
          {/* العلامة المائية */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}><Ionicons name="scan" size={20} color="#15803d" /></View>
              <Text style={styles.cardTitle}>العلامة المائية (Watermark)</Text>
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="نص العلامة المائية..." 
              placeholderTextColor="#15803d" 
              value={watermark.text} 
              onChangeText={t => setWatermark({ ...watermark, text: t })} 
              textAlign="right"
            />
          </View>

          {/* تنسيق النص والخطوط */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}><Ionicons name="document-text" size={20} color="#15803d" /></View>
              <Text style={styles.cardTitle}>النص العادي والخطوط الإنجليزية</Text>
            </View>

            <View style={styles.rowInputs}>
              <View style={{flex:1}}><DropdownSelector label="الخط:" value={config.font} options={englishFonts} isOpen={activeDropdown === 'textFont'} onToggle={() => toggleDropdown('textFont')} onSelect={(v: any) => setConfig({ ...config, font: v })} /></View>
              <View style={{flex:1}}><DropdownSelector label="الحجم:" value={config.size} options={sizeOptions} isOpen={activeDropdown === 'textSize'} onToggle={() => toggleDropdown('textSize')} onSelect={(v: any) => setConfig({ ...config, size: v })} /></View>
            </View>

            <View style={styles.rowInputs}>
              <View style={{flex:1}}><DropdownSelector label="اللون:" value={config.textColor} options={colorOptions} isOpen={activeDropdown === 'textColor'} onToggle={() => toggleDropdown('textColor')} onSelect={(v: any) => setConfig({ ...config, textColor: v })} /></View>
              <View style={{flex:1}}><DropdownSelector label="السمك:" value={config.textWeight} options={textWeightOptions} isOpen={activeDropdown === 'textWeight'} onToggle={() => toggleDropdown('textWeight')} onSelect={(v: any) => setConfig({ ...config, textWeight: v })} /></View>
            </View>

            <DropdownSelector label="محاذاة النص:" value={config.textAlign} options={textAlignOptions} isOpen={activeDropdown === 'textAlign'} onToggle={() => toggleDropdown('textAlign')} onSelect={(v: any) => setConfig({ ...config, textAlign: v })} />
            <DropdownSelector label="التباعد بين السطور:" value={config.lineSpacing} options={lineSpacingOptions} isOpen={activeDropdown === 'lineSpc'} onToggle={() => toggleDropdown('lineSpc')} onSelect={(v: any) => setConfig({ ...config, lineSpacing: v })} />
          </View>

          {/* محتوى الرأس والتذييل */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}><Ionicons name="options" size={20} color="#15803d" /></View>
              <Text style={styles.cardTitle}>محتوى الرأس والتذييل</Text>
            </View>
            
            <View style={styles.rowInputs}>
              <TextInput style={[styles.input, {flex:1}]} placeholder="المادة..." placeholderTextColor="#15803d" value={meta.subject} onChangeText={t => setMeta({ ...meta, subject: t })} textAlign="right" />
              <TextInput style={[styles.input, {flex:1}]} placeholder="الصف..." placeholderTextColor="#15803d" value={meta.gradeLevel} onChangeText={t => setMeta({ ...meta, gradeLevel: t })} textAlign="right" />
            </View>
            <TextInput style={styles.input} placeholder="الفصل أو الوحدة..." placeholderTextColor="#15803d" value={meta.chapter} onChangeText={t => setMeta({ ...meta, chapter: t })} textAlign="right" />
            <TextInput style={styles.input} placeholder="إعداد المعلم..." placeholderTextColor="#15803d" value={meta.author} onChangeText={t => setMeta({ ...meta, author: t })} textAlign="right" />
          </View>

          {/* إدارة الصفحات والفقرات */}
          <View style={[styles.card, { marginBottom: 40 }]}>
            <View style={styles.questionsHeaderRow}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}><Ionicons name="documents" size={20} color="#15803d" /></View>
                <Text style={styles.cardTitle}>إدارة محتوى الصفحات ({entries.length})</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={handleAddPage} style={styles.addBtn}>
                <Ionicons name="add" size={16} color="#15803d" />
                <Text style={[styles.btnText, { color: '#15803d' }]}>إضافة صفحة</Text>
              </TouchableOpacity>
            </View>

            {entries.map((page) => (
              <View key={page.id} style={styles.pageBox}>
                <DropdownSelector label="نوع قالب الصفحة:" value={page.pageType} options={pageTypeOptions} isOpen={activeDropdown === `type_${page.id}`} onToggle={() => toggleDropdown(`type_${page.id}`)} onSelect={(v: any) => updatePage(page.id, 'pageType', v)} />
                <TextInput style={[styles.input, { fontWeight: 'bold' }]} placeholder="عنوان الصفحة الرئيسي..." placeholderTextColor="#15803d" value={page.pageTitle} onChangeText={t => updatePage(page.id, 'pageTitle', t)} textAlign="right" />

                {page.pageType === 'standard' && (
                  <View>
                    {page.sections.map(s => (
                      <View key={s.id} style={styles.sectionItem}>
                        <View style={styles.rowBetween}>
                          <Text style={{color:'#15803d', fontSize:12, fontWeight:'bold', fontFamily: 'Tajawal'}}>تخصيص قالب القسم (تعريف / تعليل / س وج)</Text>
                          <TouchableOpacity onPress={() => updatePage(page.id, 'sections', page.sections.filter(sec => sec.id !== s.id))}>
                            <Ionicons name="close-circle" size={20} color="#b91c1c" />
                          </TouchableOpacity>
                        </View>

                        <DropdownSelector 
                          label="قالب وتخطيط هذا القسم:" 
                          value={s.type || 'standard'} 
                          options={sectionTypeOptions} 
                          isOpen={activeDropdown === `stype_${s.id}`} 
                          onToggle={() => toggleDropdown(`stype_${s.id}`)} 
                          onSelect={(v: any) => updatePage(page.id, 'sections', page.sections.map(sec => sec.id === s.id ? { ...sec, type: v } : sec))} 
                        />

                        <TextInput 
                          style={styles.input} 
                          placeholder={s.type === 'definition' ? 'المصطلح بالإنجليزية (مثال: Present Simple)...' : s.type === 'reason' ? 'العنوان أو موضوع التعليل...' : s.type === 'qa' ? 'نص السؤال بالإنجليزية...' : 'عنوان القسم بالإنجليزية...'} 
                          placeholderTextColor="#15803d" 
                          value={s.title} 
                          onChangeText={t => updatePage(page.id, 'sections', page.sections.map(sec => sec.id === s.id ? { ...sec, title: t } : sec))} 
                        />
                        <TextInput 
                          style={[styles.input, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]} 
                          multiline 
                          placeholder={s.type === 'definition' ? 'شرح أو تعريف المصطلح بالإنجليزية...' : s.type === 'reason' ? 'الجواب أو السبب...' : s.type === 'qa' ? 'الجواب النموذجي...' : 'محتوى الشرح أو النص بالإنجليزية...'} 
                          placeholderTextColor="#15803d" 
                          value={s.content} 
                          onChangeText={t => updatePage(page.id, 'sections', page.sections.map(sec => sec.id === s.id ? { ...sec, content: t } : sec))} 
                        />
                        
                        <TouchableOpacity style={styles.innerBtn} onPress={() => pickImageForSection(page.id, s.id)}>
                          <Ionicons name={s.imageBase64 ? "checkmark-circle" : "image-outline"} size={18} color="#15803d" />
                          <Text style={styles.innerBtnText}>{s.imageBase64 ? 'تم إضافة صورة (تغيير)' : 'إدراج صورة توضيحية للقسم'}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.innerBtn} onPress={() => updatePage(page.id, 'sections', [...page.sections, { id: Date.now().toString(), type: 'standard', title: '', content: '', imageBase64: null, imageSize: '50%', imageAlign: 'center' }])}>
                      <Ionicons name="add-circle-outline" size={18} color="#15803d" />
                      <Text style={styles.innerBtnText}>إضافة فقرة جديدة</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity onPress={() => handleDeletePage(page.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#b91c1c" />
                  <Text style={styles.deleteText}>حذف هذه الصفحة</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

        </ScrollView>

        {/* الشريط العائم (معاينة وطباعة مباشرة) */}
        <View style={styles.floatingDockContainer}>
          <View style={styles.floatingDock}>
            <TouchableOpacity onPress={handlePreview} style={styles.dockBtn} activeOpacity={0.7}>
              <View style={[styles.dockIconBg, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}>
                <Ionicons name="eye" size={20} color="#15803d" />
              </View>
              <Text style={[styles.dockBtnText, { color: '#15803d' }]} numberOfLines={1}>معاينة</Text>
            </TouchableOpacity>
            
            <View style={styles.dockDivider} />

            <TouchableOpacity onPress={handlePrint} style={styles.dockBtn} disabled={isPrinting} activeOpacity={0.7}>
              <View style={[styles.dockIconBg, { backgroundColor: 'rgba(21, 128, 61, 0.15)' }]}>
                {isPrinting ? <ActivityIndicator color="#15803d" size="small" /> : <Ionicons name="print" size={20} color="#15803d" />}
              </View>
              <Text style={[styles.dockBtnText, { color: '#15803d' }]} numberOfLines={1}>طباعة مباشرة</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbfb' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  
  topNavRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: Platform.OS==='ios'? 50: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.3)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  topNavTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', fontFamily: 'Tajawal' },
  
  card: { borderRadius: 28, backgroundColor: '#ffffff', padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.2)', shadowColor: '#15803d', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', textAlign: 'right', fontFamily: 'Tajawal' },
  
  subLabel: { color: '#15803d', fontSize: 13, textAlign: 'right', marginBottom: 6, fontWeight: '700', fontFamily: 'Tajawal' },
  
  input: { backgroundColor: '#fdfbfb', borderRadius: 16, paddingHorizontal: 16, height: 48, color: '#0f172a', fontSize: 14, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.25)', marginBottom: 12, textAlign: 'left', fontFamily: 'Tajawal', fontWeight: '600' },
  
  rowInputs: { flexDirection: 'row-reverse', gap: 12, marginBottom: 4 },
  rowBetween: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  questionsHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  
  addBtn: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.3)', backgroundColor: 'rgba(21, 128, 61, 0.08)' },
  btnText: { fontSize: 13, fontWeight: 'bold', marginRight: 6, fontFamily: 'Tajawal' },
  
  pageBox: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.15)' },
  sectionItem: { backgroundColor: '#ffffff', padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.15)' },
  
  innerBtn: { flexDirection: 'row-reverse', gap: 8, backgroundColor: 'rgba(21, 128, 61, 0.08)', height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.25)', marginTop: 6 },
  innerBtnText: { color: '#15803d', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' },
  
  deleteBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 16, padding: 10, backgroundColor: 'rgba(185, 28, 28, 0.08)', borderRadius: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(185, 28, 28, 0.2)' },
  deleteText: { color: '#b91c1c', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },
  
  dropdownWrapper: { marginBottom: 12, flex: 1 },
  dropdownHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdfbfb', borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.25)' },
  dropdownHeaderInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 },
  dropdownHeaderText: { color: '#0f172a', fontSize: 13, textAlign: 'right', fontWeight: '600', fontFamily: 'Tajawal' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 380, backgroundColor: '#ffffff', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.3)', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 30 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(21, 128, 61, 0.15)' },
  modalTitle: { color: '#0f172a', fontSize: 16, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  closeBtn: { padding: 6, backgroundColor: 'rgba(21, 128, 61, 0.08)', borderRadius: 12 },
  
  dropdownItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4 },
  dropdownItemSelected: { backgroundColor: 'rgba(21, 128, 61, 0.12)' },
  dropdownItemText: { color: '#334155', fontSize: 14, textAlign: 'right', fontWeight: '600', fontFamily: 'Tajawal' },
  dropdownItemTextSelected: { color: '#15803d', fontWeight: 'bold' },

  floatingDockContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, left: 20, right: 20, alignItems: 'center', justifyContent: 'center' },
  floatingDock: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 24, backgroundColor: '#ffffff', overflow: 'hidden', padding: 8, borderWidth: 1, borderColor: 'rgba(21, 128, 61, 0.3)', width: '100%', maxWidth: 400, shadowColor: '#15803d', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  dockBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 },
  dockIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dockBtnText: { fontSize: 14, fontWeight: '800', fontFamily: 'Tajawal' },
  dockDivider: { width: 1, height: '60%', backgroundColor: 'rgba(21, 128, 61, 0.2)' }
});