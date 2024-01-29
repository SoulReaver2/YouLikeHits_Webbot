const timeout = require("./lib_time").timeout;
const chalk = require("chalk");
const warning = chalk.bgRed;
const log = console.log;

async function getReloadDelay(page) {
  const leftAnchor = "but you must wait ";
  const rightAnchor = " minutes until you can do Views";
  const DelayCssSelector = "div#listall > center";
  const delayBlob = await page.$eval(DelayCssSelector, (el) => el.textContent);
  let matcher = new RegExp(leftAnchor + "([0-9]+)" + rightAnchor, "g");
  let found = matcher.exec(delayBlob);
  const delay = found[1] * 60;
  return delay;
}

async function handlePageBlockade(page, departUrl) {
  try {
    const reloadDelay = await getReloadDelay(page);
    log(
      warning(
        "15 minutes limit is reached. We must wait " +
          reloadDelay / 60 +
          " minutes ..."
      )
    );
    const inter = reloadDelay * 1 + 60;
    await timeout(inter * 1000);
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  } catch (e) {
    await page.goto(departUrl);
  }
}

module.exports = handlePageBlockade;
