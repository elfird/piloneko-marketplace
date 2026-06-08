const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log("Navigating to https://piloneko.com...");
  await page.goto('https://piloneko.com', { waitUntil: 'networkidle0' });
  
  console.log("Done.");
  await browser.close();
})();
