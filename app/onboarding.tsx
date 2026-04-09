import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

const STORAGE_KEY = 'bodyforge_onboarding';

export default function OnboardingScreen() {
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [diet, setDiet] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        setGoal(parsed.goal || '');
        setLevel(parsed.level || '');
        setDiet(parsed.diet || '');
      }
    } catch (error) {
      console.log('Error loading onboarding data:', error);
    }
  }

  async function saveProfile() {
    try {
      const profile = { goal, level, diet };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

      Alert.alert(
        'Profile Saved',
        `Goal: ${goal || 'Not selected'}\nLevel: ${level || 'Not selected'}\nDiet: ${diet || 'Not selected'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Could not save your profile.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BodyForge AI</Text>
      <Text style={styles.subtitle}>Let’s personalize your system.</Text>

      <Text style={styles.sectionTitle}>Choose Your Goal</Text>
      <View style={styles.optionsRow}>
        {['Fat Loss', 'Muscle Gain', 'Performance'].map((item) => (
          <Pressable
            key={item}
            style={[styles.option, goal === item && styles.selectedOption]}
            onPress={() => setGoal(item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Training Level</Text>
      <View style={styles.optionsRow}>
        {['Beginner', 'Intermediate', 'Advanced'].map((item) => (
          <Pressable
            key={item}
            style={[styles.option, level === item && styles.selectedOption]}
            onPress={() => setLevel(item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Diet Style</Text>
      <View style={styles.optionsRow}>
        {['Carnivore', 'Keto', 'Mixed'].map((item) => (
          <Pressable
            key={item}
            style={[styles.option, diet === item && styles.selectedOption]}
            onPress={() => setDiet(item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.continueButton} onPress={saveProfile}>
        <Text style={styles.continueButtonText}>Save Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  option: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#22c55e',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 26,
  },
  continueButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});