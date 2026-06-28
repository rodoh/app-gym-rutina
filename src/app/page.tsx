"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ButtonLink } from "@/components/Buttons";
import { EmptyState, Panel, StatCard } from "@/components/Cards";
import { DayPicker } from "@/components/DayPicker";
import { routineImportNotes } from "@/lib/importRoutine";
import {
  completedSets,
  currentSpanishDay,
  formatDate,
  todayKey,
  volumeForSession
} from "@/lib/metrics";
import { useTrainingStore } from "@/hooks/useTrainingStore";

export default function HomePage() {
  const { program, sessions } = useTrainingStore();
  const today = currentSpanishDay();
  const plannedToday = program.workoutDays.find((day) => day.dayOfWeek === today);
  const [selectedId, setSelectedId] = useState(plannedToday?.id ?? program.workoutDays[0]?.id ?? "");
  const selectedDay = program.workoutDays.find((day) => day.id === selectedId);

  const recent = useMemo(
    () => sessions.slice().sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0],
    [sessions]
  );

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="space-y-4">
          {plannedToday ? (
            <Panel className="bg-gradient-to-br from-panel to-[#201215]">
              <p className="text-sm font-bold uppercase tracking-wide text-accentSoft">Entrenamiento de hoy</p>
              <h2 className="mt-2 text-3xl font-black text-white">{plannedToday.sessionName}</h2>
              <p className="mt-2 text-zinc-300">{plannedToday.focus}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Dia" value={plannedToday.dayOfWeek} />
                <StatCard label="Ejercicios" value={plannedToday.exercises.length} />
                <StatCard label="Duracion" value={`${plannedToday.estimatedMinutes} min`} />
                <StatCard label="Hora" value={plannedToday.timeLabel ?? "-"} />
              </div>
              <p className="mt-4 rounded-xl border border-line bg-ink/40 p-3 text-sm text-zinc-300">
                Cardio: {plannedToday.cardioSuggestion}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ButtonLink href={`/session/${plannedToday.id}`}>Comenzar entrenamiento</ButtonLink>
                <ButtonLink href={`/workout/${plannedToday.id}`} variant="secondary">
                  Ver detalle
                </ButtonLink>
              </div>
            </Panel>
          ) : (
            <Panel>
              <EmptyState
                title="Hoy toca descanso"
                body="No hay rutina programada para hoy. Podes elegir manualmente otro entrenamiento si vas a recuperar una sesion."
              />
            </Panel>
          )}

          <Panel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Elegir manualmente</p>
                <h2 className="text-xl font-black">Rutina semanal</h2>
              </div>
              <span className="rounded-full bg-panelSoft px-3 py-1 text-xs font-bold text-zinc-400">{todayKey()}</span>
            </div>
            <DayPicker days={program.workoutDays} selectedId={selectedId} onSelect={setSelectedId} />
            {selectedDay ? (
              <div className="mt-4 rounded-2xl border border-line bg-panelSoft p-4">
                <h3 className="text-xl font-black text-white">{selectedDay.sessionName}</h3>
                <p className="mt-1 text-sm text-zinc-400">{selectedDay.focus}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <StatCard label="Ejercicios" value={selectedDay.exercises.length} />
                  <StatCard label="Duracion" value={`${selectedDay.estimatedMinutes}`} detail="min" />
                  <StatCard label="Cardio" value="Zona 2" detail="post" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ButtonLink href={`/session/${selectedDay.id}`}>Comenzar</ButtonLink>
                  <ButtonLink href={`/workout/${selectedDay.id}`} variant="secondary">
                    Consultar
                  </ButtonLink>
                </div>
              </div>
            ) : null}
          </Panel>
        </section>

        <aside className="space-y-4">
          <Panel>
            <h2 className="text-lg font-black text-white">Programa</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{program.goal}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <StatCard label="Semanas" value={program.durationWeeks} />
              <StatCard label="Dias" value={program.workoutDays.length} />
            </div>
          </Panel>

          <Panel>
            <h2 className="text-lg font-black text-white">Ultima sesion</h2>
            {recent ? (
              <div className="mt-3 space-y-3 text-sm text-zinc-300">
                <p>
                  <span className="font-bold text-white">{recent.dayName}</span> - {formatDate(recent.completedAt)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Series" value={completedSets(recent)} />
                  <StatCard label="Volumen" value={`${Math.round(volumeForSession(recent))}`} detail="kg" />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">Todavia no guardaste entrenamientos.</p>
            )}
          </Panel>

          <Panel>
            <h2 className="text-lg font-black text-white">Importacion inicial</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
              {routineImportNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
