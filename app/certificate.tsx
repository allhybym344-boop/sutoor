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
  { label: 'إطار ذهبي ملكي فاخر', value: 'gold' },
  { label: 'أزرق ملكي رسمي', value: 'blue' },
  { label: 'أخضر زمردي أكاديمي', value: 'emerald' },
  { label: 'عنابي فاخر', value: 'burgundy' }
];

const sizeOptions = [
  { label: 'صغير (14px)', value: '14px' },
  { label: 'متوسط (18px)', value: '18px' },
  { label: 'كبير (24px)', value: '24px' },
  { label: 'كبير جداً (32px)', value: '32px' },
  { label: 'ضخم (38px)', value: '38px' },
  { label: 'شديد الضخامة (46px)', value: '46px' }
];

const colorOptions = [
  { label: 'زيتوني غامق', value: '#3f6212' },
  { label: 'أسود فحمي', value: '#1a2e05' },
  { label: 'أزرق ملكي عميق', value: '#1e3a8a' },
  { label: 'عنابي داكن', value: '#7f1d1d' },
  { label: 'أخضر زمردي غامق', value: '#065f46' },
  { label: 'بني شوكولاتة', value: '#78350f' },
  { label: 'رمادي صلب', value: '#334155' },
  { label: 'ذهبي ملكي', value: '#b45309' }
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

export default function CertificateMaker() {
  const router = useRouter();
  
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [certData, setCertData] = useState({
    title: 'شهادة شكر وتقدير',
    subtitle: 'تتقدم إدارة المدرسة وجمعية المعلمين بمنح هذه الشهادة إلى الطالب المتفوق:',
    studentName: 'محمد مصطفى خالد',
    reason: 'للدور المتميز والجهود المبذولة في التفوق الدراسي وحصوله على المركز الأول على مستوى الصف في الفصل الدراسي الثاني.',
    schoolName: 'مدرسة النهرين الابتدائية',
    principalName: 'أ. مدير المدرسة',
    teacherName: 'أ. مصطفى خالد',
    date: '2026 / 06 / 15',
    borderTheme: 'gold',
    logoBase64: null as string | null,

    titleFont: 'Cairo',
    titleSize: '38px',
    titleColor: '#b45309',

    subtitleFont: 'Cairo',
    subtitleSize: '17px',
    subtitleColor: '#334155',

    studentFont: 'Cairo',
    studentSize: '34px',
    studentColor: '#1a2e05',

    reasonFont: 'Cairo',
    reasonSize: '16px',
    reasonColor: '#3f6212',

    headerFont: 'Cairo',
    headerSize: '15px',
    headerColor: '#365314',

    footerFont: 'Cairo',
    footerSize: '14px',
    footerColor: '#1a2e05'
  });

  const pickLogoImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      setCertData({ ...certData, logoBase64: `data:image/jpeg;base64,${result.assets[0].base64}` });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const toggleDropdown = (key: string) => setActiveDropdown(activeDropdown === key ? null : key);

  const getBorderCSS = (theme: string) => {
    switch(theme) {
      case 'gold': return '8px double #d97706; outline: 3px solid #fbbf24; outline-offset: -12px;';
      case 'blue': return '8px double #1e3a8a; outline: 3px solid #3b82f6; outline-offset: -12px;';
      case 'emerald': return '8px double #065f46; outline: 3px solid #10b981; outline-offset: -12px;';
      case 'burgundy': return '8px double #7f1d1d; outline: 3px solid #ef4444; outline-offset: -12px;';
      default: return '8px double #d97706; outline: 3px solid #fbbf24; outline-offset: -12px;';
    }
  };

  const getPrimaryColor = (theme: string) => {
    switch(theme) {
      case 'gold': return '#b45309';
      case 'blue': return '#1d4ed8';
      case 'emerald': return '#047857';
      case 'burgundy': return '#991b1b';
      default: return '#b45309';
    }
  };

  const generateHTML = () => {
    const mainColor = getPrimaryColor(certData.borderTheme);
    const borderStyle = getBorderCSS(certData.borderTheme);

    return `
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;700&family=Changa&family=El+Messiri:wght@400;700&display=swap');
            @page { size: A4 landscape; margin: 8mm; }
            body { margin: 0; background: #fff; -webkit-print-color-adjust: exact; }
            
            .certificate-page {
              position: relative;
              width: 281mm;
              height: 194mm;
              box-sizing: border-box;
              border: ${borderStyle};
              padding: 16mm 24mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: linear-gradient(135deg, #fffcf5 0%, #ffffff 50%, #fffcf5 100%);
              overflow: hidden;
            }

            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 110px;
              color: ${mainColor};
              opacity: 0.04;
              font-weight: 900;
              z-index: 0;
              pointer-events: none;
              user-select: none;
              white-space: nowrap;
              text-align: center;
            }

            .header-row {
              position: relative;
              z-index: 1;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-family: '${certData.headerFont}', sans-serif;
              font-weight: 700;
              font-size: ${certData.headerSize};
              color: ${certData.headerColor};
              border-bottom: 2px solid ${mainColor}33;
              padding-bottom: 8px;
            }

            .logo-banner-area {
              position: relative;
              z-index: 1;
              text-align: center;
              margin-top: 4px;
              margin-bottom: -4px;
            }

            .cert-logo-large {
              width: 24mm;
              height: 24mm;
              border-radius: 50%;
              object-fit: cover;
              border: 2px solid ${mainColor};
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              background: #fff;
            }

            .body-content {
              position: relative;
              z-index: 1;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }

            .cert-title {
              font-family: '${certData.titleFont}', sans-serif;
              font-size: ${certData.titleSize};
              font-weight: 900;
              color: ${certData.titleColor};
              letter-spacing: 1px;
              margin: 0;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }

            .cert-subtitle {
              font-family: '${certData.subtitleFont}', sans-serif;
              font-size: ${certData.subtitleSize};
              color: ${certData.subtitleColor};
              font-weight: 700;
              margin: 0;
            }

            .student-name-box {
              font-family: '${certData.studentFont}', sans-serif;
              font-size: ${certData.studentSize};
              font-weight: 900;
              color: ${certData.studentColor};
              border-bottom: 3px solid ${mainColor};
              padding: 4px 35px;
              margin: 4px 0;
              background: ${mainColor}0a;
              border-radius: 8px;
            }

            .cert-reason {
              font-family: '${certData.reasonFont}', sans-serif;
              font-size: ${certData.reasonSize};
              color: ${certData.reasonColor};
              font-weight: 600;
              max-width: 850px;
              line-height: 1.7;
              margin: 0;
            }

            .footer-row {
              position: relative;
              z-index: 1;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 2px solid ${mainColor}33;
              padding-top: 10px;
              font-family: '${certData.footerFont}', sans-serif;
            }

            .signature-box {
              text-align: center;
              font-weight: bold;
              font-size: ${certData.footerSize};
              color: ${certData.footerColor};
              min-width: 220px;
            }

            .signature-line {
              margin-top: 22px;
              border-top: 2px dashed ${mainColor};
              padding-top: 4px;
              font-size: 14px;
              color: #3f6212;
            }
          </style>
        </head>
        <body>
          <div class="certificate-page">
            <div class="watermark">تميز وإبداع</div>

            <div class="header-row">
              <div>${certData.schoolName}</div>
              <div>التاريخ: ${certData.date}</div>
            </div>

            ${certData.logoBase64 ? `
              <div class="logo-banner-area">
                <img src="${certData.logoBase64}" class="cert-logo-large" />
              </div>
            ` : ''}

            <div class="body-content">
              <h1 class="cert-title">${certData.title}</h1>
              <p class="cert-subtitle">${certData.subtitle}</p>
              <div class="student-name-box">${certData.studentName}</div>
              <p class="cert-reason">${certData.reason}</p>
            </div>

            <div class="footer-row">
              <div class="signature-box">
                مدير المدرسة
                <div class="signature-line">${certData.principalName}</div>
              </div>
              <div class="signature-box">
                المعلم المسؤول
                <div class="signature-line">${certData.teacherName}</div>
              </div>
            </div>
          </div>
          ${getWatermarkHTML()}
        </body>
      </html>
    `;
  };

  const handlePreview = () => { 
    setExamStore(generateHTML(), true, getPrimaryColor(certData.borderTheme)); 
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
            <View style={styles.iconBox}><Ionicons name="ribbon-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>إطار وشعار الشهادة العام</Text>
          </View>
          <DropdownSelector label="تصميم الإطار العام:" value={certData.borderTheme} options={borderThemeOptions} isOpen={activeDropdown === 'theme'} onToggle={() => toggleDropdown('theme')} onSelect={(v: any) => setCertData({ ...certData, borderTheme: v })} />
          
          <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 10, alignItems: 'center' }}>
            <TouchableOpacity style={[styles.imagePickBtn, { borderColor: certData.logoBase64 ? '#3f6212' : 'rgba(63, 98, 18, 0.3)' }]} onPress={pickLogoImage}>
              <Ionicons name={certData.logoBase64 ? "checkmark-circle" : "image-outline"} size={18} color={certData.logoBase64 ? '#3f6212' : '#3f6212'} />
              <Text style={[styles.imagePickText, { color: '#3f6212' }]}>
                {certData.logoBase64 ? 'تم إدراج الشعار البارز (تغيير الصورة)' : 'إدراج شعار المدرسة البارز (تحت اسم المدرسة)'}
              </Text>
            </TouchableOpacity>
            {certData.logoBase64 && (
              <Image source={{ uri: certData.logoBase64 }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#3f6212' }} />
            )}
          </View>
        </View>

        {/* 1. أدوات تحكم العنوان الرئيسي */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="text-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>1. أدوات تحكم العنوان الرئيسي</Text>
          </View>
          <TextInput style={styles.input} placeholder="عنوان الشهادة..." placeholderTextColor="#65a30d" value={certData.title} onChangeText={t => setCertData({ ...certData, title: t })} textAlign="right" />
          <View style={styles.rowInputs}>
            <View style={{flex:1}}><DropdownSelector label="الخط:" value={certData.titleFont} options={arabicFonts} isOpen={activeDropdown === 'tFont'} onToggle={() => toggleDropdown('tFont')} onSelect={(v: any) => setCertData({ ...certData, titleFont: v })} /></View>
            <View style={{flex:1}}><DropdownSelector label="الحجم:" value={certData.titleSize} options={sizeOptions} isOpen={activeDropdown === 'tSize'} onToggle={() => toggleDropdown('tSize')} onSelect={(v: any) => setCertData({ ...certData, titleSize: v })} /></View>
          </View>
          <DropdownSelector label="اللون:" value={certData.titleColor} options={colorOptions} isOpen={activeDropdown === 'tCol'} onToggle={() => toggleDropdown('tCol')} onSelect={(v: any) => setCertData({ ...certData, titleColor: v })} />
        </View>

        {/* 2. أدوات تحكم النص التمهيدي */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="document-text-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>2. أدوات تحكم النص التمهيدي</Text>
          </View>
          <TextInput style={styles.input} placeholder="النص التمهيدي..." placeholderTextColor="#65a30d" value={certData.subtitle} onChangeText={t => setCertData({ ...certData, subtitle: t })} textAlign="right" />
          <View style={styles.rowInputs}>
            <View style={{flex:1}}><DropdownSelector label="الخط:" value={certData.subtitleFont} options={arabicFonts} isOpen={activeDropdown === 'subFont'} onToggle={() => toggleDropdown('subFont')} onSelect={(v: any) => setCertData({ ...certData, subtitleFont: v })} /></View>
            <View style={{flex:1}}><DropdownSelector label="الحجم:" value={certData.subtitleSize} options={sizeOptions} isOpen={activeDropdown === 'subSize'} onToggle={() => toggleDropdown('subSize')} onSelect={(v: any) => setCertData({ ...certData, subtitleSize: v })} /></View>
          </View>
          <DropdownSelector label="اللون:" value={certData.subtitleColor} options={colorOptions} isOpen={activeDropdown === 'subCol'} onToggle={() => toggleDropdown('subCol')} onSelect={(v: any) => setCertData({ ...certData, subtitleColor: v })} />
        </View>

        {/* 3. أدوات تحكم اسم الطالب */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="person-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>3. أدوات تحكم اسم الطالب المكرم</Text>
          </View>
          <TextInput style={[styles.input, { fontWeight: 'bold' }]} placeholder="اسم الطالب المكرم..." placeholderTextColor="#65a30d" value={certData.studentName} onChangeText={t => setCertData({ ...certData, studentName: t })} textAlign="right" />
          <View style={styles.rowInputs}>
            <View style={{flex:1}}><DropdownSelector label="الخط:" value={certData.studentFont} options={arabicFonts} isOpen={activeDropdown === 'stdFont'} onToggle={() => toggleDropdown('stdFont')} onSelect={(v: any) => setCertData({ ...certData, studentFont: v })} /></View>
            <View style={{flex:1}}><DropdownSelector label="الحجم:" value={certData.studentSize} options={sizeOptions} isOpen={activeDropdown === 'stdSize'} onToggle={() => toggleDropdown('stdSize')} onSelect={(v: any) => setCertData({ ...certData, studentSize: v })} /></View>
          </View>
          <DropdownSelector label="اللون:" value={certData.studentColor} options={colorOptions} isOpen={activeDropdown === 'stdCol'} onToggle={() => toggleDropdown('stdCol')} onSelect={(v: any) => setCertData({ ...certData, studentColor: v })} />
        </View>

        {/* 4. أدوات تحكم سبب التكريم */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="reader-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>4. أدوات تحكم سبب التكريم والتميز</Text>
          </View>
          <TextInput style={[styles.input, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]} multiline placeholder="سبب التكريم والتميز الدراسي..." placeholderTextColor="#65a30d" value={certData.reason} onChangeText={t => setCertData({ ...certData, reason: t })} textAlign="right" />
          <View style={styles.rowInputs}>
            <View style={{flex:1}}><DropdownSelector label="الخط:" value={certData.reasonFont} options={arabicFonts} isOpen={activeDropdown === 'rsnFont'} onToggle={() => toggleDropdown('rsnFont')} onSelect={(v: any) => setCertData({ ...certData, reasonFont: v })} /></View>
            <View style={{flex:1}}><DropdownSelector label="الحجم:" value={certData.reasonSize} options={sizeOptions} isOpen={activeDropdown === 'rsnSize'} onToggle={() => toggleDropdown('rsnSize')} onSelect={(v: any) => setCertData({ ...certData, reasonSize: v })} /></View>
          </View>
          <DropdownSelector label="اللون:" value={certData.reasonColor} options={colorOptions} isOpen={activeDropdown === 'rsnCol'} onToggle={() => toggleDropdown('rsnCol')} onSelect={(v: any) => setCertData({ ...certData, reasonColor: v })} />
        </View>

        {/* 5. أدوات تحكم رأس الشهادة والتاريخ */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="school-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>5. أدوات تحكم رأس الشهادة والتاريخ</Text>
          </View>
          <TextInput style={styles.input} placeholder="اسم المدرسة أو المؤسسة..." placeholderTextColor="#65a30d" value={certData.schoolName} onChangeText={t => setCertData({ ...certData, schoolName: t })} textAlign="right" />
          <TextInput style={styles.input} placeholder="تاريخ الإصدار..." placeholderTextColor="#65a30d" value={certData.date} onChangeText={t => setCertData({ ...certData, date: t })} textAlign="right" />
          <View style={styles.rowInputs}>
            <View style={{flex:1}}><DropdownSelector label="الخط:" value={certData.headerFont} options={arabicFonts} isOpen={activeDropdown === 'hdrFont'} onToggle={() => toggleDropdown('hdrFont')} onSelect={(v: any) => setCertData({ ...certData, headerFont: v })} /></View>
            <View style={{flex:1}}><DropdownSelector label="الحجم:" value={certData.headerSize} options={sizeOptions} isOpen={activeDropdown === 'hdrSize'} onToggle={() => toggleDropdown('hdrSize')} onSelect={(v: any) => setCertData({ ...certData, headerSize: v })} /></View>
          </View>
          <DropdownSelector label="اللون:" value={certData.headerColor} options={colorOptions} isOpen={activeDropdown === 'hdrCol'} onToggle={() => toggleDropdown('hdrCol')} onSelect={(v: any) => setCertData({ ...certData, headerColor: v })} />
        </View>

        {/* 6. أدوات تحكم التوقيعات والمدير والمعلم */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="create-outline" size={18} color="#3f6212" /></View>
            <Text style={styles.cardTitle}>6. أدوات تحكم التوقيعات والمسؤولين</Text>
          </View>
          <View style={styles.rowInputs}>
            <TextInput style={[styles.input, {flex:1}]} placeholder="اسم مدير المدرسة..." placeholderTextColor="#65a30d" value={certData.principalName} onChangeText={t => setCertData({ ...certData, principalName: t })} textAlign="right" />
            <TextInput style={[styles.input, {flex:1}]} placeholder="اسم المعلم المسؤول..." placeholderTextColor="#65a30d" value={certData.teacherName} onChangeText={t => setCertData({ ...certData, teacherName: t })} textAlign="right" />
          </View>
          <View style={styles.rowInputs}>
            <View style={{flex:1}}><DropdownSelector label="الخط:" value={certData.footerFont} options={arabicFonts} isOpen={activeDropdown === 'ftrFont'} onToggle={() => toggleDropdown('ftrFont')} onSelect={(v: any) => setCertData({ ...certData, footerFont: v })} /></View>
            <View style={{flex:1}}><DropdownSelector label="الحجم:" value={certData.footerSize} options={sizeOptions} isOpen={activeDropdown === 'ftrSize'} onToggle={() => toggleDropdown('ftrSize')} onSelect={(v: any) => setCertData({ ...certData, footerSize: v })} /></View>
          </View>
          <DropdownSelector label="اللون:" value={certData.footerColor} options={colorOptions} isOpen={activeDropdown === 'ftrCol'} onToggle={() => toggleDropdown('ftrCol')} onSelect={(v: any) => setCertData({ ...certData, footerColor: v })} />
        </View>

        <View style={{height: 70}} />

      </ScrollView>

      {/* الأزرار العائمة السفلية */}
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
                <Text style={styles.exportBtnText}>تصدير وتحميل الشهادة PDF</Text>
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