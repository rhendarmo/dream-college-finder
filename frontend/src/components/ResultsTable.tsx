import type { RecommendationResultItem } from "@/types/api";

type Props = {
  items: RecommendationResultItem[];
};

function pct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export default function ResultsTable({ items }: Props) {
  if (!items.length) return null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border p-4">
      <div className="mb-3 text-xl font-semibold">Recommendations</div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4">School</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Probability</th>
            <th className="py-2 pr-4">Reason</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.school_id} className="border-b last:border-b-0">
              <td className="py-2 pr-4 font-medium">{r.school_name}</td>
              <td className="py-2 pr-4">{r.category}</td>
              <td className="py-2 pr-4">{pct(r.probability)}</td>
              <td className="py-2 pr-4 text-slate-700">{r.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}