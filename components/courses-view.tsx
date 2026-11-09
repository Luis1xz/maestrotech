'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Award, Star, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { useCourses } from '@/hooks/use-courses'
import { Course } from '@/types/database'
import { getThumbnailUrl } from '@/lib/supabase/storage'

interface CoursesViewProps {
  onSelectCourse: (slug: string) => void
  onNavigate: (view: string) => void
}

const CATEGORIES = ['Todos', 'Concurso Docente', 'Aptitudes Básicas', 'Pedagogía', 'Simulacros']

export default function CoursesView({ onSelectCourse, onNavigate }: CoursesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const { courses, loading, error, isDemo, refetch } = useCourses({
    category: selectedCategory === 'Todos' ? undefined : selectedCategory,
  })

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mb-4">
            <span className="eyebrow-white-pill shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C99E32]" />
              Catálogo Oficial de Formación Docente
            </span>
          </div>
          <h1 className="title-h1 text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0038DF] mb-3">
            Programa Integral de 140 Horas
          </h1>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-[#1E293B] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Legado Docente «Aprende, comparte, deja huella» — Formación rigurosa estructurada en Aptitudes Básicas, Conocimientos Pedagógicos y Componente Disciplinar conforme al Decreto 1278 y la CNSC.
          </p>

          {isDemo && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6C565]/15 border border-[#C99E32] text-[#9C7316] text-xs font-bold">
              <span>Modo Demostración</span>
              <span className="text-[#1E293B]">— Conecta Supabase en .env.local para ver datos reales</span>
            </div>
          )}
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0038DF] text-white shadow-sm'
                  : 'bg-white border border-[#E2E8F0] text-[#1E293B] hover:text-[#0038DF] hover:border-[#C99E32]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-white border border-[#E5EDF5] shadow-xs animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="w-full h-40 bg-[#F3F8FD] rounded-2xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#F3F8FD] rounded w-3/4" />
                  <div className="h-3 bg-[#F3F8FD] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center p-8 rounded-3xl bg-white border border-rose-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-[#142D49] mb-2">
              No pudimos cargar los cursos
            </h3>
            <p className="text-xs text-[#536B83] mb-6 leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="max-w-md mx-auto text-center p-12 rounded-3xl bg-white border border-[#E5EDF5] shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#F3F8FD] flex items-center justify-center mx-auto mb-4 text-[#176FC1]">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-display font-semibold text-lg text-[#142D49] mb-2">
              No hay cursos disponibles todavía
            </h3>
            <p className="text-xs text-[#536B83] mb-6 leading-relaxed">
              Actualmente no se han publicado cursos en esta categoría. Puedes consultar los simulacros o volver más tarde.
            </p>
            <button
              onClick={() => onNavigate('exam')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Ir al Simulador de Examen
            </button>
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && courses.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: Course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => onSelectCourse(course.slug)}
                className="group p-6 rounded-2xl bg-white border-2 border-[#C99E32] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-5 bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
                    <img
                      src={getThumbnailUrl(course.thumbnail_url)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {course.category && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-[#0038DF] text-white">
                          {course.category}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-metallic text-[#1A1A1A] shadow-xs">
                        140 Horas Certificables
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="title-h1 text-xl font-extrabold text-[#0038DF] mb-2 group-hover:text-[#002299] transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#1E293B]/80 leading-relaxed mb-4 line-clamp-3">
                    {course.short_description || course.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-4 border-t border-[#E2E8F0]">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-4">
                    {course.instructor_name && (
                      <span className="truncate max-w-[180px] font-bold text-[#1E293B]">
                        {course.instructor_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-bold text-[#9C7316]">
                      <Clock className="w-3.5 h-3.5 text-[#C99E32]" />
                      140 Horas
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="title-h1 text-base font-extrabold text-[#0038DF]">
                      {course.price === 0
                        ? 'Matrícula Abierta'
                        : `$${Number(course.price).toLocaleString('es-CO')} COP`}
                    </span>
                    <span className="btn-gold-cta btn-gold-pill px-4 py-1.5 text-xs font-bold text-[#1A1A1A] inline-flex items-center gap-1">
                      Ver contenido <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
