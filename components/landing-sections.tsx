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
    color: 'from-blue-600 to-violet-600',
    glow: 'glow-blue',
  },
  {
    icon: Target,
    title: 'Simulador Premium',
    description: 'Simulacros idénticos a las pruebas reales del MEN. Banco de 12,000+ preguntas actualizadas por expertos.',
    color: 'from-emerald-600 to-cyan-600',
    glow: 'glow-emerald',
  },
  {
    icon: BarChart3,
    title: 'Analítica Profunda',
    description: 'Mapas de conocimiento, radares de competencias y heatmaps de rendimiento que revelan exactamente qué mejorar.',
    color: 'from-orange-500 to-rose-500',
    glow: 'glow-orange',
  },
  {
    icon: Users,
    title: 'Comunidad Activa',
    description: 'Conecta con 48,000 docentes. Grupos de estudio, mentoría entre pares y sesiones en vivo con expertos.',
    color: 'from-violet-600 to-fuchsia-600',
    glow: 'glow-blue',
  },
  {
    icon: Award,
    title: 'Logros Profesionales',
    description: 'Sistema de reconocimiento que celebra tu progreso con certificaciones, insignias y hitos de carrera.',
    color: 'from-amber-500 to-orange-600',
    glow: 'glow-orange',
  },
  {
    icon: Layers,
    title: 'Contenido Estructurado',
    description: 'Cursos modulares alineados con el Decreto 1278, rutas de ascenso y materiales actualizados constantemente.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'glow-blue',
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
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6">
            <Lightbulb className="w-4 h-4" />
            Diseñado para el docente colombiano
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-foreground text-balance mb-6">
            Una plataforma que
            <br />
            <span className="gradient-text">realmente funciona</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No es otro LMS genérico. Es un ecosistema digital construido desde cero para el sistema educativo colombiano.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="group relative h-full p-8 rounded-3xl glass border border-border/60 hover:border-primary/20 transition-all duration-500 card-lift overflow-hidden">
                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-3xl`} />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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
  { competency: 'Pedagogía', progress: 82, color: 'bg-blue-500' },
  { competency: 'Legislación Educativa', progress: 67, color: 'bg-violet-500' },
  { competency: 'Psicología del Aprendizaje', progress: 74, color: 'bg-emerald-500' },
  { competency: 'Currículo y Evaluación', progress: 58, color: 'bg-orange-500' },
]

export function ExamPreviewSection({ onNavigate }: { onNavigate: (v: string) => void }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-blue-600/8 to-violet-600/8 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              Simulador de Exámenes
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground text-balance mb-6">
              Entrena como si fuera
              <br />
              <span className="gradient-text">el día de la prueba.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Más de 12,000 preguntas organizadas por competencias. Temporizador real, análisis instantáneo de errores y recomendaciones de la IA para mejorar.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'Modalidad examen real (60 min, cronometrado)',
                'Análisis de errores con explicación detallada',
                'Radar de competencias en tiempo real',
                'Historial de simulacros y evolución',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onNavigate('exam')}
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300 btn-magnetic"
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
            <div className="relative p-8 rounded-3xl glass border border-border/60 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Simulacro en progreso</p>
                  <p className="font-display font-bold text-foreground">Concurso Méritos 2025</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-mono font-bold text-rose-500">42:15</span>
                </div>
              </div>

              {/* Question */}
              <div className="p-5 rounded-2xl bg-background/60 border border-border/60 mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Pregunta 18 / 60</p>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  Según la Ley 115, ¿cuál es el principio que orienta la evaluación del aprendizaje en la educación básica?
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2 mb-6">
                {[
                  { label: 'A', text: 'La evaluación debe ser sumativa y periódica', selected: false },
                  { label: 'B', text: 'La evaluación es un proceso continuo e integral', selected: true },
                  { label: 'C', text: 'Solo se evalúan conocimientos conceptuales', selected: false },
                  { label: 'D', text: 'La evaluación la determina cada institución', selected: false },
                ].map(({ label, text, selected }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'border-blue-500/50 bg-blue-500/8 text-foreground'
                        : 'border-border/50 text-muted-foreground hover:border-border'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      selected ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {label}
                    </span>
                    {text}
                  </div>
                ))}
              </div>

              {/* Competencies */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Dominio por competencia</p>
                {EXAM_QUESTIONS.map(({ competency, progress, color }) => (
                  <div key={competency}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">{competency}</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
    content: 'Pasé de 58 a 89 puntos en el simulacro. El simulador de Maestro es exactamente igual al examen real. Aprobé el concurso de méritos en el primer intento.',
    rating: 5,
    avatar: 'MF',
    gradient: 'from-blue-600 to-violet-600',
  },
  {
    name: 'Carlos Eduardo Martínez',
    role: 'Rector · Medellín',
    content: 'Como directivo, el módulo de liderazgo educativo transformó mi visión de gestión. El contenido es de calidad universitaria pero con un formato increíblemente dinámico.',
    rating: 5,
    avatar: 'CE',
    gradient: 'from-emerald-600 to-cyan-600',
  },
  {
    name: 'Diana Patricia Rueda',
    role: 'Docente de Lengua · Cali',
    content: 'El asistente de IA me explicó mis errores de una forma que ningún libro pudo hacer. Siento que tengo un tutor personal disponible 24/7.',
    rating: 5,
    avatar: 'DP',
    gradient: 'from-orange-500 to-rose-500',
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-current" />
            Testimonios reales
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-foreground text-balance mb-6">
            Docentes que
            <br />
            <span className="gradient-text-emerald">transformaron su carrera</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, content, rating, avatar, gradient }, i) => (
            <FadeIn key={name} delay={i * 0.1}>
              <div className="group p-8 rounded-3xl glass border border-border/60 hover:border-primary/20 transition-all duration-500 card-lift h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                <p className="text-sm text-foreground leading-relaxed flex-1 mb-6">
                  &ldquo;{content}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
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
    title: 'Concurso de Méritos',
    description: 'Prepárate para las pruebas de acceso al escalafón. Ruta de 8 semanas con simulacros semanales.',
    tags: ['Decreto 1278', 'Pedagogía', 'Legislación'],
    color: 'from-blue-600 to-violet-600',
    students: '18,200+',
  },
  {
    icon: TrendingUp,
    title: 'Ascenso Salarial',
    description: 'Domina las competencias evaluadas en la prueba de valoración. Eleva tu nivel y tu ingreso.',
    tags: ['Evaluación docente', 'Competencias', 'Desempeño'],
    color: 'from-emerald-600 to-cyan-600',
    students: '12,400+',
  },
  {
    icon: Globe,
    title: 'Traslados y Reubicaciones',
    description: 'Conoce el proceso completo de traslados, normativa vigente y cómo preparar tu expediente.',
    tags: ['Normativa', 'Proceso', 'Documentación'],
    color: 'from-orange-500 to-rose-500',
    students: '7,600+',
  },
  {
    icon: Flame,
    title: 'Desarrollo Continuo',
    description: 'Actualización permanente: nuevas metodologías, tecnología educativa, bienestar y liderazgo.',
    tags: ['Innovación', 'Bienestar', 'Liderazgo'],
    color: 'from-violet-600 to-fuchsia-600',
    students: '9,800+',
  },
]

export function PathsSection({ onNavigate }: { onNavigate: (v: string) => void }) {
  return (
    <section className="relative py-32 px-6 aurora-bg">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Rutas de aprendizaje
          </div>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-foreground text-balance mb-6">
            Tu ruta,
            <br />
            <span className="gradient-text">tu momento.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige la ruta que corresponde a tu etapa profesional y avanza con un plan estructurado.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {PATHS.map(({ icon: Icon, title, description, tags, color, students }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div
                onClick={() => onNavigate('courses')}
                className="group relative p-8 rounded-3xl glass border border-border/60 hover:border-primary/20 transition-all duration-500 card-lift cursor-pointer overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-xs text-muted-foreground">{students} docentes</span>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-5 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver ruta completa <ArrowRight className="w-4 h-4" />
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
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-violet-600/6 to-emerald-600/6" />

      <div className="relative max-w-4xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Empieza hoy, sin tarjeta de crédito
          </div>
          <h2 className="font-display font-bold text-5xl md:text-7xl text-foreground text-balance mb-6">
            Tu carrera
            <br />
            <span className="gradient-text">no puede esperar.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            Únete a los 48,000 docentes que ya están preparándose para el siguiente nivel. Acceso gratuito por 14 días.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-bold shadow-2xl shadow-blue-600/25 hover:shadow-blue-600/50 transition-all duration-300 btn-magnetic"
            >
              <span className="flex items-center gap-3">
                Comenzar gratis ahora
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="px-10 py-5 rounded-2xl glass border border-border hover:border-primary/30 text-foreground text-lg font-semibold transition-all duration-300 btn-magnetic"
            >
              Ver planes y precios
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

