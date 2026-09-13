import { TeamDetailsClient } from "@/components/admin/TeamDetailsClient";
import { createClient as createSimpleClient } from "@supabase/supabase-js";

export default async function AdminTeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TeamDetailsClient id={resolvedParams.id} />;
}

export async function generateStaticParams() {
  const supabase = createSimpleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
  );
  const { data: teams } = await supabase.from("teams").select("id");
  return (teams || []).map((t) => ({ id: t.id }));
}
