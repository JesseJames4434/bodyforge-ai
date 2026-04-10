export type BodySide = 'front' | 'back';

export type PostureStateKey = 'setup' | 'stretch' | 'contraction';

export type VisualProfile =
  | 'press'
  | 'hinge'
  | 'curl';

export type PostureState = {
  label: string;
  shortCue: string;
  detailCue: string;
  overlay?: string;
};

export type ExerciseDefinition = {
  id: string;
  name: string;
  muscles: Record<BodySide, string[]>;
  defaultBodySide: BodySide;
  dashboardFocus: string;
  visualProfile: VisualProfile;
  postureStates: Record<PostureStateKey, PostureState>;
  coaching: {
    early: string;
    middle: string;
    final: string;
  };
};

const exercises: ExerciseDefinition[] = [
  {
    id: 'incline_db_press',
    name: 'Incline Dumbbell Press',
    defaultBodySide: 'front',
    dashboardFocus: 'Upper chest tension and stable pressing mechanics.',
    visualProfile: 'press',
    muscles: {
      front: ['upper chest', 'front delts', 'triceps'],
      back: ['rear delts', 'upper back'],
    },
    postureStates: {
      setup: {
        label: 'Setup',
        shortCue: 'Set your base',
        detailCue:
          'Feet planted, shoulder blades pulled back, chest up, dumbbells stable above shoulders.',
        overlay: 'SETUP',
      },
      stretch: {
        label: 'Stretch',
        shortCue: 'Controlled depth',
        detailCue:
          'Lower the dumbbells with control, elbows slightly tucked, feel the stretch in upper chest.',
        overlay: 'STRETCH',
      },
      contraction: {
        label: 'Contraction',
        shortCue: 'Drive and squeeze',
        detailCue:
          'Press upward and inward, fully engage chest, control the lockout without losing tension.',
        overlay: 'CONTRACT',
      },
    },
    coaching: {
      early: 'Control the descent. Stay tight and stable.',
      middle: 'Maintain tension. Do not relax at the bottom.',
      final: 'Drive hard. Full contraction every rep.',
    },
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift',
    defaultBodySide: 'back',
    dashboardFocus: 'Hamstring loading, hip hinge control, and glute finish.',
    visualProfile: 'hinge',
    muscles: {
      front: ['core', 'grip'],
      back: ['glutes', 'hamstrings', 'lower back'],
    },
    postureStates: {
      setup: {
        label: 'Setup',
        shortCue: 'Brace before the hinge',
        detailCue:
          'Stand tall, soften the knees, lock in the lats, and keep the weight close to the thighs.',
        overlay: 'SETUP',
      },
      stretch: {
        label: 'Stretch',
        shortCue: 'Push hips back',
        detailCue:
          'Reach the hips back with a long spine and feel the hamstrings load without rounding the back.',
        overlay: 'HINGE LOAD',
      },
      contraction: {
        label: 'Contraction',
        shortCue: 'Drive hips through',
        detailCue:
          'Stand tall by squeezing the glutes and bringing the hips through without leaning backward.',
        overlay: 'GLUTE DRIVE',
      },
    },
    coaching: {
      early: 'Keep the bar path close and own the hinge.',
      middle: 'Load the hamstrings. Do not turn it into a squat.',
      final: 'Finish tall with glutes, not lower-back extension.',
    },
  },
  {
    id: 'dumbbell_curl',
    name: 'Dumbbell Curl',
    defaultBodySide: 'front',
    dashboardFocus: 'Elbow control, full biceps lengthening, and peak squeeze.',
    visualProfile: 'curl',
    muscles: {
      front: ['biceps', 'forearms'],
      back: ['upper back'],
    },
    postureStates: {
      setup: {
        label: 'Setup',
        shortCue: 'Lock elbows in place',
        detailCue:
          'Stand tall, keep the shoulders quiet, and let the dumbbells hang under control.',
        overlay: 'SETUP',
      },
      stretch: {
        label: 'Stretch',
        shortCue: 'Full lower position',
        detailCue:
          'Reach the bottom without swinging and keep tension through the biceps and forearms.',
        overlay: 'LENGTHEN',
      },
      contraction: {
        label: 'Contraction',
        shortCue: 'Peak squeeze',
        detailCue:
          'Curl up hard, squeeze at the top, and avoid rolling the shoulders forward.',
        overlay: 'PEAK SQUEEZE',
      },
    },
    coaching: {
      early: 'Pin the elbows and remove body English.',
      middle: 'Control the lowering phase and keep tension on the biceps.',
      final: 'Squeeze hard at the top without cheating the rep.',
    },
  },
];

const exerciseOrder = exercises.map((e) => e.id);

export function getExerciseById(exerciseId?: string): ExerciseDefinition {
  const found = exercises.find((e) => e.id === exerciseId);
  return found ?? exercises[0];
}

export function getNextExerciseId(currentId?: string): string | undefined {
  const index = exerciseOrder.findIndex((id) => id === currentId);

  if (index === -1) return exerciseOrder[0];

  return exerciseOrder[index + 1];
}

export function getExerciseOrder(): string[] {
  return exerciseOrder;
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