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
    <footer className="border-t border-border/60 bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-border/60 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 bg-black">
                <img src="/logo.png" alt="Maestro Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold font-display text-foreground">MaestroTech</span>
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              La plataforma más avanzada para el desarrollo profesional docente en Colombia.
            </p>
            <div className="mb-5 flex flex-col gap-1.5">
              <a
                href="/logo.png"
                download="maestro-icono.png"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
                title="Descargar isotipo oficial en alta resolución"
              >
                <span>Descargar Isotipo (HD)</span>
                <span className="text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded-full font-mono text-amber-500">PNG</span>
              </a>
              <a
                href="/logo-horizontal.png"
                download="maestro-logo-horizontal.png"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                title="Descargar logotipo horizontal completo"
              >
                <span>Logo Horizontal Completo</span>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-mono text-muted-foreground">PNG</span>
              </a>
            </div>
            <div className="flex gap-3">
              {[Globe, Link, MessageSquare, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl glass border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
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
              <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">{cat}</p>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const href = link === 'Privacidad' ? '/privacy' : link === 'Términos' ? '/terms' : '#'
                  return (
                    <li key={link}>
                      <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            © 2025 Maestro Technologies SAS. Bogotá, Colombia. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Construido con amor para los 330,000 docentes de Colombia 🇨🇴
          </p>
        </div>
      </div>
    </footer>
  )
}
