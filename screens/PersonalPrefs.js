import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Explicit import for Picker
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons for delete

export default function PersonalPrefs() {
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [inputFood, setInputFood] = useState('');
  const [category, setCategory] = useState('All');
  const [categories] = useState(['All', 'Snacks', 'Meals', 'Desserts', 'Drinks']);

  useEffect(() => {
    loadFavoriteFoods();
    return () => {
      console.log('Cleaning up PersonalPrefs...'); // Ensure proper cleanup
    };
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
      Alert.alert('Error', 'Failed to load favorite foods');
    }
  };

  const saveFavoriteFood = async () => {
    console.log('Save pressed. Input:', inputFood, 'Category:', category);
    if (!inputFood.trim()) {
      return Alert.alert('Error', 'Please enter a food item');
    }
    if (category === 'All') {
      return Alert.alert('Error', 'Please select a category');
    }
    const newFood = { id: Date.now().toString(), name: inputFood.trim(), category };
    const updated = [...favoriteFoods, newFood];
    try {
      console.log('Saving updated:', updated);
      await AsyncStorage.setItem('favoriteFoods', JSON.stringify(updated));
      setFavoriteFoods(updated);
      setInputFood('');
      Alert.alert('Success', `${inputFood} added to ${category} favorites!`);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save—try again');
    }
  };

  const deleteFavoriteFood = async (id) => {
    console.log('Deleting food with id:', id);
    const updated = favoriteFoods.filter((food) => food.id !== id);
    try {
      await AsyncStorage.setItem('favoriteFoods', JSON.stringify(updated));
      setFavoriteFoods(updated);
      Alert.alert('Success', 'Food removed from favorites!');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete—try again');
    }
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItemContainer}>
      <Text style={styles.foodItem}>{item.name} ({item.category})</Text>
      <TouchableOpacity onPress={() => deleteFavoriteFood(item.id)}>
        <Icon name="delete" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const filteredFoods = category === 'All' ? favoriteFoods : favoriteFoods.filter(food => food.category === category);

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
      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={styles.picker}
      >
        {categories.map((cat) => (
          <Picker.Item label={cat} value={cat} key={cat} />
        ))}
      </Picker>
      <Button title="Add Food" onPress={saveFavoriteFood} color="#4CAF50" />
      <Text style={styles.count}>Foods Logged: {filteredFoods.length}</Text>
      <FlatList
        data={filteredFoods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 20, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginVertical: 5, 
    borderRadius: 5,
    fontSize: 16,
  },
  picker: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    marginVertical: 5, 
    borderRadius: 5,
    height: 50, // Ensure consistent height
  },
  count: { fontSize: 16, marginVertical: 10, fontWeight: '500', color: '#666' },
  list: { maxHeight: 200, marginTop: 10 },
  foodItemContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 5, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  foodItem: { 
    fontSize: 14, 
    color: '#333',
  },
});