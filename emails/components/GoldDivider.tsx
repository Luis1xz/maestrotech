import { Img } from '@react-email/components';
import { EMAIL_ASSETS } from './constants';

export function EmailDivider() {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: '4px 0 24px 0' }}
    >
      <tbody>
        <tr>
          <td align="center">
            <Img
              src={EMAIL_ASSETS.decorations.goldDivider}
              alt=""
              width="60"
              height="4"
              style={{
                display: 'block',
                width: '60px',
                height: '4px',
                margin: '0 auto',
                border: 0,
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
