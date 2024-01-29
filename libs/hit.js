const timeoutPromise = require("./lib_time").timeoutPromise;
const handlePageBlockade = require("./lib_counter_antiBot");
const chalk = require("chalk");
const ProgressBar = require("progress");

const INVALID_POPUP_DURATION_ms = 10000;
const HOW_LONG_TO_WAIT_FOR_POPUP_ms = 7000;
const CLOCK_TICK_ms = 1000;

const DEFAULT_NUMBER_OF_HITS = 50;
let numberOfHits = DEFAULT_NUMBER_OF_HITS;

const log = console.log;
const error = chalk.red;

async function isHit(page, url) {
  try {
    const hit = await getHitData(page);
    return hit;
  } catch (e) {
    await handlePageBlockade(page, url);
    return false;
  }
}

async function getHitData(page) {
  //extract time
  const timeSeparator = "/";
  const timerCssSelector = "div#listall > center > span > font";
  const timeBlob = await page.$eval(timerCssSelector, (el) => el.textContent);
  const positionOfSeparator = timeBlob.indexOf(timeSeparator);
  const time = timeBlob.substring(positionOfSeparator + 1);

  //extract reward (points)
  const rewardAnchor = "Timer:";
  const gainCssSelector = "div#listall > center";
  const rewardBlob = await page.$eval(gainCssSelector, (el) => el.textContent);
  let posOfrewardSep = rewardBlob.search(rewardAnchor);
  const reward = rewardBlob.substring(posOfrewardSep - 2, posOfrewardSep);

  //extract title
  const titleCssSelector = "div#listall > center > b > font";
  const titleBlob = await page.$eval(titleCssSelector, (el) => el.textContent);
  const title = titleBlob.trim().substring(0, 10);

  return {
    duration: parseInt(time, 10),
    points: parseInt(reward, 10),
    title: title
  };
}

async function launchHit(page) {
  try {
    const [popup] = await Promise.race([
      Promise.all([
        new Promise((resolve) => page.once("popup", resolve)),
        page.click("#listall a.followbutton")
      ]),
      timeoutPromise(HOW_LONG_TO_WAIT_FOR_POPUP_ms)
    ]);
    return popup;
  } catch (err) {
    log(error("View button unresponsive! Reload..."));
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    return false;
  }
}

async function closeHit(page, popup, hit) {
  if (hit.status == "INVALID") {
    log(error("This video has no reward! Next..."));
    await Promise.all([
      page.click("#listall > center:nth-child(1) > a:last-child"),
      page.waitForResponse((response) => response.status() === 200)
    ]);
    return 0;
  } else {
    try {
      await popup.close();
    } catch (e) {
      true;
    }
    showHitInfos(hit);
    return hit.points;
  }
}

function trackHitProgression(hit, popup) {
  return new Promise((resolve) => {
    const bar = new ProgressBar(
      "Processing video " +
        hit.id +
        " | Time remaining: [:bar] :etas | :percent",
      {
        complete: "=",
        incomplete: " ",
        width: 20,
        total: hit.duration
      }
    );
    let hitDuration_ms = hit.duration * 1000;
    let delay = 0;
    let interval = setInterval(() => {
      delay += CLOCK_TICK_ms;
      bar.tick();
      if (popup.isClosed() && delay <= INVALID_POPUP_DURATION_ms) {
        clearInterval(interval);
        resolve("INVALID");
      }
      if (popup.isClosed() && delay >= hitDuration_ms) {
        clearInterval(interval);
        resolve("SUCCESS");
      }
      if (!popup.isClosed() && delay >= hitDuration_ms) {
        clearInterval(interval);
        resolve("END");
      }
    }, CLOCK_TICK_ms);
  });
}

function showHitInfos(hit) {
  log(
    chalk.green("Video Title: ") +
      hit.title +
      chalk.green(" | Wait time: ") +
      hit.duration +
      chalk.green(" seconds | Points gained: ") +
      chalk.bold.yellow(hit.points)
  );
}

async function processAllHits(page, url) {
  let totalpoints = 0;
  let i = 0;
  while (i < numberOfHits) {
    const hit = await isHit(page, url);
    if (hit === false) {
      continue;
    }
    const popup = await launchHit(page);
    if (popup === false) {
      continue;
    }

    hit.id = i + 1;
    hit.status = await trackHitProgression(hit, popup);
    totalpoints += await closeHit(page, popup, hit);
    i++;
  }
  return totalpoints;
}

module.exports = processAllHits;
