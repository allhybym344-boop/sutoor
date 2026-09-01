import { Ionicons } from '@expo/vector-icons';
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
  { label: 'زيتوني غامق (افتراضي)', value: '#3f6212' },
  { label: 'أخضر غابات', value: '#365314' },
  { label: 'أزرق رسمي (Blue)', value: '#2563eb' },
  { label: 'أخضر أكاديمي (Emerald)', value: '#059669' },
  { label: 'ذهبي فاخر (Gold)', value: '#d97706' }
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

export default function ExamSchedulesMaker() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [meta, setMeta] = useState({
    school: 'مدرسة النهرين الابتدائية',
    examTitle: 'جدول امتحانات نهاية الفصل الدراسي الثاني 2026',
    term: 'الدور الأول',
    primaryColor: '#3f6212',
    font: 'Cairo'
  });

  const [grades, setGrades] = useState([
    { id: 'g1', name: 'الصف الرابع الابتدائي' },
    { id: 'g2', name: 'الصف الخامس الابتدائي' },
    { id: 'g3', name: 'الصف السادس الابتدائي' }
  ]);
  const [newGradeName, setNewGradeName] = useState('');

  const [examDays, setExamDays] = useState([
    { id: 'd1', day: 'السبت', date: '2026/05/15', subjects: { g1: 'الرياضيات', g2: 'العلوم', g3: 'اللغة الإنجليزية' } },
    { id: 'd2', day: 'الإثنين', date: '2026/05/17', subjects: { g1: 'اللغة العربية', g2: 'الرياضيات', g3: 'العلوم' } },
    { id: 'd3', day: 'الأربعاء', date: '2026/05/19', subjects: { g1: 'التربية الإسلامية', g2: 'اللغة العربية', g3: 'الرياضيات' } }
  ]);

  const [newDay, setNewDay] = useState('');
  const [newDate, setNewDate] = useState('');

  const addGrade = () => {
    if (!newGradeName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = 'g_' + Date.now();
    setGrades([...grades, { id: newId, name: newGradeName }]);
    setExamDays(examDays.map(d => ({ ...d, subjects: { ...d.subjects, [newId]: '' } })));
    setNewGradeName('');
  };

  const removeGrade = (id: string) => {
    if (grades.length <= 1) {
      Alert.alert('تنبيه', 'يجب أن يبقى صف دراسي واحد على الأقل.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setGrades(grades.filter(g => g.id !== id));
  };

  const addExamDay = () => {
    if (!newDay.trim() || !newDate.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const initialSubjects: Record<string, string> = {};
    grades.forEach(g => { initialSubjects[g.id] = ''; });
    setExamDays([...examDays, { id: 'd_' + Date.now(), day: newDay, date: newDate, subjects: initialSubjects }]);
    setNewDay('');
    setNewDate('');
  };

  const removeExamDay = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setExamDays(examDays.filter(d => d.id !== id));
  };

  const updateSubjectCell = (dayId: string, gradeId: string, value: string) => {
    setExamDays(examDays.map(d => {
      if (d.id === dayId) {
        return { ...d, subjects: { ...d.subjects, [gradeId]: value } };
      }
      return d;
    }));
  };

  const toggleDropdown = (key: string) => setActiveDropdown(activeDropdown === key ? null : key);

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;700&family=Changa&display=swap');
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: '${meta.font}', sans-serif; color: #1a2e05; margin: 0; background: #fff; -webkit-print-color-adjust: exact; }
            
            .header-container {
              text-align: center;
              border-bottom: 2px solid ${meta.primaryColor};
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .school-name { font-size: 18px; font-weight: 900; color: ${meta.primaryColor}; margin: 0; }
            .exam-title { font-size: 14px; font-weight: 700; color: #1a2e05; margin: 3px 0; }
            .meta-subtitle { font-size: 11px; font-weight: 600; color: #3f6212; margin: 0; }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
              table-layout: fixed;
            }

            th, td {
              border: 1px solid #3f6212;
              padding: 8px 6px;
              text-align: center;
              font-size: 11px;
              word-wrap: break-word;
            }

            th {
              background-color: ${meta.primaryColor};
              color: white;
              font-weight: 900;
              font-size: 12px;
            }

            tr:nth-child(even) {
              background-color: #fdfbfb;
            }

            .footer-notes {
              margin-top: 15px;
              border: 1px dashed ${meta.primaryColor};
              border-radius: 5px;
              padding: 8px 12px;
              background-color: #f0fdf4;
            }
            .footer-title { font-size: 11px; font-weight: 900; color: ${meta.primaryColor}; margin: 0 0 3px 0; }
            .footer-list { font-size: 9.5px; color: #334155; margin: 0; padding-right: 15px; line-height: 1.4; }

            .signatures {
              margin-top: 25px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              font-weight: bold;
              color: #1a2e05;
            }
            .sig-box { text-align: center; width: 28%; border-top: 1px solid #3f6212; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="school-name">${meta.school}</div>
            <div class="exam-title">${meta.examTitle}</div>
            <div class="meta-subtitle">النظام المدرسي العام - ${meta.term}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 16%;">اليوم والتاريخ</th>
                ${grades.map(g => `<th>${g.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${examDays.map(d => `
                <tr>
                  <td style="font-weight: bold; background-color: #fefce8; color: ${meta.primaryColor};">
                    ${d.day}<br><span style="font-size: 9.5px; color: #3f6212;">${d.date}</span>
                  </td>
                  ${grades.map(g => `
                    <td style="font-weight: 600; color: #1a2e05;">
                      ${d.subjects[g.id] || '---'}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-notes">
            <div class="footer-title">تعليمات وإرشادات هامة:</div>
            <ul class="footer-list">
              <li>يبدأ الامتحان في تمام الساعة الثامنة صباحاً، ويُمنع دخول الطالب بعد مضي 15 دقيقة.</li>
              <li>يُمنع منعاً باتاً اصطحاب الهواتف النقالة أو الأجهزة الذكية داخل قاعات اللجان الامتحانية.</li>
            </ul>
          </div>

          <div class="signatures">
            <div class="sig-box">رئيس لجنة الامتحانات</div>
            <div class="sig-box">مسؤول الكنترول</div>
            <div class="sig-box">مدير المدرسة</div>
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
            <View style={styles.iconBox}><Ionicons name="calendar-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>إعدادات جدول الامتحانات الشامل</Text>
          </View>

          <DropdownSelector label="لون الثيم الرسمي:" value={meta.primaryColor} options={borderThemeOptions} isOpen={activeDropdown === 'theme'} onToggle={() => toggleDropdown('theme')} onSelect={(v: any) => setMeta({ ...meta, primaryColor: v })} />
          <DropdownSelector label="نوع الخط المعتمد:" value={meta.font} options={arabicFonts} isOpen={activeDropdown === 'font'} onToggle={() => toggleDropdown('font')} onSelect={(v: any) => setMeta({ ...meta, font: v })} />

          <TextInput style={styles.input} placeholder="اسم المدرسة أو المؤسسة..." placeholderTextColor="#65a30d" value={meta.school} onChangeText={t => setMeta({ ...meta, school: t })} textAlign="right" />
          <TextInput style={styles.input} placeholder="عنوان الجدول..." placeholderTextColor="#65a30d" value={meta.examTitle} onChangeText={t => setMeta({ ...meta, examTitle: t })} textAlign="right" />
          <TextInput style={styles.input} placeholder="الفصل الدراسي / الدور..." placeholderTextColor="#65a30d" value={meta.term} onChangeText={t => setMeta({ ...meta, term: t })} textAlign="right" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="school-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>الصفوف الدراسية (أعمدة الجدول)</Text>
          </View>

          <View style={styles.rowInputs}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="اسم الصف (مثال: السادس الابتدائي)..." placeholderTextColor="#65a30d" value={newGradeName} onChangeText={setNewGradeName} textAlign="right" />
            <TouchableOpacity activeOpacity={0.8} onPress={addGrade} style={styles.smallAddBtn}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, fontFamily: 'Tajawal' }}>إضافة صف</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagsContainer}>
            {grades.map(g => (
              <View key={g.id} style={styles.tagBadge}>
                <Text style={styles.tagText}>{g.name}</Text>
                <TouchableOpacity onPress={() => removeGrade(g.id)}>
                  <Ionicons name="close-circle" size={16} color="#b91c1c" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="list-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>أيام الامتحانات ومواد الصفوف (صفوف الجدول)</Text>
          </View>

          <View style={styles.rowInputs}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="اليوم (مثل: السبت)..." placeholderTextColor="#65a30d" value={newDay} onChangeText={setNewDay} textAlign="right" />
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="التاريخ (2026/--/--)..." placeholderTextColor="#65a30d" value={newDate} onChangeText={setNewDate} textAlign="right" />
            <TouchableOpacity activeOpacity={0.8} onPress={addExamDay} style={styles.smallAddBtn}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, fontFamily: 'Tajawal' }}>إضافة يوم</Text>
            </TouchableOpacity>
          </View>

          {examDays.map((d, index) => (
            <View key={d.id} style={styles.dayCard}>
              <View style={styles.dayCardHeader}>
                <View style={{ flexDirection: 'row-reverse', gap: 8, alignItems: 'center' }}>
                  <View style={styles.rowNumberBadge}><Text style={styles.rowNumberText}>{index + 1}</Text></View>
                  <Text style={styles.dayCardTitle}>{d.day} ({d.date})</Text>
                </View>
                <TouchableOpacity onPress={() => removeExamDay(d.id)}>
                  <Ionicons name="trash-outline" size={18} color="#b91c1c" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 8, marginTop: 8 }}>
                {grades.map(g => (
                  <View key={g.id} style={styles.subjectRow}>
                    <Text style={styles.subjectRowLabel}>{g.name}:</Text>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0, height: 36, fontSize: 12 }]}
                      placeholder={`مادة ${g.name}...`}
                      placeholderTextColor="#65a30d"
                      value={d.subjects[g.id] || ''}
                      onChangeText={t => updateSubjectCell(d.id, g.id, t)}
                      textAlign="right"
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
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
                <Text style={styles.exportBtnText}>تصدير وتحميل الجدول A4 PDF</Text>
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
  
  smallAddBtn: { backgroundColor: '#3f6212', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, height: 48, borderRadius: 14, gap: 6, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  
  tagsContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tagBadge: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(77, 124, 15, 0.08)', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
  tagText: { color: '#3f6212', fontSize: 12, fontWeight: 'bold', fontFamily: 'Tajawal' },

  dayCard: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.15)' },
  dayCardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(101, 163, 13, 0.15)' },
  dayCardTitle: { color: '#1a2e05', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },
  rowNumberBadge: { width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(77, 124, 15, 0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.25)' },
  rowNumberText: { color: '#3f6212', fontSize: 11, fontWeight: '900', fontFamily: 'Tajawal' },

  subjectRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  subjectRowLabel: { color: '#334155', fontSize: 11, fontWeight: 'bold', width: 110, textAlign: 'right', fontFamily: 'Tajawal' },

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