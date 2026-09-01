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
  { label: 'الأميري (Amiri)', value: 'Amiri' }
];

const borderThemeOptions = [
  { label: 'أزرق عصري (Sky Blue)', value: '#0284c7' },
  { label: 'أخضر سوقي (Emerald)', value: '#059669' },
  { label: 'بنفسجي ملكي (Purple)', value: '#7c3aed' },
  { label: 'ذهبي فاخر (Gold)', value: '#d97706' }
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
        <Ionicons name="chevron-down" size={16} color="#38bdf8" />
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
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color="#38bdf8" />}
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

export default function GroceryPlannerMaker() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [meta, setMeta] = useState({
    storeName: 'قائمة الاحتياجات والمقاضي المنزلية',
    title: 'مستلزمات شهر مايو 2026',
    date: 'تاريخ الإصدار: 2026/05/01',
    primaryColor: '#0284c7',
    font: 'Cairo'
  });

  const [items, setItems] = useState([
    { id: '1', name: 'طماطم وبصل وبطاطس', category: 'خضار وفواكه', qty: '10 كجم', notes: 'طازج' },
    { id: '2', name: 'حليب طويل الأجل وجبن أبيض', category: 'ألبان وأجبان', qty: '2 كرتون', notes: 'قليل الدسم' },
    { id: '3', name: 'لحم مفروم ودجاج مجمد', category: 'لحوم ودواجن', qty: '4 كجم', notes: 'مغلف' },
    { id: '4', name: 'أرز بسمتي ومكرونة وزيت طهي', category: 'مواد جافة', qty: 'متنوع', notes: 'عروض السوبرماركت' },
    { id: '5', name: 'منظف أطباق وصابون غسيل ومطهرات', category: 'منظفات منزلية', qty: 'حجم عائلي', notes: 'ضروري' },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('خضار وفواكه');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const addItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة اسم الصنف على الأقل.');
      return;
    }
    if (items.length >= 35) {
      Alert.alert('تنبيه', 'الحد الأقصى المسموح به لضمان الطباعة في صفحة A4 واحدة هو 35 صنفاً.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: newItemName,
        category: newItemCategory || 'عام',
        qty: newItemQty || '1',
        notes: newItemNotes || '---'
      }
    ]);
    setNewItemName('');
    setNewItemQty('');
    setNewItemNotes('');
  };

  const removeItem = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
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
            @page { size: A4 portrait; margin: 8mm; }
            body { font-family: '${meta.font}', sans-serif; color: #0f172a; margin: 0; background: #fff; -webkit-print-color-adjust: exact; font-size: 9.5px; }
            
            .header-container {
              text-align: center;
              border-bottom: 2px solid ${meta.primaryColor};
              padding-bottom: 6px;
              margin-bottom: 10px;
            }
            .store-name { font-size: 15px; font-weight: 900; color: ${meta.primaryColor}; margin: 0; }
            .exam-title { font-size: 11px; font-weight: 700; color: #1e293b; margin: 2px 0; }
            .meta-subtitle { font-size: 9px; font-weight: 600; color: #64748b; margin: 0; }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
              table-layout: fixed;
            }

            th, td {
              border: 1px solid #cbd5e1;
              padding: 4px 6px;
              text-align: center;
              font-size: 9.5px;
              word-wrap: break-word;
              line-height: 1.2;
            }

            th {
              background-color: ${meta.primaryColor};
              color: #ffffff;
              font-weight: 900;
              font-size: 10px;
              padding: 5px 6px;
            }

            tr:nth-child(even) {
              background-color: #f8fafc;
            }

            .checkbox-cell {
              width: 25px;
              text-align: center;
            }
            .checkbox-box {
              width: 12px;
              height: 12px;
              border: 1.5px solid #64748b;
              border-radius: 2px;
              display: inline-block;
            }

            .notes-box {
              margin-top: 10px;
              border: 1px dashed ${meta.primaryColor};
              border-radius: 5px;
              padding: 6px 10px;
              background-color: ${meta.primaryColor}08;
            }
            .notes-title { font-size: 9.5px; font-weight: 900; color: ${meta.primaryColor}; margin: 0 0 3px 0; }
            .notes-text { font-size: 8.5px; color: #334155; margin: 0; }

            .signatures {
              margin-top: 15px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              font-weight: bold;
              color: #1e293b;
            }
            .sig-box { text-align: center; width: 35%; border-top: 1px solid #94a3b8; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="store-name">${meta.storeName}</div>
            <div class="exam-title">${meta.title}</div>
            <div class="meta-subtitle">${meta.date}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 8%;">✔</th>
                <th style="width: 32%;">اسم الصنف / المادة</th>
                <th style="width: 22%;">القسم / الفئة</th>
                <th style="width: 18%;">الكمية</th>
                <th style="width: 20%;">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td class="checkbox-cell"><span class="checkbox-box"></span></td>
                  <td style="font-weight: 900; text-align: right; padding-right: 8px;">${item.name || '---'}</td>
                  <td style="font-weight: 700; color: ${meta.primaryColor};">${item.category || '---'}</td>
                  <td style="font-weight: 700;">${item.qty || '---'}</td>
                  <td style="font-weight: 600; font-size: 8.5px;">${item.notes || '---'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="notes-box">
            <div class="notes-title">🛒 إرشادات التسوق الذكي:</div>
            <p class="notes-text">يرجى التأكد من تاريخ الصلاحية للمنتجات الغذائية الطازجة والمعلبة، ومقارنة العروض قبل الشراء لضمان توفير الميزانية.</p>
          </div>

          <div class="signatures">
            <div class="sig-box">مُعد القائمة</div>
            <div class="sig-box">المسؤول عن التسوق والصرف</div>
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      
      {/* إعدادات الترويسة والثيم */}
      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconBox}><Ionicons name="cart-outline" size={18} color="#38bdf8" /></View>
          <Text style={styles.cardTitle}>إعدادات قائمة التسوق </Text>
        </View>

        <DropdownSelector label="لون الثيم الرسمي:" value={meta.primaryColor} options={borderThemeOptions} isOpen={activeDropdown === 'theme'} onToggle={() => toggleDropdown('theme')} onSelect={v => setMeta({ ...meta, primaryColor: v })} />
        <DropdownSelector label="نوع الخط المعتمد:" value={meta.font} options={arabicFonts} isOpen={activeDropdown === 'font'} onToggle={() => toggleDropdown('font')} onSelect={v => setMeta({ ...meta, font: v })} />

        <TextInput style={styles.input} placeholder="عنوان القائمة الرئيسي (مثال: متطلبات البيت)..." placeholderTextColor="#64748b" value={meta.storeName} onChangeText={t => setMeta({ ...meta, storeName: t })} />
        <TextInput style={styles.input} placeholder="وصف الفترة (مثال: مقاضي الأسبوع الأول)..." placeholderTextColor="#64748b" value={meta.title} onChangeText={t => setMeta({ ...meta, title: t })} />
        <TextInput style={styles.input} placeholder="التاريخ أو الملاحظة العلوية..." placeholderTextColor="#64748b" value={meta.date} onChangeText={t => setMeta({ ...meta, date: t })} />
      </BlurView>

      {/* إضافة أصناف جديدة */}
      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconBox}><Ionicons name="add-circle-outline" size={18} color="#38bdf8" /></View>
          <Text style={styles.cardTitle}>إضافة صنف جديد للقائمة ({items.length} / 35)</Text>
        </View>

        <TextInput style={styles.input} placeholder="اسم الصنف (مثال: حليب، طماطم، مسحوق غسيل)..." placeholderTextColor="#64748b" value={newItemName} onChangeText={setNewItemName} />
        
        <View style={styles.rowInputs}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="القسم (مثال: خضار، لحوم)..." placeholderTextColor="#64748b" value={newItemCategory} onChangeText={setNewItemCategory} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="الكمية (مثال: 3 كيلو، علبة)..." placeholderTextColor="#64748b" value={newItemQty} onChangeText={setNewItemQty} />
        </View>

        <TextInput style={styles.input} placeholder="ملاحظات اختيارية (مثال: طازج، نوع محدد)..." placeholderTextColor="#64748b" value={newItemNotes} onChangeText={setNewItemNotes} />

        <TouchableOpacity activeOpacity={0.85} onPress={addItem} style={styles.addBtnTouch}>
          <LinearGradient colors={['#0284c7', '#0369a1', '#075985']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.addBtn}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>إضافة الصنف إلى الجدول </Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

      {/* قائمة الأصناف الحالية */}
      <BlurView intensity={50} tint="dark" style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconBox}><Ionicons name="list-outline" size={18} color="#38bdf8" /></View>
          <Text style={styles.cardTitle}>الأصناف المسجلة ({items.length})</Text>
        </View>

        {items.map((item, index) => (
          <View key={item.id} style={styles.rowItemCard}>
            <View style={styles.rowNumberBadge}><Text style={styles.rowNumberText}>{index + 1}</Text></View>
            <View style={{ flex: 1, gap: 6 }}>
              <TextInput
                style={styles.inputCell}
                placeholder="اسم الصنف..."
                placeholderTextColor="#64748b"
                value={item.name}
                onChangeText={t => updateItem(item.id, 'name', t)}
              />
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 36, fontSize: 11 }]} placeholder="القسم..." placeholderTextColor="#64748b" value={item.category} onChangeText={t => updateItem(item.id, 'category', t)} />
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 36, fontSize: 11 }]} placeholder="الكمية..." placeholderTextColor="#64748b" value={item.qty} onChangeText={t => updateItem(item.id, 'qty', t)} />
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 36, fontSize: 11 }]} placeholder="ملاحظات..." placeholderTextColor="#64748b" value={item.notes} onChangeText={t => updateItem(item.id, 'notes', t)} />
              </View>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={16} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        ))}
      </BlurView>

      <View style={{height: 70}} />

      {/* الأزرار العائمة السفلية */}
      <BlurView intensity={60} tint="dark" style={styles.floatingBarContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.previewBtn} onPress={handlePreview}>
          <Ionicons name="eye-outline" size={22} color="#38bdf8" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.printBtn} onPress={handlePrint}>
          <Ionicons name="print-outline" size={22} color="#38bdf8" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.exportTouchWrapper} onPress={handleExport} disabled={isGenerating}>
          <LinearGradient colors={['#0284c7', '#0369a1', '#075985']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.exportBtn}>
            {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <View style={styles.exportIconBadge}>
                  <Ionicons name="cloud-download-outline" size={18} color="#ffffff" />
                </View>
                <Text style={styles.exportBtnText}>تصدير والتحميل   A4 PDF</Text>
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
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(56, 189, 248, 0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)' },
  cardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  subLabel: { color: '#94a3b8', fontSize: 12, textAlign: 'right', marginBottom: 6, fontWeight: '700' },
  input: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, paddingHorizontal: 16, height: 48, color: '#fff', fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', marginBottom: 12, textAlign: 'right' },
  rowInputs: { flexDirection: 'row-reverse', gap: 10, marginBottom: 4 },

  addBtnTouch: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  addBtn: { height: 46, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  rowItemCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  rowNumberBadge: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(56, 189, 248, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  rowNumberText: { color: '#38bdf8', fontSize: 11, fontWeight: '900' },
  inputCell: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, paddingHorizontal: 12, height: 36, color: '#fff', fontSize: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', textAlign: 'right', fontWeight: 'bold' },
  deleteBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(244, 63, 94, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.35)' },

  dropdownWrapper: { marginBottom: 12 },
  dropdownHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  dropdownHeaderInner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flex: 1 },
  dropdownHeaderText: { color: '#f8fafc', fontSize: 13, textAlign: 'right', fontWeight: '600' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 360, backgroundColor: '#0f172a', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row-reverse', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  dropdownItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  dropdownItemSelected: { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
  dropdownItemText: { color: '#cbd5e1', fontSize: 13, textAlign: 'right', fontWeight: '500' },
  dropdownItemTextSelected: { color: '#38bdf8', fontWeight: 'bold' },

  floatingBarContainer: { position: 'absolute', bottom: 12, left: 16, right: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 10, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(15, 23, 42, 0.85)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15 },
  previewBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(56, 189, 248, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  printBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(56, 189, 248, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  exportTouchWrapper: { flex: 1, height: 48, borderRadius: 16, overflow: 'hidden' },
  exportBtn: { flex: 1, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 10 },
  exportIconBadge: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  exportBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' }
});