-- ========================================================
-- MAESTROTECH — PROMOCIÓN SEGURA DE SUPERUSUARIOS
-- ========================================================
-- Este script permite asignar de forma explícita y segura el rol
-- de Superusuario (role = 'admin') a las cuentas reales de:
-- 1. LuisAlfonso
-- 2. PatriciaJhon
--
-- INSTRUCCIONES:
-- 1. LuisAlfonso y PatriciaJhon deben registrarse primero en la plataforma
--    con sus correos y contraseñas reales mediante el botón "Crear cuenta".
-- 2. Una vez registradas sus cuentas, copia este script en el
--    Supabase SQL Editor (https://supabase.com/dashboard/project/eklolnecteffjzbjbjmr/sql).
-- 3. Reemplaza los correos 'email_real_de_luis_alfonso@...' y
--    'email_real_de_patricia_jhon@...' con sus direcciones reales.
-- 4. Ejecuta este script. Inmediatamente tendrán acceso total a /admin y /teacher.
-- ========================================================

-- Opción A: Promover por Correo Electrónico Real (RECOMENDADO)
DO $$
DECLARE
  email_luis_alfonso TEXT := 'coloca_aqui_el_email_real_de_luis_alfonso@ejemplo.com';
  email_patricia_jhon TEXT := 'coloca_aqui_el_email_real_de_patricia_jhon@ejemplo.com';
BEGIN
  -- Promover LuisAlfonso
  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = lower(trim(email_luis_alfonso))
  );

  -- Promover PatriciaJhon
  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = lower(trim(email_patricia_jhon))
  );

  RAISE NOTICE 'Proceso de asignación de Superusuarios ejecutado.';
END $$;

-- Opción B: Función reutilizable para que un admin promueva a cualquier usuario
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Verificar que el usuario exista en auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = lower(trim(target_email));

  IF target_user_id IS NULL THEN
    RETURN 'Usuario con correo ' || target_email || ' no encontrado en auth.users.';
  END IF;

  -- Actualizar rol a 'admin'
  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;

  RETURN 'Usuario ' || target_email || ' promovido exitosamente a Superusuario (admin).';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejemplo de uso posterior en SQL Editor:
-- SELECT public.promote_user_to_admin('correo_real@ejemplo.com');

-- Verificación de Superusuarios actuales en el sistema:
SELECT p.id, u.email, p.full_name, p.role, p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin';
