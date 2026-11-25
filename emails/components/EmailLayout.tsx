import {
  Html,
  Head,
  Body,
  Container,
  Font,
  Preview,
} from '@react-email/components';
import { COLORS, FONTS, LAYOUT } from './constants';
import { Header } from './Header';
import { Footer } from './Footer';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  compact?: boolean;
}

export function EmailLayout({
  preview,
  children,
  heroImage,
  heroTitle,
  heroSubtitle,
  compact = false,
}: EmailLayoutProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU79TR_V.woff2',
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>

      <Preview>{preview}</Preview>

      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#E8ECF2',
          fontFamily: FONTS.sans,
          WebkitTextSizeAdjust: '100%',
        }}
      >
        {/* Spacer top */}
        <div style={{ height: '32px' }} />

        <Container
          style={{
            maxWidth: `${LAYOUT.maxWidth}px`,
            margin: '0 auto',
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 20, 80, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Header
            heroImage={heroImage}
            heroTitle={heroTitle}
            heroSubtitle={heroSubtitle}
            compact={compact}
          />

          {children}

          <Footer />
        </Container>

        {/* Spacer bottom */}
        <div style={{ height: '32px' }} />
      </Body>
    </Html>
  );
}
