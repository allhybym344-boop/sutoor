// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SubscriptionProvider, useSubscription } from '../context/SubscriptionContext';

function RootNavigator() {
  const { isPremium, isLoading } = useSubscription();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // التحقق مما إذا كان المستخدم حالياً في شاشة التفعيل
    const inActivationScreen = segments[0] === 'activation';

    if (!isPremium && !inActivationScreen) {
      // إذا لم يكن مشتركاً وليس في شاشة التفعيل، يتم توجيهه إجبارياً لشاشة التفعيل
      router.replace('/activation');
    } else if (isPremium && inActivationScreen) {
      // إذا كان مشتركاً وتم التحقق منه، يتم نقله تلقائياً للشاشة الرئيسية
      router.replace('/'); // استبدل بـ '(tabs)' أو اسم الشاشة الرئيسية لديك
    }
  }, [isPremium, isLoading, segments]);

  // عرض شاشة تحميل هادئة ريثما يتصل التطبيق بفايربيس للتحقق من الاشتراك
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#a3b899" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activation" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SubscriptionProvider>
      <RootNavigator />
    </SubscriptionProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#121813',
    justifyContent: 'center',
    alignItems: 'center',
  },
});