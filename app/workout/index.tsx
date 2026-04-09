import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  WORKOUT_TEMPLATE,
  serializeWorkout,
} from '../../constants/trainingData';

export default function WorkoutScreen() {
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);

  function beginExerciseFlow() {
    router.push({
      pathname: '/exercise',
      params: {
        workout: serializeWorkout(),
        index: '0',
      },
    });
  }

  function openExercise(index: number) {
    router.push({
      pathname: '/exercise',
      params: {
        workout: serializeWorkout(),
        index: String(index),
      },
    });
  }

  function goToDashboard() {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
      return;
    }

    router.push('/dashboard');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable style={styles.topButton} onPress={goToDashboard}>
          <Text style={styles.topButtonText}>← Dashboard</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>BODYFORGE AI</Text>
        <Text style={styles.title}>Today&apos;s Workout</Text>
        <Text style={styles.subtitle}>Built. Not Given.</Text>
      </View>

      {!sessionReady ? (
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Session Overview</Text>
          <Text style={styles.heroValue}>
            {WORKOUT_TEMPLATE.length} Exercises Loaded
          </Text>
          <Text style={styles.heroSupport}>
            Today&apos;s session is ready. Review the sequence, lock in your focus,
            and enter the guided workout when you&apos;re ready.
          </Text>

          <View style={styles.sessionInfoRow}>
            <View style={styles.sessionInfoCard}>
              <Text style={styles.sessionInfoLabel}>Lead Exercise</Text>
              <Text style={styles.sessionInfoValue}>
                {WORKOUT_TEMPLATE[0]?.name ?? 'Workout Ready'}
              </Text>
            </View>

            <View style={styles.sessionInfoCard}>
              <Text style={styles.sessionInfoLabel}>Format</Text>
              <Text style={styles.sessionInfoValue}>Guided Flow</Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => setSessionReady(true)}
          >
            <Text style={styles.primaryButtonText}>Start Workout</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.sessionStartCard}>
          <Text style={styles.heroLabel}>Session Ready</Text>
          <Text style={styles.sessionStartTitle}>Enter Guided Training</Text>
          <Text style={styles.heroSupport}>
            Move into your first exercise and let the workout flow guide the rest
            of the session.
          </Text>

          <View style={styles.sequencePreview}>
            {WORKOUT_TEMPLATE.map((exercise, index) => (
              <View key={exercise.id} style={styles.sequenceRow}>
                <View style={styles.sequenceNumberWrap}>
                  <Text style={styles.sequenceNumber}>{index + 1}</Text>
                </View>

                <View style={styles.sequenceInfo}>
                  <Text style={styles.sequenceName}>{exercise.name}</Text>
                  <Text style={styles.sequenceMeta}>
                    {exercise.primaryMuscle} • {exercise.sets} sets • {exercise.reps}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sessionActionRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setSessionReady(false)}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>

            <Pressable style={styles.primaryButtonFlex} onPress={beginExerciseFlow}>
              <Text style={styles.primaryButtonText}>Begin Session</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise List</Text>

        {WORKOUT_TEMPLATE.map((exercise, index) => (
          <Pressable
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => openExercise(index)}
          >
            <View style={styles.exerciseNumberWrap}>
              <Text style={styles.exerciseNumber}>{index + 1}</Text>
            </View>

            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseMeta}>
                {exercise.primaryMuscle} • {exercise.sets} sets • {exercise.reps}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          The workout screen now has a clear session-entry moment before dropping
          the user into the first exercise.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07090D',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  topRow: {
    marginTop: 14,
    marginBottom: 12,
  },
  topButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#151C27',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#263143',
  },
  topButtonText: {
    color: '#F5F7FB',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    color: '#7C8799',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#F5F7FB',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#8E9AAF',
    fontSize: 14,
    fontWeight: '500',
  },
  heroCard: {
    backgroundColor: '#10151D',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A2230',
    marginBottom: 22,
  },
  sessionStartCard: {
    backgroundColor: '#10151D',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A2230',
    marginBottom: 22,
  },
  heroLabel: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroValue: {
    color: '#F5F7FB',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  sessionStartTitle: {
    color: '#F5F7FB',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSupport: {
    color: '#94A0B4',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sessionInfoCard: {
    flex: 1,
    backgroundColor: '#0D1219',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#18202C',
  },
  sessionInfoLabel: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sessionInfoValue: {
    color: '#F5F7FB',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  sequencePreview: {
    marginBottom: 16,
  },
  sequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1219',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#18202C',
    marginBottom: 10,
  },
  sequenceNumberWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#151C27',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sequenceNumber: {
    color: '#F5F7FB',
    fontSize: 14,
    fontWeight: '800',
  },
  sequenceInfo: {
    flex: 1,
  },
  sequenceName: {
    color: '#F5F7FB',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  sequenceMeta: {
    color: '#97A3B7',
    fontSize: 13,
    lineHeight: 18,
  },
  sessionActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonFlex: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#07090D',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    width: 100,
    backgroundColor: '#151C27',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#263143',
  },
  secondaryButtonText: {
    color: '#E8EEF8',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: '#F5F7FB',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#0D1219',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#18202C',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumberWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#151C27',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  exerciseNumber: {
    color: '#F5F7FB',
    fontSize: 15,
    fontWeight: '800',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#F5F7FB',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseMeta: {
    color: '#97A3B7',
    fontSize: 13,
    lineHeight: 18,
  },
  noteCard: {
    backgroundColor: '#0D1219',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#18202C',
  },
  noteText: {
    color: '#9BA8BC',
    fontSize: 14,
    lineHeight: 21,
  },
});