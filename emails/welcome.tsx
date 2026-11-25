import { Section, Text, Img } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { COLORS, FONTS, IMAGES, BRAND } from './components/constants';

/**
 * PLANTILLA 2: Bienvenida a Legado Docente
 * Se envía tras confirmar el email
 */

interface WelcomeProps {
  userName?: string;
}

export default function Welcome({ userName = 'Docente' }: WelcomeProps) {
  return (
    <EmailLayout
      preview={`¡Bienvenido/a a Legado Docente, ${userName}! Tu preparación comienza ahora.`}
      heroImage={IMAGES.heroTeaching}
      heroTitle={`¡Bienvenido/a, ${userName}!`}
      heroSubtitle="Tu camino al concurso docente empieza hoy"
    >
      {/* ── Body Content ── */}
      <Section style={{ padding: '36px 32px 12px 32px' }}>
        {/* Welcome badge */}
        <div
          style={{
            display: 'inline-block',
            background: `linear-gradient(135deg, ${COLORS.goldBase}18, ${COLORS.goldLight}10)`,
            border: `1px solid ${COLORS.goldBase}30`,
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
              color: COLORS.goldDark,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
            }}
          >
            ✦ Bienvenido/a a la comunidad
          </Text>
        </div>

        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: 800,
            fontFamily: FONTS.display,
            color: COLORS.textDark,
            lineHeight: '1.3',
          }}
        >
          ¡Tu cuenta está activa!
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
          Ahora eres parte de <strong style={{ color: COLORS.royalBlue }}>Legado Docente</strong>, la plataforma
          que te acompaña en tu preparación para el Concurso de Méritos Docente en Colombia. Estamos
          comprometidos con tu éxito.
        </Text>

        {/* What's included cards */}
        <Text
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: FONTS.display,
            color: COLORS.royalBlue,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
          }}
        >
          Lo que te espera
        </Text>

        {/* Feature 1 */}
        <div
          style={{
            background: COLORS.offWhite,
            borderRadius: '12px',
            border: `1px solid ${COLORS.borderGray}`,
            padding: '18px 22px',
            marginBottom: '10px',
          }}
        >
          <Text style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: COLORS.textDark, fontFamily: FONTS.display }}>
            📚 Curso integral de 140 horas
          </Text>
          <Text style={{ margin: '4px 0 0 0', fontSize: '13px', color: COLORS.textMuted, fontFamily: FONTS.sans, lineHeight: '1.5' }}>
            13 módulos temáticos alineados al 100% con los lineamientos del CNSC y el MEN.
          </Text>
        </div>

        {/* Feature 2 */}
        <div
          style={{
            background: COLORS.offWhite,
            borderRadius: '12px',
            border: `1px solid ${COLORS.borderGray}`,
            padding: '18px 22px',
            marginBottom: '10px',
          }}
        >
          <Text style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: COLORS.textDark, fontFamily: FONTS.display }}>
            🎯 Simulacros y evaluación
          </Text>
          <Text style={{ margin: '4px 0 0 0', fontSize: '13px', color: COLORS.textMuted, fontFamily: FONTS.sans, lineHeight: '1.5' }}>
            Practica con evaluaciones realistas para medir tu progreso y fortalecer tus debilidades.
          </Text>
        </div>

        {/* Feature 3 */}
        <div
          style={{
            background: COLORS.offWhite,
            borderRadius: '12px',
            border: `1px solid ${COLORS.borderGray}`,
            padding: '18px 22px',
            marginBottom: '24px',
          }}
        >
          <Text style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: COLORS.textDark, fontFamily: FONTS.display }}>
            🤖 MaTech — Tu tutor inteligente
          </Text>
          <Text style={{ margin: '4px 0 0 0', fontSize: '13px', color: COLORS.textMuted, fontFamily: FONTS.sans, lineHeight: '1.5' }}>
            Un asistente con IA diseñado para resolver tus dudas sobre el concurso docente.
          </Text>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 12px 0' }}>
          <GoldButton href={`${BRAND.siteUrl}`}>
            Explorar la plataforma
          </GoldButton>
        </div>

        <GoldDivider />

        {/* Motivational quote */}
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
              fontSize: '15px',
              fontStyle: 'italic' as const,
              color: COLORS.textMuted,
              fontFamily: FONTS.display,
              lineHeight: '1.6',
            }}
          >
            «La educación es el arma más poderosa que puedes usar para cambiar el mundo.»
          </Text>
          <Text
            style={{
              margin: '8px 0 0 0',
              fontSize: '13px',
              fontWeight: 700,
              color: COLORS.goldDark,
              fontFamily: FONTS.display,
            }}
          >
            — Nelson Mandela
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
}
