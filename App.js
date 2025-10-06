import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [visible, setVisible] = useState(false);

  const handlePress = () => {
    setVisible(!visible);
    console.log('Button pressed! Visibility now:', !visible); // Bonus: Log the new state for easier debugging
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello from Aron, Mid-level Dev Conquering RN 🚀</Text>
      {visible && <Text style={styles.message}>You pressed the button!</Text>}
      <View style={styles.buttonContainer}>
        <Button 
          title="Press me" 
          onPress={handlePress}
          accessibilityLabel="Toggle visibility message"
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#27F5E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20, 
  },
});