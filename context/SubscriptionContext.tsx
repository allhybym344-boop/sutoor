// context/SubscriptionContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, runTransaction, Timestamp } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../firebase';

interface SubscriptionContextType {
  isPremium: boolean;
  expiryDate: string | null;
  userEmail: string | null;
  freeUsageCount: number;
  isLoading: boolean;
  activateWithCode: (code: string, email: string, deviceId: string) => Promise<{ success: boolean; message: string }>;
  handleExportAttempt: () => Promise<boolean>;
  getWatermarkHTML: () => string;
  checkCloudSubscription: (deviceId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAppSubscription();
  }, []);

  const initializeAppSubscription = async () => {
    try {
      let deviceId = await AsyncStorage.getItem('@device_unique_id');
      if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now();
        await AsyncStorage.setItem('@device_unique_id', deviceId);
      }

      const savedEmail = await AsyncStorage.getItem('@user_email');
      if (savedEmail) setUserEmail(savedEmail);

      const usageCount = await AsyncStorage.getItem('@freeUsageCount');
      if (usageCount !== null) setFreeUsageCount(parseInt(usageCount, 10));

      await checkCloudSubscription(deviceId);
    } catch (error) {
      console.error('خطأ في تهيئة الاشتراك:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCloudSubscription = async (deviceId: string) => {
    try {
      // البحث المحلي أولاً أو التحقق عبر الذاكرة
      const localPremium = await AsyncStorage.getItem('@isPremium');
      const localExpiry = await AsyncStorage.getItem('@expiryDate');
      
      if (localPremium === 'true' && localExpiry) {
        const expiryObj = new Date(localExpiry);
        if (expiryObj > new Date()) {
          setIsPremium(true);
          setExpiryDate(expiryObj.toLocaleDateString('ar-IQ'));
          return;
        }
      }
      setIsPremium(false);
    } catch (error) {
      console.error('خطأ فحص الاشتراك:', error);
    }
  };

  // تفعيل الاشتراك مع ربط الكود بالإيميل ومعرف الجهاز لمنع التحايل
  const activateWithCode = async (code: string, email: string, deviceId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cleanCode = code.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanCode || !cleanEmail) {
        return { success: false, message: 'يرجى إدخال رمز التفعيل والبريد الإلكتروني.' };
      }

      const codeRef = doc(db, 'activationCodes', cleanCode);

      const result = await runTransaction(db, async (transaction) => {
        const codeDoc = await transaction.get(codeRef);
        
        if (!codeDoc.exists()) {
          throw new Error('رمز التفعيل غير موجود في قاعدة بيانات سُطور.');
        }

        const data = codeDoc.data();

        // التحقق مما إذا كان الكود مستخدماً من جهاز أو إيميل آخـر
        if (data.isUsed) {
          if (data.deviceId !== deviceId || data.email !== cleanEmail) {
            throw new Error('هذا الرمز مسجل بالفعل على جهاز أو بريد إلكتروني آخر ولا يمكن استخدامه.');
          }
        }

        const durationDays = data.durationDays || 365;
        const now = new Date();
        const newExpiryDate = new Date(now.getTime());
        newExpiryDate.setDate(newExpiryDate.getDate() + durationDays);

        // تحديث أو تثبيت بيانات الكود في فايربيس وربطه بالجهاز والإيميل
        transaction.update(codeRef, {
          isUsed: true,
          deviceId: deviceId,
          email: cleanEmail,
          activatedAt: Timestamp.now(),
          expiryDate: Timestamp.fromDate(newExpiryDate),
          isActive: true
        });

        return {
          newExpiryStr: newExpiryDate.toLocaleDateString('ar-IQ'),
          expiryObj: newExpiryDate
        };
      });

      // حفظ الحالة محلياً
      setIsPremium(true);
      setExpiryDate(result.newExpiryStr);
      setUserEmail(cleanEmail);
      await AsyncStorage.setItem('@isPremium', 'true');
      await AsyncStorage.setItem('@expiryDate', result.expiryObj.toISOString());
      await AsyncStorage.setItem('@user_email', cleanEmail);

      return { success: true, message: `تم تفعيل تطبيق سُطور بنجاح لغاية: ${result.newExpiryStr}` };
    } catch (error: any) {
      return { success: false, message: error.message || 'حدث خطأ أثناء عملية التفعيل.' };
    }
  };

  const getWatermarkHTML = (): string => {
    if (isPremium) return '';
    return `
      <div style="
        position: fixed; bottom: 10px; right: 0; left: 0;
        text-align: center; font-size: 10px; color: #64748b;
        font-family: 'Tajawal', Tahoma, sans-serif;
        border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 15px;
        opacity: 0.75; z-index: 1000; direction: rtl;
      ">
        تم الإصدار بواسطة تطبيق سُطور للطباعة والتصميم المدرسـي (نسخة تجريبية مجانية)
      </div>
    `;
  };

  const handleExportAttempt = async (): Promise<boolean> => {
    if (isPremium) return true;

    if (freeUsageCount >= 3) {
      Alert.alert(
        'انتهت المحاولات المجانية',
        'لقد استهلكت المحاولات المجانية الثلاث (3). يرجى إدخال رمز التفعيل للاستمرار بلا حدود.',
        [{ text: 'حسناً', style: 'cancel' }]
      );
      return false;
    }

    const newCount = freeUsageCount + 1;
    try {
      setFreeUsageCount(newCount);
      await AsyncStorage.setItem('@freeUsageCount', newCount.toString());
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        isPremium, 
        expiryDate,
        userEmail,
        freeUsageCount, 
        isLoading,
        activateWithCode,
        handleExportAttempt,
        getWatermarkHTML,
        checkCloudSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription يجب أن يُستخدم داخل SubscriptionProvider');
  }
  return context;
};