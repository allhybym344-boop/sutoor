import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as IntentLauncher from 'expo-intent-launcher';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function MainMenuScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // فحص التحديثات تلقائياً عند فتح الشاشة الرئيسية
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    if (Platform.OS !== 'android') return; // التحديث التلقائي للـ APK مخصص لأندرويد فقط

    try {
      // استبدل الرابط أدناه برابط ملف version.json الخاص بك على السيرفر
      const response = await fetch('https://yourdomain.com/sutoor/version.json');
      const remoteData = await response.json(); 

      const currentVersionCode = Constants.expoConfig?.android?.versionCode || 1;

      if (remoteData.versionCode > currentVersionCode) {
        Alert.alert(
          "تحديث جديد متوفر لـ سُطور",
          `يوجد إصدار جديد (${remoteData.versionName}) متاح الآن. هل تريد التحديث؟`,
          [
            { text: "لاحقاً", style: "cancel" },
            { 
              text: "تحديث الآن", 
              onPress: () => downloadAndInstallApk(remoteData.apkUrl) 
            }
          ]
        );
      }
    } catch (error) {
      console.log("فشل التحقق من التحديثات:", error);
    }
  };

  const downloadAndInstallApk = async (apkUrl: string) => {
    try {
      Alert.alert("جاري التحميل", "يتم الآن تحميل التحديث في الخلفية...");
      
      const fileUri = FileSystem.documentDirectory + 'sutoor-update.apk';
      
      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`نسبة التحميل: ${(progress * 100).toFixed(0)}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.uri) {
        const contentUri = await FileSystem.getContentUriAsync(result.uri);
        await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل تحميل أو تثبيت التحديث. يرجى التحميل يدويًا.");
      console.error(error);
    }
  };

  const handleNavigate = (path: string) => {
    Haptics.selectionAsync();
    router.push(path as any);
  };

  // الأدوات الأساسية الخاصة بالمنظومة المدرسية الرسمية والسجلات
  const primaryTools = [
    {
      id: 'exam',
      title: 'صانع الاختبارات الوزارية',
      category: 'قسم الاختبارات',
      description: 'تصميم أسئلة واختبارات مدرسية رسمية متكاملة مع الأفرع، التظليل الدقيق، وتصدير PDF احترافي.',
      icon: 'school' as const,
      colors: ['#4d7c0f', '#3f6212'],
      tagColor: '#3f6212',
      tagBg: 'rgba(77, 124, 15, 0.1)',
      path: '/exam',
    },
    {
      id: 'summary',
      title: 'صانع الملخصات العربية',
      category: 'عربي (RTL)',
      description: 'إنشاء ملخصات عربية مخصصة مع تحكم كامل بالخطوط، الإطارات، وتوزيع الرأس والتذييل.',
      icon: 'book' as const,
      colors: ['#4d7c0f', '#365314'],
      tagColor: '#3f6212',
      tagBg: 'rgba(77, 124, 15, 0.1)',
      path: '/summary',
    },
    {
      id: 'exam-schedules',
      title: 'صانع جداول الامتحانات واللجان',
      category: 'جداول رسمية',
      description: 'إنشاء جداول مواعيد الامتحانات والمواد الدراسية وتوزيع القاعات بدقة وتصديرها بصيغة PDF.',
      icon: 'calendar' as const,
      colors: ['#4d7c0f', '#3f6212'],
      tagColor: '#3f6212',
      tagBg: 'rgba(77, 124, 15, 0.1)',
      path: '/exam-schedules',
    },
    {
      id: 'weekly-timetable',
      title: 'صانع جدول الحصص الأسبوعي',
      category: 'جداول مدرسية',
      description: 'تصميم وتنظيم جدول الحصص الأسبوعي للمعلمين والفصول الدراسية بتصدير A4 أفقي دقيق.',
      icon: 'time-outline' as const,
      colors: ['#65a30d', '#3f6212'],
      tagColor: '#4d7c0f',
      tagBg: 'rgba(101, 163, 13, 0.1)',
      path: '/weekly-timetable',
    },
    {
      id: 'id-cards',
      title: 'صانع بطاقات الهوية المدرسية',
      category: 'هويات وكارنيهات',
      description: 'تصميم وطباعة بطاقات الهوية والكارنيهات التعريفية للطلاب والمعلمين بتخطيط شبكي دقيق A4.',
      icon: 'id-card-outline' as const,
      colors: ['#4d7c0f', '#365314'],
      tagColor: '#365314',
      tagBg: 'rgba(54, 83, 20, 0.1)',
      path: '/id-cards',
    },
    {
      id: 'certificate',
      title: 'صانع شهادات التقدير والتميز',
      category: 'شهادات رسمية',
      description: 'تصميم وإصدار شهادات شكر وتقدير وتفوق ملكية للطلاب بإطارات ذهبية وتصدير مباشر A4 أفقي.',
      icon: 'ribbon' as const,
      colors: ['#3f6212', '#1a2e05'],
      tagColor: '#1a2e05',
      tagBg: 'rgba(26, 46, 5, 0.1)',
      path: '/certificate',
    },
    {
      id: 'grade-sheets',
      title: 'صانع سجلات الدرجات اليومية والمتابعة',
      category: 'سجلات رسمية',
      description: 'إنشاء وطباعة جداول رصد الدرجات، الواجبات، وسجلات الحضور والغياب بتنسيق مدرسي احترافي.',
      icon: 'grid' as const,
      colors: ['#65a30d', '#4d7c0f'],
      tagColor: '#4d7c0f',
      tagBg: 'rgba(101, 163, 13, 0.1)',
      path: '/grade-sheets',
    },
    {
      id: 'GradeRegister',
      title: 'صانع سجلات الدرجات للمعلم والمدرس ',
      category: 'درجات الطلاب',
      description: 'تصميم وتصدير سجلات درجات الطلاب اليومية والشهرية والسعي السنوي بصيغة PDF.',
      icon: 'id-card' as const,
      colors: ['#4d7c0f', '#3f6212'],
      tagColor: '#3f6212',
      tagBg: 'rgba(77, 124, 15, 0.1)',
      path: '/GradeRegister',
    },
    {
      id: 'StudentCard',
      title: 'صانع كارتات نتائج الطلاب',
      category: 'تقارير الطلاب',
      description: 'عرض وتصدير كارت تقريري فردي ومفصل لنتيجة كل طالب على حدة بصيغة PDF.',
      icon: 'card-outline' as const,
      colors: ['#3f6212', '#1a2e05'],
      tagColor: '#1a2e05',
      tagBg: 'rgba(26, 46, 5, 0.1)',
      path: '/StudentCard',
    },
  ];

  const filteredTools = primaryTools.filter(
    (tool) =>
      tool.title.includes(searchQuery) ||
      tool.description.includes(searchQuery) ||
      tool.category.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient colors={['#ffffff', '#b7d38d', '#3f6b09']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <View style={styles.logoOuterGlow}>
            <LinearGradient colors={['rgba(19, 18, 20, 0.2)', 'rgba(13, 10, 7, 0.05)']} style={styles.logoBadge}>
              <Ionicons name="layers-outline" size={36} color="#4d7c0f" />
            </LinearGradient>
          </View>
          
          <View style={styles.badgePill}>
            <View style={styles.dotIndicator} />
            <Text style={styles.badgePillText}> إصدار احترافي متطور</Text>
          </View>

          <Text style={styles.title}>سطور للطباعة</Text>
          <Text style={styles.subtitle}>منظومة رقمية متكاملة لتصميم الاختبارات، الجداول، الهويات، الشهادات، السجلات، وبطاقات الجلوس</Text>
        </View>

        {/* زر الانتقال لشاشة الملحقات المستقلة */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => handleNavigate('/supplementary')} 
          style={styles.supplementaryBannerContainer}
        >
          <LinearGradient colors={['#3f6212', '#1a2e05']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.supplementaryBanner}>
            <View style={styles.supplementaryContent}>
              <View style={styles.supplementaryIconBox}>
                <Ionicons name="folder-open" size={24} color="#b7d38d" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.supplementaryTitle}>الملحقات والخدمات الإضافية</Text>
                <Text style={styles.supplementaryDesc}>وصولولات التسوق، المناوبات، الجداول الرياضية، والمزيد...</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color="#b7d38d" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#65a30d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن أداة أو قسم..."
            placeholderTextColor="#84cc16"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color="#4d7c0f" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>الأقسام الأساسية ({filteredTools.length})</Text>
          <Ionicons name="grid-outline" size={16} color="#4d7c0f" />
        </View>

        {filteredTools.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={40} color="#84cc16" />
            <Text style={styles.emptyText}>لا توجد نتائج تطابق بحثك</Text>
          </View>
        ) : (
          filteredTools.map((tool) => (
            <View key={tool.id} style={styles.cardContainer}>
              <View style={styles.cardInner}>
                <View style={styles.cardHeaderRow}>
                  <LinearGradient colors={tool.colors} style={styles.iconBox}>
                    <Ionicons name={tool.icon} size={24} color="#ffffff" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <View style={styles.tagRow}>
                      <Text style={[styles.cardTag, { color: tool.tagColor, backgroundColor: tool.tagBg }]}>
                        {tool.category}
                      </Text>
                    </View>
                    <Text style={styles.cardTitle}>{tool.title}</Text>
                    <Text style={styles.cardDesc}>{tool.description}</Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={0.85} onPress={() => handleNavigate(tool.path)} style={styles.actionTouch}>
                  <LinearGradient colors={[tool.colors[0], tool.colors[1], '#2d3748']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>الانتقال للقسم</Text>
                    <Ionicons name="arrow-back" size={18} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbfb' },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 16 },
  glowTopRight: { position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(77, 124, 15, 0.08)' },
  glowBottomLeft: { position: 'absolute', bottom: 100, left: -60, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(101, 163, 13, 0.06)' },
  headerContainer: { alignItems: 'center', marginBottom: 2 },
  logoOuterGlow: { shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, marginBottom: 14 },
  logoBadge: { width: 84, height: 84, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.3)' },
  badgePill: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(77, 124, 15, 0.08)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.2)', marginBottom: 12, gap: 6 },
  dotIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4d7c0f' },
  badgePillText: { color: '#4d7c0f', fontSize: 11, fontWeight: '800', fontFamily: 'Tajawal' },
  title: { fontSize: 32, fontWeight: '900', color: '#1a2e05', letterSpacing: -0.5, textAlign: 'center', fontFamily: 'Tajawal' },
  subtitle: { fontSize: 13, color: '#3f6212', fontWeight: '600', marginTop: 6, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20, fontFamily: 'Tajawal' },
  
  supplementaryBannerContainer: { borderRadius: 20, overflow: 'hidden', shadowColor: '#3f6212', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  supplementaryBanner: { padding: 16, borderWidth: 1, borderColor: 'rgba(183, 211, 141, 0.3)', borderRadius: 20 },
  supplementaryContent: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
  supplementaryIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(183, 211, 141, 0.15)', justifyContent: 'center', alignItems: 'center' },
  supplementaryTitle: { color: '#ffffff', fontSize: 15, fontWeight: '900', textAlign: 'right', marginBottom: 2, fontFamily: 'Tajawal' },
  supplementaryDesc: { color: '#b7d38d', fontSize: 11.5, fontWeight: '600', textAlign: 'right', fontFamily: 'Tajawal' },

  searchContainer: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', borderRadius: 16, paddingHorizontal: 14, height: 50, marginBottom: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  searchIcon: { marginLeft: 10 },
  searchInput: { flex: 1, color: '#1a2e05', fontSize: 14, fontWeight: '600', textAlign: 'right', fontFamily: 'Tajawal' },
  clearSearchBtn: { padding: 4 },
  sectionHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 2, paddingHorizontal: 4 },
  sectionHeaderTitle: { color: '#3f6212', fontSize: 15, fontWeight: '800', textAlign: 'right', fontFamily: 'Tajawal' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { color: '#65a30d', fontSize: 14, fontWeight: '700', fontFamily: 'Tajawal' },
  cardContainer: { borderRadius: 28, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)', shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, overflow: 'hidden' },
  cardInner: { padding: 20 },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6 },
  tagRow: { flexDirection: 'row-reverse', marginBottom: 4 },
  cardTag: { fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden', fontFamily: 'Tajawal' },
  cardTitle: { color: '#1a2e05', fontSize: 18, fontWeight: '900', textAlign: 'right', marginBottom: 4, fontFamily: 'Tajawal' },
  cardDesc: { color: '#4b5563', fontSize: 12.5, fontWeight: '600', textAlign: 'right', lineHeight: 19, fontFamily: 'Tajawal' },
  actionTouch: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  actionBtn: { height: 50, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4 },
  actionBtnText: { color: '#f7f4f4', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' }
});