"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Buttons";
import { EmptyState, Panel, StatCard } from "@/components/Cards";
import {
  buildSessionExercises,
  compareWithPrevious,
  completedSets,
  lastSetsForExercise,
  plannedSets,
  previousSameDaySession,
  progressionSuggestion,
  validateSession,
  volumeForSession
} from "@/lib/metrics";
import { useTrainingStore } from "@/hooks/useTrainingStore";
import type { CardioLog, ExerciseLog, SetLog, WorkoutSession } from "@/types/training";

const numberOrEmpty = (value: string) => (value === "" ? "" : Number(value));

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultCardio: CardioLog = {
  type: "bicicleta",
  minutes: "",
  intensity: "",
  distanceKm: "",
  calories: "",
  notes: ""
};

export default function SessionPage() {
  const params = useParams<{ day: string }>();
  const router = useRouter();
  const { program, sessions, saveSession } = useTrainingStore();
  const day = program.workoutDays.find((item) => item.id === params.day);
  const [reviewMode, setReviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startedAt] = useState(() => new Date().toISOString());
  const [sessionMeta, setSessionMeta] = useState({
    bodyWeightKg: "" as number | "",
    energyLevel: "" as number | "",
    appetiteLevel: "" as number | "",
    nauseaLevel: "" as number | "",
    sleepHours: "" as number | "",
    generalFeeling: "" as number | "",
    generalNotes: ""
  });
  const [cardio, setCardio] = useState<CardioLog>(defaultCardio);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => (day ? buildSessionExercises(day) : []));

  const previous = useMemo(
    () => (day ? previousSameDaySession(sessions, day.id) : undefined),
    [day, sessions]
  );

  if (!day) {
    return (
      <AppShell>
        <EmptyState title="Entrenamiento no encontrado" body="Ese dia no existe en la rutina actual." />
      </AppShell>
    );
  }

  const updateSet = (exerciseIndex: number, setIndex: number, patch: Partial<SetLog>) => {
    setExerciseLogs((current) =>
      current.map((exercise, index) =>
        index !== exerciseIndex
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set, innerIndex) => (innerIndex === setIndex ? { ...set, ...patch } : set))
            }
      )
    );
  };

  const updateExercise = (exerciseIndex: number, patch: Partial<ExerciseLog>) => {
    setExerciseLogs((current) =>
      current.map((exercise, index) => (index === exerciseIndex ? { ...exercise, ...patch } : exercise))
    );
  };

  const buildSession = (): WorkoutSession => {
    const completedAt = new Date().toISOString();
    return {
      id: newId(),
      workoutDayId: day.id,
      dayName: day.sessionName,
      date: completedAt.slice(0, 10),
      startedAt,
      completedAt,
      durationMinutes: Math.max(1, Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 60000)),
      ...sessionMeta,
      cardio,
      exercises: exerciseLogs
    };
  };

  const currentSession = buildSession();
  const validation = validateSession(currentSession);
  const totalVolume = volumeForSession(currentSession);
  const completed = completedSets(currentSession);
  const planned = plannedSets(currentSession);

  const finish = () => {
    const candidate = buildSession();
    const problem = validateSession(candidate);
    if (problem) {
      setError(problem);
      return;
    }
    saveSession(candidate);
    router.push(`/progress?session=${candidate.id}`);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <Panel className="bg-gradient-to-br from-panel to-[#201215]">
          <p className="text-sm font-bold uppercase tracking-wide text-accentSoft">Modo entrenamiento</p>
          <h2 className="mt-2 text-3xl font-black text-white">{day.sessionName}</h2>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <StatCard label="Series" value={`${completed}/${planned}`} />
            <StatCard label="Volumen" value={Math.round(totalVolume)} detail="kg" />
            <StatCard label="Cardio" value={cardio.minutes || 0} detail="min" />
          </div>
        </Panel>

        {!reviewMode ? (
          <>
            <Panel>
              <h3 className="text-lg font-black text-white">Estado de hoy</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <NumberField
                  label="Peso corporal"
                  suffix="kg"
                  value={sessionMeta.bodyWeightKg}
                  onChange={(value) => setSessionMeta((current) => ({ ...current, bodyWeightKg: value }))}
                />
                <NumberField
                  label="Energia"
                  suffix="1-5"
                  value={sessionMeta.energyLevel}
                  min={1}
                  max={5}
                  onChange={(value) => setSessionMeta((current) => ({ ...current, energyLevel: value }))}
                />
                <NumberField
                  label="Apetito"
                  suffix="1-5"
                  value={sessionMeta.appetiteLevel}
                  min={1}
                  max={5}
                  onChange={(value) => setSessionMeta((current) => ({ ...current, appetiteLevel: value }))}
                />
                <NumberField
                  label="Nauseas"
                  suffix="0-3"
                  value={sessionMeta.nauseaLevel}
                  min={0}
                  max={3}
                  onChange={(value) => setSessionMeta((current) => ({ ...current, nauseaLevel: value }))}
                />
                <NumberField
                  label="Sueno"
                  suffix="hs"
                  value={sessionMeta.sleepHours}
                  onChange={(value) => setSessionMeta((current) => ({ ...current, sleepHours: value }))}
                />
              </div>
            </Panel>

            {exerciseLogs.map((exercise, exerciseIndex) => {
              const reference = lastSetsForExercise(sessions, exercise.exerciseId);
              return (
                <Panel key={exercise.exerciseId} className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-accentSoft">{exercise.muscleGroup}</p>
                    <h3 className="mt-1 text-2xl font-black text-white">{exercise.exerciseName}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {exercise.plannedSets} series x {exercise.targetReps} reps
                    </p>
                    {exercise.notes ? <p className="mt-3 text-sm leading-6 text-zinc-300">{exercise.notes}</p> : null}
                  </div>

                  {reference.length ? (
                    <div className="rounded-xl border border-line bg-panelSoft p-3 text-sm text-zinc-300">
                      <p className="font-bold text-white">Referencia anterior</p>
                      <p className="mt-1">
                        {reference
                          .map((set) => `S${set.setNumber}: ${set.weightKg || "-"} kg x ${set.repsCompleted || "-"} reps`)
                          .join(" | ")}
                      </p>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={set.setNumber}
                        className={`rounded-2xl border p-3 ${
                          set.completed ? "border-good bg-good/10" : "border-line bg-panelSoft"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-lg font-black text-white">Serie {set.setNumber}</p>
                          <label className="flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm font-bold">
                            <input
                              type="checkbox"
                              className="h-5 w-5 accent-accent"
                              checked={set.completed}
                              onChange={(event) => updateSet(exerciseIndex, setIndex, { completed: event.target.checked })}
                            />
                            Lista
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <NumberField
                            label="Peso"
                            suffix="kg"
                            value={set.weightKg}
                            onChange={(value) => updateSet(exerciseIndex, setIndex, { weightKg: value })}
                          />
                          <NumberField
                            label="Reps"
                            suffix={`obj ${set.targetReps}`}
                            value={set.repsCompleted}
                            onChange={(value) => updateSet(exerciseIndex, setIndex, { repsCompleted: value })}
                          />
                          <NumberField
                            label="RPE"
                            suffix="1-10"
                            value={set.rpe ?? ""}
                            min={1}
                            max={10}
                            onChange={(value) => updateSet(exerciseIndex, setIndex, { rpe: value })}
                          />
                          <NumberField
                            label="RIR"
                            suffix="0-5"
                            value={set.rir ?? ""}
                            min={0}
                            max={5}
                            onChange={(value) => updateSet(exerciseIndex, setIndex, { rir: value })}
                          />
                        </div>
                        <textarea
                          value={set.notes ?? ""}
                          onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })}
                          placeholder="Nota de la serie"
                          className="mt-3 min-h-12 w-full rounded-xl border border-line bg-ink/40 px-3 py-3 text-sm outline-none focus:border-accent"
                        />
                      </div>
                    ))}
                  </div>

                  <textarea
                    value={exercise.personalNotes ?? ""}
                    onChange={(event) => updateExercise(exerciseIndex, { personalNotes: event.target.value })}
                    placeholder="Notas personales del ejercicio"
                    className="min-h-16 w-full rounded-xl border border-line bg-ink/40 px-3 py-3 text-sm outline-none focus:border-accent"
                  />
                </Panel>
              );
            })}
          </>
        ) : (
          <ReviewPanel
            session={currentSession}
            previousText={compareWithPrevious(currentSession, previous)}
            dayType={day.type}
            cardio={cardio}
            setCardio={setCardio}
            sessionMeta={sessionMeta}
            setSessionMeta={setSessionMeta}
          />
        )}

        {error ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}

        <div className="safe-bottom fixed inset-x-0 bottom-[4.6rem] z-20 border-t border-line bg-ink/94 p-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:max-w-none">
            <Button variant="secondary" onClick={() => setReviewMode((value) => !value)}>
              {reviewMode ? "Volver" : "Resumen y cardio"}
            </Button>
            <Button disabled={Boolean(validation)} onClick={finish}>
              Finalizar y guardar
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function NumberField({
  label,
  suffix,
  value,
  min = 0,
  max,
  onChange
}: {
  label: string;
  suffix?: string;
  value: number | "";
  min?: number;
  max?: number;
  onChange: (value: number | "") => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      <div className="flex min-h-14 items-center rounded-xl border border-line bg-ink/50 focus-within:border-accent">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(numberOrEmpty(event.target.value))}
          className="w-full bg-transparent px-3 text-xl font-black outline-none"
        />
        {suffix ? <span className="pr-3 text-xs font-bold text-zinc-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

function ReviewPanel({
  session,
  previousText,
  dayType,
  cardio,
  setCardio,
  sessionMeta,
  setSessionMeta
}: {
  session: WorkoutSession;
  previousText: string;
  dayType: string;
  cardio: CardioLog;
  setCardio: (cardio: CardioLog) => void;
  sessionMeta: {
    bodyWeightKg: number | "";
    energyLevel: number | "";
    appetiteLevel: number | "";
    nauseaLevel: number | "";
    sleepHours: number | "";
    generalFeeling: number | "";
    generalNotes: string;
  };
  setSessionMeta: (value: typeof sessionMeta | ((current: typeof sessionMeta) => typeof sessionMeta)) => void;
}) {
  return (
    <div className="space-y-4">
      <Panel>
        <h3 className="text-xl font-black text-white">Cardio post-entrenamiento</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Tipo</span>
            <select
              value={cardio.type}
              onChange={(event) => setCardio({ ...cardio, type: event.target.value as CardioLog["type"] })}
              className="min-h-14 w-full rounded-xl border border-line bg-ink/50 px-3 text-lg font-bold outline-none focus:border-accent"
            >
              <option value="bicicleta">Bicicleta</option>
              <option value="caminata">Caminata</option>
              <option value="cinta">Cinta</option>
              <option value="eliptico">Eliptico</option>
              <option value="remo">Remo</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <NumberField
            label="Duracion"
            suffix="min"
            value={cardio.minutes}
            onChange={(value) => setCardio({ ...cardio, minutes: value })}
          />
          <NumberField
            label="Intensidad"
            suffix="1-10"
            min={1}
            max={10}
            value={cardio.intensity}
            onChange={(value) => setCardio({ ...cardio, intensity: value })}
          />
          <NumberField
            label="Distancia"
            suffix="km"
            value={cardio.distanceKm ?? ""}
            onChange={(value) => setCardio({ ...cardio, distanceKm: value })}
          />
          <NumberField
            label="Calorias"
            suffix="kcal"
            value={cardio.calories ?? ""}
            onChange={(value) => setCardio({ ...cardio, calories: value })}
          />
        </div>
        <textarea
          value={cardio.notes ?? ""}
          onChange={(event) => setCardio({ ...cardio, notes: event.target.value })}
          placeholder="Notas de cardio"
          className="mt-3 min-h-16 w-full rounded-xl border border-line bg-ink/40 px-3 py-3 text-sm outline-none focus:border-accent"
        />
      </Panel>

      <Panel>
        <h3 className="text-xl font-black text-white">Resumen</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Ejercicios" value={session.exercises.filter((exercise) => exercise.sets.some((set) => set.completed)).length} />
          <StatCard label="Series" value={`${completedSets(session)}/${plannedSets(session)}`} />
          <StatCard label="Volumen" value={Math.round(volumeForSession(session))} detail="kg" />
          <StatCard label="Duracion" value={session.durationMinutes} detail="min" />
        </div>
        <p className="mt-4 rounded-xl bg-panelSoft p-3 text-sm text-zinc-300">{previousText}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {session.exercises.map((exercise) => (
            <div key={exercise.exerciseId} className="rounded-xl border border-line bg-panelSoft p-3">
              <p className="font-bold text-white">{exercise.exerciseName}</p>
              <p className="mt-1 text-sm text-zinc-400">{progressionSuggestion(exercise, dayType, session)}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h3 className="text-xl font-black text-white">Sensacion general</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Sensacion"
            suffix="1-5"
            min={1}
            max={5}
            value={sessionMeta.generalFeeling}
            onChange={(value) => setSessionMeta((current) => ({ ...current, generalFeeling: value }))}
          />
          <textarea
            value={sessionMeta.generalNotes}
            onChange={(event) => setSessionMeta((current) => ({ ...current, generalNotes: event.target.value }))}
            placeholder="Notas generales"
            className="min-h-14 w-full rounded-xl border border-line bg-ink/40 px-3 py-3 text-sm outline-none focus:border-accent"
          />
        </div>
      </Panel>
    </div>
  );
}
