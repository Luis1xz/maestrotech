-- ========================================================
-- MAESTROTECH — DATOS SEMILLA (CURSOS INICIALES)
-- Ejecutar en Supabase SQL Editor para poblar los cursos iniciales
-- ========================================================

-- 1. Insertar Curso 1: Pedagogía Crítica y Constructivismo
INSERT INTO public.courses (
  id, title, slug, description, short_description, thumbnail_url,
  price, published, featured, level, category, instructor_name,
  instructor_role, duration_hours
) VALUES (
  'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e',
  'Pedagogía Crítica y Constructivismo',
  'pedagogia-critica-y-constructivismo',
  'Domina los fundamentos epistemológicos y metodológicos de la pedagogía crítica y el constructivismo aplicados al aula y a las evaluaciones del magisterio colombiano. Análisis de Paulo Freire, Piaget, Vygotsky y Ausubel.',
  'Evolución pedagógica, modelos constructivistas y aplicación en la práctica docente.',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  0,
  true,
  true,
  'Intermedio',
  'Pedagogía',
  'Dra. Elena Restrepo',
  'Ph.D en Ciencias de la Educación',
  5.0
) ON CONFLICT (slug) DO NOTHING;

-- Módulos del Curso 1
INSERT INTO public.modules (id, course_id, title, description, order_index)
VALUES
  ('a1b2c3d4-1111-4000-8000-000000000001', 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e', 'Módulo 1: Fundamentos y Epistemología', 'Bases teóricas de la pedagogía moderna y concepción del conocimiento.', 1),
  ('a1b2c3d4-2222-4000-8000-000000000002', 'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2e', 'Módulo 2: Constructivismo en el Aula', 'Postulados de Piaget, Vygotsky y Ausubel en la práctica pedagógica real.', 2)
ON CONFLICT (id) DO NOTHING;

-- Lecciones del Módulo 1
INSERT INTO public.lessons (
  id, module_id, title, description, order_index,
  video_provider, video_id, duration_seconds, is_preview, published
) VALUES
  ('b1c2d3e4-1001-4000-8000-000000000001', 'a1b2c3d4-1111-4000-8000-000000000001', 'Fundamentos Epistemológicos de la Pedagogía', 'Exploración de los paradigmas epistemológicos clásicos y contemporáneos.', 1, 'youtube', 'dQw4w9WgXcQ', 2700, true, true),
  ('b1c2d3e4-1002-4000-8000-000000000002', 'a1b2c3d4-1111-4000-8000-000000000001', 'Corrientes Pedagógicas del Siglo XX', 'De la escuela tradicional a la escuela activa y el pensamiento crítico.', 2, 'youtube', 'dQw4w9WgXcQ', 2280, true, true)
ON CONFLICT (id) DO NOTHING;

-- Lecciones del Módulo 2
INSERT INTO public.lessons (
  id, module_id, title, description, order_index,
  video_provider, video_id, duration_seconds, is_preview, published
) VALUES
  ('b1c2d3e4-2001-4000-8000-000000000003', 'a1b2c3d4-2222-4000-8000-000000000002', 'Constructivismo: Piaget, Vygotsky y Ausubel', 'Zona de Desarrollo Próximo y aprendizaje significativo en acción.', 1, 'youtube', 'dQw4w9WgXcQ', 3120, false, true),
  ('b1c2d3e4-2002-4000-8000-000000000004', 'a1b2c3d4-2222-4000-8000-000000000002', 'Pedagogía Crítica — Freire y McLaren', 'La educación dialógica y problematizadora frente a la educación bancaria.', 2, 'youtube', 'dQw4w9WgXcQ', 2460, false, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar Curso 2: Decreto 1278
INSERT INTO public.courses (
  id, title, slug, description, short_description, thumbnail_url,
  price, published, featured, level, category, instructor_name,
  instructor_role, duration_hours
) VALUES (
  'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d2f',
  'Decreto 1278: Marco Legal y Concurso Docente',
  'decreto-1278-marco-legal-docente',
  'Comprende a fondo el Estatuto de Profesionalización Docente (Decreto Ley 1278 de 2002), el sistema de evaluación de competencias, derechos, deberes y preparación estratégica para la prueba del MEN.',
  'Estatuto 1278, escalafón docente, evaluación de desempeño y concurso de méritos.',
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
  49900,
  true,
  true,
  'Avanzado',
  'Legislación',
  'Abg. Carlos Andrés Medina',
  'Especialista en Derecho Administrativo y Educativo',
  8.0
) ON CONFLICT (slug) DO NOTHING;

-- 3. Insertar Curso 3: Evaluación del Aprendizaje
INSERT INTO public.courses (
  id, title, slug, description, short_description, thumbnail_url,
  price, published, featured, level, category, instructor_name,
  instructor_role, duration_hours
) VALUES (
  'e2b4f9e1-2b4a-4a6c-9c3f-7e8a9b0c1d30',
  'Evaluación del Aprendizaje y Diseño de Ítems',
  'evaluacion-aprendizaje-diseno-items',
  'Metodología para la formulación de preguntas por competencias según estándares del ICFES y el MEN. Validez, confiabilidad y análisis de distractores en pruebas objetivas.',
  'Construcción de preguntas por competencias, juicio de expertos y análisis psicométrico.',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  39900,
  true,
  true,
  'Intermedio',
  'Evaluación',
  'Mg. Martha Lucía Gómez',
  'Asesora en Evaluación Educativa',
  6.0
) ON CONFLICT (slug) DO NOTHING;
