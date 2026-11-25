import { Section, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailHero } from './components/EmailHero';
import { EmailPill } from './components/EmailPill';
import { EmailHeading } from './components/EmailHeading';
import { EmailButton } from './components/Button';
import { EmailDivider } from './components/GoldDivider';
import { EmailInfoCard } from './components/EmailInfoCard';
import { EMAIL_ASSETS, BRAND, FONT_STACK, COLORS } from './components/constants';

interface WelcomeProps {
  userName?: string;
}

/**
 * PLANTILLA 2: Bienvenida a Legado Docente
 * Banner: «Los grandes docentes dejan huella»
 * Botón: «Explorar mi aula virtual»
 */
export default function Welcome({ userName = 'Docente' }: WelcomeProps) {
  return (
    <EmailLayout preview="¡Bienvenido a Legado Docente! Tu aula virtual está lista.">
      <EmailHero
        src={EMAIL_ASSETS.banners.welcome}
        alt="Los grandes docentes dejan huella. Bienvenido a una comunidad creada para aprender, compartir y crecer."
      />

      <Section className="body-pad" style={{ padding: '36px 36px 36px 36px' }}>
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillCap}
          label="BIENVENIDO A LEGADO DOCENTE"
        />

        <EmailHeading normalText="Bienvenido a tu" highlightText="aula." />

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
          {userName !== 'Docente' && (
            <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: COLORS.textDark }}>
              Hola, {userName}:
            </span>
          )}
          Tu cuenta ya está activa. Explora tus cursos, descubre nuevos recursos y
          comienza hoy mismo tu camino de formación.
        </Text>

        <EmailButton href={BRAND.dashboardUrl}>
          Explorar mi aula virtual
        </EmailButton>

        <EmailDivider />

        <EmailInfoCard
          iconSrc={EMAIL_ASSETS.icons.infoCap}
          title="Tu camino empieza hoy"
          description="Aprovecha al máximo tu experiencia en Legado Docente. Sigue aprendiendo, comparte tus conocimientos y sigue creciendo como docente. Tu labor inspira y deja huella."
        />
      </Section>
    </EmailLayout>
  );
}
