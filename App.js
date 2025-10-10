import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useContext, memo } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { theme } from './Theme'; 
import OnboardingScreen from './screens/OnboardingScreen';

import TrackersScreen from './screens/TrackersScreen';

// Import screens
import Dashboard from './screens/Dashboard';
import FullGuideScreen from './screens/FullGuideScreen';
import PartnerScreen from './screens/PartnerScreen';

// Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
const TabNavigator = memo(() => {
  const { cycles, sexLogs } = useContext(AppContext);
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
        tabBarActiveTintColor: theme.colors.primary,
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
        options={{
          tabBarLabel: 'Trackers',
          accessibilityLabel: 'Trackers Tab',
          tabBarBadge: (cycles.length + sexLogs.length) || undefined,
        }}
      />
      <Tab.Screen
        name="Partner"
        component={PartnerScreen}
        options={{ tabBarLabel: 'Partner View', accessibilityLabel: 'Partner View Tab' }}
      />
    </Tab.Navigator>
  );
});

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <AppProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {showOnboarding ? (
          <OnboardingScreen onClose={() => setShowOnboarding(false)} />
        ) : (
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.text,
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
            </Stack.Navigator>
          </NavigationContainer>
        )}
        <StatusBar style="auto" />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});