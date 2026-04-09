export type BodySide = 'front' | 'back';

export type PostureStateKey = 'setup' | 'stretch' | 'contraction';

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