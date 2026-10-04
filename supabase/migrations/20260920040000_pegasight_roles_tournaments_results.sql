-- ==============================================================================
-- PEGASIGHT: Roles, Tournament Memberships, Match Results Workflow & Audit Logs
-- ==============================================================================

-- 1. Create PROFILES table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'USUARIO_DE_RESULTADOS' 
    CHECK (role IN ('SUPERADMINISTRADOR', 'ADMINISTRADOR_DEL_TORNEO', 'USUARIO_DE_RESULTADOS')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure admin@torneo.com is registered as active SUPERADMINISTRADOR
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Super Administrador', 'SUPERADMINISTRADOR', true
FROM auth.users
WHERE email = 'admin@torneo.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'SUPERADMINISTRADOR',
  is_active = true,
  updated_at = now();

-- 2. Create TOURNAMENT_MEMBERSHIPS table (multi-admin and multi-result-user per tournament)
CREATE TABLE IF NOT EXISTS public.tournament_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('ADMINISTRADOR_DEL_TORNEO', 'USUARIO_DE_RESULTADOS')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id),
  CONSTRAINT unique_user_tournament UNIQUE (user_id, tournament_id)
);

CREATE INDEX IF NOT EXISTS idx_tournament_memberships_user ON public.tournament_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_memberships_tournament ON public.tournament_memberships(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_memberships_role ON public.tournament_memberships(role, status);

-- 3. Create MATCH_RESULTS table (flujo de resultados)
CREATE TABLE IF NOT EXISTS public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES public.profiles(id),
  home_score integer NOT NULL DEFAULT 0,
  away_score integer NOT NULL DEFAULT 0,
  home_penalty_score integer,
  away_penalty_score integer,
  sets_data jsonb,
  details text,
  status text NOT NULL DEFAULT 'PENDING_REVIEW' 
    CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_match_result UNIQUE (match_id)
);

CREATE INDEX IF NOT EXISTS idx_match_results_tournament ON public.match_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_results_status ON public.match_results(status);
CREATE INDEX IF NOT EXISTS idx_match_results_match ON public.match_results(match_id);

-- 4. Create RESULT_HISTORY table (auditoría de resultados)
CREATE TABLE IF NOT EXISTS public.result_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid NOT NULL REFERENCES public.match_results(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('SUBMITTED', 'CORRECTED', 'APPROVED', 'REJECTED')),
  performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  previous_status text,
  new_status text,
  previous_data jsonb,
  new_data jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_result_history_result ON public.result_history(result_id);
CREATE INDEX IF NOT EXISTS idx_result_history_match ON public.result_history(match_id);

-- 5. Create ADMIN_AUDIT_LOGS table (auditoría administrativa)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE SET NULL,
  action text NOT NULL,
  performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_tourney ON public.admin_audit_logs(tournament_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);

-- ==============================================================================
-- 6. Helper Security Functions (SECURITY DEFINER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_superadmin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'SUPERADMINISTRADOR' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tournament_admin(user_id uuid, tourney_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF public.is_superadmin($1) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.tournament_memberships tm
    JOIN public.profiles p ON p.id = tm.user_id
    WHERE tm.user_id = $1
      AND tm.tournament_id = $2
      AND tm.role = 'ADMINISTRADOR_DEL_TORNEO'
      AND tm.status = 'ACTIVE'
      AND p.is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_tournament_result_user(user_id uuid, tourney_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  IF public.is_tournament_admin($1, $2) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.tournament_memberships tm
    JOIN public.profiles p ON p.id = tm.user_id
    WHERE tm.user_id = $1
      AND tm.tournament_id = $2
      AND tm.role = 'USUARIO_DE_RESULTADOS'
      AND tm.status = 'ACTIVE'
      AND p.is_active = true
  );
END;
$$;

-- Protect against deactivating the last active superadmin or self-deactivation
CREATE OR REPLACE FUNCTION public.prevent_last_superadmin_deactivation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_superadmins_count integer;
BEGIN
  IF (OLD.role = 'SUPERADMINISTRADOR') AND (NEW.is_active = false OR NEW.role != 'SUPERADMINISTRADOR') THEN
    SELECT count(*) INTO active_superadmins_count
    FROM public.profiles
    WHERE role = 'SUPERADMINISTRADOR' AND is_active = true AND id != OLD.id;
    
    IF active_superadmins_count = 0 THEN
      RAISE EXCEPTION 'No se puede desactivar ni modificar el rol del único Superadministrador activo del sistema.';
    END IF;
  END IF;

  IF (auth.uid() = OLD.id) AND (OLD.role = 'SUPERADMINISTRADOR') AND (NEW.is_active = false) THEN
    RAISE EXCEPTION 'No puedes desactivar tu propia cuenta de Superadministrador.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_last_superadmin_deactivation ON public.profiles;
CREATE TRIGGER trg_prevent_last_superadmin_deactivation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_superadmin_deactivation();

CREATE OR REPLACE FUNCTION public.prevent_last_superadmin_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_superadmins_count integer;
BEGIN
  IF OLD.role = 'SUPERADMINISTRADOR' THEN
    SELECT count(*) INTO active_superadmins_count
    FROM public.profiles
    WHERE role = 'SUPERADMINISTRADOR' AND is_active = true AND id != OLD.id;
    
    IF active_superadmins_count = 0 THEN
      RAISE EXCEPTION 'No se puede eliminar el único Superadministrador activo del sistema.';
    END IF;
  END IF;

  IF auth.uid() = OLD.id AND OLD.role = 'SUPERADMINISTRADOR' THEN
    RAISE EXCEPTION 'No puedes auto-eliminar tu propia cuenta de Superadministrador.';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_last_superadmin_deletion ON public.profiles;
CREATE TRIGGER trg_prevent_last_superadmin_deletion
BEFORE DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_superadmin_deletion();

-- ==============================================================================
-- 7. Platform User Creation Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_platform_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text,
  p_tournament_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  caller_id uuid;
  new_user_id uuid;
  is_caller_superadmin boolean;
  is_caller_admin boolean;
BEGIN
  caller_id := auth.uid();
  
  -- Check caller authorization
  is_caller_superadmin := public.is_superadmin(caller_id);
  
  IF p_role = 'SUPERADMINISTRADOR' THEN
    IF NOT is_caller_superadmin THEN
      RAISE EXCEPTION 'Solo un Superadministrador puede crear otro Superadministrador.';
    END IF;
  ELSIF p_role = 'ADMINISTRADOR_DEL_TORNEO' THEN
    IF NOT is_caller_superadmin THEN
      RAISE EXCEPTION 'Solo un Superadministrador puede asignar el rol de Administrador de Torneo.';
    END IF;
  ELSIF p_role = 'USUARIO_DE_RESULTADOS' THEN
    IF p_tournament_id IS NULL THEN
      RAISE EXCEPTION 'Se debe especificar un torneo para el Usuario de Resultados.';
    END IF;
    is_caller_admin := public.is_tournament_admin(caller_id, p_tournament_id);
    IF NOT is_caller_admin THEN
      RAISE EXCEPTION 'No tienes permisos administrativos en este torneo para invitar usuarios de resultados.';
    END IF;
  ELSE
    RAISE EXCEPTION 'Rol no válido: %', p_role;
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(p_email)) THEN
    RAISE EXCEPTION 'El correo electrónico ya está registrado.';
  END IF;

  -- Generate user ID
  new_user_id := gen_random_uuid();

  -- Insert into auth.users with encrypted password & required GoTrue string fields (omitting confirmed_at which is ALWAYS GENERATED)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    email_change,
    phone_change,
    reauthentication_token,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    lower(p_email),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    now(),
    now()
  );

  -- Insert into auth.identities (email is ALWAYS GENERATED)
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    new_user_id::text,
    new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', lower(p_email), 'email_verified', true, 'phone_verified', false),
    'email',
    now(),
    now(),
    now()
  );

  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    is_active
  ) VALUES (
    new_user_id,
    lower(p_email),
    p_full_name,
    p_role,
    true
  );

  -- If tournament_id provided, create tournament membership
  IF p_tournament_id IS NOT NULL AND p_role IN ('ADMINISTRADOR_DEL_TORNEO', 'USUARIO_DE_RESULTADOS') THEN
    INSERT INTO public.tournament_memberships (
      user_id,
      tournament_id,
      role,
      status,
      assigned_by
    ) VALUES (
      new_user_id,
      p_tournament_id,
      p_role,
      'ACTIVE',
      caller_id
    );
  END IF;

  -- Audit log
  INSERT INTO public.admin_audit_logs (
    tournament_id,
    action,
    performed_by,
    target_user_id,
    details
  ) VALUES (
    p_tournament_id,
    'CREATE_USER_' || p_role,
    caller_id,
    new_user_id,
    jsonb_build_object('email', lower(p_email), 'full_name', p_full_name, 'role', p_role)
  );

  RETURN jsonb_build_object(
    'id', new_user_id,
    'email', lower(p_email),
    'full_name', p_full_name,
    'role', p_role
  );
END;
$$;

-- ==============================================================================
-- 8. Result Workflow Functions (Submit, Approve, Reject)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_match_result(
  p_match_id uuid,
  p_home_score integer,
  p_away_score integer,
  p_home_penalties integer DEFAULT NULL,
  p_away_penalties integer DEFAULT NULL,
  p_sets_data jsonb DEFAULT NULL,
  p_details text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  v_tournament_id uuid;
  v_result_id uuid;
  v_existing_status text;
  v_previous_data jsonb;
  v_new_data jsonb;
  v_action text;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  -- Get tournament_id for this match
  SELECT tournament_id INTO v_tournament_id
  FROM public.matches
  WHERE id = p_match_id;

  IF v_tournament_id IS NULL THEN
    RAISE EXCEPTION 'Partido no encontrado.';
  END IF;

  -- Verify authorization
  IF NOT public.is_tournament_result_user(caller_id, v_tournament_id) THEN
    RAISE EXCEPTION 'No tienes permiso para registrar resultados en este torneo.';
  END IF;

  v_new_data := jsonb_build_object(
    'home_score', p_home_score,
    'away_score', p_away_score,
    'home_penalties', p_home_penalties,
    'away_penalties', p_away_penalties,
    'sets_data', p_sets_data,
    'details', p_details
  );

  -- Check if result already exists for this match
  SELECT id, status, jsonb_build_object('home_score', home_score, 'away_score', away_score, 'status', status)
  INTO v_result_id, v_existing_status, v_previous_data
  FROM public.match_results
  WHERE match_id = p_match_id;

  IF v_result_id IS NOT NULL THEN
    IF v_existing_status = 'APPROVED' THEN
      RAISE EXCEPTION 'Este resultado ya fue aprobado. No puede ser modificado directamente.';
    END IF;

    v_action := 'CORRECTED';

    UPDATE public.match_results
    SET home_score = p_home_score,
        away_score = p_away_score,
        home_penalty_score = p_home_penalties,
        away_penalty_score = p_away_penalties,
        sets_data = p_sets_data,
        details = p_details,
        status = 'PENDING_REVIEW',
        rejection_reason = NULL,
        updated_at = now()
    WHERE id = v_result_id;
  ELSE
    v_action := 'SUBMITTED';
    v_previous_data := NULL;

    INSERT INTO public.match_results (
      match_id,
      tournament_id,
      submitted_by,
      home_score,
      away_score,
      home_penalty_score,
      away_penalty_score,
      sets_data,
      details,
      status
    ) VALUES (
      p_match_id,
      v_tournament_id,
      caller_id,
      p_home_score,
      p_away_score,
      p_home_penalties,
      p_away_penalties,
      p_sets_data,
      p_details,
      'PENDING_REVIEW'
    ) RETURNING id INTO v_result_id;
  END IF;

  -- Record history
  INSERT INTO public.result_history (
    result_id,
    match_id,
    tournament_id,
    action,
    performed_by,
    previous_status,
    new_status,
    previous_data,
    new_data
  ) VALUES (
    v_result_id,
    p_match_id,
    v_tournament_id,
    v_action,
    caller_id,
    v_existing_status,
    'PENDING_REVIEW',
    v_previous_data,
    v_new_data
  );

  RETURN jsonb_build_object(
    'id', v_result_id,
    'match_id', p_match_id,
    'status', 'PENDING_REVIEW',
    'action', v_action
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_match_result(p_result_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  v_res RECORD;
  v_winner_id uuid;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  SELECT mr.*, m.home_team_id, m.away_team_id, m.is_knockout
  INTO v_res
  FROM public.match_results mr
  JOIN public.matches m ON m.id = mr.match_id
  WHERE mr.id = p_result_id;

  IF v_res.id IS NULL THEN
    RAISE EXCEPTION 'Resultado no encontrado.';
  END IF;

  IF NOT public.is_tournament_admin(caller_id, v_res.tournament_id) THEN
    RAISE EXCEPTION 'No tienes permisos de administrador para aprobar resultados en este torneo.';
  END IF;

  -- Determine winner
  IF (COALESCE(v_res.home_score, 0) + COALESCE(v_res.home_penalty_score, 0)) > 
     (COALESCE(v_res.away_score, 0) + COALESCE(v_res.away_penalty_score, 0)) THEN
    v_winner_id := v_res.home_team_id;
  ELSIF (COALESCE(v_res.home_score, 0) + COALESCE(v_res.home_penalty_score, 0)) < 
        (COALESCE(v_res.away_score, 0) + COALESCE(v_res.away_penalty_score, 0)) THEN
    v_winner_id := v_res.away_team_id;
  ELSE
    v_winner_id := NULL;
  END IF;

  -- 1. Update match_results to APPROVED
  UPDATE public.match_results
  SET status = 'APPROVED',
      reviewed_by = caller_id,
      reviewed_at = now(),
      updated_at = now()
  WHERE id = p_result_id;

  -- 2. Publish to matches
  UPDATE public.matches
  SET home_score = v_res.home_score,
      away_score = v_res.away_score,
      home_penalty_score = v_res.home_penalty_score,
      away_penalty_score = v_res.away_penalty_score,
      winner_team_id = v_winner_id,
      status = 'FINISHED',
      updated_by = caller_id
  WHERE id = v_res.match_id;

  -- 3. Record history
  INSERT INTO public.result_history (
    result_id,
    match_id,
    tournament_id,
    action,
    performed_by,
    previous_status,
    new_status,
    previous_data,
    new_data
  ) VALUES (
    p_result_id,
    v_res.match_id,
    v_res.tournament_id,
    'APPROVED',
    caller_id,
    v_res.status,
    'APPROVED',
    jsonb_build_object('status', v_res.status),
    jsonb_build_object('status', 'APPROVED', 'approved_by', caller_id, 'approved_at', now())
  );

  RETURN jsonb_build_object('success', true, 'status', 'APPROVED');
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_match_result(p_result_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  v_res RECORD;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'El motivo del rechazo es obligatorio.';
  END IF;

  SELECT * INTO v_res
  FROM public.match_results
  WHERE id = p_result_id;

  IF v_res.id IS NULL THEN
    RAISE EXCEPTION 'Resultado no encontrado.';
  END IF;

  IF NOT public.is_tournament_admin(caller_id, v_res.tournament_id) THEN
    RAISE EXCEPTION 'No tienes permisos de administrador para rechazar resultados en este torneo.';
  END IF;

  UPDATE public.match_results
  SET status = 'REJECTED',
      reviewed_by = caller_id,
      reviewed_at = now(),
      rejection_reason = p_reason,
      updated_at = now()
  WHERE id = p_result_id;

  -- Record history
  INSERT INTO public.result_history (
    result_id,
    match_id,
    tournament_id,
    action,
    performed_by,
    previous_status,
    new_status,
    previous_data,
    new_data,
    reason
  ) VALUES (
    p_result_id,
    v_res.match_id,
    v_res.tournament_id,
    'REJECTED',
    caller_id,
    v_res.status,
    'REJECTED',
    jsonb_build_object('status', v_res.status),
    jsonb_build_object('status', 'REJECTED', 'rejected_by', caller_id),
    p_reason
  );

  RETURN jsonb_build_object('success', true, 'status', 'REJECTED');
END;
$$;

-- ==============================================================================
-- 9. Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 9.1. Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = (SELECT auth.uid()) 
  OR public.is_superadmin((SELECT auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.tournament_memberships tm_admin
    JOIN public.tournament_memberships tm_user ON tm_user.tournament_id = tm_admin.tournament_id
    WHERE tm_admin.user_id = (SELECT auth.uid()) 
      AND tm_admin.role = 'ADMINISTRADOR_DEL_TORNEO'
      AND tm_user.user_id = public.profiles.id
  )
);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  id = (SELECT auth.uid()) OR public.is_superadmin((SELECT auth.uid()))
)
WITH CHECK (
  id = (SELECT auth.uid()) OR public.is_superadmin((SELECT auth.uid()))
);

-- 9.2. Tournament Memberships Policies
DROP POLICY IF EXISTS "memberships_select_policy" ON public.tournament_memberships;
CREATE POLICY "memberships_select_policy" ON public.tournament_memberships
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR public.is_superadmin((SELECT auth.uid()))
  OR public.is_tournament_admin((SELECT auth.uid()), tournament_id)
);

DROP POLICY IF EXISTS "memberships_insert_policy" ON public.tournament_memberships;
CREATE POLICY "memberships_insert_policy" ON public.tournament_memberships
FOR INSERT TO authenticated
WITH CHECK (
  public.is_superadmin((SELECT auth.uid()))
  OR (public.is_tournament_admin((SELECT auth.uid()), tournament_id) AND role = 'USUARIO_DE_RESULTADOS')
);

DROP POLICY IF EXISTS "memberships_update_policy" ON public.tournament_memberships;
CREATE POLICY "memberships_update_policy" ON public.tournament_memberships
FOR UPDATE TO authenticated
USING (
  public.is_superadmin((SELECT auth.uid()))
  OR (public.is_tournament_admin((SELECT auth.uid()), tournament_id) AND role = 'USUARIO_DE_RESULTADOS')
)
WITH CHECK (
  public.is_superadmin((SELECT auth.uid()))
  OR (public.is_tournament_admin((SELECT auth.uid()), tournament_id) AND role = 'USUARIO_DE_RESULTADOS')
);

DROP POLICY IF EXISTS "memberships_delete_policy" ON public.tournament_memberships;
CREATE POLICY "memberships_delete_policy" ON public.tournament_memberships
FOR DELETE TO authenticated
USING (
  public.is_superadmin((SELECT auth.uid()))
  OR (public.is_tournament_admin((SELECT auth.uid()), tournament_id) AND role = 'USUARIO_DE_RESULTADOS')
);

-- 9.3. Match Results Policies
DROP POLICY IF EXISTS "match_results_select_policy" ON public.match_results;
CREATE POLICY "match_results_select_policy" ON public.match_results
FOR SELECT TO anon, authenticated
USING (
  status = 'APPROVED'
  OR submitted_by = (SELECT auth.uid())
  OR public.is_tournament_admin((SELECT auth.uid()), tournament_id)
);

DROP POLICY IF EXISTS "match_results_insert_policy" ON public.match_results;
CREATE POLICY "match_results_insert_policy" ON public.match_results
FOR INSERT TO authenticated
WITH CHECK (
  public.is_tournament_result_user((SELECT auth.uid()), tournament_id)
);

DROP POLICY IF EXISTS "match_results_update_policy" ON public.match_results;
CREATE POLICY "match_results_update_policy" ON public.match_results
FOR UPDATE TO authenticated
USING (
  (submitted_by = (SELECT auth.uid()) AND status IN ('PENDING_REVIEW', 'REJECTED'))
  OR public.is_tournament_admin((SELECT auth.uid()), tournament_id)
)
WITH CHECK (
  (submitted_by = (SELECT auth.uid()) AND status = 'PENDING_REVIEW')
  OR public.is_tournament_admin((SELECT auth.uid()), tournament_id)
);

-- 9.4. Result History Policies
DROP POLICY IF EXISTS "result_history_select_policy" ON public.result_history;
CREATE POLICY "result_history_select_policy" ON public.result_history
FOR SELECT TO authenticated
USING (
  performed_by = (SELECT auth.uid())
  OR public.is_tournament_admin((SELECT auth.uid()), tournament_id)
);

-- 9.5. Admin Audit Logs Policies
DROP POLICY IF EXISTS "admin_audit_logs_select_policy" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_select_policy" ON public.admin_audit_logs
FOR SELECT TO authenticated
USING (
  public.is_superadmin((SELECT auth.uid()))
  OR (tournament_id IS NOT NULL AND public.is_tournament_admin((SELECT auth.uid()), tournament_id))
);

-- 9.6. Tournaments Isolation & Modification Policies
DROP POLICY IF EXISTS "tournaments_insert_policy" ON public.tournaments;
CREATE POLICY "tournaments_insert_policy" ON public.tournaments
FOR INSERT TO authenticated
WITH CHECK (
  public.is_superadmin((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "tournaments_update_policy" ON public.tournaments;
CREATE POLICY "tournaments_update_policy" ON public.tournaments
FOR UPDATE TO authenticated
USING (
  public.is_tournament_admin((SELECT auth.uid()), id)
)
WITH CHECK (
  public.is_tournament_admin((SELECT auth.uid()), id)
);

DROP POLICY IF EXISTS "tournaments_delete_policy" ON public.tournaments;
CREATE POLICY "tournaments_delete_policy" ON public.tournaments
FOR DELETE TO authenticated
USING (
  public.is_superadmin((SELECT auth.uid()))
);

-- 9.7. Grant permissions to authenticated and anon
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.tournament_memberships TO authenticated;
GRANT SELECT ON public.match_results TO anon, authenticated;
GRANT SELECT ON public.result_history TO authenticated;
GRANT SELECT ON public.admin_audit_logs TO authenticated;
