import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailHero } from './components/EmailHero';
import { EmailPill } from './components/EmailPill';
import { EmailHeading } from './components/EmailHeading';
import { EmailButton } from './components/Button';
import { EmailDivider } from './components/GoldDivider';
import { EmailInfoCard } from './components/EmailInfoCard';
import { EmailDetails } from './components/EmailDetails';
import { EMAIL_ASSETS, BRAND, FONT_STACK, COLORS } from './components/constants';

interface PaymentApprovedProps {
  userName?: string;
  courseName?: string;
  amount?: string;
  paymentDate?: string;
  reference?: string;
  currency?: string;
}

/**
 * PLANTILLA 5: Pago Aprobado
 * Banner: «Has invertido en tu futuro»
 * Botón: «Ver mi compra»
 */
export default function PaymentApproved({
  userName = 'Docente',
  courseName = 'Curso Integral Concurso Docente (140h)',
  amount = '$297.000',
  paymentDate = '25 de noviembre de 2026',
  reference = 'LD-PAY-84920',
  currency = 'COP',
}: PaymentApprovedProps) {
  return (
    <EmailLayout preview="Tu pago ha sido aprobado exitosamente en Legado Docente">
      <EmailHero
        src={EMAIL_ASSETS.banners.paymentApproved}
        alt="Has invertido en tu futuro. Tu pago fue aprobado y tu experiencia continúa avanzando."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillCard}
          label="PAGO APROBADO"
        />

        <EmailHeading normalText="Tu pago fue" highlightText="confirmado." />

        <Text
          style={{
            margin: '0 0 24px 0',
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: FONT_STACK,
            color: COLORS.textMuted,
            lineHeight: '1.6',
            textAlign: 'left',
          }}
        >
          {userName !== 'Docente' && (
            <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: COLORS.textDark }}>
              Hola, {userName}:
            </span>
          )}
          Hemos recibido tu pago correctamente. Ya puedes revisar tu compra y
          continuar con tranquilidad dentro de Legado Docente.
        </Text>

        <EmailDetails
          title="Detalles de la transacción"
          items={[
            { label: 'Estudiante', value: userName },
            { label: 'Programa', value: courseName },
            { label: 'Importe pagado', value: `${amount} ${currency}` },
            { label: 'Fecha de pago', value: paymentDate },
            { label: 'Referencia', value: reference },
          ]}
        />

        <EmailButton href={BRAND.dashboardUrl}>
          Ver mi compra
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoCard}
          title="Pago recibido con éxito"
          description="Tu transacción ha sido registrada correctamente y de forma segura en nuestra plataforma. Puedes consultar los detalles de tu compra desde tu cuenta en Legado Docente."
        />
      </Section>
    </EmailLayout>
  );
}
