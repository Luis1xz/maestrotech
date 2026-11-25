import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailHero } from './components/EmailHero';
import { EmailPill } from './components/EmailPill';
import { EmailHeading } from './components/EmailHeading';
import { EmailButton } from './components/Button';
import { EmailDivider } from './components/GoldDivider';
import { EmailInfoCard } from './components/EmailInfoCard';
import { EMAIL_ASSETS, FONT_STACK, COLORS } from './components/constants';

/**
 * PLANTILLA 3: Recuperación de Contraseña
 * Banner: «Tu futuro sigue intacto»
 * Botón: «Crear nueva contraseña» ({{ .ConfirmationURL }})
 */
export default function ResetPassword() {
  return (
    <EmailLayout preview="Restablece tu contraseña de Legado Docente">
      <EmailHero
        src={EMAIL_ASSETS.banners.resetPassword}
        alt="Seguridad de tu cuenta — Tu futuro sigue intacto. Recupera tu acceso y continúa dejando huella."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillKey}
          label="RECUPERACIÓN DE CONTRASEÑA"
        />

        <EmailHeading normalText="Restablece tu" highlightText="contraseña." />

        <Text
          style={{
            margin: '0 0 28px 0',
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: FONT_STACK,
            color: COLORS.textMuted,
            lineHeight: '1.6',
            textAlign: 'left',
          }}
        >
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en{' '}
          <strong style={{ color: COLORS.textDark, fontWeight: 700 }}>
            Legado Docente.
          </strong>{' '}
          Haz clic en el siguiente botón para crear una nueva contraseña y recuperar
          el acceso a tu plataforma.
        </Text>

        <EmailButton href="{{ .ConfirmationURL }}">
          Crear nueva contraseña
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoShield}
          title="Tu cuenta está segura"
          description="Este enlace es personal y tiene un tiempo limitado de validez. Si no solicitaste el cambio de contraseña, puedes ignorar este mensaje de forma segura; tu cuenta seguirá protegida."
        />
      </Section>
    </EmailLayout>
  );
}
