import https from 'https';

const options = {
  hostname: 'www.canlii.org',
  port: 443,
  path: '/en/ca/scc/doc/2020/2020scc5/2020scc5.html',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('x-frame-options:', res.headers['x-frame-options']);
  console.log('content-security-policy:', res.headers['content-security-policy']);
  res.destroy(); // Don't need the body
});
req.on('error', (e) => console.error(e));
req.end();
