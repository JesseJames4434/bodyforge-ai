import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getExerciseById, getExerciseOrder } from '../../constants/trainingData';

export default function DashboardScreen() {
  const router = useRouter();

  const exerciseIds = getExerciseOrder();
  const exercises = exerciseIds.map((id) => getExerciseById(id));
  const nextExercise = exercises[0];
  const totalExercises = exercises.length;

  function startWorkout() {
    router.push('/workout');
  }

  function jumpToNextExercise() {
    router.push({
      pathname: '/exercise',
      params: {
        exerciseId: nextExercise.id,
        set: '1',
        totalSets: '3',
      },
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Bodyforge AI</Text>
        <Text style={styles.title}>Built. Not Given.</Text>
        <Text style={styles.subtitle}>
          Visual-first training with posture-state guidance and muscle-aware
          coaching.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Exercises Today</Text>
          <Text style={styles.statValue}>{totalExercises}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Sets Per Exercise</Text>
          <Text style={styles.statValue}>3</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Up</Text>
        <Text style={styles.exerciseName}>{nextExercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          Default view: {nextExercise.defaultBodySide}
        </Text>

        <View style={styles.muscleBox}>
          <Text style={styles.muscleLabel}>Primary muscles</Text>
          <Text style={styles.muscleValue}>
            {nextExercise.muscles[nextExercise.defaultBodySide].join(' • ')}
          </Text>
        </View>

        <View style={styles.focusBox}>
          <Text style={styles.focusLabel}>Focus</Text>
          <Text style={styles.focusText}>{nextExercise.dashboardFocus}</Text>
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

        <Pressable style={styles.secondaryButton} onPress={jumpToNextExercise}>
          <Text style={styles.secondaryButtonText}>Open Next Exercise</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Focus</Text>

        <View style={styles.focusList}>
          {exercises.map((exercise) => (
            <View key={exercise.id} style={styles.focusItem}>
              <View style={styles.focusDot} />
              <View style={styles.focusItemText}>
                <Text style={styles.focusExerciseName}>{exercise.name}</Text>
                <Text style={styles.focusExerciseText}>
                  {exercise.dashboardFocus}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Session Flow</Text>

        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.flowRow}>
            <View style={styles.flowBadge}>
              <Text style={styles.flowBadgeText}>{index + 1}</Text>
            </View>

            <View style={styles.flowText}>
              <Text style={styles.flowName}>{exercise.name}</Text>
              <Text style={styles.flowMeta}>
                {exercise.muscles[exercise.defaultBodySide].join(' • ')}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={startWorkout}>
        <Text style={styles.primaryButtonText}>Start Workout</Text>
      </Pressable>
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
  hero: {
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
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 6,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    color: '#f9fafb',
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  cardTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  exerciseName: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '800',
  },
  exerciseMeta: {
    color: '#9ca3af',
    fontSize: 13,
  },
  muscleBox: {
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
  focusBox: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 4,
  },
  focusLabel: {
    color: '#9ca3af',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  focusText: {
    color: '#f3f4f6',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
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
  focusList: {
    gap: 12,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  focusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
    marginTop: 6,
  },
  focusItemText: {
    flex: 1,
    gap: 3,
  },
  focusExerciseName: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '700',
  },
  focusExerciseText: {
    color: '#f3f4f6',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  flowBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  flowText: {
    flex: 1,
    gap: 2,
  },
  flowName: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '700',
  },
  flowMeta: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  secondaryButton: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '700',
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
});