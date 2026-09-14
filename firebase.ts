// src/firebaseConfig.ts
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// إعدادات الفايربيس الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyCgw39DDilZX-gQ5mr9GnZu-qCEOydyFik",
  authDomain: "qimam-aeb4f.firebaseapp.com",
  projectId: "qimam-aeb4f",
  storageBucket: "qimam-aeb4f.firebasestorage.app",
  messagingSenderId: "551973664060",
  appId: "1:551973664060:web:47c192edc8f8be90ab9a39",
  measurementId: "G-H48M32ZRWD"
};

// تهيئة الفايربيس مع منع تكرار تهيئة المثيل (Singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// تصدير قاعدة البيانات (Firestore) للاستخدام في التطبيق
export const db = getFirestore(app);

// تهيئة Analytics بشكل آمن (للويب فقط لتجنب أخطاء الهواتف المحمولة)
let analytics: any = null;
if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
export default app;