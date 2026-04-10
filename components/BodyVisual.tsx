import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BodySide = 'front' | 'back';
type VisualProfile = 'press' | 'hinge' | 'curl';

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
  visualProfile?: VisualProfile;
};

function getPoseLabel(postureState?: PostureState) {
  const label = postureState?.label?.toLowerCase();

  if (label === 'setup') return 'ATHLETIC SETUP';
  if (label === 'stretch') return 'LOADED STRETCH';
  if (label === 'contraction') return 'PEAK CONTRACTION';

  return 'NEUTRAL';
}

function getProfiledFigureStyles(
  visualProfile: VisualProfile,
  postureState?: PostureState
) {
  const state = postureState?.label?.toLowerCase() ?? 'setup';

  if (visualProfile === 'hinge') {
    if (state === 'stretch') {
      return {
        torso: styles.torsoHingeStretch,
        leftArm: styles.leftArmHingeStretch,
        rightArm: styles.rightArmHingeStretch,
        leftLeg: styles.leftLegHingeStretch,
        rightLeg: styles.rightLegHingeStretch,
      };
    }

    if (state === 'contraction') {
      return {
        torso: styles.torsoHingeContraction,
        leftArm: styles.leftArmHingeContraction,
        rightArm: styles.rightArmHingeContraction,
        leftLeg: styles.leftLegHingeContraction,
        rightLeg: styles.rightLegHingeContraction,
      };
    }

    return {
      torso: styles.torsoHingeSetup,
      leftArm: styles.leftArmHingeSetup,
      rightArm: styles.rightArmHingeSetup,
      leftLeg: styles.leftLegHingeSetup,
      rightLeg: styles.rightLegHingeSetup,
    };
  }

  if (visualProfile === 'curl') {
    if (state === 'stretch') {
      return {
        torso: styles.torsoCurlStretch,
        leftArm: styles.leftArmCurlStretch,
        rightArm: styles.rightArmCurlStretch,
        leftLeg: styles.leftLegCurlStretch,
        rightLeg: styles.rightLegCurlStretch,
      };
    }

    if (state === 'contraction') {
      return {
        torso: styles.torsoCurlContraction,
        leftArm: styles.leftArmCurlContraction,
        rightArm: styles.rightArmCurlContraction,
        leftLeg: styles.leftLegCurlContraction,
        rightLeg: styles.rightLegCurlContraction,
      };
    }

    return {
      torso: styles.torsoCurlSetup,
      leftArm: styles.leftArmCurlSetup,
      rightArm: styles.rightArmCurlSetup,
      leftLeg: styles.leftLegCurlSetup,
      rightLeg: styles.rightLegCurlSetup,
    };
  }

  if (state === 'stretch') {
    return {
      torso: styles.torsoPressStretch,
      leftArm: styles.leftArmPressStretch,
      rightArm: styles.rightArmPressStretch,
      leftLeg: styles.leftLegPressStretch,
      rightLeg: styles.rightLegPressStretch,
    };
  }

  if (state === 'contraction') {
    return {
      torso: styles.torsoPressContraction,
      leftArm: styles.leftArmPressContraction,
      rightArm: styles.rightArmPressContraction,
      leftLeg: styles.leftLegPressContraction,
      rightLeg: styles.rightLegPressContraction,
    };
  }

  return {
    torso: styles.torsoPressSetup,
    leftArm: styles.leftArmPressSetup,
    rightArm: styles.rightArmPressSetup,
    leftLeg: styles.leftLegPressSetup,
    rightLeg: styles.rightLegPressSetup,
  };
}

function getMuscleHighlightTone(postureState?: PostureState) {
  const label = postureState?.label?.toLowerCase();

  if (label === 'stretch') return styles.highlightStretch;
  if (label === 'contraction') return styles.highlightContraction;

  return styles.highlightSetup;
}

function getFocusCue(
  visualProfile: VisualProfile,
  postureState?: PostureState
) {
  const state = postureState?.label?.toLowerCase();

  if (visualProfile === 'hinge') {
    if (state === 'setup') return 'Focus: brace hard and own the hinge start.';
    if (state === 'stretch') return 'Focus: send hips back and load hamstrings.';
    return 'Focus: drive hips through and finish tall.';
  }

  if (visualProfile === 'curl') {
    if (state === 'setup') return 'Focus: pin the elbows and remove swing.';
    if (state === 'stretch') return 'Focus: lengthen fully without losing tension.';
    return 'Focus: squeeze the biceps and keep shoulders quiet.';
  }

  if (state === 'setup') return 'Focus: brace, align, and prepare.';
  if (state === 'stretch') return 'Focus: control depth and stay loaded.';
  if (state === 'contraction') return 'Focus: squeeze hard and finish clean.';

  return 'Focus: stay controlled.';
}

function formatMuscleList(highlightedMuscles: string[]) {
  if (highlightedMuscles.length === 0) return 'None selected';

  return highlightedMuscles.join(' • ');
}

export default function BodyVisual({
  side,
  highlightedMuscles,
  postureState,
  visualProfile = 'press',
}: Props) {
  const poseLabel = getPoseLabel(postureState);
  const figureStyles = getProfiledFigureStyles(visualProfile, postureState);
  const highlightTone = getMuscleHighlightTone(postureState);
  const focusCue = getFocusCue(visualProfile, postureState);

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
              <View style={[styles.torsoHighlight, highlightTone]} />
              <Text style={styles.sideText}>
                {side === 'front' ? 'FRONT' : 'BACK'}
              </Text>
            </View>

            <View
              style={[
                styles.armBase,
                styles.leftArmBase,
                figureStyles.leftArm,
                highlightTone,
              ]}
            />
            <View
              style={[
                styles.armBase,
                styles.rightArmBase,
                figureStyles.rightArm,
                highlightTone,
              ]}
            />

            <View
              style={[
                styles.legBase,
                styles.leftLegBase,
                figureStyles.leftLeg,
                highlightTone,
              ]}
            />
            <View
              style={[
                styles.legBase,
                styles.rightLegBase,
                figureStyles.rightLeg,
                highlightTone,
              ]}
            />
          </View>
        </View>

        <View style={styles.focusBox}>
          <Text style={styles.focusLabel}>Movement Focus</Text>
          <Text style={styles.focusText}>{focusCue}</Text>
        </View>

        <View style={styles.muscleBox}>
          <Text style={styles.muscleLabel}>Active Muscles</Text>
          <Text style={styles.muscleValue}>
            {formatMuscleList(highlightedMuscles)}
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
    overflow: 'hidden',
  },
  torsoHighlight: {
    position: 'absolute',
    width: 42,
    height: 58,
    borderRadius: 14,
    opacity: 0.95,
  },

  torsoPressSetup: {
    marginTop: 0,
  },
  torsoPressStretch: {
    marginTop: 10,
    transform: [{ rotate: '8deg' }],
  },
  torsoPressContraction: {
    marginTop: -2,
    transform: [{ rotate: '-6deg' }],
  },

  torsoHingeSetup: {
    marginTop: 0,
  },
  torsoHingeStretch: {
    marginTop: 18,
    transform: [{ rotate: '18deg' }],
  },
  torsoHingeContraction: {
    marginTop: 2,
    transform: [{ rotate: '4deg' }],
  },

  torsoCurlSetup: {
    marginTop: 0,
  },
  torsoCurlStretch: {
    marginTop: 4,
  },
  torsoCurlContraction: {
    marginTop: 0,
  },

  sideText: {
    color: '#f9fafb',
    fontSize: 11,
    fontWeight: '700',
    zIndex: 1,
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

  leftArmPressSetup: {
    transform: [{ rotate: '18deg' }],
  },
  rightArmPressSetup: {
    transform: [{ rotate: '-18deg' }],
  },
  leftArmPressStretch: {
    transform: [{ rotate: '42deg' }],
  },
  rightArmPressStretch: {
    transform: [{ rotate: '-42deg' }],
  },
  leftArmPressContraction: {
    transform: [{ rotate: '-20deg' }],
    top: 58,
  },
  rightArmPressContraction: {
    transform: [{ rotate: '20deg' }],
    top: 58,
  },

  leftArmHingeSetup: {
    transform: [{ rotate: '8deg' }],
    top: 50,
  },
  rightArmHingeSetup: {
    transform: [{ rotate: '-8deg' }],
    top: 50,
  },
  leftArmHingeStretch: {
    transform: [{ rotate: '20deg' }],
    top: 72,
  },
  rightArmHingeStretch: {
    transform: [{ rotate: '-20deg' }],
    top: 72,
  },
  leftArmHingeContraction: {
    transform: [{ rotate: '10deg' }],
    top: 54,
  },
  rightArmHingeContraction: {
    transform: [{ rotate: '-10deg' }],
    top: 54,
  },

  leftArmCurlSetup: {
    transform: [{ rotate: '10deg' }],
    top: 48,
  },
  rightArmCurlSetup: {
    transform: [{ rotate: '-10deg' }],
    top: 48,
  },
  leftArmCurlStretch: {
    transform: [{ rotate: '6deg' }],
    top: 54,
  },
  rightArmCurlStretch: {
    transform: [{ rotate: '-6deg' }],
    top: 54,
  },
  leftArmCurlContraction: {
    transform: [{ rotate: '-38deg' }],
    top: 52,
  },
  rightArmCurlContraction: {
    transform: [{ rotate: '38deg' }],
    top: 52,
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

  leftLegPressSetup: {
    transform: [{ rotate: '6deg' }],
  },
  rightLegPressSetup: {
    transform: [{ rotate: '-6deg' }],
  },
  leftLegPressStretch: {
    transform: [{ rotate: '12deg' }],
    top: 122,
  },
  rightLegPressStretch: {
    transform: [{ rotate: '-12deg' }],
    top: 122,
  },
  leftLegPressContraction: {
    transform: [{ rotate: '2deg' }],
    top: 116,
  },
  rightLegPressContraction: {
    transform: [{ rotate: '-2deg' }],
    top: 116,
  },

  leftLegHingeSetup: {
    transform: [{ rotate: '4deg' }],
  },
  rightLegHingeSetup: {
    transform: [{ rotate: '-4deg' }],
  },
  leftLegHingeStretch: {
    transform: [{ rotate: '16deg' }],
    top: 126,
  },
  rightLegHingeStretch: {
    transform: [{ rotate: '-16deg' }],
    top: 126,
  },
  leftLegHingeContraction: {
    transform: [{ rotate: '6deg' }],
    top: 118,
  },
  rightLegHingeContraction: {
    transform: [{ rotate: '-6deg' }],
    top: 118,
  },

  leftLegCurlSetup: {
    transform: [{ rotate: '5deg' }],
  },
  rightLegCurlSetup: {
    transform: [{ rotate: '-5deg' }],
  },
  leftLegCurlStretch: {
    transform: [{ rotate: '5deg' }],
  },
  rightLegCurlStretch: {
    transform: [{ rotate: '-5deg' }],
  },
  leftLegCurlContraction: {
    transform: [{ rotate: '5deg' }],
  },
  rightLegCurlContraction: {
    transform: [{ rotate: '-5deg' }],
  },

  highlightSetup: {
    backgroundColor: '#fb923c',
  },
  highlightStretch: {
    backgroundColor: '#f59e0b',
  },
  highlightContraction: {
    backgroundColor: '#f97316',
  },
  focusBox: {
    backgroundColor: '#0b1220',
    borderRadius: 12,
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
    color: '#f9fafb',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
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
    lineHeight: 18,
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