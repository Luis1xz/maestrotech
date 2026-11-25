/* ============================================================
   LEGADO DOCENTE — Official Email Design System Constants
   ============================================================ */

export const ASSETS_BASE =
  'https://eklolnecteffjzbjbjmr.supabase.co/storage/v1/object/public/email-assets';

export const EMAIL_ASSETS = {
  branding: {
    logo: `${ASSETS_BASE}/branding/legado-logo.png`,
  },
  banners: {
    confirmEmail: `${ASSETS_BASE}/banners/banner-confirm-email.jpg`,
    welcome: `${ASSETS_BASE}/banners/banner-welcome.jpg`,
    resetPassword: `${ASSETS_BASE}/banners/banner-reset-password.jpg`,
    changeEmail: `${ASSETS_BASE}/banners/banner-change-email.jpg`,
    paymentApproved: `${ASSETS_BASE}/banners/banner-payment-approved.jpg`,
    enrollmentSuccess: `${ASSETS_BASE}/banners/banner-enrollment-success.jpg`,
    certificateAvailable: `${ASSETS_BASE}/banners/banner-certificate-available.jpg`,
    courseCompleted: `${ASSETS_BASE}/banners/banner-course-completed.jpg`,
    newCourseLaunch: `${ASSETS_BASE}/banners/banner-new-course-launch.jpg`,
  },
  icons: {
    flagCo: `${ASSETS_BASE}/icons/flag-co.png`,
    infoShield: `${ASSETS_BASE}/icons/info-shield.png`,
    infoCap: `${ASSETS_BASE}/icons/info-cap.png`,
    infoCard: `${ASSETS_BASE}/icons/info-card.png`,
    infoAward: `${ASSETS_BASE}/icons/info-award.png`,
    pillCheck: `${ASSETS_BASE}/icons/pill-check.png`,
    pillKey: `${ASSETS_BASE}/icons/pill-key.png`,
    pillMail: `${ASSETS_BASE}/icons/pill-mail.png`,
    pillCap: `${ASSETS_BASE}/icons/pill-cap.png`,
    pillCard: `${ASSETS_BASE}/icons/pill-card.png`,
    pillAward: `${ASSETS_BASE}/icons/pill-award.png`,
  },
  decorations: {
    footerArcsLeft: `${ASSETS_BASE}/decorations/footer-arcs-left.png`,
    footerArcsRight: `${ASSETS_BASE}/decorations/footer-arcs-right.png`,
    goldDivider: `${ASSETS_BASE}/decorations/gold-divider.png`,
  },
} as const;

export const BRAND = {
  name: 'Legado Docente',
  slogan: 'Aprende, comparte, deja huella.',
  siteUrl: 'https://legadodocente.com',
  dashboardUrl: 'https://legadodocente.com/?view=dashboard',
  coursesUrl: 'https://legadodocente.com/?view=courses',
  supportUrl: 'https://wa.me/573108924512?text=Hola,%20necesito%20soporte%20en%20Legado%20Docente',
  supportEmail: 'soporte@legadodocente.com',
  year: new Date().getFullYear(),
} as const;

export const COLORS = {
  royalBlue: '#0038DF',
  royalDeep: '#002299',
  royalDark: '#001875',
  goldBase: '#C99E32',
  goldDark: '#9C7316',
  goldLight: '#F2D074',
  textDark: '#0F172A',
  textMuted: '#475569',
  textLight: '#64748B',
  bgCard: '#FFFFFF',
  bgPage: '#EEF3F9',
  bgInfo: '#F4F7FC',
  borderLight: '#E2E8F0',
  borderGold: '#D4AF37',
} as const;

export const FONT_STACK =
  "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
