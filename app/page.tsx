'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navigation from '@/components/navigation'
import HeroSection from '@/components/hero-section'
import { FeaturesSection, ExamPreviewSection, TestimonialsSection, PathsSection, CTASection } from '@/components/landing-sections'
import Footer from '@/components/footer'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import AuthModal from '@/components/auth-modal'
import { AlertCircle } from 'lucide-react'

import ParticleCanvas from '@/components/particle-canvas'

// Dynamic imports for view components
const Dashboard = dynamic(() => import('@/components/dashboard'))
const ExamSimulator = dynamic(() => import('@/components/exam-simulator'))
const LearningView = dynamic(() => import('@/components/learning-view'))
const PricingView = dynamic(() => import('@/components/pricing-view'))
const CoursesView = dynamic(() => import('@/components/courses-view'))

type View =
  | 'home'
  | 'dashboard'
  | 'exam'
  | 'learning'
  | 'courses'
  | 'pricing'
  | 'login'
  | 'teachers'
  | 'leadership'

function MainApp() {
  const [view, setView] = useState<View>('home')
  const [selectedCourseSlug, setSelectedCourseSlug] = useState('pedagogia-critica-y-constructivismo')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')
  const [pendingViewAfterAuth, setPendingViewAfterAuth] = useState<View | null>(null)
  const [authErrorBanner, setAuthErrorBanner] = useState<string | null>(null)

  const { user, profile, isAuthenticated, isDemo, role, isLoading } = useAuth()

  // Manejo de parámetros tras retorno de OAuth o errores
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const authError = params.get('auth_error') || params.get('error_description')
    const viewParam = params.get('view')
    const codeParam = params.get('code')

    if (authError) {
      setAuthErrorBanner(decodeURIComponent(authError))
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (viewParam === 'dashboard' || codeParam) {
      if (viewParam === 'dashboard') {
        setView('dashboard')
      }
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname)
      }, 800)
    }
  }, [])

  const openAuth = (mode: 'signin' | 'signup' = 'signin', nextView?: View) => {
    setAuthModalMode(mode)
    if (nextView) setPendingViewAfterAuth(nextView)
    setAuthModalOpen(true)
  }

  const navigate = (v: string) => {
    if (v === 'login') {
      openAuth('signin')
      return
    }

    // Proteger sección de Dashboard si no está autenticado (y no está en modo demo)
    if (v === 'dashboard' && !isAuthenticated && !isDemo) {
      openAuth('signin', 'dashboard')
      return
    }

    setView(v as View)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectCourse = (slug: string) => {
    setSelectedCourseSlug(slug)
    setView('learning')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAuthSuccess = () => {
    if (pendingViewAfterAuth) {
      setView(pendingViewAfterAuth)
      setPendingViewAfterAuth(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center aurora-bg">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-display font-bold text-foreground text-sm tracking-tight animate-pulse">
          Maestro
        </span>
      </div>
    )
  }

  // Dashboard view
  if (view === 'dashboard') {
    return (
      <div className="dark">
        <Dashboard
          onNavigate={navigate}
          onOpenAuth={() => openAuth('signin')}
          onSelectCourse={handleSelectCourse}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    )
  }

  // Exam simulator view
  if (view === 'exam') {
    return (
      <div className="dark">
        <ExamSimulator onNavigate={navigate} />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    )
  }

  // Learning / Course detail view
  if (view === 'learning') {
    return (
      <div className="dark">
        <LearningView
          courseSlug={selectedCourseSlug}
          onNavigate={navigate}
          onOpenAuth={() => openAuth('signin')}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    )
  }

  // Courses catalog view
  if (view === 'courses') {
    return (
      <>
        <ParticleCanvas />
        <Navigation onNavigate={navigate} currentView={view} onOpenAuth={openAuth} />
        <main className="pt-16">
          <CoursesView onSelectCourse={handleSelectCourse} onNavigate={navigate} />
        </main>
        <Footer onNavigate={navigate} />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    )
  }

  // Pricing view
  if (view === 'pricing') {
    return (
      <>
        <ParticleCanvas />
        <Navigation onNavigate={navigate} currentView={view} onOpenAuth={openAuth} />
        <main className="pt-16">
          <PricingView onNavigate={navigate} />
        </main>
        <Footer onNavigate={navigate} />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    )
  }

  // Home / Landing page
  return (
    <>
      <ParticleCanvas />
      {authErrorBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-2xl glass border border-amber-500/40 bg-card/95 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-xs text-amber-400">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{authErrorBanner}</span>
            </div>
            <button
              onClick={() => setAuthErrorBanner(null)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <Navigation onNavigate={navigate} currentView={view} onOpenAuth={openAuth} />
      <main>
        <HeroSection
          onNavigate={navigate}
          isAuthenticated={isAuthenticated}
          role={role}
          userName={profile?.full_name || user?.email?.split('@')[0]}
        />
        <FeaturesSection />
        <ExamPreviewSection onNavigate={navigate} />
        <PathsSection onNavigate={navigate} />
        <TestimonialsSection />
        {!isAuthenticated && <CTASection onNavigate={navigate} />}
      </main>
      <Footer onNavigate={navigate} />
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
