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
    <div className="min-h-screen bg-background aurora-bg py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Catálogo de Formación Docente
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mb-4">
            Cursos diseñados para <br />
            <span className="gradient-text">transformar tu carrera</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Alineados con el marco del Ministerio de Educación Nacional, el Decreto 1278 y las pruebas de ascenso y méritos.
          </p>

          {isDemo && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
              <span>Modo Demostración</span>
              <span className="text-amber-500/60">— Conecta Supabase en .env.local para ver datos reales</span>
            </div>
          )}
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'glass border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
                className="h-80 rounded-3xl glass border border-border/50 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="w-full h-40 bg-muted/60 rounded-2xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted/60 rounded w-3/4" />
                  <div className="h-3 bg-muted/40 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center p-8 rounded-3xl glass border border-rose-500/30 bg-rose-500/5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              No pudimos cargar los cursos
            </h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="max-w-md mx-auto text-center p-12 rounded-3xl glass border border-border/60">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              No hay cursos disponibles todavía
            </h3>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Actualmente no se han publicado cursos en esta categoría. Puedes consultar los simulacros o volver más tarde.
            </p>
            <button
              onClick={() => onNavigate('exam')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md"
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
                className="group p-6 rounded-3xl glass border border-border/60 hover:border-primary/30 transition-all duration-300 card-lift cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-blue-900/30 to-violet-900/30 border border-border/40 flex items-center justify-center">
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
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
                          {course.category}
                        </span>
                      )}
                      {course.level && (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30">
                          {course.level}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {course.short_description || course.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    {course.instructor_name && (
                      <span className="truncate max-w-[150px] font-medium text-foreground">
                        {course.instructor_name}
                      </span>
                    )}
                    {course.duration_hours ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration_hours}h estimadas
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-foreground">
                      {course.price === 0
                        ? 'Gratis'
                        : `$${Number(course.price).toLocaleString('es-CO')} COP`}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
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
