"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, Panel, StatCard } from "@/components/Cards";
import { LoadChart } from "@/components/Charts";
import {
  completedSets,
  exerciseHistory,
  formatDate,
  volumeForExercise,
  volumeForSession
} from "@/lib/metrics";
import { useTrainingStore } from "@/hooks/useTrainingStore";

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export default function ProgressPage() {
  const { program, sessions } = useTrainingStore();
  const [dayFilter, setDayFilter] = useState("todos");
  const [exerciseFilter, setExerciseFilter] = useState("todos");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const exercises = useMemo(
    () =>
      program.workoutDays.flatMap((day) =>
        day.exercises.map((exercise) => ({
          ...exercise,
          dayName: day.sessionName
        }))
      ),
    [program.workoutDays]
  );

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        if (dayFilter !== "todos" && session.workoutDayId !== dayFilter) return false;
        if (fromDate && session.date < fromDate) return false;
        if (toDate && session.date > toDate) return false;
        if (exerciseFilter !== "todos" && !session.exercises.some((exercise) => exercise.exerciseId === exerciseFilter)) {
          return false;
        }
        return true;
      }),
    [dayFilter, exerciseFilter, fromDate, sessions, toDate]
  );

  const weekStart = startOfWeek(new Date());
  const weeklySessions = sessions.filter((session) => new Date(session.date) >= weekStart);
  const weeklyVolume = weeklySessions.reduce((total, session) => total + volumeForSession(session), 0);
  const weeklySets = weeklySessions.reduce((total, session) => total + completedSets(session), 0);
  const weeklyCardio = weeklySessions.reduce((total, session) => total + Number(session.cardio?.minutes || 0), 0);

  const selectedExercise = exerciseFilter !== "todos" ? exerciseHistory(sessions, exerciseFilter) : undefined;

  return (
    <AppShell>
      <div className="space-y-4">
        <Panel>
          <p className="text-sm font-bold uppercase tracking-wide text-accentSoft">Historial general</p>
          <h2 className="text-3xl font-black text-white">Progreso</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Sesiones semana" value={weeklySessions.length} />
            <StatCard label="Series semana" value={weeklySets} />
            <StatCard label="Volumen semana" value={Math.round(weeklyVolume)} detail="kg" />
            <StatCard label="Cardio semana" value={weeklyCardio} detail="min" />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-xl font-black text-white">Filtros</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Dia</span>
              <select
                value={dayFilter}
                onChange={(event) => setDayFilter(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-line bg-ink/50 px-3 font-bold outline-none focus:border-accent"
              >
                <option value="todos">Todos</option>
                {program.workoutDays.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.sessionName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Ejercicio</span>
              <select
                value={exerciseFilter}
                onChange={(event) => setExerciseFilter(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-line bg-ink/50 px-3 font-bold outline-none focus:border-accent"
              >
                <option value="todos">Todos</option>
                {exercises.map((exercise) => (
                  <option key={`${exercise.dayName}-${exercise.id}`} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </label>
            <DateField label="Desde" value={fromDate} onChange={setFromDate} />
            <DateField label="Hasta" value={toDate} onChange={setToDate} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-xl font-black text-white">Calendario</h3>
          {sessions.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {sessions.slice(0, 28).map((session) => (
                <div key={session.id} className="rounded-xl border border-line bg-panelSoft p-3">
                  <p className="text-sm font-black text-white">{formatDate(session.completedAt)}</p>
                  <p className="mt-1 text-xs text-zinc-400">{session.dayName}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin sesiones" body="Cuando guardes entrenamientos, van a aparecer en el calendario." />
          )}
        </Panel>

        {selectedExercise ? (
          <Panel>
            <h3 className="text-xl font-black text-white">Evolucion de carga</h3>
            <LoadChart
              data={selectedExercise.recentLoads.map((item) => ({
                date: formatDate(item.date),
                weightKg: item.weightKg,
                volumeKg: item.volumeKg
              }))}
            />
          </Panel>
        ) : null}

        <Panel>
          <h3 className="text-xl font-black text-white">Sesiones</h3>
          <div className="mt-4 space-y-3">
            {filteredSessions.length ? (
              filteredSessions.map((session) => (
                <article key={session.id} className="rounded-2xl border border-line bg-panelSoft p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{formatDate(session.completedAt)}</p>
                      <h4 className="text-xl font-black text-white">{session.dayName}</h4>
                    </div>
                    <p className="text-sm font-bold text-accentSoft">{session.durationMinutes} min</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <StatCard label="Series" value={completedSets(session)} />
                    <StatCard label="Volumen" value={Math.round(volumeForSession(session))} detail="kg" />
                    <StatCard label="Cardio" value={session.cardio?.minutes || 0} detail="min" />
                  </div>
                  <div className="mt-3 space-y-2">
                    {session.exercises.map((exercise) => (
                      <div key={exercise.exerciseId} className="rounded-xl bg-ink/40 p-3 text-sm">
                        <p className="font-bold text-white">{exercise.exerciseName}</p>
                        <p className="text-zinc-400">
                          {exercise.sets.filter((set) => set.completed).length}/{exercise.plannedSets} series -{" "}
                          {Math.round(volumeForExercise(exercise))} kg
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="Sin resultados" body="No hay sesiones que coincidan con los filtros." />
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function DateField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-line bg-ink/50 px-3 font-bold outline-none focus:border-accent"
      />
    </label>
  );
}
