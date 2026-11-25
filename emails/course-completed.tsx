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

interface CourseCompletedProps {
  userName?: string;
  courseName?: string;
  completionDate?: string;
  achievementsUrl?: string;
}

/**
 * PLANTILLA 8: Curso Finalizado
 * Banner: «Tu esfuerzo se convierte en legado»
 * Botón: «Ver mis logros»
 */
export default function CourseCompleted({
  userName = 'Docente',
  courseName = 'Curso Integral Concurso Docente (140h)',
  completionDate = '25 de noviembre de 2026',
  achievementsUrl = BRAND.dashboardUrl,
}: CourseCompletedProps) {
  return (
    <EmailLayout preview="¡Felicidades por finalizar tu curso en Legado Docente!">
      <EmailHero
        src={EMAIL_ASSETS.banners.courseCompleted}
        alt="Tu esfuerzo se convierte en legado. Has finalizado tu curso y alcanzado un nuevo logro académico."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillCap}
          label="CURSO FINALIZADO"
        />

        <EmailHeading normalText="¡Felicidades por" highlightText="finalizar!" />

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
          Completaste exitosamente tu formación en{' '}
          <strong style={{ color: COLORS.textDark, fontWeight: 700 }}>
            Legado Docente.
          </strong>{' '}
          Revisa tus logros, comparte tu avance y continúa creciendo con nuevos
          retos.
        </Text>

        <EmailDetails
          title="Resumen del programa completado"
          items={[
            { label: 'Estudiante', value: userName },
            { label: 'Programa', value: courseName },
            { label: 'Fecha de culminación', value: completionDate },
          ]}
        />

        <EmailButton href={achievementsUrl}>
          Ver mis logros
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoAward}
          title="Un paso más en tu trayectoria"
          description="Celebra este logro: es el resultado de tu dedicación, constancia y compromiso con tu desarrollo profesional. Sigue aprendiendo, compartiendo y dejando huella en la educación."
        />
      </Section>
    </EmailLayout>
  );
}
