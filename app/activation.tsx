// app/activation.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';

export default function ActivationScreen() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const { activateWithCode, isPremium, expiryDate, userEmail } = useSubscription();
  const router = useRouter();

  const handleActivate = async () => {
    if (!code.trim() || !email.trim()) {
      setMessage({ text: 'يرجى إدخال رمز التفعيل البريد الإلكتروني معاً.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let deviceId = await AsyncStorage.getItem('@device_unique_id');
      if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now();
        await AsyncStorage.setItem('@device_unique_id', deviceId);
      }
      
      const result = await activateWithCode(code, email, deviceId);

      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error: any) {
      setMessage({ text: 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={40} color="#a3b899" />
        </View>

        <Text style={styles.title}>تفعيل تطبيق سُطور</Text>
        <Text style={styles.subtitle}>
          أدخل بريدك الإلكتروني ورمز التفعيل المعتمد لربط الحساب بجهازك الحالي بشكل آمن.
        </Text>

        {isPremium && expiryDate && (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.activeText}>مفعل لـ ({userEmail}) حتى: {expiryDate}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني (مثال: user@gmail.com)"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="رمز التفعيل (مثال: SUTOOR-2026-VIP)"
          placeholderTextColor="#64748b"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          textAlign="right"
        />

        {message && (
          <View style={[styles.messageBox, message.type === 'success' ? styles.successBox : styles.errorBox]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleActivate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#121813" />
          ) : (
            <Text style={styles.buttonText}>تفعيل وحفظ الاشتراك</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>العودة للرئيسية</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121813',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(28, 38, 30, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(163, 184, 153, 0.25)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(163, 184, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(163, 184, 153, 0.3)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#c2d0bc',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  activeText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(163, 184, 153, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'right',
  },
  messageBox: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  messageText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#a3b899',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#121813',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#8fa985',
    fontSize: 13,
  },
});