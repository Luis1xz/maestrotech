import { Img, Text } from '@react-email/components';
import { FONT_STACK, COLORS } from './constants';

interface EmailInfoCardProps {
  iconSrc?: string;
  title: string;
  description: string;
}

export function EmailInfoCard({ iconSrc, title, description }: EmailInfoCardProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        backgroundColor: '#F4F7FC',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        width: '100%',
        margin: '0 0 8px 0',
      }}
    >
      <tbody>
        <tr>
          <td className="security-pad" style={{ padding: '18px 20px' }}>
            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              border={0}
            >
              <tbody>
                <tr>
                  {iconSrc && (
                    <>
                      <td
                        width="36"
                        valign="top"
                        align="center"
                        style={{ width: '36px', paddingTop: '2px' }}
                      >
                        <Img
                          src={iconSrc}
                          alt=""
                          width="24"
                          height="24"
                          style={{
                            display: 'block',
                            width: '24px',
                            height: '24px',
                            margin: '0 auto',
                            border: 0,
                          }}
                        />
                      </td>
                      <td width="14" style={{ width: '14px' }}>
                        &nbsp;
                      </td>
                    </>
                  )}
                  <td valign="middle" align="left">
                    <Text
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '15px',
                        fontWeight: 700,
                        fontFamily: FONT_STACK,
                        color: COLORS.textDark,
                        lineHeight: '1.3',
                      }}
                    >
                      {title}
                    </Text>
                    <Text
                      style={{
                        margin: 0,
                        fontSize: '13.5px',
                        fontWeight: 400,
                        fontFamily: FONT_STACK,
                        color: COLORS.textMuted,
                        lineHeight: '1.45',
                      }}
                    >
                      {description}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
