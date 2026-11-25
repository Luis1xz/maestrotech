import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
} from '@react-email/components';
import { FONT_STACK } from './constants';
import { EmailHeader } from './Header';
import { EmailFooter, EmailFooterProps } from './Footer';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  footerProps?: EmailFooterProps;
}

export function EmailLayout({ preview, children, footerProps }: EmailLayoutProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:ital,wght@0,700;0,800;1,500;1,700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @media only screen and (max-width: 480px) {
            .email-outer { padding: 12px 8px !important; }
            .email-card { border-radius: 12px !important; }
            .body-pad { padding: 26px 18px 26px 18px !important; }
            .hero-heading { font-size: 24px !important; }
            .cta-btn { padding: 14px 24px !important; font-size: 15px !important; }
            .security-pad { padding: 14px 14px !important; }
            .footer-pad { padding: 26px 18px 24px 18px !important; background-size: 95px auto, 100% 100% !important; }
          }
        `}</style>
      </Head>

      <Preview>{preview}</Preview>

      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#EEF3F9',
          fontFamily: FONT_STACK,
          WebkitTextSizeAdjust: '100%',
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          className="email-outer"
          style={{
            backgroundColor: '#EEF3F9',
            padding: '28px 12px',
            width: '100%',
          }}
        >
          <tbody>
            <tr>
              <td align="center" valign="top">
                <Container
                  className="email-card"
                  style={{
                    maxWidth: '600px',
                    width: '100%',
                    margin: '0 auto',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow:
                      '0 14px 40px rgba(0, 34, 153, 0.10), 0 2px 8px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  {/* 1. Header institucional */}
                  <EmailHeader />

                  {/* 2. Contenido del correo (Hero + Body) */}
                  {children}

                  {/* 3. Footer oficial */}
                  <EmailFooter {...footerProps} />
                </Container>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  );
}
