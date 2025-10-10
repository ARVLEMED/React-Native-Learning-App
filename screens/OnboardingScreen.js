import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../Theme'; 

// Optional: Add LinearGradient for background (install with `npx expo install expo-linear-gradient`)
// import LinearGradient from 'expo-linear-gradient';

const steps = [
  {
    title: 'Welcome to CycleSync!',
    body: 'Your personal health companion for tracking cycles, moods, and more.',
   // image: require('../assets/welcome.png'), // Add your image asset here (optional)
  },
  {
    title: 'Explore Features',
    body: 'Use Guides, Trackers, and Partner tabs to stay in sync with your wellness journey.',
   // image: require('../assets/features.png'), // Optional image
  },
  {
    title: 'Get Started',
    body: 'Tap below to begin customizing your experience!',
   // image: require('../assets/start.png'), // Optional image
  },
];

export default function OnboardingScreen({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const translateY = useSharedValue(1000); // Start off-screen for slide-up

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const seen = await AsyncStorage.getItem('onboardingSeen');
      if (!seen) {
        setVisible(true);
        translateY.value = withSpring(0, { damping: 20, stiffness: 100 }); // Slide up
        await AsyncStorage.setItem('onboardingSeen', 'true');
      } else {
        onClose();
      }
    };
    checkFirstLaunch();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      translateY.value = withTiming(-1000, { duration: 300 }, () => {
        setCurrentStep(currentStep + 1);
        translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      });
    } else {
      translateY.value = withTiming(0, { duration: 300 }, () => {
        setVisible(false);
        onClose();
      });
    }
  };

  const renderDots = () => (
    <View style={styles.dots}>
      {steps.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, currentStep === index && styles.activeDot]}
        />
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      accessibilityRole="dialog"
      accessibilityLabel="CycleSync onboarding steps"
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.modal}>
          {steps[currentStep].image && (
            <Image source={steps[currentStep].image} style={styles.image} resizeMode="contain" />
          )}
          <Text style={theme.typography.title}>{steps[currentStep].title}</Text>
          <Text style={theme.typography.body}>{steps[currentStep].body}</Text>
          {renderDots()}
          <Button
            title={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            onPress={nextStep}
            color={theme.colors.primary}
            accessibilityLabel={`Go to ${currentStep === steps.length - 1 ? 'app' : 'next step'}`}
            accessibilityHint={`Press to ${currentStep === steps.length - 1 ? 'start using CycleSync' : 'view the next onboarding step'}`}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: 10,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: theme.spacing.md,
  },
  dots: {
    flexDirection: 'row',
    marginVertical: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 12,
    height: 12,
  },
});