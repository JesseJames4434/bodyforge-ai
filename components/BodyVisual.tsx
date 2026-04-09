import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BodySide = 'front' | 'back';

type PostureState = {
  label: string;
  shortCue: string;
  detailCue: string;
  overlay?: string;
};

type Props = {
  side: BodySide;
  highlightedMuscles: string[];
  postureState?: PostureState;
};

function getPoseLabel(postureState?: PostureState) {
  const label = postureState?.label?.toLowerCase();

  if (label === 'setup') return 'ATHLETIC SETUP';
  if (label === 'stretch') return 'LOADED STRETCH';
  if (label === 'contraction') return 'PEAK CONTRACTION';

  return 'NEUTRAL';
}

function getFigureStyles(postureState?: PostureState) {
  const label = postureState?.label?.toLowerCase();

  if (label === 'stretch') {
    return {
      torso: styles.torsoStretch,
      leftArm: styles.leftArmStretch,
      rightArm: styles.rightArmStretch,
      leftLeg: styles.leftLegStretch,
      rightLeg: styles.rightLegStretch,
    };
  }

  if (label === 'contraction') {
    return {
      torso: styles.torsoContraction,
      leftArm: styles.leftArmContraction,
      rightArm: styles.rightArmContraction,
      leftLeg: styles.leftLegContraction,
      rightLeg: styles.rightLegContraction,
    };
  }

  return {
    torso: styles.torsoSetup,
    leftArm: styles.leftArmSetup,
    rightArm: styles.rightArmSetup,
    leftLeg: styles.leftLegSetup,
    rightLeg: styles.rightLegSetup,
  };
}

export default function BodyVisual({
  side,
  highlightedMuscles,
  postureState,
}: Props) {
  const poseLabel = getPoseLabel(postureState);
  const figureStyles = getFigureStyles(postureState);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Body Visual</Text>
            <Text style={styles.title}>
              {side === 'front' ? 'Front View' : 'Back View'}
            </Text>
          </View>

          {postureState?.overlay ? (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{postureState.overlay}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stage}>
          <Text style={styles.poseLabel}>{poseLabel}</Text>

          <View style={styles.figureWrap}>
            <View style={styles.head} />

            <View style={[styles.torsoBase, figureStyles.torso]}>
              <Text style={styles.sideText}>
                {side === 'front' ? 'FRONT' : 'BACK'}
              </Text>
            </View>

            <View style={[styles.armBase, styles.leftArmBase, figureStyles.leftArm]} />
            <View style={[styles.armBase, styles.rightArmBase, figureStyles.rightArm]} />

            <View style={[styles.legBase, styles.leftLegBase, figureStyles.leftLeg]} />
            <View style={[styles.legBase, styles.rightLegBase, figureStyles.rightLeg]} />
          </View>
        </View>

        <View style={styles.muscleBox}>
          <Text style={styles.muscleLabel}>Active Muscles</Text>
          <Text style={styles.muscleValue}>
            {highlightedMuscles.length > 0
              ? highlightedMuscles.join(', ')
              : 'None selected'}
          </Text>
        </View>

        {postureState ? (
          <View style={styles.statePill}>
            <Text style={styles.stateText}>{postureState.label}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '700',
  },
  overlay: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  stage: {
    height: 280,
    borderRadius: 20,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  poseLabel: {
    position: 'absolute',
    top: 14,
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  figureWrap: {
    width: 180,
    height: 210,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  head: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6b7280',
    marginBottom: 8,
  },
  torsoBase: {
    width: 68,
    height: 88,
    borderRadius: 18,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  torsoSetup: {
    marginTop: 0,
  },
  torsoStretch: {
    marginTop: 10,
    transform: [{ rotate: '8deg' }],
  },
  torsoContraction: {
    marginTop: -2,
    transform: [{ rotate: '-6deg' }],
  },
  sideText: {
    color: '#f9fafb',
    fontSize: 11,
    fontWeight: '700',
  },
  armBase: {
    position: 'absolute',
    width: 18,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#4b5563',
    top: 46,
  },
  leftArmBase: {
    left: 34,
  },
  rightArmBase: {
    right: 34,
  },
  leftArmSetup: {
    transform: [{ rotate: '18deg' }],
  },
  rightArmSetup: {
    transform: [{ rotate: '-18deg' }],
  },
  leftArmStretch: {
    transform: [{ rotate: '42deg' }],
  },
  rightArmStretch: {
    transform: [{ rotate: '-42deg' }],
  },
  leftArmContraction: {
    transform: [{ rotate: '-20deg' }],
    top: 58,
  },
  rightArmContraction: {
    transform: [{ rotate: '20deg' }],
    top: 58,
  },
  legBase: {
    position: 'absolute',
    width: 20,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#374151',
    top: 118,
  },
  leftLegBase: {
    left: 60,
  },
  rightLegBase: {
    right: 60,
  },
  leftLegSetup: {
    transform: [{ rotate: '6deg' }],
  },
  rightLegSetup: {
    transform: [{ rotate: '-6deg' }],
  },
  leftLegStretch: {
    transform: [{ rotate: '12deg' }],
    top: 122,
  },
  rightLegStretch: {
    transform: [{ rotate: '-12deg' }],
    top: 122,
  },
  leftLegContraction: {
    transform: [{ rotate: '2deg' }],
    top: 116,
  },
  rightLegContraction: {
    transform: [{ rotate: '-2deg' }],
    top: 116,
  },
  muscleBox: {
    backgroundColor: '#0b1220',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  muscleLabel: {
    color: '#9ca3af',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  muscleValue: {
    color: '#f9fafb',
    fontSize: 13,
    fontWeight: '600',
  },
  statePill: {
    alignSelf: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stateText: {
    color: '#f9fafb',
    fontSize: 12,
    fontWeight: '700',
  },
});