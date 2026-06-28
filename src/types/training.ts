export type DayName =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type CardioType =
  | "bicicleta"
  | "caminata"
  | "cinta"
  | "eliptico"
  | "remo"
  | "otro";

export type PlannedSet = {
  setNumber: number;
  targetReps: string;
};

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
  sets: number;
  reps: string;
  rest?: string;
  loadRange?: string;
  notes?: string;
};

export type WorkoutDay = {
  id: string;
  dayOfWeek: DayName;
  timeLabel?: string;
  sessionName: string;
  focus: string;
  type: string;
  estimatedMinutes: number;
  cardioSuggestion?: string;
  exercises: Exercise[];
};

export type Program = {
  id: string;
  name: string;
  owner: string;
  durationWeeks: number;
  goal: string;
  context: {
    medication?: string;
    nutrition?: string;
    trainingDays: string[];
    constraints: string[];
  };
  globalRules: {
    warmup: {
      general: string[];
      rampUpSets: {
        description: string;
        example: Array<{ load: string; reps: string | number }>;
        followingExercises: string;
      };
    };
    rest: {
      mainLifts: string;
      accessoryLifts: string;
    };
    progression: {
      upperBodyIncrementKg: string;
      lowerBodyIncrementKg: string;
      rule: string;
    };
    intensityBlocks: Array<{
      weeks: string;
      rpe: string;
      rir: string;
      focus: string;
    }>;
    cardio: {
      postWorkout: string;
      offDays: string;
      heartRateReference: string;
    };
  };
  workoutDays: WorkoutDay[];
};

export type SetLog = {
  setNumber: number;
  targetReps: string;
  weightKg: number | "";
  repsCompleted: number | "";
  rpe?: number | "";
  rir?: number | "";
  completed: boolean;
  notes?: string;
};

export type ExerciseLog = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  plannedSets: number;
  targetReps: string;
  notes?: string;
  personalNotes?: string;
  sets: SetLog[];
};

export type CardioLog = {
  type: CardioType;
  minutes: number | "";
  intensity: number | "";
  speedKmh?: number | "";
  averageHeartRate?: number | "";
  distanceKm?: number | "";
  calories?: number | "";
  notes?: string;
};

export type WorkoutSession = {
  id: string;
  workoutDayId: string;
  dayName: string;
  date: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  weekNumber?: number;
  bodyWeightKg?: number | "";
  energyLevel?: number | "";
  appetiteLevel?: number | "";
  nauseaLevel?: number | "";
  sleepHours?: number | "";
  generalFeeling?: number | "";
  generalNotes?: string;
  cardio?: CardioLog;
  exercises: ExerciseLog[];
};

export type ExerciseHistory = {
  exerciseId: string;
  lastWeightKg?: number;
  lastReps?: number;
  bestWeightKg?: number;
  recentLoads: Array<{ date: string; weightKg: number; volumeKg: number }>;
  sessions: WorkoutSession[];
};
