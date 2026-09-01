import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { setExamStore } from '../utils/examStore';
import { useSubscription } from './context/SubscriptionContext';

const arabicFonts = [
  { label: 'كايرو (Cairo - موصى به)', value: 'Cairo' },
  { label: 'تجوال (Tajawal)', value: 'Tajawal' },
  { label: 'العربي التقليدي (Traditional Arabic)', value: 'Traditional Arabic' },
  { label: 'الأميري (Amiri)', value: 'Amiri' },
  { label: 'شنجا (Changa)', value: 'Changa' }
];

const borderThemeOptions = [
  { label: 'بنفسجي ملكي (Purple)', value: '#7c3aed' },
  { label: 'أزرق رسمي (Blue)', value: '#2563eb' },
  { label: 'أخضر أكاديمي (Emerald)', value: '#059669' },
  { label: 'ذهبي فاخر (Gold)', value: '#d97706' }
];

const cardsPerPageOptions = [
  { label: '3 بطاقات في الصفحة (3 أعمدة × صف واحد)', value: '3' },
  { label: '6 بطاقات في الصفحة (3 أعمدة × صفين)', value: '6' },
  { label: '9 بطاقات في الصفحة (3 أعمدة × 3 صفوف)', value: '9' },
  { label: '12 بطاقة في الصفحة (3 أعمدة × 4 صفوف)', value: '12' },
  { label: '15 بطاقة في الصفحة (3 أعمدة × 5 صفوف)', value: '15' },
  { label: '18 بطاقة في الصفحة (3 أعمدة × 6 صفوف)', value: '18' },
  { label: '21 بطاقة في الصفحة (3 أعمدة × 7 صفوف)', value: '21' },
  { label: '24 بطاقة في الصفحة (3 أعمدة × 8 صفوف كحد أقصى)', value: '24' }
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
        <Ionicons name="chevron-down" size={16} color="#c084fc" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onToggle}>
        <TouchableWithoutFeedback onPress={onToggle}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <TouchableOpacity onPress={onToggle}>
                    <Ionicons name="close-circle" size={24} color="#f43f5e" />
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
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color="#c084fc" />}
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

export default function SeatingCardsMaker() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [meta, setMeta] = useState({
    school: 'مدرسة المستقبل الثانوية النموذجية',
    examTitle: 'امتحانات نهاية الفصل الدراسي الثاني 2026',
    grade: 'الصف الثالث الثانوي',
    committee: 'لجنة رقم (1)',
    primaryColor: '#7c3aed',
    font: 'Cairo',
    cardsPerPage: '12'
  });

  const [students, setStudents] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      name: `طالب رقم ${i + 1}`,
      seatNo: String(101 + i),
      room: 'قاعة 1'
    }))
  );

  const addStudent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextSeat = String(101 + students.length);
    setStudents([...students, { id: Date.now().toString(), name: '', seatNo: nextSeat, room: 'قاعة 1' }]);
  };

  const removeStudent = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setStudents(students.filter(s => s.id !== id));
  };

  const updateStudent = (id: string, field: string, value: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleDropdown = (key: string) => setActiveDropdown(activeDropdown === key ? null : key);

  const generateHTML = () => {
    const perPage = parseInt(meta.cardsPerPage) || 12;
    const cols = 3;
    const rows = Math.ceil(perPage / 3);

    const schoolFontSize = perPage >= 21 ? '7px' : perPage >= 15 ? '8px' : perPage >= 9 ? '9.5px' : '11px';
    const examFontSize = perPage >= 21 ? '6px' : perPage >= 15 ? '7px' : perPage >= 9 ? '8px' : '9.5px';
    const nameFontSize = perPage >= 21 ? '9px' : perPage >= 15 ? '10px' : perPage >= 9 ? '11.5px' : '14px';
    const seatNumSize = perPage >= 21 ? '12px' : perPage >= 15 ? '14px' : perPage >= 9 ? '16px' : '20px';
    const cardPadding = perPage >= 21 ? '1mm 1.5mm' : perPage >= 15 ? '1.5mm 2mm' : perPage >= 9 ? '2mm 2.5mm' : '4mm 3mm';
    const gapSize = perPage >= 21 ? '1mm' : perPage >= 15 ? '1.5mm' : '2mm';

    const chunks = [];
    for (let i = 0; i < students.length; i += perPage) {
      chunks.push(students.slice(i, i + perPage));
    }

    return `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;700&family=Changa&display=swap');
            @page { size: A4 portrait; margin: 4mm; }
            body { font-family: '${meta.font}', sans-serif; color: #0f172a; margin: 0; background: #fff; -webkit-print-color-adjust: exact; }
            
            .page {
              width: 202mm;
              height: 289mm;
              box-sizing: border-box;
              display: grid;
              grid-template-columns: repeat(${cols}, 1fr);
              grid-template-rows: repeat(${rows}, 1fr);
              align-content: stretch;
              gap: ${gapSize};
              page-break-after: always;
              position: relative;
            }

            .card {
              border: 1px dashed ${meta.primaryColor};
              border-radius: 4px;
              padding: ${cardPadding};
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #fff;
              box-sizing: border-box;
              height: 100%;
              overflow: hidden;
              position: relative;
            }

            .card-header {
              border-bottom: 0.8px solid ${meta.primaryColor}33;
              padding-bottom: 1px;
              text-align: center;
              line-height: 1.1;
            }

            .school-name { font-size: ${schoolFontSize}; font-weight: 900; color: ${meta.primaryColor}; margin: 0; }
            .exam-title { font-size: ${examFontSize}; font-weight: 700; color: #475569; margin: 0; }

            .card-body {
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 1.5px;
              flex: 1;
            }

            .grade-text {
              font-size: ${perPage >= 21 ? '6.5px' : perPage >= 15 ? '7.5px' : '8.5px'};
              font-weight: 700;
              color: #475569;
              margin: 0;
              line-height: 1.05;
            }

            .seat-box {
              background: ${meta.primaryColor}0d;
              border: 0.8px solid ${meta.primaryColor};
              border-radius: 3px;
              padding: 1px;
              line-height: 1.05;
            }

            .seat-label { font-size: ${perPage >= 21 ? '6px' : '7px'}; font-weight: 700; color: #64748b; margin: 0; }
            .seat-number { font-size: ${seatNumSize}; font-weight: 900; color: ${meta.primaryColor}; margin: 0; }

            .student-name {
              font-size: ${nameFontSize};
              font-weight: 900;
              color: #0f172a;
              border-bottom: 0.8px solid #cbd5e1;
              padding-bottom: 1px;
              margin: 0 1px;
              line-height: 1.15;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .card-footer {
              border-top: 0.8px dashed #cbd5e1;
              padding-top: 1px;
              display: flex;
              justify-content: space-between;
              font-size: ${perPage >= 21 ? '6px' : perPage >= 15 ? '7px' : '8px'};
              font-weight: bold;
              color: #334155;
              line-height: 1.05;
            }
          </style>
        </head>
        <body>
          ${chunks.map(pageGroup => `
            <div class="page">
              ${pageGroup.map(s => `
                <div class="card">
                  <div class="card-header">
                    <div class="school-name">${meta.school}</div>
                    <div class="exam-title">${meta.examTitle}</div>
                  </div>

                  <div class="card-body">
                    <div class="grade-text">${meta.grade}</div>
                    <div class="student-name">${s.name || 'اسم الطالب هنا'}</div>
                    <div class="seat-box">
                      <div class="seat-label">رقم الجلوس</div>
                      <div class="seat-number">${s.seatNo || '---'}</div>
                    </div>
                  </div>

                  <div class="card-footer">
                    <div>اللجنة: ${s.room || meta.committee}</div>
                    <div>⭐ معتمدة ⭐</div>
                  </div>
                </div>
              `).join('')}
              ${Array.from({ length: Math.max(0, perPage - pageGroup.length) }).map(() => '<div style="visibility: hidden;"></div>').join('')}
              ${getWatermarkHTML()}
            </div>
          `).join('')}
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      
      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconBox}><Ionicons name="id-card-outline" size={18} color="#c084fc" /></View>
          <Text style={styles.cardTitle}>إعدادات وترويسة البطاقات (3 أعمدة - حتى 24 في A4)</Text>
        </View>

        <DropdownSelector label="عدد البطاقات في الصفحة (3 أعمدة):" value={meta.cardsPerPage} options={cardsPerPageOptions} isOpen={activeDropdown === 'cpp'} onToggle={() => toggleDropdown('cpp')} onSelect={(v: any) => setMeta({ ...meta, cardsPerPage: v })} />
        <DropdownSelector label="لون الإطار والثيم:" value={meta.primaryColor} options={borderThemeOptions} isOpen={activeDropdown === 'theme'} onToggle={() => toggleDropdown('theme')} onSelect={(v: any) => setMeta({ ...meta, primaryColor: v })} />
        <DropdownSelector label="نوع الخط المعتمد:" value={meta.font} options={arabicFonts} isOpen={activeDropdown === 'font'} onToggle={() => toggleDropdown('font')} onSelect={(v: any) => setMeta({ ...meta, font: v })} />

        <TextInput style={styles.input} placeholder="اسم المدرسة أو المؤسسة..." placeholderTextColor="#64748b" value={meta.school} onChangeText={t => setMeta({ ...meta, school: t })} />
        <TextInput style={styles.input} placeholder="عنوان الاختبار (مثل: امتحانات نهاية الفصل الثاني)..." placeholderTextColor="#64748b" value={meta.examTitle} onChangeText={t => setMeta({ ...meta, examTitle: t })} />
        
        <View style={styles.rowInputs}>
          <TextInput style={[styles.input, {flex:1}]} placeholder="الصف الدراسي..." placeholderTextColor="#64748b" value={meta.grade} onChangeText={t => setMeta({ ...meta, grade: t })} />
          <TextInput style={[styles.input, {flex:1}]} placeholder="اسم اللجنة الافتراضية..." placeholderTextColor="#64748b" value={meta.committee} onChangeText={t => setMeta({ ...meta, committee: t })} />
        </View>
      </BlurView>

      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.questionsHeaderRow}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="people-outline" size={18} color="#c084fc" /></View>
            <Text style={styles.cardTitle}>قائمة الطلاب وأرقام الجلوس ({students.length})</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={addStudent} style={styles.clearAddBtnTouch}>
          <LinearGradient colors={['#7c3aed', '#6d28d9', '#5b21b6']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.clearAddBtn}>
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={styles.clearAddBtnText}>+ إضافة طالب جديد للقائمة</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.subLabel, { color: '#c084fc', marginBottom: 12, marginTop: 4 }]}>
          توزيع 3 أعمدة وبحد أقصى 8 صفوف لكل صفحة A4:
        </Text>

        {students.map((student, index) => (
          <View key={student.id} style={styles.studentItemCard}>
            <View style={styles.rowNumberBadge}>
              <Text style={styles.rowNumberText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <TextInput
                style={styles.inputStudentName}
                placeholder={`اسم الطالب ${index + 1} ثلاثياً...`}
                placeholderTextColor="#64748b"
                value={student.name}
                onChangeText={t => updateStudent(student.id, 'name', t)}
              />
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 38 }]} placeholder="رقم الجلوس..." placeholderTextColor="#64748b" value={student.seatNo} onChangeText={t => updateStudent(student.id, 'seatNo', t)} />
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 38 }]} placeholder="القاعة / اللجنة..." placeholderTextColor="#64748b" value={student.room} onChangeText={t => updateStudent(student.id, 'room', t)} />
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={() => removeStudent(student.id)} style={styles.clearDeleteBtn}>
              <Ionicons name="trash" size={18} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        ))}
      </BlurView>

      <View style={{height: 70}} />

      <BlurView intensity={60} tint="dark" style={styles.floatingBarContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.previewBtn} onPress={handlePreview}>
          <Ionicons name="eye-outline" size={22} color="#c084fc" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.printBtn} onPress={handlePrint}>
          <Ionicons name="print-outline" size={22} color="#c084fc" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.exportTouchWrapper} onPress={handleExport} disabled={isGenerating}>
          <LinearGradient colors={['#7c3aed', '#6d28d9', '#5b21b6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.exportBtn}>
            {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <View style={styles.exportIconBadge}>
                  <Ionicons name="cloud-download-outline" size={18} color="#ffffff" />
                </View>
                <Text style={styles.exportBtnText}>تصدير وتحميل البطاقات A4 PDF</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingTop: 30, paddingBottom: 110, gap: 16 },
  card: { borderRadius: 26, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(15, 23, 42, 0.55)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 16 },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(192, 132, 252, 0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(192, 132, 252, 0.25)' },
  cardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  subLabel: { color: '#94a3b8', fontSize: 12, textAlign: 'right', marginBottom: 6, fontWeight: '700' },
  input: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, paddingHorizontal: 16, height: 48, color: '#fff', fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', marginBottom: 12, textAlign: 'right' },
  rowInputs: { flexDirection: 'row-reverse', gap: 10, marginBottom: 4 },
  
  questionsHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  
  clearAddBtnTouch: { width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 14, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  clearAddBtn: { height: 48, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 8 },
  clearAddBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  studentItemCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  rowNumberBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(192, 132, 252, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(192, 132, 252, 0.3)' },
  rowNumberText: { color: '#c084fc', fontSize: 12, fontWeight: '900' },
  inputStudentName: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, paddingHorizontal: 12, height: 38, color: '#fff', fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', textAlign: 'right', fontWeight: 'bold' },

  clearDeleteBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(244, 63, 94, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.35)' },

  dropdownWrapper: { marginBottom: 12 },
  dropdownHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  dropdownHeaderInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flex: 1 },
  dropdownHeaderText: { color: '#f8fafc', fontSize: 13, textAlign: 'right', fontWeight: '600' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 360, backgroundColor: '#0f172a', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(192, 132, 252, 0.3)', padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  dropdownItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  dropdownItemSelected: { backgroundColor: 'rgba(192, 132, 252, 0.15)' },
  dropdownItemText: { color: '#cbd5e1', fontSize: 13, textAlign: 'right', fontWeight: '500' },
  dropdownItemTextSelected: { color: '#c084fc', fontWeight: 'bold' },

  floatingBarContainer: { position: 'absolute', bottom: 12, left: 16, right: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 10, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(15, 23, 42, 0.85)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15 },
  previewBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(192, 132, 252, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(192, 132, 252, 0.3)' },
  printBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(192, 132, 252, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(192, 132, 252, 0.3)' },
  exportTouchWrapper: { flex: 1, height: 48, borderRadius: 16, overflow: 'hidden' },
  exportBtn: { flex: 1, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 10 },
  exportIconBadge: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  exportBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' }
});