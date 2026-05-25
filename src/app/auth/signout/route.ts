import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  
  // Parse the origin from the request URL, but if it's 0.0.0.0 (a Next.js bug with -H 0.0.0.0), 
  // try to get the host header to redirect to the correct IP.
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const baseUrl = host && !host.includes("0.0.0.0") ? `${protocol}://${host}` : request.url;
  
  return NextResponse.redirect(new URL("/", baseUrl), {
    status: 302,
  });
}
