import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const STORAGE_KEY = 'bodyforge_onboarding';

export default function CoachScreen() {
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [diet, setDiet] = useState('');
  const [coachMessage, setCoachMessage] = useState('Loading your plan...');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        const savedGoal = parsed.goal || '';
        const savedLevel = parsed.level || '';
        const savedDiet = parsed.diet || '';

        setGoal(savedGoal);
        setLevel(savedLevel);
        setDiet(savedDiet);

        setCoachMessage(buildCoachMessage(savedGoal, savedLevel, savedDiet));
      } else {
        setCoachMessage(
          'No onboarding profile found yet. Go back and complete onboarding first.'
        );
      }
    } catch (error) {
      setCoachMessage('Could not load your profile.');
    }
  }

  function buildCoachMessage(goalValue: string, levelValue: string, dietValue: string) {
    let message = '';

    if (goalValue === 'Fat Loss') {
      message +=
        'Primary goal: fat loss. Focus on consistency, calorie control, and high daily movement. ';
    } else if (goalValue === 'Muscle Gain') {
      message +=
        'Primary goal: muscle gain. Focus on progressive overload, recovery, and high protein intake. ';
    } else if (goalValue === 'Performance') {
      message +=
        'Primary goal: performance. Prioritize training quality, hydration, and recovery. ';
    } else {
      message +=
        'Set your goal in onboarding so your coaching can be personalized. ';
    }

    if (levelValue === 'Beginner') {
      message +=
        'Training level: beginner. Keep it simple, build consistency, and master fundamentals. ';
    } else if (levelValue === 'Intermediate') {
      message +=
        'Training level: intermediate. You can push harder, track progress closely, and improve execution. ';
    } else if (levelValue === 'Advanced') {
      message +=
        'Training level: advanced. Dial in volume, recovery, and precision to keep progressing. ';
    } else {
      message +=
        'Set your training level in onboarding for more accurate coaching. ';
    }

    if (dietValue === 'Carnivore') {
      message +=
        'Diet style: carnivore. Prioritize sodium, hydration, protein intake, and recovery support.';
    } else if (dietValue === 'Keto') {
      message +=
        'Diet style: keto. Watch electrolytes closely and make hydration a priority.';
    } else if (dietValue === 'Mixed') {
      message +=
        'Diet style: mixed. Balance protein, carbs, and recovery nutrition to support your goal.';
    } else {
      message +=
        'Set your diet style in onboarding so nutrition guidance can be personalized.';
    }

    return message;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Coach</Text>
      <Text style={styles.subtitle}>Personalized guidance based on your profile</Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileText}>Goal: {goal || 'Not set'}</Text>
        <Text style={styles.profileText}>Level: {level || 'Not set'}</Text>
        <Text style={styles.profileText}>Diet: {diet || 'Not set'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s Guidance</Text>
        <Text style={styles.cardText}>{coachMessage}</Text>
      </View>

      <Pressable style={styles.button} onPress={loadProfile}>
        <Text style={styles.buttonText}>Refresh Coach</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26,
  },
  profileCard: {
    backgroundColor: '#162033',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  profileText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});