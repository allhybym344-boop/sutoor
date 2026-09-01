import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

// لوحة الألوان للوضع الفاتح
const lightColors = {
  primary: '#2563EB',      // الأزرق الأساسي للتطبيق
  primaryDark: '#1D4ED8',
  background: '#F8FAFC',   // خلفية الشاشات
  card: '#FFFFFF',         // خلفية العناصر والكروت
  text: '#1E293B',         // النصوص الرئيسية
  textSecondary: '#64748B',// النصوص الفرعية
  border: '#E2E8F0',       // الحدود والفواصل
  success: '#10B981',      // نجاح / درجات عالية
  danger: '#EF4444',       // تنبيه / حذف / درجات منخفضة
  tint: '#2563EB',
};

// لوحة الألوان للوضع الداكن
const darkColors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  danger: '#F87171',
  tint: '#3B82F6',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // استرجاع تفضيل المستخدم المحفوظ مسبقاً
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app_theme_mode');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('app_theme_mode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};