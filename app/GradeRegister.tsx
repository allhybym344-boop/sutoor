import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSubscription } from './context/SubscriptionContext';

interface DailyColumn {
  id: string;
  title: string;
}

interface DailyStudent {
  id: string;
  name: string;
  grades: { [columnId: string]: string };
}

const STORAGE_KEY_DAILY_COLS = '@daily_cols_v15';
const STORAGE_KEY_DAILY_STU = '@daily_stu_v15';
const STORAGE_KEY_META = '@register_meta_v15';
const STORAGE_KEY_NUM_STYLE = '@num_style_v15';
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

export default function GradeRegister() {
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [numberStyle, setNumberStyle] = useState<'arabic' | 'english'>('arabic');
  const [headerColor, setHeaderColor] = useState<string>('#3f6212');
  const [showColorModal, setShowColorModal] = useState<boolean>(false);

  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subjectName, setSubjectName] = useState('');

  const [dailyColumns, setDailyColumns] = useState<DailyColumn[]>([
    { id: 'dc1', title: 'يومي 1' },
    { id: 'dc2', title: 'يومي 2' },
    { id: 'dc3', title: 'يومي 3' },
  ]);
  const [dailyStudents, setDailyStudents] = useState<DailyStudent[]>([]);

  const [newStudentName, setNewStudentName] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedMeta = await AsyncStorage.getItem(STORAGE_KEY_META);
      if (savedMeta) {
        const meta = JSON.parse(savedMeta);
        setSchoolName(meta.schoolName || '');
        setTeacherName(meta.teacherName || '');
        setSubjectName(meta.subjectName || '');
      }

      const savedNumStyle = await AsyncStorage.getItem(STORAGE_KEY_NUM_STYLE);
      if (savedNumStyle) setNumberStyle(savedNumStyle as 'arabic' | 'english');

      const savedColor = await AsyncStorage.getItem(STORAGE_KEY_HEADER_COLOR);
      if (savedColor) setHeaderColor(savedColor);

      const savedDC = await AsyncStorage.getItem(STORAGE_KEY_DAILY_COLS);
      const savedDS = await AsyncStorage.getItem(STORAGE_KEY_DAILY_STU);

      if (savedDC) setDailyColumns(JSON.parse(savedDC));
      if (savedDS) setDailyStudents(JSON.parse(savedDS));
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  };

  const saveMeta = async (sName: string, tName: string, subName: string) => {
    setSchoolName(sName);
    setTeacherName(tName);
    setSubjectName(subName);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_META, JSON.stringify({ schoolName: sName, teacherName: tName, subjectName: subName }));
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

  const toggleNumberStyle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStyle = numberStyle === 'arabic' ? 'english' : 'arabic';
    setNumberStyle(newStyle);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NUM_STYLE, newStyle);
    } catch (error) {
      console.error('خطأ في حفظ نمط الأرقام:', error);
    }
  };

  const saveDailyData = async (cols: DailyColumn[], students: DailyStudent[]) => {
    setDailyColumns(cols);
    setDailyStudents(students);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DAILY_COLS, JSON.stringify(cols));
      await AsyncStorage.setItem(STORAGE_KEY_DAILY_STU, JSON.stringify(students));
    } catch (error) {
      console.error('خطأ في حفظ الدرجات اليومية:', error);
    }
  };

  const normalizeNumbers = (str: string): string => {
    if (!str) return '';
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let res = str;
    for (let i = 0; i < 10; i++) {
      res = res.replace(new RegExp(arabicNumbers[i], 'g'), i.toString());
      res = res.replace(new RegExp(persianNumbers[i], 'g'), i.toString());
    }
    return res;
  };

  const parseGrade = (val: string): number => {
    if (!val) return NaN;
    return parseFloat(normalizeNumbers(val));
  };

  const formatNum = (val: number | string | null): string => {
    if (val === null || val === undefined || val === '') return '-';
    const strVal = val.toString();
    if (numberStyle === 'english') return strVal;
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return strVal.replace(/[0-9]/g, (d) => arabicNumbers[parseInt(d)]);
  };

  const formatGradeDisplay = (val: number | null): string => {
    if (val === null || isNaN(val)) return '-';
    if (val < 20) {
      return `${formatNum(val)}%`;
    }
    return formatNum(val);
  };

  const roundGrade = (value: number): number => {
    return Math.round(value);
  };

  const calculateDailyStats = (grades: { [key: string]: string }) => {
    let total = 0;
    let count = 0;
    dailyColumns.forEach(col => {
      const val = parseGrade(grades[col.id]);
      if (!isNaN(val)) {
        total += val;
        count++;
      }
    });
    const average = count > 0 ? roundGrade(total / count) : 0;
    return { total, average };
  };

  const addStudent = () => {
    if (!newStudentName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const initialGrades: { [key: string]: string } = {};
    dailyColumns.forEach(col => { initialGrades[col.id] = ''; });
    const newSt: DailyStudent = {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      grades: initialGrades
    };
    saveDailyData(dailyColumns, [...dailyStudents, newSt]);
    setNewStudentName('');
  };

  const deleteStudent = (id: string) => {
    Haptics.selectionAsync();
    saveDailyData(dailyColumns, dailyStudents.filter(s => s.id !== id));
  };

  const addDailyColumn = () => {
    if (!newColumnTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const colId = 'dc_' + Date.now();
    const newCols = [...dailyColumns, { id: colId, title: newColumnTitle.trim() }];
    const newSts = dailyStudents.map(s => ({ ...s, grades: { ...s.grades, [colId]: '' } }));
    saveDailyData(newCols, newSts);
    setNewColumnTitle('');
  };

  const deleteDailyColumn = (colId: string) => {
    if (dailyColumns.length <= 1) {
      Alert.alert('تنبيه', 'يجب أن يكون هناك عمود يومي واحد على الأقل.');
      return;
    }
    Haptics.selectionAsync();
    const newCols = dailyColumns.filter(c => c.id !== colId);
    const newSts = dailyStudents.map(s => {
      const g = { ...s.grades };
      delete g[colId];
      return { ...s, grades: g };
    });
    saveDailyData(newCols, newSts);
  };

  const updateDailyGrade = (studentId: string, colId: string, val: string) => {
    const updated = dailyStudents.map(s => s.id === studentId ? { ...s, grades: { ...s.grades, [colId]: val } } : s);
    saveDailyData(dailyColumns, updated);
  };

  const exportToPDF = async () => {
    if (dailyStudents.length === 0) {
      Alert.alert('تنبيه', 'لا توجد بيانات طلاب يومية لتصديرها.');
      return;
    }

    // التحقق من محاولات التصدير المجانية أو اشتراك الـ VIP
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', 'Tahoma', sans-serif; padding: 25px; color: #1a2e05; background: #fff; }
          .header-box { text-align: center; border-bottom: 3px solid ${headerColor}; padding-bottom: 12px; margin-bottom: 20px; }
          h2 { color: ${headerColor}; margin: 0 0 6px 0; font-size: 22px; font-weight: 900; }
          .meta-info { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #3f6212; margin-bottom: 20px; background: #f0fdf4; padding: 10px 15px; border-radius: 8px; border: 1px solid #b7d38d; }
          table { width: 100%; border-collapse: separate; border-spacing: 4px; margin-top: 5px; }
          th, td { border: 1.5px solid ${headerColor}44; padding: 8px; text-align: center; font-size: 11px; border-radius: 6px; }
          th { background-color: ${headerColor}; color: #fff; font-weight: bold; border-color: ${headerColor}; }
          td.name { text-align: right; font-weight: bold; padding-right: 10px; }
          .highlight { background-color: #f8fafc; font-weight: bold; color: #1a2e05; }
          .red-text { color: #b91c1c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h2>سجل الدرجات اليومية والمتابعة</h2>
          <p style="color: #3f6212; font-size: 11px; margin: 3px 0 0 0;">منظومة سُطور التعليمية الرقمية</p>
        </div>

        <div class="meta-info">
          <div>اسم المدرسة: ${schoolName || 'غير محدد'}</div>
          <div>المادة: ${subjectName || 'غير محدد'}</div>
          <div>اسم الأستاذ: ${teacherName || 'غير محدد'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px;">ت</th>
              <th style="text-align: right;">اسم الطالب</th>
              ${dailyColumns.map(col => `<th>${col.title}</th>`).join('')}
              <th class="highlight">المجموع</th>
              <th class="highlight">المعدل</th>
            </tr>
          </thead>
          <tbody>
            ${dailyStudents.map((st, index) => {
              const stats = calculateDailyStats(st.grades);
              return `
                <tr>
                  <td>${formatNum(index + 1)}</td>
                  <td class="name">${st.name}</td>
                  ${dailyColumns.map(col => {
                    const val = parseGrade(st.grades[col.id]);
                    const isRed = !isNaN(val) && val < 50;
                    return `<td class="${isRed ? 'red-text' : ''}">${formatGradeDisplay(isNaN(val) ? null : val)}</td>`;
                  }).join('')}
                  <td class="highlight">${formatNum(stats.total)}</td>
                  <td class="highlight ${stats.average < 50 ? 'red-text' : ''}">${formatGradeDisplay(stats.average)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${getWatermarkHTML()}
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('تم الحفظ', `تم إنشاء ملف PDF بنجاح في المسار: ${uri}`);
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير ملف الـ PDF');
    }
  };

  const currentSelectedColorLabel = COLOR_PALETTE.find(c => c.value === headerColor)?.label || 'اختر اللون';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#ffffff', '#b7d38d', '#3f6b09']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* شريط الإجراءات والتحكم العلوي */}
        <View style={styles.headerToolbar}>
          <TouchableOpacity onPress={toggleNumberStyle} style={styles.toolbarBtn} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={16} color="#3f6212" />
            <Text style={styles.toolbarBtnText}>
              {numberStyle === 'arabic' ? '٠-٩' : '0-9'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => { Haptics.selectionAsync(); setShowColorModal(true); }} 
            style={styles.colorSelectorBtn}
            activeOpacity={0.85}
          >
            <View style={[styles.colorPreviewDot, { backgroundColor: headerColor }]} />
            <Text style={styles.colorSelectorText} numberOfLines={1}>{currentSelectedColorLabel}</Text>
            <Ionicons name="chevron-down" size={14} color="#3f6212" />
          </TouchableOpacity>

          <TouchableOpacity onPress={exportToPDF} style={styles.pdfExportBtn} activeOpacity={0.85}>
            <Ionicons name="document-text-outline" size={16} color="#fff" />
            <Text style={styles.pdfExportText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {/* خانات البيانات التعريفية مع أيقونات فخمة */}
        <View style={styles.metaCard}>
          <View style={styles.metaInputWrapper}>
            <Ionicons name="school-outline" size={16} color="#3f6212" style={styles.metaIcon} />
            <TextInput
              style={styles.metaInput}
              placeholder="المدرسة..."
              placeholderTextColor="#65a30d"
              value={schoolName}
              onChangeText={(text) => saveMeta(text, teacherName, subjectName)}
              textAlign="right"
            />
          </View>
          <View style={styles.metaInputWrapper}>
            <Ionicons name="book-outline" size={16} color="#3f6212" style={styles.metaIcon} />
            <TextInput
              style={styles.metaInput}
              placeholder="المادة..."
              placeholderTextColor="#65a30d"
              value={subjectName}
              onChangeText={(text) => saveMeta(schoolName, teacherName, text)}
              textAlign="right"
            />
          </View>
          <View style={styles.metaInputWrapper}>
            <Ionicons name="person-outline" size={16} color="#3f6212" style={styles.metaIcon} />
            <TextInput
              style={styles.metaInput}
              placeholder="الأستاذ..."
              placeholderTextColor="#65a30d"
              value={teacherName}
              onChangeText={(text) => saveMeta(schoolName, text, subjectName)}
              textAlign="right"
            />
          </View>
        </View>

        {/* حقول الإضافة السريعة مع الأيقونات */}
        <View style={styles.controlsContainer}>
          <View style={styles.inputGroup}>
            <View style={styles.inputWithIconWrapper}>
              <Ionicons name="person-add-outline" size={18} color="#3f6212" style={styles.fieldIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="اسم الطالب الجديد..."
                placeholderTextColor="#65a30d"
                value={newStudentName}
                onChangeText={setNewStudentName}
                textAlign="right"
              />
            </View>
            <TouchableOpacity onPress={addStudent} style={styles.primaryBtn} activeOpacity={0.85}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.btnText}>إضافة</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWithIconWrapper}>
              <Ionicons name="grid-outline" size={18} color="#3f6212" style={styles.fieldIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="اسم الحقل اليومي (مثل: واجب 1)..."
                placeholderTextColor="#65a30d"
                value={newColumnTitle}
                onChangeText={setNewColumnTitle}
                textAlign="right"
              />
            </View>
            <TouchableOpacity onPress={addDailyColumn} style={styles.secondaryBtn} activeOpacity={0.85}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>حقل</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* جدول الدرجات اليومية */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
          <View style={styles.tableContainer}>
            <View style={[styles.tableHeader, { backgroundColor: headerColor }]}>
              <View style={styles.nameHeaderCell}><Text style={styles.headerText}>اسم الطالب</Text></View>
              {dailyColumns.map(col => (
                <View key={col.id} style={styles.columnHeaderCell}>
                  <TouchableOpacity onPress={() => deleteDailyColumn(col.id)} style={styles.colDeleteIcon}>
                    <Ionicons name="close-circle" size={14} color="#fee2e2" />
                  </TouchableOpacity>
                  <Text style={styles.headerText} numberOfLines={1}>{col.title}</Text>
                </View>
              ))}
              <View style={styles.statHeaderCell}><Text style={styles.statHeaderText}>المجموع</Text></View>
              <View style={styles.statHeaderCell}><Text style={styles.statHeaderText}>المعدل</Text></View>
              <View style={styles.actionHeaderCell}><Text style={styles.headerText}>حذف</Text></View>
            </View>

            <FlatList
              data={dailyStudents}
              keyExtractor={(item) => item.id}
              renderItem={({ item: student }) => {
                const stats = calculateDailyStats(student.grades);
                return (
                  <View style={styles.tableRow}>
                    <View style={styles.nameCell}>
                      <Text style={styles.studentNameText} numberOfLines={1}>{student.name}</Text>
                    </View>
                    {dailyColumns.map(col => {
                      const val = parseGrade(student.grades[col.id]);
                      const isRed = !isNaN(val) && val < 50;
                      return (
                        <View key={col.id} style={styles.gradeCell}>
                          <TextInput
                            style={[styles.gradeInput, isRed && { color: '#b91c1c', borderColor: 'rgba(185, 28, 28, 0.4)' }]}
                            value={student.grades[col.id] || ''}
                            onChangeText={(text) => updateDailyGrade(student.id, col.id, text)}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#65a30d"
                          />
                        </View>
                      );
                    })}
                    <View style={styles.statCell}><Text style={styles.statText}>{formatNum(stats.total)}</Text></View>
                    <View style={styles.statCell}>
                      <Text style={[styles.statText, stats.average < 50 && { color: '#b91c1c' }]}>
                        {formatGradeDisplay(stats.average)}
                      </Text>
                    </View>
                    <View style={styles.actionCell}>
                      <TouchableOpacity onPress={() => deleteStudent(student.id)} style={styles.deleteRowBtn}>
                        <Ionicons name="trash-outline" size={15} color="#b91c1c" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>

      </ScrollView>

      {/* نافذة منبثقة لاختيار الألوان */}
      <Modal
        visible={showColorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>اختر لون الشريط والروؤس</Text>
              <TouchableOpacity onPress={() => setShowColorModal(false)}>
                <Ionicons name="close" size={20} color="#3f6212" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalColorsList} showsVerticalScrollIndicator={true}>
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

  headerToolbar: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 14 },
  toolbarBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', paddingHorizontal: 14, height: 44, borderRadius: 14, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  toolbarBtnText: { color: '#3f6212', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },

  colorSelectorBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', height: 44, borderRadius: 14, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  colorSelectorText: { flex: 1, color: '#3f6212', fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginHorizontal: 8, fontFamily: 'Tajawal' },
  colorPreviewDot: { width: 14, height: 14, borderRadius: 7 },

  pdfExportBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#3f6212', paddingHorizontal: 18, height: 44, borderRadius: 14, gap: 8, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  pdfExportText: { color: '#fff', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 46, 5, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContentBox: { width: '100%', maxWidth: 340, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', borderRadius: 24, padding: 20, maxHeight: '75%', shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 30 },
  modalHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(101, 163, 13, 0.15)', paddingBottom: 10 },
  modalTitle: { color: '#1a2e05', fontSize: 15, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  modalColorsList: { gap: 8 },
  modalColorItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.15)', gap: 10 },
  activeModalColorItem: { backgroundColor: 'rgba(101, 163, 13, 0.12)', borderColor: '#3f6212' },
  modalColorText: { color: '#334155', fontSize: 13, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  activeModalColorText: { color: '#3f6212' },

  metaCard: { flexDirection: 'row-reverse', gap: 10, marginBottom: 14, backgroundColor: '#ffffff', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  metaInputWrapper: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 12, paddingHorizontal: 10, height: 44 },
  metaIcon: { marginLeft: 6 },
  metaInput: { flex: 1, height: '100%', color: '#1a2e05', fontSize: 12, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },

  controlsContainer: { gap: 10, marginBottom: 14 },
  inputGroup: { flexDirection: 'row-reverse', gap: 10 },
  inputWithIconWrapper: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 16, paddingHorizontal: 14, height: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 3 },
  fieldIcon: { marginLeft: 10 },
  inputWithIcon: { flex: 1, height: '100%', color: '#1a2e05', fontSize: 13, textAlign: 'right', fontFamily: 'Tajawal', fontWeight: '600' },
  
  primaryBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#3f6212', paddingHorizontal: 16, borderRadius: 16, justifyContent: 'center', gap: 6, height: 48, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  secondaryBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#4d7c0f', paddingHorizontal: 16, borderRadius: 16, justifyContent: 'center', gap: 6, height: 48, shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13, fontFamily: 'Tajawal' },

  horizontalScroll: { flex: 1 },
  tableContainer: { minWidth: '100%' },
  tableHeader: { flexDirection: 'row-reverse', borderRadius: 16, paddingVertical: 12, marginBottom: 10, alignItems: 'center', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6 },
  nameHeaderCell: { width: 160, paddingHorizontal: 12, alignItems: 'flex-end' },
  columnHeaderCell: { width: 85, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  statHeaderCell: { width: 75, alignItems: 'center', justifyContent: 'center' },
  actionHeaderCell: { width: 45, alignItems: 'center', justifyContent: 'center' },
  headerText: { color: '#ffffff', fontWeight: '900', fontSize: 12.5, textAlign: 'center', fontFamily: 'Tajawal' },
  statHeaderText: { color: '#fefce8', fontWeight: '900', fontSize: 12.5, textAlign: 'center', fontFamily: 'Tajawal' },
  colDeleteIcon: { position: 'absolute', top: -6, left: 4, zIndex: 1 },
  listContent: { paddingBottom: 30 },
  tableRow: { flexDirection: 'row-reverse', backgroundColor: '#ffffff', borderRadius: 14, paddingVertical: 10, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  nameCell: { width: 160, paddingHorizontal: 12, alignItems: 'flex-end' },
  studentNameText: { color: '#1a2e05', fontSize: 13.5, fontWeight: '800', textAlign: 'right', fontFamily: 'Tajawal' },
  gradeCell: { width: 85, alignItems: 'center', justifyContent: 'center' },
  statCell: { width: 75, alignItems: 'center', justifyContent: 'center' },
  gradeInput: { width: 66, height: 38, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', borderRadius: 12, backgroundColor: '#fdfbfb', color: '#1a2e05', textAlign: 'center', fontSize: 13.5, fontWeight: 'bold', fontFamily: 'Tajawal' },
  statText: { color: '#3f6212', fontSize: 13.5, fontWeight: '900', textAlign: 'center', fontFamily: 'Tajawal' },
  actionCell: { width: 45, alignItems: 'center', justifyContent: 'center' },
  deleteRowBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(185, 28, 28, 0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(185, 28, 28, 0.2)' }
});