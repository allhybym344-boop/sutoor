import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import { setExamStore } from '../../utils/examStore';
import { useSubscription } from '../context/SubscriptionContext';

const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

const arabicFonts = [
  { label: 'العربي التقليدي (Traditional Arabic)', value: 'Traditional Arabic' },
  { label: 'العربي المبسط (Simplified Arabic)', value: 'Simplified Arabic' },
  { label: 'تخطيط العربية (Arabic Typesetting)', value: 'Arabic Typesetting' },
  { label: 'تاهوما (Tahoma - ممتاز للشاشات)', value: 'Tahoma' },
  { label: 'سقالة مجلة (Sakkal Majalla)', value: 'Sakkal Majalla' },
  { label: 'أندلس (Andalus - للعناوين والزخرفة)', value: 'Andalus' },
  { label: 'أميري (Amiri - للبحوث والكتب)', value: 'Amiri' },
  { label: 'كايرو (Cairo - عصري)', value: 'Cairo' },
  { label: 'تجوال (Tajawal - انسيابي)', value: 'Tajawal' },
  { label: 'شنجا (Changa - عريض)', value: 'Changa' }
];

const sizeOptions = [
  { label: 'صغير جداً (10px)', value: '10px' },
  { label: 'صغير (12px)', value: '12px' },
  { label: 'أساسي (14px)', value: '14px' },
  { label: 'متوسط (15px)', value: '15px' },
  { label: 'كبير (17px)', value: '17px' },
  { label: 'كبير جداً (20px)', value: '20px' },
  { label: 'ضخم (24px)', value: '24px' }
];

const lineSpacingOptions = [
  { label: 'متراص جداً (1.3)', value: '1.3' },
  { label: 'متراص (1.4)', value: '1.4' },
  { label: 'عادي (1.65)', value: '1.65' },
  { label: 'مريح (1.95)', value: '1.95' },
  { label: 'واسع (2.3)', value: '2.3' },
  { label: 'واسع جداً (2.6)', value: '2.6' }
];

const headerShadingOptions = [
  { label: 'بدون تظليل (أبيض)', value: 'none' },
  { label: 'تأثير زجاجي فخم', value: 'glass' },
  { label: 'تدرج فخم (Gradient)', value: 'gradient' },
  { label: 'أزرق هادئ', value: 'blue_light' },
  { label: 'رمادي عصري', value: 'gray_light' },
  { label: 'أخضر هادئ', value: 'green_light' }
];

const questionShadingOptions = [
  { label: 'بدون تظليل (شفاف)', value: 'none' },
  { label: 'تدرج أنيق (Gradient)', value: 'gradient' },
  { label: 'أزرق فاتح جداً', value: 'blue_light' },
  { label: 'رمادي خفيف', value: 'gray_light' },
  { label: 'أخضر هادئ', value: 'green_light' }
];

const colorOptions = [
  { label: 'زيتوني داكن', value: '#3f4a2e' },
  { label: 'زيتوني أساسي', value: '#4B5320' },
  { label: 'أزرق ملكي', value: '#1e3a8a' },
  { label: 'أسود فحمي', value: '#0f172a' },
  { label: 'أخضر زمردي', value: '#065f46' },
  { label: 'عنابي داكن', value: '#7f1d1d' },
  { label: 'رمادي صلب', value: '#334155' },
  { label: 'أحمر قرمزي', value: '#be123c' },
  { label: 'أزرق بحري', value: '#0e7490' }
];

const glassColorOptions = [
  { label: 'بدون تأثير زجاجي (إيقاف)', value: 'none' },
  { label: 'أبيض ثلجي', value: 'rgba(255, 255, 255, 0.45)' },
  { label: 'زيتوني فاتح', value: 'rgba(75, 83, 32, 0.15)' },
  { label: 'أسود فحمي', value: 'rgba(15, 23, 42, 0.25)' },
  { label: 'أزرق ملكي', value: 'rgba(37, 99, 235, 0.25)' },
  { label: 'رمادي فضي', value: 'rgba(100, 116, 139, 0.3)' }
];

const borderStylesOptions = [
  { label: 'بدون إطار (None)', value: 'none' },
  { label: 'مزدوج رسمي (Double)', value: 'double' },
  { label: 'خط متصل (Solid)', value: 'solid' },
  { label: 'خط منقط (Dashed)', value: 'dashed' },
  { label: 'نقطي دقيق (Dotted)', value: 'dotted' },
  { label: 'ثلاثي الأبعاد غروفي (Groove)', value: 'groove' },
  { label: 'حافة بارزة (Ridge)', value: 'ridge' }
];

const borderWidthOptions = [
  { label: 'رفيع (2px)', value: '2px' },
  { label: 'متوسط (4px)', value: '4px' },
  { label: 'سميك (6px)', value: '6px' },
  { label: 'عريض جداً (8px)', value: '8px' }
];

const subStyleOptions = [
  { label: 'حروف أبجدية (أ، ب، ج...)', value: 'letters' },
  { label: 'أرقام إنجليزية (1، 2، 3...)', value: 'western' },
  { label: 'أرقام عربية مشرقية (١، ٢، ٣...)', value: 'eastern' }
];

const numberingStyleOptions = [
  { label: 'أرقام إنجليزية/غربية (1, 2, 3)', value: 'western' },
  { label: 'أرقام عربية مشرقية (١، ٢، ٣)', value: 'eastern' }
];

const questionTypeOptions = [
  { label: 'سؤال اعتيادي (نص / فروع)', value: 'text', icon: 'document-text-outline' },
  { label: 'قطعة خارجية مع أسئلة', value: 'comprehension', icon: 'book-outline' },
  { label: 'جدول بيانات (شبكة خلايا)', value: 'table', icon: 'grid-outline' },
  { label: 'اختيارات متعددة (MCQ)', value: 'radio-button-on-outline' },
  { label: 'إسقاطات / صندوق كلمات', value: 'fill', icon: 'create-outline' }
];

const imageSizeOptions = [
  { label: 'صغير (25%)', value: '25%' },
  { label: 'متوسط (50%)', value: '50%' },
  { label: 'كبير (75%)', value: '75%' },
  { label: 'عرض كامل (100%)', value: '100%' }
];

const imageAlignOptions = [
  { label: 'يمين (Right)', value: 'right' },
  { label: 'وسط (Center)', value: 'center' },
  { label: 'يسار (Left)', value: 'left' }
];

const layoutTemplates = [
  { id: 'classic', label: 'التقليدي', desc: 'توزيع متوازن (يمين، وسط، يسار)' },
  { id: 'ministry', label: 'الوزاري', desc: 'جدول رسمي بإطارات قوية' },
  { id: 'modern', label: 'العصري', desc: 'زوايا دائرية وتوزيع مرن' },
  { id: 'minimalist', label: 'البسيط', desc: 'مساحات بيضاء وخطوط دقيقة' },
  { id: 'boxed', label: 'المُؤطَر', desc: 'صناديق منفصلة لكل قسم' },
  { id: 'elegant', label: 'الراقي', desc: 'خطوط مزدوجة وتوسيط فاخر' },
  { id: 'centered', label: 'المركزي', desc: 'كل العناصر مكدسة بمنتصف الصفحة' },
  { id: 'ribbon', label: 'الشريطي', desc: 'شريط ملون عريض لعنوان الاختبار' },
  { id: 'grid', label: 'الشبكي', desc: 'شبكة خلايا منظمة للبيانات' },
  { id: 'split', label: 'المنقسم', desc: 'تقسيم ثنائي حاد (يمين ويسار)' },
  { id: 'compact', label: 'المضغوط', desc: 'توفير أقصى مساحة لورقة الأسئلة' },
  { id: 'underlined', label: 'المُسطّر', desc: 'خطوط سفلية لكل معلومة في الرأس' },
  { id: 'rounded', label: 'الكبسولة', desc: 'خلفيات بيضاوية ناعمة وعصرية' },
  { id: 'academic', label: 'الأكاديمي', desc: 'ترويسة جامعية رسمية' },
  { id: 'bold', label: 'العريض', desc: 'تركيز عالي وضخم على العنوان' }
];

const isColorValue = (val) => val && (val.startsWith('#') || val.startsWith('rgba'));

const formatNum = (num, style) => {
  const strNum = String(num);
  if (style === 'eastern') {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return strNum.replace(/\d/g, (d) => arabicNumbers[parseInt(d, 10)]);
  }
  return strNum; 
};

const getSubLabelText = (sIdx, subStyle, numStyle) => {
  if (subStyle === 'western') return formatNum(sIdx + 1, 'western');
  if (subStyle === 'eastern') return formatNum(sIdx + 1, 'eastern');
  return arabicLetters[sIdx] || formatNum(sIdx + 1, numStyle);
};

const ModalDropdown = React.memo(({ label, value, options, onSelect, isOpen, onToggle }) => {
  const selectedOpt = options.find(o => o.value === value) || options[0];

  return (
    <View style={styles.dropdownWrapper}>
      {label ? <Text style={styles.subLabel}>{label}</Text> : null}
      
      <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.dropdownHeader}>
        <View style={styles.dropdownHeaderInner}>
          {isColorValue(selectedOpt?.value) ? (
            <View style={[styles.colorDot, { backgroundColor: selectedOpt.value.includes('rgba') ? selectedOpt.value.replace(/[\d.]+\)$/g, '1)') : selectedOpt.value }]} />
          ) : null}
          <Text style={styles.dropdownHeaderText} numberOfLines={1}>
            {selectedOpt ? selectedOpt.label : 'اختر...'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#4B5320" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onToggle}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onToggle}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'اختر الخيار'}</Text>
              <TouchableOpacity onPress={onToggle} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#6E7A41" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              {options.map((opt) => {
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
                      {opt.icon && <Ionicons name={opt.icon} size={18} color="#4B5320" style={{ marginLeft: 8 }} />}
                      {isColorValue(opt.value) ? (
                        <View style={[styles.colorDot, { backgroundColor: opt.value.includes('rgba') ? opt.value.replace(/[\d.]+\)$/g, '1)') : opt.value }]} />
                      ) : null}
                      <Text style={[styles.dropdownItemText, isSelected ? styles.dropdownItemTextSelected : null]}>
                        {opt.label}
                      </Text>
                    </View>
                    {isSelected ? <Ionicons name="checkmark-circle" size={20} color="#4B5320" /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const WireframeRenderer = React.memo(({ templateId }) => {
  switch (templateId) {
    case 'classic':
      return (
        <View style={styles.wireframePaper}>
          <View style={[styles.wfRow, { borderBottomWidth: 1, borderColor: '#cbd5e1', paddingBottom: 4, marginBottom: 8 }]}>
            <View style={styles.wfLineShort} />
            <View style={styles.wfLineTitle} />
            <View style={styles.wfLineShort} />
          </View>
          <View style={styles.wfContentBlock} />
          <View style={[styles.wfRow, { borderTopWidth: 1, borderColor: '#cbd5e1', paddingTop: 4, marginTop: 'auto' }]}>
            <View style={styles.wfLineShort} /><View style={styles.wfLineShort} />
          </View>
        </View>
      );
    case 'ministry':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ borderWidth: 2, borderColor: '#6E7A41', padding: 4, marginBottom: 8 }}>
            <View style={[styles.wfRow, { justifyContent: 'space-between' }]}>
              <View style={[styles.wfLineShort, { width: 10 }]} />
              <View style={styles.wfLineTitle} />
              <View style={[styles.wfLineShort, { width: 10 }]} />
            </View>
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'modern':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ backgroundColor: '#f4f6f0', borderRadius: 8, padding: 6, marginBottom: 8, alignItems: 'center' }}>
            <View style={[styles.wfLineTitle, { backgroundColor: '#4B5320' }]} />
            <View style={[styles.wfRow, { marginTop: 4 }]}><View style={styles.wfLineShort} /><View style={styles.wfLineShort} /></View>
          </View>
          <View style={[styles.wfContentBlock, { borderRadius: 4 }]} />
        </View>
      );
    case 'minimalist':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ marginBottom: 10, alignItems: 'flex-start' }}>
            <View style={[styles.wfLineTitle, { marginBottom: 4 }]} />
            <View style={styles.wfLineShort} />
          </View>
          <View style={[styles.wfContentBlock, { height: 4 }]} />
          <View style={{ marginTop: 'auto', alignItems: 'center' }}><View style={styles.wfLineShort} /></View>
        </View>
      );
    case 'boxed':
      return (
        <View style={styles.wireframePaper}>
          <View style={[styles.wfRow, { marginBottom: 8 }]}>
            <View style={{ flex: 1, borderWidth: 1, borderColor: '#cbd5e1', marginHorizontal: 1, height: 16, borderRadius: 2 }} />
            <View style={{ flex: 1, borderWidth: 1, borderColor: '#cbd5e1', marginHorizontal: 1, height: 16, borderRadius: 2 }} />
            <View style={{ flex: 1, borderWidth: 1, borderColor: '#cbd5e1', marginHorizontal: 1, height: 16, borderRadius: 2 }} />
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'elegant':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#6E7A41', paddingVertical: 4, marginBottom: 8, alignItems: 'center' }}>
            <View style={styles.wfLineTitle} />
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'centered':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, borderColor: '#cbd5e1', paddingBottom: 4 }}>
            <View style={[styles.wfLineShort, { marginBottom: 2 }]} />
            <View style={[styles.wfLineTitle, { marginBottom: 2 }]} />
            <View style={styles.wfLineShort} />
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'ribbon':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ backgroundColor: '#4B5320', height: 12, width: '100%', marginBottom: 4, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ height: 2, width: 20, backgroundColor: '#fff' }} />
          </View>
          <View style={[styles.wfRow, { marginBottom: 8 }]}><View style={styles.wfLineShort}/><View style={styles.wfLineShort}/></View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'grid':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            <View style={{ width: '50%', borderWidth: 0.5, borderColor: '#cbd5e1', height: 10 }} />
            <View style={{ width: '50%', borderWidth: 0.5, borderColor: '#cbd5e1', height: 10 }} />
            <View style={{ width: '50%', borderWidth: 0.5, borderColor: '#cbd5e1', height: 10 }} />
            <View style={{ width: '50%', borderWidth: 0.5, borderColor: '#cbd5e1', height: 10 }} />
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'split':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ flexDirection: 'row-reverse', marginBottom: 8 }}>
            <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#cbd5e1', paddingRight: 4, alignItems: 'flex-start' }}><View style={styles.wfLineTitle}/></View>
            <View style={{ flex: 1, paddingLeft: 4, alignItems: 'flex-end' }}><View style={styles.wfLineShort}/><View style={[styles.wfLineShort, {marginTop: 2}]}/></View>
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'compact':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
            <View style={{ width: 8, height: 3, backgroundColor: '#6E7A41' }}/>
            <View style={{ width: 8, height: 3, backgroundColor: '#6E7A41' }}/>
            <View style={{ width: 8, height: 3, backgroundColor: '#6E7A41' }}/>
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'underlined':
      return (
        <View style={styles.wireframePaper}>
          <View style={[styles.wfRow, { marginBottom: 8 }]}>
            <View style={{ borderBottomWidth: 1, borderColor: '#6E7A41', width: 15, height: 6 }} />
            <View style={{ borderBottomWidth: 1, borderColor: '#6E7A41', width: 20, height: 6 }} />
            <View style={{ borderBottomWidth: 1, borderColor: '#6E7A41', width: 15, height: 6 }} />
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'rounded':
      return (
        <View style={styles.wireframePaper}>
          <View style={[styles.wfRow, { marginBottom: 8 }]}>
            <View style={{ backgroundColor: '#e9ece1', width: 18, height: 10, borderRadius: 5 }} />
            <View style={{ backgroundColor: '#f4f6f0', width: 24, height: 10, borderRadius: 5 }} />
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'academic':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#6E7A41' }} />
            <View style={{ alignItems: 'center', flex: 1 }}><View style={styles.wfLineTitle}/><View style={[styles.wfLineShort, {marginTop:2}]}/></View>
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'bold':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ flexDirection: 'row-reverse', marginBottom: 8, alignItems: 'center' }}>
            <View style={{ height: 16, backgroundColor: '#4B5320', flex: 2, borderRadius: 2 }} />
            <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 4 }}><View style={styles.wfLineShort}/></View>
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    default:
      return <View style={styles.wireframePaper} />;
  }
});

const LayoutTemplateSelector = React.memo(({ visible, currentTemplate, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.templateModalOverlay}>
        <View style={styles.templateModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>اختر قالب وهيكل الاختبار</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#6E7A41" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {layoutTemplates.map((tpl) => {
              const isSelected = tpl.id === currentTemplate;
              return (
                <TouchableOpacity 
                  key={tpl.id} 
                  activeOpacity={0.8}
                  style={[styles.templateCard, isSelected && styles.templateCardSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelect(tpl.id);
                  }}
                >
                  <View style={styles.templateWireframeContainer}>
                    <WireframeRenderer templateId={tpl.id} />
                  </View>

                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, isSelected && { color: '#4B5320' }]}>{tpl.label}</Text>
                    <Text style={styles.templateDesc}>{tpl.desc}</Text>
                  </View>
                  
                  <View style={styles.templateRadio}>
                    {isSelected && <View style={styles.templateRadioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const QuestionItem = React.memo(({ 
  item, 
  index, 
  onUpdateField, 
  onUpdateTableCell,
  onAddSub, 
  onUpdateSub, 
  onDeleteSub, 
  onAddFillSentence,
  onUpdateFillSentence,
  onDeleteFillSentence,
  onDeleteQuestion, 
  subStyle,
  numStyle,
  onOpenTypeModal,
  activeTypeDropdown
}) => {
  
  const pickImageForQuestion = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      onUpdateField(item.id, 'imageBase64', base64Img);
    }
  };

  const scanAndExtractText = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.prompt
          ? Alert.prompt(
              "الماسح الضوئي الذكي (AI Smart Scan)",
              "أدخل أو الصق النص المستخرج من الصورة لتعبئته تلقائياً:",
              [
                { text: "إلغاء", style: "cancel" },
                { 
                  text: "تعبئة النص", 
                  onPress: (text) => {
                    if (text && text.trim() !== '') {
                      if (item.type === 'passage') {
                        onUpdateField(item.id, 'passage', text);
                      } else {
                        onUpdateField(item.id, 'text', text);
                      }
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                  } 
                }
              ],
              "plain-text",
              item.type === 'passage' ? item.passage : item.text
            )
          : Alert.alert('نجاح', 'تم اختيار الصورة وتجهيزها.');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل اختيار الصورة.');
    }
  };

  const formattedQNum = formatNum(index + 1, numStyle);

  return (
    <View style={styles.worldClassQuestionCard}>
      <View style={styles.questionWorldHeader}>
        <LinearGradient colors={['#6E7A41', '#4B5320']} style={styles.worldQBadge}>
          <Text style={styles.worldQBadgeText}>{`السؤال ${formattedQNum}`}</Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <ModalDropdown 
            label="" 
            value={item.type || 'text'} 
            options={questionTypeOptions} 
            isOpen={activeTypeDropdown === item.id} 
            onToggle={onOpenTypeModal}
            onSelect={(v) => onUpdateField(item.id, 'type', v)}
          />
        </View>

        <TouchableOpacity onPress={() => onDeleteQuestion(item.id)} style={styles.worldDeleteBtn}>
          <Ionicons name="trash-bin-outline" size={17} color="#e11d48" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.worldOcrBtn} onPress={scanAndExtractText} activeOpacity={0.85}>
        <Ionicons name="scan-circle" size={20} color="#ea580c" />
        <Text style={styles.worldOcrText}>التقاط أو مسح نص السؤال بالذكاء الاصطناعي (Smart AI Scan)</Text>
      </TouchableOpacity>

      <TextInput 
        style={styles.worldMainInput}
        multiline
        value={item.text}
        onChangeText={(text) => onUpdateField(item.id, 'text', text)}
        placeholder="اكتب نص السؤال هنا بوضوح..."
        placeholderTextColor="#8c9a63"
      />

      <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 12}}>
        <TouchableOpacity style={[styles.innerBtn, { flex: 1, borderColor: item.imageBase64 ? '#4B5320' : 'rgba(75, 83, 32, 0.15)' }]} onPress={pickImageForQuestion}>
          <Ionicons name={item.imageBase64 ? "checkmark-circle" : "image"} size={18} color={item.imageBase64 ? '#4B5320' : '#6E7A41'} />
          <Text style={[styles.innerBtnText, {color: item.imageBase64 ? '#4B5320' : '#6E7A41'}]}>{item.imageBase64 ? 'تم إدراج صورة توضيحية (تغيير)' : 'إدراج صورة توضيحية للسؤال'}</Text>
        </TouchableOpacity>
        {item.imageBase64 ? (
          <TouchableOpacity style={{marginRight: 10, padding: 10}} onPress={() => onUpdateField(item.id, 'imageBase64', null)}>
             <Ionicons name="trash" size={20} color="#e11d48" />
          </TouchableOpacity>
        ) : null}
      </View>

      {item.imageBase64 ? (
        <View style={{flexDirection: 'row-reverse', gap: 10, marginTop: 10}}>
          <View style={{flex: 1}}>
            <ModalDropdown label="حجم الصورة بالورقة:" value={item.imageSize || '50%'} options={imageSizeOptions} isOpen={false} onToggle={() => {}} onSelect={v => onUpdateField(item.id, 'imageSize', v)} />
          </View>
          <View style={{flex: 1}}>
            <ModalDropdown label="محاذاة مكان الصورة:" value={item.imageAlign || 'center'} options={imageAlignOptions} isOpen={false} onToggle={() => {}} onSelect={v => onUpdateField(item.id, 'imageAlign', v)} />
          </View>
        </View>
      ) : null}

      {item.type === 'comprehension' ? (
        <View style={styles.worldExtraBox}>
          <Text style={styles.worldExtraTitle}>📖 نص القطعة القرائية الخارجية:</Text>
          <TextInput
            style={[styles.worldMainInput, { minHeight: 90 }]}
            multiline
            value={item.passage || ''}
            onChangeText={(text) => onUpdateField(item.id, 'passage', text)}
            placeholder="الصق نص القطعة هنا لظهر بشكل منسق..."
            placeholderTextColor="#8c9a63"
          />
        </View>
      ) : null}

      {item.type === 'table' ? (
        <View style={styles.worldExtraBox}>
          <Text style={styles.worldExtraTitle}>📊 إعدادات الجدول وتعبئة الخلايا:</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>عدد الصفوف:</Text>
              <TextInput
                style={[styles.inputField, { marginBottom: 6 }]}
                keyboardType="numeric"
                value={String(item.rows || 3)}
                onChangeText={(v) => onUpdateField(item.id, 'rows', parseInt(v, 10) || 2)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>عدد الأعمدة:</Text>
              <TextInput
                style={[styles.inputField, { marginBottom: 6 }]}
                keyboardType="numeric"
                value={String(item.cols || 3)}
                onChangeText={(v) => onUpdateField(item.id, 'cols', parseInt(v, 10) || 2)}
              />
            </View>
          </View>

          <Text style={[styles.subLabel, { marginTop: 12, color: '#4B5320' }]}>محتويات الخلايا:</Text>
          <View style={styles.tableGridContainer}>
            {Array.from({ length: item.rows || 3 }).map((_, rIdx) => (
              <View key={`row-${rIdx}`} style={styles.tableRow}>
                {Array.from({ length: item.cols || 3 }).map((_, cIdx) => {
                  const cellValue = item.tableData && item.tableData[rIdx] && item.tableData[rIdx][cIdx] ? item.tableData[rIdx][cIdx] : '';
                  return (
                    <TextInput
                      key={`cell-${cIdx}`}
                      style={styles.tableCellInput}
                      placeholder={`[${formatNum(rIdx+1, numStyle)},${formatNum(cIdx+1, numStyle)}]`}
                      placeholderTextColor="#8c9a63"
                      value={cellValue}
                      onChangeText={(txt) => onUpdateTableCell(item.id, rIdx, cIdx, txt)}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {item.type === 'mcq' ? (
        <View style={styles.worldExtraBox}>
          <Text style={styles.worldExtraTitle}>🔘 خيارات الاختيارات المتعددة (MCQ):</Text>
          <TextInput
            style={[styles.inputField, { marginBottom: 0 }]}
            value={item.mcqChoices || ''}
            onChangeText={(text) => onUpdateField(item.id, 'mcqChoices', text)}
            placeholder="مثال: أ) الخيار الأول  ب) الخيار الثاني  ج) الخيار الثالث"
            placeholderTextColor="#8c9a63"
          />
        </View>
      ) : null}

      {item.type === 'fill' ? (
        <View style={styles.worldExtraBox}>
          <Text style={styles.worldExtraTitle}>🔤 صندوق الكلمات (Word Bank):</Text>
          <TextInput
            style={[styles.inputField, { marginBottom: 16 }]}
            value={item.wordBank || ''}
            onChangeText={(text) => onUpdateField(item.id, 'wordBank', text)}
            placeholder="مثال: (سريع، بطيء، دقيق)"
            placeholderTextColor="#8c9a63"
          />
          
          <View style={styles.subHeaderRow}>
            <Text style={styles.subLabel}>الجمل ذات الفراغات:</Text>
            <TouchableOpacity onPress={() => onAddFillSentence(item.id)} style={styles.addSubBtn}>
              <Ionicons name="add" size={16} color="#4B5320" />
              <Text style={styles.addSubText}>إضافة عبارة</Text>
            </TouchableOpacity>
          </View>

          {item.fillSentences ? item.fillSentences.map((fs, fIdx) => (
            <View key={fs.id} style={styles.subItemRowAr}>
              <LinearGradient colors={['rgba(75, 83, 32, 0.15)', 'rgba(75, 83, 32, 0.05)']} style={styles.subLetterBadge}>
                <Text style={styles.subLetterText}>{formatNum(fIdx + 1, numStyle)})</Text>
              </LinearGradient>
              <TextInput 
                style={styles.subInput}
                multiline
                value={fs.text}
                onChangeText={(text) => onUpdateFillSentence(item.id, fs.id, text)}
                placeholder={`العبارة ${formatNum(fIdx + 1, numStyle)}...`}
                placeholderTextColor="#8c9a63"
              />
              <TouchableOpacity onPress={() => onDeleteFillSentence(item.id, fs.id)} style={styles.subDeleteBtn}>
                <Ionicons name="close-circle" size={20} color="#e11d48" />
              </TouchableOpacity>
            </View>
          )) : null}
        </View>
      ) : null}

      {(item.type === 'text' || item.type === 'comprehension') ? (
        <View style={styles.subContainerAr}>
          <View style={styles.subHeaderRow}>
            <Text style={styles.subLabel}>الفروع الداخلية:</Text>
            <TouchableOpacity onPress={() => onAddSub(item.id)} style={styles.addSubBtn}>
              <Ionicons name="add" size={16} color="#4B5320" />
              <Text style={styles.addSubText}>إضافة فرع</Text>
            </TouchableOpacity>
          </View>
          {item.subQuestions ? item.subQuestions.map((sub, sIdx) => {
            const label = getSubLabelText(sIdx, subStyle, numStyle);
            return (
              <View key={sub.id} style={styles.subItemRowAr}>
                <LinearGradient colors={['rgba(75, 83, 32, 0.15)', 'rgba(75, 83, 32, 0.05)']} style={styles.subLetterBadge}>
                  <Text style={styles.subLetterText}>{label})</Text>
                </LinearGradient>
                <TextInput 
                  style={styles.subInput}
                  multiline
                  value={sub.text}
                  onChangeText={(text) => onUpdateSub(item.id, sub.id, text)}
                  placeholder={`نص الفرع (${label})...`}
                  placeholderTextColor="#8c9a63"
                />
                <TouchableOpacity onPress={() => onDeleteSub(item.id, sub.id)} style={styles.subDeleteBtn}>
                  <Ionicons name="close-circle" size={18} color="#e11d48" />
                </TouchableOpacity>
              </View>
            );
          }) : null}
        </View>
      ) : null}
    </View>
  );
});

export default function ArabicExam() {
  const router = useRouter();
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();
  
  const [examMeta, setExamMeta] = useState({
    school: 'مدرسة المستقبل الثانوية الأهلية',
    examTitle: 'امتحان نهاية الفصل الدراسي الثاني',
    academicYear: 'العام الدراسي 2025 - 2026 م',
    grade: 'الصف الثالث الثانوي (العلمي)',
    subject: 'مادة اللغة العربية',
    time: 'الزمن: ساعتان فقط',
    teacherName: 'أ. محمد عبد الله',
    closingText: 'مع تمنياتنا للجميع بالتوفيق والنجاح'
  });

  const [examNote, setExamNote] = useState('ملاحظة: أجب عن جميع الأسئلة الآتية:');

  const [examConfig, setExamConfig] = useState({
    layoutTemplate: 'classic',
    header: { font: 'Traditional Arabic', size: '14.5px', color: '#0f172a' },
    questions: { font: 'Simplified Arabic', size: '15px', color: '#0f172a', subStyle: 'letters', numStyle: 'eastern', shading: 'none' },
    table: { size: '14px', color: '#0f172a', shading: 'none' },
    pageBorder: { style: 'double', width: '4px', color: '#0f172a' },
    pdfLineSpacing: '1.65',
    pdfHeaderShading: 'none',
    glassEffects: {
      header: 'none',
      margin: 'none',
      border: 'none'
    }
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeTypeDropdown, setActiveTypeDropdown] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGenerating] = useState(false);

  const toggleDropdown = useCallback((key) => {
    Haptics.selectionAsync();
    setActiveDropdown(prev => (prev === key ? null : key));
    setActiveTypeDropdown(null);
  }, []);

  const toggleTypeDropdown = useCallback((id) => {
    Haptics.selectionAsync();
    setActiveTypeDropdown(prev => (prev === id ? null : id));
    setActiveDropdown(null);
  }, []);
  
  const [questions, setQuestions] = useState([
    { 
      id: '1', 
      type: 'text',
      text: 'ما هو تعريف البلاغة وفي أي علم تُدرس محسّناتها البديعية؟', 
      subQuestions: [],
      imageBase64: null,
      imageSize: '50%',
      imageAlign: 'center'
    }
  ]);

  const handleUpdateField = useCallback((id, field, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, [field]: value };
        if (field === 'rows' || field === 'cols') {
          const rCount = field === 'rows' ? value : (q.rows || 3);
          const cCount = field === 'cols' ? value : (q.cols || 3);
          const newMatrix = [];
          for (let r = 0; r < rCount; r++) {
            newMatrix[r] = [];
            for (let c = 0; c < cCount; c++) {
              newMatrix[r][c] = q.tableData && q.tableData[r] && q.tableData[r][c] ? q.tableData[r][c] : '';
            }
          }
          updated.tableData = newMatrix;
        }
        return updated;
      }
      return q;
    }));
  }, []);

  const handleUpdateTableCell = useCallback((id, rIdx, cIdx, text) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const matrix = q.tableData ? q.tableData.map(row => [...row]) : [];
        if (!matrix[rIdx]) matrix[rIdx] = [];
        matrix[rIdx][cIdx] = text;
        return { ...q, tableData: matrix };
      }
      return q;
    }));
  }, []);

  const handleAddFillSentence = useCallback((questionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, fillSentences: [...(q.fillSentences || []), { id: Date.now().toString(), text: '' }] } : q));
  }, []);

  const handleUpdateFillSentence = useCallback((questionId, sentenceId, newText) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, fillSentences: q.fillSentences.map(fs => fs.id === sentenceId ? { ...fs, text: newText } : fs) } : q));
  }, []);

  const handleDeleteFillSentence = useCallback((questionId, sentenceId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, fillSentences: q.fillSentences.filter(fs => fs.id !== sentenceId) } : q));
  }, []);

  const handleAddSubQuestion = useCallback((questionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, subQuestions: [...(q.subQuestions || []), { id: Date.now().toString(), text: '' }] } : q));
  }, []);

  const handleUpdateSubQuestion = useCallback((questionId, subId, newText) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, subQuestions: q.subQuestions.map(sub => sub.id === subId ? { ...sub, text: newText } : sub) } : q));
  }, []);

  const handleDeleteSubQuestion = useCallback((questionId, subId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, subQuestions: q.subQuestions.filter(sub => sub.id !== subId) } : q));
  }, []);

  const handleDeleteQuestion = useCallback((id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const handleAddQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQuestions(prev => [...prev, { id: Date.now().toString(), type: 'text', text: '', rows: 3, cols: 3, tableData: [['','',''],['','',''],['','','']], fillSentences: [], subQuestions: [], imageBase64: null, imageSize: '50%', imageAlign: 'center' }]);
  };

  const getBackgroundColor = (type) => {
    const colors = {
      blue_light: '#eff6ff', gray_light: '#f8fafc', green_light: '#f0fdf4',
      none: 'transparent', gradient: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', glass: 'rgba(255,255,255,0.45)'
    };
    return colors[type] || 'transparent';
  };

  const generateExamHTML = () => {
    const lineSpacing = examConfig.pdfLineSpacing || '1.65';
    const numStyle = examConfig.questions.numStyle || 'eastern';
    const subStyle = examConfig.questions.subStyle || 'letters';
    const tpl = examConfig.layoutTemplate || 'classic';
    const { header: gHeader, margin: gMargin, border: gBorder } = examConfig.glassEffects;

    let pageMarginValue = gMargin !== 'none' ? '0' : '6mm';
    
    let bodyCSS = '';
    let containerCSS = '';
    
    if (gMargin !== 'none') {
      bodyCSS = `
        background: ${gMargin};
        background-image: 
          linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, rgba(0,0,0,0.05) 100%),
          radial-gradient(circle at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 35%);
        padding: 12mm;
        min-height: 297mm;
        box-sizing: border-box;
      `;
      containerCSS = `
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        min-height: calc(297mm - 24mm);
      `;
    } else {
      bodyCSS = `background: #ffffff;`;
      containerCSS = `
        border-radius: 4px;
        min-height: 281mm;
        ${examConfig.pageBorder.style !== 'none' && gBorder === 'none' ? 'box-shadow: inset 0 0 0 1.5px rgba(0, 0, 0, 0.05);' : ''}
      `;
    }

    if (gBorder !== 'none') {
      containerCSS += `
        border: ${examConfig.pageBorder.width} solid ${gBorder};
        box-shadow: 0 0 15px ${gBorder}, inset 0 0 15px ${gBorder};
      `;
    } else if (gMargin === 'none') {
      containerCSS += `border: ${examConfig.pageBorder.style === 'none' ? 'none' : `${examConfig.pageBorder.width} ${examConfig.pageBorder.style} ${examConfig.pageBorder.color}`};`;
    } else {
      containerCSS += `border: 1px solid rgba(255,255,255,0.6);`;
    }

    let headerBgCSS = getBackgroundColor(examConfig.pdfHeaderShading);
    let headerExtraCSS = '';
    
    if (gHeader !== 'none') {
      headerBgCSS = gHeader;
      headerExtraCSS = `
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      `;
    } else if (examConfig.pdfHeaderShading === 'glass') {
       headerExtraCSS = `backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.4);`;
    } else if (examConfig.pdfHeaderShading === 'none') {
      headerBgCSS = '#ffffff';
    }

    const qShadingType = examConfig.questions.shading || 'none';
    const qItemBgCSS = getBackgroundColor(qShadingType);
    const hColor = examConfig.header.color;
    const qColor = examConfig.questions.color;
    const tableSize = examConfig.table.size;
    const tableColor = examConfig.table.color;
    let tableBgCSS = getBackgroundColor(examConfig.table.shading);
    if(examConfig.table.shading === 'none') tableBgCSS = '#e2e8f0';

    let renderedHeaderHTML = '';
    let renderedFooterHTML = '';

    switch (tpl) {
      case 'ministry':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom:24px;">
            <table style="width: 100%; border-collapse: collapse; border: 2px solid ${hColor}; background: ${headerBgCSS}; ${headerExtraCSS}">
              <tr>
                <td style="border: 1px solid ${hColor}; padding: 10px; width: 30%; text-align: right; vertical-align: middle;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${examMeta.school}</div>
                  <div>المادة: ${examMeta.subject}</div>
                </td>
                <td style="border: 1px solid ${hColor}; padding: 10px; width: 40%; text-align: center; vertical-align: middle;">
                  <h1 style="margin: 0 0 6px 0; font-size: calc(${examConfig.header.size} + 4px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
                  <div style="font-weight: bold;">${examMeta.academicYear}</div>
                </td>
                <td style="border: 1px solid ${hColor}; padding: 10px; width: 30%; text-align: left; vertical-align: middle;">
                  <div style="font-weight: bold; margin-bottom: 4px;">الصف: ${examMeta.grade}</div>
                  <div>الزمن: ${examMeta.time}</div>
                </td>
              </tr>
            </table>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
            <div style="text-align: right; width: 33%;">${examMeta.teacherName ? `مدرس المادة: ${examMeta.teacherName}` : ''}</div>
            <div style="text-align: center; width: 33%; font-weight: bold; padding: 4px 15px; border: 1.5px solid ${hColor}; border-radius: 4px;">${examMeta.closingText}</div>
            <div style="text-align: left; width: 33%;">انتهت الأسئلة</div>
          </div>`;
        break;

      case 'modern':
        renderedHeaderHTML = `
          <div class="exam-header" style="background: ${headerBgCSS}; ${headerExtraCSS}; border-radius: 16px; padding: 20px; margin-bottom:20px;">
            <div style="text-align: center; width: 100%;">
              <h1 style="margin: 0 0 8px 0; font-size: calc(${examConfig.header.size} + 6px); font-weight: 900; color: #fff; background: ${hColor}; padding: 8px 20px; display: inline-block; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${examMeta.examTitle}</h1>
              <div style="display: flex; justify-content: space-between; margin-top: 15px; padding: 0 10px; font-weight: 700; color: ${hColor}; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 15px;">
                <div style="text-align: right; line-height: 1.6;"><div>${examMeta.school}</div><div>المادة: ${examMeta.subject}</div></div>
                <div style="text-align: center; line-height: 1.6;"><div style="color: #64748b;">${examMeta.academicYear}</div></div>
                <div style="text-align: left; line-height: 1.6;"><div>${examMeta.grade}</div><div>${examMeta.time}</div></div>
              </div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
            <div style="text-align: right; color: #64748b; width: 30%;">${examMeta.teacherName ? `أستاذ المادة / ${examMeta.teacherName}` : ''}</div>
            <div style="text-align: center; width: 40%; color: ${hColor}; font-weight: 900; background: rgba(241,245,249,0.8); padding: 6px 20px; border-radius: 20px;">${examMeta.closingText}</div>
            <div style="text-align: left; color: #64748b; width: 30%;">بالتوفيق</div>
          </div>`;
        break;

      case 'minimalist':
        renderedHeaderHTML = `
          <div class="exam-header" style="background: transparent; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; display:flex; flex-direction: column;">
            <h1 style="margin: 0 0 5px 0; font-size: calc(${examConfig.header.size} + 6px); font-weight: 900; color: #000; letter-spacing: -0.5px;">${examMeta.examTitle}</h1>
            <div style="display: flex; width: 100%; justify-content: space-between; font-weight: 600; color: #333; margin-top: 8px;">
              <div>${examMeta.school} &nbsp;|&nbsp; ${examMeta.subject}</div>
              <div>${examMeta.grade} &nbsp;|&nbsp; ${examMeta.academicYear} &nbsp;|&nbsp; ${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="border-top: 1px solid #ccc; padding-top: 10px; display:flex; flex-direction: row; justify-content: center; color: #333; margin-top:24px;">
            <span style="margin: 0 15px;">${examMeta.teacherName}</span>
            <span style="color: #ccc;">|</span>
            <span style="margin: 0 15px; font-weight: bold;">${examMeta.closingText}</span>
          </div>`;
        break;

      case 'boxed':
        renderedHeaderHTML = `
          <div class="exam-header" style="display:flex; justify-content:space-between; gap:10px; margin-bottom:20px;">
            <div style="flex:1; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: right; background: ${headerBgCSS}; ${headerExtraCSS}">
              <div style="font-weight:900; color:${hColor}; margin-bottom:4px;">${examMeta.school}</div>
              <div style="color:#334155;">المادة: ${examMeta.subject}</div>
            </div>
            <div style="flex:1.2; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: center; background: ${headerBgCSS}; ${headerExtraCSS}">
              <h1 style="margin:0 0 4px 0; font-size: calc(${examConfig.header.size} + 2px); font-weight:900; color:${hColor};">${examMeta.examTitle}</h1>
              <div style="color:#64748b;">${examMeta.academicYear}</div>
            </div>
            <div style="flex:1; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: left; background: ${headerBgCSS}; ${headerExtraCSS}">
              <div style="font-weight:900; color:${hColor}; margin-bottom:4px;">${examMeta.grade}</div>
              <div style="color:#334155;">الزمن: ${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; margin-top:20px; border: 2px solid ${hColor}; border-radius: 8px; padding: 10px; background: rgba(255,255,255,0.5);">
            <div style="text-align: right;">${examMeta.teacherName}</div>
            <div style="text-align: center; font-weight:bold; color:${hColor};">${examMeta.closingText}</div>
            <div style="text-align: left;">تمنياتنا بالنجاح</div>
          </div>`;
        break;

      case 'elegant':
        renderedHeaderHTML = `
          <div class="exam-header" style="border-top: 3px double ${hColor}; border-bottom: 3px double ${hColor}; padding: 15px 0; margin-bottom: 25px; text-align: center; background: ${headerBgCSS}; ${headerExtraCSS}">
            <h1 style="margin: 0 0 10px 0; font-size: calc(${examConfig.header.size} + 6px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
            <div style="display: flex; justify-content: space-around; font-weight: 600; color: #475569;">
              <span>${examMeta.school}</span>
              <span>•</span>
              <span>${examMeta.subject}</span>
              <span>•</span>
              <span>${examMeta.grade}</span>
              <span>•</span>
              <span>${examMeta.time}</span>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="border-top: 3px double ${hColor}; padding-top: 15px; margin-top: 25px; text-align: center;">
            <div style="font-weight: 900; font-size: calc(${examConfig.header.size} + 2px); color: ${hColor}; margin-bottom: 5px;">${examMeta.closingText}</div>
            <div style="color: #64748b;">إعداد: ${examMeta.teacherName}</div>
          </div>`;
        break;

      case 'centered':
        renderedHeaderHTML = `
          <div class="exam-header" style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid rgba(0,0,0,0.1); background: ${headerBgCSS}; ${headerExtraCSS}">
            <h3 style="margin: 0 0 5px 0; color: #475569;">${examMeta.school}</h3>
            <h1 style="margin: 0 0 10px 0; font-size: calc(${examConfig.header.size} + 8px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
            <div style="font-weight: bold; color: #334155; display: inline-flex; gap: 20px; background: rgba(0,0,0,0.03); padding: 5px 15px; border-radius: 20px;">
              <span>المادة: ${examMeta.subject}</span>
              <span>الصف: ${examMeta.grade}</span>
              <span>الزمن: ${examMeta.time}</span>
            </div>
            <div style="margin-top: 5px; color: #94a3b8; font-size: 0.9em;">${examMeta.academicYear}</div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px solid rgba(0,0,0,0.1);">
            <div style="font-weight: 900; color: ${hColor}; margin-bottom: 5px;">${examMeta.closingText}</div>
            <div style="color: #64748b;">${examMeta.teacherName}</div>
          </div>`;
        break;

      case 'ribbon':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 25px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="background: ${hColor}; color: #ffffff; text-align: center; padding: 12px; border-radius: 6px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 4px); font-weight: 900;">${examMeta.examTitle}</h1>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: #334155; padding: 0 10px;">
              <div style="text-align: right;"><div>${examMeta.school}</div><div>${examMeta.academicYear}</div></div>
              <div style="text-align: center;"><div>المادة: ${examMeta.subject}</div></div>
              <div style="text-align: left;"><div>${examMeta.grade}</div><div>${examMeta.time}</div></div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:25px; padding-top: 15px; border-top: 2px solid ${hColor};">
            <div style="width: 30%; text-align:right;">${examMeta.teacherName}</div>
            <div style="width: 40%; text-align:center; background: ${hColor}; color: #fff; padding: 4px 10px; border-radius: 4px;">${examMeta.closingText}</div>
            <div style="width: 30%; text-align:left;">انتهت الصفحة</div>
          </div>`;
        break;

      case 'grid':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 20px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <h1 style="text-align: center; margin: 0 0 15px 0; color: ${hColor}; font-size: calc(${examConfig.header.size} + 4px);">${examMeta.examTitle}</h1>
            <div style="display: flex; flex-wrap: wrap; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-bottom: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; font-weight: bold;">المدرسة: ${examMeta.school}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-bottom: 1px solid #cbd5e1; font-weight: bold;">العام: ${examMeta.academicYear}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-left: 1px solid #cbd5e1; font-weight: bold;">المادة: ${examMeta.subject}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; font-weight: bold;">الصف والزمن: ${examMeta.grade} - ${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display: flex; justify-content: space-between; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-top: 20px; background: rgba(248,250,252,0.8);">
            <div style="font-weight:bold;">${examMeta.teacherName}</div>
            <div style="font-weight:bold; color: ${hColor};">${examMeta.closingText}</div>
          </div>`;
        break;

      case 'split':
        renderedHeaderHTML = `
          <div class="exam-header" style="display: flex; margin-bottom: 25px; border-bottom: 3px solid ${hColor}; padding-bottom: 15px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="flex: 1; border-left: 2px dashed #94a3b8; padding-right: 15px; display: flex; flex-direction: column; justify-content: center;">
              <h1 style="margin: 0 0 5px 0; font-size: calc(${examConfig.header.size} + 6px); color: ${hColor}; font-weight: 900;">${examMeta.examTitle}</h1>
              <div style="font-size: 1.1em; font-weight: bold; color: #475569;">${examMeta.school}</div>
            </div>
            <div style="flex: 1; padding-left: 15px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; font-weight: bold; line-height: 1.8;">
              <div>المادة: <span style="color:${hColor};">${examMeta.subject}</span></div>
              <div>الصف: <span style="color:${hColor};">${examMeta.grade}</span></div>
              <div>الزمن: <span style="color:${hColor};">${examMeta.time}</span> | ${examMeta.academicYear}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display: flex; margin-top: 25px; border-top: 3px solid ${hColor}; padding-top: 15px;">
            <div style="flex: 1; font-weight: bold;">${examMeta.teacherName}</div>
            <div style="flex: 1; text-align: left; font-weight: 900; color: ${hColor};">${examMeta.closingText}</div>
          </div>`;
        break;

      case 'compact':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 15px; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 8px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <span style="font-weight: 900; font-size: calc(${examConfig.header.size} + 2px); margin-left: 15px; color: ${hColor};">${examMeta.examTitle}</span>
            <span style="font-weight: bold; margin-left: 10px;">${examMeta.school}</span>
            <span style="color: #475569;">(${examMeta.subject} - ${examMeta.grade} - ${examMeta.time})</span>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 15px; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; font-size: 0.9em;">
            <span style="margin-right: 20px;">${examMeta.teacherName}</span>
            <span style="font-weight: bold; color: ${hColor};">${examMeta.closingText}</span>
          </div>`;
        break;

      case 'underlined':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 20px; display: flex; flex-wrap: wrap; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="width: 100%; text-align: center; margin-bottom: 15px;">
              <h1 style="margin: 0; display: inline-block; border-bottom: 3px solid ${hColor}; padding-bottom: 5px; color: ${hColor};">${examMeta.examTitle}</h1>
            </div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: right;">المدرسة: ${examMeta.school}</div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: center;">المادة: ${examMeta.subject}</div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: left;">الزمن: ${examMeta.time}</div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 20px; display: flex; justify-content: space-between;">
            <div style="width: 45%; border-bottom: 1.5px dotted #000; font-weight: bold;">توقيع المدرس: ${examMeta.teacherName}</div>
            <div style="width: 45%; border-bottom: 1.5px dotted #000; text-align: left; font-weight: bold; color: ${hColor};">${examMeta.closingText}</div>
          </div>`;
        break;

      case 'rounded':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 25px; display: flex; flex-wrap: wrap; gap: 10px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="width: 100%; text-align: center; background: rgba(241,245,249,0.9); padding: 15px; border-radius: 30px; margin-bottom: 10px;">
              <h1 style="margin: 0; color: ${hColor};">${examMeta.examTitle}</h1>
            </div>
            <div style="flex: 1; background: #e2e8f0; padding: 10px; border-radius: 20px; text-align: center; font-weight: bold;">${examMeta.school}</div>
            <div style="flex: 1; background: #e2e8f0; padding: 10px; border-radius: 20px; text-align: center; font-weight: bold;">${examMeta.subject} - ${examMeta.grade}</div>
            <div style="flex: 1; background: #e2e8f0; padding: 10px; border-radius: 20px; text-align: center; font-weight: bold;">${examMeta.time}</div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 25px; display: flex; justify-content: center; gap: 20px;">
            <div style="background: rgba(241,245,249,0.9); padding: 10px 20px; border-radius: 20px; font-weight: bold;">${examMeta.teacherName}</div>
            <div style="background: ${hColor}; color: #fff; padding: 10px 20px; border-radius: 20px; font-weight: bold;">${examMeta.closingText}</div>
          </div>`;
        break;

      case 'academic':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #000; padding-bottom: 10px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="width: 25%; text-align: center;">
              <div style="width: 60px; height: 60px; border-radius: 30px; border: 2px solid ${hColor}; margin: 0 auto 5px auto; display:flex; align-items:center; justify-content:center; color:${hColor}; font-weight:bold; font-size:12px;">شعار</div>
            </div>
            <div style="width: 50%; text-align: center; line-height: 1.5;">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 4px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
              <div style="font-weight: bold; font-size: 1.1em;">${examMeta.school}</div>
            </div>
            <div style="width: 25%; text-align: left; font-weight: bold; line-height: 1.6;">
              <div>${examMeta.academicYear}</div>
              <div>${examMeta.subject}</div>
              <div>${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 25px; display: flex; justify-content: space-between; border-top: 4px solid #000; padding-top: 10px; font-weight: bold;">
            <div>أستاذ المقرر: ${examMeta.teacherName}</div>
            <div style="text-align: center; color: ${hColor};">${examMeta.closingText}</div>
            <div>الصفحة الأخيرة</div>
          </div>`;
        break;

      case 'bold':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 30px; display: flex; align-items: stretch; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="flex: 2; background: #0f172a; color: #fff; padding: 20px; border-top-right-radius: 12px; border-bottom-right-radius: 12px; display: flex; flex-direction: column; justify-content: center;">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 10px); line-height: 1.2;">${examMeta.examTitle}</h1>
              <div style="color: #94a3b8; margin-top: 10px; font-size: 1.1em;">${examMeta.subject} | ${examMeta.grade}</div>
            </div>
            <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: center; font-weight: bold; color: #334155; text-align: left;">
              <div style="margin-bottom: 8px;">${examMeta.school}</div>
              <div style="margin-bottom: 8px;">${examMeta.academicYear}</div>
              <div>الزمن: ${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 30px; padding: 15px; background: #0f172a; color: #fff; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #94a3b8;">${examMeta.teacherName}</div>
            <div style="font-weight: 900; font-size: 1.1em;">${examMeta.closingText}</div>
          </div>`;
        break;

      default:
        renderedHeaderHTML = `
          <div class="exam-header classic-layout" style="background: ${headerBgCSS}; border-bottom: 3px solid ${hColor}; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; margin-bottom: 18px; ${headerExtraCSS}">
            <div style="width: 30%; text-align: right; padding-right: 26px; font-weight: 700; color: ${hColor};"><div>${examMeta.school}</div></div>
            <div style="text-align: center; width: 40%; line-height: 1.5;">
              <h1 style="margin: 0 0 4px 0; font-size: calc(${examConfig.header.size} + 3px); font-weight: 900; color: ${hColor}; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">${examMeta.examTitle}</h1>
              <div style="font-size: calc(${examConfig.header.size} - 1.5px); font-weight: 700; color: ${hColor}; opacity: 0.85;">${examMeta.academicYear}</div>
            </div>
            <div style="width: 30%; text-align: left; padding-left: 26px; font-weight: 700; color: ${hColor};">
              <div>الـصـف: ${examMeta.grade}</div><div>الـمـادة: ${examMeta.subject}</div><div>الـوقـت: ${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; font-weight: 700; border-top: 1.5px dashed rgba(203, 213, 225, 0.8); margin-top: 24px;">
            <div style="width: 35%; text-align: right;"></div>
            <div style="width: 30%; text-align: center; font-weight: 900;">${examMeta.closingText}</div>
            <div style="width: 35%; text-align: left;">${examMeta.teacherName ? `إعداد الأستاذ: ${examMeta.teacherName}` : ''}</div>
          </div>`;
    }

    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800;900&family=Changa:wght@400;700&family=Tajawal:wght@400;700;900&display=swap');
            @page { size: A4 portrait; margin: ${pageMarginValue}; }
            body { 
              color: #0f172a; margin: 0; -webkit-print-color-adjust: exact; line-height: ${lineSpacing}; 
              ${bodyCSS}
            }
            .exam-container { 
              padding: 10mm 10mm; box-sizing: border-box; 
              display: flex; flex-direction: column; justify-content: space-between;
              ${containerCSS}
            }
            .exam-content-area { flex: 1; }
            
            .exam-header, .exam-footer { direction: rtl; font-family: '${examConfig.header.font}', serif; font-size: ${examConfig.header.size}; }
            
            .note-title { 
              direction: rtl; font-family: '${examConfig.questions.font}', sans-serif;
              font-weight: 900; font-size: ${examConfig.questions.size}; margin-bottom: 18px; color: ${qColor};
              ${tpl === 'minimalist' || tpl === 'compact' ? 'border-bottom: 1px solid #ccc; padding-bottom: 5px;' : `background: rgba(224, 242, 254, 0.8); padding: 9px 12px; border-radius: 4px; border-right: 5px solid ${qColor};`}
            }
            .questions-list { direction: rtl; font-family: '${examConfig.questions.font}', sans-serif; display: flex; flex-direction: column; gap: 14px; }
            .question-item { font-size: ${examConfig.questions.size}; background: ${qItemBgCSS}; padding: ${qShadingType !== 'none' ? '12px 14px' : '2px 0'}; border-radius: ${qShadingType !== 'none' ? '6px' : '0'}; border: ${qShadingType !== 'none' ? '1px solid rgba(0,0,0,0.06)' : 'none'}; }
            .question-main { display: flex; align-items: flex-start; margin-bottom: 8px; }
            .question-num { font-weight: 900; min-width: 48px; color: #ffffff; background: ${tpl === 'minimalist' ? '#000' : qColor}; text-align: center; border-radius: 4px; padding: 3px 0; margin-left: 12px; }
            .question-text { flex: 1; font-weight: 800; color: #0f172a; }
            
            .passage-box { background: rgba(248, 250, 252, 0.9); border: 1px solid rgba(203, 213, 225, 0.8); padding: 10px 12px; border-radius: 6px; margin-bottom: 10px; font-size: calc(${examConfig.questions.size} - 0.5px); line-height: 1.6; }
            .word-bank-box { background: rgba(241, 245, 249, 0.9); border: 1px dashed rgba(148, 163, 184, 0.8); padding: 6px 12px; border-radius: 4px; margin-bottom: 10px; font-weight: bold; text-align: center; }
            
            .exam-table { width: 100%; border-collapse: collapse; margin-top: 8px; border: 1.5px solid ${tableColor}; }
            .exam-table th, .exam-table td { border: 1px solid ${tableColor}; padding: 8px; text-align: center; font-size: ${tableSize}; }
            .exam-table th { background: ${tableBgCSS}; color: ${tableColor}; font-weight: bold; }
            .exam-table td { color: #0f172a; }

            .fill-sentences-list { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
            .fill-sentence-item { display: flex; align-items: flex-start; font-size: calc(${examConfig.questions.size} - 0.5px); }
            .fill-num { font-weight: 900; color: ${qColor}; min-width: 28px; }

            .sub-questions-list { margin-right: 54px; border-right: 2.5px dashed rgba(147, 197, 253, 0.8); padding-right: 14px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
            .sub-question-item { display: flex; align-items: flex-start; font-size: calc(${examConfig.questions.size} - 1px); }
            .sub-letter { font-weight: 900; color: ${tpl === 'minimalist' ? '#000' : qColor}; min-width: 28px; background: rgba(240, 253, 244, 0.9); border: 1px solid rgba(187, 247, 208, 0.8); border-radius: 3px; text-align: center; padding: 2px 0; margin-left: 8px; }
            .sub-text { flex: 1; font-weight: 700; color: #334155; }
          </style>
        </head>
        <body>
          <div class="exam-container">
            <div class="exam-content-area">
              ${renderedHeaderHTML}
              <div class="note-title">${examNote}</div>
              <div class="questions-list">
                ${questions.map((q, idx) => {
                  let contentHTML = '';
                  const formattedQNum = formatNum(idx + 1, numStyle);
                  
                  if (q.type === 'comprehension') {
                    contentHTML += `<div class="passage-box"><strong>القطعة:</strong> ${q.passage || ''}</div>`;
                  } else if (q.type === 'table') {
                    const rows = q.rows || 3;
                    const cols = q.cols || 3;
                    contentHTML += `<table class="exam-table">`;
                    for(let r=0; r<rows; r++) {
                      contentHTML += `<tr>`;
                      for(let c=0; c<cols; c++) {
                        const cellText = q.tableData && q.tableData[r] && q.tableData[r][c] ? q.tableData[r][c] : '';
                        if (r === 0) {
                          contentHTML += `<th>${cellText || `رأس ${formatNum(c+1, numStyle)}`}</th>`;
                        } else {
                          contentHTML += `<td>${cellText || '&nbsp;'}</td>`;
                        }
                      }
                      contentHTML += `</tr>`;
                    }
                    contentHTML += `</table>`;
                  } else if (q.type === 'mcq') {
                    contentHTML += `<div style="margin-top: 6px; font-weight: 600; color: #475569;">الخيارات: ${q.mcqChoices || ''}</div>`;
                  } else if (q.type === 'fill') {
                    contentHTML += `<div class="word-bank-box">صندوق الكلمات: [ ${q.wordBank || ''} ]</div>`;
                    if (q.fillSentences && q.fillSentences.length > 0) {
                      contentHTML += `<div class="fill-sentences-list">`;
                      q.fillSentences.forEach((fs, fIdx) => {
                        contentHTML += `
                          <div class="fill-sentence-item">
                            <span class="fill-num">${formatNum(fIdx + 1, numStyle)})</span>
                            <span style="flex: 1; font-weight: 600;">${fs.text || ''}</span>
                          </div>
                        `;
                      });
                      contentHTML += `</div>`;
                    }
                  }

                  return `
                    <div class="question-item">
                      <div class="question-main">
                        <span class="question-num">س ${formattedQNum}</span>
                        <span class="question-text">${q.text}</span>
                      </div>
                      ${q.imageBase64 ? `<div style="text-align: ${q.imageAlign || 'center'}; margin: 10px 0; width: 100%; display: block;"><img src="${q.imageBase64}" style="width: ${q.imageSize || '50%'}; max-width: 100%; border-radius: 6px; border: 1px solid #cbd5e1;" /></div>` : ''}
                      ${contentHTML}
                      ${q.subQuestions && q.subQuestions.length > 0 ? `
                        <div class="sub-questions-list">
                          ${q.subQuestions.map((sub, sIdx) => `
                            <div class="sub-question-item">
                              <span class="sub-letter">${getSubLabelText(sIdx, subStyle, numStyle)}</span>
                              <span class="sub-text">${sub.text}</span>
                            </div>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            ${renderedFooterHTML}
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = () => {
    if (questions.length === 0) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExamStore(generateExamHTML(), false, '#2563eb');
    router.push('/modal');
  };

  const handlePrint = async () => {
    if (questions.length === 0) return;
    Keyboard.dismiss();
    
    // فحص الاشتراك والمحاولات المجانية قبل الطباعة
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    setIsPrinting(true);
    try {
      const finalHTML = generateExamHTML() + getWatermarkHTML();
      await Print.printAsync({ html: finalHTML });
    } catch (error) {
      Alert.alert('خطأ', 'تعذرت عملية الطباعة');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPDF = async () => {
    if (questions.length === 0) return;
    Keyboard.dismiss();

    // فحص الاشتراك والمحاولات المجانية قبل التصدير
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    setIsExporting(true);
    try {
      const finalHTML = generateExamHTML() + getWatermarkHTML();
      const { uri } = await Print.printToFileAsync({ html: finalHTML, width: 595, height: 842 });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('خطأ', 'فشلت عملية التصدير.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <LinearGradient 
          colors={['#ffffff', '#f4f6f0', '#e9ece1']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject} 
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.topNavRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={24} color="#4B5320" />
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>صانع الاختبارات العربية</Text>
            <View style={{ width: 44 }} />
          </View>

          <LayoutTemplateSelector 
            visible={isTemplateModalOpen} 
            currentTemplate={examConfig.layoutTemplate} 
            onSelect={(id) => { setExamConfig(p => ({...p, layoutTemplate: id})); setIsTemplateModalOpen(false); }}
            onClose={() => setIsTemplateModalOpen(false)}
          />

          <BlurView intensity={60} tint="light" style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                <Ionicons name="grid" size={20} color="#4B5320" />
              </View>
              <Text style={styles.sectionTitle}>قالب وشكل الاختبار</Text>
            </View>
            <TouchableOpacity 
              style={styles.templateSelectBtn} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsTemplateModalOpen(true);
              }}
            >
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
                <Ionicons name="color-wand" size={20} color="#4B5320" />
                <Text style={styles.templateSelectText}>
                  {layoutTemplates.find(t => t.id === examConfig.layoutTemplate)?.label || 'اختر القالب'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#6E7A41" />
            </TouchableOpacity>
            <Text style={[styles.configGroupTitle, { marginTop: 10, fontSize: 12 }]}>يحدد هذا الخيار هيكلية وتوزيع رأس وتذييل الصفحة في ملف الـ PDF (يوجد 15 خيار احترافي).</Text>
          </BlurView>

          <BlurView intensity={60} tint="light" style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                <Ionicons name="water" size={20} color="#4B5320" />
              </View>
              <Text style={styles.sectionTitle}>التأثيرات الزجاجية الفاخرة</Text>
            </View>
            
            <Text style={[styles.configGroupTitle, { color: '#6E7A41', fontSize: 11, marginBottom: 16 }]}>
              (ملاحظة: هذه التأثيرات تتجاوز الألوان العادية إذا تم تفعيلها)
            </Text>
            
            <View style={styles.inputRow}>
              <ModalDropdown label="لون الرأس الزجاجي" value={examConfig.glassEffects.header} options={glassColorOptions} isOpen={activeDropdown === 'gHeader'} onToggle={() => toggleDropdown('gHeader')} onSelect={(v) => setExamConfig(p => ({...p, glassEffects: {...p.glassEffects, header: v}}))} />
              <ModalDropdown label="لون الإطار الزجاجي" value={examConfig.glassEffects.border} options={glassColorOptions} isOpen={activeDropdown === 'gBorder'} onToggle={() => toggleDropdown('gBorder')} onSelect={(v) => setExamConfig(p => ({...p, glassEffects: {...p.glassEffects, border: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="لون الهامش الخارجي الزجاجي" value={examConfig.glassEffects.margin} options={glassColorOptions} isOpen={activeDropdown === 'gMargin'} onToggle={() => toggleDropdown('gMargin')} onSelect={(v) => setExamConfig(p => ({...p, glassEffects: {...p.glassEffects, margin: v}}))} />
              <View style={{flex: 1}}/>
            </View>
          </BlurView>

          <BlurView intensity={60} tint="light" style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={20} color="#4B5320" />
              </View>
              <Text style={styles.sectionTitle}>بيانات ورقة الامتحان</Text>
            </View>
            <TextInput style={styles.inputField} placeholder="اسم المدرسة (اليمين)" placeholderTextColor="#8c9a63" value={examMeta.school} onChangeText={(v) => setExamMeta(p => ({...p, school: v}))} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="عنوان الامتحان (الوسط)" placeholderTextColor="#8c9a63" value={examMeta.examTitle} onChangeText={(v) => setExamMeta(p => ({...p, examTitle: v}))} />
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="السنة الدراسية" placeholderTextColor="#8c9a63" value={examMeta.academicYear} onChangeText={(v) => setExamMeta(p => ({...p, academicYear: v}))} />
            </View>
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="الصف (اليسار)" placeholderTextColor="#8c9a63" value={examMeta.grade} onChangeText={(v) => setExamMeta(p => ({...p, grade: v}))} />
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="المادة" placeholderTextColor="#8c9a63" value={examMeta.subject} onChangeText={(v) => setExamMeta(p => ({...p, subject: v}))} />
            </View>
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="الوقت / الزمن" placeholderTextColor="#8c9a63" value={examMeta.time} onChangeText={(v) => setExamMeta(p => ({...p, time: v}))} />
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="اسم المعلم" placeholderTextColor="#8c9a63" value={examMeta.teacherName} onChangeText={(v) => setExamMeta(p => ({...p, teacherName: v}))} />
            </View>
            <TextInput style={styles.inputField} placeholder="عبارة الختام" placeholderTextColor="#8c9a63" value={examMeta.closingText} onChangeText={(v) => setExamMeta(p => ({...p, closingText: v}))} />
            <TextInput style={styles.inputField} placeholder="ملاحظة الأسئلة" placeholderTextColor="#8c9a63" value={examNote} onChangeText={setExamNote} />
          </BlurView>

          <BlurView intensity={60} tint="light" style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                <Ionicons name="color-palette" size={20} color="#4B5320" />
              </View>
              <Text style={styles.sectionTitle}>التنسيقات والألوان</Text>
            </View>
            
            <Text style={styles.configGroupTitle}>تنسيقات الرأس</Text>
            <View style={styles.inputRow}>
              <ModalDropdown label="الخط" value={examConfig.header.font} options={arabicFonts} isOpen={activeDropdown === 'hFont'} onToggle={() => toggleDropdown('hFont')} onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, font: v}}))} />
              <ModalDropdown label="الحجم" value={examConfig.header.size} options={sizeOptions} isOpen={activeDropdown === 'hSize'} onToggle={() => toggleDropdown('hSize')} onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, size: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="اللون" value={examConfig.header.color} options={colorOptions} isOpen={activeDropdown === 'hColor'} onToggle={() => toggleDropdown('hColor')} onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, color: v}}))} />
              <ModalDropdown label="تظليل الرأس" value={examConfig.pdfHeaderShading} options={headerShadingOptions} isOpen={activeDropdown === 'hShading'} onToggle={() => toggleDropdown('hShading')} onSelect={(v) => setExamConfig(p => ({...p, pdfHeaderShading: v}))} />
            </View>

            <Text style={[styles.configGroupTitle, { marginTop: 15 }]}>تنسيقات الأسئلة والترقيم</Text>
            <View style={styles.inputRow}>
              <ModalDropdown label="الخط" value={examConfig.questions.font} options={arabicFonts} isOpen={activeDropdown === 'qFont'} onToggle={() => toggleDropdown('qFont')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, font: v}}))} />
              <ModalDropdown label="الحجم" value={examConfig.questions.size} options={sizeOptions} isOpen={activeDropdown === 'qSize'} onToggle={() => toggleDropdown('qSize')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, size: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="لون الأساس" value={examConfig.questions.color} options={colorOptions} isOpen={activeDropdown === 'qColor'} onToggle={() => toggleDropdown('qColor')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, color: v}}))} />
              <ModalDropdown label="نوع الأرقام (عربي/إنجليزي)" value={examConfig.questions.numStyle || 'eastern'} options={numberingStyleOptions} isOpen={activeDropdown === 'qNumStyle'} onToggle={() => toggleDropdown('qNumStyle')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, numStyle: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="تظليل خلفية السؤال" value={examConfig.questions.shading} options={questionShadingOptions} isOpen={activeDropdown === 'qShading'} onToggle={() => toggleDropdown('qShading')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, shading: v}}))} />
              <ModalDropdown label="ترقيم الفروع الداخلية" value={examConfig.questions.subStyle} options={subStyleOptions} isOpen={activeDropdown === 'qSubStyle'} onToggle={() => toggleDropdown('qSubStyle')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, subStyle: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="تباعد السطور" value={examConfig.pdfLineSpacing} options={lineSpacingOptions} isOpen={activeDropdown === 'spacing'} onToggle={() => toggleDropdown('spacing')} onSelect={(v) => setExamConfig(p => ({...p, pdfLineSpacing: v}))} />
              <View style={{flex: 1}}/>
            </View>

            <Text style={[styles.configGroupTitle, { marginTop: 15 }]}>تنسيقات الجدول</Text>
            <View style={styles.inputRow}>
              <ModalDropdown label="حجم خط الجدول" value={examConfig.table.size} options={sizeOptions} isOpen={activeDropdown === 'tSize'} onToggle={() => toggleDropdown('tSize')} onSelect={(v) => setExamConfig(p => ({...p, table: {...p.table, size: v}}))} />
              <ModalDropdown label="لون الجدول" value={examConfig.table.color} options={colorOptions} isOpen={activeDropdown === 'tColor'} onToggle={() => toggleDropdown('tColor')} onSelect={(v) => setExamConfig(p => ({...p, table: {...p.table, color: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="تظليل خلفية الجدول" value={examConfig.table.shading} options={questionShadingOptions} isOpen={activeDropdown === 'tShading'} onToggle={() => toggleDropdown('tShading')} onSelect={(v) => setExamConfig(p => ({...p, table: {...p.table, shading: v}}))} />
              <View style={{flex: 1}}/>
            </View>

            <Text style={[styles.configGroupTitle, { marginTop: 15 }]}>إطار الصفحة</Text>
            <View style={styles.inputRow}>
              <ModalDropdown label="شكل الإطار" value={examConfig.pageBorder.style} options={borderStylesOptions} isOpen={activeDropdown === 'bStyle'} onToggle={() => toggleDropdown('bStyle')} onSelect={(v) => setExamConfig(p => ({...p, pageBorder: {...p.pageBorder, style: v}}))} />
              <ModalDropdown label="سُمك الإطار" value={examConfig.pageBorder.width} options={borderWidthOptions} isOpen={activeDropdown === 'bWidth'} onToggle={() => toggleDropdown('bWidth')} onSelect={(v) => setExamConfig(p => ({...p, pageBorder: {...p.pageBorder, width: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="لون الإطار" value={examConfig.pageBorder.color} options={colorOptions} isOpen={activeDropdown === 'bColor'} onToggle={() => toggleDropdown('bColor')} onSelect={(v) => setExamConfig(p => ({...p, pageBorder: {...p.pageBorder, color: v}}))} />
              <View style={{flex: 1}}/>
            </View>
          </BlurView>

          <BlurView intensity={60} tint="light" style={[styles.glassCard, { marginBottom: 40 }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                <Ionicons name="list" size={20} color="#4B5320" />
              </View>
              <Text style={styles.sectionTitle}>الأسئلة الاحترافية ({questions.length})</Text>
            </View>
            
            {questions.map((q, idx) => (
              <QuestionItem 
                key={q.id} 
                item={q} 
                index={idx} 
                onUpdateField={handleUpdateField} 
                onUpdateTableCell={handleUpdateTableCell}
                onAddSub={handleAddSubQuestion} 
                onUpdateSub={handleUpdateSubQuestion} 
                onDeleteSub={handleDeleteSubQuestion} 
                onAddFillSentence={handleAddFillSentence}
                onUpdateFillSentence={handleUpdateFillSentence}
                onDeleteFillSentence={handleDeleteFillSentence}
                onDeleteQuestion={handleDeleteQuestion} 
                subStyle={examConfig.questions.subStyle}
                numStyle={examConfig.questions.numStyle || 'eastern'}
                activeTypeDropdown={activeTypeDropdown}
                onOpenTypeModal={() => toggleTypeDropdown(q.id)}
              />
            ))}
            
            <TouchableOpacity onPress={handleAddQuestion} style={styles.worldAddQuestionBtn} activeOpacity={0.85}>
              <LinearGradient colors={['rgba(75, 83, 32, 0.08)', 'rgba(75, 83, 32, 0.02)']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
              <Ionicons name="add-circle" size={24} color="#4B5320" />
              <Text style={styles.worldAddQuestionText}>إضافة سؤال عالمي جديد</Text>
            </TouchableOpacity>
          </BlurView>

        </ScrollView>

        <View style={styles.floatingDockContainer}>
          <BlurView intensity={80} tint="light" style={styles.floatingDock}>
            <TouchableOpacity onPress={handlePreview} style={styles.dockBtn} activeOpacity={0.7}>
              <View style={[styles.dockIconBg, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                <Ionicons name="eye" size={20} color="#4B5320" />
              </View>
              <Text style={[styles.dockBtnText, { color: '#4B5320' }]} numberOfLines={1}>معاينة</Text>
            </TouchableOpacity>
            
            <View style={styles.dockDivider} />

            <TouchableOpacity onPress={handlePrint} style={styles.dockBtn} disabled={isPrinting || isGenerating} activeOpacity={0.7}>
              <View style={[styles.dockIconBg, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                {isPrinting ? <ActivityIndicator color="#4B5320" size="small" /> : <Ionicons name="print" size={20} color="#4B5320" />}
              </View>
              <Text style={[styles.dockBtnText, { color: '#4B5320' }]} numberOfLines={1}>طباعة</Text>
            </TouchableOpacity>

            <View style={styles.dockDivider} />

            <TouchableOpacity onPress={handleExportPDF} style={styles.dockBtn} disabled={isExporting || isPrinting} activeOpacity={0.7}>
              <View style={[styles.dockIconBg, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                {isGenerating ? <ActivityIndicator color="#4B5320" size="small" /> : <Ionicons name="share-outline" size={20} color="#4B5320" />}
              </View>
              <Text style={[styles.dockBtnText, { color: '#4B5320' }]} numberOfLines={1}>تصدير PDF</Text>
            </TouchableOpacity>
          </BlurView>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  
  topNavRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: Platform.OS==='ios'? 50: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(75, 83, 32, 0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  topNavTitle: { fontSize: 20, fontWeight: '900', color: '#3f4a2e', letterSpacing: 0.5 },
  
  glassCard: { borderRadius: 24, padding: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(75, 83, 32, 0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#3f4a2e' },
  
  inputField: { backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 16, padding: 14, paddingHorizontal: 16, marginBottom: 12, textAlign: 'right', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', fontSize: 14 },
  inputRow: { flexDirection: 'row-reverse', gap: 12 },
  configGroupTitle: { color: '#6E7A41', fontSize: 13, marginBottom: 10, textAlign: 'right', fontWeight: '800', letterSpacing: 0.5 },
  
  dropdownWrapper: { flex: 1, marginBottom: 12 },
  subLabel: { color: '#6E7A41', fontSize: 12, marginBottom: 6, fontWeight: '700', textAlign: 'right' },
  dropdownHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 16, paddingHorizontal: 16, height: 50 },
  dropdownHeaderInner: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1, gap: 10 },
  dropdownHeaderText: { color: '#3f4a2e', fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 380, backgroundColor: '#ffffff', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)', overflow: 'hidden', padding: 20, shadowColor: '#4B5320', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 15 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(75, 83, 32, 0.1)' },
  modalTitle: { color: '#3f4a2e', fontSize: 18, fontWeight: '900' },
  closeBtn: { padding: 6, backgroundColor: 'rgba(75, 83, 32, 0.08)', borderRadius: 12 },
  
  dropdownItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  dropdownItemSelected: { backgroundColor: 'rgba(75, 83, 32, 0.1)' },
  dropdownItemText: { color: '#3f4a2e', fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' },
  dropdownItemTextSelected: { color: '#4B5320', fontWeight: '900' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#3f4a2e' },

  templateSelectBtn: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(75, 83, 32, 0.05)', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 16, padding: 16 },
  templateSelectText: { color: '#4B5320', fontSize: 15, fontWeight: '800' },
  
  templateModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  templateModalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  
  templateCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(75, 83, 32, 0.03)', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: 'transparent' },
  templateCardSelected: { backgroundColor: 'rgba(75, 83, 32, 0.1)', borderColor: '#4B5320' },
  
  templateInfo: { flex: 1, paddingRight: 16 },
  templateName: { color: '#3f4a2e', fontSize: 16, fontWeight: '900', marginBottom: 4, textAlign: 'right' },
  templateDesc: { color: '#6E7A41', fontSize: 12, textAlign: 'right', lineHeight: 18 },
  
  templateRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#6E7A41', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  templateRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4B5320' },

  templateWireframeContainer: { width: 70, height: 90, backgroundColor: '#fff', borderRadius: 8, padding: 4, shadowColor: '#4B5320', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  wireframePaper: { flex: 1, padding: 4 },
  wfRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  wfLineShort: { height: 3, backgroundColor: '#cbd5e1', width: 12, borderRadius: 2 },
  wfLineTitle: { height: 4, backgroundColor: '#6E7A41', width: 24, borderRadius: 2 },
  wfContentBlock: { height: 8, backgroundColor: '#e9ece1', borderRadius: 2, marginTop: 6, width: '100%' },

  worldClassQuestionCard: { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 24, padding: 18, marginBottom: 18, borderWidth: 1.5, borderColor: 'rgba(75, 83, 32, 0.2)', shadowColor: '#4B5320', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 12 },
  questionWorldHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 14, gap: 10 },
  worldQBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, shadowColor: '#4B5320', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
  worldQBadgeText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  worldDeleteBtn: { padding: 10, backgroundColor: 'rgba(225, 29, 72, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(225, 29, 72, 0.3)' },
  
  worldOcrBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(234, 88, 12, 0.3)', borderRadius: 14, padding: 12, marginBottom: 12, gap: 8, overflow: 'hidden', backgroundColor: 'rgba(234, 88, 12, 0.1)' },
  worldOcrText: { color: '#ea580c', fontSize: 13, fontWeight: '900' },

  worldMainInput: { backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 16, padding: 16, textAlign: 'right', minHeight: 52, fontSize: 14, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', fontWeight: '700' },
  
  worldExtraBox: { backgroundColor: 'rgba(75, 83, 32, 0.03)', padding: 16, borderRadius: 18, marginTop: 14, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  worldExtraTitle: { color: '#4B5320', fontSize: 13, fontWeight: '900', marginBottom: 12, textAlign: 'right' },

  tableGridContainer: { backgroundColor: 'rgba(75, 83, 32, 0.05)', borderRadius: 14, padding: 8, gap: 8 },
  tableRow: { flexDirection: 'row-reverse', gap: 8 },
  tableCellInput: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 8, padding: 10, textAlign: 'center', fontSize: 13, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },

  subContainerAr: { paddingRight: 16, borderRightWidth: 2.5, borderRightColor: 'rgba(75, 83, 32, 0.2)', marginRight: 4, marginTop: 14 },
  subHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addSubBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(75, 83, 32, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  addSubText: { color: '#4B5320', fontSize: 12, fontWeight: '800', marginRight: 6 },
  subItemRowAr: { flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 10 },
  subLetterBadge: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginLeft: 10, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  subLetterText: { color: '#4B5320', fontWeight: '900', fontSize: 13 },
  subInput: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 12, padding: 12, textAlign: 'right', fontSize: 13, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  subDeleteBtn: { padding: 6, marginLeft: 4, justifyContent: 'center' },

  innerBtn: { flexDirection: 'row-reverse', gap: 8, backgroundColor: 'rgba(75, 83, 32, 0.08)', height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', marginTop: 8 },
  innerBtnText: { color: '#4B5320', fontSize: 13, fontWeight: 'bold' },

  worldAddQuestionBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 18, marginTop: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.3)', borderStyle: 'dashed' },
  worldAddQuestionText: { color: '#4B5320', fontSize: 15, fontWeight: '900', marginRight: 10, letterSpacing: 0.5 },

  floatingDockContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, left: 20, right: 20, alignItems: 'center', justifyContent: 'center' },
  floatingDock: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 24, overflow: 'hidden', padding: 8, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', width: '100%', maxWidth: 400 },
  dockBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 },
  dockIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dockBtnText: { fontSize: 14, fontWeight: '900' },
  dockDivider: { width: 1, height: '60%', backgroundColor: 'rgba(75, 83, 32, 0.2)' }
});