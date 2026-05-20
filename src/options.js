const { THEMES, IDE_TARGETS } = require('./constants');
const { normalizeDomains, IDE_TARGETS: TARGET_KEYS } = require('./utils');
const { normalizeOptionalRoles, validateOptionalRoles } = require('./agents');
const { FRONTEND_STACKS, BACKEND_STACKS, DOMAINS } = require('./stacks');
const { resolvePreset } = require('./presets');
const { parseCustomRoles } = require('./options-parsers');
const { loadThemePack } = require('./theme-loader');

/**
 * Build init answers from merged CLI + config options.
 * @param {object} opts
 * @returns {object | null}
 */
function answersFromOptions(opts) {
  if (!opts.yes) return null;

  if (!opts.name) {
    throw new Error('--name is required with --yes for non-interactive mode (or omit --yes to use the questionnaire).');
  }

  const customRoles = parseCustomRoles(opts.customRole);
  const presetDef = resolvePreset(opts.preset || 'startup');
  const theme = (presetDef.theme || opts.theme || 'phoenix').toLowerCase();
  try {
    loadThemePack(theme, { cwd: (opts.outputDir || '.').trim() || '.' });
  } catch (err) {
    throw new Error(
      err.message ||
        `Invalid --theme "${opts.theme}". Use built-in themes or install @agentic-crew/theme-<name>.`
    );
  }

  const targetRaw = opts.target || 'both';
  if (targetRaw && !IDE_TARGETS.includes(String(targetRaw).toLowerCase())) {
    throw new Error(`Invalid --target "${opts.target}". Use: ${TARGET_KEYS.join(', ')}`);
  }

  const domains = normalizeDomains(opts.domain || []);
  if (opts.domainOther) {
    domains.push(opts.domainOther);
  }

  if (theme === 'professional') {
    for (const role of customRoles) {
      role.command = undefined;
      role.character = role.name;
    }
  }

  return {
    projectName: opts.name.trim(),
    projectDescription: (opts.description || '').trim(),
    githubRepo: (opts.repo || '').trim(),
    frontend: opts.frontend || 'none',
    backend: opts.backend || 'none',
    domains,
    domain: domains[0] || 'none',
    customRoles,
    optionalRoles: validateOptionalRoles(opts.optional || []),
    outputDir: (opts.outputDir || '.').trim() || '.',
    theme,
    targets: targetRaw,
    withSecurityCi: Boolean(opts.withSecurityCi),
    withGitignore: Boolean(opts.withGitignore),
    preset: presetDef.key,
    presetExcludeFiles: presetDef.excludeFiles,
  };
}

function listStackValues(stacks) {
  return stacks.map((s) => s.value).join(', ');
}

module.exports = {
  answersFromOptions,
  parseCustomRoles,
  listStackValues,
  FRONTEND_STACKS,
  BACKEND_STACKS,
  DOMAINS,
};
