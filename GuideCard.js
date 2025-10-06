// GuideCard.js
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function GuideCard({ title, content, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content.substring(0, 100)}...</Text> {/**teaser */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android shadow
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  content: { fontSize: 14, color: '#666' },
});