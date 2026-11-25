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

interface EnrollmentSuccessProps {
  userName?: string;
  courseName?: string;
  enrollmentDate?: string;
}

/**
 * PLANTILLA 6: Matrícula Exitosa
 * Banner: «Tu próximo capítulo comienza hoy»
 * Botón: «Comenzar mi formación»
 */
export default function EnrollmentSuccess({
  userName = 'Docente',
  courseName = 'Curso Integral Concurso Docente (140h)',
  enrollmentDate = '25 de noviembre de 2026',
}: EnrollmentSuccessProps) {
  return (
    <EmailLayout preview="¡Tu matrícula ha sido activada! Comienza tu formación en Legado Docente">
      <EmailHero
        src={EMAIL_ASSETS.banners.enrollmentSuccess}
        alt="Tu próximo capítulo comienza hoy. Tu matrícula fue activada y tu formación ya está lista para comenzar."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillCap}
          label="MATRÍCULA EXITOSA"
        />

        <EmailHeading normalText="Tu acceso ya está" highlightText="activo." />

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
          Tu matrícula ha sido procesada exitosamente. Ya puedes ingresar al aula
          virtual y empezar tu proceso de aprendizaje.
        </Text>

        <EmailDetails
          title="Resumen de matrícula"
          items={[
            { label: 'Estudiante', value: userName },
            { label: 'Curso matriculado', value: courseName },
            { label: 'Fecha de activación', value: enrollmentDate },
          ]}
        />

        <EmailButton href={BRAND.dashboardUrl}>
          Comenzar mi formación
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoCap}
          title="Todo listo para iniciar"
          description="Es momento de dar el siguiente paso en tu desarrollo profesional. Explora tus cursos, organiza tu ruta de aprendizaje y aprovecha al máximo todos los recursos de tu formación."
        />
      </Section>
    </EmailLayout>
  );
}
