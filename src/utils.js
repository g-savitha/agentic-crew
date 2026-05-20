const path = require('path');
const targetUtils = require('./targets');
const {
  normalizeCommandTargets,
  resolveSupplementaryPaths,
  serializeTargets,
  IDE_TARGETS,
} = targetUtils;
const resolveTargetCommandDirs = targetUtils.resolveCommandDirs;

/**
 * @param {string} value
 * @returns {string}
 */
function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * @param {import('./agents').AgentDefinition[]} agents
 * @returns {number}
 */
function countAgents(agents) {
  return agents.length;
}

/**
 * @param {import('./agents').AgentDefinition[]} agents
 * @returns {number} Canonical skill files + alias stubs
 */
function countCommandFiles(agents) {
  let count = 0;
  for (const agent of agents) {
    count += 1;
    if (agent.command && agent.command !== agent.file) {
      count += 1;
    }
  }
  return count;
}

/**
 * @param {string | string[]} targets
 * @returns {import('./targets').CommandTarget[]}
 */
function normalizeTargets(targets) {
  return normalizeCommandTargets(targets, { strict: true });
}

/**
 * @param {string | string[]} targets
 * @param {string} outputDir
 * @returns {string[]}
 */
function resolveCommandDirs(targets, outputDir) {
  return resolveTargetCommandDirs(normalizeCommandTargets(targets, { strict: true }), outputDir);
}

/**
 * @param {string | string[] | undefined} domains
 * @returns {string[]}
 */
function normalizeDomains(domains) {
  if (!domains) return [];
  const raw = Array.isArray(domains) ? domains : String(domains).split(',');
  return [...new Set(raw.map((d) => d.trim()).filter(Boolean))].filter((d) => d !== 'none');
}

/**
 * @param {Set<string>} reserved
 * @param {string} file
 * @param {string} [command]
 * @param {string} label
 */
function assertNoCollision(reserved, file, command, label) {
  if (reserved.has(file)) {
    throw new Error(`${label}: command file "${file}" is already reserved.`);
  }
  if (command && reserved.has(command)) {
    throw new Error(`${label}: command alias "/${command}" is already reserved.`);
  }
  reserved.add(file);
  if (command) reserved.add(command);
}

/**
 * Resolve output directory and ensure it stays within cwd (prevents path traversal).
 * @param {string} outputDir
 * @param {string} [cwd]
 * @returns {string}
 */
function resolveSafeOutputDir(outputDir, cwd = process.cwd()) {
  const raw = (outputDir || '.').trim() || '.';
  const base = path.resolve(cwd);

  if (path.isAbsolute(raw)) {
    const resolved = path.resolve(raw);
    const rel = path.relative(base, resolved);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      process.stderr.write(
        `Warning: --output-dir is outside the current working directory (${base}).\n`
      );
    }
    return resolved;
  }

  const resolved = path.resolve(base, raw);
  const rel = path.relative(base, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(
      `Relative --output-dir must stay within the current working directory (${base}). Got: ${outputDir}`
    );
  }
  return resolved;
}

/**
 * Resolve a project directory for doctor/update/uninstall (must exist).
 * @param {string} projectDir
 * @param {string} [cwd]
 * @returns {string}
 */
function resolveSafeProjectDir(projectDir, cwd = process.cwd()) {
  return resolveSafeOutputDir(projectDir || '.', cwd);
}

/**
 * @param {string} filePath
 * @param {string} outputDir
 * @returns {string}
 */
function relativeCommandPath(filePath, outputDir) {
  return path.relative(outputDir, filePath).replace(/\\/g, '/');
}

module.exports = {
  slugify,
  countAgents,
  countCommandFiles,
  resolveCommandDirs,
  normalizeTargets,
  normalizeDomains,
  assertNoCollision,
  resolveSafeOutputDir,
  resolveSafeProjectDir,
  relativeCommandPath,
  resolveSupplementaryPaths,
  serializeTargets,
  IDE_TARGETS,
};
