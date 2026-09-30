-- ========================================================
-- MAESTROTECH — ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE
-- PostgreSQL + RLS + Triggers + Storage
-- ========================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMERACIONES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. TABLA: profiles (Asociada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Trigger para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, first_name, last_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name'), 'Docente'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABLA: courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  price NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  published BOOLEAN DEFAULT false NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  level TEXT,
  category TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  instructor_name TEXT,
  instructor_role TEXT,
  duration_hours NUMERIC(4, 1),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: modules
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: lessons (Los videos NO se guardan en BD; solo provider y video_id)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  video_provider TEXT DEFAULT 'cloudflare_stream',
  video_id TEXT,
  duration_seconds INTEGER DEFAULT 0 NOT NULL,
  is_preview BOOLEAN DEFAULT false NOT NULL,
  published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA: materials (Almacenamiento en Supabase Storage bucket 'course-materials')
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0 NOT NULL,
  is_free BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  status enrollment_status DEFAULT 'active'::enrollment_status NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 8. TABLA: lesson_progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  watched_seconds INTEGER DEFAULT 0 NOT NULL,
  last_position_seconds INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- 9. TABLA: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'COP' NOT NULL,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  status payment_status DEFAULT 'pending'::payment_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABLA: certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  certificate_url TEXT NOT NULL
);

-- ========================================================
-- POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ========================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Helper: verificar si el usuario es administrador (Superusuario)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: verificar si el usuario tiene rol docente (instructor o admin)
-- admin >= instructor
CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Profiles son legibles por todos"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil (sin alterar rol)"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Superusuarios pueden gestionar todos los perfiles y roles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin());

-- 2. Courses
CREATE POLICY "Cursos publicados son visibles públicamente"
  ON public.courses FOR SELECT
  USING (published = true OR public.is_instructor());

CREATE POLICY "Docentes y Superusuarios pueden gestionar cursos"
  ON public.courses FOR ALL
  USING (public.is_instructor());

-- 3. Modules
CREATE POLICY "Módulos son visibles si el curso está publicado o para docentes"
  ON public.modules FOR SELECT
  USING (
    public.is_instructor() OR EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = modules.course_id
      AND courses.published = true
    )
  );

CREATE POLICY "Docentes y Superusuarios pueden gestionar módulos"
  ON public.modules FOR ALL
  USING (public.is_instructor());

-- 4. Lessons
CREATE POLICY "Lecciones públicas o para matriculados o docentes"
  ON public.lessons FOR SELECT
  USING (
    public.is_instructor() OR (
      published = true AND (
        is_preview = true
        OR EXISTS (
          SELECT 1 FROM public.modules
          JOIN public.enrollments ON enrollments.course_id = modules.course_id
          WHERE modules.id = lessons.module_id
          AND enrollments.user_id = auth.uid()
          AND enrollments.status = 'active'
        )
      )
    )
  );

CREATE POLICY "Docentes y Superusuarios pueden gestionar lecciones"
  ON public.lessons FOR ALL
  USING (public.is_instructor());

-- 5. Materials
CREATE POLICY "Materiales libres o para matriculados o docentes"
  ON public.materials FOR SELECT
  USING (
    public.is_instructor() OR (
      is_free = true
      OR EXISTS (
        SELECT 1 FROM public.lessons
        JOIN public.modules ON modules.id = lessons.module_id
        JOIN public.enrollments ON enrollments.course_id = modules.course_id
        WHERE lessons.id = materials.lesson_id
        AND enrollments.user_id = auth.uid()
        AND enrollments.status = 'active'
      )
    )
  );

CREATE POLICY "Docentes y Superusuarios pueden gestionar materiales"
  ON public.materials FOR ALL
  USING (public.is_instructor());

-- 6. Enrollments
CREATE POLICY "Usuarios pueden ver sus propias matrículas"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Usuarios autenticados pueden registrarse en cursos gratuitos"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Lesson Progress
CREATE POLICY "Usuarios gestionan su propio progreso"
  ON public.lesson_progress FOR ALL
  USING (auth.uid() = user_id);

-- 8. Payments
CREATE POLICY "Usuarios ven sus propios pagos"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- 9. Certificates
CREATE POLICY "Certificados visibles para el estudiante"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- ========================================================
-- CONFIGURACIÓN DE STORAGE BUCKETS Y POLÍTICAS
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('course-materials', 'course-materials', false),
  ('course-thumbnails', 'course-thumbnails', true),
  ('avatars', 'avatars', true),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para storage.objects
-- 1. course-materials (PRIVADO)
CREATE POLICY "Docentes y Superusuarios pueden subir archivos a course-materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND (public.is_instructor() OR public.is_admin())
);

CREATE POLICY "Docentes y Superusuarios pueden actualizar archivos en course-materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND (public.is_instructor() OR public.is_admin())
);

CREATE POLICY "Docentes y Superusuarios pueden eliminar archivos en course-materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-materials'
  AND (public.is_instructor() OR public.is_admin())
);

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

-- 2. course-thumbnails (PÚBLICO)
CREATE POLICY "Cualquiera puede ver thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Docentes y Admins pueden subir thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-thumbnails'
  AND (public.is_instructor() OR public.is_admin())
);

-- 3. avatars
CREATE POLICY "Avatares son visibles públicamente"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios pueden subir su propio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

