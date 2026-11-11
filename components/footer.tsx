'use client'

import { Sparkles, Globe, Link, MessageSquare, Rss } from 'lucide-react'

const LINKS = {
  Plataforma: ['Cursos', 'Simulador', 'Liderazgo', 'Comunidad', 'Blog'],
  Preparación: ['Concurso de Méritos', 'Ascenso Salarial', 'Traslados', 'Desarrollo Continuo'],
  Empresa: ['Sobre Legado Docente', 'Equipo', 'Carreras', 'Prensa', 'Contacto'],
  Soporte: ['Centro de ayuda', 'Documentación', 'Estado del sistema', 'Privacidad', 'Términos'],
}

interface FooterProps {
  onNavigate: (v: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white text-[#1E293B]">
      {/* Línea sutil dorada superior */}
      <div className="w-full h-1 bg-gradient-to-r from-[#9C7316] via-[#E6C565] to-[#8F6812]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 mb-4 group text-left cursor-pointer">
              <div className="w-9 h-9 shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img src="/logo-icon.png" alt="Legado Docente Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-extrabold font-display text-base text-[#0038DF] block leading-none">
                  LEGADO DOCENTE
                </span>
                <span className="text-[10px] text-[#9C7316] italic tracking-tight font-medium mt-0.5 block">
                  «Aprende, comparte, deja huella»
                </span>
              </div>
            </button>
            <p className="text-sm text-[#1E293B]/80 leading-relaxed mb-4">
              La plataforma institucional de preparación integral para el concurso docente y ascenso escalafonario en Colombia.
            </p>
            <div className="mb-5 flex flex-col gap-1.5">
              <a
                href="/legado-icon.png"
                download="legado-docente-icono.png"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9C7316] hover:text-[#C99E32] transition-colors"
                title="Descargar isotipo circular oficial en alta resolución"
              >
                <span>Descargar Isotipo Circular (HD)</span>
                <span className="text-[10px] bg-gold-metallic text-[#1A1A1A] px-1.5 py-0.5 rounded-full font-mono font-bold">PNG</span>
              </a>
              <a
                href="/legado-logo-full.png"
                download="legado-docente-logo-completo.png"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0038DF] hover:text-[#002299] transition-colors"
                title="Descargar logotipo completo oficial"
              >
                <span>Logo Oficial Completo</span>
                <span className="text-[10px] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full font-mono text-[#0038DF] border border-[#E2E8F0]">PNG</span>
              </a>
            </div>
            <div className="flex gap-2.5">
              {[Globe, Link, MessageSquare, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0038DF] hover:border-[#C99E32] transition-all shadow-2xs"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([cat, links]) => (
            <div key={cat}>
              <p className="text-xs font-extrabold text-[#0038DF] uppercase tracking-widest mb-4">{cat}</p>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const href = link === 'Privacidad' ? '/privacy' : link === 'Términos' ? '/terms' : '#'
                  return (
                    <li key={link}>
                      <a href={href} className="text-sm text-[#1E293B]/80 hover:text-[#0038DF] transition-colors font-medium">
                        {link}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[#E2E8F0]">
          <p className="text-xs text-[#64748B]">
            © 2026 Legado Docente SAS. Bogotá, Colombia. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#64748B]">
            Construido con prestigio y método para los docentes de Colombia 🇨🇴
          </p>
        </div>
      </div>
    </footer>
  )
}
