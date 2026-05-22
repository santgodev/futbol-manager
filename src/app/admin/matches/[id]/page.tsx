import { MatchControlRoomClient } from "@/components/admin/MatchControlRoomClient";

export default async function MatchControlRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <MatchControlRoomClient id={resolvedParams.id} />;
}

export async function generateStaticParams() {
  const { createClient: createSimpleClient } = await import("@supabase/supabase-js");
  const supabase = createSimpleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: matches } = await supabase.from("matches").select("id");
  return (matches || []).map((m) => ({ id: m.id }));
}
