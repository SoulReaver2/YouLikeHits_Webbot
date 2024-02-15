const _progress = require("cli-progress");

function getMultibar() {
  return new _progress.MultiBar({
    format: ' {bar} | "{file}" | {value}/{total}',
    hideCursor: true,
    clearOnComplete: false,
    stopOnComplete: true,
    noTTYOutput: true
  });
}

module.exports = {
  getMultibar: getMultibar
};
