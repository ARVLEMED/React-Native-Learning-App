import { useRoute } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function FullGuideScreen() {
  const route = useRoute();
  const { guide } = route.params || {}; // Passed from GuideCard nav

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{guide?.title || 'Guide'}</Text>
      <Text style={styles.content}>{guide?.content || 'Full content here...'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 24 },
});