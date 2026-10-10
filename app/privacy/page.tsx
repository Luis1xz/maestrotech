import Link from 'next/link'
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, Globe, Database, UserCheck, Trash2, Mail } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidad | MaestroTech',
  description: 'Política de Privacidad y Tratamiento de Datos Personales de MaestroTech. Cumplimiento de la Ley 1581 de 2012 y Google API Services User Data Policy.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-border/60 shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 bg-black">
              <img src="/logo.png" alt="MaestroTech Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground font-display">
              MaestroTech
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-10 text-center sm:text-left border-b border-border/60 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Documento Legal Oficial / Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground mb-3">
            Política de Privacidad de MaestroTech
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong>Aplicación:</strong> MaestroTech (URL oficial:{' '}
            <a href="https://maestrotech.vercel.app" className="text-amber-500 hover:underline">
              https://maestrotech.vercel.app
            </a>
            ) · <strong>Última actualización:</strong> Octubre 2026 · Cumplimiento de la Ley 1581 de 2012 (Colombia) y de la{' '}
            <em>Google API Services User Data Policy</em>.
          </p>
        </div>

        {/* English Compliance Notice for Google Reviewers */}
        <section className="mb-10 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
          <div className="flex items-center gap-2 font-bold text-white mb-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Notice for Google OAuth Verification Reviewers (English Summary)</span>
          </div>
          <p className="leading-relaxed">
            This Privacy Policy applies to the web application <strong>MaestroTech</strong> located at{' '}
            <code className="bg-blue-950 px-1 py-0.5 rounded text-white">https://maestrotech.vercel.app</code>. MaestroTech accesses user data through Google OAuth exclusively for identity authentication and account creation (specifically scopes: <code className="bg-blue-950 px-1 py-0.5 rounded text-white">email</code>, <code className="bg-blue-950 px-1 py-0.5 rounded text-white">profile</code>, and <code className="bg-blue-950 px-1 py-0.5 rounded text-white">openid</code>). We collect only the user&apos;s email address, public profile name, and avatar image to identify them on the platform. <strong>We do not sell, rent, transfer, or share Google user data with any third parties or advertisers. We do not use Google user data to train generalized AI models.</strong> Users can request complete deletion of their account and data at any time by contacting <code className="text-white font-medium">soporte@maestrotech.co</code>.
          </p>
        </section>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
          
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-card/50 border border-border/60">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-amber-500" />
              1. Responsable del Tratamiento de los Datos
            </h2>
            <p>
              El responsable del tratamiento de los datos personales recopilados a través de la plataforma web <strong>MaestroTech</strong> (disponible en <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">https://maestrotech.vercel.app</code>) es <strong>Maestro Technologies SAS</strong>, sociedad comercial constituida bajo las leyes de la República de Colombia, con domicilio principal en Bogotá D.C., Colombia.
            </p>
            <div className="mt-3 text-xs sm:text-sm space-y-1">
              <p><strong>Razón social:</strong> Maestro Technologies SAS</p>
              <p><strong>Nombre comercial y de la aplicación:</strong> MaestroTech</p>
              <p><strong>Sitio web principal:</strong> https://maestrotech.vercel.app</p>
              <p>
                <strong>Correo electrónico oficial de contacto y privacidad:</strong>{' '}
                <a href="mailto:soporte@maestrotech.co" className="text-amber-500 hover:underline">
                  soporte@maestrotech.co
                </a>
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-card/50 border border-border/60">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-amber-500" />
              2. Datos Personales que Recopilamos
            </h2>
            <p>
              MaestroTech recopila información con el único propósito de prestar sus servicios formativos y pedagógicos para docentes. Los tipos de datos recopilados incluyen:
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-xl bg-background/50 border border-border/40">
                <h3 className="font-semibold text-foreground text-sm mb-1">A. Datos suministrados directamente por el usuario:</h3>
                <p className="text-xs sm:text-sm">
                  Nombre completo, dirección de correo electrónico, contraseña protegida mediante funciones criptográficas unidireccionales (hash) y rol educativo.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-border/40">
                <h3 className="font-semibold text-foreground text-sm mb-1">B. Datos obtenidos mediante autenticación de terceros (Google OAuth):</h3>
                <p className="text-xs sm:text-sm">
                  Cuando el usuario elige iniciar sesión con el botón &quot;Continuar con Google&quot;, MaestroTech solicita acceso únicamente a los ámbitos (*scopes*) básicos autorizados:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm">
                  <li><strong>Identificador único de Google (Google ID):</strong> Para reconocer de forma unívoca la cuenta del usuario.</li>
                  <li><strong>Dirección de correo electrónico (email):</strong> Para asociar la cuenta, verificar la identidad y enviar notificaciones del servicio.</li>
                  <li><strong>Nombre de perfil (profile name):</strong> Para mostrar el nombre del docente en su panel de estudio y certificaciones.</li>
                  <li><strong>Fotografía de perfil (avatar URL):</strong> Para personalizar la interfaz del usuario.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-border/40">
                <h3 className="font-semibold text-foreground text-sm mb-1">C. Datos de actividad y desempeño académico:</h3>
                <p className="text-xs sm:text-sm">
                  Cursos inscritos, lecciones completadas, respuestas y puntajes en simulacros de concurso de méritos docentes y certificados generados.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Google API Disclosure */}
          <section className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/30">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              3. Cumplimiento de la Política de Datos de Usuario de Google (Google API User Data Policy)
            </h2>
            <p className="text-foreground text-sm sm:text-base font-medium mb-3">
              El uso y la transferencia que hace MaestroTech a cualquier otra aplicación de la información recibida a través de las APIs de Google cumplen de manera irrestricta con la{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 underline"
              >
                Google API Services User Data Policy
              </a>
              , incluidos los requisitos de Uso Limitado (Limited Use):
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span><strong>No vendemos datos de Google:</strong> Los datos de usuarios de Google nunca son vendidos, alquilados, comercializados ni cedidos a intermediarios de datos (*data brokers*).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span><strong>No se utilizan para publicidad dirigida:</strong> La información personal obtenida a través de Google jamás se comparte con anunciantes ni redes de publicidad externa.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span><strong>No se entrenan modelos de IA:</strong> Los datos de los usuarios obtenidos a través de Google no se utilizan para entrenar, reentrenar ni ajustar modelos de inteligencia artificial generalistas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span><strong>Uso estrictamente funcional:</strong> Solo el personal técnico estrictamente autorizado puede acceder a registros bajo circunstancias de auditoría de seguridad o resolución de fallas técnicas críticas.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-card/50 border border-border/60">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-amber-500" />
              4. Finalidad del Tratamiento de los Datos
            </h2>
            <p>Los datos personales recabados por MaestroTech se tratan exclusivamente para:</p>
            <ol className="list-decimal pl-5 mt-3 space-y-2 text-xs sm:text-sm">
              <li>Permitir el registro, autenticación segura y recuperación de acceso de los docentes a la plataforma.</li>
              <li>Suministrar acceso a los cursos, simuladores de exámenes docentes y materiales pedagógicos.</li>
              <li>Registrar y calcular las estadísticas de progreso, aciertos y áreas de mejora en los simulacros.</li>
              <li>Emitir diplomas, constancias de aprobación y certificados de formación.</li>
              <li>Brindar soporte técnico y atención a solicitudes de los usuarios.</li>
              <li>Cumplir con las obligaciones legales y normativas aplicables en Colombia.</li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-card/50 border border-border/60">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-amber-500" />
              5. Almacenamiento, Conservación y Medidas de Seguridad
            </h2>
            <p>
              Los datos se almacenan en servidores seguros con arquitectura Supabase PostgreSQL, protegidos con los siguientes estándares:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Cifrado en tránsito:</strong> Toda la comunicación web utiliza HTTPS con protocolos TLS 1.3.</li>
              <li><strong>Cifrado en reposo:</strong> Las bases de datos se encuentran cifradas bajo el estándar AES-256.</li>
              <li><strong>Aislamiento de datos (Row Level Security):</strong> Cada usuario solo puede consultar y modificar sus propios datos mediante políticas RLS estrictas a nivel de motor de base de datos.</li>
            </ul>
            <p className="mt-3 text-xs sm:text-sm">
              <strong>Periodo de conservación:</strong> Los datos se conservan únicamente mientras el usuario mantenga su cuenta activa en MaestroTech, o hasta que solicite la supresión de la misma.
            </p>
          </section>

          {/* Section 6 - Deletion Request */}
          <section className="p-6 rounded-2xl bg-card/50 border border-border/60">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-amber-500" />
              6. Procedimiento para Solicitar la Eliminación de Cuenta y Datos
            </h2>
            <p>
              Cualquier usuario de MaestroTech tiene derecho a solicitar la eliminación completa, permanente e irreversible de su cuenta y de todos sus datos personales asociados (incluidos registros de Google OAuth, progreso y calificaciones).
            </p>
            <div className="mt-3 p-4 rounded-xl bg-background border border-border/60">
              <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">
                ¿Cómo solicitar la eliminación definitiva?
              </p>
              <p className="text-xs sm:text-sm">
                Envíe un correo electrónico desde la cuenta registrada a:{' '}
                <a href="mailto:soporte@maestrotech.co" className="text-amber-500 font-bold hover:underline">
                  soporte@maestrotech.co
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Asunto:</strong> Solicitud de Eliminación de Cuenta y Datos Personales<br />
                <strong>Plazo de respuesta:</strong> La solicitud se procesará y se eliminarán todos los registros asociados en un plazo máximo de cinco (5) días hábiles.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="p-6 rounded-2xl bg-card/50 border border-border/60">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-amber-500" />
              7. Derechos del Titular y Canales de Atención
            </h2>
            <p>
              Conforme a la Ley 1581 de 2012 de Colombia, el titular de la información puede ejercer en cualquier momento sus derechos de consulta, actualización, rectificación o supresión comunicándose a:
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Correo de contacto oficial:{' '}
              <a href="mailto:soporte@maestrotech.co" className="text-amber-500 hover:underline">
                soporte@maestrotech.co
              </a>
            </p>
          </section>

        </div>

        {/* Footer info */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 Maestro Technologies SAS. Bogotá, Colombia. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Condiciones del Servicio
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
