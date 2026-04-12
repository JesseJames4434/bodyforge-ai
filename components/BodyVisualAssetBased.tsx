import { Image } from "expo-image";
import React, { useMemo } from "react";
import type { ImageSourcePropType } from "react-native";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

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

/** Temporary inline silhouettes: front (chest taper, leg split); back (wider upper back, waist, glute shelf). */
const SILHOUETTE_PATH = {
  front: `
    M 100 8
    C 112 8 121 16 123 28
    C 125 37 122 46 116 52
    L 114 56
    C 132 60 156 72 160 92
    C 162 104 156 118 146 130
    C 136 144 126 154 122 168
    C 118 182 120 196 124 210
    C 126 224 118 242 110 252
    L 105 254
    L 100 242
    L 95 254
    L 90 252
    C 82 242 74 224 76 210
    C 80 196 82 182 78 168
    C 74 154 64 144 54 130
    C 44 118 38 104 40 92
    C 44 72 68 60 86 56
    L 84 52
    C 78 46 75 37 77 28
    C 79 16 88 8 100 8
    Z
  `,
  back: `
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
  `,
} as const;

function silhouettePathForKind(kind: PlaceholderKind): keyof typeof SILHOUETTE_PATH {
  return kind === "backBase" || kind === "backHighlight" ? "back" : "front";
}

function SlotPlaceholder({ kind }: { kind: PlaceholderKind }) {
  const p = PLACEHOLDER[kind];
  const side = silhouettePathForKind(kind);
  const d = SILHOUETTE_PATH[side];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 260" preserveAspectRatio="xMidYMid meet">
      <Path
        d={d}
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function AssetOrPlaceholder({
  source,
  placeholderKind,
}: {
  source?: ImageSourcePropType;
  placeholderKind: PlaceholderKind;
}) {
  if (source) {
    return (
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        transition={120}
      />
    );
  }
  return <SlotPlaceholder kind={placeholderKind} />;
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
              <AssetOrPlaceholder source={baseSource} placeholderKind={baseKind} />
            </View>
            <View style={[StyleSheet.absoluteFill, { opacity: highlightOpacity }]} pointerEvents="none">
              <AssetOrPlaceholder source={hlSource} placeholderKind={hlKind} />
            </View>
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
