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
    description: 'Empieza tu caracterización y diagnóstico sin costo.',
    features: [
      'Diagnóstico inteligente (5 etapas)',
      'Módulo 0: Inducción concurso docente',
      '5 simulacros de prueba al mes',
      'Asistente IA (5 consultas/día)',
      'Ruta de aprendizaje recomendada',
    ],
    cta: 'Comenzar gratis',
    iconBg: 'bg-[#F3F8FD] text-[#536B83]',
    popular: false,
    badge: null,
  },
  {
    name: 'Docente Pro',
    price: { monthly: 49900, annual: 39900 },
    description: 'La opción más elegida por aspirantes y docentes activos.',
    features: [
      'Curso Completo de 140 Horas (13 módulos)',
      'Simulacros ilimitados de examen CNSC',
      'Aptitudes básicas, pedagógicas y disciplinares',
      'Asistente IA sin límites',
      'Analíticas profundas y radar de competencias',
      'Comunidad Legado Docente',
      'Certificados verificables de 140 horas',
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
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="mb-4">
            <span className="eyebrow-white-pill shadow-xs">
              <Sparkles className="w-4 h-4 text-[#C99E32]" />
              Inversión en tu Futuro y Nombramiento
            </span>
          </div>
          <h1 className="title-h1 text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0038DF] mb-3">
            Planes de Formación Docente
          </h1>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-base sm:text-lg text-[#1E293B] max-w-2xl mx-auto mb-8 leading-relaxed">
            Prepárate con rigor metodológico, 140 horas de formación oficial y simulacros situacionales ilimitados tipo CNSC.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !annual ? 'bg-[#0038DF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0038DF]'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                annual ? 'bg-[#0038DF] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0038DF]'
              }`}
            >
              Anual
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gold-metallic text-[#1A1A1A]">
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
              className={`relative flex flex-col p-8 rounded-2xl bg-white transition-all duration-300 ${
                popular
                  ? 'border-2 border-[#C99E32] shadow-xl'
                  : 'border border-[#E2E8F0] hover:border-[#C99E32] shadow-sm'
              }`}
            >
              {/* Popular badge */}
              {badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                  popular ? 'bg-gold-metallic text-[#1A1A1A]' : 'bg-[#0038DF] text-white'
                }`}>
                  {badge}
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${
                popular ? 'bg-gold-metallic text-[#1A1A1A]' : 'bg-[#F1F5F9] text-[#0038DF]'
              } flex items-center justify-center mb-5 shadow-xs`}>
                {i === 0 ? <Zap className="w-6 h-6" /> :
                 i === 1 ? <Star className="w-6 h-6" fill="currentColor" /> :
                 <Shield className="w-6 h-6" />}
              </div>

              <h3 className="title-h1 text-2xl font-extrabold text-[#0038DF] mb-1">{name}</h3>
              <p className="text-sm text-[#1E293B]/80 mb-5">{description}</p>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="title-h1 text-4xl font-extrabold text-[#0038DF]">
                    {format(annual ? price.annual : price.monthly)}
                  </span>
                  {price.monthly !== null && price.monthly > 0 && (
                    <span className="text-[#64748B] text-sm mb-1 font-bold">/mes</span>
                  )}
                </div>
                {annual && price.monthly !== null && price.monthly > 0 && (
                  <p className="text-xs text-[#9C7316] mt-1 font-bold">
                    Facturado anualmente · Ahorra ${((price.monthly - price.annual!) * 12 / 1000).toFixed(0)}K COP
                  </p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8 pt-4 border-t border-[#E2E8F0]">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#1E293B] font-medium">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${popular ? 'text-[#C99E32]' : 'text-[#0038DF]'}`} strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(name)}
                className={`w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  popular
                    ? 'btn-gold-cta btn-gold-pill'
                    : 'rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#C99E32] text-[#0038DF]'
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
          <p className="text-sm font-semibold text-[#64748B] mb-6">
            Elegido por docentes y directivos de secretarías de educación en todo el país
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Manizales', 'Pereira', 'Cartagena', 'Cúcuta'].map((city) => (
              <span key={city} className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E293B] shadow-2xs">
                {city}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
