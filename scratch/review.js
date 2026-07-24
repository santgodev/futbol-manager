const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Emulate an iPhone 13 Pro
  await page.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.screenshot({ path: 'scratch/home_mobile.png', fullPage: true });
  console.log('Saved home_mobile.png');

  // Find tournament link
  const tLink = await page.$('a[href^="/t/"]');
  if (tLink) {
    console.log('Found tournament link, clicking...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      tLink.click(),
    ]);
    await page.screenshot({ path: 'scratch/tournament_mobile.png', fullPage: true });
    console.log('Saved tournament_mobile.png');
  } else {
    console.log('No tournament link found on home page.');
  }

  await browser.close();
})();
