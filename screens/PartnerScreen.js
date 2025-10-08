import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

export default function PartnerScreen() {
  const [cycles, setCycles] = useState([]);
  const route = useRoute();
  const { sharedCycle } = route.params || {};

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const saved = await AsyncStorage.getItem('cycles');
      if (saved) setCycles(JSON.parse(saved));
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partner Dashboard</Text>
      <Text style={styles.count}>Shared Cycles: {cycles.length}</Text>
      {sharedCycle ? (
        <View style={styles.cycleCard}>
          <Text style={styles.cycleText}>
            Latest: {sharedCycle.start} to {sharedCycle.end}
          </Text>
          <Text style={styles.fertileText}>
            Fertile Window: Days {sharedCycle.fertileWindow}
          </Text>
        </View>
      ) : (
        <Text style={styles.noData}>No cycle shared yet</Text>
      )}
      <Button
        title="Simulate Notification"
        onPress={() => Alert.alert('Push Sent!', 'Partner notified: Craving chocolate!')}
        color="#1E3A8A" // Navy for masculine vibe
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2D3748', // Charcoal grey
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2E8F0', // Light grey for contrast
    marginBottom: 20,
  },
  count: {
    fontSize: 18,
    color: '#A0AEC0', // Steel grey
    marginBottom: 15,
  },
  cycleCard: {
    backgroundColor: '#4A5568', // Darker grey for card
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  cycleText: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  fertileText: {
    fontSize: 14,
    color: '#63B3ED', // Light blue accent
    marginTop: 5,
  },
  noData: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 20,
    fontStyle: 'italic',
  },
});