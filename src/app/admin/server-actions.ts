"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function forceChangeUserPasswordAction(targetUserId: string, newPassword: string) {
  const supabase = await createClient();
  
  // Verify the current user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("No estás autenticado.");
  }

  // Verify the current user is a superadmin or general admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "SUPERADMINISTRADOR" && profile.role !== "ADMINISTRADOR_GENERAL")) {
    throw new Error("Acceso denegado. Se requiere rol de Superadministrador o Administrador General.");
  }

  // Verify the service role key is present
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta la variable SUPABASE_SERVICE_ROLE_KEY en el servidor.");
  }

  // Create admin client
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Update target user's password
  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (error) throw new Error(error.message);

  return { success: true };
}
