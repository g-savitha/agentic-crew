const { THEMES, IDE_TARGETS } = require('./constants');
const { normalizeDomains, normalizeTargets } = require('./utils');
const { normalizeOptionalRoles } = require('./agents');
const { FRONTEND_STACKS, BACKEND_STACKS, DOMAINS } = require('./stacks');

/**
 * @param {import('commander').Command} cmd
 * @returns {object | null} answers if non-interactive flags provided
 */
function answersFromOptions(cmd) {
  const opts = cmd.opts();
  if (!opts.name && !opts.yes) return null;

  if (!opts.name) {
    throw new Error('--name is required for non-interactive mode (or omit --yes to use the questionnaire).');
  }

  const theme = (opts.theme || 'phoenix').toLowerCase();
  if (!THEMES.includes(theme)) {
    throw new Error(`Invalid --theme "${opts.theme}". Use: ${THEMES.join(', ')}`);
  }

  const targets = normalizeTargets(opts.target || 'both');
  const targetKey = opts.target === 'both' ? 'both' : targets.join(',');
  if (opts.target && !IDE_TARGETS.includes(opts.target) && opts.target !== 'both') {
    throw new Error(`Invalid --target "${opts.target}". Use: ${IDE_TARGETS.join(', ')}`);
  }

  const domains = normalizeDomains(opts.domain || []);
  if (opts.domainOther) {
    domains.push(opts.domainOther);
  }

  return {
    projectName: opts.name.trim(),
    projectDescription: (opts.description || '').trim(),
    githubRepo: (opts.repo || '').trim(),
    frontend: opts.frontend || 'none',
    backend: opts.backend || 'none',
    domains,
    domain: domains[0] || 'none',
    customRoles: [],
    optionalRoles: normalizeOptionalRoles(opts.optional || []),
    outputDir: (opts.outputDir || '.').trim() || '.',
    theme,
    targets: targetKey,
  };
}

function listStackValues(stacks) {
  return stacks.map((s) => s.value).join(', ');
}

module.exports = { answersFromOptions, listStackValues, FRONTEND_STACKS, BACKEND_STACKS, DOMAINS };
