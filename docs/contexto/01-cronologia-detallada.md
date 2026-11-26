# ⏱️ 01. Cronología Detallada de Conversaciones e Hitos

Este documento detalla la evolución histórica de **Legado Docente** a través de las interacciones, solicitudes y decisiones técnicas tomadas en el proyecto.

---

## 📌 Fase 1: Arquitectura Inicial y Conexión con Supabase
- **Objetivo:** Conectar el frontend base (originalmente denominado Maestro / MaestroTech) con el backend de Supabase.
- **Configuración de Entorno:**
  - `NEXT_PUBLIC_SUPABASE_URL=https://eklolnecteffjzbjbjmr.supabase.co`
  - Claves anónimas y de servicio de Supabase para operaciones del cliente y del servidor.
- **Sistema de Roles:**
  - Implementación de roles diferenciados: `superusuario`, `docente` (teacher) y `estudiante` (student).
  - Corrección de bucles de redirección de estado de sesión entre el panel administrativo y la vista de estudiante.
- **Gestión de Cursos y Recursos:**
  - Depuración del módulo `/teacher` para creación de cursos y carga de lecciones.
  - Corrección de errores de `ChunkLoadError` en compilaciones de Next.js y validación de tipos.
  - Configuración del flujo de autenticación con Google OAuth (`auth/callback`).

---

## 📌 Fase 2: Renacimiento de Marca — Legado Docente
- **Identidad de Marca:**
  - Cambio formal de denominación de MaestroTech a **Legado Docente**.
  - Slogan institucional: *«Aprende, comparte, deja huella.»*
- **Símbolo Gráfico:**
  - Creación del isotipo corporativo: una "L" azul vibrante abrazada por tres arcos concéntricos en degradé dorado metálico.
  - Ajuste meticuloso del favicon web para garantizar la presencia nítida de los tres arcos dorados.
- **Cumplimiento Legal:**
  - Redacción y publicación de las páginas legales en español: `/privacy` (Política de Privacidad) y `/terms` (Términos y Condiciones), requeridas para verificación de OAuth de Google.

---

## 📌 Fase 3: Integración de Pagos y Webhook Transaccional
- **Mecanismos de Pago:**
  - Integración de pasarela Wompi para tarjetas de crédito, débito y PSE.
  - Soporte de pagos manuales vía Nequi con verificación de comprobante.
- **Webhook `/api/payments/webhook`:**
  - Automatización del cambio de estado de transacciones de `PENDING` a `APPROVED`.
  - Disparo automático de la matrícula del estudiante en la base de datos de Supabase.
  - Conexión con el despachador de emails transaccionales de pago aprobado y matrícula exitosa.

---

## 📌 Fase 4: Desarrollo del Sistema de Correos Transaccionales (React Email)
- **Desarrollo Modular:**
  - Adopción de la librería oficial `@react-email/components` y `@react-email/render` para maquetación HTML de alta fidelidad.
  - Creación de componentes reutilizables: `EmailLayout`, `EmailHero`, `EmailPill`, `EmailHeading`, `EmailButton`, `EmailDivider`, `EmailInfoCard` y `Footer`.
- **9 Plantillas Iniciales:**
  1. `confirm-email` (Confirmación de cuenta en registro)
  2. `welcome` (Bienvenida a Legado Docente tras activar cuenta)
  3. `reset-password` (Recuperación de contraseña olvidada)
  4. `change-email` (Actualización de correo electrónico seguro)
  5. `payment-approved` (Confirmación de pago de matrícula)
  6. `enrollment-success` (Matrícula activa y acceso al aula virtual)
  7. `certificate-available` (Emisión y descarga de certificado oficial)
  8. `course-completed` (Felicitación por finalización de curso)
  9. `new-course-launch` (Lanzamiento de nuevo programa académico)

---

## 📌 Fase 5: Conexión con Resend y Configuración SMTP en Supabase
- **Proveedor Transaccional:**
  - Configuración de la API Key de Resend (guardada de forma segura en variables de entorno `.env.local`).
  - Creación de ruta de envío `/api/auth/welcome` para despacho automático de bienvenida post-registro.
  - Exportador automatizado `emails/export-supabase.tsx` para generar plantillas HTML puras compatibles con las variables Go (`{{ .ConfirmationURL }}`) de Supabase Auth.

---

## 📌 Fase 6: Banners 4K y Refinamiento Estético
- **Problema de Banners Pixelados:**
  - El usuario suministró el paquete oficial `legado-docente-4k.zip` y archivos en resolución nativa.
  - Procesamiento con Pillow (Python) para generar imágenes optimizadas a 1200×400 px con calidad 95% para pantallas Retina sin sobrecargar peso de descarga.
  - Carga al bucket público `email-assets` en Supabase Storage:
    - `banners/banner-confirm-email.jpg`
    - `banners/banner-welcome.jpg`
    - `banners/banner-reset-password.jpg`
    - `banners/banner-change-email.jpg`
    - `banners/banner-payment-approved.jpg`
    - `banners/banner-enrollment-success.jpg`
    - `banners/banner-certificate-available.jpg`
    - `banners/banner-course-completed.jpg`
    - `banners/banner-new-course-launch.jpg`
    - `banners/banner-password-changed.jpg`
- **Logo Transparente:**
  - Reemplazo del logo con fondo blanco circular por la versión suministrada por el usuario: PNG RGBA con fondo 100% transparente (`branding/legado-logo.png`).
- **Footer Oficial 4K:**
  - Implementación del nuevo footer institucional `banners/banner-footer.jpg` generado a partir del archivo maestro `footer.png`.
  - Eliminación de iconos de redes sociales flotantes para mantener un diseño sobrio con barra de accesos directos funcionales (`Inicio • Aula virtual • Soporte`).

---

## 📌 Fase 7: Resolución del Fallo Crítico de Correos Vacíos en Gmail
- **Síntoma:** Al enviar correos a cuentas de Gmail, los mensajes llegaban en blanco / colapsados a 0px de altura.
- **Causa Raíz Descubierta:**
  1. React Email al renderizar con `{ pretty: true }` fragmentaba etiquetas de cierre en varias líneas (e.g. `</a\n  >`, `</span\n  >`). El analizador HTML estricto de Gmail consideraba estas etiquetas como no cerradas, destruyendo la estructura de la tabla.
  2. El componente `<Preview>` inyectaba un contenedor oculto con caracteres Unicode invisibles (`\u200c`, `\u200b`) que rompían la previsualización en Supabase Studio y Gmail.
- **Solución Implementada:**
  - Renderizado con `{ pretty: false }`.
  - Implementación de la función sanitizadora `cleanEmailHtml()` que remueve comentarios React SSR, unifica etiquetas de cierre en una sola línea y suprime caracteres Unicode invisibles.

---

## 📌 Fase 8: Diagnóstico del Error "Error sending recovery email" en Supabase
- **Síntoma:** Al solicitar recuperación de contraseña en Supabase Auth, la consola arrojaba `Error sending recovery email`.
- **Causa Raíz:**
  - Supabase estaba configurado para despachar correos vía SMTP de Resend (`smtp.resend.com`) utilizando el remitente `onboarding@resend.dev`.
  - En la cuenta gratuita de Resend sin dominio personalizado verificado, Resend bloquea estrictamente cualquier envío hacia correos que no sean el propietario registrado (`luisalfonso1818@gmail.com`), retornando el error SMTP `550 You can only send testing emails to your own email address`.
- **Solución:**
  - Para pruebas iniciales, usar exclusivamente la dirección del propietario de la cuenta Resend.
  - Para producción, verificar el dominio `legadodocente.com` en el panel de Resend agregando los registros DNS correspondientes (DKIM, SPF y MX).

---

## 📌 Fase 9: Plantilla 10 — "Tu contraseña ha sido cambiada"
- **Requerimiento:** El usuario proporcionó el banner 3D con candado dorado y escudo azul ("Tu contraseña ha sido cambiada, Tu nueva contraseña ya está activa").
- **Implementación:**
  - Procesamiento del banner a 1200×400 px y subida a Supabase Storage (`banners/banner-password-changed.jpg`).
  - Creación del componente `emails/password-changed.tsx`.
  - Registro en `lib/email/transactional.ts` con ID `password-changed`.
  - Generación de los archivos HTML:
    - `docs/supabase-templates/password-changed.html`
    - `docs/email-previews/password-changed.html`
  - Envío exitoso de prueba a `patriciajohnt@gmail.com` y `luisalfonso1818@gmail.com`.
  - Validación de compilación: `pnpm build` finalizado con éxito sin errores.
