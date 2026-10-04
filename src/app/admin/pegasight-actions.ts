"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PlatformRole = "ADMINISTRADOR_GENERAL" | "SUPERADMINISTRADOR" | "ADMINISTRADOR_DEL_TORNEO" | "USUARIO_DE_RESULTADOS";

function isGeneralAdmin(role?: PlatformRole): boolean {
  return role === "ADMINISTRADOR_GENERAL";
}

function isSuperOrGeneralAdmin(role?: PlatformRole): boolean {
  return role === "ADMINISTRADOR_GENERAL" || role === "SUPERADMINISTRADOR";
}

export interface UserProfileWithMemberships {
  id: string;
  email: string;
  full_name: string | null;
  role: PlatformRole;
  is_active: boolean;
  memberships: {
    id: string;
    tournament_id: string;
    tournament_name: string;
    tournament_slug: string;
    role: "ADMINISTRADOR_DEL_TORNEO" | "USUARIO_DE_RESULTADOS";
    status: "ACTIVE" | "INACTIVE";
    assigned_at: string;
  }[];
}

/**
 * Retorna el perfil y membresías del usuario autenticado actual
 */
export async function getCurrentUserProfile(): Promise<UserProfileWithMemberships | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // 1. Obtener perfil
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    const isGeneralAdminEmail = user.email?.toLowerCase() === "admin@torneo.com" || user.user_metadata?.role === "ADMINISTRADOR_GENERAL";
    const defaultRole: PlatformRole = isGeneralAdminEmail ? "ADMINISTRADOR_GENERAL" : (user.user_metadata?.role || "USUARIO_DE_RESULTADOS");

    // Si no existe perfil aún pero está en auth, insertar por defecto
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || (isGeneralAdminEmail ? "Administrador General" : (user.email?.split("@")[0] || "Usuario")),
        role: defaultRole,
        is_active: true
      })
      .select()
      .single();

    if (!newProfile) return null;
    return {
      id: newProfile.id,
      email: newProfile.email,
      full_name: newProfile.full_name,
      role: newProfile.role as PlatformRole,
      is_active: newProfile.is_active,
      memberships: []
    };
  }

  // 2. Obtener membresías a torneos
  const { data: memberships } = await supabase
    .from("tournament_memberships")
    .select(`
      id,
      tournament_id,
      role,
      status,
      assigned_at,
      tournaments:tournament_id(name, slug)
    `)
    .eq("user_id", user.id);

  const formattedMemberships = (memberships || []).map((m: any) => ({
    id: m.id,
    tournament_id: m.tournament_id,
    tournament_name: m.tournaments?.name || "Torneo",
    tournament_slug: m.tournaments?.slug || "",
    role: m.role as "ADMINISTRADOR_DEL_TORNEO" | "USUARIO_DE_RESULTADOS",
    status: m.status as "ACTIVE" | "INACTIVE",
    assigned_at: m.assigned_at
  }));

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role as PlatformRole,
    is_active: profile.is_active,
    memberships: formattedMemberships
  };
}

/**
 * ADMINISTRADOR GENERAL: Obtiene el listado de todos los superadministradores
 * (Exclusivo para el Administrador General)
 */
export async function getSuperadminsAction() {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "ADMINISTRADOR_GENERAL") {
    throw new Error("Acceso denegado: Solo el Administrador General puede ver la lista de Superadministradores.");
  }

  const supabase = await createClient();
  const { data: superadmins, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active, created_at, updated_at")
    .eq("role", "SUPERADMINISTRADOR")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Error consultando superadministradores: " + error.message);
  }

  return superadmins || [];
}

/**
 * ADMINISTRADOR GENERAL: Crea una nueva cuenta con rol de Superadministrador
 * (Exclusivo para el Administrador General)
 */
export async function createSuperadminAction(data: {
  email: string;
  password: string;
  full_name: string;
}) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "ADMINISTRADOR_GENERAL") {
    throw new Error("Acceso denegado: Solo el Administrador General puede registrar Superadministradores.");
  }

  if (!data.email || !data.password || !data.full_name) {
    throw new Error("Todos los campos (correo, contraseña y nombre) son obligatorios.");
  }

  const supabase = await createClient();
  const { data: result, error } = await (supabase.rpc as any)("create_platform_user", {
    p_email: data.email.trim(),
    p_password: data.password,
    p_full_name: data.full_name.trim(),
    p_role: "SUPERADMINISTRADOR"
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/superadmins");
  return { success: true, user: result };
}

/**
 * ADMINISTRADOR GENERAL / SUPERADMINISTRADOR: Activa o desactiva la cuenta de un usuario
 */
export async function toggleUserStatusAction(userId: string, currentActiveStatus: boolean) {
  const profile = await getCurrentUserProfile();
  if (!profile || !isSuperOrGeneralAdmin(profile.role)) {
    throw new Error("Acceso denegado: Se requiere rol administrativo.");
  }

  const supabase = await createClient();

  // Verificar si el usuario objetivo es Superadministrador o Admin General
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetUser && (targetUser.role === "SUPERADMINISTRADOR" || targetUser.role === "ADMINISTRADOR_GENERAL")) {
    if (profile.role !== "ADMINISTRADOR_GENERAL") {
      throw new Error("Solo el Administrador General puede modificar el estado de un Superadministrador.");
    }
  }

  if (userId === profile.id && currentActiveStatus) {
    throw new Error("No puedes desactivar tu propia cuenta.");
  }

  const newStatus = !currentActiveStatus;
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: newStatus, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  // Registrar auditoría
  await supabase.from("admin_audit_logs").insert({
    action: newStatus ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    performed_by: profile.id,
    target_user_id: userId,
    details: { previous_status: currentActiveStatus, new_status: newStatus }
  });

  revalidatePath("/admin/superadmins");
  revalidatePath("/admin/tournament-admins");
  return { success: true, newStatus };
}

/**
 * ADMINISTRADOR DE TORNEO / SUPERADMIN: Obtiene miembros asignados a un torneo
 */
export async function getTournamentMembersAction(tournamentId: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const isSuperadmin = isSuperOrGeneralAdmin(profile.role);
  const isAssignedAdmin = profile.memberships.some(
    (m) => m.tournament_id === tournamentId && m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
  );

  if (!isSuperadmin && !isAssignedAdmin) {
    throw new Error("No tienes permisos de administración en este torneo.");
  }

  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("tournament_memberships")
    .select(`
      id,
      tournament_id,
      role,
      status,
      assigned_at,
      user:user_id(id, email, full_name, is_active, role)
    `)
    .eq("tournament_id", tournamentId)
    .order("assigned_at", { ascending: false });

  if (error) throw new Error(error.message);
  return members || [];
}

/**
 * SUPERADMIN / ADMIN: Invita o crea un usuario de resultados para un torneo
 */
export async function inviteResultUserAction(data: {
  tournamentId: string;
  email: string;
  password: string;
  full_name: string;
}) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const isSuperadmin = isSuperOrGeneralAdmin(profile.role);
  const isAssignedAdmin = profile.memberships.some(
    (m) => m.tournament_id === data.tournamentId && m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
  );

  if (!isSuperadmin && !isAssignedAdmin) {
    throw new Error("No tienes permisos para asignar usuarios de resultados en este torneo.");
  }

  const supabase = await createClient();
  const { data: result, error } = await (supabase.rpc as any)("create_platform_user", {
    p_email: data.email.trim(),
    p_password: data.password,
    p_full_name: data.full_name.trim(),
    p_role: "USUARIO_DE_RESULTADOS",
    p_tournament_id: data.tournamentId
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/result-users");
  revalidatePath(`/admin/tournaments/${data.tournamentId}`);
  return { success: true, user: result };
}

/**
 * SUPERADMIN / ADMIN GENERAL: Asigna un administrador existente o nuevo a un torneo
 */
export async function assignTournamentAdminAction(data: {
  tournamentId: string;
  email: string;
  password?: string;
  full_name?: string;
}) {
  const profile = await getCurrentUserProfile();
  if (!profile || !isSuperOrGeneralAdmin(profile.role)) {
    throw new Error("Solo un Superadministrador o Administrador General puede asignar administradores a torneos.");
  }

  const supabase = await createClient();

  // 1. Buscar si ya existe el usuario
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("email", data.email.trim().toLowerCase())
    .maybeSingle();

  let targetUserId = existingProfile?.id;

  if (!existingProfile) {
    if (!data.password || !data.full_name) {
      throw new Error("El usuario no existe. Proporciona una contraseña y nombre para crearlo.");
    }
    const { data: newUser, error: createErr } = await (supabase.rpc as any)("create_platform_user", {
      p_email: data.email.trim(),
      p_password: data.password,
      p_full_name: data.full_name.trim(),
      p_role: "ADMINISTRADOR_DEL_TORNEO",
      p_tournament_id: data.tournamentId
    });
    if (createErr) throw new Error(createErr.message);
    if (newUser?.id) {
      await supabase.from("profiles").update({ created_by: profile.id }).eq("id", newUser.id);
    }
    revalidatePath("/admin/tournament-admins");
    revalidatePath("/admin/tournaments");
    return { success: true, user: newUser };
  } else {
    // Si el usuario ya existe, actualizar su rol a ADMINISTRADOR_DEL_TORNEO si no era Superadmin o General Admin
    if (existingProfile.role !== "SUPERADMINISTRADOR" && existingProfile.role !== "ADMINISTRADOR_GENERAL") {
      await supabase
        .from("profiles")
        .update({ role: "ADMINISTRADOR_DEL_TORNEO" })
        .eq("id", targetUserId);
    }

    // Vincular al torneo
    const { error: memberError } = await supabase
      .from("tournament_memberships")
      .upsert({
        user_id: targetUserId,
        tournament_id: data.tournamentId,
        role: "ADMINISTRADOR_DEL_TORNEO",
        status: "ACTIVE",
        assigned_by: profile.id
      }, { onConflict: "user_id,tournament_id" });

    if (memberError) throw new Error(memberError.message);
  }

  revalidatePath("/admin/tournament-admins");
  revalidatePath("/admin/tournaments");
  return { success: true };
}

/**
 * ADMIN: Cambia el estado de una membresía (ACTIVE / INACTIVE)
 */
export async function toggleMembershipStatusAction(membershipId: string, currentStatus: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const supabase = await createClient();

  // Validar permisos sobre el torneo de la membresía
  const { data: membership } = await supabase
    .from("tournament_memberships")
    .select("tournament_id, role")
    .eq("id", membershipId)
    .single();

  if (!membership) throw new Error("Membresía no encontrada");

  const isSuperadmin = isSuperOrGeneralAdmin(profile.role);
  const isAssignedAdmin = profile.memberships.some(
    (m) => m.tournament_id === membership.tournament_id && m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
  );

  if (!isSuperadmin && !isAssignedAdmin) {
    throw new Error("No tienes autorización para modificar miembros en este torneo.");
  }

  const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const { error } = await supabase
    .from("tournament_memberships")
    .update({ status: nextStatus })
    .eq("id", membershipId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tournament-admins");
  revalidatePath("/admin/result-users");
  return { success: true, status: nextStatus };
}

/**
 * ADMIN DE TORNEO / SUPERADMIN / ADMIN GENERAL: Obtiene la bandeja de resultados pendientes
 */
export async function getPendingResultsAction(filterTournamentId?: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const supabase = await createClient();
  const isSuperadmin = isSuperOrGeneralAdmin(profile.role);

  let allowedTournamentIds: string[] = [];
  if (profile.role === "ADMINISTRADOR_GENERAL") {
    if (filterTournamentId) {
      allowedTournamentIds = [filterTournamentId];
    }
  } else if (profile.role === "SUPERADMINISTRADOR") {
    if (filterTournamentId) {
      allowedTournamentIds = [filterTournamentId];
    }
  } else {
    const adminMemberships = profile.memberships.filter(
      (m) => m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
    );
    allowedTournamentIds = adminMemberships.map((m) => m.tournament_id);
    if (filterTournamentId) {
      if (!allowedTournamentIds.includes(filterTournamentId)) {
        throw new Error("Aislamiento de torneo: No tienes acceso administrativo a este torneo.");
      }
      allowedTournamentIds = [filterTournamentId];
    }
  }

  if (profile.role !== "ADMINISTRADOR_GENERAL" && profile.role !== "SUPERADMINISTRADOR" && allowedTournamentIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("match_results")
    .select(`
      id,
      match_id,
      tournament_id,
      home_score,
      away_score,
      home_penalty_score,
      away_penalty_score,
      sets_data,
      details,
      status,
      created_at,
      updated_at,
      rejection_reason,
      submitted_by_profile:submitted_by(id, full_name, email),
      tournament:tournament_id(id, name, slug),
      match:match_id(
        id,
        match_date,
        match_time,
        stage,
        cup_name,
        venue,
        home_team:home_team_id(id, name, logo_url),
        away_team:away_team_id(id, name, logo_url)
      )
    `)
    .eq("status", "PENDING_REVIEW")
    .order("updated_at", { ascending: false });

  if (allowedTournamentIds.length > 0) {
    query = query.in("tournament_id", allowedTournamentIds);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data || [];
}

/**
 * ADMIN: Aprueba un resultado pendiente
 */
export async function approveMatchResultAction(resultId: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const supabase = await createClient();
  const { data, error } = await (supabase.rpc as any)("approve_match_result", {
    p_result_id: resultId
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/pending-results");
  revalidatePath("/admin/tournaments");
  return { success: true, data };
}

/**
 * ADMIN: Rechaza un resultado pendiente con motivo obligatorio
 */
export async function rejectMatchResultAction(resultId: string, reason: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  if (!reason || reason.trim().length === 0) {
    throw new Error("Debes indicar el motivo del rechazo para que el usuario pueda corregirlo.");
  }

  const supabase = await createClient();
  const { data, error } = await (supabase.rpc as any)("reject_match_result", {
    p_result_id: resultId,
    p_reason: reason.trim()
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/pending-results");
  return { success: true, data };
}

/**
 * USUARIO DE RESULTADOS: Registra o corrige un marcador
 */
export async function submitMatchResultAction(data: {
  matchId: string;
  homeScore: number;
  awayScore: number;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  setsData?: any;
  details?: string;
}) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const supabase = await createClient();
  const { data: result, error } = await (supabase.rpc as any)("submit_match_result", {
    p_match_id: data.matchId,
    p_home_score: data.homeScore,
    p_away_score: data.awayScore,
    p_home_penalties: data.homePenalties ?? null,
    p_away_penalties: data.awayPenalties ?? null,
    p_sets_data: data.setsData ? JSON.stringify(data.setsData) : null,
    p_details: data.details || null
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/submit-result");
  revalidatePath("/admin/my-matches");
  revalidatePath("/admin/pending-results");
  return { success: true, result };
}

/**
 * USUARIO DE RESULTADOS: Consulta partidos asignados a sus torneos
 */
export async function getMyAssignedMatchesAction() {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const supabase = await createClient();
  const isSuperadmin = isSuperOrGeneralAdmin(profile.role);

  let tournamentIds: string[] = [];
  if (isSuperadmin) {
    const { data: allTourneys } = await supabase.from("tournaments").select("id");
    tournamentIds = (allTourneys || []).map((t: any) => t.id);
  } else {
    tournamentIds = profile.memberships
      .filter((m) => m.status === "ACTIVE")
      .map((m) => m.tournament_id);
  }

  if (tournamentIds.length === 0) {
    return [];
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      id,
      tournament_id,
      match_date,
      match_time,
      stage,
      status,
      cup_name,
      venue,
      home_score,
      away_score,
      tournament:tournament_id(id, name, slug),
      home_team:home_team_id(id, name, logo_url),
      away_team:away_team_id(id, name, logo_url),
      match_results(
        id,
        home_score,
        away_score,
        home_penalty_score,
        away_penalty_score,
        details,
        status,
        rejection_reason,
        created_at,
        updated_at
      )
    `)
    .in("tournament_id", tournamentIds)
    .order("match_date", { ascending: false })
    .order("match_time", { ascending: false });

  if (error) throw new Error(error.message);

  return matches || [];
}

/**
 * AUDITORÍA: Obtiene el historial de un resultado o torneo
 */
export async function getResultHistoryAction(matchId?: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const supabase = await createClient();
  let query = supabase
    .from("result_history")
    .select(`
      id,
      action,
      previous_status,
      new_status,
      previous_data,
      new_data,
      reason,
      created_at,
      performed_by_profile:performed_by(id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (matchId) {
    query = query.eq("match_id", matchId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * AUDITORÍA: Obtiene el registro de auditoría global de administradores
 */
export async function getAuditLogsAction(limit = 100) {
  const profile = await getCurrentUserProfile();
  if (!profile || !isSuperOrGeneralAdmin(profile.role)) {
    throw new Error("Acceso restringido a Superadministradores y Administrador General");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select(`
      id,
      action,
      tournament_id,
      target_user_id,
      details,
      created_at,
      actor_profile:performed_by(id, full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * SUPERADMIN / ADMIN GENERAL: Obtiene la lista de todos los Administradores de Torneo
 */
export async function getTournamentAdminsAction() {
  const profile = await getCurrentUserProfile();
  if (!profile || !isSuperOrGeneralAdmin(profile.role)) {
    throw new Error("Acceso denegado: Se requiere rol de Superadministrador o Administrador General.");
  }

  const supabase = await createClient();
  const { data: admins, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      role,
      is_active,
      created_by,
      created_at,
      updated_at,
      tournament_memberships:tournament_memberships!tournament_memberships_user_id_fkey(
        id,
        tournament_id,
        role,
        status,
        assigned_at,
        tournaments:tournament_id(id, name, slug)
      )
    `)
    .eq("role", "ADMINISTRADOR_DEL_TORNEO")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error consultando administradores de torneo: " + error.message);
  }

  if (profile.role === "SUPERADMINISTRADOR") {
    return (admins || [])
      .filter((adm: any) => {
        return adm.created_by === profile.id;
      })
      .map((adm: any) => ({
        id: adm.id,
        email: adm.email,
        full_name: adm.full_name,
        role: adm.role,
        is_active: adm.is_active,
        created_by: adm.created_by,
        created_at: adm.created_at,
        updated_at: adm.updated_at,
        memberships: (adm.tournament_memberships || []).map((m: any) => ({
          membershipId: m.id,
          tournamentId: m.tournament_id,
          tournamentName: m.tournaments?.name || "Torneo",
          tournamentSlug: m.tournaments?.slug || "",
          status: m.status,
          assignedAt: m.assigned_at
        }))
      }));
  }

  return (admins || []).map((adm: any) => ({
    id: adm.id,
    email: adm.email,
    full_name: adm.full_name,
    role: adm.role,
    is_active: adm.is_active,
    created_at: adm.created_at,
    updated_at: adm.updated_at,
    memberships: (adm.tournament_memberships || []).map((m: any) => ({
      membershipId: m.id,
      tournamentId: m.tournament_id,
      tournamentName: m.tournaments?.name || "Torneo",
      tournamentSlug: m.tournaments?.slug || "",
      status: m.status,
      assignedAt: m.assigned_at
    }))
  }));
}

/**
 * SUPERADMIN / ADMIN GENERAL: Crea un nuevo Administrador de Torneo y le asigna credenciales
 */
export async function createTournamentAdminAction(data: {
  email: string;
  password: string;
  full_name: string;
  tournamentId?: string;
}) {
  const profile = await getCurrentUserProfile();
  if (!profile || !isSuperOrGeneralAdmin(profile.role)) {
    throw new Error("Acceso denegado: Solo los Superadministradores y Administrador General pueden registrar Administradores de Torneo.");
  }

  if (!data.email || !data.password || !data.full_name) {
    throw new Error("Todos los campos (correo, contraseña y nombre) son obligatorios.");
  }

  const supabase = await createClient();
  const { data: result, error } = await (supabase.rpc as any)("create_platform_user", {
    p_email: data.email.trim(),
    p_password: data.password,
    p_full_name: data.full_name.trim(),
    p_role: "ADMINISTRADOR_DEL_TORNEO",
    p_tournament_id: data.tournamentId || null
  });

  if (error) {
    throw new Error(error.message);
  }

  if (result?.id) {
    await supabase.from("profiles").update({ created_by: profile.id }).eq("id", result.id);
  }

  revalidatePath("/admin/tournament-admins");
  return { success: true, user: result };
}

/**
 * SUPERADMIN / ADMIN GENERAL: Desvincula a un administrador de un torneo específico
 */
export async function unassignTournamentAdminAction(membershipId: string) {
  const profile = await getCurrentUserProfile();
  if (!profile || !isSuperOrGeneralAdmin(profile.role)) {
    throw new Error("Acceso denegado: Se requiere rol administrativo.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tournament_memberships")
    .delete()
    .eq("id", membershipId);

  if (error) {
    throw new Error("Error desvinculando del torneo: " + error.message);
  }

  revalidatePath("/admin/tournament-admins");
  revalidatePath("/admin/tournaments");
  return { success: true };
}

/**
 * ADMIN DE TORNEO / SUPERADMIN / ADMIN GENERAL: Obtiene los usuarios de resultados bajo su ámbito
 */
export async function getResultUsersAction() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    throw new Error("No autorizado");
  }

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      role,
      is_active,
      created_by,
      created_at,
      updated_at,
      tournament_memberships:tournament_memberships!tournament_memberships_user_id_fkey(
        id,
        tournament_id,
        role,
        status,
        assigned_at,
        tournaments:tournament_id(id, name, slug)
      )
    `)
    .eq("role", "USUARIO_DE_RESULTADOS")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error consultando usuarios de resultados: " + error.message);
  }

  // 1. Admin General: acceso total
  if (profile.role === "ADMINISTRADOR_GENERAL") {
    return (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      is_active: u.is_active,
      created_by: u.created_by,
      created_at: u.created_at,
      updated_at: u.updated_at,
      memberships: (u.tournament_memberships || []).map((m: any) => ({
        membershipId: m.id,
        tournamentId: m.tournament_id,
        tournamentName: m.tournaments?.name || "Torneo",
        tournamentSlug: m.tournaments?.slug || "",
        status: m.status,
        assignedAt: m.assigned_at
      }))
    }));
  }

  // 2. Superadministrador: ve los creados por él o por sus administradores delegados
  if (profile.role === "SUPERADMINISTRADOR") {
    const { data: myAdmins } = await supabase
      .from("profiles")
      .select("id")
      .eq("created_by", profile.id)
      .eq("role", "ADMINISTRADOR_DEL_TORNEO");

    const allowedCreatorIds = new Set([profile.id, ...(myAdmins || []).map((a: any) => a.id)]);

    return (users || [])
      .filter((u: any) => {
        return allowedCreatorIds.has(u.created_by);
      })
      .map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_active: u.is_active,
        created_by: u.created_by,
        created_at: u.created_at,
        updated_at: u.updated_at,
        memberships: (u.tournament_memberships || []).map((m: any) => ({
          membershipId: m.id,
          tournamentId: m.tournament_id,
          tournamentName: m.tournaments?.name || "Torneo",
          tournamentSlug: m.tournaments?.slug || "",
          status: m.status,
          assignedAt: m.assigned_at
        }))
      }));
  }

  // 3. Administrador del Torneo: ve los creados por él o asignados a sus torneos autorizados
  if (profile.role === "ADMINISTRADOR_DEL_TORNEO") {
    const assignedTourneyIds = new Set(
      profile.memberships
        .filter((m) => m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE")
        .map((m) => m.tournament_id)
    );

    return (users || [])
      .filter((u: any) => {
        const isCreatedByMe = u.created_by === profile.id;
        const hasMembershipInMyTourneys = (u.tournament_memberships || []).some(
          (m: any) => assignedTourneyIds.has(m.tournament_id)
        );
        return isCreatedByMe || hasMembershipInMyTourneys;
      })
      .map((u: any) => {
        const filteredMemberships = (u.tournament_memberships || []).filter((m: any) => assignedTourneyIds.has(m.tournament_id));
        return {
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          is_active: u.is_active,
          created_by: u.created_by,
          created_at: u.created_at,
          updated_at: u.updated_at,
          memberships: filteredMemberships.map((m: any) => ({
            membershipId: m.id,
            tournamentId: m.tournament_id,
            tournamentName: m.tournaments?.name || "Torneo",
            tournamentSlug: m.tournaments?.slug || "",
            status: m.status,
            assignedAt: m.assigned_at
          }))
        };
      });
  }

  return [];
}

/**
 * ADMIN DE TORNEO / SUPERADMIN / ADMIN GENERAL: Crea un nuevo Usuario de Resultados
 */
export async function createResultUserAction(data: {
  email: string;
  password: string;
  full_name: string;
  tournamentId?: string;
}) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  if (!data.email || !data.password || !data.full_name) {
    throw new Error("Todos los campos (correo, contraseña y nombre) son obligatorios.");
  }

  if (data.tournamentId) {
    const isSuperadmin = isSuperOrGeneralAdmin(profile.role);
    const isAssignedAdmin = profile.memberships.some(
      (m) => m.tournament_id === data.tournamentId && m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
    );
    if (!isSuperadmin && !isAssignedAdmin) {
      throw new Error("No tienes autorización en este torneo.");
    }
  }

  const supabase = await createClient();
  const { data: result, error } = await (supabase.rpc as any)("create_platform_user", {
    p_email: data.email.trim(),
    p_password: data.password,
    p_full_name: data.full_name.trim(),
    p_role: "USUARIO_DE_RESULTADOS",
    p_tournament_id: data.tournamentId || null
  });

  if (error) throw new Error(error.message);

  if (result?.id) {
    await supabase.from("profiles").update({ created_by: profile.id }).eq("id", result.id);
  }

  revalidatePath("/admin/result-users");
  revalidatePath("/admin/tournaments");
  return { success: true, user: result };
}

/**
 * ADMIN DE TORNEO / SUPERADMIN / ADMIN GENERAL: Asigna o vincula un Usuario de Resultados a un torneo
 */
export async function assignResultUserAction(data: {
  tournamentId: string;
  email: string;
  password?: string;
  full_name?: string;
}) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const isSuperadmin = isSuperOrGeneralAdmin(profile.role);
  const isAssignedAdmin = profile.memberships.some(
    (m) => m.tournament_id === data.tournamentId && m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
  );

  if (!isSuperadmin && !isAssignedAdmin) {
    throw new Error("No tienes autorización para asignar anotadores en este torneo.");
  }

  const supabase = await createClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("email", data.email.trim().toLowerCase())
    .maybeSingle();

  let targetUserId = existingProfile?.id;

  if (!existingProfile) {
    if (!data.password || !data.full_name) {
      throw new Error("El usuario no existe. Proporciona una contraseña y nombre para crearlo.");
    }
    const { data: newUser, error: createErr } = await (supabase.rpc as any)("create_platform_user", {
      p_email: data.email.trim(),
      p_password: data.password,
      p_full_name: data.full_name.trim(),
      p_role: "USUARIO_DE_RESULTADOS",
      p_tournament_id: data.tournamentId
    });
    if (createErr) throw new Error(createErr.message);
    if (newUser?.id) {
      await supabase.from("profiles").update({ created_by: profile.id }).eq("id", newUser.id);
    }
    revalidatePath("/admin/result-users");
    revalidatePath("/admin/tournaments");
    return { success: true, user: newUser };
  } else {
    // Si ya existe, vincular al torneo
    const { error: memberError } = await supabase
      .from("tournament_memberships")
      .upsert({
        user_id: targetUserId,
        tournament_id: data.tournamentId,
        role: "USUARIO_DE_RESULTADOS",
        status: "ACTIVE",
        assigned_by: profile.id
      }, { onConflict: "user_id,tournament_id" });

    if (memberError) throw new Error(memberError.message);
  }

  revalidatePath("/admin/result-users");
  revalidatePath("/admin/tournaments");
  return { success: true };
}

/**
 * ADMIN DE TORNEO / SUPERADMIN / ADMIN GENERAL: Desvincula a un usuario de resultados de un torneo
 */
export async function unassignResultUserAction(membershipId: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autorizado");

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("tournament_memberships")
    .select("tournament_id, role")
    .eq("id", membershipId)
    .single();

  if (!membership) throw new Error("Membresía no encontrada");

  const isSuperadmin = isSuperOrGeneralAdmin(profile.role);
  const isAssignedAdmin = profile.memberships.some(
    (m) => m.tournament_id === membership.tournament_id && m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE"
  );

  if (!isSuperadmin && !isAssignedAdmin) {
    throw new Error("No tienes autorización para desvincular anotadores en este torneo.");
  }

  const { error } = await supabase
    .from("tournament_memberships")
    .delete()
    .eq("id", membershipId);

  if (error) throw new Error("Error desvinculando del torneo: " + error.message);

  revalidatePath("/admin/result-users");
  revalidatePath("/admin/tournaments");
  return { success: true };
}

/**
 * ADMINISTRADOR GENERAL: Asigna o reasigna un torneo a un Superadministrador
 */
export async function assignTournamentSuperadminAction(tournamentId: string, superadminId: string | null) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "ADMINISTRADOR_GENERAL") {
    throw new Error("Acceso denegado: Solo el Administrador General puede adscribir torneos a Superadministradores.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ superadmin_id: superadminId })
    .eq("id", tournamentId);

  if (error) {
    throw new Error("Error asignando superadministrador: " + error.message);
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Retorna el árbol jerárquico adaptado al rol actual para no saturar la vista:
 * - Admin General: Superadmins -> Torneos adscritos -> Admins y Anotadores
 * - Superadmin: Torneos adscritos -> Admins y Anotadores
 * - Admin Torneo: Torneos asignados -> Anotadores y Marcadores Pendientes
 * - Usuario Resultados: Torneos asignados -> Partidos para captura
 */
export async function getRoleHierarchyDataAction(): Promise<any> {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autenticado");

  const supabase = await createClient();

  if (profile.role === "ADMINISTRADOR_GENERAL") {
    // 1. Obtener todos los superadministradores
    const { data: superadmins } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active, created_at")
      .eq("role", "SUPERADMINISTRADOR")
      .order("created_at", { ascending: true });

    // 2. Obtener todos los torneos con conteos
    const { data: tournaments } = await supabase
      .from("tournaments")
      .select("id, name, slug, sport, status, location, superadmin_id, created_by, tournament_teams(count), matches(count)")
      .order("name", { ascending: true });

    // 3. Obtener todas las membresías con sus perfiles
    const { data: memberships } = await supabase
      .from("tournament_memberships")
      .select(`
        id,
        tournament_id,
        role,
        status,
        assigned_at,
        user:user_id(id, email, full_name, is_active, role)
      `);

    const tourneysBySuperadmin: Record<string, any[]> = {};
    const unassignedTournaments: any[] = [];

    (tournaments || []).forEach((t: any) => {
      const tMembers = (memberships || []).filter((m: any) => m.tournament_id === t.id);
      const tournamentAdmins = tMembers
        .filter((m: any) => m.role === "ADMINISTRADOR_DEL_TORNEO")
        .map((m: any) => ({
          membershipId: m.id,
          userId: (m.user as any)?.id,
          email: (m.user as any)?.email,
          fullName: (m.user as any)?.full_name,
          isActive: (m.user as any)?.is_active,
          status: m.status,
          assignedAt: m.assigned_at
        }));

      const resultUsers = tMembers
        .filter((m: any) => m.role === "USUARIO_DE_RESULTADOS")
        .map((m: any) => ({
          membershipId: m.id,
          userId: (m.user as any)?.id,
          email: (m.user as any)?.email,
          fullName: (m.user as any)?.full_name,
          isActive: (m.user as any)?.is_active,
          status: m.status,
          assignedAt: m.assigned_at
        }));

      const tournamentItem = {
        id: t.id,
        name: t.name,
        slug: t.slug,
        sport: t.sport,
        status: t.status,
        location: t.location,
        superadminId: t.superadmin_id,
        teamsCount: t.tournament_teams?.[0]?.count || 0,
        matchesCount: t.matches?.[0]?.count || 0,
        tournamentAdmins,
        resultUsers
      };

      if (t.superadmin_id) {
        if (!tourneysBySuperadmin[t.superadmin_id]) {
          tourneysBySuperadmin[t.superadmin_id] = [];
        }
        tourneysBySuperadmin[t.superadmin_id].push(tournamentItem);
      } else {
        unassignedTournaments.push(tournamentItem);
      }
    });

    const superadminNodes = (superadmins || []).map((sa: any) => ({
      id: sa.id,
      email: sa.email,
      fullName: sa.full_name,
      isActive: sa.is_active,
      createdAt: sa.created_at,
      tournaments: tourneysBySuperadmin[sa.id] || []
    }));

    return {
      role: "ADMINISTRADOR_GENERAL",
      superadmins: superadminNodes,
      unassignedTournaments,
      allTournaments: (tournaments || []).map((t: any) => ({ id: t.id, name: t.name, superadminId: t.superadmin_id }))
    };
  }

  if (profile.role === "SUPERADMINISTRADOR") {
    const { data: tournaments } = await supabase
      .from("tournaments")
      .select("id, name, slug, sport, status, location, superadmin_id, created_by, tournament_teams(count), matches(count)")
      .or(`superadmin_id.eq.${profile.id},created_by.eq.${profile.id}`)
      .order("name", { ascending: true });

    const tournamentList = tournaments || [];
    const tournamentIds = tournamentList.map((t: any) => t.id);

    let memberships: any[] = [];
    if (tournamentIds.length > 0) {
      const { data: mData } = await supabase
        .from("tournament_memberships")
        .select(`
          id,
          tournament_id,
          role,
          status,
          assigned_at,
          user:user_id(id, email, full_name, is_active, role)
        `)
        .in("tournament_id", tournamentIds);
      memberships = mData || [];
    }

    const formattedTournaments = (tournaments || []).map((t: any) => {
      const tMembers = (memberships || []).filter((m: any) => m.tournament_id === t.id);
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        sport: t.sport,
        status: t.status,
        location: t.location,
        teamsCount: t.tournament_teams?.[0]?.count || 0,
        matchesCount: t.matches?.[0]?.count || 0,
        tournamentAdmins: tMembers.filter((m: any) => m.role === "ADMINISTRADOR_DEL_TORNEO").map((m: any) => ({
          membershipId: m.id,
          userId: (m.user as any)?.id,
          email: (m.user as any)?.email,
          fullName: (m.user as any)?.full_name,
          isActive: (m.user as any)?.is_active,
          status: m.status,
          assignedAt: m.assigned_at
        })),
        resultUsers: tMembers.filter((m: any) => m.role === "USUARIO_DE_RESULTADOS").map((m: any) => ({
          membershipId: m.id,
          userId: (m.user as any)?.id,
          email: (m.user as any)?.email,
          fullName: (m.user as any)?.full_name,
          isActive: (m.user as any)?.is_active,
          status: m.status,
          assignedAt: m.assigned_at
        }))
      };
    });

    return {
      role: "SUPERADMINISTRADOR",
      tournaments: formattedTournaments
    };
  }

  if (profile.role === "ADMINISTRADOR_DEL_TORNEO") {
    const assignedIds = profile.memberships
      .filter((m) => m.role === "ADMINISTRADOR_DEL_TORNEO" && m.status === "ACTIVE")
      .map((m) => m.tournament_id);

    const { data: tournaments } = await supabase
      .from("tournaments")
      .select("id, name, slug, sport, status, location, tournament_teams(count), matches(count)")
      .in("id", assignedIds)
      .order("name", { ascending: true });

    const { data: memberships } = await supabase
      .from("tournament_memberships")
      .select(`
        id,
        tournament_id,
        role,
        status,
        assigned_at,
        user:user_id(id, email, full_name, is_active, role)
      `)
      .in("tournament_id", assignedIds)
      .eq("role", "USUARIO_DE_RESULTADOS");

    const { data: pendingResults } = await supabase
      .from("match_results")
      .select(`
        id,
        match_id,
        tournament_id,
        home_score,
        away_score,
        status,
        created_at,
        match:match_id(id, match_date, match_time, home_team:home_team_id(name), away_team:away_team_id(name))
      `)
      .in("tournament_id", assignedIds)
      .eq("status", "PENDING_REVIEW");

    const formattedTournaments = (tournaments || []).map((t: any) => {
      const resultUsers = (memberships || [])
        .filter((m: any) => m.tournament_id === t.id)
        .map((m: any) => ({
          membershipId: m.id,
          userId: (m.user as any)?.id,
          email: (m.user as any)?.email,
          fullName: (m.user as any)?.full_name,
          isActive: (m.user as any)?.is_active,
          status: m.status,
          assignedAt: m.assigned_at
        }));

      const tPending = (pendingResults || []).filter((r: any) => r.tournament_id === t.id);

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        sport: t.sport,
        status: t.status,
        location: t.location,
        teamsCount: t.tournament_teams?.[0]?.count || 0,
        matchesCount: t.matches?.[0]?.count || 0,
        resultUsers,
        pendingResults: tPending
      };
    });

    return {
      role: "ADMINISTRADOR_DEL_TORNEO",
      tournaments: formattedTournaments
    };
  }

  // USUARIO_DE_RESULTADOS
  const userTourneyIds = profile.memberships.map((m) => m.tournament_id);
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      tournament_id,
      match_date,
      match_time,
      status,
      home_team:home_team_id(name),
      away_team:away_team_id(name),
      tournament:tournament_id(id, name, sport),
      match_results(id, status, home_score, away_score, rejection_reason)
    `)
    .in("tournament_id", userTourneyIds)
    .order("match_date", { ascending: true });

  const byTournament: Record<string, { tournament: any; matches: any[] }> = {};
  (matches || []).forEach((m: any) => {
    const tId = m.tournament_id;
    if (!byTournament[tId]) {
      byTournament[tId] = {
        tournament: m.tournament,
        matches: []
      };
    }
    byTournament[tId].matches.push(m);
  });

  return {
    role: "USUARIO_DE_RESULTADOS",
    tournamentsWithMatches: Object.values(byTournament)
  };
}


