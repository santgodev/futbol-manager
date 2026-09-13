ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS volleyball_best_of_sets integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS volleyball_set_points integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS volleyball_tiebreak_points integer NOT NULL DEFAULT 15;

CREATE TABLE IF NOT EXISTS tournament_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  surface text,
  court_type text,
  notes text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, name)
);

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS cup_name varchar(100),
  ADD COLUMN IF NOT EXISTS venue varchar(120),
  ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES tournament_venues(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tournament_venues_tournament
  ON tournament_venues(tournament_id, is_active, display_order, name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_venue_slot
  ON matches(tournament_id, venue_id, match_date, match_time)
  WHERE venue_id IS NOT NULL
    AND match_date IS NOT NULL
    AND match_time IS NOT NULL
    AND COALESCE(status, 'SCHEDULED') <> 'CANCELLED';

ALTER TABLE tournament_venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tournament_venues_select_public" ON tournament_venues;
CREATE POLICY "tournament_venues_select_public"
  ON tournament_venues FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "tournament_venues_insert_authenticated" ON tournament_venues;
CREATE POLICY "tournament_venues_insert_authenticated"
  ON tournament_venues FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "tournament_venues_update_authenticated" ON tournament_venues;
CREATE POLICY "tournament_venues_update_authenticated"
  ON tournament_venues FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "tournament_venues_delete_authenticated" ON tournament_venues;
CREATE POLICY "tournament_venues_delete_authenticated"
  ON tournament_venues FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE TABLE IF NOT EXISTS match_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  set_number integer NOT NULL CHECK (set_number BETWEEN 1 AND 7),
  home_points integer NOT NULL DEFAULT 0 CHECK (home_points >= 0),
  away_points integer NOT NULL DEFAULT 0 CHECK (away_points >= 0),
  status text NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'FINISHED')),
  winner_team_id uuid REFERENCES teams(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, set_number)
);

ALTER TABLE match_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_sets_select_public" ON match_sets;
CREATE POLICY "match_sets_select_public"
  ON match_sets FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "match_sets_insert_authenticated" ON match_sets;
CREATE POLICY "match_sets_insert_authenticated"
  ON match_sets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "match_sets_update_authenticated" ON match_sets;
CREATE POLICY "match_sets_update_authenticated"
  ON match_sets FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "match_sets_delete_authenticated" ON match_sets;
CREATE POLICY "match_sets_delete_authenticated"
  ON match_sets FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

GRANT SELECT ON tournament_venues TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON tournament_venues TO authenticated;
GRANT SELECT ON match_sets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON match_sets TO authenticated;
GRANT SELECT, UPDATE ON matches TO authenticated;

CREATE OR REPLACE VIEW tournament_standings_view
WITH (security_invoker = true) AS
WITH volleyball_matches AS (
  SELECT
    m.id,
    m.tournament_id,
    m.home_team_id,
    m.away_team_id,
    COALESCE(COUNT(ms.*) FILTER (WHERE ms.winner_team_id = m.home_team_id), 0)::int AS home_sets,
    COALESCE(COUNT(ms.*) FILTER (WHERE ms.winner_team_id = m.away_team_id), 0)::int AS away_sets,
    COALESCE(SUM(ms.home_points), 0)::int AS home_points_for,
    COALESCE(SUM(ms.away_points), 0)::int AS away_points_for
  FROM matches m
  JOIN tournaments t ON t.id = m.tournament_id
  LEFT JOIN match_sets ms ON ms.match_id = m.id
  WHERE t.sport::text IN ('VOLLEYBALL', 'BEACH_VOLLEYBALL')
    AND m.status = 'FINISHED'
  GROUP BY m.id, m.tournament_id, m.home_team_id, m.away_team_id
),
volleyball_rows AS (
  SELECT
    vm.tournament_id,
    vm.home_team_id AS team_id,
    1 AS played,
    CASE WHEN vm.home_sets > vm.away_sets THEN 1 ELSE 0 END AS won,
    0 AS drawn,
    CASE WHEN vm.home_sets < vm.away_sets THEN 1 ELSE 0 END AS lost,
    CASE WHEN vm.home_sets > vm.away_sets THEN 3 ELSE 0 END AS points,
    vm.home_sets AS sets_for,
    vm.away_sets AS sets_against,
    vm.home_points_for AS points_for,
    vm.away_points_for AS points_against
  FROM volleyball_matches vm
  UNION ALL
  SELECT
    vm.tournament_id,
    vm.away_team_id AS team_id,
    1 AS played,
    CASE WHEN vm.away_sets > vm.home_sets THEN 1 ELSE 0 END AS won,
    0 AS drawn,
    CASE WHEN vm.away_sets < vm.home_sets THEN 1 ELSE 0 END AS lost,
    CASE WHEN vm.away_sets > vm.home_sets THEN 3 ELSE 0 END AS points,
    vm.away_sets AS sets_for,
    vm.home_sets AS sets_against,
    vm.away_points_for AS points_for,
    vm.home_points_for AS points_against
  FROM volleyball_matches vm
),
football_rows AS (
  SELECT
    m.tournament_id,
    m.home_team_id AS team_id,
    1 AS played,
    CASE WHEN COALESCE(m.home_score, 0) > COALESCE(m.away_score, 0) THEN 1 ELSE 0 END AS won,
    CASE WHEN COALESCE(m.home_score, 0) = COALESCE(m.away_score, 0) THEN 1 ELSE 0 END AS drawn,
    CASE WHEN COALESCE(m.home_score, 0) < COALESCE(m.away_score, 0) THEN 1 ELSE 0 END AS lost,
    CASE
      WHEN COALESCE(m.home_score, 0) > COALESCE(m.away_score, 0) THEN 3
      WHEN COALESCE(m.home_score, 0) = COALESCE(m.away_score, 0) THEN 1
      ELSE 0
    END AS points,
    COALESCE(m.home_score, 0)::int AS goals_for,
    COALESCE(m.away_score, 0)::int AS goals_against
  FROM matches m
  JOIN tournaments t ON t.id = m.tournament_id
  WHERE t.sport::text NOT IN ('VOLLEYBALL', 'BEACH_VOLLEYBALL')
    AND m.status = 'FINISHED'
  UNION ALL
  SELECT
    m.tournament_id,
    m.away_team_id AS team_id,
    1 AS played,
    CASE WHEN COALESCE(m.away_score, 0) > COALESCE(m.home_score, 0) THEN 1 ELSE 0 END AS won,
    CASE WHEN COALESCE(m.away_score, 0) = COALESCE(m.home_score, 0) THEN 1 ELSE 0 END AS drawn,
    CASE WHEN COALESCE(m.away_score, 0) < COALESCE(m.home_score, 0) THEN 1 ELSE 0 END AS lost,
    CASE
      WHEN COALESCE(m.away_score, 0) > COALESCE(m.home_score, 0) THEN 3
      WHEN COALESCE(m.away_score, 0) = COALESCE(m.home_score, 0) THEN 1
      ELSE 0
    END AS points,
    COALESCE(m.away_score, 0)::int AS goals_for,
    COALESCE(m.home_score, 0)::int AS goals_against
  FROM matches m
  JOIN tournaments t ON t.id = m.tournament_id
  WHERE t.sport::text NOT IN ('VOLLEYBALL', 'BEACH_VOLLEYBALL')
    AND m.status = 'FINISHED'
),
combined_rows AS (
  SELECT
    tournament_id,
    team_id,
    played,
    won,
    drawn,
    lost,
    points,
    sets_for AS goals_for,
    sets_against AS goals_against,
    points_for,
    points_against
  FROM volleyball_rows
  UNION ALL
  SELECT
    tournament_id,
    team_id,
    played,
    won,
    drawn,
    lost,
    points,
    goals_for,
    goals_against,
    goals_for AS points_for,
    goals_against AS points_against
  FROM football_rows
)
SELECT
  tt.tournament_id,
  tt.team_id,
  teams.name AS team_name,
  teams.logo_url,
  teams.primary_color,
  tt.group_name,
  COALESCE(SUM(cr.played), 0)::int AS played,
  COALESCE(SUM(cr.won), 0)::int AS won,
  COALESCE(SUM(cr.drawn), 0)::int AS drawn,
  COALESCE(SUM(cr.lost), 0)::int AS lost,
  COALESCE(SUM(cr.goals_for), 0)::int AS goals_for,
  COALESCE(SUM(cr.goals_against), 0)::int AS goals_against,
  (COALESCE(SUM(cr.goals_for), 0) - COALESCE(SUM(cr.goals_against), 0))::int AS goal_difference,
  COALESCE(SUM(cr.points), 0)::int AS points,
  COALESCE(SUM(cr.points_for), 0)::int AS volleyball_points_for,
  COALESCE(SUM(cr.points_against), 0)::int AS volleyball_points_against
FROM tournament_teams tt
JOIN teams ON teams.id = tt.team_id
LEFT JOIN combined_rows cr ON cr.tournament_id = tt.tournament_id AND cr.team_id = tt.team_id
GROUP BY tt.tournament_id, tt.team_id, teams.name, teams.logo_url, teams.primary_color, tt.group_name;
