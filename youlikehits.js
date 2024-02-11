const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(Stealth());

const timeout = require("./libs/lib_time").timeout;

const processHitsOnPageContext = require("./libs/hit");
const { showWelcomeScreen, showClosingScreen } = require("./libs/cli_views");

const DEFAULT_NUMBER_OF_RUNS = 1;
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
const MAX_CONCURRENCY = 3;
const Cluster = [
  {
    url: "https://www.youlikehits.com/youtubenew2.php",
    concurrency: MAX_CONCURRENCY
  },
  {
    url: "https://www.youlikehits.com/soundcloudplays.php",
    concurrency: 1
  }
];

(async () => {
  await youlikehitsAutomation(numberOfRuns);
})().catch((e) => {
  console.log(e);
});

async function youlikehitsAutomation(numberOfRuns) {
  if (numberOfRuns <= 0) {
    return;
  }
  const browser = await puppeteer.launch(options);
  showWelcomeScreen();
  const totalpoints = await concurrentPagesHitProcessing(browser, Cluster);
  showClosingScreen(totalpoints);
  await browser.close();
  timeout(TEMPORISATION_SECONDES * 1000).then(async () => {
    await youlikehitsAutomation(numberOfRuns - 1);
  });
}

async function concurrentPagesHitProcessing(browser, Cluster) {
  const queue = [];
  for (const { url, concurrency } of Cluster) {
    for (let i = 0; i < concurrency; i++) {
      queue.push(processHitsOnPageContext(browser, url));
    }
  }
  const all = await Promise.all(queue);
  const totalpoints = all.reduce((a, b) => a + b, 0);
  return totalpoints;
}
