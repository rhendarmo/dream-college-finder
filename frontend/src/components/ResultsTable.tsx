import Link from "next/link";
import type { RecommendationResultItem } from "@/types/api";

type Props = {
  items: RecommendationResultItem[];
  profileId?: number | null;
};

function pct(x: number) {
  return `${Math.round(x * 100)}%`;
}

function barWidth(x: number) {
  return `${Math.max(6, Math.round(x * 100))}%`;
}

function categoryColor(category: string) {
  if (category === "Reach") return "text-rose-500";
  if (category === "Target") return "text-amber-500";
  return "text-emerald-600";
}

export default function ResultsTable({ items }: Props) {
  if (!items.length) return null;

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/95 shadow-[0_16px_50px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="text-2xl font-bold text-slate-900">Recommendations</div>
      </div>

      <div className="overflow-x-auto px-3 pb-3 pt-1 md:px-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-base text-slate-500">
              <th className="px-4 py-4 font-semibold">School</th>
              <th className="px-4 py-4 font-semibold">Category</th>
              <th className="px-4 py-4 font-semibold">Probability</th>
              <th className="px-4 py-4 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.school_id} className="border-t border-slate-100">
                <td className="px-4 py-4">
                  <Link href={`/schools/${r.school_id}`} className="font-semibold text-slate-800 hover:text-blue-700">
                    {r.school_name}
                  </Link>
                </td>
                <td className={`px-4 py-4 text-lg font-bold ${categoryColor(r.category)}`}>
                  {r.category}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <span className="min-w-[60px] text-2xl font-bold text-slate-800">
                      {pct(r.probability)}
                    </span>
                    <div className="h-3 w-32 rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-700"
                        style={{ width: barWidth(r.probability) }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <div className="max-w-[420px] truncate" title={r.reason}>
                    {r.reason}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}