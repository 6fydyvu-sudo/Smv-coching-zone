import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/locale";
import { PublicResultSearch } from "@/components/site/PublicResultSearch";

export const metadata: Metadata = { title: "Results" };

// Public result search is OFF by default because it exposes exam scores
// by Student ID. Admin can turn it on from Website Settings once policy
// and privacy considerations are confirmed. Students always see their own
// results after logging into the Student Dashboard regardless of this
// setting.
export default async function PublicResultsPage() {
  const { dict } = getServerDictionary();
  return (
    <div className="container-page max-w-xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.results}</h1>
      <p className="mt-2 text-slate-500">
        Enter a Student ID to look up published results, if public result search has been enabled by
        the institute.
      </p>
      <div className="mt-8">
        <PublicResultSearch />
      </div>
    </div>
  );
}
