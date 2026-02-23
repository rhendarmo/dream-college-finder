"use client";

import type { RecommendationResultItem } from "@/types/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

type Props = {
  items: RecommendationResultItem[];
};

export default function ProbabilityChart({ items }: Props) {
  if (!items.length) return null;

  const data = items.map((r) => ({
    name: r.school_name.length > 18 ? r.school_name.slice(0, 18) + "…" : r.school_name,
    probability: Math.round(r.probability * 100),
  }));

  return (
    <div className="w-full rounded-xl border p-4">
      <div className="mb-3 text-xl font-semibold">Probability by School</div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="probability" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}