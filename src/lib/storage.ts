import { initialProgram } from "@/lib/importRoutine";
import type { Program, WorkoutSession } from "@/types/training";

const ROUTINE_KEY = "gym-app:routine:v1";
const SESSIONS_KEY = "gym-app:sessions:v1";

const canUseStorage = () => typeof window !== "undefined" && "localStorage" in window;

const readJson = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const trainingStorage = {
  getRoutine: () => readJson<Program>(ROUTINE_KEY, initialProgram),
  saveRoutine: (program: Program) => writeJson(ROUTINE_KEY, program),
  resetRoutine: () => writeJson(ROUTINE_KEY, initialProgram),
  getSessions: () => readJson<WorkoutSession[]>(SESSIONS_KEY, []),
  saveSessions: (sessions: WorkoutSession[]) => writeJson(SESSIONS_KEY, sessions)
};
