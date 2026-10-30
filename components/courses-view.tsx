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

const CATEGORIES = ['Todos', 'Pedagogía', 'Legislación', 'Evaluación', 'Directivos']

export default function CoursesView({ onSelectCourse, onNavigate }: CoursesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const { courses, loading, error, isDemo, refetch } = useCourses({
    category: selectedCategory === 'Todos' ? undefined : selectedCategory,
  })

  return (
    <div className="min-h-screen bg-[#F3F8FD] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#176FC1]/10 border border-[#176FC1]/20 text-[#176FC1] text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-[#39BDEB]" />
            Catálogo de Formación Docente
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#142D49] mb-4">
            Cursos diseñados para <br />
            <span className="bg-gradient-to-r from-[#176FC1] via-[#39BDEB] to-[#176FC1] bg-clip-text text-transparent">transformar tu carrera</span>
          </h1>
          <p className="text-[#536B83] text-base sm:text-lg max-w-2xl mx-auto">
            Alineados con el marco del Ministerio de Educación Nacional, el Decreto 1278 y las pruebas de ascenso y méritos.
          </p>

          {isDemo && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E9A83A]/10 border border-[#E9A83A]/30 text-[#E9A83A] text-xs font-medium">
              <span>Modo Demostración</span>
              <span className="text-[#536B83]">— Conecta Supabase en .env.local para ver datos reales</span>
            </div>
          )}
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#176FC1] text-white shadow-sm'
                  : 'bg-white border border-[#E5EDF5] text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD] hover:border-[#176FC1]/30'
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
                className="group p-6 rounded-3xl bg-white border border-[#E5EDF5] hover:border-[#176FC1]/50 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-[#F3F8FD] border border-[#E5EDF5] flex items-center justify-center">
                    <img
                      src={getThumbnailUrl(course.thumbnail_url)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // fallback visual gracefully if image fails
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {course.category && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-[#142D49]/90 backdrop-blur-md text-white border border-[#142D49]">
                          {course.category}
                        </span>
                      )}
                      {course.level && (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#39BDEB]/15 backdrop-blur-md text-[#176FC1] border border-[#39BDEB]/30">
                          {course.level}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display font-bold text-lg text-[#142D49] mb-2 group-hover:text-[#176FC1] transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#536B83] leading-relaxed mb-4 line-clamp-2">
                    {course.short_description || course.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-4 border-t border-[#E5EDF5]">
                  <div className="flex items-center justify-between text-xs text-[#536B83] mb-4">
                    {course.instructor_name && (
                      <span className="truncate max-w-[150px] font-medium text-[#142D49]">
                        {course.instructor_name}
                      </span>
                    )}
                    {course.duration_hours ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#39BDEB]" />
                        {course.duration_hours}h estimadas
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-[#142D49]">
                      {course.price === 0
                        ? 'Gratis'
                        : `$${Number(course.price).toLocaleString('es-CO')} COP`}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#176FC1] group-hover:text-[#142D49] group-hover:translate-x-1 transition-all">
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
