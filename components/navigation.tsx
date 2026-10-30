'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, User, LogOut, LayoutDashboard, ChevronDown, Shield, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { getAvatarUrl } from '@/lib/supabase/storage'
import { canAccessAdmin, canAccessTeacher } from '@/types/database'

interface NavProps {
  onNavigate: (view: string) => void
  currentView: string
  onOpenAuth?: (mode?: 'signin' | 'signup') => void
}

const navLinks = [
  { label: 'Inicio', view: 'home' },
  { label: 'Cursos', view: 'courses' },
  { label: 'Simulador', view: 'exam' },
  { label: 'Precios', view: 'pricing' },
]

export default function Navigation({ onNavigate, currentView, onOpenAuth }: NavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { user, profile, isAuthenticated, role, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isDashboard = ['dashboard', 'exam', 'learning'].includes(currentView)

  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Docente')
  const userInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'MT'
  const userAvatar = getAvatarUrl(profile?.avatar_url)

  // Enlaces de navegación adaptados estrictamente por rol
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Inicio', view: 'home' },
        { label: 'Cursos', view: 'courses' },
        { label: 'Simulador', view: 'exam' },
        { label: 'Precios', view: 'pricing' },
      ]
    }

    if (role === 'admin') {
      return [
        { label: 'Inicio', view: 'home' },
        { label: 'Mi Dashboard', view: 'dashboard' },
        { label: 'Cursos', view: 'courses' },
        { label: 'Simulador', view: 'exam' },
      ]
    }

    if (role === 'instructor') {
      return [
        { label: 'Inicio', view: 'home' },
        { label: 'Mi Dashboard', view: 'dashboard' },
        { label: 'Cursos', view: 'courses' },
        { label: 'Simulador', view: 'exam' },
      ]
    }

    // student
    return [
      { label: 'Inicio', view: 'home' },
      { label: 'Mi Dashboard', view: 'dashboard' },
      { label: 'Cursos', view: 'courses' },
      { label: 'Simulador', view: 'exam' },
      { label: 'Precios', view: 'pricing' },
    ]
  }

  const activeNavLinks = getNavLinks()

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || isDashboard
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E5EDF5] shadow-[0_2px_12px_rgba(20,45,73,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#E5EDF5] shadow-sm group-hover:scale-105 group-hover:ring-[#176FC1]/50 transition-all duration-300 shrink-0 bg-white p-0.5">
              <img src="/logo.png" alt="Maestro Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#142D49] font-display">
              MaestroTech
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {activeNavLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 btn-magnetic ${
                  currentView === link.view
                    ? 'text-[#176FC1] font-semibold'
                    : 'text-[#536B83] hover:text-[#142D49] hover:bg-[#F3F8FD]'
                }`}
              >
                {currentView === link.view && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-[#F3F8FD] border border-[#E5EDF5] rounded-xl shadow-xs"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            ))}

            {/* Accesos rápidos de rol para Docentes y Superusuarios */}
            {canAccessAdmin(role) && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142D49]/10 hover:bg-[#142D49]/15 text-[#142D49] border border-[#142D49]/20 text-xs font-semibold transition-colors ml-1"
              >
                <Shield className="w-3.5 h-3.5 text-[#176FC1]" />
                <span>Superusuario</span>
              </Link>
            )}

            {canAccessTeacher(role) && (
              <Link
                href="/teacher"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#176FC1]/10 hover:bg-[#176FC1]/15 text-[#176FC1] border border-[#176FC1]/20 text-xs font-semibold transition-colors ml-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Panel Docente</span>
              </Link>
            )}
          </div>

          {/* CTA / Auth Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white border border-[#E5EDF5] hover:border-[#176FC1]/50 shadow-xs transition-colors"
                >
                  <span className="text-xs font-semibold text-[#142D49] max-w-[120px] truncate">
                    {displayName}
                  </span>
                  {role && (
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        role === 'admin'
                          ? 'bg-[#142D49]/10 text-[#142D49] border border-[#142D49]/20'
                          : role === 'instructor'
                          ? 'bg-[#176FC1]/10 text-[#176FC1] border border-[#176FC1]/20'
                          : 'bg-[#39BDEB]/15 text-[#142D49] border border-[#39BDEB]/30'
                      }`}
                    >
                      {role === 'admin' ? 'Superusuario' : role === 'instructor' ? 'Docente' : 'Estudiante'}
                    </span>
                  )}
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={displayName}
                      className="w-7 h-7 rounded-xl object-cover border border-[#E5EDF5]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-[#176FC1] text-white flex items-center justify-center text-[10px] font-bold">
                      {userInitials}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-[#536B83]" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E5EDF5] shadow-xl p-2 z-50 text-xs"
                    >
                      {canAccessAdmin(role) && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#F3F8FD] text-[#142D49] transition-colors font-semibold"
                        >
                          <Shield className="w-4 h-4 text-[#176FC1]" />
                          Panel Superusuario
                        </Link>
                      )}
                      {canAccessTeacher(role) && (
                        <Link
                          href="/teacher"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#F3F8FD] text-[#176FC1] transition-colors font-semibold"
                        >
                          <BookOpen className="w-4 h-4" />
                          Panel Docente
                        </Link>
                      )}
                      {(canAccessAdmin(role) || canAccessTeacher(role)) && (
                        <div className="my-1 border-t border-[#E5EDF5]" />
                      )}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          onNavigate('dashboard')
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#F3F8FD] text-[#142D49] transition-colors font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#176FC1]" />
                        Mi Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          onNavigate('courses')
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#F3F8FD] text-[#142D49] transition-colors font-medium"
                      >
                        <Sparkles className="w-4 h-4 text-[#39BDEB]" />
                        Catálogo de Cursos
                      </button>
                      <div className="my-1 border-t border-[#E5EDF5]" />
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false)
                          await signOut()
                          onNavigate('home')
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-rose-500 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth?.('signin')}
                  className="text-sm font-medium text-[#536B83] hover:text-[#142D49] transition-colors duration-200 btn-magnetic px-3 py-2"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => onOpenAuth?.('signup')}
                  className="px-4.5 py-2 rounded-xl bg-[#176FC1] hover:bg-[#142D49] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-300 btn-magnetic"
                >
                  Comenzar gratis
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[#142D49] hover:bg-[#F3F8FD] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-[#E5EDF5] shadow-lg md:hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {activeNavLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => {
                    onNavigate(link.view)
                    setMobileOpen(false)
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                    currentView === link.view
                      ? 'bg-[#F3F8FD] text-[#176FC1] font-semibold'
                      : 'text-[#142D49] hover:bg-[#F3F8FD]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-[#E5EDF5] mt-2 pt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {canAccessAdmin(role) && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-[#142D49]/10 text-[#142D49] text-xs font-semibold text-center flex items-center justify-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-[#176FC1]" /> Panel Superusuario
                      </Link>
                    )}
                    {canAccessTeacher(role) && (
                      <Link
                        href="/teacher"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-[#176FC1]/10 text-[#176FC1] text-xs font-semibold text-center flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" /> Panel Docente
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        onNavigate('dashboard')
                        setMobileOpen(false)
                      }}
                      className="px-4 py-3 rounded-xl bg-[#176FC1] text-white text-sm font-semibold text-center"
                    >
                      Ir a mi Dashboard
                    </button>
                    <button
                      onClick={async () => {
                        await signOut()
                        setMobileOpen(false)
                        onNavigate('home')
                      }}
                      className="px-4 py-2 text-rose-500 text-xs font-semibold text-center"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onOpenAuth?.('signin')
                        setMobileOpen(false)
                      }}
                      className="px-4 py-3 rounded-xl text-sm font-medium text-[#142D49] hover:bg-[#F3F8FD] transition-colors text-center"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth?.('signup')
                        setMobileOpen(false)
                      }}
                      className="px-4 py-3 rounded-xl bg-[#176FC1] text-white text-sm font-semibold text-center"
                    >
                      Comenzar gratis
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
