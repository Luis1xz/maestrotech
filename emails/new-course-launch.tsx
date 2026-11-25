import { Section, Text, Img } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { COLORS, FONTS, IMAGES, BRAND } from './components/constants';

/**
 * PLANTILLA 8: Lanzamiento de Nuevos Cursos
 * Para integración futura con Resend
 */

interface NewCourseLaunchProps {
  userName?: string;
  courseTitle?: string;
  courseDescription?: string;
  startDate?: string;
  duration?: string;
  price?: string;
  enrollUrl?: string;
}

export default function NewCourseLaunch({
  userName = 'Docente',
  courseTitle = 'Simulacro Nacional — Evaluación Diagnóstica 2026',
  courseDescription = 'Mide tu nivel actual con nuestro simulacro más realista, diseñado con la estructura exacta del examen CNSC. Incluye retroalimentación detallada por competencia.',
  startDate = '15 de diciembre de 2026',
  duration = '4 horas',
  price = '$49.000 COP',
  enrollUrl = 'https://legadodocente.com',
}: NewCourseLaunchProps) {
  return (
    <EmailLayout
      preview={`🚀 ¡Nuevo lanzamiento! ${courseTitle}`}
      heroImage={IMAGES.heroNewCourse}
      heroTitle="¡Nuevo lanzamiento!"
      heroSubtitle="Un nuevo recurso para tu preparación"
    >
      <Section style={{ padding: '36px 32px 12px 32px' }}>
        {/* Launch badge */}
        <div
          style={{
            display: 'inline-block',
            background: `linear-gradient(135deg, ${COLORS.royalBlue}12, ${COLORS.royalDeep}08)`,
            border: `1px solid ${COLORS.royalBlue}25`,
            borderRadius: '50px',
            padding: '6px 16px',
            marginBottom: '20px',
          }}
        >
          <Text
            style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: FONTS.display,
              color: COLORS.royalBlue,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
            }}
          >
            🚀 Nuevo lanzamiento
          </Text>
        </div>

        <Text
          style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: FONTS.sans,
            color: COLORS.textMuted,
          }}
        >
          Hola, {userName}:
        </Text>

        <Text
          style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            fontWeight: 800,
            fontFamily: FONTS.display,
            color: COLORS.textDark,
            lineHeight: '1.3',
          }}
        >
          {courseTitle}
        </Text>

        <Text
          style={{
            margin: '0 0 24px 0',
            fontSize: '16px',
            fontFamily: FONTS.sans,
            color: COLORS.textMuted,
            lineHeight: '1.7',
          }}
        >
          {courseDescription}
        </Text>

        {/* Course info cards */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {/* Date card */}
          <div
            style={{
              flex: 1,
              background: COLORS.offWhite,
              borderRadius: '12px',
              border: `1px solid ${COLORS.borderGray}`,
              padding: '16px',
              textAlign: 'center' as const,
            }}
          >
            <Text
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: FONTS.sans,
                color: COLORS.textMuted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
              }}
            >
              Fecha
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: FONTS.display,
                color: COLORS.textDark,
              }}
            >
              {startDate}
            </Text>
          </div>

          {/* Duration card */}
          <div
            style={{
              flex: 1,
              background: COLORS.offWhite,
              borderRadius: '12px',
              border: `1px solid ${COLORS.borderGray}`,
              padding: '16px',
              textAlign: 'center' as const,
            }}
          >
            <Text
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: FONTS.sans,
                color: COLORS.textMuted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
              }}
            >
              Duración
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: FONTS.display,
                color: COLORS.textDark,
              }}
            >
              {duration}
            </Text>
          </div>

          {/* Price card */}
          <div
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${COLORS.royalBlue}08, ${COLORS.royalDeep}05)`,
              borderRadius: '12px',
              border: `1px solid ${COLORS.royalBlue}20`,
              padding: '16px',
              textAlign: 'center' as const,
            }}
          >
            <Text
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: FONTS.sans,
                color: COLORS.textMuted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
              }}
            >
              Inversión
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: FONTS.display,
                color: COLORS.royalBlue,
              }}
            >
              {price}
            </Text>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 12px 0' }}>
          <GoldButton href={enrollUrl}>
            ¡Quiero inscribirme!
          </GoldButton>
        </div>

        <div style={{ textAlign: 'center' as const, margin: '0 0 24px 0' }}>
          <GoldButton href={`${BRAND.siteUrl}`} variant="outline">
            Conocer más detalles
          </GoldButton>
        </div>

        <GoldDivider />

        {/* Urgency/Scarcity */}
        <div
          style={{
            borderLeft: `4px solid ${COLORS.goldBase}`,
            paddingLeft: '20px',
            margin: '0 0 8px 0',
          }}
        >
          <Text
            style={{
              margin: 0,
              fontSize: '14px',
              fontFamily: FONTS.sans,
              color: COLORS.textMuted,
              lineHeight: '1.6',
            }}
          >
            <strong style={{ color: COLORS.textDark }}>Cupos limitados.</strong> Este programa tiene un número
            reducido de plazas para garantizar la calidad de la experiencia. ¡Asegura tu lugar hoy!
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
}
