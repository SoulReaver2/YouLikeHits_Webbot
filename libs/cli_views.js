const timeOfnow = require("./lib_time").timeOfnow;
const chalk = require("chalk");

const log = console.log;

function showWelcomeScreen() {
  log(chalk.magenta("🌊 Puppeteer bot starts working... time: " + timeOfnow()));
  log(chalk.magenta("Connection established! Now processing..."));
  log("Task processed: ");
}

function showClosingScreen(totalpoints) {
  log("Total points: " + chalk.bgRed(totalpoints));
  log(chalk.magenta("Puppeteer bot stops... time: " + timeOfnow()));
}

// export all functions as properties
module.exports = {
  showWelcomeScreen,
  showClosingScreen
};
