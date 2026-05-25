import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: any = null;

export const createClient = () => {
  if (client) return client;
  client = createSupabaseClient<any>(
    supabaseUrl!,
    supabaseKey!,
  );
  return client;
};
