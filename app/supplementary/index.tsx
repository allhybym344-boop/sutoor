import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SupplementaryMenuScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (path: string) => {
    Haptics.selectionAsync();
    router.push(path as any);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const supplementaryTools = [
    {
      id: 'shopping-receipt',
      title: 'صانع وصولات التسوق',
      category: 'ملحق مبيعات',
      description: 'تصميم وصل مبيعات مخصص مع ترويسة المتجر وقائمة فارغة للتعبئة اليدوية بالقلم مع تصدير PDF.',
      icon: 'receipt-outline' as const,
      colors: ['#4d7c0f', '#365314'],
      tagColor: '#3f6212',
      tagBg: 'rgba(77, 124, 15, 0.1)',
      path: '/supplementary/shopping-receipt',
    },
    {
      id: 'grocery-planner',
      title: 'منظم قوائم التسوق',
      category: 'ملحق تنظيمي',
      description: 'تصميم وتنظيم قوائم والمستلزمات المنزلية مقسمة حسب الفئات والكميات مع تصدير PDF.',
      icon: 'cart-outline' as const,
      colors: ['#65a30d', '#4d7c0f'],
      tagColor: '#4d7c0f',
      tagBg: 'rgba(101, 163, 13, 0.1)',
      path: '/supplementary/grocery-planner',
    },
    {
      id: 'duty-roster',
      title: 'صانع جدول المناوبات والخفارات',
      category: 'ملحق إداري',
      description: 'تنظيم جداول المناوبات اليومية والخفارات، أسماء المناوبين، وأرقام التواصل مع حتى 31 صفاً.',
      icon: 'shield-checkmark' as const,
      colors: ['#3f6212', '#365314'],
      tagColor: '#365314',
      tagBg: 'rgba(54, 83, 20, 0.1)',
      path: '/supplementary/duty-roster',
    },
    {
      id: 'fitness-schedule',
      title: 'جدول التمارين الرياضية والنظام الغذائي',
      category: 'ملحق صحي',
      description: 'تصميم وتنظيم جدول أسبوعي متكامل للتمارين الرياضية وتوزيع الوجبات الغذائية مع تصدير PDF بصيغة A4.',
      icon: 'barbell-outline' as const,
      colors: ['#65a30d', '#4d7c0f'],
      tagColor: '#4d7c0f',
      tagBg: 'rgba(101, 163, 13, 0.1)',
      path: '/supplementary/fitness-schedule',
    },
  ];

  const filteredTools = supplementaryTools.filter(
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
        
        {/* زر العودة وشريط العنوان */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
            <Ionicons name="arrow-forward" size={20} color="#1a2e05" />
            <Text style={styles.backButtonText}>الرئيسية</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <View style={styles.logoOuterGlow}>
            <LinearGradient colors={['rgba(19, 18, 20, 0.2)', 'rgba(13, 10, 7, 0.05)']} style={styles.logoBadge}>
              <Ionicons name="folder-open-outline" size={36} color="#4d7c0f" />
            </LinearGradient>
          </View>
          
          <View style={styles.badgePill}>
            <View style={styles.dotIndicator} />
            <Text style={styles.badgePillText}>الأقسام والملحقات الإضافية</Text>
          </View>

          <Text style={styles.title}>الملحقات والخدمات</Text>
          <Text style={styles.subtitle}>مجموعة الأدوات الخدمية والإدارية المساعدة لتسهيل المهام اليومية والتنظيمية</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#65a30d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث في الملحقات..."
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
          <Text style={styles.sectionHeaderTitle}>الملحقات المتاحة ({filteredTools.length})</Text>
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
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 40, gap: 16 },
  topBar: { flexDirection: 'row-reverse', marginBottom: -5 },
  backButton: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(101, 163, 13, 0.3)', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  backButtonText: { color: '#1a2e05', fontSize: 13, fontWeight: 'bold', fontFamily: 'Tajawal' },
  glowTopRight: { position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(77, 124, 15, 0.08)' },
  glowBottomLeft: { position: 'absolute', bottom: 100, left: -60, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(101, 163, 13, 0.06)' },
  headerContainer: { alignItems: 'center', marginBottom: 6 },
  logoOuterGlow: { shadowColor: '#4d7c0f', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, marginBottom: 14 },
  logoBadge: { width: 84, height: 84, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.3)' },
  badgePill: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(77, 124, 15, 0.08)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(77, 124, 15, 0.2)', marginBottom: 12, gap: 6 },
  dotIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4d7c0f' },
  badgePillText: { color: '#4d7c0f', fontSize: 11, fontWeight: '800', fontFamily: 'Tajawal' },
  title: { fontSize: 32, fontWeight: '900', color: '#1a2e05', letterSpacing: -0.5, textAlign: 'center', fontFamily: 'Tajawal' },
  subtitle: { fontSize: 13, color: '#3f6212', fontWeight: '600', marginTop: 6, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20, fontFamily: 'Tajawal' },
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
  cardTag: { codeFontSize: 10, fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden', fontFamily: 'Tajawal' },
  cardTitle: { color: '#1a2e05', fontSize: 18, fontWeight: '900', textAlign: 'right', marginBottom: 4, fontFamily: 'Tajawal' },
  cardDesc: { color: '#4b5563', fontSize: 12.5, fontWeight: '600', textAlign: 'right', lineHeight: 19, fontFamily: 'Tajawal' },
  actionTouch: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  actionBtn: { height: 50, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4 },
  actionBtnText: { color: '#f7f4f4', fontSize: 14, fontWeight: 'bold', fontFamily: 'Tajawal' }
});