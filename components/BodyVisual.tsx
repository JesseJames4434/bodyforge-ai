import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

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

export type BodyVisualProps = {
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
  /** Passed from exercise screen; reserved for future muscle→focus mapping. */
  highlightedMuscles?: readonly string[];
};

type Props = BodyVisualProps;

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

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Shell + highlight palette — cool neutrals, warm accent (product-consistent). */
const C = {
  ink: "#4A4A52",
  shellDeep: "#5C5C66",
  shellMid: "#6E6E78",
  shell: "#82828C",
  shellLight: "#94949E",
  limb: "#8A8A94",
  limbSoft: "#9A9AA4",
  joint: "#787882",
  accent: "#FF7A18",
  accentSoft: "#E8B89A",
  coreTint: "#9A939C",
  spine: "#4E4E56",
  rearPlane: "#76767E",
};

/**
 * Front torso — viewBox 0 0 200 220.
 * Discrete sections (shoulders widest → chest taper → waist → pelvis flare); not one merged blob.
 */
const PATH_FRONT_CHEST = "M 56 56 L 144 56 L 134 118 L 66 118 Z";
const PATH_FRONT_WAIST = "M 66 118 L 134 118 L 126 158 L 74 158 Z";
const PATH_FRONT_PELVIS = "M 74 158 L 126 158 L 132 182 L 68 182 Z";

const PATH_BACK_TORSO =
  "M100 27" +
  " C91 27 82 30 74 36" +
  " L63 45 C47 60 38 82 36 106" +
  " C34 128 38 150 50 164" +
  " C60 173 74 178 88 179" +
  " L100 181 L112 179 C126 178 140 173 150 164" +
  " C162 150 166 128 164 106" +
  " C162 82 153 60 137 45" +
  " L126 36 C118 30 109 27 100 27 Z";

/** viewBox 0 0 200 200 — two separate legs with a visible midline gap (not merged). */
const PATH_FRONT_LEGS =
  "M 60 8 L 90 8 Q 94 8 94 12 L 94 192 Q 94 196 90 196 L 60 196 Q 56 196 56 192 L 56 12 Q 56 8 60 8 Z" +
  " M 110 8 L 140 8 Q 144 8 144 12 L 144 192 Q 144 196 140 196 L 110 196 Q 106 196 106 192 L 106 12 Q 106 8 110 8 Z";

const PATH_BACK_LEGS =
  "M75 1 C67 6 62 18 61 36" +
  " C59 74 62 114 65 148 L62 184 L77 190 L88 148" +
  " C90 102 94 62 97 34 L100 20 L103 34" +
  " C106 62 110 102 112 148 L123 190 L138 184 L135 148" +
  " C138 114 141 74 139 36" +
  " C138 18 133 6 125 1" +
  " L113 0 L100 2 L87 0 Z";

/** Spinal shadow (back only). */
const PATH_BACK_SPINE =
  "M100 44 C98 44 96 48 95 54 L94 122 C94 132 96 142 100 147 C104 142 106 132 106 122 L105 54 C104 48 102 44 100 44 Z";

/** Coaching highlight regions (same viewBoxes as torso / legs). */
const PATH_HL_PEC_L = "M 100 56 L 56 56 L 66 118 L 100 118 Z";
const PATH_HL_PEC_R = "M 100 56 L 144 56 L 134 118 L 100 118 Z";
const PATH_HL_STERNAL = "M 100 64 L 108 92 L 100 108 L 92 92 Z";
const PATH_HL_BACK_UPPER =
  "M100 50 L76 56 L65 78 L69 100 L88 110 L100 114 L112 110 L131 100 L135 78 L124 56 Z";
const PATH_HL_BACK_LOWER =
  "M100 114 L82 122 L77 144 L86 166 L100 173 L114 166 L123 144 L118 122 Z";

/** Front-view “back” coaching read (low opacity) — aligned to segmented front torso, not back blob. */
const PATH_HL_BACK_UPPER_ON_FRONT =
  "M 58 54 L 78 58 L 86 116 L 70 120 Z M 142 54 L 122 58 L 114 116 L 130 120 Z";
const PATH_HL_BACK_LOWER_ON_FRONT =
  "M 76 118 L 92 122 L 90 156 L 76 154 Z M 124 118 L 108 122 L 110 156 L 124 154 Z";
const PATH_HL_CORE_F =
  "M 100 182 L 72 176 L 76 122 L 100 116 L 124 122 L 128 176 Z";
const PATH_HL_CORE_B =
  "M100 176 L88 174 L84 154 L92 134 L100 130 L108 134 L116 154 L112 174 Z";

const PATH_HL_QUAD_L = "M 75 18 L 62 10 L 60 88 L 74 132 L 88 122 L 86 28 Z";
const PATH_HL_QUAD_R = "M 125 18 L 138 10 L 140 88 L 126 132 L 112 122 L 114 28 Z";

/** Upper arm (pivot top center ~20,5) viewBox 0 0 40 78 — delt cap, compact elbow. */
const PATH_ARM_UPPER_F =
  "M20 5 C9 9 2 26 5 46 C7 60 12 71 20 75 C28 71 33 60 35 46 C38 26 31 9 20 5 Z";
const PATH_ARM_UPPER_B =
  "M20 5 C7 11 1 30 4 48 C6 62 11 72 20 76 C29 72 34 62 36 48 C39 30 33 11 20 5 Z";

/** Forearm viewBox 0 0 36 96, pivot top 18,5 */
const PATH_FOREARM_F =
  "M18 5 C9 23 7 52 10 77 C11 86 14 91 18 93 C22 91 25 86 26 77 C29 52 27 23 18 5 Z";
const PATH_FOREARM_B =
  "M18 5 C8 25 6 54 9 79 C10 88 13 93 18 95 C23 93 26 88 27 79 C30 54 28 25 18 5 Z";

/** Arm highlight strips (local arm coords). */
const PATH_HL_ARM_UPPER = "M20 19 C14 29 12 48 14 59 L26 59 C28 48 26 29 20 19 Z";
const PATH_HL_FOREARM = "M18 21 C12 39 11 58 13 73 L23 73 C25 58 24 39 18 21 Z";

export default function BodyVisual(props: Props) {
  void props.highlightedMuscles;
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

  const torsoFill = isBack ? C.rearPlane : C.limb;
  const legFill = isBack ? C.shellDeep : C.shellMid;
  const armFill = isBack ? C.rearPlane : C.limb;
  const foreFill = isBack ? C.shellMid : C.shell;

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
            <Animated.View style={{ opacity: headShell }}>
              <Svg width={44} height={54} viewBox="0 0 80 92" pointerEvents="none">
                <Circle
                  cx={40}
                  cy={28}
                  r={19}
                  fill={C.limbSoft}
                  stroke={C.ink}
                  strokeOpacity={0.12}
                  strokeWidth={0.8}
                />
              </Svg>
            </Animated.View>
          </Animated.View>

          <View style={styles.upperBodyRow}>
            <Animated.View
              style={[
                styles.armColumn,
                styles.armColumnLeft,
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
              <SvgArm
                side="left"
                isBack={isBack}
                armFill={armFill}
                foreFill={foreFill}
                elbowRotate={leftElbowRotate}
                elbowCharacter={leftElbowCharacter}
                armOpacityWithStretch={armOpacityWithStretch}
                pulseArms={pulseWrap("arms")}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.torso,
                {
                  opacity: torsoShell,
                  transform: [{ scaleX: phaseTorsoScaleX }, { scaleY: phaseTorsoScaleY }],
                },
              ]}
            >
              <Svg width={108} height={148} viewBox="0 0 200 220" pointerEvents="none">
                {isBack ? (
                  <Path
                    d={PATH_BACK_TORSO}
                    fill={torsoFill}
                    stroke={C.ink}
                    strokeOpacity={0.12}
                    strokeWidth={0.8}
                  />
                ) : (
                  <>
                    <Rect
                      x={90}
                      y={20}
                      width={20}
                      height={14}
                      rx={5}
                      ry={5}
                      fill={torsoFill}
                      stroke={C.ink}
                      strokeOpacity={0.12}
                      strokeWidth={0.8}
                    />
                    <Rect
                      x={50}
                      y={32}
                      width={100}
                      height={24}
                      rx={12}
                      ry={12}
                      fill={torsoFill}
                      stroke={C.ink}
                      strokeOpacity={0.12}
                      strokeWidth={0.8}
                    />
                    <Path
                      d={PATH_FRONT_CHEST}
                      fill={torsoFill}
                      stroke={C.ink}
                      strokeOpacity={0.12}
                      strokeWidth={0.8}
                    />
                    <Path
                      d={PATH_FRONT_WAIST}
                      fill={torsoFill}
                      stroke={C.ink}
                      strokeOpacity={0.12}
                      strokeWidth={0.8}
                    />
                    <Path
                      d={PATH_FRONT_PELVIS}
                      fill={torsoFill}
                      stroke={C.ink}
                      strokeOpacity={0.12}
                      strokeWidth={0.8}
                    />
                  </>
                )}
                {isBack ? (
                  <Path d={PATH_BACK_SPINE} fill={C.spine} opacity={0.55} />
                ) : null}
              </Svg>

              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width={108} height={148} viewBox="0 0 200 220" style={StyleSheet.absoluteFill}>
                  <Animated.View style={{ opacity: pulseWrap("chest") }}>
                    <View style={{ opacity: isBack ? 0.2 : 1 }}>
                      {!isBack ? (
                        <>
                          <AnimatedPath
                            d={PATH_HL_PEC_L}
                            fill={C.accent}
                            opacity={chestOpacityWithStretch}
                          />
                          <AnimatedPath
                            d={PATH_HL_PEC_R}
                            fill={C.accent}
                            opacity={chestOpacityWithStretch}
                          />
                          <AnimatedPath
                            d={PATH_HL_STERNAL}
                            fill={C.accentSoft}
                            opacity={chestOpacityWithStretch}
                          />
                        </>
                      ) : (
                        <AnimatedPath
                          d="M100 98 L88 102 L84 116 L100 120 L116 116 L112 102 Z"
                          fill={C.accent}
                          opacity={chestOpacityWithStretch}
                        />
                      )}
                    </View>
                  </Animated.View>

                  <Animated.View style={{ opacity: pulseWrap("back") }}>
                    <View style={{ opacity: isBack ? 1 : 0.28 }}>
                      <AnimatedPath
                        d={isBack ? PATH_HL_BACK_UPPER : PATH_HL_BACK_UPPER_ON_FRONT}
                        fill={C.accent}
                        opacity={backOpacityWithStretch}
                      />
                      <AnimatedPath
                        d={isBack ? PATH_HL_BACK_LOWER : PATH_HL_BACK_LOWER_ON_FRONT}
                        fill={C.accent}
                        opacity={backOpacityWithStretch}
                      />
                    </View>
                  </Animated.View>

                  <Animated.View style={{ opacity: pulseWrap("core") }}>
                    <AnimatedPath
                      d={isBack ? PATH_HL_CORE_B : PATH_HL_CORE_F}
                      fill={C.coreTint}
                      opacity={coreOpacityWithStretch}
                    />
                  </Animated.View>
                </Svg>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.armColumn,
                styles.armColumnRight,
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
              <SvgArm
                side="right"
                isBack={isBack}
                armFill={armFill}
                foreFill={foreFill}
                elbowRotate={rightElbowRotate}
                elbowCharacter={rightElbowCharacter}
                armOpacityWithStretch={armOpacityWithStretch}
                pulseArms={pulseWrap("arms")}
              />
            </Animated.View>
          </View>

          <Animated.View
            style={{
              transform: [{ translateY: phaseLegRowTranslateY }, { scaleY: phaseLegRowScaleY }],
            }}
          >
            <Animated.View style={[styles.legsRow, { opacity: legShell }]}>
              <LegSvgColumn
                side="left"
                isBack={isBack}
                legFill={legFill}
                quadPath={PATH_HL_QUAD_L}
                legOpacityWithStretch={legOpacityWithStretch}
                pulseLegs={pulseWrap("legs")}
              />
              <LegSvgColumn
                side="right"
                isBack={isBack}
                legFill={legFill}
                quadPath={PATH_HL_QUAD_R}
                legOpacityWithStretch={legOpacityWithStretch}
                pulseLegs={pulseWrap("legs")}
              />
            </Animated.View>
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

type SvgArmProps = {
  side: "left" | "right";
  isBack: boolean;
  armFill: string;
  foreFill: string;
  elbowRotate: Animated.AnimatedInterpolation<string>;
  elbowCharacter: Animated.AnimatedInterpolation<string>;
  armOpacityWithStretch: Animated.AnimatedInterpolation<number>;
  pulseArms: Animated.AnimatedNode | number;
};

function SvgArm({
  side,
  isBack,
  armFill,
  foreFill,
  elbowRotate,
  elbowCharacter,
  armOpacityWithStretch,
  pulseArms,
}: SvgArmProps) {
  const mirror = side === "right" ? -1 : 1;
  const upperPath = isBack ? PATH_ARM_UPPER_B : PATH_ARM_UPPER_F;
  const forePath = isBack ? PATH_FOREARM_B : PATH_FOREARM_F;

  return (
    <View style={styles.armSvgWrap}>
      <Svg width={40} height={78} viewBox="0 0 40 78" pointerEvents="none">
        <GMirror mirror={mirror} width={40}>
          <Path d={upperPath} fill={armFill} stroke={C.ink} strokeOpacity={0.1} strokeWidth={0.6} />
        </GMirror>
      </Svg>
      <Animated.View
        style={[
          styles.forearmWrap,
          {
            transform: [{ rotate: elbowRotate }, { rotate: elbowCharacter }],
          },
        ]}
      >
        <Svg width={36} height={96} viewBox="0 0 36 96" pointerEvents="none">
          <GMirror mirror={mirror} width={36}>
            <Path d={forePath} fill={foreFill} stroke={C.ink} strokeOpacity={0.1} strokeWidth={0.6} />
          </GMirror>
        </Svg>
        <Animated.View style={[styles.armHlOverlay, { opacity: pulseArms }]}>
          <Svg width={36} height={96} viewBox="0 0 36 96" style={StyleSheet.absoluteFill} pointerEvents="none">
            <GMirror mirror={mirror} width={36}>
              <AnimatedPath d={PATH_HL_FOREARM} fill={C.accent} opacity={armOpacityWithStretch} />
            </GMirror>
          </Svg>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.armHlOverlayUpper, { opacity: pulseArms }]}>
        <Svg width={40} height={78} viewBox="0 0 40 78" pointerEvents="none">
          <GMirror mirror={mirror} width={40}>
            <AnimatedPath d={PATH_HL_ARM_UPPER} fill={C.accent} opacity={armOpacityWithStretch} />
          </GMirror>
        </Svg>
      </Animated.View>
    </View>
  );
}

function GMirror({
  mirror,
  width,
  children,
}: {
  mirror: number;
  width: number;
  children: React.ReactNode;
}) {
  if (mirror === 1) {
    return <>{children}</>;
  }
  return <G transform={`translate(${width},0) scale(-1,1)`}>{children}</G>;
}

type LegSvgColumnProps = {
  side: "left" | "right";
  isBack: boolean;
  legFill: string;
  quadPath: string;
  legOpacityWithStretch: Animated.AnimatedInterpolation<number>;
  pulseLegs: Animated.AnimatedNode | number;
};

function LegSvgColumn({
  side,
  isBack,
  legFill,
  quadPath,
  legOpacityWithStretch,
  pulseLegs,
}: LegSvgColumnProps) {
  const d = isBack ? PATH_BACK_LEGS : PATH_FRONT_LEGS;
  const slice = side === "left" ? "0 0 100 200" : "100 0 100 200";
  return (
    <View style={styles.legColumn}>
      <Svg width={56} height={168} viewBox={slice} pointerEvents="none">
        <Path d={d} fill={legFill} stroke={C.ink} strokeOpacity={0.1} strokeWidth={0.7} />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulseLegs }]} pointerEvents="none">
        <Svg width={56} height={168} viewBox={slice} style={StyleSheet.absoluteFill}>
          <AnimatedPath d={quadPath} fill={C.accent} opacity={legOpacityWithStretch} />
        </Svg>
      </Animated.View>
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

export function resolvePosture(props: Props): Posture {
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

export function resolveProfile(props: Props): Profile {
  const raw = props.visualProfile ?? props.exerciseType ?? props.profile ?? "press";
  if (raw === "press" || raw === "hinge" || raw === "curl") {
    return raw;
  }
  return "press";
}

export function resolveBodyView(props: Props): BodyView {
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
    width: 278,
    height: 348,
    alignItems: "center",
    justifyContent: "center",
  },
  figure: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  upperBodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: -10,
  },
  armColumn: {
    width: 36,
    alignItems: "center",
    position: "relative",
    marginTop: -2,
  },
  armColumnLeft: {
    marginRight: -10,
    transformOrigin: "top center" as never,
  },
  armColumnRight: {
    marginLeft: -10,
    transformOrigin: "top center" as never,
  },
  armSvgWrap: {
    width: 40,
    height: 132,
    alignItems: "center",
  },
  forearmWrap: {
    position: "absolute",
    top: 55,
    left: 2,
    width: 36,
    height: 96,
    transformOrigin: "top center" as never,
  },
  armHlOverlay: {
    ...StyleSheet.absoluteFillObject,
    left: 0,
    top: 0,
  },
  armHlOverlayUpper: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 78,
  },
  torso: {
    width: 108,
    height: 148,
    alignItems: "center",
    position: "relative",
    marginHorizontal: 0,
    overflow: "visible",
  },
  legsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: -12,
  },
  legColumn: {
    width: 56,
    height: 168,
    position: "relative",
    alignItems: "center",
  },
  debugText: {
    marginTop: 10,
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
});
