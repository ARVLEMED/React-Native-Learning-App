import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PersonalPrefs() {
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [inputFood, setInputFood] = useState('');

  useEffect(() => {
    loadFavoriteFoods();
  }, []);

  const loadFavoriteFoods = async () => {
    try {
      console.log('Loading foods...');
      const storedFoods = await AsyncStorage.getItem('favoriteFoods');
      console.log('Stored data:', storedFoods);
      if (storedFoods) {
        setFavoriteFoods(JSON.parse(storedFoods));
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const saveFavoriteFood = async () => {
    console.log('Save pressed. Input:', inputFood);
    if (!inputFood.trim()) {
      return Alert.alert('Error', 'Enter your favorite food');
    }
    const newFood = { id: Date.now().toString(), name: inputFood.trim() };
    const updated = [...favoriteFoods, newFood];
    try {
      console.log('Saving updated:', updated);
      await AsyncStorage.setItem('favoriteFoods', JSON.stringify(updated));
      setFavoriteFoods(updated);
      setInputFood('');
      Alert.alert('Success', `${inputFood} added to favorites!`);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save—try again');
    }
  };

  const renderFoodItem = ({ item }) => (
    <Text style={styles.foodItem}>{item.name}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Your Favorite Foods</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Chocolate"
        value={inputFood}
        onChangeText={setInputFood}
        keyboardType="default"
      />
      <Button title="Add Food" onPress={saveFavoriteFood} />
      <Text style={styles.count}>Foods Logged: {favoriteFoods.length}</Text>
      <FlatList
        data={favoriteFoods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginVertical: 5, 
    borderRadius: 5,
    fontSize: 16,
  },
  count: { fontSize: 16, marginVertical: 10, fontWeight: '500' },
  list: { maxHeight: 200 },
  foodItem: { 
    padding: 5, 
    fontSize: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
});