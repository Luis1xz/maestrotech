import { Section, Text, Img } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { InfoCard } from './components/InfoCard';
import { COLORS, FONTS, IMAGES, BRAND } from './components/constants';

/**
 * PLANTILLA 7: Entrega de Certificado
 * Para integración futura con Resend
 */

interface CertificateDeliveryProps {
  userName?: string;
  courseTitle?: string;
  certificateNumber?: string;
  completionDate?: string;
  hours?: string;
  downloadUrl?: string;
}

export default function CertificateDelivery({
  userName = 'Docente',
  courseTitle = 'Curso Integral de Preparación — Concurso Docente 2026',
  certificateNumber = 'CERT-LD-2026-00456',
  completionDate = '25 de noviembre de 2026',
  hours = '140 horas',
  downloadUrl = 'https://legadodocente.com/certificados/descargar',
}: CertificateDeliveryProps) {
  return (
    <EmailLayout
      preview={`🏆 ¡Tu certificado está listo, ${userName}!`}
      heroImage={IMAGES.heroCertificate}
      heroTitle="¡Lo lograste!"
      heroSubtitle="Tu certificado de formación está listo"
    >
      <Section style={{ padding: '36px 32px 12px 32px' }}>
        {/* Achievement badge */}
        <div
          style={{
            display: 'inline-block',
            background: `linear-gradient(135deg, ${COLORS.goldBase}18, ${COLORS.goldLight}10)`,
            border: `1px solid ${COLORS.goldBase}40`,
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
            🏆 Logro desbloqueado
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
          ¡Felicidades, {userName}!
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
          Has completado exitosamente tu programa de formación. Tu esfuerzo y dedicación han dado frutos.
          Tu certificado está listo para descargar.
        </Text>

        {/* Certificate preview card */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.royalDeep} 0%, ${COLORS.royalDarker} 100%)`,
            borderRadius: '14px',
            padding: '28px',
            textAlign: 'center' as const,
            margin: '0 0 20px 0',
            position: 'relative' as const,
            overflow: 'hidden' as const,
          }}
        >
          {/* Decorative arcs */}
          <div
            style={{
              position: 'absolute' as const,
              top: '-15px',
              right: '-15px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `6px solid ${COLORS.goldBase}`,
              opacity: 0.15,
            }}
          />
          <div
            style={{
              position: 'absolute' as const,
              bottom: '-10px',
              left: '-10px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: `4px solid ${COLORS.goldLight}`,
              opacity: 0.1,
            }}
          />

          <Text
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: FONTS.sans,
              color: COLORS.goldLight,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.15em',
            }}
          >
            Certificado de formación
          </Text>
          <div
            style={{
              margin: '10px auto',
              width: '50px',
              height: '3px',
              background: `linear-gradient(90deg, ${COLORS.goldDark}, ${COLORS.goldLight}, ${COLORS.goldDark})`,
              borderRadius: '2px',
            }}
          />
          <Text
            style={{
              margin: '10px 0 4px 0',
              fontSize: '20px',
              fontWeight: 800,
              fontFamily: FONTS.display,
              color: COLORS.white,
            }}
          >
            {userName}
          </Text>
          <Text
            style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              fontFamily: FONTS.sans,
              color: COLORS.goldLight,
              lineHeight: '1.5',
            }}
          >
            {courseTitle}
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: '11px',
              fontFamily: FONTS.sans,
              color: '#94A3B8',
            }}
          >
            N.° {certificateNumber}
          </Text>
        </div>

        {/* Certificate details */}
        <InfoCard
          title="Datos del certificado"
          items={[
            { label: 'Programa', value: courseTitle },
            { label: 'N.° de certificado', value: certificateNumber },
            { label: 'Fecha de finalización', value: completionDate },
            { label: 'Horas de formación', value: hours },
          ]}
        />

        <GoldDivider />

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 20px 0' }}>
          <GoldButton href={downloadUrl}>
            Descargar certificado
          </GoldButton>
        </div>

        {/* Share message */}
        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: '13px',
            fontFamily: FONTS.sans,
            color: COLORS.textMuted,
            textAlign: 'center' as const,
            lineHeight: '1.6',
          }}
        >
          ¡Comparte tu logro con tus colegas! Tu preparación es un ejemplo para la comunidad docente.
        </Text>
      </Section>
    </EmailLayout>
  );
}
