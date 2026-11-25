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

interface CertificateAvailableProps {
  userName?: string;
  courseName?: string;
  duration?: string;
  certificateCode?: string;
  certificateUrl?: string;
}

/**
 * PLANTILLA 7: Certificado Disponible
 * Banner: «Tu esfuerzo merece ser reconocido»
 * Botón: «Ver mi certificado»
 */
export default function CertificateAvailable({
  userName = 'Docente',
  courseName = 'Curso Integral Concurso Docente',
  duration = '140 horas académicas',
  certificateCode = 'LD-CERT-2026-9482',
  certificateUrl = BRAND.dashboardUrl,
}: CertificateAvailableProps) {
  return (
    <EmailLayout preview="¡Felicidades! Tu certificado oficial está disponible en Legado Docente">
      <EmailHero
        src={EMAIL_ASSETS.banners.certificateAvailable}
        alt="Tu esfuerzo merece ser reconocido. Tu certificado ya está disponible para que lo descargues y compartas."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillAward}
          label="CERTIFICADO DISPONIBLE"
        />

        <EmailHeading normalText="Tu certificado está" highlightText="listo." />

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
          Has alcanzado una nueva meta en Legado Docente. Descarga tu certificado y
          conserva este logro como parte de tu crecimiento profesional.
        </Text>

        <EmailDetails
          title="Datos del certificado oficial"
          items={[
            { label: 'Estudiante', value: userName },
            { label: 'Programa', value: courseName },
            { label: 'Intensidad horaria', value: duration },
            { label: 'Código de certificación', value: certificateCode },
          ]}
        />

        <EmailButton href={certificateUrl}>
          Ver mi certificado
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoAward}
          title="Un logro para recordar"
          description="¡Felicidades! Este certificado reconoce tu dedicación, constancia y compromiso con tu desarrollo profesional. Compártelo con tu comunidad y sigue construyendo tu legado en la educación."
        />
      </Section>
    </EmailLayout>
  );
}
