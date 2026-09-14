import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSubscription } from '../context/SubscriptionContext';

interface LessonItem {
  id: string;
  title: string;
  breakdown: string;
  date: string;
  notes: string;
}

interface UnitSection {
  id: string;
  unitTitle: string;
  lessons: LessonItem[];
}

const STORAGE_KEY_UNITS = '@daily_lessons_units_v2';
const STORAGE_KEY_META = '@daily_lessons_meta_v2';
const STORAGE_KEY_HEADER_COLOR = '@header_color_v15';

const COLOR_PALETTE = [
  { label: 'زيتوني غامق (افتراضي)', value: '#3f6212' },
  { label: 'أخضر غابات', value: '#365314' },
  { label: 'أزرق رسمي (Blue)', value: '#2563eb' },
  { label: 'أخضر أكاديمي (Emerald)', value: '#059669' },
  { label: 'عنابي داكن', value: '#7f1d1d' },
  { label: 'ذهبي فاخر (Gold)', value: '#d97706' },
  { label: 'أسود فحمي', value: '#1a2e05' },
  { label: 'رمادي احترافي', value: '#334155' }
];

export default function DailyLessonsScreen() {
  const { handleExportAttempt, getWatermarkHTML, isPremium } = useSubscription();

  const [headerColor, setHeaderColor] = useState<string>('#3f6212');
  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  const [schoolName, setSchoolName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [className, setClassName] = useState('');
  const [termName, setTermName] = useState('الكورس الأول / الفصل الدراسي الأول');

  const [units, setUnits] = useState<UnitSection[]>([]);

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');

  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonBreakdown, setNewLessonBreakdown] = useState('');
  const [newLessonDate, setNewLessonDate] = useState('');
  const [newLessonNotes, setNewLessonNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedColor = await AsyncStorage.getItem(STORAGE_KEY_HEADER_COLOR);
      if (savedColor) setHeaderColor(savedColor);

      const savedMeta = await AsyncStorage.getItem(STORAGE_KEY_META);
      if (savedMeta) {
        const meta = JSON.parse(savedMeta);
        setSchoolName(meta.schoolName || '');
        setSubjectName(meta.subjectName || '');
        setClassName(meta.className || '');
        setTermName(meta.termName || 'الكورس الأول');
      }

      const savedUnits = await AsyncStorage.getItem(STORAGE_KEY_UNITS);
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits));
      }
    } catch (error) {
      console.error('خطأ في تحميل توزيع الدروس:', error);
    }
  };

  const saveUnitsToStorage = async (updatedUnits: UnitSection[]) => {
    setUnits(updatedUnits);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(updatedUnits));
    } catch (error) {
      console.error('خطأ في حفظ الوحدات:', error);
    }
  };

  const saveMetaToStorage = async (s: string, sub: string, cls: string, t: string) => {
    setSchoolName(s);
    setSubjectName(sub);
    setClassName(cls);
    setTermName(t);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_META, JSON.stringify({ schoolName: s, subjectName: sub, className: cls, termName: t }));
    } catch (error) {
      console.error('خطأ في حفظ البيانات التعريفية:', error);
    }
  };

  const changeHeaderColor = async (color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHeaderColor(color);
    setShowColorModal(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HEADER_COLOR, color);
    } catch (error) {
      console.error('خطأ في حفظ اللون:', error);
    }
  };

  const addUnit = () => {
    if (!newUnitTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newUnit: UnitSection = {
      id: 'unit_' + Date.now(),
      unitTitle: newUnitTitle.trim(),
      lessons: []
    };
    saveUnitsToStorage([...units, newUnit]);
    setNewUnitTitle('');
    setShowAddUnitModal(false);
  };

  const deleteUnit = (unitId: string) => {
    Alert.alert('حذف الوحدة', 'هل أنت متأكد من حذف هذه الوحدة بكافة دروسها؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          Haptics.selectionAsync();
          saveUnitsToStorage(units.filter(u => u.id !== unitId));
        }
      }
    ]);
  };

  const addLesson = () => {
    if (!newLessonTitle.trim() || !activeUnitId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newLesson: LessonItem = {
      id: 'les_' + Date.now(),
      title: newLessonTitle.trim(),
      breakdown: newLessonBreakdown.trim(),
      date: newLessonDate.trim() || 'الأحد / التاريخ',
      notes: newLessonNotes.trim()
    };

    const updated = units.map(u => {
      if (u.id === activeUnitId) {
        return { ...u, lessons: [...u.lessons, newLesson] };
      }
      return u;
    });

    saveUnitsToStorage(updated);
    setNewLessonTitle('');
    setNewLessonBreakdown('');
    setNewLessonDate('');
    setNewLessonNotes('');
    setShowAddLessonModal(false);
    setActiveUnitId(null);
  };

  const deleteLesson = (unitId: string, lessonId: string) => {
    Haptics.selectionAsync();
    const updated = units.map(u => {
      if (u.id === unitId) {
        return { ...u, lessons: u.lessons.filter(l => l.id !== lessonId) };
      }
      return u;
    });
    saveUnitsToStorage(updated);
  };

  const generateHTMLContent = () => {
    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Tahoma', 'Arial', sans-serif; padding: 15px; color: #1a2e05; background: #fff; }
          .header-box { text-align: center; border-bottom: 3px solid ${headerColor}; padding-bottom: 12px; margin-bottom: 20px; }
          h2 { color: ${headerColor}; margin: 0 0 6px 0; font-size: 22px; font-weight: bold; }
          .meta-info { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #3f6212; margin-bottom: 20px; background: #f0fdf4; padding: 10px 15px; border-radius: 8px; border: 1px solid #b7d38d; }
          .unit-title { background-color: ${headerColor}; color: #fff; padding: 8px 12px; font-size: 14px; font-weight: bold; border-radius: 6px; margin-top: 15px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: separate; border-spacing: 4px; margin-bottom: 15px; }
          th, td { border: 1.5px solid #cbd5e1; padding: 7px; text-align: center; font-size: 11px; border-radius: 6px; }
          th { background-color: #f1f5f9; color: ${headerColor}; font-weight: bold; }
          td.left-align { text-align: right; padding-right: 10px; }
          .notes-cell { color: #334155; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h2>توزيع الدروس اليومية وخطة المنهج</h2>
          ${!isPremium ? '<p style="color: #3f6212; font-size: 11px; margin: 3px 0 0 0;">منظومة سُطور التعليمية الرقمية</p>' : ''}
        </div>

        <div class="meta-info">
          <div>المدرسة: ${schoolName || 'غير محدد'}</div>
          <div>المادة: ${subjectName || 'غير محدد'}</div>
          <div>الصف: ${className || 'غير محدد'}</div>
          <div>الفصل: ${termName}</div>
        </div>

        ${units.map((unit, uIdx) => `
          <div class="unit-title">الوحدة (${uIdx + 1}): ${unit.unitTitle}</div>
          <table>
            <thead>
              <tr>
                <th style="width: 35px;">ت</th>
                <th style="text-align: right; width: 25%;">عنوان الدرس</th>
                <th style="text-align: right;">تقسيمات الدرس العناصر الفرعية</th>
                <th style="width: 20%;">اليوم / التاريخ</th>
                <th style="width: 20%;">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${unit.lessons.length === 0 ? `
                <tr><td colspan="5" style="color: #64748b; font-style: italic;">لا توجد دروس مضافة في هذه الوحدة</td></tr>
              ` : unit.lessons.map((les, lIdx) => `
                <tr>
                  <td>${lIdx + 1}</td>
                  <td class="left-align" style="font-weight: bold;">${les.title}</td>
                  <td class="left-align">${les.breakdown || '-'}</td>
                  <td>${les.date}</td>
                  <td class="notes-cell">${les.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}

        <div style="display: flex; justify-content: space-between; margin-top: 30px; font-size: 12px; font-weight: bold;">
          <div>توقيع مدرس المادة: ........................</div>
          <div>توقيع الإدارة المدرسية: ........................</div>
        </div>
        ${getWatermarkHTML()}
      </body>
      </html>
    `;
  };

  const handleOpenPreview = () => {
    if (units.length === 0) {
      Alert.alert('تنبيه', 'لا توجد وحدات أو دروس لمعاينتها.');
      return;
    }
    Haptics.selectionAsync();
    setPreviewHtml(generateHTMLContent());
    setShowPreviewModal(true);
  };

  const handlePrintLessons = async () => {
    if (units.length === 0) {
      Alert.alert('تنبيه', 'لا توجد وحدات أو دروس لطباعتها.');
      return;
    }

    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const htmlContent = generateHTMLContent();

    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      console.error('تفاصيل خطأ الطباعة:', error);
      Alert.alert('خطأ', 'تعذرت عملية الطباعة.');
    }
  };

  const currentSelectedColorLabel = COLOR_PALETTE.find(c => c.value === headerColor)?.label || 'اختر اللون';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#ffffff', '#b7d38d', '#3f6b09']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerToolbar}>
          <TouchableOpacity 
            onPress={() => { Haptics.selectionAsync(); setShowColorModal(true); }} 
            style={styles.colorSelectorBtn}
            activeOpacity={0.85}
          >
            <View style={[styles.colorPreviewDot, { backgroundColor: headerColor }]} />
            <Text style={styles.colorSelectorText} numberOfLines={1}>{currentSelectedColorLabel}</Text>
            <Ionicons name="chevron-down" size={14} color="#3f6212" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOpenPreview} style={styles.previewBtn} activeOpacity={0.85}>
            <Ionicons name="eye-outline" size={16} color="#3f6212" />
            <Text style={styles.previewBtnText}>معاينة</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePrintLessons} style={styles.printBtn} activeOpacity={0.85}>
            <Ionicons name="print-outline" size={16} color="#fff" />
            <Text style={styles.printBtnText}>طباعة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaInputRow}>
            <TextInput
              style={[styles.metaInput, { flex: 2 }]}
              placeholder="اسم المدرسة..."
              placeholderTextColor="#65a30d"
              value={schoolName}
              onChangeText={(t) => saveMetaToStorage(t, subjectName, className, termName)}
              textAlign="right"
            />
            <TextInput
              style={[styles.metaInput, { flex: 2 }]}
              placeholder="المادة الدراسية..."
              placeholderTextColor="#65a30d"
              value={subjectName}
              onChangeText={(t) => saveMetaToStorage(schoolName, t, className, termName)}
              textAlign="right"
            />
          </View>
          <View style={styles.metaInputRow}>
            <TextInput
              style={[styles.metaInput, { flex: 2 }]}
              placeholder="الصف الدراسي..."
              placeholderTextColor="#65a30d"
              value={className}
              onChangeText={(t) => saveMetaToStorage(schoolName, subjectName, t, termName)}
              textAlign="right"
            />
            <TextInput
              style={[styles.metaInput, { flex: 3 }]}
              placeholder="الفصل / الكورس الدراسي..."
              placeholderTextColor="#65a30d"
              value={termName}
              onChangeText={(t) => saveMetaToStorage(schoolName, subjectName, className, t)}
              textAlign="right"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowAddUnitModal(true)}
          style={[styles.addUnitTopBtn, { backgroundColor: headerColor }]}
          activeOpacity={0.85}
        >
          <Ionicons name="folder-open" size={18} color="#fff" />
          <Text style={styles.addUnitTopText}>+ إضافة وحدة أو فصل دراسي جديد</Text>
        </TouchableOpacity>

        {units.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="book-outline" size={48} color="#3f6212" />
            <Text style={styles.emptyText}>لم تتم إضافة وحدات أو دروس بعد. انقر فوق زر الإضافة أعلاه لبدء توزيع المنهج.</Text>
          </View>
        ) : (
          units.map((unit, uIdx) => (
            <View key={unit.id} style={styles.unitCard}>
              <View style={[styles.unitCardHeader, { backgroundColor: headerColor }]}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.unitIndexBadge}>الوحدة {uIdx + 1}</Text>
                  <Text style={styles.unitTitleText}>{unit.unitTitle}</Text>
                </View>
                
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setActiveUnitId(unit.id); setShowAddLessonModal(true); }}
                    style={styles.addLessonInsideBtn}
                  >
                    <Ionicons name="add" size={14} color="#3f6212" />
                    <Text style={styles.addLessonInsideText}>إضافة درس</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteUnit(unit.id)}>
                    <Ionicons name="trash-outline" size={16} color="#fee2e2" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.lessonsListContainer}>
                {unit.lessons.length === 0 ? (
                  <Text style={styles.emptyLessonsText}>لا توجد دروس مضافة في هذه الوحدة حتى الآن.</Text>
                ) : (
                  unit.lessons.map((lesson, lIdx) => (
                    <View key={lesson.id} style={styles.lessonRowItem}>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.lessonNumText}>({lIdx + 1})</Text>
                          <Text style={styles.lessonTitleText}>{lesson.title}</Text>
                        </View>
                        {lesson.breakdown ? (
                          <Text style={styles.lessonBreakdownText}>التقسيمات: {lesson.breakdown}</Text>
                        ) : null}
                        <Text style={styles.lessonDateText}>اليوم/التاريخ: {lesson.date}</Text>
                        {lesson.notes ? (
                          <Text style={styles.lessonNotesText}>ملاحظات: {lesson.notes}</Text>
                        ) : null}
                      </View>

                      <TouchableOpacity onPress={() => deleteLesson(unit.id, lesson.id)} style={styles.deleteLessonBtn}>
                        <Ionicons name="trash-outline" size={15} color="#b91c1c" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>
          ))
        )}

      </ScrollView>

      {/* نافذة المعاينة */}
      <Modal visible={showPreviewModal} animationType="slide" transparent={false} onRequestClose={() => setShowPreviewModal(false)}>
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>معاينة توزيع الدروس للطباعة</Text>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)} style={styles.closePreviewBtn}>
              <Ionicons name="close" size={22} color="#3f6212" />
            </TouchableOpacity>
          </View>

          <WebView 
            originWhitelist={['*']} 
            source={{ html: previewHtml }} 
            style={{ flex: 1, backgroundColor: '#fff' }} 
          />

          <View style={styles.previewFooter}>
            <TouchableOpacity 
              onPress={() => { setShowPreviewModal(false); handlePrintLessons(); }} 
              style={[styles.previewPrintBtn, { backgroundColor: headerColor }]}
            >
              <Ionicons name="print-outline" size={18} color="#fff" />
              <Text style={styles.previewPrintText}>طباعة المستند الآن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* نافذة إضافة وحدة دراسية */}
      <Modal visible={showAddUnitModal} transparent={true} animationType="fade" onRequestClose={() => setShowAddUnitModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>إضافة وحدة أو فصل جديد</Text>
              <TouchableOpacity onPress={() => setShowAddUnitModal(false)}>
                <Ionicons name="close" size={20} color="#3f6212" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="عنوان الوحدة (مثال: الوحدة الأولى: الدوال الحقيقية)..."
              placeholderTextColor="#65a30d"
              value={newUnitTitle}
              onChangeText={setNewUnitTitle}
              textAlign="right"
            />
            <TouchableOpacity onPress={addUnit} style={[styles.modalSubmitBtn, { backgroundColor: headerColor }]} activeOpacity={0.85}>
              <Text style={styles.modalSubmitText}>إضافة الوحدة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* نافذة إضافة درس جديد */}
      <Modal visible={showAddLessonModal} transparent={true} animationType="fade" onRequestClose={() => setShowAddLessonModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>إضافة درس جديد للوحدة</Text>
              <TouchableOpacity onPress={() => setShowAddLessonModal(false)}>
                <Ionicons name="close" size={20} color="#3f6212" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="عنوان الدرس الرئيسي..."
              placeholderTextColor="#65a30d"
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              textAlign="right"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="تقسيمات الدرس العناصر الفرعية..."
              placeholderTextColor="#65a30d"
              value={newLessonBreakdown}
              onChangeText={setNewLessonBreakdown}
              textAlign="right"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="اليوم أو التاريخ (مثال: الأحد 10/12)..."
              placeholderTextColor="#65a30d"
              value={newLessonDate}
              onChangeText={setNewLessonDate}
              textAlign="right"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="ملاحظات (اختياري)..."
              placeholderTextColor="#65a30d"
              value={newLessonNotes}
              onChangeText={setNewLessonNotes}
              textAlign="right"
            />
            <TouchableOpacity onPress={addLesson} style={[styles.modalSubmitBtn, { backgroundColor: headerColor }]} activeOpacity={0.85}>
              <Text style={styles.modalSubmitText}>إضافة الدرس</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* نافذة اختيار الألوان */}
      <Modal visible={showColorModal} transparent={true} animationType="fade" onRequestClose={() => setShowColorModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>اختر لون الترويسة والعناوين</Text>
              <TouchableOpacity onPress={() => setShowColorModal(false)}>
                <Ionicons name="close" size={20} color="#3f6212" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalColorsList}>
              {COLOR_PALETTE.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => changeHeaderColor(item.value)}
                  style={[styles.modalColorItem, headerColor === item.value && styles.activeModalColorItem]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.colorPreviewDot, { backgroundColor: item.value }]} />
                  <Text style={[styles.modalColorText, headerColor === item.value && styles.activeModalColorText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbfb' },
  scrollContent: { padding: 16, paddingTop: 50, paddingBottom: 40 },

  headerToolbar: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 14 },
  colorSelectorBtn: { flex: 1.2, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', height: 44, borderRadius: 14, paddingHorizontal: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  colorSelectorText: { flex: 1, color: '#3f6212', fontSize: 11.5, fontWeight: 'bold', textAlign: 'right', marginHorizontal: 4, fontFamily: 'Tajawal' },
  colorPreviewDot: { width: 12, height: 12, borderRadius: 6 },

  previewBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#3f6212', paddingHorizontal: 12, height: 44, borderRadius: 14, gap: 6 },
  previewBtnText: { color: '#3f6212', fontSize: 12, fontWeight: 'bold', fontFamily: 'Tajawal' },

  printBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#3f6212', paddingHorizontal: 16, height: 44, borderRadius: 14, gap: 6 },
  printBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: 'Tajawal' },

  metaCard: { flexDirection: 'column', gap: 8, marginBottom: 14, backgroundColor: '#ffffff', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  metaInputRow: { flexDirection: 'row-reverse', gap: 8 },
  metaInput: { height: 44, backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 12, paddingHorizontal: 12, color: '#1a2e05', fontSize: 12, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },

  addUnitTopBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 16, gap: 8, marginBottom: 16, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  addUnitTopText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' },

  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: '#3f6212', fontSize: 13, textAlign: 'center', fontFamily: 'Tajawal', fontWeight: '600' },

  unitCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 20, overflow: 'hidden', marginBottom: 16, shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  unitCardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  unitIndexBadge: { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 11, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontFamily: 'Tajawal' },
  unitTitleText: { color: '#fff', fontSize: 14, fontWeight: '900', fontFamily: 'Tajawal' },

  addLessonInsideBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, height: 28, borderRadius: 8, gap: 4 },
  addLessonInsideText: { color: '#3f6212', fontSize: 11, fontWeight: 'bold', fontFamily: 'Tajawal' },

  lessonsListContainer: { padding: 12, gap: 8 },
  emptyLessonsText: { color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: 10, fontStyle: 'italic', fontFamily: 'Tajawal' },

  lessonRowItem: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.15)', borderRadius: 14, padding: 12, gap: 10 },
  lessonNumText: { color: '#65a30d', fontSize: 12, fontWeight: 'bold', fontFamily: 'Tajawal' },
  lessonTitleText: { color: '#1a2e05', fontSize: 13.5, fontWeight: '800', textAlign: 'right', fontFamily: 'Tajawal' },
  lessonBreakdownText: { color: '#334155', fontSize: 11.5, textAlign: 'right', marginTop: 2, fontFamily: 'Tajawal', fontWeight: '600' },
  lessonDateText: { color: '#64748b', fontSize: 11, textAlign: 'right', marginTop: 3, fontFamily: 'Tajawal' },
  lessonNotesText: { color: '#059669', fontSize: 11, textAlign: 'right', marginTop: 3, fontFamily: 'Tajawal', fontWeight: '600' },
  deleteLessonBtn: { padding: 6, backgroundColor: 'rgba(185, 28, 28, 0.08)', borderRadius: 8 },

  previewContainer: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 40 },
  previewHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' },
  previewTitle: { color: '#1a2e05', fontSize: 16, fontWeight: 'bold', fontFamily: 'Tajawal' },
  closePreviewBtn: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 10 },
  previewFooter: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  previewPrintBtn: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 14, gap: 8 },
  previewPrintText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 46, 5, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContentBox: { width: '100%', maxWidth: 340, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 30 },
  modalHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(101, 163, 13, 0.15)', paddingBottom: 10 },
  modalTitle: { color: '#1a2e05', fontSize: 15, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  modalInput: { height: 46, backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 14, paddingHorizontal: 14, color: '#1a2e05', fontSize: 13, textAlign: 'right', fontFamily: 'Tajawal', fontWeight: '600', marginBottom: 10 },
  modalSubmitBtn: { height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 6, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  modalSubmitText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' },

  modalColorsList: { gap: 8 },
  modalColorItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.15)', gap: 10 },
  activeModalColorItem: { backgroundColor: 'rgba(101, 163, 13, 0.12)', borderColor: '#3f6212' },
  modalColorText: { color: '#334155', fontSize: 13, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  activeModalColorText: { color: '#3f6212' }
});