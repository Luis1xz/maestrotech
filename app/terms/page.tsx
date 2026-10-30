import Link from 'next/link'
import { ArrowLeft, BookOpen, AlertTriangle, ShieldCheck, Scale, FileText } from 'lucide-react'

export const metadata = {
  title: 'Condiciones del Servicio | MaestroTech',
  description: 'Términos y Condiciones de Uso de la plataforma educativa MaestroTech.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F3F8FD] text-[#142D49]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#E5EDF5] bg-white/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#E5EDF5] shadow-sm group-hover:scale-105 transition-all duration-300 shrink-0 bg-white">
              <img src="/logo.png" alt="Maestro Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#142D49] font-display">
              MaestroTech
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#536B83] hover:text-[#142D49] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-10 text-center sm:text-left border-b border-[#E5EDF5] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9A83A]/10 border border-[#E9A83A]/20 text-[#E9A83A] text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Términos Legales / Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#142D49] mb-3">
            Condiciones del Servicio de MaestroTech
          </h1>
          <p className="text-sm text-[#536B83]">
            Última actualización: <strong>Octubre 2026</strong> · Por favor lee estos términos detenidamente antes de utilizar la plataforma.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-[#536B83]">
          
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-sm">
            <h2 className="text-lg font-bold text-[#142D49] flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[#176FC1]" />
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder, registrarse o utilizar los servicios del sitio web <code className="text-xs bg-[#F3F8FD] px-1.5 py-0.5 rounded text-[#142D49] border border-[#E5EDF5]">https://maestrotech.vercel.app</code> (en adelante, &quot;MaestroTech&quot; o &quot;la Plataforma&quot;), usted acepta quedar legalmente vinculado por las presentes Condiciones del Servicio y por nuestra Política de Privacidad. Si no está de acuerdo con alguna parte de estos términos, debe abstenerse de utilizar el servicio.
            </p>
          </section>

          {/* Section 2 - Government Disclaimer (CRITICAL FOR LEGAL CLEARANCE) */}
          <section className="p-6 rounded-2xl bg-[#E9A83A]/10 border border-[#E9A83A]/30">
            <h2 className="text-lg font-bold text-[#142D49] flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#E9A83A]" />
              2. Descargo de Responsabilidad Gubernamental e Independencia
            </h2>
            <div className="space-y-3 text-[#142D49]">
              <p className="font-semibold text-[#E9A83A]">
                IMPORTANTE: MaestroTech es una entidad privada e independiente.
              </p>
              <p className="text-sm text-[#536B83]">
                Maestro Technologies SAS <strong>NO</strong> está afiliada, asociada, autorizada ni respaldada oficialmente por la <strong>Comisión Nacional del Servicio Civil (CNSC)</strong>, el <strong>Ministerio de Educación Nacional de Colombia (MEN)</strong>, el <strong>ICFES</strong> ni por ninguna otra entidad gubernamental.
              </p>
              <p className="text-sm text-[#536B83]">
                Los cursos, módulos y simuladores de exámenes ofrecidos en MaestroTech constituyen herramientas pedagógicas y formativas de estudio autónomo. Los puntajes y simulacros son ejercicios estimativos de preparación y <strong>no garantizan</strong> la aprobación o nombramiento en ningún concurso público de méritos ni proceso oficial de ascenso salarial (Decreto 1278).
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-sm">
            <h2 className="text-lg font-bold text-[#142D49] flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-[#176FC1]" />
              3. Descripción de los Servicios
            </h2>
            <p>
              MaestroTech pone a disposición de la comunidad docente una plataforma tecnológica integral que incluye:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5 text-xs sm:text-sm">
              <li>Cursos y lecciones multimedia enfocadas en competencias pedagógicas y legislación educativa colombiana.</li>
              <li>Simulador interactivo con bancos de preguntas de juicio situacional y conocimientos específicos.</li>
              <li>Materiales de estudio, guías pedagógicas y seguimiento de progreso formativo.</li>
              <li>Paneles especializados para Estudiantes, Docentes y Gestión de Contenidos.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-sm">
            <h2 className="text-lg font-bold text-[#142D49] flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#176FC1]" />
              4. Cuentas de Usuario y Responsabilidad
            </h2>
            <p>
              Para acceder a ciertas funcionalidades se requiere la creación de una cuenta personal (mediante correo electrónico o Google OAuth). El usuario es el único responsable de mantener la confidencialidad de sus credenciales y de todas las actividades realizadas bajo su cuenta.
            </p>
            <p className="mt-2">
              Queda estrictamente prohibido compartir el acceso a cuentas de pago con terceros o comercializar credenciales de acceso.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-sm">
            <h2 className="text-lg font-bold text-[#142D49] mb-3">
              5. Propiedad Intelectual
            </h2>
            <p>
              Todos los contenidos de la plataforma, incluidos sin limitación: textos, cuestionarios, videos, diseño gráfico, logotipos, código fuente y metodologías pedagógicas, son propiedad exclusiva de Maestro Technologies SAS o se utilizan bajo licencia.
            </p>
            <p className="mt-2">
              Se concede al usuario una licencia personal, intransferible y no exclusiva únicamente con fines de estudio personal. Queda prohibida la reproducción, descarga no autorizada, distribución pública o venta de cualquier material de MaestroTech.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-sm">
            <h2 className="text-lg font-bold text-[#142D49] mb-3">
              6. Suspensión o Cancelación de Cuenta
            </h2>
            <p>
              MaestroTech se reserva el derecho de suspender o revocar el acceso a cualquier usuario que infrinja estas condiciones, intente vulnerar la seguridad informática de la plataforma o haga un uso abusivo de los servicios.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 rounded-2xl bg-white border border-[#E5EDF5] shadow-sm">
            <h2 className="text-lg font-bold text-[#142D49] mb-3">
              7. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Las presentes Condiciones del Servicio se rigen e interpretan de acuerdo con las leyes de la República de Colombia. Cualquier controversia derivada del uso del servicio será dirimida ante las autoridades y juzgados competentes de la ciudad de Bogotá D.C., Colombia.
            </p>
            <p className="mt-3">
              Para notificaciones y soporte legal:{' '}
              <a href="mailto:soporte@maestrotech.co" className="text-[#176FC1] hover:underline font-medium">
                soporte@maestrotech.co
              </a>
            </p>
          </section>

        </div>

        {/* Footer info */}
        <div className="mt-12 pt-8 border-t border-[#E5EDF5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#536B83] gap-4">
          <p>© 2026 Maestro Technologies SAS. Bogotá, Colombia. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#142D49] transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/" className="hover:text-[#142D49] transition-colors">
              Inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
