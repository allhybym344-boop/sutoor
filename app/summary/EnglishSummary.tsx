import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants & Types ---
type BlockType = 'header' | 'title' | 'standard' | 'grammar' | 'vocabulary' | 'mcq' | 'writing' | 'example' | 'bilingual' | 'note' | 'qa' | 'page_break';

interface Block {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  solution?: string; // For MCQ answer, writing translation, etc.
  imageBase64?: string | null;
  options?: any;
}

const englishFonts = [
  { label: 'Open Sans (الشرح)', value: 'Open Sans' },
  { label: 'Montserrat (عناوين)', value: 'Montserrat' },
  { label: 'Roboto (عصري)', value: 'Roboto' },
  { label: 'Inter (احترافي)', value: 'Inter' },
  { label: 'Poppins (ناعم)', value: 'Poppins' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Courier New', value: 'Courier New' }
];

const presets = [
  { label: '📐 المضارع البسيط (Present Simple)', type: 'grammar', title: 'Present Simple', content: '(+) Subject + Verb1 (s/es) + Complement\n(-) Subject + don\'t / doesn\'t + Base Verb + Complement\n(?) Do / Does + subject + Base Verb + Complement ?' },
  { label: '📐 الحالة الشرطية (Second Conditional)', type: 'grammar', title: 'Second Conditional', content: 'If + Past Simple, Subject + would + base verb\nSubject + would + base verb + If + Past Simple' },
  { label: '✍️ إنشاء وصف صديق (الثالث المتوسط)', type: 'writing', title: 'Write an email describing a friend', content: 'From: Ali\nTo: Ahmed\nSubject: My new friend\n\nHi Ahmed,\nThere is a new guy in our class. His name is Zaid. He is really cool. He is very good at English and Math. He is quite tall with short black hair. He is very kind and helpful.\nWrite back soon,\nAli', solution: 'ترجمة: من علي إلى أحمد. الموضوع: صديقي الجديد...' }
];

// --- Main Builder Component ---
export default function EnglishSummary() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات المجانية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();
  
  // 1. Global Settings State
  const [settings, setSettings] = useState({
    font: 'Open Sans',
    mainColor: '#15803d',
    watermark: '',
    glassBackground: 'none',
    lineSpacing: '1.6',
    fontSize: '16px'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // 2. Canvas State (Blocks)
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'header_1', type: 'header', title: 'اللغة الإنجليزية - الثالث المتوسط', content: 'الوحدة الأولى: المراجعة والقواعد\nإعداد الأستاذ: مصطفى خالد', options: { template: 'ministry' }
    }
  ]);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // --- Handlers ---
  const handleBlockPress = (id: string) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveBlockId(id === activeBlockId ? null : id);
  };

  const updateBlock = (id: string, field: keyof Block, value: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const updateBlockOption = (id: string, optionKey: string, value: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, options: { ...b.options, [optionKey]: value } } : b));
  };

  const pickImageForBlock = async (id: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8, base64: true });
    if (!result.canceled && result.assets[0].base64) {
      updateBlock(id, 'imageBase64', `data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const addBlock = (type: BlockType, presetData?: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    let newBlock: Block = { id: Date.now().toString(), type, title: '', content: '', options: { color: settings.mainColor } };
    
    if (presetData) {
      newBlock.title = presetData.title; newBlock.content = presetData.content; newBlock.solution = presetData.solution;
    } else {
      if (type === 'title') { newBlock.title = 'عنوان جديد'; newBlock.options.align = 'left'; } 
      else if (type === 'grammar') { newBlock.title = 'عنوان القاعدة'; newBlock.content = 'اكتب القاعدة هنا...'; newBlock.options.boxStyle = 'double'; } 
      else if (type === 'standard') { newBlock.content = 'اكتب النص أو الشرح هنا...'; } 
      else if (type === 'vocabulary') { newBlock.title = 'جدول مفردات'; newBlock.content = 'Word - المعنى\nPlay - يلعب'; }
      else if (type === 'mcq') { newBlock.title = 'نص السؤال؟'; newBlock.content = 'Option A - Option B - Option C'; newBlock.solution = 'Answer'; }
      else if (type === 'writing') { newBlock.title = 'Writing Title'; newBlock.content = 'Write the essay here...'; newBlock.solution = 'الترجمة العربية...'; }
      else if (type === 'example') { newBlock.title = 'Example'; newBlock.content = 'Example text...'; newBlock.solution = 'Solution...'; }
      else if (type === 'bilingual') { newBlock.title = 'English term'; newBlock.content = 'الشرح العربي'; }
      else if (type === 'note') { newBlock.title = 'Important Note'; newBlock.content = 'ملاحظة مهمة...'; }
      else if (type === 'qa') { newBlock.title = 'Question?'; newBlock.content = 'Answer...'; }
    }
    
    setBlocks(blocks.length > 0 && blocks[0].type === 'header' ? [blocks[0], newBlock, ...blocks.slice(1)] : [newBlock, ...blocks]);
    setShowPresets(false);
    setTimeout(() => setActiveBlockId(newBlock.id), 100);
  };

  const deleteBlock = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // --- HTML Generation ---
  const generateHTML = () => {
    let contentHTML = '';
    
    blocks.forEach(b => {
      const bColor = b.options?.color || settings.mainColor;
      
      if (b.type === 'page_break') {
         contentHTML += `<div style="page-break-before: always; height: 0;"></div>`;
         return;
      }

      contentHTML += `<div style="margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid;">`;
      
      if (b.type === 'header') {
        const [unit, teacher] = b.content.split('\n');
        if (b.options?.template === 'ministry') {
           contentHTML += `<table style="width: 100%; border-collapse: collapse; border: 2px solid ${bColor};"><tr><td style="border: 1px solid ${bColor}; padding: 8px; width: 33%; text-align: left; font-weight: 900; color: ${bColor};">${b.title}</td><td style="border: 1px solid ${bColor}; padding: 8px; width: 34%; text-align: center; font-weight: 900; font-size: 16px; color: ${bColor}; background: rgba(0,0,0,0.03);">${unit || ''}</td><td style="border: 1px solid ${bColor}; padding: 8px; width: 33%; text-align: right; font-weight: 900; color: ${bColor};">${teacher || ''}</td></tr></table>`;
        } else {
           contentHTML += `<div style="background: ${bColor}; color: #fff; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; font-weight: bold;"><div>${b.title}</div><div style="background:rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 12px;">${unit || ''}</div><div>${teacher || ''}</div></div>`;
        }
      } 
      else if (b.type === 'title') {
        contentHTML += `<div style="text-align: ${b.options?.align || 'left'}; color: ${bColor}; font-size: calc(${settings.fontSize} + 4px); font-weight: 900; border-bottom: 2px dashed #cbd5e1; padding-bottom: 4px;">${b.title}</div>`;
      }
      else if (b.type === 'standard') {
        contentHTML += `<div style="font-size: ${settings.fontSize}; line-height: ${settings.lineSpacing}; white-space: pre-wrap;">${b.content}</div>`;
      }
      else if (b.type === 'grammar') {
        const lines = b.content.split('\n').map(l => `<div style="margin: 6px 0; font-weight:bold; direction:ltr;">${l}</div>`).join('');
        contentHTML += `${b.title ? `<div style="color: #b91c1c; font-weight: 900; font-size: ${settings.fontSize}; margin-bottom: 4px;">${b.title}</div>` : ''}<div style="border: ${b.options?.boxStyle === 'double' ? '4px double' : '2px solid'} ${bColor}; border-radius: 6px; padding: 10px 14px; background: #f8fafc;">${lines}</div>`;
      }
      else if (b.type === 'vocabulary') {
         const rows = b.content.split('\n').map(row => { let parts = row.split('-'); return `<tr><td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align:left; font-weight:bold; width:50%;">${parts[0] ? parts[0].trim() : ''}</td><td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align:right; width:50%; font-family: 'Cairo', sans-serif;">${parts[1] ? parts[1].trim() : ''}</td></tr>`; }).join('');
         contentHTML += `${b.title ? `<div style="display:inline-block; background: rgba(0,0,0,0.05); color: ${bColor}; font-weight: bold; padding: 4px 12px; border-radius: 4px; margin-bottom: 8px;">${b.title}</div>` : ''}<table style="width: 100%; border-collapse: collapse; border: 2px solid ${bColor};">${rows}</table>`;
      }
      else if (b.type === 'mcq') {
        const opts = b.content.split('-');
        contentHTML += `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${bColor}; border-radius: 8px; padding: 12px;"><div style="font-weight: bold; font-size: calc(${settings.fontSize} + 2px); margin-bottom: 10px;">${b.title}</div><div style="display: flex; flex-wrap: wrap; gap: 16px;">${opts.map((opt, i) => `<div style="background: #fff; border: 1px solid #cbd5e1; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: ${settings.fontSize}; color: ${bColor}; display: flex; align-items: center; gap: 6px;"><span style="background: ${bColor}; color: #fff; width: 22px; height: 22px; display: flex; justify-content: center; align-items: center; border-radius: 50%; font-size: 12px;">${String.fromCharCode(97 + i)}</span><span>${opt.trim()}</span></div>`).join('')}</div>${b.solution ? `<div style="margin-top:8px; font-size:12px; color:#16a34a; font-weight:bold;">Answer: ${b.solution}</div>` : ''}</div>`;
      }
      else if (b.type === 'writing') {
        contentHTML += `<div style="background: #fff; border: 2px solid ${bColor}; border-radius: 8px; padding: 16px; box-shadow: 4px 4px 0px rgba(0,0,0,0.1);"><div style="font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: calc(${settings.fontSize} + 2px); color: ${bColor}; border-bottom: 2px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; text-align: center; text-transform: uppercase;">${b.title}</div><div style="font-size: ${settings.fontSize}; line-height: 1.8; white-space: pre-wrap;">${b.content}</div>${b.solution ? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; color: #475569; font-size: calc(${settings.fontSize} - 2px);">${b.solution}</div>` : ''}</div>`;
      }
      else if (b.type === 'example') {
        contentHTML += `<div style="background: rgba(240, 253, 244, 0.7); border: 1px solid #86efac; border-left: 4px solid #16a34a; border-radius: 8px; padding: 12px 16px;"><div style="font-weight: 900; color: #166534; font-size: calc(${settings.fontSize} + 1px); margin-bottom: 4px;">${b.title}</div><div style="font-size: ${settings.fontSize}; font-weight: bold; margin-bottom: 4px;">${b.content}</div>${b.solution ? `<div style="font-size: ${settings.fontSize}; color: #15803d; font-weight: 600; padding-top: 4px; border-top: 1px dashed #bbf7d0;">Solution: ${b.solution}</div>` : ''}</div>`;
      }
      else if (b.type === 'bilingual') {
        contentHTML += `<div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px;"><div style="font-size: ${settings.fontSize}; font-weight: bold; color: #0f172a; margin-bottom: 6px;">${b.title}</div><div style="font-family: 'Cairo', sans-serif; font-size: calc(${settings.fontSize} - 1px); color: #475569; direction: rtl; text-align: right; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; border-right: 3px solid ${bColor};">${b.content}</div></div>`;
      }
      else if (b.type === 'note') {
        contentHTML += `<div style="background: rgba(254, 243, 199, 0.6); border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 8px; padding: 12px 16px;"><div style="font-weight: 900; color: #b45309; font-size: ${settings.fontSize}; margin-bottom: 4px;">📌 ${b.title}</div><div style="font-size: ${settings.fontSize}; font-weight: 600;">${b.content}</div></div>`;
      }
      else if (b.type === 'qa') {
        contentHTML += `<div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px;"><div style="font-weight: 900; color: ${bColor}; font-size: calc(${settings.fontSize} + 1px); margin-bottom: 6px;">Q: ${b.title}</div><div style="font-size: ${settings.fontSize}; padding-left: 12px; border-left: 3px solid ${bColor};">Ans: ${b.content}</div></div>`;
      }

      if (b.imageBase64) {
        contentHTML += `<div style="text-align: center; margin-top: 12px;"><img src="${b.imageBase64}" style="max-width: 100%; max-height: 300px; border-radius: 8px;" /></div>`;
      }
      
      contentHTML += `</div>`;
    });

    let bodyStyle = `font-family: '${settings.font}', sans-serif; color: #0f172a; margin: 0;`;
    let pageCSS = ``;
    if (settings.glassBackground !== 'none') {
      pageCSS = `body { background: ${settings.glassBackground}; padding: 10mm; box-sizing: border-box; } .canvas { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 10mm; box-shadow: 0 10px 30px rgba(0,0,0,0.1); min-height: 277mm; }`;
    }

    return `
      <!DOCTYPE html>
      <html dir="ltr">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Inter:wght@400;600;700&family=Montserrat:wght@700;900&family=Open+Sans:wght@400;600;700&family=Poppins:wght@400;600&family=Roboto:wght@400;700&display=swap');
            @page { size: A4 portrait; margin: ${settings.glassBackground === 'none' ? '12mm' : '0'}; }
            body { ${bodyStyle} }
            ${pageCSS}
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; color: ${settings.mainColor}; opacity: 0.08; font-weight: 900; pointer-events: none; z-index: -1; white-space: nowrap; }
          </style>
        </head>
        <body>
          ${settings.watermark ? `<div class="watermark">${settings.watermark}</div>` : ''}
          <div class="canvas">
             ${contentHTML}
          </div>
          ${getWatermarkHTML()}
        </body>
      </html>
    `;
  };

  const handleExport = async () => {
    Keyboard.dismiss(); 
    
    // فحص الاشتراك ورصيد المحاولات المجانية قبل التصدير
    const canExport = await handleExportAttempt();
    if (!canExport) return;

    setIsExporting(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: generateHTML(), width: 595, height: 842 });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch { Alert.alert('خطأ', 'فشل التصدير'); } 
    finally { setIsExporting(false); }
  };

  // --- UI Renderers ---
  const renderBlockControls = (block: Block, index: number) => {
    if (activeBlockId !== block.id) return null;
    return (
      <View style={styles.blockControls}>
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={() => moveBlock(index, 'up')} style={styles.controlBtn} disabled={index === 0}><Ionicons name="arrow-up" size={16} color={index === 0 ? '#cbd5e1' : '#475569'} /></TouchableOpacity>
          <TouchableOpacity onPress={() => moveBlock(index, 'down')} style={styles.controlBtn} disabled={index === blocks.length - 1}><Ionicons name="arrow-down" size={16} color={index === blocks.length - 1 ? '#cbd5e1' : '#475569'} /></TouchableOpacity>
          <View style={styles.vDivider} />
          
          <TouchableOpacity onPress={() => pickImageForBlock(block.id)} style={[styles.controlBtn, block.imageBase64 && {backgroundColor: '#dcfce7'}]}><Ionicons name="image-outline" size={16} color={block.imageBase64 ? '#15803d' : '#475569'} /></TouchableOpacity>
          <View style={styles.vDivider} />

          {block.type === 'header' && (
             <View style={styles.specificControls}>
               <TouchableOpacity onPress={() => updateBlockOption(block.id, 'template', 'ministry')} style={[styles.optionBtn, block.options?.template === 'ministry' && styles.optionBtnActive]}><Text style={styles.optionBtnText}>وزاري</Text></TouchableOpacity>
               <TouchableOpacity onPress={() => updateBlockOption(block.id, 'template', 'modern')} style={[styles.optionBtn, block.options?.template === 'modern' && styles.optionBtnActive]}><Text style={styles.optionBtnText}>عصري</Text></TouchableOpacity>
             </View>
          )}

          {(block.type === 'title' || block.type === 'grammar') && (
             <View style={styles.specificControls}>
              {block.type === 'title' && (
                <>
                  <TouchableOpacity onPress={() => updateBlockOption(block.id, 'align', 'left')} style={[styles.optionBtn, block.options?.align === 'left' && styles.optionBtnActive]}><Ionicons name="reorder-four-outline" size={14} color="#1e293b" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => updateBlockOption(block.id, 'align', 'center')} style={[styles.optionBtn, block.options?.align === 'center' && styles.optionBtnActive]}><Ionicons name="menu-outline" size={14} color="#1e293b" /></TouchableOpacity>
                </>
              )}
              {block.type === 'grammar' && (
                <>
                  <TouchableOpacity onPress={() => updateBlockOption(block.id, 'boxStyle', 'double')} style={[styles.optionBtn, block.options?.boxStyle === 'double' && styles.optionBtnActive]}><Text style={styles.optionBtnText}>مزدوج</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => updateBlockOption(block.id, 'boxStyle', 'solid')} style={[styles.optionBtn, block.options?.boxStyle === 'solid' && styles.optionBtnActive]}><Text style={styles.optionBtnText}>عادي</Text></TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={() => updateBlockOption(block.id, 'color', '#b91c1c')} style={[styles.colorDot, {backgroundColor: '#b91c1c'}, block.options?.color === '#b91c1c' && styles.colorDotActive]} />
              <TouchableOpacity onPress={() => updateBlockOption(block.id, 'color', settings.mainColor)} style={[styles.colorDot, {backgroundColor: settings.mainColor}, (block.options?.color === settings.mainColor || !block.options?.color) && styles.colorDotActive]} />
              <TouchableOpacity onPress={() => updateBlockOption(block.id, 'color', '#1e293b')} style={[styles.colorDot, {backgroundColor: '#1e293b'}, block.options?.color === '#1e293b' && styles.colorDotActive]} />
             </View>
          )}

          <View style={{flex: 1}} />
          <TouchableOpacity onPress={() => deleteBlock(block.id)} style={[styles.controlBtn, {backgroundColor: '#fee2e2'}]}><Ionicons name="trash" size={16} color="#b91c1c" /></TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBlock = (block: Block, index: number) => {
    const isActive = activeBlockId === block.id;
    const bColor = block.options?.color || settings.mainColor;

    if (block.type === 'page_break') {
      return (
        <View key={block.id} style={styles.blockContainer}>
           {renderBlockControls(block, index)}
           <TouchableOpacity activeOpacity={1} onPress={() => handleBlockPress(block.id)} style={[styles.pageBreakBlock, isActive && styles.canvasBlockActive]}>
              <Ionicons name="cut-outline" size={16} color="#94a3b8" />
              <View style={styles.dashedLine} />
              <Text style={styles.pageBreakText}>-- فاصل صفحات (Page Break) --</Text>
              <View style={styles.dashedLine} />
           </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={block.id} style={styles.blockContainer}>
        {renderBlockControls(block, index)}
        <TouchableOpacity activeOpacity={1} onPress={() => handleBlockPress(block.id)} style={[styles.canvasBlock, isActive && styles.canvasBlockActive]}>
          
          {block.type === 'header' && (
             <View style={[styles.renderedHeader, block.options?.template === 'modern' ? {backgroundColor: bColor} : {borderWidth: 2, borderColor: bColor}]}>
              {isActive ? (
                <View style={{width: '100%'}}>
                  <TextInput style={[styles.inlineInputBold, block.options?.template === 'modern' && {color:'#fff'}]} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="اسم المادة..." placeholderTextColor={block.options?.template === 'modern' ? '#cbd5e1' : '#94a3b8'} />
                  <TextInput style={[styles.inlineInputArea, block.options?.template === 'modern' && {color:'#f8fafc'}]} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="سطر 1: الوحدة\nسطر 2: الأستاذ..." placeholderTextColor={block.options?.template === 'modern' ? '#cbd5e1' : '#94a3b8'} />
                </View>
              ) : (
                <Text style={[styles.previewTextBold, block.options?.template === 'modern' ? {color: '#fff'} : {color: bColor}]}>{block.title}{'\n'}{block.content}</Text>
              )}
             </View>
          )}

          {block.type === 'title' && (
            <TextInput style={[styles.renderedTitle, { textAlign: block.options?.align || 'left', color: bColor }]} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="اكتب العنوان..." placeholderTextColor="#94a3b8" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
          )}

          {block.type === 'standard' && (
            <TextInput style={styles.renderedStandard} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="اكتب النص العادي..." placeholderTextColor="#94a3b8" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
          )}

          {block.type === 'grammar' && (
             <View style={styles.renderedGrammarWrapper}>
                <TextInput style={[styles.grammarTitleInput, {color: bColor}]} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="اسم القاعدة..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <View style={[styles.renderedGrammarBox, block.options?.boxStyle === 'solid' ? {borderWidth: 2, borderColor: bColor} : {borderWidth: 4, borderStyle: 'double', borderColor: bColor}]}>
                  <TextInput style={styles.grammarContentInput} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="If + Subject + Verb..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                </View>
             </View>
          )}

          {block.type === 'vocabulary' && (
             <View style={styles.renderedVocabWrapper}>
                <TextInput style={[styles.vocabTitleInput, {color: bColor}]} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="عنوان الجدول..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <View style={[styles.renderedVocabTable, {borderColor: bColor}]}>
                   <TextInput style={styles.vocabContentInput} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="Play - يلعب..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                </View>
             </View>
          )}

          {block.type === 'mcq' && (
             <View style={[styles.mcqWrapper, {borderLeftColor: bColor}]}>
                <TextInput style={styles.mcqTitle} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="نص السؤال؟" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <TextInput style={[styles.mcqContent, {color: bColor}]} value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="الخيارات (is - are - am)" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                {isActive && <TextInput style={styles.mcqSolution} value={block.solution} onChangeText={t => updateBlock(block.id, 'solution', t)} placeholder="الجواب الصحيح..." />}
             </View>
          )}

          {block.type === 'writing' && (
             <View style={[styles.writingWrapper, {borderColor: bColor}]}>
                <TextInput style={[styles.writingTitle, {color: bColor}]} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="عنوان الإنشاء" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <TextInput style={styles.writingContent} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="النص..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                {isActive && <TextInput style={styles.writingSolution} multiline value={block.solution} onChangeText={t => updateBlock(block.id, 'solution', t)} placeholder="الترجمة..." />}
             </View>
          )}

          {block.type === 'example' && (
             <View style={styles.exampleWrapper}>
                <TextInput style={styles.exampleTitle} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="Example" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <TextInput style={styles.exampleContent} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="Example text..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                {isActive && <TextInput style={styles.exampleSolution} value={block.solution} onChangeText={t => updateBlock(block.id, 'solution', t)} placeholder="Solution..." />}
             </View>
          )}

          {block.type === 'bilingual' && (
             <View style={styles.bilingualWrapper}>
                <TextInput style={styles.biEn} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="English text" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <TextInput style={[styles.biAr, {borderRightColor: bColor}]} value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="الشرح العربي" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} textAlign="right" />
             </View>
          )}

          {block.type === 'note' && (
             <View style={styles.noteWrapper}>
                <TextInput style={styles.noteTitle} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="ملاحظة مهمة" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <TextInput style={styles.noteContent} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="التفاصيل..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
             </View>
          )}

          {block.type === 'qa' && (
             <View style={styles.qaWrapper}>
                <TextInput style={[styles.qaQ, {color: bColor}]} value={block.title} onChangeText={t => updateBlock(block.id, 'title', t)} placeholder="Question?" editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
                <TextInput style={[styles.qaA, {borderLeftColor: bColor}]} multiline value={block.content} onChangeText={t => updateBlock(block.id, 'content', t)} placeholder="Answer..." editable={isActive} pointerEvents={isActive ? 'auto' : 'none'} />
             </View>
          )}

          {block.imageBase64 && (
            <View style={{alignItems: 'center', marginTop: 10}}>
              <Text style={{fontSize: 10, color: '#15803d', marginBottom: 4}}>صورة مرفقة</Text>
              <View style={{height: 100, width: '100%', backgroundColor: '#f0fdf4', borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0', justifyContent: 'center', alignItems: 'center'}}>
                 <Ionicons name="image" size={32} color="#86efac" />
              </View>
            </View>
          )}

        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* --- Top Navigation --- */}
        <View style={styles.topNav}>
           <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.8}><Ionicons name="arrow-forward" size={20} color="#0f172a" /></TouchableOpacity>
           <View style={{alignItems: 'center'}}>
              <Text style={styles.topNavTitle}>هندسة الملخصات</Text>
              <Text style={styles.topNavSub}>WYSIWYG Builder</Text>
           </View>
           <View style={{flexDirection: 'row-reverse', gap: 8}}>
              <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}><Ionicons name="settings-outline" size={20} color="#0f172a" /></TouchableOpacity>
              <TouchableOpacity onPress={handleExport} style={styles.exportBtn} disabled={isExporting}>
                {isExporting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="share-outline" size={20} color="#fff" />}
              </TouchableOpacity>
           </View>
        </View>

        {/* --- Top Toolbar --- */}
        <View style={styles.topToolbar}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll} bounces={true}>
              <TouchableOpacity style={[styles.toolBtn, {backgroundColor: '#fef2f2', borderColor: '#fecaca'}]} onPress={() => setShowPresets(true)}>
                <Ionicons name="sparkles" size={16} color="#b91c1c" />
                <Text style={[styles.toolBtnText, {color: '#b91c1c'}]}>قوالب جاهزة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('title')}><Ionicons name="text" size={16} color="#15803d" /><Text style={styles.toolBtnText}>عنوان</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('standard')}><Ionicons name="document-text-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>نص</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('grammar')}><Ionicons name="cube-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>قاعدة</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('vocabulary')}><Ionicons name="grid-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>مفردات</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('mcq')}><Ionicons name="list-circle-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>اختيارات</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('writing')}><Ionicons name="create-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>إنشاء</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('example')}><Ionicons name="bulb-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>مثال</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('bilingual')}><Ionicons name="language" size={16} color="#15803d" /><Text style={styles.toolBtnText}>شرح ثنائي</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('note')}><Ionicons name="alert-circle-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>ملاحظة</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('qa')}><Ionicons name="help-circle-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>Q&A</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => addBlock('page_break')}><Ionicons name="cut-outline" size={16} color="#15803d" /><Text style={styles.toolBtnText}>فاصل صفحات</Text></TouchableOpacity>
           </ScrollView>
        </View>

        {/* --- Canvas --- */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.canvasScroll} keyboardShouldPersistTaps="handled">
           <TouchableOpacity activeOpacity={1} style={styles.canvasPaper} onPress={() => setActiveBlockId(null)}>
              {blocks.map((block, index) => renderBlock(block, index))}
           </TouchableOpacity>
        </ScrollView>

        {/* --- Presets Modal --- */}
        <Modal visible={showPresets} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>✨ قوالب المناهج الجاهزة</Text>
                 <TouchableOpacity onPress={() => setShowPresets(false)}><Ionicons name="close" size={24} color="#0f172a" /></TouchableOpacity>
               </View>
               <ScrollView>
                 {presets.map((p, i) => (
                   <TouchableOpacity key={i} style={styles.presetItem} onPress={() => addBlock(p.type as BlockType, p)}>
                     <Text style={styles.presetText}>{p.label}</Text>
                     <Ionicons name="add-circle" size={20} color="#15803d" />
                   </TouchableOpacity>
                 ))}
               </ScrollView>
            </View>
          </View>
        </Modal>

        {/* --- Global Settings Modal --- */}
        <Modal visible={showSettings} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>⚙️ إعدادات الوثيقة الشاملة</Text>
                 <TouchableOpacity onPress={() => setShowSettings(false)}><Ionicons name="close" size={24} color="#0f172a" /></TouchableOpacity>
               </View>
               <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.settingLabel}>اللون الأساسي (Main Theme):</Text>
                  <View style={{flexDirection: 'row-reverse', gap: 12, marginBottom: 16}}>
                    {['#15803d', '#1d4ed8', '#b91c1c', '#0f172a', '#9333ea'].map(c => (
                      <TouchableOpacity key={c} onPress={() => setSettings({...settings, mainColor: c})} style={[styles.colorDot, {backgroundColor: c}, settings.mainColor === c && styles.colorDotActive]} />
                    ))}
                  </View>

                  <Text style={styles.settingLabel}>نص العلامة المائية (Watermark):</Text>
                  <TextInput style={styles.settingInput} placeholder="اكتب العلامة المائية هنا..." value={settings.watermark} onChangeText={t => setSettings({...settings, watermark: t})} textAlign="right" />

                  <Text style={styles.settingLabel}>الخط الإنجليزي (Font Family):</Text>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'flex-end'}}>
                     {englishFonts.map(f => (
                       <TouchableOpacity key={f.value} onPress={() => setSettings({...settings, font: f.value})} style={[styles.fontBtn, settings.font === f.value && styles.fontBtnActive]}><Text style={[styles.fontBtnText, settings.font === f.value && {color:'#fff'}]}>{f.label}</Text></TouchableOpacity>
                     ))}
                  </View>

                  <Text style={styles.settingLabel}>تأثير الخلفية الزجاجية (Glassmorphism):</Text>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'flex-end'}}>
                     <TouchableOpacity onPress={() => setSettings({...settings, glassBackground: 'none'})} style={[styles.fontBtn, settings.glassBackground === 'none' && styles.fontBtnActive]}><Text style={[styles.fontBtnText, settings.glassBackground === 'none' && {color:'#fff'}]}>بدون</Text></TouchableOpacity>
                     <TouchableOpacity onPress={() => setSettings({...settings, glassBackground: 'rgba(21,128,61,0.1)'})} style={[styles.fontBtn, settings.glassBackground !== 'none' && styles.fontBtnActive]}><Text style={[styles.fontBtnText, settings.glassBackground !== 'none' && {color:'#fff'}]}>تفعيل</Text></TouchableOpacity>
                  </View>
               </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e2e8f0' },
  topNav: { backgroundColor: '#ffffff', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 10, paddingHorizontal: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', zIndex: 11 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  topNavTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', fontFamily: 'Tajawal' },
  topNavSub: { fontSize: 11, color: '#15803d', fontFamily: 'Tajawal', marginTop: 2, fontWeight: 'bold' },
  exportBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#15803d', justifyContent: 'center', alignItems: 'center' },

  topToolbar: { backgroundColor: '#ffffff', paddingBottom: 10, paddingTop: 6, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', zIndex: 10 },
  toolbarScroll: { flexDirection: 'row-reverse', gap: 8 },
  toolBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f0fdf4', borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' },
  toolBtnText: { fontSize: 12, fontWeight: 'bold', color: '#15803d', fontFamily: 'Tajawal' },

  canvasScroll: { padding: 12, paddingBottom: 100 },
  canvasPaper: { backgroundColor: '#ffffff', width: '100%', minHeight: height * 0.8, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },

  blockContainer: { marginBottom: 12 },
  canvasBlock: { padding: 4, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  canvasBlockActive: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },

  blockControls: { backgroundColor: '#ffffff', borderRadius: 8, padding: 6, marginBottom: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  controlsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  controlBtn: { padding: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
  vDivider: { width: 1, height: 20, backgroundColor: '#cbd5e1', marginHorizontal: 4 },
  specificControls: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  optionBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#f1f5f9' },
  optionBtnActive: { backgroundColor: '#dcfce7' },
  optionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', fontFamily: 'Tajawal' },
  colorDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#166534', transform: [{ scale: 1.1 }] },

  // Block UI
  pageBreakBlock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  dashedLine: { flex: 1, height: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed' },
  pageBreakText: { fontSize: 11, color: '#94a3b8', fontFamily: 'Tajawal', fontWeight: 'bold' },

  renderedHeader: { padding: 12, borderRadius: 8, marginBottom: 8 },
  inlineInputBold: { fontSize: 16, fontWeight: '900', color: '#0f172a', textAlign: 'center', fontFamily: 'Tajawal', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 4, marginBottom: 4 },
  inlineInputArea: { fontSize: 13, color: '#334155', textAlign: 'center', fontFamily: 'Tajawal' },
  previewTextBold: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Tajawal' },
  renderedTitle: { fontSize: 20, fontWeight: '900', borderBottomWidth: 2, borderBottomColor: '#cbd5e1', paddingBottom: 4 },
  renderedStandard: { fontSize: 16, lineHeight: 24, color: '#334155', minHeight: 40 },
  
  renderedGrammarWrapper: { marginBottom: 8 },
  grammarTitleInput: { fontSize: 14, fontWeight: '900', marginBottom: 4, textAlign: 'left' },
  renderedGrammarBox: { borderRadius: 6, padding: 10, backgroundColor: '#f8fafc' },
  grammarContentInput: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', textAlign: 'left' },

  renderedVocabWrapper: { marginBottom: 8 },
  vocabTitleInput: { backgroundColor: 'rgba(0,0,0,0.05)', fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8, fontSize: 13, fontFamily: 'Tajawal' },
  renderedVocabTable: { borderWidth: 2, padding: 8, borderRadius: 6 },
  vocabContentInput: { fontSize: 15, fontWeight: 'bold', textAlign: 'left', lineHeight: 24 },

  mcqWrapper: { background: '#f8fafc', border: 1, borderColor: '#e2e8f0', borderLeftWidth: 4, borderRadius: 8, padding: 10 },
  mcqTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  mcqContent: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  mcqSolution: { fontSize: 12, color: '#16a34a', fontWeight: 'bold' },

  writingWrapper: { backgroundColor: '#fff', borderWidth: 2, borderRadius: 8, padding: 14 },
  writingTitle: { fontWeight: '900', fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 6, marginBottom: 8, textAlign: 'center' },
  writingContent: { fontSize: 15, lineHeight: 24 },
  writingSolution: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', fontFamily: 'Tajawal', textAlign: 'right', fontSize: 13, color: '#475569' },

  exampleWrapper: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderLeftWidth: 4, borderLeftColor: '#16a34a', borderRadius: 8, padding: 12 },
  exampleTitle: { fontWeight: '900', color: '#166534', fontSize: 15, marginBottom: 4 },
  exampleContent: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  exampleSolution: { fontSize: 14, color: '#15803d', fontWeight: 'bold', borderTopWidth: 1, borderTopColor: '#bbf7d0', paddingTop: 4 },

  bilingualWrapper: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10 },
  biEn: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  biAr: { fontFamily: 'Tajawal', fontSize: 14, color: '#475569', textAlign: 'right', backgroundColor: '#f1f5f9', padding: 6, borderRadius: 4, borderRightWidth: 3 },

  noteWrapper: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a', borderLeftWidth: 4, borderLeftColor: '#d97706', borderRadius: 8, padding: 10 },
  noteTitle: { fontWeight: '900', color: '#b45309', fontSize: 14, marginBottom: 4, fontFamily: 'Tajawal' },
  noteContent: { fontSize: 15, fontWeight: 'bold' },

  qaWrapper: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10 },
  qaQ: { fontWeight: '900', fontSize: 15, marginBottom: 4 },
  qaA: { fontSize: 15, paddingLeft: 10, borderLeftWidth: 3 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: height * 0.8 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', fontFamily: 'Tajawal' },
  
  presetItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  presetText: { fontSize: 14, fontWeight: 'bold', color: '#334155', fontFamily: 'Tajawal' },

  settingLabel: { fontSize: 14, fontWeight: 'bold', color: '#475569', fontFamily: 'Tajawal', textAlign: 'right', marginBottom: 8 },
  settingInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 16, fontFamily: 'Tajawal' },
  fontBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  fontBtnActive: { backgroundColor: '#15803d' },
  fontBtnText: { fontSize: 13, fontWeight: 'bold', color: '#334155', fontFamily: 'Tajawal' }
});