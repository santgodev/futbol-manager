ALTER VIEW IF EXISTS public.tournament_standings_view
  SET (security_invoker = true);

ALTER VIEW IF EXISTS public.tournament_top_scorers_view
  SET (security_invoker = true);

DO $$
DECLARE
  target_function record;
BEGIN
  FOR target_function IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS identity_arguments
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'log_match_score_changes',
        'calculate_standings',
        'handle_match_progression'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
      target_function.schema_name,
      target_function.function_name,
      target_function.identity_arguments
    );
  END LOOP;
END $$;
