import { Button as REButton } from '@react-email/components';
import { COLORS, FONTS } from './constants';

interface GoldButtonProps {
  href: string;
  children: React.ReactNode;
  /** Use blue variant instead of gold */
  variant?: 'gold' | 'blue' | 'outline';
}

export function GoldButton({ href, children, variant = 'gold' }: GoldButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    gold: {
      background: `linear-gradient(135deg, ${COLORS.goldDark} 0%, ${COLORS.goldBase} 35%, ${COLORS.goldLight} 60%, ${COLORS.goldBase} 85%, ${COLORS.goldDark} 100%)`,
      color: '#1A1A1A',
      border: 'none',
      boxShadow: '0 4px 16px rgba(156, 115, 22, 0.35), inset 0 1px 0 rgba(230,197,101,0.5)',
    },
    blue: {
      background: `linear-gradient(135deg, ${COLORS.royalDeep} 0%, ${COLORS.royalBlue} 50%, #3366FF 100%)`,
      color: COLORS.white,
      border: 'none',
      boxShadow: '0 4px 16px rgba(0, 56, 223, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
    },
    outline: {
      background: 'transparent',
      color: COLORS.royalBlue,
      border: `2px solid ${COLORS.royalBlue}`,
      boxShadow: 'none',
    },
  };

  return (
    <REButton
      href={href}
      style={{
        ...styles[variant],
        display: 'inline-block',
        padding: '16px 40px',
        borderRadius: '50px',
        fontSize: '16px',
        fontWeight: 700,
        fontFamily: FONTS.display,
        textDecoration: 'none',
        textAlign: 'center' as const,
        letterSpacing: '0.03em',
        lineHeight: '1',
        cursor: 'pointer',
      }}
    >
      {children}
    </REButton>
  );
}
