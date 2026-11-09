-- ====================================================================
-- MIGRACIÓN: CARACTERIZACIÓN INTELIGENTE DE ASPIRANTES DOCENTES
-- LEGADO DOCENTE «Aprende, comparte, deja huella»
-- ====================================================================

-- 1. Tabla principal de perfil de aspirantes
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  department TEXT NOT NULL,
  municipality TEXT NOT NULL,
  data_consent_accepted BOOLEAN DEFAULT true,

  -- Aspiración al concurso
  target_role TEXT NOT NULL, -- docente_aula, docente_orientador, coordinador, rector, director_rural, orientacion_requerida
  education_level TEXT, -- preescolar, primaria, secundaria, media, no_sabe
  subject_area TEXT, -- matematicas, ciencias_naturales, etc.
  process_type TEXT NOT NULL, -- ingreso, ascenso, reubicacion, directivos, desconoce
  management_institution_environment TEXT,
  has_management_experience BOOLEAN DEFAULT false,
  has_coordination_functions BOOLEAN DEFAULT false,
  management_experience_years TEXT,

  -- Formación académica
  education_level_highest TEXT NOT NULL, -- licenciado, profesional_no_licenciado, etc.
  professional_title TEXT,
  institution_name TEXT,
  graduation_year TEXT,
  degree_status TEXT DEFAULT 'graduado',
  pedagogical_training TEXT DEFAULT 'no',
  pedagogical_training_details JSONB,

  -- Experiencia laboral y docente
  has_work_experience BOOLEAN DEFAULT false,
  total_work_experience TEXT,
  has_teaching_experience BOOLEAN DEFAULT false,
  teaching_institution_type TEXT,
  teaching_experience_years TEXT,
  teaching_levels TEXT[],
  teaching_subjects TEXT[],
  has_directorship_experience BOOLEAN DEFAULT false,
  directorship_positions TEXT[],
  directorship_years JSONB,

  -- Diagnóstico y preparación
  previous_exam_experience TEXT DEFAULT 'primera_vez',
  knowledge_level TEXT DEFAULT 'basico',
  difficulty_topics TEXT[],
  study_time TEXT DEFAULT '1_2h',
  preparation_goal TEXT DEFAULT 'aprobar_concurso',

  -- Clasificación automática y metadatos
  tags TEXT[] DEFAULT '{}',
  primary_tag TEXT,
  profile_completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT candidate_profiles_user_id_key UNIQUE(user_id)
);

-- 2. Tabla para múltiples títulos académicos
CREATE TABLE IF NOT EXISTS public.academic_degrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree_type TEXT NOT NULL, -- pregrado, especializacion, maestria, doctorado, otro
  degree_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  graduation_year TEXT,
  status TEXT DEFAULT 'graduado',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla para experiencia laboral detallada
CREATE TABLE IF NOT EXISTS public.work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_type TEXT NOT NULL, -- docente, directiva, otra
  institution_type TEXT,
  position TEXT NOT NULL,
  subject_area TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla para etiquetas dinámicas de clasificación
CREATE TABLE IF NOT EXISTS public.candidate_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT candidate_tags_user_tag_key UNIQUE(user_id, tag)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_candidate_target_role ON public.candidate_profiles(target_role);
CREATE INDEX IF NOT EXISTS idx_candidate_dept ON public.candidate_profiles(department);
CREATE INDEX IF NOT EXISTS idx_candidate_education_level ON public.candidate_profiles(education_level_highest);
CREATE INDEX IF NOT EXISTS idx_candidate_tags ON public.candidate_profiles USING GIN(tags);

-- Políticas RLS (Row Level Security)
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_tags ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden leer y editar su propio perfil
CREATE POLICY "Users can read own candidate profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Los administradores pueden consultar todos los perfiles de aspirantes
CREATE POLICY "Admins can view all candidate profiles"
  ON public.candidate_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
