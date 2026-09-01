import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// استيراد المكونات الفرعية المنفصلة
import ArabicSummary from './ArabicSummary';
import EnglishSummary from './EnglishSummary';

export default function SummaryMainIndex() {
  const router = useRouter();
  // 'ar' = لغة عربية، 'en' = لغة إنجليزية
  const [currentMode, setCurrentMode] = useState('ar');

  const handleToggle = (mode: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMode(mode);
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* خلفية التطبيق المتناسقة مع المنظومة */}
      <LinearGradient colors={['#ffffff', '#b7d38d', '#3f6b09']} style={StyleSheet.absoluteFillObject} />

      {/* هيدر التبديل الذكي */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-forward" size={20} color="#1a2e05" />
        </TouchableOpacity>

        {/* أداة اختيار وضع اللغة (Segmented Controller) */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleToggle('en')} style={[styles.toggleTab, currentMode === 'en' && styles.activeTabEn]}>
            <Text style={[styles.tabText, currentMode === 'en' && styles.activeTabText]}>English Layout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleToggle('ar')} style={[styles.toggleTab, currentMode === 'ar' && styles.activeTabAr]}>
            <Text style={[styles.tabText, currentMode === 'ar' && styles.activeTabText]}>التخطيط العربي</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* عرض شاشة التحرير المقابلة للاختيار بمرونة مطلقة */}
      <View style={{ flex: 1 }}>
        {currentMode === 'ar' ? <ArabicSummary /> : <EnglishSummary />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#fdfbfb' },
  topHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 10, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  toggleContainer: { flex: 1, height: 46, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.7)', flexDirection: 'row', padding: 4, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.25)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
  toggleTab: { flex: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  activeTabAr: { backgroundColor: '#3f6212', shadowColor: '#3f6212', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  activeTabEn: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.2)' },
  tabText: { color: '#65a30d', fontSize: 13, fontWeight: '700', fontFamily: 'Tajawal' },
  activeTabText: { color: '#ffffff', fontWeight: 'bold', fontFamily: 'Tajawal' }
});