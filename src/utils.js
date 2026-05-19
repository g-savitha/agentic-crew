const path = require('path');

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
 * @param {string[]} targets
 * @param {string} outputDir
 * @returns {string[]}
 */
function resolveCommandDirs(targets, outputDir) {
  const normalized = normalizeTargets(targets);
  const relative = [];
  if (normalized.includes('claude')) relative.push('.claude', 'commands');
  if (normalized.includes('cursor')) relative.push('.cursor', 'commands');

  const dirs = [];
  let segment = [];
  for (const part of relative) {
    if (part === 'commands') {
      dirs.push(path.join(outputDir, ...segment, 'commands'));
      segment = [];
    } else {
      segment.push(part);
    }
  }
  return [...new Set(dirs)];
}

/**
 * @param {string | string[]} targets
 * @returns {('claude' | 'cursor')[]}
 */
function normalizeTargets(targets) {
  const raw = Array.isArray(targets) ? targets : String(targets || 'both').split(',');
  const expanded = raw
    .map((t) => t.trim().toLowerCase())
    .flatMap((t) => (t === 'both' ? ['claude', 'cursor'] : [t]));

  const valid = expanded.filter((t) => t === 'claude' || t === 'cursor');
  return valid.length > 0 ? [...new Set(valid)] : ['claude', 'cursor'];
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

module.exports = {
  slugify,
  countAgents,
  countCommandFiles,
  resolveCommandDirs,
  normalizeTargets,
  normalizeDomains,
  assertNoCollision,
};
