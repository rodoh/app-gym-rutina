import { initialProgram } from "@/lib/importRoutine";
import { trainingStorage } from "@/lib/storage";
import { isSupabaseConfigured, supabase, trainingOwnerId } from "@/lib/supabaseClient";
import type { Program, WorkoutSession } from "@/types/training";

type TrainingStateRow = {
  owner_id: string;
  routine: Program;
  sessions: WorkoutSession[];
};

export type TrainingRepositoryState = {
  program: Program;
  sessions: WorkoutSession[];
  source: "supabase" | "local";
};

const TABLE_NAME = "training_state";

const localState = (): TrainingRepositoryState => ({
  program: trainingStorage.getRoutine(),
  sessions: trainingStorage.getSessions(),
  source: "local"
});

const cacheLocal = (program: Program, sessions: WorkoutSession[]) => {
  trainingStorage.saveRoutine(program);
  trainingStorage.saveSessions(sessions);
};

const ensureRemoteRow = async (): Promise<TrainingStateRow> => {
  if (!supabase) {
    return {
      owner_id: trainingOwnerId,
      routine: trainingStorage.getRoutine(),
      sessions: trainingStorage.getSessions()
    };
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("owner_id,routine,sessions")
    .eq("owner_id", trainingOwnerId)
    .maybeSingle<TrainingStateRow>();

  if (error) throw error;
  if (data) return data;

  const seedRoutine = trainingStorage.getRoutine() ?? initialProgram;
  const seedSessions = trainingStorage.getSessions();
  const { data: inserted, error: insertError } = await supabase
    .from(TABLE_NAME)
    .insert({
      owner_id: trainingOwnerId,
      routine: seedRoutine,
      sessions: seedSessions
    })
    .select("owner_id,routine,sessions")
    .single<TrainingStateRow>();

  if (insertError) throw insertError;
  return inserted;
};

export const trainingRepository = {
  isRemoteEnabled: () => isSupabaseConfigured,

  load: async (): Promise<TrainingRepositoryState> => {
    if (!supabase) return localState();

    try {
      const row = await ensureRemoteRow();
      cacheLocal(row.routine, row.sessions);
      return {
        program: row.routine,
        sessions: row.sessions,
        source: "supabase"
      };
    } catch (error) {
      console.error("No se pudo cargar Supabase, usando localStorage.", error);
      return localState();
    }
  },

  saveRoutine: async (program: Program, sessions: WorkoutSession[]) => {
    cacheLocal(program, sessions);
    if (!supabase) return;

    const { error } = await supabase.from(TABLE_NAME).upsert({
      owner_id: trainingOwnerId,
      routine: program,
      sessions
    });
    if (error) throw error;
  },

  saveSessions: async (program: Program, sessions: WorkoutSession[]) => {
    cacheLocal(program, sessions);
    if (!supabase) return;

    const { error } = await supabase.from(TABLE_NAME).upsert({
      owner_id: trainingOwnerId,
      routine: program,
      sessions
    });
    if (error) throw error;
  },

  resetRoutine: async (sessions: WorkoutSession[]) => {
    cacheLocal(initialProgram, sessions);
    if (!supabase) return;

    const { error } = await supabase.from(TABLE_NAME).upsert({
      owner_id: trainingOwnerId,
      routine: initialProgram,
      sessions
    });
    if (error) throw error;
  }
};
