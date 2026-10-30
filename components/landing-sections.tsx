'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BookOpen, Brain, Award, Users, BarChart3, Clock,
  CheckCircle2, Star, ArrowRight, Layers, Target,
  FileText, Lightbulb, Globe, Flame, TrendingUp, Sparkles
} from 'lucide-react'

/* =====================
   FEATURES SECTION
   ===================== */
const FEATURES = [
  {
    icon: Brain,
    title: 'IA Adaptativa',
    description: 'Tu asistente personal estudia tus patrones de aprendizaje y crea rutas personalizadas que se ajustan a tu ritmo.',
    iconBg: 'bg-[#176FC1]/10 text-[#176FC1]',
  },
  {
    icon: Target,
    title: 'Simulador Situacional',
    description: 'Simulacros idénticos a las pruebas reales del MEN y CNSC. Banco de 12,000+ preguntas actualizadas por expertos.',
    iconBg: 'bg-[#39BDEB]/15 text-[#176FC1]',
  },
  {
    icon: BarChart3,
    title: 'Analítica Profunda',
    description: 'Mapas de conocimiento, radares de competencias y heatmaps de rendimiento que revelan exactamente qué mejorar.',
    iconBg: 'bg-[#142D49]/10 text-[#142D49]',
  },
  {
    icon: Users,
    title: 'Comunidad Activa',
    description: 'Conecta con más de 48,000 docentes en Colombia. Foros pedagógicos, mentoría y sesiones en vivo con formadores.',
    iconBg: 'bg-[#176FC1]/10 text-[#176FC1]',
  },
  {
    icon: Award,
    title: 'Logros Profesionales',
    description: 'Sistema de reconocimiento que celebra tu progreso con certificaciones verificables, insignias y hitos de carrera.',
    iconBg: 'bg-[#E9A83A]/15 text-[#E9A83A]',
  },
  {
    icon: Layers,
    title: 'Contenido Estructurado',
    description: 'Cursos modulares alineados con el Decreto 1278, rutas de ascenso y materiales pedagógicos descargables.',
    iconBg: 'bg-[#39BDEB]/15 text-[#142D49]',
  },
]

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FeaturesSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden bg-[#F3F8FD]">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5EDF5] text-[#176FC1] text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
            <Lightbulb className="w-4 h-4 text-[#E9A83A]" />
            Diseñado para el docente colombiano
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-[#142D49] text-balance mb-6">
            Una plataforma pedagógica
            <br />
            <span className="gradient-text">diseñada para tu ascenso</span>
          </h2>
          <p className="text-base sm:text-lg text-[#536B83] max-w-2xl mx-auto leading-relaxed">
            No es otro software genérico. Es un ecosistema EdTech premium construido específicamente para el sistema educativo de Colombia.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, iconBg }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="group relative h-full p-8 rounded-3xl bg-white border border-[#E5EDF5] hover:border-[#176FC1]/40 transition-all duration-300 shadow-xs hover:shadow-lg card-lift overflow-hidden">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#142D49] mb-3">{title}</h3>
                <p className="text-sm text-[#536B83] leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* =====================
   EXAM PREVIEW
   ===================== */
const EXAM_QUESTIONS = [
  { competency: 'Pedagogía y Constructivismo', progress: 85, color: 'bg-[#176FC1]' },
  { competency: 'Legislación Educativa (Decreto 1290/1278)', progress: 72, color: 'bg-[#142D49]' },
  { competency: 'Juicio Situacional en Aula', progress: 80, color: 'bg-[#39BDEB]' },
  { competency: 'Evaluación Formativa y Continua', progress: 68, color: 'bg-[#E9A83A]' },
]

export function ExamPreviewSection({ onNavigate }: { onNavigate: (v: string) => void }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-28 px-6 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3F8FD] border border-[#E5EDF5] text-[#176FC1] text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
              <Target className="w-4 h-4 text-[#176FC1]" />
              Simulador de Exámenes CNSC
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-[#142D49] text-balance mb-6">
              Entrena con casos reales
              <br />
              <span className="gradient-text">idénticos al día de la prueba.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#536B83] leading-relaxed mb-8">
              Preguntas de juicio situacional con temporizador oficial, retroalimentación formativa inmediata y orientación pedagógica guiada.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'Modalidad examen cronometrado con temporizador',
                'Retroalimentación con justificación pedagógica y Decreto 1290',
                'Radar de competencias y puntos de refuerzo',
                'Historial de evolución y reconocimiento formativo',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#142D49]">
                  <CheckCircle2 className="w-5 h-5 text-[#176FC1] shrink-0 mt-0.5" strokeWidth={2.2} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onNavigate('exam')}
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#176FC1] hover:bg-[#142D49] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 btn-magnetic"
            >
              Iniciar simulacro ahora
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </FadeIn>

          {/* Preview card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="float"
          >
            <div className="relative p-8 rounded-3xl bg-white border border-[#E5EDF5] shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-[#536B83] uppercase tracking-widest font-semibold mb-1">Simulacro en progreso</p>
                  <p className="font-display font-bold text-[#142D49]">Concurso Méritos Docente 2026</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5]">
                  <Clock className="w-4 h-4 text-[#176FC1]" />
                  <span className="text-sm font-mono font-bold text-[#142D49]">42:15</span>
                </div>
              </div>

              {/* Question */}
              <div className="p-5 rounded-2xl bg-[#F3F8FD] border border-[#E5EDF5] mb-6">
                <p className="text-xs text-[#176FC1] font-bold uppercase tracking-wide mb-2">Pregunta 18 / 60</p>
                <p className="text-sm font-semibold text-[#142D49] leading-relaxed">
                  De acuerdo con el Decreto 1290 y el modelo constructivista, ¿cuál es el principio orientador de la evaluación en el aula?
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-6">
                {[
                  { label: 'A', text: 'La evaluación debe ser sumativa y primordialmente punitiva', selected: false },
                  { label: 'B', text: 'La evaluación es un proceso continuo, formativo e integral', selected: true },
                  { label: 'C', text: 'Solo se evalúan contenidos conceptuales memorísticos', selected: false },
                  { label: 'D', text: 'La evaluación la determina cada institución sin planes de apoyo', selected: false },
                ].map(({ label, text, selected }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'border-[#176FC1] bg-[#F3F8FD] text-[#142D49] font-semibold'
                        : 'border-[#E5EDF5] bg-white text-[#536B83] hover:border-[#176FC1]/30'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      selected ? 'bg-[#176FC1] text-white' : 'bg-[#F3F8FD] text-[#536B83] border border-[#E5EDF5]'
                    }`}>
                      {label}
                    </span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Competencies */}
              <div className="space-y-3 pt-2 border-t border-[#E5EDF5]">
                <p className="text-xs text-[#536B83] font-bold uppercase tracking-wider">Dominio por competencia</p>
                {EXAM_QUESTIONS.map(({ competency, progress, color }) => (
                  <div key={competency}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#536B83] font-medium">{competency}</span>
                      <span className="text-xs font-mono font-bold text-[#142D49]">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F3F8FD] border border-[#E5EDF5] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${progress}%` } : {}}
                        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* =====================
   TESTIMONIALS
   ===================== */
const TESTIMONIALS = [
  {
    name: 'María Fernanda López',
    role: 'Docente de Matemáticas · Bogotá',
    content: 'Pasé de 58 a 89 puntos en el simulacro. El simulador de MaestroTech es idéntico a las preguntas del concurso. Aprobé el concurso de méritos con nombramiento en propiedad.',
    rating: 5,
    avatar: 'MF',
    avatarBg: 'bg-[#176FC1]',
  },
  {
    name: 'Carlos Eduardo Martínez',
    role: 'Directivo Docente · Medellín',
    content: 'El módulo de gestión y liderazgo transformó mi visión institucional. El rigor pedagógico y la calidad de las clases me permitieron ascender en el escalafón.',
    rating: 5,
    avatar: 'CE',
    avatarBg: 'bg-[#142D49]',
  },
  {
    name: 'Diana Patricia Rueda',
    role: 'Docente de Humanidades · Cali',
    content: 'La retroalimentación formativa y las pistas del mentor me enseñaron a analizar cada caso situacional. La plataforma te motiva en todo momento a seguir superándote.',
    rating: 5,
    avatar: 'DP',
    avatarBg: 'bg-[#39BDEB]',
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative py-28 px-6 bg-[#F3F8FD]">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5EDF5] text-[#176FC1] text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
            <Star className="w-4 h-4 text-[#E9A83A] fill-[#E9A83A]" />
            Testimonios de docentes
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-[#142D49] text-balance mb-6">
            Colegas que lograron
            <br />
            <span className="gradient-text">su nombramiento y ascenso</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, content, rating, avatar, avatarBg }, i) => (
            <FadeIn key={name} delay={i * 0.1}>
              <div className="p-8 rounded-3xl bg-white border border-[#E5EDF5] hover:border-[#176FC1]/40 transition-all duration-300 shadow-xs hover:shadow-lg card-lift h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-[#E9A83A] fill-[#E9A83A]" />
                  ))}
                </div>

                <p className="text-sm text-[#142D49] leading-relaxed flex-1 mb-6 font-medium">
                  &ldquo;{content}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-[#E5EDF5]">
                  <div className={`w-10 h-10 rounded-xl ${avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#142D49]">{name}</p>
                    <p className="text-xs text-[#536B83]">{role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* =====================
   PATHS SECTION
   ===================== */
const PATHS = [
  {
    icon: FileText,
    title: 'Concurso de Méritos CNSC',
    description: 'Prepárate para las pruebas de ingreso al escalafón 1278 con simulacros semanales y casos de juicio situacional.',
    tags: ['Decreto 1278', 'Pedagogía', 'Juicio Situacional'],
    stripeColor: 'bg-[#176FC1]',
    iconColor: 'bg-[#176FC1]/10 text-[#176FC1]',
    students: '18,200+',
  },
  {
    icon: TrendingUp,
    title: 'Ascenso y Reubicación Salarial',
    description: 'Domina las competencias evaluadas en la prueba de valoración de carácter diagnóstico formativa (SDF).',
    tags: ['Evaluación MEN', 'Desempeño', 'Ascenso'],
    stripeColor: 'bg-[#39BDEB]',
    iconColor: 'bg-[#39BDEB]/15 text-[#176FC1]',
    students: '12,400+',
  },
  {
    icon: Globe,
    title: 'Traslados y Reubicaciones',
    description: 'Normativa vigente, criterios de ponderación y preparación documental para procesos de traslado ordinario y extraordinario.',
    tags: ['Normativa', 'Procesos', 'Ponderación'],
    stripeColor: 'bg-[#142D49]',
    iconColor: 'bg-[#142D49]/10 text-[#142D49]',
    students: '7,600+',
  },
  {
    icon: Flame,
    title: 'Desarrollo Profesional Continuo',
    description: 'Cursos actualizados en neuroeducación, inclusión educativa (Decreto 1421), TIC y evaluación formativa.',
    tags: ['Decreto 1421', 'DUA', 'Inclusión'],
    stripeColor: 'bg-[#E9A83A]',
    iconColor: 'bg-[#E9A83A]/15 text-[#E9A83A]',
    students: '9,800+',
  },
]

export function PathsSection({ onNavigate }: { onNavigate: (v: string) => void }) {
  return (
    <section className="relative py-28 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3F8FD] border border-[#E5EDF5] text-[#176FC1] text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
            <BookOpen className="w-4 h-4 text-[#176FC1]" />
            Rutas pedagógicas estructuradas
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-[#142D49] text-balance mb-6">
            Tu meta docente,
            <br />
            <span className="gradient-text">tu ruta estructurada.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#536B83] max-w-2xl mx-auto">
            Elige la ruta que corresponde a tu objetivo profesional y avanza con un plan pedagógico validado.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {PATHS.map(({ icon: Icon, title, description, tags, stripeColor, iconColor, students }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div
                onClick={() => onNavigate('courses')}
                className="group relative p-8 rounded-3xl bg-white border border-[#E5EDF5] hover:border-[#176FC1]/40 transition-all duration-300 card-lift cursor-pointer overflow-hidden shadow-xs hover:shadow-lg"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${stripeColor}`} />
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${iconColor} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-[#536B83] font-semibold bg-[#F3F8FD] px-3 py-1 rounded-full border border-[#E5EDF5]">
                    {students} docentes
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-[#142D49] mb-3">{title}</h3>
                <p className="text-sm text-[#536B83] leading-relaxed mb-5">{description}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-lg bg-[#F3F8FD] text-[#536B83] border border-[#E5EDF5] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-5 text-[#176FC1] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar ruta completa <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* =====================
   CTA SECTION
   ===================== */
export function CTASection({ onNavigate }: { onNavigate: (v: string) => void }) {
  return (
    <section className="relative py-28 px-6 overflow-hidden bg-[#F3F8FD]">
      <div className="relative max-w-4xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5EDF5] text-[#176FC1] text-xs sm:text-sm font-semibold mb-8 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#39BDEB]" />
            Preparación continua sin ataduras
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#142D49] text-balance mb-6">
            Tu carrera docente
            <br />
            <span className="gradient-text">merece el mejor respaldo.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#536B83] max-w-2xl mx-auto leading-relaxed mb-10">
            Únete a la comunidad de más de 48,000 docentes en toda Colombia que se preparan con rigor pedagógico y tecnología.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 rounded-2xl bg-[#176FC1] hover:bg-[#142D49] text-white text-base font-bold shadow-md hover:shadow-xl transition-all duration-300 btn-magnetic flex items-center justify-center gap-2"
            >
              <span>Comenzar ahora gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="px-8 py-4 rounded-2xl bg-white border border-[#E5EDF5] hover:border-[#176FC1] text-[#142D49] text-base font-semibold transition-all duration-300 btn-magnetic shadow-xs"
            >
              Ver planes y precios
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

