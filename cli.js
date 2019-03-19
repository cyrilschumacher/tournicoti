const commander = require('commander');
const pkginfo = require('pkginfo');
const parse = require('parse-duration');

const window = require('./window');

const MINIMUM_TIMEOUT_IN_SECONDS = 30;
const MINIMUM_ZOOM = 1;

pkginfo(module, 'version');

function assertTimeout(timeout) {
  if (timeout < MINIMUM_TIMEOUT_IN_SECONDS * 1000) {
    process.stderr.write(`Invalid timeout: value must be greater than: ${MINIMUM_TIMEOUT_IN_SECONDS} seconds.`);
    process.exit(1);
  }
}

function assertZoom(zoom) {
  if (zoom < MINIMUM_ZOOM) {
    process.stderr.write(`Invalid zoom: value must be greater than: ${MINIMUM_ZOOM}.`);
    process.exit(1);
  }
}

function main() {
  if (commander.args.length === 0) {
    commander.outputHelp();
    process.exit(1);
  } else {
    const url = commander.args.splice(0, commander.args.length - 1);
    const randomUrl = !!commander.randomUrl;
    const timeout = parse(commander.timeout);
    assertTimeout(timeout);

    const zoom = +commander.zoom;
    assertZoom(zoom);

    window.start({
      randomUrl,
      timeout,
      url,
      zoom,
    });
  }
}

module.exports.initialize = () => {
  commander
    .usage('[options] <url ...>')
    .version(module.exports.version)
    .option('-r --random-url', 'Randomly select the first URL to display.')
    .option(
      '-t --timeout <timeout>',
      `Rotation timeout with human readable duration. Minimum: ${MINIMUM_TIMEOUT_IN_SECONDS}s.`,
      `${MINIMUM_TIMEOUT_IN_SECONDS}s`,
    )
    .option('-z --zoom <level>', 'Changes the zoom level to the specified level.', MINIMUM_ZOOM)
    .action(main)
    .parse(process.argv);
};
