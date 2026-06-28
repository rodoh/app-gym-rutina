"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ButtonLink } from "@/components/Buttons";
import { EmptyState, Panel, StatCard } from "@/components/Cards";
import { LoadChart } from "@/components/Charts";
import { exerciseHistory, formatDate, volumeForExercise } from "@/lib/metrics";
import { useTrainingStore } from "@/hooks/useTrainingStore";

export default function ExercisePage() {
  const params = useParams<{ id: string }>();
  const { program, sessions } = useTrainingStore();

  const exercise = useMemo(
    () => program.workoutDays.flatMap((day) => day.exercises).find((item) => item.id === params.id),
    [params.id, program.workoutDays]
  );
  const history = useMemo(() => exerciseHistory(sessions, params.id), [params.id, sessions]);

  if (!exercise) {
    return (
      <AppShell>
        <EmptyState title="Ejercicio no encontrado" body="Ese ejercicio no existe en la rutina actual." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Panel className="bg-gradient-to-br from-panel to-[#201215]">
          <p className="text-sm font-bold uppercase tracking-wide text-accentSoft">{exercise.muscleGroup}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{exercise.name}</h2>
          <p className="mt-2 text-zinc-300">
            {exercise.sets} series x {exercise.reps} reps - descanso {exercise.rest ?? "no definido"}
          </p>
          {exercise.notes ? <p className="mt-3 text-sm leading-6 text-zinc-300">{exercise.notes}</p> : null}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <StatCard label="Ultimo kg" value={history.lastWeightKg ?? "-"} />
            <StatCard label="Ultimas reps" value={history.lastReps ?? "-"} />
            <StatCard label="Mejor kg" value={history.bestWeightKg ?? "-"} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-xl font-black text-white">Evolucion reciente</h3>
          <LoadChart
            data={history.recentLoads.map((item) => ({
              date: formatDate(item.date),
              weightKg: item.weightKg,
              volumeKg: item.volumeKg
            }))}
          />
        </Panel>

        <Panel>
          <h3 className="text-xl font-black text-white">Registros anteriores</h3>
          <div className="mt-4 space-y-3">
            {history.sessions.length ? (
              history.sessions.map((session) => {
                const logged = session.exercises.find((item) => item.exerciseId === exercise.id);
                if (!logged) return null;
                return (
                  <article key={session.id} className="rounded-2xl border border-line bg-panelSoft p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-zinc-400">{formatDate(session.completedAt)}</p>
                        <h4 className="text-lg font-black text-white">{session.dayName}</h4>
                      </div>
                      <p className="rounded-full bg-ink/60 px-3 py-1 text-xs font-bold text-zinc-300">
                        {Math.round(volumeForExercise(logged))} kg
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-4">
                      {logged.sets.map((set) => (
                        <div key={set.setNumber} className="rounded-xl bg-ink/40 p-3 text-sm">
                          <p className="font-bold text-white">Serie {set.setNumber}</p>
                          <p className="text-zinc-400">
                            {set.weightKg || "-"} kg x {set.repsCompleted || "-"}
                          </p>
                          {set.notes ? <p className="mt-1 text-xs text-zinc-500">{set.notes}</p> : null}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState title="Sin historial" body="La primera sesion guardada va a crear el historial de este ejercicio." />
            )}
          </div>
        </Panel>

        <ButtonLink href="/progress" variant="secondary" className="w-full">
          Volver al historial general
        </ButtonLink>
      </div>
    </AppShell>
  );
}
