import { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Dashboard from './Dashboard';
import PersonalPrefs from './PersonalPrefs';
import CycleTracker from './CycleTracker';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'prefs':
        return <PersonalPrefs />;
      case 'cycle':
        return <CycleTracker />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CycleSync Home</Text>
      </View>
      <View style={styles.nav}>
        <Button title="Guides" onPress={() => setActiveSection('dashboard')} color="#FFB6C1" />
        <Button title="Food Prefs" onPress={() => setActiveSection('prefs')} color="#FFB6C1" />
        <Button title="Cycle Tracker" onPress={() => setActiveSection('cycle')} color="#FFB6C1" />
      </View>
      <View style={styles.sectionContainer}>
        {renderSection()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f8f8' 
  },
  header: { 
    padding: 20, 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  nav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 10, 
    backgroundColor: '#fff' 
  },
  sectionContainer: { 
    flex: 1 
  },
});