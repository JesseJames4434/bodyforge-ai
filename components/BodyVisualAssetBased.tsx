import { Image } from "expo-image";
import React, { useMemo } from "react";
import type { ImageSourcePropType } from "react-native";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import {
  type BodyVisualProps,
  type Posture,
  type Profile,
  resolveBodyView,
  resolveCoaching,
  resolvePosture,
  resolveProfile,
} from "./BodyVisual";

/**
 * Raster (or bundled image) slots for the asset pipeline. Replace placeholders by passing
 * `require("…")` results for PNG/WebP (recommended for RN). Example future files:
 * - assets/body/front-base.png
 * - assets/body/back-base.png
 * - assets/body/front-highlight.png
 * - assets/body/back-highlight.png
 */
export type BodyVisualAssetSources = {
  frontBase: ImageSourcePropType;
  backBase: ImageSourcePropType;
  frontHighlight: ImageSourcePropType;
  backHighlight: ImageSourcePropType;
};

export type BodyVisualAssetBasedProps = BodyVisualProps & {
  /** When set, layers use real artwork instead of inline SVG placeholders. */
  assets?: Partial<BodyVisualAssetSources>;
  testID?: string;
};

type PlaceholderKind = "frontBase" | "backBase" | "frontHighlight" | "backHighlight";

const PLACEHOLDER: Record<PlaceholderKind, { fill: string; stroke: string }> = {
  frontBase: { fill: "#6B6B74", stroke: "#3F3F46" },
  backBase: { fill: "#5A5A64", stroke: "#3F3F46" },
  frontHighlight: {
    fill: "rgba(255,122,24,0.35)",
    stroke: "rgba(255,122,24,0.85)",
  },
  backHighlight: {
    fill: "rgba(255,122,24,0.3)",
    stroke: "rgba(255,122,24,0.8)",
  },
};

function postureMotion(posture: Posture): { scale: number; translateY: number } {
  switch (posture) {
    case "stretch":
      return { scale: 1.02, translateY: -4 };
    case "contraction":
      return { scale: 1.04, translateY: 2 };
    case "setup":
    default:
      return { scale: 1, translateY: 0 };
  }
}

/** Temporary back silhouette (single path). Front uses discrete primitives in {@link FrontBodySilhouette}. */
const SILHOUETTE_PATH_BACK = `
    M 100 8
    C 112 8 121 16 123 28
    C 125 37 122 46 116 52
    L 114 56
    C 142 62 168 82 170 104
    C 171 122 160 140 142 154
    C 128 166 120 180 124 196
    C 130 214 126 232 116 248
    L 108 254
    L 100 240
    L 92 254
    L 84 248
    C 74 232 70 214 76 196
    C 80 180 72 166 58 154
    C 40 140 29 122 30 104
    C 32 82 58 62 86 56
    L 84 52
    C 78 46 75 37 77 28
    C 79 16 88 8 100 8
    Z
`;

function isBackPlaceholderKind(kind: PlaceholderKind): boolean {
  return kind === "backBase" || kind === "backHighlight";
}

/** Front placeholder: separate head, neck, shoulders, chest, waist, pelvis, legs (no single full-body path). */
function FrontBodySilhouette({ fill, stroke }: { fill: string; stroke: string }) {
  const s = {
    fill,
    stroke,
    strokeWidth: 1.25,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  return (
    <>
      <Circle cx={100} cy={22} r={13} {...s} />
      <Rect x={93} y={34} width={14} height={9} rx={3.5} {...s} />
      <Rect x={36} y={43} width={128} height={11} rx={6} {...s} />
      <Path
        d="M 41 56 L 159 56 Q 162 56 162 60 L 145 104 Q 143 108 139 108 L 61 108 Q 57 108 55 104 L 38 60 Q 38 56 41 56 Z"
        {...s}
      />
      <Rect x={64} y={108} width={72} height={34} rx={10} {...s} />
      <Rect x={56} y={140} width={88} height={28} rx={11} {...s} />
      <Rect x={62} y={166} width={30} height={88} rx={10} {...s} />
      <Rect x={108} y={166} width={30} height={88} rx={10} {...s} />
    </>
  );
}

function SlotPlaceholder({ kind }: { kind: PlaceholderKind }) {
  const p = PLACEHOLDER[kind];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 260" preserveAspectRatio="xMidYMid meet">
      {isBackPlaceholderKind(kind) ? (
        <Path
          d={SILHOUETTE_PATH_BACK}
          fill={p.fill}
          stroke={p.stroke}
          strokeWidth={1.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : (
        <FrontBodySilhouette fill={p.fill} stroke={p.stroke} />
      )}
    </Svg>
  );
}

function BaseSlotImage({ source }: { source: ImageSourcePropType }) {
  return (
    <Image
      source={source}
      style={StyleSheet.absoluteFill}
      contentFit="contain"
      transition={120}
    />
  );
}

/**
 * Asset-oriented body visual: stacks base + highlight layers per view. Accepts the same props as
 * {@link BodyVisual} so screens can swap implementations without changing call sites.
 */
export default function BodyVisualAssetBased(props: BodyVisualAssetBasedProps) {
  void props.highlightedMuscles;

  const view = resolveBodyView(props);
  const posture = resolvePosture(props);
  const profile = resolveProfile(props);
  const coaching = useMemo(() => resolveCoaching(props.coaching), [props.coaching]);
  const motion = useMemo(() => postureMotion(posture), [posture]);

  const highlightOpacity = useMemo(() => {
    const base = posture === "setup" ? 0.22 : posture === "stretch" ? 0.38 : 0.52;
    if (coaching.focus === "auto") {
      return base;
    }
    return Math.min(1, base + 0.35 * coaching.intensity);
  }, [coaching.focus, coaching.intensity, posture]);

  const baseKind: PlaceholderKind = view === "back" ? "backBase" : "frontBase";
  const hlKind: PlaceholderKind = view === "back" ? "backHighlight" : "frontHighlight";

  const baseSource =
    view === "back" ? props.assets?.backBase : props.assets?.frontBase;
  const hlSource =
    view === "back" ? props.assets?.backHighlight : props.assets?.frontHighlight;

  /** Custom base art replaces the vector silhouette; do not stack highlight placeholders on top. */
  const hasCustomBaseAsset = Boolean(baseSource);

  return (
    <View style={styles.wrapper} testID={props.testID}>
      <View style={styles.figureBox}>
        <View
          style={[
            styles.canvas,
            {
              transform: [
                { translateY: motion.translateY },
                { scale: motion.scale },
              ],
            },
          ]}
        >
          {/* Reserved: profile-driven transforms or alternate asset URIs */}
          <View
            style={styles.layerStack}
            accessibilityLabel={`Body ${view}, ${posture}, profile ${profile}`}
          >
            <View style={StyleSheet.absoluteFill}>
              {baseSource ? (
                <BaseSlotImage source={baseSource} />
              ) : (
                <SlotPlaceholder kind={baseKind} />
              )}
            </View>
            {hlSource || !hasCustomBaseAsset ? (
              <View
                style={[StyleSheet.absoluteFill, { opacity: highlightOpacity }]}
                pointerEvents="none"
              >
                {hlSource ? (
                  <BaseSlotImage source={hlSource} />
                ) : (
                  <SlotPlaceholder kind={hlKind} />
                )}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
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
  canvas: {
    width: "100%",
    height: "100%",
  },
  layerStack: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
});
