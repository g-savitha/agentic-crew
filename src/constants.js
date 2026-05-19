const PACKAGE_VERSION = '0.2.0';

const THEMES = ['phoenix', 'professional'];

const IDE_TARGETS = ['claude', 'cursor', 'both'];

const UTILITY_COMMANDS = ['setup', 'lumos', 'help'];

/** @param {'phoenix' | 'professional'} theme */
function catalogCommandForTheme(theme) {
  return theme === 'professional' ? 'help' : 'lumos';
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
