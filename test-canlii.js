import https from 'https';

const options = {
  hostname: 'www.canlii.org',
  port: 443,
  path: '/en/search/ajaxSearch.do?text=Falun+Gong',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(res.statusCode, data.substring(0, 500)));
});
req.on('error', (e) => console.error(e));
req.end();
