/**
 * Plantillas HTML de Alta Gama para Correos Electrónicos - LEGADO DOCENTE
 * «Aprende, comparte, deja huella»
 * 
 * Diseñadas con CSS inline y arquitectura de tablas responsive
 * compatible con Gmail, Outlook, Apple Mail y clientes móviles.
 */

export interface CandidateNotificationData {
  fullName: string
  firstName?: string
  lastName?: string
  email: string
  phoneNumber?: string
  department?: string
  targetRole?: string
  educationLevel?: string
  academicTitle?: string
  workExperience?: string
  registeredAt?: string
}

export interface WelcomeEmailData {
  firstName: string
  email: string
  loginUrl?: string
}

const BRAND_COLORS = {
  royalBlue: '#0038DF',
  royalDark: '#002299',
  metallicGold: '#C99E32',
  ochreGold: '#9C7316',
  lightGold: '#E6C565',
  darkSlate: '#1E293B',
  softBackground: '#F8FAFC',
  border: '#E2E8F0',
}

/**
 * Plantilla para el Administrador: Alerta de Nuevo Usuario Registrado
 */
export function buildAdminNewUserAlertHtml(data: CandidateNotificationData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://legadodocente.com'
  const adminUrl = `${siteUrl}/admin`
  const dateFormatted = data.registeredAt
    ? new Date(data.registeredAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
    : new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })

  const roleLabels: Record<string, string> = {
    docente_aula: 'Docente de Aula (Primaria / Secundaria)',
    rector: 'Directivo Docente - Rector(a)',
    coordinador: 'Directivo Docente - Coordinador(a)',
    orientador: 'Docente Orientador(a)',
    directivo_rural: 'Director(a) Rural',
  }

  const roleLabel = data.targetRole ? (roleLabels[data.targetRole] || data.targetRole) : 'Aspirante General'

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Aspirante Registrado - Legado Docente</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" width="100%" max-width="620" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #E2E8F0;">
          
          <!-- Barra Superior Dorada Metálica -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #9C7316 0%, #E6C565 50%, #8F6812 100%);"></td>
          </tr>

          <!-- Encabezado Azul Rey con Logo -->
          <tr>
            <td style="background-color: #0038DF; padding: 36px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Insignia Dorada -->
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.12); border: 1px solid rgba(230, 197, 101, 0.4); border-radius: 9999px; padding: 4px 16px; margin-bottom: 12px;">
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #E6C565; text-transform: uppercase;">
                        ⚡ Alerta del Sistema • Nuevo Aspirante
                      </span>
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                      ¡Nuevo Docente Registrado!
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.85); font-style: italic;">
                      «Aprende, comparte, deja huella»
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cuerpo del Mensaje -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #1E293B;">
                Hola <strong>Administrador</strong>, un nuevo colega ha completado su registro en la plataforma institucional <strong>Legado Docente</strong>. Aquí tienes el reporte detallado:
              </p>

              <!-- Tarjeta de Datos del Candidato -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px; border-bottom: 1px solid #E2E8F0; background-color: #FFFFFF;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0038DF;">
                      Ficha de Caracterización
                    </span>
                    <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #1E293B;">
                      ${data.fullName}
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0">
                      <tr>
                        <td width="38%" style="font-size: 13px; color: #64748B; font-weight: 600;">Correo Electrónico:</td>
                        <td width="62%" style="font-size: 13px; color: #0038DF; font-weight: 700;">
                          <a href="mailto:${data.email}" style="color: #0038DF; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>

                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Teléfono / WhatsApp:</td>
                        <td style="font-size: 13px; color: #1E293B; font-weight: 700;">
                          ${data.phoneNumber ? `<a href="https://wa.me/57${data.phoneNumber.replace(/\D/g, '')}" target="_blank" style="color: #059669; text-decoration: none; font-weight: 700;">📱 ${data.phoneNumber}</a>` : '<span style="color: #94A3B8; font-style: italic;">No especificado</span>'}
                        </td>
                      </tr>

                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Departamento:</td>
                        <td style="font-size: 13px; color: #1E293B; font-weight: 600;">
                          📍 ${data.department || 'Colombia'}
                        </td>
                      </tr>

                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Cargo al que Aspira:</td>
                        <td style="font-size: 13px; color: #9C7316; font-weight: 700;">
                          🎯 ${roleLabel}
                        </td>
                      </tr>

                      ${data.educationLevel ? `
                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Nivel de Estudios:</td>
                        <td style="font-size: 13px; color: #1E293B;">
                          🎓 ${data.educationLevel}
                        </td>
                      </tr>` : ''}

                      ${data.academicTitle ? `
                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Título Académico:</td>
                        <td style="font-size: 13px; color: #1E293B;">
                          📜 ${data.academicTitle}
                        </td>
                      </tr>` : ''}

                      ${data.workExperience ? `
                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Experiencia Docente:</td>
                        <td style="font-size: 13px; color: #1E293B;">
                          ⏱️ ${data.workExperience}
                        </td>
                      </tr>` : ''}

                      <tr>
                        <td style="font-size: 13px; color: #64748B; font-weight: 600;">Fecha de Registro:</td>
                        <td style="font-size: 12px; color: #64748B; font-family: monospace;">
                          🗓️ ${dateFormatted}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botón CTA Dorado -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C99E32 0%, #9C7316 100%); color: #1A1A1A; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(201, 158, 50, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Abrir Panel de Superusuario →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94A3B8; text-align: center;">
                Desde tu panel puedes activar matrículas, asignar cursos o contactar al aspirante directamente vía WhatsApp.
              </p>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0038DF;">
                LEGADO DOCENTE SAS • SISTEMA DE NOTIFICACIONES OFICIALES
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Bogotá D.C., Colombia • «Aprende, comparte, deja huella»
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Plantilla para el Estudiante: Correo de Bienvenida de Lujo
 */
export function buildStudentWelcomeHtml(data: WelcomeEmailData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://legadodocente.com'
  const classroomUrl = data.loginUrl || `${siteUrl}?view=dashboard`
  const diagnosticUrl = `${siteUrl}?view=exam`

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a Legado Docente!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" width="100%" max-width="620" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #E2E8F0;">
          
          <!-- Barra Superior Dorada -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #9C7316 0%, #E6C565 50%, #8F6812 100%);"></td>
          </tr>

          <!-- Encabezado Real -->
          <tr>
            <td style="background: radial-gradient(circle at top right, #0038DF 0%, #002299 100%); padding: 42px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Distintivo -->
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.12); border: 1px solid rgba(230, 197, 101, 0.4); border-radius: 9999px; padding: 5px 18px; margin-bottom: 14px;">
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #E6C565; text-transform: uppercase;">
                        🏛️ Plataforma Oficial del Docente Colombiano
                      </span>
                    </div>

                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.3;">
                      ¡Tu camino al nombramiento<br>comienza hoy, ${data.firstName}!
                    </h1>

                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #E6C565; font-style: italic; font-weight: 600;">
                      «Aprende, comparte, deja huella»
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="margin: 0 0 18px 0; font-size: 16px; line-height: 1.6; color: #1E293B;">
                Estimado(a) colega <strong>${data.firstName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.7; color: #475569;">
                Te damos la más cálida bienvenida a <strong>Legado Docente</strong>. Nuestro propósito es brindarte el más alto rigor pedagógico, fuentes oficiales del MEN y simulacros situacionales para asegurar tu éxito en el concurso de méritos docente y el ascenso escalafonario (Decreto Ley 1278).
              </p>

              <!-- Tres Pilares de tu Formación -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <!-- Pilar 1 -->
                <tr>
                  <td style="padding: 14px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="42" valign="top">
                          <div style="width: 36px; height: 36px; border-radius: 10px; background-color: #0038DF; color: #FFFFFF; text-align: center; line-height: 36px; font-size: 18px;">
                            📚
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0038DF;">
                            Programa Oficial de 140 Horas
                          </h3>
                          <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                            13 módulos con acordeón interactivo: Aptitudes Básicas, Componente Pedagógico y Disciplinar.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height: 10px;"></td></tr>

                <!-- Pilar 2 -->
                <tr>
                  <td style="padding: 14px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="42" valign="top">
                          <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #C99E32, #9C7316); color: #1A1A1A; text-align: center; line-height: 36px; font-size: 18px;">
                            🎯
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #9C7316;">
                            Simulador Situacional CNSC
                          </h3>
                          <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                            Casos reales de convivencia (Ley 1620), evaluación (Decreto 1290) e inclusión (DUA / Decreto 1421).
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height: 10px;"></td></tr>

                <!-- Pilar 3 -->
                <tr>
                  <td style="padding: 14px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="42" valign="top">
                          <div style="width: 36px; height: 36px; border-radius: 10px; background-color: #0038DF; color: #FFFFFF; text-align: center; line-height: 36px; font-size: 18px;">
                            🤖
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0038DF;">
                            Tutor Pedagógico IA MaTech
                          </h3>
                          <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                            Acompañamiento reflexivo continuo para resolver dudas curriculares y casuísticas 24/7.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botones de Acción -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${classroomUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C99E32 0%, #9C7316 100%); color: #1A1A1A; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(201, 158, 50, 0.45); text-transform: uppercase; letter-spacing: 0.5px;">
                      Ingresar a Mi Aula Virtual →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 14px;">
                    <a href="${diagnosticUrl}" target="_blank" style="font-size: 13px; font-weight: 700; color: #0038DF; text-decoration: underline;">
                      O presentar mi Prueba Diagnóstica Gratuita
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #64748B;">
                Tu cuenta está activa con el correo <strong>${data.email}</strong>. Si tienes alguna pregunta sobre las clases o el cronograma de la CNSC, estamos para servirte.
              </p>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 28px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #0038DF;">
                LEGADO DOCENTE
              </p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #9C7316; font-style: italic;">
                «Aprende, comparte, deja huella»
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Recibes este correo porque te has registrado en legadodocente.com.<br>
                Bogotá D.C., Colombia • Todos los derechos reservados © 2026.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Plantilla de Alerta de Pago / Matrícula
 */
export function buildPaymentAlertHtml(data: {
  fullName: string
  email: string
  planName: string
  amount: string
  reference: string
  phoneNumber?: string
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://legadodocente.com'
  const adminUrl = `${siteUrl}/admin`

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante de Pago Recibido - Legado Docente</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid #E2E8F0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #10B981, #059669);"></td>
          </tr>
          <tr>
            <td style="background-color: #0038DF; padding: 32px; text-align: center; color: #FFFFFF;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #A7F3D0; text-transform: uppercase; margin-bottom: 8px;">
                💳 Notificación de Pago
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">
                ¡Comprobante de Pago Registrado!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 16px 0; font-size: 14px;">El docente <strong>${data.fullName}</strong> ha presentado un comprobante de pago:</p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; margin-bottom: 24px;">
                <tr><td width="35%" style="font-size: 13px; color: #64748B;">Plan:</td><td style="font-size: 13px; font-weight: 700; color: #0038DF;">${data.planName}</td></tr>
                <tr><td style="font-size: 13px; color: #64748B;">Monto:</td><td style="font-size: 13px; font-weight: 700; color: #059669;">${data.amount}</td></tr>
                <tr><td style="font-size: 13px; color: #64748B;">Referencia:</td><td style="font-size: 13px; font-family: monospace; font-weight: 700;">${data.reference}</td></tr>
                <tr><td style="font-size: 13px; color: #64748B;">Correo:</td><td style="font-size: 13px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
                ${data.phoneNumber ? `<tr><td style="font-size: 13px; color: #64748B;">WhatsApp:</td><td style="font-size: 13px; font-weight: 700; color: #059669;">${data.phoneNumber}</td></tr>` : ''}
              </table>

              <div style="text-align: center;">
                <a href="${adminUrl}" style="display: inline-block; background-color: #0038DF; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">
                  Revisar en Panel Superusuario →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
