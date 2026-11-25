import { Section } from '@react-email/components';
import { COLORS } from './constants';

interface GoldDividerProps {
  margin?: string;
}

export function GoldDivider({ margin = '28px auto' }: GoldDividerProps) {
  return (
    <Section style={{ padding: '0' }}>
      <div
        style={{
          margin,
          width: '80px',
          height: '3px',
          background: `linear-gradient(90deg, ${COLORS.goldDark}, ${COLORS.goldBase}, ${COLORS.goldLight}, ${COLORS.goldBase}, ${COLORS.goldDark})`,
          borderRadius: '2px',
        }}
      />
    </Section>
  );
}
