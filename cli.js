const commander = require('commander');
const pkginfo = require('pkginfo');
const parse = require('parse-duration');
const createDebug = require('debug');

const window = require('./window');

const DEBUG = createDebug('tournicoti:cli');
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

function main(url) {
  const verbose = !!commander.verbose;
  if (verbose) {
    createDebug.enable('tournicoti:*');
  }

  DEBUG('URL addresses: %o', url);

  if (!url || !url.length) {
    commander.outputHelp();
    process.exit(1);
  } else {
    const preventSleep = !!commander.preventSleep;
    DEBUG('Prevent display: %o', preventSleep);

    const randomUrl = !!commander.randomUrl;
    DEBUG('Randomize URL addresses: %o', randomUrl);

    const timeout = parse(commander.timeout);
    assertTimeout(timeout);
    DEBUG('Rotation timeout: %o', timeout);

    const zoom = +commander.zoom;
    assertZoom(zoom);
    DEBUG('Zoom level: %o', zoom);

    window.start({
      preventSleep,
      randomUrl,
      timeout,
      url,
      zoom,
    });
  }
}

module.exports.initialize = () => {
  commander
    .version(module.exports.version)
    .arguments('[options] [otherUrl...]')
    .option('--prevent-sleep', 'Prevent the display from going to sleep.')
    .option('-r, --random-url', 'Randomly select the first URL to display.')
    .option('-v, --verbose', 'Enable verbose mode.')
    .option('-z, --zoom <level>', 'Changes the zoom level to the specified level.', MINIMUM_ZOOM)
    .option(
      '-t, --timeout <timeout>',
      `Rotation timeout with human readable duration. Minimum: ${MINIMUM_TIMEOUT_IN_SECONDS}s.`,
      `${MINIMUM_TIMEOUT_IN_SECONDS}s`,
    )
    .parse(process.argv);

  main(commander.args);
};
