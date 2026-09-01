// app/_layout.js
import { Stack } from 'expo-router';
import { SubscriptionProvider } from './context/SubscriptionContext'; // استيراد مزود الاشتراك

export default function RootLayout() {
  return (
    // إحاطة التطبيق بالكامل بنظام الاشتراك
    <SubscriptionProvider>
      <Stack
        screenOptions={{
          headerShown: false, // هذا السطر سيخفي شريط المسارات والعنوان عن جميع الشاشات تلقائياً
        }}
      >
        {/* الشاشة الرئيسية */}
        <Stack.Screen name="index" />
        
        {/* شاشة المودل (تُعرّف هنا كـ modal ليتم فتحها من الأسفل) */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal'
          }} 
        />
      </Stack>
    </SubscriptionProvider>
  );
}