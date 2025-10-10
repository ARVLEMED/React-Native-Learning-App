import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Use Material Icons
import PersonalPrefs from './PersonalPrefs';
import CycleTracker from './CycleTracker';
import FPLogger from './FPLogger';
import SexLogger from './SexLogger';
import { theme } from '../Theme';

const trackers = [
  { id: 'prefs', label: 'Food Preferences', component: PersonalPrefs, icon: 'fastfood', color: '#FF9800' }, // Orange for food
  { id: 'cycle', label: 'Cycle Tracker', component: CycleTracker, icon: 'calendar-today', color: '#4CAF50' }, // Green for health
  { id: 'fp', label: 'Family Planning', component: FPLogger, icon: 'family-restroom', color: '#2196F3' }, // Blue for family
  { id: 'sex', label: 'Sex Log', component: SexLogger, icon: 'favorite', color: '#F44336' }, // Red for love
];

export default function TrackersScreen() {
  const [viewMode, setViewModeState] = useState('grid');
  const [selectedTracker, setSelectedTracker] = useState('prefs');
  const [isLoading, setIsLoading] = useState(false);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCardPress = useCallback((id) => {
    console.log('Switching to content for:', id);
    setIsLoading(true);
    scale.value = withSpring(0.95, { damping: 10 });
    setTimeout(() => {
      setSelectedTracker(id);
      setViewModeState('content');
      opacity.value = withTiming(1, { duration: 300 });
      setIsLoading(false);
      scale.value = withSpring(1);
    }, 200);
  }, [opacity, scale]);

  const goBackToGrid = useCallback(() => {
    console.log('Going back to grid from:', selectedTracker);
    setViewModeState('grid');
    setSelectedTracker('prefs');
    opacity.value = withTiming(1, { duration: 300 });
    console.log('State updated to grid');
  }, [selectedTracker, opacity]);

  useEffect(() => {
    const backAction = () => {
      console.log('BackHandler triggered, current viewMode:', viewMode);
      if (viewMode === 'content') {
        goBackToGrid();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      console.log('Cleaning up BackHandler');
      backHandler.remove();
    };
  }, [viewMode, goBackToGrid]);

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCardPress(item.id)}
      accessibilityLabel={`${item.label} Tracker`}
      accessibilityHint={`Select to view ${item.label} tracking details`}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.cardContent, cardAnimatedStyle, selectedTracker === item.id && styles.activeCard]}>
        <Icon name={item.icon} size={30} color={item.color} />
        <Text style={styles.cardText} numberOfLines={2}>{item.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderTrackerContent = () => {
    const TrackerComponent = trackers.find((t) => t.id === selectedTracker)?.component;
    return (
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : TrackerComponent ? (
          <TrackerComponent />
        ) : null}
      </View>
    );
  };

  console.log('TrackersScreen render - viewMode:', viewMode, 'setViewModeState type:', typeof setViewModeState);

  return (
    <View style={styles.container}>
      <Text style={theme.typography.title}>Trackers</Text>
      {viewMode === 'grid' ? (
        <FlatList
          data={trackers}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.cardContainer}
          scrollEnabled={false}
          removeClippedSubviews={false}
        />
      ) : (
        <Animated.View style={[styles.content, animatedStyle]}>
          {renderTrackerContent()}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.sm },
  cardContainer: {
    paddingVertical: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    margin: theme.spacing.xs,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    height: 120,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCard: {
    borderColor: theme.colors.primary,
  },
  cardText: { 
    fontSize: 14, 
    color: theme.colors.text, 
    textAlign: 'center',
    fontWeight: '500',
    marginTop: theme.spacing.sm,
  },
  content: { flex: 1, padding: theme.spacing.sm },
  contentContainer: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
  },
});