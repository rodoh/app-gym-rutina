import source from "../../workout_data.json";
import type { DayName, Exercise, Program, WorkoutDay } from "@/types/training";

type SourceExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  category: string;
  rest?: string;
  rpeTarget?: string;
  notes?: string;
};

type SourceDay = {
  day: DayName;
  time?: string;
  sessionName: string;
  type: string;
  exercises: SourceExercise[];
};

const muscleByType: Record<string, string> = {
  upper_strength: "Tren superior - fuerza",
  lower_strength: "Tren inferior - fuerza",
  upper_hypertrophy: "Tren superior - hipertrofia",
  lower_hypertrophy: "Tren inferior - hipertrofia"
};

const muscleByCategory: Record<string, string> = {
  main: "Principal",
  main_accessory: "Principal accesorio",
  accessory: "Accesorio",
  core: "Core"
};

const normalizeId = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const estimateMinutes = (exercises: SourceExercise[]) => {
  const workMinutes = exercises.reduce((total, exercise) => {
    const restMinutes = exercise.rest?.includes("2-3") ? 3 : exercise.rest?.includes("90-120") ? 2 : 1.5;
    return total + exercise.sets * restMinutes + 2;
  }, 10);
  return Math.round(workMinutes / 5) * 5;
};

const mapExercise = (exercise: SourceExercise): Exercise => ({
  id: exercise.id,
  name: exercise.name,
  muscleGroup: muscleByCategory[exercise.category] ?? exercise.category,
  category: exercise.category,
  sets: exercise.sets,
  reps: exercise.reps,
  rest: exercise.rest,
  notes: [exercise.notes, exercise.rpeTarget ? `RPE objetivo: ${exercise.rpeTarget}` : ""]
    .filter(Boolean)
    .join(" ")
});

const mapDay = (day: SourceDay): WorkoutDay => ({
  id: normalizeId(day.day),
  dayOfWeek: day.day,
  timeLabel: day.time,
  sessionName: day.sessionName,
  focus: muscleByType[day.type] ?? day.type,
  type: day.type,
  estimatedMinutes: estimateMinutes(day.exercises),
  cardioSuggestion: source.program.globalRules.cardio.postWorkout,
  exercises: day.exercises.map(mapExercise)
});

export const initialProgram: Program = {
  id: "rutina-12-semanas",
  name: source.program.name,
  owner: source.program.owner,
  durationWeeks: source.program.durationWeeks,
  goal: source.program.goal,
  context: source.program.context,
  globalRules: source.program.globalRules,
  workoutDays: (source.program.weeklySchedule as SourceDay[]).map(mapDay)
};

export const routineImportNotes = [
  "No existia una carpeta /data en el workspace; use workout_data.json de la raiz como fuente inicial porque es el dataset estructurado de la rutina.",
  "La semana importada contiene lunes superior fuerza, martes inferior fuerza, viernes superior hipertrofia y sabado inferior hipertrofia.",
  "Los rangos de carga no estan definidos por ejercicio en el JSON, por eso la app los oculta y muestra historial real cuando exista."
];
