import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BodyVisualAssetBased from '../components/BodyVisualAssetBased';
import {
  getCoachingCueForSet,
  getExerciseById,
  getNextExerciseId,
  type PostureStateKey,
} from '../constants/trainingData';

function getMovementFocus(state: PostureStateKey) {
  if (state === 'setup') {
    return 'Build your position before the rep starts.';
  }

  if (state === 'stretch') {
    return 'Stay controlled at depth and keep tension loaded.';
  }

  return 'Finish with intent and keep the rep clean.';
}

export default function ExerciseScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    exerciseId?: string;
    set?: string;
    totalSets?: string;
  }>();

  const exercise = useMemo(
    () => getExerciseById(params.exerciseId),
    [params.exerciseId]
  );

  const currentSet = Number(params.set ?? 1);
  const totalSets = Number(params.totalSets ?? 3);

  const [selectedState, setSelectedState] =
    useState<PostureStateKey>('setup');
  const [bodySide, setBodySide] = useState(exercise.defaultBodySide);

  const postureState = exercise.postureStates[selectedState];
  const coachingCue = getCoachingCueForSet(exercise, currentSet, totalSets);
  const movementFocus = getMovementFocus(selectedState);

  function handleCompleteSet() {
    const nextSet = currentSet + 1;

    if (nextSet <= totalSets) {
      router.replace({
        pathname: '/exercise',
        params: {
          exerciseId: exercise.id,
          set: String(nextSet),
          totalSets: String(totalSets),
        },
      });
      return;
    }

    const nextExerciseId = getNextExerciseId(exercise.id);

    if (nextExerciseId) {
      router.replace({
        pathname: '/exercise',
        params: {
          exerciseId: nextExerciseId,
          set: '1',
          totalSets: String(totalSets),
        },
      });
      return;
    }

    router.replace('/workout');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBlock}>
        <Text style={styles.eyebrow}>Exercise</Text>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.setProgress}>
          Set {currentSet} of {totalSets}
        </Text>
      </View>

      <BodyVisualAssetBased
        side={bodySide}
        visualProfile={exercise.visualProfile}
        highlightedMuscles={exercise.muscles[bodySide]}
        postureState={postureState}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Posture State</Text>

        <View style={styles.segmentRow}>
          {(['setup', 'stretch', 'contraction'] as PostureStateKey[]).map(
            (stateKey) => {
              const item = exercise.postureStates[stateKey];
              const active = selectedState === stateKey;

              return (
                <Pressable
                  key={stateKey}
                  onPress={() => setSelectedState(stateKey)}
                  style={[
                    styles.segmentButton,
                    active && styles.segmentButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      active && styles.segmentButtonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>{postureState.shortCue}</Text>
          <Text style={styles.stateBody}>{postureState.detailCue}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Movement Focus</Text>
        <View style={styles.focusBox}>
          <Text style={styles.focusText}>{movementFocus}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>View</Text>

        <View style={styles.segmentRow}>
          {(['front', 'back'] as const).map((side) => {
            const active = bodySide === side;

            return (
              <Pressable
                key={side}
                onPress={() => setBodySide(side)}
                style={[
                  styles.segmentButton,
                  active && styles.segmentButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    active && styles.segmentButtonTextActive,
                  ]}
                >
                  {side === 'front' ? 'Front' : 'Back'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coaching</Text>
        <Text style={styles.coachingText}>{coachingCue}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={handleCompleteSet}>
          <Text style={styles.primaryButtonText}>
            {currentSet < totalSets ? 'Complete Set' : 'Finish Exercise'}
          </Text>
        </Pressable>
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
  topBlock: {
    gap: 6,
    marginTop: 12,
  },
  eyebrow: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exerciseName: {
    color: '#f9fafb',
    fontSize: 30,
    fontWeight: '800',
  },
  setProgress: {
    color: '#cbd5e1',
    fontSize: 14,
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
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  segmentButton: {
    flexGrow: 1,
    minWidth: 90,
    backgroundColor: '#0b1220',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#243041',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  segmentButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '700',
  },
  segmentButtonTextActive: {
    color: '#ffffff',
  },
  stateBox: {
    backgroundColor: '#0b1220',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 6,
  },
  stateTitle: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '700',
  },
  stateBody: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  focusBox: {
    backgroundColor: '#0b1220',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  focusText: {
    color: '#f3f4f6',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  coachingText: {
    color: '#f3f4f6',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
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