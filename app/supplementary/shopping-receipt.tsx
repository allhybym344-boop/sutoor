import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';

export default function ShoppingReceiptScreen() {
  // ربط نظام الاشتراكات والمحاولات والعلامة المائية
  const { handleExportAttempt, getWatermarkHTML } = useSubscription();

  const [storeName, setStoreName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rowCount, setRowCount] = useState('10');

  const generateReceiptPDF = async () => {
    if (!storeName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المحل أو المتجر');
      return;
    }

    // التحقق من محاولات التصدير المجانية أو اشتراك الـ VIP قبل التصدير
    const canProceed = await handleExportAttempt();
    if (!canProceed) return;

    const numRows = parseInt(rowCount) || 10;
    let rowsHTML = '';
    for (let i = 1; i <= numRows; i++) {
      rowsHTML += `
        <tr>
          <td style="text-align: center; border: 1px solid #3f6212; padding: 12px; width: 10%; font-size: 14px;">${i}</td>
          <td style="border: 1px solid #3f6212; padding: 12px; width: 45%;"></td>
          <td style="border: 1px solid #3f6212; padding: 12px; width: 15%;"></td>
          <td style="border: 1px solid #3f6212; padding: 12px; width: 30%;"></td>
        </tr>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Tahoma', sans-serif;
              direction: rtl;
              padding: 25px;
              color: #1a2e05;
              background-color: #ffffff;
            }
            .receipt-box {
              border: 2px solid #3f6212;
              border-radius: 12px;
              padding: 25px;
              max-width: 700px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #4d7c0f;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              color: #1a2e05;
              font-weight: 900;
            }
            .header p {
              margin: 6px 0 0 0;
              font-size: 15px;
              color: #3f6212;
              font-weight: bold;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 15px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #4d7c0f;
              color: #ffffff;
              border: 1px solid #3f6212;
              padding: 10px;
              font-size: 14px;
              text-align: center;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              margin-top: 25px;
              font-size: 15px;
              font-weight: bold;
            }
            .signature {
              margin-top: 35px;
              text-align: left;
              font-size: 14px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <h1>${storeName}</h1>
              <p>رقم الهاتف: ${phoneNumber || '----------------'}</p>
            </div>
            
            <div class="info-row">
              <div>التاريخ: ${date}</div>
              <div>رقم الوصل: .................</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ت</th>
                  <th>اسم المادة / الوصف</th>
                  <th>الكمية</th>
                  <th>السعر / الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>

            <div class="footer">
              <div>المجموع الكلي: ........................................... د.ع</div>
            </div>

            <div class="signature">
              توقيع البائع: .......................................
            </div>
          </div>
          ${getWatermarkHTML()}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(uri);
    } catch (error) {
      Alert.alert('خطأ', 'فشل إنشاء الوصل');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>صانع وصولات التسوق</Text>
        <Text style={styles.subtitle}>تصميم وصل مبيعات مخصص مع ترويسة المتجر وقائمة فارغة للتعبئة اليدوية بالقلم</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>اسم المحل أو المتجر:</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: متجر السطور للتسوق"
          placeholderTextColor="#9ca3af"
          value={storeName}
          onChangeText={setStoreName}
          textAlign="right"
        />

        <Text style={styles.label}>رقم الهاتف:</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: 07700000000"
          placeholderTextColor="#9ca3af"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          textAlign="right"
        />

        <Text style={styles.label}>التاريخ:</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
          value={date}
          onChangeText={setDate}
          textAlign="right"
        />

        <Text style={styles.label}>عدد الأسطر الفارغة للتعبئة اليدوية:</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          placeholderTextColor="#9ca3af"
          value={rowCount}
          onChangeText={setRowCount}
          keyboardType="numeric"
          textAlign="right"
        />

        <TouchableOpacity style={styles.button} onPress={generateReceiptPDF} activeOpacity={0.85}>
          <Ionicons name="print-outline" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>إنشاء وطباعة الوصل (PDF)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbfb' },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#1a2e05', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#3f6212', fontWeight: '600', textAlign: 'center', paddingHorizontal: 10, lineHeight: 18 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(101, 163, 13, 0.2)',
    shadowColor: '#4d7c0f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '800', color: '#1a2e05', marginBottom: 8, textAlign: 'right' },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(101, 163, 13, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#1a2e05',
    marginBottom: 16,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#4d7c0f',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});