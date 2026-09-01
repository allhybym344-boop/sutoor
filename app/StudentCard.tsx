import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
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
import { useSubscription } from './context/SubscriptionContext';

interface SubjectGrade {
  id: string;
  subjectName: string;
  t1: string;
  t2: string;
  k1: string;
  midYear: string;
  feb: string;
  mar: string;
  apr: string;
  finalExam: string;
}

interface StudentProfile {
  id: string;
  name: string;
  schoolName: string;
  className: string;
  academicYear: string;
  serialNumber: string;
  subjects: SubjectGrade[];
}

const STORAGE_KEY_STUDENT_CARDS = '@student_cards_multi_v5';
const STORAGE_KEY_NUM_STYLE = '@num_style_v14';
const STORAGE_KEY_HEADER_COLOR = '@header_color_v14';

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

export default function StudentCardScreen() {
  const router = useRouter();

  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [numberStyle, setNumberStyle] = useState<'arabic' | 'english'>('arabic');
  const [headerColor, setHeaderColor] = useState<string>('#3f6212');
  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  
  const [students, setStudents] = useState<StudentProfile[]>([]);
  
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [manualName, setManualName] = useState('');
  const [manualSchool, setManualSchool] = useState('');
  const [manualClass, setManualClass] = useState('');
  const [manualAcademicYear, setManualAcademicYear] = useState('2026/2025');
  const [manualSerialNumber, setManualSerialNumber] = useState('1');

  const [newSubjectName, setNewSubjectName] = useState('');
  const [viewMode, setViewMode] = useState<'select' | 'card'>('select');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedNumStyle = await AsyncStorage.getItem(STORAGE_KEY_NUM_STYLE);
      if (savedNumStyle) setNumberStyle(savedNumStyle as 'arabic' | 'english');

      const savedColor = await AsyncStorage.getItem(STORAGE_KEY_HEADER_COLOR);
      if (savedColor) setHeaderColor(savedColor);

      const savedData = await AsyncStorage.getItem(STORAGE_KEY_STUDENT_CARDS);
      if (savedData) {
        const parsed: StudentProfile[] = JSON.parse(savedData);
        setStudents(parsed);
      }
    } catch (error) {
      console.error('خطأ في تحميل كارتات الطلاب:', error);
    }
  };

  const saveDataToStorage = async (updated: StudentProfile[]) => {
    setStudents(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_STUDENT_CARDS, JSON.stringify(updated));
    } catch (error) {
      console.error('خطأ في حفظ بيانات الطلاب:', error);
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

  const handleAddManualStudent = () => {
    if (!manualName.trim() || !manualSchool.trim() || !manualClass.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم الطالب، المدرسة، والصف بشكل كامل.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newStudent: StudentProfile = {
      id: 'st_' + Date.now(),
      name: manualName.trim(),
      schoolName: manualSchool.trim(),
      className: manualClass.trim(),
      academicYear: manualAcademicYear.trim() || '2026/2025',
      serialNumber: manualSerialNumber.trim() || '1',
      subjects: []
    };

    const updated = [...students, newStudent];
    saveDataToStorage(updated);

    setManualName('');
    setManualSchool('');
    setManualClass('');
    setManualAcademicYear('2026/2025');
    setManualSerialNumber('1');
    setShowAddStudentModal(false);
  };

  const deleteStudentProfile = (stId: string) => {
    Alert.alert('حذف ملف الطالب', 'هل أنت متأكد من حذف هذا الطالب بكافة مواده ودرجاته؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          Haptics.selectionAsync();
          const updated = students.filter(s => s.id !== stId);
          saveDataToStorage(updated);
          setViewMode('select');
        }
      }
    ]);
  };

  const schoolsList = Array.from(new Set(students.map(s => s.schoolName).filter(Boolean)));
  const classesList = Array.from(new Set(students.filter(s => !selectedSchool || s.schoolName === selectedSchool).map(s => s.className).filter(Boolean)));
  const filteredStudents = students.filter(s => 
    (!selectedSchool || s.schoolName === selectedSchool) && 
    (!selectedClass || s.className === selectedClass)
  );

  const currentStudent = students.find(s => s.id === selectedStudentId);

  const updateStudentField = (field: 'academicYear' | 'serialNumber', val: string) => {
    if (!currentStudent) return;
    const updated = students.map(st => {
      if (st.id === currentStudent.id) {
        return { ...st, [field]: val };
      }
      return st;
    });
    saveDataToStorage(updated);
  };

  const addSubjectToStudent = () => {
    if (!currentStudent || !newSubjectName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newSub: SubjectGrade = {
      id: 'sub_' + Date.now(),
      subjectName: newSubjectName.trim(),
      t1: '', t2: '', k1: '', midYear: '', feb: '', mar: '', apr: '', finalExam: ''
    };

    const updated = students.map(st => {
      if (st.id === currentStudent.id) {
        return { ...st, subjects: [...st.subjects, newSub] };
      }
      return st;
    });

    saveDataToStorage(updated);
    setNewSubjectName('');
  };

  const deleteSubject = (subId: string) => {
    if (!currentStudent) return;
    Haptics.selectionAsync();
    const updated = students.map(st => {
      if (st.id === currentStudent.id) {
        return { ...st, subjects: st.subjects.filter(sub => sub.id !== subId) };
      }
      return st;
    });
    saveDataToStorage(updated);
  };

  const updateSubjectGrade = (subId: string, field: keyof SubjectGrade, val: string) => {
    if (!currentStudent) return;
    const updated = students.map(st => {
      if (st.id === currentStudent.id) {
        const updatedSubs = st.subjects.map(sub => {
          if (sub.id === subId) {
            return { ...sub, [field]: val };
          }
          return sub;
        });
        return { ...st, subjects: updatedSubs };
      }
      return st;
    });
    saveDataToStorage(updated);
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
    const rounded = Math.round(val);
    if (rounded < 20) {
      return `${formatNum(rounded)}%`;
    }
    return formatNum(rounded);
  };

  const calculateSubjectStats = (sub: SubjectGrade) => {
    const t1 = parseGrade(sub.t1);
    const t2 = parseGrade(sub.t2);
    const k1 = parseGrade(sub.k1);
    const mid = parseGrade(sub.midYear);
    const feb = parseGrade(sub.feb);
    const mar = parseGrade(sub.mar);
    const apr = parseGrade(sub.apr);
    const final = parseGrade(sub.finalExam);

    const hasFirstTerm = !isNaN(t1) && !isNaN(t2) && !isNaN(k1) && sub.t1 !== '' && sub.t2 !== '' && sub.k1 !== '';
    const firstTermAvg = hasFirstTerm ? Math.round((t1 + t2 + k1) / 3) : null;

    const hasSecondTerm = !isNaN(feb) && !isNaN(mar) && !isNaN(apr) && sub.feb !== '' && sub.mar !== '' && sub.apr !== '';
    const secondTermAvg = hasSecondTerm ? Math.round((feb + mar + apr) / 3) : null;

    const hasMidYear = !isNaN(mid) && sub.midYear !== '';

    const hasAnnualEffort = hasFirstTerm && hasMidYear && hasSecondTerm;
    const annualEffort = hasAnnualEffort ? Math.round((firstTermAvg! + mid + secondTermAvg!) / 3) : null;

    const hasFinalExam = !isNaN(final) && sub.finalExam !== '';
    const finalGrade = (hasAnnualEffort && hasFinalExam) ? Math.round((annualEffort! + final) / 2) : null;

    return { firstTermAvg, secondTermAvg, annualEffort, finalGrade };
  };

  const exportCardToPDF = async () => {
    if (!currentStudent) return;

    // التحقق من محاولات التصدير المجانية أو اشتراك الـ VIP قبل التصدير
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', 'Tahoma', sans-serif; padding: 20px; color: #1a2e05; background: #fff; }
          .card-box { border: 2.5px solid ${headerColor}; border-radius: 16px; padding: 18px; }
          
          .official-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid ${headerColor};
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .admin-box {
            font-size: 13px;
            font-weight: bold;
            color: #334155;
            width: 30%;
          }
          .title-box {
            text-align: center;
            width: 40%;
          }
          .title-box h2 {
            color: ${headerColor};
            margin: 0 0 4px 0;
            font-size: 20px;
            font-weight: 900;
          }
          .year-sub {
            font-size: 11px;
            color: #475569;
            margin: 0;
            font-weight: bold;
          }
          .student-info-box {
            font-size: 12px;
            font-weight: bold;
            color: #1a2e05;
            width: 30%;
            text-align: left;
            line-height: 1.6;
          }

          table { width: 100%; border-collapse: separate; border-spacing: 4px; margin-top: 5px; }
          th, td { border: 1.5px solid ${headerColor}44; padding: 6px; text-align: center; font-size: 11px; border-radius: 6px; }
          th { background-color: ${headerColor}; color: #fff; font-weight: bold; border-color: ${headerColor}; }
          td.subject { text-align: right; font-weight: bold; padding-right: 10px; }
          .highlight { background-color: #f8fafc; font-weight: bold; color: #1a2e05; }
          .red-text { color: #b91c1c; font-weight: bold; }
          .footer-sign { display: flex; justify-content: space-between; margin-top: 25px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card-box">
          <div class="official-header">
            <div class="admin-box">
              إدارة: ${currentStudent.schoolName || '....................'}
            </div>
            <div class="title-box">
              <h2>بطاقة درجات الامتحانات</h2>
              <div class="year-sub">للسنة الدراسية: ${currentStudent.academicYear || '2026/2025'}</div>
            </div>
            <div class="student-info-box">
              <div>الاسم: ${currentStudent.name}</div>
              <div>الصف: ${currentStudent.className || '....................'}</div>
              <div>تسلسل: ${currentStudent.serialNumber || '........'}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: right;">المادة الدراسية</th>
                <th>ت1</th>
                <th>ت2</th>
                <th>ك1</th>
                <th class="highlight">م. الفصل 1</th>
                <th>نصف السنة</th>
                <th>شباط</th>
                <th>آذار</th>
                <th>نيسان</th>
                <th class="highlight">م. الفصل 2</th>
                <th class="highlight">السعي السنوي</th>
                <th>النهائي</th>
                <th class="highlight">الدرجة النهائية</th>
              </tr>
            </thead>
            <tbody>
              ${currentStudent.subjects.map(sub => {
                const st = calculateSubjectStats(sub);
                return `
                  <tr>
                    <td class="subject">${sub.subjectName}</td>
                    <td class="${parseGrade(sub.t1) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.t1))}</td>
                    <td class="${parseGrade(sub.t2) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.t2))}</td>
                    <td class="${parseGrade(sub.k1) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.k1))}</td>
                    <td class="highlight ${st.firstTermAvg !== null && st.firstTermAvg < 50 ? 'red-text' : ''}">${formatGradeDisplay(st.firstTermAvg)}</td>
                    <td class="${parseGrade(sub.midYear) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.midYear))}</td>
                    <td class="${parseGrade(sub.feb) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.feb))}</td>
                    <td class="${parseGrade(sub.mar) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.mar))}</td>
                    <td class="${parseGrade(sub.apr) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.apr))}</td>
                    <td class="highlight ${st.secondTermAvg !== null && st.secondTermAvg < 50 ? 'red-text' : ''}">${formatGradeDisplay(st.secondTermAvg)}</td>
                    <td class="highlight ${st.annualEffort !== null && st.annualEffort < 50 ? 'red-text' : ''}">${formatGradeDisplay(st.annualEffort)}</td>
                    <td class="${parseGrade(sub.finalExam) < 50 ? 'red-text' : ''}">${formatNum(parseGrade(sub.finalExam))}</td>
                    <td class="highlight ${st.finalGrade !== null && st.finalGrade < 50 ? 'red-text' : ''}">${formatGradeDisplay(st.finalGrade)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer-sign">
            <div>توقيع إدارة المدرسة: ........................</div>
            <div>ختم المدرسة: ........................</div>
          </div>
        </div>
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
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير كارت الطالب الشامل');
    }
  };

  const currentSelectedColorLabel = COLOR_PALETTE.find(c => c.value === headerColor)?.label || 'اختر اللون';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#ffffff', '#b7d38d', '#3f6b09']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={20} color="#1a2e05" />
        </TouchableOpacity>

        {/* منفذ اختيار الألوان للـ PDF */}
        <TouchableOpacity 
          onPress={() => { Haptics.selectionAsync(); setShowColorModal(true); }} 
          style={styles.colorSelectorBtn}
          activeOpacity={0.85}
        >
          <View style={[styles.colorPreviewDot, { backgroundColor: headerColor }]} />
          <Text style={styles.colorSelectorText} numberOfLines={1}>{currentSelectedColorLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#3f6212" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleNumberStyle} style={styles.numStyleBtn} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={15} color="#3f6212" />
          <Text style={styles.numStyleBtnText}>
            {numberStyle === 'arabic' ? '٠-٩' : '0-9'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {viewMode === 'select' ? (
          <View style={styles.selectContainer}>
            <TouchableOpacity
              onPress={() => setShowAddStudentModal(true)}
              style={styles.addNewStudentTopBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add" size={16} color="#fff" />
              <Text style={styles.addNewStudentTopText}>إضافة طالب جديد يدوياً</Text>
            </TouchableOpacity>

            <Text style={styles.label}>اختر المدرسة:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <TouchableOpacity
                onPress={() => { setSelectedSchool(''); setSelectedClass(''); }}
                style={[styles.chip, !selectedSchool && { backgroundColor: headerColor, borderColor: '#1a2e05' }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, !selectedSchool && { color: '#fff' }]}>الكل</Text>
              </TouchableOpacity>
              {schoolsList.map(sch => (
                <TouchableOpacity
                  key={sch}
                  onPress={() => { setSelectedSchool(sch); setSelectedClass(''); }}
                  style={[styles.chip, selectedSchool === sch && { backgroundColor: headerColor, borderColor: '#1a2e05' }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selectedSchool === sch && { color: '#fff' }]}>{sch}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>اختر الصف:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <TouchableOpacity
                onPress={() => setSelectedClass('')}
                style={[styles.chip, !selectedClass && { backgroundColor: headerColor, borderColor: '#1a2e05' }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, !selectedClass && { color: '#fff' }]}>الكل</Text>
              </TouchableOpacity>
              {classesList.map(cls => (
                <TouchableOpacity
                  key={cls}
                  onPress={() => setSelectedClass(cls)}
                  style={[styles.chip, selectedClass === cls && { backgroundColor: headerColor, borderColor: '#1a2e05' }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, selectedClass === cls && { color: '#fff' }]}>{cls}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>اختر ملف الطالب:</Text>
            {filteredStudents.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="folder-open-outline" size={40} color="#3f6212" />
                <Text style={styles.emptyText}>لا توجد ملفات طلاب مطابقة. انقر فوق زر "إضافة طالب جديد يدوياً" أعلاه للبدء.</Text>
              </View>
            ) : (
              <View style={styles.studentsList}>
                {filteredStudents.map(st => (
                  <TouchableOpacity
                    key={st.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedStudentId(st.id);
                      setViewMode('card');
                    }}
                    style={styles.studentCardItem}
                    activeOpacity={0.85}
                  >
                    <View>
                      <Text style={styles.stNameText}>{st.name}</Text>
                      <Text style={styles.stSubText}>{st.schoolName} | {st.className}</Text>
                    </View>
                    <Ionicons name="arrow-back" size={18} color="#3f6212" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          currentStudent && (
            <View>
              <View style={styles.cardTopNavRow}>
                <TouchableOpacity
                  onPress={() => setViewMode('select')}
                  style={styles.backToSelectBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-forward" size={16} color="#3f6212" />
                  <Text style={styles.backToSelectText}>العودة للقائمة</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteStudentProfile(currentStudent.id)}
                  style={styles.deleteStudentProfileBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={15} color="#b91c1c" />
                  <Text style={styles.deleteStudentProfileText}>حذف ملف الطالب</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.studentHeaderCard}>
                <Text style={styles.cardStudentName}>{currentStudent.name}</Text>
                <Text style={styles.cardStudentMeta}>المدرسة: {currentStudent.schoolName} | الصف: {currentStudent.className}</Text>
                
                <View style={styles.yearAndSerialRow}>
                  <View style={styles.yearInputRow}>
                    <Text style={styles.yearInputLabel}>السنة:</Text>
                    <TextInput
                      style={styles.yearInputField}
                      value={currentStudent.academicYear || '2026/2025'}
                      onChangeText={(v) => updateStudentField('academicYear', v)}
                      placeholder="2026/2025"
                      placeholderTextColor="#65a30d"
                      textAlign="center"
                    />
                  </View>
                  <View style={styles.yearInputRow}>
                    <Text style={styles.yearInputLabel}>التسلسل:</Text>
                    <TextInput
                      style={styles.yearInputField}
                      value={currentStudent.serialNumber || '1'}
                      onChangeText={(v) => updateStudentField('serialNumber', v)}
                      placeholder="1"
                      placeholderTextColor="#65a30d"
                      textAlign="center"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.addSubjectRow}>
                <TextInput
                  style={styles.subInput}
                  placeholder="اسم المادة الدراسية الجديدة (مثال: الفيزياء)..."
                  placeholderTextColor="#65a30d"
                  value={newSubjectName}
                  onChangeText={setNewSubjectName}
                  textAlign="right"
                />
                <TouchableOpacity onPress={addSubjectToStudent} style={styles.addSubBtn} activeOpacity={0.85}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addSubText}>إضافة مادة</Text>
                </TouchableOpacity>
              </View>

              {currentStudent.subjects.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>لم تتم إضافة مواد دراسية لهذا الطالب بعد.</Text>
                </View>
              ) : (
                currentStudent.subjects.map(sub => {
                  const stats = calculateSubjectStats(sub);

                  const renderInput = (field: keyof SubjectGrade, val: string) => {
                    const num = parseGrade(val);
                    const isRed = !isNaN(num) && num < 50;
                    return (
                      <TextInput
                        style={[styles.fInput, isRed && { color: '#b91c1c', borderColor: 'rgba(185, 28, 28, 0.4)' }]}
                        value={val}
                        onChangeText={(v) => updateSubjectGrade(sub.id, field, v)}
                        keyboardType="numeric"
                        placeholder="-"
                        placeholderTextColor="#65a30d"
                      />
                    );
                  };

                  return (
                    <View key={sub.id} style={styles.subjectBox}>
                      <View style={[styles.subBoxHeader, { backgroundColor: headerColor }]}>
                        <Text style={styles.subBoxTitle}>{sub.subjectName}</Text>
                        <TouchableOpacity onPress={() => deleteSubject(sub.id)}>
                          <Ionicons name="trash-outline" size={16} color="#fee2e2" />
                        </TouchableOpacity>
                      </View>

                      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.subScrollRow}>
                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>ت1</Text>{renderInput('t1', sub.t1)}</View>
                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>ت2</Text>{renderInput('t2', sub.t2)}</View>
                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>ك1</Text>{renderInput('k1', sub.k1)}</View>
                        
                        <View style={styles.calcFieldBox}>
                          <Text style={styles.fLabelCalc}>م. الفصل 1</Text>
                          <Text style={[styles.fValCalc, stats.firstTermAvg !== null && stats.firstTermAvg < 50 && { color: '#b91c1c' }]}>
                            {formatGradeDisplay(stats.firstTermAvg)}
                          </Text>
                        </View>

                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>نصف سنة</Text>{renderInput('midYear', sub.midYear)}</View>
                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>شباط</Text>{renderInput('feb', sub.feb)}</View>
                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>آذار</Text>{renderInput('mar', sub.mar)}</View>
                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>نيسان</Text>{renderInput('apr', sub.apr)}</View>

                        <View style={styles.calcFieldBox}>
                          <Text style={styles.fLabelCalc}>م. الفصل 2</Text>
                          <Text style={[styles.fValCalc, stats.secondTermAvg !== null && stats.secondTermAvg < 50 && { color: '#b91c1c' }]}>
                            {formatGradeDisplay(stats.secondTermAvg)}
                          </Text>
                        </View>

                        <View style={styles.calcFieldBox}>
                          <Text style={styles.fLabelCalc}>السعي السنوي</Text>
                          <Text style={[styles.fValCalc, stats.annualEffort !== null && stats.annualEffort < 50 && { color: '#b91c1c' }]}>
                            {formatGradeDisplay(stats.annualEffort)}
                          </Text>
                        </View>

                        <View style={styles.inputFieldBox}><Text style={styles.fLabel}>النهائي</Text>{renderInput('finalExam', sub.finalExam)}</View>

                        <View style={styles.finalFieldBox}>
                          <Text style={styles.fLabelFinal}>الدرجة النهائية</Text>
                          <Text style={[styles.fValFinal, stats.finalGrade !== null && stats.finalGrade < 50 && { color: '#b91c1c' }]}>
                            {formatGradeDisplay(stats.finalGrade)}
                          </Text>
                        </View>
                      </ScrollView>
                    </View>
                  );
                })
              )}

              <TouchableOpacity
                onPress={exportCardToPDF}
                style={[styles.exportCardBtn, { backgroundColor: headerColor }]}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={styles.exportCardBtnText}>تصدير كارت الطالب الشامل لـ PDF</Text>
              </TouchableOpacity>
            </View>
          )
        )}

      </ScrollView>

      {/* نافذة اختيار الألوان للـ PDF */}
      <Modal
        visible={showColorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>اختر لون الترويسة والجداول للـ PDF</Text>
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

      {/* نافذة إضافة طالب جديد يدوياً */}
      <Modal
        visible={showAddStudentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddStudentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>إضافة طالب جديد بملف منفصل</Text>
              <TouchableOpacity onPress={() => setShowAddStudentModal(false)}>
                <Ionicons name="close" size={20} color="#3f6212" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="اسم الطالب الثلاثي..."
                placeholderTextColor="#65a30d"
                value={manualName}
                onChangeText={setManualName}
                textAlign="right"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="اسم المدرسة..."
                placeholderTextColor="#65a30d"
                value={manualSchool}
                onChangeText={setManualSchool}
                textAlign="right"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="اسم الصف (مثال: السادس الابتدائي)..."
                placeholderTextColor="#65a30d"
                value={manualClass}
                onChangeText={setManualClass}
                textAlign="right"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="السنة الدراسية (مثال: 2026/2025)..."
                placeholderTextColor="#65a30d"
                value={manualAcademicYear}
                onChangeText={setManualAcademicYear}
                textAlign="right"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="تسلسل الطالب (مثال: 1)..."
                placeholderTextColor="#65a30d"
                value={manualSerialNumber}
                onChangeText={setManualSerialNumber}
                textAlign="right"
                keyboardType="numeric"
              />

              <TouchableOpacity onPress={handleAddManualStudent} style={styles.modalSubmitBtn} activeOpacity={0.85}>
                <Text style={styles.modalSubmitText}>إنشاء ملف الطالب</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbfb' },
  topHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  
  colorSelectorBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', height: 40, borderRadius: 12, paddingHorizontal: 12, marginHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  colorSelectorText: { flex: 1, color: '#3f6212', fontSize: 12, fontWeight: 'bold', textAlign: 'right', marginHorizontal: 6, fontFamily: 'Tajawal' },
  colorPreviewDot: { width: 12, height: 12, borderRadius: 6 },

  numStyleBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', paddingHorizontal: 12, height: 40, borderRadius: 12, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  numStyleBtnText: { color: '#3f6212', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },
  headerTitle: { color: '#1a2e05', fontSize: 16, fontWeight: '900', fontFamily: 'Tajawal' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  selectContainer: { gap: 10 },
  addNewStudentTopBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3f6212', height: 48, borderRadius: 16, gap: 8, marginBottom: 8, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  addNewStudentTopText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' },

  label: { color: '#3f6212', fontSize: 13, fontWeight: '800', textAlign: 'right', marginTop: 6, fontFamily: 'Tajawal' },
  chipsRow: { gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3 },
  chipText: { color: '#3f6212', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },

  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: '#3f6212', fontSize: 13, textAlign: 'center', fontFamily: 'Tajawal', fontWeight: '600' },
  studentsList: { gap: 10, marginTop: 4 },
  studentCardItem: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)', borderRadius: 16, padding: 14, shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  stNameText: { color: '#1a2e05', fontSize: 15, fontWeight: '900', textAlign: 'right', fontFamily: 'Tajawal' },
  stSubText: { color: '#3f6212', fontSize: 12, textAlign: 'right', marginTop: 3, fontFamily: 'Tajawal', fontWeight: '600' },

  cardTopNavRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backToSelectBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)' },
  backToSelectText: { color: '#3f6212', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },
  deleteStudentProfileBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(185, 28, 28, 0.08)', borderWidth: 1, borderColor: 'rgba(185, 28, 28, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
  deleteStudentProfileText: { color: '#b91c1c', fontSize: 12, fontWeight: 'bold', fontFamily: 'Tajawal' },

  studentHeaderCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 20, padding: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardStudentName: { color: '#3f6212', fontSize: 18, fontWeight: '900', marginBottom: 4, fontFamily: 'Tajawal' },
  cardStudentMeta: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 10, fontFamily: 'Tajawal' },

  yearAndSerialRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 4, width: '100%', justifyContent: 'center' },
  yearInputRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: '#fdfbfb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)' },
  yearInputLabel: { color: '#3f6212', fontSize: 12, fontWeight: 'bold', fontFamily: 'Tajawal' },
  yearInputField: { width: 90, height: 34, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', color: '#1a2e05', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },

  addSubjectRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
  subInput: { flex: 1, height: 46, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 14, paddingHorizontal: 14, color: '#1a2e05', fontSize: 13, textAlign: 'right', fontFamily: 'Tajawal', fontWeight: '600' },
  addSubBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#3f6212', paddingHorizontal: 16, borderRadius: 14, justifyContent: 'center', gap: 6, height: 46, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  addSubText: { color: '#fff', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },

  subjectBox: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)', borderRadius: 20, overflow: 'hidden', marginBottom: 16, shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  subBoxHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  subBoxTitle: { color: '#fff', fontSize: 14, fontWeight: '900', fontFamily: 'Tajawal' },
  
  subScrollRow: { flexDirection: 'row-reverse', gap: 12, padding: 14, alignItems: 'center' },

  inputFieldBox: { width: 85, backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 14, padding: 10, alignItems: 'center' },
  fLabel: { color: '#3f6212', fontSize: 12, fontWeight: '900', marginBottom: 8, fontFamily: 'Tajawal' },
  fInput: { width: '100%', height: 40, backgroundColor: '#ffffff', borderRadius: 10, color: '#1a2e05', textAlign: 'center', fontSize: 15, fontWeight: 'bold', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', fontFamily: 'Tajawal' },

  calcFieldBox: { width: 95, backgroundColor: 'rgba(63, 98, 18, 0.06)', borderWidth: 1, borderColor: 'rgba(63, 98, 18, 0.25)', borderRadius: 14, padding: 10, alignItems: 'center' },
  fLabelCalc: { color: '#3f6212', fontSize: 12, fontWeight: '900', marginBottom: 8, fontFamily: 'Tajawal' },
  fValCalc: { color: '#3f6212', fontSize: 15, fontWeight: '900', fontFamily: 'Tajawal' },

  finalFieldBox: { width: 105, backgroundColor: 'rgba(56, 142, 60, 0.1)', borderWidth: 1, borderColor: 'rgba(56, 142, 60, 0.35)', borderRadius: 14, padding: 10, alignItems: 'center' },
  fLabelFinal: { color: '#15803d', fontSize: 12, fontWeight: '900', marginBottom: 8, fontFamily: 'Tajawal' },
  fValFinal: { color: '#15803d', fontSize: 16, fontWeight: '900', fontFamily: 'Tajawal' },

  exportCardBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, gap: 8, marginTop: 10, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  exportCardBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 46, 5, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContentBox: { width: '100%', maxWidth: 340, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 30 },
  modalHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(101, 163, 13, 0.15)', paddingBottom: 10 },
  modalTitle: { color: '#1a2e05', fontSize: 15, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  modalForm: { gap: 10 },
  modalInput: { height: 46, backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 14, paddingHorizontal: 14, color: '#1a2e05', fontSize: 13, textAlign: 'right', fontFamily: 'Tajawal', fontWeight: '600' },
  modalSubmitBtn: { backgroundColor: '#3f6212', height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 6, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  modalSubmitText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' },

  modalColorsList: { gap: 8 },
  modalColorItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#fdfbfb', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.15)', gap: 10 },
  activeModalColorItem: { backgroundColor: 'rgba(101, 163, 13, 0.12)', borderColor: '#3f6212' },
  modalColorText: { color: '#334155', fontSize: 13, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  activeModalColorText: { color: '#3f6212' }
});