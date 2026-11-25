/* ============================================================
   LEGADO DOCENTE — Email Design System Constants
   ============================================================ */

export const BRAND = {
  name: 'Legado Docente',
  slogan: 'Aprende, comparte, deja huella',
  siteUrl: 'https://legadodocente.com',
  supportEmail: 'soporte@legadodocente.com',
  adminEmail: 'luisalfonso1818@gmail.com',
  whatsapp: '573108924512',
  whatsappUrl: 'https://wa.me/573108924512',
  year: new Date().getFullYear(),
} as const;

export const COLORS = {
  royalBlue: '#0038DF',
  royalDeep: '#002299',
  royalDarker: '#001A73',
  goldBase: '#C99E32',
  goldDark: '#9C7316',
  goldLight: '#E6C565',
  goldOchre: '#C1962C',
  goldDeep: '#8F6812',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  softGray: '#F1F5F9',
  borderGray: '#E2E8F0',
  textDark: '#1E293B',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  success: '#10B981',
  successBg: '#ECFDF5',
} as const;

export const FONTS = {
  sans: "'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  display: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;

export const IMAGES = {
  logo: `${BRAND.siteUrl}/legado-logo-full.png`,
  logoIcon: `${BRAND.siteUrl}/logo-icon.png`,
  // Professional education stock photos (Unsplash HTTPS)
  heroEducation: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop&crop=center&q=80',
  heroTeaching: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&h=400&fit=crop&crop=center&q=80',
  heroCelebration: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=400&fit=crop&crop=center&q=80',
  heroBooks: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=400&fit=crop&crop=center&q=80',
  heroGraduation: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=1200&h=400&fit=crop&crop=center&q=80',
  heroCertificate: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=1200&h=400&fit=crop&crop=center&q=80',
  heroNewCourse: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=400&fit=crop&crop=center&q=80',
  heroPassword: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=400&fit=crop&crop=center&q=80',
} as const;

export const LAYOUT = {
  maxWidth: 600,
  padding: 32,
  paddingMobile: 20,
  borderRadius: 16,
  buttonRadius: 50,
} as const;
