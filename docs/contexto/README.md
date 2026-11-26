# 📚 Legado Docente — Contexto Integral del Proyecto y Conversaciones

Bienvenido a la documentación central de contexto de **Legado Docente** (anteriormente MaestroTech). Este directorio reúne todo el historial técnico, decisiones de diseño, evolución del producto y resoluciones de problemas acumuladas a lo largo de las sesiones de trabajo.

---

## 🧭 Índice de Documentos

1. **[01. Cronología Detallada de Conversaciones](file:///c:/Users/ASUS/Downloads/teacher-development-platform/docs/contexto/01-cronologia-detallada.md)**  
   Bitácora cronológica de los 123 hitos y requerimientos del usuario, abarcando desde la transición inicial de MaestroTech hasta el sistema actual de correos y seguridad.

2. **[02. Sistema de Diseño e Identidad de Marca](file:///c:/Users/ASUS/Downloads/teacher-development-platform/docs/contexto/02-sistema-diseno-y-marca.md)**  
   Guía de identidad visual: paleta de colores (`#0038DF`, `#002299`, `#C99E32`), el logo oficial 100% transparente sin fondo, favicon de los 3 arcos, banners 4K y footer institucional.

3. **[03. Catálogo de Correos Transaccionales](file:///c:/Users/ASUS/Downloads/teacher-development-platform/docs/contexto/03-sistema-correos-transaccionales.md)**  
   Especificación de las 10 plantillas oficiales de correo en React Email (Auth y Negocio), asuntos oficiales, triggers, variables y guías de copia para Supabase.

4. **[04. Infraestructura Backend: Supabase y Resend](file:///c:/Users/ASUS/Downloads/teacher-development-platform/docs/contexto/04-infraestructura-supabase-resend.md)**  
   Configuración de Supabase (`eklolnecteffjzbjbjmr.supabase.co`), Auth, Storage Bucket `email-assets`, webhook de pagos (Wompi / Nequi) y límites del sandbox de Resend.

5. **[05. Problemas Resueltos y Soluciones Técnicas](file:///c:/Users/ASUS/Downloads/teacher-development-platform/docs/contexto/05-problemas-resueltos-y-soluciones-tecnicas.md)**  
   Explicación en profundidad de los fallos encontrados (por qué Gmail recibía correos vacíos, por qué Supabase arrojaba "Error sending recovery email", tags rotos en React Email) y sus soluciones definitivas.

---

## 🏛️ Resumen Ejecutivo de la Plataforma

- **Nombre:** Legado Docente
- **Eslogan:** *«Aprende, comparte, deja huella.»*
- **Dominio Principal:** `https://legadodocente.com`
- **Stack Técnico:**
  - **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS, Lucide Icons.
  - **Emails:** React Email (`@react-email/components`), `@react-email/render`, Resend API.
  - **Backend / BaaS:** Supabase (PostgreSQL, GoTrue Auth, Storage, Row Level Security).
  - **Pasarelas de Pago:** Integración Webhook Wompi y soporte de comprobantes Nequi.
