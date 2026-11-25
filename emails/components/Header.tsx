import {
  Section,
  Img,
  Row,
  Column,
} from '@react-email/components';
import { BRAND, COLORS, IMAGES, LAYOUT } from './constants';

interface HeaderProps {
  /** Hero background image URL */
  heroImage?: string;
  /** Short title overlaid on the hero */
  heroTitle?: string;
  /** Sub-title overlaid on the hero */
  heroSubtitle?: string;
  /** Use compact header (no hero image) */
  compact?: boolean;
}

export function Header({
  heroImage,
  heroTitle,
  heroSubtitle,
  compact = false,
}: HeaderProps) {
  return (
    <>
      {/* ── Top Gold Accent Bar ── */}
      <Section
        style={{
          background: `linear-gradient(90deg, ${COLORS.goldDark} 0%, ${COLORS.goldBase} 30%, ${COLORS.goldLight} 50%, ${COLORS.goldBase} 70%, ${COLORS.goldDark} 100%)`,
          height: '5px',
          width: '100%',
        }}
      />

      {/* ── Logo Section ── */}
      <Section
        style={{
          background: `radial-gradient(circle at 50% 80%, ${COLORS.royalBlue} 0%, ${COLORS.royalDeep} 60%, ${COLORS.royalDarker} 100%)`,
          padding: '28px 0 20px 0',
          textAlign: 'center' as const,
          position: 'relative' as const,
        }}
      >
        {/* Decorative golden arcs – left */}
        <div
          style={{
            position: 'absolute' as const,
            top: '-20px',
            left: '-30px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: `8px solid ${COLORS.goldBase}`,
            opacity: 0.12,
          }}
        />
        {/* Decorative golden arcs – right */}
        <div
          style={{
            position: 'absolute' as const,
            bottom: '-25px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: `6px solid ${COLORS.goldLight}`,
            opacity: 0.10,
          }}
        />

        <Img
          src={IMAGES.logo}
          alt={BRAND.name}
          width="200"
          height="auto"
          style={{
            margin: '0 auto',
            display: 'block',
          }}
        />
      </Section>

      {/* ── Hero Image Section ── */}
      {!compact && heroImage && (
        <Section
          style={{
            position: 'relative' as const,
            overflow: 'hidden' as const,
          }}
        >
          <Img
            src={heroImage}
            alt=""
            width={LAYOUT.maxWidth}
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover' as const,
              display: 'block',
            }}
          />
          {/* Dark overlay gradient */}
          <div
            style={{
              position: 'absolute' as const,
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(to top, rgba(0,34,153,0.85) 0%, rgba(0,56,223,0.3) 60%, transparent 100%)',
            }}
          />
          {/* Hero text overlay */}
          {heroTitle && (
            <div
              style={{
                position: 'absolute' as const,
                bottom: '24px',
                left: LAYOUT.padding + 'px',
                right: LAYOUT.padding + 'px',
              }}
            >
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '26px',
                  fontWeight: 800,
                  color: COLORS.white,
                  lineHeight: '1.2',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                }}
              >
                {heroTitle}
              </p>
              {heroSubtitle && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: COLORS.goldLight,
                    letterSpacing: '0.03em',
                    textShadow: '0 1px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  {heroSubtitle}
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      {/* ── Bottom Gold Thin Line ── */}
      <Section
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.goldBase} 20%, ${COLORS.goldLight} 50%, ${COLORS.goldBase} 80%, transparent 100%)`,
          height: '3px',
          width: '100%',
        }}
      />
    </>
  );
}
