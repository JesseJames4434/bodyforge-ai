import { MuscleType } from '../components/BodyVisual';

export type ExerciseItem = {
  id: string;
  name: string;
  primaryMuscle: string;
  sets: number;
  reps: string;
  cue: string;
};

export type DailyFocus = {
  title: string;
  subtitle: string;
  muscleType: MuscleType;
};

export const WORKOUT_TEMPLATE: ExerciseItem[] = [
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    primaryMuscle: 'Upper Chest',
    sets: 3,
    reps: '8–10',
    cue: 'Keep your shoulders locked down and drive through the upper chest.',
  },
  {
    id: 'machine-lateral-raise',
    name: 'Machine Lateral Raise',
    primaryMuscle: 'Lateral Delts',
    sets: 3,
    reps: '12–15',
    cue: 'Lead with the elbows and keep tension at the top.',
  },
  {
    id: 'cable-triceps-pressdown',
    name: 'Cable Triceps Pressdown',
    primaryMuscle: 'Triceps',
    sets: 3,
    reps: '10–12',
    cue: 'Pin your elbows in place and fully extend with control.',
  },
];

export const COACH_INSIGHT =
  'Pressing performance should feel strong today. Stay controlled in the stretch, keep tension on the target muscle, and avoid rushing reps.';

export function serializeWorkout(workout: ExerciseItem[] = WORKOUT_TEMPLATE) {
  return JSON.stringify(workout);
}

export function getMuscleTypeFromName(primaryMuscle: string): MuscleType {
  const muscle = primaryMuscle.toLowerCase();

  if (muscle.includes('chest')) return 'chest';
  if (muscle.includes('delt') || muscle.includes('shoulder')) return 'shoulder';
  if (muscle.includes('triceps')) return 'triceps';
  if (muscle.includes('back') || muscle.includes('lat')) return 'back';

  return 'other';
}

export function getDailyFocusFromWorkout(
  workout: ExerciseItem[] = WORKOUT_TEMPLATE
): DailyFocus {
  const primaryExercise = workout[0];

  if (!primaryExercise) {
    return {
      title: 'Training Focus',
      subtitle: 'No workout loaded yet',
      muscleType: 'other',
    };
  }

  const muscleType = getMuscleTypeFromName(primaryExercise.primaryMuscle);

  if (muscleType === 'chest') {
    return {
      title: 'Upper Body Power',
      subtitle: 'Chest-led pressing emphasis',
      muscleType,
    };
  }

  if (muscleType === 'shoulder') {
    return {
      title: 'Shoulder Development',
      subtitle: 'Delts-led upper body emphasis',
      muscleType,
    };
  }

  if (muscleType === 'triceps') {
    return {
      title: 'Arm Extension Focus',
      subtitle: 'Triceps-led pressing support',
      muscleType,
    };
  }

  if (muscleType === 'back') {
    return {
      title: 'Posterior Chain Focus',
      subtitle: 'Back-led pulling emphasis',
      muscleType,
    };
  }

  return {
    title: 'Training Focus',
    subtitle: primaryExercise.primaryMuscle,
    muscleType,
  };
}

export const DAILY_FOCUS = getDailyFocusFromWorkout();