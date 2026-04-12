import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

export type Posture = 'setup' | 'stretch' | 'contraction';
export type Profile = 'press' | 'hinge' | 'curl';
export type BodyView = 'front' | 'back';

export type CoachingFocus =
  | 'auto'
  | 'full'
  | 'chest'
  | 'back'
  | 'core'
  | 'arms'
  | 'legs';

export type Coaching = {
  focus?: CoachingFocus;
  intensity?: number;
};

export type BodyVisualV3Props = {
  posture?: Posture | PostureObject;
  postureState?: Posture | PostureObject;
  state?: Posture | PostureObject;
  visualProfile?: Profile;
  exerciseType?: Profile;
  profile?: Profile;
  coaching?: Coaching | null;
  view?: BodyView;
  side?: BodyView;
  highlightedMuscles?: readonly string[];
  width?: number | string;
  height?: number | string;
};

type PostureObject = {
  label?: unknown;
  shortCue?: unknown;
  detailCue?: unknown;
  overlay?: unknown;
};

type Phase = 0 | 1 | 2;

type ArmPose = { shoulderDeg: number; elbowFlexDeg: number };

const C = {
  skinDeep: '#5A5A62',
  skinMid: '#6C6C76',
  skin: '#7E7E88',
  skinHi: '#92929C',
  shadow: '#4A4A52',
  accent: '#FF7A18',
  accentGlow: '#FFB347',
  spine: '#45454D',
  line: '#55555E',
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerp3(a: number, b: number, c: number, phase: Phase) {
  return phase === 0 ? a : phase === 1 ? b : c;
}

function resolvePhase(props: BodyVisualV3Props): Phase {
  const raw =
    props.postureState ?? props.posture ?? props.state ?? 'setup';
  const key =
    typeof raw === 'string'
      ? raw
      : typeof raw === 'object' && raw !== null && 'label' in raw
        ? String((raw as PostureObject).label ?? 'setup').toLowerCase()
        : 'setup';
  if (key.includes('stretch')) return 1;
  if (key.includes('contract')) return 2;
  return 0;
}

function resolveProfile(props: BodyVisualV3Props): Profile {
  return (
    props.visualProfile ??
    props.exerciseType ??
    props.profile ??
    'press'
  );
}

function resolveView(props: BodyVisualV3Props): BodyView {
  return props.view ?? props.side ?? 'front';
}

function resolveCoaching(
  coaching: Coaching | null | undefined,
  profile: Profile
): { focus: CoachingFocus; intensity: number } {
  const intensity = Math.min(
    1,
    Math.max(0, coaching?.intensity ?? 0.72)
  );
  let focus: CoachingFocus = coaching?.focus ?? 'auto';
  if (focus === 'auto') {
    if (profile === 'press') focus = 'chest';
    else if (profile === 'hinge') focus = 'back';
    else focus = 'arms';
  }
  return { focus, intensity };
}

/** Front: continuous chest shelf → oblique taper → iliac flare (single organic mass). */
const PATH_HEAD_NECK_F =
  'M80 12 C60 12 46 24 44 42 C42 54 47 64 56 69 L58 70 C52 72 48 78 48 86 C50 90 56 92 64 91 L72 89 L80 88 L88 89 L96 91 C104 92 110 90 112 86 C112 78 108 72 102 70 L104 69 C113 64 118 54 116 42 C114 24 100 12 80 12 Z';

const PATH_TORSO_PELVIS_F =
  'M80 88' +
  ' C68 88 54 92 46 100' +
  ' C36 112 32 128 34 144' +
  ' C36 162 46 178 60 186' +
  ' L68 190' +
  ' C64 200 66 210 74 214' +
  ' L80 216' +
  ' L86 214' +
  ' C94 210 96 200 92 190' +
  ' L100 186' +
  ' C114 178 124 162 126 144' +
  ' C128 128 124 112 114 100' +
  ' C106 92 92 88 80 88 Z';

const PATH_CLAVICLE_F =
  'M52 90 Q80 96 108 90';

const PATH_STERNAL_SOFT =
  'M80 108 C74 112 72 124 74 136 C76 146 80 152 80 152 C80 152 84 146 86 136 C88 124 86 112 80 108 Z';

/** Thigh / calf in hip-local space (hip = 0,0). */
const PATH_THIGH_F_L =
  'M0 0 C-6 8 -12 32 -12 54 C-12 72 -8 88 -2 98 L6 100 L10 96 L8 70 L4 36 L0 0 Z';

const PATH_THIGH_F_R =
  'M0 0 C6 8 12 32 12 54 C12 72 8 88 2 98 L-6 100 L-10 96 L-8 70 L-4 36 L0 0 Z';

const PATH_CALF_F_L =
  'M-2 0 C-6 14 -6 36 0 52 L6 56 L10 50 L8 30 L4 12 L-2 0 Z';

const PATH_CALF_F_R =
  'M2 0 C6 14 6 36 0 52 L-6 56 L-10 50 L-8 30 L-4 12 L2 0 Z';

/** Back: lat spread, spine plane, separate glute read. */
const PATH_HEAD_NECK_B =
  'M80 12 C60 12 45 25 43 44 C41 58 46 68 55 73 L52 76 C48 80 46 86 48 92 L56 96 L66 93 L76 90 L80 88 L84 90 L94 93 L104 96 L112 92 C114 86 112 80 108 76 L105 73 C114 68 119 58 117 44 C115 25 100 12 80 12 Z';

const PATH_TORSO_LAT_B =
  'M80 88' +
  ' C62 90 44 100 36 118' +
  ' C28 138 30 160 42 176' +
  ' C50 186 64 192 80 194' +
  ' C96 192 110 186 118 176' +
  ' C130 160 132 138 124 118' +
  ' C116 100 98 90 80 88 Z';

const PATH_PELVIS_GLUTE_B =
  'M80 194 L66 198 C54 204 48 218 50 232 L54 244 L66 248 L80 250 L94 248 L106 244 L110 232 C112 218 106 204 94 198 Z';

const PATH_SPINE_GROOVE =
  'M80 96 C77 118 76 142 77 164 C78 178 79 188 80 194 C81 188 82 178 83 164 C84 142 83 118 80 96 Z';

const PATH_TRAP_B =
  'M80 90 L56 96 L50 108 L62 114 L80 110 L98 114 L110 108 L104 96 Z';

const PATH_THIGH_B_L =
  'M0 0 C-8 6 -14 28 -14 50 C-14 70 -10 86 -4 98 L4 100 L8 96 L6 68 L2 34 L0 0 Z';

const PATH_THIGH_B_R =
  'M0 0 C8 6 14 28 14 50 C14 70 10 86 4 98 L-4 100 L-8 96 L-6 68 L-2 34 L0 0 Z';

const PATH_CALF_B_L =
  'M-2 0 C-6 16 -4 38 2 54 L8 58 L10 48 L8 28 L2 8 L-2 0 Z';

const PATH_CALF_B_R =
  'M2 0 C6 16 4 38 -2 54 L-8 58 L-10 48 L-8 28 L-2 8 L2 0 Z';

const PATH_UPPER_ARM_F =
  'M20 6 C9 12 3 30 5 46 C7 60 12 72 20 76 C28 72 33 60 35 46 C37 30 31 12 20 6 Z';

const PATH_FOREARM_F =
  'M18 4 C9 22 7 46 9 66 C10 76 13 84 18 86 C23 84 26 76 27 66 C29 46 27 22 18 4 Z';

const PATH_UPPER_ARM_B =
  'M20 6 C7 14 1 34 4 50 C6 64 12 76 20 80 C28 76 34 64 36 50 C39 34 33 14 20 6 Z';

const PATH_FOREARM_B =
  'M18 4 C8 24 6 48 8 68 C9 78 12 86 18 88 C24 86 27 78 28 68 C30 48 28 24 18 4 Z';

const ELBOW_OFFSET_Y = 68;

const ARM_POSE: Record<Profile, [ArmPose, ArmPose, ArmPose]> = {
  press: [
    { shoulderDeg: 18, elbowFlexDeg: 42 },
    { shoulderDeg: 42, elbowFlexDeg: 12 },
    { shoulderDeg: -36, elbowFlexDeg: 22 },
  ],
  hinge: [
    { shoulderDeg: 6, elbowFlexDeg: 8 },
    { shoulderDeg: 14, elbowFlexDeg: 2 },
    { shoulderDeg: 2, elbowFlexDeg: 14 },
  ],
  curl: [
    { shoulderDeg: 10, elbowFlexDeg: 18 },
    { shoulderDeg: 8, elbowFlexDeg: 6 },
    { shoulderDeg: 8, elbowFlexDeg: 118 },
  ],
};

const TORSO_LEAN: Record<Profile, [number, number, number]> = {
  press: [0, 0, 0],
  hinge: [4, 14, 1.5],
  curl: [0, 0, 0],
};

const KNEE_FLEX: Record<Profile, [number, number, number]> = {
  press: [0, 0, 0],
  hinge: [3, 12, 1],
  curl: [0, 0, 0],
};

const FIGURE_STRETCH: [number, number, number] = [1, 1.028, 0.992];
const WAIST_SHIFT_Y: [number, number, number] = [0, 1.2, -0.8];

const BASE_SHOULDER_Y = 94;
const BASE_HIP_Y = 214;
const PIVOT_Y = 168;

type OverlaySpec = { d: string; opacity: number; tags: string[] };

function coachingOverlays(
  back: boolean,
  focus: CoachingFocus,
  intensity: number,
  profile: Profile,
  phase: Phase
): OverlaySpec[] {
  const pulse = lerp(0.52, 0.9, intensity) + phase * 0.03;
  const o = (w: number) => Math.min(0.92, w * pulse);

  const front: Record<string, { d: string; tags: string[] }> = {
    pec: {
      d: 'M80 120 L56 128 L50 152 L62 172 L80 180 L98 172 L110 152 L104 128 Z',
      tags: ['chest', 'upper chest', 'pec'],
    },
    delt: {
      d: 'M46 96 L34 108 L38 124 L50 118 L54 100 Z M114 96 L126 108 L122 124 L110 118 L106 100 Z',
      tags: ['delt', 'shoulder', 'front delts'],
    },
    arm: {
      d: 'M38 122 L26 158 L30 186 L44 178 L50 138 Z M122 122 L134 158 L130 186 L116 178 L110 138 Z',
      tags: ['arm', 'biceps', 'triceps', 'forearm'],
    },
    core: {
      d: 'M80 180 L62 186 L58 208 L68 222 L80 226 L92 222 L102 208 L98 186 Z',
      tags: ['core', 'abs', 'oblique'],
    },
    quad: {
      d: 'M64 210 L54 246 L60 278 L74 272 L78 232 Z M96 210 L106 246 L100 278 L86 272 L82 232 Z',
      tags: ['quad', 'leg'],
    },
  };

  const rear: Record<string, { d: string; tags: string[] }> = {
    lat: {
      d: 'M80 112 L48 122 L42 154 L58 176 L80 184 L102 176 L118 154 L112 122 Z',
      tags: ['back', 'lat', 'upper back'],
    },
    lowback: {
      d: 'M80 184 L62 192 L58 214 L70 228 L80 232 L90 228 L102 214 L98 192 Z',
      tags: ['lower back', 'back', 'spine'],
    },
    glute: {
      d: 'M68 204 L56 224 L62 244 L80 250 L98 244 L104 224 L92 204 Z',
      tags: ['glute', 'hip'],
    },
    ham: {
      d: 'M58 246 L52 278 L62 298 L72 282 L70 252 Z M102 246 L108 278 L98 298 L88 282 L90 252 Z',
      tags: ['hamstring', 'leg'],
    },
    arm: {
      d: 'M42 116 L28 146 L32 180 L46 172 L50 128 Z M118 116 L132 146 L128 180 L114 172 L110 128 Z',
      tags: ['arm', 'triceps', 'rear delts'],
    },
  };

  const out: OverlaySpec[] = [];
  const push = (
    map: Record<string, { d: string; tags: string[] }>,
    key: string,
    w: number
  ) => {
    const item = map[key];
    if (item) out.push({ d: item.d, opacity: o(w), tags: item.tags });
  };

  if (back) {
    if (focus === 'full' || focus === 'back') {
      push(rear, 'lat', 1);
      push(rear, 'lowback', 0.85);
      push(rear, 'ham', 0.72);
    }
    if (focus === 'legs') {
      push(rear, 'ham', 1);
      push(rear, 'glute', 0.88);
    }
    if (focus === 'arms') push(rear, 'arm', 1);
    if (focus === 'core') push(rear, 'lowback', 1);
  } else {
    if (focus === 'full') {
      push(front, 'pec', 0.72);
      push(front, 'delt', 0.62);
      push(front, 'arm', 0.52);
      push(front, 'core', 0.58);
      push(front, 'quad', 0.48);
    }
    if (focus === 'chest') {
      push(front, 'pec', 1);
      push(front, 'delt', 0.68);
    }
    if (focus === 'arms') {
      push(front, 'arm', 1);
      push(front, 'delt', 0.52);
    }
    if (focus === 'core') push(front, 'core', 1);
    if (focus === 'legs') push(front, 'quad', 1);
  }

  if (out.length === 0) {
    if (profile === 'press' && !back) push(front, 'pec', 0.82);
    else if (profile === 'hinge' && back) push(rear, 'lat', 0.82);
    else if (!back) push(front, 'arm', 0.82);
    else push(rear, 'ham', 0.82);
  }

  return out;
}

function highlightBoost(tags: string[], muscles: readonly string[] | undefined) {
  if (!muscles?.length) return 0;
  const lower = muscles.map((m) => m.toLowerCase());
  let add = 0;
  for (const tag of tags) {
    if (lower.some((m) => m.includes(tag) || tag.includes(m))) {
      add = 0.18;
      break;
    }
  }
  return add;
}

type LimbSide = 'L' | 'R';

function ArmGroup(props: {
  side: LimbSide;
  back: boolean;
  cx: number;
  cy: number;
  pose: ArmPose;
}) {
  const { side, back, cx, cy, pose } = props;
  const mirror = side === 'R' ? -1 : 1;
  const sh = pose.shoulderDeg * mirror;
  const flex = pose.elbowFlexDeg * mirror;
  const ox = side === 'L' ? -22 : 22;
  const upper = back ? PATH_UPPER_ARM_B : PATH_UPPER_ARM_F;
  const fore = back ? PATH_FOREARM_B : PATH_FOREARM_F;

  return (
    <G transform={`translate(${cx + ox} ${cy}) rotate(${sh})`}>
      <G transform="translate(-20 -6)">
        <Path
          d={upper}
          fill="url(#skinGrad)"
          stroke={C.line}
          strokeWidth={0.35}
        />
      </G>
      <G transform={`translate(0 ${ELBOW_OFFSET_Y}) rotate(${flex})`}>
        <G transform="translate(-18 -4)">
          <Path
            d={fore}
            fill="url(#skinGrad)"
            stroke={C.line}
            strokeWidth={0.35}
          />
        </G>
      </G>
    </G>
  );
}

function LegGroup(props: {
  side: LimbSide;
  back: boolean;
  kneeDeg: number;
  hipX: number;
  hipY: number;
  thighPath: string;
  calfPath: string;
}) {
  const { side, back, kneeDeg, hipX, hipY, thighPath, calfPath } = props;
  const mirror = side === 'R' ? -1 : 1;
  const k = kneeDeg * mirror;

  return (
    <G transform={`translate(${hipX} ${hipY})`}>
      <G transform={`rotate(${k * 0.2})`}>
        <Path
          d={thighPath}
          fill="url(#skinGrad)"
          stroke={C.line}
          strokeWidth={0.35}
        />
      </G>
      <G
        transform={`translate(${side === 'L' ? -4 : 4} 98) rotate(${k})`}
      >
        <Path
          d={calfPath}
          fill={back ? C.skinMid : 'url(#skinGrad)'}
          stroke={C.line}
          strokeWidth={0.35}
        />
      </G>
    </G>
  );
}

export default function BodyVisualV3(props: BodyVisualV3Props) {
  const phase = resolvePhase(props);
  const profile = resolveProfile(props);
  const back = resolveView(props) === 'back';
  const { focus, intensity } = resolveCoaching(props.coaching, profile);

  const pose = ARM_POSE[profile][phase];
  const lean = lerp3(
    TORSO_LEAN[profile][0],
    TORSO_LEAN[profile][1],
    TORSO_LEAN[profile][2],
    phase
  );
  const knee = lerp3(
    KNEE_FLEX[profile][0],
    KNEE_FLEX[profile][1],
    KNEE_FLEX[profile][2],
    phase
  );
  const figSx = lerp3(
    FIGURE_STRETCH[0],
    FIGURE_STRETCH[1],
    FIGURE_STRETCH[2],
    phase
  );
  const figSy = lerp3(
    1 / FIGURE_STRETCH[0],
    1 / FIGURE_STRETCH[1],
    1 / FIGURE_STRETCH[2],
    phase
  );
  const waistY = lerp3(WAIST_SHIFT_Y[0], WAIST_SHIFT_Y[1], WAIST_SHIFT_Y[2], phase);

  const overlays = useMemo(
    () => coachingOverlays(back, focus, intensity, profile, phase),
    [back, focus, intensity, profile, phase]
  );

  const hipY = BASE_HIP_Y + waistY;
  const shoulderY = BASE_SHOULDER_Y + waistY * 0.45;

  return (
    <View style={styles.wrap}>
      <Svg
        width={props.width ?? '100%'}
        height={props.height ?? 320}
        viewBox="0 0 160 320"
      >
        <Defs>
          <LinearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={C.skinHi} />
            <Stop offset="42%" stopColor={C.skin} />
            <Stop offset="100%" stopColor={C.skinDeep} />
          </LinearGradient>
          <LinearGradient id="depthGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor={C.skinHi} stopOpacity={0.28} />
            <Stop offset="100%" stopColor={C.shadow} stopOpacity={0.45} />
          </LinearGradient>
        </Defs>

        <G
          transform={`translate(80 ${PIVOT_Y}) scale(${figSx}, ${figSy}) translate(-80 -${PIVOT_Y})`}
        >
          <G transform={`translate(80 ${hipY}) rotate(${lean}) translate(-80 -${hipY})`}>
            {back ? (
              <>
                <Path
                  d={PATH_HEAD_NECK_B}
                  fill="url(#skinGrad)"
                  stroke={C.line}
                  strokeWidth={0.4}
                  transform={`translate(0 ${waistY * 0.12})`}
                />
                <Path d={PATH_TRAP_B} fill={C.skinDeep} opacity={0.88} />
                <Path
                  d={PATH_TORSO_LAT_B}
                  fill="url(#skinGrad)"
                  stroke={C.line}
                  strokeWidth={0.45}
                />
                <Path d={PATH_SPINE_GROOVE} fill={C.spine} opacity={0.5} />
                <Path
                  d={PATH_PELVIS_GLUTE_B}
                  fill="url(#skinGrad)"
                  stroke={C.line}
                  strokeWidth={0.4}
                />
              </>
            ) : (
              <>
                <Path
                  d={PATH_HEAD_NECK_F}
                  fill="url(#skinGrad)"
                  stroke={C.line}
                  strokeWidth={0.4}
                  transform={`translate(0 ${waistY * 0.12})`}
                />
                <Path
                  d={PATH_TORSO_PELVIS_F}
                  fill="url(#skinGrad)"
                  stroke={C.line}
                  strokeWidth={0.45}
                />
                <Path
                  d={PATH_CLAVICLE_F}
                  fill="none"
                  stroke={C.line}
                  strokeWidth={0.35}
                  opacity={0.55}
                />
                <Path
                  d={PATH_STERNAL_SOFT}
                  fill="url(#depthGrad)"
                  opacity={0.42}
                />
              </>
            )}

            <ArmGroup side="L" back={back} cx={80} cy={shoulderY} pose={pose} />
            <ArmGroup side="R" back={back} cx={80} cy={shoulderY} pose={pose} />
          </G>

          <LegGroup
            side="L"
            back={back}
            kneeDeg={knee}
            hipX={72}
            hipY={hipY}
            thighPath={back ? PATH_THIGH_B_L : PATH_THIGH_F_L}
            calfPath={back ? PATH_CALF_B_L : PATH_CALF_F_L}
          />
          <LegGroup
            side="R"
            back={back}
            kneeDeg={knee}
            hipX={88}
            hipY={hipY}
            thighPath={back ? PATH_THIGH_B_R : PATH_THIGH_F_R}
            calfPath={back ? PATH_CALF_B_R : PATH_CALF_F_R}
          />

          {overlays.map((spec, i) => (
            <Path
              key={i}
              d={spec.d}
              fill={C.accent}
              fillOpacity={
                spec.opacity +
                highlightBoost(spec.tags, props.highlightedMuscles)
              }
              stroke={C.accentGlow}
              strokeWidth={0.2}
              strokeOpacity={spec.opacity * 0.55}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
