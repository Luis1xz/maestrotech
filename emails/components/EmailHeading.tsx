import { Text } from '@react-email/components';
import { FONT_STACK, COLORS } from './constants';

interface EmailHeadingProps {
  normalText: string;
  highlightText: string;
}

export function EmailHeading({ normalText, highlightText }: EmailHeadingProps) {
  return (
    <Text
      className="hero-heading"
      style={{
        margin: '0 0 14px 0',
        fontSize: '28px',
        fontWeight: 800,
        fontFamily: FONT_STACK,
        color: COLORS.textDark,
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
        textAlign: 'left',
      }}
    >
      {normalText}{' '}
      <span style={{ color: COLORS.royalBlue }}>{highlightText}</span>
    </Text>
  );
}
