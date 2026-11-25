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
 * PLANTILLA 4: Cambio de Correo Electrónico
 * Banner: «Tu identidad, siempre protegida»
 * Botón: «Confirmar nuevo correo» ({{ .ConfirmationURL }})
 */
export default function ChangeEmail() {
  return (
    <EmailLayout preview="Confirma tu nueva dirección de correo en Legado Docente">
      <EmailHero
        src={EMAIL_ASSETS.banners.changeEmail}
        alt="Tu identidad, siempre protegida. Confirma tu nueva dirección de correo y mantén segura tu cuenta."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillMail}
          label="CAMBIO DE CORREO"
        />

        <EmailHeading normalText="Confirma tu nuevo" highlightText="correo." />

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
          Recibimos una solicitud para cambiar la dirección de correo asociada a tu
          cuenta. Verifica el cambio para mantener tu acceso actualizado.
        </Text>

        <EmailButton href="{{ .ConfirmationURL }}">
          Confirmar nuevo correo
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoShield}
          title="Protección de tu identidad"
          description="Este proceso verifica que el cambio de correo fue solicitado por ti. Así mantenemos tu cuenta segura, tu información protegida y tu acceso siempre actualizado."
        />
      </Section>
    </EmailLayout>
  );
}
