const fs = require("fs").promises;

const COOKIES_PATH = "./cookies.json";

async function initializePageWithCookies(browser) {
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  const cookies = JSON.parse(await fs.readFile(COOKIES_PATH));
  await page.setCookie(...cookies);

  await page.goto(url);

  // save the new cookies for security and future use
  const savedcookies = await page.cookies();
  await fs.writeFile(COOKIES_PATH, JSON.stringify(savedcookies));
  return page;
}
