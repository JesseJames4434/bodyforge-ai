import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type BodyViewMode = 'front' | 'back';
export type MuscleType = 'chest' | 'shoulder' | 'triceps' | 'back' | 'other';

type BodyVisualProps = {
  bodyView: BodyViewMode;
  muscleType: MuscleType;
  title?: string;
  subtitle?: string;
  showToggle?: boolean;
  onChangeView?: (view: BodyViewMode) => void;
};

export default function BodyVisual({
  bodyView,
  muscleType,
  title = 'Body Visual Active',
  subtitle = 'Primary target emphasis',
  showToggle = false,
  onChangeView,
}: BodyVisualProps) {
  function renderFrontBody() {
    return (
      <View style={styles.avatarFrame}>
        <View style={styles.avatarHead} />
        <View style={styles.avatarTorsoFront}>
          <View
            style={[
              styles.frontShoulderLeft,
              muscleType === 'shoulder' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.frontShoulderRight,
              muscleType === 'shoulder' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.frontChest,
              muscleType === 'chest' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.frontArmLeft,
              muscleType === 'triceps' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.frontArmRight,
              muscleType === 'triceps' && styles.activeHighlight,
            ]}
          />
        </View>
      </View>
    );
  }

  function renderBackBody() {
    return (
      <View style={styles.avatarFrame}>
        <View style={styles.avatarHead} />
        <View style={styles.avatarTorsoBack}>
          <View
            style={[
              styles.backShoulderLeft,
              muscleType === 'shoulder' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.backShoulderRight,
              muscleType === 'shoulder' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.backUpperBody,
              muscleType === 'back' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.backArmLeft,
              muscleType === 'triceps' && styles.activeHighlight,
            ]}
          />
          <View
            style={[
              styles.backArmRight,
              muscleType === 'triceps' && styles.activeHighlight,
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {showToggle && onChangeView ? (
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleButton,
              bodyView === 'front' && styles.toggleButtonActive,
            ]}
            onPress={() => onChangeView('front')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                bodyView === 'front' && styles.toggleButtonTextActive,
              ]}
            >
              Front
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleButton,
              bodyView === 'back' && styles.toggleButtonActive,
            ]}
            onPress={() => onChangeView('back')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                bodyView === 'back' && styles.toggleButtonTextActive,
              ]}
            >
              Back
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.visualCard}>
        {bodyView === 'front' ? renderFrontBody() : renderBackBody()}

        <View style={styles.visualInfo}>
          <Text style={styles.visualTitle}>{title}</Text>
          <Text style={styles.visualText}>{subtitle}</Text>
          <Text style={styles.visualTextSecondary}>
            This visual engine will later evolve into a more anatomical and realistic
            Bodyforge avatar.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: '#151C27',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#263143',
  },
  toggleButtonActive: {
    backgroundColor: '#F5F7FB',
    borderColor: '#F5F7FB',
  },
  toggleButtonText: {
    color: '#C6D0DF',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleButtonTextActive: {
    color: '#07090D',
  },
  visualCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1B2533',
    backgroundColor: '#0A1220',
    padding: 18,
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFrame: {
    width: 160,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    marginBottom: 10,
  },
  avatarTorsoFront: {
    width: 82,
    height: 132,
    borderRadius: 28,
    backgroundColor: '#243244',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  avatarTorsoBack: {
    width: 82,
    height: 132,
    borderRadius: 28,
    backgroundColor: '#243244',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  frontChest: {
    marginTop: 20,
    width: 48,
    height: 30,
    borderRadius: 14,
    backgroundColor: '#3A475A',
  },
  frontShoulderLeft: {
    position: 'absolute',
    top: 16,
    left: -18,
    width: 26,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#3A475A',
  },
  frontShoulderRight: {
    position: 'absolute',
    top: 16,
    right: -18,
    width: 26,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#3A475A',
  },
  frontArmLeft: {
    position: 'absolute',
    top: 38,
    left: -14,
    width: 12,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#3A475A',
  },
  frontArmRight: {
    position: 'absolute',
    top: 38,
    right: -14,
    width: 12,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#3A475A',
  },
  backUpperBody: {
    marginTop: 20,
    width: 52,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#3A475A',
  },
  backShoulderLeft: {
    position: 'absolute',
    top: 16,
    left: -18,
    width: 26,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#3A475A',
  },
  backShoulderRight: {
    position: 'absolute',
    top: 16,
    right: -18,
    width: 26,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#3A475A',
  },
  backArmLeft: {
    position: 'absolute',
    top: 38,
    left: -14,
    width: 12,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#3A475A',
  },
  backArmRight: {
    position: 'absolute',
    top: 38,
    right: -14,
    width: 12,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#3A475A',
  },
  activeHighlight: {
    backgroundColor: '#B18C5A',
  },
  visualInfo: {
    alignItems: 'center',
  },
  visualTitle: {
    color: '#F5F7FB',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  visualText: {
    color: '#C8D2E2',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  visualTextSecondary: {
    color: '#93A1B5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },
});