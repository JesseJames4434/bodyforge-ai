import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BodyVisual, {
  BodyViewMode,
  MuscleType,
} from '../../components/BodyVisual';
import {
  COACH_INSIGHT,
  DAILY_FOCUS,
  WORKOUT_TEMPLATE,
} from '../../constants/trainingData';

function getDashboardVisualCopy(
  muscleType: MuscleType,
  bodyView: BodyViewMode
) {
  if (bodyView === 'front') {
    if (muscleType === 'chest') {
      return {
        title: 'Today’s body focus',
        subtitle: 'Front-chain chest emphasis',
      };
    }

    if (muscleType === 'shoulder') {
      return {
        title: 'Today’s body focus',
        subtitle: 'Front-chain shoulder emphasis',
      };
    }

    if (muscleType === 'triceps') {
      return {
        title: 'Today’s body focus',
        subtitle: 'Arm drive and pressing support',
      };
    }

    return {
      title: 'Today’s body focus',
      subtitle: 'Primary target emphasis',
    };
  }

  if (muscleType === 'back') {
    return {
      title: 'Today’s body focus',
      subtitle: 'Rear-chain back emphasis',
    };
  }

  if (muscleType === 'shoulder') {
    return {
      title: 'Today’s body focus',
      subtitle: 'Rear shoulder reference view',
    };
  }

  if (muscleType === 'triceps') {
    return {
      title: 'Today’s body focus',
      subtitle: 'Back arm reference view',
    };
  }

  return {
    title: 'Today’s body focus',
    subtitle: 'Rear body reference view',
  };
}

export default function DashboardScreen() {
  const [bodyView, setBodyView] = useState<BodyViewMode>('front');

  const visualCopy = useMemo(
    () => getDashboardVisualCopy(DAILY_FOCUS.muscleType, bodyView),
    [bodyView]
  );

  const leadExercise = WORKOUT_TEMPLATE[0];
  const exerciseCount = WORKOUT_TEMPLATE.length;

  function goToWorkout() {
    if (typeof window !== 'undefined') {
      window.location.href = '/workout';
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>BODYFORGE AI</Text>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Built. Not Given.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Body Status</Text>

        <BodyVisual
          bodyView={bodyView}
          muscleType={DAILY_FOCUS.muscleType}
          title={visualCopy.title}
          subtitle={visualCopy.subtitle}
          showToggle
          onChangeView={setBodyView}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today’s Focus</Text>
        <Text style={styles.focusTitle}>{DAILY_FOCUS.title}</Text>
        <Text style={styles.focusSubtitle}>{DAILY_FOCUS.subtitle}</Text>

        {leadExercise ? (
          <View style={styles.leadExerciseCard}>
            <Text style={styles.leadExerciseLabel}>Lead Exercise</Text>
            <Text style={styles.leadExerciseName}>{leadExercise.name}</Text>
            <Text style={styles.leadExerciseMeta}>
              {leadExercise.primaryMuscle} • {leadExercise.sets} sets • {leadExercise.reps}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coach Insight</Text>
        <Text style={styles.bodyText}>{COACH_INSIGHT}</Text>
      </View>

      <View style={styles.sessionCard}>
        <View style={styles.sessionHeaderRow}>
          <View>
            <Text style={styles.sessionLabel}>Today’s Session</Text>
            <Text style={styles.sessionTitle}>Guided Training Ready</Text>
          </View>

          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>{exerciseCount} exercises</Text>
          </View>
        </View>

        <Text style={styles.sessionText}>
          Enter today’s sequence and move through the session with visual guidance,
          set progression, and workout flow built around your target muscles.
        </Text>

        {Platform.OS === 'web' ? (
          <button type="button" style={webButtonStyle} onClick={goToWorkout}>
            Begin Today’s Session
          </button>
        ) : (
          <Pressable style={styles.primaryButton} onPress={goToWorkout}>
            <Text style={styles.primaryButtonText}>Begin Today’s Session</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const webButtonStyle: React.CSSProperties = {
  backgroundColor: '#F5F7FB',
  color: '#07090D',
  border: 'none',
  borderRadius: '16px',
  padding: '15px 20px',
  width: '100%',
  fontSize: '15px',
  fontWeight: 800,
  cursor: 'pointer',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07090D',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 14,
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
  card: {
    backgroundColor: '#0E131B',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A2230',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#22E37D',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  focusTitle: {
    color: '#F5F7FB',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  focusSubtitle: {
    color: '#A3AEC0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  leadExerciseCard: {
    backgroundColor: '#10151D',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1A2230',
  },
  leadExerciseLabel: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  leadExerciseName: {
    color: '#F5F7FB',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  leadExerciseMeta: {
    color: '#A3AEC0',
    fontSize: 14,
    lineHeight: 20,
  },
  bodyText: {
    color: '#E5EBF5',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#10151D',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A2230',
    marginBottom: 18,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  sessionLabel: {
    color: '#8E9AAF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sessionTitle: {
    color: '#F5F7FB',
    fontSize: 22,
    fontWeight: '800',
  },
  sessionBadge: {
    backgroundColor: '#151C27',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#263143',
  },
  sessionBadgeText: {
    color: '#E6ECF5',
    fontSize: 13,
    fontWeight: '700',
  },
  sessionText: {
    color: '#A3AEC0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
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
});