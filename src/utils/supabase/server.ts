import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Synchronous signature that accepts a pre-resolved cookie store (as requested in user prompt)
export function createClient(cookieStore: Awaited<ReturnType<typeof cookies>>): ReturnType<typeof createServerClient<any>>;

// Asynchronous signature with no parameters (for backwards compatibility with existing project pages)
export function createClient(): Promise<ReturnType<typeof createServerClient<any>>>;

export function createClient(cookieStore?: Awaited<ReturnType<typeof cookies>>) {
  if (cookieStore) {
    return createServerClient<any>(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  }

  // Fallback for async invocation without passing cookies directly
  return (async () => {
    const resolvedCookieStore = await cookies();
    return createServerClient<any>(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return resolvedCookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                resolvedCookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  })();
}
