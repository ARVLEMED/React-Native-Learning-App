import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

export default function CycleTracker() {
  const navigation = useNavigation();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [cycles, setCycles] = useState([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

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

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const saveCycle = async () => {
    if (startDate >= endDate) {
      return Alert.alert('Error', 'Start date must be before end date');
    }
    const cycleLength = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const fertileStartDay = Math.max(1, cycleLength - 18);
    const fertileEndDay = Math.min(cycleLength, cycleLength - 11);
    const newCycle = {
      start: formatDate(startDate),
      end: formatDate(endDate),
      length: cycleLength,
      fertileWindow: `${fertileStartDay}-${fertileEndDay}`,
      id: Date.now(),
    };
    const updated = [...cycles, newCycle];
    try {
      await AsyncStorage.setItem('cycles', JSON.stringify(updated));
      setCycles(updated);
      Alert.alert(
        'Success',
        `Cycle logged! Length: ${cycleLength} days.\nEstimated Fertile Window: Days ${newCycle.fertileWindow}.\n(Safe days outside this—consult a doctor for accuracy.)`
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save—try again');
    }
  };

  const resetDates = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setShowStartPicker(false);
    setShowEndPicker(false);
    Alert.alert('Reset', 'Dates cleared!');
  };

  const shareLastCycle = () => {
    if (cycles.length === 0) {
      return Alert.alert('No Cycles', 'Log a cycle first!');
    }
    navigation.navigate('Partner', { sharedCycle: cycles[cycles.length - 1] });
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Your Cycle</Text>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
        <Text style={styles.dateText}>Start: {formatDate(startDate)}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          maximumDate={new Date()}
        />
      )}

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
        <Text style={styles.dateText}>End: {formatDate(endDate)}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate}
        />
      )}

      <View style={styles.buttonRow}>
        <Button title="Log Cycle" onPress={saveCycle} color="#FFB6C1" />
        <Button title="Reset Dates" onPress={resetDates} color="#FFB6C1" />
        <Button title="Share with Partner" onPress={shareLastCycle} color="#FFB6C1" />
      </View>

      <Text style={styles.count}>Cycles Logged: {cycles.length}</Text>

      {cycles.length > 0 && (
        <View style={styles.history}>
          <Text style={styles.historyTitle}>Recent Cycles:</Text>
          {cycles.slice(-3).map((cycle) => (
            <Text key={cycle.id} style={styles.historyItem}>
              {cycle.start} to {cycle.end} ({cycle.length} days)
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 20, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  dateText: { fontSize: 16, color: '#333' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  count: { fontSize: 16, marginVertical: 10, fontWeight: '500', color: '#666' },
  history: { marginTop: 20 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  historyItem: { fontSize: 14, color: '#666', marginBottom: 2 },
});