const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:8082...');
  try {
    await page.goto('http://localhost:8082', { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (err) {
    console.error('Navigation error:', err.message);
  }

  console.log('Done.');
  await browser.close();
})();
