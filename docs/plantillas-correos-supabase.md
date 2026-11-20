# 📧 Guía y Plantillas Oficiales de Correo para Supabase Auth
## Plataforma LEGADO DOCENTE — «Aprende, comparte, deja huella»

Esta guía contiene la configuración paso a paso para que **todos los correos que reciben los usuarios (Bienvenida, Olvido de Contraseña, Enlace Mágico)** salgan directamente desde tu correo de Gmail (`luisalfonso1818@gmail.com`) y con un diseño de lujo institucional.

---

## 🛠️ Parte 1: Conectar tu Gmail en Supabase (Custom SMTP)

1. Ingresa a tu proyecto en [supabase.com/dashboard](https://supabase.com/dashboard).
2. En el menú lateral izquierdo, haz clic en el engranaje **Project Settings** (o ve a **Authentication** > **SMTP Settings**).
3. Busca la sección **SMTP Settings** y activa el interruptor **Enable Custom SMTP**.
4. Llena los campos exactamente así:

| Campo en Supabase | Valor a colocar |
| :--- | :--- |
| **Sender email** | `luisalfonso1818@gmail.com` |
| **Sender name** | `Legado Docente` |
| **Host** | `smtp.gmail.com` |
| **Port** | `465` |
| **Encryption** | `SSL` (o marca la casilla si pide SSL/TLS) |
| **User** | `luisalfonso1818@gmail.com` |
| **Password** | Tu **Contraseña de Aplicación de 16 letras** de Google *(sin espacios)* |

5. Haz clic en **Save** abajo a la derecha.

> **¿Cómo obtienes la Contraseña de 16 letras de Google?**
> 1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
> 2. En nombre escribe `Supabase Legado Docente` y dale a **Crear**.
> 3. Copia el código amarillo de 16 letras y pégalo en el campo **Password** de Supabase.

---

## 🎨 Parte 2: Diseños HTML para copiar y pegar en Supabase

En tu panel de Supabase, ve a **Authentication** > **Email Templates**.

---

### 1. Plantilla: "Reset Password" (Olvidó su contraseña)
> Selecciona la pestaña **Reset Password** en Supabase, cambia el Asunto y reemplaza todo el HTML por este:

* **Subject (Asunto):** `🔐 Restablece tu contraseña - Legado Docente`
* **Message Body (HTML):**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Legado Docente</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="580" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- Barra Superior Oro Metálico -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #9C7316 0%, #E6C565 50%, #8F6812 100%);"></td>
          </tr>

          <!-- Encabezado Azul Rey -->
          <tr>
            <td style="background-color: #0038DF; padding: 36px 32px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.12); border: 1px solid rgba(230, 197, 101, 0.4); border-radius: 9999px; padding: 4px 16px; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #E6C565; text-transform: uppercase;">
                  Seguridad de Cuenta Institucional
                </span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Recuperación de Contraseña
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.85); font-style: italic;">
                «Aprende, comparte, deja huella»
              </p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #1E293B;">
                Hola estimado(a) docente,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.7; color: #475569;">
                Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta institucional en <strong>Legado Docente</strong> ({{ .Email }}).
              </p>

              <!-- Botón Dorado de Acción -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C99E32 0%, #9C7316 100%); color: #1A1A1A; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(201, 158, 50, 0.45); text-transform: uppercase; letter-spacing: 0.5px;">
                      Restablecer mi Contraseña →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Caja Informativa de Seguridad -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0038DF;">
                      🔒 Aviso de Seguridad:
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748B;">
                      Si tú no solicitaste este cambio, puedes ignorar este mensaje con tranquilidad. Tu contraseña actual permanecerá intacta y nadie podrá acceder a tu cuenta sin este enlace.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8; word-break: break-all;">
                Si el botón no funciona, copia y pega este enlace seguro en tu navegador:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #0038DF; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; color: #0038DF;">
                LEGADO DOCENTE
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #9C7316; font-style: italic;">
                «Aprende, comparte, deja huella»
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Plataforma oficial de preparación para el Concurso de Méritos Docente en Colombia.<br>
                Bogotá D.C. • Todos los derechos reservados © 2026.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 2. Plantilla: "Confirm signup" (Confirmar Registro / Bienvenida)
> Selecciona la pestaña **Confirm signup** en Supabase, cambia el Asunto y reemplaza todo el HTML por este:

* **Subject (Asunto):** `🎓 ¡Bienvenido a Legado Docente! Confirma tu cuenta`
* **Message Body (HTML):**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Legado Docente</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="580" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- Barra Superior Oro Metálico -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #9C7316 0%, #E6C565 50%, #8F6812 100%);"></td>
          </tr>

          <!-- Encabezado Azul Rey -->
          <tr>
            <td style="background-color: #0038DF; padding: 40px 32px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.12); border: 1px solid rgba(230, 197, 101, 0.4); border-radius: 9999px; padding: 4px 16px; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #E6C565; text-transform: uppercase;">
                  🏛️ Concurso de Méritos Docente • CNSC
                </span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                ¡Bienvenido a Legado Docente!
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #E6C565; font-style: italic; font-weight: 600;">
                «Aprende, comparte, deja huella»
              </p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #1E293B;">
                Estimado(a) colega docente,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.7; color: #475569;">
                Gracias por unirte a <strong>Legado Docente</strong>. Para activar tu cuenta institucional y acceder a tu <strong>Aula Virtual</strong>, el <strong>Simulador CNSC</strong> y las <strong>140 horas de formación oficial</strong>, confirma tu correo electrónico presionando el siguiente botón:
              </p>

              <!-- Botón Dorado de Acción -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C99E32 0%, #9C7316 100%); color: #1A1A1A; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(201, 158, 50, 0.45); text-transform: uppercase; letter-spacing: 0.5px;">
                      Confirmar mi Cuenta e Ingresar →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 3 Beneficios Clave -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px; padding: 16px;">
                <tr>
                  <td style="font-size: 13px; line-height: 1.8; color: #1E293B;">
                    ✅ <strong>13 Módulos Temáticos:</strong> Aptitudes Básicas, Pedagógico y Disciplinar.<br>
                    ✅ <strong>Simulacros Situacionales:</strong> Casos reales de convivencia (Ley 1620) y evaluación (Decreto 1290).<br>
                    ✅ <strong>Tutor IA MaTech:</strong> Acompañamiento reflexivo continuo 24/7.
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8; word-break: break-all;">
                Si tienes problemas con el botón, copia y pega esta dirección en tu navegador:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #0038DF; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; color: #0038DF;">
                LEGADO DOCENTE
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #9C7316; font-style: italic;">
                «Aprende, comparte, deja huella»
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Recibes este correo porque te has registrado en legadodocente.com.<br>
                Bogotá D.C. • Todos los derechos reservados © 2026.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 3. Plantilla: "Magic Link" (Enlace de inicio de sesión directo)
> Selecciona la pestaña **Magic Link** en Supabase, cambia el Asunto y reemplaza todo el HTML por este:

* **Subject (Asunto):** `✨ Tu enlace de acceso directo a Legado Docente`
* **Message Body (HTML):**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso Directo - Legado Docente</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="580" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #E2E8F0;">
          
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #9C7316 0%, #E6C565 50%, #8F6812 100%);"></td>
          </tr>

          <tr>
            <td style="background-color: #0038DF; padding: 36px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF;">
                Tu Enlace de Acceso Directo
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #E6C565; font-style: italic;">
                «Aprende, comparte, deja huella»
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.7; color: #475569;">
                Haz clic en el siguiente botón para iniciar sesión de forma segura y directa en tu Aula Virtual de <strong>Legado Docente</strong> sin necesidad de digitar tu contraseña:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #C99E32 0%, #9C7316 100%); color: #1A1A1A; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(201, 158, 50, 0.45); text-transform: uppercase; letter-spacing: 0.5px;">
                      Ingresar a mi Aula Virtual →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #94A3B8; word-break: break-all;">
                Enlace directo:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #0038DF; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; color: #0038DF;">
                LEGADO DOCENTE
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Bogotá D.C. • Todos los derechos reservados © 2026.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```
