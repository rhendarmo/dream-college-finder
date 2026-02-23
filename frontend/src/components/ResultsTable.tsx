import Link from "next/link";
import type { RecommendationResultItem } from "@/types/api";

type Props = {
  items: RecommendationResultItem[];
  profileId: number | null;
};

function pct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export default function ResultsTable({ items, profileId }: Props) {
  if (!items.length) return null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border bg-white p-4">
      <div className="mb-3 text-xl font-semibold">Recommendations</div>

      {!profileId && (
        <div className="mb-3 text-sm text-slate-600">
          Tip: submit the profile to enable “School detail” links.
        </div>
      )}

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
          {items.map((r) => {
            const href = profileId
              ? `/schools/${r.school_id}?profileId=${profileId}`
              : `/schools/${r.school_id}`;

            return (
              <tr key={r.school_id} className="border-b last:border-b-0 hover:bg-slate-50">
                <td className="py-2 pr-4 font-medium">
                  <Link className="underline underline-offset-2" href={href}>
                    {r.school_name}
                  </Link>
                </td>
                <td className="py-2 pr-4">{r.category}</td>
                <td className="py-2 pr-4">{pct(r.probability)}</td>
                <td className="py-2 pr-4 text-slate-700">{r.reason}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}