import Link from "next/link";
import { exerciseHistory } from "@/lib/metrics";
import type { Exercise, WorkoutSession } from "@/types/training";

export function ExerciseSummary({
  exercise,
  sessions
}: {
  exercise: Exercise;
  sessions: WorkoutSession[];
}) {
  const history = exerciseHistory(sessions, exercise.id);

  return (
    <article className="rounded-2xl border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accentSoft">{exercise.muscleGroup}</p>
          <h3 className="mt-1 text-lg font-black text-white">{exercise.name}</h3>
        </div>
        <Link
          href={`/exercise/${exercise.id}`}
          className="shrink-0 rounded-full border border-line px-3 py-2 text-xs font-bold text-zinc-300"
        >
          Historial
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-panelSoft p-3">
          <p className="text-zinc-500">Series</p>
          <p className="font-black">{exercise.sets}</p>
        </div>
        <div className="rounded-xl bg-panelSoft p-3">
          <p className="text-zinc-500">Reps</p>
          <p className="font-black">{exercise.reps}</p>
        </div>
        <div className="rounded-xl bg-panelSoft p-3">
          <p className="text-zinc-500">Descanso</p>
          <p className="font-black">{exercise.rest ?? "-"}</p>
        </div>
      </div>
      {history.lastWeightKg ? (
        <p className="mt-3 text-sm text-zinc-300">
          Ultimo: <span className="font-bold text-white">{history.lastWeightKg} kg</span> x {history.lastReps} reps
        </p>
      ) : null}
      {exercise.notes ? <p className="mt-3 text-sm leading-6 text-zinc-400">{exercise.notes}</p> : null}
    </article>
  );
}
