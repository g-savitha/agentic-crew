const path = require('path');
const fs = require('fs-extra');
const { sanitizeUserText, MAX_PROJECT_NAME, MAX_DESCRIPTION } = require('./sanitize');

const CONFIG_CANDIDATES = [
  '.agentic-crew.yaml',
  '.agentic-crew.yml',
  '.agentic-crew.config.json',
  'agentic-crew.config.yaml',
  'agentic-crew.config.yml',
];

/**
 * Escape a string for use as a double-quoted YAML scalar.
 * @param {string} value
 * @returns {string}
 */
function quoteYamlString(value) {
  const safe = String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
  return `"${safe}"`;
}

/**
 * Parse YAML using a minimal subset parser (no external dependency).
 * Supports flat key: value and simple lists only (no nesting).
 * @param {string} text
 * @returns {Record<string, unknown>}
 */
function parseSimpleYaml(text) {
  const result = {};
  let currentKey = null;
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s+/.test(line) && !/^\s+-\s/.test(line)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        throw new Error(
          `Nested YAML is not supported (line ${i + 1}: "${trimmed.slice(0, 40)}"). Use flat keys and list items only.`
        );
      }
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const listItem = trimmed.match(/^- (.+)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(result[currentKey])) result[currentKey] = [];
      result[currentKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }

    const kv = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;

    currentKey = kv[1];
    const rawValue = kv[2].trim();
    if (!rawValue) {
      result[currentKey] = [];
      continue;
    }
    if (rawValue === 'true') result[currentKey] = true;
    else if (rawValue === 'false') result[currentKey] = false;
    else result[currentKey] = stripQuotes(rawValue);
  }

  return result;
}

/**
 * @param {string} value
 */
function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    const inner = value.slice(1, -1);
    return inner.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return value;
}

/**
 * @param {string} filePath
 * @returns {Promise<Record<string, unknown>>}
 */
async function parseConfigFile(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  if (filePath.endsWith('.json')) {
    return fs.readJson(filePath);
  }
  return parseSimpleYaml(text);
}

/**
 * @param {string} [startDir]
 * @param {string} [explicitPath]
 */
async function findConfigFile(startDir = '.', explicitPath) {
  if (explicitPath) {
    const resolved = path.resolve(startDir, explicitPath);
    if (await fs.pathExists(resolved)) return resolved;
    throw new Error(`Config file not found: ${explicitPath}`);
  }

  const root = path.resolve(startDir);
  for (const name of CONFIG_CANDIDATES) {
    const candidate = path.join(root, name);
    if (await fs.pathExists(candidate)) return candidate;
  }
  return null;
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {object}
 */
function normalizeConfig(raw) {
  const domains = raw.domains ?? raw.domain;
  let domainList = [];
  if (Array.isArray(domains)) domainList = domains.map(String);
  else if (domains != null && domains !== '') domainList = String(domains).split(',').map((d) => d.trim());

  let customRoles = raw.customRoles || raw.custom_roles || [];
  if (typeof customRoles === 'string') customRoles = [customRoles];

  const withSecurityCi = raw.withSecurityCi ?? raw.with_security_ci;
  const withGitignore = raw.withGitignore ?? raw.with_gitignore;

  return {
    name: raw.name != null ? String(raw.name) : undefined,
    description: raw.description != null ? String(raw.description) : undefined,
    repo: raw.repo != null ? String(raw.repo) : undefined,
    frontend: raw.frontend != null ? String(raw.frontend) : undefined,
    backend: raw.backend != null ? String(raw.backend) : undefined,
    domains: domainList,
    domainOther: raw.domainOther ?? raw.domain_other,
    optional: raw.optional,
    preset: raw.preset != null ? String(raw.preset) : undefined,
    theme: raw.theme != null ? String(raw.theme) : undefined,
    target: raw.target != null ? String(raw.target) : undefined,
    outputDir: raw.outputDir ?? raw.output_dir,
    withSecurityCi: withSecurityCi === true || withSecurityCi === 'true',
    withGitignore: withGitignore === true || withGitignore === 'true',
    customRoles,
  };
}

/**
 * @param {{ configPath?: string, startDir?: string }} [options]
 */
async function loadProjectConfig(options = {}) {
  const startDir = options.startDir || '.';
  const configPath = await findConfigFile(startDir, options.configPath);
  if (!configPath) return { config: null, configPath: null };

  const raw = await parseConfigFile(configPath);
  return { config: normalizeConfig(raw), configPath };
}

/**
 * Merge config file values with CLI flags (CLI wins).
 * @param {object | null} config
 * @param {object} opts commander opts
 */
function mergeConfigWithOptions(config, opts) {
  if (!config) return null;

  const merged = {
    name: opts.name || config.name,
    description: opts.description ?? config.description ?? '',
    repo: opts.repo ?? config.repo ?? '',
    frontend: opts.frontend ?? config.frontend ?? 'none',
    backend: opts.backend ?? config.backend ?? 'none',
    domain: opts.domain ?? (config.domains?.length ? config.domains.join(',') : undefined),
    domainOther: opts.domainOther ?? config.domainOther,
    optional: opts.optional ?? config.optional,
    preset: opts.preset ?? config.preset ?? 'full',
    theme: opts.theme ?? config.theme,
    target: opts.target ?? config.target ?? 'both',
    outputDir: opts.outputDir ?? config.outputDir ?? '.',
    withSecurityCi: opts.withSecurityCi ?? config.withSecurityCi ?? false,
    withGitignore: opts.withGitignore ?? config.withGitignore ?? false,
    customRole: [
      ...(Array.isArray(opts.customRole) ? opts.customRole : []),
      ...(Array.isArray(config.customRoles) ? config.customRoles : []),
    ],
  };

  return merged;
}

/**
 * @param {object} answers
 * @returns {string}
 */
function configExampleYaml(answers) {
  const name = sanitizeUserText(answers.projectName || 'my-app', MAX_PROJECT_NAME);
  const description = sanitizeUserText(
    answers.projectDescription || 'One-line description',
    MAX_DESCRIPTION
  );
  const lines = [
    '# agentic-crew project config — used by: agentic-crew init',
    `name: ${quoteYamlString(name)}`,
    `description: ${quoteYamlString(description)}`,
    `frontend: ${answers.frontend || 'none'}`,
    `backend: ${answers.backend || 'none'}`,
    `target: ${answers.targets || 'both'}`,
    `theme: ${answers.theme || 'phoenix'}`,
    `preset: ${answers.preset || 'full'}`,
  ];
  if (answers.domains?.length) {
    lines.push('domains:');
    for (const d of answers.domains) {
      lines.push(`  - ${quoteYamlString(sanitizeUserText(d, 80))}`);
    }
  }
  if (answers.withSecurityCi) lines.push('withSecurityCi: true');
  if (answers.withGitignore) lines.push('withGitignore: true');
  return lines.join('\n') + '\n';
}

module.exports = {
  CONFIG_CANDIDATES,
  loadProjectConfig,
  mergeConfigWithOptions,
  parseConfigFile,
  parseSimpleYaml,
  normalizeConfig,
  configExampleYaml,
  quoteYamlString,
};
