const timeOfnow = require("./lib_time").timeOfnow;
const chalk = require("chalk");

const warning = chalk.bgRed;
const log = console.log;

function showWelcomeScreen() {
  log(chalk.magenta("🌊 Puppeteer bot starts working... time: " + timeOfnow()));
  log(chalk.magenta("Connection established! Now processing..."));
  log("Task processed: ");
}

function showClosingScreen(totalpoints) {
  log("Total points: " + warning(totalpoints));
  log(chalk.magenta("Puppeteer bot stops... time: " + timeOfnow()));
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
