'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Shield, Star, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { PAYMENT_CONFIG } from '@/services/payments'

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
    iconBg: 'bg-[#F3F8FD] text-[#536B83]',
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
    cta: 'Pagar',
    iconBg: 'bg-[#176FC1] text-white',
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
    iconBg: 'bg-[#142D49] text-white',
    popular: false,
    badge: 'Colegios',
  },
]

interface PricingProps {
  onNavigate: (v: string) => void
}

export default function PricingView({ onNavigate }: PricingProps) {
  const { user, profile } = useAuth()
  const [annual, setAnnual] = useState(true)

  const format = (n: number | null) => {
    if (n === null) return 'A medida'
    if (n === 0) return 'Gratis'
    return `$${(n / 1000).toFixed(0)}K`
  }

  const handlePlanClick = (planName: string) => {
    if (planName === 'Docente Pro') {
      const paymentUrl = 'https://checkout.nequi.wompi.co/l/4X0ger'
      window.open(paymentUrl, '_blank')
    } else if (planName === 'Institucional') {
      window.open(
        'https://wa.me/573108924512?text=Hola,%20deseo%20información%20sobre%20el%20Plan%20Institucional%20para%20colegios',
        '_blank'
      )
    } else {
      onNavigate('dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F8FD] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5EDF5] text-[#176FC1] text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#39BDEB]" />
            Inversión en tu futuro profesional
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl text-[#142D49] mb-4">
            Impulsa tu
            <br />
            <span className="gradient-text">carrera docente</span>
          </h1>
          <p className="text-base sm:text-lg text-[#536B83] max-w-2xl mx-auto mb-8">
            Prepárate con rigor metodológico, simulacros ilimitados y acompañamiento pedagógico permanente.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E5EDF5] shadow-xs">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                !annual ? 'bg-[#176FC1] text-white shadow-xs' : 'text-[#536B83] hover:text-[#142D49]'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                annual ? 'bg-[#176FC1] text-white shadow-xs' : 'text-[#536B83] hover:text-[#142D49]'
              }`}
            >
              Anual
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                annual ? 'bg-white/20 text-white' : 'bg-[#E9A83A]/15 text-[#E9A83A]'
              }`}>
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(({ name, price, description, features, cta, iconBg, popular, badge }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl bg-white border transition-all duration-300 card-lift ${
                popular
                  ? 'border-2 border-[#176FC1] shadow-xl'
                  : 'border-[#E5EDF5] shadow-xs'
              }`}
            >
              {/* Popular badge */}
              {badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold shadow-xs ${
                  popular ? 'bg-[#E9A83A]' : 'bg-[#142D49]'
                }`}>
                  {badge}
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-5 shadow-xs`}>
                {i === 0 ? <Zap className="w-6 h-6" /> :
                 i === 1 ? <Star className="w-6 h-6" fill="currentColor" /> :
                 <Shield className="w-6 h-6" />}
              </div>

              <h3 className="font-display font-bold text-xl text-[#142D49] mb-1">{name}</h3>
              <p className="text-sm text-[#536B83] mb-5">{description}</p>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="font-display font-bold text-4xl text-[#142D49]">
                    {format(annual ? price.annual : price.monthly)}
                  </span>
                  {price.monthly !== null && price.monthly > 0 && (
                    <span className="text-[#536B83] text-sm mb-1">/mes</span>
                  )}
                </div>
                {annual && price.monthly !== null && price.monthly > 0 && (
                  <p className="text-xs text-[#536B83] mt-1 font-medium">
                    Facturado anualmente · Ahorra ${((price.monthly - price.annual!) * 12 / 1000).toFixed(0)}K COP
                  </p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8 pt-4 border-t border-[#E5EDF5]">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#142D49]">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${popular ? 'text-[#176FC1]' : 'text-[#39BDEB]'}`} strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(name)}
                className={`group w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 btn-magnetic flex items-center justify-center gap-2 ${
                  popular
                    ? 'bg-[#176FC1] hover:bg-[#142D49] text-white shadow-md hover:shadow-lg'
                    : 'bg-[#F3F8FD] hover:bg-[#E5EDF5] border border-[#E5EDF5] text-[#142D49]'
                }`}
              >
                <span>{cta}</span>
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
          <p className="text-sm font-semibold text-[#536B83] mb-6">
            Elegido por docentes y directivos de secretarías de educación en todo el país
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Manizales', 'Pereira', 'Cartagena', 'Cúcuta'].map((city) => (
              <span key={city} className="px-4 py-2 rounded-xl bg-white border border-[#E5EDF5] text-xs font-semibold text-[#142D49] shadow-2xs">
                {city}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
