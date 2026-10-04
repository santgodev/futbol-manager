import { TournamentClientWrapper } from "./TournamentClientWrapper";
import { createClient as createSimpleClient } from "@supabase/supabase-js";

export default async function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return <TournamentClientWrapper slug={id} />;
}

export async function generateStaticParams() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return [];

    const supabase = createSimpleClient(supabaseUrl, supabaseKey);
    const { data: tournaments } = await supabase.from("tournaments").select("slug");
    return (tournaments || []).map((t) => ({ id: t.slug }));
  } catch (err) {
    console.error("Error in generateStaticParams:", err);
    return [];
  }
}
