// app/context/SubscriptionContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface SubscriptionContextType {
  isPremium: boolean;
  freeUsageCount: number;
  setIsPremium: (value: boolean) => void;
  handleExportAttempt: () => Promise<boolean>;
  getWatermarkHTML: () => string;
  checkAndResetDailyUsage: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [freeUsageCount, setFreeUsageCount] = useState(0);

  // تحميل البيانات المحفوظة عند فتح التطبيق
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('@isPremium');
      const usageCount = await AsyncStorage.getItem('@freeUsageCount');
      
      if (premiumStatus !== null) setIsPremium(JSON.parse(premiumStatus));
      if (usageCount !== null) setFreeUsageCount(parseInt(usageCount, 10));
    } catch (error) {
      console.error('خطأ في تحميل بيانات الاشتراك:', error);
    }
  };

  // تحديث حالة الحساب (مجاني/مدفوع) وحفظها
  const updatePremiumStatus = async (status: boolean) => {
    try {
      setIsPremium(status);
      await AsyncStorage.setItem('@isPremium', JSON.stringify(status));
    } catch (error) {
      console.error('خطأ في حفظ حالة الاشتراك:', error);
    }
  };

  // دالة إرجاع كود الـ HTML الخاص بالعلامة المائية الشاملة لكل أقسام سُطور
  const getWatermarkHTML = (): string => {
    if (isPremium) {
      return ''; // الحساب المدفوع بدون علامة مائية نهائياً في أي قسم
    }

    // تصميم علامة مائية احترافية تناسب كل مستندات ومطبوعات سُطور (A4 / بطاقات / جداول)
    return `
      <div style="
        position: fixed;
        bottom: 10px;
        right: 0;
        left: 0;
        text-align: center;
        font-size: 10px;
        color: #64748b;
        font-family: 'Tajawal', Tahoma, sans-serif;
        border-top: 1px dashed #cbd5e1;
        padding-top: 6px;
        margin-top: 15px;
        opacity: 0.75;
        z-index: 1000;
        direction: rtl;
      ">
        تم الإصدار بواسطة تطبيق سُطور للطباعة والتصميم المدرسـي (نسخة تجريبية مجانية)
      </div>
    `;
  };

  // دالة موحدة وشاملة لفحص محاولات التصدير لأي قسم في التطبيق (اختبارات، ملخصات، جداول، هويات، شهادات، سجلات...)
  const handleExportAttempt = async (): Promise<boolean> => {
    if (isPremium) {
      return true; // الحساب المدفوع يمر مباشرة بلا حدود أو علامة مائية في أي شاشة
    }

    if (freeUsageCount >= 3) {
      Alert.alert(
        'انتهت المحاولات المجانية',
        'لقد استهلكت المحاولات المجانية الثلاث (3) المتاحة لك عبر أقسام التطبيق. يرجى الترقية للحساب المدفوع للاستمرار في التصدير بلا حدود وبدون علامة مائية.',
        [{ text: 'حسناً', style: 'cancel' }]
      );
      return false; // منع التصدير عبر جميع الأقسام
    }

    // زيادة العداد الإجمالي المشترك للمحاولات المجانية
    const newCount = freeUsageCount + 1;
    try {
      setFreeUsageCount(newCount);
      await AsyncStorage.setItem('@freeUsageCount', newCount.toString());
      
      Alert.alert(
        'تنبيه الاستخدام المجاني',
        `تم استخدام المحاولة المجانية رقم ${newCount} من أصل 3 محاولات متاحة لك في التطبيق.`,
        [{ text: 'متابعة التصدير' }]
      );
      return true; // السماح بالتصدير مع وضع علامة مائية للمجاني
    } catch (error) {
      console.error('خطأ في تحديث عداد المحاولات:', error);
      return false;
    }
  };

  const checkAndResetDailyUsage = async () => {
    // ميزة مستقبلية إذا احتجت لتصفير العداد يومياً
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        isPremium, 
        freeUsageCount, 
        setIsPremium: updatePremiumStatus, 
        handleExportAttempt,
        getWatermarkHTML,
        checkAndResetDailyUsage
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// دالة مخصصة لاستخدام السياق في أي شاشة أو قسم داخل التطبيق
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription يجب أن يُستخدم داخل SubscriptionProvider');
  }
  return context;
};