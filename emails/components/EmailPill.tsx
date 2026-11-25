import { Img, Text } from '@react-email/components';
import { FONT_STACK, COLORS } from './constants';

interface EmailPillProps {
  iconSrc?: string;
  label: string;
}

export function EmailPill({ iconSrc, label }: EmailPillProps) {
  return (
    <div style={{ margin: '0 0 20px 0' }}>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        style={{
          display: 'inline-block',
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #F5D380',
          borderRadius: '9999px',
          padding: '6px 16px',
        }}
      >
        <tbody>
          <tr>
            {iconSrc && (
              <td valign="middle" style={{ paddingRight: '8px' }}>
                <Img
                  src={iconSrc}
                  alt=""
                  width="18"
                  height="18"
                  style={{
                    display: 'block',
                    width: '18px',
                    height: '18px',
                    border: 0,
                  }}
                />
              </td>
            )}
            <td valign="middle">
              <Text
                style={{
                  margin: 0,
                  fontSize: '11.5px',
                  fontWeight: 800,
                  fontFamily: FONT_STACK,
                  color: '#92600E',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                }}
              >
                {label}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
