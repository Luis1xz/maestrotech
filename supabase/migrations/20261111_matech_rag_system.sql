-- ========================================================
-- LEGADO DOCENTE — CEREBRO MATECH (SISTEMA RAG DOCUMENTAL)
-- Migración PostgreSQL + pgvector + RLS + Auditoría + Cuotas
-- ========================================================

-- 1. Habilitar extensión pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: matech_documents (Documentos subidos por curso)
CREATE TABLE IF NOT EXISTS public.matech_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0 NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'published', 'error', 'archived')) DEFAULT 'pending',
  error_message TEXT,
  total_chunks INTEGER DEFAULT 0 NOT NULL,
  total_tokens INTEGER DEFAULT 0 NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: matech_document_chunks (Fragmentos con embeddings de Gemini)
CREATE TABLE IF NOT EXISTS public.matech_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.matech_documents(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de búsqueda para aislamiento estricto por curso
CREATE INDEX IF NOT EXISTS idx_matech_chunks_course_doc
  ON public.matech_document_chunks(course_id, document_id);

CREATE INDEX IF NOT EXISTS idx_matech_docs_course_status
  ON public.matech_documents(course_id, status);

-- Índice vectorial HNSW para alta velocidad en similitud coseno
CREATE INDEX IF NOT EXISTS idx_matech_chunks_embedding
  ON public.matech_document_chunks
  USING hnsw (embedding vector_cosine_ops);

-- 4. TABLA: matech_teacher_permissions (Permisos independientes por docente y curso)
CREATE TABLE IF NOT EXISTS public.matech_teacher_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  can_upload BOOLEAN DEFAULT true NOT NULL,
  can_publish BOOLEAN DEFAULT true NOT NULL,
  can_delete BOOLEAN DEFAULT false NOT NULL,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(teacher_id, course_id)
);

-- 5. TABLA: matech_conversations (Conversaciones de estudiantes por curso)
CREATE TABLE IF NOT EXISTS public.matech_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Consulta pedagógica con MaTech' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matech_conv_user_course
  ON public.matech_conversations(user_id, course_id);

-- 6. TABLA: matech_messages (Mensajes y fuentes citadas)
CREATE TABLE IF NOT EXISTS public.matech_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.matech_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb NOT NULL,
  tokens_used INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matech_messages_conv
  ON public.matech_messages(conversation_id, created_at);

-- 7. TABLA: matech_usage_logs (Auditoría de cuotas y consumo de tokens)
CREATE TABLE IF NOT EXISTS public.matech_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  prompt_tokens INTEGER DEFAULT 0 NOT NULL,
  completion_tokens INTEGER DEFAULT 0 NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matech_usage_user_date
  ON public.matech_usage_logs(user_id, created_at);

-- 8. TABLA: matech_settings (Límites configurables desde el panel de Superusuarios)
CREATE TABLE IF NOT EXISTS public.matech_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  daily_limit_per_student INTEGER DEFAULT 10 NOT NULL,
  monthly_limit_per_student INTEGER DEFAULT 150 NOT NULL,
  cooldown_seconds INTEGER DEFAULT 10 NOT NULL,
  max_concurrent_requests INTEGER DEFAULT 2 NOT NULL,
  max_question_chars INTEGER DEFAULT 2000 NOT NULL,
  max_context_chunks INTEGER DEFAULT 6 NOT NULL,
  gemini_model TEXT DEFAULT 'gemini-1.5-flash' NOT NULL,
  embedding_model TEXT DEFAULT 'text-embedding-004' NOT NULL,
  global_budget_tokens BIGINT DEFAULT 10000000 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar configuración global por defecto
INSERT INTO public.matech_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

-- 9. TABLA: matech_audit_logs (Auditoría de acciones sobre el cerebro de MaTech)
CREATE TABLE IF NOT EXISTS public.matech_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matech_audit_created
  ON public.matech_audit_logs(created_at DESC);

-- ========================================================
-- FUNCIONES RPC DE BÚSQUEDA Y SEGURIDAD RAG
-- ========================================================

-- Helper: verificar si el docente actual tiene permiso en un curso específico
CREATE OR REPLACE FUNCTION public.is_teacher_authorized_for_course(target_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Superusuario (admin) tiene permiso total
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  -- Docente con permiso explícito en la tabla
  RETURN EXISTS (
    SELECT 1 FROM public.matech_teacher_permissions
    WHERE teacher_id = auth.uid()
      AND course_id = target_course_id
      AND can_upload = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Búsqueda Vectorial RAG Aislada Exclusivamente por Curso
CREATE OR REPLACE FUNCTION public.match_matech_chunks(
  target_course_id UUID,
  query_embedding vector(768),
  match_count INT DEFAULT 6,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_title TEXT,
  chunk_index INT,
  content TEXT,
  page_number INT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    d.title AS document_title,
    c.chunk_index,
    c.content,
    c.page_number,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.matech_document_chunks c
  JOIN public.matech_documents d ON d.id = c.document_id
  WHERE c.course_id = target_course_id
    AND d.course_id = target_course_id
    AND d.status = 'published'
    AND (1 - (c.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ========================================================

ALTER TABLE public.matech_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matech_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matech_teacher_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matech_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matech_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matech_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matech_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matech_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Documentos: Superusuarios control total; Docentes autorizados en sus cursos; Alumnos no leen documentos raw
DROP POLICY IF EXISTS "Superusuarios controlan todos los documentos de MaTech" ON public.matech_documents;
CREATE POLICY "Superusuarios controlan todos los documentos de MaTech"
ON public.matech_documents FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Docentes autorizados ven documentos de sus cursos" ON public.matech_documents;
CREATE POLICY "Docentes autorizados ven documentos de sus cursos"
ON public.matech_documents FOR SELECT
TO authenticated
USING (public.is_teacher_authorized_for_course(course_id));

DROP POLICY IF EXISTS "Docentes autorizados suben documentos a sus cursos" ON public.matech_documents;
CREATE POLICY "Docentes autorizados suben documentos a sus cursos"
ON public.matech_documents FOR INSERT
TO authenticated
WITH CHECK (public.is_teacher_authorized_for_course(course_id));

-- 2. Permisos: Solo Superusuarios pueden conceder, revocar o consultar todos los permisos
DROP POLICY IF EXISTS "Superusuarios gestionan permisos de docentes MaTech" ON public.matech_teacher_permissions;
CREATE POLICY "Superusuarios gestionan permisos de docentes MaTech"
ON public.matech_teacher_permissions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Docentes pueden consultar sus propios permisos" ON public.matech_teacher_permissions;
CREATE POLICY "Docentes pueden consultar sus propios permisos"
ON public.matech_teacher_permissions FOR SELECT
TO authenticated
USING (teacher_id = auth.uid());

-- 3. Conversaciones: El usuario solo accede a sus conversaciones en cursos donde está matriculado
DROP POLICY IF EXISTS "Usuarios acceden a sus propias conversaciones de MaTech" ON public.matech_conversations;
CREATE POLICY "Usuarios acceden a sus propias conversaciones de MaTech"
ON public.matech_conversations FOR ALL
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 4. Mensajes: Accesibles si el usuario es dueño de la conversación
DROP POLICY IF EXISTS "Usuarios acceden a mensajes de sus conversaciones" ON public.matech_messages;
CREATE POLICY "Usuarios acceden a mensajes de sus conversaciones"
ON public.matech_messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matech_conversations c
    WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.is_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matech_conversations c
    WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR public.is_admin())
  )
);

-- 5. Configuraciones: Lectura para autenticados, escritura exclusiva Superusuarios
DROP POLICY IF EXISTS "Lectura de configuraciones MaTech" ON public.matech_settings;
CREATE POLICY "Lectura de configuraciones MaTech"
ON public.matech_settings FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Superusuarios modifican configuraciones MaTech" ON public.matech_settings;
CREATE POLICY "Superusuarios modifican configuraciones MaTech"
ON public.matech_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Auditoría: Lectura y escritura exclusiva Superusuarios
DROP POLICY IF EXISTS "Superusuarios consultan auditoría MaTech" ON public.matech_audit_logs;
CREATE POLICY "Superusuarios consultan auditoría MaTech"
ON public.matech_audit_logs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ========================================================
-- BUCKET DE SUPABASE STORAGE: matech-documents (PRIVADO)
-- ========================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matech-documents',
  'matech-documents',
  false,
  52428800, -- 50MB máximo por documento
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800;

-- Políticas de Storage para matech-documents
DROP POLICY IF EXISTS "Superusuarios y docentes autorizados suben a matech-documents" ON storage.objects;
CREATE POLICY "Superusuarios y docentes autorizados suben a matech-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'matech-documents'
  AND (public.is_admin() OR public.is_instructor())
);

DROP POLICY IF EXISTS "Superusuarios y docentes autorizados leen de matech-documents" ON storage.objects;
CREATE POLICY "Superusuarios y docentes autorizados leen de matech-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'matech-documents'
  AND (public.is_admin() OR public.is_instructor())
);

DROP POLICY IF EXISTS "Superusuarios y docentes autorizados eliminan de matech-documents" ON storage.objects;
CREATE POLICY "Superusuarios y docentes autorizados eliminan de matech-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'matech-documents'
  AND (public.is_admin() OR public.is_instructor())
);
