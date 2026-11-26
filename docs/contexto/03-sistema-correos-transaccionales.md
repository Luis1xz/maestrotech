# 📨 03. Catálogo de Correos Transaccionales Oficiales

Legado Docente cuenta con **10 plantillas de correo transaccional** diseñadas bajo el sistema de diseño corporativo.

---

## 📋 Catálogo Completo de Plantillas

| # | ID de Plantilla | Nombre Oficial | Disparador (Trigger) | Canal / Motor | Asunto Oficial Recomendado |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **1** | `confirm-email` | Confirmación de cuenta | Registro de usuario con email y contraseña. | Supabase Auth | `Confirma tu cuenta en Legado Docente` |
| **2** | `welcome` | Bienvenida a Legado Docente | Cuenta activada tras confirmación o primer acceso. | Resend API | `¡Bienvenido a Legado Docente!` |
| **3** | `reset-password` | Recuperación de contraseña | Solicitud "Olvidé mi contraseña" en login. | Supabase Auth | `Restablece tu contraseña de Legado Docente` |
| **4** | `password-changed`| Contraseña cambiada | Contraseña modificada exitosamente. | Resend / Supabase | `Tu contraseña ha sido cambiada — Legado Docente` |
| **5** | `change-email` | Cambio de correo electrónico | Solicitud de cambio de email en perfil. | Supabase Auth | `Confirma tu nueva dirección de correo en Legado Docente` |
| **6** | `payment-approved` | Pago aprobado | Pago confirmado por pasarela (Wompi/Nequi). | Resend API | `Tu pago ha sido confirmado — Legado Docente` |
| **7** | `enrollment-success`| Matrícula exitosa | Matrícula activa en base de datos. | Resend API | `¡Matrícula activa! Ya puedes acceder a tu curso` |
| **8** | `certificate-available`| Certificado disponible | Emisión de certificado académico. | Resend API | `Tu certificado oficial está listo para descargar` |
| **9** | `course-completed` | Curso finalizado | Estudiante completa 100% del programa. | Resend API | `¡Felicitaciones por finalizar tu curso en Legado Docente!` |
| **10**| `new-course-launch`| Lanzamiento de nuevo curso | Anuncio de nuevas convocatorias o programas. | Resend API | `Nuevo programa formativo en Legado Docente` |

---

## 📂 Ubicación de Archivos en el Repositorio

- **Componentes React Email (código fuente):**
  - [emails/confirm-email.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/confirm-email.tsx)
  - [emails/welcome.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/welcome.tsx)
  - [emails/reset-password.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/reset-password.tsx)
  - [emails/password-changed.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/password-changed.tsx)
  - [emails/change-email.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/change-email.tsx)
  - [emails/payment-confirmation.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/payment-confirmation.tsx)
  - [emails/enrollment-success.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/enrollment-success.tsx)
  - [emails/certificate-delivery.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/certificate-delivery.tsx)
  - [emails/course-completed.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/course-completed.tsx)
  - [emails/new-course-launch.tsx](file:///c:/Users/ASUS/Downloads/teacher-development-platform/emails/new-course-launch.tsx)

- **Plantillas HTML listas para Supabase Studio:**
  - `docs/supabase-templates/confirm-email.html`
  - `docs/supabase-templates/reset-password.html`
  - `docs/supabase-templates/password-changed.html`
  - `docs/supabase-templates/change-email.html`

- **Vistas previas estáticas completas (HTML):**
  - Disponibles en `docs/email-previews/*.html`

---

## 🛠️ Cómo Configurar las Plantillas en Supabase Auth

1. Ve a tu proyecto en **Supabase Dashboard**: `https://supabase.com/dashboard/project/eklolnecteffjzbjbjmr`
2. En el menú lateral, abre **Authentication** -> **Email Templates**.
3. Selecciona la plantilla correspondiente:
   - **Confirm signup:** Copia el contenido de `docs/supabase-templates/confirm-email.html` y coloca de asunto `Confirma tu cuenta en Legado Docente`.
   - **Reset password:** Copia el contenido de `docs/supabase-templates/reset-password.html` y coloca de asunto `Restablece tu contraseña de Legado Docente`.
   - **Change email address:** Copia el contenido de `docs/supabase-templates/change-email.html` y coloca de asunto `Confirma tu nueva dirección de correo en Legado Docente`.
4. Guarda los cambios (**Save**).
