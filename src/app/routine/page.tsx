"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, ButtonLink } from "@/components/Buttons";
import { EmptyState, Panel } from "@/components/Cards";
import { DayPicker } from "@/components/DayPicker";
import { useTrainingStore } from "@/hooks/useTrainingStore";
import type { DayName, Exercise, WorkoutDay } from "@/types/training";

const dayOptions: DayName[] = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createExercise = (): Exercise => ({
  id: `ejercicio-${Date.now()}`,
  name: "Nuevo ejercicio",
  muscleGroup: "Accesorio",
  category: "accessory",
  sets: 3,
  reps: "10",
  rest: "60-90 s",
  notes: ""
});

export default function RoutinePage() {
  const { program, saveProgram, resetProgram } = useTrainingStore();
  const [selectedId, setSelectedId] = useState(program.workoutDays[0]?.id ?? "");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const selectedDay = useMemo(
    () => program.workoutDays.find((day) => day.id === selectedId) ?? program.workoutDays[0],
    [program.workoutDays, selectedId]
  );

  const updateDay = (dayId: string, patch: Partial<WorkoutDay>) => {
    const next = {
      ...program,
      workoutDays: program.workoutDays.map((day) => (day.id === dayId ? { ...day, ...patch } : day))
    };
    saveProgram(next);
  };

  const updateExercise = (dayId: string, exerciseId: string, patch: Partial<Exercise>) => {
    const next = {
      ...program,
      workoutDays: program.workoutDays.map((day) =>
        day.id !== dayId
          ? day
          : {
              ...day,
              exercises: day.exercises.map((exercise) =>
                exercise.id === exerciseId ? { ...exercise, ...patch } : exercise
              )
            }
      )
    };
    saveProgram(next);
  };

  const addDay = () => {
    const nextName = "Nuevo dia";
    const newDay: WorkoutDay = {
      id: `dia-${Date.now()}`,
      dayOfWeek: "lunes",
      sessionName: nextName,
      focus: "Foco por definir",
      type: "custom",
      estimatedMinutes: 60,
      cardioSuggestion: program.globalRules.cardio.postWorkout,
      exercises: []
    };
    saveProgram({ ...program, workoutDays: [...program.workoutDays, newDay] });
    setSelectedId(newDay.id);
  };

  const duplicateDay = (day: WorkoutDay) => {
    const copy: WorkoutDay = {
      ...day,
      id: `${day.id}-copia-${Date.now()}`,
      sessionName: `${day.sessionName} copia`,
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        id: `${exercise.id}-copia-${Date.now()}`
      }))
    };
    saveProgram({ ...program, workoutDays: [...program.workoutDays, copy] });
    setSelectedId(copy.id);
  };

  const deleteDay = (dayId: string) => {
    const nextDays = program.workoutDays.filter((day) => day.id !== dayId);
    saveProgram({ ...program, workoutDays: nextDays });
    setSelectedId(nextDays[0]?.id ?? "");
  };

  const addExercise = (dayId: string) => {
    const day = program.workoutDays.find((item) => item.id === dayId);
    if (!day) return;
    updateDay(dayId, { exercises: [...day.exercises, createExercise()] });
  };

  const duplicateExercise = (dayId: string, exercise: Exercise) => {
    const day = program.workoutDays.find((item) => item.id === dayId);
    if (!day) return;
    updateDay(dayId, {
      exercises: [
        ...day.exercises,
        {
          ...exercise,
          id: `${exercise.id}-copia-${Date.now()}`,
          name: `${exercise.name} copia`
        }
      ]
    });
  };

  const deleteExercise = (dayId: string, exerciseId: string) => {
    const day = program.workoutDays.find((item) => item.id === dayId);
    if (!day) return;
    updateDay(dayId, { exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId) });
  };

  const reorderExercise = (targetIndex: number) => {
    if (dragIndex === null || !selectedDay || dragIndex === targetIndex) return;
    const exercises = [...selectedDay.exercises];
    const [moved] = exercises.splice(dragIndex, 1);
    exercises.splice(targetIndex, 0, moved);
    updateDay(selectedDay.id, { exercises });
    setDragIndex(null);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <Panel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-accentSoft">Editar rutina</p>
              <h2 className="text-3xl font-black text-white">Dias y ejercicios</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button variant="secondary" onClick={addDay}>
                Crear dia
              </Button>
              <Button variant="danger" onClick={resetProgram}>
                Restaurar inicial
              </Button>
            </div>
          </div>
          <div className="mt-5">
            <DayPicker days={program.workoutDays} selectedId={selectedDay?.id ?? ""} onSelect={setSelectedId} />
          </div>
        </Panel>

        {!selectedDay ? (
          <EmptyState title="Sin dias" body="Crea un dia de entrenamiento para empezar a armar la rutina." />
        ) : (
          <>
            <Panel>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Nombre del dia"
                  value={selectedDay.sessionName}
                  onChange={(value) => updateDay(selectedDay.id, { sessionName: value })}
                />
                <label>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Dia semanal</span>
                  <select
                    value={selectedDay.dayOfWeek}
                    onChange={(event) => updateDay(selectedDay.id, { dayOfWeek: event.target.value as DayName })}
                    className="min-h-12 w-full rounded-xl border border-line bg-ink/50 px-3 font-bold outline-none focus:border-accent"
                  >
                    {dayOptions.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField
                  label="Foco muscular"
                  value={selectedDay.focus}
                  onChange={(value) => updateDay(selectedDay.id, { focus: value })}
                />
                <TextField
                  label="Hora"
                  value={selectedDay.timeLabel ?? ""}
                  onChange={(value) => updateDay(selectedDay.id, { timeLabel: value })}
                />
                <NumberField
                  label="Duracion estimada"
                  value={selectedDay.estimatedMinutes}
                  onChange={(value) => updateDay(selectedDay.id, { estimatedMinutes: Math.max(0, value) })}
                />
                <TextField
                  label="Tipo interno"
                  value={selectedDay.type}
                  onChange={(value) => updateDay(selectedDay.id, { type: slug(value) || "custom" })}
                />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Button onClick={() => addExercise(selectedDay.id)}>Agregar ejercicio</Button>
                <Button variant="secondary" onClick={() => duplicateDay(selectedDay)}>
                  Duplicar dia
                </Button>
                <Button variant="danger" onClick={() => deleteDay(selectedDay.id)}>
                  Eliminar dia
                </Button>
              </div>
            </Panel>

            <div className="space-y-3">
              {selectedDay.exercises.map((exercise, index) => (
                <Panel key={exercise.id} className="bg-panelSoft">
                  <div
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => reorderExercise(index)}
                    className="mb-4 flex cursor-grab items-center justify-between gap-3 rounded-xl border border-line bg-ink/40 p-3"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Arrastrar</p>
                      <h3 className="text-lg font-black text-white">{exercise.name}</h3>
                    </div>
                    <span className="rounded-full bg-panel px-3 py-1 text-xs font-bold text-zinc-400">#{index + 1}</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Nombre"
                      value={exercise.name}
                      onChange={(value) => updateExercise(selectedDay.id, exercise.id, { name: value })}
                    />
                    <TextField
                      label="Grupo muscular"
                      value={exercise.muscleGroup}
                      onChange={(value) => updateExercise(selectedDay.id, exercise.id, { muscleGroup: value })}
                    />
                    <NumberField
                      label="Series"
                      value={exercise.sets}
                      onChange={(value) => updateExercise(selectedDay.id, exercise.id, { sets: Math.max(1, value) })}
                    />
                    <TextField
                      label="Repeticiones"
                      value={exercise.reps}
                      onChange={(value) => updateExercise(selectedDay.id, exercise.id, { reps: value })}
                    />
                    <TextField
                      label="Descanso"
                      value={exercise.rest ?? ""}
                      onChange={(value) => updateExercise(selectedDay.id, exercise.id, { rest: value })}
                    />
                    <TextField
                      label="Rango de carga"
                      value={exercise.loadRange ?? ""}
                      onChange={(value) => updateExercise(selectedDay.id, exercise.id, { loadRange: value })}
                    />
                  </div>
                  <label className="mt-3 block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Notas</span>
                    <textarea
                      value={exercise.notes ?? ""}
                      onChange={(event) => updateExercise(selectedDay.id, exercise.id, { notes: event.target.value })}
                      className="min-h-20 w-full rounded-xl border border-line bg-ink/50 px-3 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <ButtonLink href={`/exercise/${exercise.id}`} variant="secondary">
                      Historial
                    </ButtonLink>
                    <Button variant="secondary" onClick={() => duplicateExercise(selectedDay.id, exercise)}>
                      Duplicar
                    </Button>
                    <Button variant="danger" onClick={() => deleteExercise(selectedDay.id, exercise.id)}>
                      Eliminar
                    </Button>
                  </div>
                </Panel>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function TextField({
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-line bg-ink/50 px-3 font-bold outline-none focus:border-accent"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-12 w-full rounded-xl border border-line bg-ink/50 px-3 font-bold outline-none focus:border-accent"
      />
    </label>
  );
}
