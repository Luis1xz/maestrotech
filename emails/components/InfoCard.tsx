import { Section, Text } from '@react-email/components';
import { COLORS, FONTS } from './constants';

interface InfoCardProps {
  /** Array of label/value pairs */
  items: { label: string; value: string }[];
  /** Optional title */
  title?: string;
}

export function InfoCard({ items, title }: InfoCardProps) {
  return (
    <Section
      style={{
        background: COLORS.offWhite,
        borderRadius: '14px',
        border: `1px solid ${COLORS.borderGray}`,
        padding: '24px 28px',
        margin: '24px 0',
      }}
    >
      {title && (
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
          {title}
        </Text>
      )}
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: i < items.length - 1 ? '12px' : '0' }}>
          <Text
            style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: FONTS.sans,
              color: COLORS.textMuted,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em',
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              margin: '2px 0 0 0',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: FONTS.display,
              color: COLORS.textDark,
            }}
          >
            {item.value}
          </Text>
        </div>
      ))}
    </Section>
  );
}
