-- ========================================================
-- LEGADO DOCENTE — ELIMINACIÓN DE USUARIOS DE AUTH.USERS
-- RPC con SECURITY DEFINER para que los superusuarios puedan
-- eliminar cuentas completamente de la pestaña Users de Supabase.
-- ========================================================

-- 1. FUNCIÓN: delete_user_by_admin
-- Permite a un superusuario autenticado eliminar un usuario de:
-- - Tablas de la plataforma (matrículas, progreso, certificados, perfil)
-- - auth.users (la tabla oficial de autenticación de Supabase)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_role text;
  v_target_email text;
  v_caller_id uuid;
BEGIN
  v_caller_id := auth.uid();

  -- 1. Verificar si el usuario que llama es administrador
  SELECT role::text INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;

  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acceso denegado: solo los superusuarios (admin) pueden eliminar cuentas del sistema.';
  END IF;

  -- 2. Prevenir auto-eliminación accidental del superadministrador en sesión
  IF v_caller_id = target_user_id THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta de superusuario en sesión activa.';
  END IF;

  -- 3. Obtener el correo del usuario antes de borrarlo
  SELECT email INTO v_target_email FROM auth.users WHERE id = target_user_id;

  -- 4. Limpieza ordenada de tablas relacionadas para evitar fallos por Foreign Keys
  DELETE FROM public.enrollments WHERE user_id = target_user_id;
  DELETE FROM public.lesson_progress WHERE user_id = target_user_id;
  DELETE FROM public.certificates WHERE user_id = target_user_id;

  -- Tablas de caracterización y diagnóstico si existen
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'candidate_profiles') THEN
    DELETE FROM public.candidate_profiles WHERE id = target_user_id;
  END IF;

  -- Tablas de MaTech si existen
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matech_teacher_permissions') THEN
    DELETE FROM public.matech_teacher_permissions WHERE teacher_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matech_conversations') THEN
    DELETE FROM public.matech_conversations WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matech_usage_logs') THEN
    DELETE FROM public.matech_usage_logs WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matech_documents') THEN
    UPDATE public.matech_documents SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
  END IF;

  -- 5. Eliminar perfil de la aplicación
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 6. Eliminar directamente de auth.users (Autenticación de Supabase)
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_user_id', target_user_id,
    'deleted_email', v_target_email,
    'message', 'Usuario eliminado exitosamente de Supabase Auth y de la base de datos'
  );
END;
$$;

-- Otorgar permiso de ejecución a usuarios autenticados (la validación interna revisa si es admin)
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(uuid) TO service_role;

-- 2. FUNCIÓN: cleanup_orphaned_auth_users
-- Limpia todos los usuarios que quedaron en auth.users pero cuyo perfil
-- ya fue borrado previamente, protegiendo siempre al superusuario.
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_auth_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_role text;
  v_deleted_count integer := 0;
BEGIN
  -- Verificar permisos de admin
  SELECT role::text INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acceso denegado: se requieren permisos de superusuario.';
  END IF;

  -- Eliminar de auth.users aquellos usuarios que no tienen registro en public.profiles
  -- y que no correspondan a la cuenta del administrador actual
  WITH deleted AS (
    DELETE FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = u.id
    )
    AND u.id != auth.uid()
    RETURNING u.id
  )
  SELECT count(*) INTO v_deleted_count FROM deleted;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'message', format('Se eliminaron %s usuarios huérfanos de auth.users', v_deleted_count)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_auth_users() TO service_role;
