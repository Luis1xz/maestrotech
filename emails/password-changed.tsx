import { Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';
import { EmailHero } from './components/EmailHero';
import { EmailPill } from './components/EmailPill';
import { EmailHeading } from './components/EmailHeading';
import { EmailButton } from './components/Button';
import { EmailDivider } from './components/GoldDivider';
import { EmailInfoCard } from './components/EmailInfoCard';
import { EMAIL_ASSETS, BRAND, COLORS, FONT_STACK } from './components/constants';

interface PasswordChangedProps {
  studentName?: string;
  loginUrl?: string;
  date?: string;
}

export default function PasswordChanged({
  studentName = 'Docente',
  loginUrl = `${BRAND.siteUrl}/?view=login`,
  date,
}: PasswordChangedProps) {
  const displayDate =
    date ||
    new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <EmailLayout preview="Tu contraseña de Legado Docente ha sido cambiada exitosamente.">
      {/* 1. Hero Banner 4K */}
      <EmailHero
        src={EMAIL_ASSETS.banners.passwordChanged}
        alt="Tu contraseña ha sido cambiada. Tu nueva contraseña ya está activa."
      />

      {/* 2. Body Container */}
      <Section className="body-pad" style={{ padding: '36px 36px 32px 36px' }}>
        {/* Pill badge */}
        <EmailPill
          iconSrc={EMAIL_ASSETS.icons.pillCheck}
          label="SEGURIDAD DE LA CUENTA"
        />

        {/* Contundente Heading */}
        <EmailHeading
          normalText="Tu contraseña ha sido"
          highlightText="actualizada."
        />

        {/* Descriptive text */}
        <Text
          style={{
            margin: '0 0 28px 0',
            fontSize: '16px',
            lineHeight: '1.6',
            fontFamily: FONT_STACK,
            color: COLORS.textMuted,
            textAlign: 'left',
          }}
        >
          Hola <strong style={{ color: COLORS.textDark, fontWeight: 700 }}>{studentName}</strong>, te confirmamos que la contraseña de tu cuenta en{' '}
          <strong style={{ color: COLORS.textDark, fontWeight: 700 }}>{BRAND.name}</strong> ha sido modificada correctamente el{' '}
          <strong style={{ color: COLORS.textDark, fontWeight: 700 }}>{displayDate}</strong>. Tu nueva clave ya se encuentra activa para iniciar sesión.
        </Text>

        {/* Botón principal */}
        <EmailButton href={loginUrl}>
          Iniciar sesión en mi cuenta
        </EmailButton>

        {/* Divisor dorado */}
        <EmailDivider />

        {/* Tarjeta de Seguridad "¿No fuiste tú?" */}
        <EmailInfoCard
          icon={EMAIL_ASSETS.icons.infoShield}
          title="¿No realizaste este cambio?"
          description="Si tú no solicitaste este cambio, te recomendamos restablecer tu contraseña de inmediato desde el login o comunicarte con nuestro equipo de soporte para proteger el acceso a tu cuenta."
        />
      </Section>
    </EmailLayout>
  );
}
