const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(Stealth());

const TEMPORISATION_SECONDES = 60 * 15; // 15 minutes

if (process.argv.length == 3) {
  let x = Number(process.argv[2]);
  numberOfRuns = Number.isInteger(x) ? x : numberOfRuns;
}

(async () => {
  await youlikehitsAutomation(numberOfRuns);
})().catch((e) => {
  console.log(e.message);
});

async function youlikehitsAutomation(numberOfRuns) {
  if (numberOfRuns <= 0) {
    return;
  }
  const browser = await puppeteer.launch(options);
  const page = await initializePageWithCookies(browser);
  showWelcomeScreen();
  const totalpoints = await processAllHits(page, url);
  showClosingScreen(totalpoints);
  await browser.close();
  timeout(TEMPORISATION_SECONDES * 1000).then(async () => {
    await youlikehitsAutomation(numberOfRuns - 1);
  });
}
