import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BodyVisual, {
  BodyViewMode,
  MuscleType,
} from '../components/BodyVisual';
import {
  ExerciseItem,
  WORKOUT_TEMPLATE,
} from '../constants/trainingData';

function parseWorkoutParam(rawWorkout: unknown): ExerciseItem[] {
  if (typeof rawWorkout !== 'string' || rawWorkout.length === 0) {
    return WORKOUT_TEMPLATE;
  }

  try {
    const parsed = JSON.parse(rawWorkout);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return WORKOUT_TEMPLATE;
    }

    const cleaned = parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.primaryMuscle === 'string' &&
        typeof item.sets === 'number' &&
        typeof item.reps === 'string' &&
        typeof item.cue === 'string'
    ) as ExerciseItem[];

    return cleaned.length > 0 ? cleaned : WORKOUT_TEMPLATE;
  } catch {
    return WORKOUT_TEMPLATE;
  }
}

function getMuscleType(primary: string): MuscleType {
  const muscle = primary.toLowerCase();

  if (muscle.includes('chest')) return 'chest';
  if (muscle.includes('delt') || muscle.includes('shoulder')) return 'shoulder';
  if (muscle.includes('triceps')) return 'triceps';
  if (muscle.includes('back') || muscle.includes('lat')) return 'back';

  return 'other';
}

function getVisualCopy(muscleType: MuscleType, bodyView: BodyViewMode) {
  if (bodyView === 'front') {
    if (muscleType === 'chest') {
      return {
        title: 'Front visual active',
        subtitle: 'Chest emphasis engaged',
      };
    }

    if (muscleType === 'shoulder') {
      return {
        title: 'Front visual active',
        subtitle: 'Shoulder emphasis engaged',
      };
    }

    if (muscleType === 'triceps') {
      return {
        title: 'Front visual active',
        subtitle: 'Arm emphasis engaged',
      };
    }

    return {
      title: 'Front visual active',
      subtitle: 'Primary target emphasis',
    };
  }

  if (muscleType === 'back') {
    return {
      title: 'Back visual active',
      subtitle: 'Back emphasis engaged',
    };
  }

  if (muscleType === 'shoulder') {
    return {
      title: 'Back visual active',
      subtitle: 'Rear shoulder position shown',
    };
  }

  if (muscleType === 'triceps') {
    return {
      title: 'Back visual active',
      subtitle: 'Back arm position shown',
    };
  }

  return {
    title: 'Back visual active',
    subtitle: 'Rear body reference view',
  };
}

function getDynamicCoachCue(
  baseCue: string,
  currentSet: number,
  totalSets: number
) {
  if (totalSets <= 1) {
    return {
      phase: 'Single-set focus',
      cue: `Stay precise from the first rep. ${baseCue}`,
    };
  }

  if (currentSet === 1) {
    return {
      phase: 'Technique focus',
      cue: `Set the pattern early. Move cleanly, control the eccentric, and own the setup. ${baseCue}`,
    };
  }

  if (currentSet < totalSets) {
    return {
      phase: 'Tension focus',
      cue: `Keep constant tension through the working range. Do not rush the reps, and stay locked into the target muscle. ${baseCue}`,
    };
  }

  return {
    phase: 'Finish strong',
    cue: `Final set. Stay disciplined, push hard, and keep form intact as fatigue rises. ${baseCue}`,
  };
}

export default function ExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const workout = useMemo(() => parseWorkoutParam(params.workout), [params.workout]);

  const index = useMemo(() => {
    const parsed = parseInt(String(params.index || '0'), 10);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    if (parsed >= workout.length) return workout.length - 1;
    return parsed;
  }, [params.index, workout.length]);

  const exercise = workout[index];
  const totalExercises = workout.length;

  const [currentSet, setCurrentSet] = useState(1);
  const [bodyView, setBodyView] = useState<BodyViewMode>('front');

  if (!exercise) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>No exercise loaded</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/workout')}>
          <Text style={styles.primaryButtonText}>Return to Workout</Text>
        </Pressable>
      </View>
    );
  }

  const isLastSet = currentSet >= exercise.sets;
  const isLastExercise = index >= totalExercises - 1;
  const muscleType = getMuscleType(exercise.primaryMuscle);
  const visualCopy = getVisualCopy(muscleType, bodyView);
  const exerciseProgressPercent = Math.round(((index + 1) / totalExercises) * 100);
  const setProgressPercent = Math.round((currentSet / exercise.sets) * 100);
  const dynamicCoach = getDynamicCoachCue(exercise.cue, currentSet, exercise.sets);

  function handleNext() {
    if (!isLastSet) {
      setCurrentSet((prev) => prev + 1);
      return;
    }

    if (!isLastExercise) {
      router.replace({
        pathname: '/exercise',
        params: {
          workout: JSON.stringify(workout),
          index: String(index + 1),
        },
      });
      return;
    }

    router.replace('/workout');
  }

  function goToWorkout() {
    if (typeof window !== 'undefined') {
      window.location.href = '/workout';
      return;
    }

    router.replace('/workout');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable style={styles.topButton} onPress={goToWorkout}>
          <Text style={styles.topButtonText}>← Workout</Text>
        </Pressable>

        <View style={styles.topPill}>
          <Text style={styles.topPillText}>
            {index + 1}/{totalExercises}
          </Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>BODYFORGE AI</Text>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.subtitle}>Built. Not Given.</Text>
      </View>

      <View style={styles.progressHeaderCard}>
        <Text style={styles.progressHeaderLabel}>Session Progress</Text>

        <View style={styles.progressStatsRow}>
          <View style={styles.progressStatCard}>
            <Text style={styles.progressStatLabel}>Exercise</Text>
            <Text style={styles.progressStatValue}>
              {index + 1} / {totalExercises}
            </Text>
          </View>

          <View style={styles.progressStatCard}>
            <Text style={styles.progressStatLabel}>Set</Text>
            <Text style={styles.progressStatValue}>
              {currentSet} / {exercise.sets}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressBarLabel}>Workout Flow</Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFillPrimary, { width: `${exerciseProgressPercent}%` }]}
            />
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressBarLabel}>Exercise Progress</Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFillSecondary, { width: `${setProgressPercent}%` }]}
            />
          </View>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.sectionLabel}>Primary Target</Text>
            <Text style={styles.heroValue}>{exercise.primaryMuscle}</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {exercise.reps} reps
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Prescription</Text>
            <Text style={styles.metricValue}>{exercise.reps}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Focus</Text>
            <Text style={styles.metricValueSmall}>{exercise.primaryMuscle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Body Visual</Text>

        <BodyVisual
          bodyView={bodyView}
          muscleType={muscleType}
          title={visualCopy.title}
          subtitle={visualCopy.subtitle}
          showToggle
          onChangeView={setBodyView}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.coachHeaderRow}>
          <Text style={styles.cardTitle}>Coach Cue</Text>
          <View style={styles.coachPhasePill}>
            <Text style={styles.coachPhaseText}>{dynamicCoach.phase}</Text>
          </View>
        </View>

        <Text style={styles.bodyText}>{dynamicCoach.cue}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Set</Text>
        <Text style={styles.currentSetValue}>
          Set {currentSet} of {exercise.sets}
        </Text>
        <Text style={styles.currentSetSubtext}>
          Stay controlled and keep tension on the target muscle.
        </Text>
      </View>

      <View style={styles.actionGroup}>
        <Pressable style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {isLastSet
              ? isLastExercise
                ? 'Finish Workout'
                : 'Next Exercise'
              : 'Complete Set'}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => setCurrentSet(1)}>
          <Text style={styles.secondaryButtonText}>Restart Exercise Sets</Text>
        </Pressable>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          The coach cue now shifts by set phase so the training guidance feels more
          responsive and intelligent during the session.
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
    paddingBottom: 40,
  },
  emptyScreen: {
    flex: 1,
    backgroundColor: '#07090D',
    padding: 20,
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#F5F7FB',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  topRow: {
    marginTop: 14,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topButton: {
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
  topPill: {
    backgroundColor: '#111823',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#223046',
  },
  topPillText: {
    color: '#E6ECF5',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    marginBottom: 18,
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
  progressHeaderCard: {
    backgroundColor: '#10151D',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A2230',
    marginBottom: 18,
  },
  progressHeaderLabel: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  progressStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  progressStatCard: {
    flex: 1,
    backgroundColor: '#0D1219',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#18202C',
  },
  progressStatLabel: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressStatValue: {
    color: '#F5F7FB',
    fontSize: 22,
    fontWeight: '800',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBarLabel: {
    color: '#A3AEC0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#151A22',
    overflow: 'hidden',
  },
  progressFillPrimary: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#B18C5A',
  },
  progressFillSecondary: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4E7FFF',
  },
  heroCard: {
    backgroundColor: '#10151D',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A2230',
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
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
  },
  badge: {
    backgroundColor: '#151C27',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#263143',
  },
  badgeText: {
    color: '#E6ECF5',
    fontSize: 13,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0D1219',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#18202C',
  },
  metricLabel: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    color: '#F5F7FB',
    fontSize: 22,
    fontWeight: '800',
  },
  metricValueSmall: {
    color: '#F5F7FB',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#0E131B',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A2230',
    marginBottom: 16,
  },
  coachHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    color: '#22E37D',
    fontSize: 14,
    fontWeight: '800',
  },
  coachPhasePill: {
    backgroundColor: '#151C27',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#263143',
  },
  coachPhaseText: {
    color: '#E6ECF5',
    fontSize: 12,
    fontWeight: '700',
  },
  bodyText: {
    color: '#E5EBF5',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
  },
  currentSetValue: {
    color: '#F5F7FB',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  currentSetSubtext: {
    color: '#A3AEC0',
    fontSize: 14,
    lineHeight: 21,
  },
  actionGroup: {
    gap: 12,
    marginTop: 6,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#07090D',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#151C27',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#263143',
  },
  secondaryButtonText: {
    color: '#E8EEF8',
    fontSize: 14,
    fontWeight: '700',
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