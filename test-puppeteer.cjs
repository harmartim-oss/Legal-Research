const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.url().includes('search')) {
      console.log('REQUEST URL:', request.url());
      console.log('REQUEST METHOD:', request.method());
      console.log('REQUEST HEADERS:', request.headers());
      console.log('REQUEST POST DATA:', request.postData());
    }
  });

  await page.goto('https://qweri.lexum.com/w/onlegis', { waitUntil: 'networkidle2' });
  
  // Wait for the search input to be available
  await page.waitForSelector('#dashboard-search-query-input');
  
  // Type something and press enter
  await page.type('#dashboard-search-query-input', 'tax');
  await page.keyboard.press('Enter');
  
  // Wait for a bit to let the request go through
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
