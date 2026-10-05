-- =========================================================================================
-- Script para arreglar la lógica de Anotadores huérfanos (Usuarios de Resultados sin torneo)
-- Ejecutar en Supabase -> SQL Editor
-- =========================================================================================

-- 1. Insertar una membresía de torneo para los Anotadores huérfanos
-- Se toma el 'created_by' (el admin que los creó) y se les vincula al mismo torneo que administra ese admin.
INSERT INTO tournament_memberships (user_id, tournament_id, role, status, assigned_by)
SELECT 
    p.id AS user_id,
    m.tournament_id,
    'USUARIO_DE_RESULTADOS' AS role,
    'ACTIVE' AS status,
    p.created_by AS assigned_by
FROM profiles p
JOIN tournament_memberships m ON m.user_id = p.created_by AND m.role = 'ADMINISTRADOR_DEL_TORNEO'
WHERE p.role = 'USUARIO_DE_RESULTADOS'
  AND NOT EXISTS (
      SELECT 1 FROM tournament_memberships tm WHERE tm.user_id = p.id
  )
ON CONFLICT (user_id, tournament_id) DO NOTHING;

-- 2. Asegurarse de que el procedimiento almacenado (RPC) de creación de usuarios también ponga el tournament_id
-- Esto es opcional ya que el código de la plataforma (pegasight-actions.ts) ahora lo fuerza de forma explícita.
