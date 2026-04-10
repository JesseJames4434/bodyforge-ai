import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  getExerciseById,
  getExerciseOrder,
} from '../../constants/trainingData';

export default function WorkoutScreen() {
  const router = useRouter();

  const exerciseIds = getExerciseOrder();
  const exercises = exerciseIds.map((id) => getExerciseById(id));

  function startExercise(exerciseId: string) {
    router.push({
      pathname: '/exercise',
      params: {
        exerciseId,
        set: '1',
        totalSets: '3',
      },
    });
  }

  function startFullWorkout() {
    if (exerciseIds.length === 0) return;

    router.push({
      pathname: '/exercise',
      params: {
        exerciseId: exerciseIds[0],
        set: '1',
        totalSets: '3',
      },
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Workout</Text>
        <Text style={styles.title}>Today's Session</Text>
        <Text style={styles.subtitle}>
          Move through each exercise with posture-driven guidance.
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={startFullWorkout}>
        <Text style={styles.primaryButtonText}>Start Full Workout</Text>
      </Pressable>

      <View style={styles.list}>
        {exercises.map((exercise, index) => (
          <Pressable
            key={exercise.id}
            style={styles.card}
            onPress={() => startExercise(exercise.id)}
          >
            <View style={styles.cardTop}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexBadgeText}>{index + 1}</Text>
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{exercise.name}</Text>
                <Text style={styles.cardSubtitle}>
                  Default view: {exercise.defaultBodySide}
                </Text>
              </View>
            </View>

            <View style={styles.muscleBlock}>
              <Text style={styles.muscleLabel}>Primary muscles</Text>
              <Text style={styles.muscleValue}>
                {exercise.muscles[exercise.defaultBodySide].join(' • ')}
              </Text>
            </View>

            <View style={styles.stateRow}>
              <View style={styles.statePill}>
                <Text style={styles.statePillText}>Setup</Text>
              </View>
              <View style={styles.statePill}>
                <Text style={styles.statePillText}>Stretch</Text>
              </View>
              <View style={styles.statePill}>
                <Text style={styles.statePillText}>Contraction</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030712',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 36,
  },
  header: {
    gap: 6,
    marginTop: 12,
  },
  eyebrow: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#f9fafb',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#f97316',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  muscleBlock: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 4,
  },
  muscleLabel: {
    color: '#9ca3af',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  muscleValue: {
    color: '#f9fafb',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  stateRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statePill: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statePillText: {
    color: '#f9fafb',
    fontSize: 12,
    fontWeight: '700',
  },
});