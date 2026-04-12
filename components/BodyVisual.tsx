import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export type Posture = "setup" | "stretch" | "contraction";
export type Profile = "press" | "hinge" | "curl";

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

const COACH_TIMING_MS = 380;
const COACH_EASING = Easing.out(Easing.cubic);
const SECONDARY_RELEVANCE_MIN = 0.26;

const BASE_BLEND_MS = 240;

export default function BodyVisual(props: Props) {
  const posture = resolvePosture(props);
  const profile = resolveProfile(props);
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

  const intensity = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.35, 0.65, 1],
  });

  const armPressOpacity = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.45, 0.68, 0.82],
  });

  const chestOpacityOut =
    profile === "press" ? Animated.multiply(intensity, chestMult) : Animated.multiply(chestBaseAnim, chestMult);

  const backOpacityOut =
    profile === "hinge" ? Animated.multiply(intensity, backMult) : Animated.multiply(backBaseAnim, backMult);

  const armOpacityOut =
    profile === "curl"
      ? Animated.multiply(intensity, armMult)
      : profile === "press"
        ? Animated.multiply(armPressOpacity, armMult)
        : Animated.multiply(armBaseAnim, armMult);

  const legOpacityOut =
    profile === "hinge" ? Animated.multiply(intensity, legMult) : Animated.multiply(legBaseAnim, legMult);

  const coreOpacityOut = Animated.multiply(coreBaseAnim, coreMult);

  return (
    <View style={styles.wrapper}>
      <View style={styles.figureBox}>
        <Animated.View
          style={[
            styles.figure,
            {
              transform: [{ rotate: torsoRotate }],
            },
          ]}
        >
          <Animated.View style={[styles.head, { opacity: headShell }]} />

          <View style={styles.upperBodyRow}>
            <Animated.View
              style={[
                styles.upperArm,
                styles.leftUpperArm,
                {
                  opacity: armShell,
                  transform: [
                    { translateX: leftArmShift },
                    { rotate: leftShoulderRotate },
                  ],
                },
              ]}
            >
              <Animated.View style={[styles.armHighlight, { opacity: armOpacityOut }]} />
              <Animated.View
                style={[
                  styles.lowerArm,
                  { transform: [{ rotate: leftElbowRotate }] },
                ]}
              />
            </Animated.View>

            <Animated.View style={[styles.torso, { opacity: torsoShell }]}>
              <Animated.View style={[styles.chestHighlight, { opacity: chestOpacityOut }]} />
              <Animated.View style={[styles.backHighlight, { opacity: backOpacityOut }]} />
              <Animated.View style={[styles.coreHighlight, { opacity: coreOpacityOut }]} />
            </Animated.View>

            <Animated.View
              style={[
                styles.upperArm,
                styles.rightUpperArm,
                {
                  opacity: armShell,
                  transform: [
                    { translateX: rightArmShift },
                    { rotate: rightShoulderRotate },
                  ],
                },
              ]}
            >
              <Animated.View style={[styles.armHighlight, { opacity: armOpacityOut }]} />
              <Animated.View
                style={[
                  styles.lowerArm,
                  { transform: [{ rotate: rightElbowRotate }] },
                ]}
              />
            </Animated.View>
          </View>

          <View style={styles.legsRow}>
            <Animated.View style={[styles.leg, { opacity: legShell }]}>
              <Animated.View style={[styles.legHighlight, { opacity: legOpacityOut }]} />
            </Animated.View>
            <Animated.View style={[styles.leg, { opacity: legShell }]}>
              <Animated.View style={[styles.legHighlight, { opacity: legOpacityOut }]} />
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      <Text style={styles.debugText}>
        profile: {profile} | posture: {posture} | coach: {coaching.focus} ({coaching.intensity.toFixed(2)})
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
      return 1 + 0.2 * i;
    case "primary":
      return 1 + 0.52 * i;
    case "secondary":
      return 1 + 0.16 * i;
    case "inactive":
      return Math.max(0.38, 1 - 0.36 * i);
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
      return 0.9 + 0.05 * (1 - i);
    case "inactive":
      return Math.max(0.64, 0.86 - 0.24 * i);
    default:
      return 1;
  }
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
    width: 58,
    height: 96,
    borderRadius: 18,
    backgroundColor: "#8F8F94",
    alignItems: "center",
    position: "relative",
  },
  chestHighlight: {
    position: "absolute",
    top: 16,
    width: 30,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF7A18",
  },
  backHighlight: {
    position: "absolute",
    top: 40,
    width: 24,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF7A18",
  },
  coreHighlight: {
    position: "absolute",
    top: 58,
    width: 18,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#A39CA3",
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
