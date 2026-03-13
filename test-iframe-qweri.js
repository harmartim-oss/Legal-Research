import https from 'https';

const options = {
  hostname: 'qweri.lexum.com',
  port: 443,
  path: '/w/onlegis/so-2002-c-22-sch-b-en',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('x-frame-options:', res.headers['x-frame-options']);
  console.log('content-security-policy:', res.headers['content-security-policy']);
  res.destroy();
});
req.on('error', (e) => console.error(e));
req.end();
