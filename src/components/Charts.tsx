"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function LoadChart({ data }: { data: Array<{ date: string; weightKg: number; volumeKg?: number }> }) {
  if (!data.length) {
    return <p className="rounded-xl bg-panelSoft p-4 text-sm text-zinc-400">Todavia no hay datos para graficar.</p>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#28313f" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
          <YAxis stroke="#a1a1aa" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#11151d", border: "1px solid #28313f", borderRadius: 12 }}
            labelStyle={{ color: "#f7f8fa" }}
          />
          <Line type="monotone" dataKey="weightKg" stroke="#e14444" strokeWidth={3} dot={{ r: 4 }} name="kg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
