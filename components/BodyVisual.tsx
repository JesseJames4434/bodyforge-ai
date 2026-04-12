import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export type Posture = "setup" | "stretch" | "contraction";
export type Profile = "press" | "hinge" | "curl";
export type BodyView = "front" | "back";

export type CoachingFocus =
  | "auto"
  | "full"
  | "chest"
  | "back"
  | "core"
  | "arms"
  | "legs";

export type Coaching = {
  focus?: CoachingFocus;
  /** 0–1 scales how strongly focus shifts muscle highlights. */
  intensity?: number;
};

export type ResolvedCoaching = {
  focus: CoachingFocus;
  intensity: number;
};

type PostureObject = {
  label?: unknown;
  shortCue?: unknown;
  detailCue?: unknown;
  overlay?: unknown;
};

type Props = {
  posture?: Posture | PostureObject;
  postureState?: Posture | PostureObject;
  state?: Posture | PostureObject;
  visualProfile?: Profile;
  exerciseType?: Profile;
  profile?: Profile;
  coaching?: Coaching | null;
  /** Which anatomical side faces the camera (alias: `side`). */
  view?: BodyView;
  side?: BodyView;
};

type RegionWeights = {
  chest: number;
  back: number;
  core: number;
  arms: number;
  legs: number;
};

type RegionTier = "neutral" | "full" | "primary" | "secondary" | "inactive";

type ProfileLayout = {
  leftShoulder: [string, string, string];
  rightShoulder: [string, string, string];
  leftElbow: [string, string, string];
  rightElbow: [string, string, string];
  torso: [string, string, string];
  leftShift: [number, number, number];
  rightShift: [number, number, number];
  bases: RegionWeights;
};

/** Single source for profile motion + involvement (keep coaching tiers aligned). */
const PROFILE_LAYOUT: Record<Profile, ProfileLayout> = {
  hinge: {
    leftShoulder: ["18deg", "34deg", "20deg"],
    rightShoulder: ["-18deg", "-34deg", "-20deg"],
    leftElbow: ["10deg", "18deg", "10deg"],
    rightElbow: ["-10deg", "-18deg", "-10deg"],
    torso: ["0deg", "12deg", "4deg"],
    leftShift: [0, -2, 0],
    rightShift: [0, 2, 0],
    bases: {
      chest: 0.08,
      back: 0.75,
      core: 0.52,
      arms: 0.18,
      legs: 0.8,
    },
  },
  curl: {
    leftShoulder: ["20deg", "24deg", "16deg"],
    rightShoulder: ["-20deg", "-24deg", "-16deg"],
    leftElbow: ["-12deg", "-60deg", "-115deg"],
    rightElbow: ["12deg", "60deg", "115deg"],
    torso: ["0deg", "0deg", "0deg"],
    leftShift: [0, 0, 0],
    rightShift: [0, 0, 0],
    bases: {
      chest: 0.08,
      back: 0.08,
      core: 0.24,
      arms: 0.85,
      legs: 0.08,
    },
  },
  press: {
    leftShoulder: ["26deg", "58deg", "148deg"],
    rightShoulder: ["-26deg", "-58deg", "-148deg"],
    leftElbow: ["-42deg", "-88deg", "-16deg"],
    rightElbow: ["42deg", "88deg", "16deg"],
    torso: ["-2deg", "-8deg", "-2deg"],
    leftShift: [0, -4, 10],
    rightShift: [0, 4, -10],
    bases: {
      chest: 0.82,
      back: 0.08,
      core: 0.48,
      arms: 0.58,
      legs: 0.08,
    },
  },
};

const COACH_TIMING_MS = 420;
const COACH_EASING = Easing.out(Easing.cubic);
const SECONDARY_RELEVANCE_MIN = 0.26;
const FOCUS_PULSE_MS = 1680;
const FOCUS_PULSE_PEAK = 1.07;

const BASE_BLEND_MS = 240;

/** Global muscle-readiness by phase — kept closer so silhouette carries most of the read. */
const PHASE_GLOBAL_HIGHLIGHT: [number, number, number] = [0.82, 0.9, 1];
/** Extra highlight emphasis at full contraction (clamped by the view). */
const PHASE_CONTRACT_HIGHLIGHT: [number, number, number] = [1, 1, 1.05];
/** Whole-figure scale: neutral setup → slight reach at stretch → dense peak at contraction. */
const PHASE_FIGURE_SCALE: [number, number, number] = [1, 1.012, 1.024];
/** Focus pulse depth: restrained setup, stronger intent in contraction. */
const PHASE_PULSE_DEPTH: [number, number, number] = [0.99, 1, 1.028];

/**
 * At stretch, slightly favor regions that read as lengthened / loaded for each profile.
 * Fades back to 1 by contraction so coaching + contraction boost define the squeeze.
 */
const PHASE_STRETCH_REGION_PEAK: Record<Profile, RegionWeights> = {
  press: { chest: 1.08, back: 1, core: 1.04, arms: 1.12, legs: 1 },
  hinge: { chest: 1, back: 1.1, core: 1.06, arms: 1.03, legs: 1.14 },
  curl: { chest: 1, back: 1, core: 1.02, arms: 1.14, legs: 1 },
};

/** Multiplies `phaseFigureScale` — balanced setup → long narrow stretch → broad compressed contraction. */
const PHASE_SILHOUETTE_SCALE_X: [number, number, number] = [1, 0.952, 1.058];
const PHASE_SILHOUETTE_SCALE_Y: [number, number, number] = [1, 1.048, 0.938];
/** Whole-figure vertical shift (px): composed setup → lifted stretch → grounded contraction. */
const PHASE_SILHOUETTE_TRANSLATE_Y: [number, number, number] = [0, -5.5, 2.8];
/** Extra horizontal arm spread (px); mirrored on left/right via sign. */
const PHASE_LIMB_SPREAD: [number, number, number] = [0, 9, -5];
/** Torso block only: neutral → elongated → shortened (reads with whole-figure scale). */
const PHASE_TORSO_SCALE_X: [number, number, number] = [1, 0.93, 1.08];
const PHASE_TORSO_SCALE_Y: [number, number, number] = [1, 1.08, 0.9];
/** Head slides with posture: calm → long neck → tucked, compact power. */
const PHASE_HEAD_TRANSLATE_Y: [number, number, number] = [0, -4, 2.5];
/** Upper arms shift vertically vs torso: open spacing at stretch, packed at contraction. */
const PHASE_UPPER_ARM_TRANSLATE_Y: [number, number, number] = [0, -5, 3.5];
/** Leg row: reach at stretch, slight shorten at contraction. */
const PHASE_LEG_ROW_TRANSLATE_Y: [number, number, number] = [0, -5, 1.2];
const PHASE_LEG_ROW_SCALE_Y: [number, number, number] = [1, 1.055, 0.94];

type PhaseDegTriple = [number, number, number];

/** Layered on profile keyframes: upright setup → opened stretch → flexed / packed contraction. */
const PHASE_TORSO_CHARACTER_DEG: Record<Profile, PhaseDegTriple> = {
  press: [0.6, -2.8, -6.2],
  hinge: [1.2, -4.5, -7.5],
  curl: [0.4, -2.4, -5],
};

const PHASE_ARM_CHARACTER: Record<
  Profile,
  { ls: PhaseDegTriple; rs: PhaseDegTriple; le: PhaseDegTriple; re: PhaseDegTriple }
> = {
  press: {
    ls: [-11, 2, 12],
    rs: [11, -2, -12],
    le: [9, -2, -16],
    re: [-9, 2, 16],
  },
  hinge: {
    ls: [-8, 3.5, 8],
    rs: [8, -3.5, -8],
    le: [6, -2, -11],
    re: [-6, 2, 11],
  },
  curl: {
    ls: [-9, 1.5, 8],
    rs: [9, -1.5, -8],
    le: [14, 1, -22],
    re: [-14, -1, 22],
  },
};

function degTriple(t: PhaseDegTriple): [string, string, string] {
  return [`${t[0]}deg`, `${t[1]}deg`, `${t[2]}deg`];
}

export default function BodyVisual(props: Props) {
  const posture = resolvePosture(props);
  const profile = resolveProfile(props);
  const bodyView = resolveBodyView(props);
  const isBack = bodyView === "back";
  const layout = PROFILE_LAYOUT[profile];
  const coaching = useMemo(() => resolveCoaching(props.coaching), [props.coaching]);

  const chestBaseAnim = useRef(new Animated.Value(layout.bases.chest)).current;
  const backBaseAnim = useRef(new Animated.Value(layout.bases.back)).current;
  const armBaseAnim = useRef(new Animated.Value(layout.bases.arms)).current;
  const legBaseAnim = useRef(new Animated.Value(layout.bases.legs)).current;
  const coreBaseAnim = useRef(new Animated.Value(0.45)).current;

  const { highlightTargets, shellTargets, headShellTarget } = useMemo(
    () => computeCoachingVisualTargets(coaching, profile),
    [coaching.focus, coaching.intensity, profile]
  );

  const chestMult = useRef(new Animated.Value(highlightTargets.chest)).current;
  const backMult = useRef(new Animated.Value(highlightTargets.back)).current;
  const coreMult = useRef(new Animated.Value(highlightTargets.core)).current;
  const armMult = useRef(new Animated.Value(highlightTargets.arms)).current;
  const legMult = useRef(new Animated.Value(highlightTargets.legs)).current;

  const torsoShell = useRef(new Animated.Value(shellTargets.torso)).current;
  const armShell = useRef(new Animated.Value(shellTargets.arms)).current;
  const legShell = useRef(new Animated.Value(shellTargets.legs)).current;
  const headShell = useRef(new Animated.Value(headShellTarget)).current;

  const primaryFocusRegion = useMemo(() => primaryRegionForFocus(coaching.focus), [coaching.focus]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!primaryFocusRegion) {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: FOCUS_PULSE_PEAK,
          duration: FOCUS_PULSE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: FOCUS_PULSE_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    pulseAnim.setValue(1);
    loop.start();
    return () => {
      loop.stop();
      pulseAnim.setValue(1);
    };
  }, [primaryFocusRegion, pulseAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(chestMult, {
        toValue: highlightTargets.chest,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(backMult, {
        toValue: highlightTargets.back,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(coreMult, {
        toValue: highlightTargets.core,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(armMult, {
        toValue: highlightTargets.arms,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(legMult, {
        toValue: highlightTargets.legs,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(torsoShell, {
        toValue: shellTargets.torso,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(armShell, {
        toValue: shellTargets.arms,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(legShell, {
        toValue: shellTargets.legs,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(headShell, {
        toValue: headShellTarget,
        duration: COACH_TIMING_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    highlightTargets,
    shellTargets,
    headShellTarget,
    chestMult,
    backMult,
    coreMult,
    armMult,
    legMult,
    torsoShell,
    armShell,
    legShell,
    headShell,
  ]);

  useEffect(() => {
    if (profile !== "press") {
      Animated.timing(chestBaseAnim, {
        toValue: layout.bases.chest,
        duration: BASE_BLEND_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }).start();
    }
  }, [profile, layout.bases.chest, chestBaseAnim]);

  useEffect(() => {
    if (profile !== "hinge") {
      Animated.timing(backBaseAnim, {
        toValue: layout.bases.back,
        duration: BASE_BLEND_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }).start();
    }
  }, [profile, layout.bases.back, backBaseAnim]);

  useEffect(() => {
    if (profile === "hinge") {
      Animated.timing(armBaseAnim, {
        toValue: layout.bases.arms,
        duration: BASE_BLEND_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }).start();
    }
  }, [profile, layout.bases.arms, armBaseAnim]);

  useEffect(() => {
    if (profile !== "hinge") {
      Animated.timing(legBaseAnim, {
        toValue: layout.bases.legs,
        duration: BASE_BLEND_MS,
        easing: COACH_EASING,
        useNativeDriver: false,
      }).start();
    }
  }, [profile, layout.bases.legs, legBaseAnim]);

  const anim = useRef(new Animated.Value(getPostureValue(posture))).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: getPostureValue(posture),
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [posture, anim]);

  const leftShoulderRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: layout.leftShoulder,
  });

  const rightShoulderRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: layout.rightShoulder,
  });

  const leftElbowRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: layout.leftElbow,
  });

  const rightElbowRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: layout.rightElbow,
  });

  const torsoRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: layout.torso,
  });

  const leftArmShift = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: layout.leftShift,
  });

  const rightArmShift = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: layout.rightShift,
  });

  const phaseSilhouetteScaleX = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_SILHOUETTE_SCALE_X,
  });
  const phaseSilhouetteScaleY = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_SILHOUETTE_SCALE_Y,
  });
  const phaseSilhouetteTranslateY = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_SILHOUETTE_TRANSLATE_Y,
  });
  const phaseLimbSpread = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_LIMB_SPREAD,
  });
  const phaseLegRowTranslateY = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_LEG_ROW_TRANSLATE_Y,
  });
  const phaseLegRowScaleY = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_LEG_ROW_SCALE_Y,
  });
  const phaseTorsoScaleX = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_TORSO_SCALE_X,
  });
  const phaseTorsoScaleY = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_TORSO_SCALE_Y,
  });
  const phaseHeadTranslateY = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_HEAD_TRANSLATE_Y,
  });
  const phaseUpperArmTranslateY = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_UPPER_ARM_TRANSLATE_Y,
  });

  const phaseTorsoCharacter = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: degTriple(PHASE_TORSO_CHARACTER_DEG[profile]),
  });

  const armChar = PHASE_ARM_CHARACTER[profile];
  const leftShoulderCharacter = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: degTriple(armChar.ls),
  });
  const rightShoulderCharacter = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: degTriple(armChar.rs),
  });
  const leftElbowCharacter = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: degTriple(armChar.le),
  });
  const rightElbowCharacter = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: degTriple(armChar.re),
  });

  const leftArmShiftWithSpread = Animated.add(leftArmShift, Animated.multiply(phaseLimbSpread, -1));
  const rightArmShiftWithSpread = Animated.add(rightArmShift, phaseLimbSpread);

  const intensity = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.32, 0.66, 1],
  });

  const armPressOpacity = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.42, 0.72, 0.86],
  });

  const phaseGlobalHighlight = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_GLOBAL_HIGHLIGHT,
  });

  const phaseContractHighlight = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_CONTRACT_HIGHLIGHT,
  });

  const phaseFigureScale = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_FIGURE_SCALE,
  });

  const figureScaleX = Animated.multiply(phaseFigureScale, phaseSilhouetteScaleX);
  const figureScaleY = Animated.multiply(phaseFigureScale, phaseSilhouetteScaleY);

  const phasePulseDepth = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: PHASE_PULSE_DEPTH,
  });

  const stretchPeak = PHASE_STRETCH_REGION_PEAK[profile];

  const stretchChest = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, stretchPeak.chest, 1],
  });
  const stretchBack = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, stretchPeak.back, 1],
  });
  const stretchCore = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, stretchPeak.core, 1],
  });
  const stretchArms = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, stretchPeak.arms, 1],
  });
  const stretchLegs = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, stretchPeak.legs, 1],
  });

  const withPhaseHighlights = (v: Animated.AnimatedInterpolation<number>) =>
    Animated.multiply(Animated.multiply(v, phaseGlobalHighlight), phaseContractHighlight);

  const chestOpacityOut = withPhaseHighlights(
    profile === "press"
      ? Animated.multiply(intensity, chestMult)
      : Animated.multiply(chestBaseAnim, chestMult)
  );
  const chestOpacityWithStretch = Animated.multiply(chestOpacityOut, stretchChest);

  const backOpacityOut = withPhaseHighlights(
    Animated.multiply(profile === "hinge" ? intensity : backBaseAnim, backMult)
  );
  const backOpacityWithStretch = Animated.multiply(backOpacityOut, stretchBack);

  const armOpacityBase =
    profile === "curl"
      ? Animated.multiply(intensity, armMult)
      : profile === "press"
        ? Animated.multiply(armPressOpacity, armMult)
        : Animated.multiply(armBaseAnim, armMult);
  const armOpacityOut = withPhaseHighlights(armOpacityBase);
  const armOpacityWithStretch = Animated.multiply(armOpacityOut, stretchArms);

  const legOpacityOut = withPhaseHighlights(
    Animated.multiply(profile === "hinge" ? intensity : legBaseAnim, legMult)
  );
  const legOpacityWithStretch = Animated.multiply(legOpacityOut, stretchLegs);

  const coreOpacityOut = withPhaseHighlights(Animated.multiply(coreBaseAnim, coreMult));
  const coreOpacityWithStretch = Animated.multiply(coreOpacityOut, stretchCore);

  const pulseWrap = (region: keyof RegionWeights) =>
    primaryFocusRegion === region ? Animated.multiply(pulseAnim, phasePulseDepth) : 1;

  return (
    <View style={styles.wrapper}>
      <View style={styles.figureBox}>
        <Animated.View
          style={[
            styles.figure,
            {
              transform: [
                { translateY: phaseSilhouetteTranslateY },
                { rotate: torsoRotate },
                { rotate: phaseTorsoCharacter },
                { scaleX: figureScaleX },
                { scaleY: figureScaleY },
              ],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ translateY: phaseHeadTranslateY }] }}>
            <Animated.View style={[styles.head, { opacity: headShell }]} />
          </Animated.View>

          <View style={styles.upperBodyRow}>
            <Animated.View
              style={[
                styles.upperArm,
                styles.leftUpperArm,
                {
                  opacity: armShell,
                  transform: [
                    { translateY: phaseUpperArmTranslateY },
                    { translateX: leftArmShiftWithSpread },
                    { rotate: leftShoulderRotate },
                    { rotate: leftShoulderCharacter },
                  ],
                },
              ]}
            >
              <Animated.View style={{ opacity: pulseWrap("arms") }}>
                <Animated.View
                  style={[
                    styles.armHighlight,
                    isBack ? styles.armHighlightRearLeft : null,
                    { opacity: armOpacityWithStretch },
                  ]}
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.lowerArm,
                  { transform: [{ rotate: leftElbowRotate }, { rotate: leftElbowCharacter }] },
                ]}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.torso,
                isBack ? styles.torsoRear : styles.torsoFront,
                {
                  opacity: torsoShell,
                  transform: [{ scaleX: phaseTorsoScaleX }, { scaleY: phaseTorsoScaleY }],
                },
              ]}
            >
              {isBack ? (
                <>
                  <View style={styles.rearLatLeft} />
                  <View style={styles.rearLatRight} />
                  <View style={styles.rearSpine} />
                </>
              ) : null}
              <Animated.View style={{ opacity: pulseWrap("chest") }}>
                <View style={{ opacity: isBack ? 0.26 : 1 }}>
                  {isBack ? (
                    <Animated.View
                      style={[styles.chestHighlight, styles.chestHighlightRear, { opacity: chestOpacityWithStretch }]}
                    />
                  ) : (
                    <>
                      <Animated.View
                        style={[styles.chestPecFront, styles.chestPecFrontLeft, { opacity: chestOpacityWithStretch }]}
                      />
                      <Animated.View
                        style={[styles.chestPecFront, styles.chestPecFrontRight, { opacity: chestOpacityWithStretch }]}
                      />
                    </>
                  )}
                </View>
              </Animated.View>
              <Animated.View style={{ opacity: pulseWrap("back") }}>
                <View style={{ opacity: isBack ? 1 : 0.3 }}>
                  <Animated.View
                    style={[styles.backHighlight, isBack && styles.backHighlightRear, { opacity: backOpacityWithStretch }]}
                  />
                </View>
              </Animated.View>
              <Animated.View style={{ opacity: pulseWrap("core") }}>
                <Animated.View
                  style={[styles.coreHighlight, isBack && styles.coreHighlightRear, { opacity: coreOpacityWithStretch }]}
                />
              </Animated.View>
            </Animated.View>

            <Animated.View
              style={[
                styles.upperArm,
                styles.rightUpperArm,
                {
                  opacity: armShell,
                  transform: [
                    { translateY: phaseUpperArmTranslateY },
                    { translateX: rightArmShiftWithSpread },
                    { rotate: rightShoulderRotate },
                    { rotate: rightShoulderCharacter },
                  ],
                },
              ]}
            >
              <Animated.View style={{ opacity: pulseWrap("arms") }}>
                <Animated.View
                  style={[
                    styles.armHighlight,
                    isBack ? styles.armHighlightRearRight : null,
                    { opacity: armOpacityWithStretch },
                  ]}
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.lowerArm,
                  { transform: [{ rotate: rightElbowRotate }, { rotate: rightElbowCharacter }] },
                ]}
              />
            </Animated.View>
          </View>

          <Animated.View
            style={{
              transform: [
                { translateY: phaseLegRowTranslateY },
                { scaleY: phaseLegRowScaleY },
              ],
            }}
          >
            <View style={styles.legsRow}>
            <Animated.View style={[styles.leg, { opacity: legShell }]}>
              <Animated.View style={{ opacity: pulseWrap("legs") }}>
                <Animated.View style={[styles.legHighlight, { opacity: legOpacityWithStretch }]} />
              </Animated.View>
            </Animated.View>
            <Animated.View style={[styles.leg, { opacity: legShell }]}>
              <Animated.View style={{ opacity: pulseWrap("legs") }}>
                <Animated.View style={[styles.legHighlight, { opacity: legOpacityWithStretch }]} />
              </Animated.View>
            </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      <Text style={styles.debugText}>
        profile: {profile} | view: {bodyView} | posture: {posture} | coach: {coaching.focus} (
        {coaching.intensity.toFixed(2)})
      </Text>
    </View>
  );
}

export function resolveCoaching(input?: Coaching | null): ResolvedCoaching {
  if (!input) {
    return { focus: "auto", intensity: 1 };
  }
  const focus = input.focus ?? "auto";
  const intensity = clamp(input.intensity ?? 1, 0, 1);
  return { focus, intensity };
}

function regionTier(
  coaching: ResolvedCoaching,
  profile: Profile,
  region: keyof RegionWeights
): RegionTier {
  if (coaching.focus === "auto") return "neutral";
  if (coaching.focus === "full") return "full";

  const bases = PROFILE_LAYOUT[profile].bases;
  const relevance = bases[region];
  const focus = coaching.focus;

  if (focus === region) return "primary";
  if (relevance >= SECONDARY_RELEVANCE_MIN) return "secondary";
  return "inactive";
}

function highlightMultiplier(tier: RegionTier, intensity: number): number {
  const i = intensity;
  switch (tier) {
    case "neutral":
      return 1;
    case "full":
      return 1 + 0.22 * i;
    case "primary":
      return 1 + 0.78 * i;
    case "secondary":
      return 1 + 0.1 * i;
    case "inactive":
      return Math.max(0.22, 1 - 0.58 * i);
    default:
      return 1;
  }
}

function shellOpacityForTier(tier: RegionTier, intensity: number): number {
  const i = intensity;
  switch (tier) {
    case "neutral":
    case "full":
      return 1;
    case "primary":
      return 1;
    case "secondary":
      return 0.82 + 0.07 * (1 - i);
    case "inactive":
      return Math.max(0.48, 0.72 - 0.3 * i);
    default:
      return 1;
  }
}

function primaryRegionForFocus(focus: CoachingFocus): keyof RegionWeights | null {
  if (focus === "auto" || focus === "full") return null;
  return focus as keyof RegionWeights;
}

function computeCoachingVisualTargets(
  coaching: ResolvedCoaching,
  profile: Profile
): {
  highlightTargets: RegionWeights;
  shellTargets: { torso: number; arms: number; legs: number };
  headShellTarget: number;
} {
  const tiers: Record<keyof RegionWeights, RegionTier> = {
    chest: regionTier(coaching, profile, "chest"),
    back: regionTier(coaching, profile, "back"),
    core: regionTier(coaching, profile, "core"),
    arms: regionTier(coaching, profile, "arms"),
    legs: regionTier(coaching, profile, "legs"),
  };

  const highlightTargets: RegionWeights = {
    chest: highlightMultiplier(tiers.chest, coaching.intensity),
    back: highlightMultiplier(tiers.back, coaching.intensity),
    core: highlightMultiplier(tiers.core, coaching.intensity),
    arms: highlightMultiplier(tiers.arms, coaching.intensity),
    legs: highlightMultiplier(tiers.legs, coaching.intensity),
  };

  const shellChest = shellOpacityForTier(tiers.chest, coaching.intensity);
  const shellBack = shellOpacityForTier(tiers.back, coaching.intensity);
  const shellCore = shellOpacityForTier(tiers.core, coaching.intensity);
  const torso = Math.max(shellChest, shellBack, shellCore);

  const shellTargets = {
    torso,
    arms: shellOpacityForTier(tiers.arms, coaching.intensity),
    legs: shellOpacityForTier(tiers.legs, coaching.intensity),
  };

  const headShellTarget =
    tiers.legs === "primary" && coaching.focus !== "auto"
      ? clamp(0.93 - 0.05 * coaching.intensity, 0.86, 1)
      : 1;

  return { highlightTargets, shellTargets, headShellTarget };
}

function resolvePosture(props: Props): Posture {
  const raw = props.posture ?? props.postureState ?? props.state ?? "setup";

  if (typeof raw === "string") {
    return normalizePosture(raw);
  }

  if (raw && typeof raw === "object") {
    const maybeLabel = (raw as Record<string, unknown>)["label"];
    if (typeof maybeLabel === "string") {
      return normalizePosture(maybeLabel);
    }
  }

  return "setup";
}

function normalizePosture(value: string): Posture {
  const lower = value.toLowerCase();

  if (lower.includes("stretch")) return "stretch";
  if (lower.includes("contract")) return "contraction";
  if (lower.includes("setup")) return "setup";

  if (value === "setup" || value === "stretch" || value === "contraction") {
    return value;
  }

  return "setup";
}

function resolveProfile(props: Props): Profile {
  const raw = props.visualProfile ?? props.exerciseType ?? props.profile ?? "press";
  if (raw === "press" || raw === "hinge" || raw === "curl") {
    return raw;
  }
  return "press";
}

function resolveBodyView(props: Props): BodyView {
  const raw = props.view ?? props.side;
  if (raw === "front" || raw === "back") {
    return raw;
  }
  return "front";
}

function getPostureValue(posture: Posture) {
  switch (posture) {
    case "stretch":
      return 1;
    case "contraction":
      return 2;
    case "setup":
    default:
      return 0;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  figureBox: {
    width: 240,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  figure: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  head: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#A1A1AA",
    marginBottom: 8,
  },
  upperBodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  torso: {
    height: 96,
    alignItems: "center",
    position: "relative",
  },
  torsoFront: {
    width: 58,
    borderRadius: 18,
    backgroundColor: "#8F8F94",
  },
  torsoRear: {
    width: 60,
    borderRadius: 16,
    backgroundColor: "#82828A",
  },
  rearLatLeft: {
    position: "absolute",
    top: 18,
    left: 1,
    width: 15,
    height: 44,
    borderRadius: 7,
    backgroundColor: "#6F6F76",
    transform: [{ rotate: "-7deg" }],
  },
  rearLatRight: {
    position: "absolute",
    top: 18,
    right: 1,
    width: 15,
    height: 44,
    borderRadius: 7,
    backgroundColor: "#6F6F76",
    transform: [{ rotate: "7deg" }],
  },
  rearSpine: {
    position: "absolute",
    top: 26,
    left: "50%",
    marginLeft: -2,
    width: 4,
    height: 50,
    borderRadius: 2,
    backgroundColor: "#5E5E65",
  },
  chestHighlight: {
    position: "absolute",
    top: 14,
    width: 32,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF7A18",
  },
  chestPecFront: {
    position: "absolute",
    top: 13,
    width: 14,
    height: 17,
    borderRadius: 7,
    backgroundColor: "#FF7A18",
  },
  chestPecFrontLeft: {
    left: 7,
  },
  chestPecFrontRight: {
    right: 7,
  },
  chestHighlightRear: {
    top: 22,
    width: 18,
    height: 10,
    borderRadius: 5,
  },
  backHighlight: {
    position: "absolute",
    top: 42,
    width: 22,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF7A18",
  },
  backHighlightRear: {
    top: 10,
    width: 40,
    height: 24,
    borderRadius: 12,
  },
  coreHighlight: {
    position: "absolute",
    top: 56,
    width: 18,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#A39CA3",
  },
  coreHighlightRear: {
    top: 62,
    width: 20,
    height: 14,
    borderRadius: 7,
  },
  upperArm: {
    width: 16,
    height: 54,
    borderRadius: 9,
    backgroundColor: "#A1A1AA",
    marginTop: 6,
    position: "relative",
  },
  leftUpperArm: {
    marginRight: 12,
    transformOrigin: "top center" as never,
  },
  rightUpperArm: {
    marginLeft: 12,
    transformOrigin: "top center" as never,
  },
  armHighlight: {
    position: "absolute",
    top: 16,
    left: 2,
    right: 2,
    height: 18,
    borderRadius: 8,
    backgroundColor: "#FF7A18",
  },
  armHighlightRearLeft: {
    left: 0,
    right: 5,
    top: 14,
    height: 20,
    borderRadius: 7,
  },
  armHighlightRearRight: {
    left: 5,
    right: 0,
    top: 14,
    height: 20,
    borderRadius: 7,
  },
  lowerArm: {
    position: "absolute",
    top: 42,
    left: 2,
    width: 12,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#8F8F94",
    transformOrigin: "top center" as never,
  },
  legsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 10,
  },
  leg: {
    width: 16,
    height: 86,
    borderRadius: 10,
    backgroundColor: "#7C7C84",
    position: "relative",
  },
  legHighlight: {
    position: "absolute",
    top: 16,
    left: 2,
    right: 2,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FF7A18",
  },
  debugText: {
    marginTop: 10,
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
});
