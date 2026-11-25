import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { GoldButton } from './components/Button';
import { GoldDivider } from './components/GoldDivider';
import { InfoCard } from './components/InfoCard';
import { COLORS, FONTS, IMAGES, BRAND } from './components/constants';

/**
 * PLANTILLA 6: Matrícula Exitosa
 * Para integración futura con Resend
 */

interface EnrollmentSuccessProps {
  userName?: string;
  courseTitle?: string;
  startDate?: string;
  duration?: string;
  modules?: string;
}

export default function EnrollmentSuccess({
  userName = 'Docente',
  courseTitle = 'Curso Integral de Preparación — Concurso Docente 2026',
  startDate = '1 de diciembre de 2026',
  duration = '140 horas',
  modules = '13 módulos temáticos',
}: EnrollmentSuccessProps) {
  return (
    <EmailLayout
      preview={`🎓 ¡Matrícula confirmada! ${courseTitle}`}
      heroImage={IMAGES.heroBooks}
      heroTitle="¡Matrícula exitosa!"
      heroSubtitle="Ya puedes comenzar tu formación"
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
            🎓 Matrícula confirmada
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
          Tu matrícula ha sido registrada exitosamente. Estás oficialmente inscrito/a en el programa
          más completo de preparación para el Concurso de Méritos Docente.
        </Text>

        {/* Course details */}
        <InfoCard
          title="Detalles de tu matrícula"
          items={[
            { label: 'Programa', value: courseTitle },
            { label: 'Fecha de inicio', value: startDate },
            { label: 'Duración', value: duration },
            { label: 'Contenido', value: modules },
          ]}
        />

        {/* Next steps */}
        <Text
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: FONTS.display,
            color: COLORS.royalBlue,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
          }}
        >
          Próximos pasos
        </Text>

        {/* Step 1 */}
        <div style={{ display: 'flex', marginBottom: '12px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.royalBlue}, ${COLORS.royalDeep})`,
              color: COLORS.white,
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: FONTS.display,
              textAlign: 'center' as const,
              lineHeight: '28px',
              flexShrink: 0,
              marginRight: '14px',
            }}
          >
            1
          </div>
          <div>
            <Text style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: COLORS.textDark, fontFamily: FONTS.display }}>
              Completa tu perfil
            </Text>
            <Text style={{ margin: '2px 0 0 0', fontSize: '13px', color: COLORS.textMuted, fontFamily: FONTS.sans }}>
              Agrega tu información para personalizar tu experiencia.
            </Text>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', marginBottom: '12px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.goldDark}, ${COLORS.goldBase})`,
              color: '#1A1A1A',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: FONTS.display,
              textAlign: 'center' as const,
              lineHeight: '28px',
              flexShrink: 0,
              marginRight: '14px',
            }}
          >
            2
          </div>
          <div>
            <Text style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: COLORS.textDark, fontFamily: FONTS.display }}>
              Accede al primer módulo
            </Text>
            <Text style={{ margin: '2px 0 0 0', fontSize: '13px', color: COLORS.textMuted, fontFamily: FONTS.sans }}>
              Comienza con los fundamentos del marco normativo docente.
            </Text>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', marginBottom: '28px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.royalBlue}, ${COLORS.royalDeep})`,
              color: COLORS.white,
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: FONTS.display,
              textAlign: 'center' as const,
              lineHeight: '28px',
              flexShrink: 0,
              marginRight: '14px',
            }}
          >
            3
          </div>
          <div>
            <Text style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: COLORS.textDark, fontFamily: FONTS.display }}>
              Realiza tu primer simulacro
            </Text>
            <Text style={{ margin: '2px 0 0 0', fontSize: '13px', color: COLORS.textMuted, fontFamily: FONTS.sans }}>
              Evalúa tu nivel inicial y traza tu plan de estudio.
            </Text>
          </div>
        </div>

        <GoldDivider />

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '0 0 8px 0' }}>
          <GoldButton href={`${BRAND.siteUrl}`}>
            Comenzar a estudiar
          </GoldButton>
        </div>
      </Section>
    </EmailLayout>
  );
}
