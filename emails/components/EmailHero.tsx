import { Img } from '@react-email/components';

interface EmailHeroProps {
  src: string;
  alt: string;
}

export function EmailHero({ src, alt }: EmailHeroProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ padding: 0, margin: 0, lineHeight: 0 }}
    >
      <tbody>
        <tr>
          <td>
            <Img
              src={src}
              alt={alt}
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
          </td>
        </tr>
      </tbody>
    </table>
  );
}
