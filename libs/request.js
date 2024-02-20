const fs = require("fs").promises;

const COOKIES_PATH = "./cookies/cookies.json";
const COOKIE_EXPIRATION_TIME_sec = 24 * 3600; // 24 hours in seconds

async function initializePageWithCookies(browser, url) {
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  const cookies = JSON.parse(await fs.readFile(COOKIES_PATH));
  await page.setCookie(...cookies);

  await page.goto(url);

  // save the new cookies for security and future use only if the old cookies expired
  const { mtime } = await fs.stat(COOKIES_PATH);
  const xHoursAgo = new Date(Date.now() - COOKIE_EXPIRATION_TIME_sec * 1000);
  if (mtime < xHoursAgo) {
    const savedcookies = await page.cookies();
    await fs.writeFile(COOKIES_PATH, JSON.stringify(savedcookies));
  }
  return page;
}

module.exports = initializePageWithCookies;
