# ⚙️ 04. Infraestructura Backend: Supabase y Resend

Este documento documenta la infraestructura backend, variables de entorno, autenticación, almacenamiento de medios y despacho de correos en **Legado Docente**.

---

## 🗄️ 1. Proyecto Supabase

- **URL del Proyecto:** `https://eklolnecteffjzbjbjmr.supabase.co`
- **ID del Proyecto:** `eklolnecteffjzbjbjmr`
- **Región:** `us-east-1` (Norte de Virginia)
- **Base de Datos:** PostgreSQL con extensiones `pgcrypto` y `uuid-ossp`.

### Tablas Principales:
- `users`: Perfil ampliado de usuario conectado a `auth.users` mediante triggers.
- `courses`: Catálogo de cursos, horas pedagógicas, precio y módulos.
- `enrollments`: Matrículas activas de estudiantes por curso.
- `payments`: Registro de transacciones Wompi / Nequi y comprobantes.
- `certificates`: Registros de diplomas y códigos de validación pública.

### Storage Buckets:
- **`email-assets` (Público):**
  - `/branding/`: Contiene `legado-logo.png` (transparente RGBA).
  - `/banners/`: Contiene los 10 banners 4K Retina (`banner-*.jpg`) y `banner-footer.jpg`.
  - `/decorations/`: Contiene `gold-divider.png` y arcos auxiliares.
  - `/icons/`: Contiene la iconografía oficial (`pill-check.png`, `pill-key.png`, `info-shield.png`, etc.).
- **`course-content` (Privado):** Materiales, guías y PDFs de estudio.

---

## 📧 2. Integración con Resend

- **API Key:** Configurada en variable de entorno `RESEND_API_KEY`.
- **Librería SDK:** `resend` en Node.js / Next.js API Routes.
- **Remitente Actual en Pruebas:** `Legado Docente <onboarding@resend.dev>`
- **Remitente para Producción:** `Legado Docente <soporte@legadodocente.com>` (Requiere verificación de dominio en Resend DNS).

### Advertencia Crítica de Sandbox:
El dominio por defecto `onboarding@resend.dev` opera en modo Sandbox y **únicamente** permite enviar correos a la dirección del propietario de la cuenta (`luisalfonso1818@gmail.com`). Para enviar a cualquier otro docente o estudiante sin restricciones, se debe añadir el dominio `legadodocente.com` en el panel de Resend y configurar los registros TXT / MX en el proveedor de DNS.

---

## 🔐 3. Variables de Entorno Requeridas (.env.local)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://eklolnecteffjzbjbjmr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Resend Email Service
RESEND_API_KEY=re_tu_api_key_de_resend_aqui
EMAIL_FROM="Legado Docente <onboarding@resend.dev>"

# Next.js Application URL
NEXT_PUBLIC_APP_URL=https://legadodocente.com
```
