import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { COLORS, FONTS, IMAGES, BRAND } from './components/constants';

/**
 * PLANTILLA 1: Confirmación de Correo Electrónico
 * Compatible con Supabase Auth — usa {{ .ConfirmationURL }}
 */
export default function ConfirmEmail() {
  return (
    <EmailLayout
      preview="Confirma tu correo electrónico para activar tu cuenta en Legado Docente"
      heroImage={IMAGES.heroEducation}
      heroTitle="¡Estás a un paso!"
      heroSubtitle="Confirma tu correo y comienza tu preparación"
    >
      {/* ── Body Content ── */}
      <Section style={{ padding: '36px 32px 12px 32px' }}>
        {/* Welcome badge */}
        <div
          style={{
            display: 'inline-block',
            background: `linear-gradient(135deg, ${COLORS.royalBlue}12, ${COLORS.royalBlue}08)`,
            border: `1px solid ${COLORS.royalBlue}20`,
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
            ✦ Verificación de cuenta
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
          Confirma tu correo electrónico
        </Text>

        <Text
          style={{
            margin: '0 0 28px 0',
            fontSize: '16px',
            fontFamily: FONTS.sans,
            color: COLORS.textMuted,
            lineHeight: '1.7',
          }}
        >
          ¡Hola! Gracias por registrarte en <strong style={{ color: COLORS.royalBlue }}>Legado Docente</strong>.
          Para activar tu cuenta y comenzar tu preparación para el concurso docente, haz clic en el
          siguiente botón:
        </Text>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 28px 0' }}>
          <GoldButton href="{{ .ConfirmationURL }}">
            Confirmar mi correo electrónico
          </GoldButton>
        </div>

        <GoldDivider />

        {/* Security note */}
        <div
          style={{
            background: COLORS.offWhite,
            borderRadius: '12px',
            border: `1px solid ${COLORS.borderGray}`,
            padding: '20px 24px',
            margin: '0 0 8px 0',
          }}
        >
          <Text
            style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: FONTS.display,
              color: COLORS.textDark,
            }}
          >
            🔒 Nota de seguridad
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: '13px',
              fontFamily: FONTS.sans,
              color: COLORS.textMuted,
              lineHeight: '1.6',
            }}
          >
            Si no creaste una cuenta en Legado Docente, puedes ignorar este correo. Este enlace expira
            en 24 horas por tu seguridad.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
}
