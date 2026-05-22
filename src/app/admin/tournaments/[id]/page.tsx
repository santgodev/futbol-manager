import { TournamentDetailsClient } from "@/components/admin/TournamentDetailsClient";

export default async function AdminTournamentDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TournamentDetailsClient id={resolvedParams.id} />;
}

export async function generateStaticParams() {
  const { createClient: createSimpleClient } = await import("@supabase/supabase-js");
  const supabase = createSimpleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: tournaments } = await supabase.from("tournaments").select("id");
  return (tournaments || []).map((t) => ({ id: t.id }));
}
