import {
  Section,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components';
import { BRAND, COLORS, FONTS, IMAGES } from './constants';

export function Footer() {
  return (
    <>
      {/* ── Gold Divider ── */}
      <Section style={{ padding: '0 32px' }}>
        <div
          style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.goldBase} 20%, ${COLORS.goldLight} 50%, ${COLORS.goldBase} 80%, transparent 100%)`,
            margin: '0 auto',
          }}
        />
      </Section>

      {/* ── Footer Content ── */}
      <Section
        style={{
          background: `linear-gradient(180deg, ${COLORS.offWhite} 0%, #EEF2F7 100%)`,
          padding: '32px 32px 24px 32px',
          textAlign: 'center' as const,
        }}
      >
        {/* Logo icon small */}
        <Img
          src={IMAGES.logoIcon}
          alt={BRAND.name}
          width="40"
          height="40"
          style={{
            margin: '0 auto 12px auto',
            display: 'block',
            borderRadius: '10px',
          }}
        />

        {/* Slogan */}
        <Text
          style={{
            margin: '0 0 16px 0',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: FONTS.display,
            color: COLORS.royalBlue,
            letterSpacing: '0.02em',
            fontStyle: 'italic' as const,
          }}
        >
          «{BRAND.slogan}»
        </Text>

        {/* Quick Links */}
        <Text
          style={{
            margin: '0 0 16px 0',
            fontSize: '13px',
            fontFamily: FONTS.sans,
            color: COLORS.textMuted,
            lineHeight: '24px',
          }}
        >
          <Link href={BRAND.siteUrl} style={{ color: COLORS.royalBlue, textDecoration: 'none', fontWeight: 600 }}>
            Inicio
          </Link>
          {'  •  '}
          <Link href={`${BRAND.siteUrl}/cursos`} style={{ color: COLORS.royalBlue, textDecoration: 'none', fontWeight: 600 }}>
            Cursos
          </Link>
          {'  •  '}
          <Link href={BRAND.whatsappUrl} style={{ color: COLORS.royalBlue, textDecoration: 'none', fontWeight: 600 }}>
            Soporte
          </Link>
        </Text>

        {/* Contact info */}
        <Text
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontFamily: FONTS.sans,
            color: COLORS.textLight,
            lineHeight: '20px',
          }}
        >
          ¿Necesitas ayuda? Escríbenos por{' '}
          <Link href={BRAND.whatsappUrl} style={{ color: COLORS.goldDark, textDecoration: 'underline' }}>
            WhatsApp
          </Link>
          {' '}o a{' '}
          <Link href={`mailto:${BRAND.adminEmail}`} style={{ color: COLORS.goldDark, textDecoration: 'underline' }}>
            {BRAND.adminEmail}
          </Link>
        </Text>

        {/* Decorative golden arc */}
        <div
          style={{
            margin: '20px auto 12px auto',
            width: '60px',
            height: '30px',
            borderTop: `3px solid ${COLORS.goldBase}`,
            borderLeft: `3px solid ${COLORS.goldBase}`,
            borderRight: `3px solid ${COLORS.goldBase}`,
            borderBottom: 'none',
            borderRadius: '30px 30px 0 0',
            opacity: 0.3,
          }}
        />

        {/* Copyright */}
        <Text
          style={{
            margin: 0,
            fontSize: '11px',
            fontFamily: FONTS.sans,
            color: COLORS.textLight,
            lineHeight: '18px',
          }}
        >
          © {BRAND.year} {BRAND.name}. Todos los derechos reservados.
          <br />
          Colombia 🇨🇴
        </Text>
      </Section>

      {/* ── Bottom Gold Bar ── */}
      <Section
        style={{
          background: `linear-gradient(90deg, ${COLORS.goldDark} 0%, ${COLORS.goldBase} 30%, ${COLORS.goldLight} 50%, ${COLORS.goldBase} 70%, ${COLORS.goldDark} 100%)`,
          height: '5px',
          width: '100%',
          borderRadius: '0 0 8px 8px',
        }}
      />
    </>
  );
}
