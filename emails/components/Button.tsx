import { Img } from '@react-email/components';
import { FONT_STACK, COLORS } from './constants';

interface EmailButtonProps {
  href: string;
  iconSrc?: string;
  children: React.ReactNode;
}

export function EmailButton({ href, iconSrc, children }: EmailButtonProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: '0 0 28px 0' }}
    >
      <tbody>
        <tr>
          <td align="center">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn"
              style={{
                display: 'inline-block',
                minHeight: '48px',
                backgroundColor: COLORS.royalBlue,
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
              {iconSrc && (
                <Img
                  src={iconSrc}
                  alt=""
                  width="18"
                  height="18"
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    width: '18px',
                    height: '18px',
                    marginRight: '10px',
                    border: 0,
                  }}
                />
              )}
              <span style={{ verticalAlign: 'middle' }}>{children}</span>
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
      </tbody>
    </table>
  );
}
