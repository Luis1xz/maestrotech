import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { COLORS, FONTS, IMAGES } from './components/constants';

/**
 * PLANTILLA 4: Cambio de Correo Electrónico
 * Compatible con Supabase Auth — usa {{ .ConfirmationURL }}
 */
export default function ChangeEmail() {
  return (
    <EmailLayout
      preview="Confirma tu nuevo correo electrónico en Legado Docente"
      compact
    >
      <Section style={{ padding: '36px 32px 12px 32px' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-block',
            background: `${COLORS.royalBlue}10`,
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
            ✉️ Actualización de correo
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
          Confirma tu nuevo correo
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
          Has solicitado cambiar el correo electrónico asociado a tu cuenta de{' '}
          <strong style={{ color: COLORS.royalBlue }}>Legado Docente</strong>. Para confirmar
          este cambio, haz clic en el siguiente botón:
        </Text>

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 28px 0' }}>
          <GoldButton href="{{ .ConfirmationURL }}">
            Confirmar nuevo correo
          </GoldButton>
        </div>

        <GoldDivider />

        {/* Info box */}
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
            ℹ️ Información importante
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
            Después de confirmar, usarás tu nuevo correo electrónico para iniciar sesión.
            Si no solicitaste este cambio, tu cuenta podría estar comprometida. Contacta
            nuestro equipo de soporte inmediatamente.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
}
