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
 * PLANTILLA 1: Confirmación de Cuenta
 * Banner: «Estás a un paso de dejar huella»
 * Botón: «Confirmar mi cuenta» ({{ .ConfirmationURL }})
 */
export default function ConfirmEmail() {
  return (
    <EmailLayout preview="Confirma tu cuenta y activa tu acceso a Legado Docente">
      <EmailHero
        src={EMAIL_ASSETS.banners.confirmEmail}
        alt="Estás a un paso de dejar huella. Confirma tu cuenta y activa tu acceso a la plataforma."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillCheck}
          label="CONFIRMACIÓN DE CUENTA"
        />

        <EmailHeading normalText="Confirma tu" highlightText="cuenta." />

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
          Gracias por registrarte en{' '}
          <strong style={{ color: COLORS.textDark, fontWeight: 700 }}>
            Legado Docente.
          </strong>{' '}
          Haz clic en el siguiente botón para verificar tu correo electrónico y
          comenzar tu experiencia de aprendizaje.
        </Text>

        <EmailButton href="{{ .ConfirmationURL }}">
          Confirmar mi cuenta
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoShield}
          title="Tu registro está listo"
          description="Este enlace es personal y seguro. Te permite verificar tu correo electrónico y activar tu acceso a Legado Docente."
        />
      </Section>
    </EmailLayout>
  );
}
