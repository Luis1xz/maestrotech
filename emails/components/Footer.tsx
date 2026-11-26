import { Img, Link } from '@react-email/components';
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
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ width: '100%', margin: 0, padding: 0 }}
    >
      <tbody>
        {/* 1. Official 4K Footer graphic */}
        <tr>
          <td style={{ margin: 0, padding: 0, lineHeight: 0, backgroundColor: '#001A94' }}>
            <Img
              src={EMAIL_ASSETS.banners.footer}
              alt="Legado Docente - Aprende, comparte, deja huella."
              width="600"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                border: 0,
                margin: 0,
                padding: 0,
              }}
            />
          </td>
        </tr>
        {/* 2. Functional navigation links */}
        <tr>
          <td
            align="center"
            valign="middle"
            style={{
              backgroundColor: '#00145A',
              padding: '12px 24px 16px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.4',
                fontWeight: 500,
                fontFamily: FONT_STACK,
                color: '#CBD5E1',
              }}
            >
              <Link
                href={BRAND.siteUrl}
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
                target="_blank"
              >
                Inicio
              </Link>
              <span style={{ color: COLORS.goldLight, margin: '0 10px' }}>•</span>
              <Link
                href={BRAND.dashboardUrl}
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
                target="_blank"
              >
                Aula virtual
              </Link>
              <span style={{ color: COLORS.goldLight, margin: '0 10px' }}>•</span>
              <Link
                href={BRAND.supportUrl}
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
                target="_blank"
              >
                Soporte
              </Link>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
