export type BodySide = 'front' | 'back';

export type MuscleGroup =
  | 'chest'
  | 'frontDelts'
  | 'sideDelts'
  | 'rearDelts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lats'
  | 'upperBack'
  | 'lowerBack'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type PostureStateKey = 'setup' | 'stretch' | 'contraction';

export type PosePreset =
  | 'standing-neutral'
  | 'press-stretch'
  | 'press-contraction'
  | 'hinge-setup'
  | 'hinge-stretch'
  | 'hinge-contraction'
  | 'curl-setup'
  | 'curl-stretch'
  | 'curl-contraction';

export type PostureStateDefinition = {
  key: PostureStateKey;
  label: string;
  shortCue: string;
  detailCue: string;
  posePreset: PosePreset;
};

export type ExerciseDefinition = {
  id: string;
  name: string;
  muscles: {
    front: MuscleGroup[];
    back: MuscleGroup[];
  };
  defaultBodySide: BodySide;
  postureStates: Record<PostureStateKey, PostureStateDefinition>;
  coaching: {
    early: string;
    middle: string;
    final: string;
  };
};

export const exercises: Record<string, ExerciseDefinition> = {
  'incline-dumbbell-press': {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscles: {
      front: ['chest', 'frontDelts', 'triceps'],
      back: [],
    },
    defaultBodySide: 'front',
    postureStates: {
      setup: {
        key: 'setup',
        label: 'Setup',
        shortCue: 'Set shoulder blades and plant feet.',
        detailCue:
          'Pull shoulders down and back, keep chest tall, and start with the dumbbells stacked over the upper chest line.',
        posePreset: 'standing-neutral',
      },
      stretch: {
        key: 'stretch',
        label: 'Stretch',
        shortCue: 'Lower with control into a loaded chest stretch.',
        detailCue:
          'Elbows track slightly below the bench line, wrists stay stacked, and the chest stays open without losing upper-back tension.',
        posePreset: 'press-stretch',
      },
      contraction: {
        key: 'contraction',
        label: 'Contraction',
        shortCue: 'Drive up and squeeze through the chest.',
        detailCue:
          'Press up on a slight arc, stop short of shoulder dump-forward, and finish with chest tension instead of just locking the elbows.',
        posePreset: 'press-contraction',
      },
    },
    coaching: {
      early: 'Own the setup. Lock in shoulder position before chasing reps.',
      middle: 'Keep tension in the chest. Do not bounce out of the bottom.',
      final: 'Drive hard, but keep the rep path controlled and stable.',
    },
  },

  'romanian-deadlift': {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscles: {
      front: ['quads', 'abs'],
      back: ['glutes', 'hamstrings', 'lowerBack'],
    },
    defaultBodySide: 'back',
    postureStates: {
      setup: {
        key: 'setup',
        label: 'Setup',
        shortCue: 'Stand tall and brace before the hinge.',
        detailCue:
          'Ribs stacked, lats engaged, soft knees, and the bar starts close to the thighs before the hips move back.',
        posePreset: 'hinge-setup',
      },
      stretch: {
        key: 'stretch',
        label: 'Stretch',
        shortCue: 'Push hips back and load hamstrings.',
        detailCue:
          'Keep the bar close, spine long, and stop when hamstrings are fully loaded without losing pelvic control.',
        posePreset: 'hinge-stretch',
      },
      contraction: {
        key: 'contraction',
        label: 'Contraction',
        shortCue: 'Drive hips through and finish tall.',
        detailCue:
          'Stand up by squeezing glutes, not by leaning backward. Finish stacked and stable.',
        posePreset: 'hinge-contraction',
      },
    },
    coaching: {
      early: 'Make this a hinge, not a squat. Hips travel back first.',
      middle: 'Load the hamstrings. Keep the bar path tight to the body.',
      final: 'Stand tall with glutes. Do not overextend at the top.',
    },
  },

  'dumbbell-curl': {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    muscles: {
      front: ['biceps', 'forearms'],
      back: [],
    },
    defaultBodySide: 'front',
    postureStates: {
      setup: {
        key: 'setup',
        label: 'Setup',
        shortCue: 'Stand tall with elbows pinned.',
        detailCue:
          'Brace lightly, keep shoulders quiet, and start with the dumbbells hanging under the elbows.',
        posePreset: 'curl-setup',
      },
      stretch: {
        key: 'stretch',
        label: 'Stretch',
        shortCue: 'Fully lengthen without losing elbow position.',
        detailCue:
          'Reach the bottom under control and keep tension in the biceps instead of swinging out of the stretch.',
        posePreset: 'curl-stretch',
      },
      contraction: {
        key: 'contraction',
        label: 'Contraction',
        shortCue: 'Curl up and squeeze hard at the top.',
        detailCue:
          'Bring the hands up by flexing the elbows, not by rolling the shoulders forward.',
        posePreset: 'curl-contraction',
      },
    },
    coaching: {
      early: 'Elbows stay anchored. Remove body swing.',
      middle: 'Own the squeeze and lower slower than you lift.',
      final: 'Fight for the top contraction without cheating the torso.',
    },
  },
};

export const exerciseOrder = [
  'incline-dumbbell-press',
  'romanian-deadlift',
  'dumbbell-curl',
];

export function getExerciseById(exerciseId?: string): ExerciseDefinition {
  if (exerciseId && exercises[exerciseId]) {
    return exercises[exerciseId];
  }

  return exercises[exerciseOrder[0]];
}

export function getCoachingCueForSet(
  exercise: ExerciseDefinition,
  currentSet: number,
  totalSets: number
): string {
  const progress = totalSets <= 1 ? 1 : currentSet / totalSets;

  if (progress <= 0.34) return exercise.coaching.early;
  if (progress <= 0.67) return exercise.coaching.middle;
  return exercise.coaching.final;
}