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

function main(url) {
  if (!url) {
    commander.outputHelp();
    process.exit(1);
  } else {
    const preventSleep = !!commander.preventSleep;
    const randomUrl = !!commander.randomUrl;
    const timeout = parse(commander.timeout);
    assertTimeout(timeout);

    const zoom = +commander.zoom;
    assertZoom(zoom);

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
    .option('-z, --zoom <level>', 'Changes the zoom level to the specified level.', MINIMUM_ZOOM)
    .option(
      '-t, --timeout <timeout>',
      `Rotation timeout with human readable duration. Minimum: ${MINIMUM_TIMEOUT_IN_SECONDS}s.`,
      `${MINIMUM_TIMEOUT_IN_SECONDS}s`,
    )
    .parse(process.argv);

    main(commander.args);
};
