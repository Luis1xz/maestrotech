import { Section, Img, Text } from '@react-email/components';
import { EMAIL_ASSETS, BRAND, COLORS, FONT_STACK } from './constants';

export function EmailHeader() {
  return (
    <Section
      style={{
        backgroundColor: '#FFFFFF',
        padding: '22px 24px',
      }}
    >
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        align="center"
        style={{ margin: '0 auto' }}
      >
        <tbody>
          <tr>
            <td valign="middle" style={{ paddingRight: '14px' }}>
              <Img
                src={EMAIL_ASSETS.branding.logo}
                alt={BRAND.name}
                width="48"
                height="48"
                style={{
                  display: 'block',
                  width: '48px',
                  height: '48px',
                  border: 0,
                }}
              />
            </td>
            <td
              valign="middle"
              style={{
                width: '1px',
                backgroundColor: COLORS.goldBase,
                fontSize: '1px',
                lineHeight: '42px',
              }}
            >
              &nbsp;
            </td>
            <td valign="middle" align="left" style={{ paddingLeft: '14px' }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 800,
                  fontFamily: FONT_STACK,
                  color: COLORS.royalBlue,
                  letterSpacing: '0.02em',
                  lineHeight: '1.15',
                  textTransform: 'uppercase',
                }}
              >
                LEGADO DOCENTE
              </Text>
              <Text
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  fontFamily: FONT_STACK,
                  color: COLORS.royalDeep,
                  lineHeight: '1.3',
                }}
              >
                «{BRAND.slogan}»
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
