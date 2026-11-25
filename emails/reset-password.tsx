import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { COLORS, FONTS, IMAGES } from './components/constants';

/**
 * PLANTILLA 3: Recuperación de Contraseña
 * Compatible con Supabase Auth — usa {{ .ConfirmationURL }}
 */
export default function ResetPassword() {
  return (
    <EmailLayout
      preview="Restablece tu contraseña de Legado Docente"
      heroImage={IMAGES.heroPassword}
      heroTitle="Recupera tu acceso"
      heroSubtitle="Estamos aquí para ayudarte"
    >
      <Section style={{ padding: '36px 32px 12px 32px' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-block',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
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
              color: '#92400E',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
            }}
          >
            🔑 Recuperación de contraseña
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
          Restablece tu contraseña
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
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en{' '}
          <strong style={{ color: COLORS.royalBlue }}>Legado Docente</strong>. Haz clic en el siguiente botón
          para crear una nueva contraseña:
        </Text>

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 28px 0' }}>
          <GoldButton href="{{ .ConfirmationURL }}" variant="blue">
            Restablecer mi contraseña
          </GoldButton>
        </div>

        <GoldDivider />

        {/* Security tips */}
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
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: FONTS.display,
              color: COLORS.textDark,
            }}
          >
            🛡️ Consejos de seguridad
          </Text>
          <Text
            style={{
              margin: '0 0 6px 0',
              fontSize: '13px',
              fontFamily: FONTS.sans,
              color: COLORS.textMuted,
              lineHeight: '1.6',
            }}
          >
            • Usa una contraseña de al menos 8 caracteres
          </Text>
          <Text
            style={{
              margin: '0 0 6px 0',
              fontSize: '13px',
              fontFamily: FONTS.sans,
              color: COLORS.textMuted,
              lineHeight: '1.6',
            }}
          >
            • Combina mayúsculas, minúsculas, números y símbolos
          </Text>
          <Text
            style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontFamily: FONTS.sans,
              color: COLORS.textMuted,
              lineHeight: '1.6',
            }}
          >
            • No reutilices contraseñas de otros servicios
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: '12px',
              fontFamily: FONTS.sans,
              color: COLORS.textLight,
              lineHeight: '1.6',
            }}
          >
            Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá activa.
            Este enlace expira en 24 horas.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
}
