import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

// Import screens
import Dashboard from './screens/Dashboard';
import PersonalPrefs from './screens/PersonalPrefs';
import CycleTracker from './screens/CycleTracker';
import FullGuideScreen from './screens/FullGuideScreen';
import PartnerScreen from './screens/PartnerScreen';

// Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator(); // Should work if package installed

// Trackers Screen
function TrackersScreen() {
  const [activeTracker, setActiveTracker] = useState('prefs');
  return (
    <View style={trackerStyles.container}>
      <Text style={trackerStyles.title}>Trackers</Text>
      <View style={trackerStyles.buttonRow}>
        <Button title="Food Prefs" onPress={() => setActiveTracker('prefs')} color="#FFB6C1" />
        <Button title="Cycle Tracker" onPress={() => setActiveTracker('cycle')} color="#FFB6C1" />
      </View>
      {activeTracker === 'prefs' ? <PersonalPrefs /> : <CycleTracker />}
    </View>
  );
}
const trackerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  title: { fontSize: 20, fontWeight: 'bold', padding: 20, color: '#333' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
});

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Guides') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Trackers') iconName = focused ? 'pulse' : 'pulse-outline';
          else if (route.name === 'Partner') iconName = focused ? 'people' : 'people-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFB6C1',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { backgroundColor: '#fff' },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Guides"
        component={Dashboard}
        options={{ tabBarLabel: 'Health Guides', accessibilityLabel: 'Health Guides Tab' }}
      />
      <Tab.Screen
        name="Trackers"
        component={TrackersScreen}
        options={{ tabBarLabel: 'Trackers', accessibilityLabel: 'Trackers Tab' }}
      />
      <Tab.Screen
        name="Partner"
        component={PartnerScreen}
        options={{ tabBarLabel: 'Partner View', accessibilityLabel: 'Partner View Tab' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaView style={appStyles.container} edges={['top', 'left', 'right']}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#f8f8f8' },
            headerTintColor: '#333',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="FullGuide"
            component={FullGuideScreen}
            options={({ route }) => ({
              title: route.params?.guide?.title || 'Guide Details',
            })}
          />
          <Stack.Screen name="Partner" component={PartnerScreen} options={{ title: 'Partner View' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const appStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
});