import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { getExerciseById } from '../constants/trainingData';

const FALLBACK_TITLE = 'Exercise';

function normalizeExerciseId(
  raw: string | string[] | undefined
): string | undefined {
  if (raw === undefined) return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export default function ExerciseScreen() {
  const { exerciseId: exerciseIdParam } = useLocalSearchParams<{
    exerciseId?: string | string[];
  }>();

  const exerciseId = normalizeExerciseId(exerciseIdParam);

  const resolved = getExerciseById(exerciseId);
  const isValid = Boolean(exerciseId) && resolved.id === exerciseId;
  const title = isValid ? resolved.name : FALLBACK_TITLE;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.avatarWrap}>
        <Image
          source={require('../assets/avatar/base-body.png')}
          style={styles.image}
        />
        <Image
          source={require('../assets/avatar/chest.png')}
          style={[styles.image, styles.overlay]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarWrap: {
    width: 300,
    height: 500,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    opacity: 1,
  },
});
