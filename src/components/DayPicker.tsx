"use client";

import type { WorkoutDay } from "@/types/training";

export function DayPicker({
  days,
  selectedId,
  onSelect
}: {
  days: WorkoutDay[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => (
        <button
          key={day.id}
          onClick={() => onSelect(day.id)}
          className={`min-h-12 shrink-0 rounded-full px-4 text-sm font-black capitalize ${
            selectedId === day.id ? "bg-accent text-white" : "border border-line bg-panelSoft text-zinc-300"
          }`}
        >
          {day.dayOfWeek}
        </button>
      ))}
    </div>
  );
}
