import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { InfoCard } from './components/InfoCard';
import { COLORS, FONTS, IMAGES, BRAND } from './components/constants';

/**
 * PLANTILLA 5: Confirmación de Pago
 * Para integración futura con Resend
 */

interface PaymentConfirmationProps {
  userName?: string;
  planName?: string;
  amount?: string;
  reference?: string;
  paymentDate?: string;
  paymentMethod?: string;
}

export default function PaymentConfirmation({
  userName = 'Docente',
  planName = 'Plan Premium — Curso Integral 140h',
  amount = '$297.000 COP',
  reference = 'LD-2026-001234',
  paymentDate = '25 de noviembre de 2026',
  paymentMethod = 'Tarjeta de crédito',
}: PaymentConfirmationProps) {
  return (
    <EmailLayout
      preview={`✅ Pago confirmado — ${planName}`}
      heroImage={IMAGES.heroCelebration}
      heroTitle="¡Pago exitoso!"
      heroSubtitle="Tu inversión en educación está confirmada"
    >
      <Section style={{ padding: '36px 32px 12px 32px' }}>
        {/* Success badge */}
        <div
          style={{
            display: 'inline-block',
            background: COLORS.successBg,
            border: `1px solid ${COLORS.success}30`,
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
              color: '#065F46',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
            }}
          >
            ✓ Pago confirmado
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
          ¡Gracias, {userName}!
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
          Hemos recibido tu pago exitosamente. A continuación encontrarás los detalles de tu transacción.
        </Text>

        {/* Amount highlight */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.royalDeep} 0%, ${COLORS.royalBlue} 100%)`,
            borderRadius: '14px',
            padding: '24px 28px',
            textAlign: 'center' as const,
            margin: '0 0 20px 0',
          }}
        >
          <Text
            style={{
              margin: '0 0 4px 0',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: FONTS.sans,
              color: COLORS.goldLight,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
            }}
          >
            Total pagado
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: '36px',
              fontWeight: 800,
              fontFamily: FONTS.display,
              color: COLORS.white,
              letterSpacing: '-0.02em',
            }}
          >
            {amount}
          </Text>
        </div>

        {/* Payment details */}
        <InfoCard
          title="Detalles de la transacción"
          items={[
            { label: 'Plan', value: planName },
            { label: 'Referencia', value: reference },
            { label: 'Fecha', value: paymentDate },
            { label: 'Método de pago', value: paymentMethod },
          ]}
        />

        <GoldDivider />

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 20px 0' }}>
          <GoldButton href={`${BRAND.siteUrl}`}>
            Ir a mi cuenta
          </GoldButton>
        </div>

        {/* Receipt note */}
        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontFamily: FONTS.sans,
            color: COLORS.textLight,
            textAlign: 'center' as const,
            lineHeight: '1.6',
          }}
        >
          Este correo es tu comprobante de pago. Guárdalo para tus registros.
          Si necesitas una factura, contáctanos.
        </Text>
      </Section>
    </EmailLayout>
  );
}
