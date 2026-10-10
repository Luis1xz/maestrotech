-- ========================================================
-- POLÍTICAS DE RLS PARA SUPABASE STORAGE (storage.objects)
-- Ejecutar en el SQL Editor de Supabase
-- Proyecto: eklolnecteffjzbjbjmr
-- ========================================================

-- 0. Asegurar funciones auxiliares de verificación de rol (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  );
$$;

-- Asegurar que los buckets existen (documentos PDF y videos MP4/WebM hasta 500MB)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 1. BUCKET: course-materials (PRIVADO - Materiales y Videos)
DROP POLICY IF EXISTS "Docentes y Superusuarios pueden subir archivos a course-materials" ON storage.objects;
CREATE POLICY "Docentes y Superusuarios pueden subir archivos a course-materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND (public.is_instructor() OR public.is_admin())
);

DROP POLICY IF EXISTS "Docentes y Superusuarios pueden actualizar archivos en course-materials" ON storage.objects;
CREATE POLICY "Docentes y Superusuarios pueden actualizar archivos en course-materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND (public.is_instructor() OR public.is_admin())
);

DROP POLICY IF EXISTS "Docentes y Superusuarios pueden eliminar archivos en course-materials" ON storage.objects;
CREATE POLICY "Docentes y Superusuarios pueden eliminar archivos en course-materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND (public.is_instructor() OR public.is_admin())
);

DROP POLICY IF EXISTS "Docentes y Alumnos autorizados pueden leer course-materials" ON storage.objects;
CREATE POLICY "Docentes y Alumnos autorizados pueden leer course-materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND (
    public.is_instructor()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = auth.uid()
      AND e.status = 'active'
    )
  )
);

-- 2. BUCKET: course-thumbnails (PÚBLICO)
DROP POLICY IF EXISTS "Cualquiera puede ver thumbnails" ON storage.objects;
CREATE POLICY "Cualquiera puede ver thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Docentes y Admins pueden subir thumbnails" ON storage.objects;
CREATE POLICY "Docentes y Admins pueden subir thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails'
  AND (public.is_instructor() OR public.is_admin())
);

-- 3. BUCKET: avatars
DROP POLICY IF EXISTS "Avatares son visibles públicamente" ON storage.objects;
CREATE POLICY "Avatares son visibles públicamente"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuarios pueden subir su propio avatar" ON storage.objects;
CREATE POLICY "Usuarios pueden subir su propio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
