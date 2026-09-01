import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
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

const englishFonts = [
  { label: 'تايمز نيو رومان (Times New Roman - رسمي وزاري)', value: 'Times New Roman' },
  { label: 'أريال (Arial - عصري واضح)', value: 'Arial' },
  { label: 'جورجيا (Georgia - فخم)', value: 'Georgia' },
  { label: 'كاليبري (Calibri - سلس)', value: 'Calibri' },
  { label: 'هيلفيتيكا (Helvetica)', value: 'Helvetica' },
  { label: 'كايرو (Cairo - عصري)', value: 'Cairo' },
  { label: 'روبوتو (Roboto)', value: 'Roboto' }
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
  { label: 'حروف إنجليزية (a, b, c...)', value: 'letters' },
  { label: 'أرقام (1, 2, 3...)', value: 'numbers' }
];

const questionTypeOptions = [
  { label: 'سؤال اعتيادي (Text / Sub-questions)', value: 'text' },
  { label: 'قطعة خارجية (Reading Comprehension)', value: 'comprehension' },
  { label: 'جدول بيانات (Table Grid)', value: 'table' },
  { label: 'اختيارات متعددة (Multiple Choice - MCQ)', value: 'mcq' },
  { label: 'إسقاطات / صندوق كلمات (Fill in blanks)', value: 'fill' }
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

const isColorValue = (val) => val && (val.startsWith('#') || val.startsWith('rgba'));

const englishDesignThemes = [
  { id: 'eth1', title: '1. Classic Royal Blue', category: 'وزاري كلاسيكي', config: { header: { font: 'Times New Roman', size: '15px', color: '#1e3a8a' }, questions: { font: 'Times New Roman', size: '15px', color: '#1e3a8a', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#1e3a8a', shading: 'none' }, pageBorder: { style: 'double', width: '4px', color: '#1e3a8a' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth2', title: '2. Olive Modern Standard', category: 'عصري زيتوني', config: { header: { font: 'Arial', size: '14px', color: '#4B5320' }, questions: { font: 'Arial', size: '15px', color: '#4B5320', subStyle: 'letters', shading: 'gray_light' }, table: { size: '14px', color: '#4B5320', shading: 'none' }, pageBorder: { style: 'solid', width: '2px', color: '#4B5320' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'gray_light', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth3', title: '3. Elegant Georgia & Gradient', category: 'تدرجات فخمة', config: { header: { font: 'Georgia', size: '15px', color: '#1d4ed8' }, questions: { font: 'Georgia', size: '15px', color: '#1d4ed8', subStyle: 'letters', shading: 'gradient' }, table: { size: '14px', color: '#1d4ed8', shading: 'none' }, pageBorder: { style: 'solid', width: '3px', color: '#1d4ed8' }, pdfLineSpacing: '1.8', pdfHeaderShading: 'gradient', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth4', title: '4. Academic Emerald Green', category: 'تربوي أكاديمي', config: { header: { font: 'Calibri', size: '15px', color: '#065f46' }, questions: { font: 'Calibri', size: '15px', color: '#065f46', subStyle: 'numbers', shading: 'green_light' }, table: { size: '14px', color: '#065f46', shading: 'none' }, pageBorder: { style: 'solid', width: '3px', color: '#065f46' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'green_light', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth5', title: '5. Crimson Burgundy Theme', category: 'وزاري فاخر', config: { header: { font: 'Times New Roman', size: '16px', color: '#7f1d1d' }, questions: { font: 'Times New Roman', size: '16px', color: '#7f1d1d', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#7f1d1d', shading: 'none' }, pageBorder: { style: 'double', width: '6px', color: '#7f1d1d' }, pdfLineSpacing: '1.95', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth6', title: '6. Frosted Olive Glass Theme', category: 'زجاجي زيتوني', config: { header: { font: 'Arial', size: '14.5px', color: '#3f4a2e' }, questions: { font: 'Arial', size: '15px', color: '#3f4a2e', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#3f4a2e', shading: 'none' }, pageBorder: { style: 'double', width: '4px', color: '#3f4a2e' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'glass', glassEffects: { header: 'rgba(75, 83, 32, 0.15)', margin: 'rgba(255, 255, 255, 0.45)', border: 'rgba(75, 83, 32, 0.25)' } } },
  { id: 'eth7', title: '7. Dark Charcoal Glass', category: 'زجاجي ليلي', config: { header: { font: 'Calibri', size: '14.5px', color: '#0f172a' }, questions: { font: 'Calibri', size: '15px', color: '#0f172a', subStyle: 'letters', shading: 'gray_light' }, table: { size: '14px', color: '#0f172a', shading: 'none' }, pageBorder: { style: 'solid', width: '3px', color: '#0f172a' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'glass', glassEffects: { header: 'rgba(15, 23, 42, 0.25)', margin: 'rgba(100, 116, 139, 0.3)', border: 'rgba(15, 23, 42, 0.5)' } } },
  { id: 'eth8', title: '8. Royal Purple Literature', category: 'أدبي', config: { header: { font: 'Georgia', size: '15px', color: '#581c87' }, questions: { font: 'Georgia', size: '15px', color: '#581c87', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#581c87', shading: 'none' }, pageBorder: { style: 'groove', width: '4px', color: '#581c87' }, pdfLineSpacing: '1.8', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth9', title: '9. Ocean Blue Clean', category: 'حديث', config: { header: { font: 'Arial', size: '14px', color: '#0e7490' }, questions: { font: 'Arial', size: '15px', color: '#0e7490', subStyle: 'numbers', shading: 'blue_light' }, table: { size: '14px', color: '#0e7490', shading: 'none' }, pageBorder: { style: 'solid', width: '4px', color: '#0e7490' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'blue_light', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth10', title: '10. Dashed Border Olive Theme', category: 'منقط زيتوني', config: { header: { font: 'Times New Roman', size: '14.5px', color: '#4B5320' }, questions: { font: 'Times New Roman', size: '15px', color: '#4B5320', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#4B5320', shading: 'none' }, pageBorder: { style: 'dashed', width: '3px', color: '#4B5320' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth11', title: '11. Dotted Border Precise', category: 'نقطي', config: { header: { font: 'Georgia', size: '15px', color: '#0f172a' }, questions: { font: 'Georgia', size: '15px', color: '#0f172a', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#0f172a', shading: 'none' }, pageBorder: { style: 'dotted', width: '4px', color: '#0f172a' }, pdfLineSpacing: '1.75', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth12', title: '12. Groove 3D Border', category: 'ثلاثي الأبعاد', config: { header: { font: 'Calibri', size: '14px', color: '#065f46' }, questions: { font: 'Calibri', size: '15px', color: '#065f46', subStyle: 'letters', shading: 'green_light' }, table: { size: '14px', color: '#065f46', shading: 'none' }, pageBorder: { style: 'groove', width: '6px', color: '#065f46' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'green_light', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth13', title: '13. Ridge Border Heavy', category: 'حافة بارزة', config: { header: { font: 'Times New Roman', size: '14.5px', color: '#be123c' }, questions: { font: 'Times New Roman', size: '15px', color: '#be123c', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#be123c', shading: 'none' }, pageBorder: { style: 'ridge', width: '4px', color: '#be123c' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth14', title: '14. Soft Olive Gradient', category: 'زيتوني ناعم', config: { header: { font: 'Arial', size: '14px', color: '#3f4a2e' }, questions: { font: 'Arial', size: '15px', color: '#3f4a2e', subStyle: 'numbers', shading: 'gradient' }, table: { size: '14px', color: '#3f4a2e', shading: 'none' }, pageBorder: { style: 'solid', width: '2px', color: '#3f4a2e' }, pdfLineSpacing: '1.65', pdfHeaderShading: 'gradient', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth15', title: '15. Pure Academic English', category: 'أكاديمي', config: { header: { font: 'Georgia', size: '15px', color: '#0f172a' }, questions: { font: 'Georgia', size: '15px', color: '#0f172a', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#0f172a', shading: 'none' }, pageBorder: { style: 'solid', width: '2px', color: '#0f172a' }, pdfLineSpacing: '1.8', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } },
  { id: 'eth16', title: '16. Full University Standard', category: 'جامعي رسمي', config: { header: { font: 'Times New Roman', size: '16px', color: '#0f172a' }, questions: { font: 'Times New Roman', size: '16px', color: '#0f172a', subStyle: 'letters', shading: 'none' }, table: { size: '14px', color: '#0f172a', shading: 'none' }, pageBorder: { style: 'double', width: '4px', color: '#0f172a' }, pdfLineSpacing: '2.0', pdfHeaderShading: 'none', glassEffects: { header: 'none', margin: 'none', border: 'none' } } }
];

const layoutTemplates = [
  { id: 'classic', label: 'Classic (التقليدي)', desc: 'Balanced layout (Left, Center, Right)' },
  { id: 'ministry', label: 'Ministry (الوزاري)', desc: 'Formal table header with strong borders' },
  { id: 'modern', label: 'Modern (العصري)', desc: 'Rounded corners and flexible distribution' },
  { id: 'minimalist', label: 'Minimalist (البسيط)', desc: 'Clean lines and whitespace focus' },
  { id: 'boxed', label: 'Boxed (المُؤطَر)', desc: 'Separated boxes for each section' },
  { id: 'elegant', label: 'Elegant (الراقي)', desc: 'Double lines and luxurious centering' },
  { id: 'centered', label: 'Centered (المركزي)', desc: 'All elements stacked in the center' },
  { id: 'ribbon', label: 'Ribbon (الشريطي)', desc: 'Wide colored ribbon for exam title' },
  { id: 'grid', label: 'Grid (الشبكي)', desc: 'Organized grid cells for data' },
  { id: 'split', label: 'Split (المنقسم)', desc: 'Sharp dual layout (Left and Right)' },
  { id: 'compact', label: 'Compact (المضغوط)', desc: 'Saves maximum space for questions' },
  { id: 'underlined', label: 'Underlined (المُسطّر)', desc: 'Underlines for each header detail' },
  { id: 'rounded', label: 'Pill/Rounded (الكبسولة)', desc: 'Soft oval and modern backgrounds' },
  { id: 'academic', label: 'Academic (الأكاديمي)', desc: 'University style with logo placeholder' },
  { id: 'bold', label: 'Bold (العريض)', desc: 'High focus and massive title block' }
];

const ModalDropdown = ({ label, value, options, onSelect, isOpen, onToggle }) => {
  const selectedOpt = options.find(o => o.value === value) || options[0];

  return (
    <View style={styles.dropdownWrapper}>
      <Text style={styles.subLabel}>{label}</Text>
      
      <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={styles.dropdownHeader}>
        <View style={styles.dropdownHeaderInner}>
          {isColorValue(selectedOpt?.value) ? (
            <View style={[styles.colorDot, { backgroundColor: selectedOpt.value.includes('rgba') ? selectedOpt.value.replace(/[\d.]+\)$/g, '1)') : selectedOpt.value }]} />
          ) : null}
          <Text style={styles.dropdownHeaderText} numberOfLines={1}>
            {selectedOpt ? selectedOpt.label : 'Select...'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#4B5320" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onToggle}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onToggle}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
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
};

const WireframeRenderer = ({ templateId }) => {
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
            <View style={[styles.wfRow, { marginTop: 4, width: '100%', justifyContent: 'space-between' }]}>
              <View style={styles.wfLineShort} /><View style={styles.wfLineShort} />
            </View>
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
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#cbd5e1', paddingLeft: 4, alignItems: 'flex-start' }}><View style={styles.wfLineTitle}/></View>
            <View style={{ flex: 1, paddingRight: 4, alignItems: 'flex-end' }}><View style={styles.wfLineShort}/><View style={[styles.wfLineShort, {marginTop: 2}]}/></View>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#6E7A41' }} />
            <View style={{ alignItems: 'center', flex: 1 }}><View style={styles.wfLineTitle}/><View style={[styles.wfLineShort, {marginTop:2}]}/></View>
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    case 'bold':
      return (
        <View style={styles.wireframePaper}>
          <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
            <View style={{ height: 16, backgroundColor: '#4B5320', flex: 2, borderRadius: 2 }} />
            <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 4 }}><View style={styles.wfLineShort}/></View>
          </View>
          <View style={styles.wfContentBlock} />
        </View>
      );
    default:
      return <View style={styles.wireframePaper} />;
  }
};

const LayoutTemplateSelector = ({ visible, currentTemplate, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.templateModalOverlay}>
        <View style={styles.templateModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Exam Layout Template</Text>
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
};

const getSubLabelText = (sIdx, subStyle) => {
  if (subStyle === 'numbers') return String(sIdx + 1);
  const engLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  return engLetters[sIdx] || String(sIdx + 1);
};

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
  onOpenTypeModal,
  activeTypeDropdown,
  onOpenQDropdown,
  activeQDropdownKey
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
              "Smart AI Scanner",
              "Enter or paste the extracted English text from image:",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Auto Fill", 
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
          : Alert.alert('Success', 'Image captured successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeaderRow}>
        <LinearGradient colors={['#6E7A41', '#4B5320']} style={styles.qNumberBadge}>
          <Text style={styles.qNumberText}>{`Q ${index + 1}`}</Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <ModalDropdown 
            label="Question Type (نوع السؤال)" 
            value={item.type || 'text'} 
            options={questionTypeOptions} 
            isOpen={activeTypeDropdown === item.id} 
            onToggle={onOpenTypeModal}
            onSelect={(v) => onUpdateField(item.id, 'type', v)}
          />
        </View>

        <TouchableOpacity onPress={() => onDeleteQuestion(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#e11d48" />
        </TouchableOpacity>
      </View>

      <View style={styles.customStyleToggleRow}>
        <TouchableOpacity 
          style={[styles.customToggleBtn, item.customStyleEnabled ? styles.customToggleBtnActive : null]}
          onPress={() => {
            Haptics.selectionAsync();
            onUpdateField(item.id, 'customStyleEnabled', !item.customStyleEnabled);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name={item.customStyleEnabled ? "checkbox" : "square-outline"} size={16} color={item.customStyleEnabled ? "#4B5320" : "#6E7A41"} />
          <Text style={[styles.customToggleText, item.customStyleEnabled ? styles.customToggleTextActive : null]}>
            تخصيص تنسيق فردي لهذا السؤال (حجم، لون، تظليل)
          </Text>
        </TouchableOpacity>
      </View>

      {item.customStyleEnabled ? (
        <View style={styles.customStyleBox}>
          <Text style={styles.customStyleBoxTitle}>إعدادات التنسيق الفردي للسؤال ({index + 1}):</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <ModalDropdown 
                label="حجم الخط" 
                value={item.fontSize || '15px'} 
                options={sizeOptions} 
                isOpen={activeQDropdownKey === `${item.id}-size`} 
                onToggle={() => onOpenQDropdown(`${item.id}-size`)} 
                onSelect={(v) => onUpdateField(item.id, 'fontSize', v)} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <ModalDropdown 
                label="لون الخط" 
                value={item.fontColor || '#4B5320'} 
                options={colorOptions} 
                isOpen={activeQDropdownKey === `${item.id}-color`} 
                onToggle={() => onOpenQDropdown(`${item.id}-color`)} 
                onSelect={(v) => onUpdateField(item.id, 'fontColor', v)} 
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <ModalDropdown 
                label="تظليل خلفية السؤال" 
                value={item.shading || 'none'} 
                options={questionShadingOptions} 
                isOpen={activeQDropdownKey === `${item.id}-shading`} 
                onToggle={() => onOpenQDropdown(`${item.id}-shading`)} 
                onSelect={(v) => onUpdateField(item.id, 'shading', v)} 
              />
            </View>
            <View style={{ flex: 1 }} />
          </View>
        </View>
      ) : null}

      <TouchableOpacity style={styles.ocrScanBtn} onPress={scanAndExtractText} activeOpacity={0.8}>
        <Ionicons name="scan-outline" size={18} color="#ea580c" />
        <Text style={styles.ocrScanText}>Scan Image Text (Smart Scan)</Text>
      </TouchableOpacity>

      <TextInput 
        style={styles.qInput}
        multiline
        value={item.text}
        onChangeText={(text) => onUpdateField(item.id, 'text', text)}
        placeholder="Enter main question text..."
        placeholderTextColor="#8c9a63"
      />

      <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
        <TouchableOpacity style={[styles.innerBtn, { flex: 1, borderColor: item.imageBase64 ? '#4B5320' : 'rgba(75, 83, 32, 0.2)' }]} onPress={pickImageForQuestion}>
          <Ionicons name={item.imageBase64 ? "checkmark-circle" : "image-outline"} size={18} color={item.imageBase64 ? '#4B5320' : '#6E7A41'} />
          <Text style={[styles.innerBtnText, {color: item.imageBase64 ? '#4B5320' : '#6E7A41'}]}>{item.imageBase64 ? 'Image Attached (Change)' : 'Attach Question Image'}</Text>
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
            <ModalDropdown label="Image Size:" value={item.imageSize || '50%'} options={imageSizeOptions} isOpen={activeQDropdownKey === `${item.id}-imgSize`} onToggle={() => onOpenQDropdown(`${item.id}-imgSize`)} onSelect={v => onUpdateField(item.id, 'imageSize', v)} />
          </View>
          <View style={{flex: 1}}>
            <ModalDropdown label="Image Align:" value={item.imageAlign || 'center'} options={imageAlignOptions} isOpen={activeQDropdownKey === `${item.id}-imgAlign`} onToggle={() => onOpenQDropdown(`${item.id}-imgAlign`)} onSelect={v => onUpdateField(item.id, 'imageAlign', v)} />
          </View>
        </View>
      ) : null}

      {item.type === 'comprehension' ? (
        <View style={styles.extraBox}>
          <Text style={styles.extraBoxTitle}>Reading Comprehension Passage:</Text>
          <TextInput
            style={[styles.qInput, { minHeight: 80 }]}
            multiline
            value={item.passage || ''}
            onChangeText={(text) => onUpdateField(item.id, 'passage', text)}
            placeholder="Enter passage text here..."
            placeholderTextColor="#8c9a63"
          />
        </View>
      ) : null}

      {item.type === 'table' ? (
        <View style={styles.extraBox}>
          <Text style={styles.extraBoxTitle}>Table Configuration & Cells:</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Rows Count:</Text>
              <TextInput
                style={[styles.inputField, { marginBottom: 6 }]}
                keyboardType="numeric"
                value={String(item.rows || 3)}
                onChangeText={(v) => onUpdateField(item.id, 'rows', parseInt(v, 10) || 2)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Columns Count:</Text>
              <TextInput
                style={[styles.inputField, { marginBottom: 6 }]}
                keyboardType="numeric"
                value={String(item.cols || 3)}
                onChangeText={(v) => onUpdateField(item.id, 'cols', parseInt(v, 10) || 2)}
              />
            </View>
          </View>

          <Text style={[styles.subLabel, { marginTop: 12, color: '#4B5320' }]}>Cell Texts:</Text>
          <View style={styles.tableGridContainer}>
            {Array.from({ length: item.rows || 3 }).map((_, rIdx) => (
              <View key={`row-${rIdx}`} style={styles.tableRow}>
                {Array.from({ length: item.cols || 3 }).map((_, cIdx) => {
                  const cellValue = item.tableData && item.tableData[rIdx] && item.tableData[rIdx][cIdx] ? item.tableData[rIdx][cIdx] : '';
                  return (
                    <TextInput
                      key={`cell-${cIdx}`}
                      style={styles.tableCellInput}
                      placeholder={`[${rIdx+1},${cIdx+1}]`}
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
        <View style={styles.extraBox}>
          <Text style={styles.extraBoxTitle}>Multiple Choice Options (MCQ):</Text>
          <TextInput
            style={[styles.inputField, { marginBottom: 0 }]}
            value={item.mcqChoices || ''}
            onChangeText={(text) => onUpdateField(item.id, 'mcqChoices', text)}
            placeholder="e.g. A) Option 1, B) Option 2, C) Option 3..."
            placeholderTextColor="#8c9a63"
          />
        </View>
      ) : null}

      {item.type === 'fill' ? (
        <View style={styles.extraBox}>
          <Text style={styles.extraBoxTitle}>Word Bank:</Text>
          <TextInput
            style={[styles.inputField, { marginBottom: 16 }]}
            value={item.wordBank || ''}
            onChangeText={(text) => onUpdateField(item.id, 'wordBank', text)}
            placeholder="e.g. (word1, word2, word3)"
            placeholderTextColor="#8c9a63"
          />
          
          <View style={styles.subHeaderRow}>
            <Text style={styles.subLabel}>Sentences / Blanks:</Text>
            <TouchableOpacity onPress={() => onAddFillSentence(item.id)} style={styles.addSubBtn}>
              <Ionicons name="add" size={16} color="#4B5320" />
              <Text style={styles.addSubText}>Add Sentence</Text>
            </TouchableOpacity>
          </View>

          {item.fillSentences ? item.fillSentences.map((fs, fIdx) => (
            <View key={fs.id} style={styles.subItemRow}>
              <LinearGradient colors={['rgba(75, 83, 32, 0.15)', 'rgba(75, 83, 32, 0.05)']} style={styles.subLetterBadge}>
                <Text style={styles.subLetterText}>{fIdx + 1}.</Text>
              </LinearGradient>
              <TextInput 
                style={styles.subInput}
                multiline
                value={fs.text}
                onChangeText={(text) => onUpdateFillSentence(item.id, fs.id, text)}
                placeholder={`Sentence ${fIdx + 1} with blank...`}
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
        <View style={styles.subContainerEn}>
          <View style={styles.subHeaderRow}>
            <Text style={styles.subLabel}>Sub-questions (Branches):</Text>
            <TouchableOpacity onPress={() => onAddSub(item.id)} style={styles.addSubBtn}>
              <Ionicons name="add" size={16} color="#4B5320" />
              <Text style={styles.addSubText}>Add Branch</Text>
            </TouchableOpacity>
          </View>
          {item.subQuestions ? item.subQuestions.map((sub, sIdx) => {
            const label = getSubLabelText(sIdx, subStyle);
            return (
              <View key={sub.id} style={styles.subItemRow}>
                <LinearGradient colors={['rgba(75, 83, 32, 0.15)', 'rgba(75, 83, 32, 0.05)']} style={styles.subLetterBadge}>
                  <Text style={styles.subLetterText}>{label})</Text>
                </LinearGradient>
                <TextInput 
                  style={styles.subInput}
                  multiline
                  value={sub.text}
                  onChangeText={(text) => onUpdateSub(item.id, sub.id, text)}
                  placeholder={`Sub-question (${label})...`}
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

export default function EnglishExam() {
  const router = useRouter();
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();
  
  const [examMeta, setExamMeta] = useState({
    school: 'Future International Private School',
    examTitle: 'Second Term Final English Exam',
    academicYear: 'Academic Year 2025 - 2026',
    grade: 'Grade 10 (High School)',
    subject: 'Subject: English Language',
    time: 'Time Allowed: 2 Hours',
    teacherName: 'Mr. John Smith',
    closingText: 'Best of luck in your exams'
  });

  const [examNote, setExamNote] = useState('Note: Answer all the following questions carefully:');

  const [examConfig, setExamConfig] = useState({
    layoutTemplate: 'classic',
    header: { font: 'Times New Roman', size: '15px', color: '#0f172a' },
    questions: { font: 'Times New Roman', size: '15px', color: '#0f172a', subStyle: 'letters', shading: 'none' },
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
  const [activeQDropdownKey, setActiveQDropdownKey] = useState(null);
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGenerating] = useState(false);

  const toggleDropdown = (key) => {
    Haptics.selectionAsync();
    setActiveDropdown(activeDropdown === key ? null : key);
    setActiveTypeDropdown(null);
    setActiveQDropdownKey(null);
  };

  const toggleTypeDropdown = (id) => {
    Haptics.selectionAsync();
    setActiveTypeDropdown(activeTypeDropdown === id ? null : id);
    setActiveDropdown(null);
    setActiveQDropdownKey(null);
  };

  const toggleQDropdown = (key) => {
    Haptics.selectionAsync();
    setActiveQDropdownKey(activeQDropdownKey === key ? null : key);
    setActiveDropdown(null);
    setActiveTypeDropdown(null);
  };

  const handleApplyDesignTheme = (theme) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setExamConfig(p => ({ ...theme.config, layoutTemplate: p.layoutTemplate }));
    setIsThemeModalOpen(false);
    Alert.alert('تم بنجاح', `تم تطبيق الثيم الإنجليزي (${theme.title}) بنجاح.`);
  };
  
  const [questions, setQuestions] = useState([
    { 
      id: '1', 
      type: 'text',
      text: 'Define figurative language and provide two common examples in poetry.', 
      subQuestions: [],
      imageBase64: null,
      imageSize: '50%',
      imageAlign: 'center',
      customStyleEnabled: false,
      fontSize: '',
      fontColor: '',
      shading: ''
    }
  ]);

  const handleUpdateField = React.useCallback((id, field, value) => {
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

  const handleUpdateTableCell = React.useCallback((id, rIdx, cIdx, text) => {
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

  const handleAddFillSentence = React.useCallback((questionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, fillSentences: [...(q.fillSentences || []), { id: Date.now().toString(), text: '' }] } : q));
  }, []);

  const handleUpdateFillSentence = React.useCallback((questionId, sentenceId, newText) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, fillSentences: q.fillSentences.map(fs => fs.id === sentenceId ? { ...fs, text: newText } : fs) } : q));
  }, []);

  const handleDeleteFillSentence = React.useCallback((questionId, sentenceId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, fillSentences: q.fillSentences.filter(fs => fs.id !== sentenceId) } : q));
  }, []);

  const handleAddSubQuestion = React.useCallback((questionId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, subQuestions: [...(q.subQuestions || []), { id: Date.now().toString(), text: '' }] } : q));
  }, []);

  const handleUpdateSubQuestion = React.useCallback((questionId, subId, newText) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, subQuestions: q.subQuestions.map(sub => sub.id === subId ? { ...sub, text: newText } : sub) } : q));
  }, []);

  const handleDeleteSubQuestion = React.useCallback((questionId, subId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, subQuestions: q.subQuestions.filter(sub => sub.id !== subId) } : q));
  }, []);

  const handleDeleteQuestion = React.useCallback((id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const handleAddQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQuestions(prev => [...prev, { id: Date.now().toString(), type: 'text', text: '', rows: 3, cols: 3, tableData: [['','',''],['','',''],['','','']], fillSentences: [], subQuestions: [], imageBase64: null, imageSize: '50%', imageAlign: 'center', customStyleEnabled: false, fontSize: '', fontColor: '', shading: '' }]);
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

    const globalQShading = examConfig.questions.shading || 'none';
    const globalQColor = examConfig.questions.color;
    const globalQSize = examConfig.questions.size;
    const hColor = examConfig.header.color;
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
                <td style="border: 1px solid ${hColor}; padding: 10px; width: 30%; text-align: left; vertical-align: middle;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${examMeta.school}</div>
                  <div>Subject: ${examMeta.subject}</div>
                </td>
                <td style="border: 1px solid ${hColor}; padding: 10px; width: 40%; text-align: center; vertical-align: middle;">
                  <h1 style="margin: 0 0 6px 0; font-size: calc(${examConfig.header.size} + 4px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
                  <div style="font-weight: bold;">${examMeta.academicYear}</div>
                </td>
                <td style="border: 1px solid ${hColor}; padding: 10px; width: 30%; text-align: right; vertical-align: middle;">
                  <div style="font-weight: bold; margin-bottom: 4px;">Grade: ${examMeta.grade}</div>
                  <div>Time: ${examMeta.time}</div>
                </td>
              </tr>
            </table>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
            <div style="text-align: left; width: 33%;">${examMeta.teacherName ? `Teacher: ${examMeta.teacherName}` : ''}</div>
            <div style="text-align: center; width: 33%; font-weight: bold; padding: 4px 15px; border: 1.5px solid ${hColor}; border-radius: 4px;">${examMeta.closingText}</div>
            <div style="text-align: right; width: 33%;">End of Questions</div>
          </div>`;
        break;

      case 'modern':
        renderedHeaderHTML = `
          <div class="exam-header" style="background: ${headerBgCSS}; ${headerExtraCSS}; border-radius: 16px; padding: 20px; margin-bottom:20px;">
            <div style="text-align: center; width: 100%;">
              <h1 style="margin: 0 0 8px 0; font-size: calc(${examConfig.header.size} + 6px); font-weight: 900; color: #fff; background: ${hColor}; padding: 8px 20px; display: inline-block; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">${examMeta.examTitle}</h1>
              <div style="display: flex; justify-content: space-between; margin-top: 15px; padding: 0 10px; font-weight: 700; color: ${hColor}; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 15px;">
                <div style="text-align: left; line-height: 1.6;"><div>${examMeta.school}</div><div>Subject: ${examMeta.subject}</div></div>
                <div style="text-align: center; line-height: 1.6;"><div style="color: #64748b;">${examMeta.academicYear}</div></div>
                <div style="text-align: right; line-height: 1.6;"><div>${examMeta.grade}</div><div>${examMeta.time}</div></div>
              </div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
            <div style="text-align: left; color: #64748b; width: 30%;">${examMeta.teacherName ? `Teacher: ${examMeta.teacherName}` : ''}</div>
            <div style="text-align: center; width: 40%; color: ${hColor}; font-weight: 900; background: rgba(241,245,249,0.8); padding: 6px 20px; border-radius: 20px;">${examMeta.closingText}</div>
            <div style="text-align: right; color: #64748b; width: 30%;">Good Luck</div>
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
            <div style="flex:1; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: left; background: ${headerBgCSS}; ${headerExtraCSS}">
              <div style="font-weight:900; color:${hColor}; margin-bottom:4px;">${examMeta.school}</div>
              <div style="color:#334155;">Subject: ${examMeta.subject}</div>
            </div>
            <div style="flex:1.2; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: center; background: ${headerBgCSS}; ${headerExtraCSS}">
              <h1 style="margin:0 0 4px 0; font-size: calc(${examConfig.header.size} + 2px); font-weight:900; color:${hColor};">${examMeta.examTitle}</h1>
              <div style="color:#64748b;">${examMeta.academicYear}</div>
            </div>
            <div style="flex:1; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: right; background: ${headerBgCSS}; ${headerExtraCSS}">
              <div style="font-weight:900; color:${hColor}; margin-bottom:4px;">${examMeta.grade}</div>
              <div style="color:#334155;">Time: ${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; margin-top:20px; border: 2px solid ${hColor}; border-radius: 8px; padding: 10px; background: rgba(255,255,255,0.5);">
            <div style="text-align: left;">${examMeta.teacherName}</div>
            <div style="text-align: center; font-weight:bold; color:${hColor};">${examMeta.closingText}</div>
            <div style="text-align: right;">Best Wishes</div>
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
            <div style="color: #64748b;">Prepared by: ${examMeta.teacherName}</div>
          </div>`;
        break;

      case 'centered':
        renderedHeaderHTML = `
          <div class="exam-header" style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid rgba(0,0,0,0.1); background: ${headerBgCSS}; ${headerExtraCSS}">
            <h3 style="margin: 0 0 5px 0; color: #475569;">${examMeta.school}</h3>
            <h1 style="margin: 0 0 10px 0; font-size: calc(${examConfig.header.size} + 8px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
            <div style="font-weight: bold; color: #334155; display: inline-flex; gap: 20px; background: rgba(0,0,0,0.03); padding: 5px 15px; border-radius: 20px;">
              <span>Subject: ${examMeta.subject}</span>
              <span>Grade: ${examMeta.grade}</span>
              <span>Time: ${examMeta.time}</span>
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
              <div style="text-align: left;"><div>${examMeta.school}</div><div>${examMeta.academicYear}</div></div>
              <div style="text-align: center;"><div>Subject: ${examMeta.subject}</div></div>
              <div style="text-align: right;"><div>${examMeta.grade}</div><div>${examMeta.time}</div></div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:25px; padding-top: 15px; border-top: 2px solid ${hColor};">
            <div style="width: 30%; text-align:left;">${examMeta.teacherName}</div>
            <div style="width: 40%; text-align:center; background: ${hColor}; color: #fff; padding: 4px 10px; border-radius: 4px;">${examMeta.closingText}</div>
            <div style="width: 30%; text-align:right;">End of Page</div>
          </div>`;
        break;

      case 'grid':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 20px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <h1 style="text-align: center; margin: 0 0 15px 0; color: ${hColor}; font-size: calc(${examConfig.header.size} + 4px);">${examMeta.examTitle}</h1>
            <div style="display: flex; flex-wrap: wrap; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; font-weight: bold;">School: ${examMeta.school}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-bottom: 1px solid #cbd5e1; font-weight: bold;">Year: ${examMeta.academicYear}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-right: 1px solid #cbd5e1; font-weight: bold;">Subject: ${examMeta.subject}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; font-weight: bold;">Grade / Time: ${examMeta.grade} - ${examMeta.time}</div>
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
            <div style="flex: 1; border-right: 2px dashed #94a3b8; padding-left: 15px; display: flex; flex-direction: column; justify-content: center; text-align: left;">
              <h1 style="margin: 0 0 5px 0; font-size: calc(${examConfig.header.size} + 6px); color: ${hColor}; font-weight: 900;">${examMeta.examTitle}</h1>
              <div style="font-size: 1.1em; font-weight: bold; color: #475569;">${examMeta.school}</div>
            </div>
            <div style="flex: 1; padding-right: 15px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; font-weight: bold; line-height: 1.8;">
              <div>Subject: <span style="color:${hColor};">${examMeta.subject}</span></div>
              <div>Grade: <span style="color:${hColor};">${examMeta.grade}</span></div>
              <div>Time: <span style="color:${hColor};">${examMeta.time}</span> | ${examMeta.academicYear}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display: flex; justify-content: space-between; margin-top: 25px; border-top: 3px solid ${hColor}; padding-top: 15px;">
            <div style="font-weight: bold; text-align: left;">${examMeta.teacherName}</div>
            <div style="font-weight: 900; color: ${hColor}; text-align: right;">${examMeta.closingText}</div>
          </div>`;
        break;

      case 'compact':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 15px; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 8px; background: ${headerBgCSS}; ${headerExtraCSS}">
            <span style="font-weight: bold; margin-right: 10px;">${examMeta.school}</span>
            <span style="font-weight: 900; font-size: calc(${examConfig.header.size} + 2px); color: ${hColor}; margin: 0 15px;">${examMeta.examTitle}</span>
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
          <div class="exam-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; flex-wrap: wrap; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="width: 100%; text-align: center; margin-bottom: 15px;">
              <h1 style="margin: 0; display: inline-block; border-bottom: 3px solid ${hColor}; padding-bottom: 5px; color: ${hColor};">${examMeta.examTitle}</h1>
            </div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: left;">School: ${examMeta.school}</div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: center;">Subject: ${examMeta.subject}</div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: right;">Time: ${examMeta.time}</div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 20px; display: flex; justify-content: space-between;">
            <div style="width: 45%; border-bottom: 1.5px dotted #000; font-weight: bold; text-align: left;">Sign: ${examMeta.teacherName}</div>
            <div style="width: 45%; border-bottom: 1.5px dotted #000; text-align: right; font-weight: bold; color: ${hColor};">${examMeta.closingText}</div>
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
              <div style="width: 60px; height: 60px; border-radius: 30px; border: 2px solid ${hColor}; margin: 0 auto 5px auto; display:flex; align-items:center; justify-content:center; color:${hColor}; font-weight:bold; font-size:12px;">Logo</div>
            </div>
            <div style="width: 50%; text-align: center; line-height: 1.5;">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 4px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
              <div style="font-weight: bold; font-size: 1.1em;">${examMeta.school}</div>
            </div>
            <div style="width: 25%; text-align: right; font-weight: bold; line-height: 1.6;">
              <div>${examMeta.academicYear}</div>
              <div>${examMeta.subject}</div>
              <div>${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 25px; display: flex; justify-content: space-between; border-top: 4px solid #000; padding-top: 10px; font-weight: bold;">
            <div style="text-align: left;">Instructor: ${examMeta.teacherName}</div>
            <div style="text-align: center; color: ${hColor};">${examMeta.closingText}</div>
            <div style="text-align: right;">Last Page</div>
          </div>`;
        break;

      case 'bold':
        renderedHeaderHTML = `
          <div class="exam-header" style="margin-bottom: 30px; display: flex; align-items: stretch; background: ${headerBgCSS}; ${headerExtraCSS}">
            <div style="flex: 2; background: #0f172a; color: #fff; padding: 20px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; display: flex; flex-direction: column; justify-content: center;">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 10px); line-height: 1.2;">${examMeta.examTitle}</h1>
              <div style="color: #94a3b8; margin-top: 10px; font-size: 1.1em;">${examMeta.subject} | ${examMeta.grade}</div>
            </div>
            <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: center; font-weight: bold; color: #334155; text-align: right;">
              <div style="margin-bottom: 8px;">${examMeta.school}</div>
              <div style="margin-bottom: 8px;">${examMeta.academicYear}</div>
              <div>Time: ${examMeta.time}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="margin-top: 30px; padding: 15px; background: #0f172a; color: #fff; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #94a3b8; text-align: left;">${examMeta.teacherName}</div>
            <div style="font-weight: 900; font-size: 1.1em; text-align: right;">${examMeta.closingText}</div>
          </div>`;
        break;

      default:
        renderedHeaderHTML = `
          <div class="exam-header" style="background: ${headerBgCSS}; border-bottom: 3px solid ${hColor}; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; margin-bottom: 18px; ${headerExtraCSS}">
            <div style="width: 32%; text-align: left; padding-left: 15px; font-weight: 700; color: ${hColor};">
              <div>Grade: ${examMeta.grade}</div><div>Subject: ${examMeta.subject}</div><div>${examMeta.time}</div>
            </div>
            <div style="text-align: center; width: 36%; line-height: 1.5;">
              <h1 style="margin: 0 0 4px 0; font-size: calc(${examConfig.header.size} + 3px); font-weight: 900; color: ${hColor}; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">${examMeta.examTitle}</h1>
              <div style="font-size: calc(${examConfig.header.size} - 1.5px); font-weight: 700; color: ${hColor}; opacity: 0.85;">${examMeta.academicYear}</div>
            </div>
            <div style="width: 32%; text-align: right; padding-right: 15px; font-weight: 700; color: ${hColor};">
              <div>${examMeta.school}</div>
            </div>
          </div>`;
        renderedFooterHTML = `
          <div class="exam-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; font-weight: 700; border-top: 1.5px dashed rgba(203, 213, 225, 0.8); margin-top: 24px;">
            <div style="width: 35%; text-align: left;">Teacher: ${examMeta.teacherName}</div>
            <div style="width: 30%; text-align: center; font-weight: 900;">${examMeta.closingText}</div>
            <div style="width: 35%; text-align: right;"></div>
          </div>`;
    }

    return `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Roboto:wght@400;500;700;900&display=swap');
            @page { size: A4 portrait; margin: ${pageMarginValue}; }
            body { 
              color: #0f172a; margin: 0; -webkit-print-color-adjust: exact; line-height: ${lineSpacing}; 
              direction: ltr; text-align: left;
              ${bodyCSS}
            }
            .exam-container { 
              padding: 10mm 10mm; box-sizing: border-box; 
              display: flex; flex-direction: column; justify-content: space-between;
              ${containerCSS}
            }
            .exam-content-area { flex: 1; }
            
            .exam-header, .exam-footer { direction: ltr; font-family: '${examConfig.header.font}', serif; font-size: ${examConfig.header.size}; }
            
            .note-title { 
              direction: ltr; font-family: '${examConfig.questions.font}', sans-serif;
              font-weight: 900; font-size: ${globalQSize}; margin-bottom: 18px; color: ${globalQColor};
              ${tpl === 'minimalist' || tpl === 'compact' ? 'border-bottom: 1px solid #ccc; padding-bottom: 5px;' : `background: rgba(224, 242, 254, 0.8); padding: 9px 12px; border-radius: 4px; border-left: 5px solid ${globalQColor}; text-align: left;`}
            }
            .questions-list { direction: ltr; font-family: '${examConfig.questions.font}', sans-serif; display: flex; flex-direction: column; gap: 14px; text-align: left; }
            
            .passage-box { background: rgba(248, 250, 252, 0.9); border: 1px solid rgba(203, 213, 225, 0.8); padding: 10px 12px; border-radius: 6px; margin-bottom: 10px; line-height: 1.6; }
            .word-bank-box { background: rgba(241, 245, 249, 0.9); border: 1px dashed rgba(148, 163, 184, 0.8); padding: 6px 12px; border-radius: 4px; margin-bottom: 10px; font-weight: bold; text-align: center; }
            
            .exam-table { width: 100%; border-collapse: collapse; margin-top: 8px; border: 1.5px solid ${tableColor}; }
            .exam-table th, .exam-table td { border: 1px solid ${tableColor}; padding: 8px; text-align: center; font-size: ${tableSize}; }
            .exam-table th { background: ${tableBgCSS}; color: ${tableColor}; font-weight: bold; }
            .exam-table td { color: #0f172a; }

            .fill-sentences-list { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
            .fill-sentence-item { display: flex; align-items: flex-start; }

            .sub-questions-list { margin-left: 54px; border-left: 2.5px dashed rgba(147, 197, 253, 0.8); padding-left: 14px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
            .sub-question-item { display: flex; align-items: flex-start; }
            .sub-letter { font-weight: 900; min-width: 28px; background: rgba(240, 253, 244, 0.9); border: 1px solid rgba(187, 247, 208, 0.8); border-radius: 3px; text-align: center; padding: 2px 0; margin-right: 8px; }
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
                  const isCustom = q.customStyleEnabled;
                  const qSize = isCustom && q.fontSize ? q.fontSize : globalQSize;
                  const qCol = isCustom && q.fontColor ? q.fontColor : globalQColor;
                  const qShading = isCustom && q.shading ? q.shading : globalQShading;
                  const qItemBg = getBackgroundColor(qShading);

                  let contentHTML = '';
                  
                  if (q.type === 'comprehension') {
                    contentHTML += `<div class="passage-box" style="font-size: calc(${qSize} - 0.5px);"><strong>Passage:</strong> ${q.passage || ''}</div>`;
                  } else if (q.type === 'table') {
                    const rows = q.rows || 3;
                    const cols = q.cols || 3;
                    contentHTML += `<table class="exam-table">`;
                    for(let r=0; r<rows; r++) {
                      contentHTML += `<tr>`;
                      for(let c=0; c<cols; c++) {
                        const cellText = q.tableData && q.tableData[r] && q.tableData[r][c] ? q.tableData[r][c] : '';
                        if (r === 0) {
                          contentHTML += `<th>${cellText || `Header ${c+1}`}</th>`;
                        } else {
                          contentHTML += `<td>${cellText || '&nbsp;'}</td>`;
                        }
                      }
                      contentHTML += `</tr>`;
                    }
                    contentHTML += `</table>`;
                  } else if (q.type === 'mcq') {
                    contentHTML += `<div style="margin-top: 6px; font-weight: 600; color: #475569; font-size: ${qSize};">Options: ${q.mcqChoices || ''}</div>`;
                  } else if (q.type === 'fill') {
                    contentHTML += `<div class="word-bank-box" style="font-size: ${qSize};">Word Bank: [ ${q.wordBank || ''} ]</div>`;
                    if (q.fillSentences && q.fillSentences.length > 0) {
                      contentHTML += `<div class="fill-sentences-list">`;
                      q.fillSentences.forEach((fs, fIdx) => {
                        contentHTML += `
                          <div class="fill-sentence-item" style="font-size: calc(${qSize} - 0.5px);">
                            <span style="font-weight: 900; color: ${qCol}; min-width: 28px;">${fIdx + 1}.</span>
                            <span style="flex: 1; font-weight: 600;">${fs.text || ''}</span>
                          </div>
                        `;
                      });
                      contentHTML += `</div>`;
                    }
                  }

                  return `
                    <div class="question-item" style="font-size: ${qSize}; color: ${qCol}; background: ${qItemBg}; ${qShading !== 'none' ? 'padding: 12px 14px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.06);' : 'padding: 2px 0;'}">
                      <div class="question-main" style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                        <span style="font-weight: 900; min-width: 45px; color: #ffffff; background: ${qCol}; text-align: center; border-radius: 4px; padding: 3px 0; margin-right: 12px;">Q ${idx + 1}</span>
                        <span style="flex: 1; font-weight: 800; color: #0f172a;">${q.text}</span>
                      </div>
                      ${q.imageBase64 ? `<div style="text-align: ${q.imageAlign || 'center'}; margin: 10px 0; width: 100%; display: block;"><img src="${q.imageBase64}" style="width: ${q.imageSize || '50%'}; max-width: 100%; border-radius: 6px; border: 1px solid #cbd5e1;" /></div>` : ''}
                      ${contentHTML}
                      ${q.subQuestions && q.subQuestions.length > 0 ? `
                        <div class="sub-questions-list">
                          ${q.subQuestions.map((sub, sIdx) => `
                            <div class="sub-question-item" style="font-size: calc(${qSize} - 1px);">
                              <span class="sub-letter" style="color: ${qCol};">${getSubLabelText(sIdx, examConfig.questions.subStyle)}</span>
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

    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    setIsPrinting(true);
    try {
      const finalHTML = generateExamHTML() + getWatermarkHTML();
      await Print.printAsync({ html: finalHTML });
    } catch (error) {
      Alert.alert('Error', 'Printing failed.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPDF = async () => {
    if (questions.length === 0) return;
    Keyboard.dismiss();

    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    setIsExporting(true);
    try {
      const finalHTML = generateExamHTML() + getWatermarkHTML();
      const { uri } = await Print.printToFileAsync({ html: finalHTML, width: 595, height: 842 });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'Export failed.');
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
            <Text style={styles.topNavTitle}>صانع اختبارات اللغة الإنجليزية</Text>
            <View style={{ width: 44 }} />
          </View>

          <TouchableOpacity 
            style={styles.templateQuickBtn} 
            activeOpacity={0.85} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsThemeModalOpen(true);
            }}
          >
            <LinearGradient colors={['rgba(75, 83, 32, 0.08)', 'rgba(75, 83, 32, 0.03)']} style={StyleSheet.absoluteFillObject} borderRadius={20} />
            <View style={styles.templateBtnContent}>
              <View style={styles.templateIconWrapper}>
                <Ionicons name="color-palette-outline" size={22} color="#4B5320" />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.templateBtnTitle}>مكتبة القوالب والتصميمات الإنجليزية (16 ثيم)</Text>
                <Text style={styles.templateBtnSub}>اختر شكل ورونق الرأس والإطار والخطوط الإنجليزية بضغطة زر</Text>
              </View>
              <Ionicons name="chevron-back" size={18} color="#4B5320" />
            </View>
          </TouchableOpacity>

          <Modal visible={isThemeModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsThemeModalOpen(false)}>
            <View style={styles.templatesModalOverlay}>
              <View style={styles.templatesModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>اختر القالب التصميمي الإنجليزي</Text>
                  <TouchableOpacity onPress={() => setIsThemeModalOpen(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={22} color="#6E7A41" />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: '#6E7A41', fontSize: 12, marginBottom: 14, textAlign: 'right' }}>
                  يغير خطوط وثيمات الإمتحان الإنجليزي (Times New Roman, Arial, Georgia) مع الإطارات الفخمة:
                </Text>

                <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                  {englishDesignThemes.map((theme) => (
                    <TouchableOpacity 
                      key={theme.id} 
                      style={styles.templateCardItem}
                      activeOpacity={0.8}
                      onPress={() => handleApplyDesignTheme(theme)}
                    >
                      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.tplCardTitle}>{theme.title}</Text>
                        <View style={styles.tplBadge}>
                          <Text style={styles.tplBadgeText}>{theme.category}</Text>
                        </View>
                      </View>
                      <Text style={styles.tplCardDesc} numberOfLines={1}>
                        Font: {theme.config.header.font} | Border: {theme.config.pageBorder.style}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

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
              <Text style={styles.sectionTitle}>قالب وشكل الاختبار الإنجليزي</Text>
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
                  {layoutTemplates.find(t => t.id === examConfig.layoutTemplate)?.label || 'Choose Layout Template'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#6E7A41" />
            </TouchableOpacity>
            <Text style={[styles.configGroupTitle, { marginTop: 10, fontSize: 12 }]}>يحدد هذا الخيار هيكلية وتوزيع الرأس بتنسيق إنجليزي (من اليسار لليمين - LTR).</Text>
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
              <Text style={styles.sectionTitle}>رأس ورقة الامتحان (Exam Header)</Text>
            </View>
            <TextInput style={styles.inputField} placeholder="School Name (School)" placeholderTextColor="#8c9a63" value={examMeta.school} onChangeText={(v) => setExamMeta(p => ({...p, school: v}))} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="Exam Title (Center)" placeholderTextColor="#8c9a63" value={examMeta.examTitle} onChangeText={(v) => setExamMeta(p => ({...p, examTitle: v}))} />
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="Academic Year" placeholderTextColor="#8c9a63" value={examMeta.academicYear} onChangeText={(v) => setExamMeta(p => ({...p, academicYear: v}))} />
            </View>
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="Grade / Class" placeholderTextColor="#8c9a63" value={examMeta.grade} onChangeText={(v) => setExamMeta(p => ({...p, grade: v}))} />
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="Subject" placeholderTextColor="#8c9a63" value={examMeta.subject} onChangeText={(v) => setExamMeta(p => ({...p, subject: v}))} />
            </View>
            <View style={styles.inputRow}>
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="Time Allowed" placeholderTextColor="#8c9a63" value={examMeta.time} onChangeText={(v) => setExamMeta(p => ({...p, time: v}))} />
              <TextInput style={[styles.inputField, {flex: 1}]} placeholder="Teacher Name" placeholderTextColor="#8c9a63" value={examMeta.teacherName} onChangeText={(v) => setExamMeta(p => ({...p, teacherName: v}))} />
            </View>
            <TextInput style={styles.inputField} placeholder="Closing / Wish Text" placeholderTextColor="#8c9a63" value={examMeta.closingText} onChangeText={(v) => setExamMeta(p => ({...p, closingText: v}))} />
            <TextInput style={styles.inputField} placeholder="Exam Instruction Note" placeholderTextColor="#8c9a63" value={examNote} onChangeText={setExamNote} />
          </BlurView>

          <BlurView intensity={60} tint="light" style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                <Ionicons name="color-palette" size={20} color="#4B5320" />
              </View>
              <Text style={styles.sectionTitle}>التنسيقات والألوان العامة</Text>
            </View>
            
            <Text style={styles.configGroupTitle}>تنسيقات الرأس (Header Fonts)</Text>
            <View style={styles.inputRow}>
              <ModalDropdown label="الخط الإنجليزي" value={examConfig.header.font} options={englishFonts} isOpen={activeDropdown === 'hFont'} onToggle={() => toggleDropdown('hFont')} onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, font: v}}))} />
              <ModalDropdown label="الحجم" value={examConfig.header.size} options={sizeOptions} isOpen={activeDropdown === 'hSize'} onToggle={() => toggleDropdown('hSize')} onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, size: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="اللون" value={examConfig.header.color} options={colorOptions} isOpen={activeDropdown === 'hColor'} onToggle={() => toggleDropdown('hColor')} onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, color: v}}))} />
              <ModalDropdown label="تظليل الرأس" value={examConfig.pdfHeaderShading} options={headerShadingOptions} isOpen={activeDropdown === 'hShading'} onToggle={() => toggleDropdown('hShading')} onSelect={(v) => setExamConfig(p => ({...p, pdfHeaderShading: v}))} />
            </View>

            <Text style={[styles.configGroupTitle, { marginTop: 15 }]}>تنسيقات الأسئلة (افتراضي عام)</Text>
            <View style={styles.inputRow}>
              <ModalDropdown label="الخط العام" value={examConfig.questions.font} options={englishFonts} isOpen={activeDropdown === 'qFont'} onToggle={() => toggleDropdown('qFont')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, font: v}}))} />
              <ModalDropdown label="الحجم العام" value={examConfig.questions.size} options={sizeOptions} isOpen={activeDropdown === 'qSize'} onToggle={() => toggleDropdown('qSize')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, size: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="لون الأساس" value={examConfig.questions.color} options={colorOptions} isOpen={activeDropdown === 'qColor'} onToggle={() => toggleDropdown('qColor')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, color: v}}))} />
              <ModalDropdown label="تظليل الخلفية العام" value={examConfig.questions.shading} options={questionShadingOptions} isOpen={activeDropdown === 'qShading'} onToggle={() => toggleDropdown('qShading')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, shading: v}}))} />
            </View>
            <View style={styles.inputRow}>
              <ModalDropdown label="نمط الفروع" value={examConfig.questions.subStyle} options={subStyleOptions} isOpen={activeDropdown === 'qSubStyle'} onToggle={() => toggleDropdown('qSubStyle')} onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, subStyle: v}}))} />
              <ModalDropdown label="تباعد السطور" value={examConfig.pdfLineSpacing} options={lineSpacingOptions} isOpen={activeDropdown === 'spacing'} onToggle={() => toggleDropdown('spacing')} onSelect={(v) => setExamConfig(p => ({...p, pdfLineSpacing: v}))} />
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
              <Text style={styles.sectionTitle}>الأسئلة والتحكم الفردي ({questions.length})</Text>
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
                activeTypeDropdown={activeTypeDropdown}
                onOpenTypeModal={() => toggleTypeDropdown(q.id)}
                activeQDropdownKey={activeQDropdownKey}
                onOpenQDropdown={toggleQDropdown}
              />
            ))}
            
            <TouchableOpacity onPress={handleAddQuestion} style={styles.addQuestionBtn} activeOpacity={0.8}>
              <LinearGradient colors={['rgba(75, 83, 32, 0.08)', 'rgba(75, 83, 32, 0.02)']} style={StyleSheet.absoluteFillObject} borderRadius={16} />
              <Ionicons name="add" size={22} color="#4B5320" />
              <Text style={styles.addQuestionText}>Add New Question (إضافة سؤال)</Text>
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
  
  topNavRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: Platform.OS==='ios'? 50: 30 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(75, 83, 32, 0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  topNavTitle: { fontSize: 20, fontWeight: '900', color: '#3f4a2e', letterSpacing: 0.5 },

  templateQuickBtn: { borderRadius: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.2)', padding: 16 },
  templateBtnContent: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  templateIconWrapper: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(75, 83, 32, 0.1)', justifyContent: 'center', alignItems: 'center' },
  templateBtnTitle: { color: '#4B5320', fontSize: 14, fontWeight: '900', textAlign: 'right' },
  templateBtnSub: { color: '#6E7A41', fontSize: 11, textAlign: 'right', marginTop: 3 },

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
  wfRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wfLineShort: { height: 3, backgroundColor: '#cbd5e1', width: 12, borderRadius: 2 },
  wfLineTitle: { height: 4, backgroundColor: '#6E7A41', width: 24, borderRadius: 2 },
  wfContentBlock: { height: 8, backgroundColor: '#e9ece1', borderRadius: 2, marginTop: 6, width: '100%' },

  templatesModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  templatesModalContent: { width: '100%', maxWidth: 420, backgroundColor: '#ffffff', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', padding: 20, shadowColor: '#4B5320', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 15 },
  templateCardItem: { backgroundColor: 'rgba(75, 83, 32, 0.03)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  tplCardTitle: { color: '#3f4a2e', fontSize: 14, fontWeight: '800', textAlign: 'right' },
  tplBadge: { backgroundColor: 'rgba(75, 83, 32, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tplBadgeText: { color: '#4B5320', fontSize: 10, fontWeight: '900' },
  tplCardDesc: { color: '#6E7A41', fontSize: 12, textAlign: 'right', marginTop: 6 },
  
  glassCard: { borderRadius: 24, padding: 20, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(75, 83, 32, 0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#3f4a2e' },
  
  inputField: { backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 16, padding: 14, paddingHorizontal: 16, marginBottom: 12, textAlign: 'left', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', fontSize: 14 },
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

  questionCard: { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.2)' },
  questionHeaderRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  qNumberBadge: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  qNumberText: { color: '#fff', fontWeight: '900' },
  qInput: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 12, padding: 14, textAlign: 'left', minHeight: 45, fontSize: 14, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  deleteBtn: { padding: 12, backgroundColor: 'rgba(225, 29, 72, 0.1)', borderRadius: 12, marginTop: 18, borderWidth: 1, borderColor: 'rgba(225, 29, 72, 0.3)' },
  
  customStyleToggleRow: { marginBottom: 12 },
  customToggleBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(75, 83, 32, 0.05)', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  customToggleBtnActive: { backgroundColor: 'rgba(75, 83, 32, 0.15)', borderColor: 'rgba(75, 83, 32, 0.3)' },
  customToggleText: { color: '#6E7A41', fontSize: 12, fontWeight: '700' },
  customToggleTextActive: { color: '#4B5320' },

  customStyleBox: { backgroundColor: 'rgba(75, 83, 32, 0.03)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  customStyleBoxTitle: { color: '#4B5320', fontSize: 12, fontWeight: '900', marginBottom: 10, textAlign: 'right' },

  ocrScanBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(234, 88, 12, 0.1)', borderWidth: 1, borderColor: 'rgba(234, 88, 12, 0.3)', borderRadius: 12, padding: 10, marginBottom: 12, gap: 8 },
  ocrScanText: { color: '#ea580c', fontSize: 13, fontWeight: '900' },

  extraBox: { backgroundColor: 'rgba(75, 83, 32, 0.03)', padding: 16, borderRadius: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  extraBoxTitle: { color: '#4B5320', fontSize: 13, fontWeight: '900', marginBottom: 12, textAlign: 'right' },

  tableGridContainer: { backgroundColor: 'rgba(75, 83, 32, 0.05)', borderRadius: 12, padding: 8, gap: 8 },
  tableRow: { flexDirection: 'row-reverse', gap: 8 },
  tableCellInput: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 8, padding: 10, textAlign: 'center', fontSize: 13, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },

  subContainerEn: { paddingLeft: 16, borderLeftWidth: 2.5, borderLeftColor: 'rgba(75, 83, 32, 0.2)', marginLeft: 4, marginTop: 12 },
  subHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addSubBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(75, 83, 32, 0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  addSubText: { color: '#4B5320', fontSize: 12, fontWeight: '800', marginRight: 6 },
  subItemRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 10 },
  subLetterBadge: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 10, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  subLetterText: { color: '#4B5320', fontWeight: '900', fontSize: 13 },
  subInput: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#3f4a2e', borderRadius: 10, padding: 10, textAlign: 'left', fontSize: 13, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  subDeleteBtn: { padding: 6, marginLeft: 4, justifyContent: 'center' },

  innerBtn: { flexDirection: 'row-reverse', gap: 8, backgroundColor: 'rgba(75, 83, 32, 0.08)', height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', marginTop: 6 },
  innerBtnText: { color: '#4B5320', fontSize: 14, fontWeight: '800' },

  addQuestionBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.3)', marginTop: 10, borderStyle: 'dashed' },
  addQuestionText: { color: '#4B5320', fontSize: 16, fontWeight: '900', marginRight: 10 },

  floatingDockContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, left: 20, right: 20, alignItems: 'center', justifyContent: 'center' },
  floatingDock: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 24, overflow: 'hidden', padding: 8, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', width: '100%', maxWidth: 400 },
  dockBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 },
  dockIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dockBtnText: { fontSize: 14, fontWeight: '900' },
  dockDivider: { width: 1, height: '60%', backgroundColor: 'rgba(75, 83, 32, 0.2)' }
});