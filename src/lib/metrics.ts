import type { Exercise, ExerciseHistory, ExerciseLog, SetLog, WorkoutDay, WorkoutSession } from "@/types/training";

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));

export const currentSpanishDay = () => {
  const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"] as const;
  return days[new Date().getDay()];
};

export const volumeForSet = (set: SetLog) => {
  if (typeof set.weightKg !== "number" || typeof set.repsCompleted !== "number") return 0;
  return set.weightKg * set.repsCompleted;
};

export const volumeForExercise = (exercise: ExerciseLog) =>
  exercise.sets.reduce((total, set) => total + volumeForSet(set), 0);

export const volumeForSession = (session: WorkoutSession) =>
  session.exercises.reduce((total, exercise) => total + volumeForExercise(exercise), 0);

export const completedSets = (session: WorkoutSession) =>
  session.exercises.reduce((total, exercise) => total + exercise.sets.filter((set) => set.completed).length, 0);

export const plannedSets = (session: WorkoutSession) =>
  session.exercises.reduce((total, exercise) => total + exercise.plannedSets, 0);

export const isMainLift = (exercise: Exercise) =>
  exercise.category === "main" || exercise.category === "main_accessory";

export const exerciseHistory = (sessions: WorkoutSession[], exerciseId: string): ExerciseHistory => {
  const matching = sessions
    .filter((session) => session.exercises.some((exercise) => exercise.exerciseId === exerciseId))
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  const allSets = matching.flatMap((session) => {
    const exercise = session.exercises.find((item) => item.exerciseId === exerciseId);
    return (
      exercise?.sets
        .filter((set) => set.completed && typeof set.weightKg === "number" && typeof set.repsCompleted === "number")
        .map((set) => ({
          date: session.completedAt,
          weightKg: set.weightKg as number,
          reps: set.repsCompleted as number,
          volumeKg: volumeForSet(set)
        })) ?? []
    );
  });

  const last = allSets[0];
  const best = allSets.reduce<typeof last | undefined>(
    (max, item) => (!max || item.weightKg > max.weightKg ? item : max),
    undefined
  );

  return {
    exerciseId,
    lastWeightKg: last?.weightKg,
    lastReps: last?.reps,
    bestWeightKg: best?.weightKg,
    recentLoads: allSets.slice(0, 8).reverse(),
    sessions: matching
  };
};

export const lastSetsForExercise = (sessions: WorkoutSession[], exerciseId: string) => {
  const latest = sessions
    .slice()
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .find((session) => session.exercises.some((exercise) => exercise.exerciseId === exerciseId));
  return latest?.exercises.find((exercise) => exercise.exerciseId === exerciseId)?.sets ?? [];
};

export const buildSessionExercises = (day: WorkoutDay): ExerciseLog[] =>
  day.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    plannedSets: exercise.sets,
    targetReps: exercise.reps,
    notes: exercise.notes,
    personalNotes: "",
    sets: Array.from({ length: exercise.sets }, (_, index) => ({
      setNumber: index + 1,
      targetReps: exercise.reps,
      weightKg: "",
      repsCompleted: "",
      rpe: "",
      rir: "",
      completed: false,
      notes: ""
    }))
  }));

export const previousSameDaySession = (sessions: WorkoutSession[], workoutDayId: string) =>
  sessions
    .filter((session) => session.workoutDayId === workoutDayId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

export const compareWithPrevious = (current: WorkoutSession, previous?: WorkoutSession) => {
  if (!previous) return "Sin sesion anterior comparable.";
  const volumeDiff = volumeForSession(current) - volumeForSession(previous);
  const setDiff = completedSets(current) - completedSets(previous);
  const volumeText = volumeDiff === 0 ? "mismo volumen" : `${volumeDiff > 0 ? "+" : ""}${Math.round(volumeDiff)} kg`;
  const setText = setDiff === 0 ? "mismas series" : `${setDiff > 0 ? "+" : ""}${setDiff} series`;
  return `${volumeText} y ${setText} contra la sesion anterior de este dia.`;
};

export const validateSession = (session: WorkoutSession) => {
  const hasCompletedSet = session.exercises.some((exercise) => exercise.sets.some((set) => set.completed));
  if (!hasCompletedSet) return "No se puede guardar una sesion vacia.";

  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      if (set.weightKg !== "" && set.weightKg < 0) return "El peso no puede ser negativo.";
      if (set.repsCompleted !== "" && set.repsCompleted < 0) return "Las repeticiones no pueden ser negativas.";
      if (set.completed && (set.weightKg === "" || set.repsCompleted === "")) {
        return `Completa peso y repeticiones en ${exercise.exerciseName}, serie ${set.setNumber}.`;
      }
    }
  }

  if (session.cardio?.minutes !== "" && session.cardio?.minutes !== undefined && session.cardio.minutes < 0) {
    return "Los minutos de cardio no pueden ser negativos.";
  }
  if (session.cardio?.speedKmh !== "" && session.cardio?.speedKmh !== undefined && session.cardio.speedKmh < 0) {
    return "La velocidad de cardio no puede ser negativa.";
  }
  if (
    session.cardio?.averageHeartRate !== "" &&
    session.cardio?.averageHeartRate !== undefined &&
    session.cardio.averageHeartRate < 0
  ) {
    return "Las pulsaciones promedio no pueden ser negativas.";
  }

  return null;
};

export const progressionSuggestion = (
  exercise: ExerciseLog,
  dayType: string,
  session: Pick<WorkoutSession, "energyLevel" | "nauseaLevel" | "sleepHours">
) => {
  if (session.energyLevel !== "" && Number(session.energyLevel) <= 2) return "Mantener: energia baja.";
  if (session.nauseaLevel !== "" && Number(session.nauseaLevel) >= 2) return "Mantener o bajar: nauseas altas.";
  if (session.sleepHours !== "" && Number(session.sleepHours) > 0 && Number(session.sleepHours) < 6) return "Mantener: descanso bajo.";

  const completedAll = exercise.sets.every((set) => set.completed && Number(set.repsCompleted) > 0);
  const highRpe = exercise.sets.some((set) => Number(set.rpe) >= 9);
  if (!completedAll) return "Repetir carga: no se completaron todas las series.";
  if (highRpe) return "Mantener: esfuerzo alto.";

  return dayType.includes("upper") ? "Proxima vez: subir 2 a 2.5 kg si la tecnica fue solida." : "Proxima vez: subir 5 kg si la tecnica fue solida.";
};
