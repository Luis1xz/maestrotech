# 🎨 02. Sistema de Diseño e Identidad de Marca — Legado Docente

Este documento consolida las directrices visuales, cromáticas y de diseño que rigen la interfaz de usuario y las comunicaciones por correo electrónico de **Legado Docente**.

---

## 🔵 1. Paleta Cromática Oficial

El sistema visual combina la seriedad académica del **Azul Real / Azul Marino** con el prestigio y excelencia del **Dorado Metálico**.

| Nombre del Color | Hexadecimal | Uso Principal |
| :--- | :--- | :--- |
| **Azul Real (Principal)** | `#0038DF` | Botones CTA principales, destaques de títulos, enlaces y acentos. |
| **Azul Profundo (Navy)** | `#002299` | Subtítulos, lemas y fondos de cabecera. |
| **Azul Oscuro (Dark Navy)**| `#001875` | Bordes profundos y sombras de marca. |
| **Dorado Base (Gold)** | `#C99E32` | Divisores ornamentales, arcos del isotipo y bordes selectos. |
| **Dorado Luminoso** | `#F2D074` | Separadores de enlaces en footer y texto secundario sobre fondos oscuros. |
| **Dorado Oscuro** | `#9C7316` | Textos dentro de insignias (pills) doradas. |
| **Gris Oscuro (Texto Principal)**| `#0F172A` | Títulos principales, textos en negrita y encabezados. |
| **Gris Medio (Párrafos)** | `#475569` | Texto descriptivo de lectura continua en emails y web. |
| **Fondo General (Page BG)** | `#EEF3F9` | Fondo exterior para dar contraste a la tarjeta blanca. |
| **Blanco Puro (Card BG)** | `#FFFFFF` | Contenedor principal del correo y fondo de módulos. |

---

## 🖋️ 2. Tipografía y Jerarquía

- **Tipografía Primaria:** `Plus Jakarta Sans` (Google Fonts) — Pesos 500, 700 y 800.
- **Tipografía Secundaria / Fallback:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica`, `Arial`, `sans-serif`.
- **Pila Tipográfica en Correos:**
  ```css
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  ```

### Jerarquía en Emails:
1. **Encabezado Institucional:** 20px, peso 800, mayúsculas, color `#0038DF`.
2. **Lema de Marca:** 13px, peso 500 cursiva, color `#002299`.
3. **Insignia (Pill):** 11.5px, peso 800, mayúsculas, fondo `#FFFBEB`, borde `#F5D380`, texto `#92600E`.
4. **Título Principal (Hero Heading):** 28px (móvil: 24px), peso 800, interlineado 1.2, color `#0F172A` con highlight en `#0038DF`.
5. **Cuerpo de Texto:** 16px, interlineado 1.6, color `#475569`.
6. **Botón Principal:** 16px, peso 700, padding 14px 34px, bordes redondeados completos (pill-shaped `border-radius: 9999px`).

---

## 🛡️ 3. Reglas del Logo Oficial

- **Formato:** PNG en espacio de color RGBA (Canal Alfa con 100% de transparencia).
- **Archivo en Storage:** `https://eklolnecteffjzbjbjmr.supabase.co/storage/v1/object/public/email-assets/branding/legado-logo.png`
- **Regla Estricta:** El logo **NUNCA** debe montarse sobre un disco, círculo o recuadro blanco que tape el fondo. Debe reposar directamente con su transparencia natural sobre el fondo blanco del card.
- **Isotipo:** Letra "L" azul rodeada por tres arcos dorados ascendentes.

---

## 🖼️ 4. Especificaciones de Banners Oficiales (4K Retina)

Todos los banners provienen de los renders maestros en alta definición del usuario y han sido estandarizados con las siguientes propiedades:

- **Dimensiones de Entrega:** 1200 px de ancho × 400 px de alto (Relación de aspecto 3:1).
- **Visualización en Email:** 600 px de ancho (Escalado 2x nativo para nitidez perfecta en pantallas Retina y smartphones modernos).
- **Formato:** JPEG con factor de compresión de calidad 95% y muestreo cromático balanceado para descarga ultrarrápida.
- **Ubicación Pública:** Supabase Storage bucket `email-assets/banners/`.

---

## 📑 5. Estructura del Footer Oficial

El pie de página consta de dos secciones contiguas:
1. **Banner Gráfico 4K:** `banner-footer.jpg` (1200×400 px, fondo azul oscuro con olas abstractas e isotipo estilizado).
2. **Barra de Navegación Funcional:** Fondo `#00145A`, tipografía 13px con enlaces blancos (`#FFFFFF`) separados por puntos dorados (`•` `#F2D074`):
   - `Inicio` -> `https://legadodocente.com`
   - `Aula virtual` -> `https://legadodocente.com/?view=dashboard`
   - `Soporte` -> WhatsApp oficial de soporte docente.
