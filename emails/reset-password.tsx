import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
  Img,
  Text,
  Link,
} from '@react-email/components';

/**
 * PLANTILLA: Recuperación de Contraseña — Legado Docente
 * Diseño fiel a la referencia visual aprobada.
 * Compatible con Supabase Auth ({{ .ConfirmationURL }}).
 */

const ASSETS_BASE =
  'https://eklolnecteffjzbjbjmr.supabase.co/storage/v1/object/public/email-assets';

export const RESET_PASSWORD_ASSETS = {
  logo: `${ASSETS_BASE}/legado-logo.png`,
  banner: `${ASSETS_BASE}/legado-banner-recuperacion.png`,
  iconKey: `${ASSETS_BASE}/icon-key-white.png`,
  iconShield: `${ASSETS_BASE}/icon-shield-gold.png`,
  footerArcs: `${ASSETS_BASE}/footer-arcs.png`,
  iconInstagram: `${ASSETS_BASE}/icon-instagram.png`,
  iconYoutube: `${ASSETS_BASE}/icon-youtube.png`,
  iconWeb: `${ASSETS_BASE}/icon-web.png`,
  flagCo: `${ASSETS_BASE}/flag-co.png`,
} as const;

const FONT_STACK =
  "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function ResetPassword() {
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
            .body-pad { padding: 28px 20px 28px 20px !important; }
            .hero-heading { font-size: 24px !important; }
            .cta-btn { padding: 14px 26px !important; font-size: 15px !important; }
            .security-pad { padding: 14px 14px !important; }
            .footer-pad { padding: 26px 20px 24px 20px !important; background-size: 95px auto, 100% 100% !important; }
          }
        `}</style>
      </Head>

      <Preview>Restablece tu contraseña de Legado Docente</Preview>

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
                  boxShadow: '0 14px 40px rgba(0, 34, 153, 0.10), 0 2px 8px rgba(15, 23, 42, 0.04)',
                }}
              >
                {/* ── 1. ENCABEZADO BLANCO ── */}
                <Section
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '20px 24px',
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
                    <tr>
                      <td valign="middle" style={{ paddingRight: '14px' }}>
                        <Img
                          src={RESET_PASSWORD_ASSETS.logo}
                          alt="Legado Docente"
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
                          backgroundColor: '#C99E32',
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
                            color: '#0038DF',
                            letterSpacing: '0.02em',
                            lineHeight: '1.15',
                            textTransform: 'uppercase' as const,
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
                            color: '#002299',
                            lineHeight: '1.3',
                          }}
                        >
                          Aprende, comparte, deja huella.
                        </Text>
                      </td>
                    </tr>
                  </table>
                </Section>

                {/* ── 2. BANNER PRINCIPAL FULL-BLEED ── */}
                <Section style={{ padding: 0, margin: 0, lineHeight: 0 }}>
                  <Img
                    src={RESET_PASSWORD_ASSETS.banner}
                    alt="Seguridad de tu cuenta — Tu futuro sigue intacto. Recupera tu acceso y continúa dejando huella."
                    width="600"
                    style={{
                      width: '100%',
                      maxWidth: '600px',
                      height: 'auto',
                      display: 'block',
                      border: 0,
                      margin: 0,
                      padding: 0,
                    }}
                  />
                </Section>

                {/* ── 3. CUERPO DEL CORREO ── */}
                <Section
                  className="body-pad"
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '36px 36px 36px 36px',
                  }}
                >
                  <Text
                    className="hero-heading"
                    style={{
                      margin: '0 0 14px 0',
                      fontSize: '28px',
                      fontWeight: 800,
                      fontFamily: FONT_STACK,
                      color: '#0F172A',
                      lineHeight: '1.2',
                      letterSpacing: '-0.02em',
                      textAlign: 'left' as const,
                    }}
                  >
                    Restablece tu{' '}
                    <span style={{ color: '#0038DF' }}>contraseña.</span>
                  </Text>

                  <Text
                    style={{
                      margin: '0 0 28px 0',
                      fontSize: '16px',
                      fontWeight: 400,
                      fontFamily: FONT_STACK,
                      color: '#334155',
                      lineHeight: '1.6',
                      textAlign: 'left' as const,
                    }}
                  >
                    Recibimos una solicitud para recuperar el acceso a tu cuenta de{' '}
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>
                      Legado Docente.
                    </strong>{' '}
                    Crea una nueva contraseña y continúa tu camino de aprendizaje.
                  </Text>

                  {/* Botón azul grande centrado */}
                  <table
                    role="presentation"
                    width="100%"
                    cellPadding={0}
                    cellSpacing={0}
                    border={0}
                    style={{ margin: '0 0 28px 0' }}
                  >
                    <tr>
                      <td align="center">
                        <a
                          href="{{ .ConfirmationURL }}"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cta-btn"
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#0038DF',
                            background: 'linear-gradient(180deg, #0044FF 0%, #0029B8 100%)',
                            color: '#FFFFFF',
                            fontFamily: FONT_STACK,
                            fontSize: '16px',
                            fontWeight: 700,
                            lineHeight: '20px',
                            textDecoration: 'none',
                            padding: '14px 34px',
                            borderRadius: '9999px',
                            boxShadow: '0 6px 18px rgba(0, 56, 223, 0.28)',
                          }}
                        >
                          <img
                            src={RESET_PASSWORD_ASSETS.iconKey}
                            alt=""
                            width="20"
                            height="20"
                            style={{
                              display: 'inline-block',
                              verticalAlign: 'middle',
                              width: '20px',
                              height: '20px',
                              marginRight: '10px',
                              border: 0,
                            }}
                          />
                          <span style={{ verticalAlign: 'middle' }}>
                            Crear nueva contraseña
                          </span>
                          <span
                            style={{
                              verticalAlign: 'middle',
                              marginLeft: '10px',
                              fontSize: '18px',
                              fontWeight: 600,
                            }}
                          >
                            →
                          </span>
                        </a>
                      </td>
                    </tr>
                  </table>

                  {/* Recuadro de seguridad */}
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
                    }}
                  >
                    <tr>
                      <td className="security-pad" style={{ padding: '18px 20px' }}>
                        <table
                          role="presentation"
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          border={0}
                        >
                          <tr>
                            <td
                              width="46"
                              valign="middle"
                              align="center"
                              style={{ width: '46px' }}
                            >
                              <table
                                role="presentation"
                                width="46"
                                cellPadding={0}
                                cellSpacing={0}
                                border={0}
                                style={{
                                  width: '46px',
                                  height: '46px',
                                  backgroundColor: '#FAF0D7',
                                  borderRadius: '10px',
                                }}
                              >
                                <tr>
                                  <td align="center" valign="middle" style={{ height: '46px' }}>
                                    <img
                                      src={RESET_PASSWORD_ASSETS.iconShield}
                                      alt="Seguridad"
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
                                </tr>
                              </table>
                            </td>
                            <td width="14" style={{ width: '14px' }}>
                              &nbsp;
                            </td>
                            <td
                              width="1"
                              valign="middle"
                              style={{ width: '1px' }}
                            >
                              <div
                                style={{
                                  width: '1px',
                                  height: '48px',
                                  backgroundColor: '#D4AF37',
                                  fontSize: '1px',
                                  lineHeight: '48px',
                                }}
                              >
                                &nbsp;
                              </div>
                            </td>
                            <td width="16" style={{ width: '16px' }}>
                              &nbsp;
                            </td>
                            <td valign="middle" align="left">
                              <Text
                                style={{
                                  margin: '0 0 4px 0',
                                  fontSize: '15px',
                                  fontWeight: 700,
                                  fontFamily: FONT_STACK,
                                  color: '#0F172A',
                                  lineHeight: '1.3',
                                }}
                              >
                                Tu seguridad es importante.
                              </Text>
                              <Text
                                style={{
                                  margin: 0,
                                  fontSize: '13.5px',
                                  fontWeight: 400,
                                  fontFamily: FONT_STACK,
                                  color: '#475569',
                                  lineHeight: '1.45',
                                }}
                              >
                                Si no solicitaste este cambio, puedes ignorar este correo.
                                Tu contraseña seguirá siendo la misma.
                              </Text>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </Section>

                {/* ── 4. FOOTER AZUL PROFUNDO CON ARCOS DORADOS ── */}
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{ width: '100%' }}
                >
                  <tr>
                    <td
                      align="center"
                      valign="middle"
                      className="footer-pad"
                      style={{
                        backgroundColor: '#002299',
                        backgroundImage: `url('${RESET_PASSWORD_ASSETS.footerArcs}'), linear-gradient(180deg, #002EB8 0%, #001875 100%)`,
                        backgroundPosition: 'left bottom, center center',
                        backgroundRepeat: 'no-repeat, no-repeat',
                        backgroundSize: '135px auto, 100% 100%',
                        padding: '28px 32px 26px 32px',
                        textAlign: 'center',
                      }}
                    >
                      <Text
                        style={{
                          margin: '0 0 4px 0',
                          fontSize: '18px',
                          fontWeight: 700,
                          fontStyle: 'italic',
                          fontFamily: FONT_STACK,
                          color: '#F2D074',
                          lineHeight: '1.3',
                        }}
                      >
                        Aprende, comparte, deja huella.
                      </Text>

                      <Text
                        style={{
                          margin: '0 0 18px 0',
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

                      {/* Línea divisoria fina */}
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{ maxWidth: '340px', margin: '0 auto 18px auto' }}
                      >
                        <tr>
                          <td
                            style={{
                              height: '1px',
                              backgroundColor: 'rgba(255, 255, 255, 0.30)',
                              fontSize: '1px',
                              lineHeight: '1px',
                            }}
                          >
                            &nbsp;
                          </td>
                        </tr>
                      </table>

                      {/* Iconos sociales HTML reales */}
                      <table
                        role="presentation"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        align="center"
                        style={{ margin: '0 auto 16px auto' }}
                      >
                        <tr>
                          <td style={{ padding: '0 12px' }}>
                            <Link
                              href="https://legadodocente.com"
                              target="_blank"
                              style={{ textDecoration: 'none' }}
                            >
                              <Img
                                src={RESET_PASSWORD_ASSETS.iconInstagram}
                                alt="Instagram"
                                width="22"
                                height="22"
                                style={{
                                  display: 'block',
                                  width: '22px',
                                  height: '22px',
                                  border: 0,
                                }}
                              />
                            </Link>
                          </td>
                          <td style={{ padding: '0 12px' }}>
                            <Link
                              href="https://legadodocente.com"
                              target="_blank"
                              style={{ textDecoration: 'none' }}
                            >
                              <Img
                                src={RESET_PASSWORD_ASSETS.iconYoutube}
                                alt="YouTube"
                                width="24"
                                height="22"
                                style={{
                                  display: 'block',
                                  width: '24px',
                                  height: '22px',
                                  border: 0,
                                }}
                              />
                            </Link>
                          </td>
                          <td style={{ padding: '0 12px' }}>
                            <Link
                              href="https://legadodocente.com"
                              target="_blank"
                              style={{ textDecoration: 'none' }}
                            >
                              <Img
                                src={RESET_PASSWORD_ASSETS.iconWeb}
                                alt="Sitio web Legado Docente"
                                width="22"
                                height="22"
                                style={{
                                  display: 'block',
                                  width: '22px',
                                  height: '22px',
                                  border: 0,
                                }}
                              />
                            </Link>
                          </td>
                        </tr>
                      </table>

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
                        © 2026 Legado Docente · Colombia{' '}
                        <img
                          src={RESET_PASSWORD_ASSETS.flagCo}
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
                </table>
              </Container>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
}
