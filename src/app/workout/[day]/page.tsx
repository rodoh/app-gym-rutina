"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ButtonLink } from "@/components/Buttons";
import { EmptyState, Panel, StatCard } from "@/components/Cards";
import { ExerciseSummary } from "@/components/ExerciseSummary";
import { useTrainingStore } from "@/hooks/useTrainingStore";

export default function WorkoutDetailPage() {
  const params = useParams<{ day: string }>();
  const { program, sessions } = useTrainingStore();
  const day = program.workoutDays.find((item) => item.id === params.day);

  if (!day) {
    return (
      <AppShell>
        <EmptyState title="Entrenamiento no encontrado" body="Ese dia no existe en la rutina actual." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Panel className="bg-gradient-to-br from-panel to-[#1d1515]">
          <p className="text-sm font-bold uppercase tracking-wide text-accentSoft">{day.dayOfWeek}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{day.sessionName}</h2>
          <p className="mt-2 text-zinc-300">{day.focus}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Ejercicios" value={day.exercises.length} />
            <StatCard label="Duracion" value={`${day.estimatedMinutes}`} detail="min" />
            <StatCard label="Hora" value={day.timeLabel ?? "-"} />
            <StatCard label="Cardio" value="20-30" detail="min" />
          </div>
          <div className="mt-5">
            <ButtonLink href={`/session/${day.id}`} className="w-full sm:w-auto">
              Comenzar entrenamiento
            </ButtonLink>
          </div>
        </Panel>

        <Panel>
          <h3 className="text-xl font-black text-white">Calentamiento</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            {program.globalRules.warmup.general.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-line bg-panelSoft p-4">
            <p className="text-sm font-bold text-white">Series de aproximacion</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">
              {program.globalRules.warmup.rampUpSets.example.map((set) => (
                <div key={`${set.load}-${set.reps}`} className="rounded-lg bg-ink/50 p-3 text-sm">
                  <p className="font-bold text-white">{set.load}</p>
                  <p className="text-zinc-400">x {set.reps}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <div className="grid gap-3 lg:grid-cols-2">
          {day.exercises.map((exercise) => (
            <ExerciseSummary key={exercise.id} exercise={exercise} sessions={sessions} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
