'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, BookOpen, Shield, Sparkles, LayoutDashboard, Award, CheckCircle2, ChevronDown, Check } from 'lucide-react'
import Link from 'next/link'
import { UserRole, canAccessAdmin, canAccessTeacher } from '@/types/database'

const STATS = [
  { value: '140h', label: 'Formación Certificada', color: 'text-[#0038DF]' },
  { value: '13', label: 'Módulos Temáticos', color: 'text-[#9C7316]' },
  { value: '100%', label: 'Alineado CNSC / MEN', color: 'text-[#0038DF]' },
  { value: '32', label: 'Departamentos', color: 'text-[#1E293B]' },
]

interface HeroProps {
  onNavigate: (view: string) => void
  onOpenAuth?: (mode?: 'signin' | 'signup') => void
  isAuthenticated?: boolean
  role?: UserRole | null
  userName?: string
}

export default function HeroSection({ onNavigate, onOpenAuth, isAuthenticated, role, userName }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 80])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const smoothY = useSpring(y, { damping: 20, stiffness: 100 })

  return (
    <section
      ref={ref}
      className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-white border-b border-[#E2E8F0]"
    >
      {/* Layout asimétrico 70% / 30% con línea divisoria dorada de 4px */}
      <div className="relative w-full flex-1 flex flex-col lg:flex-row">
        
        {/* ========================================================
            COLUMNA IZQUIERDA (70%): Contenido Institucional Limpio
            ======================================================== */}
        <div className="w-full lg:w-[68%] xl:w-[70%] bg-white px-6 sm:px-10 md:px-16 lg:px-20 py-16 lg:py-24 flex flex-col justify-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            {/* Eyebrow Badge en píldora con borde fino dorado 1px solid #C99E32 */}
            <div className="mb-6">
              <span className="eyebrow-white-pill shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0038DF] animate-pulse" />
                CONCURSO DOCENTE 2917–3006
              </span>
            </div>

            {/* Titular H1 Extra-Bold (800) en Azul Rey (#0038DF) y Subtítulo en Dorado Ocre (#9C7316) */}
            <h1 className="title-h1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0038DF] mb-2">
              El concurso tiene reglas.
            </h1>
            <h2 className="title-h1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#9C7316] mb-5">
              ¿Las conoces?
            </h2>

            {/* Línea divisoria corta con acabado dorado metálico redondeado */}
            <div className="gold-divider mb-8" />

            {/* Párrafo de lectura en azul pizarra oscuro (#1E293B) */}
            <p className="text-[#1E293B] text-lg sm:text-xl md:text-2xl font-normal leading-relaxed max-w-2xl mb-10 text-pretty">
              Prepárate con método, fuentes oficiales y una comunidad de colegas. El programa oficial de cualificación docente de <strong className="font-bold text-[#0038DF]">140 horas</strong> para asegurar tu nombramiento en propiedad.
            </p>

            {/* Acciones principales / Botón CTA Oro Metálico tipo Banner de 2 líneas con Shimmer activo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10">
              <button
                onClick={() => onNavigate('courses')}
                className="btn-gold-cta btn-gold-banner px-8 py-4 text-left cursor-pointer flex items-center justify-between gap-6 group w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all"
              >
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8F6812] animate-sparkle" />
                    Curso de lanzamiento
                  </span>
                  <span className="block text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
                    Matrícula abierta
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:translate-x-1.5 group-hover:bg-white/60 transition-all duration-300 shadow-xs">
                  <ArrowRight className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2.5} />
                </div>
              </button>

              <button
                onClick={() => onOpenAuth?.('signup')}
                className="group flex items-center gap-2 text-sm sm:text-base font-bold text-[#0038DF] hover:text-[#002299] transition-all py-2 px-3 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C99E32] group-hover:rotate-12 group-hover:scale-125 transition-transform duration-300" />
                <span className="underline decoration-[#C99E32] decoration-2 underline-offset-4 group-hover:decoration-[#0038DF] transition-colors">
                  Diagnóstico gratis · enlace en la biografía
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </div>

            {/* Accesos rápidos de usuario autenticado si aplica */}
            {isAuthenticated && (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-8 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-[#64748B]">Accesos directos:</span>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2 rounded-xl bg-[#0038DF] text-white text-xs font-bold hover:bg-[#002299] transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Mi Aula Virtual
                </button>
                {canAccessTeacher(role) && (
                  <Link
                    href="/teacher"
                    className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0038DF] text-[#0038DF] text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Panel Docente
                  </Link>
                )}
                {canAccessAdmin(role) && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#1E293B] text-[#1E293B] text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#0038DF]" /> Panel Superusuario
                  </Link>
                )}
              </div>
            )}

            {/* Estadísticas de prestigio */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E2E8F0]">
              {STATS.map(({ value, label, color }) => (
                <div key={label} className="p-2">
                  <div className={`text-2xl sm:text-3xl font-extrabold ${color} tracking-tight`}>
                    {value}
                  </div>
                  <div className="text-xs font-semibold text-[#64748B] mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </div>

        {/* ========================================================
            LÍNEA VERTICAL DORADA DE 4PX DE SEPARACIÓN
            ======================================================== */}
        <div className="w-full h-1 lg:w-1 lg:h-auto bg-gradient-to-r lg:bg-gradient-to-b from-[#9C7316] via-[#E6C565] to-[#8F6812] shrink-0" />

        {/* ========================================================
            COLUMNA DERECHA (30%): Bloque Azul Rey con Aros Dorados
            ======================================================== */}
        <div className="w-full lg:w-[32%] xl:w-[30%] bg-royal-depth p-8 lg:p-12 relative overflow-hidden flex flex-col justify-between text-white shrink-0 min-h-[380px] lg:min-h-full">
          
          {/* Aros geométricos dorados grandes con suave flotación continua */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none float"
            style={{ border: '12px solid #C99E32', opacity: 0.95 }}
          />
          <div
            className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full pointer-events-none float-slow"
            style={{ border: '12px solid #C99E32', opacity: 0.9 }}
          />

          {/* Contenido destacado de la columna azul */}
          <div className="relative z-10 space-y-4">
            <span className="eyebrow-blue block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E6C565] animate-sparkle" />
              ESTRUCTURA OFICIAL
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              140 Horas Certificables
            </h3>
            <p className="text-sm text-white/85 leading-relaxed">
              Basado en las directrices de la CNSC y el Decreto Ley 1278. 3 núcleos fundamentales para tu éxito:
            </p>
          </div>

          {/* Tarjeta contenedora blanca con borde dorado de 2px y sombra profunda */}
          <div className="relative z-10 card-gold-on-blue p-6 my-6 text-[#1E293B]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-metallic flex items-center justify-center text-[#1A1A1A] font-extrabold shadow-sm">
                <Award className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#0038DF] uppercase tracking-wide">
                  Programa Insignia
                </h4>
                <p className="text-xs text-[#64748B]">Ingreso a la Carrera Docente</p>
              </div>
            </div>

            <ul className="space-y-2 text-xs font-semibold text-[#1E293B] mb-5">
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#0038DF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                </div>
                <span>Núcleo Común: Aptitudes y Pedagógico</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#0038DF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                </div>
                <span>Simulacros Oficiales con Casos CNSC</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#0038DF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                </div>
                <span>Componente Disciplinar Especializado</span>
              </li>
            </ul>

            <button
              onClick={() => onNavigate('courses')}
              className="w-full py-2.5 px-4 rounded-xl btn-royal-cta text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Ver Plan de Estudio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slogan en cursiva dorada */}
          <div className="relative z-10 pt-2 border-t border-white/15 text-center lg:text-left">
            <p className="text-xs italic text-[#E6C565] font-medium tracking-wide">
              «Aprende, comparte, deja huella»
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
