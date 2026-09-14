import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

type BlockType =
  | 'text' | 'fraction' | 'root_fraction' | 'simple_root'
  | 'root' | 'power' | 'integral' | 'limit' | 'sigma'
  | 'absolute' | 'brackets' | 'vector';

interface Block {
  id: string;
  type: BlockType;
  value?: string;
  top?: string;
  bottom?: string;
  inner?: string;
  index?: string;
  innerExp?: string;
  outerExp?: string;
  base?: string;
  exp?: string;
  upper?: string;
  lower?: string;
  body?: string;
  limitVar?: string;
  limitTo?: string;
  topCoeff?: string;
  topIndex?: string;
  topInner?: string;
  topExp?: string;
  bottomCoeff?: string;
  bottomIndex?: string;
  bottomInner?: string;
  bottomExp?: string;
}

interface Branch {
  id: string;
  branchLabel: string;
  prompt: string;
  blocks: Block[];
}

interface QuestionItem {
  id: string;
  questionNumber: string;
  branches: Branch[];
}

interface ModalDropdownProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}

function ModalDropdown({ label, value, options, isOpen, onToggle, onSelect }: ModalDropdownProps) {
  const selectedOption = options.find(o => o.value === value);
  return (
    <View style={styles.dropdownWrapperNew}>
      <Text style={styles.subLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownHeaderNew} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.dropdownHeaderInner}>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#4B5320" />
          <Text style={styles.dropdownHeaderText} numberOfLines={1}>
            {selectedOption ? selectedOption.label : value}
          </Text>
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 16, marginTop: 4, padding: 8, maxHeight: 220 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dropdownItem, opt.value === value && styles.dropdownItemSelected]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(opt.value);
                  onToggle();
                }}
              >
                <Text style={[styles.dropdownItemText, opt.value === value && styles.dropdownItemTextSelected]} numberOfLines={1}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const FONTS = [
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

const COLORS = [
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

const headerShadingOptions = [
  { label: 'بدون تظليل (أبيض)', value: 'none' },
  { label: 'تأثير زجاجي فخم', value: 'glass' },
  { label: 'تدرج فخم (Gradient)', value: 'gradient' },
  { label: 'أزرق هادئ', value: 'blue_light' },
  { label: 'رمادي عصري', value: 'gray_light' },
  { label: 'أخضر هادئ', value: 'green_light' }
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

const sizeOptions = [
  { label: 'صغير جداً (10px)', value: '10px' },
  { label: 'صغير (12px)', value: '12px' },
  { label: 'أساسي (14px)', value: '14px' },
  { label: 'متوسط (15px)', value: '15px' },
  { label: 'كبير (17px)', value: '17px' },
  { label: 'كبير جداً (20px)', value: '20px' },
  { label: 'ضخم (24px)', value: '24px' }
];

export default function MathExamMinisterialScreen() {
  const router = useRouter();
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();
  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');

  const [isPrinting, setIsPrinting] = useState(false);

  const [examMeta, setExamMeta] = useState({
    school: 'مدرسة النهرين الابتدائية الأهلية',
    examTitle: 'امتحان نهاية الكورس الأول',
    academicYear: 'العام الدراسي 2025 - 2026 م',
    grade: 'الصف: السادس الإعدادي',
    subject: 'مادة الرياضيات',
    time: 'الوقت: ثلاث ساعات',
    teacherName: 'أ. مصطفى خالد',
    closingText: 'مع تمنياتنا للجميع بالتوفيق والنجاح'
  });

  const [examNote, setExamNote] = useState('ملاحظة: الإجابة عن خمسة أسئلة فقط، ولكل سؤال 20 درجة.');

  const [examConfig, setExamConfig] = useState({
    layoutTemplate: 'classic',
    header: { font: 'Traditional Arabic', size: '14.5px', color: '#0f172a' },
    questions: { font: 'Simplified Arabic', size: '15px', color: '#0f172a' },
    pageBorder: { style: 'double', width: '4px', color: '#0f172a' },
    pdfHeaderShading: 'none'
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionNum, setCurrentQuestionNum] = useState('السؤال الأول');
  const [currentBranchLabel, setCurrentBranchLabel] = useState('A');
  const [branchPrompt, setBranchPrompt] = useState('جد ناتج ما يأتي:');
  const [currentBlocks, setCurrentBlocks] = useState<Block[]>([]);
  const [activeSymbolDropdown, setActiveSymbolDropdown] = useState<string | null>(null);
  const [tempBranches, setTempBranches] = useState<Branch[]>([]);

  const toggleDropdown = useCallback((key: string) => {
    Haptics.selectionAsync();
    setActiveDropdown(prev => (prev === key ? null : key));
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setCurrentBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const removeBlock = useCallback((id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCurrentBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const addBlock = (type: BlockType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newBlock: Block = {
      id: Date.now().toString() + Math.random(),
      type,
      value: type === 'text' ? '' : undefined,
      top: type === 'fraction' ? '' : undefined,
      bottom: type === 'fraction' ? '' : undefined,
      inner: ['simple_root', 'absolute', 'brackets', 'vector'].includes(type) ? '' : undefined,
      index: type === 'simple_root' ? '' : undefined,
      base: type === 'power' ? '' : undefined,
      exp: type === 'power' ? '' : undefined,
      upper: ['integral', 'sigma'].includes(type) ? '' : undefined,
      lower: ['integral', 'sigma'].includes(type) ? '' : undefined,
      body: ['integral', 'limit', 'sigma'].includes(type) ? '' : undefined,
      limitVar: type === 'limit' ? 'x' : undefined,
      limitTo: type === 'limit' ? '0' : undefined,
      topCoeff: type === 'root_fraction' ? '' : undefined,
      topIndex: type === 'root_fraction' ? '' : undefined,
      topInner: type === 'root_fraction' ? '' : undefined,
      topExp: type === 'root_fraction' ? '' : undefined,
      bottomCoeff: type === 'root_fraction' ? '' : undefined,
      bottomIndex: type === 'root_fraction' ? '' : undefined,
      bottomInner: type === 'root_fraction' ? '' : undefined,
      bottomExp: type === 'root_fraction' ? '' : undefined,
    };
    setCurrentBlocks(prev => [...prev, newBlock]);
  };

  const insertSymbol = (sym: string) => {
    Haptics.selectionAsync();
    const last = currentBlocks[currentBlocks.length - 1];
    if (last && last.type === 'text') {
      updateBlock(last.id, { value: (last.value || '') + sym + ' ' });
    } else {
      addBlock('text');
      setTimeout(() => {
        setCurrentBlocks(prev => {
          if (prev.length > 0) {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], value: sym + ' ' };
            return updated;
          }
          return prev;
        });
      }, 50);
    }
  };

  const addBranchToCurrentQuestion = () => {
    if (!branchPrompt.trim() && currentBlocks.length === 0) {
      return Alert.alert('تنبيه', 'يرجى كتابة نص الفرع أو المعادلة أولاً');
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newBranch: Branch = {
      id: Date.now().toString() + Math.random(),
      branchLabel: currentBranchLabel,
      prompt: branchPrompt,
      blocks: [...currentBlocks]
    };
    setTempBranches(prev => [...prev, newBranch]);
    setBranchPrompt('');
    setCurrentBlocks([]);
    if (currentBranchLabel === 'A') setCurrentBranchLabel('B');
    else if (currentBranchLabel === 'B') setCurrentBranchLabel('C');
    else if (currentBranchLabel === 'أ') setCurrentBranchLabel('ب');
    else if (currentBranchLabel === 'ب') setCurrentBranchLabel('ج');
  };

  const commitQuestionWithBranches = () => {
    let branchesToCommit = [...tempBranches];
    if (branchesToCommit.length === 0 && (branchPrompt.trim() || currentBlocks.length > 0)) {
      branchesToCommit.push({
        id: Date.now().toString(),
        branchLabel: currentBranchLabel,
        prompt: branchPrompt,
        blocks: [...currentBlocks]
      });
    }

    if (branchesToCommit.length === 0) {
      return Alert.alert('تنبيه', 'أضف فرعاً واحداً على الأقل للسؤال');
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newQuestion: QuestionItem = {
      id: Date.now().toString(),
      questionNumber: currentQuestionNum,
      branches: branchesToCommit
    };

    setQuestions(prev => [...prev, newQuestion]);
    setTempBranches([]);
    setBranchPrompt('');
    setCurrentBlocks([]);
    const nextNum = questions.length + 2;
    if (currentQuestionNum.includes('الثاني')) setCurrentQuestionNum('السؤال الثالث');
    else if (currentQuestionNum.includes('الأول')) setCurrentQuestionNum('السؤال الثاني');
    else setCurrentQuestionNum(`السؤال ${nextNum}`);
    setCurrentBranchLabel('A');
  };

  const deleteQuestion = (index: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const symbolCategories = [
    { id: 'vars', title: 'المتغيرات', items: ['x', 'y', 'z', 'a', 'b', 'c', 'n', 'm', 'k', 'r'] },
    { id: 'ops', title: 'العمليات والمقارنة', items: ['+', '-', '×', '÷', '=', '≠', '±', '∓', '<', '>', '≤', '≥', '≈'] },
    { id: 'funcs', title: 'الدوال والتفاضل', items: ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'dx', 'dy', "f'(x)", 'd/dx'] },
    { id: 'geom_sets', title: 'الهندسة والمجموعات', items: ['△', '∠', '⊥', '∥', '≅', '∈', '∉', '∪', '∩', '⊂', '∅', '∞', 'ℝ', 'ℤ', 'ℂ'] },
    { id: 'consts', title: 'الثوابت', items: ['i', 'ω', 'π', 'θ', 'α', 'β', 'γ', 'λ', 'Δ'] },
  ];

  const compileBlocksToHTML = (blocks: Block[]): string => {
    if (!blocks || blocks.length === 0) return '';
    let html = '<span style="display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: flex-start; direction: ltr;">';
    
    blocks.forEach((b) => {
      if (b.type === 'text') {
        html += `<span style="margin: 0 2px; font-weight: bold; font-family: '${examConfig.questions.font}', sans-serif;">${b.value || ''}</span>`;
      } else if (b.type === 'fraction') {
        html += `
          <span style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 6px; font-family: 'Times New Roman', serif; font-weight: bold; vertical-align: middle; direction: ltr;">
            <span style="border-bottom: 2px solid ${examConfig.header.color}; padding: 2px 6px; min-width: 15px; text-align: center;">${b.top || '&nbsp;'}</span>
            <span style="padding: 2px 6px; min-width: 15px; text-align: center;">${b.bottom || '&nbsp;'}</span>
          </span>
        `;
      } else if (b.type === 'root_fraction') {
        let topH = '';
        if (b.topCoeff) topH += `<span>${b.topCoeff}</span>`;
        if (b.topInner) {
          const idxSup = b.topIndex ? `<sup style="font-size: 0.6em; font-weight: bold; margin-bottom: 12px; margin-right: -2px;">${b.topIndex}</sup>` : '';
          const expSup = b.topExp ? `<sup style="font-size: 0.7em; margin-right: 2px;">${b.topExp}</sup>` : '';
          topH += `
            <span style="display: inline-flex; align-items: flex-end; margin: 0 2px; font-family: 'Times New Roman', serif; direction: ltr;">
              ${idxSup}
              <span style="font-size: 2.1em; line-height: 0.8; font-weight: 300; margin-bottom: -2px;">√</span>
              <span style="border-top: 1.5px solid ${examConfig.header.color}; padding: 3px 5px 0 5px; font-weight: bold; margin-bottom: 2px;">${b.topInner}${expSup}</span>
            </span>
          `;
        }
        if (!topH) topH = '&nbsp;';

        let botH = '';
        if (b.bottomCoeff) botH += `<span style="margin-right: 3px;">${b.bottomCoeff}</span>`;
        if (b.bottomInner) {
          const idxSup = b.bottomIndex ? `<sup style="font-size: 0.6em; font-weight: bold; margin-bottom: 12px; margin-right: -2px;">${b.bottomIndex}</sup>` : '';
          const expSup = b.bottomExp ? `<sup style="font-size: 0.7em; margin-right: 2px;">${b.bottomExp}</sup>` : '';
          botH += `
            <span style="display: inline-flex; align-items: flex-end; margin: 0 2px; font-family: 'Times New Roman', serif; direction: ltr;">
              ${idxSup}
              <span style="font-size: 2.1em; line-height: 0.8; font-weight: 300; margin-bottom: -2px;">√</span>
              <span style="border-top: 1.5px solid ${examConfig.header.color}; padding: 3px 5px 0 5px; font-weight: bold; margin-bottom: 2px;">${b.bottomInner}${expSup}</span>
            </span>
          `;
        }
        if (!botH) botH = '&nbsp;';

        html += `
          <span style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 6px; font-family: 'Times New Roman', serif; font-weight: bold; vertical-align: middle; direction: ltr;">
            <span style="border-bottom: 2px solid ${examConfig.header.color}; padding: 2px 8px; min-width: 20px; text-align: center; display: inline-flex; align-items: center;">${topH}</span>
            <span style="padding: 2px 8px; min-width: 20px; text-align: center; display: inline-flex; align-items: center;">${botH}</span>
          </span>
        `;
      } else if (b.type === 'simple_root' || b.type === 'root') {
        const indexSup = b.index ? `<sup style="font-size: 0.6em; font-weight: bold; margin-bottom: 12px; margin-right: -2px;">${b.index}</sup>` : '';
        html += `
          <span style="display: inline-flex; align-items: flex-end; margin: 0 4px; font-family: 'Times New Roman', serif; direction: ltr;">
            ${indexSup}
            <span style="font-size: 2.1em; line-height: 0.8; font-weight: 300; margin-bottom: -2px;">√</span>
            <span style="border-top: 1.5px solid ${examConfig.header.color}; padding: 3px 5px 0 5px; font-weight: bold; margin-bottom: 2px;">${b.inner || '&nbsp;'}</span>
          </span>
        `;
      } else if (b.type === 'power') {
        html += `
          <span style="display: inline-flex; align-items: flex-start; margin: 0 4px; font-family: 'Times New Roman', serif; font-weight: bold; direction: ltr;">
            <span style="font-size: 1.15em; margin-top: 5px;">${b.base || '&nbsp;'}</span>
            <sup style="font-size: 0.85em; margin-top: -2px;">${b.exp || '&nbsp;'}</sup>
          </span>
        `;
      } else if (b.type === 'integral') {
        html += `
          <span style="display: inline-flex; align-items: center; margin: 0 6px; font-family: 'Times New Roman', serif; direction: ltr; vertical-align: middle;">
            <span style="display: inline-flex; flex-direction: column; justify-content: center; align-items: center; margin-right: 3px;">
               <span style="font-size: 0.7em; font-weight: bold; margin-bottom: -5px;">${b.upper || ''}</span>
               <span style="font-size: 2.3em; font-weight: normal; line-height: 1;">∫</span>
               <span style="font-size: 0.7em; font-weight: bold; margin-top: -5px;">${b.lower || ''}</span>
            </span>
            <span style="font-size: 1.1em; font-weight: bold; align-self: center; margin-left: 3px;">${b.body || ''} dx</span>
          </span>
        `;
      } else if (b.type === 'limit') {
        html += `
          <span style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 5px; font-family: 'Times New Roman', serif; vertical-align: middle; direction: ltr;">
            <span style="font-size: 1.2em; font-weight: bold; line-height: 1;">lim</span>
            <span style="font-size: 0.7em; font-weight: bold; margin-top: -2px;">${b.limitVar || 'x'} → ${b.limitTo || '0'}</span>
          </span>
          <span style="font-size: 1.1em; font-weight: bold; font-family: 'Times New Roman', serif; margin-left: 4px; vertical-align: middle;">${b.body || ''}</span>
        `;
      } else if (b.type === 'absolute') {
        html += `<span style="display: inline-flex; align-items: center; margin: 0 3px; font-family: 'Times New Roman', serif; font-weight: bold; direction: ltr;"><span style="font-size: 1.3em; border-left: 2px solid ${examConfig.header.color}; border-right: 2px solid ${examConfig.header.color}; padding: 0 5px;">${b.inner || ''}</span></span>`;
      } else if (b.type === 'brackets') {
        html += `<span style="display: inline-flex; align-items: center; margin: 0 3px; font-family: 'Times New Roman', serif; font-weight: bold; direction: ltr;"><span style="font-size: 1.5em; font-weight: 300;">[</span><span style="padding: 0 3px; font-size: 1.1em;">${b.inner || ''}</span><span style="font-size: 1.5em; font-weight: 300;">]</span></span>`;
      }
    });

    html += '</span>';
    return html;
  };

  const getBackgroundColor = (type: string) => {
    const colors: Record<string, string> = {
      blue_light: '#eff6ff', gray_light: '#f8fafc', green_light: '#f0fdf4',
      none: 'transparent', gradient: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', glass: 'rgba(255,255,255,0.45)'
    };
    return colors[type] || 'transparent';
  };

  const generateHeaderHTML = () => {
    const tpl = examConfig.layoutTemplate;
    const hColor = examConfig.header.color;
    let headerBgCSS = getBackgroundColor(examConfig.pdfHeaderShading);
    if (examConfig.pdfHeaderShading === 'none') headerBgCSS = '#ffffff';

    switch (tpl) {
      case 'ministry':
        return `
          <div class="exam-header" style="margin-bottom:24px;">
            <table style="width: 100%; border-collapse: collapse; border: 2px solid ${hColor}; background: ${headerBgCSS};">
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
      case 'modern':
        return `
          <div class="exam-header" style="background: ${headerBgCSS}; border-radius: 16px; padding: 20px; margin-bottom:20px;">
            <div style="text-align: center; width: 100%;">
              <h1 style="margin: 0 0 8px 0; font-size: calc(${examConfig.header.size} + 6px); font-weight: 900; color: #fff; background: ${hColor}; padding: 8px 20px; display: inline-block; border-radius: 20px;">${examMeta.examTitle}</h1>
              <div style="display: flex; justify-content: space-between; margin-top: 15px; padding: 0 10px; font-weight: 700; color: ${hColor}; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 15px;">
                <div style="text-align: right; line-height: 1.6;"><div>${examMeta.school}</div><div>المادة: ${examMeta.subject}</div></div>
                <div style="text-align: center; line-height: 1.6;"><div style="color: #64748b;">${examMeta.academicYear}</div></div>
                <div style="text-align: left; line-height: 1.6;"><div>${examMeta.grade}</div><div>${examMeta.time}</div></div>
              </div>
            </div>
          </div>`;
      case 'minimalist':
        return `
          <div class="exam-header" style="background: transparent; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; display:flex; flex-direction: column;">
            <h1 style="margin: 0 0 5px 0; font-size: calc(${examConfig.header.size} + 6px); font-weight: 900; color: #000;">${examMeta.examTitle}</h1>
            <div style="display: flex; width: 100%; justify-content: space-between; font-weight: 600; color: #333; margin-top: 8px;">
              <div>${examMeta.school} &nbsp;|&nbsp; ${examMeta.subject}</div>
              <div>${examMeta.grade} &nbsp;|&nbsp; ${examMeta.academicYear} &nbsp;|&nbsp; ${examMeta.time}</div>
            </div>
          </div>`;
      case 'boxed':
        return `
          <div class="exam-header" style="display:flex; justify-content:space-between; gap:10px; margin-bottom:20px;">
            <div style="flex:1; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: right; background: ${headerBgCSS};">
              <div style="font-weight:900; color:${hColor}; margin-bottom:4px;">${examMeta.school}</div>
              <div style="color:#334155;">المادة: ${examMeta.subject}</div>
            </div>
            <div style="flex:1.2; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: center; background: ${headerBgCSS};">
              <h1 style="margin:0 0 4px 0; font-size: calc(${examConfig.header.size} + 2px); font-weight:900; color:${hColor};">${examMeta.examTitle}</h1>
              <div style="color:#64748b;">${examMeta.academicYear}</div>
            </div>
            <div style="flex:1; border: 2px solid ${hColor}; border-radius: 8px; padding: 12px; text-align: left; background: ${headerBgCSS};">
              <div style="font-weight:900; color:${hColor}; margin-bottom:4px;">${examMeta.grade}</div>
              <div style="color:#334155;">الزمن: ${examMeta.time}</div>
            </div>
          </div>`;
      case 'elegant':
        return `
          <div class="exam-header" style="border-top: 3px double ${hColor}; border-bottom: 3px double ${hColor}; padding: 15px 0; margin-bottom: 25px; text-align: center; background: ${headerBgCSS};">
            <h1 style="margin: 0 0 10px 0; font-size: calc(${examConfig.header.size} + 6px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
            <div style="display: flex; justify-content: space-around; font-weight: 600; color: #475569;">
              <span>${examMeta.school}</span><span>•</span><span>${examMeta.subject}</span><span>•</span><span>${examMeta.grade}</span><span>•</span><span>${examMeta.time}</span>
            </div>
          </div>`;
      case 'centered':
        return `
          <div class="exam-header" style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid rgba(0,0,0,0.1); background: ${headerBgCSS};">
            <h3 style="margin: 0 0 5px 0; color: #475569;">${examMeta.school}</h3>
            <h1 style="margin: 0 0 10px 0; font-size: calc(${examConfig.header.size} + 8px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
            <div style="font-weight: bold; color: #334155; display: inline-flex; gap: 20px; background: rgba(0,0,0,0.03); padding: 5px 15px; border-radius: 20px;">
              <span>المادة: ${examMeta.subject}</span><span>الصف: ${examMeta.grade}</span><span>الزمن: ${examMeta.time}</span>
            </div>
          </div>`;
      case 'ribbon':
        return `
          <div class="exam-header" style="margin-bottom: 25px; background: ${headerBgCSS};">
            <div style="background: ${hColor}; color: #ffffff; text-align: center; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 4px); font-weight: 900;">${examMeta.examTitle}</h1>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: #334155; padding: 0 10px;">
              <div style="text-align: right;"><div>${examMeta.school}</div><div>${examMeta.academicYear}</div></div>
              <div style="text-align: center;"><div>المادة: ${examMeta.subject}</div></div>
              <div style="text-align: left;"><div>${examMeta.grade}</div><div>${examMeta.time}</div></div>
            </div>
          </div>`;
      case 'grid':
        return `
          <div class="exam-header" style="margin-bottom: 20px; background: ${headerBgCSS};">
            <h1 style="text-align: center; margin: 0 0 15px 0; color: ${hColor}; font-size: calc(${examConfig.header.size} + 4px);">${examMeta.examTitle}</h1>
            <div style="display: flex; flex-wrap: wrap; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-bottom: 1px solid #cbd5e1; border-left: 1px solid #cbd5e1; font-weight: bold;">المدرسة: ${examMeta.school}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-bottom: 1px solid #cbd5e1; font-weight: bold;">العام: ${examMeta.academicYear}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; border-left: 1px solid #cbd5e1; font-weight: bold;">المادة: ${examMeta.subject}</div>
              <div style="width: 50%; padding: 8px; box-sizing: border-box; font-weight: bold;">الصف والزمن: ${examMeta.grade} - ${examMeta.time}</div>
            </div>
          </div>`;
      case 'split':
        return `
          <div class="exam-header" style="display: flex; margin-bottom: 25px; border-bottom: 3px solid ${hColor}; padding-bottom: 15px; background: ${headerBgCSS};">
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
      case 'compact':
        return `
          <div class="exam-header" style="margin-bottom: 15px; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 8px; background: ${headerBgCSS};">
            <span style="font-weight: 900; font-size: calc(${examConfig.header.size} + 2px); margin-left: 15px; color: ${hColor};">${examMeta.examTitle}</span>
            <span style="font-weight: bold; margin-left: 10px;">${examMeta.school}</span>
            <span style="color: #475569;">(${examMeta.subject} - ${examMeta.grade} - ${examMeta.time})</span>
          </div>`;
      case 'underlined':
        return `
          <div class="exam-header" style="margin-bottom: 20px; background: ${headerBgCSS};">
            <div style="width: 100%; text-align: center; margin-bottom: 15px;">
              <h1 style="margin: 0; display: inline-block; border-bottom: 3px solid ${hColor}; padding-bottom: 5px; color: ${hColor};">${examMeta.examTitle}</h1>
            </div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: right;">المدرسة: ${examMeta.school}</div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: center;">المادة: ${examMeta.subject}</div>
            <div style="width: 30%; border-bottom: 1.5px dotted #000; padding-bottom: 3px; font-weight: bold; text-align: left;">الزمن: ${examMeta.time}</div>
          </div>`;
      case 'rounded':
        return `
          <div class="exam-header" style="margin-bottom: 25px; background: ${headerBgCSS};">
            <div style="width: 100%; text-align: center; background: rgba(241,245,249,0.9); padding: 15px; border-radius: 30px; margin-bottom: 10px;">
              <h1 style="margin: 0; color: ${hColor};">${examMeta.examTitle}</h1>
            </div>
            <div style="display: flex; gap: 10px;">
              <div style="flex: 1; background: #e2e8f0; padding: 10px; border-radius: 20px; text-align: center; font-weight: bold;">${examMeta.school}</div>
              <div style="flex: 1; background: #e2e8f0; padding: 10px; border-radius: 20px; text-align: center; font-weight: bold;">${examMeta.subject} - ${examMeta.grade}</div>
              <div style="flex: 1; background: #e2e8f0; padding: 10px; border-radius: 20px; text-align: center; font-weight: bold;">${examMeta.time}</div>
            </div>
          </div>`;
      case 'academic':
        return `
          <div class="exam-header" style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #000; padding-bottom: 10px; background: ${headerBgCSS};">
            <div style="width: 25%; text-align: center;"><div style="width: 50px; height: 50px; border-radius: 25px; border: 2px solid ${hColor}; margin: 0 auto; display:flex; align-items:center; justify-content:center; font-size:10px;">شعار</div></div>
            <div style="width: 50%; text-align: center;">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 4px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
              <div style="font-weight: bold;">${examMeta.school}</div>
            </div>
            <div style="width: 25%; text-align: left; font-weight: bold; font-size: 0.9em;">
              <div>${examMeta.academicYear}</div><div>${examMeta.subject}</div><div>${examMeta.time}</div>
            </div>
          </div>`;
      case 'bold':
        return `
          <div class="exam-header" style="margin-bottom: 30px; display: flex; align-items: stretch; background: ${headerBgCSS};">
            <div style="flex: 2; background: #0f172a; color: #fff; padding: 20px; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">
              <h1 style="margin: 0; font-size: calc(${examConfig.header.size} + 10px); line-height: 1.2;">${examMeta.examTitle}</h1>
              <div style="color: #94a3b8; margin-top: 10px;">${examMeta.subject} | ${examMeta.grade}</div>
            </div>
            <div style="flex: 1; padding: 20px; font-weight: bold; color: #334155; text-align: left;">
              <div style="margin-bottom: 8px;">${examMeta.school}</div><div style="margin-bottom: 8px;">${examMeta.academicYear}</div><div>${examMeta.time}</div>
            </div>
          </div>`;
      default:
        return `
          <div class="exam-header classic-layout" style="background: ${headerBgCSS}; border-bottom: 3px solid ${hColor}; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; margin-bottom: 18px;">
            <div style="width: 30%; text-align: right; font-weight: 700; color: ${hColor};"><div>${examMeta.school}</div></div>
            <div style="text-align: center; width: 40%;">
              <h1 style="margin: 0 0 4px 0; font-size: calc(${examConfig.header.size} + 3px); font-weight: 900; color: ${hColor};">${examMeta.examTitle}</h1>
              <div style="font-size: calc(${examConfig.header.size} - 1.5px); font-weight: 700; color: ${hColor}; opacity: 0.85;">${examMeta.academicYear}</div>
            </div>
            <div style="width: 30%; text-align: left; font-weight: 700; color: ${hColor};">
              <div>${examMeta.grade}</div><div>${examMeta.subject}</div><div>${examMeta.time}</div>
            </div>
          </div>`;
    }
  };

  const generateFooterHTML = () => {
    return `
      <div class="exam-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; font-weight: 700; border-top: 1.5px dashed rgba(203, 213, 225, 0.8); margin-top: 30px;">
        <div style="width: 35%; text-align: right;">${examMeta.teacherName ? `مدرس المادة: ${examMeta.teacherName}` : ''}</div>
        <div style="width: 30%; text-align: center; font-weight: 900;">${examMeta.closingText}</div>
        <div style="width: 35%; text-align: left;">انتهت الأسئلة</div>
      </div>`;
  };

  const generateFullHTML = () => {
    let questionsHTML = '';
    questions.forEach((q) => {
      questionsHTML += `<div class="question-title">${q.questionNumber}:</div>`;
      q.branches.forEach((b) => {
        const compiledEq = compileBlocksToHTML(b.blocks);
        questionsHTML += `
          <div class="branch-row">
            <span class="branch-label">${b.branchLabel})</span>
            <span style="font-weight: bold; margin-left: 8px;">${b.prompt}</span>
            ${compiledEq}
          </div>
        `;
      });
    });

    const fontImportUrl = `https://fonts.googleapis.com/css2?family=${examConfig.header.font.replace(/ /g, '+')}:wght@400;700;900&display=swap`;
    
    let borderCSS = '';
    switch (examConfig.pageBorder.style) {
      case 'double': borderCSS = `border: 3px double ${examConfig.pageBorder.color}; padding: 12mm;`; break;
      case 'solid': borderCSS = `border: ${examConfig.pageBorder.width} solid ${examConfig.pageBorder.color}; padding: 12mm;`; break;
      case 'dashed': borderCSS = `border: ${examConfig.pageBorder.width} dashed ${examConfig.pageBorder.color}; padding: 12mm;`; break;
      case 'dotted': borderCSS = `border: ${examConfig.pageBorder.width} dotted ${examConfig.pageBorder.color}; padding: 12mm;`; break;
      case 'groove': borderCSS = `border: ${examConfig.pageBorder.width} groove ${examConfig.pageBorder.color}; padding: 12mm;`; break;
      case 'ridge': borderCSS = `border: ${examConfig.pageBorder.width} ridge ${examConfig.pageBorder.color}; padding: 12mm;`; break;
      default: borderCSS = `border: none; padding: 10mm;`;
    }

    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('${fontImportUrl}');
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;700;900&display=swap');
            @page { size: A4 portrait; margin: 8mm; }
            body { 
              font-family: '${examConfig.header.font}', sans-serif; 
              color: ${examConfig.header.color}; 
              margin: 0; padding: 0; background-color: #fff; direction: rtl;
              -webkit-print-color-adjust: exact;
            }
            .page-container {
              ${borderCSS}
              min-height: 275mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: page;
            }
            .content-section { flex: 1; }
            .instructions { 
              font-weight: 900; text-decoration: underline; margin-bottom: 18px; font-size: ${examConfig.questions.size}; 
              background: rgba(224, 242, 254, 0.8); padding: 8px 12px; border-radius: 4px; border-right: 5px solid ${examConfig.header.color};
            }
            .question-title { 
              font-weight: 900; font-size: calc(${examConfig.questions.size} + 1px); margin-top: 15px; margin-bottom: 6px; text-align: right; page-break-inside: avoid; break-inside: avoid;
            }
            .branch-row { 
              margin-bottom: 14px; margin-right: 15px; text-align: right; display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-start; direction: rtl;
              font-size: ${examConfig.questions.size}; font-family: '${examConfig.questions.font}', sans-serif; page-break-inside: avoid; break-inside: avoid;
            }
            .branch-label { font-weight: 900; margin-left: 8px; color: ${examConfig.header.color}; }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="content-section">
              ${generateHeaderHTML()}
              <div class="instructions">${examNote}</div>
              <div style="margin-top: 10px;">${questionsHTML}</div>
            </div>
            ${generateFooterHTML()}
          </div>
          ${getWatermarkHTML()}
        </body>
      </html>
    `;
  };

  const handlePreview = () => {
    if (questions.length === 0) return Alert.alert('تنبيه', 'أضف سؤالاً واحداً على الأقل للمعاينة');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExamStore(generateFullHTML(), false, '#2563eb');
    router.push('/modal');
  };

  const handlePrint = async () => {
    if (questions.length === 0) return Alert.alert('تنبيه', 'أضف سؤالاً واحداً على الأقل للطباعة');
    
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    setIsPrinting(true);
    try {
      await Print.printAsync({ html: generateFullHTML() });
    } catch (error) {
      Alert.alert('خطأ', 'فشلت عملية الطباعة');
    } finally {
      setIsPrinting(false);
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

        <View style={styles.topNavRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={24} color="#4B5320" />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>صانع اختبارات الرياضيات</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'settings' && styles.activeTab]} onPress={() => setActiveTab('settings')}>
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>الترويسة والتصميم والقوالب والإطارات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'questions' && styles.activeTab]} onPress={() => setActiveTab('questions')}>
            <Text style={[styles.tabText, activeTab === 'questions' && styles.activeTabText]}>الأسئلة والمعادلات</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {activeTab === 'settings' && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>أولاً: بيانات الترويسة والذيل الوزاري</Text>
              
              <Text style={styles.label}>اسم المدرسة (الجهة اليمنى للراس):</Text>
              <TextInput style={styles.input} value={examMeta.school} onChangeText={(v) => setExamMeta(p => ({...p, school: v}))} textAlign="right" />
              
              <Text style={styles.label}>عنوان الامتحان (وسط الراس):</Text>
              <TextInput style={styles.input} value={examMeta.examTitle} onChangeText={(v) => setExamMeta(p => ({...p, examTitle: v}))} textAlign="right" />
              
              <Text style={styles.label}>السنة الدراسية (تحت العنوان):</Text>
              <TextInput style={styles.input} value={examMeta.academicYear} onChangeText={(v) => setExamMeta(p => ({...p, academicYear: v}))} textAlign="right" />
              
              <Text style={styles.label}>الصف (الجهة اليسرى للراس):</Text>
              <TextInput style={styles.input} value={examMeta.grade} onChangeText={(v) => setExamMeta(p => ({...p, grade: v}))} textAlign="right" />
              
              <Text style={styles.label}>المادة (الجهة اليسرى للراس):</Text>
              <TextInput style={styles.input} value={examMeta.subject} onChangeText={(v) => setExamMeta(p => ({...p, subject: v}))} textAlign="right" />
              
              <Text style={styles.label}>الوقت (الجهة اليسرى للراس):</Text>
              <TextInput style={styles.input} value={examMeta.time} onChangeText={(v) => setExamMeta(p => ({...p, time: v}))} textAlign="right" />

              <Text style={styles.label}>اسم المدرس (يظهر في الذيل على اليمين):</Text>
              <TextInput style={styles.input} value={examMeta.teacherName} onChangeText={(v) => setExamMeta(p => ({...p, teacherName: v}))} textAlign="right" />

              <Text style={styles.label}>عبارة الختام في الذيل (وسط):</Text>
              <TextInput style={styles.input} value={examMeta.closingText} onChangeText={(v) => setExamMeta(p => ({...p, closingText: v}))} textAlign="right" />

              <Text style={styles.label}>الملاحظات العامة (ملاحظة الأسئلة):</Text>
              <TextInput style={styles.input} value={examNote} onChangeText={setExamNote} textAlign="right" />

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>ثانياً: خيارات التصميم والإطارات والتظليل والقوالب</Text>

              <ModalDropdown 
                label="شكل إطار الصفحة الخارجي:" 
                value={examConfig.pageBorder.style} 
                options={borderStylesOptions} 
                isOpen={activeDropdown === 'bStyle'} 
                onToggle={() => toggleDropdown('bStyle')} 
                onSelect={(v) => setExamConfig(p => ({...p, pageBorder: {...p.pageBorder, style: v}}))} 
              />

              <ModalDropdown 
                label="سُمك الإطار:" 
                value={examConfig.pageBorder.width} 
                options={borderWidthOptions} 
                isOpen={activeDropdown === 'bWidth'} 
                onToggle={() => toggleDropdown('bWidth')} 
                onSelect={(v) => setExamConfig(p => ({...p, pageBorder: {...p.pageBorder, width: v}}))} 
              />

              <ModalDropdown 
                label="لون إطار الصفحة:" 
                value={examConfig.pageBorder.color} 
                options={COLORS} 
                isOpen={activeDropdown === 'bColor'} 
                onToggle={() => toggleDropdown('bColor')} 
                onSelect={(v) => setExamConfig(p => ({...p, pageBorder: {...p.pageBorder, color: v}}))} 
              />

              <ModalDropdown 
                label="تظليل الرأس:" 
                value={examConfig.pdfHeaderShading} 
                options={headerShadingOptions} 
                isOpen={activeDropdown === 'hShading'} 
                onToggle={() => toggleDropdown('hShading')} 
                onSelect={(v) => setExamConfig(p => ({...p, pdfHeaderShading: v}))} 
              />

              <ModalDropdown 
                label="قالب الراس والتذيل (15 قالب هيكلي عالمي):" 
                value={examConfig.layoutTemplate} 
                options={layoutTemplates.map(t => ({ label: `${t.label} - ${t.desc}`, value: t.id }))} 
                isOpen={activeDropdown === 'layout'} 
                onToggle={() => toggleDropdown('layout')} 
                onSelect={(v) => setExamConfig(p => ({...p, layoutTemplate: v}))} 
              />

              <ModalDropdown 
                label="نوع الخط للرأس:" 
                value={examConfig.header.font} 
                options={FONTS} 
                isOpen={activeDropdown === 'hFont'} 
                onToggle={() => toggleDropdown('hFont')} 
                onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, font: v}}))} 
              />

              <ModalDropdown 
                label="حجم خط الرأس:" 
                value={examConfig.header.size} 
                options={sizeOptions} 
                isOpen={activeDropdown === 'hSize'} 
                onToggle={() => toggleDropdown('hSize')} 
                onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, size: v}}))} 
              />

              <ModalDropdown 
                label="اللون الأساسي للنص والإطار:" 
                value={examConfig.header.color} 
                options={COLORS} 
                isOpen={activeDropdown === 'hColor'} 
                onToggle={() => toggleDropdown('hColor')} 
                onSelect={(v) => setExamConfig(p => ({...p, header: {...p.header, color: v}}))} 
              />

              <ModalDropdown 
                label="حجم خط الأسئلة:" 
                value={examConfig.questions.size} 
                options={sizeOptions} 
                isOpen={activeDropdown === 'qSize'} 
                onToggle={() => toggleDropdown('qSize')} 
                onSelect={(v) => setExamConfig(p => ({...p, questions: {...p.questions, size: v}}))} 
              />
            </View>
          )}

          {activeTab === 'questions' && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>1. تحديد رقم السؤال والفرع:</Text>
              <View style={{flexDirection: 'row-reverse', gap: 10, marginBottom: 14}}>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>رقم السؤال:</Text>
                  <TextInput style={styles.input} value={currentQuestionNum} onChangeText={setCurrentQuestionNum} placeholder="السؤال الأول" textAlign="right" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>رمز الفرع:</Text>
                  <TextInput style={styles.input} value={currentBranchLabel} onChangeText={setCurrentBranchLabel} placeholder="A أو أ" textAlign="right" />
                </View>
              </View>

              <Text style={styles.label}>نص الفرع (سؤال فرعي):</Text>
              <TextInput style={[styles.input, { height: 48 }]} value={branchPrompt} onChangeText={setBranchPrompt} placeholder="مثال: جد ناتج ما يأتي:" textAlign="right" />

              <Text style={[styles.sectionHeader, { marginTop: 5 }]}>2. أدوات بناء المعادلات السريعة:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScroll}>
                <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('text')}><Text style={styles.toolBtnText}>+ نص</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#1a2e05' }]} onPress={() => addBlock('fraction')}><Text style={styles.toolBtnText}>+ كسر عادي</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#b45309' }]} onPress={() => addBlock('root_fraction')}><Text style={styles.toolBtnText}>+ كسر جذري (√)</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#047857' }]} onPress={() => addBlock('simple_root')}><Text style={styles.toolBtnText}>+ جذر</Text></TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('power')}><Text style={styles.toolBtnText}>+ أس</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#4338ca' }]} onPress={() => addBlock('integral')}><Text style={styles.toolBtnText}>+ تكامل</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#0369a1' }]} onPress={() => addBlock('limit')}><Text style={styles.toolBtnText}>+ غاية Lim</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#374151' }]} onPress={() => addBlock('absolute')}><Text style={styles.toolBtnText}>+ مطلق |x|</Text></TouchableOpacity>
              </ScrollView>

              <View style={styles.dropdownsContainer}>
                {symbolCategories.map((category) => (
                  <View key={category.id} style={styles.dropdownWrapper}>
                    <TouchableOpacity style={[styles.dropdownHeader, activeSymbolDropdown === category.id && styles.dropdownHeaderActive]} onPress={() => setActiveSymbolDropdown(activeSymbolDropdown === category.id ? null : category.id)}>
                      <Text style={[styles.dropdownHeaderText, activeSymbolDropdown === category.id && styles.dropdownHeaderTextActive]}>{category.title}</Text>
                      <Ionicons name={activeSymbolDropdown === category.id ? 'chevron-up' : 'chevron-down'} size={16} color={activeSymbolDropdown === category.id ? '#ffffff' : '#495020'} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {activeSymbolDropdown && (
                <View style={styles.activeDropdownContent}>
                  {symbolCategories.find((c) => c.id === activeSymbolDropdown)?.items.map((sym, idx) => (
                    <TouchableOpacity key={idx} style={styles.symBtn} onPress={() => insertSymbol(sym)}>
                      <Text style={styles.symText}>{sym}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>3. مساحة المعادلة للفرع الحالي:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.drawingBoardContainer} contentContainerStyle={styles.drawingBoardContent}>
                {currentBlocks.length === 0 ? (
                  <Text style={styles.emptyBoardText}>أضف نصاً أو معادلة لهذا الفرع...</Text>
                ) : (
                  currentBlocks.map((b) => (
                    <View key={b.id} style={styles.inlineBlockItem}>
                      <TouchableOpacity onPress={() => removeBlock(b.id)} style={styles.deleteSubBtn}>
                        <Ionicons name="close-circle" size={16} color="#ef4444" />
                      </TouchableOpacity>

                      {b.type === 'text' && (
                        <TextInput
                          style={styles.inlineTextInput}
                          value={b.value}
                          onChangeText={(v) => updateBlock(b.id, { value: v })}
                          placeholder="نص..."
                          textAlign="center"
                        />
                      )}

                      {b.type === 'fraction' && (
                        <View style={styles.inlineFracBox}>
                          <TextInput style={styles.inlineMiniInput} value={b.top} onChangeText={(v) => updateBlock(b.id, { top: v })} placeholder="بسط" textAlign="center" />
                          <View style={styles.inlineFracLine} />
                          <TextInput style={styles.inlineMiniInput} value={b.bottom} onChangeText={(v) => updateBlock(b.id, { bottom: v })} placeholder="مقام" textAlign="center" />
                        </View>
                      )}

                      {b.type === 'root_fraction' && (
                        <View style={{padding: 4, alignItems: 'center'}}>
                          <Text style={{fontSize: 10, fontWeight: 'bold', color: '#b45309', marginBottom: 2}}>البسط</Text>
                          <View style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
                            <TextInput style={styles.inlineMiniInput} value={b.topCoeff} onChangeText={v => updateBlock(b.id, {topCoeff: v})} placeholder="معامل" textAlign="center" />
                            <TextInput style={styles.inlineMiniInput} value={b.topIndex} onChangeText={v => updateBlock(b.id, {topIndex: v})} placeholder="دليل" textAlign="center" />
                            <TextInput style={styles.inlineMiniInput} value={b.topInner} onChangeText={v => updateBlock(b.id, {topInner: v})} placeholder="تحت الجذر" textAlign="center" />
                            <TextInput style={styles.inlineMiniInput} value={b.topExp} onChangeText={v => updateBlock(b.id, {topExp: v})} placeholder="أس" textAlign="center" />
                          </View>
                          <View style={styles.inlineFracLine} />
                          <Text style={{fontSize: 10, fontWeight: 'bold', color: '#b45309', marginVertical: 2}}>المقام</Text>
                          <View style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
                            <TextInput style={styles.inlineMiniInput} value={b.bottomCoeff} onChangeText={v => updateBlock(b.id, {bottomCoeff: v})} placeholder="معامل" textAlign="center" />
                            <TextInput style={styles.inlineMiniInput} value={b.bottomIndex} onChangeText={v => updateBlock(b.id, {bottomIndex: v})} placeholder="دليل" textAlign="center" />
                            <TextInput style={styles.inlineMiniInput} value={b.bottomInner} onChangeText={v => updateBlock(b.id, {bottomInner: v})} placeholder="تحت الجذر" textAlign="center" />
                            <TextInput style={styles.inlineMiniInput} value={b.bottomExp} onChangeText={v => updateBlock(b.id, {bottomExp: v})} placeholder="أس" textAlign="center" />
                          </View>
                        </View>
                      )}

                      {b.type === 'simple_root' && (
                        <View style={styles.inlineRootBox}>
                          <TextInput style={styles.inlineRootIndex} value={b.index} onChangeText={(v) => updateBlock(b.id, { index: v })} placeholder="n" textAlign="center" />
                          <Text style={{fontSize: 22, fontWeight: '300'}}>√</Text>
                          <TextInput style={styles.inlineMiniInput} value={b.inner} onChangeText={(v) => updateBlock(b.id, { inner: v })} placeholder="القيمة" textAlign="center" />
                        </View>
                      )}

                      {b.type === 'power' && (
                        <View style={styles.inlinePowerBox}>
                          <TextInput style={styles.inlineMiniInput} value={b.base} onChangeText={(v) => updateBlock(b.id, { base: v })} placeholder="أساس" textAlign="center" />
                          <TextInput style={[styles.inlineMiniInput, {fontSize: 11}]} value={b.exp} onChangeText={(v) => updateBlock(b.id, { exp: v })} placeholder="أس" textAlign="center" />
                        </View>
                      )}

                      {b.type === 'integral' && (
                        <View style={styles.inlineIntBox}>
                          <View style={{alignItems: 'center', marginRight: 4}}>
                            <TextInput style={styles.inlineMiniInputSuper} value={b.upper} onChangeText={(v) => updateBlock(b.id, { upper: v })} placeholder="b" textAlign="center" />
                            <Text style={{fontSize: 20}}>∫</Text>
                            <TextInput style={styles.inlineMiniInputSuper} value={b.lower} onChangeText={(v) => updateBlock(b.id, { lower: v })} placeholder="a" textAlign="center" />
                          </View>
                          <TextInput style={styles.inlineMiniInput} value={b.body} onChangeText={(v) => updateBlock(b.id, { body: v })} placeholder="الدالة" textAlign="center" />
                          <Text style={{fontWeight: 'bold', fontSize: 13}}>dx</Text>
                        </View>
                      )}

                      {b.type === 'limit' && (
                        <View style={styles.inlineLimitBox}>
                          <View style={{alignItems: 'center', marginRight: 4}}>
                            <Text style={{fontSize: 11, fontWeight: 'bold'}}>lim</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <TextInput style={styles.inlineMiniInputSuper} value={b.limitVar} onChangeText={(v) => updateBlock(b.id, { limitVar: v })} placeholder="x" textAlign="center" />
                              <Text style={{fontSize: 9}}>→</Text>
                              <TextInput style={styles.inlineMiniInputSuper} value={b.limitTo} onChangeText={(v) => updateBlock(b.id, { limitTo: v })} placeholder="0" textAlign="center" />
                            </View>
                          </View>
                          <TextInput style={styles.inlineMiniInput} value={b.body} onChangeText={(v) => updateBlock(b.id, { body: v })} placeholder="الدالة" textAlign="center" />
                        </View>
                      )}

                      {b.type === 'absolute' && (
                        <View style={styles.inlineAbsBox}>
                          <Text style={{fontWeight: 'bold', fontSize: 18}}>|</Text>
                          <TextInput style={styles.inlineMiniInput} value={b.inner} onChangeText={(v) => updateBlock(b.id, { inner: v })} placeholder="قيمة" textAlign="center" />
                          <Text style={{fontWeight: 'bold', fontSize: 18}}>|</Text>
                        </View>
                      )}

                      {b.type === 'brackets' && (
                        <View style={styles.inlineAbsBox}>
                          <Text style={{fontWeight: '300', fontSize: 18}}>[</Text>
                          <TextInput style={styles.inlineMiniInput} value={b.inner} onChangeText={(v) => updateBlock(b.id, { inner: v })} placeholder="عبارة" textAlign="center" />
                          <Text style={{fontWeight: '300', fontSize: 18}}>]</Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>

              <View style={{flexDirection: 'row-reverse', gap: 10, marginBottom: 15}}>
                <TouchableOpacity style={[styles.subAddBtn, {backgroundColor: '#b45309', flex: 1}]} onPress={addBranchToCurrentQuestion}>
                  <Ionicons name="add-circle" size={18} color="#fff" />
                  <Text style={styles.subAddBtnText}>+ إضافة فرع آخر لهذا السؤال</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.subAddBtn, {backgroundColor: '#4B5320', flex: 1}]} onPress={commitQuestionWithBranches}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#fff" />
                  <Text style={styles.subAddBtnText}>اعتماد السؤال كاملاً وفروعه</Text>
                </TouchableOpacity>
              </View>

              {tempBranches.length > 0 && (
                <View style={styles.tempBranchesBox}>
                  <Text style={{fontSize: 12, fontWeight: 'bold', color: '#b45309', marginBottom: 4, textAlign: 'right'}}>الفروع المضافة لهذا السؤال ({tempBranches.length}):</Text>
                  {tempBranches.map((tb, idx) => (
                    <Text key={idx} style={{fontSize: 12, color: '#334155', textAlign: 'right', fontWeight: 'bold'}}>
                      • الفرع ({tb.branchLabel}): {tb.prompt}
                    </Text>
                  ))}
                </View>
              )}

              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>قائمة الأسئلة النهائية ({questions.length})</Text>
              {questions.map((q, idx) => (
                <View key={idx} style={styles.questionCard}>
                  <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <Text style={{fontWeight: '900', color: '#4B5320', fontSize: 14}}>{q.questionNumber}</Text>
                    {q.branches.map((b, bIdx) => (
                      <Text key={bIdx} style={styles.qText}>- فرع ({b.branchLabel}): {b.prompt}</Text>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => deleteQuestion(idx)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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

            <TouchableOpacity onPress={handlePrint} style={styles.dockBtn} disabled={isPrinting} activeOpacity={0.7}>
              <View style={[styles.dockIconBg, { backgroundColor: 'rgba(75, 83, 32, 0.1)' }]}>
                {isPrinting ? <ActivityIndicator color="#4B5320" size="small" /> : <Ionicons name="print" size={20} color="#4B5320" />}
              </View>
              <Text style={[styles.dockBtnText, { color: '#4B5320' }]} numberOfLines={1}>طباعة</Text>
            </TouchableOpacity>
          </BlurView>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  topNavRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: Platform.OS==='ios'? 50: 30, paddingHorizontal: 18 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(75, 83, 32, 0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)' },
  topNavTitle: { fontSize: 20, fontWeight: '900', color: '#3f4a2e', letterSpacing: 0.5 },

  tabsContainer: { flexDirection: 'row-reverse', backgroundColor: '#ffffff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, marginHorizontal: 18, borderRadius: 16, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#4B5320', backgroundColor: 'rgba(75, 83, 32, 0.03)' },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8' },
  activeTabText: { color: '#4B5320' },
  
  scrollContent: { padding: 18, paddingBottom: 120 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.2)', shadowColor: '#4B5320', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  sectionHeader: { fontSize: 15, fontWeight: '900', color: '#3f4a2e', marginBottom: 12, textAlign: 'right' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#6E7A41', marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 16, paddingHorizontal: 14, height: 48, fontSize: 14, color: '#3f4a2e', marginBottom: 12, textAlign: 'right', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(75, 83, 32, 0.15)', marginVertical: 20 },

  dropdownWrapperNew: { marginBottom: 12 },
  subLabel: { color: '#6E7A41', fontSize: 12, marginBottom: 6, fontWeight: '700', textAlign: 'right' },
  dropdownHeaderNew: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 16, paddingHorizontal: 16, height: 48 },
  dropdownHeaderInner: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1, gap: 10 },
  dropdownHeaderText: { color: '#3f4a2e', fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' },

  dropdownItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  dropdownItemSelected: { backgroundColor: 'rgba(75, 83, 32, 0.1)' },
  dropdownItemText: { color: '#3f4a2e', fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' },
  dropdownItemTextSelected: { color: '#4B5320', fontWeight: '900' },

  toolsScroll: { flexDirection: 'row-reverse', gap: 8, paddingBottom: 12 },
  toolBtn: { backgroundColor: '#4B5320', paddingHorizontal: 12, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  toolBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  dropdownsContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  dropdownWrapper: { flexBasis: '48%', flexGrow: 1 },
  dropdownHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 12, paddingHorizontal: 10, height: 38 },
  dropdownHeaderActive: { backgroundColor: '#4B5320', borderColor: '#4B5320' },
  dropdownHeaderTextActive: { color: '#ffffff' },
  activeDropdownContent: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 12, padding: 12, marginBottom: 12 },
  symBtn: { paddingHorizontal: 10, height: 36, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', minWidth: 40 },
  symText: { color: '#3f4a2e', fontSize: 15, fontWeight: 'bold' },

  drawingBoardContainer: { backgroundColor: 'rgba(255, 255, 255, 0.8)', minHeight: 120, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(75, 83, 32, 0.2)', padding: 12, marginBottom: 15 },
  drawingBoardContent: { alignItems: 'center' },
  emptyBoardText: { color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: 15 },
  
  inlineBlockItem: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.2)', borderRadius: 10, padding: 8, marginHorizontal: 4, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  deleteSubBtn: { position: 'absolute', top: -8, left: -8, zIndex: 10, backgroundColor: '#fff', borderRadius: 10 },
  inlineTextInput: { fontSize: 15, fontWeight: 'bold', color: '#3f4a2e', minWidth: 50, padding: 4, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  inlineMiniInput: { fontSize: 13, fontWeight: 'bold', color: '#3f4a2e', minWidth: 32, padding: 2, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  inlineMiniInputSuper: { fontSize: 10, fontWeight: 'bold', minWidth: 20, padding: 0, textAlign: 'center' },
  inlineFracBox: { alignItems: 'center', padding: 2, direction: 'ltr' },
  inlineFracLine: { height: 2, backgroundColor: '#000', width: '100%', marginVertical: 3 },
  inlineRootBox: { flexDirection: 'row', alignItems: 'flex-end', padding: 2, direction: 'ltr' },
  inlineRootIndex: { fontSize: 10, fontWeight: 'bold', marginBottom: 12, marginRight: -2 },
  inlinePowerBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 2, direction: 'ltr' },
  inlineIntBox: { flexDirection: 'row', alignItems: 'center', padding: 2, direction: 'ltr' },
  inlineLimitBox: { flexDirection: 'row', alignItems: 'center', padding: 2, direction: 'ltr' },
  inlineAbsBox: { flexDirection: 'row', alignItems: 'center', padding: 2, direction: 'ltr' },

  subAddBtn: { height: 46, borderRadius: 14, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8 },
  subAddBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  tempBranchesBox: { backgroundColor: 'rgba(254, 243, 199, 0.5)', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 12, padding: 12, marginBottom: 12 },

  questionCard: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(75, 83, 32, 0.05)', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.1)' },
  qText: { fontSize: 13, color: '#334155', textAlign: 'right', marginTop: 4, fontWeight: 'bold' },
  
  floatingDockContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, left: 20, right: 20, alignItems: 'center', justifyContent: 'center' },
  floatingDock: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 24, overflow: 'hidden', padding: 8, borderWidth: 1, borderColor: 'rgba(75, 83, 32, 0.15)', width: '100%', maxWidth: 400 },
  dockBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 },
  dockIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dockBtnText: { fontSize: 14, fontWeight: '900' },
  dockDivider: { width: 1, height: '60%', backgroundColor: 'rgba(75, 83, 32, 0.2)' }
});