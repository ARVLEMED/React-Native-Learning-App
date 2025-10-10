import { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet, Modal, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { AppContext } from '../context/AppContext';
import { theme } from '../Theme';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons

const methods = [
  {
    name: 'Pills (combined or progestin-only)',
    duration: 1,
    unit: 'months',
    typicalUseEffectiveness: 91,
    perfectUseEffectiveness: 99,
    effects: 'Spotting, nausea, breast tenderness, mood changes; improve within 2–3 months. Take pill same time daily.',
    source: 'CDC & WHO Family Planning Handbook',
  },
  {
    name: 'Injection (DMPA / Depo-Provera)',
    duration: 3,
    unit: 'months',
    typicalUseEffectiveness: 94,
    perfectUseEffectiveness: 99,
    effects: 'Irregular bleeding, weight gain, possible bone density loss with long use; inject every 3 months.',
    source: 'Planned Parenthood, WHO FP Handbook',
  },
  {
    name: 'Implant (subdermal rod)',
    duration: 5,
    unit: 'years',
    typicalUseEffectiveness: 99.9,
    perfectUseEffectiveness: 99.9,
    effects: 'Irregular bleeding or amenorrhea, headaches, minor weight change.',
    source: 'WHO & CDC Contraceptive Guidance',
  },
  {
    name: 'Hormonal IUD (levonorgestrel IUS)',
    duration: 5,
    unit: 'years',
    typicalUseEffectiveness: 99.8,
    perfectUseEffectiveness: 99.8,
    effects: 'Spotting initially, then lighter or no periods; mild cramping after insertion.',
    source: 'ACOG & CDC Contraceptive Effectiveness Chart',
  },
  {
    name: 'Copper IUD (non-hormonal)',
    duration: 10,
    unit: 'years',
    typicalUseEffectiveness: 99.2,
    perfectUseEffectiveness: 99.4,
    effects: 'Heavier or longer periods, increased cramping; improves after several months.',
    source: 'CDC & WHO Family Planning Handbook',
  },
  {
    name: 'Male Condom',
    duration: 1,
    unit: 'use',
    typicalUseEffectiveness: 87,
    perfectUseEffectiveness: 98,
    effects: 'Possible irritation or latex allergy; protects against STIs; use with water-based lubricant.',
    source: 'CDC Contraceptive Effectiveness Summary',
  },
  {
    name: 'Female Condom',
    duration: 1,
    unit: 'use',
    typicalUseEffectiveness: 79,
    perfectUseEffectiveness: 95,
    effects: 'Possible discomfort or noise during use; protects against STIs.',
    source: 'CDC & WHO Family Planning Reference',
  },
  {
    name: 'Emergency Contraception (Levonorgestrel / Ulipristal)',
    duration: 1,
    unit: 'use',
    typicalUseEffectiveness: 85,
    perfectUseEffectiveness: 89,
    effects: 'Nausea, irregular bleeding, fatigue; take within 3–5 days after unprotected sex.',
    source: 'WHO & Planned Parenthood EC Guidelines',
  },
  {
    name: 'Male Sterilization (Vasectomy)',
    duration: Infinity,
    unit: 'permanent',
    typicalUseEffectiveness: 99.9,
    perfectUseEffectiveness: 99.9,
    effects: 'Mild pain/swelling initially; permanent; not effective immediately (requires follow-up semen test).',
    source: 'CDC & WHO FP Handbook',
  },
  {
    name: 'Female Sterilization (Tubal Ligation)',
    duration: Infinity,
    unit: 'permanent',
    typicalUseEffectiveness: 99.5,
    perfectUseEffectiveness: 99.5,
    effects: 'Surgical risks (infection, regret); permanent; no hormonal side effects.',
    source: 'CDC & WHO Family Planning Guidance',
  },
];

export default function FPLogger() {
  const { fpLogs, setFpLogs } = useContext(AppContext);
  const [method, setMethod] = useState(methods[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  const checkECUsage = () => {
    const ecLogs = fpLogs.filter((log) => log.name.includes('Emergency Contraception'));
    const yearLogs = ecLogs.filter((log) => moment(log.start).isSame(moment(), 'year'));
    if (yearLogs.length >= 3) {
      return 'Warning: More than 3 emergency contraception uses this year. Consider a regular family planning method.';
    }
    return '';
  };

  const checkRenewal = () => {
    fpLogs.forEach((log) => {
      if (moment().isAfter(moment(log.renewal).subtract(7, 'days'))) {
        Alert.alert('Renewal Reminder', `${log.name} due for renewal on ${log.renewal}.`);
      }
    });
  };

  useEffect(() => {
    checkRenewal();
  }, [fpLogs]);

  const logFP = async () => {
    if (!method || moment(startDate).isAfter(moment())) {
      return Alert.alert('Error', 'Select a method and valid start date');
    }
    const renewal = method.unit === 'permanent' ? 'Permanent' : moment(startDate).add(method.duration, method.unit).format('YYYY-MM-DD');
    const newLog = { ...method, start: moment(startDate).format('YYYY-MM-DD'), renewal, id: Date.now().toString() };
    const updated = [...fpLogs, newLog];
    try {
      await AsyncStorage.setItem('fpLogs', JSON.stringify(updated));
      setFpLogs(updated);
      setShowModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  const resetForm = () => {
    setMethod(methods[0]);
    setStartDate(new Date());
    setShowPicker(false);
  };

  const renderFPItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>{item.name}: {item.start} (Renew: {item.renewal})</Text>
    </View>
  );

  // Custom button component with icon
  const IconButton = ({ title, onPress, iconName }) => (
    <View style={styles.iconButtonContainer}>
      <Icon name={iconName} size={20} color="#db1919ff" style={styles.icon} />
      <Button title={title} onPress={onPress} color={theme.colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={theme.typography.subtitle}>Log Family Planning</Text>
        <Picker
          selectedValue={method}
          onValueChange={setMethod}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {methods.map((m) => (
            <Picker.Item label={m.name} value={m} key={m.name} />
          ))}
        </Picker>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Text style={theme.typography.body}>Start: {moment(startDate).format('YYYY-MM-DD')}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowPicker(false);
              if (d) setStartDate(d);
            }}
            maximumDate={new Date()}
          />
        )}
        <View style={styles.buttonRow}>
          <IconButton title="Log FP" onPress={logFP} iconName="add-circle" />
          <IconButton title="Reset" onPress={resetForm} iconName="refresh" />
        </View>
        <Text style={styles.ecWarning}>{checkECUsage()}</Text>
        <FlatList
          data={fpLogs.slice(-3)}
          renderItem={renderFPItem}
          keyExtractor={(item) => item.id}
          style={styles.history}
        />
      </View>
      <Modal visible={showModal} animationType="none" transparent>
        <SafeAreaView style={[styles.modalOverlay, animatedModalStyle]}>
          <View style={styles.modalContent}>
            <Text style={theme.typography.subtitle}>Method Logged</Text>
            <Text style={theme.typography.body}>Name: {method.name}</Text>
            <Text style={theme.typography.body}>Start: {moment(startDate).format('YYYY-MM-DD')}</Text>
            <Text style={theme.typography.body}>Renewal: {method.unit === 'permanent' ? 'Permanent' : moment(startDate).add(method.duration, method.unit).format('YYYY-MM-DD')}</Text>
            <Text style={theme.typography.body}>Effects: {method.effects}</Text>
            <Text style={theme.typography.body}>Effectiveness: {method.typicalUseEffectiveness}% (typical), {method.perfectUseEffectiveness}% (perfect)</Text>
            <Button title="Close" onPress={() => setShowModal(false)} color={theme.colors.primary} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { 
    flex: 1, 
    padding: theme.spacing.sm,
    marginBottom: 60, // Reserve space for bottom buttons
  },
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
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: theme.spacing.sm },
  iconButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%', // Adjusted for two buttons
  },
  icon: {
    marginBottom: 5,
  },
  ecWarning: { color: '#EF4444', fontSize: 14, marginVertical: theme.spacing.xs },
  history: { marginTop: theme.spacing.sm },
  logItem: { padding: theme.spacing.xs, borderBottomWidth: 1, borderBottomColor: '#eee' },
  logText: { fontSize: 14, color: theme.colors.text },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    paddingBottom: 60, // Match marginBottom to avoid covering bottom buttons
  },
  modalContent: { 
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.lg, 
    borderRadius: 10, 
    width: '80%', 
    alignItems: 'center' 
  },
});