import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { getExamStore } from '../utils/examStore'; // استدعاء المخزن

export default function ModalScreen() {
  const router = useRouter();
  
  // سحب البيانات مباشرة من المخزن المؤقت
  const { html: htmlContent, isLandscape, color: themeColor } = getExamStore();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        width: isLandscape ? 842 : 595,
        height: isLandscape ? 595 : 842
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('خطأ', 'فشلت عملية التصدير.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#f8fafc" />
        </TouchableOpacity>
        
        <Text style={styles.title}>معاينة المستند</Text>
        
        <TouchableOpacity 
          style={[styles.exportHeaderBtn, { backgroundColor: themeColor }, isGenerating && { opacity: 0.7 }]} 
          onPress={handleExport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.exportHeaderText}>تصدير</Text>
              <Ionicons name="share-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <WebView 
        source={{ html: htmlContent }} 
        style={styles.webview} 
        originWhitelist={['*']}
        scalesPageToFit={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)'
  },
  title: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12 },
  exportHeaderBtn: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12,
    gap: 6
  },
  exportHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  webview: { flex: 1, backgroundColor: '#f8fafc' }
});