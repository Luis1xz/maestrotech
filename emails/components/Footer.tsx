import { Section, Text, Link, Img } from '@react-email/components';
import { EMAIL_ASSETS, BRAND, COLORS, FONT_STACK } from './constants';

export interface EmailFooterProps {
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
    web?: string;
  };
}

export function EmailFooter({ socialLinks }: EmailFooterProps) {
  // Only show social links if explicitly configured (currently none exist)
  const hasSocial =
    socialLinks &&
    Object.values(socialLinks).some((url) => Boolean(url && url.trim()));

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ width: '100%' }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            valign="middle"
            className="footer-pad"
            style={{
              backgroundColor: '#002299',
              backgroundImage: `url('${EMAIL_ASSETS.decorations.footerArcsLeft}'), linear-gradient(180deg, #002EB8 0%, #001875 100%)`,
              backgroundPosition: 'left bottom, center center',
              backgroundRepeat: 'no-repeat, no-repeat',
              backgroundSize: '135px auto, 100% 100%',
              padding: '28px 32px 26px 32px',
              textAlign: 'center',
            }}
          >
            {/* Slogan */}
            <Text
              style={{
                margin: '0 0 4px 0',
                fontSize: '18px',
                fontWeight: 700,
                fontStyle: 'italic',
                fontFamily: FONT_STACK,
                color: COLORS.goldLight,
                lineHeight: '1.3',
              }}
            >
              {BRAND.slogan}
            </Text>

            <Text
              style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                fontWeight: 400,
                fontStyle: 'italic',
                fontFamily: FONT_STACK,
                color: '#FFFFFF',
                lineHeight: '1.4',
              }}
            >
              El equipo de Legado Docente.
            </Text>

            {/* Thin divider line */}
            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              style={{ maxWidth: '340px', margin: '0 auto 16px auto' }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      height: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      fontSize: '1px',
                      lineHeight: '1px',
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Functional institutional links (Inicio | Aula virtual | Soporte) */}
            <Text
              style={{
                margin: '0 0 14px 0',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: FONT_STACK,
                color: '#CBD5E1',
                lineHeight: '1.5',
              }}
            >
              <Link
                href={BRAND.siteUrl}
                target="_blank"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Inicio
              </Link>
              <span style={{ color: COLORS.goldLight, margin: '0 10px' }}>•</span>
              <Link
                href={BRAND.dashboardUrl}
                target="_blank"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Aula virtual
              </Link>
              <span style={{ color: COLORS.goldLight, margin: '0 10px' }}>•</span>
              <Link
                href={BRAND.supportUrl}
                target="_blank"
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Soporte
              </Link>
            </Text>

            {/* Optional Social Icons - hidden by default because Legado Docente has none */}
            {hasSocial && (
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                align="center"
                style={{ margin: '0 auto 14px auto' }}
              >
                <tbody>
                  <tr>
                    {socialLinks?.instagram && (
                      <td style={{ padding: '0 8px' }}>
                        <Link href={socialLinks.instagram} target="_blank">
                          <span style={{ color: '#FFFFFF', fontSize: '12px' }}>Instagram</span>
                        </Link>
                      </td>
                    )}
                    {socialLinks?.youtube && (
                      <td style={{ padding: '0 8px' }}>
                        <Link href={socialLinks.youtube} target="_blank">
                          <span style={{ color: '#FFFFFF', fontSize: '12px' }}>YouTube</span>
                        </Link>
                      </td>
                    )}
                    {socialLinks?.web && (
                      <td style={{ padding: '0 8px' }}>
                        <Link href={socialLinks.web} target="_blank">
                          <span style={{ color: '#FFFFFF', fontSize: '12px' }}>Web</span>
                        </Link>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            )}

            {/* Copyright */}
            <Text
              style={{
                margin: 0,
                fontSize: '12.5px',
                fontWeight: 400,
                fontFamily: FONT_STACK,
                color: '#E2E8F0',
                lineHeight: '1.4',
              }}
            >
              © {BRAND.year} {BRAND.name} · Colombia{' '}
              <Img
                src={EMAIL_ASSETS.icons.flagCo}
                alt="CO"
                width="18"
                height="12"
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '18px',
                  height: '12px',
                  marginLeft: '4px',
                  border: 0,
                }}
              />
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
