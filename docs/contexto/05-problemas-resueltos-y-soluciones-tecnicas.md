# 🛠️ 05. Problemas Resueltos y Soluciones Técnicas

Este documento reúne las incidencias críticas encontradas a lo largo del desarrollo, su análisis técnico detallado y las soluciones definitivas implementadas en la plataforma.

---

## 🛑 1. Fallo: Correos Llegaban Totalmente Vacíos a Gmail

### Síntoma:
Al enviar los correos de prueba generados con React Email a cuentas de Gmail, los mensajes se abrían completamente en blanco o colapsaban a 0px de altura.

### Análisis y Causa Raíz:
1. **Etiquetas de cierre multilínea:** Al utilizar `render(..., { pretty: true })`, el formateador de React Email partía etiquetas de cierre en varias líneas:
   ```html
   </a
   >
   </span
   >
   ```
   El motor de saneamiento HTML de Gmail interpreta un salto de línea dentro de un tag de cierre como una etiqueta malformada o no cerrada, lo que provocaba que descartara el nodo completo o colapsara la tabla anidada.
2. **Caracteres de control invisibles en `<Preview>`:** El componente `<Preview>` de `@react-email/components` inyectaba un contenedor oculto con más de 90 caracteres invisibles Unicode (`\u200c`, `\u200b`, zero-width spaces). Estos caracteres producían fallos en el parser de plantillas Go de Supabase y en la previsualización del iframe.

### Solución Implementada:
1. Desactivación de formato embellecido: `{ pretty: false }` al compilar con `render()`.
2. Creación del sanitizador estricto `cleanEmailHtml()` en `lib/email/transactional.ts`:
   ```typescript
   export function cleanEmailHtml(raw: string): string {
     let clean = raw;
     clean = clean.replace(/<div[^>]*data-skip-in-text="true"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
     clean = clean.replace(/<!--\/?\$-->/g, '');
     clean = clean.replace(/<!--\/?(html|head|body)-->/g, '');
     clean = clean.replace(/<!--\s*-->/g, '');
     clean = clean.replace(/<\/\s*([a-zA-Z0-9]+)\s*>/g, '</$1>');
     clean = clean.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');
     return clean.trim();
   }
   ```

---

## 🛑 2. Fallo: "Error sending recovery email" en Supabase Auth

### Síntoma:
Al intentar restablecer contraseña desde la interfaz de login o solicitar confirmación a un correo nuevo, Supabase arrojaba `Error sending recovery email`.

### Causa Raíz:
El proyecto de Supabase estaba enlazado al servidor SMTP de Resend (`smtp.resend.com`) empleando la cuenta de prueba gratuita y el remitente genérico `onboarding@resend.dev`. La política de seguridad de Resend para cuentas en modo evaluación bloquea el envío hacia cualquier destinatario diferente al correo registrado del propietario (`luisalfonso1818@gmail.com`), retornando el código de rechazo:
```text
550 You can only send testing emails to your own email address
```

### Solución:
- En fase de desarrollo: Realizar pruebas exclusivamente dirigidas a la cuenta del propietario.
- En fase de despliegue: Verificar los registros DNS del dominio `legadodocente.com` en Resend para habilitar el envío masivo e irrestricto.

---

## 🛑 3. Fallo: Banners Pixelados en Pantallas de Alta Densidad

### Síntoma:
Los banners originales de los correos se visualizaban borrosos o pixelados al ser abiertos en pantallas de computadores modernos y dispositivos móviles con pantallas Retina / OLED.

### Solución:
- El usuario facilitó el archivo `legado-docente-4k.zip` con los renders originales de alta fidelidad.
- Se procesaron las imágenes a 1200×400 px con compresión JPEG al 95% de calidad (calidad 2x para un ancho visual de correo de 600 px).
- Se cargaron al bucket público de Supabase Storage `email-assets/banners/`, logrando nitidez cristalina en cualquier dispositivo.

---

## 🛑 4. Fallo: Logo con Fondo Blanco no Deseado

### Síntoma:
En versiones anteriores, el logo aparecía encerrado dentro de un círculo o recuadro blanco que cortaba la fluidez visual del diseño.

### Solución:
- Se extrajo el logo oficial desde `media_1795648461536_2786d63d.png` manteniendo el canal Alfa RGBA con 100% de transparencia.
- Se actualizó el archivo en Supabase Storage `email-assets/branding/legado-logo.png`.
- Ahora el isotipo y el texto institucional reposan limpiamente sobre el fondo blanco del card sin ningún artefacto visual alrededor.

---

## 🛑 5. Fallo: Footer Roto en Clientes sin Soporte de Background-Image CSS

### Síntoma:
Gmail y Outlook eliminan habitualmente las propiedades CSS `background-image` embebidas en etiquetas `<td>`. En consecuencia, el pie de página perdía sus gráficos característicos.

### Solución:
- Se generó el asset institucional `banner-footer.jpg` (1200×400 px) a partir del diseño maestro `footer.png`.
- El componente `emails/components/Footer.tsx` fue reescrito para utilizar una etiqueta de imagen HTML pura (`<img src="..." width="600" />`), garantizando renderizado perfecto en el 100% de los clientes de correo, complementado con una barra de enlaces planos en HTML accesible.
