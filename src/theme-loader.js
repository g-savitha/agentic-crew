const path = require('path');
const { getThemePack, THEME_PACKS, applyThemePack } = require('./themes');

const EXTERNAL_PREFIXES = ['@agentic-crew/theme-', 'agentic-crew-theme-'];

/**
 * Try to load an external theme pack from node_modules.
 * @param {string} themeId
 * @param {string} [cwd]
 * @returns {object | null}
 */
function loadExternalThemePack(themeId, cwd = process.cwd()) {
  if (THEME_PACKS[themeId]) return null;

  const candidates = EXTERNAL_PREFIXES.map((prefix) => {
    const pkg = prefix.startsWith('@') ? `${prefix}${themeId}` : `${prefix}${themeId}`;
    return pkg;
  });

  for (const pkg of candidates) {
    try {
      const mod = require(require.resolve(pkg, { paths: [cwd, path.join(cwd, 'node_modules')] }));
      if (mod && mod.id) return mod;
    } catch {
      // not installed
    }
  }
  return null;
}

/**
 * Resolve built-in or external theme pack.
 * @param {string} themeId
 * @param {{ cwd?: string }} [options]
 */
function loadThemePack(themeId, options = {}) {
  const id = (themeId || 'phoenix').toLowerCase();
  const external = loadExternalThemePack(id, options.cwd);
  if (external) {
    return {
      source: 'external',
      pack: external,
      apply(agent) {
        if (typeof external.applyAgent === 'function') return external.applyAgent(agent);
        if (typeof external.applyThemePack === 'function') return external.applyThemePack(agent);
        return applyThemePack(agent, 'phoenix');
      },
      getAgentOverride(file) {
        return external.agentOverrides?.[file] || external.agents?.[file] || null;
      },
    };
  }

  if (!THEME_PACKS[id]) {
    throw new Error(
      `Unknown theme "${themeId}". Built-in: ${Object.keys(THEME_PACKS).join(', ')}. ` +
        'Install external packs as @agentic-crew/theme-<name>.'
    );
  }

  return {
    source: 'builtin',
    pack: getThemePack(id),
    apply(agent) {
      return applyThemePack(agent, id);
    },
    getAgentOverride() {
      return null;
    },
  };
}

module.exports = { loadThemePack, loadExternalThemePack, EXTERNAL_PREFIXES };
