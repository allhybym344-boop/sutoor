import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { setExamStore } from '../utils/examStore';
import { useSubscription } from './context/SubscriptionContext';

const arabicFonts = [
  { label: 'كايرو (Cairo - موصى به)', value: 'Cairo' },
  { label: 'تجوال (Tajawal)', value: 'Tajawal' },
  { label: 'الأميري (Amiri)', value: 'Amiri' }
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

export default function IdCardsMaker() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [meta, setMeta] = useState({
    school: 'مدرسة النهرين الابتدائية',
    academicYear: 'العام الدراسي 2026/2025',
    primaryColor: '#3f6212',
    font: 'Cairo'
  });

  const [cards, setCards] = useState([
    { id: '1', fullName: 'محمد مصطفى خالد', role: 'الصف السادس الابتدائي', idNum: '20261001', blood: 'O+', imageBase64: null as string | null },
    { id: '2', fullName: 'فاطمة مصطفى خالد', role: 'الصف الرابع الابتدائي', idNum: '20261002', blood: 'A+', imageBase64: null as string | null }
  ]);

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newIdNum, setNewIdNum] = useState('');
  const [newBlood, setNewBlood] = useState('O+');
  const [newImage, setNewImage] = useState<string | null>(null);

  const pickStudentImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      setNewImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const addCard = () => {
    if (!newName.trim() || !newIdNum.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCards([...cards, {
      id: 'c_' + Date.now(),
      fullName: newName,
      role: newRole || 'طالب/طالبة',
      idNum: newIdNum,
      blood: newBlood || 'O+',
      imageBase64: newImage
    }]);
    setNewName('');
    setNewRole('');
    setNewIdNum('');
    setNewImage(null);
  };

  const removeCard = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCards(cards.filter(c => c.id !== id));
  };

  const toggleDropdown = (key: string) => setActiveDropdown(activeDropdown === key ? null : key);

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;700&display=swap');
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: '${meta.font}', sans-serif; color: #1a2e05; margin: 0; background: #fff; -webkit-print-color-adjust: exact; }
            
            .grid {
              display: flex;
              flex-wrap: wrap;
              gap: 10mm;
              justify-content: center;
            }

            .card {
              width: 85mm;
              height: 54mm;
              border: 1.5px dashed #b7d38d;
              border-radius: 4mm;
              padding: 4mm;
              box-sizing: border-box;
              background: #fff;
              position: relative;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
            }

            .card-header {
              background-color: ${meta.primaryColor};
              color: #ffffff;
              padding: 2mm 3mm;
              border-radius: 2mm;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .school-title { font-size: 10px; font-weight: 900; margin: 0; }
            .year-title { font-size: 8px; font-weight: 600; opacity: 0.9; }

            .card-body {
              display: flex;
              gap: 3mm;
              align-items: center;
              margin-top: 2mm;
            }

            .avatar-box {
              width: 18mm;
              height: 22mm;
              border: 1px solid #b7d38d;
              border-radius: 2mm;
              background: #fdfbfb;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #3f6212;
              font-weight: bold;
              text-align: center;
            }
            .avatar-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .info-box {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 1mm;
            }

            .student-name { font-size: 12px; font-weight: 900; color: #1a2e05; margin: 0; }
            .student-role { font-size: 9.5px; font-weight: 700; color: ${meta.primaryColor}; margin: 0; }
            .student-detail { font-size: 9px; color: #334155; margin: 0; }

            .card-footer {
              border-top: 1px solid #b7d38d;
              padding-top: 1.5mm;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 8px;
              color: #3f6212;
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${cards.map(c => `
              <div class="card">
                <div>
                  <div class="card-header">
                    <span class="school-title">${meta.school}</span>
                    <span class="year-title">${meta.academicYear}</span>
                  </div>
                  <div class="card-body">
                    <div class="avatar-box">
                      ${c.imageBase64 ? `<img src="${c.imageBase64}" />` : 'صورة'}
                    </div>
                    <div class="info-box">
                      <div class="student-name">${c.fullName}</div>
                      <div class="student-role">${c.role}</div>
                      <div class="student-detail">الرقم التعريفي: <b>${c.idNum}</b></div>
                      <div class="student-detail">فصيلة الدم: <b>${c.blood}</b></div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <span>التوقيع والختم المعتمد</span>
                  <span>[ QR CODE ]</span>
                </div>
              </div>
            `).join('')}
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
            <View style={styles.iconBox}><Ionicons name="id-card-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>إعدادات بطاقات الهوية المدرسية</Text>
          </View>

          <DropdownSelector label="لون الثيم الرسمي:" value={meta.primaryColor} options={borderThemeOptions} isOpen={activeDropdown === 'theme'} onToggle={() => toggleDropdown('theme')} onSelect={(v: any) => setMeta({ ...meta, primaryColor: v })} />
          <DropdownSelector label="نوع الخط المعتمد:" value={meta.font} options={arabicFonts} isOpen={activeDropdown === 'font'} onToggle={() => toggleDropdown('font')} onSelect={(v: any) => setMeta({ ...meta, font: v })} />

          <TextInput style={styles.input} placeholder="اسم المدرسة..." placeholderTextColor="#65a30d" value={meta.school} onChangeText={t => setMeta({ ...meta, school: t })} textAlign="right" />
          <TextInput style={styles.input} placeholder="العام الدراسي (مثال: 2026/2025)..." placeholderTextColor="#65a30d" value={meta.academicYear} onChangeText={t => setMeta({ ...meta, academicYear: t })} textAlign="right" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="person-add-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>إضافة بطاقة جديدة</Text>
          </View>

          <TextInput style={styles.input} placeholder="الاسم الرباعي للطالب أو المعلم..." placeholderTextColor="#65a30d" value={newName} onChangeText={setNewName} textAlign="right" />
          <TextInput style={styles.input} placeholder="الصف أو المسمى الوظيفي..." placeholderTextColor="#65a30d" value={newRole} onChangeText={setNewRole} textAlign="right" />
          
          <View style={styles.rowInputs}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="الرقم التعريفي..." placeholderTextColor="#65a30d" value={newIdNum} onChangeText={setNewIdNum} textAlign="right" />
            <TextInput style={[styles.input, { width: 90, marginBottom: 0, textAlign: 'center' }]} placeholder="الدم" placeholderTextColor="#65a30d" value={newBlood} onChangeText={setNewBlood} />
          </View>

          <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={[styles.imagePickBtn, { borderColor: newImage ? '#3f6212' : 'rgba(63, 98, 18, 0.3)' }]} onPress={pickStudentImage}>
              <Ionicons name={newImage ? "checkmark-circle" : "image-outline"} size={18} color="#3f6212" />
              <Text style={[styles.imagePickText, { color: '#3f6212' }]}>
                {newImage ? 'تم اختيار الصورة بنجاح (تغيير)' : 'اختر صورة شخصية للبطاقة'}
              </Text>
            </TouchableOpacity>
            {newImage && (
              <Image source={{ uri: newImage }} style={{ width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#3f6212' }} />
            )}
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={addCard} style={[styles.smallAddBtn, { marginTop: 12 }]}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, fontFamily: 'Tajawal' }}>إضافة البطاقة للقائمة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="people-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>قائمة البطاقات المسجلة ({cards.length})</Text>
          </View>

          {cards.map((c, index) => (
            <View key={c.id} style={styles.itemRow}>
              <View style={{ flexDirection: 'row-reverse', gap: 10, alignItems: 'center', flex: 1 }}>
                <View style={styles.rowNumberBadge}><Text style={styles.rowNumberText}>{index + 1}</Text></View>
                {c.imageBase64 ? (
                  <Image source={{ uri: c.imageBase64 }} style={{ width: 36, height: 36, borderRadius: 8 }} />
                ) : null}
                <View>
                  <Text style={styles.itemTitle}>{c.fullName}</Text>
                  <Text style={styles.itemSub}>{c.role} • رقم: {c.idNum}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeCard(c.id)}>
                <Ionicons name="trash-outline" size={18} color="#b91c1c" />
              </TouchableOpacity>
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
                <Text style={styles.exportBtnText}>تصدير وتحميل الكارنيهات A4 PDF</Text>
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
  
  imagePickBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 14, borderWidth: 1, backgroundColor: 'rgba(77, 124, 15, 0.08)', borderColor: 'rgba(77, 124, 15, 0.25)', gap: 8 },
  imagePickText: { fontSize: 12, fontWeight: 'bold', fontFamily: 'Tajawal' },
  smallAddBtn: { backgroundColor: '#3f6212', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 14, gap: 8, shadowColor: '#3f6212', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  
  itemRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 14, marginTop: 8, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.15)' },
  itemTitle: { color: '#1a2e05', fontSize: 13, fontWeight: 'bold', textAlign: 'right', fontFamily: 'Tajawal' },
  itemSub: { color: '#3f6212', fontSize: 11, textAlign: 'right', marginTop: 2, fontFamily: 'Tajawal', fontWeight: '600' },
  rowNumberBadge: { width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(77, 124, 15, 0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.25)' },
  rowNumberText: { color: '#3f6212', fontSize: 11, fontWeight: '900', fontFamily: 'Tajawal' },

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