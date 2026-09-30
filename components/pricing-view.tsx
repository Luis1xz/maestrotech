'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Shield, Star, ArrowRight, Sparkles } from 'lucide-react'

const PLANS = [
  {
    name: 'Explorador',
    price: { monthly: 0, annual: 0 },
    description: 'Empieza tu preparación sin costo.',
    features: [
      '5 simulacros por mes',
      'Acceso a 2 cursos gratuitos',
      'Asistente IA (5 consultas/día)',
      'Comunidad básica',
      'Resultados básicos',
    ],
    cta: 'Comenzar gratis',
    gradient: 'from-slate-500 to-slate-700',
    popular: false,
    badge: null,
  },
  {
    name: 'Docente Pro',
    price: { monthly: 49900, annual: 39900 },
    description: 'La opción más elegida por docentes activos.',
    features: [
      'Simulacros ilimitados',
      'Todos los cursos del catálogo',
      'Asistente IA sin límites',
      'Analíticas profundas',
      'Radar de competencias',
      'Comunidad Premium',
      'Certificados verificables',
      'Soporte prioritario',
    ],
    cta: 'Comenzar con Pro',
    gradient: 'from-blue-600 to-violet-600',
    popular: true,
    badge: 'Más popular',
  },
  {
    name: 'Institucional',
    price: { monthly: null, annual: null },
    description: 'Para colegios y secretarías de educación.',
    features: [
      'Todo lo de Docente Pro',
      'Dashboard institucional',
      'Licencias para todo el equipo',
      'Reportes ejecutivos',
      'Integración con SIE',
      'Onboarding dedicado',
      'Gerente de cuenta',
      'SLA garantizado',
    ],
    cta: 'Hablar con ventas',
    gradient: 'from-emerald-600 to-cyan-600',
    popular: false,
    badge: 'Empresas',
  },
]

interface PricingProps {
  onNavigate: (v: string) => void
}

export default function PricingView({ onNavigate }: PricingProps) {
  const [annual, setAnnual] = useState(true)

  const format = (n: number | null) => {
    if (n === null) return 'A medida'
    if (n === 0) return 'Gratis'
    return `$${(n / 1000).toFixed(0)}K`
  }

  return (
    <div className="min-h-screen bg-background aurora-bg py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Planes y precios
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl text-foreground mb-4">
            Invierte en tu
            <br />
            <span className="gradient-text">carrera docente</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Sin compromisos. Cancela cuando quieras. Garantía de 30 días.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-muted border border-border/60">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${!annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Anual
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(({ name, price, description, features, cta, gradient, popular, badge }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 card-lift ${
                popular
                  ? 'border-primary/40 glass shadow-2xl shadow-primary/10'
                  : 'glass border-border/60'
              }`}
            >
              {/* Popular badge */}
              {badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-bold shadow-lg`}>
                  {badge}
                </div>
              )}

              {/* Gradient stripe */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}>
                {i === 0 ? <Zap className="w-6 h-6 text-white" /> :
                 i === 1 ? <Star className="w-6 h-6 text-white" fill="white" /> :
                 <Shield className="w-6 h-6 text-white" />}
              </div>

              <h3 className="font-display font-bold text-xl text-foreground mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{description}</p>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="font-display font-bold text-4xl text-foreground">
                    {format(annual ? price.annual : price.monthly)}
                  </span>
                  {price.monthly !== null && price.monthly > 0 && (
                    <span className="text-muted-foreground text-sm mb-1">/mes</span>
                  )}
                </div>
                {annual && price.monthly !== null && price.monthly > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Facturado anualmente · Ahorra ${((price.monthly - price.annual!) * 12 / 1000).toFixed(0)}K COP
                  </p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${popular ? 'text-blue-500' : 'text-emerald-500'}`} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigate('dashboard')}
                className={`group w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 btn-magnetic flex items-center justify-center gap-2 ${
                  popular
                    ? `bg-gradient-to-r ${gradient} text-white shadow-xl shadow-primary/20 hover:shadow-primary/40`
                    : 'glass border border-border/60 hover:border-primary/30 text-foreground'
                }`}
              >
                {cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">
            Usado por docentes de todas las secretarías del país
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Manizales', 'Pereira'].map((city) => (
              <span key={city} className="px-4 py-2 rounded-xl glass border border-border/60 text-sm text-muted-foreground">
                {city}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
