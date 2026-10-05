-- PASO 1: Limpiar los equipos actuales (y datos dependientes) para poder aplicar la regla estricta.
TRUNCATE TABLE match_events CASCADE;
TRUNCATE TABLE tournament_players CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE match_sets CASCADE;
TRUNCATE TABLE match_results CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE tournament_teams CASCADE;
TRUNCATE TABLE teams CASCADE;

-- PASO 2: Añadir la columna tournament_id a la tabla teams (requerido)
ALTER TABLE teams ADD COLUMN tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE;
