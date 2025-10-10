import { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet, Modal, TouchableOpacity, FlatList, Switch, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { AppContext } from '../context/AppContext';
import { theme } from '../Theme';

export default function SexLogger() {
  const { sexLogs, setSexLogs, cycles, fpLogs } = useContext(AppContext);
  const [sexType, setSexType] = useState('protected');
  const [sexDate, setSexDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isTryingPregnancy, setIsTryingPregnancy] = useState(false);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (showModal) {
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [showModal]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const isFertileDay = (date) => {
    const lastCycle = cycles[cycles.length - 1];
    if (!lastCycle) return false;
    const cycleStart = moment(lastCycle.start);
    const dayInCycle = moment(date).diff(cycleStart, 'days') + 1;
    const [start, end] = lastCycle.fertileWindow.split('-').map(Number);
    return dayInCycle >= start && dayInCycle <= end;
  };

  const hasActiveFP = () => {
    return fpLogs.some((log) => 
      log.unit !== 'use' && 
      moment().isBetween(moment(log.start), moment(log.renewal))
    );
  };

  const checkECUsage = () => {
    const ecLogs = fpLogs.filter((log) => log.name.includes('Emergency Contraception'));
    const yearLogs = ecLogs.filter((log) => moment(log.start).isSame(moment(), 'year'));
    return yearLogs.length >= 3;
  };

  const handleAddSexLog = async () => {
    if (!sexType || moment(sexDate).isAfter(moment())) {
      return Alert.alert('Error', 'Select type and valid date');
    }
    const newLog = {
      date: moment(sexDate).format('YYYY-MM-DD'),
      type: sexType,
      id: Date.now().toString(),
      tryingPregnancy: isTryingPregnancy,
    };
    const updated = [...sexLogs, newLog];
    try {
      await AsyncStorage.setItem('sexLogs', JSON.stringify(updated));
      setSexLogs(updated);
      if (sexType === 'unprotected' && isFertileDay(sexDate) && !hasActiveFP() && !isTryingPregnancy) {
        setShowModal(true);
      } else {
        Alert.alert('Success', 'Sex log saved!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  const deleteLog = async (id) => {
    const updated = sexLogs.filter((log) => log.id !== id);
    try {
      await AsyncStorage.setItem('sexLogs', JSON.stringify(updated));
      setSexLogs(updated);
      Alert.alert('Deleted', 'Log removed');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete');
    }
  };

  const resetForm = () => {
    setSexType('protected');
    setSexDate(new Date());
    setIsTryingPregnancy(false);
    setShowPicker(false);
  };

  const renderSexItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity style={styles.delete} onPress={() => deleteLog(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
    >
      <View style={styles.logItem}>
        <Text style={styles.logText}>{item.date}: {item.type} {item.tryingPregnancy ? '(Trying)' : ''}</Text>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Text style={theme.typography.subtitle}>Log Sexual Activity</Text>
      <Picker
        selectedValue={sexType}
        onValueChange={setSexType}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Protected" value="protected" />
        <Picker.Item label="Unprotected" value="unprotected" />
      </Picker>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={theme.typography.body}>Date: {moment(sexDate).format('YYYY-MM-DD')}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={sexDate}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowPicker(false);
            if (d) setSexDate(d);
          }}
          maximumDate={new Date()}
        />
      )}
      <View style={styles.switchRow}>
        <Text style={theme.typography.body}>Trying to conceive?</Text>
        <Switch value={isTryingPregnancy} onValueChange={setIsTryingPregnancy} />
      </View>
      <View style={styles.buttonRow}>
        <Button title="Log Entry" onPress={handleAddSexLog} color={theme.colors.primary} />
        <Button title="Reset" onPress={resetForm} color={theme.colors.primary} />
      </View>
      <FlatList
        data={sexLogs.slice(-3)}
        renderItem={renderSexItem}
        keyExtractor={(item) => item.id}
        style={styles.history}
      />
      <Modal visible={showModal} animationType="none" transparent>
        <Animated.View style={[styles.modal, animatedModalStyle]}>
          <View style={styles.modalContent}>
            <Text style={theme.typography.subtitle}>Unprotected in Fertile Window</Text>
            <Text style={theme.typography.body}>
              {checkECUsage()
                ? 'Warning: You’ve used emergency contraception 3+ times this year. Consult a doctor for a regular method.'
                : 'Consider emergency contraception within 72-120 hours to prevent pregnancy.'}
            </Text>
            <Button title="Close" onPress={() => setShowModal(false)} color={theme.colors.primary} />
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.sm, backgroundColor: theme.colors.background },
  picker: { marginVertical: theme.spacing.xs },
  pickerItem: { fontSize: 16 },
  dateButton: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: theme.colors.text, 
    padding: theme.spacing.sm, 
    borderRadius: 5, 
    marginVertical: theme.spacing.xs 
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: theme.spacing.xs },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: theme.spacing.sm },
  history: { marginTop: theme.spacing.sm },
  logItem: { padding: theme.spacing.xs, borderBottomWidth: 1, borderBottomColor: '#eee' },
  logText: { fontSize: 14, color: theme.colors.text },
  delete: { backgroundColor: '#EF4444', justifyContent: 'center', padding: theme.spacing.sm, height: '100%' },
  deleteText: { color: '#fff', fontWeight: '600' },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { 
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.lg, 
    borderRadius: 10, 
    width: '80%', 
    alignItems: 'center' 
  },
});