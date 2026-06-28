"use client";

import { useCallback, useEffect, useState } from "react";
import { initialProgram } from "@/lib/importRoutine";
import { trainingRepository } from "@/lib/trainingRepository";
import type { Program, WorkoutSession } from "@/types/training";

export const useTrainingStore = () => {
  const [program, setProgram] = useState<Program>(initialProgram);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncSource, setSyncSource] = useState<"supabase" | "local">(
    trainingRepository.isRemoteEnabled() ? "supabase" : "local"
  );
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const state = await trainingRepository.load();
        if (!active) return;
        setProgram(state.program);
        setSessions(state.sessions);
        setSyncSource(state.source);
        setSyncError(null);
      } catch (error) {
        if (!active) return;
        setSyncError(error instanceof Error ? error.message : "No se pudo sincronizar.");
      } finally {
        if (active) setLoaded(true);
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const saveProgram = useCallback((next: Program) => {
    setProgram(next);
    void trainingRepository.saveRoutine(next, sessions).catch((error) => {
      setSyncError(error instanceof Error ? error.message : "No se pudo guardar la rutina.");
    });
  }, [sessions]);

  const resetProgram = useCallback(() => {
    setProgram(initialProgram);
    void trainingRepository.resetRoutine(sessions).catch((error) => {
      setSyncError(error instanceof Error ? error.message : "No se pudo restaurar la rutina.");
    });
  }, [sessions]);

  const saveSession = useCallback((session: WorkoutSession) => {
    setSessions((current) => {
      const next = [session, ...current.filter((item) => item.id !== session.id)];
      void trainingRepository.saveSessions(program, next).catch((error) => {
        setSyncError(error instanceof Error ? error.message : "No se pudo guardar la sesion.");
      });
      return next;
    });
  }, [program]);

  return {
    loaded,
    program,
    sessions,
    syncSource,
    syncError,
    saveProgram,
    resetProgram,
    saveSession
  };
};
