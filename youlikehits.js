const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(Stealth());

const timeout = require("./libs/lib_time").timeout;
const processAllHits = require("./libs/hit");
const { showWelcomeScreen, showClosingScreen } = require("./libs/cli_views");

const DEFAULT_NUMBER_OF_RUNS = 8;
let numberOfRuns = DEFAULT_NUMBER_OF_RUNS;
const TEMPORISATION_SECONDES = 60 * 15; // 15 minutes

if (process.argv.length == 3) {
  let x = Number(process.argv[2]);
  numberOfRuns = Number.isInteger(x) ? x : numberOfRuns;
}

const options = {
  headless: false,
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
};
const url = "https://www.youlikehits.com/youtubenew2.php";

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
