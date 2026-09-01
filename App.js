import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// تغيير اسم الدالة لتصبح App ليعرف إكسبو أنها نقطة الدخول
export default function App() { 
  const [content, setContent] = useState('');
  
  // تعريف القوالب... (باقي الكود كما هو تماماً)
  const templates = {
    modern: {
      name: 'عصري (Modern)',
      style: `
        body { font-family: sans-serif; padding: 40px; direction: rtl; }
        .header { background: #0c2340; color: #D4AF37; padding: 20px; border-radius: 10px; text-align: center; }
        .content { margin-top: 30px; font-size: 16px; color: #333; line-height: 1.8; }
      `,
      wrapper: (html) => `<div class="header"><h1>ملخص سطور</h1></div><div class="content">${html}</div>`
    },
    academic: {
      name: 'أكاديمي (Academic)',
      style: `
        body { font-family: 'Times New Roman', serif; padding: 50px; direction: rtl; }
        .content { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-style: italic; }
      `,
      wrapper: (html) => `<div class="content">${html}</div><div class="footer">تم الإنشاء بواسطة تطبيق سطور</div>`
    }
  };

  const generatePDF = async (templateKey) => {
    if (!content.trim()) return Alert.alert('تنبيه', 'يرجى كتابة نص أولاً');

    const template = templates[templateKey];
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>${template.style}</style>
        </head>
        <body>
          ${template.wrapper(content.replace(/\n/g, '<br/>'))}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(uri);
    } catch (error) {
      Alert.alert('خطأ', 'فشل إنشاء الملف');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>تطبيق سطور</Text>
      <Text style={styles.label}>محتوى الملخص:</Text>
      <TextInput 
        style={styles.input} 
        multiline 
        placeholder="اكتب النص هنا..." 
        value={content} 
        onChangeText={setContent} 
      />

      <Text style={styles.label}>اختر النمط:</Text>
      <View style={styles.btnRow}>
        {Object.keys(templates).map((key) => (
          <TouchableOpacity 
            key={key} 
            style={styles.btn} 
            onPress={() => generatePDF(key)}
          >
            <Text style={styles.btnText}>{templates[key].name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0c2340', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' },
  input: { height: 200, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 15, padding: 15, backgroundColor: '#fff', textAlignVertical: 'top', marginBottom: 20 },
  btnRow: { flexDirection: 'row-reverse', justifyContent: 'space-around' },
  btn: { padding: 20, backgroundColor: '#0c2340', borderRadius: 15, width: '45%', alignItems: 'center' },
  btnText: { color: '#D4AF37', fontWeight: 'bold' }
});