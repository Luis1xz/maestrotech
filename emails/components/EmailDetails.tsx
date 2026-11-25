import { Text } from '@react-email/components';
import { FONT_STACK, COLORS } from './constants';

export interface DetailItem {
  label: string;
  value: string;
}

interface EmailDetailsProps {
  items: DetailItem[];
  title?: string;
}

export function EmailDetails({ items, title }: EmailDetailsProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        backgroundColor: '#FFFFFF',
        border: `1.5px solid ${COLORS.borderLight}`,
        borderRadius: '12px',
        margin: '0 0 24px 0',
        overflow: 'hidden',
      }}
    >
      <tbody>
        {title && (
          <tr>
            <td
              colSpan={2}
              style={{
                backgroundColor: '#F8FAFC',
                padding: '12px 20px',
                borderBottom: `1px solid ${COLORS.borderLight}`,
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: FONT_STACK,
                  color: COLORS.royalBlue,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {title}
              </Text>
            </td>
          </tr>
        )}
        {items.map((it, idx) => (
          <tr
            key={idx}
            style={{
              borderBottom: idx < items.length - 1 ? `1px solid #F1F5F9` : 'none',
            }}
          >
            <td
              valign="middle"
              style={{
                padding: '12px 20px',
                width: '40%',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: FONT_STACK,
                color: COLORS.textLight,
              }}
            >
              {it.label}
            </td>
            <td
              valign="middle"
              align="right"
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: FONT_STACK,
                color: COLORS.textDark,
              }}
            >
              {it.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
