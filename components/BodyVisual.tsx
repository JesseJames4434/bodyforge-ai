import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type {
  BodySide,
  MuscleGroup,
  PosePreset,
  PostureStateDefinition,
} from '../constants/trainingData';

type BodyVisualProps = {
  side?: BodySide;
  highlightedMuscles?: MuscleGroup[];
  postureState?: PostureStateDefinition;
};

type FigurePose = {
  torsoRotate: string;
  leftUpperArmRotate: string;
  rightUpperArmRotate: string;
  leftForearmRotate: string;
  rightForearmRotate: string;
  leftThighRotate: string;
  rightThighRotate: string;
  leftCalfRotate: string;
  rightCalfRotate: string;
};

const POSES: Record<PosePreset, FigurePose> = {
  'standing-neutral': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-12deg',
    rightUpperArmRotate: '12deg',
    leftForearmRotate: '-4deg',
    rightForearmRotate: '4deg',
    leftThighRotate: '2deg',
    rightThighRotate: '-2deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
  'press-stretch': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-55deg',
    rightUpperArmRotate: '55deg',
    leftForearmRotate: '-78deg',
    rightForearmRotate: '78deg',
    leftThighRotate: '2deg',
    rightThighRotate: '-2deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
  'press-contraction': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-20deg',
    rightUpperArmRotate: '20deg',
    leftForearmRotate: '-12deg',
    rightForearmRotate: '12deg',
    leftThighRotate: '2deg',
    rightThighRotate: '-2deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
  'hinge-setup': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-10deg',
    rightUpperArmRotate: '10deg',
    leftForearmRotate: '-6deg',
    rightForearmRotate: '6deg',
    leftThighRotate: '4deg',
    rightThighRotate: '-4deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
  'hinge-stretch': {
    torsoRotate: '28deg',
    leftUpperArmRotate: '4deg',
    rightUpperArmRotate: '-4deg',
    leftForearmRotate: '10deg',
    rightForearmRotate: '-10deg',
    leftThighRotate: '18deg',
    rightThighRotate: '-18deg',
    leftCalfRotate: '-8deg',
    rightCalfRotate: '8deg',
  },
  'hinge-contraction': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-6deg',
    rightUpperArmRotate: '6deg',
    leftForearmRotate: '0deg',
    rightForearmRotate: '0deg',
    leftThighRotate: '4deg',
    rightThighRotate: '-4deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
  'curl-setup': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-8deg',
    rightUpperArmRotate: '8deg',
    leftForearmRotate: '-6deg',
    rightForearmRotate: '6deg',
    leftThighRotate: '2deg',
    rightThighRotate: '-2deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
  'curl-stretch': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-6deg',
    rightUpperArmRotate: '6deg',
    leftForearmRotate: '6deg',
    rightForearmRotate: '-6deg',
    leftThighRotate: '2deg',
    rightThighRotate: '-2deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
  'curl-contraction': {
    torsoRotate: '0deg',
    leftUpperArmRotate: '-4deg',
    rightUpperArmRotate: '4deg',
    leftForearmRotate: '-95deg',
    rightForearmRotate: '95deg',
    leftThighRotate: '2deg',
    rightThighRotate: '-2deg',
    leftCalfRotate: '0deg',
    rightCalfRotate: '0deg',
  },
};

export default function BodyVisual({
  side = 'front',
  highlightedMuscles = [],
  postureState,
}: BodyVisualProps) {
  const pose = POSES[postureState?.posePreset ?? 'standing-neutral'];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Body Visual</Text>
          <Text style={styles.title}>
            {postureState?.label ?? 'Setup'} Position
          </Text>
        </View>

        <View style={styles.sideBadge}>
          <Text style={styles.sideBadgeText}>
            {side === 'front' ? 'Front View' : 'Back View'}
          </Text>
        </View>
      </View>

      <View style={styles.figureStage}>
        <View style={[styles.figure, side === 'back' && styles.figureBack]}>
          <View style={styles.head} />

          <View
            style={[
              styles.torso,
              getMuscleStyle(highlightedMuscles, side, 'torso'),
              { transform: [{ rotate: pose.torsoRotate }] },
            ]}
          />

          <View
            style={[
              styles.upperArm,
              styles.leftUpperArm,
              getMuscleStyle(highlightedMuscles, side, 'upperArms'),
              { transform: [{ rotate: pose.leftUpperArmRotate }] },
            ]}
          />
          <View
            style={[
              styles.upperArm,
              styles.rightUpperArm,
              getMuscleStyle(highlightedMuscles, side, 'upperArms'),
              { transform: [{ rotate: pose.rightUpperArmRotate }] },
            ]}
          />

          <View
            style={[
              styles.forearm,
              styles.leftForearm,
              getMuscleStyle(highlightedMuscles, side, 'forearms'),
              { transform: [{ rotate: pose.leftForearmRotate }] },
            ]}
          />
          <View
            style={[
              styles.forearm,
              styles.rightForearm,
              getMuscleStyle(highlightedMuscles, side, 'forearms'),
              { transform: [{ rotate: pose.rightForearmRotate }] },
            ]}
          />

          <View
            style={[
              styles.thigh,
              styles.leftThigh,
              getMuscleStyle(highlightedMuscles, side, 'upperLegs'),
              { transform: [{ rotate: pose.leftThighRotate }] },
            ]}
          />
          <View
            style={[
              styles.thigh,
              styles.rightThigh,
              getMuscleStyle(highlightedMuscles, side, 'upperLegs'),
              { transform: [{ rotate: pose.rightThighRotate }] },
            ]}
          />

          <View
            style={[
              styles.calf,
              styles.leftCalf,
              getMuscleStyle(highlightedMuscles, side, 'lowerLegs'),
              { transform: [{ rotate: pose.leftCalfRotate }] },
            ]}
          />
          <View
            style={[
              styles.calf,
              styles.rightCalf,
              getMuscleStyle(highlightedMuscles, side, 'lowerLegs'),
              { transform: [{ rotate: pose.rightCalfRotate }] },
            ]}
          />
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Text style={styles.infoPillLabel}>State</Text>
          <Text style={styles.infoPillValue}>
            {postureState?.label ?? 'Setup'}
          </Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoPillLabel}>Cue</Text>
          <Text style={styles.infoPillValue}>
            {postureState?.shortCue ?? 'Get set and brace.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getMuscleStyle(
  highlightedMuscles: MuscleGroup[],
  side: BodySide,
  region: 'torso' | 'upperArms' | 'forearms' | 'upperLegs' | 'lowerLegs'
) {
  const active = new Set(highlightedMuscles);

  const regionMap: Record<typeof region, MuscleGroup[]> = {
    torso:
      side === 'front'
        ? ['chest', 'frontDelts', 'sideDelts', 'abs', 'obliques']
        : ['lats', 'upperBack', 'lowerBack', 'rearDelts', 'glutes'],
    upperArms:
      side === 'front'
        ? ['biceps', 'triceps', 'frontDelts', 'sideDelts']
        : ['triceps', 'rearDelts'],
    forearms: ['forearms'],
    upperLegs:
      side === 'front'
        ? ['quads']
        : ['hamstrings', 'glutes'],
    lowerLegs: ['calves'],
  };

  const isActive = regionMap[region].some((muscle) => active.has(muscle));

  return isActive ? styles.highlightedRegion : null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
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
  sideBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sideBadgeText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  figureStage: {
    height: 320,
    backgroundColor: '#0b1220',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  figure: {
    width: 180,
    height: 260,
    position: 'relative',
    alignItems: 'center',
  },
  figureBack: {},
  head: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#374151',
    position: 'absolute',
    top: 0,
  },
  torso: {
    width: 64,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#374151',
    position: 'absolute',
    top: 42,
  },
  upperArm: {
    width: 18,
    height: 66,
    borderRadius: 10,
    backgroundColor: '#374151',
    position: 'absolute',
    top: 52,
  },
  leftUpperArm: {
    left: 28,
  },
  rightUpperArm: {
    right: 28,
  },
  forearm: {
    width: 16,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#4b5563',
    position: 'absolute',
    top: 110,
  },
  leftForearm: {
    left: 24,
  },
  rightForearm: {
    right: 24,
  },
  thigh: {
    width: 22,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#374151',
    position: 'absolute',
    top: 136,
  },
  leftThigh: {
    left: 58,
  },
  rightThigh: {
    right: 58,
  },
  calf: {
    width: 18,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#4b5563',
    position: 'absolute',
    top: 194,
  },
  leftCalf: {
    left: 60,
  },
  rightCalf: {
    right: 60,
  },
  highlightedRegion: {
    backgroundColor: '#f97316',
  },
  infoRow: {
    gap: 10,
  },
  infoPill: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  infoPillLabel: {
    color: '#9ca3af',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoPillValue: {
    color: '#f3f4f6',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});