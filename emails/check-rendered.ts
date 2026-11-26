import { render } from '@react-email/render';
import React from 'react';
import Welcome from './welcome';

async function main() {
  const html = await render(React.createElement(Welcome), { pretty: false });
  console.log('Has comment marker dollar:', html.includes('<!--$'));
  console.log('Has comment body:', html.includes('<!--body-->'));
  console.log('Has skip-in-text:', html.includes('skip-in-text'));
}
main();

