import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { setExamStore } from '../../utils/examStore';
import { useSubscription } from '../context/SubscriptionContext';

const arabicFonts = [
  { label: 'كايرو (Cairo - موصى به)', value: 'Cairo' },
  { label: 'تجوال (Tajawal)', value: 'Tajawal' },
  { label: 'العربي التقليدي (Traditional Arabic)', value: 'Traditional Arabic' },
  { label: 'الأميري (Amiri)', value: 'Amiri' },
  { label: 'شنجا (Changa)', value: 'Changa' }
];

const borderThemeOptions = [
  { label: 'ذهبي فاخر (Gold)', value: '#d97706' },
  { label: 'أزرق رسمي (Blue)', value: '#2563eb' },
  { label: 'أخضر أكاديمي (Emerald)', value: '#059669' },
  { label: 'بنفسجي ملكي (Purple)', value: '#7c3aed' }
];

const DropdownSelector = ({ label, value, options, onSelect, isOpen, onToggle }) => {
  const selectedOpt = options.find(o => o.value === value) || options[0];
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
        <Ionicons name="chevron-down" size={16} color="#fbbf24" />
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
                  {options.map((opt) => {
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
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color="#fbbf24" />}
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

export default function DutyRosterMaker() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [meta, setMeta] = useState({
    school: 'مدرسة المستقبل الثانوية النموذجية',
    title: 'جدول المناوبات والخفارات المدرسية',
    month: 'شهر مايو 2026',
    primaryColor: '#d97706',
    font: 'Cairo',
    showFourthCol: true,
    fourthColTitle: 'المنطقة / الصفوف'
  });

  const [rows, setRows] = useState([
    { id: '1', dayDate: 'السبت 2026/05/01', staff1: 'أ. أحمد علي', staff2: 'أ. محمد حسن', extra: 'الساحة الشرقية' },
    { id: '2', dayDate: 'الأحد 2026/05/02', staff1: 'أ. خالد سعيد', staff2: 'أ. عمر إبراهيم', extra: 'البوابة الرئيسية' },
    { id: '3', dayDate: 'الإثنين 2026/05/03', staff1: 'أ. إبراهيم محمود', staff2: 'أ. علي سالم', extra: 'المقصف المدرسي' },
  ]);

  const [contacts, setContacts] = useState([
    { id: 'c1', name: 'أ. أحمد علي (مسؤول المناوبة)', phone: '0501234567' },
    { id: 'c2', name: 'أ. خالد سعيد (الخفارة اليومية)', phone: '0507654321' }
  ]);

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const addRow = () => {
    if (rows.length >= 31) {
      Alert.alert('تنبيه', 'الحد الأقصى للجدول هو 31 صفاً لشهر كامل.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRows([
      ...rows,
      {
        id: Date.now().toString(),
        dayDate: `اليوم ${rows.length + 1}`,
        staff1: '',
        staff2: '',
        extra: ''
      }
    ]);
  };

  const removeRow = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addContact = () => {
    if (!newContactName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContacts([...contacts, { id: 'c_' + Date.now(), name: newContactName, phone: newContactPhone || '---' }]);
    setNewContactName('');
    setNewContactPhone('');
  };

  const removeContact = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const toggleDropdown = (key) => setActiveDropdown(activeDropdown === key ? null : key);

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;700&display=swap');
            @page { size: A4 portrait; margin: 6mm; }
            body { font-family: '${meta.font}', sans-serif; color: #0f172a; margin: 0; background: #fff; -webkit-print-color-adjust: exact; font-size: 8.5px; }
            
            .header-container {
              text-align: center;
              border-bottom: 1.5px solid ${meta.primaryColor};
              padding-bottom: 3px;
              margin-bottom: 5px;
            }
            .school-name { font-size: 13px; font-weight: 900; color: ${meta.primaryColor}; margin: 0; }
            .exam-title { font-size: 10px; font-weight: 700; color: #1e293b; margin: 1px 0; }
            .meta-subtitle { font-size: 8.5px; font-weight: 600; color: #64748b; margin: 0; }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 2px;
              table-layout: fixed;
            }

            th, td {
              border: 1px solid #cbd5e1;
              padding: 2px 4px;
              text-align: center;
              font-size: 8.5px;
              word-wrap: break-word;
              line-height: 1.15;
            }

            th {
              background-color: ${meta.primaryColor};
              color: #ffffff;
              font-weight: 900;
              font-size: 9px;
              padding: 2.5px 4px;
            }

            tr:nth-child(even) {
              background-color: #f8fafc;
            }

            .contacts-section {
              margin-top: 6px;
              border: 1px solid ${meta.primaryColor};
              border-radius: 4px;
              padding: 4px 8px;
              background-color: ${meta.primaryColor}08;
            }
            .contacts-title { font-size: 9px; font-weight: 900; color: ${meta.primaryColor}; margin: 0 0 3px 0; }
            .contacts-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
            }
            .contact-item {
              font-size: 8px;
              background: #fff;
              border: 1px solid #cbd5e1;
              padding: 2px 6px;
              border-radius: 3px;
              flex: 1;
              min-width: 40%;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="school-name">${meta.school}</div>
            <div class="exam-title">${meta.title}</div>
            <div class="meta-subtitle">${meta.month}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25%;">اليوم والتاريخ</th>
                <th style="width: ${meta.showFourthCol ? '25%' : '37.5%'};">المناوب الأول</th>
                <th style="width: ${meta.showFourthCol ? '25%' : '37.5%'};">المناوب الثاني</th>
                ${meta.showFourthCol ? `<th style="width: 25%;">${meta.fourthColTitle}</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td style="font-weight: 900; background-color: #f1f5f9;">${r.dayDate || '---'}</td>
                  <td style="font-weight: 700;">${r.staff1 || '---'}</td>
                  <td style="font-weight: 700;">${r.staff2 || '---'}</td>
                  ${meta.showFourthCol ? `<td style="font-weight: 600;">${r.extra || '---'}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${contacts.length > 0 ? `
            <div class="contacts-section">
              <div class="contacts-title">📞 أسماء وأرقام هواتف المناوبين وطوارئ المدرسة:</div>
              <div class="contacts-grid">
                ${contacts.map(c => `
                  <div class="contact-item">
                    <b>${c.name}</b>: <span style="direction: ltr; display: inline-block;">${c.phone}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      
      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconBox}><Ionicons name="shield-checkmark-outline" size={18} color="#fbbf24" /></View>
          <Text style={styles.cardTitle}>إعدادات جدول المناوبات والخفارات</Text>
        </View>

        <DropdownSelector label="لون الثيم الرسمي:" value={meta.primaryColor} options={borderThemeOptions} isOpen={activeDropdown === 'theme'} onToggle={() => toggleDropdown('theme')} onSelect={v => setMeta({ ...meta, primaryColor: v })} />
        <DropdownSelector label="نوع الخط المعتمد:" value={meta.font} options={arabicFonts} isOpen={activeDropdown === 'font'} onToggle={() => toggleDropdown('font')} onSelect={v => setMeta({ ...meta, font: v })} />

        <TextInput style={styles.input} placeholder="اسم المدرسة..." placeholderTextColor="#64748b" value={meta.school} onChangeText={t => setMeta({ ...meta, school: t })} />
        <TextInput style={styles.input} placeholder="عنوان الجدول (مثال: جدول المناوبات المدرسية)..." placeholderTextColor="#64748b" value={meta.title} onChangeText={t => setMeta({ ...meta, title: t })} />
        
        <View style={styles.rowInputs}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="الشهر / الفصل الدراسي..." placeholderTextColor="#64748b" value={meta.month} onChangeText={t => setMeta({ ...meta, month: t })} />
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="عنوان العمود الرابع (اختياري)..." placeholderTextColor="#64748b" value={meta.fourthColTitle} onChangeText={t => setMeta({ ...meta, fourthColTitle: t })} />
        </View>
      </BlurView>

      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconBox}><Ionicons name="list-outline" size={18} color="#fbbf24" /></View>
          <Text style={styles.cardTitle}>صفوف الجدول والأيام ({rows.length} / 31)</Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={addRow} style={styles.addBtnTouch}>
          <LinearGradient colors={['#d97706', '#b45309', '#92400e']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.addBtn}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.addBtnText}>+ إضافة يوم / صف جديد للجدول</Text>
          </LinearGradient>
        </TouchableOpacity>

        {rows.map((row, index) => (
          <View key={row.id} style={styles.rowItemCard}>
            <View style={styles.rowNumberBadge}><Text style={styles.rowNumberText}>{index + 1}</Text></View>
            <View style={{ flex: 1, gap: 8 }}>
              <TextInput
                style={styles.inputCell}
                placeholder="اليوم والتاريخ (مثال: السبت 2026/05/01)..."
                placeholderTextColor="#64748b"
                value={row.dayDate}
                onChangeText={t => updateRow(row.id, 'dayDate', t)}
              />
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 38, fontSize: 12 }]} placeholder="اسم المناوب الأول..." placeholderTextColor="#64748b" value={row.staff1} onChangeText={t => updateRow(row.id, 'staff1', t)} />
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 38, fontSize: 12 }]} placeholder="اسم المناوب الثاني..." placeholderTextColor="#64748b" value={row.staff2} onChangeText={t => updateRow(row.id, 'staff2', t)} />
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 38, fontSize: 12 }]} placeholder={meta.fourthColTitle || 'المنطقة...'} placeholderTextColor="#64748b" value={row.extra} onChangeText={t => updateRow(row.id, 'extra', t)} />
              </View>
            </View>
            <TouchableOpacity onPress={() => removeRow(row.id)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={16} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        ))}
      </BlurView>

      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconBox}><Ionicons name="call-outline" size={18} color="#fbbf24" /></View>
          <Text style={styles.cardTitle}>أرقام هواتف وطوارئ المناوبين ({contacts.length})</Text>
        </View>

        <View style={styles.rowInputs}>
          <TextInput style={[styles.input, { flex: 2, marginBottom: 0, height: 42 }]} placeholder="اسم المناوب أو المسؤول..." placeholderTextColor="#64748b" value={newContactName} onChangeText={setNewContactName} />
          <TextInput style={[styles.input, { flex: 1.5, marginBottom: 0, height: 42 }]} placeholder="رقم الهاتف..." placeholderTextColor="#64748b" value={newContactPhone} onChangeText={setNewContactPhone} />
          <TouchableOpacity activeOpacity={0.8} onPress={addContact} style={styles.smallAddBtn}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>إضافة</Text>
          </TouchableOpacity>
        </View>

        {contacts.map((c) => (
          <View key={c.id} style={styles.contactItemRow}>
            <View style={{ flex: 1, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.contactNameText}>{c.name}</Text>
              <Text style={styles.contactPhoneText}>{c.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => removeContact(c.id)}>
              <Ionicons name="close-circle" size={18} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        ))}
      </BlurView>

      <View style={{height: 70}} />

      <BlurView intensity={60} tint="dark" style={styles.floatingBarContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.previewBtn} onPress={handlePreview}>
          <Ionicons name="eye-outline" size={22} color="#fbbf24" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.printBtn} onPress={handlePrint}>
          <Ionicons name="print-outline" size={22} color="#fbbf24" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.exportTouchWrapper} onPress={handleExport} disabled={isGenerating}>
          <LinearGradient colors={['#d97706', '#b45309', '#92400e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.exportBtn}>
            {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <View style={styles.exportIconBadge}>
                  <Ionicons name="cloud-download-outline" size={18} color="#ffffff" />
                </View>
                <Text style={styles.exportBtnText}>تصدير وتحميل جدول المناوبات A4 PDF</Text>
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
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(251, 191, 36, 0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.25)' },
  cardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  subLabel: { color: '#94a3b8', fontSize: 12, textAlign: 'right', marginBottom: 6, fontWeight: '700' },
  input: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, paddingHorizontal: 16, height: 48, color: '#fff', fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', marginBottom: 12, textAlign: 'right' },
  rowInputs: { flexDirection: 'row-reverse', gap: 10, marginBottom: 4 },

  addBtnTouch: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  addBtn: { height: 46, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  rowItemCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  rowNumberBadge: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(251, 191, 36, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
  rowNumberText: { color: '#fbbf24', fontSize: 11, fontWeight: '900' },
  inputCell: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, paddingHorizontal: 12, height: 38, color: '#fff', fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', textAlign: 'right', fontWeight: 'bold' },
  deleteBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(244, 63, 94, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.35)' },

  smallAddBtn: { backgroundColor: '#d97706', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, height: 42, borderRadius: 12, gap: 4 },
  contactItemRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  contactNameText: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
  contactPhoneText: { color: '#fbbf24', fontSize: 12, fontWeight: 'bold' },

  dropdownWrapper: { marginBottom: 12 },
  dropdownHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  dropdownHeaderInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flex: 1 },
  dropdownHeaderText: { color: '#f8fafc', fontSize: 13, textAlign: 'right', fontWeight: '600' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 360, backgroundColor: '#0f172a', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)', padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  dropdownItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  dropdownItemSelected: { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
  dropdownItemText: { color: '#cbd5e1', fontSize: 13, textAlign: 'right', fontWeight: '500' },
  dropdownItemTextSelected: { color: '#fbbf24', fontWeight: 'bold' },

  floatingBarContainer: { position: 'absolute', bottom: 12, left: 16, right: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 10, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(15, 23, 42, 0.85)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15 },
  previewBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(251, 191, 36, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
  printBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(251, 191, 36, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
  exportTouchWrapper: { flex: 1, height: 48, borderRadius: 16, overflow: 'hidden' },
  exportBtn: { flex: 1, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 10 },
  exportIconBadge: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  exportBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' }
});