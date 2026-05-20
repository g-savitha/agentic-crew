const { THEMES, IDE_TARGETS } = require('./constants');
const { normalizeDomains, normalizeTargets, slugify } = require('./utils');
const { normalizeOptionalRoles } = require('./agents');
const { FRONTEND_STACKS, BACKEND_STACKS, DOMAINS } = require('./stacks');
const { resolvePreset } = require('./presets');

/**
 * Parse --custom-role "Name|Description" (repeatable).
 * @param {string | string[]} raw
 * @returns {object[]}
 */
function parseCustomRoles(raw) {
  if (!raw || (Array.isArray(raw) && raw.length === 0)) return [];
  const entries = Array.isArray(raw) ? raw : [raw];
  return entries.map((entry, index) => {
    const parts = String(entry).split('|');
    const name = (parts[0] || '').trim();
    const description = parts.slice(1).join('|').trim();
    if (!name) {
      throw new Error(`--custom-role[${index}] requires a name before | (e.g. "Data Engineer|ETL pipelines")`);
    }
    if (!description) {
      throw new Error(`--custom-role "${name}" requires a description after |`);
    }
    const file = slugify(name);
    if (!file) {
      throw new Error(`--custom-role "${name}" could not be slugified to a command file name`);
    }
    return {
      name,
      description,
      file,
      character: name,
      trait: 'Custom',
      command: slugify(name.split(/\s+/)[0]),
    };
  });
}

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

  const customRoles = parseCustomRoles(opts.customRole);
  const presetDef = resolvePreset(opts.preset || 'full');
  const theme = (opts.theme || presetDef.theme || 'phoenix').toLowerCase();
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
    optionalRoles: normalizeOptionalRoles(opts.optional || []),
    outputDir: (opts.outputDir || '.').trim() || '.',
    theme,
    targets: targetKey,
    withSecurityCi: Boolean(opts.withSecurityCi),
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
