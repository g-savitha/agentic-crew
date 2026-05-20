const { version: PACKAGE_VERSION } = require('../package.json');
const { THEMES, getThemePack } = require('./themes');
const { IDE_TARGETS } = require('./targets');
const { catalogCommandForThemeId } = require('./theme-loader');

const UTILITY_COMMANDS = ['setup', 'lumos', 'help', 'team'];

/** @param {string} theme */
function catalogCommandForTheme(theme, options = {}) {
  try {
    return catalogCommandForThemeId(theme, options);
  } catch {
    return getThemePack(theme).catalogCommand;
  }
}

/** Known domain keys that map to specialized templates */
const DOMAIN_KEYS = [
  'none',
  'networking',
  'ml',
  'data',
  'mobile',
  'gamedev',
  'embedded',
  'blockchain',
  'other',
];

const MANIFEST_FILENAME = '.agentic-crew.json';

module.exports = {
  PACKAGE_VERSION,
  THEMES,
  IDE_TARGETS,
  UTILITY_COMMANDS,
  DOMAIN_KEYS,
  MANIFEST_FILENAME,
  catalogCommandForTheme,
};
