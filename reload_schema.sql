-- Ejecuta esto en Supabase SQL Editor para forzar a la API a reconocer la nueva columna
NOTIFY pgrst, 'reload schema';
