import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExamIndex() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* خلفية بتدرج هادئ وراقي */}
      <LinearGradient colors={['#ffffff', '#f7f9f2', '#edf1e3']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          
          {/* شارة ترحيبية علوية (Badge) */}
          <View style={styles.badgeContainer}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>لوحة تحكم صناعة الاختبارات الأكاديمية</Text>
          </View>

          {/* الترويسة الرئيسية */}
          <View style={styles.headerContainer}>
            <View style={styles.iconWrapperOuter}>
              <LinearGradient colors={['rgba(75, 83, 32, 0.15)', 'rgba(75, 83, 32, 0.02)']} style={styles.iconGradientBg}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="school" size={38} color="#4B5320" />
                </View>
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>صانع الاختبارات</Text>
            <Text style={styles.headerSubtitle}>
              اختر المادة الدراسية للبدء في صياغة الأسئلة، وتنسيق الأوراق الامتحانية باحترافية ومعايير وزارية دقيقة
            </Text>
          </View>

          <View style={styles.cardsWrapper}>
            {/* زر امتحان عربي */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigateTo('/exam/ArabicExam')}
              style={styles.cardTouch}
            >
              <BlurView intensity={70} tint="light" style={styles.card}>
                <LinearGradient colors={['rgba(75, 83, 32, 0.06)', 'transparent']} style={styles.cardGradient} />
                <View style={styles.cardContent}>
                  <View style={styles.cardIconBox}>
                    <Text style={styles.langIcon}>ض</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>امتحان عربي</Text>
                    <Text style={styles.cardDescription}>
                      إنشاء اختبار منسق من اليمين لليسار مع دعم الخطوط الرسمية والزخارف.
                    </Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-back" size={18} color="#6E7A41" />
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>

            {/* زر امتحان إنجليزي */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigateTo('/exam/EnglishExam')}
              style={styles.cardTouch}
            >
              <BlurView intensity={70} tint="light" style={styles.card}>
                <LinearGradient colors={['rgba(75, 83, 32, 0.06)', 'transparent']} style={styles.cardGradient} />
                <View style={styles.cardContent}>
                  <View style={styles.cardIconBox}>
                    <Text style={styles.langIconEn}>En</Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>امتحان إنجليزي</Text>
                    <Text style={styles.cardDescription}>
                      تنسيق اتجاه LTR مع دعم القطع الإنشائية، الجداول، والإسقاطات.
                    </Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-back" size={18} color="#6E7A41" />
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>

            {/* زر امتحان رياضيات */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigateTo('/exam/exam-math')}
              style={styles.cardTouch}
            >
              <BlurView intensity={70} tint="light" style={styles.card}>
                <LinearGradient colors={['rgba(75, 83, 32, 0.06)', 'transparent']} style={styles.cardGradient} />
                <View style={styles.cardContent}>
                  <View style={styles.cardIconBox}>
                    <Ionicons name="calculator-outline" size={24} color="#4B5320" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>امتحان رياضيات</Text>
                    <Text style={styles.cardDescription}>
                      لوحة رموز سريعة للجذور، الأسس، الكسور، والمعادلات الرياضية.
                    </Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-back" size={18} color="#6E7A41" />
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>

            {/* زر امتحان كيمياء */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigateTo('/exam/exam-chemistry')}
              style={styles.cardTouch}
            >
              <BlurView intensity={70} tint="light" style={styles.card}>
                <LinearGradient colors={['rgba(75, 83, 32, 0.06)', 'transparent']} style={styles.cardGradient} />
                <View style={styles.cardContent}>
                  <View style={styles.cardIconBox}>
                    <Ionicons name="flask-outline" size={24} color="#4B5320" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>امتحان كيمياء</Text>
                    <Text style={styles.cardDescription}>
                      تنسيق تفاعلي للمركبات الكيميائية، المعادلات، والنظائر.
                    </Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-back" size={18} color="#6E7A41" />
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>

            {/* زر امتحان فيزياء */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigateTo('/exam/exam-physics')}
              style={styles.cardTouch}
            >
              <BlurView intensity={70} tint="light" style={styles.card}>
                <LinearGradient colors={['rgba(75, 83, 32, 0.06)', 'transparent']} style={styles.cardGradient} />
                <View style={styles.cardContent}>
                  <View style={styles.cardIconBox}>
                    <Ionicons name="magnet-outline" size={24} color="#4B5320" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>امتحان فيزياء</Text>
                    <Text style={styles.cardDescription}>
                      إدراج المتجهات، المتغيرات الفيزيائية، والثوابت الأكاديمية بسهولة.
                    </Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-back" size={18} color="#6E7A41" />
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    marginTop: 20,
  },
  badgeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(75, 83, 32, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(75, 83, 32, 0.15)',
    gap: 8,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4B5320',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5320',
    fontFamily: 'Tajawal',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapperOuter: {
    marginBottom: 16,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(75, 83, 32, 0.2)',
  },
  iconGradientBg: {
    padding: 6,
    borderRadius: 26,
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4B5320',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3f4a2e',
    marginBottom: 8,
    fontFamily: 'Tajawal',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6E7A41',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },
  cardsWrapper: {
    gap: 14,
  },
  cardTouch: {
    borderRadius: 22,
    shadowColor: '#4B5320',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(75, 83, 32, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  cardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(75, 83, 32, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 83, 32, 0.15)',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#3f4a2e',
    marginBottom: 4,
    textAlign: 'right',
    fontFamily: 'Tajawal',
  },
  cardDescription: {
    fontSize: 12.5,
    color: '#6E7A41',
    lineHeight: 18,
    textAlign: 'right',
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },
  chevronBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(75, 83, 32, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langIcon: {
    fontSize: 24,
    color: '#4B5320',
    fontWeight: '900',
  },
  langIconEn: {
    fontSize: 18,
    color: '#4B5320',
    fontWeight: '900',
  },
});