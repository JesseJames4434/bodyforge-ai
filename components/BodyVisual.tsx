import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

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

export default function BodyVisual(props: Props) {
  const posture = resolvePosture(props);
  const profile = resolveProfile(props);

  const { coaching, regionWeights } = useMemo(() => {
    const c = resolveCoaching(props.coaching);
    return { coaching: c, regionWeights: computeRegionWeights(c) };
  }, [props.coaching?.focus, props.coaching?.intensity]);

  const chestMult = useRef(new Animated.Value(regionWeights.chest)).current;
  const backMult = useRef(new Animated.Value(regionWeights.back)).current;
  const armMult = useRef(new Animated.Value(regionWeights.arms)).current;
  const legMult = useRef(new Animated.Value(regionWeights.legs)).current;

  useEffect(() => {
    chestMult.setValue(regionWeights.chest);
    backMult.setValue(regionWeights.back);
    armMult.setValue(regionWeights.arms);
    legMult.setValue(regionWeights.legs);
  }, [regionWeights, chestMult, backMult, armMult, legMult]);

  const anim = useRef(new Animated.Value(getPostureValue(posture))).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: getPostureValue(posture),
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [posture, anim]);

  const config = useMemo(() => {
    switch (profile) {
      case "hinge":
        return {
          leftShoulder: ["18deg", "34deg", "20deg"] as [string, string, string],
          rightShoulder: ["-18deg", "-34deg", "-20deg"] as [string, string, string],
          leftElbow: ["10deg", "18deg", "10deg"] as [string, string, string],
          rightElbow: ["-10deg", "-18deg", "-10deg"] as [string, string, string],
          torso: ["0deg", "12deg", "4deg"] as [string, string, string],
          leftShift: [0, -2, 0] as [number, number, number],
          rightShift: [0, 2, 0] as [number, number, number],
          chestBase: 0.08,
          backBase: 0.75,
          armBase: 0.18,
          legBase: 0.8,
        };

      case "curl":
        return {
          leftShoulder: ["20deg", "24deg", "16deg"] as [string, string, string],
          rightShoulder: ["-20deg", "-24deg", "-16deg"] as [string, string, string],
          leftElbow: ["-12deg", "-60deg", "-115deg"] as [string, string, string],
          rightElbow: ["12deg", "60deg", "115deg"] as [string, string, string],
          torso: ["0deg", "0deg", "0deg"] as [string, string, string],
          leftShift: [0, 0, 0] as [number, number, number],
          rightShift: [0, 0, 0] as [number, number, number],
          chestBase: 0.08,
          backBase: 0.08,
          armBase: 0.85,
          legBase: 0.08,
        };

      case "press":
      default:
        return {
          leftShoulder: ["26deg", "58deg", "148deg"] as [string, string, string],
          rightShoulder: ["-26deg", "-58deg", "-148deg"] as [string, string, string],
          leftElbow: ["-42deg", "-88deg", "-16deg"] as [string, string, string],
          rightElbow: ["42deg", "88deg", "16deg"] as [string, string, string],
          torso: ["-2deg", "-8deg", "-2deg"] as [string, string, string],
          leftShift: [0, -4, 10] as [number, number, number],
          rightShift: [0, 4, -10] as [number, number, number],
          chestBase: 0.82,
          backBase: 0.08,
          armBase: 0.58,
          legBase: 0.08,
        };
    }
  }, [profile]);

  const leftShoulderRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: config.leftShoulder,
  });

  const rightShoulderRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: config.rightShoulder,
  });

  const leftElbowRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: config.leftElbow,
  });

  const rightElbowRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: config.rightElbow,
  });

  const torsoRotate = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: config.torso,
  });

  const leftArmShift = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: config.leftShift,
  });

  const rightArmShift = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: config.rightShift,
  });

  const intensity = anim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.35, 0.65, 1],
  });

  const chestOpacity = profile === "press" ? intensity : config.chestBase;
  const backOpacity = profile === "hinge" ? intensity : config.backBase;

  const armOpacity =
    profile === "curl"
      ? intensity
      : profile === "press"
        ? anim.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0.45, 0.68, 0.82],
          })
        : config.armBase;

  const legOpacity = profile === "hinge" ? intensity : config.legBase;

  const chestOpacityOut = weightedOpacity(chestOpacity, chestMult, regionWeights.chest);
  const backOpacityOut = weightedOpacity(backOpacity, backMult, regionWeights.back);
  const armOpacityOut = weightedOpacity(armOpacity, armMult, regionWeights.arms);
  const legOpacityOut = weightedOpacity(legOpacity, legMult, regionWeights.legs);
  const coreOpacityOut = 0.45 * regionWeights.core;

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
          <View style={styles.head} />

          <View style={styles.upperBodyRow}>
            <Animated.View
              style={[
                styles.upperArm,
                styles.leftUpperArm,
                {
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

            <View style={styles.torso}>
              <Animated.View style={[styles.chestHighlight, { opacity: chestOpacityOut }]} />
              <Animated.View style={[styles.backHighlight, { opacity: backOpacityOut }]} />
              <View style={[styles.coreHighlight, { opacity: coreOpacityOut }]} />
            </View>

            <Animated.View
              style={[
                styles.upperArm,
                styles.rightUpperArm,
                {
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
            <View style={styles.leg}>
              <Animated.View style={[styles.legHighlight, { opacity: legOpacityOut }]} />
            </View>
            <View style={styles.leg}>
              <Animated.View style={[styles.legHighlight, { opacity: legOpacityOut }]} />
            </View>
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

function computeRegionWeights(coaching: ResolvedCoaching): RegionWeights {
  const i = coaching.intensity;
  const neutral: RegionWeights = {
    chest: 1,
    back: 1,
    core: 1,
    arms: 1,
    legs: 1,
  };

  if (coaching.focus === "auto") {
    return neutral;
  }

  if (coaching.focus === "full") {
    const bump = 1 + 0.14 * i;
    return {
      chest: bump,
      back: bump,
      core: bump,
      arms: bump,
      legs: bump,
    };
  }

  const dim = Math.max(0.5, 1 - 0.22 * i);
  const lift = 1 + 0.42 * i;

  const w: RegionWeights = {
    chest: dim,
    back: dim,
    core: dim,
    arms: dim,
    legs: dim,
  };

  switch (coaching.focus) {
    case "chest":
      w.chest = lift;
      break;
    case "back":
      w.back = lift;
      break;
    case "core":
      w.core = lift;
      break;
    case "arms":
      w.arms = lift;
      break;
    case "legs":
      w.legs = lift;
      break;
    default:
      break;
  }

  return w;
}

function weightedOpacity(
  opacity: number | Animated.AnimatedInterpolation<number>,
  mult: Animated.Value,
  multSnapshot: number
): number | Animated.AnimatedInterpolation<number> {
  if (typeof opacity === "number") {
    return clamp(opacity * multSnapshot, 0, 1);
  }
  return Animated.multiply(opacity, mult);
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
