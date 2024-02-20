const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(Stealth());

const timeout = require("./libs/lib_time").timeout;

const processHitsOnPageContext = require("./libs/hit");
const { showWelcomeScreen, showClosingScreen } = require("./libs/cli_views");
const Climultibar = require("./libs/cli_multibar").getMultibar;

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

const MAX_CONCURRENCY = 1;
const Cluster = [
  {
    url: "https://www.youlikehits.com/youtubenew2.php",
    concurrency: MAX_CONCURRENCY,
    numberOfHits: 10
  }
  /*
  {
    url: "https://www.youlikehits.com/soundcloudplays.php",
    concurrency: 1,
    numberOfHits: 5
  }
  //*/
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
  if (numberOfRuns > 1) {
    await timeout(TEMPORISATION_SECONDES * 1000);
    await youlikehitsAutomation(numberOfRuns - 1);
  }
}

async function concurrentPagesHitProcessing(browser, Cluster) {
  const queue = [];
  const multibar = Climultibar();
  let tab_id = 0;
  for (const context of Cluster) {
    for (let i = 0; i < context.concurrency; i++) {
      tab_id++;
      context.tab_id = tab_id;
      context.display = multibar;
      queue.push(processHitsOnPageContext(browser, context));
    }
  }
  const all = await Promise.all(queue);
  const totalpoints = all.reduce((a, b) => a + b, 0);
  multibar.stop();
  return totalpoints;
}
