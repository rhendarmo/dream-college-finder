"use client";

import type { RecommendationResultItem } from "@/types/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Props = {
  items: RecommendationResultItem[];
};

export default function ProbabilityChart({ items }: Props) {
  if (!items.length) return null;

  const data = items.slice(0, 5).map((r) => ({
    name: r.school_name.length > 14 ? r.school_name.slice(0, 14) + "…" : r.school_name,
    probability: Math.round(r.probability * 100),
  }));

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="mb-4 text-2xl font-bold text-slate-900">Probability by School</div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 14, fill: "#475569" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 14, fill: "#475569" }} />
            <Tooltip />
            <Bar dataKey="probability" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}