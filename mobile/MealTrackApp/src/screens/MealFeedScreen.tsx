import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MainTabScreenProps } from '../types/navigation';
import * as api from '../services/api';
import { Meal } from '../types/api';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function MealFeedScreen({ navigation }: MainTabScreenProps<'MealFeed'>) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMeals = async () => {
    try {
      const data = await api.getMeals();
      setMeals(data);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load meals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  const handleAddMeal = async () => {
    Alert.alert(
      'Add Meal',
      'Choose photo source',
      [
        {
          text: 'Take Photo',
          onPress: () => takePicture(),
        },
        {
          text: 'Choose from Library',
          onPress: () => choosePicture(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const takePicture = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets?.[0]?.uri) {
      handleUploadMeal(result.assets[0].uri);
    }
  };

  const choosePicture = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets?.[0]?.uri) {
      handleUploadMeal(result.assets[0].uri);
    }
  };

  const handleUploadMeal = async (uri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'meal.jpg',
    } as any);
    formData.append('calories', '0');
    formData.append('protein', '0');
    formData.append('high_confidence', 'false');

    try {
      const meal = await api.addMeal(formData);
      setMeals(prevMeals => [meal, ...prevMeals]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add meal');
    }
  };

  const renderMeal = ({ item: meal }: { item: Meal }) => (
    <View style={styles.mealCard}>
      {meal.image && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${meal.image}` }}
          style={styles.mealImage}
        />
      )}
      <View style={styles.mealInfo}>
        <View style={styles.mealStats}>
          <Text style={styles.statText}>{meal.calories} cal</Text>
          <Text style={styles.statText}>{meal.protein}g protein</Text>
          <Text style={[
            styles.confidenceTag,
            meal.high_confidence ? styles.highConfidence : styles.lowConfidence
          ]}>
            {meal.high_confidence ? 'High Confidence' : 'Low Confidence'}
          </Text>
        </View>
        {meal.glucose_readings.length > 0 && (
          <View style={styles.glucoseContainer}>
            <Text style={styles.glucoseTitle}>Glucose Readings</Text>
            {meal.glucose_readings.map((reading, index) => (
              <Text key={index} style={styles.glucoseReading}>
                {new Date(reading.timestamp).toLocaleTimeString()}: {reading.value} mg/dL
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={meal => meal.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadMeals} />
        }
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  mealInfo: {
    padding: 15,
  },
  mealStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  confidenceTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  highConfidence: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  lowConfidence: {
    backgroundColor: '#FCE4EC',
    color: '#C2185B',
  },
  glucoseContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  glucoseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  glucoseReading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    marginTop: -2,
  },
});
