import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { setExamStore } from '../utils/examStore';
import { useSubscription } from './context/SubscriptionContext';

const arabicFonts = [
  { label: 'كايرو (Cairo - موصى به للطباعة)', value: 'Cairo' },
  { label: 'تجوال (Tajawal)', value: 'Tajawal' },
  { label: 'العربي التقليدي (Traditional Arabic)', value: 'Traditional Arabic' },
  { label: 'الأميري (Amiri)', value: 'Amiri' },
  { label: 'شنجا (Changa)', value: 'Changa' }
];

const sheetTypes = [
  { label: '📊 سجل رصد الدرجات الشامل', value: 'grades' },
  { label: '📝 سجل متابعة الواجبات والمشاركة', value: 'homework' },
  { label: '📋 سجل الحضور والغياب الأسبوعي', value: 'attendance' },
  { label: '⚙️ سجل مخصص بالكامل', value: 'custom' }
];

const themeColors = [
  { label: 'زيتوني غامق (افتراضي)', value: '#3f6212' },
  { label: 'أخضر غابات', value: '#365314' },
  { label: 'أخضر زمردي', value: '#15803d' },
  { label: 'أسود فحمي', value: '#1a2e05' },
  { label: 'رمادي احترافي', value: '#334155' }
];

const DropdownSelector = ({ label, value, options, onSelect, isOpen, onToggle }: any) => {
  const selectedOpt = options.find((o: any) => o.value === value) || options[0];
  return (
    <View style={styles.dropdownWrapper}>
      <Text style={styles.subLabel}>{label}</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.dropdownHeader}>
        <View style={styles.dropdownHeaderInner}>
          {selectedOpt && selectedOpt.value && selectedOpt.value.startsWith('#') && (
            <View style={[styles.colorDot, { backgroundColor: selectedOpt.value }]} />
          )}
          <Text style={styles.dropdownHeaderText}>{selectedOpt ? selectedOpt.label : 'اختر...'}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#3f6212" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onToggle}>
        <TouchableWithoutFeedback onPress={onToggle}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <TouchableOpacity onPress={onToggle}>
                    <Ionicons name="close-circle" size={24} color="#b91c1c" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={true}>
                  {options.map((opt: any) => {
                    const isSelected = opt.value === value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          onSelect(opt.value);
                          onToggle();
                        }}
                      >
                        <View style={styles.dropdownHeaderInner}>
                          {opt.value && opt.value.startsWith('#') && (
                            <View style={[styles.colorDot, { backgroundColor: opt.value }]} />
                          )}
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                            {opt.label}
                          </Text>
                        </View>
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color="#3f6212" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default function GradeSheetsMaker() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [meta, setMeta] = useState({
    school: 'مدرسة النهرين الابتدائية',
    docTitle: 'سجل رصد الدرجات الشامل والمتابعة اليومية',
    subject: 'اللغة العربية',
    grade: 'الصف السادس الابتدائي',
    teacher: 'أ. مصطفى خالد',
    term: 'الفصل الدراسي الثاني - 2026م',
    sheetType: 'grades',
    primaryColor: '#3f6212',
    font: 'Cairo',
    leftFooter: 'ختم المدرسة وإدارة الدعم الفني',
    rightFooter: 'توقيع المعلم المسؤول: ...................'
  });

  const [customColumns, setCustomColumns] = useState([
    'الواجبات (10)',
    'المشاركة (10)',
    'الاختبار (20)',
    'المجموع (40)',
    'ملاحظات المعلم'
  ]);

  const [tableRows, setTableRows] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: 'row_' + (i + 1) + '_' + Date.now(),
      name: '',
      values: Array(5).fill('')
    }))
  );

  useEffect(() => {
    if (meta.sheetType === 'grades') {
      const newCols = ['الواجبات (10)', 'المشاركة (10)', 'الاختبار (20)', 'المجموع (40)', 'ملاحظات المعلم'];
      setCustomColumns(newCols);
      setTableRows(rows => rows.map(r => ({ ...r, values: Array(newCols.length).fill('') })));
      setMeta(m => ({ ...m, docTitle: 'سجل رصد الدرجات الشامل والمتابعة' }));
    } else if (meta.sheetType === 'homework') {
      const newCols = ['الواجب 1', 'الواجب 2', 'الواجب 3', 'الواجب 4', 'التقييم العام'];
      setCustomColumns(newCols);
      setTableRows(rows => rows.map(r => ({ ...r, values: Array(newCols.length).fill('') })));
      setMeta(m => ({ ...m, docTitle: 'سجل متابعة الواجبات المدرسية' }));
    } else if (meta.sheetType === 'attendance') {
      const newCols = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع', 'إجمالي الغياب'];
      setCustomColumns(newCols);
      setTableRows(rows => rows.map(r => ({ ...r, values: Array(newCols.length).fill('') })));
      setMeta(m => ({ ...m, docTitle: 'سجل رصد الحضور والغياب الأسبوعي' }));
    }
  }, [meta.sheetType]);

  const addColumn = () => {
    if (customColumns.length >= 7) {
      Alert.alert('تنبيه', 'الحد الأقصى الموصى به للأعمدة لضمان وضوح مقاس A4 هو 7 أعمدة.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomColumns([...customColumns, `عمود ${customColumns.length + 1}`]);
    setTableRows(rows => rows.map(r => ({ ...r, values: [...r.values, ''] })));
  };

  const removeColumn = (index: number) => {
    if (customColumns.length <= 1) {
      Alert.alert('تنبيه', 'يجب أن يحتوي الجدول على عمود واحد على الأقل.');
      return;
    }
    Haptics.selectionAsync();
    const updatedCols = customColumns.filter((_, i) => i !== index);
    setCustomColumns(updatedCols);
    setTableRows(rows => rows.map(r => ({
      ...r,
      values: r.values.filter((_, i) => i !== index)
    })));
  };

  const updateColumnTitle = (index: number, text: string) => {
    const updated = [...customColumns];
    updated[index] = text;
    setCustomColumns(updated);
  };

  const addRow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTableRows([
      ...tableRows,
      {
        id: 'row_' + Date.now(),
        name: '',
        values: Array(customColumns.length).fill('')
      }
    ]);
  };

  const removeRow = (index: number) => {
    if (tableRows.length <= 1) {
      Alert.alert('تنبيه', 'يجب أن يحتوي السجل على صف طالب واحد على الأقل.');
      return;
    }
    Haptics.selectionAsync();
    setTableRows(tableRows.filter((_, i) => i !== index));
  };

  const updateRowName = (rowIndex: number, name: string) => {
    const updated = [...tableRows];
    updated[rowIndex].name = name;
    setTableRows(updated);
  };

  const updateRowCell = (rowIndex: number, colIndex: number, value: string) => {
    const updated = [...tableRows];
    updated[rowIndex].values[colIndex] = value;
    setTableRows(updated);
  };

  const toggleDropdown = (key: string) => setActiveDropdown(activeDropdown === key ? null : key);

  const generateHTML = () => {
    const allCols = ['م', 'اسم الطالب ثلاثياً', ...customColumns];

    return `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;700&family=Changa&display=swap');
            @page { size: A4 portrait; margin: 6mm; }
            body { font-family: '${meta.font}', sans-serif; color: #1a2e05; margin: 0; background: #fff; -webkit-print-color-adjust: exact; }
            
            .page {
              position: relative;
              border: 2px solid ${meta.primaryColor};
              padding: 8mm 10mm;
              background: #fff;
              border-radius: 6px;
              min-height: 278mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            .header-box {
              border-bottom: 3px double ${meta.primaryColor};
              padding-bottom: 6px;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .school-title { font-size: 13px; font-weight: 900; color: ${meta.primaryColor}; }
            .main-doc-title { font-size: 18px; font-weight: 900; color: #1a2e05; text-align: center; }

            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 6px;
              background: #fdfbfb;
              border: 1px solid #b7d38d;
              padding: 6px 10px;
              border-radius: 6px;
              margin-bottom: 8px;
              font-size: 12px;
              font-weight: 700;
              color: #3f6212;
            }

            table { width: 100%; border-collapse: collapse; margin-top: 2px; table-layout: fixed; }
            th, td { border: 1px solid #3f6212; padding: 5px 4px; text-align: center; font-size: 12px; font-weight: 600; word-wrap: break-word; }
            th { background: ${meta.primaryColor}; color: white; font-weight: 900; }
            th:first-child, td:first-child { width: 32px; }
            th:nth-child(2), td:nth-child(2) { width: 165px; text-align: right; padding-right: 6px; font-weight: 700; }
            
            .row-data { height: 24px; }

            .footer-grid {
              border-top: 1.5px dashed #b7d38d;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11.5px;
              font-weight: bold;
              color: ${meta.primaryColor};
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div>
              <div class="header-box">
                <div class="school-title">${meta.school}</div>
                <div class="main-doc-title">${meta.docTitle}</div>
                <div class="school-title">${meta.term}</div>
              </div>

              <div class="meta-grid">
                <div>المادة: ${meta.subject}</div>
                <div>الصف: ${meta.grade}</div>
                <div>معلم المادة: ${meta.teacher}</div>
              </div>

              <table>
                <thead>
                  <tr>
                    ${allCols.map(col => `<th>${col}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${tableRows.map((r, index) => `
                    <tr>
                      <td style="font-weight: bold; background: #fdfbfb;">${index + 1}</td>
                      <td class="row-data">${r.name || ''}</td>
                      ${customColumns.map((_, colIdx) => `<td class="row-data">${r.values[colIdx] || ''}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="footer-grid">
              <div>${meta.leftFooter}</div>
              <div>${meta.rightFooter}</div>
            </div>
          </div>
          ${getWatermarkHTML()}
        </body>
      </html>
    `;
  };

  const handlePreview = () => { 
    setExamStore(generateHTML(), false, meta.primaryColor); 
    router.push('/modal'); 
  };

  const handlePrint = async () => { 
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    try { 
      await Print.printAsync({ html: generateHTML() }); 
    } catch { 
      Alert.alert('خطأ', 'فشلت الطباعة'); 
    } 
  };

  const handleExport = async () => { 
    const canExport = await handleExportAttempt();
    if (!canExport) return;

    setIsGenerating(true); 
    try { 
      const { uri } = await Print.printToFileAsync({ html: generateHTML() }); 
      await shareAsync(uri); 
    } catch { 
      Alert.alert('خطأ', 'فشل التصدير'); 
    } finally { 
      setIsGenerating(false); 
    } 
  };

  return (
    <View style={styles.mainWrapper}>
      <LinearGradient colors={['#ffffff', '#b7d38d', '#3f6b09']} style={StyleSheet.absoluteFillObject} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="options-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>إعدادات السجل الأساسية</Text>
          </View>

          <DropdownSelector label="نموذج السجل الجاهز:" value={meta.sheetType} options={sheetTypes} isOpen={activeDropdown === 'type'} onToggle={() => toggleDropdown('type')} onSelect={(v: any) => setMeta({ ...meta, sheetType: v })} />
          <DropdownSelector label="لون الثيم والترويسة:" value={meta.primaryColor} options={themeColors} isOpen={activeDropdown === 'color'} onToggle={() => toggleDropdown('color')} onSelect={(v: any) => setMeta({ ...meta, primaryColor: v })} />
          <DropdownSelector label="نوع الخط العربي المعتمد:" value={meta.font} options={arabicFonts} isOpen={activeDropdown === 'font'} onToggle={() => toggleDropdown('font')} onSelect={(v: any) => setMeta({ ...meta, font: v })} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="document-text-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>التحكم في رأس الصفحة (Header)</Text>
          </View>

          <Text style={styles.subLabel}>عنوان السجل الرئيسي:</Text>
          <TextInput style={styles.input} placeholder="عنوان السجل..." placeholderTextColor="#65a30d" value={meta.docTitle} onChangeText={t => setMeta({ ...meta, docTitle: t })} textAlign="right" />

          <Text style={styles.subLabel}>اسم المدرسة / المؤسسة:</Text>
          <TextInput style={styles.input} placeholder="اسم المدرسة..." placeholderTextColor="#65a30d" value={meta.school} onChangeText={t => setMeta({ ...meta, school: t })} textAlign="right" />

          <View style={styles.rowInputs}>
            <View style={{flex: 1}}>
              <Text style={styles.subLabel}>المادة الدراسية:</Text>
              <TextInput style={styles.input} placeholder="المادة..." placeholderTextColor="#65a30d" value={meta.subject} onChangeText={t => setMeta({ ...meta, subject: t })} textAlign="right" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.subLabel}>الصف الدراسي:</Text>
              <TextInput style={styles.input} placeholder="الصف..." placeholderTextColor="#65a30d" value={meta.grade} onChangeText={t => setMeta({ ...meta, grade: t })} textAlign="right" />
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={{flex: 1}}>
              <Text style={styles.subLabel}>معلم المادة:</Text>
              <TextInput style={styles.input} placeholder="المعلم..." placeholderTextColor="#65a30d" value={meta.teacher} onChangeText={t => setMeta({ ...meta, teacher: t })} textAlign="right" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.subLabel}>الفصل / العام الدراسي:</Text>
              <TextInput style={styles.input} placeholder="الفصل..." placeholderTextColor="#65a30d" value={meta.term} onChangeText={t => setMeta({ ...meta, term: t })} textAlign="right" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="grid-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>التحكم في أعمدة الجدول (إضافة وحذف)</Text>
          </View>
          <Text style={[styles.subLabel, { color: '#3f6212', marginBottom: 12 }]}>
            تعديل مسميات الأعمدة أو إضافتها وحذفها:
          </Text>

          {customColumns.map((colName, index) => (
            <View key={index} style={styles.columnEditRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={colName}
                onChangeText={t => updateColumnTitle(index, t)}
                placeholder={`عنوان العمود ${index + 1}`}
                placeholderTextColor="#65a30d"
                textAlign="right"
              />
              {customColumns.length > 1 && (
                <TouchableOpacity activeOpacity={0.8} style={styles.deleteColBtn} onPress={() => removeColumn(index)}>
                  <Ionicons name="trash-outline" size={18} color="#b91c1c" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity activeOpacity={0.85} style={styles.addColBtn} onPress={addColumn}>
            <Ionicons name="add-circle-outline" size={18} color="#3f6212" />
            <Text style={styles.addColBtnText}>إضافة عمود جديد للجدول</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="create-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>إدارة صفوف الطلاب ({tableRows.length} طالب مفعل)</Text>
          </View>
          <Text style={[styles.subLabel, { color: '#334155', marginBottom: 12, lineHeight: 18 }]}>
            أدخل أسماء الطلاب والدرجات أدناه، ويمكنك إضافة صف جديد أو حذف أي طالب بضغطة زر:
          </Text>

          {tableRows.map((row, index) => (
            <View key={row.id} style={styles.studentRowCard}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={styles.rowNumberBadge}>
                  <Text style={styles.rowNumberText}>{index + 1}</Text>
                </View>
                {tableRows.length > 1 && (
                  <TouchableOpacity onPress={() => removeRow(index)}>
                    <Ionicons name="trash-bin-outline" size={18} color="#b91c1c" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ gap: 8 }}>
                <TextInput
                  style={styles.inputStudentName}
                  placeholder={`اسم الطالب ${index + 1} ثلاثياً...`}
                  placeholderTextColor="#65a30d"
                  value={row.name}
                  onChangeText={t => updateRowName(index, t)}
                  textAlign="right"
                />
                <View style={styles.rowScoresGrid}>
                  {customColumns.map((colName, colIdx) => (
                    <TextInput
                      key={colIdx}
                      style={styles.inputScore}
                      placeholder={colName}
                      placeholderTextColor="#65a30d"
                      value={row.values[colIdx]}
                      onChangeText={t => updateRowCell(index, colIdx, t)}
                      textAlign="right"
                    />
                  ))}
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity activeOpacity={0.85} style={styles.addRowBtn} onPress={addRow}>
            <Ionicons name="person-add-outline" size={18} color="#3f6212" />
            <Text style={styles.addRowBtnText}>إضافة صف طالب جديد</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="bookmark-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>التحكم في ذيل الصفحة (Footer والتوقيعات)</Text>
          </View>

          <Text style={styles.subLabel}>نص اليمين في تذييل الصفحة:</Text>
          <TextInput style={styles.input} value={meta.leftFooter} onChangeText={t => setMeta({ ...meta, leftFooter: t })} textAlign="right" />

          <Text style={styles.subLabel}>نص اليسار في تذييل الصفحة:</Text>
          <TextInput style={styles.input} value={meta.rightFooter} onChangeText={t => setMeta({ ...meta, rightFooter: t })} textAlign="right" />
        </View>

        <View style={{height: 70}} />

      </ScrollView>

      <View style={styles.floatingBarContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.previewBtn} onPress={handlePreview}>
          <Ionicons name="eye-outline" size={22} color="#3f6212" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.printBtn} onPress={handlePrint}>
          <Ionicons name="print-outline" size={22} color="#3f6212" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.exportTouchWrapper} onPress={handleExport} disabled={isGenerating}>
          <LinearGradient colors={['#3f6212', '#365314', '#1a2e05']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.exportBtn}>
            {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <View style={styles.exportIconBadge}>
                  <Ionicons name="cloud-download-outline" size={18} color="#ffffff" />
                </View>
                <Text style={styles.exportBtnText}>تصدير وتحميل السجل A4 PDF</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#fdfbfb' },
  container: { padding: 18, paddingTop: 50, paddingBottom: 110, gap: 16 },
  card: { borderRadius: 28, backgroundColor: '#ffffff', padding: 20, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(77, 124, 15, 0.15)', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: '#1a2e05', fontSize: 16, fontWeight: '900', textAlign: 'right', fontFamily: 'Tajawal' },
  subLabel: { color: '#3f6212', fontSize: 12, textAlign: 'right', marginBottom: 6, fontWeight: '700', fontFamily: 'Tajawal' },
  input: { backgroundColor: '#fdfbfb', borderRadius: 14, paddingHorizontal: 16, height: 48, color: '#1a2e05', fontSize: 13, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', marginBottom: 12, textAlign: 'right', fontFamily: 'Tajawal', fontWeight: '600' },
  rowInputs: { flexDirection: 'row-reverse', gap: 10, marginBottom: 4 },
  
  columnEditRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 8 },
  deleteColBtn: { width: 44, height: 48, borderRadius: 14, backgroundColor: 'rgba(185, 28, 28, 0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(185, 28, 28, 0.2)' },
  addColBtn: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: 'rgba(77, 124, 15, 0.08)', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.25)', borderRadius: 14, height: 46, marginTop: 4 },
  addColBtnText: { color: '#3f6212', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },

  studentRowCard: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.15)' },
  rowNumberBadge: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(77, 124, 15, 0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.25)' },
  rowNumberText: { color: '#3f6212', fontSize: 12, fontWeight: '900', fontFamily: 'Tajawal' },
  inputStudentName: { backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, height: 42, color: '#1a2e05', fontSize: 13, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', textAlign: 'right', fontWeight: 'bold', fontFamily: 'Tajawal' },
  rowScoresGrid: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  inputScore: { flex: 1, minWidth: 70, backgroundColor: '#ffffff', borderRadius: 10, paddingHorizontal: 10, height: 38, color: '#1a2e05', fontSize: 12, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', textAlign: 'right', fontFamily: 'Tajawal', fontWeight: '600' },
  
  addRowBtn: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: 'rgba(77, 124, 15, 0.08)', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.25)', borderRadius: 14, height: 48, marginTop: 8 },
  addRowBtnText: { color: '#3f6212', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },

  dropdownWrapper: { marginBottom: 12 },
  dropdownHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdfbfb', borderRadius: 14, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)' },
  dropdownHeaderInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flex: 1 },
  dropdownHeaderText: { color: '#1a2e05', fontSize: 13, textAlign: 'right', fontWeight: '600', fontFamily: 'Tajawal' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 46, 5, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 360, backgroundColor: '#ffffff', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 30 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(101, 163, 13, 0.15)' },
  modalTitle: { color: '#1a2e05', fontSize: 15, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  dropdownItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  dropdownItemSelected: { backgroundColor: 'rgba(101, 163, 13, 0.12)' },
  dropdownItemText: { color: '#334155', fontSize: 13, textAlign: 'right', fontWeight: '500', fontFamily: 'Tajawal' },
  dropdownItemTextSelected: { color: '#3f6212', fontWeight: 'bold' },

  floatingBarContainer: { position: 'absolute', bottom: 12, left: 16, right: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 10, borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  previewBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(77, 124, 15, 0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.2)' },
  printBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(77, 124, 15, 0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.2)' },
  exportTouchWrapper: { flex: 1, height: 48, borderRadius: 16, overflow: 'hidden' },
  exportBtn: { flex: 1, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 10 },
  exportIconBadge: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  exportBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' }
});