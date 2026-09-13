import { TournamentClientWrapper } from "./TournamentClientWrapper";
import { createClient as createSimpleClient } from "@supabase/supabase-js";

export default async function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return <TournamentClientWrapper slug={id} />;
}

export async function generateStaticParams() {
  const supabase = createSimpleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );
  const { data: tournaments } = await supabase.from("tournaments").select("slug");
  return (tournaments || []).map((t) => ({ id: t.slug }));
}
