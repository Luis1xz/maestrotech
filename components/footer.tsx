'use client'

import { Sparkles, Globe, Link, MessageSquare, Rss } from 'lucide-react'

const LINKS = {
  Plataforma: ['Cursos', 'Simulador', 'Liderazgo', 'Comunidad', 'Blog'],
  Preparación: ['Concurso de Méritos', 'Ascenso Salarial', 'Traslados', 'Desarrollo Continuo'],
  Empresa: ['Sobre Maestro', 'Equipo', 'Carreras', 'Prensa', 'Contacto'],
  Soporte: ['Centro de ayuda', 'Documentación', 'Estado del sistema', 'Privacidad', 'Términos'],
}

interface FooterProps {
  onNavigate: (v: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#E5EDF5] bg-white text-[#142D49]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 mb-4 group text-left">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#E5EDF5] shadow-xs group-hover:scale-105 transition-all duration-300 shrink-0 bg-white p-0.5">
                <img src="/logo-icon.png" alt="Legado Docente Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-bold font-display text-base text-[#0045E6] block leading-none">
                  LEGADO DOCENTE
                </span>
                <span className="text-[10px] text-[#536B83] italic tracking-tight">
                  «Aprende, comparte, deja huella»
                </span>
              </div>
            </button>
            <p className="text-sm text-[#536B83] leading-relaxed mb-4">
              La plataforma de preparación integral para el concurso docente y ascenso escalafonario en Colombia.
            </p>
            <div className="mb-5 flex flex-col gap-1.5">
              <a
                href="/legado-icon.png"
                download="legado-docente-icono.png"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5A83B] hover:text-[#C89228] transition-colors"
                title="Descargar isotipo circular oficial en alta resolución"
              >
                <span>Descargar Isotipo Circular (HD)</span>
                <span className="text-[10px] bg-[#E5A83B]/10 px-1.5 py-0.5 rounded-full font-mono text-[#E5A83B]">PNG</span>
              </a>
              <a
                href="/legado-logo-full.png"
                download="legado-docente-logo-completo.png"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#536B83] hover:text-[#0045E6] transition-colors"
                title="Descargar logotipo completo oficial"
              >
                <span>Logo Oficial Completo</span>
                <span className="text-[10px] bg-[#F3F8FD] px-1.5 py-0.5 rounded-full font-mono text-[#536B83] border border-[#E5EDF5]">PNG</span>
              </a>
            </div>
            <div className="flex gap-2.5">
              {[Globe, Link, MessageSquare, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-[#F3F8FD] border border-[#E5EDF5] flex items-center justify-center text-[#536B83] hover:text-[#176FC1] hover:border-[#176FC1]/40 transition-all shadow-2xs"
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
              <p className="text-xs font-bold text-[#142D49] uppercase tracking-widest mb-4">{cat}</p>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const href = link === 'Privacidad' ? '/privacy' : link === 'Términos' ? '/terms' : '#'
                  return (
                    <li key={link}>
                      <a href={href} className="text-sm text-[#536B83] hover:text-[#176FC1] transition-colors font-medium">
                        {link}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[#E5EDF5]">
          <p className="text-xs text-[#536B83]">
            © 2026 Maestro Technologies SAS. Bogotá, Colombia. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#536B83]">
            Construido con dedicación para los docentes de Colombia 🇨🇴
          </p>
        </div>
      </div>
    </footer>
  )
}
