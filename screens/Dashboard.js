// Dashboard.js (or App.js)
import { ScrollView, View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import GuideCard from '../GuideCard';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const guides = [
    {
      title: 'Safe Days Calculator',
      content: 'To estimate: Find shortest cycle, subtract 18 for first fertile day. Longest minus 11 for last. Safe days outside this window. Note: Not 100% reliable.',
    },
    {
      title: 'Breast Self-Exam Guide',
      content: 'Step 1: Visual check standing (arms down/up). Step 2: Lie down, use finger pads in circles with varying pressure. Check armpits and nipples for changes.',
    },
    {
      title: 'Contraceptives Overview',
      content: 'Pills: Pros - Regulates cycles; Cons - Must take daily. IUD: Pros - Lasts years; Cons - Possible cramps. Condoms: Pros - STI protection; Cons - Can break.',
    },
    // Add more: Weight, Moods, etc.
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.icon} />
        <Text style={styles.headerText}>CycleSync Dashboard</Text>
      </View>
      {guides.map((guide, idx) => (
        <GuideCard key={idx} title={guide.title} content={guide.content} onPress={() => console.log('Open full guide')} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  icon: { width: 50, height: 50, borderRadius: 25 },
  headerText: { fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
});