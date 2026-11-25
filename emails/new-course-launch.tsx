import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailHero } from './components/EmailHero';
import { EmailPill } from './components/EmailPill';
import { EmailHeading } from './components/EmailHeading';
import { EmailButton } from './components/Button';
import { EmailDivider } from './components/GoldDivider';
import { EmailInfoCard } from './components/EmailInfoCard';
import { EmailDetails } from './components/EmailDetails';
import { EMAIL_ASSETS, BRAND, FONT_STACK, COLORS } from './components/constants';

interface NewCourseLaunchProps {
  userName?: string;
  courseName?: string;
  description?: string;
  duration?: string;
  price?: string;
  courseUrl?: string;
  unsubscribeUrl?: string;
}

/**
 * PLANTILLA 9: Lanzamiento de Nuevo Curso
 * Banner: «Nunca dejes de aprender»
 * Botón: «Descubrir el programa»
 */
export default function NewCourseLaunch({
  userName = 'Docente',
  courseName = 'Simulacro Intensivo de Prueba Pedagógica 2026',
  description = 'Prepárate con casos prácticos reales, metodología oficial CNSC y retroalimentación personalizada.',
  duration = '40 horas prácticas',
  price = '$149.000 COP',
  courseUrl = BRAND.coursesUrl,
  unsubscribeUrl = `${BRAND.siteUrl}/preferencias-correo`,
}: NewCourseLaunchProps) {
  return (
    <EmailLayout preview={`Nuevo programa disponible en Legado Docente: ${courseName}`}>
      <EmailHero
        src={EMAIL_ASSETS.banners.newCourseLaunch}
        alt="Nunca dejes de aprender. Hemos preparado un nuevo programa para seguir impulsando tu crecimiento."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillCap}
          label="NUEVO CURSO"
        />

        <EmailHeading normalText="Descubre un nuevo" highlightText="programa." />

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
          Explora una nueva oportunidad de formación en{' '}
          <strong style={{ color: COLORS.textDark, fontWeight: 700 }}>
            Legado Docente.
          </strong>{' '}
          Accede a más contenidos, herramientas y experiencias para seguir dejando
          huella.
        </Text>

        <EmailDetails
          title="Ficha del nuevo programa"
          items={[
            { label: 'Programa', value: courseName },
            { label: 'Descripción', value: description },
            { label: 'Duración', value: duration },
            { label: 'Precio', value: price },
          ]}
        />

        <EmailButton href={courseUrl}>
          Descubrir el programa
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoCap}
          title="Una nueva oportunidad te espera"
          description="Sigue fortaleciendo tus conocimientos, desarrolla nuevas competencias y amplía tu impacto como docente. Es el momento de seguir aprendiendo, creciendo y dejando huella."
        />

        {/* Unsubscribe link for commercial / marketing compliance */}
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          style={{ marginTop: '20px' }}
        >
          <tbody>
            <tr>
              <td align="center">
                <Text
                  style={{
                    margin: 0,
                    fontSize: '11.5px',
                    fontFamily: FONT_STACK,
                    color: COLORS.textLight,
                    lineHeight: '1.5',
                  }}
                >
                  Recibes esta comunicación porque eres miembro de Legado Docente. Si prefieres no recibir avisos de nuevos cursos, puedes{' '}
                  <Link
                    href={unsubscribeUrl}
                    style={{
                      color: COLORS.royalBlue,
                      textDecoration: 'underline',
                    }}
                  >
                    administrar tus preferencias aquí
                  </Link>
                  .
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
    </EmailLayout>
  );
}
